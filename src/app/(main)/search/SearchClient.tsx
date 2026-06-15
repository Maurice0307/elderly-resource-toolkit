"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";
import { categories } from "@/config/categories";

export type SearchItem = {
  id: string;
  name: string;
  summary?: string | null;
  phone?: string | null;
  address?: string | null;
  scope?: string | null;
  tags?: string[] | null;
  regionName?: string | null;
  isLocal: boolean;
  catSlug: string;
};

type CatCount = { slug: string; name: string; count: number };

const SORTS = ["在地優先", "最近更新", "依名稱"] as const;

/* 地區徽章（對齊設計稿 LocBadge） */
function Badge({ isLocal, scope, regionName }: { isLocal: boolean; scope?: string | null; regionName?: string | null }) {
  const national = scope === "national";
  const color = isLocal ? "#2E7D52" : national ? "#B23F1E" : "#2A63C0";
  const bg = isLocal ? "#E7F4EC" : national ? "#FFE7DD" : "#EAF1FB";
  const label = isLocal ? "你的地區" : national ? "全國" : (regionName || "在地");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap", flexShrink: 0, color, background: bg }}>
      {isLocal ? <ELIcon name="pin" size={12} color="#2E7D52" /> : null}{label}
    </span>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
      padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, font: "inherit", cursor: "pointer",
      background: active ? "#E0552E" : "#fff", color: active ? "#fff" : "#574E47",
      border: "1.5px solid " + (active ? "#E0552E" : "#E4D7CC"),
    }}>{children}</button>
  );
}

