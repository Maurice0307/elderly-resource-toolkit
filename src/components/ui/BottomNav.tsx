"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "首頁",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 10.5 L12 3 L21 10.5 V20 a1 1 0 0 1-1 1 H15 v-5 H9 v5 H4 a1 1 0 0 1-1-1 Z" />
      </svg>
    ),
    activeIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3 10.5 L12 3 L21 10.5 V20 a1 1 0 0 1-1 1 H15 v-5 H9 v5 H4 a1 1 0 0 1-1-1 Z" />
      </svg>
    ),
    match: (p: string) => p === "/",
  },
  {
    href: "/activities",
    label: "圖卡",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="5" width="14" height="10" rx="2" />
        <rect x="8" y="9" width="14" height="10" rx="2" />
      </svg>
    ),
    activeIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <rect x="2" y="5" width="14" height="10" rx="2" opacity="0.6" />
        <rect x="8" y="9" width="14" height="10" rx="2" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/activities"),
  },
  {
    href: "/qa",
    label: "問答",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    activeIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/qa"),
  },
  {
    href: "/news",
    label: "新知",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
      </svg>
    ),
    activeIcon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" aria-hidden>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/news"),
  },
  {
    href: "/profile",
    label: "我的",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    activeIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    match: (p: string) => p.startsWith("/profile"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  /* 後台不顯示底部導覽 */
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="主要導覽"
      style={{
        flexShrink: 0,
        height: "calc(64px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "stretch",
        boxShadow: "0 -4px 18px rgba(36,31,27,0.06)",
      }}
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            aria-label={tab.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "9px 0 6px",
              color: active ? "var(--cta)" : "var(--text-muted)",
              textDecoration: "none",
              WebkitTapHighlightColor: "transparent",
              transition: "color 0.15s ease",
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                stroke: active ? "var(--cta)" : "var(--text-muted)",
                display: "block",
              }}
            >
              {active ? tab.activeIcon : tab.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                letterSpacing: "0.03em",
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
