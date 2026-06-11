"use server";

import { createClient } from "@/lib/supabase/server";

export type RedeemState = { error: string } | { ok: true; code: string; name: string; where: string; cost: number } | null;

/* 兌換物資：檢查點數足夠 → 扣點 → 產生核銷碼 */
export async function redeemReward(_prev: RedeemState, formData: FormData): Promise<RedeemState> {
  const name = (formData.get("name") as string) || "物資";
  const where = (formData.get("where") as string) || "";
  const cost = parseInt((formData.get("cost") as string) || "0", 10);
  if (!cost || cost < 0) return { error: "兌換項目有誤" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "請先登入" };

  const { data: prof } = await supabase.from("profiles").select("points").eq("id", user.id).maybeSingle();
  const points = (prof?.points as number | undefined) ?? 0;
  if (points < cost) return { error: `點數不足，還差 ${cost - points} 點` };

  const { error } = await supabase.from("profiles").update({ points: points - cost }).eq("id", user.id);
  if (error) return { error: error.message };

  // 6 位數核銷碼（拿給里長／社工核銷）
  const code = String(Math.floor(100000 + Math.random() * 900000));
  return { ok: true, code, name, where, cost };
}
