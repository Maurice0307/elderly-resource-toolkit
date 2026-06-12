import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { makeOAuthState } from "@/lib/auth/oauthState";

/* LINE Login（自訂 OAuth2 流程，免 Supabase 內建 / 免付費方案）— 啟動授權 */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;

  if (!channelId) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("LINE 登入尚未設定，請先填入 LINE_LOGIN_CHANNEL_ID")}`,
    );
  }

  // 綁定模式：已登入時點「綁定 LINE」→ 記住目前帳號，callback 時接到此帳號
  const linkMode = searchParams.get("link") === "1";
  let linkUid = "";
  if (linkMode) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(`${origin}/login`);
    linkUid = user.id;
  }

  const state = makeOAuthState();
  const redirectUri = `${origin}/auth/line/callback`;

  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", channelId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "profile openid");

  const res = NextResponse.redirect(url.toString());
  // 防 CSRF：把 state 暫存到 httpOnly cookie，callback 時比對
  res.cookies.set("line_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  if (linkUid) {
    res.cookies.set("link_uid", linkUid, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/",
    });
  }
  return res;
}
