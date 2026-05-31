/**
 * ai-enrich-csv.mjs
 * 用 Claude AI 自動補齊 CSV 的 summary 欄位，並驗證資料品質
 *
 * 前置條件：
 *   - 先執行 fetch-open-data.mjs 產生 CSV
 *   - 設定環境變數 ANTHROPIC_API_KEY
 *
 * 執行方式：
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/ai-enrich-csv.mjs scripts/output/resources_20260531.csv
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const INPUT_CSV = process.argv[2];
if (!INPUT_CSV) {
  console.error("用法：node scripts/ai-enrich-csv.mjs <csv檔案路徑>");
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── CSV 解析（簡易版，支援帶引號的欄位）─────────────────────────────────────
function parseCsv(text) {
  const lines = text.replace(/^﻿/, "").split("\n").filter(Boolean);
  const headers = splitCsvLine(lines[0]);
  return {
    headers,
    rows: lines.slice(1).map((line) => {
      const values = splitCsvLine(line);
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
    }),
  };
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function escapeCsv(val) {
  const s = String(val ?? "").replace(/\r?\n/g, " ");
  if (s.includes(",") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// ── 批次呼叫 Claude ────────────────────────────────────────────────────────
async function enrichBatch(rows) {
  const prompt = rows.map((r, i) =>
    `[${i}] 名稱：${r.name} | 分類：${r.subcategory_slug} | 地址：${r.address || "無"} | 電話：${r.phone || "無"} | 標籤：${r.tags}`
  ).join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: `你是台灣長者資源平台的內容編輯，負責為社福資源寫簡短摘要。
規則：
- 繁體中文，20–40 字
- 說明這個資源「提供什麼服務、給誰、在哪裡（縣市）」
- 不要重複名稱本身，不要用標點結尾
- 輸出格式：JSON array，每個元素只有 "summary" 欄位
- 範例：[{"summary":"提供台北市大安區長者日間照顧服務，含復健與營養餐點"}]`,
    messages: [
      {
        role: "user",
        content: `請為以下 ${rows.length} 筆資源各寫一段 summary：\n${prompt}\n\n請輸出長度為 ${rows.length} 的 JSON array。`,
      },
    ],
  });

  try {
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found");
    return JSON.parse(match[0]);
  } catch {
    // Claude 回傳格式異常時，回傳空 summary
    return rows.map(() => ({ summary: "" }));
  }
}

// ── 主流程 ────────────────────────────────────────────────────────────────────
async function main() {
  const text = fs.readFileSync(INPUT_CSV, "utf8");
  const { headers, rows } = parseCsv(text);

  if (!headers.includes("summary")) {
    console.error("CSV 缺少 summary 欄位");
    process.exit(1);
  }

  // 找出 summary 為空的列
  const emptyRows = rows.filter((r) => !r.summary?.trim());
  console.log(`總計 ${rows.length} 筆，${emptyRows.length} 筆需要補 summary`);

  if (emptyRows.length === 0) {
    console.log("全部已有 summary，不需要處理。");
    process.exit(0);
  }

  // 分批處理（每批 20 筆，避免 prompt 過長）
  const BATCH_SIZE = 20;
  let enriched = 0;

  for (let i = 0; i < emptyRows.length; i += BATCH_SIZE) {
    const batch = emptyRows.slice(i, i + BATCH_SIZE);
    console.log(`\n處理第 ${i + 1}–${Math.min(i + BATCH_SIZE, emptyRows.length)} 筆…`);

    const results = await enrichBatch(batch);

    for (let j = 0; j < batch.length; j++) {
      const original = batch[j];
      const originalIdx = rows.findIndex(
        (r) => r.name === original.name && r.address === original.address,
      );
      if (originalIdx >= 0 && results[j]?.summary) {
        rows[originalIdx].summary = results[j].summary;
        enriched++;
      }
    }

    // 避免 rate limit
    if (i + BATCH_SIZE < emptyRows.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // 輸出新 CSV
  const outPath = INPUT_CSV.replace(".csv", "_enriched.csv");
  const csvLines = [headers.join(",")];
  for (const row of rows) {
    csvLines.push(headers.map((h) => escapeCsv(row[h] ?? "")).join(","));
  }
  fs.writeFileSync(outPath, "﻿" + csvLines.join("\n"), "utf8");

  console.log(`\n✅ 完成！補充了 ${enriched} 筆 summary`);
  console.log(`   輸出：${outPath}`);
  console.log("\n🔜 下一步：到後台批量匯入此 CSV");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
