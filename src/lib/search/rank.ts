// ───────────────────────────────────────────────────────────────────────────
// 搜尋結果相關度排序（LINE bot + 網頁/手機共用）
//
// 原本只看「地區層級 + 收藏數」，命中很多詞或剛好對到細標籤的資源，跟只擦到
// 一個字的資源排在一起。這裡改成「計分」：
//   細標籤精準命中 > 名稱命中 > 標籤命中 > 摘要命中，命中越多分越高。
// 再依分數分桶；同桶內才套用「全國 → 縣市 → 行政區」與收藏數，兼顧精準與在地。
// ───────────────────────────────────────────────────────────────────────────

import { nz } from "@/lib/region/locationParse";

export type RankRow = {
  name?: string | null;
  summary?: string | null;
  tags?: string[] | null;
  subcategory_id?: string | null;
  extra_subcats?: string[] | null;
  scope?: string | null;
  region_id?: string | null;
  bookmark_count?: number | null;
  like_count?: number | null;
};

export type RankCtx = {
  subIds: Iterable<string>;     // 命中的細標籤 id（口語對照 + 斷詞比對）
  terms: string[];             // 強關鍵字（真實詞 + 口語同義詞，不含 bigram 雜訊）
  countyIds: string[];
  districtId: string | null;
};

const clean = (s: string | null | undefined) => nz(s ?? "").toLowerCase();

export function rankResources<T extends RankRow>(rows: T[], ctx: RankCtx): T[] {
  const subSet = new Set(ctx.subIds);
  const countySet = new Set(ctx.countyIds);
  const terms = [...new Set(ctx.terms.map((t) => clean(t)).filter((t) => t.length >= 2))];

  const scored = rows.map((r, i) => ({ r, i, ...scoreRow(r, subSet, countySet, ctx.districtId, terms) }));
  scored.sort((a, b) =>
    b.bucket - a.bucket ||        // 相關度分桶：越相關越前
    a.regionRank - b.regionRank ||// 同桶內：全國 → 縣市 → 區
    b.score - a.score ||          // 細分數
    b.pop - a.pop ||              // 收藏 + 讚
    a.i - b.i                     // 穩定
  );
  return scored.map((s) => s.r);
}

function scoreRow(
  r: RankRow,
  subSet: Set<string>,
  countySet: Set<string>,
  districtId: string | null,
  terms: string[]
): { score: number; bucket: number; regionRank: number; pop: number } {
  let s = 0;
  // 細標籤精準命中（最強訊號）
  if (r.subcategory_id && subSet.has(r.subcategory_id)) s += 120;
  else if (Array.isArray(r.extra_subcats) && r.extra_subcats.some((x) => subSet.has(x))) s += 90;

  const name = clean(r.name);
  const summary = clean(r.summary);
  const tags = (r.tags ?? []).map((t) => clean(t));
  let nameHits = 0, sumHits = 0, tagHits = 0;
  for (const t of terms) {
    if (name.includes(t)) nameHits++;
    if (summary.includes(t)) sumHits++;
    if (tags.some((tg) => tg.includes(t) || t.includes(tg))) tagHits++;
  }
  s += Math.min(nameHits, 3) * 40 + Math.min(tagHits, 2) * 25 + Math.min(sumHits, 3) * 12;

  const bucket = s >= 120 ? 4 : s >= 40 ? 3 : s >= 24 ? 2 : s > 0 ? 1 : 0;
  const regionRank =
    r.scope === "national" ? 0
    : districtId && r.region_id === districtId ? 2
    : r.region_id && countySet.has(r.region_id) ? 1
    : 3;
  const pop = (r.bookmark_count ?? 0) + (r.like_count ?? 0);
  return { score: s, bucket, regionRank, pop };
}
