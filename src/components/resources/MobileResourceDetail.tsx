"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ELIcon } from "@/components/layout/ELIcon";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ReportButton } from "@/components/resources/ReportButton";
import { LikeButton } from "@/components/resources/LikeButton";

type Props = {
  resourceId: string;
  name: string;
  summary?: string | null;
  scope?: string | null;
  userId?: string | null;
  initialLiked?: boolean;
  address?: string | null;
  categoryName: string;
  categoryIcon: string;
  phone?: string | null;
  phoneHint?: string | null;
  websiteUrl?: string | null;
  sourceOrg?: string | null;
  tags?: string[] | null;
  likeCount?: number | null;
  lat?: number | null;
  lng?: number | null;
  backHref: string;
};

function countyOf(address?: string | null): string | null {
  if (!address) return null;
  const m = address.match(/^\s*(.{2}[縣市])/);
  return m ? m[1] : null;
}

/* 地區徽章（對齊設計稿 LocBadge：在地＝藍色 + 縣市名；全國＝珊瑚） */
function LocBadge({ scope, address }: { scope?: string | null; address?: string | null }) {
  const national = scope === "national";
  const label = national ? "全國" : (countyOf(address) || "在地");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: national ? "#FFE7DD" : "#EAF1FB", color: national ? "#B23F1E" : "#2A63C0" }}>
      {national ? <ELIcon name="shield" size={13} color="#B23F1E" /> : <ELIcon name="pin" size={13} color="#2A63C0" />} {label}
    </span>
  );
}

/* 小標籤（對齊設計稿 Tag） */
function Tag({ children, bg = "#FFF4EF", color = "#B23F1E" }: { children: React.ReactNode; bg?: string; color?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, color, fontSize: 13, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>{children}</span>
  );
}

/* 資訊列（對齊設計稿 InfoRow：圖示 chip + 標籤 + 內容 + 動作） */
function InfoRow({ icon, label, children, action }: { icon: string; label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderTop: "1px solid #F0E6DE" }}>
      <span style={{ width: 40, height: 40, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ELIcon name={icon} size={21} color="#F26B43" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#6E645C" }}>{label}</div>
        <div style={{ marginTop: 3, fontSize: 16, color: "#241F1B", lineHeight: 1.55 }}>{children}</div>
      </div>
      {action}
    </div>
  );
}

