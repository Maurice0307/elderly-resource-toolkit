import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ELIcon } from "@/components/layout/ELIcon";

export const metadata = { title: "今日新知" };

type NewsRow = {
  id: string;
  source_org: string;
  title: string;
  summary_md: string;
  tags: string[];
  published_at: string | null;
  fetched_at: string;
};

function getAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  return `${days} 天前`;
}

const PALETTES: { bg: string; fg: string; icon: string }[] = [
  { bg: "linear-gradient(135deg,#E7F4EC,#D1FAE5)", fg: "#2E7D52", icon: "health" },
  { bg: "linear-gradient(135deg,#FFF4EF,#FFE7DD)", fg: "#B23F1E", icon: "news" },
  { bg: "linear-gradient(135deg,#FFF1E8,#FFD6C7)", fg: "#C2410C", icon: "shield" },
  { bg: "linear-gradient(135deg,#EDF2FF,#DBEAFE)", fg: "#2952B3", icon: "education" },
];

const TAG_PALETTES: Record<string, { bg: string; color: string }> = {
  健康:     { bg: "#E7F4EC", color: "#2E7D52" },
  補助:     { bg: "#FFF4EF", color: "#B23F1E" },
  防詐查證: { bg: "#FFF1E8", color: "#C2410C" },
  在地活動: { bg: "#FFF4EF", color: "#B23F1E" },
};
function tagStyle(tag: string) {
  return TAG_PALETTES[tag] ?? { bg: "#F0E6DE", color: "#6E645C" };
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat = "" } = await searchParams;
  const supabase = await createClient();

  const { data: allRows } = await supabase
    .from("daily_news").select("tags").eq("status", "active");
  const tagCount = new Map<string, number>();
  for (const row of allRows ?? []) {
    for (const t of row.tags ?? []) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  }
  const allTags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);

  let query = supabase
    .from("daily_news")
    .select("id, source_org, title, summary_md, tags, published_at, fetched_at")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);
  if (cat) query = query.contains("tags", [cat]);

  const { data } = await query;
  const news = (data ?? []) as NewsRow[];
  const hero = news[0] ?? null;
  const rest = news.slice(1);
  const chips = ["全部", ...allTags.slice(0, 7)];

  const heroPal = PALETTES[0];

  return (
    <div className="wv-fade">
      {/* 標題帶 */}
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD", padding: "44px 0 32px" }}>
        <div className="wv-wrap">
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px, 3.2vw, 32px)", fontWeight: 800, color: "#241F1B" }}>今日新知</h1>
          <p style={{ margin: "0 0 22px", fontSize: 17, color: "#574E47" }}>健康補助・防詐查證・在地活動，每天更新。</p>
          {/* 分類 chips — 橫向捲動、不換行 */}
          <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 4 }}>
            {chips.map((c) => {
              const isAll = c === "全部";
              const active = isAll ? !cat : cat === c;
              const href = isAll ? "/news" : `/news?cat=${encodeURIComponent(c)}`;
              return (
                <Link key={c} href={href} style={{
                  flexShrink: 0, padding: "9px 18px", borderRadius: 999, fontSize: 15, fontWeight: 700,
                  background: active ? "#E0552E" : "rgba(255,255,255,0.8)",
                  color: active ? "#fff" : "#574E47",
                  border: `1.5px solid ${active ? "#E0552E" : "#E4D7CC"}`,
                  textDecoration: "none", whiteSpace: "nowrap",
                }}>
                  {isAll ? c : `#${c}`}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 40, paddingBottom: 56 }}>
        {/* 置頂大卡：gradient panel 左 + 文字右 */}
        {hero && (
          <Link
            href={`/news/${hero.id}`}
            className="wv-card click"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              background: "#fff", borderRadius: 20,
              border: "1px solid #F0E6DE", overflow: "hidden",
              textDecoration: "none", marginBottom: 32,
              minHeight: 280,
            }}
          >
            {/* gradient panel */}
            <div style={{
              background: heroPal.bg, minHeight: 280,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ELIcon name={heroPal.icon} size={84} color={heroPal.fg} />
            </div>
            {/* 文字 */}
            <div style={{ padding: "28px 30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", background: "#E0552E", borderRadius: 999, padding: "4px 12px" }}>精選</span>
                {(hero.tags ?? []).slice(0, 2).map((tag) => {
                  const s = tagStyle(tag);
                  return <span key={tag} style={{ fontSize: 13, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 999, padding: "4px 12px" }}>#{tag}</span>;
                })}
              </div>
              <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{hero.title}</h2>
              {hero.summary_md && (
                <p style={{ margin: "0 0 16px", fontSize: 16, color: "#574E47", lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {hero.summary_md.replace(/[#*_`[\]]/g, "").slice(0, 200)}
                </p>
              )}
              <div style={{ fontSize: 14, color: "#6E645C" }}>
                {hero.source_org} · {getAgo(hero.published_at || hero.fetched_at)}
              </div>
            </div>
          </Link>
        )}

        {/* 文章格：gradient + icon 縮圖 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
          {rest.map((n, i) => {
            const pal = PALETTES[(i + 1) % PALETTES.length];
            return (
              <Link key={n.id} href={`/news/${n.id}`} className="wv-card click" style={{
                display: "flex", flexDirection: "column", background: "#fff",
                borderRadius: 18, border: "1px solid #F0E6DE", overflow: "hidden",
                textDecoration: "none",
              }}>
                {/* gradient icon 縮圖，高度固定 130px */}
                <div style={{
                  height: 130, background: pal.bg, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ELIcon name={pal.icon} size={46} color={pal.fg} />
                </div>
                <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                    {(n.tags ?? []).slice(0, 2).map((tag) => {
                      const s = tagStyle(tag);
                      return <span key={tag} style={{ fontSize: 12.5, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 999, padding: "3px 10px" }}>#{tag}</span>;
                    })}
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#241F1B", lineHeight: 1.45, flex: 1 }}>{n.title}</h3>
                  <div style={{ fontSize: 13.5, color: "#6E645C", marginTop: 10 }}>
                    {n.source_org} · {getAgo(n.published_at || n.fetched_at)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {news.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#6E645C" }}>
            <ELIcon name="news" size={48} color="#E4D7CC" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 18, fontWeight: 700 }}>暫無符合的文章</p>
          </div>
        )}
      </div>
    </div>
  );
}
