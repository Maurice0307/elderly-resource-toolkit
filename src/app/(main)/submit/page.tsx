import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubmitForm } from "@/components/submit/SubmitForm";

export const metadata = { title: "投稿資源" };

export default async function SubmitPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/submit");

  const [{ data: subRows }, { data: regionRows }] = await Promise.all([
    supabase
      .from("subcategories")
      .select("id, slug, name, categories!inner(slug)")
      .order("name"),
    supabase
      .from("regions")
      .select("id, name, parent_id")
      .order("name"),
  ]);

  const subcategories = (subRows ?? []).map((r: any) => ({
    id:            r.id as string,
    slug:          r.slug as string,
    name:          r.name as string,
    category_slug: (r.categories as { slug: string }).slug,
  }));

  const regions = (regionRows ?? []) as {
    id: string;
    name: string;
    parent_id: string | null;
  }[];

  return (
    <main className="min-h-screen px-5 py-10" style={{ background: "var(--bg-page)" }}>
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-lg font-medium" style={{ color: "var(--cta)" }}>
          ← 回首頁
        </Link>

        <header className="mt-5">
          <h1 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            投稿資源
          </h1>
          <p className="mt-2 text-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            知道一個對長輩很有幫助的服務？填寫以下資料，讓更多人看見它。
          </p>
        </header>

        <SubmitForm subcategories={subcategories} regions={regions} />
      </div>
    </main>
  );
}
