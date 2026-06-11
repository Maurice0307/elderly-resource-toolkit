import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";

/* 後台共用視覺套件 — 與手機版「社區管理」主控台同一套暖色卡片風格。
   手機 + 桌機共用，server / client 元件皆可 import。 */

export const AD = {
  page: "#FAF6F2",
  card: "#fff",
  border: "#F0E6DE",
  line: "#E4D7CC",
  ink: "#241F1B",
  sub: "#574E47",
  muted: "#9C8E84",
  coral: "#F26B43",
  coralDark: "#B23F1E",
  chip: "#FFF4EF",
} as const;

export type Tone = "coral" | "info" | "alert" | "ok" | "pending" | "neutral";

const TONE: Record<Tone, [string, string]> = {
  coral: ["#FFE0D2", "#B23F1E"],
  info: ["#EAF1FB", "#2A63C0"],
  alert: ["#FCEBEA", "#C0392B"],
  ok: ["#E7F6EC", "#1E9E54"],
  pending: ["#FEF1E2", "#B45309"],
  neutral: ["#F5F0E8", "#78716C"],
};

export function AdPill({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  const [bg, color] = TONE[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, background: bg, color, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

/* 按鈕樣式（給 server-action <form> 內的 <button> / <a> 直接套 style） */
const BTN: Record<Tone, [string, string, string]> = {
  coral: ["#F26B43", "#fff", "#F26B43"],
  info: ["#EAF1FB", "#2A63C0", "#CFE0F7"],
  alert: ["#FCEBEA", "#C0392B", "#F3C9C4"],
  ok: ["#E7F6EC", "#1E7A43", "#BDE8CC"],
  pending: ["#FEF1E2", "#B45309", "#F5DCBE"],
  neutral: ["#fff", "#574E47", "#E4D7CC"],
};

export function adBtn(tone: Tone = "neutral"): React.CSSProperties {
  const [bg, color, border] = BTN[tone];
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
    minHeight: 40, padding: "0 15px", borderRadius: 999,
    background: bg, color, border: `1.5px solid ${border}`,
    fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
    whiteSpace: "nowrap", textDecoration: "none", lineHeight: 1,
  };
}

/* 卡片 */
export function AdCard({ accent, children, style }: { accent?: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: AD.card,
        border: `1px solid ${AD.border}`,
        borderLeft: accent ? `4px solid ${AD.coral}` : undefined,
        borderRadius: 16,
        padding: "15px 16px",
        boxShadow: "0 2px 8px rgba(40,30,20,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* 小節標題 */
export function AdSectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 2px 12px" }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: AD.ink }}>{children}</span>
      {action}
    </div>
  );
}

/* 頁首：桌機顯示大標＋說明，手機只留動作列（標題由 AdminMobileHeader 提供） */
export function AdPageHead({ title, desc, actions }: { title: string; desc?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="wv-desktop-only">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: AD.ink, lineHeight: 1.2 }}>{title}</h1>
        {desc && <p style={{ marginTop: 4, fontSize: 15, color: AD.muted }}>{desc}</p>}
      </div>
      {actions && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }} className="wv-admin-actions">
          {actions}
        </div>
      )}
    </div>
  );
}

/* KPI 資料卡（統一線條圖示）。可當連結。 */
export function AdStat({
  icon, value, label, href, active, urgent,
}: { icon: string; value: number | string; label: string; href?: string; active?: boolean; urgent?: boolean }) {
  const inner = (
    <div
      style={{
        background: AD.card,
        border: active ? `2px solid ${AD.coral}` : `1px solid ${AD.border}`,
        borderRadius: 18, padding: "14px 15px", height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: AD.chip, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ELIcon name={icon} size={20} color={AD.coral} />
        </span>
        {urgent ? <span style={{ width: 8, height: 8, borderRadius: 999, background: "#E0552E" }} /> : <ELIcon name="chevron" size={18} color="#C8B8AE" />}
      </div>
      <div style={{ marginTop: 12, fontSize: 26, fontWeight: 800, color: AD.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 5, fontSize: 13, color: AD.muted, fontWeight: 600 }}>{label}</div>
    </div>
  );
  return href ? <Link href={href} style={{ display: "block", textDecoration: "none" }}>{inner}</Link> : inner;
}

/* 分段 / 篩選用的膠囊頁籤 */
export function AdTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        minHeight: 40, padding: "0 16px", borderRadius: 999,
        fontSize: 14.5, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap",
        background: active ? AD.coral : AD.card,
        color: active ? "#fff" : AD.sub,
        border: `1.5px solid ${active ? AD.coral : AD.line}`,
      }}
    >
      {children}
    </a>
  );
}

/* 資源排序選項（手機 / 桌機共用）*/
export const RESOURCE_SORTS: { key: string; label: string }[] = [
  { key: "new", label: "最新新增" },
  { key: "old", label: "最早新增" },
  { key: "verified", label: "最後認證時間" },
  { key: "category", label: "資源類別" },
  { key: "region", label: "縣市區域" },
  { key: "scope", label: "全國／地方" },
  { key: "name", label: "名稱" },
];

/* 空狀態 */
export function AdEmpty({ icon = "sparkle", title, desc }: { icon?: string; title: string; desc?: string }) {
  return (
    <div style={{ padding: "44px 24px", textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 999, background: AD.chip, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        <ELIcon name={icon} size={36} color={AD.coral} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: AD.ink }}>{title}</div>
      {desc && <p style={{ margin: "6px 0 0", fontSize: 15, color: AD.muted, lineHeight: 1.6 }}>{desc}</p>}
    </div>
  );
}
