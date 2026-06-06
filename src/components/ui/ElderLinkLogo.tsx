/* 幸福好厝邊 品牌標誌 — 厝中之鏈（Mark 2）
   家屋輪廓內含節點連線：好厝邊（家/鄰里）× Link（連結） */

interface LogoProps {
  /** 整體寬度，高度按比例縮放 */
  size?: number;
  /** 圖示底色（預設珊瑚橘方塊） */
  iconBg?: string;
  /** 是否顯示文字 lockup（中英） */
  showText?: boolean;
  /** 深色底版本（圖示/文字改白） */
  inverse?: boolean;
  className?: string;
}

export function ElderLinkLogo({
  size = 36,
  iconBg = "#E0552E",
  showText = true,
  inverse = false,
  className,
}: LogoProps) {
  const textColor = inverse ? "#FFFFFF" : "#241F1B";
  const iconSize = size;
  const iconRadius = Math.round(iconSize * 0.22);

  return (
    <div
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: Math.round(iconSize * 0.3) }}
    >
      {/* 圖示方塊：珊瑚底 + 厝中之鏈 SVG */}
      <div
        aria-hidden
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: iconRadius,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: inverse ? "none" : "0 4px 12px rgba(224,85,46,0.32)",
        }}
      >
        <svg
          viewBox="0 0 48 48"
          width={Math.round(iconSize * 0.64)}
          height={Math.round(iconSize * 0.64)}
          fill="none"
          aria-hidden
        >
          {/* 家屋輪廓 */}
          <path
            d="M9 21 L24 8 L39 21 L39 40 L9 40 Z"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* 連線（link） */}
          <line
            x1="17.5" y1="32.5"
            x2="30.5" y2="25.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* 節點 */}
          <circle cx="17.5" cy="32.5" r="2.8" fill="white" />
          <circle cx="30.5" cy="25.5" r="2.8" fill="white" />
        </svg>
      </div>

      {/* 文字 lockup */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* 主名稱 */}
          <span
            style={{
              fontSize: Math.round(iconSize * 0.5),
              fontWeight: 800,
              color: textColor,
              letterSpacing: "-0.01em",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            幸福好厝邊
          </span>
          {/* 英文名，兩端對齊對應中文寬度 */}
          <span
            aria-label="ELDERLINK"
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: Math.round(iconSize * 0.24),
              fontWeight: 700,
              color: inverse ? "rgba(255,255,255,0.7)" : "#B23F1E",
              letterSpacing: "0.18em",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {"ELDERLINK".split("").map((ch, i) => (
              <span key={i}>{ch}</span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

/** 僅圖示，無文字（favicon / app icon 情境） */
export function ElderLinkIcon({ size = 32, bg = "#E0552E" }: { size?: number; bg?: string }) {
  return <ElderLinkLogo size={size} iconBg={bg} showText={false} />;
}
