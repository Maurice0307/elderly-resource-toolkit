import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ActivityCard, ActivityGroup } from "@/types/domain";

export const metadata = { title: "互動圖卡" };

const groups: { slug: ActivityGroup; label: string; emoji: string; desc: string }[] = [
  { slug: "move",   label: "動動生活", emoji: "🏃", desc: "居家運動、防跌、保健操" },
  { slug: "create", label: "創意生活", emoji: "🎨", desc: "手工、園藝、創意活動" },
  { slug: "smart",  label: "智慧生活", emoji: "💡", desc: "營養飲食、數位工具教學" },
];

async function getCards(): Promise<ActivityCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_cards")
    .select("*")
    .eq("status", "active")
    .order("group_slug")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as ActivityCard[];
}

export default async function ActivitiesPage() {
  const cards = await getCards();
  const byGroup = Object.fromEntries(
    groups.map((g) => [g.slug, cards.filter((c) => c.group_slug === g.slug)]),
  );

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "#FFFBF5" }}>
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-lg font-medium" style={{ color: "#B45309" }}>
          ← 回首頁
        </Link>

        <header className="mt-5">
          <h1 className="text-4xl font-bold" style={{ color: "#1C1917" }}>
            互動圖卡
          </h1>
          <p className="mt-2 text-xl" style={{ color: "#57534E" }}>
            步驟式大圖卡，一鍵分享給家人與長輩
          </p>
        </header>

        {groups.map((g) => {
          const groupCards = byGroup[g.slug] ?? [];
          return (
            <section key={g.slug} className="mt-12">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{g.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#1C1917" }}>
                    {g.label}
                  </h2>
                  <p className="text-base" style={{ color: "#78716C" }}>
                    {g.desc}
                  </p>
                </div>
              </div>

              {groupCards.length === 0 ? (
                <div
                  className="mt-4 rounded-2xl p-8 text-center text-lg"
                  style={{ background: "#FEF3C7", color: "#92400E", border: "2px dashed #FDE68A" }}
                >
                  內容整理中，敬請期待
                </div>
              ) : (
                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupCards.map((card) => (
                    <li key={card.id}>
                      <Link
                        href={`/activities/${card.slug}`}
                        className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                        style={{ border: "2px solid #E7E5E4" }}
                      >
                        <span className="text-5xl">{card.cover_emoji ?? "📋"}</span>
                        <h3
                          className="mt-4 text-xl font-bold leading-snug"
                          style={{ color: "#1C1917" }}
                        >
                          {card.title}
                        </h3>
                        {card.summary ? (
                          <p
                            className="mt-2 text-base leading-relaxed"
                            style={{ color: "#57534E" }}
                          >
                            {card.summary}
                          </p>
                        ) : null}
                        <div className="mt-4 flex items-center justify-between">
                          <span
                            className="rounded-full px-3 py-1 text-sm font-medium"
                            style={{ background: "#FEF3C7", color: "#92400E" }}
                          >
                            {card.steps.length} 個步驟
                          </span>
                          <span
                            className="text-base font-semibold transition group-hover:translate-x-1"
                            style={{ color: "#B45309" }}
                          >
                            開始 →
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
