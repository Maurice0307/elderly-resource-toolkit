"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ELIcon } from "./ELIcon";

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

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: "linear-gradient(135deg,#F2764F,#E0552E)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(224,85,46,0.32)",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 10.5 L12 3 L21 10.5 V20 a1 1 0 0 1-1 1 H15 v-5 H9 v5 H4 a1 1 0 0 1-1-1 Z" />
        </svg>
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/location/regions")
      .then((r) => r.json())
      .then((data) => { setCounties(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function selectDistrict(code: string, name: string) {
    setSaving(true);
    try {
      await fetch("/api/location/set", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      localStorage.setItem("el_region_label", name);
      localStorage.setItem("el_region_code", code);
    } catch { /* ignore */ }
    onClose(name);
  }

  async function clearRegion() {
    try {
      await fetch("/api/location/set", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: "" }) });
      localStorage.removeItem("el_region_label");
      localStorage.removeItem("el_region_code");
    } catch { /* ignore */ }
    onClose(undefined);
  }

  return (
    <div
      onClick={() => onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(28,18,12,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 22, boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
          width: "min(480px, 94vw)", maxHeight: "78vh", display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* 頭 */}
        <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F0E6DE" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <ELIcon name="pin" size={20} color="#F26B43" />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#241F1B" }}>選擇你的地區</span>
          </div>
          <button onClick={() => onClose()} style={{ border: "none", background: "#FAF7F5", width: 36, height: 36, borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ELIcon name="close" size={18} color="#574E47" />
          </button>
        </div>
        {/* 列表 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#9B8E85", fontSize: 15 }}>載入地區資料⋯</div>
          ) : counties.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#9B8E85", fontSize: 15 }}>無法取得地區資料</div>
          ) : (
            counties.map((county) => (
              <div key={county.code}>
                <button
                  onClick={() => setOpenCounty(openCounty === county.code ? null : county.code)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent",
                    cursor: "pointer", font: "inherit", fontSize: 16, fontWeight: 800, color: "#241F1B",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF7F5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {county.name}
                  <ELIcon name="chevron" size={16} color="#9B8E85" style={{ transform: openCounty === county.code ? "rotate(270deg)" : "rotate(90deg)", transition: "transform 0.2s" }} />
                </button>
                {openCounty === county.code && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, padding: "4px 8px 10px" }}>
                    {county.districts.map((d) => (
                      <button
                        key={d.code}
                        disabled={saving}
                        onClick={() => selectDistrict(d.code, d.name)}
                        style={{
                          padding: "9px 6px", borderRadius: 10, border: "1.5px solid #E4D7CC",
                          background: "#fff", cursor: "pointer", font: "inherit",
                          fontSize: 14.5, fontWeight: 700, color: "#574E47",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#FFF4EF"; e.currentTarget.style.borderColor = "#F26B43"; e.currentTarget.style.color = "#B23F1E"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#E4D7CC"; e.currentTarget.style.color = "#574E47"; }}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {/* 底部：清除按鈕 */}
        <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #F0E6DE" }}>
          <button
            onClick={clearRegion}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 12,
              border: "1.5px solid #E4D7CC", background: "#fff",
              cursor: "pointer", font: "inherit", fontSize: 15, fontWeight: 700, color: "#574E47",
            }}
          >
            顯示全部地區（不篩選）
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

function AccountMenu({ user, onClose, onLogout }: { user: { email?: string; name?: string }; onClose: () => void; onLogout: () => void }) {
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
          <div style={{
            width: 46, height: 46, borderRadius: 999, flexShrink: 0,
            background: "linear-gradient(135deg,#FFB38F,#E0552E)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800,
          }}>{initial}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>{user.name || "使用者"}</div>
            <div style={{ fontSize: 13.5, color: "#B23F1E", fontWeight: 700 }}>{user.email}</div>
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
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("el_region_label");
    if (saved) setRegionLabel(saved);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: { email?: string; user_metadata?: Record<string, string> } | null } }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: { email?: string; user_metadata?: Record<string, string> } } | null) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
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
          {/* 字級（桌面才顯示） */}
          <button
            className="wv-pill wv-hideSm"
            title="調整字級"
            aria-label="調整字級"
            style={{ width: 46, padding: 0, justifyContent: "center" }}
            onClick={() => {
              const main = document.querySelector("main");
              if (!main) return;
              const current = parseFloat(main.style.zoom || "1");
              const scales = [1, 1.14, 1.3];
              const idx = scales.indexOf(current);
              main.style.zoom = String(scales[(idx + 1) % scales.length]);
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
              <span style={{
                width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                background: "linear-gradient(135deg,#FFB38F,#E0552E)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800,
              }}>
                {(user.name || user.email || "?")[0].toUpperCase()}
              </span>
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

      {acctOpen && user && (
        <AccountMenu user={user} onClose={() => setAcctOpen(false)} onLogout={handleLogout} />
      )}
      {regionOpen && (
        <RegionModal onClose={handleRegionClose} />
      )}
      {mobileOpen && (
        <MobileMenu onClose={() => setMobileOpen(false)} currentPath={pathname} />
      )}
    </header>
  );
}
