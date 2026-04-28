import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";

export default async function AdminDashboard() {
  await requireRole("moderator");
  const admin = createAdminClient();

  const [
    { count: pendingResources },
    { count: activeResources },
    { count: openQuestions },
    { count: totalUsers },
  ] = await Promise.all([
    admin.from("resources").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("resources").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("questions").select("id", { count: "exact", head: true }).eq("status", "open"),
    admin.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "待審核資源", value: pendingResources ?? 0, color: "#B45309", bg: "#FEF3C7", urgent: (pendingResources ?? 0) > 0 },
    { label: "已上架資源", value: activeResources ?? 0, color: "#065F46", bg: "#ECFDF5", urgent: false },
    { label: "開放中問題", value: openQuestions ?? 0, color: "#0369A1", bg: "#E0F2FE", urgent: false },
    { label: "註冊用戶", value: totalUsers ?? 0, color: "#7E22CE", bg: "#F3E8FF", urgent: false },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
        概覽
      </h1>

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <li
            key={s.label}
            className="rounded-2xl p-6 text-center"
            style={{ background: s.bg, border: s.urgent ? `2px solid ${s.color}` : "2px solid transparent" }}
          >
            <p className="text-5xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="mt-2 text-lg font-semibold" style={{ color: s.color }}>
              {s.label}
            </p>
            {s.urgent && (
              <p className="mt-1 text-sm font-bold animate-pulse" style={{ color: s.color }}>
                需要處理
              </p>
            )}
          </li>
        ))}
      </ul>

      <div
        className="mt-8 rounded-2xl p-6 text-lg"
        style={{ background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
      >
        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>快速指引</p>
        <ul className="mt-3 list-inside list-disc space-y-1">
          <li>待審核資源需到「資源審核」頁面處理</li>
          <li>不當問答可在「問答管理」頁面下架</li>
          <li>指派地區管理員請至「用戶管理」（超級管理員限定）</li>
        </ul>
      </div>
    </div>
  );
}
