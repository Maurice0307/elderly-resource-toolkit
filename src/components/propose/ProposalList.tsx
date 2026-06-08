"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ELIcon } from "@/components/layout/ELIcon";
import { toggleProposalVote } from "@/lib/proposals/actions";

export type Proposal = {
  id: string;
  votes: number;
  status: "open" | "adopted" | "planning";
  hot?: boolean;
  category: string;
  title: string;
  proposer: string;
  voted?: boolean;
};

const STATUS_STYLE: Record<Proposal["status"], { bg: string; color: string; label: string; check?: boolean }> = {
  open:     { bg: "#FFF4EF", color: "#B23F1E", label: "募集中" },
  adopted:  { bg: "#E7F4EC", color: "#2E7D52", label: "已採納", check: true },
  planning: { bg: "#EDF2FF", color: "#2952B3", label: "規劃中" },
};

type Sort = "votes" | "new" | "active";
const SORTS: { key: Sort; label: string }[] = [
  { key: "votes",  label: "最多人想要" },
  { key: "new",    label: "最新提案" },
  { key: "active", label: "募集中優先" },
];

export function ProposalList({ proposals, loggedIn, persist = true }: { proposals: Proposal[]; loggedIn: boolean; persist?: boolean }) {
  const router = useRouter();
  const [sort, setSort] = useState<Sort>("votes");
  const [voteMap, setVoteMap] = useState<Record<string, number>>(
    Object.fromEntries(proposals.map((p) => [p.id, p.votes])),
  );
  const [liked, setLiked] = useState<Record<string, boolean>>(
    Object.fromEntries(proposals.map((p) => [p.id, !!p.voted])),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleVote(id: string) {
    const wasLiked = liked[id];
    // 樂觀更新
    setLiked((l) => ({ ...l, [id]: !wasLiked }));
    setVoteMap((v) => ({ ...v, [id]: v[id] + (wasLiked ? -1 : 1) }));

    if (!persist) return; // 尚未建表：純展示，僅本地切換
    if (!loggedIn) {
      // 還原後導去登入
      setLiked((l) => ({ ...l, [id]: wasLiked }));
      setVoteMap((v) => ({ ...v, [id]: v[id] + (wasLiked ? 1 : -1) }));
      router.push("/login");
      return;
    }
    setPendingId(id);
    const res = await toggleProposalVote(id);
    setPendingId(null);
    if (!res.ok) {
      setLiked((l) => ({ ...l, [id]: wasLiked }));
      setVoteMap((v) => ({ ...v, [id]: v[id] + (wasLiked ? 1 : -1) }));
    }
  }

  const sorted = [...proposals].sort((a, b) => {
    if (sort === "votes")  return voteMap[b.id] - voteMap[a.id];
    if (sort === "active") return (a.status === "open" ? 0 : 1) - (b.status === "open" ? 0 : 1) || voteMap[b.id] - voteMap[a.id];
    return proposals.indexOf(b) - proposals.indexOf(a);
  });

  return (
    <>
      {/* 排序 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#574E47", flexShrink: 0 }}>排序</span>
        {SORTS.map(({ key, label }) => {
          const on = sort === key;
          return (
            <button key={key} onClick={() => setSort(key)} style={{
              padding: "9px 18px", borderRadius: 999, fontSize: 15, fontWeight: 700,
              background: on ? "#FFF4EF" : "#fff", color: on ? "#B23F1E" : "#574E47",
              border: `1.5px solid ${on ? "#E0552E" : "#E4D7CC"}`, cursor: "pointer", fontFamily: "inherit",
            }}>{label}</button>
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
            <div key={p.id} className="wv-card" style={{ background: "#fff", borderRadius: 20, border: "1px solid #F0E6DE", padding: "22px", display: "flex", gap: 18, alignItems: "flex-start" }}>
              {/* 想要按鈕 */}
              <button
                onClick={() => handleVote(p.id)}
                disabled={pendingId === p.id}
                aria-label={isLiked ? "取消想要" : "我想要"}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: isLiked ? "#FFF1E8" : "#FFF4EF",
                  border: isLiked ? "1.5px solid #E0552E" : "1.5px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                }}>
                  <ELIcon name="like" size={22} color={isLiked ? "#E0552E" : "#F26B43"} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: isLiked ? "#E0552E" : "#B23F1E", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{votes}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: isLiked ? "#E0552E" : "#6E645C" }}>{isLiked ? "已按" : "想要"}</div>
              </button>

              {/* 內容 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: ss.bg, color: ss.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {ss.check && <ELIcon name="check" size={12} color={ss.color} />}{ss.label}
                  </span>
                  {p.hot && (
                    <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#FFF1E8", color: "#C2410C" }}>🔥 熱門</span>
                  )}
                  <span style={{ fontSize: 12.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#FAF7F5", color: "#574E47" }}>{p.category}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", lineHeight: 1.4, marginBottom: 8 }}>{p.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, color: "#6E645C" }}>
                  <ELIcon name="user" size={14} color="#6E645C" /> 由 {p.proposer} 提案
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
