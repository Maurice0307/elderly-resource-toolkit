"use client";
import { useTransition } from "react";
import { toggleVote } from "@/lib/qa/actions";
import { ELIcon } from "@/components/layout/ELIcon";

interface Props {
  answerId: string;
  questionId: string;
  voteCount: number;
  hasVoted: boolean;
  userId: string | null;
}

export function VoteButton({ answerId, questionId, voteCount, hasVoted, userId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!userId) { window.location.href = "/login"; return; }
    startTransition(() => { toggleVote(answerId, questionId); });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={hasVoted ? "取消「有用」" : "覺得有用"}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        minHeight: 0, height: 40, padding: "0 14px", borderRadius: 999,
        fontSize: 14, fontWeight: 800, cursor: "pointer", font: "inherit",
        border: "1.5px solid " + (hasVoted ? "#E0552E" : "#E4D7CC"),
        background: hasVoted ? "#FFF4EF" : "#fff",
        color: hasVoted ? "#B23F1E" : "#574E47",
        opacity: pending ? 0.6 : 1, flexShrink: 0,
      }}
    >
      <ELIcon name="like" size={16} color={hasVoted ? "#B23F1E" : "#574E47"} /> 有用 {voteCount}
    </button>
  );
}
