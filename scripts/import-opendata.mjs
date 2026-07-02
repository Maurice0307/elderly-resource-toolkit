// 政府開放資料 → ELDERLINK resources 批量匯入
// 來源：衛福部 8572 老人福利機構名冊（Big5，分縣市）、長照2.0 ABC據點 abc.csv（UTF-8，全台）
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

// ---- env ----
const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// ---- helpers ----
const norm = (s) => (s ?? "").replace(/臺/g, "台").replace(/\s+/g, "").trim();
const COUNTIES = ["台北市","新北市","桃園市","台中市","台南市","高雄市","基隆市","新竹市","嘉義市","新竹縣","苗栗縣","彰化縣","南投縣","雲林縣","嘉義縣","屏東縣","宜蘭縣","花蓮縣","台東縣","澎湖縣","金門縣","連江縣"];

function parseCSV(text) {
  const rows = []; let row = [], f = "", q = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i+1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else { if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i+1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
      else f += c; }
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.some((c) => (c ?? "").trim() !== ""));
}
function toObjects(rows) {
  const head = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}
async function fetchDecoded(url, enc) {
  const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
  return new TextDecoder(enc).decode(buf);
}
// 從全址解析縣市 + 行政區
function splitAddr(addr) {
  let county = COUNTIES.find((c) => addr.startsWith(c)) || COUNTIES.find((c) => addr.startsWith(c.replace(/台/g, "臺")));
  if (!county) return { county: null, district: null };
  const rest = addr.slice(county.length).replace(/^臺/, "台");
  const m = rest.match(/^(.+?(區|鄉|鎮|市))/);
  return { county, district: m ? m[1] : null };
}

// ---- 載入 DB 對映 ----
const [{ data: subs }, { data: cats }, { data: regions }, { data: existing }] = await Promise.all([
  sb.from("subcategories").select("id, name, category_id"),
  sb.from("categories").select("id, name"),
  sb.from("regions").select("id, name, level, parent_id"),
  sb.from("resources").select("name"),
]);
const subByName = {}; for (const s of subs) subByName[norm(s.name)] = s.id;
const countyByName = {}; for (const r of regions) if (r.level === "county") countyByName[norm(r.name)] = r.id;
const distByKey = {}; for (const r of regions) if (r.level === "district") distByKey[`${r.parent_id}|${norm(r.name)}`] = r.id;
const existingNames = new Set((existing ?? []).map((r) => norm(r.name)));

function resolveRegion(county, district) {
  const cid = countyByName[norm(county || "")];
  if (!cid) return null;
  if (district) { const did = distByKey[`${cid}|${norm(district)}`]; if (did) return did; }
  return cid; // 退回縣市級
}
function subId(name) { return subByName[norm(name)] || null; }

// ---- 來源定義 ----
const ABC_DESC = { A: "社區整合型服務中心（A）", B: "複合型服務中心（B）", C: "巷弄長照站（C）" };

async function buildElderInst(counties) {
  const out = [];
  for (const county of counties) {
    const fileCounty = county.replace(/台/g, "臺"); // 檔名用臺
    const url = `https://www.opendata.mohw.gov.tw/dataset/opendata/sfaa/8572/${encodeURIComponent(fileCounty + "老人福利機構名冊")}.csv`;
    let objs;
    try { objs = toObjects(parseCSV(await fetchDecoded(url, "big5"))); }
    catch (e) { console.log(`  ⚠ ${county} 抓取失敗：${e.message}`); continue; }
    for (const o of objs) {
      const name = o["機構名稱"]; if (!name) continue;
      const dist = (o["區域別"] || "").trim();
      const target = (o["收容對象"] || "").replace(/\s+/g, " ").trim();
      const beds = (o["核定床數"] || "").trim();
      const prop = (o["屬性"] || "").trim();
      let content = `${prop}老人福利機構`;
      if (target) content += `，收容對象：${target}`;
      if (beds) content += `，核定床數 ${beds} 床`;
      out.push({ name, type: "1966 長照服務", county, district: dist || null,
        content, phone: (o["電話"] || "").trim(), website: "" });
    }
    console.log(`  ✓ ${county} 老人福利機構：${objs.length} 筆`);
  }
  return out;
}

