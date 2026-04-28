"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { signOut } from "@/lib/auth/actions";

export function NavActions({ user, role }: { user: User | null; role?: string | null }) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full px-5 py-2 text-base font-semibold transition"
        style={{ background: "var(--cta)", color: "var(--cta-on)" }}
      >
        登入
      </Link>
    );
  }

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "使用者";

  const initials = displayName.slice(0, 1).toUpperCase();

  const isStaff = role === "moderator" || role === "admin";

  return (
    <div className="flex items-center gap-3">
      {isStaff && (
        <Link
          href="/admin"
          className="hidden rounded-full px-4 py-2 text-base font-semibold sm:inline-block"
          style={{ background: "var(--text-primary)", color: "var(--bg-accent)" }}
        >
          後台
        </Link>
      )}
      <Link
        href="/profile"
        className="flex items-center gap-3"
        aria-label="我的帳戶"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold"
          style={{ background: "var(--cta)", color: "var(--cta-on)" }}
        >
          {initials}
        </div>
        <span className="hidden text-base font-medium sm:inline" style={{ color: "var(--text-primary)" }}>
          {displayName}
        </span>
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full px-4 py-2 text-base font-medium transition"
          style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
        >
          登出
        </button>
      </form>
    </div>
  );
}
