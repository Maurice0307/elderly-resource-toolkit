// ───────────────────────────────────────────────────────────────────────────
// 共用地區解析核心（LINE bot + 網頁/手機搜尋共用）
//
// 把使用者輸入的一句話拆成「地區 + 關鍵字」，並判斷：
//   1. 單一地區（縣市 / 縣市+區 / 區）
//   2. 區域群組（花東、南部、離島、六都、雙北…）→ 多縣市
//   3. 同名地區需消歧（大安、信義、中正…）→ 候選清單讓使用者選
//   4. 偏鄉 → 需先問是哪個縣市
// 一切前提：只有「偵測到地區，且與目前已選地區衝突」時才需要跳訊息確認。
// 同地區（與目前一致）→ 不跳，直接搜。
// ───────────────────────────────────────────────────────────────────────────

export type RegionRow = {
  id: string;
  name: string;
  level: string; // 'national' | 'county' | 'district'
  parent_id: string | null;
  code?: string | null;
};

// 臺→台、去空白；DB 縣市名一律用「台」
export const nz = (s: string) => (s ?? "").replace(/臺/g, "台").replace(/\s+/g, "");
const stripCountySuffix = (s: string) => s.replace(/[市縣]$/, "");
const stripDistrictSuffix = (s: string) => s.replace(/[區鄉鎮市]$/, "");

// 區域群組：label → 縣市名清單（用 DB 的「台」字形）。先長後短比對。
export const REGION_GROUPS: { label: string; counties: string[] }[] = [
  { label: "北北基桃", counties: ["台北市", "新北市", "基隆市", "桃園市"] },
  { label: "北北基", counties: ["台北市", "新北市", "基隆市"] },
  { label: "桃竹苗", counties: ["桃園市", "新竹市", "新竹縣", "苗栗縣"] },
  { label: "中彰投", counties: ["台中市", "彰化縣", "南投縣"] },
  { label: "雲嘉南", counties: ["雲林縣", "嘉義縣", "嘉義市", "台南市"] },
  { label: "宜花東", counties: ["宜蘭縣", "花蓮縣", "台東縣"] },
  { label: "雙北", counties: ["台北市", "新北市"] },
  { label: "大台北", counties: ["台北市", "新北市"] },
  { label: "花東", counties: ["花蓮縣", "台東縣"] },
  { label: "六都", counties: ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市"] },
  { label: "北部", counties: ["基隆市", "台北市", "新北市", "桃園市", "新竹市", "新竹縣", "宜蘭縣"] },
  { label: "中部", counties: ["苗栗縣", "台中市", "彰化縣", "南投縣", "雲林縣"] },
  { label: "南部", counties: ["嘉義市", "嘉義縣", "台南市", "高雄市", "屏東縣", "澎湖縣"] },
  { label: "東部", counties: ["花蓮縣", "台東縣"] },
  { label: "離島", counties: ["澎湖縣", "金門縣", "連江縣"] },
  { label: "外島", counties: ["澎湖縣", "金門縣", "連江縣"] },
];

// 偏鄉 / 山地 → 需先問縣市
const PIANXIANG_RE = /(偏鄉|偏遠地區|偏遠鄉鎮|山地鄉)/;

// 非正式的在地地名（社區、新村、國宅、部落…）：不在 regions 表內，視為「不確定地區」
// 例：民生社區、果貿社區、忠孝新城、大鵬新村、xx國宅
// 用「2 字專名 + 後綴」比對，並排除服務性詞彙（避免誤刪「社區據點/社區共餐/原住民社區」等關鍵字）
const LOCAL_PLACE_RE = /([一-鿿]{2})(社區|新村|新城|國宅|部落|聚落|眷村)(?!據點|共餐|關懷|活動|大學|照顧|服務|營造|發展|參與|長照|健康)/g;
const PLACE_BLOCK_PREFIX = new Set(["原住", "住民", "文化", "健康", "照顧", "關懷", "社會", "老人", "長青", "銀髮", "身心", "志工", "失智"]);

function findLocalPlace(work: string): string {
  LOCAL_PLACE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LOCAL_PLACE_RE.exec(work))) {
    if (!PLACE_BLOCK_PREFIX.has(m[1])) return m[0];
  }
  return "";
}
function stripLocalPlace(s: string): string {
  return s.replace(LOCAL_PLACE_RE, (full, p1) => (PLACE_BLOCK_PREFIX.has(p1) ? full : " "));
}

// 常見贅詞（拿掉後讓關鍵字更乾淨；都是虛詞，極少出現在資源名稱裡）
const FILLER_RE =
  /(我想要找|我要找|我想找|想要找|我想問|請問一下|麻煩幫我|可以幫我|幫我找|我住在|我住|住在|我要|我想|想要|想找|要找|請問|有沒有|有無|附近|這邊|這裡|那邊|哪裡|哪裏|麻煩|幫我|一下|的|嗎|呢|喔|啊|有|找|想|嘛)/g;

