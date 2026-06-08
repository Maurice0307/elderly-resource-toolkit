"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ELIcon } from "@/components/layout/ELIcon";

/* iOS App 風手機 hero：地區列 + 「我需要什麼幫助？」+ 搜尋 + 語音鈕 */
export function MobileSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ stop: () => void; start: () => void } | null>(null);

  useEffect(() => {
    setRegion(localStorage.getItem("el_region_label") || "");
  }, []);

  const submit = () => {
    const t = q.trim();
    router.push(t ? `/resources?q=${encodeURIComponent(t)}` : "/resources");
  };

  const startVoice = () => {
    const w = window as unknown as { SpeechRecognition?: new () => never; webkitSpeechRecognition?: new () => never };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { router.push("/resources"); return; }
    if (listening) { try { recRef.current?.stop(); } catch {} setListening(false); return; }
    try {
      const rec = new SR() as unknown as { lang: string; interimResults: boolean; maxAlternatives: number; onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void; onend: () => void; onerror: () => void; stop: () => void; start: () => void };
      recRef.current = rec;
      rec.lang = "zh-TW";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const t = (e.results[0][0].transcript || "").replace(/[\s。．、,]+$/, "");
        if (t) { setQ(t); router.push(`/resources?q=${encodeURIComponent(t)}`); }
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      setListening(true);
      rec.start();
    } catch { setListening(false); }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)",
      borderBottom: "1px solid #FFE7DD",
      padding: "16px 18px 22px",
    }}>
      {/* 地區列 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14.5, fontWeight: 700, color: "#B23F1E" }}>
          <ELIcon name="pin" size={17} color="#F26B43" />
          {region || "全台灣"}
        </span>
        <button
          onClick={() => window.dispatchEvent(new Event("el:open-region"))}
          style={{
            display: "inline-flex", alignItems: "center", gap: 3, border: "none",
            background: "rgba(255,255,255,0.7)", borderRadius: 999, padding: "6px 13px",
            fontSize: 13.5, fontWeight: 700, color: "#574E47", cursor: "pointer", font: "inherit",
          }}
        >
          變更地區 <ELIcon name="chevron" size={13} color="#6E645C" />
        </button>
      </div>

      {/* 大標 */}
      <h1 style={{ margin: "0 0 4px", fontSize: 27, fontWeight: 800, color: "#241F1B", letterSpacing: -0.5 }}>
        我需要什麼幫助？
      </h1>
      <p style={{ margin: "0 0 16px", fontSize: 15, color: "#6E645C" }}>
        搜尋資源（例如：復康巴士、量血壓）
      </p>

      {/* 搜尋列 */}
      <div style={{
        display: "flex", gap: 8, background: "#fff", borderRadius: 16,
        padding: 7, boxShadow: "0 8px 22px rgba(120,60,30,0.12)",
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, paddingLeft: 12, minWidth: 0 }}>
          <ELIcon name="search" size={22} color="#F26B43" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="輸入關鍵字…"
            style={{ flex: 1, border: "none", outline: "none", fontFamily: "inherit", fontSize: 17, fontWeight: 600, color: "#241F1B", background: "transparent", minWidth: 0 }}
          />
        </div>
        <button
          onClick={submit}
          aria-label="搜尋"
          style={{ height: 48, padding: "0 20px", borderRadius: 12, border: "none", background: "#E0552E", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}
        >
          搜尋
        </button>
      </div>

      {/* 語音鈕（全寬）*/}
      <button
        onClick={startVoice}
        style={{
          marginTop: 12, width: "100%", height: 50, borderRadius: 14, cursor: "pointer", font: "inherit",
          border: listening ? "none" : "1.5px solid #FFD6C7",
          background: listening ? "#E0552E" : "rgba(255,255,255,0.75)",
          color: listening ? "#fff" : "#B23F1E", fontSize: 16, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        }}
      >
        <ELIcon name="mic" size={21} color={listening ? "#fff" : "#F26B43"} />
        {listening ? "聆聽中…請說" : "改用語音說出需求"}
      </button>
    </div>
  );
}
