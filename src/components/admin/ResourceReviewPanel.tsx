"use client";

import { useState, useTransition } from "react";
import { updateAndApproveResource } from "@/lib/admin/actions";

type RawResource = {
  id: string;
  name: string;
  summary: string | null;
  description: string | null;
  phone: string | null;
  address: string | null;
  website_url: string | null;
  tags: string[];
};

type CleanedFields = {
  name: string;
  summary: string;
  description: string;
  phone: string;
  address: string;
  website_url: string;
  tags: string[];
};

export function ResourceReviewPanel({ resource }: { resource: RawResource }) {
  const [showRaw, setShowRaw] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [aiError, setAiError] = useState("");
  const [fields, setFields] = useState<CleanedFields | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleAiClean() {
    setAiState("loading");
    setAiError("");
    try {
      const res = await fetch("/api/admin/ai-clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: resource.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "未知錯誤");
        setAiState("error");
        return;
      }
      setFields(data.cleaned as CleanedFields);
      setAiState("done");
    } catch (e) {
      setAiError(String(e));
      setAiState("error");
    }
  }

  function handleSave() {
    if (!fields) return;
    startTransition(async () => {
      await updateAndApproveResource(resource.id, fields);
      setSaved(true);
    });
  }

  if (saved) {
    return (
      <div className="mt-3 rounded-xl p-3 text-base font-semibold" style={{ background: "#ECFDF5", color: "#065F46" }}>
        ✅ 已儲存並上架
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Action buttons row */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowRaw((v) => !v)}
          className="rounded-full px-4 py-2 text-sm font-semibold"
          style={{ background: "#F5F0E8", color: "#78716C", border: "1.5px solid #E7E5E4" }}
        >
          {showRaw ? "收起原始內容" : "📄 查看原始內容"}
        </button>
        <button
          onClick={handleAiClean}
          disabled={aiState === "loading"}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white transition"
          style={{ background: aiState === "loading" ? "#A78BFA" : "#7C3AED" }}
        >
          {aiState === "loading" ? "✨ AI整理中…" : "✨ AI整理"}
        </button>
      </div>

      {/* Raw content panel */}
      {showRaw && (
        <div
          className="rounded-2xl p-4 text-sm space-y-1.5 font-mono"
          style={{ background: "#F5F5F4", color: "#57534E", border: "1.5px solid #E7E5E4" }}
        >
          <p><span className="font-bold text-stone-600">名稱：</span>{resource.name}</p>
          <p><span className="font-bold text-stone-600">摘要：</span>{resource.summary ?? "—"}</p>
          <p><span className="font-bold text-stone-600">說明：</span>{resource.description ?? "—"}</p>
          <p><span className="font-bold text-stone-600">電話：</span>{resource.phone ?? "—"}</p>
          <p><span className="font-bold text-stone-600">地址：</span>{resource.address ?? "—"}</p>
          <p><span className="font-bold text-stone-600">網站：</span>{resource.website_url ?? "—"}</p>
          <p><span className="font-bold text-stone-600">標籤：</span>{resource.tags?.join("、") || "—"}</p>
        </div>
      )}

      {/* AI error */}
      {aiState === "error" && (
        <div className="rounded-xl p-3 text-sm" style={{ background: "#FEE2E2", color: "#DC2626" }}>
          AI整理失敗：{aiError}
        </div>
      )}

      {/* AI cleaned editable panel */}
      {aiState === "done" && fields && (
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: "#F5F3FF", border: "2px solid #C4B5FD" }}
        >
          <p className="text-sm font-bold" style={{ color: "#7C3AED" }}>
            ✨ AI 整理結果 — 確認後可直接修改再上架
          </p>

          <Field label="名稱">
            <input
              value={fields.name}
              onChange={(e) => setFields({ ...fields, name: e.target.value })}
              className="w-full rounded-xl border px-3 py-2 text-base outline-none focus:ring-2"
              style={{ borderColor: "#DDD6FE" }}
            />
          </Field>

          <Field label="摘要（一句話）">
            <input
              value={fields.summary}
              onChange={(e) => setFields({ ...fields, summary: e.target.value })}
              className="w-full rounded-xl border px-3 py-2 text-base outline-none focus:ring-2"
              style={{ borderColor: "#DDD6FE" }}
            />
          </Field>

          <Field label="詳細說明">
            <textarea
              value={fields.description}
              onChange={(e) => setFields({ ...fields, description: e.target.value })}
              rows={4}
              className="w-full rounded-xl border px-3 py-2 text-base outline-none focus:ring-2 resize-y"
              style={{ borderColor: "#DDD6FE" }}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="電話">
              <input
                value={fields.phone}
                onChange={(e) => setFields({ ...fields, phone: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-base outline-none focus:ring-2"
                style={{ borderColor: "#DDD6FE" }}
              />
            </Field>
            <Field label="網站">
              <input
                value={fields.website_url}
                onChange={(e) => setFields({ ...fields, website_url: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-base outline-none focus:ring-2"
                style={{ borderColor: "#DDD6FE" }}
              />
            </Field>
          </div>

          <Field label="地址">
            <input
              value={fields.address}
              onChange={(e) => setFields({ ...fields, address: e.target.value })}
              className="w-full rounded-xl border px-3 py-2 text-base outline-none focus:ring-2"
              style={{ borderColor: "#DDD6FE" }}
            />
          </Field>

          <Field label="標籤（逗號分隔）">
            <input
              value={fields.tags.join(", ")}
              onChange={(e) =>
                setFields({ ...fields, tags: e.target.value.split(/[,，\s]+/).filter(Boolean) })
              }
              className="w-full rounded-xl border px-3 py-2 text-base outline-none focus:ring-2"
              style={{ borderColor: "#DDD6FE" }}
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-full px-5 py-2 text-base font-bold text-white transition"
              style={{ background: isPending ? "#6EE7B7" : "#065F46" }}
            >
              {isPending ? "儲存中…" : "✅ 儲存並上架"}
            </button>
            <button
              onClick={() => setAiState("idle")}
              className="rounded-full px-5 py-2 text-base font-semibold"
              style={{ background: "#F5F0E8", color: "#78716C" }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold" style={{ color: "#6D28D9" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
