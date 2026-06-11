"use client";

import { useState } from "react";
import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";
import type { CommunicationScript } from "@/types/domain";

// 設計稿排序（依情境主題由「困難 → 日常 → 志工 → 照顧者」）
const ORDER = [
  "persuade-doctor",
  "anti-fraud-talk",
  "emotional-empathy",
  "beyond-did-you-eat",
  "first-knock",
  "break-ice",
  "self-burnout",
  "caregiver-family",
];
const HOT = new Set(["persuade-doctor", "self-burnout"]);

function primaryTag(s: CommunicationScript) {
  return s.tags?.[0] ?? "錦囊";
}
function shortDesc(s: CommunicationScript) {
  return (s.context ?? "").replace(/[，。].*$/, "") || "照著說，關係更靠近";
}

export function ScriptsHub({ scripts }: { scripts: CommunicationScript[] }) {
  const ordered = [...scripts].sort(
    (a, b) =>
      (ORDER.indexOf(a.slug) + 1 || 99) - (ORDER.indexOf(b.slug) + 1 || 99),
  );

  // 情境標籤膠囊
  const tags = ["全部"];
  ordered.forEach((s) => {
    const t = primaryTag(s);
    if (!tags.includes(t)) tags.push(t);
  });

  const [tag, setTag] = useState("全部");
  const list = tag === "全部" ? ordered : ordered.filter((s) => primaryTag(s) === tag);

  return (
    <div className="wv-wrap" style={{ paddingTop: 16, paddingBottom: 56 }}>
      <p style={{ margin: "0 0 14px", fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>
        和長輩說話卡關了嗎？挑一個情境，看看怎麼說，關係更靠近。
      </p>

      {/* 情境標籤篩選 */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        {tags.map((tg) => {
          const on = tg === tag;
          return (
            <button
              key={tg}
              onClick={() => setTag(tg)}
              style={{
                padding: "8px 16px", borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", minHeight: 0,
                background: on ? "#E0552E" : "#fff",
                color: on ? "#fff" : "#574E47",
                border: `1.5px solid ${on ? "#E0552E" : "#E4D7CC"}`,
              }}
            >
              {tg}
            </button>
          );
        })}
      </div>

      {/* 情境清單（分隔線列） */}
      <div>
        {list.map((s, i) => (
          <Link
            key={s.id}
            href={`/scripts/${s.slug}`}
            className="click"
            style={{
              display: "flex", alignItems: "center", gap: 13,
              padding: "15px 0", textDecoration: "none",
              borderTop: i === 0 ? "none" : "1px solid #F0E6DE",
            }}
          >
            <span style={{ width: 46, height: 46, borderRadius: 13, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ELIcon name="chat" size={24} color="#F26B43" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#FFF1E8", color: "#C2410C" }}>
                  {primaryTag(s)}
                </span>
                {HOT.has(s.slug) && (
                  <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#FFE7DD", color: "#B23F1E" }}>
                    最多人看
                  </span>
                )}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{s.title}</div>
              <div style={{ marginTop: 3, fontSize: 13.5, color: "#6E645C", lineHeight: 1.45 }}>{shortDesc(s)}</div>
            </div>
            <ELIcon name="chevron" size={20} color="#9C8E84" />
          </Link>
        ))}
      </div>

      {list.length === 0 && (
        <div style={{ background: "#FFF4EF", border: "1.5px dashed #FFD6C7", borderRadius: 16, padding: "32px", textAlign: "center", fontSize: 15, color: "#B23F1E" }}>
          這個分類的內容整理中，敬請期待
        </div>
      )}
    </div>
  );
}