export type RegionChoice = { ids: string[]; countyId: string | null; districtId: string | null; label: string };

export type ParsedLocation = {
  keyword: string;          // 去掉地區與贅詞後的查詢字
  rawKeyword: string;       // 只去地區、保留原語句的關鍵字（給顯示用）
  unknownPlace?: string;    // 偵測到非正式在地地名（如「民生社區」）但無法定位時，帶回該地名
  region:
    | { type: "none" }
    | { type: "resolved"; ids: string[]; countyId: string | null; districtId: string | null; label: string; isGroup: boolean }
    | { type: "choice"; reason: "ambiguous" | "rural"; label: string; candidates: RegionChoice[] };
};

type Indexed = {
  counties: RegionRow[];
  districts: RegionRow[];
  byId: Map<string, RegionRow>;
};

function indexRegions(regions: RegionRow[]): Indexed {
  const counties: RegionRow[] = [];
  const districts: RegionRow[] = [];
  const byId = new Map<string, RegionRow>();
  for (const r of regions) {
    byId.set(r.id, r);
    if (r.level === "county") counties.push(r);
    else if (r.level === "district") districts.push(r);
  }
  return { counties, districts, byId };
}

// 把某個地區展開成「篩選用 id 集合」：自己 + 子行政區 + 父縣市
export function expandRegionIds(regions: RegionRow[], id: string): string[] {
  const ids = new Set<string>([id]);
  const self = regions.find((r) => r.id === id);
  if (!self) return [...ids];
  for (const c of regions) if (c.parent_id === id) ids.add(c.id);
  if (self.parent_id) ids.add(self.parent_id);
  return [...ids];
}

