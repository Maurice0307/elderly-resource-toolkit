"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ELIcon } from "@/components/layout/ELIcon";

/* 對齊設計稿 web-profilepage.jsx 的成就徽章牆：進度條 / 鎖定 / 點數 / 可領核銷碼 */
type Badge = {
  ic: string; nm: string; on: boolean; pts: number; cond: string;
  now?: number; goal?: number; claim?: boolean; code?: string;
};

const CLAIM_BADGES: Badge[] = [
  { ic: "search", nm: "社區百事通", on: true, claim: true, code: "777 999", pts: 500, now: 10, goal: 10, cond: "查找資源累計 10 次" },
  { ic: "craft",  nm: "手作大師",   on: true, claim: true, code: "888 168", pts: 500, now: 3,  goal: 3,  cond: "完成互動學習累計 3 次" },
];

const BADGES: Badge[] = [
  { ic: "medal",     nm: "量血壓達人", on: true,  pts: 100, cond: "完成健康保健圖卡" },
  { ic: "shield",    nm: "防詐高手",   on: true,  pts: 100, cond: "防詐演練答對率 80%" },
  { ic: "star",      nm: "熱心分享",   on: true,  pts: 80,  cond: "分享資源給家人" },
  { ic: "health",    nm: "健康學徒",   on: true,  pts: 50,  cond: "完成第一張健康圖卡" },
  { ic: "trophy",    nm: "連續 7 天",  on: false, pts: 200, cond: "連續學習達 7 天", now: 5, goal: 7 },
  { ic: "education", nm: "3C 高手",    on: false, pts: 150, cond: "完成 3C 教學圖卡", now: 2, goal: 4 },
  { ic: "like",      nm: "志工之星",   on: false, pts: 250, cond: "服務時數累計 30 小時", now: 18, goal: 30 },
  { ic: "heart",     nm: "收藏家",     on: false, pts: 100, cond: "收藏滿 20 筆資源", now: 12, goal: 20 },
];

function CodeModal({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(20,12,8,0.66)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.4)" }}>
        <div style={{ background: "linear-gradient(120deg,#E0552E,#F2764F)", padding: "22px 26px", display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ELIcon name={badge.ic} size={28} color="#fff" />
          </div>
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{badge.nm} · 已點亮</div>
            <div style={{ fontSize: 14, opacity: 0.92 }}>大額點數徽章 · 核銷專用</div>
          </div>
        </div>
        <div style={{ padding: "26px 28px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#241F1B" }}>大額點數核銷密碼</div>
          <div style={{ marginTop: 16, background: "#241F1B", borderRadius: 18, padding: "24px 12px" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: 9, fontFamily: "ui-monospace, Menlo, monospace" }}>{badge.code}</div>
          </div>
          <div style={{ marginTop: 18, background: "#FCEBEA", border: "1.5px solid #F5C6C2", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 11, textAlign: "left" }}>
            <ELIcon name="megaphone" size={26} color="#C0392B" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 17, fontWeight: 800, color: "#C0392B", lineHeight: 1.5 }}>請把這個畫面拿給里長或社工核銷</span>
          </div>
          <button onClick={onClose} style={{ marginTop: 20, width: "100%", height: 54, borderRadius: 999, border: "none", background: "#E0552E", color: "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 16px rgba(224,85,46,0.26)" }}>完成</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function BadgeTile({ b, onClaim }: { b: Badge; onClaim: () => void }) {
  const claimable = !!b.claim && b.on;
  const hasProg = typeof b.now === "number" && typeof b.goal === "number";
  return (
    <div
      className={"wv-card" + (claimable ? " click" : "")}
      onClick={claimable ? onClaim : undefined}
      style={{
        position: "relative", background: "#fff", borderRadius: 18,
        border: "2px solid " + (claimable ? "#E0552E" : b.on ? "#FFE7DD" : "#F0E6DE"),
        padding: "22px 18px 18px", textAlign: "center",
        boxShadow: claimable ? "0 8px 22px rgba(224,85,46,0.16)" : "none",
        cursor: claimable ? "pointer" : "default",
      }}
    >
      {claimable && <span style={{ position: "absolute", top: 11, right: 11, fontSize: 11, fontWeight: 800, color: "#fff", background: "#E0552E", borderRadius: 999, padding: "3px 9px" }}>可領碼</span>}
      <div style={{
        width: 70, height: 70, borderRadius: "50%", margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: b.on ? (b.claim ? "linear-gradient(135deg,#FFB38F,#E0552E)" : "linear-gradient(135deg,#FFE0D2,#FFF4EF)") : "#EFECE8",
        border: "2px solid " + (b.on ? "#FFD6C7" : "#E4D7CC"),
        boxShadow: claimable ? "0 6px 14px rgba(224,85,46,0.3)" : "none",
      }}>
        <ELIcon name={b.on ? b.ic : "lock"} size={34} color={b.on ? (b.claim ? "#fff" : "#F26B43") : "#A89C92"} />
      </div>
      <div style={{ marginTop: 12, fontSize: 17, fontWeight: 800, color: b.on ? "#241F1B" : "#8A7E74" }}>{b.nm}</div>
      {b.on ? (
        b.claim ? (
          <div style={{ marginTop: 9, display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 999, background: "#FFF4EF", color: "#B23F1E", fontSize: 13, fontWeight: 800 }}>
            <ELIcon name="gift" size={15} color="#F26B43" /> 點我領取核銷碼
          </div>
        ) : (
          <div style={{ marginTop: 9, display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, background: "#E7F4EC", color: "#2E7D52", fontSize: 13, fontWeight: 800 }}>
            <ELIcon name="check" size={14} color="#2E7D52" /> 已解鎖
          </div>
        )
      ) : (
        <div style={{ marginTop: 10 }}>
          {hasProg && (
            <div style={{ height: 7, borderRadius: 4, background: "#FFE7DD", overflow: "hidden", marginBottom: 7 }}>
              <div style={{ width: Math.min(100, Math.round((b.now! / b.goal!) * 100)) + "%", height: "100%", background: "#E0552E" }} />
            </div>
          )}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#6E645C", lineHeight: 1.5 }}>{b.cond}</div>
          {hasProg && <div style={{ marginTop: 5, fontSize: 13, fontWeight: 800, color: "#B23F1E" }}>已累計 {b.now} / {b.goal}</div>}
          {b.pts > 0 && (
            <div style={{ marginTop: 7, display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, background: "#F1EEEB", color: "#8A7E74", fontSize: 12, fontWeight: 800 }}>
              <ELIcon name="coin" size={13} color="#A89C92" /> 解鎖可得 {b.pts} 點
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BadgesWall() {
  const [modal, setModal] = useState<Badge | null>(null);
  const all = [...CLAIM_BADGES, ...BADGES];
  const collected = all.filter((b) => b.on).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#241F1B" }}>成就徽章</h2>
        <span style={{ fontSize: 15, color: "#6E645C", fontWeight: 700 }}>已收集 {collected} / {all.length}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16 }}>
        {all.map((b) => <BadgeTile key={b.nm} b={b} onClaim={() => setModal(b)} />)}
      </div>
      {modal && <CodeModal badge={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
