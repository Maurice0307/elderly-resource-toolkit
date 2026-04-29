import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_news")
    .select("title")
    .eq("id", id)
    .single();
  return { title: data?.title ?? "新聞摘要" };
}

function renderMd(md: string): string {
  const lines = md.split("\n");
  const parts: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      if (inList) {
        parts.push("</ul>");
        inList = false;
      }
      continue;
    }

    const isBullet = /^[-*]\s/.test(line);

    if (isBullet) {
      const text = line
        .replace(/^[-*]\s+/, "")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      if (!inList) {
        parts.push('<ul style="list-style:disc;padding-left:1.5rem;margin-top:0.75rem">');
        inList = true;
      }
      parts.push(`<li style="margin:0.6rem 0;line-height:1.7">${text}</li>`);
    } else {
      if (inList) {
        parts.push("</ul>");
        inList = false;
      }
      const text = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      parts.push(`<p style="margin-top:0.75rem;line-height:1.7">${text}</p>`);
    }
  }

  if (inList) parts.push("</ul>");
  return parts.join("\n");
}

function getFirstBullet(md: string): string {
  const line = md.split("\n").find((l) => l.startsWith("- ") || l.startsWith("* "));
  return line ? line.replace(/^[-*]\s+/, "").replace(/\*\*(.*?)\*\*/g, "$1") : md.slice(0, 80);
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_news")
    .select("*")
    .eq("id", id)
    .single();

  if (!data || data.status === "hidden") notFound();

  const dateStr = new Date(
    data.published_at ?? data.fetched_at,
  ).toLocaleDateString("zh-TW");

  const htmlContent = renderMd(data.summary_md);

  // 相關文章：同 tag 或同來源，排除自己，取最多 3 篇
  const tags: string[] = data.tags ?? [];
  let related: Array<{ id: string; title: string; source_org: string; image_url: string | null; tags: string[]; published_at: string | null; fetched_at: string; summary_md: string }> = [];

  if (tags.length > 0) {
    const { data: relData } = await supabase
      .from("daily_news")
      .select("id, title, source_org, image_url, tags, published_at, fetched_at, summary_md")
      .eq("status", "active")
      .neq("id", id)
      .contains("tags", [tags[0]])
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3);
    related = relData ?? [];
  }

  // 如果相關文章不足 3 篇，用同來源補足
  if (related.length < 3) {
    const existingIds = new Set([id, ...related.map((r) => r.id)]);
    const { data: srcData } = await supabase
      .from("daily_news")
      .select("id, title, source_org, image_url, tags, published_at, fetched_at, summary_md")
      .eq("status", "active")
      .eq("source_org", data.source_org)
      .neq("id", id)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3);
    for (const r of srcData ?? []) {
      if (!existingIds.has(r.id)) {
        related.push(r);
        existingIds.add(r.id);
        if (related.length >= 3) break;
      }
    }
  }

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/news" className="text-lg font-medium" style={{ color: "var(--cta)" }}>
          ← 回新聞列表
        </Link>

        {data.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.image_url}
            alt=""
            className="mt-6 w-full rounded-2xl object-cover"
            style={{ maxHeight: 320 }}
          />
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <a
            href={`/news?src=${encodeURIComponent(data.source_org)}`}
            className="rounded-full px-3 py-1 text-sm font-semibold transition hover:opacity-70"
            style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}
          >
            📰 {data.source_org}
          </a>
          {tags.map((tag: string) => (
            <a
              key={tag}
              href={`/news?tag=${encodeURIComponent(tag)}`}
              className="rounded-full px-3 py-1 text-sm transition hover:opacity-70"
              style={{ background: "var(--bg-accent)", color: "#92400E" }}
            >
              #{tag}
            </a>
          ))}
          <span className="ml-auto text-sm" style={{ color: "var(--text-muted)" }}>
            {dateStr}
          </span>
        </div>

        <h1
          className="mt-4 text-3xl font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {data.title}
        </h1>

        <div
          className="mt-6 rounded-2xl p-6 text-lg"
          style={{
            background: "var(--bg-elevated)",
            border: "2px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <a
          href={data.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-lg font-semibold transition hover:opacity-90"
          style={{
            background: "var(--bg-soft)",
            color: "var(--text-secondary)",
            border: "1.5px solid var(--border)",
            minHeight: "var(--hit)",
          }}
        >
          🔗 查看原始文章
        </a>

        {/* 相關文章 */}
        {related.length > 0 && (
          <section className="mt-10">
            <div className="border-t pt-6" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                相關文章
              </h2>
              <ul className="mt-4 space-y-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/news/${item.id}`}
                      className="group flex items-center gap-4 overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md"
                      style={{ background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
                    >
                      {item.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt=""
                          className="shrink-0 object-cover"
                          style={{ width: 80, height: 80 }}
                        />
                      )}
                      <div
                        className="flex min-w-0 flex-1 flex-col py-3 pr-4"
                        style={{ paddingLeft: item.image_url ? 0 : "1rem" }}
                      >
                        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                          {item.source_org}
                        </span>
                        <p
                          className="mt-1 line-clamp-2 text-base font-semibold leading-snug"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.title}
                        </p>
                        <p
                          className="mt-1 line-clamp-1 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {getFirstBullet(item.summary_md)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/news"
            className="text-lg font-medium"
            style={{ color: "var(--cta)" }}
          >
            ← 看更多今日新聞
          </Link>
        </div>
      </div>
    </main>
  );
}