// 主解析
export function parseLocation(text: string, regions: RegionRow[]): ParsedLocation {
  const { counties, districts } = indexRegions(regions);
  const work = nz(text);              // 台字形、去空白後的整句
  const placeName = findLocalPlace(work);
  const none = (): ParsedLocation => ({ keyword: extractKeyword(text, []), rawKeyword: text.trim(), unknownPlace: placeName || undefined, region: { type: "none" } });

  // ── 1. 縣市偵測（全名優先；同 base 的市/縣並存→記為候選） ──
  const countyFull = counties.filter((c) => work.includes(nz(c.name)));
  const countyBaseHits = counties.filter((c) => {
    const b = stripCountySuffix(nz(c.name));
    return b.length >= 2 && work.includes(b);
  });
  let countySel: RegionRow | null = countyFull[0] ?? null;
  let countyAmbiguous: RegionRow[] | null = null;
  if (!countySel && countyBaseHits.length === 1) countySel = countyBaseHits[0];
  else if (!countySel && countyBaseHits.length > 1) {
    // 例如「嘉義」「新竹」→ 市/縣難分
    countyAmbiguous = dedupeById(countyBaseHits);
  }

  // ── 2. 行政區偵測（收集所有命中；記錄是否「全名」命中） ──
  const distHits: { d: RegionRow; full: boolean }[] = [];
  for (const d of districts) {
    const full = nz(d.name);
    const base = stripDistrictSuffix(full);
    if (full.length >= 2 && work.includes(full)) distHits.push({ d, full: true });
    else if (base.length >= 2 && work.includes(base)) distHits.push({ d, full: false });
  }
  const fullSet = new Set(distHits.filter((x) => x.full).map((x) => x.d.id));
  const dedupDist = dedupeById(distHits.map((x) => x.d));

  // ── 3. 區域群組偵測（最長 label 優先） ──
  let groupHit: { label: string; counties: string[] } | null = null;
  for (const g of REGION_GROUPS) {
    if (work.includes(g.label)) { groupHit = g; break; }
  }

  // ── 4. 偏鄉（需先問縣市，除非同時講了縣市） ──
  const rural = PIANXIANG_RE.test(work);

  // ===== 決策（明確的縣市/區優先於群組） =====

  // (a) 有講縣市
  if (countySel) {
    const countyBase = stripCountySuffix(nz(countySel.name));
    const inCounty = dedupDist.filter((d) => d.parent_id === countySel!.id);
    // 全名命中的區優先；否則排除「與縣市同名的首區」(打「桃園」是指整個桃園市，不是桃園區)
    let chosen = inCounty.find((d) => fullSet.has(d.id)) ?? null;
    if (!chosen) chosen = inCounty.find((d) => stripDistrictSuffix(nz(d.name)) !== countyBase) ?? null;
    if (chosen) {
      const strip = [countySel.name, chosen.name];
      if (rural) strip.push("偏鄉", "偏遠地區", "山地鄉");
      return resolved(regions, { county: countySel, district: chosen }, text, strip);
    }
    // 縣市（或縣市 + 偏鄉）→ 整個縣市範圍
    const strip = [countySel.name];
    if (rural) strip.push("偏鄉", "偏遠地區", "山地鄉");
    return resolved(regions, { county: countySel, district: null }, text, strip);
  }

  // (b) 縣市同名候選（嘉義/新竹）且沒有區可定位 → 消歧
  if (countyAmbiguous && dedupDist.length === 0) {
    const cands: RegionChoice[] = countyAmbiguous.map((c) => ({
      ids: expandRegionIds(regions, c.id), countyId: c.id, districtId: null, label: c.name,
    }));
    return choice(text, countyAmbiguous.map((c) => stripCountySuffix(nz(c.name)))[0] ?? "", cands, "ambiguous", countyAmbiguous.map((c) => c.name));
  }

  // (c) 沒講縣市，但有區
  if (dedupDist.length === 1) {
    const d = dedupDist[0];
    const county = regions.find((r) => r.id === d.parent_id) ?? null;
    return resolved(regions, { county, district: d }, text, [d.name, county?.name ?? ""].filter(Boolean) as string[]);
  }
  if (dedupDist.length > 1) {
    // 同名區（大安/信義/中正…）→ 候選讓使用者選
    const cands: RegionChoice[] = dedupDist.map((d) => {
      const c = regions.find((r) => r.id === d.parent_id) ?? null;
      return { ids: expandRegionIds(regions, d.id), countyId: c?.id ?? null, districtId: d.id, label: `${c ? c.name : ""}${d.name}` };
    });
    const base = stripDistrictSuffix(nz(dedupDist[0].name));
    return choice(text, base, cands, "ambiguous", cands.map((c) => c.label));
  }

  // (d) 區域群組
  if (groupHit) {
    const ids: string[] = [];
    let primaryCounty: string | null = null;
    for (const cn of groupHit.counties) {
      const c = counties.find((x) => nz(x.name) === nz(cn));
      if (c) { ids.push(c.id); if (!primaryCounty) primaryCounty = c.id; }
    }
    if (ids.length) {
      return {
        keyword: extractKeyword(text, [groupHit.label, ...groupHit.counties]),
        rawKeyword: stripTerms(text, [groupHit.label]).trim(),
        region: { type: "resolved", ids, countyId: null, districtId: null, label: groupHit.label, isGroup: true },
      };
    }
  }

  // (e) 偏鄉但沒講縣市 → 需先問
  if (rural) {
    return {
      keyword: extractKeyword(text, ["偏鄉", "偏遠地區", "山地鄉"]),
      rawKeyword: stripTerms(text, ["偏鄉", "偏遠地區", "山地鄉"]).trim(),
      region: { type: "choice", reason: "rural", label: "偏鄉", candidates: [] },
    };
  }

  return none();
}

// ── 衝突判斷：只有偵測到地區且與目前已選地區「不同」時才需要跳確認 ──
// resolved：縣市層級且等於目前縣市 → 不衝突；其餘不同地點 → 衝突。
// 沒有目前地區 → 不衝突（直接用偵測到的地區搜）。
// choice（消歧）：一律需要跳（無法自動決定），但若其中一個候選正好落在目前縣市 → 自動採用、不跳。
export function regionConflict(
  parsed: ParsedLocation,
  currentRegionId: string | null,
  regions: RegionRow[]
): { needPrompt: boolean; autoChoice?: RegionChoice } {
  if (parsed.region.type === "none") return { needPrompt: false };

  const cur = currentRegionId ? regions.find((r) => r.id === currentRegionId) ?? null : null;
  const curCounty = cur ? (cur.level === "county" ? cur.id : cur.parent_id) : null;

  if (parsed.region.type === "choice") {
    if (parsed.region.reason === "rural") return { needPrompt: true };
    // 消歧：若有候選落在目前縣市，直接採用
    if (curCounty) {
      const auto = parsed.region.candidates.find((c) => c.countyId === curCounty);
      if (auto) return { needPrompt: false, autoChoice: auto };
    }
    return { needPrompt: true };
  }

  // resolved
  if (!currentRegionId) return { needPrompt: false }; // 沒有設定地區 → 直接用
  const r = parsed.region;
  if (r.isGroup) {
    // 群組：目前縣市已在群組內 → 不衝突
    if (curCounty && r.ids.includes(curCounty)) return { needPrompt: false };
    return { needPrompt: true };
  }
  // 純縣市，且等於目前縣市 → 不衝突
  if (!r.districtId && r.countyId && r.countyId === curCounty) return { needPrompt: false };
  // 區層級，且等於目前地區 → 不衝突
  if (r.districtId && r.districtId === currentRegionId) return { needPrompt: false };
  return { needPrompt: true };
}

