import { createBrowserClient } from "@supabase/ssr";

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
    obj.then = async (resolve: any) => resolve({ data: [], error: null });
    obj.catch = async (_: any) => ({ data: [], error: null });
    return obj;
  };

  return {
    from: (_: string) => chainable(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    rpc: async () => ({ data: null, error: null }),
  } as any;
}

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL not set — using mock client (browser)");
    return makeMockClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
