"use client";

import { usePathname } from "next/navigation";
import { WebTopNav } from "./WebTopNav";
import { WebFooter } from "./WebFooter";

const SKIP_PATHS = ["/admin", "/login", "/signup", "/callback"];

export function WebShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skip = SKIP_PATHS.some((p) => pathname.startsWith(p));

  if (skip) {
    return <>{children}</>;
  }

  return (
    <div className="wv">
      <WebTopNav />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <WebFooter />
    </div>
  );
}