// 依「全國 → 縣市層 → 區層 → 其他」排序資源
// resources: {scope, region_id}；countyId/districtId 來自解析結果（群組時傳 null）
export function orderResources<T extends { scope?: string | null; region_id?: string | null }>(
  rows: T[],
  ctx: { countyIds: string[]; districtId: string | null }
): T[] {
  const countySet = new Set(ctx.countyIds);
  const rank = (r: T): number => {
    if (r.scope === "national") return 0;
    if (ctx.districtId && r.region_id === ctx.districtId) return 2;
    if (r.region_id && countySet.has(r.region_id)) return 1;
    return 3;
  };
  return [...rows].sort((a, b) => rank(a) - rank(b));
}

// ───────── helpers ─────────

function dedupeById(rows: RegionRow[]): RegionRow[] {
  const seen = new Set<string>();
  const out: RegionRow[] = [];
  for (const r of rows) if (!seen.has(r.id)) { seen.add(r.id); out.push(r); }
  return out;
}

function resolved(
  regions: RegionRow[],
  sel: { county: RegionRow | null; district: RegionRow | null },
  text: string,
  stripNames: string[]
): ParsedLocation {
  const ids = new Set<string>();
  if (sel.county) ids.add(sel.county.id);
  if (sel.district) { ids.add(sel.district.id); if (sel.district.parent_id) ids.add(sel.district.parent_id); }
  const label = `${sel.county ? sel.county.name : ""}${sel.district ? sel.district.name : ""}` || (sel.county?.name ?? "");
  return {
    keyword: extractKeyword(text, stripNames),
    rawKeyword: stripTerms(text, stripNames).trim(),
    region: {
      type: "resolved",
      ids: [...ids],
      countyId: sel.county?.id ?? null,
      districtId: sel.district?.id ?? null,
      label,
      isGroup: false,
    },
  };
}

function choice(
  text: string,
  base: string,
  candidates: RegionChoice[],
  reason: "ambiguous" | "rural",
  stripLabels: string[]
): ParsedLocation {
  // 把候選共同的 base（如「大安」）從關鍵字拿掉
  const strip = [base, ...stripLabels];
  return {
    keyword: extractKeyword(text, strip),
    rawKeyword: stripTerms(text, strip).trim(),
    region: { type: "choice", reason, label: base, candidates },
  };
}

// 從原句移除地區詞（含可能的區/鄉/鎮/市 後綴與 台/臺 變體）
function stripTerms(text: string, terms: string[]): string {
  let s = text;
  const variants = new Set<string>();
  for (const t0 of terms) {
    if (!t0) continue;
    const t = t0.trim();
    const base = stripDistrictSuffix(stripCountySuffix(t));
    for (const v of [t, base]) {
      if (v.length < 1) continue;
      variants.add(v);
      variants.add(v.replace(/台/g, "臺"));
      variants.add(v.replace(/臺/g, "台"));
    }
  }
  // 長字串先移除，避免「台北」先被「台」吃掉
  const list = [...variants].filter((v) => v.length >= 1).sort((a, b) => b.length - a.length);
  for (const v of list) {
    // base 後可接 區/鄉/鎮/市/縣 一字
    const re = new RegExp(escapeRe(v) + "[區鄉鎮市縣]?", "g");
    s = s.replace(re, " ");
  }
  return s.replace(/\s+/g, " ").trim();
}

// 去地區 + 去贅詞 → 產生查詢 token（空白分隔；中文黏在一起時補 bigram）
export function extractKeyword(text: string, regionTerms: string[]): string {
  let s = stripTerms(text, regionTerms);
  s = stripLocalPlace(s);   // 去掉非正式在地地名（民生社區…），但保留服務性詞彙
  s = s.replace(FILLER_RE, " ");
  s = s.replace(/[?？!！~～.。,，、:：;；「」『』（）()【】\[\]]/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

// 把查詢字切成 search token：先用標點/空白切；對黏在一起的長中文串補 2-gram，提高召回
export function searchTokensOf(keyword: string): string[] {
  const parts = keyword.split(/[\s,，、。.／/]+/).map((t) => t.trim()).filter((t) => t.length > 0);
  const out = new Set<string>();
  for (const p of parts) {
    out.add(p);
    if (p.length >= 4 && /^[一-鿿]+$/.test(p)) {
      for (let i = 0; i < p.length - 1; i++) out.add(p.slice(i, i + 2));
    }
  }
  return [...out];
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
