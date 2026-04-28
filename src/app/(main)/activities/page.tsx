import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ActivityCard, ActivityGroup } from "@/types/domain";

export const metadata = { title: "互動圖卡" };

const groups: { slug: ActivityGroup; label: string; emoji: string; desc: string }[] = [
  { slug: "move",   label: "動動生活", emoji: "🏃", desc: "居家運動、防跌、保健操" },
  { slug: "create", label: "創意生活", emoji: "🎨", desc: "手工、園藝、創意活動" },
  { slug: "smart",  label: "智慧生活", emoji: "💡", desc: "營養飲食、數位工具教學" },
];

const interactSeries: { key: string; label: string; color: string; matchPrefix: string[] }[] = [
  { key: "craft", label: "手工美勞", color: "#DC2626", matchPrefix: ["手工美勞"] },
  { key: "plant", label: "花草植栽", color: "#15803D", matchPrefix: ["花草植栽"] },
  { key: "draw",  label: "創意繪畫", color: "#EA580C", matchPrefix: ["創意繪畫"] },
  { key: "body",  label: "動動身體", color: "#0369A1", matchPrefix: ["動動身體"] },
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

function isInteract(card: ActivityCard): boolean {
  return (card.tags ?? []).includes("陪伴互動");
}

function matchSeries(card: ActivityCard) {
  return interactSeries.find((s) => s.matchPrefix.some((p) => card.title.startsWith(p)));
}

export default async function ActivitiesPage() {
  const cards = await getCards();
  const interactCards = cards.filter(isInteract);
  const soloCards = cards.filter((c) => !isInteract(c));
  const byGroup = Object.fromEntries(
    groups.map((g) => [g.slug, soloCards.filter((c) => c.group_slug === g.slug)]),
  );
  const bySeries = Object.fromEntries(
    interactSeries.map((s) => [
      s.key,
      interactCards.filter((c) => matchSeries(c)?.key === s.key),
    ]),
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

        {/* ── 陪伴互動專區（志工 / 家屬帶領） ── */}
        {interactCards.length > 0 && (
          <section
            className="mt-10 rounded-3xl p-6 sm:p-8"
            style={{
              background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
              border: "2px solid #FDE68A",
            }}
          >
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl">🤝</span>
              <h2 className="text-2xl font-bold" style={{ color: "#92400E" }}>
                陪伴互動專區
              </h2>
              <span
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{ background: "#92400E", color: "#FFFBEB" }}
              >
                志工 / 家屬帶領
              </span>
            </div>
            <p className="mt-2 text-base" style={{ color: "#78716C" }}>
              專為「陪伴」設計：每張圖卡含進行前的話題、活動中的互動、完成後的分享，幫助與長輩建立連結。
            </p>

            {interactSeries.map((s) => {
              const list = bySeries[s.key] ?? [];
              if (list.length === 0) return null;
              return (
                <div key={s.key} className="mt-6">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1 w-8 rounded-full"
                      style={{ background: s.color }}
                    />
                    <h3
                      className="text-xl font-bold"
                      style={{ color: s.color }}
                    >
                      {s.label}
                    </h3>
                    <span className="text-sm" style={{ color: "#78716C" }}>
                      {list.length} 張
                    </span>
                  </div>
                  <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((card) => (
                      <li key={card.id}>
                        <Link
                          href={`/activities/${card.slug}`}
                          className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                          style={{ border: `2px solid ${s.color}30`, borderLeftWidth: 6, borderLeftColor: s.color }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{card.cover_emoji ?? "📋"}</span>
                            <h4
                              className="text-lg font-bold leading-snug"
                              style={{ color: "#1C1917" }}
                            >
                              {card.title.replace(/^.+?[①②③④⑤]?[:：]\s*/, "")}
                            </h4>
                          </div>
                          {card.summary && (
                            <p
                              className="mt-2 line-clamp-2 text-base leading-relaxed"
                              style={{ color: "#57534E" }}
                            >
                              {card.summary}
                            </p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <span
                              className="rounded-full px-3 py-1 text-sm font-medium"
                              style={{ background: s.color + "15", color: s.color }}
                            >
                              {card.steps.length} 步驟
                            </span>
                            <span
                              className="text-base font-semibold transition group-hover:translate-x-1"
                              style={{ color: s.color }}
                            >
                              開始 →
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        )}

        {/* ── 一般圖卡（自助式） ── */}
        {groups.map((g) => {
          const groupCards = byGroup[g.slug] ?? [];
          if (groupCards.length === 0 && interactCards.length > 0) return null;
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
