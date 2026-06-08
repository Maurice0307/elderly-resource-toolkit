"use client";

import { usePathname } from "next/navigation";
import { WebTopNav } from "./WebTopNav";
import { WebFooter } from "./WebFooter";
import { MobileTabBar } from "./MobileTabBar";

const SKIP_PATHS = ["/admin", "/login", "/signup", "/callback", "/welcome"];

export function WebShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skip = SKIP_PATHS.some((p) => pathname.startsWith(p));

  if (skip) {
    return <>{children}</>;
  }

  return (
    <div className="wv">
      <WebTopNav />
      <main className="wv-main" style={{ flex: 1 }}>
        {children}
      </main>
      <WebFooter />
      <MobileTabBar />
    </div>
  );
}
