"use client";
import { useTransition } from "react";
import { toggleVote } from "@/lib/qa/actions";

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
      aria-label={hasVoted ? "取消讚" : "讚"}
      className="flex items-center gap-1.5 rounded-full px-4 py-2 text-base font-semibold transition disabled:opacity-60"
      style={
        hasVoted
          ? { background: "#FEF3C7", color: "#92400E", border: "1.5px solid #FDE68A" }
          : { background: "#F5F0E8", color: "#78716C", border: "1.5px solid #E7E5E4" }
      }
    >
      👍 {voteCount}
    </button>
  );
}
