import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { NewsAdminPanel } from "@/components/admin/NewsAdminPanel";
import { AdPageHead } from "@/components/admin/adminUi";

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
      <AdPageHead title="新聞管理" desc="新增、上架、下架長輩友善新聞" />
      <NewsAdminPanel news={data ?? []} />
    </div>
  );
}
