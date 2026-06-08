import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ActivityCard } from "@/types/domain";
import { ELIcon } from "@/components/layout/ELIcon";

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

/* 從 YouTube URL 推算縮圖（data-cards.jsx CARD_IMG 對應） */
function ytThumb(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

/* 無影片縮圖的圖卡，使用設計稿 CARD_ART 指定的 icon + 色調 */
const CARD_ART: Record<string, { icon: string; bg: string; color: string }> = {
  "interact-fraud-impersonation": { icon: "shield",  bg: "#FFF1E8", color: "#C2410C" },
  "interact-fraud-rumor":         { icon: "chat",    bg: "#FFF1E8", color: "#C2410C" },
  "interact-cpr":                 { icon: "heart",   bg: "#EAF1FB", color: "#2A63C0" },
  "interact-aed":                 { icon: "heart",   bg: "#EAF1FB", color: "#2A63C0" },
  "interact-heimlich":            { icon: "shield",  bg: "#EAF1FB", color: "#2A63C0" },
  "interact-recycling-game":      { icon: "recycle", bg: "#E7F4EC", color: "#2E7D52" },
  "interact-fire-safety":         { icon: "shield",  bg: "#FFF1E8", color: "#C2410C" },
  "interact-fire-escape":         { icon: "run",     bg: "#FFF1E8", color: "#C2410C" },
  "interact-earthquake":          { icon: "shield",  bg: "#EAF1FB", color: "#2A63C0" },
  "interact-earthquake-prep":     { icon: "home",    bg: "#EAF1FB", color: "#2A63C0" },
  "balcony-garden":               { icon: "sprout",  bg: "#E7F4EC", color: "#2E7D52" },
  "line-video-call":              { icon: "chat",    bg: "#E7F4EC", color: "#2E7D52" },
  "my-plate":                     { icon: "bulb",    bg: "#FFF4EF", color: "#B23F1E" },
  "fall-prevention":              { icon: "shield",  bg: "#FFF4EF", color: "#B23F1E" },
  "morning-stretch":              { icon: "run",     bg: "#FFF4EF", color: "#B23F1E" },
  "chair-exercise":               { icon: "run",     bg: "#FFF4EF", color: "#B23F1E" },
};

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

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat: catParam } = await searchParams;
  const activeCat = CARD_CATS.find((c) => c.key === catParam) ?? CARD_CATS[0];

  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_cards")
    .select("id, slug, title, summary, duration_min, steps, tags, group_slug, status, video_url, hero_image_url")
    .eq("status", "active")
    .order("created_at");
  const allCards = (data ?? []) as ActivityCard[];

  const items = allCards.filter((c) => themeKeyFor(c) === activeCat.key);

  return (
    <div className="wv-fade">
      {/* 標題帶 */}
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD", padding: "34px 0 30px" }}>
        <div className="wv-wrap">
          <h1 style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 800, color: "#241F1B", letterSpacing: -0.5 }}>互動學習</h1>
          <p style={{ margin: "0 0 14px", fontSize: 17, color: "#574E47" }}>大圖大字、一步一步帶您完成。救命技能、手作、運動、防詐，挑一個開始。</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.7)", padding: "7px 14px", borderRadius: 999, fontSize: 14, fontWeight: 700, color: "#B23F1E" }}>
            <ELIcon name="social" size={16} color="#F26B43" /> 標示「陪伴」的圖卡，建議由志工或家屬一起帶領
          </div>
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 24, paddingBottom: 56 }}>
        {/* 分類列 — 橫向捲動 */}
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, marginBottom: 22 }}>
          {CARD_CATS.map((c) => {
            const on = c.key === activeCat.key;
            return (
              <Link
                key={c.key}
                href={`/activities?cat=${c.key}`}
                style={{
                  flexShrink: 0, display: "flex", alignItems: "center", gap: 9,
                  padding: "11px 18px", borderRadius: 999, textDecoration: "none",
                  fontSize: 16, fontWeight: 800, whiteSpace: "nowrap",
                  border: `1.5px solid ${on ? "#E0552E" : "#E4D7CC"}`,
                  background: on ? "#E0552E" : "#fff",
                  color: on ? "#fff" : "#574E47",
                }}
              >
                <ELIcon name={c.icon} size={20} color={on ? "#fff" : "#F26B43"} />
                {c.name}
              </Link>
            );
          })}
        </div>

        {/* 分類描述 + 計數 */}
        <div style={{ marginBottom: 20, fontSize: 16, color: "#6E645C" }}>
          {activeCat.sub} · 共 <b style={{ color: "#574E47" }}>{items.length}</b> 張圖卡
        </div>

        {/* 圖卡格 */}
        {items.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px dashed #E4D7CC", padding: 48, textAlign: "center" }}>
            <ELIcon name={activeCat.icon} size={48} color="#E4D7CC" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: "#574E47" }}>這個分類的圖卡即將上線</div>
            <div style={{ marginTop: 6, fontSize: 15, color: "#6E645C" }}>先看看其他主題，或到提案專區建議想學的活動。</div>
            <Link href="/propose" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 22, background: "#E0552E", color: "#fff", borderRadius: 999, height: 46, padding: "0 24px", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
              <ELIcon name="megaphone" size={17} color="#fff" /> 提案新活動
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))", gap: 18 }}>
            {items.map((card) => {
              const steps = Array.isArray(card.steps) ? card.steps : [];
              return (
                <Link
                  key={card.slug}
                  href={`/activities/${card.slug}`}
                  className="wv-card click"
                  style={{ background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE", overflow: "hidden", textDecoration: "none", display: "flex", flexDirection: "column" }}
                >
                  {/* 縮圖：hero_image_url → ytThumb(video_url) → CARD_ART icon → 分類 icon */}
                  {(() => {
                    const thumb = card.hero_image_url ?? ytThumb(card.video_url);
                    const art = CARD_ART[card.slug];
                    const bg = art ? art.bg : "linear-gradient(135deg,#FFE7DD,#FFF4EF)";
                    return (
                      <div style={{ height: 148, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={card.title} loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : art ? (
                          <ELIcon name={art.icon} size={52} color={art.color} />
                        ) : (
                          <ELIcon name={activeCat.icon} size={52} color="#F26B43" />
                        )}
                        {thumb && card.video_url && (
                          <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.5)", borderRadius: 6, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M6 4.5v15l13-7.5z" /></svg>
                            <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>影片</span>
                          </div>
                        )}
                        {(card.tags ?? []).includes("救命技能") && (
                          <span style={{ position: "absolute", top: 10, left: 10, fontSize: 12.5, fontWeight: 800, color: "#fff", background: "#E0552E", padding: "3px 11px", borderRadius: 999 }}>救命技能</span>
                        )}
                        {(card.tags ?? []).includes("陪伴互動") && (
                          <span style={{ position: "absolute", top: 10, right: 10, fontSize: 12.5, fontWeight: 800, color: "#B23F1E", background: "#FFF4EF", padding: "3px 11px", borderRadius: 999 }}>陪伴</span>
                        )}
                      </div>
                    );
                  })()}
                  {/* 內容 */}
                  <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "#241F1B" }}>{card.title}</div>
                    {card.summary && (
                      <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#6E645C", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {card.summary}
                      </p>
                    )}
                    <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", gap: 8 }}>
                      {card.duration_min && (
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#6E645C", background: "#FAF7F5", padding: "4px 11px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <ELIcon name="clock" size={13} color="#6E645C" /> {card.duration_min} 分鐘
                        </span>
                      )}
                      {steps.length > 0 && (
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#6E645C", background: "#FAF7F5", padding: "4px 11px", borderRadius: 999 }}>
                          {steps.length} 步驟
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

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
