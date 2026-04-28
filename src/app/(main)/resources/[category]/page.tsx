import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/config/categories";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { listResourcesByCategory } from "@/lib/resources/queries";

type Params = { category: string };
type Search = { sub?: string; scope?: "all" | "national" | "local" };

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
  const { sub, scope = "all" } = await searchParams;

  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const resources = await listResourcesByCategory({ categorySlug: category, subcategorySlug: sub, scope });

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
        <header className="mt-5">
          <h1 className="text-4xl font-bold" style={{ color: cat.color }}>
            {cat.name}
          </h1>
          <p className="mt-1 text-xl" style={{ color: "var(--text-secondary)" }}>
            找到 {resources.length} 項服務
          </p>
        </header>

        {/* 全國 / 在地 切換 */}
        <nav aria-label="範圍" className="mt-6 flex gap-3">
          {(["all", "national", "local"] as const).map((s) => {
            const p = new URLSearchParams();
            if (sub) p.set("sub", sub);
            if (s !== "all") p.set("scope", s);
            const href = `/resources/${cat.slug}${p.toString() ? `?${p}` : ""}`;
            const active = scope === s;
            return (
              <Link
                key={s}
                href={href}
                className="rounded-full px-6 py-3 text-lg font-semibold transition"
                style={
                  active
                    ? { background: cat.color, color: "var(--cta-on)", minHeight: "var(--hit)" }
                    : { background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1px solid var(--border)", minHeight: "var(--hit)" }
                }
              >
                {s === "all" ? "全部" : s === "national" ? "全國" : "在地"}
              </Link>
            );
          })}
        </nav>

        {/* 子分類晶片 */}
        <nav aria-label="子分類" className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/resources/${cat.slug}${scope !== "all" ? `?scope=${scope}` : ""}`}
            className="rounded-full px-4 py-2 text-base font-semibold transition"
            style={
              !sub
                ? { background: "var(--text-primary)", color: "var(--cta-on)" }
                : { background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
            }
          >
            全部
          </Link>
          {cat.subcategories.map((s) => {
            const p = new URLSearchParams();
            p.set("sub", s.slug);
            if (scope !== "all") p.set("scope", scope);
            return (
              <Link
                key={s.slug}
                href={`/resources/${cat.slug}?${p.toString()}`}
                className="rounded-full px-4 py-2 text-base font-medium transition"
                style={
                  sub === s.slug
                    ? { background: "var(--text-primary)", color: "var(--cta-on)" }
                    : { background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
                }
              >
                {s.name}
              </Link>
            );
          })}
        </nav>

        {/* 資源列表 */}
        <section className="mt-8">
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
