"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ELIcon } from "@/components/layout/ELIcon";

/* 分享給家人：做成「長輩大字資訊卡」→ 傳到 LINE 或複製資訊（對齊設計稿 WebShareModal） */
export function ShareButton({
  title,
  phone,
  address,
}: {
  title: string;
  phone?: string | null;
  address?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    setUrl(window.location.href);
  }, []);

  const lines = [
    title,
    phone ? `☎ ${phone}` : "",
    address ? `📍 ${address}` : "",
    url,
    "（由幸福好厝邊分享）",
  ].filter(Boolean);
  const message = lines.join("\n");

  const lineHref = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
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
        <ELIcon name="share" size={19} color="#9B8E85" /> 分享給家人
      </button>

      {mounted && open && createPortal(
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(28,18,12,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.35)" }}>
            {/* header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "22px 24px 6px" }}>
              <div>
                <div style={{ fontSize: 21, fontWeight: 800, color: "#241F1B" }}>分享給家人</div>
                <div style={{ fontSize: 14, color: "#6E645C", marginTop: 3 }}>做成大字資訊卡，傳給長輩看更清楚</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="關閉" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", border: "none", background: "#FBF7F4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ELIcon name="close" size={19} color="#574E47" />
              </button>
            </div>

            {/* 大字資訊卡預覽 */}
            <div style={{ padding: "10px 24px 0" }}>
              <div style={{ border: "2px solid #FFE7DD", background: "#FFF9F6", borderRadius: 18, padding: "22px 22px" }}>
                <div style={{ fontSize: 23, fontWeight: 800, color: "#241F1B", lineHeight: 1.35 }}>{title}</div>
                {phone && (
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 9, fontSize: 26, fontWeight: 800, color: "#B23F1E" }}>
                    <ELIcon name="phone" size={24} color="#F26B43" /> {phone}
                  </div>
                )}
                {address && (
                  <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 9, fontSize: 17, color: "#574E47", lineHeight: 1.6 }}>
                    <ELIcon name="pin" size={20} color="#F26B43" style={{ marginTop: 2, flexShrink: 0 }} /> {address}
                  </div>
                )}
              </div>
            </div>

            {/* 動作 */}
            <div style={{ padding: "18px 24px 24px", display: "flex", flexDirection: "column", gap: 11 }}>
              <a
                href={lineHref} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14, background: "#06C755", color: "#fff", fontSize: 18, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 16px rgba(6,199,85,0.26)" }}
              >
                <ELIcon name="chat" size={22} color="#fff" /> 傳到 LINE 聊天室
              </a>
              <button
                onClick={copy}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, height: 52, borderRadius: 14, border: "1.5px solid #E4D7CC", background: "#fff", fontSize: 16.5, fontWeight: 800, color: copied ? "#2E7D52" : "#574E47", cursor: "pointer", fontFamily: "inherit" }}
              >
                <ELIcon name={copied ? "check" : "copy"} size={20} color={copied ? "#2E7D52" : "#9B8E85"} />
                {copied ? "已複製資訊" : "複製資訊"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
