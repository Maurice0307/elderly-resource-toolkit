"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavSearch() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <Link
        href="/search"
        aria-label="搜尋"
        className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--bg-soft)", color: "var(--cta)" }}
      >
        🔍
      </Link>
    );
  }

  return (
    <>
      <form method="GET" action="/search" className="hidden flex-1 sm:block">
        <input
          name="q"
          type="search"
          placeholder="搜尋服務、機構…"
          className="w-full rounded-full border px-5 py-2 text-lg outline-none transition focus:ring-2"
          style={{ borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
        />
      </form>
      <Link
        href="/search"
        aria-label="搜尋"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:hidden"
        style={{ background: "var(--bg-soft)", color: "var(--cta)" }}
      >
        🔍
      </Link>
    </>
  );
}
