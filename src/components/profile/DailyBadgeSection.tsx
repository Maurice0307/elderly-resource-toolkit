"use client";

import { useState } from "react";
import { useDailySearch } from "@/contexts/DailySearchContext";

const CAP = 3;
const BADGE = { label: "社區百事通", code: "777 999", emoji: "🏅" };

export function DailyBadgeSection() {
  const { count } = useDailySearch();
  const [modalOpen, setModalOpen] = useState(false);
  const earned = count >= CAP;

  return (
    <>
      {/* 每日查找進度卡 */}
      <div
        style={{
          margin: "14px 0 0",
          background: earned ? "var(--success-soft)" : "var(--cta-soft)",
          borderRadius: 18,
          border: `1px solid ${earned ? "var(--success)" : "var(--bg-peach)"}`,
          padding: "14px 16px",
        }}
      >
        <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
          今日有效查找
        </div>
        {/* 進度條 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {Array.from({ length: CAP }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 999,
                background: i < count ? (earned ? "var(--success)" : "var(--cta)") : "rgba(0,0,0,0.10)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 800, color: earned ? "var(--success)" : "var(--cta-ink)" }}>
            {count}/{CAP} {earned ? "完成！" : "繼續查找長照資源"}
          </span>
          {earned && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "var(--success)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "5px 13px",
                fontSize: "0.8125rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {BADGE.emoji} {BADGE.label}
            </button>
          )}
        </div>
      </div>

      {/* ClaimCodeModal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(36,31,27,0.60)",
            padding: "0 0 env(safe-area-inset-bottom)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 430,
              background: "#fff",
              borderRadius: "28px 28px 0 0",
              padding: "28px 24px 32px",
              textAlign: "center",
            }}
          >
            {/* 拖曳把手 */}
            <div style={{ width: 40, height: 4, background: "var(--border-strong)", borderRadius: 999, margin: "0 auto 20px" }} />

            <div style={{ fontSize: 52, marginBottom: 8 }}>{BADGE.emoji}</div>
            <h2
              id="claim-modal-title"
              style={{ margin: "0 0 6px", fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)" }}
            >
              {BADGE.label}
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
              今日查找 3/3 達標，領取專屬優惠碼！
            </p>

            {/* 大號密碼 */}
            <div
              style={{
                background: "var(--cta-soft)",
                borderRadius: 18,
                padding: "22px 16px",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.05em" }}>
                優惠碼
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  fontFamily: "monospace",
                  letterSpacing: "0.15em",
                  color: "var(--cta-ink)",
                }}
              >
                {BADGE.code}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              style={{
                width: "100%",
                background: "var(--cta)",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                height: 52,
                fontSize: "1.0625rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              收下，謝謝！
            </button>
          </div>
        </div>
      )}
    </>
  );
}
