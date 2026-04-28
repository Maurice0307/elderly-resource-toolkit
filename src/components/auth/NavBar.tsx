import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavActions } from "./NavActions";
import { NavSearch } from "./NavSearch";
import { siteConfig } from "@/config/siteConfig";

export async function NavBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
      style={{
        background: "rgba(250,248,245,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="shrink-0 text-xl font-bold" style={{ color: "var(--cta)" }}>
        {siteConfig.shortName}
      </Link>

      <NavSearch />

      <NavActions user={user} role={role} />
    </header>
  );
}
