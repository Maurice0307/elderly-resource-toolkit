"use client";
import { useState } from "react";

type Subcategory = { id: string; name: string };
type Category = { id: string; name: string; slug: string; subcategories: Subcategory[] };
type County = { id: string; name: string; code: string };
type District = { id: string; name: string; code: string; parent_id: string };

type InitialValues = {
  subcategory_id?: string | null;
  scope?: string | null;
  region_id?: string | null;
  name?: string | null;
  summary?: string | null;
  description?: string | null;
  phone?: string | null;
  phone_hint?: string | null;
  address?: string | null;
  website_url?: string | null;
  identity_tags?: string[] | null;
  tags?: string[] | null;
  source_org?: string | null;
  status?: string | null;
};

const IDENTITY_TAG_OPTIONS = [
  { value: "elder", label: "長者" },
  { value: "family", label: "家屬" },
  { value: "volunteer", label: "志工" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "已上架" },
  { value: "pending", label: "待審核" },
  { value: "ended", label: "已結束" },
  { value: "archived", label: "已封存" },
];

const inputCls =
  "w-full rounded-xl border px-4 py-2.5 text-base focus:outline-none focus:ring-2";
const inputStyle = {
  background: "var(--bg-elevated)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-6 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
      {children}
    </h3>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

export function ResourceFormClient({
  categories,
  counties,
  districts,
  initialValues,
  action,
  submitLabel,
}: {
  categories: Category[];
  counties: County[];
  districts: District[];
  initialValues?: InitialValues;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const iv = initialValues ?? {};
  const [scope, setScope] = useState<string>(iv.scope ?? "local");

  // Determine initial county / district from region_id
  const initDistrict = districts.find((d) => d.id === iv.region_id);
  const initCountyId = initDistrict
    ? initDistrict.parent_id
    : (counties.find((c) => c.id === iv.region_id) ? (iv.region_id ?? "") : "");

  const [countyId, setCountyId] = useState<string>(initCountyId ?? "");
  // regionId is what gets submitted — either a county ID or a district ID
  const [regionId, setRegionId] = useState<string>(iv.region_id ?? "");

  const countyDistricts = districts.filter((d) => d.parent_id === countyId);

  function handleCountyChange(newCountyId: string) {
    setCountyId(newCountyId);
    setRegionId(newCountyId); // default to county-level; user may narrow to district
  }

  function handleDistrictChange(newDistrictId: string) {
    // Empty string means "county-wide" → fall back to county ID
    setRegionId(newDistrictId || countyId);
  }

  // Display helper: get region label for current selection
  const selectedDistrict = districts.find((d) => d.id === regionId);
  const selectedCounty = counties.find((c) => c.id === countyId);

  return (
    <form action={action} className="space-y-1">
      {/* hidden: actual region_id to submit */}
      <input type="hidden" name="region_id" value={scope === "local" ? regionId : ""} />

      {/* ── 分類設定 ─────────────────────────────────── */}
      <SectionTitle>分類設定</SectionTitle>

      <div>
        <Label required>子分類</Label>
        <select
          name="subcategory_id"
          required
          defaultValue={iv.subcategory_id ?? ""}
          className={inputCls}
          style={inputStyle}
        >
          <option value="" disabled>請選擇子分類</option>
          {categories.map((cat) => (
            <optgroup key={cat.id} label={cat.name}>
              {cat.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="mt-3">
        <Label required>服務範圍</Label>
        <div className="flex gap-6">
          {[
            { value: "national", label: "全國" },
            { value: "local",    label: "在地" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 text-base"
              style={{ color: "var(--text-primary)" }}
            >
              <input
                type="radio"
                name="scope"
                value={opt.value}
                checked={scope === opt.value}
                onChange={() => setScope(opt.value)}
                className="h-4 w-4"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {scope === "local" && (
        <div className="mt-3 space-y-3">
          {/* 第一層：縣市 */}
          <div>
            <Label required>縣市</Label>
            <select
              value={countyId}
              onChange={(e) => handleCountyChange(e.target.value)}
              required
              className={inputCls}
              style={inputStyle}
            >
              <option value="" disabled>請選擇縣市</option>
              {counties.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 第二層：行政區（縣市選定後才顯示） */}
          {countyId && countyDistricts.length > 0 && (
            <div>
              <Label>行政區（選填，不選表示整個縣市通用）</Label>
              <select
                value={selectedDistrict?.id ?? ""}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">— 整個{selectedCounty?.name ?? "縣市"}通用 —</option>
                {countyDistricts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* 目前選擇的範圍提示 */}
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                {selectedDistrict
                  ? `✅ 此資源只對「${selectedCounty?.name} ${selectedDistrict.name}」的使用者顯示`
                  : `✅ 此資源對「${selectedCounty?.name}」所有行政區的使用者顯示`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 基本資訊 ─────────────────────────────────── */}
      <SectionTitle>基本資訊</SectionTitle>

      <div>
        <Label required>資源名稱</Label>
        <input
          type="text"
          name="name"
          required
          defaultValue={iv.name ?? ""}
          placeholder="例：1966 長照服務專線"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      <div className="mt-3">
        <Label>摘要（建議 60 字以內）</Label>
        <textarea
          name="summary"
          rows={2}
          defaultValue={iv.summary ?? ""}
          placeholder="一句話說明這個資源的用途"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      <div className="mt-3">
        <Label>詳細說明</Label>
        <textarea
          name="description"
          rows={4}
          defaultValue={iv.description ?? ""}
          placeholder="可補充申請流程、注意事項、服務時間等"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* ── 聯絡資訊 ─────────────────────────────────── */}
      <SectionTitle>聯絡資訊</SectionTitle>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>電話</Label>
          <input
            type="text"
            name="phone"
            defaultValue={iv.phone ?? ""}
            placeholder="例：1966 或 (02)1234-5678"
            className={inputCls}
            style={inputStyle}
          />
        </div>
        <div>
          <Label>地址</Label>
          <input
            type="text"
            name="address"
            defaultValue={iv.address ?? ""}
            placeholder="例：台北市信義區市府路1號"
            className={inputCls}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="mt-3">
        <Label>電話提示語（💬 您可以這樣說）</Label>
        <textarea
          name="phone_hint"
          rows={2}
          defaultValue={iv.phone_hint ?? ""}
          placeholder='可說：「我家長輩需要…，請問可以申請嗎？」'
          className={inputCls}
          style={inputStyle}
        />
      </div>

      <div className="mt-3">
        <Label>網站連結</Label>
        <input
          type="url"
          name="website_url"
          defaultValue={iv.website_url ?? ""}
          placeholder="https://..."
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* ── 標籤 ─────────────────────────────────────── */}
      <SectionTitle>標籤</SectionTitle>

      <div>
        <Label>適用對象</Label>
        <div className="flex flex-wrap gap-4">
          {IDENTITY_TAG_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 text-base"
              style={{ color: "var(--text-primary)" }}
            >
              <input
                type="checkbox"
                name="identity_tags"
                value={opt.value}
                defaultChecked={(iv.identity_tags ?? []).includes(opt.value)}
                className="h-4 w-4"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <Label>關鍵字標籤（逗號分隔）</Label>
        <input
          type="text"
          name="tags"
          defaultValue={(iv.tags ?? []).join(", ")}
          placeholder="例：救護車, 非緊急, 就醫接送"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      <div className="mt-3">
        <Label>資料來源機構</Label>
        <input
          type="text"
          name="source_org"
          defaultValue={iv.source_org ?? ""}
          placeholder="例：衛生福利部、台北市政府"
          className={inputCls}
          style={inputStyle}
        />
      </div>

      {/* ── 狀態 ─────────────────────────────────────── */}
      <SectionTitle>發布狀態</SectionTitle>

      <div>
        <Label required>狀態</Label>
        <select
          name="status"
          required
          defaultValue={iv.status ?? "active"}
          className={inputCls}
          style={inputStyle}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── 送出 ─────────────────────────────────────── */}
      <div className="mt-8 flex gap-3">
        <button
          type="submit"
          className="rounded-xl px-8 py-3 text-lg font-bold transition"
          style={{ background: "var(--cta)", color: "var(--cta-on)" }}
        >
          {submitLabel}
        </button>
        <a
          href="/admin/resources"
          className="rounded-xl px-6 py-3 text-lg font-semibold transition"
          style={{ background: "var(--bg-soft)", color: "var(--text-secondary)" }}
        >
          取消
        </a>
      </div>
    </form>
  );
}
