"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";
import { BrandLogo } from "@/components/layout/BrandLogo";

/* 首頁教學引導橫幅（對齊設計稿 GuideBanner，可關閉、記住狀態） */
export function MobileGuideBanner() {
  const KEY = "el-guide-banner-dismissed";
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem(KEY) === "1") setHidden(true); } catch {}
  }, []);
  if (hidden) return null;
  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.setItem(KEY, "1"); } catch {}
    setHidden(true);
  };
  return (
    <Link href="/guide" style={{
      position: "relative", display: "flex", alignItems: "center", gap: 13,
      background: "#fff", border: "1.5px solid #FFD6C7", borderRadius: 18, padding: "14px 14px",
      boxShadow: "0 4px 14px rgba(224,85,46,0.10)", textDecoration: "none",
    }}>
      <span style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0, background: "linear-gradient(135deg,#F2764F,#E0552E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 12px rgba(224,85,46,0.3)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M6 4.5v15l13-7.5z" /></svg>
      </span>
      <span style={{ flex: 1, minWidth: 0, paddingRight: 18 }}>
        <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#241F1B" }}>第一次使用？看 2 分鐘教學</span>
        <span style={{ display: "block", marginTop: 2, fontSize: 13, color: "#574E47", lineHeight: 1.5 }}>認識怎麼找資源、怎麼打電話問</span>
      </span>
      <span style={{ background: "#E0552E", color: "#fff", fontWeight: 800, fontSize: 13.5, padding: "9px 14px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>看教學</span>
      <button onClick={dismiss} aria-label="關閉" style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, minHeight: 0, borderRadius: 999, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <ELIcon name="close" size={15} color="#6E645C" stroke={2.2} />
      </button>
    </Link>
  );
}

/* iOS「加入主畫面」導引浮磚（對齊設計稿 IOSInstallGuide，可關閉） */
function ShareGlyph({ size = 19, color = "#0a84ff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M12 3v12" /><path d="M8 7l4-4 4 4" />
      <path d="M6 12H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}

export function IOSInstallGuide() {
  const KEY = "el-install-dismissed";
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem(KEY) === "1") setHidden(true); } catch {}
  }, []);
  if (hidden) return null;
  const dismiss = () => { try { localStorage.setItem(KEY, "1"); } catch {} setHidden(true); };
  return (
    <div className="al-install" style={{ padding: "4px 0 0", position: "relative" }}>
      <div style={{ background: "#fff", border: "1px solid #F0E6DE", borderRadius: 20, boxShadow: "0 12px 30px rgba(40,30,20,0.16)", padding: "16px 16px 18px", position: "relative" }}>
        <button onClick={dismiss} aria-label="關閉提示" style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, minHeight: 0, borderRadius: 999, border: "none", background: "#FBF7F4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ELIcon name="close" size={17} color="#6E645C" stroke={2.2} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, flexShrink: 0, background: "linear-gradient(135deg,#F2764F,#E0552E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(224,85,46,0.32)" }}>
            <BrandLogo size={32} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 30 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B", lineHeight: 1.35 }}>把「幸福好厝邊」加到主畫面</div>
            <div style={{ marginTop: 3, fontSize: 13, color: "#574E47", lineHeight: 1.5 }}>下次一點就開，用起來像 App 一樣順手</div>
          </div>
        </div>

        <div style={{ marginTop: 14, background: "#FFF4EF", borderRadius: 14, padding: "13px 14px", display: "flex", flexDirection: "column", gap: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: "#fff", color: "#B23F1E", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</span>
            <span style={{ flex: 1, fontSize: 16, color: "#241F1B", lineHeight: 1.45 }}>點下方工具列的「分享」</span>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: "#fff", border: "1px solid #E4D7CC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShareGlyph size={19} color="#0a84ff" />
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: "#fff", color: "#B23F1E", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</span>
            <span style={{ flex: 1, fontSize: 16, color: "#241F1B", lineHeight: 1.45 }}>向下滑，選「<b style={{ color: "#B23F1E" }}>加入主畫面</b>」</span>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: "#fff", border: "1px solid #E4D7CC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ELIcon name="add" size={19} color="#241F1B" stroke={2.2} />
            </span>
          </div>
        </div>
      </div>

      <div className="al-install-arrow" style={{ display: "flex", justifyContent: "center", marginTop: -1 }}>
        <svg width="34" height="20" viewBox="0 0 34 20" style={{ filter: "drop-shadow(0 6px 6px rgba(40,30,20,0.12))" }}>
          <path d="M0 0 H34 L17 19 Z" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}
