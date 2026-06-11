"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ELIcon } from "@/components/layout/ELIcon";

/* iOS App 風手機 hero（對齊設計稿 home-final）：
   圓底漸層 + 地區 pill + 「我需要什麼幫助？」+ 帶邊框輸入框 + 方形搜尋鈕 + 緊湊語音鈕 */
export function MobileSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ stop: () => void; start: () => void } | null>(null);

  useEffect(() => {
    const lbl = localStorage.getItem("el_region_label") || "";
    const code = localStorage.getItem("el_region_code") || "";
    setRegion(lbl);
    // 舊資料只存了行政區名 → 補上縣市，顯示「縣市 · 行政區」
    if (lbl && !lbl.includes("·") && lbl !== "全台灣" && code) {
      fetch("/api/location/regions").then((r) => r.json()).then((cs) => {
        if (!Array.isArray(cs)) return;
        for (const c of cs) {
          if (c.code === code) return; // 整個縣市，保持原樣
          const d = (c.districts || []).find((x: { code: string }) => x.code === code);
          if (d) {
            const full = `${c.name} · ${d.name}`;
            try { localStorage.setItem("el_region_label", full); } catch {}
            setRegion(full);
            window.dispatchEvent(new CustomEvent("el:region-changed", { detail: { label: full, code } }));
            return;
          }
        }
      }).catch(() => {});
    }
    const onRegion = (e: Event) => {
      const d = (e as CustomEvent<{ label: string }>).detail;
      setRegion(d && d.label && d.label !== "全台灣" ? d.label : "");
    };
    window.addEventListener("el:region-changed", onRegion);
    return () => window.removeEventListener("el:region-changed", onRegion);
  }, []);

  const submit = () => {
    const t = q.trim();
    router.push(t ? `/search?q=${encodeURIComponent(t)}&mode=intent` : "/search");
  };

  const startVoice = () => {
    const w = window as unknown as { SpeechRecognition?: new () => never; webkitSpeechRecognition?: new () => never };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { router.push("/search"); return; }
    if (listening) { try { recRef.current?.stop(); } catch {} setListening(false); return; }
    try {
      const rec = new SR() as unknown as { lang: string; interimResults: boolean; maxAlternatives: number; onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void; onend: () => void; onerror: () => void; stop: () => void; start: () => void };
      recRef.current = rec;
      rec.lang = "zh-TW";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const t = (e.results[0][0].transcript || "").replace(/[\s。．、,]+$/, "");
        if (t) { setQ(t); router.push(`/search?q=${encodeURIComponent(t)}&mode=intent`); }
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      setListening(true);
      rec.start();
    } catch { setListening(false); }
  };

  return (
    <div style={{
      background: "linear-gradient(180deg,#FFE7DD 0%,#FFF4EF 100%)",
      borderRadius: "0 0 28px 28px",
      padding: "14px 18px 22px",
    }}>
      {/* 地區列 */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "#fff", color: "#B23F1E", fontSize: 13, fontWeight: 600,
          padding: "4px 10px", borderRadius: 999,
        }}>
          <ELIcon name="pin" size={15} color="#F26B43" />
          {region || "全台灣"}
        </span>
        <button
          onClick={() => window.dispatchEvent(new Event("el:open-region"))}
          style={{
            marginLeft: "auto", border: "none", background: "transparent",
            fontSize: 13, color: "#B23F1E", fontWeight: 700, padding: 0,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 3, font: "inherit",
          }}
        >
          變更地區 <ELIcon name="chevron" size={14} color="#B23F1E" />
        </button>
      </div>

      {/* 大標 */}
      <h1 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800, color: "#241F1B" }}>
        我需要什麼幫助？
      </h1>

      {/* 欄位標籤（GDS：清楚標籤） */}
      <label htmlFor="home-search" style={{ display: "block", fontSize: 16, color: "#574E47", margin: "13px 0 8px" }}>
        搜尋資源（例如：復康巴士、量血壓）
      </label>

      {/* 搜尋列：帶邊框輸入框 + 方形搜尋鈕 */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 9, background: "#fff",
          border: "2px solid " + (q ? "#E0552E" : "#241F1B"), borderRadius: 10,
          padding: "0 14px", height: 52, minWidth: 0,
        }}>
          <ELIcon name="search" size={22} color="#574E47" />
          <input
            id="home-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="輸入關鍵字…"
            aria-label="搜尋資源"
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 16, color: "#241F1B", fontWeight: q ? 600 : 400 }}
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="清除" style={{ border: "none", background: "transparent", padding: 0, minHeight: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
              <ELIcon name="close" size={18} color="#6E645C" />
            </button>
          )}
        </div>
        <button
          onClick={submit}
          aria-label="搜尋"
          style={{ width: 52, height: 52, borderRadius: 10, border: "none", background: "#E0552E", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 12px rgba(224,85,46,0.28)" }}
        >
          <ELIcon name="search" size={24} color="#fff" />
        </button>
      </div>

      {/* 語音鈕（緊湊、左對齊）*/}
      <button
        onClick={startVoice}
        style={{
          marginTop: 12, display: "flex", alignItems: "center", gap: 8, border: "none",
          background: "transparent", color: "#B23F1E", fontSize: 16, fontWeight: 700,
          padding: 0, cursor: "pointer", font: "inherit",
        }}
      >
        <span style={{
          width: 38, height: 38, borderRadius: 999,
          background: listening ? "#E0552E" : "#fff",
          border: listening ? "none" : "1px solid #E4D7CC",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} className={listening ? "wv-mic-on" : undefined}>
          <ELIcon name="mic" size={20} color={listening ? "#fff" : "#F26B43"} />
        </span>
        {listening ? "聆聽中…請說" : "改用語音說出需求"}
      </button>
    </div>
  );
}