export function SearchClient({ query, items, regionLabel, cats }: { query: string; items: SearchItem[]; regionLabel?: string | null; cats: CatCount[] }) {
  const router = useRouter();
  const [q, setQ] = useState(query);
  const [showLocal, setShowLocal] = useState(true);
  const [showNational, setShowNational] = useState(true);
  const [sort, setSort] = useState(0);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ stop: () => void; start: () => void } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!query && inputRef.current) { try { inputRef.current.focus(); } catch {} } }, [query]);

  // 變更地區後：重新向 server 取得在地化結果
  useEffect(() => {
    const onRegion = () => router.refresh();
    window.addEventListener("el:region-changed", onRegion);
    return () => window.removeEventListener("el:region-changed", onRegion);
  }, [router]);

  const submit = (text?: string) => {
    const t = (text ?? q).trim();
    if (!t) return;
    router.push(`/search?q=${encodeURIComponent(t)}&mode=intent`);
  };

  const startVoice = () => {
    const w = window as unknown as { SpeechRecognition?: new () => never; webkitSpeechRecognition?: new () => never };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { inputRef.current?.focus(); return; }
    if (listening) { try { recRef.current?.stop(); } catch {} setListening(false); return; }
    try {
      const rec = new SR() as unknown as { lang: string; interimResults: boolean; maxAlternatives: number; onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void; onend: () => void; onerror: () => void; stop: () => void; start: () => void };
      recRef.current = rec;
      rec.lang = "zh-TW"; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const t = (e.results[0][0].transcript || "").replace(/[\s。．、,]+$/, "");
        if (t) { setQ(t); submit(t); }
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      setListening(true);
      rec.start();
    } catch { setListening(false); }
  };

  const goBack = () => { if (window.history.length > 1) router.back(); else router.push("/"); };

  // 篩選 + 排序
  let list = items.filter((r) => {
    const isNat = r.scope === "national";
    if (showLocal || showNational) {
      if (isNat && !showNational) return false;
      if (!isNat && !showLocal) return false;
    }
    if (catFilter && r.catSlug !== catFilter) return false;
    return true;
  });
  if (sort === 0) list = [...list].sort((a, b) => (a.isLocal ? 0 : 1) - (b.isLocal ? 0 : 1));
  else if (sort === 2) list = [...list].sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));

  const scopeText = showLocal && showNational ? "在地與全國" : showLocal ? "在地資源" : showNational ? "全國資源" : "在地與全國";
  const localChip = regionLabel || "全台灣";

  // 建議搜尋字詞：依與輸入字的字元重疊度排序（打錯字 / 找不到時導引到可用關鍵字）
  const POPULAR_SUGGEST = ["量血壓", "復康巴士", "社區共餐", "長照申請", "居家服務", "敬老卡", "送餐服務", "防詐騙", "失智照護", "日間照顧", "輔具補助", "喘息服務"];
  const suggestions = (() => {
    const chars = Array.from(new Set(query.replace(/\s/g, "")));
    const scored = POPULAR_SUGGEST
      .filter((k) => k !== query)
      .map((k) => ({ k, s: chars.filter((ch) => k.includes(ch)).length }));
    const related = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.k);
    return (related.length ? related : POPULAR_SUGGEST).slice(0, 6);
  })();

  return (
    <div style={{ background: "#fff" }}>
      {/* 返回列 + 搜尋（含語音） */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE", background: "#fff" }}>
        <button onClick={goBack} aria-label="返回" style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "2px solid #241F1B", borderRadius: 10, padding: "0 12px", height: 46, minWidth: 0 }}>
          <ELIcon name="search" size={20} color="#574E47" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="輸入想找的資源…"
            aria-label="搜尋關鍵字"
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 16, color: "#241F1B", fontWeight: 600 }}
          />
          {q && (
            <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="清除" style={{ border: "none", background: "transparent", padding: 0, minHeight: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
              <ELIcon name="close" size={18} color="#6E645C" />
            </button>
          )}
        </div>
        <button onClick={startVoice} aria-label="語音搜尋" className={listening ? "wv-mic-on" : undefined} style={{ width: 46, height: 46, borderRadius: 10, background: "#E0552E", border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <ELIcon name="mic" size={22} color="#fff" />
        </button>
      </div>

      {!query ? (
        /* 空白狀態：提示 + 大家常找的 */
        <div style={{ padding: "18px" }}>
          <div style={{ background: "#FFF4EF", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <ELIcon name="mic" size={20} color="#F26B43" />
            <span style={{ flex: 1, fontSize: 13.5, color: "#574E47", lineHeight: 1.5 }}>輸入想找的資源，或點右上角麥克風直接<b style={{ color: "#B23F1E" }}>說出</b>需求</span>
          </div>
          <div style={{ marginTop: 22, fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 12 }}>大家常找的</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {["量血壓", "復康巴士", "社區共餐", "長照申請", "居家服務", "敬老卡", "送餐服務", "防詐騙"].map((s) => (
              <button key={s} onClick={() => submit(s)} style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 44, padding: "0 16px", borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff", color: "#241F1B", fontSize: 16, fontWeight: 700, font: "inherit", cursor: "pointer" }}>
                <ELIcon name="search" size={16} color="#F26B43" /> {s}
              </button>
            ))}
          </div>

          {/* 直接瀏覽分類（統一橘色 + 首頁分類 icon） */}
          <div style={{ marginTop: 26, fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 12 }}>直接瀏覽分類</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {categories.map((c) => (
              <Link key={c.slug} href={`/resources?cat=${c.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #F0E6DE", borderRadius: 14, padding: "12px 14px", textDecoration: "none" }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ELIcon name={c.icon} size={21} color="#F26B43" />
                </span>
                <span style={{ fontSize: 15.5, fontWeight: 800, color: "#241F1B", lineHeight: 1.3 }}>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* scope 篩選 + 排序（排序固定右上、不換行） */}
          <div style={{ padding: "12px 18px 4px", display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Chip active={showLocal} onClick={() => setShowLocal((v) => !v)}><ELIcon name="pin" size={14} color={showLocal ? "#fff" : "#574E47"} /> {localChip}</Chip>
              <Chip active={showNational} onClick={() => setShowNational((v) => !v)}>全國</Chip>
              <Chip onClick={() => window.dispatchEvent(new Event("el:open-region"))}>其他區域 ›</Chip>
            </div>
            <button type="button" onClick={() => setSort((s) => (s + 1) % SORTS.length)} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, height: 38, fontSize: 13, fontWeight: 700, color: "#574E47", border: "none", background: "transparent", cursor: "pointer", font: "inherit", padding: 0 }}>
              <ELIcon name="filter" size={15} color="#574E47" /> {SORTS[sort]}
            </button>
          </div>

          {/* 分類篩選（融入：只有多於一類才出現，小膠囊） */}
          {cats.length > 1 && (
            <div style={{ padding: "6px 18px 2px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => setCatFilter(null)} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, font: "inherit", cursor: "pointer", background: catFilter === null ? "#FFE7DD" : "#FBF7F4", color: catFilter === null ? "#B23F1E" : "#6E645C", border: "1px solid " + (catFilter === null ? "#FFD6C7" : "#F0E6DE") }}>
                全部 {items.length}
              </button>
              {cats.map((c) => (
                <button key={c.slug} type="button" onClick={() => setCatFilter(catFilter === c.slug ? null : c.slug)} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, font: "inherit", cursor: "pointer", background: catFilter === c.slug ? "#FFE7DD" : "#FBF7F4", color: catFilter === c.slug ? "#B23F1E" : "#6E645C", border: "1px solid " + (catFilter === c.slug ? "#FFD6C7" : "#F0E6DE") }}>
                  {c.name} {c.count}
                </button>
              ))}
            </div>
          )}

          {/* 結果計數 */}
          <div style={{ padding: "8px 18px 6px", fontSize: 16, color: "#574E47" }}>
            找到 <b style={{ color: "#241F1B" }}>{list.length}</b> 筆「<b style={{ color: "#B23F1E" }}>{query}</b>」· {scopeText}
          </div>

          {/* 建議搜尋字詞（結果少 / 找不到時導引） */}
          {list.length <= 3 && (
            <div style={{ padding: "2px 18px 8px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#574E47", marginBottom: 8 }}>
                {list.length === 0 ? "找不到？換個說法試試：" : "你也可以試試："}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => submit(s)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, border: "1.5px solid #FFD6C7", background: "#FFF4EF", color: "#B23F1E", fontSize: 14, fontWeight: 700, font: "inherit", cursor: "pointer" }}>
                    <ELIcon name="search" size={14} color="#F26B43" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 結果卡 */}
          {list.length > 0 ? (
            <div style={{ padding: "4px 18px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {list.map((r) => (
                <div
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/resources/${r.catSlug}/${r.id}`)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/resources/${r.catSlug}/${r.id}`); } }}
                  style={{ background: "#fff", border: "1px solid #F0E6DE", borderLeft: "5px solid #F26B43", borderRadius: 18, padding: 16, boxShadow: "0 2px 8px rgba(40,30,20,0.04)", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <h3 style={{ flex: 1, margin: 0, fontSize: 18, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{r.name}</h3>
                    <Badge isLocal={r.isLocal} scope={r.scope} regionName={r.regionName} />
                  </div>
                  {r.summary && <p style={{ margin: "8px 0 0", fontSize: 16, color: "#574E47", lineHeight: 1.55 }}>{r.summary}</p>}
                  {r.phone && (
                    <a href={"tel:" + r.phone.replace(/[^0-9+]/g, "")} onClick={(e) => e.stopPropagation()} style={{ marginTop: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 10, minHeight: 48, padding: "0 16px", borderRadius: 12, border: "1.5px solid #F26B43", background: "#FFF4EF" }}>
                      <ELIcon name="phone" size={22} color="#B23F1E" />
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#B23F1E", letterSpacing: 0.5, fontVariantNumeric: "tabular-nums" }}>{r.phone}</span>
                      <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 800, color: "#B23F1E" }}>撥打 ›</span>
                    </a>
                  )}
                  {r.address && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "flex-start", gap: 7, fontSize: 13, color: "#6E645C" }}>
                      <ELIcon name="pin" size={16} color="#6E645C" style={{ marginTop: 1 }} />
                      <span style={{ flex: 1, lineHeight: 1.5 }}>{r.address}</span>
                    </div>
                  )}
                  {r.tags && r.tags.length > 0 && (
                    <div style={{ marginTop: 11, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {r.tags.slice(0, 5).map((t) => (
                        <span key={t} style={{ display: "inline-flex", alignItems: "center", background: "#FFF4EF", color: "#B23F1E", fontSize: 13, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "24px 18px", textAlign: "center", color: "#6E645C", fontSize: 16, lineHeight: 1.7 }}>
              沒有「{query}」的結果。<br />試試其他關鍵字，或用下方 LINE 問在地志工。
            </div>
          )}

          {/* 沒找到 → LINE */}
          <div style={{ padding: "0 18px 26px" }}>
            <a href="https://line.me/R/ti/p/@796rwlaq" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(120deg,#E0552E,#F26B43)", borderRadius: 18, padding: "16px 18px", textDecoration: "none", boxShadow: "0 8px 20px rgba(224,85,46,0.26)" }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ELIcon name="chat" size={23} color="#fff" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>沒找到想要的？</div>
                <div style={{ marginTop: 2, fontSize: 13, color: "rgba(255,255,255,0.92)" }}>用 LINE 問在地志工</div>
              </div>
              <span style={{ background: "#fff", color: "#B23F1E", fontWeight: 800, fontSize: 14, padding: "9px 15px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>去問問</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
