import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavActions } from "./NavActions";
import { siteConfig } from "@/config/siteConfig";

export async function NavBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
      style={{
        background: "rgba(255,251,245,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #E7E5E4",
      }}
    >
      {/* Logo */}
      <Link href="/" className="shrink-0 text-xl font-bold" style={{ color: "#92400E" }}>
        {siteConfig.shortName}
      </Link>

      {/* 搜尋框（桌面版） */}
      <form method="GET" action="/search" className="hidden flex-1 sm:block">
        <input
          name="q"
          type="search"
          placeholder="搜尋服務、機構…"
          className="w-full rounded-full border px-5 py-2 text-lg outline-none transition focus:ring-2"
          style={{ borderColor: "#E7E5E4", background: "#FFFFFF", color: "#1C1917" }}
        />
      </form>

      {/* 搜尋 icon（手機版） */}
      <Link
        href="/search"
        aria-label="搜尋"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:hidden"
        style={{ background: "#F5F0E8", color: "#B45309" }}
      >
        🔍
      </Link>

      <NavActions user={user} />
    </header>
  );
}
