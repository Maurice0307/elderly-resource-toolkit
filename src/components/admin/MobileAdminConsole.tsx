"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ELIcon } from "@/components/layout/ELIcon";

/* 手機版「社區管理」後台 — 視覺對齊設計稿 admin-mobile.jsx（示意資料） */

type Sub = { id: string; name: string; cat: string; who: string; identity: string; region: string; phone: string; address: string; note: string; time: string; dup: number };
const SUBS: Sub[] = [
  { id: "s1", name: "中壢老人共餐據點（每週三）", cat: "休閒活動", who: "王志工", identity: "志工", region: "中壢區", phone: "03-422-1234", address: "中壢區中山路 100 號 活動中心", note: "提供 65 歲以上長者共餐，每餐 30 元，需事先電話登記。", time: "8 分鐘前", dup: 78 },
  { id: "s2", name: "復康巴士預約電話更新", cat: "交通接駁", who: "陳秀英", identity: "家人", region: "平鎮區", phone: "03-332-6789", address: "", note: "原電話已停用，更新為新號碼。", time: "1 小時前", dup: 45 },
  { id: "s3", name: "社區血壓量測站（活動中心）", cat: "醫療健康", who: "張里長", identity: "其他", region: "中壢區", phone: "03-425-2360", address: "中壢區元化路 50 號", note: "每週一、四上午免費量血壓。", time: "3 小時前", dup: 0 },
];
const QUEUE = [
  { tone: "rejected" as const, type: "回報", name: "中壢區衛生所電話可能有誤", who: "李先生回報", time: "32 分鐘前" },
  { tone: "info" as const, type: "問答", name: "「平鎮哪裡可借輪椅？」待指派", who: "李先生 · 長輩", time: "2 小時前" },
];
const MEMBERS = [
  { id: "m1", name: "林管理員", sub: "里長 · 中壢區", role: "admin", initial: "林", me: true },
  { id: "m2", name: "王志工", sub: "共餐據點志工", role: "volunteer", initial: "王" },
  { id: "m3", name: "陳秀英", sub: "社區家屬", role: "member", initial: "陳" },
  { id: "m4", name: "張里幹事", sub: "里辦公處", role: "volunteer", initial: "張" },
  { id: "m5", name: "李先生", sub: "獨居長者", role: "member", initial: "李" },
];
const ROLES: Record<string, { label: string; bg: string; color: string; desc: string }> = {
  admin: { label: "管理員", bg: "#FFF1E8", color: "#C2410C", desc: "可審核投稿、核銷物資、管理成員" },
  volunteer: { label: "志工", bg: "#E7F6EC", color: "#1E9E54", desc: "可回答問答、投稿資源" },
  member: { label: "一般成員", bg: "#F5F0E8", color: "#78716C", desc: "一般使用者" },
};
const CAT_OPTS = ["醫療健康", "交通接駁", "居住安全", "經濟財務", "社會資源", "休閒活動", "教育進修"];
const REJECT_REASONS = ["與現有資源重複", "資訊不正確或過期", "非長者相關資源", "聯絡方式無法查證", "內容不完整"];

