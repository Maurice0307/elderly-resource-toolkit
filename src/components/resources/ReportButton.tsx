"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ELIcon } from "@/components/layout/ELIcon";

/* 回報資料有誤：勾選式回報彈窗（對齊設計稿 WebReportModal） */
const REASONS = [
  "電話打不通或號碼有誤",
  "地址或位置不正確",
  "服務已停止或單位已遷移",
  "服務時間／資格資訊過時",
  "內容描述有誤",
];

export function ReportButton({ resourceName }: { resourceName: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const anyPicked = Object.values(picked).some(Boolean) || note.trim().length > 0;

  function toggle(r: string) {
    setPicked((p) => ({ ...p, [r]: !p[r] }));
  }
  function close() {
    setOpen(false);
    setTimeout(() => { setDone(false); setPicked({}); setNote(""); }, 200);
  }
  function submit() {
    if (!anyPicked) return;
    setDone(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          height: 46, borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff",
          fontSize: 15, fontWeight: 700, color: "#574E47", cursor: "pointer", font: "inherit",
        }}
      >
        <ELIcon name="report" size={19} color="#6E645C" /> 回報資料有誤
      </button>

      {mounted && open && createPortal(
        <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(28,18,12,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.35)", margin: "auto" }}>
            {done ? (
              <div style={{ padding: "40px 28px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E7F4EC", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ELIcon name="check" size={34} color="#2E7D52" />
                </div>
                <div style={{ fontSize: 21, fontWeight: 800, color: "#241F1B" }}>已收到您的回報</div>
                <p style={{ margin: "10px 0 22px", fontSize: 16, color: "#574E47", lineHeight: 1.7 }}>謝謝您幫忙把關，社區志工會盡快確認並更新。</p>
                <button onClick={close} style={{ width: "100%", height: 52, borderRadius: 999, border: "none", background: "#E0552E", color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>完成</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "22px 24px 6px" }}>
                  <div>
                    <div style={{ fontSize: 21, fontWeight: 800, color: "#241F1B" }}>回報資料有誤</div>
                    <div style={{ fontSize: 14, color: "#6E645C", marginTop: 3, lineHeight: 1.5 }}>「{resourceName}」哪裡需要修正？可複選。</div>
                  </div>
                  <button onClick={close} aria-label="關閉" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", border: "none", background: "#FBF7F4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ELIcon name="close" size={19} color="#574E47" />
                  </button>
                </div>
                <div style={{ padding: "12px 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {REASONS.map((r) => {
                    const on = !!picked[r];
                    return (
                      <button key={r} type="button" onClick={() => toggle(r)} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14,
                        border: `2px solid ${on ? "#E0552E" : "#E4D7CC"}`, background: on ? "#FFF4EF" : "#fff",
                        cursor: "pointer", font: "inherit", textAlign: "left",
                      }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                          border: `2px solid ${on ? "#E0552E" : "#CBBFB5"}`, background: on ? "#E0552E" : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {on && <ELIcon name="check" size={15} color="#fff" />}
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: on ? "#B23F1E" : "#574E47" }}>{r}</span>
                      </button>
                    );
                  })}
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="補充說明（可不填）：例如正確的電話或地址"
                    style={{ width: "100%", borderRadius: 14, border: "2px solid #E4D7CC", padding: "13px 15px", fontSize: 16, color: "#241F1B", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", marginTop: 2 }}
                  />
                  <button
                    onClick={submit}
                    style={{
                      height: 54, borderRadius: 999, border: "none", marginTop: 4,
                      background: anyPicked ? "#E0552E" : "#E4D7CC", color: "#fff",
                      fontSize: 17, fontWeight: 800, cursor: anyPicked ? "pointer" : "not-allowed",
                      fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <ELIcon name="send" size={19} color="#fff" /> 送出回報
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
