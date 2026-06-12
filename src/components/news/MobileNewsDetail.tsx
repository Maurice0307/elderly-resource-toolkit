"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ELIcon } from "@/components/layout/ELIcon";
import { ReportButton } from "@/components/resources/ReportButton";

export type RelatedItem = {
  id: string;
  title: string;
  source_org: string;
  tags: string[];
  image_url: string | null;
};

type Props = {
  id: string;
  title: string;
  source_org: string;
  ago: string;
  tags: string[];
  image_url: string | null;
  source_url: string | null;
  lead: string | null;
  bodyParas: string[];
  bullets: string[];
  related: RelatedItem[];
};

const TAG_MEDIA: Record<string, { bg: string; fg: string; icon: string }> = {
  健康:     { bg: "linear-gradient(135deg,#E7F4EC,#D1FAE5)", fg: "#2E7D52", icon: "health" },
  補助:     { bg: "linear-gradient(135deg,#FFF4EF,#FFE7DD)", fg: "#B23F1E", icon: "news" },
  防詐查證: { bg: "linear-gradient(135deg,#FFF1E8,#FFD6C7)", fg: "#C2410C", icon: "shield" },
  在地活動: { bg: "linear-gradient(135deg,#EDF2FF,#DBEAFE)", fg: "#2952B3", icon: "social" },
};
const FALLBACK = { bg: "linear-gradient(135deg,#FFF4EF,#FFE7DD)", fg: "#B23F1E", icon: "news" };
function mediaOf(tags: string[]) {
  return TAG_MEDIA[tags?.[0]] ?? FALLBACK;
}
const TAG_PILL: Record<string, { bg: string; color: string }> = {
  健康:     { bg: "#E7F4EC", color: "#2E7D52" },
  補助:     { bg: "#FFF1E8", color: "#C2410C" },
  防詐查證: { bg: "#FDECEC", color: "#D9534F" },
  在地活動: { bg: "#EDF2FF", color: "#2952B3" },
};
function pill(tag: string) {
  return TAG_PILL[tag] ?? { bg: "#F0E6DE", color: "#6E645C" };
}

function IconBtn({ name, label, color, onClick }: { name: string; label: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
      <ELIcon name={name} size={20} color={color} />
    </button>
  );
}

