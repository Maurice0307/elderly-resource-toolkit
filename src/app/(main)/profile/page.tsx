import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ELIcon } from "@/components/layout/ELIcon";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

export const metadata = { title: "個人中心" };

function NotLoggedIn() {
  return (
    <div className="wv-fade">
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE3D5)", borderBottom: "1px solid #FFE7DD", padding: "44px 0 36px" }}>
        <div className="wv-wrap">
          <h1 style={{ margin: 0, fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800, color: "#241F1B" }}>個人中心</h1>
        </div>
      </div>
      <div className="wv-wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div style={{
          maxWidth: 620, margin: "0 auto", background: "#fff", borderRadius: 24,
          border: "1px solid #F0E6DE", boxShadow: "0 2px 16px rgba(36,31,27,0.06)",
          padding: "48px 36px", textAlign: "center",
        }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FFF4EF", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ELIcon name="user" size={36} color="#F26B43" />
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#241F1B" }}>尚未登入</h2>
          <p style={{ margin: "0 0 22px", fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>登入後可以：</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", textAlign: "left", display: "inline-block" }}>
            {[
              { icon: "heart", t: "儲存最喜歡的照顧資源" },
              { icon: "cards", t: "追蹤學習進度與圖卡" },
              { icon: "qa", t: "在問答區提問與回答" },
              { icon: "send", t: "投稿分享好資源給社區" },
            ].map((b) => (
              <li key={b.t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 16, color: "#574E47", fontWeight: 600 }}>
                <ELIcon name={b.icon} size={18} color="#F26B43" /> {b.t}
              </li>
            ))}
          </ul>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "#E0552E", color: "#fff", borderRadius: 999, height: 52, padding: "0 36px",
            fontSize: 17, fontWeight: 800, textDecoration: "none",
            boxShadow: "0 6px 16px rgba(224,85,46,0.26)",
          }}>登入 / 註冊</Link>
        </div>
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
  const region = (user.user_metadata?.region as string | undefined) ?? "";

  const [{ count: savedCount }, { count: submittedCount }, { count: qaCount }] =
    await Promise.all([
      supabase.from("resource_likes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("resources").select("*", { count: "exact", head: true }).eq("submitted_by", user.id),
      supabase.from("questions").select("*", { count: "exact", head: true }).eq("author_id", user.id),
    ]);

  const stats = [
    { label: "收藏", value: String(savedCount ?? 0) },
    { label: "投稿", value: String(submittedCount ?? 0) },
    { label: "問答", value: String(qaCount ?? 0) },
    { label: "圖卡", value: "—" },
  ];

  const infoFields = [
    { label: "顯示名稱", value: displayName },
    { label: "電子信箱", value: user.email ?? "—" },
    { label: "所在地區", value: region || "未設定" },
    { label: "身份", value: "家人" },
  ];

  return (
    <div className="wv-fade">
      {/* 頂部 gradient 標題帶 */}
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE3D5)", borderBottom: "1px solid #FFE7DD", padding: "36px 0 32px" }}>
        <div className="wv-wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            {/* 86px 頭像 */}
            <div style={{
              width: 86, height: 86, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#F2764F,#E0552E)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 34, fontWeight: 800, boxShadow: "0 8px 24px rgba(224,85,46,0.30)",
            }}>{initial}</div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#241F1B", marginBottom: 6 }}>{displayName}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#B23F1E", background: "#FFE7DD", borderRadius: 999, padding: "3px 12px" }}>家人</span>
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
                    <div style={{ fontSize: 12.5, color: "#9B8E85", fontWeight: 600, marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 登出 */}
            <Link href="/auth/signout" style={{
              display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
              background: "#fff", border: "1.5px solid #E4D7CC", borderRadius: 999,
              fontSize: 15, fontWeight: 700, color: "#574E47", textDecoration: "none", flexShrink: 0,
            }}>
              <ELIcon name="logout" size={16} color="#9B8E85" /> 登出
            </Link>
          </div>
        </div>
      </div>

      {/* Tab 區域 */}
      <div className="wv-wrap" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <ProfileTabs stats={stats} infoFields={infoFields} savedCount={savedCount ?? 0} />
      </div>
    </div>
  );
}
