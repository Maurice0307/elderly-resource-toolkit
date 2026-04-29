import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "今日新聞" };

type NewsRow = {
  id: string;
  source_org: string;
  title: string;
  summary_md: string;
  image_url: string | null;
  tags: string[];
  published_at: string | null;
  fetched_at: string;
};

function getFirstBullet(md: string): string {
  const line = md.split("\n").find((l) => l.startsWith("- ") || l.startsWith("* "));
  return line ? line.replace(/^[-*]\s+/, "").replace(/\*\*(.*?)\*\*/g, "$1") : md.slice(0, 80);
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; src?: string }>;
}) {
  const { tag = "", src = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("daily_news")
    .select("id, source_org, title, summary_md, image_url, tags, published_at, fetched_at")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);

  if (tag) query = query.contains("tags", [tag]);
  if (src) query = query.eq("source_org", src);

  const { data } = await query;
  const news = (data ?? []) as NewsRow[];

  // 取得所有 tags 供篩選（不套用 tag 過濾，另撈一次）
  const { data: allRows } = await supabase
    .from("daily_news")
    .select("tags, source_org")
    .eq("status", "active");

  const tagCounts = new Map<string, number>();
  const srcSet = new Set<string>();
  for (const row of allRows ?? []) {
    srcSet.add(row.source_org);
    for (const t of row.tags ?? []) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const allTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
  const allSrcs = [...srcSet].sort();

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-lg font-medium" style={{ color: "var(--cta)" }}>
          ← 回首頁
        </Link>

        <div className="mt-5">
          <h1 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            📰 今日新聞
          </h1>
          <p className="mt-2 text-xl" style={{ color: "var(--text-secondary)" }}>
            精選長輩友善資訊，重點整理一目了然
          </p>
        </div>

        {/* Tag 篩選 */}
        {allTags.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              <a
                href="/news"
                className="rounded-full px-4 py-2 text-base font-semibold"
                style={
                  !tag && !src
                    ? { background: "var(--cta)", color: "var(--cta-on)" }
                    : { background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1.5px solid var(--border)" }
                }
              >
                全部
              </a>
              {allTags.map((t) => {
                const active = tag === t && !src;
                return (
                  <a
                    key={t}
                    href={`/news?tag=${encodeURIComponent(t)}`}
                    className="rounded-full px-4 py-2 text-base font-semibold transition"
                    style={
                      active
                        ? { background: "#EA580C", color: "#FFFFFF" }
                        : { background: "var(--bg-accent)", color: "#92400E", border: "1.5px solid #FDE68A" }
                    }
                  >
                    #{t} ({tagCounts.get(t)})
                  </a>
                );
              })}
            </div>

            {/* 來源篩選 */}
            <div className="flex flex-wrap gap-2">
              {allSrcs.map((s) => {
                const active = src === s && !tag;
                return (
                  <a
                    key={s}
                    href={`/news?src=${encodeURIComponent(s)}`}
                    className="rounded-full px-4 py-2 text-sm font-medium transition"
                    style={
                      active
                        ? { background: "var(--text-muted)", color: "#FFFFFF" }
                        : { background: "var(--bg-soft)", color: "var(--text-muted)", border: "1.5px solid var(--border)" }
                    }
                  >
                    {s}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* 結果計數 */}
        {(tag || src) && (
          <p className="mt-4 text-base" style={{ color: "var(--text-muted)" }}>
            {tag && `#${tag}`}{tag && src && " · "}{src && src} — 共 {news.length} 篇
          </p>
        )}

        {news.length === 0 ? (
          <div
            className="mt-10 rounded-2xl p-10 text-center text-xl"
            style={{ background: "var(--bg-accent)", color: "#92400E", border: "2px dashed #FDE68A" }}
          >
            <div className="text-7xl">📰</div>
            <p className="mt-4">這個分類目前還沒有文章</p>
            <a
              href="/news"
              className="mt-6 inline-block rounded-full px-6 py-3 text-lg font-semibold"
              style={{ background: "var(--cta)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
            >
              查看全部新聞
            </a>
          </div>
        ) : (
          <ul className="mt-6 space-y-5">
            {news.map((item) => {
              const dateStr = new Date(
                item.published_at ?? item.fetched_at,
              ).toLocaleDateString("zh-TW");

              return (
                <li
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md"
                  style={{ background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
                >
                  {/* 整張卡片可點，覆蓋層 */}
                  <Link href={`/news/${item.id}`} className="absolute inset-0 z-0" aria-label={item.title} />

                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt=""
                      className="relative w-full object-cover"
                      style={{ maxHeight: 220 }}
                    />
                  )}
                  <div className="relative z-10 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* 來源和 tag 是獨立的 a，z-index 高於卡片覆蓋層 */}
                      <a
                        href={`/news?src=${encodeURIComponent(item.source_org)}`}
                        className="relative z-10 rounded-full px-3 py-1 text-sm font-semibold transition hover:opacity-70"
                        style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}
                      >
                        📰 {item.source_org}
                      </a>
                      {item.tags.slice(0, 3).map((t) => (
                        <a
                          key={t}
                          href={`/news?tag=${encodeURIComponent(t)}`}
                          className="relative z-10 rounded-full px-3 py-1 text-sm transition hover:opacity-70"
                          style={{ background: "var(--bg-accent)", color: "#92400E" }}
                        >
                          #{t}
                        </a>
                      ))}
                      <span className="ml-auto text-sm" style={{ color: "var(--text-muted)" }}>
                        {dateStr}
                      </span>
                    </div>

                    <h2
                      className="mt-3 text-2xl font-bold leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.title}
                    </h2>

                    <p
                      className="mt-2 text-lg leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {getFirstBullet(item.summary_md)}
                    </p>

                    <span
                      className="mt-4 block text-base font-semibold transition group-hover:translate-x-1"
                      style={{ color: "var(--cta)" }}
                    >
                      閱讀重點摘要 →
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
