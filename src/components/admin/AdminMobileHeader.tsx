"use client";

import { usePathname, useRouter } from "next/navigation";

const TITLES: { match: string; title: string }[] = [
  { match: "/admin/resources/new", title: "新增資源" },
  { match: "/admin/resources/import", title: "批量匯入" },
  { match: "/admin/resources", title: "資源管理" },
  { match: "/admin/questions", title: "問答管理" },
  { match: "/admin/reports", title: "問題回報" },
  { match: "/admin/chats", title: "聊天" },
  { match: "/admin/news", title: "新聞管理" },
  { match: "/admin/users", title: "用戶管理" },
];

/* 後台子頁的手機版深色返回列（/admin 概覽用 MobileAdminConsole 自帶頭列，這裡不顯示） */
export function AdminMobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/admin") return null;

  const title = TITLES.find((t) => pathname.startsWith(t.match))?.title ?? "社區管理";

  return (
    <div className="wv-mobile-only wv-admin-fullbleed" style={{ background: "#241F1B", padding: "8px 14px 12px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => router.push("/admin")} aria-label="返回" style={{ width: 38, height: 38, borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>社區管理</div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, background: "rgba(224,85,46,0.22)", color: "#FFB59A", fontSize: 12, fontWeight: 800 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "#F26B43" }} /> 管理模式
        </div>
      </div>
    </div>
  );
}
