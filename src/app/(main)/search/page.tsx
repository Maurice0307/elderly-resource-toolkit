import { SearchClient, type SearchItem, type RegionHint } from "./SearchClient";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { categories } from "@/config/categories";
import { getUserRegionCode } from "@/lib/location/cookies";
import { getRegionByCode } from "@/lib/location/regions";
import { keywordIntent } from "@/lib/search/keywordIntent";
import { parseLocation, regionConflict, expandRegionIds, type RegionRow } from "@/lib/region/locationParse";
import { expandKeyword } from "@/lib/search/keywordExpand";
import { rankResources } from "@/lib/search/rank";
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

type OrderCtx = { ids: string[]; countyIds: string[]; districtId: string | null };

async function searchResources(q: string, keywords: string[], ctx: OrderCtx): Promise<SearchRow[]> {
  if (!q.trim() && keywords.length === 0) return [];
  const supabase = await createClient();
  const admin = createAdminClient();
  const terms = Array.from(new Set([q, ...keywords].filter((s) => s && s.trim())));

  // 口語 → 細標籤對照（精準）＋命中的口語詞補強名稱/摘要比對
  const exp = expandKeyword([q, ...keywords].join(" "));
  const ilikeTerms = Array.from(new Set([...terms, ...exp.terms]));
  const subIds = new Set<string>();
  if (exp.subcatNames.length) {
    const { data } = await admin.from("subcategories").select("id").in("name", exp.subcatNames);
    for (const s of data ?? []) subIds.add(s.id);
  }
  for (const t of terms) {
    const { data } = await admin.from("subcategories").select("id").ilike("name", `%${t}%`);
    for (const s of data ?? []) subIds.add(s.id);
  }

  const orParts: string[] = [];
  if (subIds.size) {
    orParts.push(`subcategory_id.in.(${[...subIds].join(",")})`);
    orParts.push(`extra_subcats.ov.{${[...subIds].join(",")}}`);
  }
  for (const t of ilikeTerms) {
    orParts.push(`name.ilike.%${t}%`, `summary.ilike.%${t}%`, `description.ilike.%${t}%`, `tags.cs.{${t}}`);
  }
  const { data } = await supabase
    .from("resources")
    .select("*, subcategory:subcategories(slug, name, categories(slug)), region:regions(name, code)")
    .eq("status", "active")
    .or(orParts.join(","))
    .limit(100);
  const rows = (data ?? []) as SearchRow[];
  // 相關度排序（細標籤 > 名稱 > 標籤 > 摘要；同分再 全國→縣市→區 + 收藏數）
  return rankResources(rows, {
    subIds,
    terms: ilikeTerms,
    countyIds: ctx.countyIds,
    districtId: ctx.districtId,
  }) as SearchRow[];
}

// 由地區 id 推出排序情境（自己 + 子區 + 父縣市）
function ctxOf(regions: RegionRow[], id: string | null): OrderCtx {
  if (!id) return { ids: [], countyIds: [], districtId: null };
  const self = regions.find((r) => r.id === id);
  if (!self) return { ids: [], countyIds: [], districtId: null };
  const ids = expandRegionIds(regions, id);
  if (self.level === "county") return { ids, countyIds: [id], districtId: null };
  return { ids, countyIds: self.parent_id ? [self.parent_id] : [], districtId: id };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; mode?: string }>;
}) {
  const { q = "" } = await searchParams;

  const code = await getUserRegionCode();
  const region = code ? await getRegionByCode(code) : null;
  const currentRegionId = region?.id ?? null;

  // 地區解析（與 LINE 共用同一套核心）
  const admin = createAdminClient();
  const { data: regData } = await admin.from("regions").select("id, name, level, parent_id, code");
  const regions = (regData ?? []) as RegionRow[];
  const parsed = q.trim() ? parseLocation(q, regions) : null;
  const conf: ReturnType<typeof regionConflict> = parsed ? regionConflict(parsed, currentRegionId, regions) : { needPrompt: false };

  // 決定「在地判斷 + 排序」要用的地區，以及是否要提示切換
  let active: OrderCtx = ctxOf(regions, currentRegionId);
  let activeLabel: string | null = region?.name ?? null;
  let hint: RegionHint = null;
  if (parsed && parsed.region.type === "resolved" && !conf.needPrompt) {
    // 偵測到地區且不衝突（與目前一致或未設定）→ 直接以該地區排序
    const r = parsed.region;
    active = { ids: r.ids, countyIds: r.isGroup ? r.ids : (r.countyId ? [r.countyId] : []), districtId: r.districtId };
    activeLabel = r.label;
  } else if (parsed && parsed.region.type === "choice" && conf.autoChoice) {
    const c = conf.autoChoice;
    active = { ids: c.ids, countyIds: c.countyId ? [c.countyId] : [], districtId: c.districtId };
    activeLabel = c.label;
  } else if (parsed && conf.needPrompt) {
    hint = buildHint(parsed, regions);
  } else if (parsed && parsed.region.type === "none" && parsed.unknownPlace) {
    // 提到不認得的在地地名 → 用所在地區推薦並說明
    hint = { kind: "unknown", label: parsed.unknownPlace };
  }
  const regionIds = active.ids;

  const intent = q.trim() ? await getIntent(q) : null;
  const keywordsForSearch = intent?.keywords ?? [];
  const allResults = await searchResources(q, keywordsForSearch, active);

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
    <SearchClient query={q} items={items} regionLabel={activeLabel} cats={cats} hint={hint} />
  );
}

// 把解析結果轉成前端要顯示的提示（切換 / 消歧 / 群組 / 偏鄉）
function buildHint(parsed: ReturnType<typeof parseLocation>, regions: RegionRow[]): RegionHint {
  const codeOf = (id: string | null) => (id ? regions.find((r) => r.id === id)?.code ?? null : null);
  if (parsed.region.type === "resolved") {
    if (parsed.region.isGroup) return { kind: "group", label: parsed.region.label };
    const code = codeOf(parsed.region.districtId ?? parsed.region.countyId);
    return code ? { kind: "switch", label: parsed.region.label, code } : null;
  }
  if (parsed.region.type === "choice") {
    if (parsed.region.reason === "rural") return { kind: "rural", label: "偏鄉" };
    const options = parsed.region.candidates
      .map((c) => ({ label: c.label, code: codeOf(c.districtId ?? c.countyId) }))
      .filter((o): o is { label: string; code: string } => !!o.code);
    return options.length ? { kind: "choose", label: parsed.region.label, options } : null;
  }
  return null;
}
