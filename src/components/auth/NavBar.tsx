import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavActions } from "./NavActions";
import { siteConfig } from "@/config/siteConfig";

export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
      style={{
        background: "rgba(255,251,245,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #E7E5E4",
      }}
    >
      <Link
        href="/"
        className="text-xl font-bold"
        style={{ color: "#92400E" }}
      >
        {siteConfig.shortName}
      </Link>

      <NavActions user={user} />
    </header>
  );
}
