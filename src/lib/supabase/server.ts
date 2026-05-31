import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import dns from "node:dns";

function makeMockClient() {
  const chainable = () => {
    const obj: any = {};
    obj.select = (..._args: any[]) => obj;
    obj.eq = (..._args: any[]) => obj;
    obj.order = (..._args: any[]) => obj;
    obj.limit = (..._args: any[]) => obj;
    obj.maybeSingle = () => obj;
    obj.insert = async () => ({ data: null, error: null });
    obj.update = async () => ({ data: null, error: null });
    obj.delete = async () => ({ data: null, error: null });
    // make it awaitable: support .then
    obj.then = async (resolve: any) => resolve({ data: [], error: null });
    obj.catch = async (_: any) => ({ data: [], error: null });
    return obj;
  };

  return {
    from: (_: string) => chainable(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOAuth: async () => ({ data: null, error: new Error("No auth in offline mode") }),
      signInWithPassword: async () => ({ data: null, error: new Error("No auth in offline mode") }),
      signOut: async () => ({ error: null }),
    },
    rpc: async () => ({ data: null, error: null }),
  } as any;
}

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL not set — using mock client");
    return makeMockClient();
  }

  try {
    const hostname = new URL(supabaseUrl).hostname;
    await dns.promises.lookup(hostname);
  } catch (e) {
    console.warn("[supabase] DNS lookup failed — using mock client", e);
    return makeMockClient();
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // RSC 中無法寫 cookie；middleware 會處理 session 更新
          }
        },
      },
    },
  );
}
