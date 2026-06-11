"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { WebTopNav } from "./WebTopNav";
import { WebFooter } from "./WebFooter";
import { MobileTabBar } from "./MobileTabBar";

const SKIP_PATHS = ["/admin", "/login", "/signup", "/callback", "/welcome"];

export function WebShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skip = SKIP_PATHS.some((p) => pathname.startsWith(p));

  // 套用使用者設定的字級（無障礙頁／字級鈕會寫入 localStorage）
  useEffect(() => {
    try {
      const s = parseFloat(localStorage.getItem("el_font_scale") || "1");
      if (s && Math.abs(s - 1) > 0.001) {
        const m = document.querySelector("main");
        if (m) (m as HTMLElement).style.zoom = String(s);
      }
    } catch {}
  }, [pathname]);

  if (skip) {
    return <>{children}</>;
  }

  // 子頁（已自帶返回列 SubHeader）→ 手機版隱藏頂部品牌列，只留返回列 + 底部導覽
  const SUBPAGE_PATHS = ["/resources", "/search", "/qa", "/activities", "/scripts", "/news", "/propose", "/submit", "/profile/edit", "/profile/favorites", "/soon", "/faq", "/accessibility", "/privacy", "/notifications", "/progress", "/rewards"];
  const isSubpage = SUBPAGE_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className={`wv${isSubpage ? " wv-subpage" : ""}`}>
      <WebTopNav />
      <main className="wv-main" style={{ flex: 1 }}>
        {children}
      </main>
      <WebFooter />
      <MobileTabBar />
    </div>
  );
}
