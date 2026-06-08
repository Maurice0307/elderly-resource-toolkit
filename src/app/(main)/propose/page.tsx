import { ELIcon } from "@/components/layout/ELIcon";
import { createClient } from "@/lib/supabase/server";
import { ShareResourceTrigger } from "@/components/resources/ShareResourceModal";
import { ProposalList, type Proposal } from "@/components/propose/ProposalList";

export const metadata = { title: "點子提案專區" };

/* 尚未執行 0009 migration 前的展示用清單（與 seed 一致） */
const FALLBACK_PROPOSALS: Proposal[] = [
  { id: "f1", title: "教用手機掛號看診",     category: "智慧生活",    proposer: "里長・文山區", votes: 48, status: "open",     hot: true },
  { id: "f2", title: "台語版健康操影片",     category: "動動身體",    proposer: "志工 阿美",   votes: 36, status: "open" },
  { id: "f3", title: "如何分辨投資群組詐騙", category: "防詐・假訊息", proposer: "長者 陳先生", votes: 31, status: "open" },
  { id: "f4", title: "社區共餐料理教學",     category: "生活技能",    proposer: "志工 小林",   votes: 22, status: "open" },
  { id: "f5", title: "懷舊歌曲手語帶動唱",   category: "創意繪畫",    proposer: "長者 林阿嬤", votes: 15, status: "adopted" },
  { id: "f6", title: "陽台小菜園種植入門",   category: "花草植栽",    proposer: "家屬 王先生", votes: 11, status: "open" },
  { id: "f7", title: "剪紙藝術年節裝飾",     category: "手工美勞",    proposer: "志工 秀娟",   votes: 8,  status: "planning" },
];

export default async function ProposePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: subRows }, { data: regionRows }] = await Promise.all([
    supabase.from("subcategories").select("id, slug, name, categories!inner(slug)").order("name"),
    supabase.from("regions").select("id, name, parent_id").order("name"),
  ]);
  const subcategories = (subRows ?? []).map((r: any) => ({
    id: r.id as string, slug: r.slug as string, name: r.name as string,
    category_slug: (r.categories as { slug: string }).slug,
  }));
  const regions = (regionRows ?? []) as { id: string; name: string; parent_id: string | null }[];

  // 提案：讀真實資料表；尚未建表則用 FALLBACK（純展示）
  let proposals: Proposal[] = FALLBACK_PROPOSALS;
  let persist = false;
  const { data: propRows, error: propErr } = await supabase
    .from("proposals")
    .select("id, title, category, proposer_name, status, is_hot, vote_count")
    .order("vote_count", { ascending: false });
  if (!propErr && propRows && propRows.length > 0) {
    persist = true;
    let votedSet = new Set<string>();
    if (user) {
      const { data: votes } = await supabase
        .from("proposal_votes")
        .select("proposal_id")
        .eq("user_id", user.id);
      votedSet = new Set((votes ?? []).map((v: { proposal_id: string }) => v.proposal_id));
    }
    proposals = propRows.map((p: any) => ({
      id: p.id, title: p.title, category: p.category ?? "", proposer: p.proposer_name ?? "厝邊",
      votes: p.vote_count ?? 0, status: (p.status ?? "open") as Proposal["status"],
      hot: !!p.is_hot, voted: votedSet.has(p.id),
    }));
  }

  return (
    <div className="wv-fade">
      {/* 標題帶 */}
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD", padding: "34px 0 30px" }}>
        <div className="wv-wrap" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(26px, 3.2vw, 32px)", fontWeight: 800, color: "#241F1B" }}>點子提案專區</h1>
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
        <ProposalList proposals={proposals} loggedIn={!!user} persist={persist} />

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
