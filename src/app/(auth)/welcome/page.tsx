import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Onboarding } from "@/components/auth/Onboarding";

export const metadata = { title: "完成設定" };

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("identity, home_region_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  // 已完成身分 + 地區設定 → 直接進首頁
  if (profile?.identity && profile?.home_region_id) redirect("/");

  const defaultName =
    profile?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    "";

  return <Onboarding defaultName={defaultName} />;
}
