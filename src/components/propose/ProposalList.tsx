"use client";

import { useState } from "react";
import { ELIcon } from "@/components/layout/ELIcon";

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
  { id: "p1", votes: 48, status: "募集中", hot: true,  category: "智慧生活",   title: "教用手機掛號看診",    proposer: "里長・文山區" },
  { id: "p2", votes: 36, status: "募集中",              category: "動動身體",   title: "台語版健康操影片",    proposer: "志工 阿美"     },
  { id: "p3", votes: 31, status: "募集中",              category: "防詐・假訊息", title: "如何分辨投資群組詐騙", proposer: "長者 陳先生"   },
  { id: "p4", votes: 22, status: "募集中",              category: "生活技能",   title: "社區共餐料理教學",    proposer: "志工 小林"     },
  { id: "p5", votes: 15, status: "已採納",              category: "創意繪畫",   title: "懷舊歌曲手語帶動唱",  proposer: "長者 林阿嬤"   },
  { id: "p6", votes: 11, status: "募集中",              category: "花草植栽",   title: "陽台小菜園種植入門",  proposer: "家屬 王先生"   },
  { id: "p7", votes: 8,  status: "規劃中",              category: "手工美勞",   title: "剪紙藝術年節裝飾",   proposer: "志工 秀娟"     },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "募集中": { bg: "#FFF4EF", color: "#B23F1E" },
  "已採納": { bg: "#E7F4EC", color: "#2E7D52" },
  "規劃中": { bg: "#EDF2FF", color: "#2952B3" },
};

type Sort = "votes" | "new" | "active";

const SORTS: { key: Sort; label: string }[] = [
  { key: "votes",  label: "最多人想要"  },
  { key: "new",    label: "最新提案"    },
  { key: "active", label: "募集中優先" },
];

export function ProposalList() {
  const [voteMap, setVoteMap] = useState<Record<string, number>>(
    Object.fromEntries(PROPOSALS.map((p) => [p.id, p.votes]))
  );
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState<Sort>("votes");

  function handleVote(id: string) {
    if (liked[id]) {
      setVoteMap((v) => ({ ...v, [id]: v[id] - 1 }));
      setLiked((l) => ({ ...l, [id]: false }));
    } else {
      setVoteMap((v) => ({ ...v, [id]: v[id] + 1 }));
      setLiked((l) => ({ ...l, [id]: true }));
    }
  }

  const sorted = [...PROPOSALS].sort((a, b) => {
    if (sort === "votes")  return voteMap[b.id] - voteMap[a.id];
    if (sort === "active") return (a.status === "募集中" ? 0 : 1) - (b.status === "募集中" ? 0 : 1);
    return PROPOSALS.indexOf(b) - PROPOSALS.indexOf(a); // "new" = reverse
  });

  return (
    <>
      {/* 排序 pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#9B8E85", flexShrink: 0 }}>排序</span>
        {SORTS.map(({ key, label }) => {
          const on = sort === key;
          return (
            <button
              key={key}
              onClick={() => setSort(key)}
              style={{
                padding: "9px 18px", borderRadius: 999, fontSize: 15, fontWeight: 700,
                background: on ? "#FFF4EF" : "#fff",
                color: on ? "#B23F1E" : "#574E47",
                border: `1.5px solid ${on ? "#E0552E" : "#E4D7CC"}`,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 提案格 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18, marginBottom: 40 }}>
        {sorted.map((p) => {
          const ss = STATUS_STYLE[p.status];
          const isLiked = liked[p.id];
          const votes = voteMap[p.id];
          return (
            <div
              key={p.id}
              className="wv-card"
              style={{ background: "#fff", borderRadius: 20, border: "1px solid #F0E6DE", padding: "22px", display: "flex", gap: 18, alignItems: "flex-start" }}
            >
              {/* 想要按鈕 */}
              <button
                onClick={() => handleVote(p.id)}
                aria-label={isLiked ? "取消想要" : "我想要"}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 2, flexShrink: 0, background: "none", border: "none",
                  cursor: "pointer", padding: 0, fontFamily: "inherit",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: isLiked ? "#FFF1E8" : "#FFF4EF",
                  border: isLiked ? "1.5px solid #E0552E" : "1.5px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  <ELIcon name="like" size={22} color={isLiked ? "#E0552E" : "#F26B43"} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: isLiked ? "#E0552E" : "#B23F1E", lineHeight: 1.1 }}>{votes}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: isLiked ? "#E0552E" : "#9B8E85" }}>想要</div>
              </button>

              {/* 內容 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: ss.bg, color: ss.color }}>
                    {p.status === "已採納" && "✓ "}{p.status}
                  </span>
                  {p.hot && (
                    <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#FFF1E8", color: "#C2410C" }}>
                      🔥 熱門
                    </span>
                  )}
                  <span style={{ fontSize: 12.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#FAF7F5", color: "#574E47" }}>
                    {p.category}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", lineHeight: 1.4, marginBottom: 8 }}>
                  {p.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, color: "#9B8E85" }}>
                  <ELIcon name="user" size={14} color="#9B8E85" />
                  由 {p.proposer} 提案
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
