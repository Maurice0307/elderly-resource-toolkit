"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  bookmark_count?: number | null;
  subcat_name?: string | null;
  subcat_names?: string[] | null;
  source_org?: string | null;
};

type Subcat = { id: string; name: string };

/* 綜合排序評分：越官方／政府／大型機構越前面 */
function officialScore(r: ResourceItem): number {
  let s = 0;
  const src = r.source_org ?? "";
  if (r.scope === "national") s += 100; // 全國官方專線最權威
  if (/政府|衛生福利|衛福|健保|國民健康|疾病管制|疾管|勞動|教育部|公路|警政|國稅|社會局|衛生局|社會及家庭|中央|部$|署$|委員會/.test(src)) s += 60;
  else if (src) s += 25; // 有標明來源（多為官方或可靠機構）
  if (/醫學中心|醫院|總院|榮民總|大學/.test(r.name)) s += 30; // 大型醫療／機構
  if (/基金會|協會|聯盟|公會/.test(r.name + src)) s += 10;
  s += Math.min(r.like_count ?? 0, 50); // 微幅納入人氣
  return s;
}

type SortKey = "recommend" | "local" | "popular" | "name";

const CAT_ICON_MAP: Record<string, string> = {
  health: "health", transport: "transport", housing: "housing",
  finance: "finance", subsidy: "coin", social: "social",
  leisure: "leisure", education: "education",
};

/* Nominatim district → code */
const DISTRICT_CODE: Record<string, string> = {
  "桃園區": "TW-TYC-TY", "中壢區": "TW-TYC-ZL", "八德區": "TW-TYC-BD",
  "大溪區": "TW-TYC-DX", "蘆竹區": "TW-TYC-LZ", "龜山區": "TW-TYC-GS",
  "平鎮區": "TW-TYC-PZ", "楊梅區": "TW-TYC-YM", "龍潭區": "TW-TYC-LT",
  "大園區": "TW-TYC-DY", "復興區": "TW-TYC-FX", "新屋區": "TW-TYC-XW",
  "觀音區": "TW-TYC-GY",
};


/* 台灣地址 → 縣市名（取開頭三字 + 縣/市） */
function countyOf(address?: string | null): string | null {
  if (!address) return null;
  const m = address.match(/^\s*(.{2}[縣市])/);
  return m ? m[1] : null;
}

/* 地區徽章（對齊設計稿 LocBadge：在地＝藍色 + 縣市名） */
function LocBadge({ scope, address }: { scope?: string | null; address?: string | null }) {
  const national = scope === "national";
  const label = national ? "全國" : (countyOf(address) || "在地");
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0,
      fontSize: 13, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
      background: national ? "#FFE7DD" : "#EAF1FB",
      color: national ? "#B23F1E" : "#2A63C0",
    }}>
      {label}
    </span>
  );
}

/* 撥打電話按鈕（對齊設計稿 CallButton：大字、明顯、最小點擊區 48） */
function CallButton({ phone }: { phone: string }) {
  const tel = "tel:" + String(phone).replace(/[^0-9+]/g, "");
  return (
    <a href={tel} onClick={(e) => e.stopPropagation()} style={{
      textDecoration: "none", display: "flex", alignItems: "center", gap: 10, minHeight: 48, width: "100%",
      padding: "0 16px", borderRadius: 12, border: "1.5px solid #F26B43", background: "#FFF4EF",
    }}>
      <ELIcon name="phone" size={22} color="#B23F1E" />
      <span style={{ fontSize: 18, fontWeight: 800, color: "#B23F1E", letterSpacing: 0.5, fontVariantNumeric: "tabular-nums" }}>{phone}</span>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 800, color: "#B23F1E" }}>撥打 ›</span>
    </a>
  );
}

/* scope 篩選 chip（對齊設計稿 Chip） */
function ScopeChip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
      padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, font: "inherit", cursor: "pointer",
      background: active ? "#E0552E" : "#fff", color: active ? "#fff" : "#574E47",
      border: "1.5px solid " + (active ? "#E0552E" : "#E4D7CC"),
    }}>{children}</button>
  );
}

