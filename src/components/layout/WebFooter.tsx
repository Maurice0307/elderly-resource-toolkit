import Link from "next/link";
import { ELIcon } from "./ELIcon";

const NAV_ITEMS = [
  { label: "首頁",     href: "/" },
  { label: "資源查找", href: "/resources" },
  { label: "互動學習", href: "/activities" },
  { label: "今日新知", href: "/news" },
  { label: "互助問答", href: "/qa" },
];

const MORE_ITEMS = [
  { label: "提案專區",   href: "/propose" },
  { label: "分享好資源", href: "/submit" },
  { label: "使用教學",   href: "/guide" },
];

function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11, flexShrink: 0,
        background: "linear-gradient(135deg,#F2764F,#E0552E)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 10.5 L12 3 L21 10.5 V20 a1 1 0 0 1-1 1 H15 v-5 H9 v5 H4 a1 1 0 0 1-1-1 Z" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#241F1B", lineHeight: 1.1, letterSpacing: -0.3 }}>幸福好厝邊</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#B23F1E", letterSpacing: 3, lineHeight: 1.3 }}>ELDERLINK</div>
      </div>
    </div>
  );
}

export function WebFooter() {
  return (
    <footer style={{ marginTop: 64, borderTop: "1px solid #F0E6DE", background: "#fff" }}>
      <div
        className="wv-wrap"
        style={{
          padding: "40px 28px 30px",
          display: "flex",
          flexWrap: "wrap",
          gap: 40,
          justifyContent: "space-between",
        }}
      >
        {/* 品牌介紹 */}
        <div style={{ maxWidth: 320 }}>
          <BrandMark />
          <p style={{ marginTop: 14, fontSize: 15, color: "#6E645C", lineHeight: 1.7 }}>
            把分散各處的長輩照顧資源，整理成查得到、看得懂、用得上的一站式平台。
          </p>
        </div>

        {/* 功能連結 */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#6E645C", letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>
            功能
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {NAV_ITEMS.map((it) => (
              <Link key={it.href} href={it.href} className="wv-link" style={{ fontSize: 15.5 }}>
                {it.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 參與連結 */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#6E645C", letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>
            參與與幫助
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {MORE_ITEMS.map((it) => (
              <Link key={it.href} href={it.href} className="wv-link" style={{ fontSize: 15.5 }}>
                {it.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 聯絡 */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#6E645C", letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>
            聯絡我們
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 15.5, color: "#574E47" }}>
            <div style={{ fontWeight: 800, color: "#241F1B" }}>堉璘團隊 MC</div>
            <a
              href="tel:0968786545"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#574E47", textDecoration: "none" }}
            >
              <ELIcon name="phone" size={17} color="#F26B43" /> 0968 786 545
            </a>
            <a
              href="mailto:itchiang2025@gmail.com"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#574E47", textDecoration: "none" }}
            >
              <ELIcon name="mail" size={17} color="#F26B43" /> itchiang2025@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* 版權列 */}
      <div style={{ borderTop: "1px solid #F0E6DE" }}>
        <div
          className="wv-wrap"
          style={{
            padding: "16px 28px",
            fontSize: 13.5,
            color: "#6E645C",
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <span>© 2026 幸福好厝邊 ELDERLINK</span>
          <span>資源資料來源：各政府單位與公益機構公開資訊</span>
        </div>
      </div>
    </footer>
  );
}
