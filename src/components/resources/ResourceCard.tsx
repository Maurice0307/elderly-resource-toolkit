import Link from "next/link";
import type { ResourceListItem } from "@/lib/resources/queries";

type Props = { resource: ResourceListItem; href: string };

function LocBadge({ region, scope }: { region: ResourceListItem["region"]; scope: string }) {
  if (scope === "national") {
    return (
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--cta-ink)", background: "var(--cta-soft)", borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap" }}>
        全國
      </span>
    );
  }
  if (!region) return null;
  if (region.level === "district") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.75rem", fontWeight: 700, color: "var(--success)", background: "var(--success-soft)", borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap" }}>
        📍 你的地區
      </span>
    );
  }
  return (
    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1D4ED8", background: "#EFF6FF", borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap" }}>
      {region.name}
    </span>
  );
}

export function ResourceCard({ resource, href }: Props) {
  const borderColor =
    resource.scope === "national"
      ? "var(--cta)"
      : resource.region?.level === "district"
        ? "var(--success)"
        : "#1D4ED8";

  return (
    <Link
      href={href}
      style={{
        display: "block",
        background: "#fff",
        border: "1px solid var(--border)",
        borderLeft: `5px solid ${borderColor}`,
        borderRadius: 18,
        padding: "14px 16px",
        textDecoration: "none",
        boxShadow: "0 1px 4px rgba(36,31,27,0.04)",
      }}
    >
      {/* 標題 + 地區標籤 */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.4, flex: 1 }}>
          {resource.name}
        </h3>
        <LocBadge region={resource.region} scope={resource.scope} />
      </div>

      {/* 摘要 */}
      {resource.summary && (
        <p style={{ margin: "6px 0 0", fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
          {resource.summary}
        </p>
      )}

      {/* 電話 */}
      {resource.phone && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "var(--cta-soft)", border: "1px solid var(--bg-peach)", borderRadius: 12, padding: "10px 14px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--cta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 7.28 7.28l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--cta-ink)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>
            {resource.phone}
          </span>
        </div>
      )}

      {/* 地址 */}
      {resource.address && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", gap: 6, fontSize: "0.875rem", color: "var(--text-muted)" }}>
          <span style={{ flexShrink: 0 }}>📍</span>
          <span>{resource.address}</span>
        </div>
      )}

      {/* 標籤 */}
      {resource.tags && resource.tags.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {resource.tags.slice(0, 4).map((tag) => (
            <span key={tag} style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--cta-ink)", background: "var(--cta-soft)", borderRadius: 999, padding: "2px 9px" }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
