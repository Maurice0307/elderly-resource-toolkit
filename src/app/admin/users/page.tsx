import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { setUserRole } from "@/lib/admin/actions";

export default async function AdminUsersPage() {
  const { user: caller, role: callerRole } = await requireRole("admin");
  if (callerRole !== "admin") return null;

  const admin = createAdminClient();

  const { data: users } = await admin
    .from("profiles")
    .select("id, display_name, role, points, created_at")
    .order("role")
    .order("created_at", { ascending: false })
    .limit(100);

  const roleLabel: Record<string, { label: string; bg: string; color: string }> = {
    user:      { label: "一般用戶",   bg: "#F5F0E8", color: "#78716C" },
    moderator: { label: "地區管理員", bg: "#E0F2FE", color: "#0369A1" },
    admin:     { label: "超級管理員", bg: "#FEF3C7", color: "#92400E" },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
        用戶管理
      </h1>
      <p className="mt-1 text-lg" style={{ color: "var(--text-secondary)" }}>
        僅超級管理員可見。調整角色後立即生效。
      </p>

      <ul className="mt-6 space-y-3">
        {(users ?? []).map((u) => {
          const info = roleLabel[u.role] ?? roleLabel.user;
          const isSelf = u.id === caller.id;
          return (
            <li
              key={u.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl p-5"
              style={{ background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold"
                style={{ background: "var(--cta)", color: "var(--cta-on)" }}
              >
                {(u.display_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {u.display_name ?? "（未設定名稱）"}
                  {isSelf && (
                    <span className="ml-2 text-sm font-normal" style={{ color: "var(--text-muted)" }}>
                      （你）
                    </span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-sm font-semibold"
                    style={{ background: info.bg, color: info.color }}
                  >
                    {info.label}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    積分 {u.points}
                  </span>
                </div>
              </div>

              {/* Role change buttons — don't show for self */}
              {!isSelf && (
                <div className="flex flex-wrap gap-2 shrink-0">
                  {u.role !== "user" && (
                    <form action={setUserRole.bind(null, u.id, "user")}>
                      <button
                        type="submit"
                        className="rounded-full px-4 py-2 text-base font-semibold"
                        style={{ background: "#F5F0E8", color: "#78716C", border: "1.5px solid #E7E5E4" }}
                      >
                        設為一般
                      </button>
                    </form>
                  )}
                  {u.role !== "moderator" && (
                    <form action={setUserRole.bind(null, u.id, "moderator")}>
                      <button
                        type="submit"
                        className="rounded-full px-4 py-2 text-base font-semibold"
                        style={{ background: "#E0F2FE", color: "#0369A1", border: "1.5px solid #BAE6FD" }}
                      >
                        設為管理員
                      </button>
                    </form>
                  )}
                  {u.role !== "admin" && (
                    <form action={setUserRole.bind(null, u.id, "admin")}>
                      <button
                        type="submit"
                        className="rounded-full px-4 py-2 text-base font-semibold"
                        style={{ background: "#FEF3C7", color: "#92400E", border: "1.5px solid #FDE68A" }}
                      >
                        設為超管
                      </button>
                    </form>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
