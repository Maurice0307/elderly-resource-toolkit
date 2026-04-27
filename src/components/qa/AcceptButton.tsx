"use client";
import { useTransition } from "react";
import { acceptAnswer } from "@/lib/qa/actions";

interface Props {
  answerId: string;
  questionId: string;
  isAccepted: boolean;
  currentAcceptedId: string | null;
  isQuestionOwner: boolean;
}

export function AcceptButton({
  answerId,
  questionId,
  isAccepted,
  currentAcceptedId,
  isQuestionOwner,
}: Props) {
  const [pending, startTransition] = useTransition();
  if (!isQuestionOwner) {
    if (!isAccepted) return null;
    return (
      <span
        className="flex items-center gap-1.5 rounded-full px-4 py-2 text-base font-semibold"
        style={{ background: "#ECFDF5", color: "#065F46", border: "1.5px solid #6EE7B7" }}
      >
        ✅ 已採納
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => { acceptAnswer(answerId, questionId, currentAcceptedId); })
      }
      className="flex items-center gap-1.5 rounded-full px-4 py-2 text-base font-semibold transition disabled:opacity-60"
      style={
        isAccepted
          ? { background: "#ECFDF5", color: "#065F46", border: "1.5px solid #6EE7B7" }
          : { background: "#F5F0E8", color: "#78716C", border: "1.5px solid #E7E5E4" }
      }
    >
      {isAccepted ? "✅ 已採納" : "採納此答案"}
    </button>
  );
}
