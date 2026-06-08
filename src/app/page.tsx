import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/config/categories";
import { HeroSearch } from "@/components/home/HeroSearch";
import { HomeLearnPreview } from "@/components/home/HomeLearnPreview";
import { ELIcon } from "@/components/layout/ELIcon";

/* ─── 快速功能 5 格 ─── */
function QuickActions() {
  const A = [
    { icon: "search",    t: "找資源",   d: "依分類或關鍵字查找", href: "/resources" },
    { icon: "cards",     t: "學技能",   d: "圖卡步驟，一步步學", href: "/activities" },
    { icon: "chat",      t: "溝通錦囊", d: "對話卡關這樣說",     href: "/scripts" },
    { icon: "news",      t: "看新知",   d: "健康・補助・防詐查證", href: "/news" },
    { icon: "qa",        t: "問厝邊",   d: "在地志工為您解答",   href: "/qa" },
  ];
  return (
    <div className="wv-quick">
      {A.map((a) => (
        <Link
          key={a.t}
          href={a.href}
          className="wv-card click"
          style={{
            background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE",
            padding: "22px 14px", display: "flex", flexDirection: "column",
            alignItems: "center", textAlign: "center", gap: 11, textDecoration: "none",
          }}
        >
          <span style={{
            width: 58, height: 58, borderRadius: 16, background: "#FFF4EF",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ELIcon name={a.icon} size={29} color="#F26B43" />
          </span>
          <span>
            <span style={{ display: "block", fontSize: 17.5, fontWeight: 800, color: "#241F1B" }}>{a.t}</span>
            <span style={{ display: "block", marginTop: 3, fontSize: 13.5, color: "#6E645C", lineHeight: 1.45 }}>{a.d}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ─── 分類格（8 大，對應設計稿 CATS）─── */
async function CategoryGrid() {
  const supabase = await createClient();
  const descMap: Record<string, string> = {
    health:    "看診、長照、輔具、篩檢",
    transport: "敬老卡、復康巴士、共乘",
    housing:   "防跌、修繕、緊急救援、防災",
    finance:   "防詐、遺產、信託、安養",
    subsidy:   "津貼、年金、重大傷病",
    social:    "福利諮詢、關懷、送餐",
    leisure:   "據點、共餐、運動課程",
    education: "樂齡、社大、3C 教學",
  };

  /* dynamic counts: resource count per category */
  let countBySlug: Record<string, number> = {};
  try {
    const [{ data: catRows }, { data: subcatRows }, { data: resRows }] = await Promise.all([
      supabase.from("categories").select("id, slug"),
      supabase.from("subcategories").select("id, category_id"),
      supabase.from("resources").select("subcategory_id").eq("status", "active"),
    ]);
    const catIdToSlug: Record<string, string> = {};
    for (const c of catRows ?? []) catIdToSlug[c.id] = c.slug;
    const subcatToCategory: Record<string, string> = {};
    for (const s of subcatRows ?? []) subcatToCategory[s.id] = s.category_id;
    for (const r of resRows ?? []) {
      const catId = subcatToCategory[r.subcategory_id];
      const slug  = catId ? catIdToSlug[catId] : null;
      if (slug) countBySlug[slug] = (countBySlug[slug] ?? 0) + 1;
    }
  } catch { /* fallback to zero */ }

  return (
    <div className="wv-catgrid">
      {categories.map((c) => {
        const count = countBySlug[c.slug] ?? 0;
        return (
          <Link
            key={c.slug}
            href={`/resources?cat=${c.slug}`}
            className="wv-card click"
            style={{
              background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE",
              padding: "22px 20px", display: "flex", flexDirection: "column", gap: 13,
              textDecoration: "none",
            }}
          >
            <span style={{
              width: 56, height: 56, borderRadius: 14, background: "#FFF4EF",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ELIcon name={c.icon} size={28} color="#F26B43" />
            </span>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#241F1B" }}>{c.name}</div>
              <div style={{ marginTop: 4, fontSize: 14, color: "#6E645C", lineHeight: 1.5 }}>
                {descMap[c.slug] || ""}
              </div>
            </div>
            <div style={{ marginTop: "auto", fontSize: 13.5, fontWeight: 700, color: "#B23F1E" }}>
              {count > 0 ? `${count} 項服務 →` : "即將上線 →"}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── 今日新知（server）─── */
async function NewsPreview() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_news")
    .select("id, title, source_org, tags, published_at")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(4);

  if (!data?.length) return null;

  const TONE: { bg: string; fg: string; icon: string }[] = [
    { bg: "#E7F4EC", fg: "#2E7D52", icon: "health" },
    { bg: "#FFF4EF", fg: "#B23F1E", icon: "news" },
    { bg: "#FFF1E8", fg: "#C2410C", icon: "shield" },
    { bg: "#FFE7DD", fg: "#B23F1E", icon: "news" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((a: { id: string; title: string | null; source_org: string | null; tags: string[] | null; published_at: string | null }, i: number) => {
        const tone = TONE[i % 4];
        return (
          <Link
            key={a.id}
            href={`/news/${a.id}`}
            className="wv-card click"
            style={{
              background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE",
              padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start",
              textDecoration: "none",
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 12, background: tone.bg, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ELIcon name={tone.icon} size={24} color={tone.fg} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{
                  fontSize: 12.5, fontWeight: 800, color: tone.fg,
                  background: tone.bg, padding: "2px 9px", borderRadius: 999,
                }}>
                  {(a.tags as string[])?.[0] || "新知"}
                </span>
                <span style={{ fontSize: 13, color: "#6E645C" }}>
                  {a.source_org} · {a.published_at
                    ? new Date(a.published_at).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })
                    : ""}
                </span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#241F1B", lineHeight: 1.45 }}>{a.title}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── 最近問答（server，fallback 靜態資料）─── */
const QA_FALLBACK = [
  { id: "f1", title: "中壢哪裡可以免費量血壓？", is_solved: true, region_name: "中壢區", answer_count: 3 },
  { id: "f2", title: "請問復康巴士要怎麼預約？需要提前幾天？", is_solved: true, region_name: "桃園市", answer_count: 5 },
  { id: "f3", title: "長輩想學用 LINE 視訊，附近有教學的地方嗎？", is_solved: false, region_name: "中壢區", answer_count: 2 },
  { id: "f4", title: "低收入戶的假牙補助怎麼申請？", is_solved: true, region_name: "桃園市", answer_count: 4 },
];

async function QAPreview() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select("id, title, answer_count, is_solved, region_name")
    .order("created_at", { ascending: false })
    .limit(4);

  const items = (data?.length ? data : QA_FALLBACK);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((q: { id: string; title: string; is_solved: boolean | null; region_name: string | null; answer_count: number | null }) => (
        <Link
          key={q.id}
          href={data?.length ? `/qa/${q.id}` : "/qa"}
          className="wv-card click"
          style={{
            background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE",
            padding: "16px 18px", textDecoration: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
            <ELIcon name="qa" size={22} color="#F26B43" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 17, fontWeight: 700, color: "#241F1B", lineHeight: 1.5 }}>
              {q.title}
            </div>
          </div>
          <div style={{ marginTop: 10, marginLeft: 33, display: "flex", alignItems: "center", gap: 8 }}>
            {q.is_solved
              ? <span style={{ fontSize: 12.5, fontWeight: 800, color: "#2E7D52", background: "#E7F4EC", padding: "3px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <ELIcon name="check" size={13} color="#2E7D52" /> 已解決
                </span>
              : <span style={{ fontSize: 12.5, fontWeight: 800, color: "#C2410C", background: "#FFF1E8", padding: "3px 10px", borderRadius: 999 }}>待回答</span>
            }
            <span style={{ fontSize: 13.5, color: "#6E645C" }}>
              {q.region_name && <><ELIcon name="pin" size={13} color="#F26B43" style={{ display: "inline", verticalAlign: "-2px" }} /> {q.region_name} · </>}
              {q.answer_count ?? 0} 則回答
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─── 區塊標題 ─── */
function SectionHead({ title, more, href }: { title: string; more?: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#241F1B", letterSpacing: -0.4 }}>{title}</h2>
      {more && href && (
        <Link href={href} className="wv-link" style={{ fontSize: 16, display: "inline-flex", alignItems: "center", gap: 4 }}>
          {more} <ELIcon name="chevron" size={16} color="#B23F1E" />
        </Link>
      )}
    </div>
  );
}

/* ─── 首頁 ─── */
export default async function HomePage() {
  const supabase = await createClient();
  const { data: activityCards } = await supabase
    .from("activity_cards")
    .select("slug, title, group_slug, tags, hero_image_url, video_url, duration_min")
    .eq("status", "active")
    .limit(28);

  return (
    <div className="wv-fade">

      {/* Hero 搜尋 */}
      <div className="wv-wrap" style={{ paddingTop: 28 }}>
        <HeroSearch />
      </div>

      {/* Guide CTA 橫幅 */}
      <div className="wv-wrap" style={{ paddingTop: 18 }}>
        <Link
          href="/guide"
          className="wv-card click"
          style={{
            display: "flex", alignItems: "center", gap: 16,
            background: "#fff", border: "1.5px solid #FFD6C7",
            borderRadius: 18, padding: "16px 20px",
            boxShadow: "0 4px 14px rgba(224,85,46,0.08)",
            textDecoration: "none",
          }}
        >
          <span style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg,#F2764F,#E0552E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 5px 12px rgba(224,85,46,0.3)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden>
              <path d="M6 4.5v15l13-7.5z" />
            </svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#241F1B" }}>第一次使用？看 2 分鐘教學</div>
            <div style={{ marginTop: 2, fontSize: 15, color: "#574E47" }}>認識怎麼找資源、怎麼打電話問</div>
          </div>
          <span style={{
            background: "#E0552E", color: "#fff", fontWeight: 800, fontSize: 15,
            padding: "11px 18px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0,
          }}>看教學</span>
        </Link>
      </div>

      {/* 快速功能 */}
      <div className="wv-wrap" style={{ paddingTop: 34 }}>
        <QuickActions />
      </div>

      {/* 找資源 / 分類格（8 大）*/}
      <div className="wv-wrap" style={{ paddingTop: 48 }}>
        <SectionHead title="找資源" more="看全部分類" href="/resources" />
        <CategoryGrid />
      </div>

      {/* 動手學一招 / LearnPreview */}
      <div className="wv-wrap" style={{ paddingTop: 48 }}>
        <SectionHead title="動手學一招" more="所有圖卡" href="/activities" />
        <HomeLearnPreview cards={activityCards ?? []} />
      </div>

      {/* 今日新知 + 最近問答（兩欄） */}
      <div
        className="wv-wrap"
        style={{
          paddingTop: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 40,
        }}
      >
        <section>
          <SectionHead title="今日新知" more="更多文章" href="/news" />
          <NewsPreview />
        </section>
        <section>
          <SectionHead title="最近問答" more="去問答區" href="/qa" />
          <QAPreview />
        </section>
      </div>

      {/* 提案 CTA */}
      <div className="wv-wrap" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div style={{
          background: "linear-gradient(120deg,#FFF4EF,#FFE7DD)",
          border: "1px solid #FFE7DD", borderRadius: 22,
          padding: "30px 32px", display: "flex", alignItems: "center",
          gap: 20, flexWrap: "wrap",
        }}>
          <span style={{
            width: 60, height: 60, borderRadius: 16, flexShrink: 0,
            background: "linear-gradient(135deg,#F2764F,#E0552E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 16px rgba(224,85,46,0.28)",
          }}>
            <ELIcon name="megaphone" size={30} color="#fff" />
          </span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 23, fontWeight: 800, color: "#241F1B" }}>想學什麼、或知道好資源？</div>
            <div style={{ marginTop: 4, fontSize: 16.5, color: "#574E47", lineHeight: 1.6 }}>
              到「提案專區」出點子、為想要的活動投票，或分享一筆服務給社區。
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/propose"
              style={{
                height: 50, padding: "0 22px", borderRadius: 999, background: "#E0552E",
                color: "#fff", fontSize: 16, fontWeight: 800, display: "inline-flex",
                alignItems: "center", gap: 9, textDecoration: "none",
                boxShadow: "0 6px 16px rgba(224,85,46,0.26)",
              }}
            >
              <ELIcon name="megaphone" size={19} color="#fff" /> 提案專區
            </Link>
            <Link
              href="/submit"
              style={{
                height: 50, padding: "0 22px", borderRadius: 999, background: "#fff",
                color: "#574E47", fontSize: 16, fontWeight: 800, display: "inline-flex",
                alignItems: "center", gap: 9, textDecoration: "none",
                border: "1.5px solid #E4D7CC",
              }}
            >
              <ELIcon name="send" size={19} color="#F26B43" /> 分享好資源
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
