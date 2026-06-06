import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnswerForm } from "@/components/qa/AnswerForm";
import { VoteButton } from "@/components/qa/VoteButton";
import { AcceptButton } from "@/components/qa/AcceptButton";

type Params = { id: string };

type AnswerRow = {
  id: string;
  body: string;
  is_accepted: boolean;
  vote_count: number;
  created_at: string;
  author: { display_name: string } | { display_name: string }[] | null;
};

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("questions").select("title").eq("id", id).single();
  return { title: data?.title ?? "互助問答" };
}

export default async function QuestionPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: q }, { data: { user } }] = await Promise.all([
    supabase
      .from("questions")
      .select("*, region:regions(name), author:profiles(display_name)")
      .eq("id", id)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!q || q.status === "hidden") notFound();

  const { data: answerRows } = await supabase
    .from("answers")
    .select("*, author:profiles(display_name)")
    .eq("question_id", id)
    .order("is_accepted", { ascending: false })
    .order("vote_count", { ascending: false })
    .order("created_at", { ascending: true });

  const answers = answerRows ?? [];

  let votedIds = new Set<string>();
  if (user && answers.length > 0) {
    const { data: votes } = await supabase
      .from("answer_votes")
      .select("answer_id")
      .eq("user_id", user.id)
      .in("answer_id", answers.map((a: { id: string }) => a.id));
    votedIds = new Set((votes ?? []).map((v: { answer_id: string }) => v.answer_id));
  }

  const reg = Array.isArray(q.region) ? q.region[0] : q.region;
  const author = Array.isArray(q.author) ? q.author[0] : q.author;
  const isQuestionOwner = user?.id === q.user_id;
  const solved = q.status === "resolved";
  const dateStr = new Date(q.created_at).toLocaleDateString("zh-TW");

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100%", paddingBottom: 24 }}>
      {/* 返回列 */}
      <div style={{ background: "#fff", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <Link
          href="/qa"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--cta-ink)",
            textDecoration: "none",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          互助問答
        </Link>
      </div>

      {/* 問題卡 */}
      <div style={{ background: "#fff", padding: "18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {solved ? (
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--success)", background: "var(--success-soft)", borderRadius: 999, padding: "3px 10px" }}>
              ✓ 已解決
            </span>
          ) : (
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--warning)", background: "var(--warning-soft)", borderRadius: 999, padding: "3px 10px" }}>
              待回答
            </span>
          )}
          {reg?.name && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.8125rem", color: "var(--text-muted)", background: "var(--bg-soft)", borderRadius: 999, padding: "3px 10px" }}>
              📍 {reg.name}
            </span>
          )}
          {(q.tags as string[]).map((tag: string) => (
            <span key={tag} style={{ fontSize: "0.8125rem", color: "var(--cta-ink)", background: "var(--cta-soft)", borderRadius: 999, padding: "3px 10px" }}>
              #{tag}
            </span>
          ))}
        </div>

        <h1 style={{ margin: 0, fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.45 }}>
          {q.title}
        </h1>

        {q.body && (
          <p style={{ margin: "10px 0 0", fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {q.body}
          </p>
        )}

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--cta-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "var(--cta-ink)", flexShrink: 0 }}>
            {(author?.display_name ?? "匿名").slice(0, 1)}
          </div>
          {author?.display_name ?? "匿名"} · {dateStr}
        </div>
      </div>

      {/* 回答數 */}
      <div style={{ padding: "16px 18px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--text-muted)" }}>
          {answers.length} 則回答
        </span>
        {answers.length > 1 && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>依「有用」數排序</span>
        )}
      </div>

      {/* 回答列表 */}
      <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {answers.length === 0 && (
          <div style={{ padding: "32px 8px", textAlign: "center", color: "var(--text-muted)", fontSize: "1rem" }}>
            還沒有人回答，你知道答案嗎？
          </div>
        )}

        {(answers as AnswerRow[]).map((ans) => {
          const ansAuthor = Array.isArray(ans.author) ? ans.author[0] : ans.author;
          return (
            <div
              key={ans.id}
              style={{
                background: "#fff",
                border: `1px solid ${ans.is_accepted ? "var(--success)" : "var(--border)"}`,
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              {ans.is_accepted && (
                <div style={{ background: "var(--success-soft)", padding: "7px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", fontWeight: 800, color: "var(--success)" }}>
                  ✓ 最佳解答
                </div>
              )}
              <div style={{ padding: 15 }}>
                <p style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                  {ans.body}
                </p>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--cta-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "var(--cta-ink)", flexShrink: 0 }}>
                    {(ansAuthor?.display_name ?? "匿名").slice(0, 1)}
                  </div>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", flex: 1 }}>
                    {ansAuthor?.display_name ?? "匿名"} · {new Date(ans.created_at).toLocaleDateString("zh-TW")}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <VoteButton
                      answerId={ans.id}
                      questionId={id}
                      voteCount={ans.vote_count}
                      hasVoted={votedIds.has(ans.id)}
                      userId={user?.id ?? null}
                    />
                    <AcceptButton
                      answerId={ans.id}
                      questionId={id}
                      isAccepted={ans.is_accepted}
                      currentAcceptedId={q.accepted_answer_id ?? null}
                      isQuestionOwner={isQuestionOwner}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 回答表單 */}
      <div style={{ padding: "0 18px 24px" }}>
        <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 10 }}>
          留下你的回答
        </div>
        {user ? (
          <AnswerForm questionId={id} />
        ) : (
          <div style={{ background: "var(--cta-soft)", borderRadius: 14, padding: "16px 18px", textAlign: "center" }}>
            <Link href="/login" style={{ color: "var(--cta-ink)", fontWeight: 700 }}>登入</Link>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>後即可回答，幫助更多長輩 💛</span>
          </div>
        )}
      </div>
    </main>
  );
}
