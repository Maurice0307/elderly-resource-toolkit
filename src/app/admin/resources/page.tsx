import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { DeleteResourceButton } from "@/components/admin/DeleteResourceButton";
import { approveResource, rejectResource, markResourceEnded } from "@/lib/admin/actions";
import { AD, AdPill, AdStat, AdTab, AdCard, AdPageHead, AdEmpty, adBtn, RESOURCE_SORTS } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";
import { ResourcesAdminTable, type ResRow } from "@/components/admin/ResourcesAdminTable";

const STATUS_TABS = [
  { value: "active",   label: "已上架" },
  { value: "pending",  label: "待審核" },
  { value: "ended",    label: "已結束" },
  { value: "archived", label: "已封存" },
];

const STAT_META: { key: string; label: string; icon: string; urgent?: boolean }[] = [
  { key: "active",   label: "已上架", icon: "news" },
  { key: "pending",  label: "待審核", icon: "shield", urgent: true },
  { key: "ended",    label: "已結束", icon: "check" },
  { key: "archived", label: "已封存", icon: "lock" },
];

const field: React.CSSProperties = {
  minHeight: 44, padding: "0 14px", borderRadius: 12,
  border: `1.5px solid ${AD.line}`, background: "#fff", color: AD.ink,
  fontSize: 15, fontFamily: "inherit",
};

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; cat?: string; reg?: string; dist?: string; sort?: string }>;
}) {
  const { role } = await requireRole("moderator");
  const canDelete = role === "admin";
  const { status = "active", q = "", cat = "", reg = "", dist = "", sort = "new" } = await searchParams;
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
    created_at: string; approved_at: string | null; subcategory_id: string | null; region_id: string | null;
  }[] = [];
  let queryError: { message: string } | null = null;

  if (!skipMain) {
    let query = admin
      .from("resources")
      .select("id, name, summary, phone, website_url, scope, status, created_at, approved_at, subcategory_id, region_id")
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

  // ── 組成顯示列 + 依排序方式排序（手機卡片與桌機表格共用） ──
  const rows: ResRow[] = resources.map((r) => {
    const subcat = subcatMap[r.subcategory_id ?? ""];
    const regionEntry = regionMap[r.region_id ?? ""] ?? null;
    const regionName = regionEntry
      ? (regionEntry.parentName ? `${regionEntry.parentName} › ${regionEntry.name}` : regionEntry.name)
      : null;
    return {
      id: r.id, name: r.name, summary: r.summary, phone: r.phone, website_url: r.website_url,
      scope: r.scope, status: r.status,
      categoryName: subcat?.category_name ?? "", subcatName: subcat?.name ?? "",
      regionName, createdAt: r.created_at, approvedAt: r.approved_at,
    };
  });
  const collator = new Intl.Collator("zh-Hant");
  rows.sort((a, b) => {
    switch (sort) {
      case "old": return a.createdAt.localeCompare(b.createdAt);
      case "verified": return (b.approvedAt ?? "").localeCompare(a.approvedAt ?? "");
      case "category": return collator.compare(a.categoryName || a.subcatName, b.categoryName || b.subcatName) || collator.compare(a.name, b.name);
      case "region": return collator.compare(a.regionName ?? "", b.regionName ?? "") || collator.compare(a.name, b.name);
      case "scope": return (a.scope === b.scope ? 0 : a.scope === "national" ? -1 : 1) || collator.compare(a.name, b.name);
      case "name": return collator.compare(a.name, b.name);
      default: return b.createdAt.localeCompare(a.createdAt); // "new"
    }
  });

  // Build export URL with current filters (session-based, no token needed)
  const exportParams = new URLSearchParams();
  exportParams.set("status", status);
  if (q)    exportParams.set("q", q);
  if (cat)  exportParams.set("cat", cat);
  if (reg)  exportParams.set("reg", reg);
  if (dist) exportParams.set("dist", dist);
  const exportUrl = `/api/admin/resources/export-csv?${exportParams}`;

  // base query for sort links（保留現有篩選，sort 由連結覆蓋）
  const baseParams = new URLSearchParams();
  baseParams.set("status", status);
  if (q)    baseParams.set("q", q);
  if (cat)  baseParams.set("cat", cat);
  if (reg)  baseParams.set("reg", reg);
  if (dist) baseParams.set("dist", dist);
  const baseQuery = baseParams.toString();

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <AdPageHead
        title="資源管理"
        desc="審核、編輯與管理社區資源"
        actions={
          <>
            <Link href="/admin/resources/import" style={adBtn("neutral")}>
              <ELIcon name="arrow" size={16} color={AD.sub} /> 批量匯入
            </Link>
            <a href={exportUrl} download style={adBtn("neutral")}>
              <ELIcon name="news" size={16} color={AD.sub} /> 匯出 CSV
            </a>
            <Link href="/admin/resources/new" style={adBtn("coral")}>
              <ELIcon name="edit" size={16} color="#fff" /> 新增資源
            </Link>
          </>
        }
      />

      {/* ── Stats cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_META.map(({ key, label, icon, urgent }) => (
          <AdStat
            key={key}
            icon={icon}
            value={statCounts[key] ?? 0}
            label={label}
            href={`/admin/resources?status=${key}`}
            active={status === key}
            urgent={urgent && (statCounts[key] ?? 0) > 0}
          />
        ))}
      </div>

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
            <AdTab key={tab.value} href={`/admin/resources?${params}`} active={status === tab.value}>
              {tab.label}
              {tab.value === "pending" && (statCounts.pending ?? 0) > 0 && (
                <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "#E0552E", color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {statCounts.pending}
                </span>
              )}
            </AdTab>
          );
        })}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <form method="GET" className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="status" value={status} />
        <input
          type="text" name="q" defaultValue={q} placeholder="搜尋資源名稱…"
          className="min-w-0 flex-1" style={field}
        />
        <select name="cat" defaultValue={cat} style={field}>
          <option value="">全部分類</option>
          {(allCategories ?? []).map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select name="reg" defaultValue={reg} style={field}>
          <option value="">全部縣市</option>
          {(allCounties ?? []).map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {reg && countyDistricts.length > 0 && (
          <select name="dist" defaultValue={dist} style={field}>
            <option value="">全部行政區</option>
            {countyDistricts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
        {/* 排序方式（手機 / 桌機共用；改選後按「套用」即排序） */}
        <select name="sort" defaultValue={sort} style={field} aria-label="排序方式">
          {RESOURCE_SORTS.map((s) => (
            <option key={s.key} value={s.key}>排序：{s.label}</option>
          ))}
        </select>
        <button type="submit" style={adBtn("neutral")}>
          <ELIcon name="search" size={16} color={AD.sub} /> 套用
        </button>
        {(q || cat || reg || dist) && (
          <a href={`/admin/resources?status=${status}`} style={adBtn("alert")}>清除</a>
        )}
      </form>

      {/* ── Active filter badges ────────────────────────────────────────── */}
      {(cat || reg || dist) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cat && <AdPill tone="info">分類：{(allCategories ?? []).find((c) => c.slug === cat)?.name ?? cat}</AdPill>}
          {reg && <AdPill tone="coral">縣市：{(allCounties ?? []).find((r) => r.id === reg)?.name ?? reg}</AdPill>}
          {dist && <AdPill tone="ok">行政區：{countyDistricts.find((d) => d.id === dist)?.name ?? dist}</AdPill>}
        </div>
      )}

      {queryError && (
        <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: "#FCEBEA", color: "#C0392B" }}>
          查詢錯誤：{queryError.message}
        </div>
      )}

      {/* ── Result summary ──────────────────────────────────────────────── */}
      <p className="mt-3" style={{ fontSize: 13, color: AD.muted }}>
        顯示 {resources.length} 筆「{currentTab.label}」資源
        {resources.length === 200 && "（已達上限 200 筆，請套用篩選縮小範圍）"}
      </p>

      {/* ── 結果 ───────────────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="mt-3">
          <AdEmpty title={skipMain ? "找不到符合的分類" : `目前沒有「${currentTab.label}」資源`} desc={skipMain ? "請重新選擇分類條件。" : undefined} />
        </div>
      ) : (
        <>
          {/* 桌機版：專業資料表格（左側批次勾選、可排序欄位、右側操作） */}
          <div className="mt-4">
            <ResourcesAdminTable rows={rows} canDelete={canDelete} baseQuery={baseQuery} sort={sort} />
          </div>

          {/* 手機版：卡片列表 */}
          <div className="wv-mobile-only mt-3 flex flex-col gap-3">
            {rows.map((r) => (
              <AdCard key={r.id} accent={r.status === "pending"}>
                {/* 標題 + 範圍 */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: AD.ink, lineHeight: 1.4 }}>{r.name}</div>
                  <AdPill tone={r.scope === "national" ? "pending" : "ok"}>{r.scope === "national" ? "全國" : "在地"}</AdPill>
                </div>

                {/* meta：分類 + 地區 */}
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {r.subcatName ? (
                    <AdPill tone="info">{r.categoryName ? `${r.categoryName}・${r.subcatName}` : r.subcatName}</AdPill>
                  ) : (
                    <span style={{ fontSize: 12.5, color: AD.muted }}>未分類</span>
                  )}
                  {r.regionName && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12.5, color: AD.muted }}>
                      <ELIcon name="pin" size={14} color={AD.muted} /> {r.regionName}
                    </span>
                  )}
                </div>

                {/* 摘要 */}
                {r.summary && (
                  <p style={{ margin: "10px 0 0", fontSize: 14, color: AD.sub, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {r.summary}
                  </p>
                )}

                {/* 聯絡 + 認證時間 */}
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  {r.phone && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: AD.sub, fontFamily: "ui-monospace, monospace" }}>
                      <ELIcon name="phone" size={15} color={AD.muted} /> {r.phone}
                    </span>
                  )}
                  {r.website_url && (
                    <a href={r.website_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: AD.coralDark, textDecoration: "none" }}>
                      <ELIcon name="link" size={15} color={AD.coralDark} /> 開啟網站
                    </a>
                  )}
                  {r.approvedAt && (
                    <span style={{ fontSize: 12, color: AD.muted }}>認證 {new Date(r.approvedAt).toLocaleDateString("zh-TW")}</span>
                  )}
                </div>

                {/* 操作 */}
                <div style={{ marginTop: 13, paddingTop: 13, borderTop: `1px solid ${AD.border}`, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Link href={`/admin/resources/${r.id}/edit`} style={adBtn("info")}>
                    <ELIcon name="edit" size={15} color="#2A63C0" /> 編輯
                  </Link>
                  {r.status === "active" && (
                    <form action={markResourceEnded.bind(null, r.id)}>
                      <button type="submit" style={adBtn("pending")}>結束</button>
                    </form>
                  )}
                  {r.status === "pending" && (
                    <>
                      <form action={approveResource.bind(null, r.id)}>
                        <button type="submit" style={adBtn("ok")}>
                          <ELIcon name="check" size={15} color="#1E7A43" stroke={2.4} /> 上架
                        </button>
                      </form>
                      <form action={rejectResource.bind(null, r.id)}>
                        <button type="submit" style={adBtn("alert")}>
                          <ELIcon name="close" size={15} color="#C0392B" stroke={2.2} /> 拒絕
                        </button>
                      </form>
                    </>
                  )}
                  {(r.status === "ended" || r.status === "archived") && (
                    <form action={approveResource.bind(null, r.id)}>
                      <button type="submit" style={adBtn("ok")}>重新上架</button>
                    </form>
                  )}
                  <DeleteResourceButton resourceId={r.id} resourceName={r.name} />
                </div>
              </AdCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
