"use client";

import { useState } from "react";
import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";

type Card = {
  slug: string;
  title: string;
  group_slug?: string | null;
  tags?: string[] | null;
  hero_image_url?: string | null;
  duration_min?: number | null;
};

const CATS = [
  { key: "life",  name: "生活技能",    icon: "recycle" },
  { key: "body",  name: "動動身體",    icon: "run"     },
  { key: "smart", name: "智慧生活",    icon: "bulb"    },
  { key: "craft", name: "手工美勞",    icon: "craft"   },
  { key: "plant", name: "花草植栽",    icon: "sprout"  },
  { key: "draw",  name: "創意繪畫",    icon: "brush"   },
  { key: "fraud", name: "防詐・假訊息", icon: "shield"  },
] as const;

type CatKey = (typeof CATS)[number]["key"];

const THEME_BG: Record<CatKey, { bg: string }> = {
  craft: { bg: "#FEF2F2" },
  plant: { bg: "#F0FDF4" },
  draw:  { bg: "#FFF7ED" },
  body:  { bg: "#EFF6FF" },
  smart: { bg: "#FAF5FF" },
  life:  { bg: "#F0FDFA" },
  fraud: { bg: "#FFFBEB" },
};

const SLUG_MAP: Record<string, CatKey> = {
  "interact-clay": "craft", "interact-origami-heart": "craft", "interact-origami-carnation": "craft",
  "interact-origami-bear": "craft", "interact-origami-bird": "craft", "interact-leaf-bookmark": "craft",
  "interact-moss-ball": "plant", "interact-bean-sprout": "plant", "balcony-garden": "plant",
  "interact-life-story": "draw", "interact-zentangle": "draw", "interact-memory-puzzle": "draw",
  "interact-knee-care": "body", "chair-exercise": "body", "fall-prevention": "body", "morning-stretch": "body",
  "my-plate": "smart", "line-video-call": "smart",
  "interact-recycling-game": "life",
};

function themeOf(card: Card): CatKey {
  if (SLUG_MAP[card.slug]) return SLUG_MAP[card.slug];
  if ((card.tags ?? []).some((t) => t.includes("防詐") || t.includes("詐騙"))) return "fraud";
  switch (card.group_slug) {
    case "smart": return "smart";
    case "move": return "body";
    case "life": return "life";
    case "health": return "body";
    default: return "craft";
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function HomeLearnPreview({ cards }: { cards: Card[] }) {
  const [catKey, setCatKey] = useState<CatKey>("craft");

  const filtered = cards.filter((c) => themeOf(c) === catKey);
  const picks = shuffle(filtered.length > 0 ? filtered : cards).slice(0, 4);
  const showCards = picks;
  const cat = CATS.find((c) => c.key === catKey)!;
  const theme = THEME_BG[catKey];

  return (
    <div>
      {/* 分類標籤列 */}
      <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {CATS.map((c) => {
          const on = c.key === catKey;
          return (
            <button
              key={c.key}
              onClick={() => setCatKey(c.key)}
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 7,
                padding: "9px 15px", borderRadius: 999, cursor: "pointer", font: "inherit",
                fontSize: 15, fontWeight: 700, whiteSpace: "nowrap",
                border: `1.5px solid ${on ? "#E0552E" : "#E4D7CC"}`,
                background: on ? "#E0552E" : "#fff",
                color: on ? "#fff" : "#574E47",
              }}
            >
              <ELIcon name={c.icon} size={17} color={on ? "#fff" : "#F26B43"} /> {c.name}
            </button>
          );
        })}
      </div>

      {/* 圖卡格：固定 4 欄，2-3 張卡也保持相同格寬 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
        {showCards.map((card) => (
          <Link
            key={card.slug}
            href={`/activities/${card.slug}`}
            className="wv-card click"
            style={{ background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE", overflow: "hidden", textDecoration: "none" }}
          >
            {/* 縮圖 */}
            <div style={{ height: 118, position: "relative", overflow: "hidden" }}>
              {card.hero_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.hero_image_url}
                  alt={card.title}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  background: `linear-gradient(135deg,${theme.bg},#FFF4EF)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ELIcon name={cat.icon} size={44} color="#F26B43" />
                </div>
              )}
            </div>
            {/* 內容 */}
            <div style={{ padding: "14px 16px 16px" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>{card.title}</div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#6E645C", background: "#FAF7F5", padding: "3px 10px", borderRadius: 999 }}>
                  {cat.name}
                </span>
                {card.duration_min && (
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#6E645C", background: "#FAF7F5", padding: "3px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <ELIcon name="clock" size={12} color="#6E645C" /> {card.duration_min} 分鐘
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
