"use client";

import { useActionState, useState } from "react";
import { submitResource } from "@/lib/resources/submitAction";
import { categories } from "@/config/categories";
import { ELIcon } from "@/components/layout/ELIcon";

type SubcategoryRow = { id: string; slug: string; name: string; category_slug: string };
type RegionRow = { id: string; name: string; parent_id: string | null };

/* ── Modal（受控） ── */
function ShareResourceModal({
  onClose,
  subcategories,
  regions,
}: {
  onClose: () => void;
  subcategories: SubcategoryRow[];
  regions: RegionRow[];
}) {
  const [state, action, pending] = useActionState(submitResource, null);
  const [catSlug, setCatSlug] = useState("");
  const [scope, setScope] = useState<"national" | "local">("local");

  const filteredSubs = catSlug ? subcategories.filter((s) => s.category_slug === catSlug) : [];
  const parentRegions = regions.filter((r) => r.parent_id === null);
  const childRegions = (pid: string) => regions.filter((r) => r.parent_id === pid);

  return (
    /* backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(36,31,27,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      {/* card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520,
          maxHeight: "90dvh", overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* header */}
        <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#241F1B" }}>分享好資源</h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#574E47" }}>
              把您知道的服務提報給社區，幫到更多居民
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="關閉"
            style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: "50%",
              border: "none", background: "#FAF7F5", cursor: "pointer",
              fontSize: 19, lineHeight: 1, color: "#574E47",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* form */}
        <form action={action} style={{ padding: "18px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 資源名稱 */}
          <MField label="資源名稱" required>
            <input name="name" type="text" required placeholder="例：中壢仁海宮免費量血壓站" style={inp} />
          </MField>

          {/* 分類 + 細項 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <MField label="分類" required>
              <select name="category_slug" required value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)} style={inp}>
                <option value="">選擇分類…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </MField>
            <MField label="細項" required>
              <select name="subcategory_id" required disabled={!catSlug}
                style={{ ...inp, opacity: catSlug ? 1 : 0.5 }}>
                <option value="">先選分類…</option>
                {filteredSubs.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </MField>
          </div>

          {/* 服務範圍 */}
          <MField label="服務範圍" required>
            <div style={{ display: "flex", gap: 10 }}>
              {(["local", "national"] as const).map((v) => (
                <label key={v} style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", padding: "10px 14px", borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  border: `1.5px solid ${scope === v ? "#E0552E" : "#E4D7CC"}`,
                  background: scope === v ? "#FFF4EF" : "#fff",
                  color: scope === v ? "#B23F1E" : "#574E47",
                }}>
                  <input type="radio" name="scope" value={v} checked={scope === v}
                    onChange={() => setScope(v)} style={{ accentColor: "#E0552E" }} />
                  {v === "local" ? "在地服務" : "全國服務"}
                </label>
              ))}
            </div>
          </MField>

          {/* 所在地區 */}
          {scope === "local" && (
            <MField label="所在地區" required>
              <select name="region_id" required={scope === "local"} style={inp}>
                <option value="">選擇地區…</option>
                {parentRegions.map((p) => {
                  const ch = childRegions(p.id);
                  return ch.length > 0 ? (
                    <optgroup key={p.id} label={p.name}>
                      {ch.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </optgroup>
                  ) : <option key={p.id} value={p.id}>{p.name}</option>;
                })}
              </select>
            </MField>
          )}

          {/* 聯絡電話 */}
          <MField label="聯絡電話">
            <input name="phone" type="tel" placeholder="03-422-1166" style={inp} />
          </MField>

          {/* 官方網站 */}
          <MField label="官方網站">
            <input name="website_url" type="url" placeholder="https://..." style={inp} />
          </MField>

          {/* 地址 */}
          <MField label="地址（可只填路名）">
            <input name="address" type="text" placeholder="例：中壢區延平路 198 號" style={inp} />
          </MField>

          {/* 服務介紹 */}
          <MField label="服務介紹">
            <input name="summary" type="text" maxLength={100}
              placeholder="一句話說明這個服務（選填）" style={inp} />
          </MField>

          {/* 補充說明 */}
          <MField label="補充說明（可不填）">
            <textarea name="description" rows={3}
              placeholder="例：每週二、四中午供餐，65 歲以上每餐 10 元，需先報名。"
              style={{ ...inp, resize: "vertical" as const }} />
          </MField>

          {/* 標籤 */}
          <MField label="標籤" hint="以逗號分隔，例：失智、送餐、日照">
            <input name="tags" type="text" placeholder="失智, 送餐, 日照" style={inp} />
          </MField>

          {/* 資料來源 */}
          <MField label="資料來源（推薦必填）">
            <input name="source_org" type="text" placeholder="例：衛生福利部、縣市政府網站" style={inp} />
          </MField>

          {/* error */}
          {state?.error && (
            <div style={{ background: "#FFF4EF", border: "1px solid #FFE7DD", borderRadius: 10, padding: "12px 16px", fontSize: 14.5, color: "#B23F1E" }}>
              {state.error}
            </div>
          )}

          {/* submit */}
          <button
            type="submit" disabled={pending}
            style={{
              height: 50, borderRadius: 999, border: "none", cursor: pending ? "not-allowed" : "pointer",
              background: pending ? "#E4D7CC" : "#E0552E", color: "#fff",
              fontSize: 16, fontWeight: 800, fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <ELIcon name="send" size={17} color="#fff" />
            {pending ? "送出中…" : "送出分享"}
          </button>

          <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: "#9B8E85" }}>
            送出後由社區志工確認，不會公開您的個資。
          </p>
        </form>
      </div>
    </div>
  );
}

/* ── Trigger（按鈕 + 狀態管理） ── */
export function ShareResourceTrigger({
  subcategories,
  regions,
  buttonLabel = "+ 分享好資源",
  buttonStyle,
}: {
  subcategories: SubcategoryRow[];
  regions: RegionRow[];
  buttonLabel?: string;
  buttonStyle?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          height: 46, padding: "0 20px", borderRadius: 999,
          border: "1.5px solid #E4D7CC", background: "#fff",
          color: "#574E47", fontSize: 15, fontWeight: 800,
          display: "inline-flex", alignItems: "center", gap: 7,
          cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          fontFamily: "inherit",
          ...buttonStyle,
        }}
      >
        {buttonLabel}
      </button>
      {open && (
        <ShareResourceModal
          onClose={() => setOpen(false)}
          subcategories={subcategories}
          regions={regions}
        />
      )}
    </>
  );
}

/* ── helpers ── */
const inp: React.CSSProperties = {
  width: "100%", borderRadius: 10, border: "1.5px solid #E4D7CC",
  padding: "10px 13px", fontSize: 15, color: "#241F1B", background: "#fff",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

function MField({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 14, fontWeight: 700, color: "#241F1B" }}>
        {label}
        {required && <span style={{ color: "#E0552E", marginLeft: 3 }}>*</span>}
      </label>
      {hint && <p style={{ margin: 0, fontSize: 12.5, color: "#9B8E85" }}>{hint}</p>}
      {children}
    </div>
  );
}
