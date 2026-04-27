"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "user";
  if (role !== "moderator" && role !== "admin") redirect("/");
  return { userId: user.id, role };
}

// ── Resource moderation ────────────────────────────────────────────────

export async function approveResource(resourceId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("resources").update({ status: "active" }).eq("id", resourceId);
  revalidatePath("/admin/resources");
}

export async function rejectResource(resourceId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("resources").update({ status: "archived" }).eq("id", resourceId);
  revalidatePath("/admin/resources");
}

export async function markResourceEnded(resourceId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("resources").update({ status: "ended" }).eq("id", resourceId);
  revalidatePath("/admin/resources");
}

// ── Q&A moderation ─────────────────────────────────────────────────────

export async function hideQuestion(questionId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("questions").update({ status: "hidden" }).eq("id", questionId);
  revalidatePath("/admin/questions");
}

export async function restoreQuestion(questionId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("questions").update({ status: "open" }).eq("id", questionId);
  revalidatePath("/admin/questions");
}

export async function deleteAnswer(answerId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("answers").delete().eq("id", answerId);
  revalidatePath("/admin/questions");
}

// ── User management (admin only) ───────────────────────────────────────

export async function setUserRole(targetUserId: string, role: "user" | "moderator" | "admin") {
  const { role: callerRole } = await assertAdmin();
  if (callerRole !== "admin") redirect("/");

  const admin = createAdminClient();
  await admin.from("profiles").update({ role }).eq("id", targetUserId);
  revalidatePath("/admin/users");
}

export async function assignModeratorRegion(moderatorId: string, regionId: string, assignedBy: string) {
  const { role: callerRole } = await assertAdmin();
  if (callerRole !== "admin") redirect("/");

  const admin = createAdminClient();
  await admin
    .from("region_moderators")
    .upsert({ user_id: moderatorId, region_id: regionId, assigned_by: assignedBy });
  revalidatePath("/admin/users");
}

export async function removeModeratorRegion(moderatorId: string, regionId: string) {
  const { role: callerRole } = await assertAdmin();
  if (callerRole !== "admin") redirect("/");

  const admin = createAdminClient();
  await admin
    .from("region_moderators")
    .delete()
    .eq("user_id", moderatorId)
    .eq("region_id", regionId);
  revalidatePath("/admin/users");
}
