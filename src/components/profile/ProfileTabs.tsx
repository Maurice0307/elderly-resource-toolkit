"use client";

import { useState } from "react";
import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";
import { BadgesWall } from "./BadgesWall";

type Tab = "info" | "badges" | "saved";

const TABS: { key: Tab; label: string }[] = [
  { key: "info",   label: "個人資訊" },
  { key: "badges", label: "成就徽章" },
  { key: "saved",  label: "我的收藏" },
];

type Stat = { label: string; value: string };
type InfoField = { label: string; value: string };

export function ProfileTabs({
  stats,
  infoFields,
  savedCount,
}: {
  stats: Stat[];
  infoFields: InfoField[];
  savedCount: number;
}) {
  const [tab, setTab] = useState<Tab>("info");

  return (
    <div>
      {/* Tab 列 */}
      <div style={{ display: "flex", borderBottom: "2px solid #F0E6DE", marginBottom: 28 }}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                border: "none", background: "none", cursor: "pointer", font: "inherit",
                padding: "14px 22px", fontSize: 16, fontWeight: 800,
                color: on ? "#B23F1E" : "#9B8E85",
                borderBottom: `2.5px solid ${on ? "#E0552E" : "transparent"}`,
                marginBottom: -2,
                transition: "color .15s, border-color .15s",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 個人資訊 */}
      {tab === "info" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
          {infoFields.map((f) => (
            <div key={f.label} style={{ background: "#fff", border: "1px solid #F0E6DE", borderRadius: 16, padding: "18px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#9B8E85", marginBottom: 6 }}>{f.label}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#241F1B" }}>{f.value}</div>
            </div>
          ))}
          <div style={{ background: "#fff", border: "1px solid #F0E6DE", borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#9B8E85", marginBottom: 6 }}>活動數據</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {stats.map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#B23F1E" }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#9B8E85", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/profile/edit"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#E0552E", color: "#fff", borderRadius: 999, height: 50,
              fontSize: 16, fontWeight: 800, textDecoration: "none",
              boxShadow: "0 6px 16px rgba(224,85,46,0.26)", gridColumn: "1/-1",
            }}
          >
            <ELIcon name="user" size={18} color="#fff" /> 編輯個人資料
          </Link>
        </div>
      )}

      {/* 成就徽章 */}
      {tab === "badges" && <BadgesWall />}

      {/* 我的收藏 */}
      {tab === "saved" && (
        <div>
          {savedCount === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <ELIcon name="heart" size={48} color="#E4D7CC" style={{ margin: "0 auto 16px" }} />
              <p style={{ fontSize: 18, fontWeight: 700, color: "#574E47" }}>還沒有收藏</p>
              <p style={{ fontSize: 15, color: "#9B8E85", margin: "8px 0 24px" }}>到資源查找頁，點愛心加入收藏。</p>
              <Link href="/resources" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#E0552E", color: "#fff", borderRadius: 999, height: 48, padding: "0 28px",
                fontSize: 16, fontWeight: 800, textDecoration: "none",
              }}>
                去找資源
              </Link>
            </div>
          ) : (
            <Link href="/profile/favorites" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#E0552E", color: "#fff", borderRadius: 999, height: 48, padding: "0 28px",
              fontSize: 16, fontWeight: 800, textDecoration: "none",
            }}>
              <ELIcon name="heart" size={18} color="#fff" /> 查看全部 {savedCount} 項收藏
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
