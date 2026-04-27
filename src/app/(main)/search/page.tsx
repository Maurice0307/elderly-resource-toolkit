import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/config/categories";
import type { Resource } from "@/types/domain";

export const metadata = { title: "搜尋資源" };

type SearchRow = Resource & {
  subcategory: { slug: string; name: string; categories: { slug: string } } | null;
};

async function searchResources(q: string): Promise<SearchRow[]> {
  if (!q.trim()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*, subcategory:subcategories(slug, name, categories(slug))")
    .eq("status", "active")
    .or(`name.ilike.%${q}%,summary.ilike.%${q}%,description.ilike.%${q}%`)
    .order("like_count", { ascending: false })
    .limit(50);
  return (data ?? []) as SearchRow[];
}

function getCatSlug(row: SearchRow): string {
  const sub = Array.isArray(row.subcategory) ? row.subcategory[0] : row.subcategory;
  return (sub?.categories as { slug: string } | undefined)?.slug ?? "";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "" } = await searchParams;
  const allResults = await searchResources(q);

  // Count how many results per category
  const catCounts = new Map<string, number>();
  for (const r of allResults) {
    const slug = getCatSlug(r);
    if (slug) catCounts.set(slug, (catCounts.get(slug) ?? 0) + 1);
  }

  // Only show chips for categories that actually appear in results
  const availableCats = categories.filter((c) => catCounts.has(c.slug));
  const showChips = q.trim() && availableCats.length > 1;

  // Apply category filter
  const results = cat ? allResults.filter((r) => getCatSlug(r) === cat) : allResults;

  const selectedCat = availableCats.find((c) => c.slug === cat);

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "#FFFBF5" }}>
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-lg font-medium" style={{ color: "#B45309" }}>
          ← 回首頁
        </Link>

        <h1 className="mt-5 text-4xl font-bold" style={{ color: "#1C1917" }}>
          搜尋資源
        </h1>

        {/* 搜尋框 */}
        <form method="GET" action="/search" className="mt-5">
          <div className="flex gap-3">
            <input
              name="q"
              type="search"
              defaultValue={q}
              autoFocus
              placeholder="輸入關鍵字，例：送餐、日照、輔具"
              className="flex-1 rounded-2xl border px-6 py-5 text-xl outline-none transition focus:ring-2"
              style={{ borderColor: "#E7E5E4", background: "#FFFFFF", color: "#1C1917" }}
            />
            <button
              type="submit"
              className="rounded-2xl px-7 py-5 text-xl font-bold text-white"
              style={{ background: "#B45309" }}
            >
              搜尋
            </button>
          </div>
        </form>

        {/* 結果 */}
        {q && (
          <div className="mt-8">
            <p className="text-lg" style={{ color: "#57534E" }}>
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

            {/* 分類 Chip 篩選 */}
            {showChips && (
              <div className="mt-4 flex flex-wrap gap-2">
                {/* 全部 */}
                <a
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="rounded-full px-4 py-2 text-base font-semibold transition"
                  style={
                    !cat
                      ? { background: "#B45309", color: "#FFFFFF" }
                      : { background: "#F5F0E8", color: "#78716C", border: "1.5px solid #E7E5E4" }
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
                      href={`/search?q=${encodeURIComponent(q)}&cat=${c.slug}`}
                      className="rounded-full px-4 py-2 text-base font-semibold transition"
                      style={
                        isActive
                          ? { background: c.color, color: "#FFFFFF" }
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
                style={{ background: "#FEF3C7", color: "#92400E", border: "2px dashed #FDE68A" }}
              >
                <div className="text-5xl">🔍</div>
                <p className="mt-4">試試其他關鍵字，或瀏覽下方分類</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {["送餐", "日照", "輔具", "交通", "喘息", "失智"].map((kw) => (
                    <a
                      key={kw}
                      href={`/search?q=${encodeURIComponent(kw)}`}
                      className="rounded-full px-4 py-2 text-base font-medium"
                      style={{
                        background: "#FFFFFF",
                        color: "#B45309",
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
                  const cat = categories.find((c) => c.slug === catSlug);
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/resources/${catSlug}/${r.id}`}
                        className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                        style={{ border: "2px solid #E7E5E4" }}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {cat && (
                            <span
                              className="rounded-full px-3 py-1 text-sm font-semibold"
                              style={{ background: cat.color + "20", color: cat.color }}
                            >
                              {cat.name}
                            </span>
                          )}
                          <span
                            className="rounded-full px-3 py-1 text-sm"
                            style={
                              r.scope === "national"
                                ? { background: "#FEF3C7", color: "#92400E" }
                                : { background: "#ECFDF5", color: "#065F46" }
                            }
                          >
                            {r.scope === "national" ? "全國" : "在地"}
                          </span>
                        </div>
                        <h2
                          className="mt-3 text-2xl font-bold leading-snug"
                          style={{ color: "#1C1917" }}
                        >
                          {r.name}
                        </h2>
                        {r.summary && (
                          <p
                            className="mt-2 line-clamp-2 text-lg leading-relaxed"
                            style={{ color: "#57534E" }}
                          >
                            {r.summary}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          {r.like_count > 0 && (
                            <span className="text-base" style={{ color: "#A8A29E" }}>
                              👍 {r.like_count}
                            </span>
                          )}
                          <span
                            className="ml-auto text-base font-semibold transition group-hover:translate-x-1"
                            style={{ color: "#B45309" }}
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
            <p className="text-lg font-medium" style={{ color: "#57534E" }}>
              或直接瀏覽分類：
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/resources/${cat.slug}`}
                    className="flex items-center gap-3 rounded-2xl p-4 font-semibold transition hover:opacity-80"
                    style={{
                      background: cat.color + "15",
                      color: cat.color,
                      border: `1.5px solid ${cat.color}40`,
                    }}
                  >
                    <span className="text-2xl font-bold">{cat.name}</span>
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
