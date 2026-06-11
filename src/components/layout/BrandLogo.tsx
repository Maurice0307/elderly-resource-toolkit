/* 品牌標誌「厝中之鏈」（Mark2）僅圖示版：家屋輪廓內含節點連線（link）。
   座標／線寬對齊既有的 ElderLinkLogo，確保全站 logo 一致。純 SVG，可用於 server / client。 */
export function BrandLogo({ size = 24, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden style={{ display: "block" }}>
      <path d="M9 21 L24 8 L39 21 L39 40 L9 40 Z" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="17.5" y1="32.5" x2="30.5" y2="25.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="17.5" cy="32.5" r="2.8" fill={color} />
      <circle cx="30.5" cy="25.5" r="2.8" fill={color} />
    </svg>
  );
}
