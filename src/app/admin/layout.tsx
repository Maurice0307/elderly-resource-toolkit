import Link from "next/link";
import { requireRole } from "@/lib/auth/requireRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminMobileHeader } from "@/components/admin/AdminMobileHeader";
import { ELIcon } from "@/components/layout/ELIcon";

export const metadata = { title: "後台管理" };

const navItems = [
  { href: "/admin", label: "概覽", icon: "grid", exact: true },
  { href: "/admin/resources", label: "資源管理", icon: "news" },
  { href: "/admin/questions", label: "問答管理", icon: "qa" },
  { href: "/admin/reports", label: "問題回報", icon: "flag" },
  { href: "/admin/news", label: "新聞管理", icon: "megaphone", adminOnly: true },
  { href: "/admin/users", label: "用戶管理", icon: "social", adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, displayName } = await requireRole("moderator");

  // 通知徽章：待審資源 + 待查證問答
  const admin = createAdminClient();
  const [{ count: pendingResources }, { count: verifyCount }, { count: openReports }] = await Promise.all([
    admin.from("resources").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("questions").select("id", { count: "exact", head: true }).eq("status", "open").gt("answer_count", 0).is("accepted_answer_id", null),
    admin.from("content_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);
  const badges: Record<string, number> = {
    "/admin/resources": pendingResources ?? 0,
    "/admin/questions": verifyCount ?? 0,
    "/admin/reports": openReports ?? 0,
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#FAF6F2" }}>
      {/* Admin top bar（手機版用 MobileAdminConsole 自帶頭列，這裡隱藏）— 兩行排版避免文字重疊 */}
      <div
        className="wv-desktop-only sticky top-0 z-30 flex flex-col gap-2 px-6 py-3"
        style={{ background: "#1C1917" }}
      >
        {/* 第一行：回前台 + 身分 */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-base font-bold transition"
            style={{ color: "#E7E0DB", border: "1.5px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.06)" }}
          >
            <ELIcon name="chevron" size={16} color="#E7E0DB" /> 回前台
          </Link>
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
            style={
              role === "admin"
                ? { background: "var(--cta)", color: "var(--cta-on)" }
                : { background: "#374151", color: "#D1D5DB" }
            }
          >
            <ELIcon name="user" size={14} color={role === "admin" ? "#fff" : "#D1D5DB"} />
            {role === "admin" ? "超級管理員" : "地區管理員"} · {displayName}
          </span>
        </div>
        {/* 第二行：後台管理標題 */}
        <div className="flex items-center gap-2">
          <span style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#F2764F,#E0552E)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <ELIcon name="shield" size={18} color="#fff" />
          </span>
          <span className="text-xl font-extrabold" style={{ color: "#FFFBEB" }}>後台管理</span>
        </div>
      </div>

      {/* Nav tabs */}
      <nav
        className="wv-desktop-only flex gap-1 overflow-x-auto px-5 py-3"
        style={{ background: "#292524", borderBottom: "1px solid #3F3A38" }}
      >
        {navItems
          .filter((item) => !item.adminOnly || role === "admin")
          .map((item) => {
            const badge = badges[item.href] ?? 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2 text-lg font-semibold transition"
                style={{ color: "#E7E0DB" }}
              >
                <ELIcon name={item.icon} size={19} color="#F2764F" />
                {item.label}
                {badge > 0 && (
                  <span style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, background: "#E0552E", color: "#fff", fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>
                )}
              </Link>
            );
          })}
      </nav>

      <div className="wv-admin-body flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-[1480px]">
          <AdminMobileHeader />
          {children}
        </div>
      </div>
    </div>
  );
}
