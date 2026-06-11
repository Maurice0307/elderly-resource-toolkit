"use client";

import { useState } from "react";
import { ELIcon } from "@/components/layout/ELIcon";

export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {faqs.map((f, i) => {
        const on = open === i;
        return (
          <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #F0E6DE", overflow: "hidden" }}>
            <button
              onClick={() => setOpen(on ? null : i)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
            >
              <span style={{ flex: 1, fontSize: 16.5, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{f.q}</span>
              <ELIcon name="chevron" size={20} color="#9C8E84" style={{ transform: on ? "rotate(270deg)" : "rotate(90deg)", transition: "transform .15s" }} />
            </button>
            {on && (
              <div style={{ padding: "0 16px 16px", fontSize: 15.5, color: "#574E47", lineHeight: 1.7 }}>{f.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
