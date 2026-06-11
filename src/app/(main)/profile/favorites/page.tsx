import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";
import { ELIcon } from "@/components/layout/ELIcon";

export const metadata = { title: "我的收藏" };

type LikeRow = {
  resource: {
    id: string;
    name: string;
    summary: string | null;
    tags: string[] | null;
    subcategory: { category: { slug: string; name: string } | null } | null;
  } | null;
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/favorites");

  const { data } = await supabase
    .from("resource_likes")
    .select("resource:resources(id, name, summary, tags, subcategory:subcategories(category:categories(slug, name)))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as LikeRow[];
  const items = rows.map((r) => r.resource).filter((r): r is NonNullable<LikeRow["resource"]> => !!r);

  return (
    <div className="wv-fade" style={{ background: "#FAF6F2", minHeight: "100%" }}>
      <MobileSubHeader title="我的收藏" search={false} />

      <div style={{ padding: "14px 18px 28px", maxWidth: 640, margin: "0 auto" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 24px" }}>
            <div style={{ width: 84, height: 84, borderRadius: "50%", background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <ELIcon name="heart" size={40} color="#F0A98E" />
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#241F1B" }}>還沒有收藏</h2>
            <p style={{ margin: "10px 0 22px", fontSize: 15.5, color: "#574E47", lineHeight: 1.7 }}>在資源頁點愛心，就能把常用的服務收藏起來，下次更快找到。</p>
            <Link href="/resources" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E0552E", color: "#fff", borderRadius: 999, padding: "13px 24px", fontSize: 16, fontWeight: 800, textDecoration: "none" }}>
              <ELIcon name="arrow" size={18} color="#fff" /> 去找資源
            </Link>
          </div>
        ) : (
          <>
            <p style={{ margin: "0 0 14px", fontSize: 15, color: "#6E645C" }}>共 {items.length} 筆收藏</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((res) => {
                const catSlug = res.subcategory?.category?.slug ?? "medical-health";
                return (
                  <Link key={res.id} href={`/resources/${catSlug}/${res.id}`} className="click" style={{ display: "block", background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", borderLeft: "4px solid #F2764F", padding: "16px 18px", textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {res.subcategory?.category?.name && (
                          <span style={{ fontSize: 12.5, fontWeight: 800, color: "#C2410C", background: "#FFF1E8", borderRadius: 999, padding: "3px 10px" }}>{res.subcategory.category.name}</span>
                        )}
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B", marginTop: 8 }}>{res.name}</div>
                        {res.summary && <div style={{ fontSize: 14, color: "#574E47", lineHeight: 1.55, marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{res.summary}</div>}
                      </div>
                      <ELIcon name="chevron" size={20} color="#C8B8AE" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
