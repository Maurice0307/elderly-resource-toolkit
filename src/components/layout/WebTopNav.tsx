"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ELIcon } from "./ELIcon";
import { BrandLogo } from "./BrandLogo";

const NAV_ITEMS = [
  { key: "home",      label: "首頁",     icon: "home",   href: "/" },
  { key: "resources", label: "資源查找", icon: "search", href: "/resources" },
  { key: "learn",     label: "互動學習", icon: "cards",  href: "/activities" },
  { key: "news",      label: "今日新知", icon: "news",   href: "/news" },
  { key: "qa",        label: "互助問答", icon: "qa",     href: "/qa" },
];

const MORE_ITEMS = [
  { key: "comm",    label: "溝通錦囊",   icon: "chat",      desc: "對話卡關這樣說",       href: "/scripts" },
  { key: "propose", label: "提案專區",   icon: "megaphone", desc: "出點子、投票讓社區做", href: "/propose" },
  { key: "submit",  label: "分享好資源", icon: "send",      desc: "提報你知道的服務",     href: "/submit" },
  { key: "guide",   label: "使用教學",   icon: "education", desc: "2 分鐘學會怎麼用",     href: "/guide" },
];

type RegionDistrict = { id: string; code: string; name: string };
type RegionCounty = { id: string; code: string; name: string; districts: RegionDistrict[] };

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

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: "linear-gradient(135deg,#F2764F,#E0552E)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(224,85,46,0.32)",
      }}>
        <BrandLogo size={24} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 900, color: "#241F1B", lineHeight: 1.1, letterSpacing: -0.3 }}>幸福好厝邊</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#B23F1E", letterSpacing: 3.5, lineHeight: 1.2 }}>ELDERLINK</div>
      </div>
    </div>
  );
}

