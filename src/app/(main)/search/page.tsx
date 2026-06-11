import { SearchClient, type SearchItem } from "./SearchClient";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/config/categories";
import { getUserRegionCode } from "@/lib/location/cookies";
import { getRegionByCode, getRegionAncestors } from "@/lib/location/regions";
import { keywordIntent } from "@/lib/search/keywordIntent";
import type { Resource } from "@/types/domain";

export const metadata = { title: "搜尋資源" };

type SearchRow = Resource & {
  subcategory: { slug: string; name: string; categories: { slug: string } } | null;
  region?: { name: string; code: string } | null;
};

type IntentData = {
  source: "llm" | "keyword";
  categories: string[];
  subcategories: string[];
  keywords: string[];
  reasoning: string;
};

async function getIntent(query: string): Promise<IntentData> {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "localhost:3000";
    const res = await fetch(`${proto}://${host}/api/search/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });
    if (!res.ok) return { source: "keyword", ...keywordIntent(query) };
    return await res.json();
  } catch {
    return { source: "keyword", ...keywordIntent(query) };
  }
}

function getCatSlug(row: SearchRow): string {
  const sub = Array.isArray(row.subcategory) ? row.subcategory[0] : row.subcategory;
  return (sub?.categories as { slug: string } | undefined)?.slug ?? "";
}

async function searchResources(q: string, keywords: string[], regionIds: string[]): Promise<SearchRow[]> {
  if (!q.trim() && keywords.length === 0) return [];
  const supabase = await createClient();
  const terms = Array.from(new Set([q, ...keywords].filter((s) => s && s.trim())));
  const orFilter = terms
    .flatMap((t) => [`name.ilike.%${t}%`, `summary.ilike.%${t}%`, `description.ilike.%${t}%`, `tags.cs.{${t}}`])
    .join(",");
  const { data } = await supabase
    .from("resources")
    .select("*, subcategory:subcategories(slug, name, categories(slug)), region:regions(name, code)")
    .eq("status", "active")
    .or(orFilter)
    .limit(100);
  const rows = (data ?? []) as SearchRow[];
  const inRegion = (r: SearchRow) => r.region_id != null && regionIds.includes(r.region_id);
  return rows.sort((a, b) => {
    const aLocal = inRegion(a) ? 2 : a.scope === "national" ? 1 : 0;
    const bLocal = inRegion(b) ? 2 : b.scope === "national" ? 1 : 0;
    if (aLocal !== bLocal) return bLocal - aLocal;
    return (b.like_count ?? 0) - (a.like_count ?? 0);
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; mode?: string }>;
}) {
  const { q = "" } = await searchParams;

  const code = await getUserRegionCode();
  const region = code ? await getRegionByCode(code) : null;
  const ancestors = region ? await getRegionAncestors(region.id) : [];
  const regionIds = ancestors.map((r) => r.id);

  const intent = q.trim() ? await getIntent(q) : null;
  const keywordsForSearch = intent?.keywords ?? [];
  const allResults = await searchResources(q, keywordsForSearch, regionIds);

  // 各分類筆數（供「醫療健康/休閒活動」篩選膠囊使用）
  const catCounts = new Map<string, number>();
  for (const r of allResults) {
    const slug = getCatSlug(r);
    if (slug) catCounts.set(slug, (catCounts.get(slug) ?? 0) + 1);
  }
  const cats = categories
    .filter((c) => catCounts.has(c.slug))
    .map((c) => ({ slug: c.slug, name: c.name, count: catCounts.get(c.slug) ?? 0 }));

  const items: SearchItem[] = allResults.map((r) => ({
    id: r.id,
    name: r.name,
    summary: r.summary,
    phone: r.phone,
    address: r.address,
    scope: r.scope,
    tags: (r.tags as string[] | null) ?? null,
    regionName: r.region?.name ?? null,
    isLocal: r.region_id != null && regionIds.includes(r.region_id),
    catSlug: getCatSlug(r),
  }));

  return (
    <SearchClient query={q} items={items} regionLabel={region?.name ?? null} cats={cats} />
  );
}
