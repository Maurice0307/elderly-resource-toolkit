import { createClient } from "@supabase/supabase-js";

/**
 * 僅限後端 / Server Actions / Route Handlers 使用。
 * 絕對不可在 client component 引入，否則 service role key 會外洩。
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
