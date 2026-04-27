import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/types/domain";

export type ResourceListItem = Pick<
  Resource,
  | "id"
  | "name"
  | "summary"
  | "phone"
  | "address"
  | "scope"
  | "tags"
  | "like_count"
> & {
  subcategory: { slug: string; name: string } | null;
  region: { code: string; name: string } | null;
};

export async function listResourcesByCategory(opts: {
  categorySlug: string;
  subcategorySlug?: string;
  scope?: "all" | "national" | "local";
}): Promise<ResourceListItem[]> {
  const supabase = await createClient();

  // 先用 categorySlug 撈出所有符合的 subcategory IDs
  const subQuery = supabase
    .from("subcategories")
    .select("id, slug, name, category:categories!inner(slug)")
    .eq("categories.slug", opts.categorySlug);

  if (opts.subcategorySlug) {
    subQuery.eq("slug", opts.subcategorySlug);
  }

  const { data: subs, error: subErr } = await subQuery;
  if (subErr) throw subErr;
  if (!subs || subs.length === 0) return [];

  const subIds = subs.map((s) => s.id);
  const subMap = Object.fromEntries(
    subs.map((s) => [s.id, { slug: s.slug, name: s.name }]),
  );

  // 用 subcategory IDs 查 resources
  let resQuery = supabase
    .from("resources")
    .select(
      "id, name, summary, phone, address, scope, tags, like_count, subcategory_id, region:regions(code, name)",
    )
    .eq("status", "active")
    .in("subcategory_id", subIds)
    .order("scope", { ascending: false })
    .order("like_count", { ascending: false });

  if (opts.scope && opts.scope !== "all") {
    resQuery = resQuery.eq("scope", opts.scope);
  }

  const { data, error } = await resQuery;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const reg = Array.isArray(row.region) ? row.region[0] : row.region;
    return {
      id: row.id,
      name: row.name,
      summary: row.summary,
      phone: row.phone,
      address: row.address,
      scope: row.scope,
      tags: row.tags,
      like_count: row.like_count,
      subcategory: subMap[row.subcategory_id] ?? null,
      region: reg ? { code: reg.code, name: reg.name } : null,
    };
  });
}

export async function getResourceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select(
      `*, subcategory:subcategories(slug, name, category:categories(slug, name)),
       region:regions(code, name)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
