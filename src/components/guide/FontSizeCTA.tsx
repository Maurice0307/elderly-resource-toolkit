"use client";

import { useState } from "react";
import { ELIcon } from "@/components/layout/ELIcon";

const SCALES = [1, 1.14, 1.3];
const LABELS = ["標準", "大", "特大"];

/* 「覺得字太小？」一鍵放大字級（套在 <main> 的 zoom，與 header 字級鈕一致）*/
export function FontSizeCTA() {
  const [idx, setIdx] = useState(0);

  const cycle = () => {
    const next = (idx + 1) % SCALES.length;
    setIdx(next);
    const main = document.querySelector("main");
    if (main) (main as HTMLElement).style.zoom = String(SCALES[next]);
  };

  return (
    <button
      onClick={cycle}
      style={{
        width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 13,
        background: "#FFF4EF", border: "1px solid #FFE7DD", borderRadius: 18, padding: "15px 16px",
        cursor: "pointer", font: "inherit",
      }}
    >
      <span style={{
        width: 46, height: 46, borderRadius: 13, flexShrink: 0,
        background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <ELIcon name="textsize" size={24} color="#F26B43" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#241F1B" }}>覺得字太小？</span>
        <span style={{ display: "block", marginTop: 2, fontSize: 14, color: "#574E47", lineHeight: 1.5 }}>
          {idx === 0 ? "一鍵把整個 App 的字放大" : `目前：${LABELS[idx]}，再按一下繼續放大`}
        </span>
      </span>
      <ELIcon name="chevron" size={20} color="#6E645C" />
    </button>
  );
}
