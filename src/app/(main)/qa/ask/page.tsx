"use client";
import { useActionState } from "react";
import Link from "next/link";
import { postQuestion } from "@/lib/qa/actions";

export default function AskPage() {
  const [state, action, pending] = useActionState(postQuestion, null);

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100%", paddingBottom: 24 }}>
      {/* 返回列 */}
      <div style={{ background: "#fff", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <Link
          href="/qa"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.9375rem", fontWeight: 600, color: "var(--cta-ink)", textDecoration: "none" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          互助問答
        </Link>
      </div>

      {/* 標頭 */}
      <div style={{ background: "#fff", padding: "14px 18px 16px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ margin: 0, fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)" }}>發問</h1>
        <p style={{ margin: "6px 0 0", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>說清楚地點與情況，更容易得到好答案</p>
      </div>

      {/* 表單 */}
      <form action={action} style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* 標題 */}
        <div>
          <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            問題標題 <span style={{ color: "var(--cta)" }}>*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder="例：中壢哪裡有免費量血壓？"
            style={{
              width: "100%", border: "2px solid var(--border-strong)", borderRadius: 13,
              padding: "12px 14px", fontSize: "1rem", color: "var(--text-primary)",
              background: "#fff", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* 補充說明 */}
        <div>
          <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            補充說明
          </label>
          <textarea
            name="body"
            rows={4}
            placeholder="可以補充更多背景，例如需求、時間、行動能力等"
            style={{
              width: "100%", border: "2px solid var(--border-strong)", borderRadius: 13,
              padding: "12px 14px", fontSize: "1rem", color: "var(--text-primary)",
              background: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box",
            }}
          />
        </div>

        {/* 地區 */}
        <div>
          <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            地區（選填）
          </label>
          <p style={{ margin: "0 0 8px", fontSize: "0.8125rem", color: "var(--text-muted)" }}>填地區可以讓在地志工更快看到你的問題</p>
          <input
            name="region_id"
            type="text"
            placeholder="例：桃園市中壢區"
            style={{
              width: "100%", border: "2px solid var(--border-strong)", borderRadius: 13,
              padding: "12px 14px", fontSize: "1rem", color: "var(--text-primary)",
              background: "#fff", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* 標籤 */}
        <div>
          <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            標籤（選填）
          </label>
          <input
            name="tags"
            type="text"
            placeholder="量血壓, 免費, 中壢（用逗號分隔）"
            style={{
              width: "100%", border: "2px solid var(--border-strong)", borderRadius: 13,
              padding: "12px 14px", fontSize: "1rem", color: "var(--text-primary)",
              background: "#fff", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {state?.error && (
          <p style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--cta)" }}>
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            width: "100%", background: "var(--cta)", color: "#fff", border: "none",
            borderRadius: 14, padding: "14px", fontSize: "1.0625rem", fontWeight: 800,
            cursor: "pointer", opacity: pending ? 0.6 : 1, minHeight: 52,
          }}
        >
          {pending ? "送出中…" : "發問"}
        </button>
      </form>
    </main>
  );
}
