"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type VoteResult = { ok: true; voted: boolean } | { ok: false; error: string };

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
