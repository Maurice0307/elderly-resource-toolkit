import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/config/categories";
import { listResourcesByCategory } from "@/lib/resources/queries";
import { getUserRegionCode } from "@/lib/location/cookies";
import { getRegionByCode, getRegionAndParentIds } from "@/lib/location/regions";
import { ELIcon } from "@/components/layout/ELIcon";

type Params = { category: string };
type Search = { sub?: string };

const CAT_ICON_MAP: Record<string, string> = {
  health: "health", transport: "transport", housing: "housing",
  finance: "finance", social: "social", leisure: "leisure", education: "education",
};

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  return { title: cat?.name ?? "生活資源" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { category } = await params;
  const { sub } = await searchParams;

  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const regionCode = await getUserRegionCode();
  const [regionInfo, regionIds] = await Promise.all([
    regionCode ? getRegionByCode(regionCode) : Promise.resolve(null),
    regionCode ? getRegionAndParentIds(regionCode) : Promise.resolve([]),
  ]);

  const resources = await listResourcesByCategory({
    categorySlug: category,
    subcategorySlug: sub,
    regionIds: regionIds.length > 0 ? regionIds : undefined,
  });

  const catIcon = CAT_ICON_MAP[category] || "search";

  return (
    <div className="wv-fade">
      {/* 標題帶 */}
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE3D5)", borderBottom: "1px solid #FFE7DD", padding: "34px 0 28px" }}>
        <div className="wv-wrap">
          <Link href="/resources" className="wv-pill" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
            <ELIcon name="chevron" size={16} color="#574E47" style={{ transform: "rotate(180deg)" }} /> 返回資源查找
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#FFE7DD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ELIcon name={catIcon} size={28} color="#F26B43" />
            </div>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "#241F1B" }}>{cat.name}</h1>
              <div style={{ fontSize: 15, color: "#574E47", display: "flex", alignItems: "center", gap: 8 }}>
                共 <b style={{ color: "#241F1B" }}>{resources.length}</b> 項服務
                {regionInfo && <><span style={{ color: "#E4D7CC" }}>·</span> 優先顯示 {regionInfo.name} 在地資源</>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 24, paddingBottom: 56 }}>
        {/* 子分類 chip 列 */}
        <div className="wv-subwrap" style={{ marginBottom: 20 }}>
          <Link
            href={`/resources/${cat.slug}`}
            style={{
              padding: "9px 16px", borderRadius: 999, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none",
              border: `1.5px solid ${!sub ? "#E0552E" : "#E4D7CC"}`,
              background: !sub ? "#E0552E" : "#fff",
              color: !sub ? "#fff" : "#574E47",
            }}
          >全部</Link>
          {cat.subcategories.map((s) => {
            const active = sub === s.slug;
            return (
              <Link
                key={s.slug}
                href={`/resources/${cat.slug}?sub=${s.slug}`}
                style={{
                  padding: "9px 16px", borderRadius: 999, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none",
                  border: `1.5px solid ${active ? "#E0552E" : "#E4D7CC"}`,
                  background: active ? "#E0552E" : "#fff",
                  color: active ? "#fff" : "#574E47",
                }}
              >
                {s.name}
              </Link>
            );
          })}
        </div>

        {/* 地區提示 */}
        {!regionInfo && (
          <div style={{ marginBottom: 16, background: "#FFF4EF", borderRadius: 12, padding: "12px 16px", fontSize: 14.5, color: "#B23F1E", lineHeight: 1.5, display: "flex", alignItems: "center", gap: 8 }}>
            <ELIcon name="pin" size={16} color="#F26B43" />
            目前顯示全國服務。設定地區後可優先看到附近資源。
          </div>
        )}

        {/* 資源卡片列表 */}
        {resources.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px dashed #E4D7CC", padding: 48, textAlign: "center" }}>
            <ELIcon name={catIcon} size={44} color="#E4D7CC" style={{ margin: "0 auto 14px" }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: "#574E47" }}>此分類目前還沒有資源</div>
            <Link href="/submit" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 20, background: "#E0552E", color: "#fff", borderRadius: 999, height: 46, padding: "0 22px", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
              <ELIcon name="send" size={16} color="#fff" /> 推薦資源
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {resources.map((r) => {
              const local = r.scope === "local";
              return (
                <Link
                  key={r.id}
                  href={`/resources/${cat.slug}/${r.id}`}
                  className="wv-card click"
                  style={{ display: "block", background: "#fff", borderRadius: 18, border: "1px solid #F0E6DE", padding: "20px 22px", textDecoration: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <span style={{ width: 50, height: 50, borderRadius: 14, background: "#FFF4EF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ELIcon name={local ? "pin" : "phone"} size={25} color="#F26B43" />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: local ? "#FFF4EF" : "#EDF2FF", color: local ? "#B23F1E" : "#2952B3" }}>
                          <ELIcon name={local ? "pin" : "shield"} size={12} color={local ? "#F26B43" : "#2952B3"} />
                          {local ? "在地服務" : "全國專線"}
                        </span>
                        <span style={{ fontSize: 12.5, color: "#9B8E85" }}>已驗證</span>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{r.name}</div>
                      {r.summary && (
                        <p style={{ margin: "8px 0 0", fontSize: 15.5, color: "#574E47", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {r.summary}
                        </p>
                      )}
                      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        {r.phone && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 17, fontWeight: 800, color: "#B23F1E" }}>
                            <ELIcon name="phone" size={18} color="#F26B43" /> {r.phone}
                          </span>
                        )}
                        <span style={{ marginLeft: "auto", fontSize: 14.5, fontWeight: 700, color: "#B23F1E" }}>查看詳情 →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* 底部投稿 CTA */}
            <div style={{ background: "#FFF4EF", border: "1.5px dashed #FFD6C7", borderRadius: 18, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F26B43", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ELIcon name="send" size={22} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>少了哪個資源？</div>
                <div style={{ marginTop: 2, fontSize: 14, color: "#574E47" }}>知道好用的就推薦給大家</div>
              </div>
              <Link href="/submit" style={{ background: "#E0552E", color: "#fff", fontWeight: 800, fontSize: 14, padding: "10px 15px", borderRadius: 999, whiteSpace: "nowrap", textDecoration: "none" }}>
                立即分享
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
