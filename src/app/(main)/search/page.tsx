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
    if (!res.ok) return { source: "keyword", ...keywordIntent(query) };
    return await res.json();
  } catch {
    return { source: "keyword", ...keywordIntent(query) };
  }
}

function getCatSlug(row: SearchRow): string {
  const sub = Array.isArray(row.subcategory) ? row.subcategory[0] : row.subcategory;
  return (sub?.categories as { slug: string } | undefined)?.slug ?? "";
}

async function searchResources(q: string, keywords: string[], regionIds: string[]): Promise<SearchRow[]> {
  if (!q.trim() && keywords.length === 0) return [];
  const supabase = await createClient();
  const terms = Array.from(new Set([q, ...keywords].filter((s) => s && s.trim())));
  const orFilter = terms
    .flatMap((t) => [`name.ilike.%${t}%`, `summary.ilike.%${t}%`, `description.ilike.%${t}%`, `tags.cs.{${t}}`])
    .join(",");
  const { data } = await supabase
    .from("resources")
    .select("*, subcategory:subcategories(slug, name, categories(slug)), region:regions(name, code)")
    .eq("status", "active")
    .or(orFilter)
    .limit(100);
  const rows = (data ?? []) as SearchRow[];
  const inRegion = (r: SearchRow) => r.region_id != null && regionIds.includes(r.region_id);
  return rows.sort((a, b) => {
    const aLocal = inRegion(a) ? 2 : a.scope === "national" ? 1 : 0;
    const bLocal = inRegion(b) ? 2 : b.scope === "national" ? 1 : 0;
    if (aLocal !== bLocal) return bLocal - aLocal;
    return (b.like_count ?? 0) - (a.like_count ?? 0);
  });
}

