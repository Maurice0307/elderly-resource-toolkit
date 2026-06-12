import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { makeOAuthState } from "@/lib/auth/oauthState";

/* Google 登入（自訂 OAuth2 流程，免 Supabase 後台 / 免付費）— 啟動授權 */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Google 登入尚未設定，請先填入 GOOGLE_CLIENT_ID")}`,
    );
  }

  // 綁定模式：已登入時點「綁定 Google」→ 記住目前帳號
  const linkMode = searchParams.get("link") === "1";
  let linkUid = "";
  if (linkMode) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(`${origin}/login`);
    linkUid = user.id;
  }

  const state = makeOAuthState();
  const redirectUri = `${origin}/auth/google/callback`;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("google_oauth_state", state, {
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
