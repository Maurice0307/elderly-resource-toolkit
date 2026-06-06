import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavActions } from "./NavActions";
import { NavSearch } from "./NavSearch";
import { ElderLinkLogo } from "@/components/ui/ElderLinkLogo";

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
      className="hidden"
      style={{
        background: "rgba(251,247,244,0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        minHeight: 56,
      }}
    >
      <Link
        href="/"
        aria-label="幸福好厝邊 回首頁"
        style={{ flexShrink: 0, textDecoration: "none" }}
      >
        <ElderLinkLogo size={34} showText={true} />
      </Link>

      <NavSearch />

      <NavActions user={user} role={role} />
    </header>
  );
}
