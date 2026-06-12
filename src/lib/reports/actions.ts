"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* 前台：使用者送出內容問題回報 → 寫入 content_reports（表未建立時不影響使用者體驗） */
export async function submitContentReport(input: {
  kind: string; subject: string; reasons: string[]; note: string;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = createAdminClient();
    await admin.from("content_reports").insert({
      kind: input.kind,
      subject: (input.subject ?? "").slice(0, 200),
      reasons: input.reasons ?? [],
      note: (input.note ?? "").trim() || null,
      user_id: user?.id ?? null,
      status: "open",
    });
    revalidatePath("/admin/reports");
  } catch {
    /* content_reports 尚未建立（migration 未跑）→ 靜默略過，前台仍顯示已收到 */
  }
}

/* 後台：標記已處理 / 刪除 */
async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? "user";
  if (role !== "moderator" && role !== "admin") redirect("/");
}

export async function resolveReport(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("content_reports").update({ status: "resolved" }).eq("id", id);
  revalidatePath("/admin/reports");
}

export async function reopenReport(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("content_reports").update({ status: "open" }).eq("id", id);
  revalidatePath("/admin/reports");
}

export async function deleteReport(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("content_reports").delete().eq("id", id);
  revalidatePath("/admin/reports");
}