export function MobileNewsDetail(props: Props) {
  const { title, source_org, ago, tags, image_url, source_url, lead, bodyParas, bullets, related } = props;
  const router = useRouter();
  const m = mediaOf(tags);
  const isVerify = (tags ?? []).includes("防詐查證");

  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const saveKey = `news:${props.id}`;

  useEffect(() => {
    setShareUrl(window.location.href);
    try {
      setSaved(localStorage.getItem(saveKey) === "1");
    } catch {}
  }, [saveKey]);

  const toggleSave = () => {
    setSaved((v) => {
      const nv = !v;
      try {
        if (nv) localStorage.setItem(saveKey, "1");
        else localStorage.removeItem(saveKey);
      } catch {}
      return nv;
    });
  };

  const back = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/news");
  };

  const shareMsg = `${title}｜幸福好厝邊 今日新知`;
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`${shareMsg}\n${shareUrl}`)}`;
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMsg}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const shareSheet =
    shareOpen && typeof document !== "undefined"
      ? createPortal(
          <div onClick={() => setShareOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "#fff", borderRadius: "22px 22px 0 0", padding: "20px 18px calc(20px + env(safe-area-inset-bottom))" }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "#E4D7CC", margin: "0 auto 16px" }} />
              <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 14 }}>分享給家人</div>
              <a href={lineUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "#06C755", color: "#fff", borderRadius: 14, padding: "14px 16px", fontSize: 16, fontWeight: 800, textDecoration: "none", marginBottom: 10 }}>
                <ELIcon name="send" size={20} color="#fff" /> 傳到 LINE
              </a>
              <button onClick={copyShare} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "#FFF4EF", color: "#B23F1E", border: "1px solid #FFD6C7", borderRadius: 14, padding: "14px 16px", fontSize: 16, fontWeight: 800, cursor: "pointer", minHeight: 0 }}>
                <ELIcon name="chat" size={20} color="#B23F1E" /> {copied ? "已複製！" : "複製連結"}
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="wv-mobile-only" style={{ background: "#fff", minHeight: "100%" }}>
      {/* 返回列 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE", background: "#fff" }}>
        <button onClick={back} aria-label="返回" style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0, fontSize: 22, fontWeight: 800, color: "#241F1B" }}>今日新知</div>
        <IconBtn name="heart" label="收藏" color={saved ? "#B23F1E" : "#574E47"} onClick={toggleSave} />
        <IconBtn name="send" label="分享" color="#574E47" onClick={() => setShareOpen(true)} />
      </div>

      {/* 配圖 */}
      <div style={{ height: 170, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image_url} alt={title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <ELIcon name={m.icon} size={64} color={m.fg} />
        )}
      </div>

      {/* 標題區 */}
      <div style={{ padding: "16px 18px 0" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {(tags ?? []).slice(0, 1).map((t) => {
            const p = pill(t);
            return <span key={t} style={{ fontSize: 12.5, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: p.bg, color: p.color }}>#{t}</span>;
          })}
          <span style={{ fontSize: 12.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#F0E6DE", color: "#6E645C" }}>{source_org}</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{title}</h1>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#6E645C", paddingBottom: 14, borderBottom: "1px solid #F0E6DE" }}>
          <ELIcon name="news" size={15} color="#9C8E84" /> {source_org} · {ago}
        </div>
        {lead && <p style={{ margin: "16px 0 0", fontSize: 16.5, fontWeight: 600, color: "#241F1B", lineHeight: 1.8 }}>{lead}</p>}
        {bodyParas.map((p, i) => (
          <p key={i} style={{ margin: "14px 0 0", fontSize: 16, color: "#574E47", lineHeight: 1.8 }}>{p}</p>
        ))}
      </div>

      {/* 重點整理 */}
      {bullets.length > 0 && (
        <div style={{ padding: "18px 18px 6px" }}>
          <div style={{ background: "#FFF4EF", border: "1px solid #FFE0D2", borderRadius: 18, padding: "15px 16px" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 10 }}>重點整理</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
              {bullets.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 9, fontSize: 16, color: "#574E47", lineHeight: 1.55 }}>
                  <ELIcon name="check" size={20} color="#1E9E54" stroke={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ flex: 1 }}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 查證提醒 */}
      {isVerify && (
        <div style={{ padding: "12px 18px 6px" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#FDECEC", borderRadius: 14, padding: "13px 15px" }}>
            <ELIcon name="shield" size={20} color="#D9534F" style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13.5, color: "#7A4A45", lineHeight: 1.6 }}>
              收到類似訊息先別急著相信或轉傳。可撥打 165 反詐騙專線，或到官方網站確認，再決定怎麼做。
            </span>
          </div>
        </div>
      )}

      {/* 原始來源 */}
      {source_url && (
        <div style={{ padding: "14px 18px 4px" }}>
          <a href={source_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: "#fff", border: "1.5px solid #EADFD5", borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ELIcon name="link" size={21} color="#F26B43" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#241F1B" }}>前往原始來源</div>
              <div style={{ marginTop: 2, fontSize: 13, color: "#6E645C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{source_org}（開啟原始網站查看完整內容）</div>
            </div>
            <ELIcon name="chevron" size={20} color="#9C8E84" />
          </a>
        </div>
      )}

      {/* 底部動作：收藏 / 回報 / 看別則新知（回上頁） */}
      <div style={{ padding: "14px 18px 4px", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={toggleSave} style={{ flex: "1 1 0", minWidth: 96, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 46, borderRadius: 999, border: `1.5px solid ${saved ? "#F2B79E" : "#E4D7CC"}`, background: saved ? "#FFF4EF" : "#fff", color: saved ? "#B23F1E" : "#574E47", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <ELIcon name="heart" size={19} color={saved ? "#B23F1E" : "#6E645C"} /> {saved ? "已收藏" : "收藏"}
        </button>
        <div style={{ flex: "1 1 0", minWidth: 96, display: "flex" }}>
          <ReportButton subject={title} kind="news" full />
        </div>
        <button onClick={back} style={{ flex: "1 1 0", minWidth: 110, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 46, borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff", color: "#574E47", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <ELIcon name="news" size={18} color="#6E645C" /> 看別則新知
        </button>
      </div>

      {/* 延伸閱讀 */}
      {related.length > 0 && (
        <>
          <div style={{ padding: "18px 18px 8px", fontSize: 18, fontWeight: 800, color: "#241F1B" }}>延伸閱讀</div>
          <div style={{ padding: "0 18px 28px", display: "flex", flexDirection: "column", gap: 11 }}>
            {related.slice(0, 3).map((r) => {
              const rm = mediaOf(r.tags ?? []);
              return (
                <button key={r.id} onClick={() => router.push(`/news/${r.id}`)} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #F0E6DE", borderRadius: 16, padding: 12, cursor: "pointer", textAlign: "left", fontFamily: "inherit", minHeight: 0, boxShadow: "0 2px 8px rgba(40,30,20,0.04)" }}>
                  <div style={{ width: 64, height: 52, borderRadius: 10, overflow: "hidden", background: rm.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt={r.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <ELIcon name={rm.icon} size={24} color={rm.fg} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: "#241F1B", lineHeight: 1.4 }}>{r.title}</div>
                    <div style={{ marginTop: 4, fontSize: 13, color: "#6E645C" }}>{r.source_org}</div>
                  </div>
                  <ELIcon name="chevron" size={20} color="#9C8E84" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {shareSheet}
    </div>
  );
}