function Pill({ tone, children }: { tone: "coral" | "info" | "rejected" | "ok" | "pending"; children: React.ReactNode }) {
  const m: Record<string, [string, string]> = {
    coral: ["#FFE0D2", "#B23F1E"], info: ["#EAF1FB", "#2A63C0"], rejected: ["#FCEBEA", "#C0392B"], ok: ["#E7F6EC", "#1E9E54"], pending: ["#FEF1E2", "#B45309"],
  };
  const [bg, color] = m[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
}

type Counts = { pending: number; resources: number; questions: number; news: number; users: number };

export function MobileAdminConsole({ displayName, counts }: { displayName: string; counts: Counts }) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "review" | "members">("overview");
  const [subs, setSubs] = useState(SUBS);
  const [review, setReview] = useState<Sub | null>(null);

  const resolve = (id: string) => { setSubs((l) => l.filter((x) => x.id !== id)); setReview(null); };
  const TABS = [["overview", "總覽"], ["review", "審核"], ["members", "成員"]] as const;

  return (
    <div className="wv-mobile-only wv-admin-fullbleed" style={{ background: "#FAF6F2", minHeight: "100vh" }}>
      {/* 深色管理頂列 */}
      <div style={{ background: "#241F1B", padding: "8px 14px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => router.push("/profile")} aria-label="返回" style={{ width: 38, height: 38, borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>社區管理</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>管理員 · {displayName}</div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, background: "rgba(224,85,46,0.22)", color: "#FFB59A", fontSize: 12, fontWeight: 800 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: "#F26B43" }} /> 管理模式
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 6, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 4 }}>
          {TABS.map(([k, lb]) => {
            const on = tab === k;
            const badge = k === "review" ? subs.length : 0;
            return (
              <button key={k} onClick={() => setTab(k)} style={{ flex: 1, minHeight: 40, borderRadius: 9, border: "none", background: on ? "#fff" : "transparent", color: on ? "#241F1B" : "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                {lb}{badge > 0 && <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "#E0552E", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview" && <Overview counts={{ ...counts, pending: subs.length }} subs={subs} onGo={setTab} onReview={setReview} />}
      {tab === "review" && <ReviewList subs={subs} onReview={setReview} />}
      {tab === "members" && <Members displayName={displayName} />}

      {review && <ReviewSheet sub={review} onClose={() => setReview(null)} onResolve={resolve} />}
    </div>
  );
}

function Overview({ counts, subs, onGo, onReview }: { counts: Counts; subs: Sub[]; onGo: (t: "overview" | "review" | "members") => void; onReview: (s: Sub) => void }) {
  const router = useRouter();
  // 四張資料卡 → 連到對應管理頁（統一線條色）
  const kpis: [string, number, string, () => void][] = [
    ["news", counts.resources, "已發布資源", () => router.push("/admin/resources")],
    ["qa", counts.questions, "問答", () => router.push("/admin/questions")],
    ["megaphone", counts.news, "新聞", () => router.push("/admin/news")],
    ["social", counts.users, "用戶成員", () => router.push("/admin/users")],
  ];
  // 快速操作（最常用、特別拉出來）→ 直接進到對應的真實頁面 / 分頁
  const quick: [string, string, () => void][] = [
    ["send", "投稿審核", () => onGo("review")],
    ["flag", "問題回報", () => router.push("/admin/reports")],
    ["social", "成員權限", () => onGo("members")],
  ];
  return (
    <div style={{ padding: "16px 16px 28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
        {kpis.map(([ic, v, lb, go]) => (
          <button key={lb} onClick={go} style={{ textAlign: "left", background: "#fff", border: "1px solid #F0E6DE", borderRadius: 18, padding: "14px 15px", fontFamily: "inherit", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center" }}><ELIcon name={ic} size={20} color="#F26B43" /></span>
              <ELIcon name="chevron" size={18} color="#C8B8AE" />
            </div>
            <div style={{ marginTop: 12, fontSize: 26, fontWeight: 800, color: "#241F1B", lineHeight: 1 }}>{v}</div>
            <div style={{ marginTop: 5, fontSize: 13, color: "#9C8E84", fontWeight: 600 }}>{lb}</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 18, fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 12 }}>快速操作</div>
      <div style={{ display: "flex", gap: 11 }}>
        {quick.map(([ic, lb, go]) => (
          <button key={lb} onClick={go} style={{ flex: 1, background: "#fff", border: "1px solid #F0E6DE", borderRadius: 18, padding: "16px 12px", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}><ELIcon name={ic} size={23} color="#F26B43" /></span>
            <div style={{ marginTop: 10, fontSize: 14.5, fontWeight: 800, color: "#241F1B" }}>{lb}</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>待處理佇列</span>
        <span onClick={() => onGo("review")} style={{ fontSize: 13, fontWeight: 700, color: "#B23F1E", cursor: "pointer" }}>看全部 ›</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {subs.slice(0, 2).map((s) => (
          <button key={s.id} onClick={() => onReview(s)} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #F0E6DE", borderRadius: 16, padding: "13px 14px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <Pill tone="coral">投稿</Pill>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "#241F1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
              <div style={{ marginTop: 2, fontSize: 12, color: "#9C8E84" }}>{s.who} · {s.time}</div>
            </div>
            <ELIcon name="chevron" size={20} color="#9C8E84" />
          </button>
        ))}
        {QUEUE.map((q, i) => (
          <button key={i} onClick={() => router.push(q.type === "回報" ? "/admin/reports" : "/admin/questions")} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #F0E6DE", borderRadius: 16, padding: "13px 14px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%" }}>
            <Pill tone={q.tone}>{q.type}</Pill>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "#241F1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.name}</div>
              <div style={{ marginTop: 2, fontSize: 12, color: "#9C8E84" }}>{q.who} · {q.time}</div>
            </div>
            <ELIcon name="chevron" size={20} color="#9C8E84" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewList({ subs, onReview }: { subs: Sub[]; onReview: (s: Sub) => void }) {
  if (subs.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <div style={{ width: 78, height: 78, borderRadius: 999, background: "#E7F6EC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <ELIcon name="check" size={40} color="#1E9E54" stroke={2.2} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>全部審核完成</div>
        <p style={{ margin: "6px 0 0", fontSize: 15, color: "#9C8E84", lineHeight: 1.6 }}>目前沒有待審的投稿，辛苦您了！</p>
      </div>
    );
  }
  return (
    <div style={{ padding: "14px 16px 28px", display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={{ fontSize: 13, color: "#9C8E84", padding: "0 2px" }}>共 {subs.length} 則待審投稿 · 點開可修改後發布</div>
      {subs.map((s) => (
        <button key={s.id} onClick={() => onReview(s)} style={{ display: "block", width: "100%", textAlign: "left", background: "#fff", border: "1px solid #F0E6DE", borderLeft: "4px solid #F26B43", borderRadius: 16, padding: "15px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(40,30,20,0.04)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{s.name}</div>
              <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                <Pill tone="coral">{s.cat}</Pill>
                <span style={{ fontSize: 12.5, color: "#9C8E84" }}>{s.region} · {s.who}（{s.identity}）</span>
              </div>
            </div>
            {s.dup > 0 && <Pill tone="pending">疑重複</Pill>}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <span style={{ flex: 1, minHeight: 42, borderRadius: 10, border: "1.5px solid #E4D7CC", color: "#C0392B", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><ELIcon name="close" size={17} color="#C0392B" stroke={2.2} /> 退回</span>
            <span style={{ flex: 1.4, minHeight: 42, borderRadius: 10, background: "#1E9E54", color: "#fff", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><ELIcon name="check" size={17} color="#fff" stroke={2.4} /> 查看並發布</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Members({ displayName }: { displayName: string }) {
  // 把「您」這位成員換成目前登入的管理員本人
  const initial = (displayName || "您").trim().slice(0, 1).toUpperCase();
  const seeded = MEMBERS.map((m) => (m.me ? { ...m, name: displayName || m.name, initial } : m));
  const [members, setMembers] = useState(seeded);
  const [edit, setEdit] = useState<typeof MEMBERS[number] | null>(null);
  const setRole = (id: string, role: string) => { setMembers((l) => l.map((m) => (m.id === id ? { ...m, role } : m))); setEdit(null); };
  return (
    <div style={{ padding: "14px 16px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "#9C8E84" }}>共 {members.length} 位成員 · 點「權限」可調整</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, minHeight: 38, padding: "0 13px", borderRadius: 999, border: "1.5px solid #E0552E", background: "#FFF4EF", color: "#B23F1E", fontSize: 13, fontWeight: 800 }}>
          <ELIcon name="user" size={16} color="#B23F1E" /> 邀請成員
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {members.map((m) => {
          const r = ROLES[m.role];
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #F0E6DE", borderRadius: 16, padding: "13px 14px" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#F2764F,#E0552E)", color: "#fff", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 15.5, fontWeight: 800, color: "#241F1B" }}>{m.name}</span>
                  {m.me && <span style={{ fontSize: 11, fontWeight: 700, color: "#9C8E84" }}>（您）</span>}
                </div>
                <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: r.bg, color: r.color }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: "#9C8E84", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.sub}</span>
                </div>
              </div>
              <button onClick={m.me ? undefined : () => setEdit(m)} style={{ minHeight: 38, padding: "0 13px", borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff", color: m.me ? "#9C8E84" : "#574E47", fontSize: 13, fontWeight: 800, cursor: m.me ? "default" : "pointer", fontFamily: "inherit", flexShrink: 0, opacity: m.me ? 0.5 : 1 }}>權限</button>
            </div>
          );
        })}
      </div>
      <p style={{ margin: "16px 2px 0", fontSize: 12, color: "#9C8E84", lineHeight: 1.6 }}>管理員可審核投稿、核銷物資與調整成員權限；志工可回答問答與投稿。請謹慎授予管理員權限。</p>

      {edit && typeof document !== "undefined" && createPortal(
        <div onClick={() => setEdit(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20,12,8,0.55)", display: "flex", alignItems: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "#fff", borderRadius: "22px 22px 0 0", padding: "20px 18px calc(20px + env(safe-area-inset-bottom))" }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: "#E4D7CC", margin: "0 auto 16px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 14 }}>調整「{edit.name}」的權限</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.keys(ROLES).map((key) => {
                const r = ROLES[key];
                const on = edit.role === key;
                return (
                  <button key={key} onClick={() => setRole(edit.id, key)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "14px 15px", borderRadius: 13, fontFamily: "inherit", cursor: "pointer", border: `2px solid ${on ? "#E0552E" : "#E4D7CC"}`, background: on ? "#FFF4EF" : "#fff" }}>
                    <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, border: `2px solid ${on ? "#E0552E" : "#E4D7CC"}`, background: on ? "#E0552E" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{on && <ELIcon name="check" size={15} color="#fff" stroke={3} />}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: on ? "#B23F1E" : "#241F1B" }}>{r.label}</span>
                      <span style={{ display: "block", marginTop: 2, fontSize: 13, color: "#9C8E84", lineHeight: 1.45 }}>{r.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function ReviewSheet({ sub, onClose, onResolve }: { sub: Sub; onClose: () => void; onResolve: (id: string) => void }) {
  const [mode, setMode] = useState<"review" | "reject">("review");
  const [reasons, setReasons] = useState<Record<string, boolean>>({});
  const reasonText = Object.keys(reasons).filter((k) => reasons[k]).join("、");

  if (typeof document === "undefined") return null;
  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20,12,8,0.55)", display: "flex", alignItems: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxHeight: "90dvh", background: "#fff", borderRadius: "22px 22px 0 0", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 10px", borderBottom: "1px solid #F0E6DE" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>{mode === "reject" ? "退回投稿" : "審核投稿"}</div>
            <Pill tone="pending">待審</Pill>
          </div>
          <button onClick={onClose} aria-label="關閉" style={{ width: 38, height: 38, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ELIcon name="close" size={20} color="#574E47" stroke={2.2} /></button>
        </div>

        {mode === "reject" ? (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
              <p style={{ margin: "0 0 14px", fontSize: 15, color: "#574E47", lineHeight: 1.6 }}>請選擇退回原因，會一併通知投稿者「{sub.who}」並留存紀錄。</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {REJECT_REASONS.map((r) => {
                  const on = !!reasons[r];
                  return (
                    <button key={r} onClick={() => setReasons((m) => ({ ...m, [r]: !m[r] }))} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", padding: "13px 14px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", border: `2px solid ${on ? "#E0552E" : "#E4D7CC"}`, background: on ? "#FFF4EF" : "#fff" }}>
                      <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: `2px solid ${on ? "#E0552E" : "#E4D7CC"}`, background: on ? "#E0552E" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{on && <ELIcon name="check" size={15} color="#fff" stroke={3} />}</span>
                      <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: on ? "#B23F1E" : "#241F1B" }}>{r}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ flexShrink: 0, borderTop: "1px solid #F0E6DE", padding: "12px 18px calc(12px + env(safe-area-inset-bottom))", display: "flex", gap: 10 }}>
              <button onClick={() => setMode("review")} style={{ flex: 1, height: 52, borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff", color: "#574E47", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>返回</button>
              <button onClick={() => reasonText && onResolve(sub.id)} style={{ flex: 1.5, height: 52, borderRadius: 999, border: "none", background: reasonText ? "#C0392B" : "#E7C9BC", color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: reasonText ? "pointer" : "default", fontFamily: "inherit" }}>
                <ELIcon name="send" size={18} color="#fff" /> 退回並通知
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 13px", borderRadius: 12, background: "#FAF6F2", marginBottom: 12 }}>
                <ELIcon name="user" size={18} color="#9C8E84" />
                <span style={{ fontSize: 13, color: "#9C8E84" }}>投稿者</span>
                <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 700, color: "#241F1B" }}>{sub.who}（{sub.identity}）· {sub.time}</span>
              </div>
              <div style={{ border: "1px solid #F0E6DE", borderRadius: 12, padding: "12px 13px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#B23F1E", marginBottom: 8 }}>投稿原文</div>
                {([["名稱", sub.name], ["分類", sub.cat], ["地區", sub.region], ["電話", sub.phone], ["地址", sub.address || "（未填）"], ["說明", sub.note]] as const).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, padding: "3px 0", fontSize: 13, lineHeight: 1.5 }}>
                    <span style={{ width: 38, flexShrink: 0, color: "#9C8E84" }}>{k}</span>
                    <span style={{ flex: 1, color: "#241F1B", fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              {sub.dup > 0 && (
                <div style={{ display: "flex", gap: 9, padding: "11px 13px", borderRadius: 12, background: "#FEF1E2", marginBottom: 14 }}>
                  <ELIcon name="qa" size={18} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "#92400E", lineHeight: 1.5 }}>系統比對：與現有資源相似度 {sub.dup}%，請參考後修改或退回。</span>
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 800, color: "#574E47", marginBottom: 8 }}>可修改後再發布</div>
              <Field label="資源名稱"><input defaultValue={sub.name} style={inp} /></Field>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><Field label="分類"><select defaultValue={sub.cat} style={inp}>{CAT_OPTS.map((o) => <option key={o}>{o}</option>)}</select></Field></div>
                <div style={{ flex: 1 }}><Field label="地區"><input defaultValue={sub.region} style={inp} /></Field></div>
              </div>
              <Field label="聯絡電話"><input defaultValue={sub.phone} inputMode="tel" style={inp} /></Field>
              <Field label="地址"><input defaultValue={sub.address} placeholder="可留空" style={inp} /></Field>
              <Field label="說明"><textarea defaultValue={sub.note} style={{ ...inp, minHeight: 88, padding: "12px", resize: "vertical" }} /></Field>
            </div>
            <div style={{ flexShrink: 0, borderTop: "1px solid #F0E6DE", padding: "12px 18px calc(12px + env(safe-area-inset-bottom))", display: "flex", gap: 10 }}>
              <button onClick={() => setMode("reject")} style={{ flex: 1, height: 52, borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff", color: "#C0392B", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: "inherit" }}>
                <ELIcon name="close" size={19} color="#C0392B" stroke={2.2} /> 退回
              </button>
              <button onClick={() => onResolve(sub.id)} style={{ flex: 1.5, height: 52, borderRadius: 999, border: "none", background: "#1E9E54", color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: "inherit" }}>
                <ELIcon name="check" size={19} color="#fff" stroke={2.4} /> 發布
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

const inp: React.CSSProperties = { width: "100%", minHeight: 52, padding: "0 12px", borderRadius: 10, border: "2px solid #E4D7CC", background: "#fff", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#241F1B", outline: "none", boxSizing: "border-box" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#574E47", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
