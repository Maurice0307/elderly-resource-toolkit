"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";

type Category = {
  slug: string;
  name: string;
  icon: string;
  subcategories: readonly { slug: string; name: string }[];
};

type ResourceItem = {
  id: string;
  name: string;
  summary?: string | null;
  phone?: string | null;
  address?: string | null;
  scope?: string | null;
  tags?: string[] | null;
  like_count?: number | null;
};

type SortKey = "recommend" | "local" | "popular" | "name";

const CAT_ICON_MAP: Record<string, string> = {
  health: "health", transport: "transport", housing: "housing",
  finance: "finance", subsidy: "coin", social: "social",
  leisure: "leisure", education: "education",
};

/* ─── Taoyuan districts ─── */
const TAOYUAN_DISTRICTS = [
  { label: "全台灣",   code: "" },
  { label: "桃園市",   code: "TW-TYC" },
  { label: "桃園區",   code: "TW-TYC-TY" },
  { label: "中壢區",   code: "TW-TYC-ZL" },
  { label: "八德區",   code: "TW-TYC-BD" },
  { label: "大溪區",   code: "TW-TYC-DX" },
  { label: "蘆竹區",   code: "TW-TYC-LZ" },
  { label: "龜山區",   code: "TW-TYC-GS" },
  { label: "平鎮區",   code: "TW-TYC-PZ" },
  { label: "楊梅區",   code: "TW-TYC-YM" },
  { label: "龍潭區",   code: "TW-TYC-LT" },
  { label: "大園區",   code: "TW-TYC-DY" },
  { label: "復興區",   code: "TW-TYC-FX" },
  { label: "新屋區",   code: "TW-TYC-XW" },
  { label: "觀音區",   code: "TW-TYC-GY" },
];

/* Nominatim district → code */
const DISTRICT_CODE: Record<string, string> = {
  "桃園區": "TW-TYC-TY", "中壢區": "TW-TYC-ZL", "八德區": "TW-TYC-BD",
  "大溪區": "TW-TYC-DX", "蘆竹區": "TW-TYC-LZ", "龜山區": "TW-TYC-GS",
  "平鎮區": "TW-TYC-PZ", "楊梅區": "TW-TYC-YM", "龍潭區": "TW-TYC-LT",
  "大園區": "TW-TYC-DY", "復興區": "TW-TYC-FX", "新屋區": "TW-TYC-XW",
  "觀音區": "TW-TYC-GY",
};

/* parent county of a district code */
function parentCode(code: string): string {
  if (code.startsWith("TW-TYC-")) return "TW-TYC";
  return "";
}

function ScopeTag({ scope }: { scope?: string | null }) {
  const local = scope === "local";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 800,
      padding: "3px 10px", borderRadius: 999,
      background: local ? "#FFF4EF" : "#EDF2FF",
      color: local ? "#B23F1E" : "#2952B3",
    }}>
      <ELIcon name={local ? "pin" : "shield"} size={12} color={local ? "#F26B43" : "#2952B3"} />
      {local ? "在地服務" : "全國專線"}
    </span>
  );
}

