"use client";

import { useState, useTransition } from "react";
import { AD, AdCard, adBtn } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";
import { importResources, type ImportRow } from "@/lib/admin/actions";

/* 把 CSV 文字解析成欄位陣列（支援引號內含逗號/換行） */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", inQ = false;
  const t = text.replace(/^﻿/, ""); // 去 BOM
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQ) {
      if (c === '"') { if (t[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && t[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const SYN: Record<keyof ImportRow, string[]> = {
  name: ["名稱", "資源名稱", "機構名稱", "服務名稱", "name"],
  type: ["類型", "類別", "資源類型", "分類", "服務類別", "category", "type"],
  location: ["地點", "地區", "縣市", "區域", "位置", "行政區", "region", "location"],
  content: ["服務內容", "說明", "簡介", "內容", "描述", "summary", "description"],
  phone: ["電話", "聯絡電話", "連絡電話", "phone", "tel"],
  website: ["網址", "網站", "官網", "url", "website"],
};
const FIELD_ORDER: (keyof ImportRow)[] = ["name", "type", "location", "content", "phone", "website"];

function mapColumns(headerCells: string[]): Record<number, keyof ImportRow> | null {
  const map: Record<number, keyof ImportRow> = {};
  let matched = 0;
  headerCells.forEach((h, idx) => {
    const hn = h.replace(/\s+/g, "").toLowerCase();
    for (const f of FIELD_ORDER) {
      if (SYN[f].some((s) => hn.includes(s.toLowerCase()))) { map[idx] = f; matched++; break; }
    }
  });
  return matched >= 2 ? map : null; // 至少對到 2 欄才算有標題列
}

export function ResourceImportClient() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const [pending, start] = useTransition();
  const [fileName, setFileName] = useState("");

  function ingest(text: string) {
    setResult(null);
    const cells = parseCSV(text);
    if (cells.length === 0) { setRows([]); return; }
    const headerMap = mapColumns(cells[0]);
    const dataRows = headerMap ? cells.slice(1) : cells;
    const colFor = headerMap
      ? (f: keyof ImportRow) => Number(Object.keys(headerMap).find((k) => headerMap[Number(k)] === f) ?? -1)
      : (f: keyof ImportRow) => FIELD_ORDER.indexOf(f); // 無標題 → 依欄位順序
    const parsed: ImportRow[] = dataRows.map((r) => ({
      name: (r[colFor("name")] ?? "").trim(),
      type: (r[colFor("type")] ?? "").trim(),
      location: (r[colFor("location")] ?? "").trim(),
      content: (r[colFor("content")] ?? "").trim(),
      phone: (r[colFor("phone")] ?? "").trim(),
      website: (r[colFor("website")] ?? "").trim(),
    })).filter((r) => r.name);
    setRows(parsed);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => ingest(String(reader.result ?? ""));
    reader.readAsText(file, "utf-8");
  }

  function doImport() {
    if (rows.length === 0) return;
    start(() => { importResources(rows).then((r) => { setResult(r); if (r.inserted > 0) setRows([]); }); });
  }

  const template = "資源名稱,資源類型,地點,服務內容,電話,網址\n中壢區衛生所,醫療健康,桃園市中壢區,提供成人健檢與疫苗接種,03-4221234,https://example.com\n復康巴士,交通接駁,全國,長者無障礙接送服務,,";
  const templateHref = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(template);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AdCard>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: AD.chip, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <ELIcon name="news" size={18} color={AD.coral} />
          </span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: AD.ink }}>上傳 CSV 檔</div>
            <div style={{ fontSize: 13, color: AD.muted }}>欄位：資源名稱、資源類型、地點、服務內容（電話、網址選填）</div>
          </div>
        </div>
        <p style={{ margin: "4px 0 12px", fontSize: 13, color: AD.sub, lineHeight: 1.6 }}>
          一列一筆資源。類型對應現有分類（例：醫療健康／交通接駁），地點填縣市或行政區（例：桃園市中壢區），全國服務填「全國」。
          <a href={templateHref} download="資源匯入範本.csv" style={{ color: AD.coralDark, fontWeight: 700, marginLeft: 6 }}>下載範本 CSV</a>
        </p>
        <label style={{ ...adBtn("coral"), display: "inline-flex", cursor: "pointer" }}>
          <ELIcon name="arrow" size={16} color="#fff" /> 選擇 CSV 檔
          <input type="file" accept=".csv,text/csv" onChange={onFile} style={{ display: "none" }} />
        </label>
        {fileName && <span style={{ marginLeft: 10, fontSize: 13, color: AD.muted }}>{fileName}</span>}
      </AdCard>

      {rows.length > 0 && (
        <AdCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: AD.ink }}>預覽（共 {rows.length} 筆）</span>
            <button onClick={doImport} disabled={pending} style={{ ...adBtn("coral"), opacity: pending ? 0.6 : 1 }}>
              <ELIcon name="check" size={16} color="#fff" stroke={2.4} /> {pending ? "匯入中…" : `確認匯入 ${rows.length} 筆`}
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720, fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#FAF6F2", borderBottom: `1px solid ${AD.border}` }}>
                  {["名稱", "類型", "地點", "服務內容", "電話"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "9px 12px", color: AD.muted, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${AD.border}` }}>
                    <td style={{ padding: "9px 12px", fontWeight: 700, color: AD.ink, whiteSpace: "nowrap" }}>{r.name}</td>
                    <td style={{ padding: "9px 12px", color: AD.sub, whiteSpace: "nowrap" }}>{r.type || "—"}</td>
                    <td style={{ padding: "9px 12px", color: AD.sub, whiteSpace: "nowrap" }}>{r.location || "全國"}</td>
                    <td style={{ padding: "9px 12px", color: AD.sub, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.content || "—"}</td>
                    <td style={{ padding: "9px 12px", color: AD.sub, whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace" }}>{r.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 && <p style={{ margin: "8px 2px 0", fontSize: 12, color: AD.muted }}>僅預覽前 50 筆，匯入時會全部處理。</p>}
          </div>
        </AdCard>
      )}

      {result && (
        <AdCard style={{ border: `1px solid ${result.errors.length ? "#F5DCBE" : "#BDE8CC"}` }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: result.errors.length ? "#B45309" : "#1E7A43" }}>
            匯入完成：成功 {result.inserted} 筆{result.errors.length ? `，${result.errors.length} 筆需確認` : ""}
          </div>
          {result.errors.length > 0 && (
            <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 13, color: AD.sub, lineHeight: 1.7 }}>
              {result.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </AdCard>
      )}
    </div>
  );
}
