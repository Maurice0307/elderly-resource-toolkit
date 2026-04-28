"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ReportType = "ended" | "wrong_info" | "duplicate" | "other";

const reportOptions: { value: ReportType; label: string }[] = [
  { value: "ended",      label: "機構已停止服務" },
  { value: "wrong_info", label: "資訊有誤" },
  { value: "duplicate",  label: "與其他資源重複" },
  { value: "other",      label: "其他問題" },
];

export function FeedbackForm({
  resourceId,
  userId,
}: {
  resourceId: string;
  userId: string | null;
}) {
  const [open, setOpen]     = useState(false);
  const [type, setType]     = useState<ReportType>("wrong_info");
  const [detail, setDetail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  async function submit() {
    if (status === "submitting") return;
    setStatus("submitting");
    const supabase = createClient();
    await supabase.from("resource_reports").insert({
      resource_id: resourceId,
      user_id:     userId ?? null,
      report_type: type,
      detail:      detail.trim() || null,
    });
    setStatus("done");
  }

  function close() {
    setOpen(false);
    setStatus("idle");
    setDetail("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl px-6 py-4 text-xl font-semibold transition"
        style={{ background: "var(--bg-soft)", color: "var(--text-secondary)", border: "2px solid var(--border)", minHeight: "var(--hit)" }}
      >
        <span className="icon-lg">⚠️</span> 回報問題
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ background: "rgba(44,62,80,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div
            className="w-full max-w-md rounded-t-3xl p-8 sm:rounded-3xl"
            style={{ background: "var(--bg-elevated)" }}
          >
            {status === "done" ? (
              <div className="text-center">
                <div className="text-7xl">🙏</div>
                <h2 className="mt-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  感謝您的回報
                </h2>
                <p className="mt-2 text-lg" style={{ color: "var(--text-secondary)" }}>
                  我們會盡快確認並更新資訊
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 w-full rounded-2xl py-4 text-xl font-bold"
                  style={{ background: "var(--cta)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
                >
                  關閉
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  回報資訊問題
                </h2>
                <p className="mt-1 text-base" style={{ color: "var(--text-muted)" }}>
                  讓我們知道哪裡需要更新
                </p>

                <div className="mt-6 space-y-3">
                  {reportOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-4 rounded-2xl px-5 py-4 transition"
                      style={
                        type === opt.value
                          ? { background: "var(--bg-accent)", border: "2px solid #FDE68A", minHeight: "var(--hit)" }
                          : { background: "var(--bg-soft)", border: "2px solid transparent", minHeight: "var(--hit)" }
                      }
                    >
                      <input
                        type="radio"
                        name="report_type"
                        value={opt.value}
                        checked={type === opt.value}
                        onChange={() => setType(opt.value)}
                        className="accent-amber-700"
                      />
                      <span className="text-lg" style={{ color: "var(--text-primary)" }}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>

                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="補充說明（選填）"
                  rows={3}
                  className="mt-4 w-full resize-none rounded-xl border px-5 py-4 text-lg outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--bg-page)", color: "var(--text-primary)" }}
                />

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-2xl py-4 text-xl font-semibold"
                    style={{ background: "var(--bg-soft)", color: "var(--text-secondary)", minHeight: "var(--hit)" }}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={status === "submitting"}
                    className="rounded-2xl py-4 text-xl font-bold disabled:opacity-60"
                    style={{ background: "var(--cta)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
                  >
                    {status === "submitting" ? "送出中…" : "送出回報"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
