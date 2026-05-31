import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/requireRole";
import { createResourceAdmin } from "@/lib/admin/actions";
import { ResourceFormClient } from "@/components/admin/ResourceFormClient";
import Link from "next/link";

export default async function NewResourcePage() {
  await requireRole("moderator");
  const admin = createAdminClient();

  const [{ data: cats }, { data: subcats }, { data: allRegions }] = await Promise.all([
    admin.from("categories").select("id, name, slug").order("sort_order"),
    admin.from("subcategories").select("id, name, slug, category_id").order("sort_order"),
    admin.from("regions").select("id, name, code, level, parent_id")
      .in("level", ["county", "district"]).order("code"),
  ]);

  const categories = (cats ?? []).map((c) => ({
    ...c,
    subcategories: (subcats ?? []).filter((s) => s.category_id === c.id),
  }));
  const counties = (allRegions ?? []).filter((r) => r.level === "county");
  const districts = (allRegions ?? []).filter((r) => r.level === "district")
    .map((r) => ({ id: r.id, name: r.name, code: r.code, parent_id: r.parent_id ?? "" }));

  return (
    <div>
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
          新增資源
        </h1>
      </div>

      <div
        className="mt-6 rounded-2xl p-6"
        style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border)" }}
      >
        <ResourceFormClient
          categories={categories}
          counties={counties}
          districts={districts}
          action={createResourceAdmin}
          submitLabel="新增資源"
        />
      </div>
    </div>
  );
}
