/**
 * fetch-open-data.mjs
 * 台灣政府開放資料抓取腳本 — 長者資源平台用
 *
 * 執行方式：
 *   node scripts/fetch-open-data.mjs
 *
 * 產出：
 *   scripts/output/resources_YYYYMMDD.csv  （可直接用後台「批量匯入」）
 *
 * 主要資料來源（data.gov.tw）：
 *   - 社區照顧關懷據點：https://data.gov.tw/dataset/155697
 *   - 老人福利機構名冊：https://data.gov.tw/dataset/19093
 *   - 全國日間照顧機構：https://data.gov.tw/dataset/137024
 *   - 失智友善社區資源：https://data.gov.tw/dataset/136382
 *   - 居家服務提供單位：https://data.gov.tw/dataset/151010
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");

// ── 資料集定義 ────────────────────────────────────────────────────────────────
// 每筆代表一個 data.gov.tw 資源
const DATASETS = [
  {
    id: "community-care-stations",
    label: "社區照顧關懷據點",
    // data.gov.tw REST API endpoint（resource_id 請至 data.gov.tw 查詢最新版）
    // 範例 URL：https://data.gov.tw/api/v2/rest/datastore/RESOURCE_ID?format=json&limit=500
    apiUrl: "https://data.moi.gov.tw/MoiOD/System/DownloadFile.aspx?DATA=1B7AB3D7-1ECC-4F22-9EB9-C27B9E30AA6F",
    format: "json",
    subcategorySlug: "community-station",
    scope: "local",
    fieldMap: {
      name: ["單位名稱", "據點名稱", "機構名稱"],
      address: ["地址", "服務地址", "機構地址"],
      phone: ["電話", "聯絡電話", "機構電話"],
      region_hint: ["縣市", "縣市別", "行政區"],
      source_org: () => "衛生福利部社家署",
    },
    tags: ["社區據點", "關懷服務", "長者"],
  },
  {
    id: "elderly-welfare-institutions",
    label: "老人福利機構名冊",
    apiUrl: "https://data.gov.tw/api/v2/rest/datastore/A01010000J-000003-001?format=json&limit=1000",
    format: "json",
    subcategorySlug: "day-care",
    scope: "local",
    fieldMap: {
      name: ["機構名稱", "單位名稱"],
      address: ["地址", "機構地址", "通訊地址"],
      phone: ["電話", "聯絡電話"],
      region_hint: ["縣市別", "縣市", "行政區"],
      source_org: () => "衛生福利部",
    },
    tags: ["老人福利", "長期照顧"],
  },
  {
    id: "day-care-centers",
    label: "全國日間照顧機構",
    apiUrl: "https://ltcpa.mohw.gov.tw/opendata/DayCarePOI.json",
    format: "json",
    subcategorySlug: "day-care",
    scope: "local",
    fieldMap: {
      name: ["機構名稱", "單位名稱"],
      address: ["地址", "機構地址"],
      phone: ["電話", "服務電話"],
      region_hint: ["縣市", "縣市別"],
      source_org: () => "衛生福利部長照司",
    },
    tags: ["日照中心", "日間照顧", "長照"],
  },
];

// ── 縣市名稱 → region code 對照表 ────────────────────────────────────────────
const COUNTY_CODE_MAP = {
  "台北市": "TW-TPE", "臺北市": "TW-TPE",
  "新北市": "TW-NTP",
  "桃園市": "TW-TYC",
  "台中市": "TW-TXG", "臺中市": "TW-TXG",
  "台南市": "TW-TNN", "臺南市": "TW-TNN",
  "高雄市": "TW-KHH",
  "基隆市": "TW-KEL",
  "新竹市": "TW-HSZ",
  "嘉義市": "TW-CYI",
  "新竹縣": "TW-HSQ",
  "苗栗縣": "TW-MIA",
  "彰化縣": "TW-CHA",
  "南投縣": "TW-NAN",
  "雲林縣": "TW-YUN",
  "嘉義縣": "TW-CHY",
  "屏東縣": "TW-PIF",
  "宜蘭縣": "TW-ILA",
  "花蓮縣": "TW-HUA",
  "台東縣": "TW-TTT", "臺東縣": "TW-TTT",
  "澎湖縣": "TW-PEH",
  "金門縣": "TW-KIN",
  "連江縣": "TW-LIE",
};

// ── helpers ───────────────────────────────────────────────────────────────────

function pickField(row, candidates) {
  if (typeof candidates === "function") return candidates(row);
  for (const key of candidates) {
    if (row[key]) return String(row[key]).trim();
  }
  return "";
}

function guessRegionCode(row, regionHintFields) {
  const hint = pickField(row, regionHintFields);
  if (!hint) return "";
  // 精確比對
  if (COUNTY_CODE_MAP[hint]) return COUNTY_CODE_MAP[hint];
  // 前綴比對（e.g. 「台北」→ 台北市）
  for (const [name, code] of Object.entries(COUNTY_CODE_MAP)) {
    if (name.startsWith(hint) || hint.startsWith(name.slice(0, 2))) return code;
  }
  return "";
}

function escapeCsv(val) {
  const s = String(val ?? "").replace(/\r?\n/g, " ");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h] ?? "")).join(","));
  }
  return lines.join("\n");
}

async function fetchJson(url) {
  console.log(`  → 抓取 ${url}`);
  const res = await fetch(url, {
    headers: { "User-Agent": "ElderlyResourceToolkit/1.0 (research)" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

// ── 逐筆轉換為 resources schema ───────────────────────────────────────────────
function transformRows(rawRows, dataset) {
  const { fieldMap, subcategorySlug, scope, tags } = dataset;
  const results = [];

  for (const row of rawRows) {
    const name = pickField(row, fieldMap.name);
    if (!name) continue; // 跳過無名稱的列

    const address = pickField(row, fieldMap.address);
    const phone = pickField(row, fieldMap.phone);
    const source_org = pickField(row, fieldMap.source_org);
    const region_code = guessRegionCode(row, fieldMap.region_hint);

    results.push({
      subcategory_slug: subcategorySlug,
      scope,
      region_code,
      name,
      summary: "",
      description: "",
      phone: phone.replace(/[^0-9\-\(\)\s#]/g, "").trim(),
      phone_hint: "",
      address,
      website_url: pickField(row, fieldMap.website_url ?? []),
      identity_tags: "elder",
      tags: tags.join(","),
      source_org,
      source_url: dataset.apiUrl,
      status: "pending",
    });
  }

  return results;
}

// ── 主流程 ────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const outPath = path.join(OUTPUT_DIR, `resources_${dateStr}.csv`);

  const CSV_HEADERS = [
    "subcategory_slug", "scope", "region_code", "name", "summary",
    "description", "phone", "phone_hint", "address", "website_url",
    "identity_tags", "tags", "source_org", "source_url", "status",
  ];

  const allRows = [];
  const summary = [];

  for (const dataset of DATASETS) {
    console.log(`\n📦 處理：${dataset.label}`);
    try {
      const raw = await fetchJson(dataset.apiUrl);

      // 支援不同的 JSON 結構
      let rows = [];
      if (Array.isArray(raw)) {
        rows = raw;
      } else if (raw?.result?.records) {
        rows = raw.result.records; // data.gov.tw 格式
      } else if (raw?.data) {
        rows = raw.data;
      } else {
        console.warn("  ⚠️  無法識別 JSON 結構，跳過");
        continue;
      }

      const transformed = transformRows(rows, dataset);
      allRows.push(...transformed);
      summary.push({ dataset: dataset.label, raw: rows.length, transformed: transformed.length });
      console.log(`  ✅ ${rows.length} 筆原始 → ${transformed.length} 筆轉換`);
    } catch (err) {
      console.error(`  ❌ 失敗：${err.message}`);
      summary.push({ dataset: dataset.label, raw: 0, transformed: 0, error: err.message });
    }
  }

  if (allRows.length === 0) {
    console.log("\n⚠️  沒有成功抓到任何資料。請確認 API URL 是否有效。");
    process.exit(1);
  }

  // 移除重複（以名稱 + 地址為鍵）
  const seen = new Set();
  const deduped = allRows.filter((r) => {
    const key = `${r.name}|${r.address}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const csv = rowsToCsv(CSV_HEADERS, deduped);
  fs.writeFileSync(outPath, "﻿" + csv, "utf8"); // BOM for Excel

  console.log("\n────────────────────────────────────");
  console.log("✅ 完成！");
  console.log(`   總計：${allRows.length} 筆 → 去重後 ${deduped.length} 筆`);
  console.log(`   輸出：${outPath}`);
  console.log("\n📋 各資料集結果：");
  for (const s of summary) {
    const status = s.error ? `❌ ${s.error}` : `✅ ${s.transformed} 筆`;
    console.log(`   ${s.dataset}：${status}`);
  }
  console.log("\n🔜 下一步：");
  console.log("   1. 用 Excel/Google Sheets 開啟 CSV，人工確認欄位是否正確");
  console.log("   2. 確認 region_code 欄位（空白的要手動補）");
  console.log("   3. 到後台 /admin/resources → 批量匯入 → 上傳此 CSV");
  console.log("   4. 批量匯入後狀態為 pending，逐一審核後上架");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
