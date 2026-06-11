import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAdmin, findCanonicalUserId, linkIdentity, makeSessionTokenHash, findUserIdByEmail, absorbDuplicate } from "@/lib/auth/linking";

/* Google callback：交換授權碼 → 取得 Google 個資 → 對應 Supabase 帳號 → 建立 session */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const fail = (msg: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`);

  const oauthError = searchParams.get("error_description") || searchParams.get("error");
  if (oauthError) return fail(oauthError);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code) return fail("Google 未回傳授權碼");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  if (!state || !savedState || state !== savedState) return fail("登入驗證失敗，請重新嘗試");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clientId || !clientSecret || !supabaseUrl || !serviceKey) {
    return fail("Google 登入尚未設定完成");
  }

  const redirectUri = `${origin}/auth/google/callback`;

  // 1) 交換 access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!tokenRes.ok) return fail("Google 驗證失敗（token 交換）");
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) return fail("Google 驗證失敗（無 access token）");

  // 2) 取得 Google 個人資料
  const profRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profRes.ok) return fail("無法取得 Google 個人資料");
  const prof = (await profRes.json()) as {
    sub: string; email?: string; email_verified?: boolean; name?: string; picture?: string;
  };
  if (!prof.email) return fail("Google 帳號未提供 Email");

  // 3) 對應 Supabase 帳號（Google 提供已驗證 Email）
  const email = prof.email.toLowerCase();
  const admin = getAdmin();
  const linkUid = cookieStore.get("link_uid")?.value;

  // === 綁定模式：把這個 Google 接到目前登入的帳號（並吸收舊的重複帳號）===
  if (linkUid) {
    const dupIds = new Set<string>();
    const standalone = await findUserIdByEmail(admin, email);
    if (standalone) dupIds.add(standalone);
    const owner = await findCanonicalUserId(admin, "google", email);
    if (owner) dupIds.add(owner);
    for (const id of dupIds) if (id !== linkUid) await absorbDuplicate(admin, id, linkUid);
    await linkIdentity(admin, "google", email, linkUid);
    cookieStore.delete("google_oauth_state");
    cookieStore.delete("link_uid");
    return NextResponse.redirect(`${origin}/profile?bound=google`);
  }

  // === 登入模式：先查綁定對照表 ===
  let userId = await findCanonicalUserId(admin, "google", email);
  if (!userId) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, email_confirm: true,
      user_metadata: { display_name: prof.name ?? email.split("@")[0], avatar_url: prof.picture ?? null, provider: "google" },
    });
    if (createErr && !/registered|exists/i.test(createErr.message)) {
      return fail("建立帳號失敗：" + createErr.message);
    }
    if (created?.user) {
      userId = created.user.id;
    } else {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      userId = (list?.users || []).find((u) => u.email === email)?.id ?? null;
    }
    if (!userId) return fail("建立帳號失敗");
    await linkIdentity(admin, "google", email, userId);
  }

  // 4) 為主帳號產生 session
  const tokenHash = await makeSessionTokenHash(admin, userId);
  if (!tokenHash) return fail("建立登入連結失敗");

  const supabase = await createClient();
  const { error: verifyErr } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (verifyErr) return fail("登入失敗：" + verifyErr.message);

  cookieStore.delete("google_oauth_state");
  return NextResponse.redirect(`${origin}/welcome`);
}
