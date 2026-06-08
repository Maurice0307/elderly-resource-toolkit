import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ELIcon } from "@/components/layout/ELIcon";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("daily_news").select("title").eq("id", id).single();
  return { title: data?.title ?? "新聞摘要" };
}

function getAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  return `${days} 天前`;
}

const TAG_PALETTES: Record<string, { bg: string; color: string }> = {
  健康:     { bg: "#E7F4EC", color: "#2E7D52" },
  飲食:     { bg: "#E7F4EC", color: "#2E7D52" },
  心臟:     { bg: "#FFF4EF", color: "#B23F1E" },
  補助:     { bg: "#FFF4EF", color: "#B23F1E" },
  防詐查證: { bg: "#FFF1E8", color: "#C2410C" },
  安全:     { bg: "#FFF1E8", color: "#C2410C" },
  在地活動: { bg: "#EDF2FF", color: "#2952B3" },
  失智:     { bg: "#FAF5FF", color: "#7E22CE" },
  睡眠:     { bg: "#EFF6FF", color: "#0369A1" },
  慢性病:   { bg: "#FFF4EF", color: "#B23F1E" },
  生活:     { bg: "#F0FDF4", color: "#15803D" },
  老化:     { bg: "#FAF7F5", color: "#574E47" },
};
function tagStyle(tag: string) {
  return TAG_PALETTES[tag] ?? { bg: "#F0E6DE", color: "#6E645C" };
}

function extractBullets(md: string): string[] {
  return md
    .split("\n")
    .filter((l) => /^[-*]\s/.test(l.trim()))
    .map((l) => l.replace(/^[-*]\s+/, "").replace(/\*\*(.*?)\*\*/g, "$1"))
    .slice(0, 5);
}

function extractLead(md: string): string | null {
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line || /^[-*]\s/.test(line) || /^#{1,4}\s/.test(line)) continue;
    return line.replace(/\*\*(.*?)\*\*/g, "$1");
  }
  return null;
}

