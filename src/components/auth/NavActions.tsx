"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { signOut } from "@/lib/auth/actions";

export function NavActions({ user }: { user: User | null }) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full px-5 py-2 text-base font-semibold text-white transition"
        style={{ background: "#B45309" }}
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

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white"
        style={{ background: "#B45309" }}
        aria-hidden
      >
        {initials}
      </div>
      <span className="hidden text-base font-medium sm:inline" style={{ color: "#1C1917" }}>
        {displayName}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full px-4 py-2 text-base font-medium transition"
          style={{ background: "#F5F0E8", color: "#78716C" }}
        >
          登出
        </button>
      </form>
    </div>
  );
}
