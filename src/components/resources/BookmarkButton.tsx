"use client";

import { useState, useTransition } from "react";
import { ELIcon } from "@/components/layout/ELIcon";
import { toggleBookmark } from "@/lib/resources/bookmarkAction";

export function BookmarkButton({ resourceId, initialSaved = false, initialCount = 0, loggedIn = true }: { resourceId: string; initialSaved?: boolean; initialCount?: number; loggedIn?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  function onClick() {
    if (!loggedIn) { window.location.href = "/login"; return; }
    start(async () => {
      const r = await toggleBookmark(resourceId);
      if ("saved" in r) { setSaved(r.saved); setCount(r.count); }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        height: 46, borderRadius: 999,
        border: `1.5px solid ${saved ? "#F26B43" : "#E4D7CC"}`,
        background: saved ? "#FFF4EF" : "#fff",
        fontSize: 15, fontWeight: 700,
        color: saved ? "#B23F1E" : "#574E47",
        cursor: "pointer", font: "inherit", opacity: pending ? 0.6 : 1,
      }}
    >
      <ELIcon name="heart" size={19} color={saved ? "#F26B43" : "#6E645C"} />
      {saved ? "已收藏" : "收藏"}{count > 0 ? ` · ${count}` : ""}
    </button>
  );
}