/* Renders only non-bullet paragraphs (bullets already shown in 重點整理) */
function renderMdBody(md: string): string {
  const lines = md.split("\n");
  const parts: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || /^[-*]\s/.test(line) || /^#{1,4}\s/.test(line)) continue;
    const text = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    parts.push(`<p style="margin-top:0.9rem;line-height:1.75;font-size:17px">${text}</p>`);
  }
  return parts.join("\n");
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("daily_news").select("*").eq("id", id).single();

  if (!data || data.status === "hidden") notFound();

  const tags: string[] = data.tags ?? [];
  const dateStr = getAgo(data.published_at ?? data.fetched_at);
  const bullets = extractBullets(data.summary_md);
  const lead = extractLead(data.summary_md);
  const htmlBody = renderMdBody(data.summary_md);

  /* 相關文章 */
  let related: Array<{ id: string; title: string; source_org: string; tags: string[] }> = [];
  if (tags.length > 0) {
    const { data: relData } = await supabase
      .from("daily_news")
      .select("id, title, source_org, tags")
      .eq("status", "active")
      .neq("id", id)
      .contains("tags", [tags[0]])
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(4);
    related = relData ?? [];
  }
  if (related.length < 2) {
    const existing = new Set([id, ...related.map((r) => r.id)]);
    const { data: srcData } = await supabase
      .from("daily_news")
      .select("id, title, source_org, tags")
      .eq("status", "active")
      .eq("source_org", data.source_org)
      .neq("id", id)
      .limit(4);
    for (const r of srcData ?? []) {
      if (!existing.has(r.id)) { related.push(r); existing.add(r.id); if (related.length >= 4) break; }
    }
  }

  return (
    <div className="wv-fade">
      {/* 頂部列 */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0E6DE", padding: "13px 0" }}>
        <div className="wv-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/news" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 15, fontWeight: 700, color: "#574E47", textDecoration: "none" }}>
            <ELIcon name="chevron" size={18} color="#574E47" style={{ transform: "rotate(180deg)" }} />
            返回新知
          </Link>
          {data.source_url && (
            <a href={data.source_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#B23F1E", textDecoration: "none" }}>
              <ELIcon name="share" size={16} color="#F26B43" /> 分享給家人
            </a>
          )}
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <div className="wv-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 40, alignItems: "start" }}>

          {/* ── 左欄：文章內容 ── */}
          <article>
            {/* 標籤 + 來源 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              {tags.slice(0, 2).map((tag) => {
                const s = tagStyle(tag);
                return (
                  <Link key={tag} href={`/news?cat=${encodeURIComponent(tag)}`} style={{ fontSize: 13.5, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 999, padding: "4px 12px", textDecoration: "none" }}>
                    {tag}
                  </Link>
                );
              })}
              <span style={{ fontSize: 13.5, color: "#9B8E85" }}>{data.source_org} · {dateStr}</span>
            </div>

            {/* 標題 */}
            <h1 style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 800, color: "#241F1B", lineHeight: 1.35 }}>
              {data.title}
            </h1>

            {/* Hero 圖片 */}
            <div style={{ marginBottom: 22, borderRadius: 16, overflow: "hidden", background: "#F5F1EE", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {data.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.image_url}
                  alt={data.title}
                  loading="lazy"
                  style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 320 }}
                />
              ) : (
                <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <ELIcon name="news" size={48} color="#C8B8AE" />
                  <span style={{ fontSize: 14, color: "#9B8E85" }}>{data.source_org}</span>
                </div>
              )}
            </div>

            {/* Lead 段落（第一句非 bullet 的段落） */}
            {lead && (
              <p style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600, color: "#241F1B", lineHeight: 1.75 }}>
                {lead}
              </p>
            )}

            {/* 重點整理 */}
            {bullets.length > 0 && (
              <div style={{ background: "#FFF4EF", border: "1px solid #FFE7DD", borderRadius: 18, padding: "20px 22px", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 800, color: "#241F1B", marginBottom: 14 }}>
                  <ELIcon name="sparkle" size={20} color="#F26B43" />
                  重點整理
                </div>
                <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {bullets.map((b, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, fontSize: 16, color: "#241F1B", lineHeight: 1.6 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 999, background: "#E0552E", color: "#fff", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                      <span style={{ flex: 1 }}>{b}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* 非 bullet 的正文段落（避免與重點整理重複） */}
            {htmlBody && (
              <div style={{ fontSize: 17, color: "#574E47", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: htmlBody }} />
            )}

            {/* 原始來源 */}
            {data.source_url && (
              <div style={{ marginTop: 28 }}>
                <a
                  href={data.source_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", background: "#fff", border: "1.5px solid #F0E6DE", borderRadius: 16, padding: "18px 20px" }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ELIcon name="link" size={22} color="#F26B43" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#241F1B" }}>前往原始來源</div>
                    <div style={{ marginTop: 2, fontSize: 13.5, color: "#9B8E85" }}>{data.source_org}（開啟原始網站）</div>
                  </div>
                  <ELIcon name="chevron" size={20} color="#9B8E85" />
                </a>
              </div>
            )}
          </article>

          {/* ── 右欄：延伸閱讀（sticky；手機取消） ── */}
          <aside className="wv-unsticky-sm" style={{ position: "sticky", top: 96 }}>
            {related.length > 0 && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#241F1B", marginBottom: 14 }}>延伸閱讀</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {related.map((r) => {
                    const s = (r.tags ?? []).length > 0 ? tagStyle(r.tags[0]) : tagStyle("");
                    return (
                      <Link
                        key={r.id}
                        href={`/news/${r.id}`}
                        className="wv-card click"
                        style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "16px 18px", textDecoration: "none", display: "block" }}
                      >
                        {(r.tags ?? []).slice(0, 1).map((tag) => (
                          <span key={tag} style={{ fontSize: 12.5, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 999, padding: "3px 10px", display: "inline-block", marginBottom: 8 }}>
                            {tag}
                          </span>
                        ))}
                        <div style={{ fontSize: 15.5, fontWeight: 700, color: "#241F1B", lineHeight: 1.45 }}>{r.title}</div>
                        <div style={{ marginTop: 6, fontSize: 13, color: "#9B8E85" }}>{r.source_org}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
