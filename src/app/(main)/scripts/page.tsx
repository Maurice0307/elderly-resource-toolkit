import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CommunicationScript, ScriptAudience } from "@/types/domain";

export const metadata = { title: "溝通錦囊" };

const audiences: { slug: ScriptAudience; label: string; emoji: string; desc: string }[] = [
  { slug: "volunteer", label: "志工篇",   emoji: "🤝", desc: "敲門術、破冰、建立信任" },
  { slug: "family",    label: "家屬篇",   emoji: "❤️", desc: "日常關心、情緒同理" },
  { slug: "difficult", label: "困難情境", emoji: "💪", desc: "勸醫就診、防詐騙溝通" },
];

async function getScripts(): Promise<CommunicationScript[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communication_scripts")
    .select("*")
    .eq("status", "active")
    .order("audience")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as CommunicationScript[];
}

export default async function ScriptsPage() {
  const scripts = await getScripts();
  const byAudience = Object.fromEntries(
    audiences.map((a) => [a.slug, scripts.filter((s) => s.audience === a.slug)]),
  );

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

      {/* 標頭 */}
      <div style={{ background: "#fff", padding: "14px 18px 16px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ margin: 0, fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)" }}>溝通錦囊</h1>
        <p style={{ margin: "6px 0 0", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>真實對話示範，讓每一次互動都更有溫度</p>
      </div>

      {/* 各對象群組 */}
      <div style={{ padding: "12px 18px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        {audiences.map((a) => {
          const list = byAudience[a.slug] ?? [];
          return (
            <section key={a.slug}>
              {/* 分組標頭 */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--cta-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", flexShrink: 0 }}>
                  {a.emoji}
                </div>
                <div>
                  <div style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--text-primary)" }}>{a.label}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{a.desc}</div>
                </div>
              </div>

              {list.length === 0 ? (
                <div style={{ background: "var(--cta-soft)", border: "1.5px dashed var(--bg-peach-mid)", borderRadius: 14, padding: "20px", textAlign: "center", fontSize: "0.9375rem", color: "var(--cta-ink)" }}>
                  內容整理中，敬請期待
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {list.map((script) => (
                    <Link
                      key={script.id}
                      href={`/scripts/${script.slug}`}
                      style={{
                        display: "block", background: "#fff",
                        border: "1px solid var(--border)", borderLeft: "5px solid var(--cta)",
                        borderRadius: 18, padding: "14px 16px", textDecoration: "none",
                        boxShadow: "0 1px 4px rgba(36,31,27,0.04)",
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {script.title}
                      </h3>
                      {script.context && (
                        <p style={{ margin: "6px 0 0", fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                          {script.context}
                        </p>
                      )}
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--cta-ink)", background: "var(--cta-soft)", borderRadius: 999, padding: "3px 10px" }}>
                          {script.ok_examples.length + script.ng_examples.length} 句對話
                        </span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
