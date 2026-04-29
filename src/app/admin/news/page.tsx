import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { NewsAdminPanel } from "@/components/admin/NewsAdminPanel";

export const metadata = { title: "新聞管理" };

export default async function AdminNewsPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const { data } = await admin
    .from("daily_news")
    .select("id, title, source_org, source_url, tags, published_at, fetched_at, status")
    .order("fetched_at", { ascending: false })
    .limit(60);

  return (
    <div>
      <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
        📰 新聞管理
      </h1>
      <p className="mt-1 text-lg" style={{ color: "var(--text-muted)" }}>
        新增、上架、下架長輩友善新聞
      </p>

      <NewsAdminPanel news={data ?? []} />
    </div>
  );
}
