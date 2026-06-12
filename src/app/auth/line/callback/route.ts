import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAdmin, findCanonicalUserId, linkIdentity, makeSessionTokenHash, findUserIdByEmail, absorbDuplicate } from "@/lib/auth/linking";
import { verifyOAuthState } from "@/lib/auth/oauthState";

/* LINE Login callback：交換授權碼 → 取得 LINE 個資 → 對應 Supabase 帳號 → 建立 session */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const fail = (msg: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`);

  const oauthError = searchParams.get("error_description") || searchParams.get("error");
  if (oauthError) return fail(oauthError);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code) return fail("LINE 未回傳授權碼");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("line_oauth_state")?.value;
  // 同瀏覽器用 cookie 比對；手機跳 App 致 cookie 遺失時，改驗 state 的 HMAC 簽章
  if (!verifyOAuthState(state, savedState)) return fail("登入驗證失敗，請重新嘗試");

  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!channelId || !channelSecret || !supabaseUrl || !serviceKey) {
    return fail("LINE 登入尚未設定完成");
  }

  const redirectUri = `${origin}/auth/line/callback`;

  // 1) 交換 access token
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: channelId,
      client_secret: channelSecret,
    }),
  });
  if (!tokenRes.ok) return fail("LINE 驗證失敗（token 交換）");
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) return fail("LINE 驗證失敗（無 access token）");

  // 2) 取得 LINE 個人資料
  const profRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profRes.ok) return fail("無法取得 LINE 個人資料");
  const prof = (await profRes.json()) as { userId: string; displayName?: string; pictureUrl?: string };
  if (!prof.userId) return fail("LINE 個人資料不完整");

  // 3) 對應 Supabase 帳號
  const admin = getAdmin();
  const lineKey = prof.userId;
  const linkUid = cookieStore.get("link_uid")?.value;

  // === 綁定模式：把這個 LINE 接到目前登入的帳號（並吸收舊的重複帳號）===
  if (linkUid) {
    const lineEmail = `line_${lineKey}@line.users`.toLowerCase();
    const dupIds = new Set<string>();
    const standalone = await findUserIdByEmail(admin, lineEmail);
    if (standalone) dupIds.add(standalone);
    const owner = await findCanonicalUserId(admin, "line", lineKey);
    if (owner) dupIds.add(owner);
    for (const id of dupIds) if (id !== linkUid) await absorbDuplicate(admin, id, linkUid);
    await linkIdentity(admin, "line", lineKey, linkUid);
    cookieStore.delete("line_oauth_state");
    cookieStore.delete("link_uid");
    return NextResponse.redirect(`${origin}/profile?bound=line`);
  }

  // === 登入模式：先查綁定對照表，找到就登入主帳號 ===
  let userId = await findCanonicalUserId(admin, "line", lineKey);
  if (!userId) {
    // 首次：建立 LINE 帳號（合成 email）並綁定到自己
    const email = `line_${lineKey}@line.users`.toLowerCase();
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, email_confirm: true,
      user_metadata: { display_name: prof.displayName ?? "LINE 用戶", avatar_url: prof.pictureUrl ?? null, line_id: lineKey, provider: "line" },
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
    await linkIdentity(admin, "line", lineKey, userId);
  }

  // 4) 為主帳號產生 session
  const tokenHash = await makeSessionTokenHash(admin, userId);
  if (!tokenHash) return fail("建立登入連結失敗");

  const supabase = await createClient();
  const { error: verifyErr } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (verifyErr) return fail("登入失敗：" + verifyErr.message);

  cookieStore.delete("line_oauth_state");
  return NextResponse.redirect(`${origin}/welcome`);
}
