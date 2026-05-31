import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/config/categories";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { listResourcesByCategory } from "@/lib/resources/queries";
import { getUserRegionCode } from "@/lib/location/cookies";
import { getRegionByCode, getRegionAndParentIds } from "@/lib/location/regions";
import { RegionPicker } from "@/components/location/RegionPicker";

type Params = { category: string };
type Search = { sub?: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  return { title: cat?.name ?? "生活資源" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { category } = await params;
  const { sub } = await searchParams;

  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const regionCode = await getUserRegionCode();
  const [regionInfo, regionIds] = await Promise.all([
    regionCode ? getRegionByCode(regionCode) : Promise.resolve(null),
    regionCode ? getRegionAndParentIds(regionCode) : Promise.resolve([]),
  ]);

  const resources = await listResourcesByCategory({
    categorySlug: category,
    subcategorySlug: sub,
    regionIds: regionIds.length > 0 ? regionIds : undefined,
  });

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-5xl">

        {/* 返回 */}
        <Link
          href="/resources"
          className="inline-flex items-center gap-1 text-lg font-medium"
          style={{ color: "var(--cta)" }}
        >
          ← 全部分類
        </Link>

        {/* 標題 */}
        <header className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: cat.color }}>
              {cat.emoji} {cat.name}
            </h1>
            <p className="mt-1 text-xl" style={{ color: "var(--text-secondary)" }}>
              找到 {resources.length} 項服務
            </p>
          </div>

          {/* 地區顯示 + 切換 */}
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: regionInfo ? "#ECFDF5" : "var(--bg-accent)",
              border: regionInfo ? "1.5px solid #6EE7B7" : "1.5px dashed #FDE68A",
            }}
          >
            {regionInfo ? (
              <span className="text-base font-semibold" style={{ color: "#065F46" }}>
                📍 {regionInfo.name}
              </span>
            ) : (
              <span className="text-base font-semibold" style={{ color: "#92400E" }}>
                📍 設定地區看在地服務
              </span>
            )}
            <RegionPicker currentCode={regionInfo?.code ?? null} currentName={regionInfo?.name ?? null} />
          </div>
        </header>

        {/* 子分類晶片 */}
        <nav aria-label="子分類" className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/resources/${cat.slug}`}
            className="rounded-full px-4 py-2 text-base font-semibold transition"
            style={
              !sub
                ? { background: "var(--text-primary)", color: "var(--cta-on)" }
                : { background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
            }
          >
            全部
          </Link>
          {cat.subcategories.map((s) => (
            <Link
              key={s.slug}
              href={`/resources/${cat.slug}?sub=${s.slug}`}
              className="rounded-full px-4 py-2 text-base font-medium transition"
              style={
                sub === s.slug
                  ? { background: "var(--text-primary)", color: "var(--cta-on)" }
                  : { background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
              }
            >
              {s.name}
            </Link>
          ))}
        </nav>

        {/* 無地區提示 */}
        {!regionInfo && (
          <div
            className="mt-5 rounded-2xl px-5 py-4 text-base"
            style={{ background: "var(--bg-accent)", color: "#92400E" }}
          >
            目前顯示全國服務。設定你的地區後，可以看到附近的在地資源，排在最前面。
          </div>
        )}

        {/* 資源列表 */}
        <section className="mt-6">
          {resources.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center text-xl"
              style={{ background: "var(--bg-accent)", color: "#92400E", border: "2px dashed #FDE68A" }}
            >
              此分類目前還沒有資源。<br />
              歡迎到「我有好點子」頁面投稿！
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {resources.map((r) => (
                <li key={r.id}>
                  <ResourceCard resource={r} href={`/resources/${cat.slug}/${r.id}`} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
