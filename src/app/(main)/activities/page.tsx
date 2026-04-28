import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ActivityCard } from "@/types/domain";

export const metadata = { title: "互動圖卡" };

type Theme = {
  key: string;
  label: string;
  emoji: string;
  desc: string;
  color: string;
};

const themes: Theme[] = [
  { key: "craft", label: "手工美勞", emoji: "🎨", desc: "黏土、摺紙、書籤等手作", color: "#DC2626" },
  { key: "plant", label: "花草植栽", emoji: "🌿", desc: "種植、苔球、療癒系活動", color: "#15803D" },
  { key: "draw",  label: "創意繪畫", emoji: "🖌️", desc: "生命故事、禪繞畫、拼圖",   color: "#EA580C" },
  { key: "body",  label: "動動身體", emoji: "🏃", desc: "護膝、防跌、椅子運動",   color: "#0369A1" },
  { key: "smart", label: "智慧生活", emoji: "💡", desc: "營養飲食、數位工具教學",   color: "#7E22CE" },
  { key: "life",  label: "生活技能", emoji: "🏡", desc: "環保、居家安全、社區參與", color: "#0F766E" },
];

// 按 slug 明確指定主題（最穩定，不依賴標題或 group_slug）
const THEME_BY_SLUG: Record<string, string> = {
  // 手工美勞
  "interact-clay": "craft",
  "interact-origami-heart": "craft",
  "interact-origami-carnation": "craft",
  "interact-origami-bear": "craft",
  "interact-origami-bird": "craft",
  "interact-leaf-bookmark": "craft",
  // 花草植栽
  "interact-moss-ball": "plant",
  "interact-bean-sprout": "plant",
  "balcony-garden": "plant",
  // 創意繪畫
  "interact-life-story": "draw",
  "interact-zentangle": "draw",
  "interact-memory-puzzle": "draw",
  // 動動身體
  "interact-knee-care": "body",
  "chair-exercise": "body",
  "fall-prevention": "body",
  "morning-stretch": "body",
  // 智慧生活
  "my-plate": "smart",
  "line-video-call": "smart",
  // 生活技能
  "interact-recycling-game": "life",
};

function themeKeyFor(card: ActivityCard): string {
  if (THEME_BY_SLUG[card.slug]) return THEME_BY_SLUG[card.slug];
  switch (card.group_slug) {
    case "smart": return "smart";
    case "move":  return "body";
    case "life":  return "life";
    case "health": return "body";
    default:       return "craft";
  }
}

function isInteract(card: ActivityCard): boolean {
  return (card.tags ?? []).includes("陪伴互動");
}

function cleanTitle(card: ActivityCard): string {
  return card.title.replace(/^[^：:①②③④⑤]*[①②③④⑤]?[:：]\s*/, "");
}

async function getCards(): Promise<ActivityCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_cards")
    .select("*")
    .eq("status", "active")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as ActivityCard[];
}

export default async function ActivitiesPage() {
  const cards = await getCards();
  const byTheme = Object.fromEntries(
    themes.map((t) => [
      t.key,
      cards
        .filter((c) => themeKeyFor(c) === t.key)
        // 互動陪伴排前面
        .sort((a, b) => Number(isInteract(b)) - Number(isInteract(a))),
    ]),
  );

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-lg font-medium" style={{ color: "var(--cta)" }}>
          ← 回首頁
        </Link>

        <header className="mt-5">
          <h1 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            互動圖卡
          </h1>
          <p className="mt-2 text-xl" style={{ color: "var(--text-secondary)" }}>
            步驟式大圖卡，志工 / 家屬可帶領長輩互動，也可長者自己跟著做
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm" style={{ background: "var(--bg-accent)", color: "#92400E" }}>
            <span className="icon-lg">🤝</span>
            <span>標有「<strong>陪伴互動</strong>」的圖卡，建議由志工或家屬帶領</span>
          </div>
        </header>

        {/* 主題快選 */}
        <nav className="mt-6 flex flex-wrap gap-2">
          {themes.map((t) => (
            <a
              key={t.key}
              href={`#theme-${t.key}`}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold"
              style={{
                background: t.color + "15",
                color: t.color,
                border: `1.5px solid ${t.color}40`,
                minHeight: "var(--hit)",
              }}
            >
              <span className="icon-lg">{t.emoji}</span>
              {t.label}（{(byTheme[t.key] ?? []).length}）
            </a>
          ))}
        </nav>

        {/* 主題區塊 */}
        {themes.map((t) => {
          const list = byTheme[t.key] ?? [];
          if (list.length === 0) return null;
          return (
            <section key={t.key} id={`theme-${t.key}`} className="mt-12 scroll-mt-20">
              <div className="flex items-center gap-3">
                <span className="text-6xl">{t.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: t.color }}>
                    {t.label}
                  </h2>
                  <p className="text-base" style={{ color: "var(--text-muted)" }}>
                    {t.desc} · 共 {list.length} 張
                  </p>
                </div>
              </div>

              <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((card) => {
                  const interactive = isInteract(card);
                  return (
                    <li key={card.id}>
                      <Link
                        href={`/activities/${card.slug}`}
                        className="group flex h-full flex-col rounded-2xl p-5 shadow-sm transition hover:shadow-md"
                        style={{
                          background: "var(--bg-elevated)",
                          border: `2px solid ${t.color}25`,
                          borderLeftWidth: 6,
                          borderLeftColor: t.color,
                          minHeight: "var(--hit)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-6xl">{card.cover_emoji ?? "📋"}</span>
                          <div className="flex-1">
                            <h3
                              className="text-lg font-bold leading-snug"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {cleanTitle(card)}
                            </h3>
                            {interactive && (
                              <span
                                className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold"
                                style={{ background: "var(--bg-accent)", color: "#92400E" }}
                              >
                                🤝 陪伴互動
                              </span>
                            )}
                          </div>
                        </div>
                        {card.summary && (
                          <p
                            className="mt-3 line-clamp-3 text-base leading-relaxed"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {card.summary}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <span
                            className="rounded-full px-3 py-1 text-sm font-medium"
                            style={{ background: t.color + "15", color: t.color }}
                          >
                            {card.steps.length} 步驟
                          </span>
                          <span
                            className="text-base font-semibold transition group-hover:translate-x-1"
                            style={{ color: t.color }}
                          >
                            開始 →
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
