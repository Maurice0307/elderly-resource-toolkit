"use client";
import { useActionState, useRef } from "react";
import { postAnswer } from "@/lib/qa/actions";

export function AnswerForm({ questionId }: { questionId: string }) {
  const [state, action, pending] = useActionState(postAnswer, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd);
        formRef.current?.reset();
      }}
      className="mt-6"
    >
      <input type="hidden" name="question_id" value={questionId} />
      <textarea
        name="body"
        required
        rows={5}
        placeholder="分享你知道的，幫助更多人 🙌"
        className="w-full rounded-2xl border px-5 py-4 text-xl outline-none transition focus:ring-2"
        style={{ borderColor: "#E7E5E4", background: "#FFFFFF", color: "#1C1917", resize: "vertical" }}
      />
      {state?.error && (
        <p className="mt-2 text-base font-medium" style={{ color: "#DC2626" }}>
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-2xl px-8 py-4 text-xl font-bold text-white transition disabled:opacity-60"
        style={{ background: "#B45309" }}
      >
        {pending ? "送出中…" : "送出回答"}
      </button>
    </form>
  );
}
