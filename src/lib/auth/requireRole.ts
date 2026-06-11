"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "user" | "moderator" | "admin";

const roleRank: Record<AppRole, number> = { user: 0, moderator: 1, admin: 2 };

export async function requireRole(min: "moderator" | "admin") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, points, display_name")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "user") as AppRole;
  if (roleRank[role] < roleRank[min]) redirect("/profile?denied=admin");

  return {
    user,
    role,
    points: profile?.points ?? 0,
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "使用者",
  };
}
