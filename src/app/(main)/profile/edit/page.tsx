import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEdit } from "@/components/profile/ProfileEdit";
import { getAdmin } from "@/lib/auth/linking";

export const metadata = { title: "編輯個人資料" };

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/edit");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, identity, home_region_id")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "";
  const identity = (profile?.identity as string | undefined) ?? "";
  const regionId = (profile?.home_region_id as string | undefined) ?? "";
  const regionLabel = (user.user_metadata?.region as string | undefined) ?? "";
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? "";

  const provider = user.user_metadata?.provider as string | undefined;
  const isLine = provider === "line" || (user.email ?? "").endsWith("@line.users");
  const phoneLabel = user.phone ? user.phone.replace(/^\+?886/, "0") : "";

  // 查已綁定的登入方式（account_links + 帳號本身的身分）
  const admin = getAdmin();
  const { data: linkRows } = await admin
    .from("account_links").select("provider, provider_key").eq("user_id", user.id);
  const linked = new Set<string>((linkRows ?? []).map((r: { provider: string }) => r.provider));
  if (user.phone) linked.add("phone");
  if (isLine) linked.add("line");
  if (provider === "google" && user.email) linked.add("google");

  // 各方式顯示的值
  const googleLink = (linkRows ?? []).find((r: { provider: string }) => r.provider === "google") as { provider_key: string } | undefined;
  const linkValues = {
    line: linked.has("line") ? displayName : "",
    google: linked.has("google") ? (googleLink?.provider_key ?? user.email ?? "") : "",
    phone: phoneLabel,
  };

  return (
    <ProfileEdit
      defaultName={displayName}
      defaultIdentity={identity}
      defaultRegionId={regionId}
      defaultRegionLabel={regionLabel}
      email={isLine ? "" : user.email ?? ""}
      avatarUrl={avatarUrl}
      linked={Array.from(linked)}
      linkValues={linkValues}
    />
  );
}
