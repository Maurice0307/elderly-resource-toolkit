"use client";

import { useActionState, useState } from "react";
import { submitResource } from "@/lib/resources/submitAction";
import { categories } from "@/config/categories";
import { ELIcon } from "@/components/layout/ELIcon";

type SubcategoryRow = { id: string; slug: string; name: string; category_slug: string };
type RegionRow      = { id: string; name: string; parent_id: string | null };

// 縣市由北到南排序（涵蓋 台/臺 兩種寫法）
const NORTH_TO_SOUTH = [
  "基隆市", "臺北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣",
  "臺中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "臺南市",
  "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣",
];
function countyOrder(name: string): number {
  const i = NORTH_TO_SOUTH.indexOf(name.replace(/台/g, "臺"));
  return i < 0 ? 999 : i;
}

type Props = {
  subcategories: SubcategoryRow[];
  regions: RegionRow[];
};

export function SubmitForm({ subcategories, regions }: Props) {
  const [state, action, pending] = useActionState(submitResource, null);
  const [catSlug, setCatSlug]    = useState("");
  const [scope, setScope]        = useState<"national" | "local">("local");

  const filteredSubs = catSlug
    ? subcategories.filter((s) => s.category_slug === catSlug)
    : [];

  const parentRegions = regions
    .filter((r) => r.parent_id === null)
    .slice()
    .sort((a, b) => countyOrder(a.name) - countyOrder(b.name));
  const childRegions  = (parentId: string) =>
    regions.filter((r) => r.parent_id === parentId);

  return (
    <form action={action} className="mt-6 space-y-5">

      {/* 機構名稱 */}
      <Field label="機構 / 服務名稱" required>
        <input
          name="name"
          type="text"
          required
          placeholder="例：桃園市長青日間服務中心"
          className={inputClass}
          style={inputStyle}
        />
      </Field>

      {/* 類別 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="服務大類" required>
          <select
            name="category_slug"
            required
            value={catSlug}
            onChange={(e) => setCatSlug(e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">請選擇…</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="服務細項" required>
          <select
            name="subcategory_id"
            required
            disabled={!catSlug}
            className={inputClass}
            style={{ ...inputStyle, opacity: catSlug ? 1 : 0.5 }}
          >
            <option value="">請先選擇大類…</option>
            {filteredSubs.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* 服務範圍 */}
      <Field label="服務範圍" required>
        <div className="flex gap-4">
          {(["local", "national"] as const).map((v) => (
            <label
              key={v}
              className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition"
              style={
                scope === v
                  ? { background: "var(--bg-accent)", border: "2px solid #FDE68A", color: "#92400E", fontWeight: 600, fontSize: "1rem", minHeight: 48 }
                  : { background: "var(--bg-soft)", border: "2px solid transparent", color: "var(--text-secondary)", fontSize: "1rem", minHeight: 48 }
              }
            >
              <input
                type="radio"
                name="scope"
                value={v}
                checked={scope === v}
                onChange={() => setScope(v)}
                className="accent-amber-700"
              />
              {v === "local" ? "在地服務" : "全國服務"}
            </label>
          ))}
        </div>
      </Field>

      {/* 地區（在地時顯示） */}
      {scope === "local" && (
        <Field label="所在地區" required>
          <select
            name="region_id"
            required={scope === "local"}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">請選擇地區…</option>
            {parentRegions.map((p) => {
              const children = childRegions(p.id);
              return children.length > 0 ? (
                <optgroup key={p.id} label={p.name}>
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              ) : (
                <option key={p.id} value={p.id}>{p.name}</option>
              );
            })}
          </select>
        </Field>
      )}

      {/* 一句話說明 */}
      <Field label="服務簡介">
        <input
          name="summary"
          type="text"
          maxLength={100}
          placeholder="一句話說明這個服務的主要功能（選填）"
          className={inputClass}
          style={inputStyle}
        />
      </Field>

      {/* 詳細說明 */}
      <Field label="詳細說明">
        <textarea
          name="description"
          rows={4}
          placeholder="服務內容、申請資格、注意事項…（選填）"
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
      </Field>

      {/* 聯絡資訊 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="電話">
          <input name="phone" type="tel" placeholder="02-1234-5678" className={inputClass} style={inputStyle} />
        </Field>
        <Field label="官方網站">
          <input name="website_url" type="url" placeholder="https://..." className={inputClass} style={inputStyle} />
        </Field>
      </div>

      <Field label="地址">
        <input name="address" type="text" placeholder="縣市 + 完整地址（選填）" className={inputClass} style={inputStyle} />
      </Field>

      {/* 標籤 */}
      <Field label="標籤" hint="以逗號或空格分隔，例：失智、送餐、日照">
        <input name="tags" type="text" placeholder="失智, 送餐, 日照" className={inputClass} style={inputStyle} />
      </Field>

      {/* 資料來源 */}
      <Field label="資料來源（機構名稱）">
        <input name="source_org" type="text" placeholder="例：衛生福利部、縣市政府網站" className={inputClass} style={inputStyle} />
      </Field>

      {/* 錯誤訊息 */}
      {state?.error && (
        <div
          className="rounded-xl"
          style={{ background: "var(--alert-soft)", color: "var(--alert)", padding: "12px 14px", fontSize: "0.9375rem", fontWeight: 600 }}
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full font-bold transition disabled:opacity-60"
        style={{ background: "var(--cta)", color: "var(--cta-on)", border: "none", borderRadius: 14, padding: "14px", fontSize: "1.0625rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 52 }}
      >
        <ELIcon name="send" size={19} color="#fff" /> {pending ? "送出中…" : "送出投稿"}
      </button>

      <p className="text-center" style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
        投稿後會由志工審核，通過後才會公開顯示
      </p>
    </form>
  );
}

/* helpers — 對齊「我要提問」表單的格子與字級 */
const inputClass = "w-full outline-none";
const inputStyle = {
  border: "2px solid var(--border-strong)",
  borderRadius: 13,
  padding: "12px 14px",
  fontSize: "1rem",
  background: "#fff",
  color: "var(--text-primary)",
  boxSizing: "border-box" as const,
};

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: hint ? 4 : 8 }}>
        {label}
        {required && <span className="ml-1" style={{ color: "var(--cta)" }}>＊</span>}
      </label>
      {hint && <p style={{ margin: "0 0 8px", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{hint}</p>}
      {children}
    </div>
  );
}
