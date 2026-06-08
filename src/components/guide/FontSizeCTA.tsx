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
    <div style={{
      marginBottom: 56, background: "#fff", border: "1.5px solid #FFD6C7", borderRadius: 22,
      padding: "26px 30px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
    }}>
      <span style={{
        width: 56, height: 56, borderRadius: 16, flexShrink: 0,
        background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <ELIcon name="textsize" size={30} color="#F26B43" />
      </span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: "#241F1B" }}>覺得字太小？</div>
        <div style={{ marginTop: 3, fontSize: 16, color: "#574E47" }}>
          按一下就放大整個畫面的字，目前：<strong style={{ color: "#B23F1E" }}>{LABELS[idx]}</strong>
        </div>
      </div>
      <button
        onClick={cycle}
        style={{
          height: 52, padding: "0 26px", borderRadius: 999, border: "none", cursor: "pointer",
          background: "#E0552E", color: "#fff", fontSize: 17, fontWeight: 800, fontFamily: "inherit",
          display: "inline-flex", alignItems: "center", gap: 9, flexShrink: 0,
          boxShadow: "0 6px 16px rgba(224,85,46,0.26)",
        }}
      >
        <ELIcon name="textsize" size={20} color="#fff" /> 放大字級
      </button>
    </div>
  );
}
