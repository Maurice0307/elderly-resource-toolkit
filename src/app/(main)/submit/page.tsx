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
    <main style={{ background: "var(--bg-page)", minHeight: "100%", paddingBottom: 24 }}>
      {/* 返回列 */}
      <div style={{ background: "#fff", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
        <Link
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.9375rem", fontWeight: 600, color: "var(--cta-ink)", textDecoration: "none" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          回首頁
        </Link>
      </div>

      {/* 標頭 */}
      <div style={{ background: "#fff", padding: "14px 18px 16px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ margin: 0, fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)" }}>投稿資源</h1>
        <p style={{ margin: "6px 0 0", fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
          知道一個對長輩很有幫助的服務？填寫以下資料，讓更多人看見它。
        </p>
      </div>

      <div style={{ padding: "16px 18px" }}>
        <SubmitForm subcategories={subcategories} regions={regions} />
      </div>
    </main>
  );
}
