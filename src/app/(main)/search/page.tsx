import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/config/categories";
import { getUserRegionCode } from "@/lib/location/cookies";
import { getRegionByCode, getRegionAncestors } from "@/lib/location/regions";
import { keywordIntent } from "@/lib/search/keywordIntent";
import type { Resource } from "@/types/domain";

export const metadata = { title: "搜尋資源" };

type SearchRow = Resource & {
  subcategory: { slug: string; name: string; categories: { slug: string } } | null;
  region?: { name: string; code: string } | null;
};

type IntentData = {
  source: "llm" | "keyword";
  categories: string[];
  subcategories: string[];
  keywords: string[];
  reasoning: string;
};

async function getIntent(query: string): Promise<IntentData> {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "localhost:3000";
    const res = await fetch(`${proto}://${host}/api/search/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });
    if (!res.ok) {
      return { source: "keyword", ...keywordIntent(query) };
    }
    return await res.json();
  } catch {
    return { source: "keyword", ...keywordIntent(query) };
  }
}

function getCatSlug(row: SearchRow): string {
  const sub = Array.isArray(row.subcategory) ? row.subcategory[0] : row.subcategory;
  return (sub?.categories as { slug: string } | undefined)?.slug ?? "";
}

async function searchResources(
  q: string,
  keywords: string[],
  regionIds: string[],
): Promise<SearchRow[]> {
  if (!q.trim() && keywords.length === 0) return [];
  const supabase = await createClient();

  const terms = Array.from(new Set([q, ...keywords].filter((s) => s && s.trim())));
  const orFilter = terms
    .flatMap((t) => [
      `name.ilike.%${t}%`,
      `summary.ilike.%${t}%`,
      `description.ilike.%${t}%`,
      `tags.cs.{${t}}`,
    ])
    .join(",");

  const { data } = await supabase
    .from("resources")
    .select(
      "*, subcategory:subcategories(slug, name, categories(slug)), region:regions(name, code)",
    )
    .eq("status", "active")
    .or(orFilter)
    .limit(100);

  const rows = (data ?? []) as SearchRow[];
  // Local-first sort: in-region first, then national, then others; tie-break by like_count
  const inRegion = (r: SearchRow) => r.region_id != null && regionIds.includes(r.region_id);
  return rows.sort((a, b) => {
    const aLocal = inRegion(a) ? 2 : a.scope === "national" ? 1 : 0;
    const bLocal = inRegion(b) ? 2 : b.scope === "national" ? 1 : 0;
    if (aLocal !== bLocal) return bLocal - aLocal;
    return (b.like_count ?? 0) - (a.like_count ?? 0);
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; mode?: string }>;
}) {
  const { q = "", cat = "", mode = "" } = await searchParams;

  const code = await getUserRegionCode();
  const region = code ? await getRegionByCode(code) : null;
  const ancestors = region ? await getRegionAncestors(region.id) : [];
  const regionIds = ancestors.map((r) => r.id);

  const intent = q.trim() ? await getIntent(q) : null;
  const keywordsForSearch = intent?.keywords ?? [];

  const allResults = await searchResources(q, keywordsForSearch, regionIds);

  const catCounts = new Map<string, number>();
  for (const r of allResults) {
    const slug = getCatSlug(r);
    if (slug) catCounts.set(slug, (catCounts.get(slug) ?? 0) + 1);
  }

  const intentCatSet = new Set(intent?.categories ?? []);
  const availableCats = categories.filter((c) => catCounts.has(c.slug));
  const showChips = q.trim() && availableCats.length > 1;

  let results = cat ? allResults.filter((r) => getCatSlug(r) === cat) : allResults;
  if (mode === "intent" && !cat && intentCatSet.size > 0) {
    results = [...results].sort((a, b) => {
      const aHit = intentCatSet.has(getCatSlug(a)) ? 1 : 0;
      const bHit = intentCatSet.has(getCatSlug(b)) ? 1 : 0;
      return bHit - aHit;
    });
  }

  const selectedCat = availableCats.find((c) => c.slug === cat);

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-lg font-medium" style={{ color: "var(--cta)" }}>
          ← 回首頁
        </Link>

        <h1 className="mt-5 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          搜尋資源
        </h1>

        {region && (
          <p className="mt-2 text-base" style={{ color: "var(--text-muted)" }}>
            📍 在地優先：{region.name}（同時顯示全國資源）
          </p>
        )}

        {/* 搜尋框 */}
        <form method="GET" action="/search" className="mt-5">
          <div className="flex gap-3">
            <input
              name="q"
              type="search"
              defaultValue={q}
              autoFocus
              placeholder="腳痛怎麼辦、附近有共餐嗎、防詐騙…"
              className="flex-1 rounded-2xl border px-6 py-5 text-xl outline-none transition focus:ring-2"
              style={{ borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            />
            <button
              type="submit"
              className="rounded-2xl px-7 py-5 text-xl font-bold"
              style={{ background: "var(--cta)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
            >
              搜尋
            </button>
          </div>
          <input type="hidden" name="mode" value={mode || "intent"} />
        </form>

        {/* 意圖分析卡片 */}
        {q && intent && (intent.categories.length > 0 || intent.reasoning) && (
          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              background: intent.source === "llm" ? "#F5F3FF" : "#FEF3C7",
              border: `2px solid ${intent.source === "llm" ? "#C4B5FD" : "#FDE68A"}`,
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-sm font-bold"
                style={{
                  background: intent.source === "llm" ? "#7C3AED" : "#92400E",
                  color: "#FFFFFF",
                }}
              >
                {intent.source === "llm" ? "✨ AI 智慧理解" : "🔎 關鍵字匹配"}
              </span>
              {intent.reasoning && (
                <span className="text-base" style={{ color: "var(--text-secondary)" }}>
                  {intent.reasoning}
                </span>
              )}
            </div>
            {intent.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {intent.categories.map((slug) => {
                  const c = categories.find((x) => x.slug === slug);
                  if (!c) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/resources/${slug}`}
                      className="rounded-full px-4 py-2 text-base font-semibold"
                      style={{ background: c.color, color: "#FFFFFF" }}
                    >
                      → {c.name}（瀏覽該分類）
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 結果 */}
        {q && (
          <div className="mt-6">
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              {results.length > 0 ? (
                <>
                  找到 <strong>{results.length}</strong> 筆
                  {selectedCat ? (
                    <>
                      「<span style={{ color: selectedCat.color }}>{selectedCat.name}</span>」類
                    </>
                  ) : null}
                  關於「{q}」的資源
                </>
              ) : (
                `找不到關於「${q}」的資源`
              )}
            </p>

            {showChips && (
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`/search?q=${encodeURIComponent(q)}&mode=${mode || "intent"}`}
                  className="rounded-full px-4 py-2 text-base font-semibold transition"
                  style={
                    !cat
                      ? { background: "var(--cta)", color: "var(--cta-on)" }
                      : { background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1.5px solid var(--border)" }
                  }
                >
                  全部 ({allResults.length})
                </a>
                {availableCats.map((c) => {
                  const isActive = cat === c.slug;
                  const count = catCounts.get(c.slug) ?? 0;
                  return (
                    <a
                      key={c.slug}
                      href={`/search?q=${encodeURIComponent(q)}&cat=${c.slug}&mode=${mode || "intent"}`}
                      className="rounded-full px-4 py-2 text-base font-semibold transition"
                      style={
                        isActive
                          ? { background: c.color, color: "var(--cta-on)" }
                          : {
                              background: c.color + "15",
                              color: c.color,
                              border: `1.5px solid ${c.color}40`,
                            }
                      }
                    >
                      {c.name} ({count})
                    </a>
                  );
                })}
              </div>
            )}

            {results.length === 0 ? (
              <div
                className="mt-6 rounded-2xl p-10 text-center text-xl"
                style={{ background: "var(--bg-accent)", color: "#92400E", border: "2px dashed #FDE68A" }}
              >
                <div className="text-7xl">🔍</div>
                <p className="mt-4">試試其他關鍵字，或瀏覽下方分類</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {["送餐", "日照", "輔具", "交通", "喘息", "失智"].map((kw) => (
                    <a
                      key={kw}
                      href={`/search?q=${encodeURIComponent(kw)}&mode=intent`}
                      className="rounded-full px-4 py-2 text-base font-medium"
                      style={{
                        background: "var(--bg-elevated)",
                        color: "var(--cta)",
                        border: "1.5px solid #FDE68A",
                      }}
                    >
                      {kw}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {results.map((r) => {
                  const catSlug = getCatSlug(r);
                  const cMeta = categories.find((c) => c.slug === catSlug);
                  const isLocalMatch =
                    r.region_id != null && regionIds.includes(r.region_id);
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/resources/${catSlug}/${r.id}`}
                        className="group flex flex-col rounded-2xl p-6 shadow-sm transition hover:shadow-md"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "2px solid var(--border)",
                          borderLeftWidth: 6,
                          borderLeftColor: cMeta?.color ?? "var(--cta)",
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {cMeta && (
                            <span
                              className="rounded-full px-3 py-1 text-sm font-semibold"
                              style={{ background: cMeta.color + "20", color: cMeta.color }}
                            >
                              {cMeta.name}
                            </span>
                          )}
                          <span
                            className="rounded-full px-3 py-1 text-sm"
                            style={
                              r.scope === "national"
                                ? { background: "var(--bg-accent)", color: "#92400E" }
                                : { background: "var(--success-soft)", color: "#065F46" }
                            }
                          >
                            {r.scope === "national" ? "全國" : "在地"}
                          </span>
                          {isLocalMatch && (
                            <span
                              className="rounded-full px-3 py-1 text-sm font-bold"
                              style={{ background: "#DBEAFE", color: "#1D4ED8" }}
                            >
                              📍 你的所在地
                            </span>
                          )}
                          {r.region?.name && (
                            <span
                              className="rounded-full px-3 py-1 text-sm"
                              style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
                            >
                              {r.region.name}
                            </span>
                          )}
                        </div>
                        <h2
                          className="mt-3 text-2xl font-bold leading-snug"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {r.name}
                        </h2>
                        {r.summary && (
                          <p
                            className="mt-2 line-clamp-2 text-lg leading-relaxed"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {r.summary}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          {r.like_count > 0 && (
                            <span className="text-base" style={{ color: "var(--text-muted)" }}>
                              👍 {r.like_count}
                            </span>
                          )}
                          <span
                            className="ml-auto text-base font-semibold transition group-hover:translate-x-1"
                            style={{ color: "var(--cta)" }}
                          >
                            查看 →
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* 未輸入時顯示分類入口 */}
        {!q && (
          <div className="mt-10">
            <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
              或直接瀏覽分類：
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/resources/${c.slug}`}
                    className="flex items-center gap-3 rounded-2xl p-4 font-semibold transition hover:opacity-80"
                    style={{
                      background: c.color + "15",
                      color: c.color,
                      border: `1.5px solid ${c.color}40`,
                    }}
                  >
                    <span className="text-2xl font-bold">{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
