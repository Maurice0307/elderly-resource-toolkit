"use client";

import { useDailySearch } from "@/contexts/DailySearchContext";

const CAP = 3;

export function DailyCapNote() {
  const { count } = useDailySearch();
  if (count === 0) return null;

  const atCap = count >= CAP;
  return (
    <div
      style={{
        fontSize: "0.75rem",
        color: atCap ? "var(--warning)" : "var(--text-muted)",
        textAlign: "center",
        padding: "6px 18px",
        letterSpacing: "0.02em",
      }}
    >
      今日有效查找 {count}/{CAP}{atCap ? "　已達今日上限" : ""}
    </div>
  );
}
