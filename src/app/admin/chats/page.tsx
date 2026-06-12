import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { adminSendLine } from "@/lib/line/chatActions";
import { AD, AdCard, AdPageHead, AdEmpty, adBtn } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";

type Msg = { id: string; line_user_id: string; display_name: string | null; direction: string; text: string; by_admin: boolean; created_at: string };

const fmt = (d: string) => new Date(d).toLocaleString("zh-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });

export default async function AdminChatsPage({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
  await requireRole("moderator");
  const { u } = await searchParams;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("line_messages")
    .select("id, line_user_id, display_name, direction, text, by_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(600);

  if (error) {
    return (
      <div>
        <AdPageHead title="聊天" desc="LINE bot 與使用者的對話" />
        <AdCard style={{ border: "1px solid #F5DCBE" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#B45309", marginBottom: 6 }}>尚未啟用對話資料表</div>
          <p style={{ margin: 0, fontSize: 14, color: AD.sub, lineHeight: 1.7 }}>
            請先在 Supabase 套用 migration
            <code style={{ background: "#FBF3EC", padding: "1px 6px", borderRadius: 6, margin: "0 4px" }}>0012_line_messages.sql</code>
            ，之後使用者跟 bot 的對話就會出現在這裡，你也能直接回覆。
          </p>
        </AdCard>
      </div>
    );
  }

  const msgs = (data ?? []) as Msg[];

  // 依使用者分組（latest first）
  const convMap = new Map<string, { userId: string; name: string; last: Msg }>();
  for (const m of msgs) {
    if (!convMap.has(m.line_user_id)) {
      convMap.set(m.line_user_id, { userId: m.line_user_id, name: m.display_name || "LINE 使用者", last: m });
    }
  }
  const convs = [...convMap.values()];
  const selectedId = u || convs[0]?.userId || "";
  const thread = msgs.filter((m) => m.line_user_id === selectedId).slice().reverse();
  const selectedName = convMap.get(selectedId)?.name ?? "LINE 使用者";

  if (convs.length === 0) {
    return (
      <div>
        <AdPageHead title="聊天" desc="LINE bot 與使用者的對話" />
        <div className="mt-3"><AdEmpty icon="chat" title="目前還沒有對話" desc="使用者在 LINE 傳訊息後會出現在這裡。" /></div>
      </div>
    );
  }

  return (
    <div>
      <AdPageHead title="聊天" desc="LINE bot 與使用者的對話，可直接人工回覆" />

      <div className="grid gap-4" style={{ gridTemplateColumns: "300px 1fr" }}>
        {/* 對話清單 */}
        <div className="wv-desktop-only" style={{ background: "#fff", border: `1px solid ${AD.border}`, borderRadius: 16, overflow: "hidden", height: "fit-content" }}>
          {convs.map((c) => {
            const on = c.userId === selectedId;
            return (
              <Link key={c.userId} href={`/admin/chats?u=${encodeURIComponent(c.userId)}`} style={{ display: "block", padding: "12px 14px", borderBottom: `1px solid ${AD.border}`, textDecoration: "none", background: on ? "#FFF4EF" : "#fff" }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: on ? AD.coralDark : AD.ink }}>{c.name}</div>
                <div style={{ marginTop: 2, fontSize: 12.5, color: AD.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.last.direction === "out" ? "你：" : ""}{c.last.text}
                </div>
                <div style={{ marginTop: 2, fontSize: 11.5, color: AD.muted }}>{fmt(c.last.created_at)}</div>
              </Link>
            );
          })}
        </div>

        {/* 對話內容 + 回覆 */}
        <AdCard style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 420 }}>
          <div style={{ padding: "13px 16px", borderBottom: `1px solid ${AD.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#F2764F,#E0552E)", color: "#fff", fontSize: 14, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {selectedName.slice(0, 1)}
            </span>
            <span style={{ fontSize: 15.5, fontWeight: 800, color: AD.ink }}>{selectedName}</span>
            {/* 手機版：回對話清單 */}
            <Link href="/admin/chats" className="wv-mobile-only" style={{ marginLeft: "auto", ...adBtn("neutral"), minHeight: 32, fontSize: 12.5 }}>清單</Link>
          </div>

          <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto" }}>
            {thread.map((m) => {
              const out = m.direction === "out";
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "78%", padding: "9px 13px", borderRadius: 14, fontSize: 14.5, lineHeight: 1.5, whiteSpace: "pre-wrap", background: out ? "#E0552E" : "#F0E6DE", color: out ? "#fff" : AD.ink, borderBottomRightRadius: out ? 4 : 14, borderBottomLeftRadius: out ? 14 : 4 }}>
                    {m.text}
                    <div style={{ marginTop: 4, fontSize: 11, color: out ? "rgba(255,255,255,0.7)" : AD.muted }}>
                      {out ? (m.by_admin ? "你回覆" : "bot") : ""} {fmt(m.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 回覆框 */}
          <form action={adminSendLine.bind(null, selectedId)} style={{ borderTop: `1px solid ${AD.border}`, padding: "12px 14px", display: "flex", gap: 10 }}>
            <input name="text" placeholder="輸入回覆給這位使用者…" required autoComplete="off"
              style={{ flex: 1, minHeight: 44, padding: "0 14px", borderRadius: 12, border: `1.5px solid ${AD.line}`, background: "#fff", color: AD.ink, fontSize: 15, fontFamily: "inherit", outline: "none" }} />
            <button type="submit" style={adBtn("coral")}>
              <ELIcon name="send" size={16} color="#fff" /> 送出
            </button>
          </form>
        </AdCard>
      </div>
    </div>
  );
}
