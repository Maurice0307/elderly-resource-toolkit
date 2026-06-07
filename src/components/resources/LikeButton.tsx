"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ELIcon } from "@/components/layout/ELIcon";

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
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        height: 46, borderRadius: 999,
        border: `1.5px solid ${liked ? "#F26B43" : "#E4D7CC"}`,
        background: liked ? "#FFF4EF" : "#fff",
        fontSize: 15, fontWeight: 700,
        color: liked ? "#B23F1E" : "#574E47",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        font: "inherit",
      }}
      aria-pressed={liked}
    >
      <ELIcon name="like" size={19} color={liked ? "#F26B43" : "#9B8E85"} />
      有幫助
      {count > 0 && (
        <span style={{
          fontSize: 13, fontWeight: 800,
          background: liked ? "#F26B43" : "#F0E6DE",
          color: liked ? "#fff" : "#574E47",
          borderRadius: 999, padding: "1px 7px",
        }}>
          {count}
        </span>
      )}
    </button>
  );
}
