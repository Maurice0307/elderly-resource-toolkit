"use client";

import { useState } from "react";
import { ELIcon } from "@/components/layout/ELIcon";

type RegionRow = { id: string; name: string; parent_id: string | null };

// 縣市由北到南（涵蓋 台/臺）
const NORTH_TO_SOUTH = [
  "基隆市", "臺北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣",
  "臺中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "臺南市",
  "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣",
];
function countyOrder(name: string): number {
  const i = NORTH_TO_SOUTH.indexOf(name.replace(/台/g, "臺"));
  return i < 0 ? 999 : i;
}

const fieldStyle: React.CSSProperties = {
  width: "100%", border: "2px solid var(--border-strong)", borderRadius: 13,
  padding: "12px 14px", fontSize: "1rem", color: "var(--text-primary)",
  background: "#fff", outline: "none", boxSizing: "border-box",
};

export function RegionMultiSelect({ regions }: { regions: RegionRow[] }) {
  const counties = regions
    .filter((r) => r.parent_id === null)
    .slice()
    .sort((a, b) => countyOrder(a.name) - countyOrder(b.name));
  const districtsOf = (cid: string) => regions.filter((r) => r.parent_id === cid);
  const nameOf = (id: string) => regions.find((r) => r.id === id)?.name ?? "";

  const [activeCounty, setActiveCounty] = useState("");
  const [selected, setSelected] = useState<string[]>([]); // 縣市 id = 全縣市；行政區 id = 指定行政區

  const has = (id: string) => selected.includes(id);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const remove = (id: string) => setSelected((s) => s.filter((x) => x !== id));

  const labelOf = (id: string) => {
    const r = regions.find((x) => x.id === id);
    if (!r) return "";
    if (r.parent_id === null) return `${r.name}（全縣市）`;
    const p = regions.find((x) => x.id === r.parent_id);
    return `${p?.name ?? ""} ${r.name}`;
  };

  const activeDistricts = activeCounty ? districtsOf(activeCounty) : [];

  return (
    <div>
      {/* 已選地區 chips */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {selected.map((id) => (
            <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px 6px 12px", borderRadius: 999, background: "#FFF4EF", border: "1.5px solid #F2B79E", color: "#B23F1E", fontSize: 14, fontWeight: 700 }}>
              <ELIcon name="pin" size={14} color="#E0552E" /> {labelOf(id)}
              <button type="button" onClick={() => remove(id)} aria-label="移除" style={{ width: 20, height: 20, borderRadius: 999, border: "none", background: "rgba(224,85,46,0.15)", color: "#B23F1E", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", padding: 0 }}>
                <ELIcon name="close" size={12} color="#B23F1E" stroke={2.4} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 縣市選單（由北到南） */}
      <select value={activeCounty} onChange={(e) => setActiveCounty(e.target.value)} style={fieldStyle} aria-label="選擇縣市">
        <option value="">＋ 選擇縣市…</option>
        {counties.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* 選了縣市 → 全縣市 + 行政區（多選；行政區可不選） */}
      {activeCounty && (
        <div style={{ marginTop: 10, padding: "12px 13px", borderRadius: 13, background: "var(--bg-soft)", border: "1px solid var(--border)" }}>
          <p style={{ margin: "0 0 9px", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            選「全縣市」涵蓋整個縣市；或勾選一個以上的行政區（可不選行政區）。
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Chip on={has(activeCounty)} onClick={() => toggle(activeCounty)}>
              整個{nameOf(activeCounty)}（全縣市）
            </Chip>
            {activeDistricts.map((d) => (
              <Chip key={d.id} on={has(d.id)} onClick={() => toggle(d.id)}>
                {d.name}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* 送出用：每個已選地區一個 hidden input */}
      {selected.map((id) => (
        <input key={id} type="hidden" name="region_ids" value={id} />
      ))}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 999,
        fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        background: on ? "#E0552E" : "#fff",
        color: on ? "#fff" : "#574E47",
        border: `1.5px solid ${on ? "#E0552E" : "var(--border-strong)"}`,
      }}
    >
      {on && <ELIcon name="check" size={14} color="#fff" stroke={2.6} />}
      {children}
    </button>
  );
}
