import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";

export const metadata = { title: "點子提案專區" };

type Proposal = {
  id: string;
  votes: number;
  status: "募集中" | "已採納" | "規劃中";
  hot?: boolean;
  category: string;
  title: string;
  proposer: string;
};

const PROPOSALS: Proposal[] = [
  { id: "p1", votes: 48, status: "募集中", hot: true, category: "智慧生活", title: "教用手機掛號看診", proposer: "里長・文山區" },
  { id: "p2", votes: 36, status: "募集中", category: "動動身體", title: "台語版健康操影片", proposer: "志工 阿美" },
  { id: "p3", votes: 31, status: "募集中", category: "防詐・假訊息", title: "如何分辨投資群組詐騙", proposer: "長者 陳先生" },
  { id: "p4", votes: 22, status: "募集中", category: "生活技能", title: "社區共餐料理教學", proposer: "志工 小林" },
  { id: "p5", votes: 15, status: "已採納", category: "創意繪畫", title: "懷舊歌曲手語帶動唱", proposer: "長者 林阿嬤" },
  { id: "p6", votes: 11, status: "募集中", category: "花草植栽", title: "陽台小菜園種植入門", proposer: "家屬 王先生" },
  { id: "p7", votes: 8,  status: "規劃中", category: "手工美勞", title: "剪紙藝術年節裝飾", proposer: "志工 秀娟" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "募集中": { bg: "#FFF4EF", color: "#B23F1E" },
  "已採納": { bg: "#E7F4EC", color: "#2E7D52" },
  "規劃中": { bg: "#EDF2FF", color: "#2952B3" },
};

export default function ProposePage() {
  return (
    <div className="wv-fade">
      {/* 標題帶 */}
      <div style={{ background: "linear-gradient(135deg,#FFF1E9,#FFE3D5)", borderBottom: "1px solid #FFE7DD", padding: "44px 0 36px" }}>
        <div className="wv-wrap" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 800, color: "#241F1B" }}>點子提案專區</h1>
            <p style={{ margin: 0, fontSize: 17, color: "#574E47" }}>
              想學什麼、想教什麼都可以提案。越多人按「想要」，越快做成新圖卡或活動。
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
        {/* 排序 pills（靜態展示） */}
        <div style={{ display: "flex", gap: 9, marginBottom: 28 }}>
          {["最多人想要", "最新提案", "募集中優先"].map((label, i) => (
            <span
              key={label}
              style={{
                padding: "9px 18px", borderRadius: 999, fontSize: 15, fontWeight: 700,
                background: i === 0 ? "#FFF4EF" : "#fff",
                color: i === 0 ? "#B23F1E" : "#574E47",
                border: `1.5px solid ${i === 0 ? "#E0552E" : "#E4D7CC"}`,
                cursor: "default",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* 提案格 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18, marginBottom: 40 }}>
          {PROPOSALS.map((p) => {
            const ss = STATUS_STYLE[p.status];
            return (
              <div
                key={p.id}
                className="wv-card"
                style={{ background: "#fff", borderRadius: 20, border: "1px solid #F0E6DE", padding: "22px 22px", display: "flex", gap: 18, alignItems: "flex-start" }}
              >
                {/* 想要數 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, gap: 2 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ELIcon name="like" size={22} color="#F26B43" />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#B23F1E" }}>{p.votes}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#9B8E85" }}>想要</div>
                </div>
                {/* 內容 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: ss.bg, color: ss.color }}>
                      {p.status === "已採納" && "✓ "}
                      {p.status}
                    </span>
                    {p.hot && <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#FFF1E8", color: "#C2410C" }}>🔥 熱門</span>}
                    <span style={{ fontSize: 12.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#FAF7F5", color: "#574E47" }}>{p.category}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", lineHeight: 1.4, marginBottom: 8 }}>{p.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, color: "#9B8E85" }}>
                    <ELIcon name="user" size={14} color="#9B8E85" />
                    由 {p.proposer} 提案
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
          <Link
            href="/submit"
            style={{
              height: 46, padding: "0 20px", borderRadius: 999, border: "1.5px solid #E4D7CC",
              background: "#fff", color: "#574E47", fontSize: 15, fontWeight: 800,
              display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            + 分享好資源
          </Link>
        </div>
      </div>
    </div>
  );
}
