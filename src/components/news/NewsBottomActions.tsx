"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ELIcon } from "@/components/layout/ELIcon";
import { ReportButton } from "@/components/resources/ReportButton";

/* 今日新知底部動作：收藏 / 回報 / 看別則新知（回上頁） */
export function NewsBottomActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const saveKey = `news:${id}`;

  useEffect(() => {
    try { setSaved(localStorage.getItem(saveKey) === "1"); } catch {}
  }, [saveKey]);

  const toggleSave = () => setSaved((v) => {
    const nv = !v;
    try { nv ? localStorage.setItem(saveKey, "1") : localStorage.removeItem(saveKey); } catch {}
    return nv;
  });

  const back = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/news");
  };

  return (
    <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button onClick={toggleSave} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 46, padding: "0 18px", borderRadius: 999, border: `1.5px solid ${saved ? "#F2B79E" : "#E4D7CC"}`, background: saved ? "#FFF4EF" : "#fff", color: saved ? "#B23F1E" : "#574E47", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        <ELIcon name="heart" size={19} color={saved ? "#B23F1E" : "#6E645C"} /> {saved ? "已收藏" : "收藏"}
      </button>
      <ReportButton subject={title} kind="news" />
      <button onClick={back} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 46, padding: "0 18px", borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff", color: "#574E47", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        <ELIcon name="news" size={18} color="#6E645C" /> 看別則新知
      </button>
    </div>
  );
}
