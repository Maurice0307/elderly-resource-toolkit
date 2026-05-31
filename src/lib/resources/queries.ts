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
  region: { code: string; name: string; level: string; parentName?: string } | null;
};

export async function listResourcesByCategory(opts: {
  categorySlug: string;
  subcategorySlug?: string;
  regionIds?: string[];   // [districtId?, countyId?] — already resolved by caller
}): Promise<ResourceListItem[]> {
  const supabase = await createClient();

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

  const subIds = subs.map((s: { id: string; slug: string; name: string }) => s.id);
  const subMap = Object.fromEntries(
    subs.map((s: { id: string; slug: string; name: string }) => [s.id, { slug: s.slug, name: s.name }]),
  );

  const hasRegion = opts.regionIds && opts.regionIds.length > 0;

  let resQuery = supabase
    .from("resources")
    .select(
      "id, name, summary, phone, address, scope, tags, like_count, subcategory_id, region:regions(code, name, level, parent_id)",
    )
    .eq("status", "active")
    .in("subcategory_id", subIds);

  if (hasRegion) {
    resQuery = resQuery.or(
      `scope.eq.national,and(scope.eq.local,region_id.in.(${opts.regionIds!.join(",")}))`,
    );
  }

  const { data, error } = await resQuery;
  if (error) throw error;

  // Collect parent region IDs for district entries (to resolve county names)
  const parentIds = new Set<string>();
  for (const row of data ?? []) {
    const reg = Array.isArray(row.region) ? row.region[0] : row.region;
    if (reg?.level === "district" && reg?.parent_id) parentIds.add(reg.parent_id);
  }

  const parentNameMap: Record<string, string> = {};
  if (parentIds.size > 0) {
    const { data: parents } = await supabase
      .from("regions")
      .select("id, name")
      .in("id", [...parentIds]);
    for (const p of parents ?? []) parentNameMap[p.id] = p.name;
  }

  type RegionRow = { code: string; name: string; level: string; parent_id: string | null } | null;
  const items: ResourceListItem[] = (data ?? []).map((row: {
    id: string; name: string; summary: string | null; phone: string | null;
    address: string | null; scope: string; tags: string[] | null; like_count: number;
    subcategory_id: string; region: RegionRow | RegionRow[];
  }) => {
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
      region: reg
        ? {
            code: reg.code,
            name: reg.name,
            level: reg.level,
            parentName: reg.parent_id ? parentNameMap[reg.parent_id] : undefined,
          }
        : null,
    };
  });

  // Sort by relevance: district match > county match > national
  if (hasRegion) {
    items.sort((a, b) => score(b) - score(a));
  } else {
    // No region context: national first, then local sorted by like_count
    items.sort((a, b) => {
      if (a.scope === b.scope) return b.like_count - a.like_count;
      return a.scope === "national" ? -1 : 1;
    });
  }

  return items;
}

function score(item: ResourceListItem): number {
  if (item.scope === "national") return 1;
  // For local resources, check if region matches any of the user's region IDs
  // We use a proxy: the region code is embedded in regionIdSet — but here we work
  // with region objects. The region.level tells us district vs county.
  if (item.region?.level === "district") return 3;
  if (item.region?.level === "county") return 2;
  return 1;
}

export async function getResourceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select(
      `*, subcategory:subcategories(slug, name, category:categories(slug, name)),
       region:regions(code, name, level, parent_id)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
