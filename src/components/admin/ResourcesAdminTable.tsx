"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AD, AdPill, adBtn, type Tone } from "@/components/admin/adminUi";
import { ELIcon } from "@/components/layout/ELIcon";
import {
  approveResource, rejectResource, markResourceEnded,
  deleteResources, setResourcesStatus,
} from "@/lib/admin/actions";

export type ResRow = {
  id: string; name: string; summary: string | null; phone: string | null;
  website_url: string | null; scope: string; status: string;
  categoryName: string; subcatName: string; regionName: string | null;
  createdAt: string; approvedAt: string | null;
};

const STATUS_PILL: Record<string, { tone: Tone; label: string }> = {
  active:   { tone: "ok", label: "已上架" },
  pending:  { tone: "pending", label: "待審核" },
  ended:    { tone: "neutral", label: "已結束" },
  archived: { tone: "neutral", label: "已封存" },
};

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }) : "—");

// 可排序欄位 → sort key
const SORTABLE: Record<string, string> = { name: "name", category: "category", region: "region", scope: "scope", verified: "verified" };

export function ResourcesAdminTable({
  rows, canDelete, baseQuery, sort,
}: { rows: ResRow[]; canDelete: boolean; baseQuery: string; sort: string }) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const allOn = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggleAll = () => setSel(allOn ? new Set() : new Set(rows.map((r) => r.id)));
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const ids = [...sel];

  const sortHref = (key: string) => `/admin/resources?${baseQuery}${baseQuery ? "&" : ""}sort=${key}`;
  const exportHref = `/api/admin/resources/export-csv?ids=${ids.join(",")}`;

  const runBatch = (fn: () => Promise<void>) => start(() => { fn().then(() => setSel(new Set())); });

  function Th({ label, sortKey, w }: { label: string; sortKey?: string; w?: number }) {
    const active = sortKey && sort === SORTABLE[sortKey];
    const cell = (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: active ? AD.coralDark : AD.muted, fontWeight: active ? 800 : 700 }}>
        {label}{sortKey && <ELIcon name="chevron" size={13} color={active ? AD.coralDark : "#C8B8AE"} stroke={2.4} />}
      </span>
    );
    return (
      <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 12.5, whiteSpace: "nowrap", width: w }}>
        {sortKey ? <Link href={sortHref(SORTABLE[sortKey])} style={{ textDecoration: "none" }}>{cell}</Link> : cell}
      </th>
    );
  }

  return (
    <div className="wv-desktop-only">
      {/* 批次操作列 */}
      {sel.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "11px 16px", borderRadius: 14, background: "#241F1B", color: "#fff" }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>已選 {sel.size} 筆</span>
          <button onClick={() => setSel(new Set())} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>取消選取</button>
          <div style={{ flex: 1 }} />
          <a href={exportHref} style={{ ...adBtn("neutral"), background: "rgba(255,255,255,0.1)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)" }}>
            <ELIcon name="news" size={15} color="#fff" /> 匯出選取 (CSV)
          </a>
          <button onClick={() => runBatch(() => setResourcesStatus(ids, "active"))} disabled={pending} style={{ ...adBtn("ok"), opacity: pending ? 0.5 : 1 }}>
            <ELIcon name="check" size={15} color="#1E7A43" stroke={2.4} /> 批次上架
          </button>
          {canDelete && (
            <button
              onClick={() => { if (confirm(`確定要刪除選取的 ${sel.size} 筆資源嗎？此操作無法復原。`)) runBatch(() => deleteResources(ids)); }}
              disabled={pending}
              style={{ ...adBtn("alert"), opacity: pending ? 0.5 : 1 }}
            >
              <ELIcon name="close" size={15} color="#C0392B" stroke={2.2} /> 刪除選取
            </button>
          )}
        </div>
      )}

      <div style={{ background: "#fff", border: `1px solid ${AD.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
            <thead>
              <tr style={{ background: "#FAF6F2", borderBottom: `1px solid ${AD.border}` }}>
                <th style={{ padding: "10px 0 10px 16px", width: 42 }}>
                  <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="全選" style={{ width: 17, height: 17, accentColor: AD.coral, cursor: "pointer" }} />
                </th>
                <Th label="名稱" sortKey="name" />
                <Th label="分類" sortKey="category" />
                <Th label="地區" sortKey="region" />
                <Th label="範圍" sortKey="scope" w={80} />
                <Th label="電話" w={130} />
                <Th label="認證時間" sortKey="verified" w={120} />
                <Th label="狀態" w={90} />
                <th style={{ textAlign: "right", padding: "10px 16px 10px 14px", fontSize: 12.5, color: AD.muted, fontWeight: 700, whiteSpace: "nowrap" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const on = sel.has(r.id);
                const sp = STATUS_PILL[r.status] ?? STATUS_PILL.archived;
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${AD.border}`, background: on ? "#FFF4EF" : "#fff" }}>
                    <td style={{ padding: "12px 0 12px 16px", verticalAlign: "top" }}>
                      <input type="checkbox" checked={on} onChange={() => toggle(r.id)} aria-label={`選取 ${r.name}`} style={{ width: 17, height: 17, accentColor: AD.coral, cursor: "pointer", marginTop: 2 }} />
                    </td>
                    <td style={{ padding: "12px 14px", maxWidth: 360 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: AD.ink, lineHeight: 1.4 }}>{r.name}</div>
                      {r.summary && <div style={{ marginTop: 3, fontSize: 12.5, color: AD.muted, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.summary}</div>}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 12, color: AD.muted }}>{r.categoryName || "—"}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: AD.ink }}>{r.subcatName || ""}</div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: AD.sub, whiteSpace: "nowrap" }}>{r.regionName || "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <AdPill tone={r.scope === "national" ? "pending" : "ok"}>{r.scope === "national" ? "全國" : "在地"}</AdPill>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: AD.sub, whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace" }}>{r.phone || "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: AD.sub, whiteSpace: "nowrap" }}>{fmt(r.approvedAt)}</td>
                    <td style={{ padding: "12px 14px" }}><AdPill tone={sp.tone}>{sp.label}</AdPill></td>
                    <td style={{ padding: "10px 16px 10px 14px" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <Link href={`/admin/resources/${r.id}/edit`} title="編輯" style={iconBtn}><ELIcon name="edit" size={16} color="#2A63C0" /></Link>
                        {r.status === "pending" && (
                          <>
                            <form action={approveResource.bind(null, r.id)}><button type="submit" title="上架" style={{ ...iconBtn, borderColor: "#BDE8CC" }}><ELIcon name="check" size={16} color="#1E7A43" stroke={2.4} /></button></form>
                            <form action={rejectResource.bind(null, r.id)}><button type="submit" title="退回" style={{ ...iconBtn, borderColor: "#F3C9C4" }}><ELIcon name="close" size={16} color="#C0392B" stroke={2.2} /></button></form>
                          </>
                        )}
                        {r.status === "active" && (
                          <form action={markResourceEnded.bind(null, r.id)}><button type="submit" style={{ ...adBtn("pending"), minHeight: 32, padding: "0 10px", fontSize: 12.5 }}>結束</button></form>
                        )}
                        {(r.status === "ended" || r.status === "archived") && (
                          <form action={approveResource.bind(null, r.id)}><button type="submit" style={{ ...adBtn("ok"), minHeight: 32, padding: "0 10px", fontSize: 12.5 }}>重新上架</button></form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${AD.line}`, background: "#fff",
  display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
