import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { hideQuestion, restoreQuestion, deleteAnswer } from "@/lib/admin/actions";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireRole("moderator");
  const { view = "questions" } = await searchParams;
  const admin = createAdminClient();

  const { data: questions } = await admin
    .from("questions")
    .select("id, title, status, answer_count, created_at, author:profiles!user_id(display_name)")
    .in("status", ["open", "resolved", "hidden"])
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: answers } = await admin
    .from("answers")
    .select("id, body, created_at, question_id, author:profiles!user_id(display_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
        問答管理
      </h1>

      {/* Tabs */}
      <div className="mt-4 flex gap-2">
        {[
          { key: "questions", label: "問題" },
          { key: "answers", label: "回答" },
        ].map((t) => (
          <a
            key={t.key}
            href={`/admin/questions?view=${t.key}`}
            className="rounded-full px-5 py-2 text-base font-semibold"
            style={
              view === t.key
                ? { background: "var(--cta)", color: "var(--cta-on)" }
                : { background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1.5px solid var(--border)" }
            }
          >
            {t.label}
          </a>
        ))}
      </div>

      {view === "questions" && (
        <ul className="mt-6 space-y-3">
          {(questions ?? []).map((q) => {
            const author = Array.isArray(q.author) ? q.author[0] : q.author;
            return (
              <li
                key={q.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl p-5"
                style={{
                  background: "var(--bg-elevated)",
                  border: q.status === "hidden" ? "2px solid #FCA5A5" : "2px solid var(--border)",
                  opacity: q.status === "hidden" ? 0.75 : 1,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-sm font-semibold"
                      style={
                        q.status === "hidden"
                          ? { background: "var(--alert-soft)", color: "var(--alert)" }
                          : q.status === "resolved"
                          ? { background: "var(--success-soft)", color: "#065F46" }
                          : { background: "var(--bg-soft)", color: "var(--text-secondary)" }
                      }
                    >
                      {q.status === "hidden" ? "已隱藏" : q.status === "resolved" ? "已解決" : "開放中"}
                    </span>
                  </div>
                  <Link
                    href={`/qa/${q.id}`}
                    target="_blank"
                    className="mt-1 block text-xl font-bold leading-snug underline"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {q.title}
                  </Link>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {author?.display_name ?? "匿名"} · {new Date(q.created_at).toLocaleDateString("zh-TW")} · {q.answer_count} 則回答
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {q.status !== "hidden" ? (
                    <form action={hideQuestion.bind(null, q.id)}>
                      <button
                        type="submit"
                        className="rounded-full px-4 py-2 text-base font-semibold"
                        style={{ background: "var(--alert-soft)", color: "var(--alert)", border: "1.5px solid #FCA5A5", minHeight: "var(--hit)" }}
                      >
                        下架
                      </button>
                    </form>
                  ) : (
                    <form action={restoreQuestion.bind(null, q.id)}>
                      <button
                        type="submit"
                        className="rounded-full px-4 py-2 text-base font-semibold"
                        style={{ background: "var(--success-soft)", color: "#065F46", border: "1.5px solid #6EE7B7", minHeight: "var(--hit)" }}
                      >
                        恢復
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {view === "answers" && (
        <ul className="mt-6 space-y-3">
          {(answers ?? []).map((a) => {
            const author = Array.isArray(a.author) ? a.author[0] : a.author;
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-start gap-3 rounded-2xl p-5"
                style={{ background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-lg leading-relaxed line-clamp-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {a.body}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                    {author?.display_name ?? "匿名"} · {new Date(a.created_at).toLocaleDateString("zh-TW")}
                    {" · "}
                    <Link
                      href={`/qa/${a.question_id}`}
                      target="_blank"
                      className="underline"
                      style={{ color: "var(--cta)" }}
                    >
                      查看問題
                    </Link>
                  </p>
                </div>
                <form action={deleteAnswer.bind(null, a.id)} className="shrink-0">
                  <button
                    type="submit"
                    className="rounded-full px-4 py-2 text-base font-semibold"
                    style={{ background: "var(--alert-soft)", color: "var(--alert)", border: "1.5px solid #FCA5A5", minHeight: "var(--hit)" }}
                  >
                    刪除
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
