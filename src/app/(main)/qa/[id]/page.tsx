import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnswerForm } from "@/components/qa/AnswerForm";
import { VoteButton } from "@/components/qa/VoteButton";
import { AcceptButton } from "@/components/qa/AcceptButton";

type Params = { id: string };

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
      .select(
        "*, region:regions(name), author:profiles(display_name)",
      )
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

  // Fetch user's votes on these answers
  let votedIds = new Set<string>();
  if (user && answers.length > 0) {
    const { data: votes } = await supabase
      .from("answer_votes")
      .select("answer_id")
      .eq("user_id", user.id)
      .in("answer_id", answers.map((a) => a.id));
    votedIds = new Set((votes ?? []).map((v) => v.answer_id));
  }

  const reg = Array.isArray(q.region) ? q.region[0] : q.region;
  const author = Array.isArray(q.author) ? q.author[0] : q.author;
  const isQuestionOwner = user?.id === q.user_id;

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-3xl">
        <Link href="/qa" className="text-lg font-medium" style={{ color: "var(--cta)" }}>
          ← 回問答區
        </Link>

        {/* 問題 */}
        <article
          className="mt-6 rounded-2xl p-8"
          style={{
            background: "var(--bg-elevated)",
            border: "2px solid var(--border)",
            borderLeftWidth: 6,
            borderLeftColor: q.status === "resolved" ? "var(--success)" : "var(--cta)",
          }}
        >
          <div className="flex flex-wrap gap-2">
            {q.status === "resolved" && (
              <span
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{ background: "var(--success-soft)", color: "#065F46" }}
              >
                ✅ 已解決
              </span>
            )}
            {reg && (
              <span
                className="rounded-full px-3 py-1 text-sm"
                style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}
              >
                📍 {reg.name}
              </span>
            )}
            {(q.tags as string[]).map((tag: string) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-sm"
                style={{ background: "var(--bg-accent)", color: "#92400E" }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
            {q.title}
          </h1>

          {q.body && (
            <p className="mt-4 text-xl leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
              {q.body}
            </p>
          )}

          <p className="mt-5 text-base" style={{ color: "var(--text-muted)" }}>
            {author?.display_name ?? "匿名"} ·{" "}
            {new Date(q.created_at).toLocaleDateString("zh-TW")}
          </p>
        </article>

        {/* 回答列表 */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {answers.length} 則回答
          </h2>

          {answers.length === 0 && (
            <div
              className="mt-4 rounded-2xl p-8 text-center text-xl"
              style={{ background: "var(--bg-accent)", color: "#92400E", border: "2px dashed #FDE68A" }}
            >
              還沒有人回答，你知道答案嗎？
            </div>
          )}

          <ul className="mt-4 space-y-5">
            {answers.map((ans) => {
              const ansAuthor = Array.isArray(ans.author) ? ans.author[0] : ans.author;
              return (
                <li
                  key={ans.id}
                  className="rounded-2xl p-7"
                  style={{
                    background: "var(--bg-elevated)",
                    border: ans.is_accepted
                      ? "2px solid #6EE7B7"
                      : "2px solid var(--border)",
                  }}
                >
                  <p
                    className="text-xl leading-relaxed whitespace-pre-line"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ans.body}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-base" style={{ color: "var(--text-muted)" }}>
                      {ansAuthor?.display_name ?? "匿名"} ·{" "}
                      {new Date(ans.created_at).toLocaleDateString("zh-TW")}
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                </li>
              );
            })}
          </ul>
        </section>

        {/* 回答表單 */}
        <section className="mt-10 border-t pt-8" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            留下你的回答
          </h2>
          {user ? (
            <AnswerForm questionId={id} />
          ) : (
            <div className="mt-4 rounded-2xl p-6 text-center text-xl" style={{ background: "var(--bg-accent)", color: "#92400E" }}>
              <Link href="/login" className="underline font-semibold">登入</Link>後即可回答，幫助更多長輩 💛
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
