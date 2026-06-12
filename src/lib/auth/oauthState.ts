import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/* OAuth state：HMAC 簽章式。
   主要防 CSRF 仍靠瀏覽器 cookie（同瀏覽器最嚴格）；
   但手機上 LINE/Google 常會跳去原生 App 驗證再彈回「另一個瀏覽器分頁」，
   導致原本種下的 state cookie 不見 → 驗證失敗。
   因此 callback 在「cookie 遺失」時，改用 HMAC 簽章 + 時效來驗證 state 合法性，
   兼顧手機可用性與安全（攻擊者無密鑰無法偽造 state）。 */

const SECRET =
  process.env.OAUTH_STATE_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "dev-only-insecure-secret";

const MAX_AGE_MS = 10 * 60 * 1000; // 10 分鐘

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length || ba.length === 0) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** 產生帶簽章的 state：`{nonce}.{ts36}.{sig}` */
export function makeOAuthState(): string {
  const nonce = randomBytes(16).toString("hex");
  const ts = Date.now().toString(36);
  const payload = `${nonce}.${ts}`;
  return `${payload}.${sign(payload)}`;
}

/** 驗證 state：① cookie 一致（最嚴格）或 ② 簽章有效且未過期（手機 cookie 遺失時的退路） */
export function verifyOAuthState(
  stateFromUrl: string | null | undefined,
  stateFromCookie: string | null | undefined,
): boolean {
  if (!stateFromUrl) return false;
  // ① 同瀏覽器：cookie 完全一致
  if (stateFromCookie && stateFromUrl === stateFromCookie) return true;
  // ② 退路：驗 HMAC 簽章 + 時效
  const parts = stateFromUrl.split(".");
  if (parts.length !== 3) return false;
  const [nonce, ts36, sig] = parts;
  if (!nonce || !ts36 || !sig) return false;
  if (!safeEqualHex(sig, sign(`${nonce}.${ts36}`))) return false;
  const ts = parseInt(ts36, 36);
  if (!Number.isFinite(ts) || Date.now() - ts > MAX_AGE_MS || ts > Date.now() + 60_000) return false;
  return true;
}
