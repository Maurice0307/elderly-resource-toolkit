"use client";

import { useEffect, useState } from "react";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";
import { ELIcon } from "@/components/layout/ELIcon";

const ITEMS = [
  { key: "qa", icon: "qa", t: "問答有新回覆", d: "您發問的問題有人回答時通知您" },
  { key: "news", icon: "news", t: "今日新知更新", d: "有新的健康、補助、防詐消息時提醒" },
  { key: "activity", icon: "sparkle", t: "新的互動圖卡", d: "推出新的學習圖卡時通知" },
  { key: "proposal", icon: "send", t: "提案進度", d: "您的提案被採納或有新進度時通知" },
  { key: "line", icon: "chat", t: "用 LINE 接收通知", d: "重要通知也傳到您的 LINE" },
];

export default function NotificationsPage() {
  const [on, setOn] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("el_notify") || "null");
      setOn(saved && typeof saved === "object" ? saved : Object.fromEntries(ITEMS.map((i) => [i.key, true])));
    } catch {
      setOn(Object.fromEntries(ITEMS.map((i) => [i.key, true])));
    }
  }, []);

  const toggle = (k: string) => {
    setOn((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      try { localStorage.setItem("el_notify", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="wv-fade" style={{ background: "#FAF6F2", minHeight: "100%" }}>
      <MobileSubHeader title="通知設定" search={false} />

      <div style={{ padding: "14px 18px 28px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ margin: "0 0 14px", fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>選擇您想收到哪些通知，隨時都能調整。</p>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "2px 16px" }}>
          {ITEMS.map((it, i) => (
            <div key={it.key} style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 0", borderTop: i === 0 ? "none" : "1px solid #F0E6DE" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name={it.icon} size={21} color="#F26B43" /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#241F1B" }}>{it.t}</div>
                <div style={{ fontSize: 13, color: "#6E645C", marginTop: 1, lineHeight: 1.5 }}>{it.d}</div>
              </div>
              <button
                onClick={() => toggle(it.key)}
                role="switch"
                aria-checked={!!on[it.key]}
                aria-label={it.t}
                style={{ flexShrink: 0, width: 52, height: 30, borderRadius: 999, border: "none", cursor: "pointer", padding: 3, background: on[it.key] ? "#1E9E54" : "#D6CCC2", transition: "background .15s", display: "flex", justifyContent: on[it.key] ? "flex-end" : "flex-start" }}
              >
                <span style={{ width: 24, height: 24, borderRadius: 999, background: "#fff", display: "block", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
              </button>
            </div>
          ))}
        </div>

        <p style={{ margin: "14px 2px 0", fontSize: 12.5, color: "#9C8E84", lineHeight: 1.7 }}>
          設定會記在這個裝置上。實際推播通知功能會在後續版本開放。
        </p>
      </div>
    </div>
  );
}
