import { createClient } from "@supabase/supabase-js";

/* 帳號綁定共用工具：以 account_links 對照表把多種登入方式指向同一主帳號 */

export type LinkProvider = "line" | "google" | "phone" | "email";

export function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

type Admin = ReturnType<typeof getAdmin>;

/** 查某個登入身分目前綁到哪個主帳號 */
export async function findCanonicalUserId(admin: Admin, provider: LinkProvider, key: string): Promise<string | null> {
  const { data } = await admin
    .from("account_links")
    .select("user_id")
    .eq("provider", provider)
    .eq("provider_key", key)
    .maybeSingle();
  return (data?.user_id as string | undefined) ?? null;
}

/** 將登入身分綁定到指定主帳號（已存在則更新） */
export async function linkIdentity(admin: Admin, provider: LinkProvider, key: string, userId: string) {
  await admin.from("account_links").upsert(
    { provider, provider_key: key, user_id: userId },
    { onConflict: "provider,provider_key" },
  );
}

/** 確保帳號有 email（magiclink 建立 session 需要）；手機帳號補上合成 email */
export async function ensureEmail(admin: Admin, userId: string): Promise<string | null> {
  const { data } = await admin.auth.admin.getUserById(userId);
  const user = data?.user;
  if (!user) return null;
  if (user.email) return user.email;
  const synth = user.phone ? `phone_${user.phone}@phone.users` : `user_${userId}@elderlink.local`;
  await admin.auth.admin.updateUserById(userId, { email: synth, email_confirm: true });
  return synth;
}

/** 為指定主帳號產生可寫入 session 的 magiclink token_hash */
export async function makeSessionTokenHash(admin: Admin, userId: string): Promise<string | null> {
  const email = await ensureEmail(admin, userId);
  if (!email) return null;
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error) return null;
  return data?.properties?.hashed_token ?? null;
}

/** 使用者擁有的資料表（合併帳號時要改掛到主帳號） */
const OWNED: { table: string; col: string }[] = [
  { table: "resources", col: "submitted_by" },
  { table: "resource_likes", col: "user_id" },
  { table: "resource_feedback", col: "user_id" },
  { table: "resource_reports", col: "user_id" },
  { table: "questions", col: "user_id" },
  { table: "answers", col: "user_id" },
  { table: "answer_votes", col: "user_id" },
  { table: "proposal_votes", col: "user_id" },
  { table: "community_submissions", col: "submitted_by" },
];

/** 把舊帳號的內容（收藏／問答／投稿…）改掛到主帳號 */
export async function mergeUserData(admin: Admin, fromId: string, toId: string) {
  if (!fromId || !toId || fromId === toId) return;
  for (const { table, col } of OWNED) {
    // 唯一鍵衝突（同一人兩帳號對同項目都按過）會讓整張表更新失敗 → 略過，由刪除時清掉
    await admin.from(table).update({ [col]: toId }).eq(col, fromId);
  }
}

/** 吸收重複帳號：搬資料 → 刪除舊帳號（其綁定關係 FK cascade 一併清除） */
export async function absorbDuplicate(admin: Admin, fromId: string, toId: string) {
  if (!fromId || !toId || fromId === toId) return;
  // 合併後以「最早加入時間」為準：存活帳號的 created_at 取兩者較早者
  try {
    const { data: rows } = await admin.from("profiles").select("id, created_at").in("id", [fromId, toId]);
    const from = (rows ?? []).find((r) => r.id === fromId);
    const to = (rows ?? []).find((r) => r.id === toId);
    if (from?.created_at && to?.created_at && new Date(from.created_at).getTime() < new Date(to.created_at).getTime()) {
      await admin.from("profiles").update({ created_at: from.created_at }).eq("id", toId);
    }
  } catch {}
  await mergeUserData(admin, fromId, toId);
  try { await admin.auth.admin.deleteUser(fromId); } catch {}
}

/** 依 email 找帳號 id */
export async function findUserIdByEmail(admin: Admin, email: string): Promise<string | null> {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const e = email.toLowerCase();
  return (data?.users || []).find((u) => (u.email ?? "").toLowerCase() === e)?.id ?? null;
}

/** 依手機（E.164 或去 + 版本）找帳號 id */
export async function findUserIdByPhone(admin: Admin, phone: string): Promise<string | null> {
  const bare = phone.replace(/^\+/, "");
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  return (data?.users || []).find((u) => u.phone === bare || u.phone === `+${bare}` || u.phone === phone)?.id ?? null;
}
