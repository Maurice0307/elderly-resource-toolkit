"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";

/* 提醒使用者綁定其他登入方式（可關閉，記在 localStorage） */
export function BindReminder({ unlinked }: { unlinked: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (unlinked > 0 && localStorage.getItem("el-bind-dismissed") !== "1") setShow(true);
    } catch {}
  }, [unlinked]);

  if (!show) return null;

  const dismiss = () => {
    try { localStorage.setItem("el-bind-dismissed", "1"); } catch {}
    setShow(false);
  };

  return (
    <div style={{ margin: "12px 18px 0", background: "linear-gradient(120deg,#FFF4EF,#FFE7DD)", border: "1px solid #FFE0D2", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ELIcon name="link" size={20} color="#F26B43" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#241F1B" }}>綁定其他登入方式</div>
        <div style={{ fontSize: 12.5, color: "#6E645C", marginTop: 1, lineHeight: 1.5 }}>之後換手機、用不同方式登入，紀錄都找得回來。</div>
      </div>
      <Link href="/profile/edit" style={{ flexShrink: 0, background: "#E0552E", color: "#fff", borderRadius: 999, padding: "8px 14px", fontSize: 13.5, fontWeight: 800, textDecoration: "none" }}>去綁定</Link>
      <button onClick={dismiss} aria-label="關閉" style={{ flexShrink: 0, width: 28, height: 28, minHeight: 0, borderRadius: 999, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ELIcon name="close" size={16} color="#9C8E84" />
      </button>
    </div>
  );
}
