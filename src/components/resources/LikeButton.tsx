"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  resourceId: string;
  initialCount: number;
  initialLiked: boolean;
  userId: string | null;
};

export function LikeButton({ resourceId, initialCount, initialLiked, userId }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (!userId) {
      router.push("/login");
      return;
    }
    if (loading) return;

    setLoading(true);
    const supabase = createClient();

    if (liked) {
      await supabase
        .from("resource_likes")
        .delete()
        .eq("resource_id", resourceId)
        .eq("user_id", userId);
      setLiked(false);
      setCount((c) => Math.max(c - 1, 0));
    } else {
      await supabase
        .from("resource_likes")
        .insert({ resource_id: resourceId, user_id: userId });
      setLiked(true);
      setCount((c) => c + 1);
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 rounded-2xl px-6 py-4 text-xl font-semibold transition disabled:opacity-60"
      style={
        liked
          ? { background: "var(--bg-accent)", color: "#92400E", border: "2px solid #FDE68A", minHeight: "var(--hit)" }
          : { background: "var(--bg-soft)", color: "var(--text-secondary)", border: "2px solid var(--border)", minHeight: "var(--hit)" }
      }
      aria-pressed={liked}
      title={userId ? undefined : "請先登入才能按讚"}
    >
      <span className="icon-lg">👍</span>
      <span>有幫助</span>
      {count > 0 && (
        <span
          className="rounded-full px-2 py-0.5 text-base font-bold"
          style={liked ? { background: "var(--cta)", color: "var(--cta-on)" } : { background: "var(--border)", color: "var(--text-secondary)" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
