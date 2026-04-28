import Link from "next/link";
import { requireRole } from "@/lib/auth/requireRole";

export const metadata = { title: "後台管理" };

const navItems = [
  { href: "/admin", label: "📊 概覽", exact: true },
  { href: "/admin/resources", label: "📦 資源審核" },
  { href: "/admin/questions", label: "💬 問答管理" },
  { href: "/admin/users", label: "👥 用戶管理", adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, displayName } = await requireRole("moderator");

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-page)" }}>
      {/* Admin top bar */}
      <div
        className="sticky top-0 z-30 flex items-center gap-4 px-5 py-3"
        style={{ background: "#1C1917", color: "#FDE68A" }}
      >
        <Link href="/" className="shrink-0 text-lg font-bold" style={{ color: "#FDE68A" }}>
          ← 前台
        </Link>
        <span className="text-lg font-bold" style={{ color: "#FFFBEB" }}>
          後台管理
        </span>
        <span
          className="ml-auto rounded-full px-3 py-1 text-sm font-semibold"
          style={
            role === "admin"
              ? { background: "var(--cta)", color: "var(--cta-on)" }
              : { background: "#374151", color: "#D1D5DB" }
          }
        >
          {role === "admin" ? "超級管理員" : "地區管理員"} · {displayName}
        </span>
      </div>

      {/* Nav tabs */}
      <nav
        className="flex gap-1 overflow-x-auto px-5 py-3"
        style={{ background: "#292524", borderBottom: "1px solid #3F3A38" }}
      >
        {navItems
          .filter((item) => !item.adminOnly || role === "admin")
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-xl px-5 py-2 text-lg font-semibold transition"
              style={{ color: "#D6D3D1" }}
            >
              {item.label}
            </Link>
          ))}
      </nav>

      <div className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