function RegionModal({ onClose }: { onClose: (name?: string) => void }) {
  const [counties, setCounties] = useState<RegionCounty[]>([]);
  const [openCounty, setOpenCounty] = useState<string | null>(null);
  const [savedCodes, setSavedCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 讀多選（el_region_codes）；相容舊的單一 el_region_code
    const codes = (() => {
      try {
        const multi = localStorage.getItem("el_region_codes");
        if (multi) { const arr = JSON.parse(multi); if (Array.isArray(arr)) return arr.filter(Boolean) as string[]; }
        const single = localStorage.getItem("el_region_code") ?? "";
        return single ? [single] : [];
      } catch { return []; }
    })();
    setSavedCodes(codes);
    fetch("/api/location/regions")
      .then((r) => r.json())
      .then((data: RegionCounty[]) => {
        const list = (Array.isArray(data) ? data : []).slice().sort((a, b) => countyOrder(a.name) - countyOrder(b.name));
        setCounties(list);
        setLoading(false);
        const first = codes[0];
        const match = first ? list.find((c) => c.code === first || c.districts.some((d) => d.code === first)) : null;
        setOpenCounty(match?.code ?? list[0]?.code ?? null);
      })
      .catch(() => setLoading(false));
  }, []);

  // 計算已選地區的顯示標籤
  const labelFor = (codes: string[]): string => {
    if (codes.length === 0) return "全台灣";
    if (codes.length === 1) {
      for (const c of counties) {
        if (c.code === codes[0]) return c.name;
        const d = c.districts.find((x) => x.code === codes[0]);
        if (d) return `${c.name} · ${d.name}`;
      }
      return "1 個地區";
    }
    return `${codes.length} 個地區`;
  };

  function toggle(code: string) {
    setSavedCodes((s) => (s.includes(code) ? s.filter((x) => x !== code) : [...s, code]));
  }

  async function apply() {
    const codes = savedCodes;
    const label = labelFor(codes);
    try {
      await fetch("/api/location/set", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: codes[0] ?? "" }) });
      localStorage.setItem("el_region_codes", JSON.stringify(codes));
      localStorage.setItem("el_region_label", codes.length ? label : "");
      localStorage.setItem("el_region_code", codes[0] ?? "");
    } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent("el:region-changed", { detail: { label, code: codes[0] ?? "", codes } }));
    onClose(codes.length ? label : undefined);
  }

  async function clearRegion() {
    setSavedCodes([]);
    try {
      await fetch("/api/location/set", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: "" }) });
      localStorage.removeItem("el_region_codes");
      localStorage.removeItem("el_region_label");
      localStorage.removeItem("el_region_code");
    } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent("el:region-changed", { detail: { label: "全台灣", code: "", codes: [] } }));
    onClose(undefined);
  }

  const activeCounty = counties.find((c) => c.code === openCounty) ?? null;

  return (
    <div
      onClick={() => onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(28,18,12,0.55)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "24px 24px 0 0", boxShadow: "0 -22px 60px rgba(0,0,0,0.28)",
          width: "100%", maxWidth: 560, maxHeight: "82dvh", display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* 頭 */}
        <div style={{ flexShrink: 0, padding: "18px 20px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid #EFE5DC" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>變更地區</div>
            <div style={{ fontSize: 13, color: "#6E645C", marginTop: 3 }}>可多選縣市／行政區，找跨區資源</div>
          </div>
          <button onClick={() => onClose()} aria-label="關閉" style={{ flexShrink: 0, border: "1px solid #E4D7CC", background: "#fff", width: 38, height: 38, borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ELIcon name="close" size={20} color="#574E47" stroke={2.2} />
          </button>
        </div>

        {/* 雙欄：左縣市 / 右行政區 */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6E645C", fontSize: 15 }}>載入地區資料⋯</div>
        ) : counties.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6E645C", fontSize: 15 }}>無法取得地區資料</div>
        ) : (
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            {/* 左：縣市 */}
            <div style={{ width: 140, flexShrink: 0, overflowY: "auto", borderRight: "1px solid #F0E6DE", background: "#FBF7F4" }}>
              {counties.map((c) => {
                const on = c.code === openCounty;
                return (
                  <button
                    key={c.code}
                    onClick={() => setOpenCounty(c.code)}
                    style={{
                      width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 6,
                      padding: "14px 12px 14px 13px", border: "none",
                      borderLeft: "3px solid " + (on ? "#E0552E" : "transparent"),
                      background: on ? "#fff" : "transparent",
                      color: on ? "#B23F1E" : "#574E47", fontSize: 16, fontWeight: 800,
                      font: "inherit", cursor: "pointer",
                    }}
                  >
                    {c.name}
                    {on && <ELIcon name="pin" size={15} color="#F26B43" />}
                  </button>
                );
              })}
            </div>

            {/* 右：行政區（含「全區」） */}
            <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
              {activeCounty && (
                <>
                  {[{ code: activeCounty.code, name: "全區（整個縣市）", save: activeCounty.name }, ...activeCounty.districts.map((d) => ({ code: d.code, name: d.name, save: `${activeCounty.name} · ${d.name}` }))].map((d) => {
                    const sel = savedCodes.includes(d.code);
                    return (
                      <button
                        key={d.code}
                        onClick={() => toggle(d.code)}
                        style={{
                          width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                          padding: "13px 16px", border: "none", background: "transparent", borderBottom: "1px solid #F7F1EC",
                          fontSize: 16, fontWeight: sel ? 800 : 600, color: sel ? "#B23F1E" : "#241F1B", font: "inherit", cursor: "pointer",
                        }}
                      >
                        {d.name}
                        {sel && <ELIcon name="check" size={18} color="#E0552E" />}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* 底部：套用（多選）+ 不篩選 */}
        <div style={{ flexShrink: 0, padding: "12px 20px calc(14px + env(safe-area-inset-bottom))", borderTop: "1px solid #F0E6DE", display: "flex", gap: 10 }}>
          <button
            onClick={clearRegion}
            style={{
              flexShrink: 0, padding: "0 16px", height: 50, borderRadius: 12,
              border: "1.5px solid #E4D7CC", background: "#fff",
              cursor: "pointer", font: "inherit", fontSize: 15, fontWeight: 700, color: "#574E47",
            }}
          >
            全部地區
          </button>
          <button
            onClick={apply}
            style={{
              flex: 1, height: 50, borderRadius: 12, border: "none",
              background: "#E0552E", color: "#fff",
              cursor: "pointer", font: "inherit", fontSize: 16, fontWeight: 800,
            }}
          >
            {savedCodes.length > 0 ? `套用 ${savedCodes.length} 個地區` : "套用"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ onClose, currentPath }: { onClose: () => void; currentPath: string }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(28,18,12,0.5)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: "min(320px, 84vw)", background: "#fff",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.2)",
          padding: 18, display: "flex", flexDirection: "column", gap: 4,
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
          <button
            onClick={onClose}
            aria-label="關閉選單"
            style={{
              border: "none", background: "#FBF7F4", width: 44, height: 44,
              borderRadius: 999, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <ELIcon name="close" size={22} color="#574E47" />
          </button>
        </div>
        {NAV_ITEMS.map((it) => {
          const active = it.href === "/" ? currentPath === "/" : currentPath.startsWith(it.href);
          return (
            <Link
              key={it.key}
              href={it.href}
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 13, padding: "15px 14px",
                borderRadius: 14, textDecoration: "none",
                background: active ? "#FFF4EF" : "transparent",
                fontSize: 19, fontWeight: 800,
                color: active ? "#B23F1E" : "#241F1B",
              }}
            >
              <ELIcon name={it.icon} size={24} color="#F26B43" /> {it.label}
            </Link>
          );
        })}
        <div style={{ height: 1, background: "#F0E6DE", margin: "8px 6px" }} />
        {MORE_ITEMS.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", gap: 13, padding: "15px 14px",
              borderRadius: 14, textDecoration: "none",
              background: currentPath.startsWith(it.href) ? "#FFF4EF" : "transparent",
              fontSize: 19, fontWeight: 800,
              color: currentPath.startsWith(it.href) ? "#B23F1E" : "#241F1B",
            }}
          >
            <ELIcon name={it.icon} size={24} color="#F26B43" /> {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function AccountMenu({ user, onClose, onLogout }: { user: { email?: string; phone?: string; name?: string; avatar?: string }; onClose: () => void; onLogout: () => void }) {
  const initial = (user.name || user.email || "?")[0].toUpperCase();
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 55 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="wv-menu"
        style={{
          position: "absolute", top: 70, right: 28, width: 248,
          background: "#fff", borderRadius: 18,
          border: "1px solid #F0E6DE",
          boxShadow: "0 20px 46px rgba(60,35,20,0.18)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, background: "#FFF4EF" }}>
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name || ""} style={{ width: 46, height: 46, borderRadius: 999, flexShrink: 0, objectFit: "cover" }} />
          ) : (
            <div style={{
              width: 46, height: 46, borderRadius: 999, flexShrink: 0,
              background: "linear-gradient(135deg,#FFB38F,#E0552E)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800,
            }}>{initial}</div>
          )}
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>{user.name || "使用者"}</div>
            <div style={{ fontSize: 13.5, color: "#B23F1E", fontWeight: 700 }}>
              {user.email && !user.email.endsWith("@line.users")
                ? user.email
                : user.email?.endsWith("@line.users")
                ? "LINE 帳號"
                : user.phone
                ? `手機 ${user.phone.replace(/^\+886/, "0")}`
                : "會員"}
            </div>
          </div>
        </div>
        <div style={{ padding: 8 }}>
          {[
            { label: "個人中心", icon: "user",  href: "/profile" },
            { label: "我的收藏", icon: "heart", href: "/profile?tab=saved" },
          ].map((it) => (
            <Link
              key={it.label}
              href={it.href}
              onClick={onClose}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 11,
                padding: "12px 12px", borderRadius: 12, textDecoration: "none",
                fontSize: 16, fontWeight: 700, color: "#574E47",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FBF7F4")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <ELIcon name={it.icon} size={20} color="#F26B43" /> {it.label}
            </Link>
          ))}
          <div style={{ height: 1, background: "#F0E6DE", margin: "6px 8px" }} />
          <button
            onClick={() => { onLogout(); onClose(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 11,
              padding: "12px 12px", borderRadius: 12, border: "none",
              background: "transparent", cursor: "pointer", font: "inherit",
              fontSize: 16, fontWeight: 700, color: "#574E47",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FBF7F4")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <ELIcon name="logout" size={20} color="#6E645C" /> 登出
          </button>
        </div>
      </div>
    </div>
  );
}

export function WebTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [regionLabel, setRegionLabel] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string; phone?: string; name?: string; avatar?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const saved = localStorage.getItem("el_region_label");
    if (saved) setRegionLabel(saved);
  }, []);

  // 手機 hero 的「變更地區」透過事件開啟同一個地區彈窗
  useEffect(() => {
    const open = () => setRegionOpen(true);
    window.addEventListener("el:open-region", open);
    return () => window.removeEventListener("el:open-region", open);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: { email?: string; phone?: string; user_metadata?: Record<string, string> } | null } }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          phone: data.user.phone,
          name: data.user.user_metadata?.display_name || data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          avatar: data.user.user_metadata?.avatar_url,
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: { email?: string; phone?: string; user_metadata?: Record<string, string> } } | null) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          phone: session.user.phone,
          name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatar: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const moreActive = MORE_ITEMS.some(it => pathname.startsWith(it.href));

  function handleRegionClose(name?: string) {
    setRegionOpen(false);
    if (name !== undefined) {
      setRegionLabel(name || null);
    }
  }

  return (
    <header className={`wv-header${scrolled ? " scrolled" : ""}`}>
      <div className="wv-wrap wv-headrow">
        {/* 品牌 */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }} aria-label="幸福好厝邊 回首頁">
          <Brand />
        </Link>

        {/* 主導覽 */}
        <nav className="wv-nav" aria-label="主要導覽">
          {NAV_ITEMS.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              className={`wv-navlink${isActive(it.href) ? " on" : ""}`}
            >
              <ELIcon name={it.icon} size={19} color={isActive(it.href) ? "#B23F1E" : "#6E645C"} />
              {it.label}
            </Link>
          ))}

          {/* 更多下拉 */}
          <div ref={moreRef} style={{ position: "relative" }}>
            <button
              className={`wv-navlink${moreOpen || moreActive ? " on" : ""}`}
              onClick={() => setMoreOpen(v => !v)}
              aria-expanded={moreOpen}
            >
              更多
              <ELIcon
                name="chevron"
                size={15}
                color={moreOpen || moreActive ? "#B23F1E" : "#6E645C"}
                style={{ transform: "rotate(90deg)" }}
              />
            </button>
            {moreOpen && (
              <>
                <div onClick={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1 }} />
                <div
                  className="wv-menu"
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 2,
                    width: 268, background: "#fff", borderRadius: 16,
                    border: "1px solid #F0E6DE",
                    boxShadow: "0 20px 46px rgba(60,35,20,0.18)",
                    overflow: "hidden", padding: 8,
                  }}
                >
                  {MORE_ITEMS.map((it) => (
                    <Link
                      key={it.key}
                      href={it.href}
                      onClick={() => setMoreOpen(false)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12,
                        padding: "11px 12px", borderRadius: 12, textDecoration: "none",
                        color: "inherit",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FBF7F4")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{
                        width: 38, height: 38, borderRadius: 11, background: "#FFF4EF",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <ELIcon name={it.icon} size={20} color="#F26B43" />
                      </span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: "#241F1B" }}>{it.label}</span>
                        <span style={{ display: "block", fontSize: 13, color: "#6E645C", marginTop: 1 }}>{it.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* 右側工具列 */}
        <div className="wv-headright">
          {/* 字級（手機與桌面皆顯示） */}
          <button
            className="wv-pill"
            title="調整字級"
            aria-label="調整字級"
            style={{ width: 46, padding: 0, justifyContent: "center", flexShrink: 0 }}
            onClick={() => {
              const main = document.querySelector("main");
              if (!main) return;
              const current = parseFloat(main.style.zoom || "1");
              const scales = [1, 1.14, 1.3];
              const idx = scales.indexOf(current);
              const next = scales[(idx + 1) % scales.length];
              main.style.zoom = String(next);
              try { localStorage.setItem("el_font_scale", String(next)); } catch {}
            }}
          >
            <ELIcon name="textsize" size={20} color="#F26B43" />
          </button>

          {/* 區域選擇（桌面才顯示） */}
          <button
            className="wv-pill wv-hideSm"
            onClick={() => setRegionOpen(true)}
            title="選擇地區"
            style={{ gap: 6, maxWidth: 140 }}
          >
            <ELIcon name="pin" size={16} color="#F26B43" />
            <span style={{ fontSize: 14.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {regionLabel ?? "選擇地區"}
            </span>
          </button>

          {/* 登入/帳號 */}
          {user ? (
            <button
              className="wv-pill"
              onClick={() => setAcctOpen(true)}
              style={{ paddingLeft: 6, flexShrink: 0 }}
            >
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name || ""} style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, objectFit: "cover" }} />
              ) : (
                <span style={{
                  width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                  background: "linear-gradient(135deg,#FFB38F,#E0552E)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800,
                }}>
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </span>
              )}
              <span className="wv-hideSm" style={{ whiteSpace: "nowrap" }}>
                {user.name || user.email}
              </span>
            </button>
          ) : (
            <Link href="/login" className="wv-cta" style={{ flexShrink: 0 }}>
              <ELIcon name="user" size={19} color="#fff" /> 登入
            </Link>
          )}

          {/* 漢堡選單（手機） */}
          <button
            className="wv-pill wv-burger"
            onClick={() => setMobileOpen(true)}
            aria-label="開啟選單"
            style={{ width: 46, padding: 0, justifyContent: "center" }}
          >
            <ELIcon name="menu" size={22} color="#574E47" />
          </button>
        </div>
      </div>

      {/* 覆蓋層用 Portal 渲染到 body，避開 .wv-header 的 backdrop-filter 造成的 containing block 陷阱 */}
      {mounted && acctOpen && user && createPortal(
        <AccountMenu user={user} onClose={() => setAcctOpen(false)} onLogout={handleLogout} />,
        document.body
      )}
      {mounted && regionOpen && createPortal(
        <RegionModal onClose={handleRegionClose} />,
        document.body
      )}
      {mounted && mobileOpen && createPortal(
        <MobileMenu onClose={() => setMobileOpen(false)} currentPath={pathname} />,
        document.body
      )}
    </header>
  );
}
