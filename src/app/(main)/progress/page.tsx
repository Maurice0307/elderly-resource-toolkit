import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";
import { ELIcon } from "@/components/layout/ELIcon";

export const metadata = { title: "學習進度追蹤" };

function Ring({ pct, label, sub }: { pct: number; label: string; sub: string }) {
  const size = 120, stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, pct) / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#FFE0D2" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E0552E" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#241F1B", lineHeight: 1 }}>{label}</div>
        <div style={{ marginTop: 3, fontSize: 12, color: "#6E645C", fontWeight: 600 }}>{sub}</div>
      </div>
    </div>
  );
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/progress");

  const [{ count: saved }, { count: qa }, { count: submitted }, { data: prof }] = await Promise.all([
    supabase.from("resource_likes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("questions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("resources").select("*", { count: "exact", head: true }).eq("submitted_by", user.id),
    supabase.from("profiles").select("identity, points").eq("id", user.id).maybeSingle(),
  ]);

  const savedN = saved ?? 0, qaN = qa ?? 0, subN = submitted ?? 0;
  const points = (prof?.points as number | undefined) ?? 0;
  const isVolunteer = prof?.identity === "volunteer";
  const level = Math.max(1, Math.floor(points / 100) + 1);
  const toNext = 100 - (points % 100);

  const stats = [
    { n: savedN, l: "收藏資源" },
    { n: qaN, l: "發問次數" },
    { n: subN, l: "分享資源" },
  ];

  // 成就由真實里程碑解鎖（含可獲點數與累計進度）
  const interact = savedN + qaN + subN;
  const achievements = [
    { icon: "heart", nm: "收藏新手", pts: 30, now: savedN, goal: 1, cond: "收藏第一筆資源" },
    { icon: "star", nm: "收藏家", pts: 100, now: savedN, goal: 10, cond: "收藏滿 10 筆資源" },
    { icon: "qa", nm: "勇於發問", pts: 50, now: qaN, goal: 1, cond: "提出第一個問題" },
    { icon: "send", nm: "熱心分享", pts: 80, now: subN, goal: 1, cond: "分享第一筆資源" },
    { icon: "medal", nm: "社區貢獻", pts: 120, now: subN, goal: 3, cond: "分享滿 3 筆資源" },
    { icon: "trophy", nm: isVolunteer ? "好厝邊志工" : "活躍會員", pts: 200, now: isVolunteer ? points : interact, goal: isVolunteer ? 100 : 5, cond: isVolunteer ? "累積 100 服務點數" : "互動滿 5 次" },
  ].map((a) => ({ ...a, on: a.now >= a.goal }));
  const got = achievements.filter((a) => a.on).length;

  return (
    <div className="wv-fade" style={{ background: "#FAF6F2", minHeight: "100%" }}>
      <MobileSubHeader title="學習進度追蹤" search={false} />

      <div style={{ padding: "0 0 28px" }}>
        {/* 等級環 */}
        <div style={{ background: "#fff", padding: "18px 18px 22px", borderBottom: "1px solid #F0E6DE" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, maxWidth: 640, margin: "0 auto" }}>
            <Ring pct={isVolunteer ? (points % 100) : Math.min(100, (savedN + qaN + subN) * 10)} label={isVolunteer ? `Lv.${level}` : `${savedN + qaN + subN}`} sub={isVolunteer ? "好厝邊" : "互動次數"} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>{isVolunteer ? "熱心志工" : "持續學習中"}</div>
              <div style={{ marginTop: 4, fontSize: 15, color: "#574E47", lineHeight: 1.55 }}>
                {isVolunteer ? <>再 <b style={{ color: "#B23F1E" }}>{toNext} 點</b> 升上 Lv.{level + 1}</> : <>已解鎖 <b style={{ color: "#B23F1E" }}>{got}</b> 個成就，繼續加油</>}
              </div>
              <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 999, background: "#FFF1E8" }}>
                <ELIcon name="medal" size={16} color="#E0552E" />
                <span style={{ fontSize: 13, fontWeight: 800, color: "#C2410C" }}>已收集 {got} / {achievements.length} 成就</span>
              </div>
            </div>
          </div>
        </div>

        {/* 數據 */}
        <div style={{ padding: "16px 18px 0", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", borderRadius: 16, border: "1px solid #F0E6DE", overflow: "hidden", background: "#fff" }}>
            {stats.map((s, i) => (
              <div key={s.l} style={{ flex: 1, textAlign: "center", padding: "16px 4px", borderLeft: i ? "1px solid #F0E6DE" : "none" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#B23F1E" }}>{s.n}</div>
                <div style={{ marginTop: 2, fontSize: 12.5, color: "#6E645C", fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 成就徽章 */}
        <div style={{ padding: "20px 18px 0", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#9C8E84", letterSpacing: 0.5, marginBottom: 10, paddingLeft: 2 }}>我的成就徽章</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 11 }}>
            {achievements.map((a) => (
              <div key={a.nm} style={{ background: "#fff", borderRadius: 16, padding: "16px 8px 12px", border: `1px solid ${a.on ? "#FFE0D2" : "#F0E6DE"}`, textAlign: "center" }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: a.on ? "linear-gradient(135deg,#FFE0D2,#FFF4EF)" : "#EFECE8", border: `2px solid ${a.on ? "#FFD6C7" : "#E4D7CC"}` }}>
                  <ELIcon name={a.on ? a.icon : "lock"} size={26} color={a.on ? "#E0552E" : "#A89C92"} />
                </div>
                <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 800, color: a.on ? "#241F1B" : "#8A7E74", lineHeight: 1.3 }}>{a.nm}</div>
                {a.on ? (
                  <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 999, background: "#E7F6EC", color: "#1E9E54", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
                    <ELIcon name="check" size={12} color="#1E9E54" stroke={2.6} /> +{a.pts} 點
                  </div>
                ) : (
                  <>
                    <div style={{ marginTop: 5, fontSize: 12, fontWeight: 800, color: "#B23F1E" }}>{Math.min(a.now, a.goal)} / {a.goal}</div>
                    <div style={{ marginTop: 3, fontSize: 10.5, color: "#9C8E84", fontWeight: 700 }}>解鎖得 {a.pts} 點</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
