import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ELIcon } from "@/components/layout/ELIcon";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";

export const metadata = { title: "互助問答" };

type QuestionRow = {
  id: string;
  title: string;
  tags: string[];
  status: string;
  answer_count: number;
  created_at: string;
  region: { name: string } | null;
};

function getAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days >= 2) return `${days} 天前`;
  if (days === 1) return "昨天";
  if (hours >= 1) return `${hours} 小時前`;
  const mins = Math.floor(diff / 60000);
  return mins >= 1 ? `${mins} 分鐘前` : "剛剛";
}

export default async function QAPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const { f = "all" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("questions")
    .select("id, title, tags, status, answer_count, created_at, region:regions(name)")
    .in("status", ["open", "resolved"])
    .order("created_at", { ascending: false })
    .limit(40);
  if (f === "open") query = query.eq("status", "open");

  const { data } = await query;
  const questions = (data ?? []) as unknown as QuestionRow[];

  const filters = [
    { key: "all",   label: "全部",     href: "/qa" },
    { key: "open",  label: "待回答",   href: "/qa?f=open" },
    { key: "local", label: "我的地區", href: "/qa?f=local" },
  ];

  return (
    <div className="wv-fade">
      {/* 手機版返回列 */}
      <MobileSubHeader title="互助問答" />

      {/* 手機版篩選 chips */}
      <div className="wv-mobile-only">
        <div style={{ padding: "14px 18px 4px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filters.map(({ key, label, href }) => (
            <Link key={key} href={href} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: "none",
              background: f === key ? "#E0552E" : "#fff",
              color: f === key ? "#fff" : "#574E47",
              border: `1.5px solid ${f === key ? "#E0552E" : "#E4D7CC"}`,
            }}>
              {key === "local" && <ELIcon name="pin" size={13} color={f === key ? "#fff" : "#574E47"} />}{label}
            </Link>
          ))}
        </div>
      </div>

      {/* 標題帶（桌機） */}
      <div className="wv-desktop-only" style={{
        background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)",
        borderBottom: "1px solid #FFE7DD", padding: "34px 0 30px",
      }}>
        <div className="wv-wrap" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px, 3.2vw, 32px)", fontWeight: 800, color: "#241F1B" }}>互助問答</h1>
            <p style={{ margin: "0 0 24px", fontSize: 17, color: "#574E47" }}>在地志工為您解答生活中的照顧問題。</p>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {filters.map(({ key, label, href }) => (
                <Link key={key} href={href} style={{
                  padding: "9px 20px", borderRadius: 999, fontSize: 15, fontWeight: 700,
                  background: f === key ? "#E0552E" : "rgba(255,255,255,0.8)",
                  color: f === key ? "#fff" : "#574E47",
                  border: `1.5px solid ${f === key ? "#E0552E" : "#E4D7CC"}`,
                  textDecoration: "none",
                }}>{label}</Link>
              ))}
            </div>
          </div>
          <Link href="/qa/ask" style={{
            height: 50, padding: "0 24px", borderRadius: 999, background: "#E0552E",
            color: "#fff", fontSize: 16, fontWeight: 800, display: "inline-flex",
            alignItems: "center", gap: 9, textDecoration: "none",
            boxShadow: "0 6px 16px rgba(224,85,46,0.26)", flexShrink: 0,
          }}>
            <ELIcon name="add" size={20} color="#fff" /> 我要提問
          </Link>
        </div>
      </div>

      {/* 問題列表 — max-width 880px, centered */}
      <div className="wv-wrap" style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#6E645C" }}>
              <ELIcon name="qa" size={48} color="#E4D7CC" style={{ margin: "0 auto 16px" }} />
              <p style={{ fontSize: 18, fontWeight: 700 }}>暫無問題</p>
            </div>
          ) : (
            <div>
              {questions.map((q, i) => {
                const region = Array.isArray(q.region) ? q.region[0] : q.region;
                const solved = q.status === "resolved";
                return (
                  <Link
                    key={q.id}
                    href={`/qa/${q.id}`}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "16px 4px", textDecoration: "none",
                      borderTop: i === 0 ? "none" : "1px solid #F0E6DE",
                    }}
                  >
                    <ELIcon name="qa" size={22} color="#F26B43" style={{ marginTop: 3, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#241F1B", lineHeight: 1.55 }}>
                        {q.title}
                      </h3>
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 999,
                          background: solved ? "#E7F4EC" : "#FFF1E8",
                          color: solved ? "#2E7D52" : "#C2410C",
                        }}>
                          {solved ? <><ELIcon name="check" size={13} color="#2E7D52" /> 已解決</> : "待回答"}
                        </span>
                        {region?.name && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 13, fontWeight: 600, color: "#B23F1E", background: "#FFF4EF", padding: "4px 10px", borderRadius: 999 }}>
                            <ELIcon name="pin" size={13} color="#F26B43" /> {region.name}
                          </span>
                        )}
                        <span style={{ fontSize: 13.5, color: "#6E645C" }}>{q.answer_count} 則回答 · {getAgo(q.created_at)}</span>
                      </div>
                    </div>
                    <ELIcon name="chevron" size={20} color="#CBBFB5" style={{ marginTop: 3, flexShrink: 0 }} />
                  </Link>
                );
              })}
            </div>
          )}

          {/* 提問入口 */}
          <div style={{ marginTop: 40, textAlign: "center", padding: "40px 28px", background: "linear-gradient(120deg,#FFF4EF,#FFE7DD)", borderRadius: 22, border: "1px solid #FFE7DD" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#241F1B" }}>找不到答案？直接問！</h2>
            <p style={{ margin: "0 0 22px", fontSize: 16, color: "#574E47" }}>在地志工會在 24 小時內為您解答。</p>
            <Link href="/qa/ask" style={{
              height: 52, padding: "0 32px", borderRadius: 999, background: "#E0552E",
              color: "#fff", fontSize: 18, fontWeight: 800, display: "inline-flex",
              alignItems: "center", gap: 10, textDecoration: "none",
              boxShadow: "0 6px 16px rgba(224,85,46,0.26)",
            }}>
              + 我要提問
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
