import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { approveResource, rejectResource, markResourceEnded } from "@/lib/admin/actions";
import { ResourceReviewPanel } from "@/components/admin/ResourceReviewPanel";

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

  const { data: rawResources, error: resourcesError } = await admin
    .from("resources")
    .select("id, name, summary, description, phone, address, website_url, tags, scope, status, created_at, submitted_by, subcategory_id")
    .eq("status", status)
    .order("created_at", { ascending: true })
    .limit(50);

  const resources = rawResources ?? [];

  // Batch-fetch subcategory names
  const subcatIds = [...new Set(resources.map((r) => r.subcategory_id).filter(Boolean))] as string[];
  const subcatMap: Record<string, string> = {};
  if (subcatIds.length > 0) {
    const { data: subcats } = await admin
      .from("subcategories")
      .select("id, name")
      .in("id", subcatIds);
    for (const s of subcats ?? []) subcatMap[s.id] = s.name;
  }

  // Batch-fetch submitter display names
  const submitterIds = [...new Set(resources.map((r) => r.submitted_by).filter(Boolean))] as string[];
  const submitterMap: Record<string, string> = {};
  if (submitterIds.length > 0) {
    const { data: submitterProfiles } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", submitterIds);
    for (const p of submitterProfiles ?? []) {
      submitterMap[p.id] = p.display_name ?? "匿名";
    }
  }

  const tabs = ["pending", "active", "ended", "archived"];

  return (
    <div>
      <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
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

      {resourcesError && (
        <div className="mt-4 rounded-xl p-4 text-sm font-mono" style={{ background: "#FEE2E2", color: "#DC2626" }}>
          查詢錯誤：{resourcesError.message}
        </div>
      )}

      {resources.length === 0 ? (
        <div
          className="mt-8 rounded-2xl p-10 text-center text-xl"
          style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
        >
          目前沒有「{statusMap[status]?.label}」狀態的資源
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {resources.map((r) => {
            const subcatName = subcatMap[r.subcategory_id ?? ""] ?? null;
            const submitterName = submitterMap[r.submitted_by ?? ""] ?? "匿名";
            return (
              <li
                key={r.id}
                className="rounded-2xl p-6"
                style={{ background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2">
                      {subcatName && (
                        <span
                          className="rounded-full px-3 py-1 text-sm font-semibold"
                          style={{ background: "#F5F0E8", color: "#78716C" }}
                        >
                          {subcatName}
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
                    <h2 className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {r.name}
                    </h2>
                    {r.summary && (
                      <p className="mt-1 text-lg" style={{ color: "var(--text-secondary)" }}>
                        {r.summary}
                      </p>
                    )}
                    <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                      投稿者：{submitterName} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("zh-TW")}
                    </p>
                  </div>

                  {/* Quick actions (non-pending) */}
                  <div className="flex flex-wrap gap-2 shrink-0">
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
                    {r.status === "pending" && (
                      <form action={rejectResource.bind(null, r.id)}>
                        <button
                          type="submit"
                          className="rounded-full px-4 py-2 text-base font-semibold"
                          style={{ background: "#FEE2E2", color: "#DC2626", border: "1.5px solid #FCA5A5" }}
                        >
                          ✗ 直接拒絕
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* AI review panel — pending only */}
                {r.status === "pending" && (
                  <ResourceReviewPanel resource={r as Parameters<typeof ResourceReviewPanel>[0]["resource"]} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
