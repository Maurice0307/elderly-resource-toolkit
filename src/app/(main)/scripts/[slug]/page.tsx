import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScriptDialog } from "@/components/scripts/ScriptDialog";
import { MobileScriptDetail } from "@/components/scripts/MobileScriptDetail";
import type { CommunicationScript } from "@/types/domain";

type Params = { slug: string };

// 與清單頁一致的情境排序，用來決定「下一個情境」
const ORDER = [
  "persuade-doctor", "anti-fraud-talk", "emotional-empathy", "beyond-did-you-eat",
  "first-knock", "break-ice", "self-burnout", "caregiver-family",
];

const audienceLabel: Record<string, string> = {
  volunteer: "志工篇",
  family:    "家屬篇",
  difficult: "困難情境",
};

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("communication_scripts")
    .select("title")
    .eq("slug", slug)
    .maybeSingle();
  return { title: data?.title ?? "溝通錦囊" };
}

export default async function ScriptDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communication_scripts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();

  const script = data as CommunicationScript;

  // 找出「下一個情境」（依設計排序，循環）
  const { data: allRows } = await supabase
    .from("communication_scripts")
    .select("slug, title")
    .eq("status", "active");
  const all = (allRows ?? []) as { slug: string; title: string }[];
  all.sort((a, b) => (ORDER.indexOf(a.slug) + 1 || 99) - (ORDER.indexOf(b.slug) + 1 || 99));
  const idx = all.findIndex((s) => s.slug === slug);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;

  return (
    <>
      {/* 手機版：設計稿對話泡泡版型 */}
      <MobileScriptDetail script={script} next={next} />

      {/* 桌機版：原本版型 */}
      <main className="wv-desktop-only" style={{ background: "var(--bg-page)", minHeight: "100%", paddingBottom: 24, maxWidth: 880, margin: "0 auto" }}>
      {/* 返回列 */}
      <div style={{ background: "#fff", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <Link
          href="/scripts"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.9375rem", fontWeight: 600, color: "var(--cta-ink)", textDecoration: "none" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          溝通錦囊
        </Link>
      </div>

      {/* Hero 區 */}
      <div style={{ background: "linear-gradient(180deg, var(--bg-peach) 0%, var(--bg-page) 100%)", padding: "16px 18px 20px" }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--cta-ink)", background: "var(--cta-soft)", borderRadius: 999, padding: "3px 10px" }}>
          {audienceLabel[script.audience] ?? script.audience}
        </span>
        <h1 style={{ margin: "10px 0 0", fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.4 }}>
          {script.title}
        </h1>
        {script.context && (
          <p style={{ margin: "10px 0 0", fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
            {script.context}
          </p>
        )}
      </div>

      {/* 對話內容 */}
      <div style={{ padding: "0 18px" }}>
        <ScriptDialog
          okExamples={script.ok_examples}
          ngExamples={script.ng_examples}
          tips={script.tips}
        />
      </div>

      {/* 標籤 */}
      {script.tags.length > 0 && (
        <div style={{ padding: "12px 18px 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {script.tags.map((tag) => (
            <span
              key={tag}
              style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--cta-ink)", background: "var(--cta-soft)", borderRadius: 999, padding: "4px 12px" }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      </main>
    </>
  );
}
