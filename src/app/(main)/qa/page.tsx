import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "互助問答" };

type QuestionRow = {
  id: string;
  title: string;
  body: string | null;
  tags: string[];
  status: string;
  answer_count: number;
  created_at: string;
  region: { name: string } | null;
  author: { display_name: string | null } | null;
};

export default async function QAPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("questions")
    .select(
      "id, title, body, tags, status, answer_count, created_at, region:regions(name), author:profiles(display_name)",
    )
    .in("status", ["open", "resolved"])
    .order("created_at", { ascending: false })
    .limit(40);

  if (region) {
    const { data: reg } = await supabase
      .from("regions")
      .select("id")
      .eq("code", region)
      .single();
    if (reg) query = query.eq("region_id", reg.id);
  }

  const { data } = await query;
  const questions = (data ?? []) as unknown as QuestionRow[];

  const { data: regionRows } = await supabase
    .from("regions")
    .select("id, name, code")
    .eq("level", "county")
    .order("code");

  const regions = regionRows ?? [];

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "#FFFBF5" }}>
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-lg font-medium" style={{ color: "#B45309" }}>
          ← 回首頁
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: "#1C1917" }}>
              互助問答
            </h1>
            <p className="mt-2 text-xl" style={{ color: "#57534E" }}>
              有疑問就問，在地志工來解答
            </p>
          </div>
          <Link
            href="/qa/ask"
            className="rounded-2xl px-7 py-4 text-xl font-bold text-white transition hover:opacity-90"
            style={{ background: "#B45309" }}
          >
            ＋ 發問
          </Link>
        </div>

        {/* 地區篩選 */}
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href="/qa"
            className="rounded-full px-4 py-2 text-base font-semibold"
            style={
              !region
                ? { background: "#B45309", color: "#FFFFFF" }
                : { background: "#F5F0E8", color: "#78716C", border: "1.5px solid #E7E5E4" }
            }
          >
            全部地區
          </a>
          {regions.map((r) => (
            <a
              key={r.code}
              href={`/qa?region=${r.code}`}
              className="rounded-full px-4 py-2 text-base font-semibold"
              style={
                region === r.code
                  ? { background: "#B45309", color: "#FFFFFF" }
                  : { background: "#F5F0E8", color: "#78716C", border: "1.5px solid #E7E5E4" }
              }
            >
              {r.name}
            </a>
          ))}
        </div>

        {/* 問題列表 */}
        {questions.length === 0 ? (
          <div
            className="mt-10 rounded-2xl p-10 text-center text-xl"
            style={{ background: "#FEF3C7", color: "#92400E", border: "2px dashed #FDE68A" }}
          >
            <div className="text-5xl">💬</div>
            <p className="mt-4">還沒有問題，成為第一個發問的人吧！</p>
            <Link
              href="/qa/ask"
              className="mt-6 inline-block rounded-full px-6 py-3 text-lg font-semibold text-white"
              style={{ background: "#B45309" }}
            >
              立即發問
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {questions.map((q) => {
              const author = Array.isArray(q.author) ? q.author[0] : q.author;
              const reg = Array.isArray(q.region) ? q.region[0] : q.region;
              return (
                <li key={q.id}>
                  <Link
                    href={`/qa/${q.id}`}
                    className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                    style={{ border: "2px solid #E7E5E4" }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {q.status === "resolved" && (
                        <span
                          className="rounded-full px-3 py-1 text-sm font-semibold"
                          style={{ background: "#ECFDF5", color: "#065F46" }}
                        >
                          ✅ 已解決
                        </span>
                      )}
                      {reg && (
                        <span
                          className="rounded-full px-3 py-1 text-sm"
                          style={{ background: "#F5F0E8", color: "#78716C" }}
                        >
                          📍 {reg.name}
                        </span>
                      )}
                      {q.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-3 py-1 text-sm"
                          style={{ background: "#FEF3C7", color: "#92400E" }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h2
                      className="mt-3 text-2xl font-bold leading-snug"
                      style={{ color: "#1C1917" }}
                    >
                      {q.title}
                    </h2>
                    <div className="mt-3 flex items-center justify-between text-base" style={{ color: "#A8A29E" }}>
                      <span>
                        {author?.display_name ?? "匿名"} ·{" "}
                        {new Date(q.created_at).toLocaleDateString("zh-TW")}
                      </span>
                      <span className="font-semibold" style={{ color: q.answer_count > 0 ? "#065F46" : "#A8A29E" }}>
                        💬 {q.answer_count} 則回答
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
