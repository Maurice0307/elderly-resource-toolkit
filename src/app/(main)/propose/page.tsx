import { createClient } from "@/lib/supabase/server";
import { ProposalList, type Proposal } from "@/components/propose/ProposalList";
import { WishButton } from "@/components/propose/WishButton";
import { MobileSubHeader } from "@/components/layout/MobileSubHeader";

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
      {/* 手機版返回列 + 簡介 */}
      <MobileSubHeader title="點子提案專區" />
      <div className="wv-mobile-only wv-wrap" style={{ paddingTop: 14 }}>
        <p style={{ margin: 0, fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>
          想學什麼、想教什麼，都可以提案。<b style={{ color: "#B23F1E" }}>越多人按「想要」，越快做成新圖卡或活動。</b>
        </p>
      </div>

      {/* 標題帶（桌機） */}
      <div className="wv-desktop-only" style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE7DD)", borderBottom: "1px solid #FFE7DD", padding: "34px 0 30px" }}>
        <div className="wv-wrap">
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(26px, 3.2vw, 32px)", fontWeight: 800, color: "#241F1B" }}>點子提案專區</h1>
          <p style={{ margin: 0, fontSize: 17, color: "#574E47" }}>
            想學什麼、想教什麼都可以提案。
            <span style={{ color: "#E0552E", fontWeight: 700 }}>越多人按「想要」，越快做成新圖卡或活動。</span>
          </p>
        </div>
      </div>

      <div className="wv-wrap" style={{ paddingTop: 36, paddingBottom: 40 }}>
        <ProposalList proposals={proposals} loggedIn={!!user} persist={persist} />

        {/* 我要提案（置底）→ 許願池彈窗 */}
        <WishButton loggedIn={!!user} />
      </div>
    </div>
  );
}