/* 資源卡（完全對齊設計稿 ResourceCard：左側珊瑚色邊 + 撥打鈕 + 標籤） */
function ResourceCard({ res, catSlug }: { res: ResourceItem; catSlug: string }) {
  const router = useRouter();
  const url = `/resources/${catSlug}/${res.id}`;
  const go = () => router.push(url);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }}
      style={{
        background: "#fff", border: "1px solid #F0E6DE", borderLeft: "5px solid #F26B43",
        borderRadius: 18, padding: 16, boxShadow: "0 2px 8px rgba(40,30,20,0.04)", cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <h3 style={{ flex: 1, margin: 0, fontSize: 18, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{res.name}</h3>
        <LocBadge scope={res.scope} address={res.address} />
      </div>
      {(res.subcat_names?.length ? res.subcat_names : res.subcat_name ? [res.subcat_name] : []).length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(res.subcat_names?.length ? res.subcat_names : [res.subcat_name!]).map((t) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, color: "#7A4A2E", background: "#FBEFE6", padding: "3px 10px", borderRadius: 999 }}>
              {t}
            </span>
          ))}
        </div>
      )}
      {res.summary && (
        <p style={{ margin: "8px 0 0", fontSize: 16, color: "#574E47", lineHeight: 1.55 }}>{res.summary}</p>
      )}
      {res.phone && <div style={{ marginTop: 12 }}><CallButton phone={res.phone} /></div>}
      {res.address && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "flex-start", gap: 7, fontSize: 13, color: "#6E645C" }}>
          <ELIcon name="pin" size={16} color="#6E645C" style={{ marginTop: 1 }} />
          <span style={{ flex: 1, lineHeight: 1.5 }}>{res.address}</span>
        </div>
      )}
      {res.tags && res.tags.length > 0 && (
        <div style={{ marginTop: 11, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {res.tags.map((t) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", background: "#FFF4EF", color: "#B23F1E", fontSize: 13, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>#{t}</span>
          ))}
        </div>
      )}
      {res.source_org && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#9A8E84", lineHeight: 1.5 }}>
          資料來源：{res.source_org}
        </div>
      )}
    </div>
  );
}

/* 置頂工具卡：依「子分類名稱」對應一組官方查詢工具，顯示在該子分類列表最上方 */
type PinnedTool = { title: string; desc: string; url: string; tag?: string };
const PINNED_TOOLS: Record<string, PinnedTool[]> = {
  "鄰近醫學中心、診所": [
    {
      title: "快速查找開診院所（六日／春節／連假）",
      desc: "查詢假日、夜間、春節與連假期間有開診的醫療院所與藥局——健保署全國即時資訊。",
      url: "https://info.nhi.gov.tw/INAE1000/INAE1002S01",
      tag: "健保署．假日就醫查詢",
    },
  ],
  "1966 長照服務": [
    {
      title: "長照 2.0 服務與在地據點查詢",
      desc: "查長照服務項目、找在地長照據點與日照中心，或線上申請、試算補助——撥 1966 也可。",
      url: "https://1966.gov.tw/",
      tag: "衛福部．長照 2.0",
    },
  ],
  "輔具申請": [
    {
      title: "政府輔具資源服務與補助查詢",
      desc: "查政府輔具服務、各縣市輔具資源中心與可補助的輔具項目及申請流程——社家署輔具資源入口網。",
      url: "https://newrepat.sfaa.gov.tw/home/gov-repat-service",
      tag: "社家署．輔具入口網",
    },
  ],
  "疫苗資訊": [
    {
      title: "公費流感疫苗接種計畫",
      desc: "查公費流感疫苗的接種對象、時程與常見問答——疾管署官方說明。",
      url: "https://www.cdc.gov.tw/Category/QAPage/T93ZfoLyyuCaZvKf7v9eww",
      tag: "疾管署．接種計畫",
    },
    {
      title: "流感、新冠疫苗及流感藥劑地圖",
      desc: "用地圖找附近有提供流感／新冠疫苗、流感藥劑的院所——疾管署即時地圖。",
      url: "https://vaxmap.cdc.gov.tw",
      tag: "疾管署．疫苗地圖",
    },
  ],
};

