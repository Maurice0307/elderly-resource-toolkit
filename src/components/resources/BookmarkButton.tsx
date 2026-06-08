"use client";

import { useState, useEffect } from "react";
import { ELIcon } from "@/components/layout/ELIcon";

export function BookmarkButton({ resourceId }: { resourceId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const list: string[] = JSON.parse(localStorage.getItem("el_bookmarks") ?? "[]");
    setSaved(list.includes(resourceId));
  }, [resourceId]);

  function toggle() {
    const list: string[] = JSON.parse(localStorage.getItem("el_bookmarks") ?? "[]");
    const idx = list.indexOf(resourceId);
    if (idx >= 0) {
      list.splice(idx, 1);
      setSaved(false);
    } else {
      list.push(resourceId);
      setSaved(true);
    }
    localStorage.setItem("el_bookmarks", JSON.stringify(list));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        height: 46, borderRadius: 999,
        border: `1.5px solid ${saved ? "#F26B43" : "#E4D7CC"}`,
        background: saved ? "#FFF4EF" : "#fff",
        fontSize: 15, fontWeight: 700,
        color: saved ? "#B23F1E" : "#574E47",
        cursor: "pointer", font: "inherit",
      }}
    >
      <ELIcon name="heart" size={19} color={saved ? "#F26B43" : "#6E645C"} />
      {saved ? "已收藏" : "收藏"}
    </button>
  );
}
