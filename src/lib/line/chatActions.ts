"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pushLineText, logLineMessage } from "@/lib/line/store";

/* 後台人工回覆 LINE 使用者 */
export async function adminSendLine(userId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? "user";
  if (role !== "moderator" && role !== "admin") redirect("/");

  const text = ((formData.get("text") as string | null) ?? "").trim();
  if (!text) return;

  const ok = await pushLineText(userId, text);
  if (ok) await logLineMessage({ userId, direction: "out", text, byAdmin: true });
  revalidatePath("/admin/chats");
}
