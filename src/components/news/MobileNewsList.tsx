"use client";

import { useState } from "react";
import Link from "next/link";
import { ELIcon } from "@/components/layout/ELIcon";

export type NewsItem = {
  id: string;
  title: string;
  source_org: string;
  tags: string[];
  ago: string;
  image_url: string | null;
};

const TAG_MEDIA: Record<string, { bg: string; fg: string; icon: string }> = {
  健康:     { bg: "linear-gradient(135deg,#E7F4EC,#D1FAE5)", fg: "#2E7D52", icon: "health" },
  補助:     { bg: "linear-gradient(135deg,#FFF4EF,#FFE7DD)", fg: "#B23F1E", icon: "news" },
  防詐查證: { bg: "linear-gradient(135deg,#FFF1E8,#FFD6C7)", fg: "#C2410C", icon: "shield" },
  在地活動: { bg: "linear-gradient(135deg,#EDF2FF,#DBEAFE)", fg: "#2952B3", icon: "social" },
};
const FALLBACK = [
  { bg: "linear-gradient(135deg,#FFF4EF,#FFE7DD)", fg: "#B23F1E", icon: "news" },
  { bg: "linear-gradient(135deg,#E7F4EC,#D1FAE5)", fg: "#2E7D52", icon: "health" },
  { bg: "linear-gradient(135deg,#EDF2FF,#DBEAFE)", fg: "#2952B3", icon: "education" },
];

const TAG_PILL: Record<string, { bg: string; color: string }> = {
  健康:     { bg: "#E7F4EC", color: "#2E7D52" },
  補助:     { bg: "#FFF1E8", color: "#C2410C" },
  防詐查證: { bg: "#FDECEC", color: "#D9534F" },
  在地活動: { bg: "#EDF2FF", color: "#2952B3" },
};
function pill(tag: string) {
  return TAG_PILL[tag] ?? { bg: "#F0E6DE", color: "#6E645C" };
}
function media(item: NewsItem, idx: number) {
  const t = item.tags?.[0];
  return (t && TAG_MEDIA[t]) || FALLBACK[idx % FALLBACK.length];
}

function MediaBox({ item, idx, height, iconSize, radius, width }: { item: NewsItem; idx: number; height: number; iconSize: number; radius: number; width?: number }) {
  const m = media(item, idx);
  return (
    <div style={{ width, height, flexShrink: 0, borderRadius: radius, overflow: "hidden", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={item.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <ELIcon name={m.icon} size={iconSize} color={m.fg} />
      )}
    </div>
  );
}

function CatTag({ tag }: { tag: string }) {
  const p = pill(tag);
  return <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: p.bg, color: p.color }}>#{tag}</span>;
}

export function MobileNewsList({ news, tags }: { news: NewsItem[]; tags: string[] }) {
  const cats = ["全部", ...tags];
  const [cat, setCat] = useState("全部");
  const list = cat === "全部" ? news : news.filter((n) => (n.tags ?? []).includes(cat));
  const hero = list.find((n) => n.image_url) ?? list[0] ?? null;
  const rest = list.filter((n) => n !== hero);

  return (
    <div className="wv-mobile-only">
      {/* 分類 chip */}
      <div style={{ padding: "14px 18px 6px", display: "flex", gap: 8, overflowX: "auto" }}>
        {cats.map((c) => {
          const on = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                flexShrink: 0, padding: "8px 16px", borderRadius: 999, fontSize: 14.5, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", minHeight: 0, whiteSpace: "nowrap",
                background: on ? "#E0552E" : "#fff",
                color: on ? "#fff" : "#574E47",
                border: `1.5px solid ${on ? "#E0552E" : "#E4D7CC"}`,
              }}
            >
              {c === "全部" ? c : `#${c}`}
            </button>
          );
        })}
      </div>

      {/* 置頂大卡 */}
      {hero && (
        <div style={{ padding: "8px 18px 0" }}>
          <Link href={`/news/${hero.id}`} className="click" style={{ display: "block", background: "#fff", border: "1px solid #F0E6DE", borderRadius: 18, overflow: "hidden", textDecoration: "none", boxShadow: "0 2px 8px rgba(40,30,20,0.04)" }}>
            <MediaBox item={hero} idx={0} height={150} iconSize={56} radius={0} />
            <div style={{ padding: 15 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 9, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: "#E0552E", color: "#fff" }}>置頂</span>
                {(hero.tags ?? []).slice(0, 1).map((t) => <CatTag key={t} tag={t} />)}
              </div>
              <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{hero.title}</h2>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "#6E645C" }}>
                <ELIcon name="news" size={15} color="#9C8E84" /> {hero.source_org} · {hero.ago}
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 一般圖文列 */}
      <div style={{ padding: "6px 18px 22px" }}>
        {rest.map((n, i) => (
          <Link key={n.id} href={`/news/${n.id}`} className="click" style={{ display: "flex", gap: 13, padding: "14px 0", textDecoration: "none", borderTop: i === 0 ? "none" : "1px solid #F0E6DE" }}>
            <MediaBox item={n} idx={i + 1} width={96} height={76} iconSize={30} radius={12} />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                {(n.tags ?? []).slice(0, 1).map((t) => <CatTag key={t} tag={t} />)}
                {(n.tags ?? []).includes("防詐查證") && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: "#FDECEC", color: "#D9534F" }}>
                    <ELIcon name="shield" size={12} color="#D9534F" /> 查證
                  </span>
                )}
              </div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "#241F1B", lineHeight: 1.4 }}>{n.title}</div>
              <div style={{ marginTop: "auto", paddingTop: 7, fontSize: 13, color: "#6E645C" }}>{n.source_org} · {n.ago}</div>
            </div>
          </Link>
        ))}
      </div>

      {list.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 18px", color: "#6E645C" }}>
          <ELIcon name="news" size={44} color="#E4D7CC" style={{ margin: "0 auto 14px" }} />
          <p style={{ fontSize: 16, fontWeight: 700 }}>暫無符合的文章</p>
        </div>
      )}
    </div>
  );
}
