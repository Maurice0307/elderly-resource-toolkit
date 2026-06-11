import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { YouTubeEmbed } from "@/components/activities/YouTubeEmbed";
import type { ActivityCard, ActivityStep } from "@/types/domain";
import { ELIcon } from "@/components/layout/ELIcon";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";
import { ActivityFlow, type FlowStep, type FlowNext } from "@/components/activities/ActivityFlow";

type Params = { slug: string };

const THEMES: Record<string, { label: string; icon: string; sub: string; color: string; bg: string }> = {
  life:  { label: "生活技能",     icon: "recycle", sub: "急救、防災、居家安全", color: "#0F766E", bg: "#F0FDFA" },
  body:  { label: "動動身體",     icon: "run",     sub: "護膝、防跌、椅子運動", color: "#0369A1", bg: "#EFF6FF" },
  smart: { label: "智慧生活",     icon: "bulb",    sub: "營養飲食、數位工具",   color: "#7E22CE", bg: "#FAF5FF" },
  craft: { label: "手工美勞",     icon: "craft",   sub: "黏土、摺紙、書籤",    color: "#DC2626", bg: "#FEF2F2" },
  plant: { label: "花草植栽",     icon: "sprout",  sub: "種植、苔球、療癒",    color: "#15803D", bg: "#F0FDF4" },
  draw:  { label: "創意繪畫",     icon: "brush",   sub: "生命故事、禪繞畫",    color: "#EA580C", bg: "#FFF7ED" },
  fraud: { label: "防詐・假訊息", icon: "shield",  sub: "識破詐騙、假新聞辨識", color: "#B45309", bg: "#FFFBEB" },
};

