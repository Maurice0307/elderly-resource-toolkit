import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/config/categories";
import { ELIcon } from "@/components/layout/ELIcon";
import { MobileSearch } from "./MobileSearch";

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

function MobSectionHead({ title, sub, more, href }: { title: string; sub?: string; more?: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 13 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#241F1B" }}>{title}</h2>
        {sub && <p style={{ margin: "3px 0 0", fontSize: 14, color: "#6E645C" }}>{sub}</p>}
      </div>
      {more && href && (
        <Link href={href} style={{ fontSize: 14.5, fontWeight: 700, color: "#B23F1E", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
          {more} ›
        </Link>
      )}
    </div>
  );
}

export async function MobileHome() {
  const supabase = await createClient();

  // 分類筆數
  const countBySlug: Record<string, number> = {};
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
      const slug = catIdToSlug[subcatToCategory[r.subcategory_id]];
      if (slug) countBySlug[slug] = (countBySlug[slug] ?? 0) + 1;
    }
  } catch { /* zero */ }

  // 今日新知（精選 1 則）
  const { data: news } = await supabase
    .from("daily_news")
    .select("id, title, source_org, tags")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1);
  const feat = news?.[0];

  return (
    <div className="wv-fade">
      {/* Hero */}
      <MobileSearch />

      <div style={{ padding: "20px 18px 8px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* 教學橫幅 */}
        <Link href="/guide" style={{
          display: "flex", alignItems: "center", gap: 13, background: "#fff",
          border: "1.5px solid #FFD6C7", borderRadius: 16, padding: "14px 16px", textDecoration: "none",
        }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#F2764F,#E0552E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M6 4.5v15l13-7.5z" /></svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16.5, fontWeight: 800, color: "#241F1B" }}>第一次使用？看 2 分鐘教學</div>
            <div style={{ marginTop: 1, fontSize: 13.5, color: "#574E47" }}>認識怎麼找資源、怎麼打電話問</div>
          </div>
          <span style={{ background: "#E0552E", color: "#fff", fontWeight: 800, fontSize: 13.5, padding: "8px 13px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>看教學</span>
        </Link>

        {/* 依分類瀏覽（直式清單）*/}
        <section>
          <MobSectionHead title="依分類瀏覽" sub="選擇一個分類，查看相關服務" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {categories.map((c) => {
              const count = countBySlug[c.slug] ?? 0;
              return (
                <Link key={c.slug} href={`/resources?cat=${c.slug}`} style={{
                  display: "flex", alignItems: "center", gap: 14, background: "#fff",
                  border: "1px solid #F0E6DE", borderRadius: 16, padding: "14px 16px", textDecoration: "none",
                }}>
                  <span style={{ width: 48, height: 48, borderRadius: 13, background: "#FFF4EF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ELIcon name={c.icon} size={25} color="#F26B43" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17.5, fontWeight: 800, color: "#241F1B" }}>{c.name}</div>
                    <div style={{ marginTop: 2, fontSize: 13.5, color: "#6E645C" }}>{DESC[c.slug] || ""}</div>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#B23F1E", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {count > 0 ? `${count} 項` : "即將"}
                  </span>
                  <ELIcon name="chevron" size={17} color="#CBBFB5" />
                </Link>
              );
            })}
          </div>

          {/* 分享好資源 CTA */}
          <Link href="/submit" style={{
            marginTop: 12, display: "flex", alignItems: "center", gap: 13,
            background: "linear-gradient(120deg,#FFF4EF,#FFE7DD)", border: "1px solid #FFE7DD",
            borderRadius: 16, padding: "15px 16px", textDecoration: "none",
          }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "#E0552E", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ELIcon name="send" size={22} color="#fff" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#241F1B" }}>知道好資源？分享給厝邊</div>
              <div style={{ marginTop: 1, fontSize: 13, color: "#574E47" }}>看到好用的服務、據點或補助，馬上推薦上來</div>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: "#B23F1E", whiteSpace: "nowrap", flexShrink: 0 }}>立即分享 ›</span>
          </Link>
        </section>

        {/* 陪伴工具箱 */}
        <section>
          <MobSectionHead title="陪伴工具箱" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { icon: "cards", t: "互動圖卡", d: "步驟式大圖卡", href: "/activities" },
              { icon: "chat", t: "溝通錦囊", d: "對話示範指南", href: "/scripts" },
            ].map((x) => (
              <Link key={x.t} href={x.href} style={{
                display: "flex", flexDirection: "column", gap: 9, background: "#fff",
                border: "1px solid #F0E6DE", borderRadius: 16, padding: "18px 16px", textDecoration: "none",
              }}>
                <span style={{ width: 50, height: 50, borderRadius: 14, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ELIcon name={x.icon} size={26} color="#F26B43" />
                </span>
                <div>
                  <div style={{ fontSize: 16.5, fontWeight: 800, color: "#241F1B" }}>{x.t}</div>
                  <div style={{ marginTop: 2, fontSize: 13, color: "#6E645C" }}>{x.d}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 互助問答入口 */}
        <Link href="/qa" style={{
          display: "flex", alignItems: "center", gap: 13, background: "#fff",
          border: "1px solid #F0E6DE", borderRadius: 16, padding: "16px 16px", textDecoration: "none",
        }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: "#FFF4EF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ELIcon name="qa" size={25} color="#F26B43" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16.5, fontWeight: 800, color: "#241F1B" }}>互助問答</div>
            <div style={{ marginTop: 2, fontSize: 13.5, color: "#6E645C" }}>有問題？在地志工來回答</div>
          </div>
          <ELIcon name="chevron" size={18} color="#CBBFB5" />
        </Link>

        {/* 今日新知 */}
        {feat && (
          <section>
            <MobSectionHead title="今日新知" more="看全部" href="/news" />
            <Link href={`/news/${feat.id}`} style={{
              display: "flex", gap: 13, background: "#fff", border: "1px solid #F0E6DE",
              borderRadius: 16, padding: "15px 16px", textDecoration: "none", alignItems: "flex-start",
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "#E7F4EC", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ELIcon name="news" size={24} color="#2E7D52" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#2E7D52", background: "#E7F4EC", padding: "2px 9px", borderRadius: 999 }}>
                    {(feat.tags as string[])?.[0] || "新知"}
                  </span>
                  <span style={{ fontSize: 12.5, color: "#6E645C" }}>{feat.source_org}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#241F1B", lineHeight: 1.45 }}>{feat.title}</div>
              </div>
            </Link>
          </section>
        )}

        {/* 加 LINE CTA */}
        <a href="https://line.me" target="_blank" rel="noreferrer" style={{
          display: "flex", alignItems: "center", gap: 13, background: "#06C755",
          borderRadius: 16, padding: "16px 18px", textDecoration: "none", marginBottom: 4,
        }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ELIcon name="chat" size={24} color="#fff" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16.5, fontWeight: 800, color: "#fff" }}>加 LINE 好友問問題</div>
            <div style={{ marginTop: 1, fontSize: 13.5, color: "rgba(255,255,255,0.9)" }}>不用打字，傳訊息就有人回</div>
          </div>
          <span style={{ background: "#fff", color: "#06C755", fontWeight: 800, fontSize: 13.5, padding: "8px 14px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>加好友</span>
        </a>
      </div>
    </div>
  );
}