async function buildABC(counties) {
  const text = await fetchDecoded("https://ltcpap.mohw.gov.tw/publish/abc.csv", "utf-8");
  const objs = toObjects(parseCSV(text));
  const want = new Set(counties.map((c) => norm(c)));
  const byCode = new Map();
  for (const o of objs) {
    const addr = o["地址全址"] || ""; const { county, district } = splitAddr(addr);
    if (!county || !want.has(norm(county))) continue;
    const code = o["機構代碼"] || o["機構名稱"];
    const lvl = (o["O_ABC"] || "").trim().toUpperCase();
    const svc = (o["特約服務項目"] || "").trim();
    if (!byCode.has(code)) byCode.set(code, {
      name: o["機構名稱"], county, district, level: lvl,
      phone: (o["機構電話"] || "").trim(), addr, services: new Set(),
    });
    if (svc) byCode.get(code).services.add(svc);
  }
  const out = [];
  for (const g of byCode.values()) {
    const type = g.level === "C" ? "社區據點活動" : "日照中心"; // A/B→日照中心，C→社區據點
    let content = `長照2.0 ${ABC_DESC[g.level] || "據點"}`;
    if (g.services.size) content += `。特約服務：${[...g.services].slice(0, 8).join("、")}`;
    content += `。地址：${g.addr}`;
    out.push({ name: g.name, type, county: g.county, district: g.district, content, phone: g.phone, website: "" });
  }
  console.log(`  ✓ 長照ABC據點（${counties.join("/")}）：${out.length} 家（去重後）`);
  return out;
}

// ---- 執行 ----
mkdirSync(new URL("../data-imports/", import.meta.url), { recursive: true });
const datasets = [
  { label: "老人福利機構", rows: await buildElderInst(["桃園市","台北市","新北市","台中市","台南市","高雄市"]) },
  { label: "長照ABC據點", rows: await buildABC(["桃園市","台北市","新北市"]) },
];

let totalIns = 0, totalSkip = 0, totalErr = 0;
const seen = new Set();
for (const ds of datasets) {
  // 寫 CSV 存底
  const csv = ["資源名稱,資源類型,地點,服務內容,電話,網址",
    ...ds.rows.map((r) => [r.name, r.type, `${r.county}${r.district || ""}`, r.content, r.phone, r.website]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\r\n");
  writeFileSync(new URL(`../data-imports/${ds.label}.csv`, import.meta.url), "﻿" + csv, "utf8");

  // 準備 payload
  const payloads = [];
  for (const r of ds.rows) {
    const key = norm(r.name) + "|" + norm(r.county);
    if (seen.has(key)) continue; seen.add(key);
    if (existingNames.has(norm(r.name))) { totalSkip++; continue; }
    const sid = subId(r.type); if (!sid) { console.log(`  ✗ 無此子分類：${r.type}`); totalErr++; continue; }
    const rid = resolveRegion(r.county, r.district);
    if (!rid) { console.log(`  ✗ 無此地區：${r.county}${r.district}（${r.name}）`); totalErr++; continue; }
    payloads.push({
      subcategory_id: sid, scope: "local", region_id: rid, name: r.name.trim(),
      summary: r.content.slice(0, 100) || null, description: r.content || null,
      phone: r.phone || null, website_url: r.website || null,
      status: "active", approved_at: new Date().toISOString(),
    });
  }
  // 批次寫入
  for (let i = 0; i < payloads.length; i += 200) {
    const batch = payloads.slice(i, i + 200);
    const { error } = await sb.from("resources").insert(batch);
    if (error) { console.log(`  ✗ 批次寫入失敗：${error.message}`); totalErr += batch.length; }
    else totalIns += batch.length;
  }
  console.log(`【${ds.label}】準備 ${ds.rows.length}，寫入 ${payloads.length}`);
}
console.log(`\n===== 完成：新增 ${totalIns}，跳過(已存在) ${totalSkip}，錯誤 ${totalErr} =====`);
