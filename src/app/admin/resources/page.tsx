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

const STAT_META: { key: string; label: string; color: string; bg: string; urgent?: boolean }[] = [
  { key: "active",   label: "已上架", color: "#065F46", bg: "#ECFDF5" },
  { key: "pending",  label: "待審核", color: "#92400E", bg: "#FEF3C7", urgent: true },
  { key: "ended",    label: "已結束", color: "#78716C", bg: "#F5F5F4" },
  { key: "archived", label: "已封存", color: "#78716C", bg: "#F5F5F4" },
];

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; cat?: string; reg?: string; dist?: string }>;
}) {
  await requireRole("moderator");
  const { status = "active", q = "", cat = "", reg = "", dist = "" } = await searchParams;
  const admin = createAdminClient();

  // ── Parallel setup: categories list, county regions list, status counts ──
  const [
    { data: allCategories },
    { data: allCounties },
    statResults,
  ] = await Promise.all([
    admin.from("categories").select("id, slug, name").order("sort_order"),
    admin.from("regions").select("id, name").eq("level", "county").order("name"),
    Promise.all(
      ["active", "pending", "ended", "archived"].map((s) =>
        admin.from("resources").select("*", { count: "exact", head: true }).eq("status", s),
      ),
    ),
  ]);

  // ── If county selected, load its districts for the sub-filter ───────────
  let countyDistricts: { id: string; name: string }[] = [];
  if (reg) {
    const { data: dists } = await admin
      .from("regions").select("id, name").eq("parent_id", reg).order("name");
    countyDistricts = dists ?? [];
  }

  const statCounts: Record<string, number> = {
    active:   statResults[0].count ?? 0,
    pending:  statResults[1].count ?? 0,
    ended:    statResults[2].count ?? 0,
    archived: statResults[3].count ?? 0,
  };

  // ── If category filter → resolve subcategory IDs first ──────────────────
  let subcatFilterIds: string[] | null = null;
  let skipMain = false;

  if (cat) {
    const catRow = (allCategories ?? []).find((c) => c.slug === cat);
    if (!catRow) {
      skipMain = true;
    } else {
      const { data: subs } = await admin
        .from("subcategories")
        .select("id")
        .eq("category_id", catRow.id);
      subcatFilterIds = (subs ?? []).map((s) => s.id);
      if (subcatFilterIds.length === 0) skipMain = true;
    }
  }

  // ── Main resources query ─────────────────────────────────────────────────
  let resources: {
    id: string; name: string; summary: string | null; phone: string | null;
    website_url: string | null; scope: string; status: string;
    created_at: string; subcategory_id: string | null; region_id: string | null;
  }[] = [];
  let queryError: { message: string } | null = null;

  if (!skipMain) {
    let query = admin
      .from("resources")
      .select("id, name, summary, phone, website_url, scope, status, created_at, subcategory_id, region_id")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(200);

    if (q)               query = query.ilike("name", `%${q}%`);
    if (subcatFilterIds) query = query.in("subcategory_id", subcatFilterIds);
    // District filter takes priority; county filter cascades to include all its districts
    if (dist) {
      query = query.eq("region_id", dist);
    } else if (reg) {
      const allRegionIds = [reg, ...countyDistricts.map((d) => d.id)];
      query = query.in("region_id", allRegionIds);
    }

    const { data, error } = await query;
    resources = data ?? [];
    queryError = error;
  }

  // ── Subcategory + category display lookup ────────────────────────────────
  const subcatIds = [...new Set(resources.map((r) => r.subcategory_id).filter(Boolean))] as string[];
  const subcatMap: Record<string, { name: string; category_name: string }> = {};

  if (subcatIds.length > 0) {
    const { data: subcats } = await admin
      .from("subcategories").select("id, name, category_id").in("id", subcatIds);
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

  // ── Region display lookup (with parent for districts) ────────────────────
  const regionIds = [...new Set(resources.map((r) => r.region_id).filter(Boolean))] as string[];
  const regionMap: Record<string, { name: string; parentName?: string }> = {};
  if (regionIds.length > 0) {
    const { data: regs } = await admin
      .from("regions").select("id, name, level, parent_id").in("id", regionIds);
    const parentIds = [...new Set((regs ?? []).filter(r => r.parent_id).map(r => r.parent_id))] as string[];
    const parentNameMap: Record<string, string> = {};
    if (parentIds.length > 0) {
      const { data: parents } = await admin.from("regions").select("id, name").in("id", parentIds);
      for (const p of parents ?? []) parentNameMap[p.id] = p.name;
    }
    for (const r of regs ?? []) {
      regionMap[r.id] = {
        name: r.name,
        parentName: r.parent_id ? parentNameMap[r.parent_id] : undefined,
      };
    }
  }

  const currentTab = STATUS_TABS.find((t) => t.value === status) ?? STATUS_TABS[0];

  // Build export URL with current filters (session-based, no token needed)
  const exportParams = new URLSearchParams();
  exportParams.set("status", status);
  if (q)    exportParams.set("q", q);
  if (cat)  exportParams.set("cat", cat);
  if (reg)  exportParams.set("reg", reg);
  if (dist) exportParams.set("dist", dist);
  const exportUrl = `/api/admin/resources/export-csv?${exportParams}`;

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          資源管理
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/resources/import"
            className="rounded-xl px-4 py-2 text-base font-semibold transition"
            style={{ background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            ↑ 批量匯入
          </Link>
          <a
            href={exportUrl}
            className="rounded-xl px-4 py-2 text-base font-semibold transition"
            style={{ background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            download
          >
            ↓ 匯出 CSV
          </a>
          <Link
            href="/admin/resources/new"
            className="rounded-xl px-5 py-2.5 text-base font-bold transition"
            style={{ background: "var(--cta)", color: "var(--cta-on)" }}
          >
            ＋ 新增資源
          </Link>
        </div>
      </div>

      {/* ── Stats cards ────────────────────────────────────────────────── */}
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_META.map(({ key, label, color, bg, urgent }) => (
          <li
            key={key}
            className="rounded-2xl p-4 text-center"
            style={{
              background: bg,
              border: urgent && (statCounts[key] ?? 0) > 0
                ? `2px solid ${color}`
                : "2px solid transparent",
            }}
          >
            <a href={`/admin/resources?status=${key}`} className="block">
              <p className="text-4xl font-bold" style={{ color }}>
                {statCounts[key] ?? 0}
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color }}>
                {label}
                {urgent && (statCounts[key] ?? 0) > 0 && (
                  <span className="ml-1 animate-pulse">🔴</span>
                )}
              </p>
            </a>
          </li>
        ))}
      </ul>

      {/* ── Status tabs ────────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const params = new URLSearchParams();
          params.set("status", tab.value);
          if (q)    params.set("q", q);
          if (cat)  params.set("cat", cat);
          if (reg)  params.set("reg", reg);
          if (dist) params.set("dist", dist);
          return (
            <a
              key={tab.value}
              href={`/admin/resources?${params}`}
              className="relative shrink-0 rounded-full px-5 py-2 text-base font-semibold transition"
              style={
                status === tab.value
                  ? { background: tab.color, color: "#FFFFFF" }
                  : { background: tab.bg, color: tab.color, border: `1.5px solid ${tab.color}40` }
              }
            >
              {tab.label}
              {tab.value === "pending" && (statCounts.pending ?? 0) > 0 && (
                <span
                  className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: "#DC2626", color: "#fff" }}
                >
                  {statCounts.pending}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <form method="GET" className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="status" value={status} />

        {/* Keyword search */}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="搜尋資源名稱…"
          className="min-w-0 flex-1 rounded-xl border px-4 py-2 text-base"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        />

        {/* Category filter */}
        <select
          name="cat"
          defaultValue={cat}
          className="rounded-xl border px-3 py-2 text-base"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          <option value="">全部分類</option>
          {(allCategories ?? []).map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Region filter — county */}
        <select
          name="reg"
          defaultValue={reg}
          className="rounded-xl border px-3 py-2 text-base"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          <option value="">全部縣市</option>
          {(allCounties ?? []).map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        {/* Region filter — district (only when county is selected) */}
        {reg && countyDistricts.length > 0 && (
          <select
            name="dist"
            defaultValue={dist}
            className="rounded-xl border px-3 py-2 text-base"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <option value="">全部行政區</option>
            {countyDistricts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className="rounded-xl px-5 py-2 font-semibold"
          style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
        >
          篩選
        </button>

        {/* Clear filters */}
        {(q || cat || reg || dist) && (
          <a
            href={`/admin/resources?status=${status}`}
            className="rounded-xl px-4 py-2 text-base font-medium"
            style={{ background: "#FEE2E2", color: "#DC2626" }}
          >
            清除
          </a>
        )}
      </form>

      {/* ── Active filter badges ────────────────────────────────────────── */}
      {(cat || reg || dist) && (
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          {cat && (
            <span
              className="rounded-full px-3 py-1 font-medium"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
            >
              分類：{(allCategories ?? []).find((c) => c.slug === cat)?.name ?? cat}
            </span>
          )}
          {reg && (
            <span
              className="rounded-full px-3 py-1 font-medium"
              style={{ background: "#F3E8FF", color: "#7E22CE", border: "1px solid #DDD6FE" }}
            >
              縣市：{(allCounties ?? []).find((r) => r.id === reg)?.name ?? reg}
            </span>
          )}
          {dist && (
            <span
              className="rounded-full px-3 py-1 font-medium"
              style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #6EE7B7" }}
            >
              行政區：{countyDistricts.find((d) => d.id === dist)?.name ?? dist}
            </span>
          )}
        </div>
      )}

      {queryError && (
        <div className="mt-4 rounded-xl p-4 text-sm font-mono" style={{ background: "#FEE2E2", color: "#DC2626" }}>
          查詢錯誤：{queryError.message}
        </div>
      )}

      {/* ── Result summary ──────────────────────────────────────────────── */}
      <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
        顯示 {resources.length} 筆「{currentTab.label}」資源
        {resources.length === 200 && "（已達上限 200 筆，請套用篩選縮小範圍）"}
      </p>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      {resources.length === 0 ? (
        <div
          className="mt-8 rounded-2xl p-10 text-center text-xl"
          style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
        >
          {skipMain ? "找不到符合的分類，請重新選擇。" : `目前沒有「${currentTab.label}」資源`}
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
              {resources.map((r, i) => {
                const subcat = subcatMap[r.subcategory_id ?? ""];
                const regionEntry = regionMap[r.region_id ?? ""] ?? null;
                const regionName = regionEntry
                  ? (regionEntry.parentName ? `${regionEntry.parentName} › ${regionEntry.name}` : regionEntry.name)
                  : null;
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
