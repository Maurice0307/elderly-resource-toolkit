import Link from "next/link";
import type { Resource } from "@/types/domain";

type Props = {
  resource: Pick<
    Resource,
    "id" | "name" | "summary" | "phone" | "address" | "scope" | "tags" | "like_count"
  >;
  href: string;
};

export function ResourceCard({ resource, href }: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl p-6 shadow-sm transition hover:shadow-md"
      style={{
        background: "var(--bg-elevated)",
        border: "2px solid var(--border)",
        borderLeftWidth: 6,
        borderLeftColor: "var(--cta)",
        minHeight: "var(--hit)",
      }}
    >
      {/* 標題列 */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-2xl font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {resource.name}
        </h3>
        <span
          className="mt-1 shrink-0 rounded-full px-3 py-1 text-sm font-semibold"
          style={
            resource.scope === "national"
              ? { background: "var(--bg-accent)", color: "#92400E" }
              : { background: "var(--success-soft)", color: "#065F46" }
          }
        >
          {resource.scope === "national" ? "全國" : "在地"}
        </span>
      </div>

      {/* 摘要 */}
      {resource.summary ? (
        <p
          className="mt-3 text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {resource.summary}
        </p>
      ) : null}

      {/* 電話 / 地址 */}
      <dl className="mt-4 space-y-2">
        {resource.phone ? (
          <div className="flex items-center gap-2">
            <dt className="icon-lg text-xl">📞</dt>
            <dd className="text-xl font-bold tracking-wide" style={{ color: "var(--cta)" }}>
              {resource.phone}
            </dd>
          </div>
        ) : null}
        {resource.address ? (
          <div className="flex items-start gap-2 text-base" style={{ color: "var(--text-secondary)" }}>
            <dt className="shrink-0">📍</dt>
            <dd>{resource.address}</dd>
          </div>
        ) : null}
      </dl>

      {/* 標籤 */}
      {resource.tags && resource.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {resource.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 text-sm font-medium"
              style={{ background: "var(--bg-accent)", color: "#92400E" }}
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div
        className="mt-5 text-base font-semibold transition group-hover:translate-x-1"
        style={{ color: "var(--cta)" }}
      >
        查看詳情 →
      </div>
    </Link>
  );
}
