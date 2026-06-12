"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type VoteResult = { ok: true; voted: boolean } | { ok: false; error: string };

/* 許願池：使用者提案想要的活動 → 寫入 proposals（status=open，等大家按想要） */
export async function submitWish(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "請先登入才能提案" };

  const title = ((formData.get("title") as string | null) ?? "").trim();
  const category = ((formData.get("category") as string | null) ?? "").trim() || null;
  if (!title) return { error: "請寫下你希望有什麼活動" };
  if (title.length > 60) return { error: "活動名稱請精簡在 60 字以內" };

  // 提案人名稱：用個人資料的顯示名稱
  const { data: profile } = await supabase
    .from("profiles").select("display_name").eq("id", user.id).single();
  const proposer = (profile?.display_name as string | null)?.trim() || "厝邊";

  const admin = createAdminClient();
  const { error } = await admin.from("proposals").insert({
    title, category, proposer_name: proposer, status: "open", is_hot: false, vote_count: 0,
  });
  if (error) return { error: "送出失敗，請稍後再試" };

  revalidatePath("/propose");
  return { ok: true };
}

/* 切換「想要」投票：已投則收回、未投則投。vote_count 由資料庫觸發器維護 */
export async function toggleProposalVote(proposalId: string): Promise<VoteResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "請先登入才能按想要" };

  const { data: existing } = await supabase
    .from("proposal_votes")
    .select("id")
    .eq("proposal_id", proposalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("proposal_votes").delete().eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/propose");
    return { ok: true, voted: false };
  }

  const { error } = await supabase
    .from("proposal_votes")
    .insert({ proposal_id: proposalId, user_id: user.id });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/propose");
  return { ok: true, voted: true };
}
