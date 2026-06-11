"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { error: string } | null;

/* 首次登入：設定身分（長輩/家人/志工）+ 所在地區，寫入 profiles */
export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const identity = formData.get("identity") as string;
  const regionId = (formData.get("region_id") as string) || null;
  const regionLabel = (formData.get("region_label") as string) || "";
  const displayName = ((formData.get("display_name") as string) || "").trim();

  if (!identity || !["elder", "family", "volunteer"].includes(identity)) {
    return { error: "請選擇您的身分" };
  }
  if (!displayName) {
    return { error: "請輸入您的稱呼" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ identity, home_region_id: regionId, display_name: displayName })
    .eq("id", user.id);
  if (error) return { error: error.message };

  // 同步寫入 auth metadata，讓 UI 立即可讀（名稱、地區標籤、身分）
  await supabase.auth.updateUser({ data: { identity, region: regionLabel, display_name: displayName } });

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  if (data.url) redirect(data.url);
}

export async function signInWithLine() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  // LINE OAuth provider — must be enabled in Supabase Auth dashboard
  const { data, error } = await supabase.auth.signInWithOAuth({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: "line" as any,
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  if (data.url) redirect(data.url);
}

/* 台灣手機號 → E.164（SMS 供應商要求）：0912345678 / 0912-345-678 → +886912345678 */
function normalizeTwPhone(raw: string): string {
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  if (d.startsWith("886")) return "+" + d;
  if (d.startsWith("09") && d.length === 10) return "+886" + d.slice(1);
  if (d.startsWith("9") && d.length === 9) return "+886" + d;
  return d.startsWith("+") ? d : "+" + d;
}

export async function sendPhoneOtp(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | { sent: true; phone: string }> {
  const input = (formData.get("phone") as string).trim();
  const phone = normalizeTwPhone(input);
  if (!/^\+886\d{9}$/.test(phone)) {
    return { error: "請輸入正確的手機號碼（例：0912 345 678）" };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) return { error: error.message };
  return { sent: true, phone }; // 回傳正規化後的號碼，供驗證步驟使用
}

export async function verifyPhoneOtp(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const phone = normalizeTwPhone((formData.get("phone") as string).trim());
  const token = (formData.get("token") as string).trim();
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error) return { error: "驗證碼不正確或已過期，請重新發送" };
  redirect("/welcome");
}

/* Email + 密碼：免外部供應商即可運作的登入/註冊（mode=login|register） */
export async function emailAuth(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const mode = (formData.get("mode") as string) || "login";
  const email = ((formData.get("email") as string) || "").trim();
  const password = (formData.get("password") as string) || "";
  if (!email || !password) return { error: "請輸入 Email 與密碼" };
  if (password.length < 6) return { error: "密碼至少 6 個字" };

  const supabase = await createClient();

  if (mode === "register") {
    const displayName = ((formData.get("display_name") as string) || "").trim() || email.split("@")[0];
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { display_name: displayName } },
    });
    if (error) return { error: error.message };
    // 若專案關閉信箱驗證，signUp 會直接帶 session → 進 onboarding；否則提示去收信
    if (!data.session) {
      return { error: "註冊成功！請到信箱點擊確認連結後再登入。" };
    }
    redirect("/welcome");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email 或密碼不正確" };
  redirect("/");
}

/* 編輯個人資料：更新 顯示名稱 / 身分 / 地區 */
export async function updateProfile(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const displayName = ((formData.get("display_name") as string) || "").trim();
  const identity = (formData.get("identity") as string) || "";
  const regionId = (formData.get("region_id") as string) || null;
  const regionLabel = (formData.get("region_label") as string) || "";

  if (!displayName) return { error: "請輸入顯示名稱" };
  if (!["elder", "family", "volunteer"].includes(identity)) return { error: "請選擇您的身分" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, identity, home_region_id: regionId })
    .eq("id", user.id);
  if (error) return { error: error.message };

  // 同步 auth metadata，讓 UI 立即讀到
  await supabase.auth.updateUser({ data: { display_name: displayName, identity, region: regionLabel } });

  redirect("/profile");
}

/* 綁定手機到目前登入帳號：發送 OTP（phone_change） */
export async function sendBindPhoneOtp(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | { sent: true; phone: string }> {
  const phone = normalizeTwPhone((formData.get("phone") as string).trim());
  if (!/^\+886\d{9}$/.test(phone)) return { error: "請輸入正確的手機號碼（例：0912 345 678）" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 若此號碼已被其他重複帳號占用：先把它的資料搬到目前帳號，再釋放（合併）
  try {
    const { getAdmin, findUserIdByPhone, absorbDuplicate } = await import("@/lib/auth/linking");
    const admin = getAdmin();
    const conflictId = await findUserIdByPhone(admin, phone);
    if (conflictId && conflictId !== user.id) await absorbDuplicate(admin, conflictId, user.id);
  } catch {}

  const { error } = await supabase.auth.updateUser({ phone });
  if (error) return { error: error.message };
  return { sent: true, phone };
}

/* 綁定手機：驗證 OTP 後手機即加入目前帳號，並寫入對照表 */
export async function verifyBindPhoneOtp(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const phone = normalizeTwPhone((formData.get("phone") as string).trim());
  const token = (formData.get("token") as string).trim();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "phone_change" });
  if (error) return { error: "驗證碼不正確或已過期" };
  try {
    const { getAdmin, linkIdentity } = await import("@/lib/auth/linking");
    await linkIdentity(getAdmin(), "phone", phone, user.id);
  } catch {}
  redirect("/profile?bound=phone");
}

/* 永久刪除目前帳號與所有資料（profiles / 收藏 / 問答 / 綁定 等 FK cascade 一併清除） */
export async function deleteAccount(
  _prev: { error: string } | null,
  _formData: FormData,
): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { getAdmin } = await import("@/lib/auth/linking");
  const admin = getAdmin();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/?account_deleted=1");
}

export async function loginWithEmail(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/");
}

export async function registerWithEmail(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = (formData.get("display_name") as string).trim();
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) return { error: error.message };
  redirect("/?welcome=1");
}
