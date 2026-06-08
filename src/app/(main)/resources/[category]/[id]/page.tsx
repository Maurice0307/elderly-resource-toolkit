import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/config/categories";
import { LikeButton } from "@/components/resources/LikeButton";
import { BookmarkButton } from "@/components/resources/BookmarkButton";
import { ShareButton } from "@/components/resources/ShareButton";
import { DwellTracker } from "@/components/resources/DwellTracker";
import { getResourceById } from "@/lib/resources/queries";
import { createClient } from "@/lib/supabase/server";
import { ELIcon } from "@/components/layout/ELIcon";

type Params = { category: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const resource = await getResourceById(id);
  return { title: resource?.name ?? "資源詳情" };
}

export default async function ResourcePage({ params }: { params: Promise<Params> }) {
  const { category, id } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const resource = await getResourceById(id);
  if (!resource) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialLiked = false;
  if (user) {
    const { data } = await supabase
      .from("resource_likes")
      .select("id")
      .eq("resource_id", resource.id)
      .eq("user_id", user.id)
      .maybeSingle();
    initialLiked = !!data;
  }

  const isNational = resource.scope === "national";
  const tel = resource.phone ? "tel:" + String(resource.phone).replace(/[^0-9+]/g, "") : null;

  return (
    <div className="wv-fade">
      <DwellTracker />
      <div className="wv-wrap" style={{ paddingTop: 26, paddingBottom: 56 }}>
        <div className="wv-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 28, alignItems: "start" }}>
          {/* 左欄：主內容 */}
          <div>
            <Link
              href={`/resources?cat=${cat.slug}`}
              className="wv-pill"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 18 }}
            >
              <ELIcon name="chevron" size={18} color="#574E47" style={{ transform: "rotate(180deg)" }} /> 返回列表
            </Link>

            <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #F0E6DE", padding: "32px 34px" }}>
              {/* 標籤列 */}
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: isNational ? "#EDF2FF" : "#FFF4EF", color: isNational ? "#2952B3" : "#B23F1E" }}>
                  <ELIcon name={isNational ? "shield" : "pin"} size={13} color={isNational ? "#2952B3" : "#F26B43"} />
                  {isNational ? "全國專線" : "在地服務"}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: "#2E7D52", background: "#E7F4EC", padding: "3px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <ELIcon name="check" size={13} color="#2E7D52" /> 政府／官方
                </span>
                <span style={{ fontSize: 13, color: "#9B8E85" }}>資料已驗證</span>
                {(resource as any).like_count > 0 && (
                  <span style={{ fontSize: 13, color: "#9B8E85" }}>· {(resource as any).like_count} 位厝邊說有用</span>
                )}
              </div>

              {/* 標題 + 摘要 */}
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#241F1B", lineHeight: 1.3 }}>{resource.name}</h1>
              {resource.summary && (
                <p style={{ margin: "16px 0 0", fontSize: 18, color: "#574E47", lineHeight: 1.8 }}>{resource.summary}</p>
              )}

              {/* 大電話按鈕 */}
              {resource.phone && tel && (
                <a href={tel} style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 64, borderRadius: 16, background: "#E0552E", color: "#fff", fontSize: 24, fontWeight: 800, textDecoration: "none", boxShadow: "0 10px 24px rgba(224,85,46,0.3)" }}>
                  <ELIcon name="phone" size={26} color="#fff" /> 撥打 {resource.phone}
                </a>
              )}

              {/* 撥打前可以這樣說 */}
              {resource.phone && (
                <div style={{ marginTop: 18, background: "#FFF4EF", border: "1px solid #FFE7DD", borderRadius: 16, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: "#B23F1E", marginBottom: 8 }}>
                    <ELIcon name="chat" size={20} color="#F26B43" /> 撥打前可以這樣說
                  </div>
                  <p style={{ margin: 0, fontSize: 16.5, color: "#574E47", lineHeight: 1.75 }}>
                    {resource.phone_hint ?? "說明您的需求與家人狀況，並先記下想問的問題，有助於快速獲得正確協助。"}
                  </p>
                </div>
              )}

              {/* 說明 */}
              {resource.description && (
                <div style={{ marginTop: 20, fontSize: 16.5, color: "#574E47", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {resource.description}
                </div>
              )}

              {/* 地址 + 地圖（有地址或有座標就顯示） */}
              {(resource.address || (resource.latitude && resource.longitude)) && (
                <>
                  {resource.address && (
                    <div style={{ marginTop: 18, display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 0", borderTop: "1px solid #F0E6DE" }}>
                      <ELIcon name="pin" size={24} color="#F26B43" style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: "#241F1B" }}>{resource.address}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: resource.address ? 4 : 18 }}>
                    {resource.latitude && resource.longitude ? (
                      /* OpenStreetMap embed — 免費、穩定、無需 API key */
                      <iframe
                        className="wv-map"
                        title={"地圖：" + resource.name}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${resource.longitude - 0.009},${resource.latitude - 0.006},${resource.longitude + 0.009},${resource.latitude + 0.006}&layer=mapnik&marker=${resource.latitude},${resource.longitude}`}
                      />
                    ) : (
                      /* Google Maps embed fallback（有地址無座標） */
                      <iframe
                        className="wv-map"
                        title={"地圖：" + resource.name}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={"https://maps.google.com/maps?q=" + encodeURIComponent(resource.address!) + "&z=15&hl=zh-TW&output=embed"}
                      />
                    )}
                    <a
                      href={
                        resource.latitude && resource.longitude
                          ? `https://www.google.com/maps?q=${resource.latitude},${resource.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.address!)}`
                      }
                      target="_blank" rel="noopener noreferrer"
                      style={{ marginTop: 11, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15.5, fontWeight: 700, color: "#B23F1E", textDecoration: "none" }}
                    >
                      <ELIcon name="map" size={18} color="#F26B43" /> 用地圖 App 開啟導航 <ELIcon name="arrow" size={16} color="#B23F1E" />
                    </a>
                  </div>
                </>
              )}

              {/* 官網 */}
              {resource.website_url && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #F0E6DE" }}>
                  <a
                    href={resource.website_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15.5, fontWeight: 700, color: "#B23F1E", textDecoration: "none" }}
                  >
                    <ELIcon name="link" size={18} color="#F26B43" /> 前往官方網站 <ELIcon name="arrow" size={16} color="#B23F1E" />
                  </a>
                </div>
              )}

              {/* 標籤 */}
              {resource.tags && (resource.tags as string[]).length > 0 && (
                <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(resource.tags as string[]).map((tag) => (
                    <span key={tag} style={{ fontSize: 14, fontWeight: 700, color: "#9B8E85", background: "#FAF7F5", padding: "6px 13px", borderRadius: 999 }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右欄：行動面板（sticky；手機取消） */}
          <aside className="wv-unsticky-sm" style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F0E6DE", padding: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#241F1B", marginBottom: 14 }}>這筆資源</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <LikeButton
                  resourceId={resource.id}
                  initialCount={resource.like_count}
                  initialLiked={initialLiked}
                  userId={user?.id ?? null}
                />
                <BookmarkButton resourceId={resource.id} />
                {resource.website_url && (
                  <a
                    href={resource.website_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff", fontSize: 15, fontWeight: 700, color: "#574E47", textDecoration: "none" }}
                  >
                    <ELIcon name="link" size={19} color="#9B8E85" /> 前往官網
                  </a>
                )}
                <ShareButton title={resource.name} />
                <a
                  href={`mailto:itchiang2025@gmail.com?subject=資料回報：${encodeURIComponent(resource.name)}&body=資源名稱：${encodeURIComponent(resource.name)}%0A有誤的資訊：`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff", fontSize: 15, fontWeight: 700, color: "#574E47", textDecoration: "none" }}
                >
                  <ELIcon name="report" size={19} color="#9B8E85" /> 回報資料有誤
                </a>
              </div>
              {resource.source_org && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #F0E6DE", fontSize: 13.5, color: "#9B8E85", lineHeight: 1.6 }}>
                  資料來源<br /><span style={{ color: "#574E47", fontWeight: 700 }}>{resource.source_org}</span>
                </div>
              )}
            </div>
            <div style={{ background: "#FFF4EF", borderRadius: 20, border: "1px solid #FFE7DD", padding: 20 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "#B23F1E", marginBottom: 6 }}>提醒</div>
              <p style={{ margin: 0, fontSize: 14.5, color: "#574E47", lineHeight: 1.7 }}>
                正式服務時間與資格以各單位最新公告為準。撥打前可先記下要問的問題。
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
