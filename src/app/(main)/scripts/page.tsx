import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CommunicationScript, ScriptAudience } from "@/types/domain";

export const metadata = { title: "溝通錦囊" };

const audiences: { slug: ScriptAudience; label: string; emoji: string; desc: string }[] = [
  { slug: "volunteer", label: "志工篇",   emoji: "🤝", desc: "敲門術、破冰、建立信任" },
  { slug: "family",    label: "家屬篇",   emoji: "❤️", desc: "日常關心、情緒同理" },
  { slug: "difficult", label: "困難情境", emoji: "💪", desc: "勸醫就診、防詐騙溝通" },
];

async function getScripts(): Promise<CommunicationScript[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communication_scripts")
    .select("*")
    .eq("status", "active")
    .order("audience")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as CommunicationScript[];
}

export default async function ScriptsPage() {
  const scripts = await getScripts();
  const byAudience = Object.fromEntries(
    audiences.map((a) => [a.slug, scripts.filter((s) => s.audience === a.slug)]),
  );

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "#FFFBF5" }}>
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-lg font-medium" style={{ color: "#B45309" }}>
          ← 回首頁
        </Link>

        <header className="mt-5">
          <h1 className="text-4xl font-bold" style={{ color: "#1C1917" }}>
            溝通錦囊
          </h1>
          <p className="mt-2 text-xl" style={{ color: "#57534E" }}>
            真實對話示範，讓每一次互動都更有溫度
          </p>
        </header>

        {audiences.map((a) => {
          const list = byAudience[a.slug] ?? [];
          return (
            <section key={a.slug} className="mt-12">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{a.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#1C1917" }}>
                    {a.label}
                  </h2>
                  <p className="text-base" style={{ color: "#78716C" }}>
                    {a.desc}
                  </p>
                </div>
              </div>

              {list.length === 0 ? (
                <div
                  className="mt-4 rounded-2xl p-8 text-center text-lg"
                  style={{ background: "#FEF3C7", color: "#92400E", border: "2px dashed #FDE68A" }}
                >
                  內容整理中，敬請期待
                </div>
              ) : (
                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {list.map((script) => (
                    <li key={script.id}>
                      <Link
                        href={`/scripts/${script.slug}`}
                        className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                        style={{ border: "2px solid #E7E5E4" }}
                      >
                        <h3
                          className="text-xl font-bold"
                          style={{ color: "#1C1917" }}
                        >
                          {script.title}
                        </h3>
                        {script.context ? (
                          <p
                            className="mt-2 line-clamp-2 text-base leading-relaxed"
                            style={{ color: "#57534E" }}
                          >
                            {script.context}
                          </p>
                        ) : null}
                        <div className="mt-4 flex items-center justify-between">
                          <span
                            className="rounded-full px-3 py-1 text-sm font-medium"
                            style={{ background: "#FEF3C7", color: "#92400E" }}
                          >
                            {script.ok_examples.length + script.ng_examples.length} 句對話
                          </span>
                          <span
                            className="text-base font-semibold transition group-hover:translate-x-1"
                            style={{ color: "#B45309" }}
                          >
                            查看 →
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
