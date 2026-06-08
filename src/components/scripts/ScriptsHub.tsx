"use client";

import { useState } from "react";
import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";
import type { CommunicationScript, ScriptAudience } from "@/types/domain";

const AUD: { slug: ScriptAudience; label: string }[] = [
  { slug: "volunteer", label: "志工篇" },
  { slug: "family", label: "家屬篇" },
  { slug: "difficult", label: "困難情境" },
];
const AUD_LABEL: Record<string, string> = Object.fromEntries(AUD.map((a) => [a.slug, a.label]));

export function ScriptsHub({ scripts }: { scripts: CommunicationScript[] }) {
  const [filter, setFilter] = useState<"all" | ScriptAudience>("all");

  const mostLikedId = scripts.reduce<{ id: string; n: number }>(
    (acc, s) => (s.like_count > acc.n ? { id: s.id, n: s.like_count } : acc),
    { id: "", n: -1 },
  ).id;

  const filtered = filter === "all" ? scripts : scripts.filter((s) => s.audience === filter);

  const chips: { key: "all" | ScriptAudience; label: string }[] = [
    { key: "all", label: "全部" },
    ...AUD.map((a) => ({ key: a.slug, label: a.label })),
  ];

  return (
    <div className="wv-wrap" style={{ paddingTop: 24, paddingBottom: 56 }}>
      {/* 標籤篩選膠囊 */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {chips.map((c) => {
          const on = filter === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              style={{
                padding: "9px 18px", borderRadius: 999, fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                background: on ? "#E0552E" : "#fff",
                color: on ? "#fff" : "#574E47",
                border: `1.5px solid ${on ? "#E0552E" : "#E4D7CC"}`,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* 情境卡格 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.map((s) => (
          <Link
            key={s.id}
            href={`/scripts/${s.slug}`}
            className="wv-card click"
            style={{
              display: "flex", flexDirection: "column", gap: 12,
              background: "#fff", border: "1px solid #F0E6DE", borderRadius: 20,
              padding: "20px", textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ELIcon name="chat" size={24} color="#F26B43" />
              </span>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#FFF1E8", color: "#C2410C" }}>
                  {AUD_LABEL[s.audience] ?? "錦囊"}
                </span>
                {s.id === mostLikedId && (
                  <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#FFE7DD", color: "#B23F1E" }}>
                    🔥 最多人看
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{s.title}</div>
            {s.context && (
              <div style={{ fontSize: 15, color: "#574E47", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                {s.context}
              </div>
            )}
            <div style={{ marginTop: "auto", paddingTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#B23F1E", background: "#FFF4EF", borderRadius: 999, padding: "4px 12px" }}>
                {s.ok_examples.length + s.ng_examples.length} 句對話
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "#B23F1E", display: "inline-flex", alignItems: "center", gap: 3 }}>
                看示範 <ELIcon name="chevron" size={15} color="#B23F1E" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: "#FFF4EF", border: "1.5px dashed #FFD6C7", borderRadius: 16, padding: "32px", textAlign: "center", fontSize: 15, color: "#B23F1E" }}>
          這個分類的內容整理中，敬請期待
        </div>
      )}
    </div>
  );
}