export function MobileResourceDetail(props: Props) {
  const { resourceId, name, summary, scope, address, categoryName, categoryIcon, phone, phoneHint, websiteUrl, sourceOrg, tags, likeCount, lat, lng, backHref, userId, initialLiked } = props;
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => { setMounted(true); setShareUrl(window.location.href); }, []);
  useEffect(() => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem("el_bookmarks") ?? "[]");
      if (list.includes(resourceId)) setSaved(true);
    } catch {}
  }, [resourceId]);

  const toggleSave = () => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem("el_bookmarks") ?? "[]");
      const i = list.indexOf(resourceId);
      if (i >= 0) { list.splice(i, 1); setSaved(false); } else { list.push(resourceId); setSaved(true); }
      localStorage.setItem("el_bookmarks", JSON.stringify(list));
    } catch {}
  };

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(backHref);
  };

  const tel = phone ? "tel:" + String(phone).replace(/[^0-9+]/g, "") : null;
  const mapsUrl = (lat != null && lng != null)
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + address)}` : null;

  const shareMore = websiteUrl || shareUrl;
  const shareMsg = [
    "📋 " + name,
    summary ? "　" + summary : null,
    phone ? "☎ 電話：" + phone + "（可直接點撥）" : null,
    address ? "📍 地址：" + address : null,
    "🔗 查看更多：" + shareMore,
    "—— 由「幸福好厝邊」分享，祝平安健康 🧡",
  ].filter(Boolean).join("\n");
  const lineUrl = "https://line.me/R/msg/text/?" + encodeURIComponent(shareMsg);
  const copyMsg = async () => {
    try { await navigator.clipboard.writeText(shareMsg); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <div style={{ background: "#fff" }}>
      {/* 返回列：返回 + 標題 + 收藏 / 分享 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE", background: "#fff" }}>
        <button onClick={goBack} aria-label="返回" style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0, fontSize: 22, fontWeight: 800, color: "#241F1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>服務詳情</div>
        <button onClick={toggleSave} aria-label="收藏" aria-pressed={saved} style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid " + (saved ? "#E0552E" : "#E4D7CC"), background: saved ? "#FFF4EF" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <ELIcon name="heart" size={21} color={saved ? "#B23F1E" : "#574E47"} />
        </button>
        <button onClick={() => setShareOpen(true)} aria-label="分享" style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <ELIcon name="send" size={20} color="#574E47" />
        </button>
        <LikeButton resourceId={resourceId} initialCount={likeCount ?? 0} initialLiked={!!initialLiked} userId={userId ?? null} compact />
      </div>

      {/* 標題區 */}
      <div style={{ padding: "18px 18px 20px", background: "linear-gradient(180deg,#FFF4EF 0%,#fff 100%)" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          <LocBadge scope={scope} address={address} />
          <Tag bg="#FFE7DD" color="#B23F1E"><ELIcon name={categoryIcon} size={13} color="#F26B43" /> {categoryName}</Tag>
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#241F1B", lineHeight: 1.35 }}>{name}</h1>
        {summary && <p style={{ margin: "10px 0 0", fontSize: 16, color: "#574E47", lineHeight: 1.6 }}>{summary}</p>}

        {/* 可信度標記 */}
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 7 }}>
          <Tag bg="#E7F4EC" color="#2E7D52"><ELIcon name="shield" size={13} color="#2E7D52" /> 政府／官方資源</Tag>
          <Tag><ELIcon name="check" size={12} color="#6E645C" /> 上次查證：本月查證</Tag>
          {likeCount != null && likeCount > 0 && (
            <Tag bg="#FFF4EF" color="#B23F1E"><ELIcon name="heart" size={12} color="#F26B43" /> {likeCount} 位厝邊說有用</Tag>
          )}
        </div>

        {/* 主要動作：撥打 */}
        {tel ? (
          <a href={tel} style={{ marginTop: 16, textDecoration: "none", display: "flex", alignItems: "center", gap: 10, minHeight: 56, padding: "0 18px", borderRadius: 14, background: "#E0552E", boxShadow: "0 6px 16px rgba(224,85,46,0.30)" }}>
            <ELIcon name="phone" size={24} color="#fff" />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>撥打電話洽詢</span>
            <span style={{ marginLeft: "auto", fontSize: 18, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{phone}</span>
          </a>
        ) : (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, minHeight: 52, padding: "0 16px", borderRadius: 12, border: "1.5px solid #E4D7CC", background: "#FBF7F4" }}>
            <ELIcon name="search" size={20} color="#F26B43" />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#574E47" }}>此服務以線上查詢為主</span>
          </div>
        )}
      </div>

      {/* 資訊列 */}
      <div style={{ padding: "2px 18px 6px" }}>
        <InfoRow icon={categoryIcon} label="服務範圍">
          {scope === "national" ? "全國皆可使用" : "在地服務" + (countyOf(address) ? "（" + countyOf(address) + "）" : "")}
        </InfoRow>
        {address && (
          <InfoRow icon="pin" label="地址" action={
            mapsUrl ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "8px 14px", borderRadius: 12, background: "#FFF4EF", border: "1.5px solid #FFD6C7", flexShrink: 0 }}>
                <ELIcon name="pin" size={20} color="#B23F1E" />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: "#B23F1E" }}>導航</span>
              </a>
            ) : undefined
          }>{address}</InfoRow>
        )}
        <InfoRow icon="qa" label="撥打前可以這樣說">
          {phoneHint || "先說清楚「您的情況」與「想申請或詢問什麼」，並記下要問的問題。"}
        </InfoRow>
        {websiteUrl && (
          <InfoRow icon="link" label="官方網站 · 資料來源" action={
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "8px 14px", borderRadius: 12, background: "#FFF4EF", border: "1.5px solid #FFD6C7", flexShrink: 0 }}>
              <ELIcon name="link" size={19} color="#B23F1E" />
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#B23F1E" }}>前往</span>
            </a>
          }>{sourceOrg || "點「前往」開啟官方網站查看最新資訊"}</InfoRow>
        )}
      </div>

      {/* 標籤 */}
      {tags && tags.length > 0 && (
        <div style={{ padding: "12px 18px 6px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map((t) => <Tag key={t}>#{t}</Tag>)}
        </div>
      )}

      {/* 次要動作：收藏 / 分享給家人 */}
      <div style={{ padding: "10px 18px 6px", display: "flex", gap: 10 }}>
        <button onClick={toggleSave} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px", borderRadius: 14, border: "1px solid " + (saved ? "#E0552E" : "#F0E6DE"), background: saved ? "#FFF4EF" : "#fff", font: "inherit", cursor: "pointer" }}>
          <ELIcon name="heart" size={21} color={saved ? "#B23F1E" : "#574E47"} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: saved ? "#B23F1E" : "#574E47" }}>{saved ? "已收藏" : "收藏"}</span>
        </button>
        <button onClick={() => setShareOpen(true)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px", borderRadius: 14, border: "1px solid #F0E6DE", background: "#fff", font: "inherit", cursor: "pointer" }}>
          <ELIcon name="send" size={21} color="#574E47" />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#574E47" }}>分享給家人</span>
        </button>
      </div>

      {/* 回報資料有誤 */}
      <div style={{ padding: "4px 18px 0" }}>
        <ReportButton subject={name} kind="resource" full />
      </div>

      {/* 提醒 */}
      <div style={{ padding: "14px 18px 26px" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#6E645C", lineHeight: 1.6 }}>
          資料整理自政府及民間公開資源。<br />資訊如有變動，請以實際撥打或官方公告為準。
        </p>
      </div>

      {/* 分享給家人 sheet（傳到 LINE / 複製資訊） */}
      {mounted && shareOpen && createPortal(
        <div onClick={() => setShareOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(28,18,12,0.55)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "#FBF7F4", borderRadius: "24px 24px 0 0", boxShadow: "0 -22px 60px rgba(0,0,0,0.28)", display: "flex", flexDirection: "column", maxHeight: "82dvh" }}>
            <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 18px 14px", borderBottom: "1px solid #EFE5DC" }}>
              <div style={{ paddingRight: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>分享給家人</div>
                <div style={{ fontSize: 12.5, color: "#6E645C", marginTop: 3, lineHeight: 1.5 }}>做成大字資訊卡，一鍵傳到 LINE</div>
              </div>
              <button onClick={() => setShareOpen(false)} aria-label="關閉" style={{ width: 38, height: 38, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <ELIcon name="close" size={20} color="#574E47" stroke={2.2} />
              </button>
            </div>
            <div style={{ overflowY: "auto", padding: "16px 18px calc(28px + env(safe-area-inset-bottom))" }}>
              {/* 資訊卡預覽 */}
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #FFD6C7", boxShadow: "0 6px 18px rgba(224,85,46,0.12)", marginBottom: 16 }}>
                <div style={{ background: "linear-gradient(120deg,#E0552E,#F26B43)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <BrandLogo size={20} color="#fff" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>幸福好厝邊 · 資源分享</span>
                </div>
                <div style={{ background: "#fff", padding: "14px 16px" }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: "#241F1B", lineHeight: 1.35 }}>{name}</div>
                  {phone && (
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 9, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name="phone" size={18} color="#F26B43" /></span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#B23F1E", fontVariantNumeric: "tabular-nums" }}>{phone}</span>
                    </div>
                  )}
                  {address && (
                    <div style={{ marginTop: 9, display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 9, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name="pin" size={18} color="#F26B43" /></span>
                      <span style={{ flex: 1, fontSize: 14.5, color: "#574E47", lineHeight: 1.5, paddingTop: 5 }}>{address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 傳到 LINE */}
              <a href={lineUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", textDecoration: "none", boxSizing: "border-box", minHeight: 64, padding: "0 16px", borderRadius: 14, background: "#06C755", marginBottom: 11, boxShadow: "0 6px 16px rgba(6,199,85,0.28)" }}>
                <span style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name="chat" size={24} color="#fff" /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#fff" }}>傳到 LINE 聊天室</span>
                  <span style={{ display: "block", marginTop: 1, fontSize: 13, color: "rgba(255,255,255,0.9)" }}>含電話（可直接點撥）與查看更多連結</span>
                </span>
                <ELIcon name="chevron" size={20} color="rgba(255,255,255,0.85)" />
              </a>

              {/* 複製 */}
              <button onClick={copyMsg} style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", textAlign: "left", font: "inherit", cursor: "pointer", minHeight: 60, padding: "0 16px", borderRadius: 14, background: "#fff", border: "1.5px solid #E4D7CC" }}>
                <span style={{ width: 42, height: 42, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name={copied ? "check" : "copy"} size={22} color={copied ? "#2E7D52" : "#F26B43"} /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: copied ? "#2E7D52" : "#241F1B" }}>{copied ? "已複製資訊" : "複製資訊"}</span>
                  <span style={{ display: "block", marginTop: 1, fontSize: 13, color: "#6E645C" }}>貼到任何聊天軟體或簡訊</span>
                </span>
                <ELIcon name="chevron" size={20} color="#6E645C" />
              </button>

              <p style={{ margin: "14px 2px 0", fontSize: 12, color: "#6E645C", lineHeight: 1.6, textAlign: "center" }}>分享不會傳出您的個人資料。</p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