/* 置頂工具卡樣式（珊瑚漸層、明顯，點了開官方查詢頁） */
function PinnedToolCard({ t }: { t: PinnedTool }) {
  return (
    <a
      href={t.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: 14, textDecoration: "none",
        background: "linear-gradient(120deg,#FFF4EF,#FFE7DD)", border: "1.5px solid #FFD6C7",
        borderRadius: 18, padding: 16, boxShadow: "0 4px 14px rgba(224,85,46,0.10)",
      }}
    >
      <span style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, background: "linear-gradient(135deg,#F2764F,#E0552E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 12px rgba(224,85,46,0.28)" }}>
        <ELIcon name="search" size={24} color="#fff" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {t.tag && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: "#B23F1E", background: "#fff", padding: "2px 9px", borderRadius: 999, marginBottom: 6 }}>
            <ELIcon name="check" size={12} color="#2E7D52" /> {t.tag}
          </span>
        )}
        <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{t.title}</div>
        <div style={{ marginTop: 3, fontSize: 14, color: "#574E47", lineHeight: 1.55 }}>{t.desc}</div>
      </div>
      <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, background: "#E0552E", color: "#fff", fontSize: 14, fontWeight: 800, padding: "10px 16px", borderRadius: 999, whiteSpace: "nowrap" }}>
        立即查詢 <ELIcon name="arrow" size={15} color="#fff" />
      </span>
    </a>
  );
}

