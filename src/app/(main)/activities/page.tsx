import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ActivityCard } from "@/types/domain";
import { ELIcon } from "@/components/layout/ELIcon";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";

export const metadata = { title: "互動學習" };

/* ── 分類定義：對應設計稿 CARD_CATS ── */
const CARD_CATS = [
  { key: "life",  icon: "recycle", name: "生活技能",     sub: "急救、防災、居家安全" },
  { key: "body",  icon: "run",     name: "動動身體",     sub: "護膝、防跌、椅子運動" },
  { key: "smart", icon: "bulb",    name: "智慧生活",     sub: "營養飲食、數位工具" },
  { key: "craft", icon: "craft",   name: "手工美勞",     sub: "黏土、摺紙、書籤" },
  { key: "plant", icon: "sprout",  name: "花草植栽",     sub: "種植、苔球、療癒" },
  { key: "draw",  icon: "brush",   name: "創意繪畫",     sub: "生命故事、禪繞畫" },
  { key: "fraud", icon: "shield",  name: "防詐・假訊息", sub: "識破詐騙、假新聞辨識" },
] as const;

type CatKey = (typeof CARD_CATS)[number]["key"];

const THEME_BY_SLUG: Record<string, CatKey> = {
  "interact-clay": "craft", "interact-origami-heart": "craft", "interact-origami-carnation": "craft",
  "interact-origami-bear": "craft", "interact-origami-bird": "craft", "interact-leaf-bookmark": "craft",
  "interact-moss-ball": "plant", "interact-bean-sprout": "plant", "balcony-garden": "plant",
  "interact-life-story": "draw", "interact-zentangle": "draw", "interact-memory-puzzle": "draw",
  "interact-knee-care": "body", "chair-exercise": "body", "fall-prevention": "body", "morning-stretch": "body",
  "my-plate": "smart", "line-video-call": "smart",
  "interact-recycling-game": "life", "interact-cpr": "life", "interact-aed": "life",
  "interact-heimlich": "life", "interact-fire-safety": "life", "interact-fire-escape": "life",
  "interact-earthquake": "life", "interact-earthquake-prep": "life",
  "interact-fraud-impersonation": "fraud", "interact-fraud-rumor": "fraud",
};

function themeKeyFor(card: ActivityCard): CatKey {
  if (THEME_BY_SLUG[card.slug]) return THEME_BY_SLUG[card.slug];
  if ((card.tags ?? []).some((t: string) => t.includes("防詐") || t.includes("詐騙"))) return "fraud";
  switch (card.group_slug) {
    case "smart": return "smart";
    case "move":  return "body";
    case "life":  return "life";
    case "health": return "body";
    default: return "craft";
  }
}

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_cards")
    .select("slug, tags, group_slug, steps, status")
    .eq("status", "active");
  const allCards = (data ?? []) as ActivityCard[];
  const counts: Record<string, number> = {};
  for (const c of allCards) { const k = themeKeyFor(c); counts[k] = (counts[k] ?? 0) + 1; }

  return (
    <div className="wv-fade">
      {/* 手機版返回列 */}
      <MobileSubHeader title="互動圖卡" />

      {/* 標題帶（桌機） */}
      <div className="wv-desktop-only" style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD", padding: "34px 0 30px" }}>
        <div className="wv-wrap">
          <h1 style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 800, color: "#241F1B", letterSpacing: -0.5 }}>互動學習</h1>
          <p style={{ margin: "0 0 14px", fontSize: 17, color: "#574E47" }}>選一個主題，點進去再挑想做的圖卡。每張都是大圖大字、一步一步帶您完成。</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.7)", padding: "7px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, color: "#B23F1E" }}>
            <ELIcon name="social" size={16} color="#F26B43" /> 標示「陪伴」的圖卡，建議由志工或家屬一起帶領
          </div>
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 22, paddingBottom: 56 }}>
        {/* 手機版簡介 */}
        <p className="wv-mobile-only" style={{ margin: "4px 0 16px", fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>
          選一個主題，點進去再挑想做的圖卡。每張都是大圖大字、一步一步帶您完成。
        </p>

        {/* 分類卡（2 欄） */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {CARD_CATS.map((cat) => (
            <Link
              key={cat.key}
              href={`/activities/${cat.key}`}
              className="wv-card click"
              style={{ background: "#fff", border: "1px solid #F0E6DE", borderRadius: 16, padding: "15px 14px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 9 }}
            >
              <span style={{ width: 46, height: 46, borderRadius: 13, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ELIcon name={cat.icon} size={24} color="#F26B43" />
              </span>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>{cat.name}</div>
                <div style={{ marginTop: 2, fontSize: 12.5, color: "#6E645C", lineHeight: 1.45 }}>{cat.sub}</div>
              </div>
              <div style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 4, color: "#B23F1E", fontSize: 13, fontWeight: 800, alignSelf: "flex-start" }}>
                {counts[cat.key] ?? 0} 張圖卡 <ELIcon name="chevron" size={14} color="#B23F1E" />
              </div>
            </Link>
          ))}
        </div>

        {/* 提案 CTA */}
        <div style={{ marginTop: 40, background: "linear-gradient(120deg,#FFF4EF,#FFE7DD)", border: "1px solid #FFE7DD", borderRadius: 22, padding: "26px 28px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(224,85,46,0.18)" }}>
            <ELIcon name="megaphone" size={27} color="#F26B43" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#241F1B" }}>點子提案專區</div>
            <div style={{ marginTop: 3, fontSize: 15, color: "#574E47", lineHeight: 1.5 }}>想學或想教什麼？提案給大家一起投票</div>
          </div>
          <Link href="/propose" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E0552E", color: "#fff", borderRadius: 999, height: 46, padding: "0 22px", fontSize: 15, fontWeight: 800, textDecoration: "none", flexShrink: 0, boxShadow: "0 4px 12px rgba(224,85,46,0.26)" }}>
            <ELIcon name="arrow" size={17} color="#fff" /> 前往提案
          </Link>
        </div>
      </div>
    </div>
  );
}