const THEME_BY_SLUG: Record<string, string> = {
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

function ytThumb(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

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

function themeKeyFor(card: ActivityCard): string {
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

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (THEMES[slug]) return { title: THEMES[slug].label + " — 互動學習" };
  const supabase = await createClient();
  const { data } = await supabase.from("activity_cards").select("title").eq("slug", slug).maybeSingle();
  return { title: data?.title ?? "互動圖卡" };
}

/* ── 主題列表頁 ── */
async function ThemeListPage({ themeKey }: { themeKey: string }) {
  const theme = THEMES[themeKey]!;
  const supabase = await createClient();
  const { data } = await supabase.from("activity_cards").select("*").eq("status", "active").order("created_at");
  const all = (data ?? []) as ActivityCard[];
  const cards = all.filter((c) => themeKeyFor(c) === themeKey);

  return (
    <div className="wv-fade">
      {/* 手機版返回列 */}
      <MobileSubHeader title={theme.label} backHref="/activities" />

      {/* 分類標題帶（桌機） */}
      <div className="wv-desktop-only" style={{ background: theme.bg, borderBottom: "1px solid #F0E6DE", padding: "28px 0 24px" }}>
        <div className="wv-wrap">
          <Link href="/activities" className="wv-pill" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
            <ELIcon name="chevron" size={16} color="#574E47" style={{ transform: "rotate(180deg)" }} /> 互動學習
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <ELIcon name={theme.icon} size={28} color="#F26B43" />
            </div>
            <div>
              <h1 style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 800, color: theme.color }}>{theme.label}</h1>
              <div style={{ fontSize: 15, color: "#574E47" }}>{theme.sub} · {cards.length} 張圖卡</div>
            </div>
          </div>
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 16, paddingBottom: 56 }}>
        {/* 手機版分類標頭：圖示 + 子說明 + 共 N 張圖卡 · 點一張開始 */}
        <div className="wv-mobile-only" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ width: 46, height: 46, borderRadius: 13, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ELIcon name={theme.icon} size={24} color="#F26B43" />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>{theme.sub}</div>
            <div style={{ marginTop: 2, fontSize: 13, color: "#6E645C" }}>共 {cards.length} 張圖卡 · 點一張開始</div>
          </div>
        </div>

        {cards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <ELIcon name={theme.icon} size={48} color="#E4D7CC" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: "#574E47" }}>這個主題的圖卡即將上線</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {cards.map((card) => {
              const steps = Array.isArray(card.steps) ? card.steps : [];
              const companion = (card.tags ?? []).includes("陪伴互動");
              const thumb = card.hero_image_url ?? ytThumb(card.video_url);
              const art = CARD_ART[card.slug];
              const bg = art ? art.bg : `linear-gradient(135deg,${theme.bg},#FFF4EF)`;
              return (
                <Link
                  key={card.slug}
                  href={`/activities/${card.slug}`}
                  className="wv-card click"
                  style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", overflow: "hidden", textDecoration: "none", display: "flex", flexDirection: "column" }}
                >
                  <div style={{ height: 116, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={card.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <ELIcon name={art ? art.icon : theme.icon} size={42} color={art ? art.color : "#F26B43"} />
                    )}
                  </div>
                  <div style={{ padding: "12px 13px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{ fontSize: 16.5, fontWeight: 800, color: "#241F1B", lineHeight: 1.35 }}>{card.title}</div>
                    {companion && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, alignSelf: "flex-start", background: "#FFF4EF", color: "#B23F1E", fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
                        <ELIcon name="social" size={13} color="#F26B43" /> 陪伴
                      </span>
                    )}
                    <div style={{ marginTop: "auto", fontSize: 13, color: "#6E645C", display: "flex", alignItems: "center", gap: 5 }}>
                      {steps.length > 0 && <span>{steps.length} 步驟</span>}
                      {steps.length > 0 && card.duration_min && <span>·</span>}
                      {card.duration_min && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><ELIcon name="clock" size={13} color="#6E645C" /> {card.duration_min} 分</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 圖卡詳情頁（所有步驟一次展示） ── */
async function CardDetailPage({ slug }: { slug: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_cards").select("*").eq("slug", slug).eq("status", "active").maybeSingle();
  if (error) throw error;
  if (!data) notFound();

  const card = data as ActivityCard;
  const themeKey = themeKeyFor(card);
  const theme = THEMES[themeKey];
  const steps = Array.isArray(card.steps) ? card.steps : [];
  const materials: string[] = card.materials ?? [];

  // 同分類的其他圖卡（完成頁「接著試試這些」）
  const { data: moreData } = await supabase
    .from("activity_cards").select("slug, title, group_slug, tags, steps, duration_min").eq("status", "active");
  const nextCards: FlowNext[] = ((moreData ?? []) as ActivityCard[])
    .filter((c) => c.slug !== card.slug && themeKeyFor(c) === themeKey)
    .slice(0, 2)
    .map((c) => ({ slug: c.slug, title: c.title, icon: THEMES[themeKeyFor(c)]?.icon ?? "cards", steps: Array.isArray(c.steps) ? c.steps.length : 0, mins: c.duration_min ?? null }));

  return (
    <div className="wv-fade">
      {/* 手機版：引導流程（封面 → 一步一頁 → 完成） */}
      <div className="wv-mobile-only">
        <ActivityFlow
          slug={card.slug}
          title={card.title}
          summary={card.summary}
          heroImage={card.hero_image_url}
          videoUrl={card.video_url}
          durationMin={card.duration_min}
          materials={materials}
          steps={steps as FlowStep[]}
          themeIcon={theme?.icon ?? "cards"}
          nextCards={nextCards}
        />
      </div>

      {/* 桌機版：一次列出所有步驟 */}
      <div className="wv-desktop-only wv-wrap" style={{ paddingTop: 26, paddingBottom: 64 }}>
        <div className="wv-split" style={{ display: "grid", gridTemplateColumns: "296px minmax(0,1fr)", gap: 28, alignItems: "start" }}>

          {/* ── 左：封面 + 資訊（sticky；手機取消） ── */}
          <aside className="wv-unsticky-sm" style={{ position: "sticky", top: 96 }}>
            <Link href="/activities" className="wv-pill" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
              <ELIcon name="chevron" size={18} color="#574E47" style={{ transform: "rotate(180deg)" }} /> 互動學習
            </Link>

            <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #F0E6DE", overflow: "hidden" }}>
              {/* 封面媒體 */}
              <div style={{ position: "relative" }}>
                {card.hero_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.hero_image_url}
                    alt={card.title + " 成品預覽"}
                    style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ height: 200, background: "linear-gradient(135deg,#FFE0D2,#FFF4EF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ELIcon name={theme?.icon ?? "cards"} size={64} color="#F26B43" />
                  </div>
                )}
                <span style={{ position: "absolute", bottom: 10, right: 10, fontSize: 11.5, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.55)", padding: "3px 10px", borderRadius: 6 }}>成品展示</span>
              </div>

              <div style={{ padding: "20px 20px 22px" }}>
                <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: "#241F1B" }}>{card.title}</h1>
                {card.summary && (
                  <p style={{ margin: "10px 0 0", fontSize: 15, color: "#574E47", lineHeight: 1.7 }}>{card.summary}</p>
                )}

                <div style={{ marginTop: 14, display: "flex", gap: 9, flexWrap: "wrap" }}>
                  {card.duration_min && (
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: "#B23F1E", background: "#FFF4EF", padding: "5px 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <ELIcon name="clock" size={14} color="#F26B43" /> {card.duration_min} 分鐘
                    </span>
                  )}
                  {steps.length > 0 && (
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: "#B23F1E", background: "#FFF4EF", padding: "5px 12px", borderRadius: 999 }}>
                      {steps.length} 個步驟
                    </span>
                  )}
                </div>

                {/* 需要準備 */}
                {materials.length > 0 && (
                  <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #F0E6DE" }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: "#241F1B", marginBottom: 10 }}>需要準備</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                      {materials.map((m: string, i: number) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#574E47", lineHeight: 1.55 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F26B43", flexShrink: 0, marginTop: 6 }} />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 完整影片（卡片主影片） */}
                {card.video_url && (
                  <div style={{ marginTop: 18 }}>
                    <YouTubeEmbed url={card.video_url} title={card.title} />
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── 右：所有步驟一次展示 ── */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#6E645C", letterSpacing: 1, marginBottom: 20 }}>跟著做・一步一步</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {steps.map((step: ActivityStep) => (
                <div key={step.order} style={{ background: "#fff", borderRadius: 20, border: "1px solid #F0E6DE", padding: "22px 24px" }}>
                  {/* 步驟編號 + 標題 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#E0552E", color: "#fff", fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {step.order}
                    </span>
                    <h3 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#241F1B" }}>{step.title}</h3>
                  </div>

                  {/* 說明文字 */}
                  <p style={{ margin: "0 0 0 50px", fontSize: 17, color: "#574E47", lineHeight: 1.75 }}>{step.description}</p>

                  {/* 步驟圖片 */}
                  {step.image_url && (
                    <div style={{ marginTop: 14, marginLeft: 50, borderRadius: 14, overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={step.image_url} alt={step.title} loading="lazy" style={{ width: "100%", display: "block", objectFit: "cover" }} />
                    </div>
                  )}

                  {/* 步驟影片 */}
                  {step.video_url && (
                    <div style={{ marginTop: 14, marginLeft: 50 }}>
                      <YouTubeEmbed url={step.video_url} title={`${card.title} — ${step.title}`} startSeconds={step.video_start} />
                      <a
                        href={step.video_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 14, fontWeight: 700, color: "#B23F1E", textDecoration: "none" }}
                      >
                        <ELIcon name="arrow" size={15} color="#F26B43" /> 一步有影片，點 ▶ 觀看影像
                      </a>
                    </div>
                  )}

                  {/* 小撇步 */}
                  {step.tip && (
                    <div style={{ margin: "14px 0 0 50px", background: "#FFF4EF", border: "1px solid #FFE7DD", borderRadius: 12, padding: "11px 15px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <ELIcon name="pin" size={16} color="#F26B43" style={{ marginTop: 2, flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: 15, color: "#B23F1E", lineHeight: 1.65 }}>小撇步：{step.tip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 完成卡 */}
            <div style={{ marginTop: 20, background: "#E7F4EC", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
              <ELIcon name="check" size={28} color="#2E7D52" stroke={2.4} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1F6E45" }}>完成了！做得很好。</div>
                <div style={{ marginTop: 3, fontSize: 15, color: "#574E47" }}>把成果拍張照傳給家人，是很棒的話題。</div>
              </div>
            </div>

            {/* 標籤 */}
            {card.tags && card.tags.length > 0 && (
              <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {card.tags.map((tag: string) => (
                  <span key={tag} style={{ fontSize: 14, fontWeight: 700, color: "#6E645C", background: "#FAF7F5", padding: "6px 13px", borderRadius: 999 }}>#{tag}</span>
                ))}
              </div>
            )}

            {/* 來源 */}
            {(card.source_url || card.source_org) && (
              <div style={{ marginTop: 18, borderRadius: 14, padding: "14px 18px", background: "#FAF7F5", border: "1px solid #F0E6DE", fontSize: 14, color: "#6E645C", lineHeight: 1.6 }}>
                資料來源：{card.source_url
                  ? <a href={card.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "#B23F1E", fontWeight: 700 }}>{card.source_org ?? card.source_url}</a>
                  : <span style={{ color: "#574E47", fontWeight: 700 }}>{card.source_org}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 路由分派器 ── */
export default async function ActivitySlugPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (THEMES[slug]) return <ThemeListPage themeKey={slug} />;
  return <CardDetailPage slug={slug} />;
}
