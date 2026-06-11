"use client";

import { useEffect, useState } from "react";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";
import { ELIcon } from "@/components/layout/ELIcon";

const SCALES = [1, 1.14, 1.3];
const LABELS = ["標準", "大", "特大"];
const SAMPLE = ["小", "中", "大"];

function applyScale(scale: number) {
  const main = document.querySelector("main");
  if (main) (main as HTMLElement).style.zoom = String(scale);
  try { localStorage.setItem("el_font_scale", String(scale)); } catch {}
}

export default function AccessibilityPage() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    try {
      const s = parseFloat(localStorage.getItem("el_font_scale") || "1");
      const i = SCALES.findIndex((x) => Math.abs(x - s) < 0.001);
      setIdx(i < 0 ? 0 : i);
    } catch {}
  }, []);

  const choose = (i: number) => { setIdx(i); applyScale(SCALES[i]); };

  return (
    <div className="wv-fade" style={{ background: "#FAF6F2", minHeight: "100%" }}>
      <MobileSubHeader title="字級與無障礙" search={false} />

      <div style={{ padding: "14px 18px 28px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ margin: "0 0 16px", fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>覺得字太小？選一個適合的大小，整個 App 都會跟著變大。設定會自動記住。</p>

        {/* 三段字級 */}
        <div style={{ display: "flex", gap: 10 }}>
          {SCALES.map((s, i) => {
            const on = idx === i;
            return (
              <button key={i} onClick={() => choose(i)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "20px 4px", borderRadius: 16, background: on ? "#FFF4EF" : "#fff", border: `2px solid ${on ? "#E0552E" : "#E4D7CC"}`, cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: 20 + i * 8, fontWeight: 800, color: on ? "#B23F1E" : "#574E47", lineHeight: 1 }}>{SAMPLE[i]}</span>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: on ? "#B23F1E" : "#6E645C" }}>{LABELS[i]}</span>
                {on && <ELIcon name="check" size={16} color="#1E9E54" />}
              </button>
            );
          })}
        </div>

        {/* 預覽 */}
        <div style={{ marginTop: 20, background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "18px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", marginBottom: 8 }}>預覽</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 6 }}>復康巴士怎麼預約？</div>
          <div style={{ fontSize: 15.5, color: "#574E47", lineHeight: 1.7 }}>持有身心障礙證明者，可於乘車前一天電話預約。費用比照公車，需出示證件。</div>
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "flex-start", gap: 10, background: "#FFF4EF", border: "1px solid #FFE0D2", borderRadius: 14, padding: "13px 15px" }}>
          <ELIcon name="bulb" size={20} color="#F26B43" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ flex: 1, fontSize: 14, color: "#7A5A48", lineHeight: 1.6 }}>右上角的「AA」按鈕也能隨時調整字級，效果一樣。</span>
        </div>
      </div>
    </div>
  );
}
