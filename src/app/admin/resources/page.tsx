import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { DeleteResourceButton } from "@/components/admin/DeleteResourceButton";
import { approveResource, rejectResource, markResourceEnded } from "@/lib/admin/actions";

const STATUS_TABS = [
  { value: "active",   label: "已上架", bg: "#ECFDF5", color: "#065F46" },
  { value: "pending",  label: "待審核", bg: "#FEF3C7", color: "#92400E" },
  { value: "ended",    label: "已結束", bg: "#F5F5F4", color: "#78716C" },
  { value: "archived", label: "已封存", bg: "#F5F5F4", color: "#78716C" },
];

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole("moderator");
  const { status = "active", q = "" } = await searchParams;
  const admin = createAdminClient();

  // ── Fetch resources ──────────────────────────────────────────────────
  let query = admin
    .from("resources")
    .select("id, name, summary, phone, website_url, scope, status, created_at, subcategory_id, region_id")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) query = query.ilike("name", `%${q}%`);

  const { data: resources = [], error } = await query;

  // ── Subcategory + category lookup ────────────────────────────────────
  const subcatIds = [...new Set((resources ?? []).map((r) => r.subcategory_id).filter(Boolean))] as string[];
  const subcatMap: Record<string, { name: string; category_name: string }> = {};

  if (subcatIds.length > 0) {
    const { data: subcats } = await admin
      .from("subcategories")
      .select("id, name, category_id")
      .in("id", subcatIds);

    const catIds = [...new Set((subcats ?? []).map((s) => s.category_id).filter(Boolean))] as string[];
    const catMap: Record<string, string> = {};

    if (catIds.length > 0) {
      const { data: cats } = await admin.from("categories").select("id, name").in("id", catIds);
      for (const c of cats ?? []) catMap[c.id] = c.name;
    }
    for (const s of subcats ?? []) {
      subcatMap[s.id] = { name: s.name, category_name: catMap[s.category_id] ?? "" };
    }
  }

  // ── Region lookup ────────────────────────────────────────────────────
  const regionIds = [...new Set((resources ?? []).map((r) => r.region_id).filter(Boolean))] as string[];
  const regionMap: Record<string, string> = {};
  if (regionIds.length > 0) {
    const { data: regs } = await admin.from("regions").select("id, name").in("id", regionIds);
    for (const r of regs ?? []) regionMap[r.id] = r.name;
  }

  // ── Pending count for badge ──────────────────────────────────────────
  const { count: pendingCount } = await admin
    .from("resources")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const currentTab = STATUS_TABS.find((t) => t.value === status) ?? STATUS_TABS[0];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          資源管理
        </h1>
        <Link
          href="/admin/resources/new"
          className="rounded-xl px-5 py-2.5 text-base font-bold transition"
          style={{ background: "var(--cta)", color: "var(--cta-on)" }}
        >
          ＋ 新增資源
        </Link>
      </div>

      {/* Status tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/resources?status=${tab.value}`}
            className="relative shrink-0 rounded-full px-5 py-2 text-base font-semibold transition"
            style={
              status === tab.value
                ? { background: tab.color, color: "#FFFFFF" }
                : { background: tab.bg, color: tab.color, border: `1.5px solid ${tab.color}40` }
            }
          >
            {tab.label}
            {tab.value === "pending" && (pendingCount ?? 0) > 0 && (
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ background: "#DC2626", color: "#fff" }}
              >
                {pendingCount}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* Search bar */}
      <form method="GET" className="mt-4 flex gap-2">
        <input type="hidden" name="status" value={status} />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="搜尋資源名稱…"
          className="flex-1 rounded-xl border px-4 py-2 text-base"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <button
          type="submit"
          className="rounded-xl px-5 py-2 font-semibold"
          style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
        >
          搜尋
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl p-4 text-sm font-mono" style={{ background: "#FEE2E2", color: "#DC2626" }}>
          查詢錯誤：{error.message}
        </div>
      )}

      {/* Summary */}
      <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
        共 {resources?.length ?? 0} 筆「{currentTab.label}」資源
        {q && `（搜尋：${q}）`}
      </p>

      {/* Table */}
      {(resources?.length ?? 0) === 0 ? (
        <div
          className="mt-8 rounded-2xl p-10 text-center text-xl"
          style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
        >
          目前沒有「{currentTab.label}」資源
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl" style={{ border: "1.5px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)", borderBottom: "1.5px solid var(--border)" }}>
                {["分類", "範圍／地區", "名稱", "摘要", "電話", "網址", "操作"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(resources ?? []).map((r, i) => {
                const subcat = subcatMap[r.subcategory_id ?? ""];
                const regionName = regionMap[r.region_id ?? ""] ?? null;
                const isEven = i % 2 === 0;

                return (
                  <tr
                    key={r.id}
                    style={{
                      background: isEven ? "var(--bg-elevated)" : "var(--bg-page)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {/* 分類 */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {subcat ? (
                        <div>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {subcat.category_name}
                          </span>
                          <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {subcat.name}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* 範圍 */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={
                          r.scope === "national"
                            ? { background: "#FEF3C7", color: "#92400E" }
                            : { background: "#ECFDF5", color: "#065F46" }
                        }
                      >
                        {r.scope === "national" ? "全國" : "在地"}
                      </span>
                      {regionName && (
                        <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          {regionName}
                        </div>
                      )}
                    </td>

                    {/* 名稱 */}
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)", minWidth: 160 }}>
                      {r.name}
                    </td>

                    {/* 摘要 */}
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)", minWidth: 200 }}>
                      {r.summary ? (
                        <span title={r.summary}>
                          {r.summary.length > 50 ? r.summary.slice(0, 50) + "…" : r.summary}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* 電話 */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-sm" style={{ color: "var(--text-primary)" }}>
                      {r.phone ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>

                    {/* 網址 */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.website_url ? (
                        <a
                          href={r.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline"
                          style={{ color: "var(--cta)" }}
                        >
                          連結 ↗
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* 操作 */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/resources/${r.id}/edit`}
                          className="rounded-lg px-3 py-1.5 text-sm font-semibold transition"
                          style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
                        >
                          編輯
                        </Link>

                        {/* Status quick-actions */}
                        {r.status === "active" && (
                          <form action={markResourceEnded.bind(null, r.id)}>
                            <button
                              type="submit"
                              className="rounded-lg px-3 py-1.5 text-sm font-semibold"
                              style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}
                            >
                              結束
                            </button>
                          </form>
                        )}
                        {r.status === "pending" && (
                          <>
                            <form action={approveResource.bind(null, r.id)}>
                              <button
                                type="submit"
                                className="rounded-lg px-3 py-1.5 text-sm font-semibold"
                                style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #6EE7B7" }}
                              >
                                上架
                              </button>
                            </form>
                            <form action={rejectResource.bind(null, r.id)}>
                              <button
                                type="submit"
                                className="rounded-lg px-3 py-1.5 text-sm font-semibold"
                                style={{ background: "#FEE2E2", color: "#DC2626", border: "1px solid #FCA5A5" }}
                              >
                                拒絕
                              </button>
                            </form>
                          </>
                        )}
                        {(r.status === "ended" || r.status === "archived") && (
                          <form action={approveResource.bind(null, r.id)}>
                            <button
                              type="submit"
                              className="rounded-lg px-3 py-1.5 text-sm font-semibold"
                              style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #6EE7B7" }}
                            >
                              重新上架
                            </button>
                          </form>
                        )}

                        <DeleteResourceButton resourceId={r.id} resourceName={r.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
