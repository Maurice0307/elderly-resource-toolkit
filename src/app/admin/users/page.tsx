import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { setUserRole } from "@/lib/admin/actions";
import { AD, AdPill, AdCard, AdPageHead, adBtn, type Tone } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";

export default async function AdminUsersPage() {
  const { user: caller, role: callerRole } = await requireRole("admin");
  if (callerRole !== "admin") return null;

  const admin = createAdminClient();

  const { data: users } = await admin
    .from("profiles")
    .select("id, display_name, role, identity, points, created_at, home_region_id")
    .order("role")
    .order("created_at", { ascending: false })
    .limit(100);

  // 地區名稱（含上層縣市）
  const regionIds = [...new Set((users ?? []).map((u) => u.home_region_id).filter(Boolean))] as string[];
  const regionName: Record<string, string> = {};
  if (regionIds.length > 0) {
    const { data: regs } = await admin.from("regions").select("id, name, parent_id").in("id", regionIds);
    const parentIds = [...new Set((regs ?? []).map((r) => r.parent_id).filter(Boolean))] as string[];
    const parentMap: Record<string, string> = {};
    if (parentIds.length > 0) {
      const { data: parents } = await admin.from("regions").select("id, name").in("id", parentIds);
      for (const p of parents ?? []) parentMap[p.id] = p.name;
    }
    for (const r of regs ?? []) {
      regionName[r.id] = r.parent_id && parentMap[r.parent_id] ? `${parentMap[r.parent_id]} ${r.name}` : r.name;
    }
  }
  const regionOf = (id: string | null) => (id && regionName[id]) || "—";

  // 聯絡資訊（email / 手機）來自 auth.users
  const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const contactMap: Record<string, { email: string | null; phone: string | null }> = {};
  for (const au of authList?.users ?? []) {
    contactMap[au.id] = { email: au.email ?? null, phone: au.phone ?? null };
  }
  // 把後台合成帳號的 email 轉成可讀來源
  function contactLines(id: string): { kind: string; value: string }[] {
    const c = contactMap[id];
    if (!c) return [];
    const out: { kind: string; value: string }[] = [];
    if (c.phone) out.push({ kind: "phone", value: c.phone });
    if (c.email) {
      if (c.email.endsWith("@line.users")) { if (!c.phone) out.push({ kind: "line", value: "LINE 登入" }); }
      else if (c.email.endsWith("@phone.users")) { /* 手機合成信箱，略過 */ }
      else out.push({ kind: "email", value: c.email });
    }
    return out;
  }

  const roleLabel: Record<string, { label: string; tone: Tone }> = {
    user:      { label: "一般用戶",   tone: "neutral" },
    moderator: { label: "地區管理員", tone: "info" },
    admin:     { label: "超級管理員", tone: "coral" },
  };
  const identityLabel: Record<string, string> = { elder: "長者", family: "家屬", volunteer: "志工", other: "其他" };
  const fmtDate = (d: string) => new Date(d).toLocaleString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });

  const roleButtons = (u: { id: string; role: string }) => (
    <>
      {u.role !== "user" && (
        <form action={setUserRole.bind(null, u.id, "user")}>
          <button type="submit" style={{ ...adBtn("neutral"), minHeight: 34, fontSize: 13 }}>設為一般</button>
        </form>
      )}
      {u.role !== "moderator" && (
        <form action={setUserRole.bind(null, u.id, "moderator")}>
          <button type="submit" style={{ ...adBtn("info"), minHeight: 34, fontSize: 13 }}>設為管理員</button>
        </form>
      )}
      {u.role !== "admin" && (
        <form action={setUserRole.bind(null, u.id, "admin")}>
          <button type="submit" style={{ ...adBtn("coral"), minHeight: 34, fontSize: 13 }}>設為超管</button>
        </form>
      )}
    </>
  );

  const Contact = ({ id }: { id: string }) => {
    const lines = contactLines(id);
    if (lines.length === 0) return <span style={{ fontSize: 12.5, color: AD.muted }}>無聯絡資訊</span>;
    return (
      <>
        {lines.map((c, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, color: AD.sub, fontFamily: c.kind === "phone" || c.kind === "email" ? "ui-monospace, monospace" : "inherit", whiteSpace: "nowrap" }}>
            <ELIcon name={c.kind === "phone" ? "phone" : c.kind === "line" ? "chat" : "send"} size={14} color={AD.muted} /> {c.value}
          </span>
        ))}
      </>
    );
  };

  return (
    <div>
      <AdPageHead title="用戶管理" desc="僅超級管理員可見。調整角色後立即生效。" />

      {/* 桌機版：一筆一列，資訊同一行，操作鈕在最右邊 */}
      <div className="wv-desktop-only" style={{ background: "#fff", border: `1px solid ${AD.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "#FAF6F2", borderBottom: `1px solid ${AD.border}` }}>
                {["成員", "角色", "身分", "地區", "積分", "加入時間", "聯絡資訊"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontSize: 12.5, color: AD.muted, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                ))}
                <th style={{ textAlign: "right", padding: "11px 16px 11px 14px", fontSize: 12.5, color: AD.muted, fontWeight: 700 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => {
                const info = roleLabel[u.role] ?? roleLabel.user;
                const isSelf = u.id === caller.id;
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${AD.border}` }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#F2764F,#E0552E)", color: "#fff", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {(u.display_name ?? "?").slice(0, 1).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: AD.ink, whiteSpace: "nowrap" }}>
                          {u.display_name ?? "（未設定名稱）"}
                          {isSelf && <span style={{ marginLeft: 5, fontSize: 12, fontWeight: 600, color: AD.muted }}>（你）</span>}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}><AdPill tone={info.tone}>{info.label}</AdPill></td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: AD.sub, whiteSpace: "nowrap" }}>{u.identity ? identityLabel[u.identity] ?? u.identity : "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: AD.sub, whiteSpace: "nowrap" }}>{regionOf(u.home_region_id)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13.5, fontWeight: 700, color: AD.ink, whiteSpace: "nowrap" }}>{u.points}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: AD.sub, whiteSpace: "nowrap" }}>{fmtDate(u.created_at)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}><Contact id={u.id} /></div>
                    </td>
                    <td style={{ padding: "10px 16px 10px 14px" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {isSelf ? <span style={{ fontSize: 12.5, color: AD.muted }}>—</span> : roleButtons(u)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 手機版：資訊較完整的卡片 */}
      <div className="wv-mobile-only flex flex-col gap-3">
        {(users ?? []).map((u) => {
          const info = roleLabel[u.role] ?? roleLabel.user;
          const isSelf = u.id === caller.id;
          return (
            <AdCard key={u.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#F2764F,#E0552E)", color: "#fff", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {(u.display_name ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: AD.ink }}>
                    {u.display_name ?? "（未設定名稱）"}
                    {isSelf && <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600, color: AD.muted }}>（你）</span>}
                  </div>
                  <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <AdPill tone={info.tone}>{info.label}</AdPill>
                    {u.identity && <AdPill tone="neutral">{identityLabel[u.identity] ?? u.identity}</AdPill>}
                    <span style={{ fontSize: 12.5, color: AD.muted }}>積分 {u.points}</span>
                  </div>
                </div>
              </div>

              {/* 加入時間 + 地區 + 聯絡資訊（每項一行） */}
              <div style={{ marginTop: 11, paddingTop: 11, borderTop: `1px solid ${AD.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: AD.sub }}>
                  <ELIcon name="medal" size={15} color={AD.muted} /> 加入時間：{fmtDate(u.created_at)}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: AD.sub }}>
                  <ELIcon name="pin" size={15} color={AD.muted} /> 地區：{regionOf(u.home_region_id)}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <ELIcon name="user" size={15} color={AD.muted} />
                  <Contact id={u.id} />
                </div>
              </div>

              {/* 角色操作 */}
              {!isSelf && (
                <div style={{ marginTop: 11, paddingTop: 11, borderTop: `1px solid ${AD.border}`, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {roleButtons(u)}
                </div>
              )}
            </AdCard>
          );
        })}
      </div>
    </div>
  );
}
