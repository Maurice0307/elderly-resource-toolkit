import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ELIcon } from "@/components/layout/ELIcon";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

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
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD", padding: "36px 0 32px" }}>
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
                    <div style={{ fontSize: 12.5, color: "#6E645C", fontWeight: 600, marginTop: 1 }}>{s.label}</div>
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
              <ELIcon name="logout" size={16} color="#6E645C" /> 登出
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
