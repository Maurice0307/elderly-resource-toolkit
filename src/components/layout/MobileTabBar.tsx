"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ELIcon } from "./ELIcon";

/* iOS App 風底部主導覽（手機才出現，桌面隱藏） */
const TABS = [
  { key: "home",  label: "首頁", icon: "home",   href: "/" },
  { key: "learn", label: "圖卡", icon: "cards",  href: "/activities" },
  { key: "qa",    label: "問答", icon: "qa",     href: "/qa" },
  { key: "news",  label: "新知", icon: "news",   href: "/news" },
  { key: "me",    label: "我的", icon: "user",   href: "/profile" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="wv-tabbar" aria-label="主導覽">
      {TABS.map((t) => {
        const on = isActive(t.href);
        return (
          <Link
            key={t.key}
            href={t.href}
            className="wv-tabitem"
            aria-current={on ? "page" : undefined}
            style={{ color: on ? "#E0552E" : "#9B8E85" }}
          >
            <ELIcon name={t.icon} size={25} color={on ? "#E0552E" : "#9B8E85"} />
            <span style={{ fontSize: 11.5, fontWeight: on ? 800 : 600 }}>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
