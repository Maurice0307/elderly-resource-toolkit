import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/config/categories";
import { ELIcon } from "@/components/layout/ELIcon";
import { MobileSearch } from "./MobileSearch";
import { MobileGuideBanner, IOSInstallGuide } from "./MobileHomeClient";

const DESC: Record<string, string> = {
  health: "看診、長照、輔具、篩檢",
  transport: "敬老卡、復康巴士、共乘",
  housing: "防跌、修繕、緊急救援、防災",
  finance: "防詐、遺產、信託、安養",
  subsidy: "津貼、年金、重大傷病",
  social: "福利諮詢、關懷、送餐",
  leisure: "據點、共餐、運動課程",
  education: "樂齡、社大、3C 教學",
};

/* 區塊標題（對齊設計稿 SectionLabel：珊瑚色直條 + 標題） */
function SectionLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ width: 4, height: 18, borderRadius: 2, background: "#F26B43" }} />
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#241F1B", whiteSpace: "nowrap" }}>{children}</h2>
      </div>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 16, color: "#6E645C" }}>{sub}</p>}
    </>
  );
}

export async function MobileHome() {
  const supabase = await createClient();

  // 分類筆數（用 count 查詢，避免被 1000 筆上限截斷）
  const countBySlug: Record<string, number> = {};
  try {
    const [{ data: catRows }, { data: subcatRows }] = await Promise.all([
      supabase.from("categories").select("id, slug"),
      supabase.from("subcategories").select("id, category_id"),
    ]);
    const subIdsByCat: Record<string, string[]> = {};
    for (const s of subcatRows ?? []) (subIdsByCat[s.category_id] ??= []).push(s.id);
    await Promise.all((catRows ?? []).map(async (c: { id: string; slug: string }) => {
      const subIds = subIdsByCat[c.id] ?? [];
      if (subIds.length === 0) { countBySlug[c.slug] = 0; return; }
      const { count } = await supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .in("subcategory_id", subIds)
        .eq("status", "active");
      countBySlug[c.slug] = count ?? 0;
    }));
  } catch { /* zero */ }

  // 今日新知（精選 1 則）
  const { data: news } = await supabase
    .from("daily_news")
    .select("id, title, source_org, tags, image_url")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1);
  const feat = news?.[0];

  return (
    <div className="wv-fade">
      {/* Hero */}
      <MobileSearch />

      {/* 教學橫幅 */}
      <div style={{ padding: "16px 18px 0" }}>
        <MobileGuideBanner />
      </div>

      {/* 依分類瀏覽（單欄清單） */}
      <section style={{ padding: "20px 18px 6px" }}>
        <SectionLabel sub="選擇一個分類，查看相關服務">依分類瀏覽</SectionLabel>
        <div style={{ marginTop: 8 }}>
          {categories.map((c, i) => {
            const count = countBySlug[c.slug] ?? 0;
            return (
              <Link key={c.slug} href={`/resources?cat=${c.slug}`} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "15px 0",
                borderTop: i === 0 ? "none" : "1px solid #F0E6DE", textDecoration: "none",
              }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF4EF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ELIcon name={c.icon} size={24} color="#F26B43" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#241F1B" }}>{c.name}</div>
                  <div style={{ marginTop: 2, fontSize: 13, color: "#6E645C", lineHeight: 1.5 }}>{DESC[c.slug] || ""}</div>
                </div>
                <span style={{ fontSize: 13, color: "#6E645C", whiteSpace: "nowrap" }}>
                  {count > 0 ? `${count} 項` : "即將"}
                </span>
                <ELIcon name="chevron" size={20} color="#6E645C" />
              </Link>
            );
          })}
        </div>

        {/* 分享好資源（即時投稿入口）— 虛線卡 */}
        <Link href="/submit" style={{
          marginTop: 14, background: "#FFF4EF", border: "1.5px dashed #FFD6C7", borderRadius: 18,
          padding: 16, display: "flex", alignItems: "center", gap: 13, textDecoration: "none",
        }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: "#E0552E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 5px 12px rgba(242,107,67,0.32)" }}>
            <ELIcon name="send" size={24} color="#fff" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>知道好資源？分享給厝邊</div>
            <div style={{ marginTop: 2, fontSize: 13, color: "#574E47", lineHeight: 1.5 }}>看到好用的服務、據點或補助，馬上推薦上來</div>
          </div>
          <span style={{ background: "#E0552E", color: "#fff", fontWeight: 800, fontSize: 14, padding: "10px 15px", borderRadius: 999, whiteSpace: "nowrap", alignSelf: "center" }}>立即分享</span>
        </Link>
      </section>

      {/* 陪伴工具箱 */}
      <section style={{ padding: "14px 18px 6px" }}>
        <SectionLabel>陪伴工具箱</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 14 }}>
          {[
            { icon: "cards", t: "互動圖卡", d: "步驟式大圖卡", href: "/activities" },
            { icon: "chat", t: "溝通錦囊", d: "對話示範指南", href: "/scripts" },
          ].map((x) => (
            <Link key={x.t} href={x.href} style={{
              background: "#FFF4EF", borderRadius: 18, padding: "16px 14px", border: "1px solid #FFE7DD", textDecoration: "none",
            }}>
              <span style={{ width: 46, height: 46, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ELIcon name={x.icon} size={25} color="#F26B43" />
              </span>
              <div style={{ marginTop: 11, fontSize: 18, fontWeight: 800, color: "#241F1B" }}>{x.t}</div>
              <div style={{ marginTop: 3, fontSize: 13, color: "#574E47" }}>{x.d}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 互助問答 */}
      <section style={{ padding: "14px 18px 6px" }}>
        <Link href="/qa" style={{
          background: "#fff", border: "1px solid #F0E6DE", borderRadius: 18, padding: 16,
          display: "flex", alignItems: "center", gap: 13, boxShadow: "0 2px 8px rgba(40,30,20,0.04)", textDecoration: "none",
        }}>
          <span style={{ width: 50, height: 50, borderRadius: 14, background: "#FFF4EF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ELIcon name="qa" size={27} color="#F26B43" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>互助問答</div>
            <div style={{ marginTop: 2, fontSize: 13, color: "#574E47", lineHeight: 1.5 }}>「中壢哪裡能免費量血壓？」在地志工來回答</div>
          </div>
          <ELIcon name="chevron" size={22} color="#6E645C" />
        </Link>
      </section>

      {/* 今日新知 */}
      {feat && (
        <section style={{ padding: "18px 18px 6px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#241F1B", whiteSpace: "nowrap" }}>今日新知</h2>
            <Link href="/news" style={{ fontSize: 13, fontWeight: 700, color: "#B23F1E", textDecoration: "none" }}>看全部 ›</Link>
          </div>
          <Link href={`/news/${feat.id}`} style={{
            display: "block", background: "#fff", border: "1px solid #F0E6DE", borderRadius: 18,
            overflow: "hidden", boxShadow: "0 2px 8px rgba(40,30,20,0.04)", textDecoration: "none",
          }}>
            {/* 配圖：有真圖→照片；無真圖→柔色封面 */}
            {feat.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={feat.image_url} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ height: 120, background: "linear-gradient(135deg,#E7F4EC 0%,#F4ECE4 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 56, height: 56, borderRadius: "26%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(120,60,30,0.12)" }}>
                  <ELIcon name="news" size={28} color="#2E7D52" />
                </span>
              </div>
            )}
            <div style={{ padding: 15 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                {feat.source_org && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#B23F1E", background: "#FFF4EF", padding: "4px 10px", borderRadius: 999 }}>{feat.source_org}</span>
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2E7D52", background: "#E7F4EC", padding: "4px 10px", borderRadius: 999 }}>
                  #{(feat.tags as string[])?.[0] || "健康"}
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", lineHeight: 1.45 }}>{feat.title}</div>
            </div>
          </Link>
        </section>
      )}

      {/* 加 LINE CTA */}
      <section style={{ padding: "18px 18px 24px" }}>
        <a href="https://line.me/R/ti/p/@796rwlaq" target="_blank" rel="noreferrer" style={{
          display: "flex", alignItems: "center", gap: 13,
          background: "linear-gradient(120deg,#E0552E,#F26B43)", borderRadius: 18, padding: "17px 18px",
          textDecoration: "none", boxShadow: "0 8px 20px rgba(224,85,46,0.28)",
        }}>
          <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ELIcon name="chat" size={26} color="#fff" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>加 LINE 好友問問題</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>不用打字，傳訊息就有人回</div>
          </div>
          <span style={{ background: "#fff", color: "#B23F1E", fontWeight: 800, fontSize: 14, padding: "9px 16px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>加好友</span>
        </a>
        <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 12, color: "#6E645C" }}>由 幸福好厝邊 整理維護 · 資料如有誤歡迎回報</p>
      </section>

      {/* iOS · 加入主畫面導引 */}
      <div style={{ padding: "0 18px" }}>
        <IOSInstallGuide />
      </div>
      <div style={{ height: 14 }} />
    </div>
  );
}
