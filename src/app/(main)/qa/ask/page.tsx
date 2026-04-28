"use client";
import { useActionState } from "react";
import Link from "next/link";
import { postQuestion } from "@/lib/qa/actions";

export default function AskPage() {
  const [state, action, pending] = useActionState(postQuestion, null);

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/qa" className="text-lg font-medium" style={{ color: "var(--cta)" }}>
          ← 回問答區
        </Link>

        <h1 className="mt-5 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
          發問
        </h1>
        <p className="mt-2 text-xl" style={{ color: "var(--text-secondary)" }}>
          說清楚地點與情況，更容易得到好答案
        </p>

        <form action={action} className="mt-8 space-y-6">
          {/* 標題 */}
          <div>
            <label className="block text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              問題標題 <span style={{ color: "var(--alert)" }}>*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="例：中壢哪裡有免費量血壓？"
              className="mt-2 w-full rounded-2xl border px-5 py-4 text-xl outline-none transition focus:ring-2"
              style={{ borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            />
          </div>

          {/* 內文 */}
          <div>
            <label className="block text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              補充說明
            </label>
            <textarea
              name="body"
              rows={4}
              placeholder="可以補充更多背景，例如需求、時間、行動能力等"
              className="mt-2 w-full rounded-2xl border px-5 py-4 text-xl outline-none transition focus:ring-2"
              style={{ borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", resize: "vertical" }}
            />
          </div>

          {/* 地區 */}
          <div>
            <label className="block text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              地區（選填）
            </label>
            <p className="mt-1 text-base" style={{ color: "var(--text-muted)" }}>
              填地區可以讓在地志工更快看到你的問題
            </p>
            <input
              name="region_id"
              type="text"
              placeholder="例：桃園市中壢區（稍後可搜尋）"
              className="mt-2 w-full rounded-2xl border px-5 py-4 text-xl outline-none transition focus:ring-2"
              style={{ borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            />
          </div>

          {/* 標籤 */}
          <div>
            <label className="block text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              標籤（選填）
            </label>
            <input
              name="tags"
              type="text"
              placeholder="量血壓, 免費, 中壢（用逗號分隔）"
              className="mt-2 w-full rounded-2xl border px-5 py-4 text-xl outline-none transition focus:ring-2"
              style={{ borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            />
          </div>

          {state?.error && (
            <p className="text-base font-medium" style={{ color: "var(--alert)" }}>
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-2xl py-5 text-2xl font-bold transition disabled:opacity-60"
            style={{ background: "var(--cta)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
          >
            {pending ? "送出中…" : "發問"}
          </button>
        </form>
      </div>
    </main>
  );
}
