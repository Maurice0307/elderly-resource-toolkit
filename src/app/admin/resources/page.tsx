import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { approveResource, rejectResource, markResourceEnded } from "@/lib/admin/actions";

const statusMap: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: "待審核", bg: "#FEF3C7", color: "#92400E" },
  active:   { label: "已上架", bg: "#ECFDF5", color: "#065F46" },
  ended:    { label: "已結束", bg: "#F5F5F4", color: "#78716C" },
  archived: { label: "已封存", bg: "#F5F5F4", color: "#78716C" },
};

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("moderator");
  const { status = "pending" } = await searchParams;
  const admin = createAdminClient();

  const { data } = await admin
    .from("resources")
    .select("id, name, summary, scope, status, created_at, subcategory:subcategories(name), submitter:profiles!submitted_by(display_name)")
    .eq("status", status)
    .order("created_at", { ascending: true })
    .limit(50);

  const resources = data ?? [];

  const tabs = ["pending", "active", "ended", "archived"];

  return (
    <div>
      <h1 className="text-3xl font-bold" style={{ color: "#1C1917" }}>
        資源審核
      </h1>

      {/* Status tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {tabs.map((s) => {
          const info = statusMap[s];
          return (
            <a
              key={s}
              href={`/admin/resources?status=${s}`}
              className="shrink-0 rounded-full px-5 py-2 text-base font-semibold transition"
              style={
                status === s
                  ? { background: info.color, color: "#FFFFFF" }
                  : { background: info.bg, color: info.color, border: `1.5px solid ${info.color}40` }
              }
            >
              {info.label}
            </a>
          );
        })}
      </div>

      {resources.length === 0 ? (
        <div
          className="mt-8 rounded-2xl p-10 text-center text-xl"
          style={{ background: "#F5F0E8", color: "#78716C" }}
        >
          目前沒有「{statusMap[status]?.label}」狀態的資源
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {resources.map((r) => {
            const sub = Array.isArray(r.subcategory) ? r.subcategory[0] : r.subcategory;
            const submitter = Array.isArray(r.submitter) ? r.submitter[0] : r.submitter;
            return (
              <li
                key={r.id}
                className="rounded-2xl bg-white p-6"
                style={{ border: "2px solid #E7E5E4" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2">
                      {sub && (
                        <span
                          className="rounded-full px-3 py-1 text-sm font-semibold"
                          style={{ background: "#F5F0E8", color: "#78716C" }}
                        >
                          {sub.name}
                        </span>
                      )}
                      <span
                        className="rounded-full px-3 py-1 text-sm"
                        style={
                          r.scope === "national"
                            ? { background: "#FEF3C7", color: "#92400E" }
                            : { background: "#ECFDF5", color: "#065F46" }
                        }
                      >
                        {r.scope === "national" ? "全國" : "在地"}
                      </span>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold" style={{ color: "#1C1917" }}>
                      {r.name}
                    </h2>
                    {r.summary && (
                      <p className="mt-1 text-lg" style={{ color: "#57534E" }}>
                        {r.summary}
                      </p>
                    )}
                    <p className="mt-2 text-sm" style={{ color: "#A8A29E" }}>
                      投稿者：{submitter?.display_name ?? "匿名"} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("zh-TW")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <a
                      href={`/resources/health/${r.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full px-4 py-2 text-base font-semibold"
                      style={{ background: "#F5F0E8", color: "#78716C", border: "1.5px solid #E7E5E4" }}
                    >
                      預覽
                    </a>
                    {r.status === "pending" && (
                      <>
                        <form action={approveResource.bind(null, r.id)}>
                          <button
                            type="submit"
                            className="rounded-full px-4 py-2 text-base font-bold text-white"
                            style={{ background: "#065F46" }}
                          >
                            ✅ 核准
                          </button>
                        </form>
                        <form action={rejectResource.bind(null, r.id)}>
                          <button
                            type="submit"
                            className="rounded-full px-4 py-2 text-base font-bold text-white"
                            style={{ background: "#DC2626" }}
                          >
                            ✗ 拒絕
                          </button>
                        </form>
                      </>
                    )}
                    {r.status === "active" && (
                      <form action={markResourceEnded.bind(null, r.id)}>
                        <button
                          type="submit"
                          className="rounded-full px-4 py-2 text-base font-semibold"
                          style={{ background: "#FEF3C7", color: "#92400E", border: "1.5px solid #FDE68A" }}
                        >
                          標記結束
                        </button>
                      </form>
                    )}
                    {(r.status === "ended" || r.status === "archived") && (
                      <form action={approveResource.bind(null, r.id)}>
                        <button
                          type="submit"
                          className="rounded-full px-4 py-2 text-base font-semibold"
                          style={{ background: "#ECFDF5", color: "#065F46", border: "1.5px solid #6EE7B7" }}
                        >
                          重新上架
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
