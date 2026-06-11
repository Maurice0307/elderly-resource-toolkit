import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import {
  hideQuestion, restoreQuestion, deleteAnswer,
  adminSetBestAnswer, adminUnsetBestAnswer,
} from "@/lib/admin/actions";
import { AD, AdPill, AdTab, AdCard, AdPageHead, AdEmpty, adBtn } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";

type Author = { display_name: string | null } | { display_name: string | null }[] | null;
const nameOf = (a: Author) => (Array.isArray(a) ? a[0]?.display_name : a?.display_name) ?? "匿名";

type AnsRow = { id: string; body: string; vote_count: number; is_accepted: boolean; question_id: string; author: Author };

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireRole("moderator");
  const { view = "verify" } = await searchParams;
  const admin = createAdminClient();

  // 待查證數量（開放中、有回答、尚未選最佳解答）→ 通知徽章
  const { count: verifyCount } = await admin
    .from("questions").select("id", { count: "exact", head: true })
    .eq("status", "open").gt("answer_count", 0).is("accepted_answer_id", null);

  // 問題清單（依分頁）
  let qQuery = admin
    .from("questions")
    .select("id, title, body, status, answer_count, accepted_answer_id, created_at, region_id, author:profiles!user_id(display_name)")
    .order("created_at", { ascending: false })
    .limit(40);
  if (view === "verify") {
    qQuery = qQuery.eq("status", "open").gt("answer_count", 0).is("accepted_answer_id", null);
  } else if (view === "questions") {
    qQuery = qQuery.in("status", ["open", "resolved", "hidden"]);
  }
  const { data: questions } = view === "answers" ? { data: [] } : await qQuery;

  // 抓出這些問題的所有回答
  const qIds = (questions ?? []).map((q) => q.id);
  const { data: ansData } = qIds.length
    ? await admin
        .from("answers")
        .select("id, body, vote_count, is_accepted, question_id, author:profiles!user_id(display_name)")
        .in("question_id", qIds)
        .order("vote_count", { ascending: false })
    : { data: [] };
  const ansForQ = (ansData ?? []) as unknown as AnsRow[];
  const ansByQ: Record<string, AnsRow[]> = {};
  for (const a of ansForQ) (ansByQ[a.question_id] ??= []).push(a);

  // 回答管理分頁
  const { data: answers } = view === "answers"
    ? await admin
        .from("answers")
        .select("id, body, created_at, question_id, author:profiles!user_id(display_name)")
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] as { id: string; body: string; created_at: string; question_id: string; author: Author }[] };

  const tabs = [
    { key: "verify", label: "待查證", badge: verifyCount ?? 0 },
    { key: "questions", label: "全部問題", badge: 0 },
    { key: "answers", label: "回答", badge: 0 },
  ];

  return (
    <div>
      <AdPageHead title="問答管理" desc="查證社區問答、挑選最佳解答並維護內容品質" />

      {/* 查證提示 */}
      {(verifyCount ?? 0) > 0 && view !== "verify" && (
        <Link href="/admin/questions?view=verify" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderRadius: 14, background: "#FEF1E2", border: "1px solid #F5DCBE", textDecoration: "none", marginBottom: 14 }}>
          <ELIcon name="megaphone" size={20} color="#B45309" />
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#92400E" }}>有 {verifyCount} 則問答等待你查證、挑選最佳解答</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#B45309" }}>前往處理 ›</span>
        </Link>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <AdTab key={t.key} href={`/admin/questions?view=${t.key}`} active={view === t.key}>
            {t.label}
            {t.badge > 0 && (
              <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "#E0552E", color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span>
            )}
          </AdTab>
        ))}
      </div>

      {/* 待查證 / 全部問題：問題卡 + 內嵌回答 + 設定最佳解答 */}
      {view !== "answers" && (
        (questions ?? []).length === 0 ? (
          <div className="mt-4">
            <AdEmpty icon={view === "verify" ? "check" : "qa"} title={view === "verify" ? "沒有待查證的問答" : "目前沒有問題"} desc={view === "verify" ? "所有有回答的問題都已挑好最佳解答，辛苦了！" : undefined} />
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            {(questions ?? []).map((q) => {
              const hidden = q.status === "hidden";
              const list = ansByQ[q.id] ?? [];
              return (
                <AdCard key={q.id} accent={hidden || (q.status === "open" && !q.accepted_answer_id && q.answer_count > 0)} style={hidden ? { opacity: 0.85 } : undefined}>
                  {/* 問題標題列 */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <AdPill tone={hidden ? "alert" : q.status === "resolved" ? "ok" : "pending"}>
                          {hidden ? "已隱藏" : q.status === "resolved" ? "已解決" : "待查證"}
                        </AdPill>
                        <span style={{ fontSize: 12.5, color: AD.muted }}>{nameOf(q.author)} · {new Date(q.created_at).toLocaleDateString("zh-TW")} · {q.answer_count} 則回答</span>
                      </div>
                      <Link href={`/qa/${q.id}`} target="_blank" style={{ display: "block", marginTop: 6, fontSize: 17, fontWeight: 800, color: AD.ink, lineHeight: 1.45, textDecoration: "none" }}>
                        {q.title}
                      </Link>
                      {q.body && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: AD.sub, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{q.body}</p>}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {!hidden ? (
                        <form action={hideQuestion.bind(null, q.id)}>
                          <button type="submit" style={adBtn("alert")}><ELIcon name="close" size={15} color="#C0392B" stroke={2.2} /> 下架</button>
                        </form>
                      ) : (
                        <form action={restoreQuestion.bind(null, q.id)}>
                          <button type="submit" style={adBtn("ok")}><ELIcon name="check" size={15} color="#1E7A43" stroke={2.4} /> 恢復</button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* 內嵌回答 */}
                  {list.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${AD.border}`, display: "flex", flexDirection: "column", gap: 9 }}>
                      {list.map((a) => (
                        <div key={a.id} style={{ borderRadius: 12, border: `1.5px solid ${a.is_accepted ? "#BDE8CC" : AD.border}`, background: a.is_accepted ? "#F1FAF4" : "#FCFAF8", padding: "11px 13px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: AD.ink }}>{nameOf(a.author)}</span>
                            <span style={{ fontSize: 12, color: AD.muted }}>· {a.vote_count} 讚</span>
                            {a.is_accepted && <AdPill tone="ok"><ELIcon name="check" size={12} color="#1E9E54" stroke={2.4} /> 最佳解答</AdPill>}
                          </div>
                          <div style={{ fontSize: 13.5, color: AD.ink, lineHeight: 1.6 }}>{a.body}</div>
                          <div style={{ marginTop: 9, display: "flex", gap: 7, flexWrap: "wrap" }}>
                            {a.is_accepted ? (
                              <form action={adminUnsetBestAnswer.bind(null, q.id)}>
                                <button type="submit" style={{ ...adBtn("neutral"), minHeight: 34, fontSize: 13 }}>取消最佳</button>
                              </form>
                            ) : (
                              <form action={adminSetBestAnswer.bind(null, q.id, a.id)}>
                                <button type="submit" style={{ ...adBtn("ok"), minHeight: 34, fontSize: 13 }}><ELIcon name="star" size={14} color="#1E7A43" /> 設為最佳解答</button>
                              </form>
                            )}
                            <form action={deleteAnswer.bind(null, a.id)}>
                              <button type="submit" style={{ ...adBtn("alert"), minHeight: 34, fontSize: 13 }}>刪除回答</button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AdCard>
              );
            })}
          </div>
        )
      )}

      {/* 回答管理 */}
      {view === "answers" && (
        (answers ?? []).length === 0 ? (
          <div className="mt-4"><AdEmpty icon="chat" title="目前沒有回答" /></div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            {(answers ?? []).map((a) => (
              <AdCard key={a.id}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 15, color: AD.ink, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.body}</p>
                    <p style={{ marginTop: 6, fontSize: 13, color: AD.muted }}>
                      {nameOf(a.author)} · {new Date(a.created_at).toLocaleDateString("zh-TW")}
                      {" · "}
                      <Link href={`/qa/${a.question_id}`} target="_blank" style={{ color: AD.coralDark, fontWeight: 700, textDecoration: "none" }}>查看問題</Link>
                    </p>
                  </div>
                  <form action={deleteAnswer.bind(null, a.id)} style={{ flexShrink: 0 }}>
                    <button type="submit" style={adBtn("alert")}>刪除</button>
                  </form>
                </div>
              </AdCard>
            ))}
          </div>
        )
      )}
    </div>
  );
}
