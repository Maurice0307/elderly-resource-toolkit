import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { MobileAdminConsole } from "@/components/admin/MobileAdminConsole";
import { AD, AdStat, AdCard, AdPill, adBtn, type Tone } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";

const DIST_COLORS = ["#E0552E", "#F2764F", "#F2934F", "#E8B04B", "#C9B8A8", "#9AA0A8"];

export default async function AdminDashboard() {
  const { displayName } = await requireRole("moderator");
  const admin = createAdminClient();

  const [
    { count: pendingResources },
    { count: activeResources },
    { count: openQuestions },
    { count: totalUsers },
    { count: newsCount },
    { data: pendingList },
    { data: recentQ },
    { data: activeForDist },
  ] = await Promise.all([
    admin.from("resources").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("resources").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("questions").select("id", { count: "exact", head: true }).eq("status", "open"),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("daily_news").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("resources").select("id, name, created_at, subcategory_id").eq("status", "pending").order("created_at", { ascending: false }).limit(6),
    admin.from("questions").select("id, title, created_at").eq("status", "open").order("created_at", { ascending: false }).limit(4),
    admin.from("resources").select("subcategory_id").eq("status", "active").limit(1000),
  ]);

  // ── 資源分類分布（由真實資料計算）──
  const subIds = [...new Set((activeForDist ?? []).map((r) => r.subcategory_id).filter(Boolean))] as string[];
  const { data: subs } = subIds.length
    ? await admin.from("subcategories").select("id, category_id").in("id", subIds)
    : { data: [] as { id: string; category_id: string | null }[] };
  const catIds = [...new Set((subs ?? []).map((s) => s.category_id).filter(Boolean))] as string[];
  const { data: cats } = catIds.length
    ? await admin.from("categories").select("id, name").in("id", catIds)
    : { data: [] as { id: string; name: string }[] };
  const subToCat: Record<string, string | null> = Object.fromEntries((subs ?? []).map((s) => [s.id, s.category_id]));
  const catName: Record<string, string> = Object.fromEntries((cats ?? []).map((c) => [c.id, c.name]));
  const distCount: Record<string, number> = {};
  for (const r of activeForDist ?? []) {
    const cid = r.subcategory_id ? subToCat[r.subcategory_id] : null;
    const nm = (cid && catName[cid]) || "其他";
    distCount[nm] = (distCount[nm] ?? 0) + 1;
  }
  const dist = Object.entries(distCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const distTotal = dist.reduce((s, [, v]) => s + v, 0) || 1;

  // ── 待處理佇列（投稿 + 問答，皆可點進真實頁面）──
  const queue: { type: string; tone: Tone; name: string; meta: string; href: string }[] = [
    ...(pendingList ?? []).map((r) => ({
      type: "投稿", tone: "coral" as Tone, name: r.name,
      meta: new Date(r.created_at).toLocaleDateString("zh-TW"),
      href: `/admin/resources/${r.id}/edit`,
    })),
    ...(recentQ ?? []).map((q) => ({
      type: "問答", tone: "info" as Tone, name: q.title,
      meta: new Date(q.created_at).toLocaleDateString("zh-TW"),
      href: "/admin/questions",
    })),
  ].slice(0, 8);

  const stats = [
    { icon: "shield", label: "待審核資源", value: pendingResources ?? 0, href: "/admin/resources?status=pending", urgent: (pendingResources ?? 0) > 0 },
    { icon: "news", label: "已上架資源", value: activeResources ?? 0, href: "/admin/resources?status=active" },
    { icon: "qa", label: "開放中問題", value: openQuestions ?? 0, href: "/admin/questions" },
    { icon: "social", label: "註冊用戶", value: totalUsers ?? 0, href: "/admin/users" },
  ];

  return (
    <>
    {/* 手機版：社區管理主控台（對齊設計稿） */}
    <MobileAdminConsole
      displayName={displayName}
      counts={{
        pending: pendingResources ?? 0,
        resources: activeResources ?? 0,
        questions: openQuestions ?? 0,
        news: newsCount ?? 0,
        users: totalUsers ?? 0,
      }}
    />

    {/* 桌機版：後台概覽 Dashboard */}
    <div className="wv-desktop-only">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: AD.ink, lineHeight: 1.2 }}>總覽</h1>
          <p style={{ marginTop: 4, fontSize: 15, color: AD.muted }}>社區資源、問答與成員的即時概況</p>
        </div>
        <Link href="/admin/resources/new" style={adBtn("coral")}>
          <ELIcon name="edit" size={16} color="#fff" /> 新增資源
        </Link>
      </div>

      {/* KPI */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <AdStat key={s.label} icon={s.icon} value={s.value} label={s.label} href={s.href} urgent={s.urgent} />
        ))}
      </div>

      {/* 兩欄：待處理佇列 + 資源分類分布 */}
      <div className="mt-5 grid gap-5" style={{ gridTemplateColumns: "1.55fr 1fr" }}>
        {/* 待處理佇列 */}
        <AdCard style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "15px 18px", borderBottom: `1px solid ${AD.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: AD.ink }}>待處理佇列</span>
            <Link href="/admin/resources?status=pending" style={{ fontSize: 13, fontWeight: 700, color: AD.coralDark, textDecoration: "none" }}>查看全部 ›</Link>
          </div>
          {queue.length === 0 ? (
            <div style={{ padding: "40px 18px", textAlign: "center", color: AD.muted, fontSize: 14 }}>目前沒有待處理項目，辛苦了！</div>
          ) : (
            <div>
              {queue.map((q, i) => (
                <Link
                  key={i}
                  href={q.href}
                  style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 18px", borderTop: i ? `1px solid ${AD.border}` : "none", textDecoration: "none" }}
                >
                  <AdPill tone={q.tone}>{q.type}</AdPill>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: AD.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.name}</div>
                    <div style={{ marginTop: 2, fontSize: 12.5, color: AD.muted }}>{q.meta}</div>
                  </div>
                  <ELIcon name="chevron" size={18} color="#C8B8AE" />
                </Link>
              ))}
            </div>
          )}
        </AdCard>

        {/* 資源分類分布 + 快速操作 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AdCard>
            <div style={{ fontSize: 16, fontWeight: 800, color: AD.ink, marginBottom: 14 }}>資源分類分布</div>
            {dist.length === 0 ? (
              <div style={{ color: AD.muted, fontSize: 14 }}>尚無已上架資源。</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {dist.map(([nm, v], i) => (
                  <div key={nm}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                      <span style={{ color: AD.ink, fontWeight: 600 }}>{nm}</span>
                      <span style={{ color: AD.muted, fontWeight: 700 }}>{v}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "#F0E6DE", overflow: "hidden" }}>
                      <div style={{ width: Math.round((v / distTotal) * 100) + "%", height: "100%", background: DIST_COLORS[i % DIST_COLORS.length], borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdCard>

          <AdCard>
            <div style={{ fontSize: 16, fontWeight: 800, color: AD.ink, marginBottom: 12 }}>快速操作</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { icon: "shield", label: "投稿審核", href: "/admin/resources?status=pending" },
                { icon: "qa", label: "問答管理", href: "/admin/questions" },
                { icon: "social", label: "成員權限", href: "/admin/users" },
              ].map((a) => (
                <Link key={a.href} href={a.href} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 12, border: `1px solid ${AD.border}`, textDecoration: "none" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: AD.chip, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ELIcon name={a.icon} size={18} color={AD.coral} />
                  </span>
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: AD.ink }}>{a.label}</span>
                  <ELIcon name="chevron" size={17} color="#C8B8AE" />
                </Link>
              ))}
            </div>
          </AdCard>
        </div>
      </div>
    </div>
    </>
  );
}
