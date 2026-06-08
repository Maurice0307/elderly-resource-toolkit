"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ELIcon } from "@/components/layout/ELIcon";

const HOT = ["量血壓", "復康巴士", "長照申請", "社區共餐", "防詐騙"];

function VoiceMicButton({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognition | null>(null);

  if (typeof window === "undefined") return null;
  const SR = (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
    || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
  if (!SR) return null;

  const stop = () => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  };

  const start = () => {
    try {
      const rec = new SR();
      recRef.current = rec;
      rec.lang = "zh-TW";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const t = (e.results[0][0].transcript || "").replace(/[\s。．、,。]+$/, "");
        if (t) onResult(t);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      setListening(true);
      rec.start();
    } catch { setListening(false); }
  };

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label="語音搜尋"
      className={listening ? "wv-mic-on" : ""}
      style={{
        width: 52, height: 52, borderRadius: 999, border: "none", cursor: "pointer",
        flexShrink: 0, background: listening ? "#E0552E" : "#FFF4EF",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background .2s",
      }}
    >
      <ELIcon name="mic" size={24} color={listening ? "#fff" : "#F26B43"} />
    </button>
  );
}

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = () => {
    const trimmed = q.trim();
    router.push(trimmed ? `/resources?q=${encodeURIComponent(trimmed)}` : "/resources");
  };

  return (
    <div style={{
      position: "relative", borderRadius: 28, overflow: "hidden",
      background: "linear-gradient(135deg, #FFF1E9 0%, #FFE7DD 100%)",
      border: "1px solid #FFE7DD", padding: "46px 44px 44px",
    }}>
      {/* 裝飾光暈 */}
      <div style={{
        position: "absolute", right: -40, top: -40, width: 280, height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(242,107,67,0.16), rgba(242,107,67,0))",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", maxWidth: 720 }}>
        {/* 標語徽章 */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(255,255,255,0.7)", padding: "7px 14px", borderRadius: 999,
          fontSize: 14.5, fontWeight: 700, color: "#B23F1E",
        }}>
          <ELIcon name="sparkle" size={16} color="#F26B43" /> 長輩照顧資源，一站就查到
        </div>

        {/* 大標題 */}
        <h1 style={{
          margin: "18px 0 0", fontSize: "clamp(28px, 4vw, 40px)",
          lineHeight: 1.2, fontWeight: 800, color: "#241F1B", letterSpacing: -0.8,
        }}>
          需要幫長輩找資源？<br />
          <span style={{ color: "#B23F1E" }}>打一個字，馬上找到能打的電話。</span>
        </h1>

        <p style={{ margin: "14px 0 26px", fontSize: 18, color: "#574E47", lineHeight: 1.65 }}>
          醫療、交通、補助、長照、防詐⋯⋯把分散各處的服務整理成查得到、看得懂、打得通的一站式平台。
        </p>

        {/* 搜尋列 */}
        <div style={{
          display: "flex", gap: 12, background: "#fff", borderRadius: 999,
          padding: 8, boxShadow: "0 14px 34px rgba(120,60,30,0.14)", maxWidth: 600,
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, paddingLeft: 18, minWidth: 0 }}>
            <ELIcon name="search" size={24} color="#F26B43" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="例如：量血壓、復康巴士、補助"
              style={{
                flex: 1, border: "none", outline: "none", fontFamily: "inherit",
                fontSize: 18, fontWeight: 600, color: "#241F1B", background: "transparent", minWidth: 0,
              }}
            />
          </div>
          <VoiceMicButton onResult={(t) => { setQ(t); router.push(`/resources?q=${encodeURIComponent(t)}`); }} />
          <button
            onClick={submit}
            style={{
              height: 56, padding: "0 28px", borderRadius: 999, border: "none",
              background: "#E0552E", color: "#fff", fontSize: 19, fontWeight: 800,
              cursor: "pointer", flexShrink: 0, boxShadow: "0 6px 16px rgba(224,85,46,0.26)",
              transition: "transform .12s, box-shadow .2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 9px 22px rgba(224,85,46,0.34)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 16px rgba(224,85,46,0.26)"; }}
          >
            搜尋
          </button>
        </div>

        {/* 熱門關鍵字 */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14.5, color: "#6E645C", fontWeight: 700 }}>熱門：</span>
          {HOT.map((h) => (
            <button
              key={h}
              onClick={() => { setQ(h); router.push(`/resources?q=${encodeURIComponent(h)}`); }}
              style={{
                border: "1.5px solid #FFD6C7", background: "rgba(255,255,255,0.6)",
                color: "#B23F1E", fontSize: 14.5, fontWeight: 700, padding: "6px 14px",
                borderRadius: 999, cursor: "pointer", font: "inherit",
              }}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