function ResourceCard({ res, catSlug }: { res: ResourceItem; catSlug: string }) {
  return (
    <Link
      href={`/resources/${catSlug}/${res.id}`}
      className="wv-card click"
      style={{
        display: "block", background: "#fff", borderRadius: 18,
        border: "1px solid #F0E6DE", padding: "20px 22px", textDecoration: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <span style={{
          width: 50, height: 50, borderRadius: 14, background: "#FFF4EF", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ELIcon name={res.scope === "local" ? "pin" : "phone"} size={25} color="#F26B43" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <ScopeTag scope={res.scope} />
            <span style={{ fontSize: 12.5, color: "#9B8E85" }}>已驗證</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{res.name}</div>
          {res.summary && (
            <p style={{
              margin: "8px 0 0", fontSize: 15.5, color: "#574E47", lineHeight: 1.65,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {res.summary}
            </p>
          )}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {res.phone && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 17, fontWeight: 800, color: "#B23F1E" }}>
                <ELIcon name="phone" size={18} color="#F26B43" /> {res.phone}
              </span>
            )}
            {res.like_count != null && res.like_count > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13.5, fontWeight: 700, color: "#9B8E85" }}>
                <ELIcon name="like" size={14} color="#F26B43" /> {res.like_count}
              </span>
            )}
            <span style={{ marginLeft: "auto", fontSize: 14.5, fontWeight: 700, color: "#B23F1E" }}>查看詳情 →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ResourcesClient({
  categories,
  initialCat,
}: {
  categories: readonly Category[];
  initialCat?: string | null;
}) {
  const [activeCat, setActiveCat]     = useState(initialCat ?? categories[0]?.slug ?? "health");
  const [activeSub, setActiveSub]     = useState("全部");
  const [sortKey,   setSortKey]       = useState<SortKey>("recommend");
  const [q,         setQ]             = useState("");
  const [resources, setResources]     = useState<ResourceItem[]>([]);
  const [loading,   setLoading]       = useState(false);
  const [localMode, setLocalMode]     = useState(false);

  /* ── region state ── */
  const [regionLabel, setRegionLabel] = useState<string>("");
  const [regionCode,  setRegionCode]  = useState<string>("");
  const [autoGeo,     setAutoGeo]     = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  /* load saved region or attempt geolocation */
  useEffect(() => {
    const savedLabel = localStorage.getItem("el_region_label") ?? "";
    const savedCode  = localStorage.getItem("el_region_code") ?? "";
    if (savedLabel && savedCode) {
      setRegionLabel(savedLabel);
      setRegionCode(savedCode);
      return;
    }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=zh-TW`,
            { headers: { "User-Agent": "ElderLink/1.0 (itchiang2025@gmail.com)" } }
          );
          const j = await res.json();
          const district = j.address?.suburb ?? j.address?.city_district ?? j.address?.town ?? "";
          const city     = j.address?.city ?? j.address?.state ?? "";
          const code     = DISTRICT_CODE[district] ?? (city.includes("桃園") ? "TW-TYC" : "");
          const label    = code ? (DISTRICT_CODE[district] ? district : "桃園市") : "全台灣";
          setRegionLabel(label); setRegionCode(code); setAutoGeo(true);
          localStorage.setItem("el_region_label", label);
          localStorage.setItem("el_region_code", code);
        } catch { /* silent */ }
      },
      () => {
        setRegionLabel("桃園市"); setRegionCode("TW-TYC");
        localStorage.setItem("el_region_label", "桃園市");
        localStorage.setItem("el_region_code", "TW-TYC");
      }
    );
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* determine API regionCode: if localMode → specific district; else county */
  function apiRegionCode(): string {
    if (!regionCode) return "";
    if (localMode) return regionCode;
    return parentCode(regionCode) || regionCode;
  }

  const cat  = categories.find((c) => c.slug === activeCat);
  const subs = cat ? ["全部", ...cat.subcategories.map((s) => s.name)] : ["全部"];

  /* fetch when category or localMode changes */
  useEffect(() => {
    setLoading(true);
    setActiveSub("全部");
    setQ("");
    const rc = apiRegionCode();
    const url = `/api/resources?category=${activeCat}${rc ? `&regionCode=${encodeURIComponent(rc)}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setResources(data ?? []); setLoading(false); })
      .catch(() => { setResources([]); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat, localMode, regionCode]);

  const filtered = resources
    .filter((r) => {
      if (q.trim()) {
        const hay = [r.name, r.summary, ...(r.tags ?? [])].join(" ").toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (activeSub !== "全部") {
        const subEntry = cat?.subcategories.find((s) => s.name === activeSub);
        const haystack = [r.name, r.summary, ...(r.tags ?? [])].join(" ");
        if (subEntry && !haystack.includes(activeSub) && !haystack.includes(subEntry.slug)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "popular") return (b.like_count ?? 0) - (a.like_count ?? 0);
      if (sortKey === "local")   return a.scope === "local" ? -1 : b.scope === "local" ? 1 : 0;
      if (sortKey === "name")    return a.name.localeCompare(b.name, "zh-TW");
      return 0;
    });

  function handleCatChange(slug: string) {
    setActiveCat(slug); setSortKey("recommend");
  }

  function pickRegion(label: string, code: string) {
    setRegionLabel(label); setRegionCode(code); setAutoGeo(false); setDropOpen(false); setLocalMode(false);
    localStorage.setItem("el_region_label", label);
    localStorage.setItem("el_region_code", code);
  }

  /* local button label */
  const localBtnLabel = regionLabel && regionCode ? regionLabel : "本地區";

  return (
    <div>
      <div className="wv-wrap" style={{ paddingTop: 26, paddingBottom: 56, display: "grid", gridTemplateColumns: "236px minmax(0,1fr)", gap: 30, alignItems: "start" }}>
        {/* 側欄 */}
        <aside className="wv-hideSm" style={{ position: "sticky", top: 96 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#9B8E85", letterSpacing: 1, margin: "4px 0 10px" }}>分類</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {categories.map((c) => {
              const on = activeCat === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => handleCatChange(c.slug)}
                  style={{
                    display: "flex", alignItems: "center", gap: 11, padding: "11px 13px",
                    borderRadius: 12, border: "none", cursor: "pointer", font: "inherit",
                    fontSize: 16, fontWeight: 700, textAlign: "left",
                    background: on ? "#FFE7DD" : "transparent",
                    color: on ? "#B23F1E" : "#574E47",
                  }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "#FAF7F5"; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}
                >
                  <ELIcon name={CAT_ICON_MAP[c.slug] || "search"} size={20} color={on ? "#F26B43" : "#9B8E85"} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </aside>

        {/* 結果區 */}
        <div>
          {/* 搜尋框 + 地區選擇 */}
          <div style={{ display: "flex", background: "#fff", borderRadius: 999, padding: "6px 6px 6px 0", boxShadow: "0 10px 26px rgba(120,60,30,0.10)", marginBottom: 18, alignItems: "center" }}>
            {/* Region dropdown */}
            <div ref={dropRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                style={{
                  height: 44, borderRadius: 999, border: "none", background: "#FFF4EF",
                  padding: "0 14px 0 14px", display: "flex", alignItems: "center", gap: 6,
                  cursor: "pointer", font: "inherit", fontSize: 14.5, fontWeight: 800,
                  color: "#B23F1E", whiteSpace: "nowrap", marginLeft: 6,
                }}
              >
                <ELIcon name="pin" size={15} color="#F26B43" />
                {regionLabel || "全台灣"}
                <ELIcon name="chevron" size={13} color="#9B8E85" style={{ transform: "rotate(90deg)" }} />
              </button>
              {autoGeo && (
                <span style={{ position: "absolute", bottom: -16, left: 14, fontSize: 11, color: "#9B8E85", whiteSpace: "nowrap" }}>(已自動定位)</span>
              )}
              {dropOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#fff",
                  borderRadius: 16, border: "1px solid #F0E6DE", boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
                  padding: 8, zIndex: 200, minWidth: 150, maxHeight: 320, overflowY: "auto",
                }}>
                  {TAOYUAN_DISTRICTS.map((d) => (
                    <button
                      key={d.code}
                      onClick={() => pickRegion(d.label, d.code)}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "9px 12px", border: "none", borderRadius: 10, cursor: "pointer",
                        font: "inherit", fontSize: 15, fontWeight: 700,
                        background: regionCode === d.code ? "#FFF4EF" : "transparent",
                        color: regionCode === d.code ? "#B23F1E" : "#574E47",
                      }}
                    >
                      {d.code === "" ? "🗺" : "📍"} {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* divider */}
            <div style={{ width: 1, background: "#F0E6DE", height: 28, marginLeft: 10, flexShrink: 0 }} />

            {/* Search input */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 11, paddingLeft: 14 }}>
              <ELIcon name="search" size={22} color="#F26B43" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`搜尋${cat?.name ?? "資源"}…`}
                style={{ flex: 1, border: "none", outline: "none", fontFamily: "inherit", fontSize: 17, fontWeight: 600, color: "#241F1B", background: "transparent", minWidth: 0 }}
              />
              {q && (
                <button onClick={() => setQ("")} style={{ border: "none", background: "#FAF7F5", width: 32, height: 32, borderRadius: 999, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 4 }}>
                  <ELIcon name="close" size={16} color="#9B8E85" />
                </button>
              )}
            </div>
          </div>

          {/* 細分類 chips */}
          {subs.length > 1 && (
            <div className="wv-subwrap" style={{ marginBottom: 16 }}>
              {subs.map((s) => {
                const on = activeSub === s;
                return (
                  <button
                    key={s}
                    onClick={() => setActiveSub(s)}
                    style={{
                      padding: "9px 16px", borderRadius: 999, cursor: "pointer", font: "inherit",
                      fontSize: 15, fontWeight: 700, whiteSpace: "nowrap",
                      border: `1.5px solid ${on ? "#E0552E" : "#E4D7CC"}`,
                      background: on ? "#E0552E" : "#fff",
                      color: on ? "#fff" : "#574E47",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          )}

          {/* 標題列 + 排序 + 本地區 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#241F1B", marginRight: "auto" }}>
              {cat?.name ?? "資源"}
              <span style={{ marginLeft: 10, fontSize: 15, fontWeight: 700, color: "#9B8E85" }}>{filtered.length} 筆</span>
            </div>

            {/* 本地區 toggle */}
            {regionCode && (
              <button
                onClick={() => setLocalMode(!localMode)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 999, cursor: "pointer", font: "inherit",
                  fontSize: 14, fontWeight: 700, border: "1.5px solid",
                  borderColor: localMode ? "#E0552E" : "#E4D7CC",
                  background: localMode ? "#FFF4EF" : "#fff",
                  color: localMode ? "#B23F1E" : "#574E47",
                }}
              >
                <ELIcon name="pin" size={14} color={localMode ? "#F26B43" : "#9B8E85"} />
                {localBtnLabel}
              </button>
            )}

            {/* 排序下拉 */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ELIcon name="filter" size={15} color="#9B8E85" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                style={{
                  border: "1.5px solid #E4D7CC", borderRadius: 10, padding: "7px 11px",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#574E47",
                  background: "#fff", cursor: "pointer", outline: "none",
                }}
              >
                <option value="recommend">綜合推薦</option>
                <option value="local">在地優先</option>
                <option value="popular">最多人推薦</option>
                <option value="name">名稱排序</option>
              </select>
            </div>
          </div>

          {/* 資源卡片列表 */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9B8E85" }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>載入中⋯</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 18, border: "1px dashed #E4D7CC", padding: 48, textAlign: "center" }}>
              <ELIcon name="search" size={40} color="#E4D7CC" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#574E47" }}>
                {q ? <>找不到「{q}」的資源</> : "這個分類目前暫無資料"}
              </div>
              <div style={{ marginTop: 6, fontSize: 15, color: "#9B8E85" }}>換個關鍵字，或從左側選擇其他分類。</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map((r) => <ResourceCard key={r.id} res={r} catSlug={activeCat} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
