"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ELIcon } from "./ELIcon";

/* 手機版子頁返回列（對齊設計稿 SubHeader）：返回 + 標題 + 可選搜尋。
   桌機隱藏（外層 wv-mobile-only），桌機仍用 WebTopNav。 */
export function MobileSubHeader({ title, search = true, backHref }: { title: string; search?: boolean; backHref?: string }) {
  const router = useRouter();
  const back = () => {
    if (backHref) router.push(backHref);
    else if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };
  return (
    <div className="wv-mobile-only">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE", background: "#fff" }}>
        <button onClick={back} aria-label="返回" style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0, fontSize: 22, fontWeight: 800, color: "#241F1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {search && (
          <Link href="/search" aria-label="搜尋" style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ELIcon name="search" size={21} color="#574E47" />
          </Link>
        )}
      </div>
    </div>
  );
}
