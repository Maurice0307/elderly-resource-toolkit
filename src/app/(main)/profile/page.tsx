import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ELIcon } from "@/components/layout/ELIcon";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { BindReminder } from "@/components/profile/BindReminder";
import { DeniedNotice } from "@/components/profile/DeniedNotice";
import { getAdmin } from "@/lib/auth/linking";

export const metadata = { title: "個人中心" };

function NotLoggedIn() {
  return (
    <div className="wv-fade wv-wrap" style={{ paddingTop: 60, paddingBottom: 48, maxWidth: 620 }}>
      <div style={{
        background: "#fff", borderRadius: 26, border: "1px solid #F0E6DE",
        padding: "44px 40px", textAlign: "center",
      }}>
        <div style={{ width: 84, height: 84, borderRadius: "50%", background: "#FFF4EF", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ELIcon name="user" size={44} color="#F26B43" />
        </div>
        <h1 style={{ margin: "20px 0 0", fontSize: 28, fontWeight: 800, color: "#241F1B" }}>登入後，這裡都是您的</h1>
        <p style={{ margin: "12px 0 0", fontSize: 17, color: "#574E47", lineHeight: 1.7 }}>
          收藏常用資源、追蹤學習進度、累積成就徽章。家人、長輩、志工各有專屬功能。
        </p>
        <div style={{ margin: "26px 0 0", display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
          {[
            { icon: "heart", t: "收藏與管理常用的服務電話" },
            { icon: "medal", t: "完成學習自動點亮成就徽章" },
            { icon: "like",  t: "志工累積服務點數，兌換物資" },
          ].map((b) => (
            <div key={b.t} style={{ display: "flex", alignItems: "center", gap: 13, background: "#FBF7F4", borderRadius: 14, padding: "14px 18px" }}>
              <ELIcon name={b.icon} size={24} color="#F26B43" />
              <span style={{ fontSize: 16.5, color: "#574E47", fontWeight: 600 }}>{b.t}</span>
            </div>
          ))}
        </div>
        <Link href="/login" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
          background: "#E0552E", color: "#fff", borderRadius: 999, height: 56, marginTop: 26,
          fontSize: 18, fontWeight: 800, textDecoration: "none",
          boxShadow: "0 6px 16px rgba(224,85,46,0.26)",
        }}>
          <ELIcon name="user" size={20} color="#fff" /> 登入 / 選擇身分
        </Link>
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <NotLoggedIn />;

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ?? "使用者";
  const initial = displayName.slice(0, 1);
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) || "";

  // 計算已綁定的登入方式，決定是否提醒綁定
  const provider = user.user_metadata?.provider as string | undefined;
  const isLineAcct = provider === "line" || (user.email ?? "").endsWith("@line.users");
  const admin = getAdmin();
  const { data: linkRows } = await admin.from("account_links").select("provider, provider_key").eq("user_id", user.id);
  const linkedSet = new Set<string>((linkRows ?? []).map((r: { provider: string }) => r.provider));
  if (user.phone) linkedSet.add("phone");
  if (isLineAcct) linkedSet.add("line");
  if (provider === "google" && user.email) linkedSet.add("google");
  // 顯示用 email：優先真實信箱（非 @line.users）；LINE 登入者改抓已綁定的 Google 信箱
  const googleEmail = (linkRows ?? []).find((r: { provider: string; provider_key: string }) => r.provider === "google" && /@/.test(r.provider_key))?.provider_key;
  const realEmail = (user.email && !isLineAcct) ? user.email : googleEmail;
  const displayEmail = realEmail ?? (isLineAcct ? "（以 LINE 登入）" : (user.email ?? "—"));
  const unlinkedCount = ["line", "google", "phone"].filter((p) => !linkedSet.has(p)).length;
  const region = (user.user_metadata?.region as string | undefined) ?? "";

  const [{ count: savedCount }, { count: submittedCount }, { count: qaCount }, { data: profileRow }] =
    await Promise.all([
      admin.from("resource_bookmarks").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("resources").select("*", { count: "exact", head: true }).eq("submitted_by", user.id),
      supabase.from("questions").select("*", { count: "exact", head: true }).eq("author_id", user.id),
      supabase.from("profiles").select("identity, points, role").eq("id", user.id).maybeSingle(),
    ]);

  const IDENTITY_LABEL: Record<string, string> = { elder: "長輩", family: "家人", volunteer: "志工", other: "會員" };
  const identity = (profileRow?.identity as string | undefined) ?? "family";
  const identityLabel = IDENTITY_LABEL[identity] ?? "家人";
  const isVolunteer = identity === "volunteer";
  const points = (profileRow?.points as number | undefined) ?? 0;
  const role = (profileRow?.role as string | undefined) ?? "user";
  const isStaff = role === "admin" || role === "moderator";

  const stats = isVolunteer
    ? [
        { label: "服務點數", value: String(points) },
        { label: "收藏", value: String(savedCount ?? 0) },
        { label: "投稿", value: String(submittedCount ?? 0) },
        { label: "問答", value: String(qaCount ?? 0) },
      ]
    : [
        { label: "收藏", value: String(savedCount ?? 0) },
        { label: "投稿", value: String(submittedCount ?? 0) },
        { label: "問答", value: String(qaCount ?? 0) },
        { label: "圖卡", value: "—" },
      ];

  const infoFields = [
    { label: "顯示名稱", value: displayName },
    { label: "電子信箱", value: displayEmail },
    { label: "所在地區", value: region || "未設定" },
    { label: "身份", value: identityLabel },
  ];

  const level = Math.max(1, Math.floor((points ?? 0) / 100) + 1);
  const menuMine = [
    { icon: "heart", name: "我的收藏", meta: `${savedCount ?? 0} 項`, href: "/profile/favorites" },
    { icon: "send", name: "我的提案與投稿", meta: `${submittedCount ?? 0} 則`, href: "/propose" },
    { icon: "qa", name: "我的問答", meta: `${qaCount ?? 0} 則`, href: "/qa" },
    { icon: "star", name: "學習進度追蹤", meta: isVolunteer ? `Lv.${level}` : "去逛逛", href: "/progress" },
    ...(isVolunteer ? [{ icon: "gift", name: "點數兌換商店", meta: `${points} 點`, href: "/rewards" }] : []),
  ];
  const menuSettings = [
    ...(isStaff ? [{ icon: "shield", name: "管理後台", meta: role === "admin" ? "管理員" : "審核員", href: "/admin" }] : []),
    { icon: "education", name: "使用教學與理念", meta: "", href: "/guide" },
    { icon: "textsize", name: "字級與無障礙", meta: "", href: "/accessibility" },
    { icon: "send", name: "通知設定", meta: "", href: "/notifications" },
    { icon: "qa", name: "常見問題與聯絡", meta: "", href: "/faq" },
    { icon: "shield", name: "隱私與帳號安全", meta: "", href: "/privacy" },
  ];

  return (
    <div className="wv-fade">
      {/* ── 手機版（iOS App 版型）── */}
      <div className="wv-mobile-only" style={{ background: "#FAF6F2", minHeight: "100%" }}>
        <DeniedNotice />
        <BindReminder unlinked={unlinkedCount} />
        {/* 身分卡 */}
        <div style={{ background: "#fff", padding: "8px 18px 20px", borderBottom: "1px solid #F0E6DE" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0, objectFit: "cover", boxShadow: "0 6px 16px rgba(224,85,46,0.28)" }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#F2764F,#E0552E)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 27, fontWeight: 800, boxShadow: "0 6px 16px rgba(224,85,46,0.28)" }}>{initial}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#241F1B" }}>{displayName}</div>
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#FFF4EF", color: "#B23F1E" }}>
                  <ELIcon name={isVolunteer ? "like" : "heart"} size={13} color="#F26B43" /> {identityLabel}
                </span>
                {region && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#FAF6F2", color: "#6E645C" }}>
                    <ELIcon name="pin" size={13} color="#9C8E84" /> {region}
                  </span>
                )}
              </div>
            </div>
            <Link href="/profile/edit" aria-label="編輯個人資料" style={{ display: "inline-flex", alignItems: "center", gap: 5, alignSelf: "flex-start", border: "1.5px solid #E4D7CC", background: "#fff", borderRadius: 999, padding: "8px 13px", color: "#574E47", fontSize: 13, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
              <ELIcon name="edit" size={15} color="#6E645C" /> 編輯
            </Link>
          </div>

          {/* 學習紀錄列 */}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", borderRadius: 16, background: "#FFF4EF", border: "1px solid #FFE0D2" }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ELIcon name={isVolunteer ? "trophy" : "medal"} size={24} color="#F26B43" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: "#9C8E84", fontWeight: 600 }}>{isVolunteer ? "好厝邊志工" : "我的紀錄"}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>{isVolunteer ? `${points} 服務點數` : `收藏 ${savedCount ?? 0} · 問答 ${qaCount ?? 0}`}</div>
            </div>
          </div>

          {/* 快速統計 */}
          <div style={{ marginTop: 14, display: "flex", borderRadius: 16, border: "1px solid #F0E6DE", overflow: "hidden" }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "12px 4px", borderLeft: i ? "1px solid #F0E6DE" : "none" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#B23F1E", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                <div style={{ marginTop: 2, fontSize: 12, color: "#6E645C", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 我的內容 */}
        <div style={{ padding: "16px 18px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", letterSpacing: 0.5, marginBottom: 8, paddingLeft: 2 }}>我的內容</div>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "2px 16px" }}>
            {menuMine.map((m, i) => (
              <Link key={m.name} href={m.href} className="click" style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 0", textDecoration: "none", borderTop: i === 0 ? "none" : "1px solid #F0E6DE" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ELIcon name={m.icon} size={22} color="#F26B43" />
                </span>
                <span style={{ flex: 1, fontSize: 17, fontWeight: 700, color: "#241F1B" }}>{m.name}</span>
                {m.meta && <span style={{ fontSize: 13.5, color: "#9C8E84", whiteSpace: "nowrap" }}>{m.meta}</span>}
                <ELIcon name="chevron" size={20} color="#C8B8AE" />
              </Link>
            ))}
          </div>
        </div>

        {/* 設定 */}
        <div style={{ padding: "16px 18px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", letterSpacing: 0.5, marginBottom: 8, paddingLeft: 2 }}>設定</div>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "2px 16px" }}>
            {menuSettings.map((m, i) => (
              <Link key={m.name} href={m.href} className="click" style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 0", textDecoration: "none", borderTop: i === 0 ? "none" : "1px solid #F0E6DE" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ELIcon name={m.icon} size={22} color="#F26B43" />
                </span>
                <span style={{ flex: 1, fontSize: 17, fontWeight: 700, color: "#241F1B" }}>{m.name}</span>
                <ELIcon name="chevron" size={20} color="#C8B8AE" />
              </Link>
            ))}
          </div>
        </div>

        {/* 管理工具（管理員 / 版主才顯示） */}
        {isStaff && (
          <div style={{ padding: "16px 18px 0" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", letterSpacing: 0.5, marginBottom: 8, paddingLeft: 2 }}>管理工具</div>
            <Link href="/admin" className="click" style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 16px", borderRadius: 16, background: "#241F1B", textDecoration: "none", boxShadow: "0 8px 20px rgba(36,31,27,0.22)" }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(224,85,46,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ELIcon name="shield" size={24} color="#FFB59A" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>社區管理後台</div>
                <div style={{ marginTop: 2, fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>手機就能審核投稿、核銷物資</div>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(224,85,46,0.22)", color: "#FFB59A", fontSize: 12, fontWeight: 800, padding: "5px 9px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>前往</span>
            </Link>
          </div>
        )}

        {/* 登出 */}
        <div style={{ padding: "16px 18px 28px" }}>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", padding: "2px 16px" }}>
            <Link href="/auth/signout" className="click" style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 0", textDecoration: "none" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FDECEC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ELIcon name="logout" size={22} color="#D9534F" />
              </span>
              <span style={{ flex: 1, fontSize: 17, fontWeight: 700, color: "#D9534F" }}>登出</span>
            </Link>
          </div>
          <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 12, color: "#9C8E84" }}>幸福好厝邊 · 與您一起照顧家中長輩</p>
        </div>
      </div>

      {/* ── 桌機版 ── */}
      <div className="wv-desktop-only">
      {/* 頂部 gradient 標題帶 */}
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD", padding: "36px 0 32px" }}>
        <div className="wv-wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            {/* 86px 頭像 */}
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} style={{ width: 86, height: 86, borderRadius: "50%", flexShrink: 0, objectFit: "cover", boxShadow: "0 8px 24px rgba(224,85,46,0.30)" }} />
            ) : (
              <div style={{
                width: 86, height: 86, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#F2764F,#E0552E)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 34, fontWeight: 800, boxShadow: "0 8px 24px rgba(224,85,46,0.30)",
              }}>{initial}</div>
            )}

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#241F1B", marginBottom: 6 }}>{displayName}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#B23F1E", background: "#FFE7DD", borderRadius: 999, padding: "3px 12px" }}>{identityLabel}</span>
                {region && (
                  <span style={{ fontSize: 14, color: "#574E47", display: "flex", alignItems: "center", gap: 5 }}>
                    <ELIcon name="pin" size={14} color="#F26B43" /> {region}
                  </span>
                )}
              </div>
              {/* 統計列 */}
              <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
                {stats.map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#B23F1E" }}>{s.value}</div>
                    <div style={{ fontSize: 12.5, color: "#6E645C", fontWeight: 600, marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 編輯 + 登出 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <Link href="/profile/edit" style={{
                display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
                background: "#fff", border: "1.5px solid #E4D7CC", borderRadius: 999,
                fontSize: 15, fontWeight: 700, color: "#574E47", textDecoration: "none",
              }}>
                <ELIcon name="edit" size={16} color="#6E645C" /> 編輯資料
              </Link>
              <Link href="/auth/signout" style={{
                display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
                background: "#fff", border: "1.5px solid #E4D7CC", borderRadius: 999,
                fontSize: 15, fontWeight: 700, color: "#574E47", textDecoration: "none",
              }}>
                <ELIcon name="logout" size={16} color="#6E645C" /> 登出
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 區域 */}
      <div className="wv-wrap" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <ProfileTabs stats={stats} infoFields={infoFields} savedCount={savedCount ?? 0} />
      </div>
      </div>
    </div>
  );
}
