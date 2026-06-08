import { ELIcon } from "@/components/layout/ELIcon";
import { createClient } from "@/lib/supabase/server";
import { ShareResourceTrigger } from "@/components/resources/ShareResourceModal";
import { ProposalList } from "@/components/propose/ProposalList";

export const metadata = { title: "點子提案專區" };

export default async function ProposePage() {
  const supabase = await createClient();
  const [{ data: subRows }, { data: regionRows }] = await Promise.all([
    supabase.from("subcategories").select("id, slug, name, categories!inner(slug)").order("name"),
    supabase.from("regions").select("id, name, parent_id").order("name"),
  ]);
  const subcategories = (subRows ?? []).map((r: any) => ({
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    category_slug: (r.categories as { slug: string }).slug,
  }));
  const regions = (regionRows ?? []) as { id: string; name: string; parent_id: string | null }[];
  return (
    <div className="wv-fade">
      {/* 標題帶 */}
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE3D5)", borderBottom: "1px solid #FFE7DD", padding: "44px 0 36px" }}>
        <div className="wv-wrap" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800, color: "#241F1B" }}>點子提案專區</h1>
            <p style={{ margin: 0, fontSize: 17, color: "#574E47" }}>
              想學什麼、想教什麼都可以提案。
              <span style={{ color: "#E0552E", fontWeight: 700 }}>越多人按「想要」，越快做成新圖卡或活動。</span>
            </p>
          </div>
          <a
            href="mailto:itchiang2025@gmail.com?subject=新提案&body=提案名稱：%0A提案說明："
            style={{
              height: 50, padding: "0 24px", borderRadius: 999, background: "#E0552E",
              color: "#fff", fontSize: 16, fontWeight: 800, display: "inline-flex",
              alignItems: "center", gap: 9, textDecoration: "none",
              boxShadow: "0 6px 16px rgba(224,85,46,0.26)", flexShrink: 0,
            }}
          >
            <ELIcon name="megaphone" size={19} color="#fff" /> 我要提案
          </a>
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 36, paddingBottom: 64 }}>
        <ProposalList />

        {/* 分享好資源 CTA */}
        <div style={{
          background: "#fff", borderRadius: 20, border: "1px solid #F0E6DE",
          padding: "22px 24px", display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#E0552E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ELIcon name="send" size={24} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>知道哪裡有好服務？</div>
            <div style={{ marginTop: 3, fontSize: 15, color: "#574E47" }}>分享一筆資源，志工確認後就會刊登，幫到更多厝邊。</div>
          </div>
          <ShareResourceTrigger subcategories={subcategories} regions={regions} />
        </div>
      </div>
    </div>
  );
}