const POPULAR_KEYWORDS = ["送餐", "日照", "輔具", "交通", "喘息", "失智", "復健", "防詐"];

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
    <main style={{ background: "var(--bg-page)", minHeight: "100%", paddingBottom: 24 }}>
      {/* 返回列 */}
      <div style={{ background: "#fff", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <Link
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.9375rem", fontWeight: 600, color: "var(--cta-ink)", textDecoration: "none" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          回首頁
        </Link>
      </div>

      {/* 搜尋框 */}
      <div style={{ background: "#fff", padding: "12px 18px 14px", borderBottom: "1px solid var(--border)" }}>
        <form method="GET" action="/search">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--bg-page)", border: "1.5px solid var(--border-strong)", borderRadius: 14, padding: "10px 14px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                name="q"
                type="search"
                defaultValue={q}
                autoFocus={!q}
                placeholder="腳痛怎麼辦、附近有共餐嗎…"
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: "1rem", color: "var(--text-primary)", minWidth: 0 }}
              />
            </div>
            <button
              type="submit"
              style={{ background: "var(--cta)", color: "#fff", border: "none", borderRadius: 14, padding: "10px 18px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", minHeight: 44 }}
            >
              搜尋
            </button>
          </div>
          <input type="hidden" name="mode" value={mode || "intent"} />
        </form>

        {/* 在地優先提示 */}
        {region && (
          <p style={{ margin: "8px 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            📍 在地優先：{region.name}（同時顯示全國資源）
          </p>
        )}
      </div>

      {/* 有搜尋詞時 */}
      {q && (
        <>
          {/* 意圖分析卡片 */}
          {intent && (intent.categories.length > 0 || intent.reasoning) && (
            <div style={{ margin: "12px 18px 0", background: intent.source === "llm" ? "#F5F3FF" : "var(--warning-soft)", border: `1.5px solid ${intent.source === "llm" ? "#C4B5FD" : "#FDE68A"}`, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, background: intent.source === "llm" ? "#7C3AED" : "#92400E", color: "#fff", borderRadius: 999, padding: "3px 10px" }}>
                  {intent.source === "llm" ? "✨ AI 智慧理解" : "🔎 關鍵字匹配"}
                </span>
                {intent.reasoning && (
                  <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", flex: 1 }}>{intent.reasoning}</span>
                )}
              </div>
              {intent.categories.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {intent.categories.map((slug) => {
                    const c = categories.find((x) => x.slug === slug);
                    if (!c) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/resources/${slug}`}
                        style={{ fontSize: "0.875rem", fontWeight: 600, background: c.color, color: "#fff", borderRadius: 999, padding: "5px 12px", textDecoration: "none" }}
                      >
                        → {c.name}（瀏覽）
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 分類 chips */}
          {showChips && (
            <div style={{ padding: "10px 18px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a
                href={`/search?q=${encodeURIComponent(q)}&mode=${mode || "intent"}`}
                style={{
                  padding: "7px 14px", borderRadius: 999, fontSize: "0.9375rem", fontWeight: !cat ? 700 : 600,
                  background: !cat ? "var(--cta)" : "#fff",
                  color: !cat ? "#fff" : "var(--text-secondary)",
                  border: `1.5px solid ${!cat ? "var(--cta)" : "var(--border-strong)"}`,
                  textDecoration: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", minHeight: 36,
                }}
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
                    style={{
                      padding: "7px 14px", borderRadius: 999, fontSize: "0.9375rem", fontWeight: isActive ? 700 : 600,
                      background: isActive ? c.color : c.color + "15",
                      color: isActive ? "#fff" : c.color,
                      border: `1.5px solid ${isActive ? c.color : c.color + "40"}`,
                      textDecoration: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", minHeight: 36,
                    }}
                  >
                    {c.name} ({count})
                  </a>
                );
              })}
            </div>
          )}

          {/* 結果數 */}
          <div style={{ padding: "10px 18px 0" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
              {results.length > 0 ? (
                <>
                  找到 <strong style={{ color: "var(--text-primary)" }}>{results.length}</strong> 筆
                  {selectedCat ? <>「<span style={{ color: selectedCat.color }}>{selectedCat.name}</span>」</> : null}
                  關於「{q}」的資源
                </>
              ) : (
                `找不到關於「${q}」的資源`
              )}
            </p>
          </div>

          {/* 無結果 */}
          {results.length === 0 && (
            <div style={{ margin: "12px 18px 0" }}>
              <div style={{ background: "var(--warning-soft)", borderRadius: 14, padding: "16px", textAlign: "center", border: "1.5px dashed #FDE68A", marginBottom: 12 }}>
                <div style={{ fontSize: "2rem" }}>🔍</div>
                <p style={{ margin: "8px 0 0", fontSize: "0.9375rem", color: "#92400E" }}>試試其他關鍵字，或瀏覽分類</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {POPULAR_KEYWORDS.map((kw) => (
                  <a
                    key={kw}
                    href={`/search?q=${encodeURIComponent(kw)}&mode=intent`}
                    style={{ padding: "8px 16px", borderRadius: 999, fontSize: "0.9375rem", fontWeight: 600, background: "var(--cta-soft)", color: "var(--cta-ink)", border: "1.5px solid var(--bg-peach)", textDecoration: "none" }}
                  >
                    {kw}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 結果列表 */}
          {results.length > 0 && (
            <div style={{ padding: "10px 18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map((r) => {
                const catSlug = getCatSlug(r);
                const cMeta = categories.find((c) => c.slug === catSlug);
                const isLocal = r.region_id != null && regionIds.includes(r.region_id);
                const borderColor = isLocal ? "var(--success)" : r.scope === "national" ? "var(--cta)" : "#1D4ED8";
                return (
                  <Link
                    key={r.id}
                    href={`/resources/${catSlug}/${r.id}`}
                    style={{
                      display: "block", background: "#fff",
                      border: "1px solid var(--border)", borderLeft: `5px solid ${borderColor}`,
                      borderRadius: 18, padding: "14px 16px", textDecoration: "none",
                      boxShadow: "0 1px 4px rgba(36,31,27,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }}>
                      <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.4, flex: 1 }}>
                        {r.name}
                      </h3>
                      <span style={{
                        fontSize: "0.75rem", fontWeight: 700, borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap", flexShrink: 0,
                        color: isLocal ? "var(--success)" : r.scope === "national" ? "var(--cta-ink)" : "#1D4ED8",
                        background: isLocal ? "var(--success-soft)" : r.scope === "national" ? "var(--cta-soft)" : "#EFF6FF",
                      }}>
                        {isLocal ? "📍 你的地區" : r.scope === "national" ? "全國" : r.region?.name ?? "在地"}
                      </span>
                    </div>
                    {cMeta && (
                      <span style={{ display: "inline-block", marginTop: 5, fontSize: "0.75rem", fontWeight: 600, color: cMeta.color, background: cMeta.color + "18", borderRadius: 999, padding: "2px 9px" }}>
                        {cMeta.emoji} {cMeta.name}
                      </span>
                    )}
                    {r.summary && (
                      <p style={{ margin: "6px 0 0", fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                        {r.summary}
                      </p>
                    )}
                    {r.phone && (
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "var(--cta-soft)", border: "1px solid var(--bg-peach)", borderRadius: 12, padding: "8px 12px" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--cta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 7.28 7.28l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--cta-ink)", fontVariantNumeric: "tabular-nums" }}>{r.phone}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 未輸入時：熱門搜尋 + 分類瀏覽 */}
      {!q && (
        <div style={{ padding: "16px 18px 0" }}>
          {/* 提示框 */}
          <div style={{ background: "var(--cta-soft)", border: "1px solid var(--bg-peach)", borderRadius: 14, padding: "12px 14px", marginBottom: 16, fontSize: "0.9375rem", color: "var(--cta-ink)", lineHeight: 1.55 }}>
            💡 可以用自然語言搜尋，例如：「附近有沒有日間照顧？」
          </div>

          {/* 熱門搜尋 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 10 }}>
              熱門搜尋
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {POPULAR_KEYWORDS.map((kw) => (
                <a
                  key={kw}
                  href={`/search?q=${encodeURIComponent(kw)}&mode=intent`}
                  style={{ padding: "8px 16px", borderRadius: 999, fontSize: "0.9375rem", fontWeight: 600, background: "#fff", color: "var(--cta-ink)", border: "1.5px solid var(--border-strong)", textDecoration: "none" }}
                >
                  {kw}
                </a>
              ))}
            </div>
          </div>

          {/* 直接瀏覽分類 */}
          <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 10 }}>
            直接瀏覽分類
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/resources/${c.slug}`}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "#fff", border: `1.5px solid ${c.color}40`,
                  borderLeft: `4px solid ${c.color}`,
                  borderRadius: 14, padding: "12px 14px", textDecoration: "none",
                }}
              >
                <span style={{ fontSize: "1.375rem" }} aria-hidden>{c.emoji}</span>
                <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: c.color, flex: 1, lineHeight: 1.3 }}>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
