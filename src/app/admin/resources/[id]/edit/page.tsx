import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { updateResourceAdmin } from "@/lib/admin/actions";
import { ResourceFormClient } from "@/components/admin/ResourceFormClient";
import { DeleteResourceButton } from "@/components/admin/DeleteResourceButton";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("moderator");
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: resource }, { data: cats }, { data: subcats }, { data: allRegions }] =
    await Promise.all([
      admin
        .from("resources")
        .select(
          "id, name, summary, description, phone, phone_hint, address, website_url, scope, status, subcategory_id, region_id, identity_tags, tags, source_org"
        )
        .eq("id", id)
        .single(),
      admin.from("categories").select("id, name, slug").order("sort_order"),
      admin.from("subcategories").select("id, name, slug, category_id").order("sort_order"),
      admin.from("regions").select("id, name, code, level, parent_id")
        .in("level", ["county", "district"]).order("code"),
    ]);

  if (!resource) notFound();

  const categories = (cats ?? []).map((c) => ({
    ...c,
    subcategories: (subcats ?? []).filter((s) => s.category_id === c.id),
  }));
  const counties = (allRegions ?? []).filter((r) => r.level === "county");
  const districts = (allRegions ?? []).filter((r) => r.level === "district")
    .map((r) => ({ id: r.id, name: r.name, code: r.code, parent_id: r.parent_id ?? "" }));

  const boundAction = updateResourceAdmin.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/resources"
            className="text-base font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            ← 資源管理
          </Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            編輯資源
          </h1>
        </div>
        <DeleteResourceButton resourceId={id} resourceName={resource.name} />
      </div>

      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        ID：{id}
      </p>

      <div
        className="mt-6 rounded-2xl p-6"
        style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border)" }}
      >
        <ResourceFormClient
          categories={categories}
          counties={counties}
          districts={districts}
          initialValues={resource}
          action={boundAction}
          submitLabel="儲存變更"
        />
      </div>
    </div>
  );
}