export function ResourcesClient({
  categories,
  subcatsByCat,
  initialCat,
}: {
  categories: readonly Category[];
  subcatsByCat: Record<string, Subcat[]>;
  initialCat?: string | null;
}) {
  const router = useRouter();
  const [activeCat, setActiveCat]     = useState(initialCat ?? categories[0]?.slug ?? "health");
  const [activeSubId, setActiveSubId] = useState("");   // "" = 全部；否則為子分類 id（伺服器端篩選）
  const [sortKey,   setSortKey]       = useState<SortKey>("recommend");
  const [q,         setQ]             = useState("");
  const [resources, setResources]     = useState<ResourceItem[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [showNational, setShowNational] = useState(true); // ON = 顯示全國專線（手機與桌面共用）
  const [showLocal,    setShowLocal]    = useState(true); // ON = 顯示在地資源（手機 scope chip 用；桌面恆 true）
  const [total,        setTotal]        = useState(0);     // 該分類+地區的真實總數（來自 API header）
  const [loadingMore,  setLoadingMore]  = useState(false);

  /* ── region state ── */
  const [regionLabel, setRegionLabel] = useState<string>("");
  const [regionCodes, setRegionCodes] = useState<string[]>([]);
  const [autoGeo,     setAutoGeo]     = useState(false);

  /* load saved region or attempt geolocation */
  useEffect(() => {
    const savedLabel = localStorage.getItem("el_region_label") ?? "";
    const savedCodes = (() => {
      try {
        const multi = localStorage.getItem("el_region_codes");
        if (multi) { const a = JSON.parse(multi); if (Array.isArray(a)) return a.filter(Boolean) as string[]; }
        const single = localStorage.getItem("el_region_code") ?? "";
        return single ? [single] : [];
      } catch { return []; }
    })();
    if (savedCodes.length > 0) {
      setRegionLabel(savedLabel);
      setRegionCodes(savedCodes);
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
          setRegionLabel(label); setRegionCodes(code ? [code] : []); setAutoGeo(true);
          localStorage.setItem("el_region_label", label);
          localStorage.setItem("el_region_code", code);
          localStorage.setItem("el_region_codes", JSON.stringify(code ? [code] : []));
        } catch { /* silent */ }
      },
      () => {
        setRegionLabel("桃園市"); setRegionCodes(["TW-TYC"]);
        localStorage.setItem("el_region_label", "桃園市");
        localStorage.setItem("el_region_code", "TW-TYC");
        localStorage.setItem("el_region_codes", JSON.stringify(["TW-TYC"]));
      }
    );
  }, []);

  /* 地區彈窗（共用 modal）變更後：更新 chip 與篩選範圍並重新抓資料 */
  useEffect(() => {
    function onRegion(e: Event) {
      const d = (e as CustomEvent<{ label: string; code: string; codes?: string[] }>).detail;
      if (!d) return;
      setActiveSubId("");
      setRegionLabel(d.label === "全台灣" ? "" : d.label);
      setRegionCodes(Array.isArray(d.codes) ? d.codes : d.code ? [d.code] : []);
    }
    window.addEventListener("el:region-changed", onRegion);
    return () => window.removeEventListener("el:region-changed", onRegion);
  }, []);

  /* 返回上頁還原篩選（分類/子分類/排序）；地區另存在 localStorage */
  const [filterReady, setFilterReady] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("el_res_filter");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.cat) setActiveCat(s.cat);
        if (typeof s.sub === "string") setActiveSubId(s.sub);
        if (s.sort) setSortKey(s.sort);
      }
    } catch { /* ignore */ }
    setFilterReady(true);
  }, []);
  useEffect(() => {
    if (!filterReady) return;
    try { sessionStorage.setItem("el_res_filter", JSON.stringify({ cat: activeCat, sub: activeSubId, sort: sortKey })); } catch { /* ignore */ }
  }, [filterReady, activeCat, activeSubId, sortKey]);

  const cat     = categories.find((c) => c.slug === activeCat);
  const subList = subcatsByCat[activeCat] ?? [];
  const activeSubName = subList.find((s) => s.id === activeSubId)?.name ?? "";
  const pinnedTools = activeSubName ? (PINNED_TOOLS[activeSubName] ?? []) : [];

  const buildUrl = (offset: number) =>
    `/api/resources?category=${activeCat}${activeSubId ? `&subcat=${activeSubId}` : ""}${regionCodes.length ? `&regionCodes=${encodeURIComponent(regionCodes.join(","))}` : ""}&offset=${offset}`;

  /* fetch when category / subcategory / region changes（子分類為伺服器端篩選）*/
  useEffect(() => {
    setLoading(true);
    setQ("");
    fetch(buildUrl(0))
      .then(async (r) => {
        const data = await r.json();
        setTotal(Number(r.headers.get("X-Total-Count") ?? (data?.length ?? 0)));
        setResources(data ?? []);
        setLoading(false);
      })
      .catch(() => { setResources([]); setTotal(0); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat, activeSubId, regionCodes.join(",")]);

  /* 載入更多（分頁，附加到已載入清單，前端篩選/搜尋仍可用） */
  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const r = await fetch(buildUrl(resources.length));
      const data = await r.json();
      setResources((prev) => [...prev, ...(data ?? [])]);
      setTotal(Number(r.headers.get("X-Total-Count") ?? total));
    } catch { /* ignore */ }
    setLoadingMore(false);
  }

  const filtered = resources
    .filter((r) => {
      // scope 雙開關：在地 / 全國（兩者皆開＝同時顯示；皆關＝視為皆顯示）
      const isNat = r.scope === "national";
      if (showLocal || showNational) {
        if (isNat && !showNational) return false;
        if (!isNat && !showLocal) return false;
      }
      if (q.trim()) {
        const hay = [r.name, r.summary, ...(r.tags ?? [])].join(" ").toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      // 子分類已由伺服器端篩選（activeSubId），這裡不再做文字比對
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "popular") return (b.bookmark_count ?? 0) - (a.bookmark_count ?? 0);
      if (sortKey === "local")   return a.scope === "local" ? -1 : b.scope === "local" ? 1 : 0;
      if (sortKey === "name")    return a.name.localeCompare(b.name, "zh-TW");
      return officialScore(b) - officialScore(a); // 綜合推薦：官方/政府/大型優先
    });

  /* 手機版：排序循環 + scope 計數文字（對齊設計稿） */
  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "recommend", label: "綜合推薦" },
    { key: "local",     label: "在地優先" },
    { key: "popular",   label: "最多人推薦" },
    { key: "name",      label: "名稱排序" },
  ];
  const sortLabel = SORT_OPTIONS.find((s) => s.key === sortKey)?.label ?? "綜合推薦";
  const cycleSort = () => {
    const i = SORT_OPTIONS.findIndex((s) => s.key === sortKey);
    setSortKey(SORT_OPTIONS[(i + 1) % SORT_OPTIONS.length].key);
  };
  const scopeText =
    showLocal && showNational ? "在地與全國資源"
    : showLocal ? "在地資源"
    : showNational ? "全國資源"
    : "在地與全國資源";

  function handleCatChange(slug: string) {
    setActiveCat(slug); setSortKey("recommend"); setActiveSubId("");
  }

  return (
    <div>
      {/* 手機版返回列（對齊設計稿 SubHeader：返回 + 分類名 + 搜尋） */}
      <div className="wv-mobile-only">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE", background: "#fff" }}>
          <button onClick={() => router.back()} aria-label="返回" style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <div style={{ flex: 1, minWidth: 0, fontSize: 22, fontWeight: 800, color: "#241F1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat?.name ?? "資源查找"}</div>
          <Link href="/search" aria-label="搜尋" style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ELIcon name="search" size={21} color="#574E47" />
          </Link>
        </div>
      </div>

      <div className="wv-wrap wv-split" style={{ paddingTop: 26, paddingBottom: 56, display: "grid", gridTemplateColumns: "236px minmax(0,1fr)", gap: 30, alignItems: "start" }}>
        {/* 側欄 */}
        <aside className="wv-hideSm" style={{ position: "sticky", top: 96 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#6E645C", letterSpacing: 1, margin: "4px 0 10px" }}>分類</div>
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
                  <ELIcon name={CAT_ICON_MAP[c.slug] || "search"} size={20} color={on ? "#F26B43" : "#6E645C"} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </aside>

        {/* 結果區 */}
        <div>
          {/* 搜尋框 + 地區選擇（桌機；手機改用返回列放大鏡 + scope chips） */}
          <div className="wv-hideSm" style={{ display: "flex", background: "#fff", borderRadius: 999, padding: "6px 6px 6px 0", boxShadow: "0 10px 26px rgba(120,60,30,0.10)", marginBottom: 18, alignItems: "center" }}>
            {/* Region：開啟共用地區彈窗（與首頁／導覽列連動同一個 modal） */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => window.dispatchEvent(new Event("el:open-region"))}
                style={{
                  height: 44, borderRadius: 999, border: "none", background: "#FFF4EF",
                  padding: "0 14px 0 14px", display: "flex", alignItems: "center", gap: 6,
                  cursor: "pointer", font: "inherit", fontSize: 14.5, fontWeight: 800,
                  color: "#B23F1E", whiteSpace: "nowrap", marginLeft: 6,
                }}
              >
                <ELIcon name="pin" size={15} color="#F26B43" />
                {regionLabel || "全台灣"}
                <ELIcon name="chevron" size={13} color="#6E645C" style={{ transform: "rotate(90deg)" }} />
              </button>
              {autoGeo && (
                <span style={{ position: "absolute", bottom: -16, left: 14, fontSize: 11, color: "#6E645C", whiteSpace: "nowrap" }}>(已自動定位)</span>
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
                  <ELIcon name="close" size={16} color="#6E645C" />
                </button>
              )}
            </div>
          </div>

          {/* 細分類 chips（真實子分類，伺服器端篩選） */}
          {subList.length > 0 && (
            <div className="wv-subwrap" style={{ marginBottom: 16 }}>
              {[{ id: "", name: "全部" }, ...subList].map((s) => {
                const on = activeSubId === s.id;
                return (
                  <button
                    key={s.id || "all"}
                    onClick={() => setActiveSubId(s.id)}
                    style={{
                      padding: "9px 16px", borderRadius: 999, cursor: "pointer", font: "inherit",
                      fontSize: 15, fontWeight: 700, whiteSpace: "nowrap",
                      border: `1.5px solid ${on ? "#E0552E" : "#E4D7CC"}`,
                      background: on ? "#E0552E" : "#fff",
                      color: on ? "#fff" : "#574E47",
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* 手機版：scope 篩選 chips + 計數（對齊設計稿 page-category） */}
          <div className="wv-mobile-only">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <ScopeChip active={showLocal} onClick={() => setShowLocal((v) => !v)}>
                  <ELIcon name="pin" size={14} color={showLocal ? "#fff" : "#574E47"} /> {regionLabel || "全台灣"}
                </ScopeChip>
                <ScopeChip active={showNational} onClick={() => setShowNational((v) => !v)}>全國</ScopeChip>
                <ScopeChip onClick={() => window.dispatchEvent(new Event("el:open-region"))}>其他區域 ›</ScopeChip>
              </div>
              <button
                type="button"
                onClick={cycleSort}
                style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, height: 38, fontSize: 13, fontWeight: 700, color: "#574E47", border: "none", background: "transparent", cursor: "pointer", font: "inherit", padding: 0 }}
              >
                <ELIcon name="filter" size={15} color="#574E47" /> {sortLabel}
              </button>
            </div>
            <div style={{ fontSize: 13, color: "#6E645C", marginBottom: 14 }}>
              共 <b style={{ color: "#241F1B" }}>{total}</b> 項服務 · {scopeText}
            </div>
          </div>

          {/* 標題列（桌機）：[分類 N筆] ── (目前範圍) [Switch] [排序▽] */}
          <div className="wv-hideSm" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {/* 左：分類名稱 + 計數 */}
            <div style={{ fontSize: 19, fontWeight: 800, color: "#241F1B", flexShrink: 0 }}>
              {cat?.name ?? "資源"}
              <span style={{ marginLeft: 8, fontSize: 15, fontWeight: 700, color: "#6E645C" }}>{total} 筆</span>
            </div>

            {/* 中：純文字狀態提示（不可點擊） */}
            {regionLabel && (
              <span style={{ fontSize: 13.5, color: "#6E645C", whiteSpace: "nowrap" }}>
                （目前範圍：{regionLabel}）
              </span>
            )}

            {/* 彈性空間 */}
            <div style={{ flex: 1 }} />

            {/* Switch：全 <label> 都是點擊熱區 */}
            <label style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              cursor: "pointer", userSelect: "none",
            }}>
              <input
                type="checkbox"
                checked={showNational}
                onChange={() => setShowNational((v) => !v)}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
              />
              {/* Switch 軌道 */}
              <span style={{
                display: "inline-flex", width: 46, height: 26, borderRadius: 13, flexShrink: 0,
                background: showNational ? "#E0552E" : "#CBD5E1",
                transition: "background 0.2s", alignItems: "center",
                padding: "0 3px",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
                  transform: showNational ? "translateX(20px)" : "translateX(0)",
                  transition: "transform 0.2s",
                  display: "block",
                }} />
              </span>
              {/* 說明文字 */}
              <span style={{ fontSize: 14, fontWeight: 700, color: showNational ? "#241F1B" : "#574E47", whiteSpace: "nowrap" }}>
                {showNational
                  ? "同時顯示全國專線（如：1966、119）"
                  : `只看${regionLabel || "本地區"}在地資源`}
              </span>
            </label>

            {/* 排序下拉 */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <ELIcon name="filter" size={15} color="#6E645C" />
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

          {/* 置頂工具卡（依子分類顯示官方查詢工具，恆在最上方） */}
          {pinnedTools.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
              {pinnedTools.map((t) => <PinnedToolCard key={t.url} t={t} />)}
            </div>
          )}

          {/* 資源卡片列表 */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#6E645C" }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>載入中⋯</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 18, border: "1px dashed #E4D7CC", padding: 48, textAlign: "center" }}>
              <ELIcon name="search" size={40} color="#E4D7CC" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#574E47" }}>
                {q ? <>找不到「{q}」的資源</> : "這個分類目前暫無資料"}
              </div>
              <div style={{ marginTop: 6, fontSize: 15, color: "#6E645C" }}>換個關鍵字，或從左側選擇其他分類。</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map((r) => <ResourceCard key={r.id} res={r} catSlug={activeCat} />)}
            </div>
          )}

          {/* 載入更多（分頁）：還有未載入的資源才顯示 */}
          {!loading && resources.length < total && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                marginTop: 16, width: "100%", padding: "14px 0", borderRadius: 14,
                border: "1.5px solid #E4D7CC", background: "#fff", cursor: "pointer",
                font: "inherit", fontSize: 16, fontWeight: 800, color: "#B23F1E",
                opacity: loadingMore ? 0.6 : 1,
              }}
            >
              {loadingMore ? "載入中⋯" : `載入更多（已顯示 ${resources.length} / ${total} 筆）`}
            </button>
          )}

          {/* 找不到 → 投稿（對齊設計稿 page-category 底部 CTA） */}
          <Link href="/submit" style={{
            marginTop: 18, background: "#FFF4EF", border: "1.5px dashed #FFD6C7", borderRadius: 18,
            padding: 16, display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
          }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: "#F26B43", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ELIcon name="send" size={22} color="#fff" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>少了哪個資源？</div>
              <div style={{ marginTop: 2, fontSize: 13, color: "#574E47" }}>知道好用的就推薦給大家</div>
            </div>
            <span style={{ background: "#E0552E", color: "#fff", fontWeight: 800, fontSize: 14, padding: "10px 15px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>立即分享</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
