"use client";

import { useState } from "react";
import { ELIcon } from "@/components/layout/ELIcon";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        height: 46, borderRadius: 999,
        border: "1.5px solid #E4D7CC",
        background: "#fff",
        fontSize: 15, fontWeight: 700,
        color: copied ? "#2E7D52" : "#574E47",
        cursor: "pointer", font: "inherit",
      }}
    >
      <ELIcon name="share" size={19} color={copied ? "#2E7D52" : "#9B8E85"} />
      {copied ? "已複製連結" : "分享給家人"}
    </button>
  );
}
