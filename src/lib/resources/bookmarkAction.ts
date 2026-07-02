"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 切換收藏：寫入 resource_bookmarks 並重算 resources.bookmark_count
export async function toggleBookmark(resourceId: string): Promise<{ saved: boolean; count: number } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "未登入" };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("resource_bookmarks")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("resource_id", resourceId)
    .maybeSingle();

  let saved: boolean;
  if (existing) {
    await admin.from("resource_bookmarks").delete().eq("user_id", user.id).eq("resource_id", resourceId);
    saved = false;
  } else {
    await admin.from("resource_bookmarks").insert({ user_id: user.id, resource_id: resourceId });
    saved = true;
  }

  // 重算收藏數（準確、避免競態）
  const { count } = await admin
    .from("resource_bookmarks")
    .select("user_id", { count: "exact", head: true })
    .eq("resource_id", resourceId);
  await admin.from("resources").update({ bookmark_count: count ?? 0 }).eq("id", resourceId);

  return { saved, count: count ?? 0 };
}
