"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ELIcon } from "@/components/layout/ELIcon";
import { ReportButton } from "@/components/resources/ReportButton";

export type FlowStep = {
  order: number;
  title: string;
  description: string;
  image_url?: string | null;
  video_url?: string | null;
  tip?: string | null;
};

export type FlowNext = { slug: string; title: string; icon: string; steps: number; mins: number | null };

type Props = {
  slug: string;
  title: string;
  summary?: string | null;
  heroImage?: string | null;
  videoUrl?: string | null;
  durationMin?: number | null;
  materials: string[];
  steps: FlowStep[];
  themeIcon: string;
  nextCards: FlowNext[];
};

function ytId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function ytThumb(url?: string | null): string | null {
  const id = ytId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/* 圖卡 / 步驟媒體：有影片→縮圖＋播放鈕，點擊嵌入 YouTube 播放；無影片有圖→照片；都沒有→主題圖示 */
function PlayableMedia({ videoUrl, poster, height, label, themeIcon }: { videoUrl?: string | null; poster?: string | null; height: number; label?: string; themeIcon: string }) {
  const [playing, setPlaying] = useState(false);
  const vid = ytId(videoUrl);
  if (playing && vid) {
    return (
      <div style={{ height, borderRadius: 16, overflow: "hidden", background: "#000" }}>
        <iframe title="教學影片" src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; fullscreen" allowFullScreen style={{ width: "100%", height: "100%", border: "none", display: "block" }} />
      </div>
    );
  }
  const src = poster ?? (vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null);
  return (
    <div style={{ position: "relative", height, borderRadius: 16, overflow: "hidden", background: src ? undefined : "linear-gradient(135deg,#FFE7DD,#FFF4EF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <ELIcon name={themeIcon} size={Math.min(height * 0.34, 64)} color="#F26B43" />
      )}
      {vid && (
        <button onClick={() => setPlaying(true)} aria-label="播放影片" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "rgba(20,12,8,0.12)", cursor: "pointer" }}>
          <span style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.94)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#E0552E" style={{ marginLeft: 3 }}><path d="M6 4.5v15l13-7.5z" /></svg>
          </span>
        </button>
      )}
      {label && !vid && <span style={{ position: "absolute", bottom: 10, right: 10, fontSize: 12, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.5)", padding: "3px 10px", borderRadius: 6 }}>{label}</span>}
    </div>
  );
}

/* 手機版互動圖卡引導流程：封面 → 一步一頁 → 完成（對齊設計稿 CardCover / CardViewer / CardDone） */
export function ActivityFlow({ slug, title, summary, heroImage, videoUrl, durationMin, materials, steps, themeIcon, nextCards }: Props) {
  const router = useRouter();
  // phase: "cover" | step index | "done"
  const [phase, setPhase] = useState<"cover" | number | "done">("cover");
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const total = steps.length || 1;
  const cover = heroImage ?? ytThumb(videoUrl);

  useEffect(() => { setShareUrl(window.location.href); }, []);

  const back = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/activities");
  };

  const shareMsg = [
    "📋 互動圖卡：" + title,
    summary ? "　" + summary : null,
    "🔗 跟著做：" + (shareUrl || ""),
    "—— 由「幸福好厝邊」分享 🧡",
  ].filter(Boolean).join("\n");
  const lineUrl = "https://line.me/R/msg/text/?" + encodeURIComponent(shareMsg);
  const copyShare = async () => { try { await navigator.clipboard.writeText(shareMsg); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };

  // 右上角動作：收藏 + 分享（封面與完成頁用）
  const headerActions = (withSave: boolean) => (
    <div style={{ display: "flex", gap: 8 }}>
      {withSave && (
        <button onClick={() => setSaved((v) => !v)} aria-label="收藏" aria-pressed={saved} style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid " + (saved ? "#E0552E" : "#E4D7CC"), background: saved ? "#FFF4EF" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <ELIcon name="heart" size={20} color={saved ? "#B23F1E" : "#574E47"} />
        </button>
      )}
      <button onClick={() => setShareOpen(true)} aria-label="分享" style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
        <ELIcon name="send" size={20} color="#574E47" />
      </button>
    </div>
  );

  // 分享 sheet（傳到 LINE / 複製）
  const shareSheet = (typeof window !== "undefined" && shareOpen) ? createPortal(
    <div onClick={() => setShareOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(28,18,12,0.55)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "#FBF7F4", borderRadius: "24px 24px 0 0", boxShadow: "0 -22px 60px rgba(0,0,0,0.28)", padding: "18px 18px calc(22px + env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#241F1B" }}>分享給家人</div>
            <div style={{ fontSize: 12.5, color: "#6E645C", marginTop: 3 }}>把這張圖卡傳給家人一起做</div>
          </div>
          <button onClick={() => setShareOpen(false)} aria-label="關閉" style={{ width: 38, height: 38, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <ELIcon name="close" size={20} color="#574E47" stroke={2.2} />
          </button>
        </div>
        <a href={lineUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 13, minHeight: 60, padding: "0 16px", borderRadius: 14, background: "#06C755", marginBottom: 11, textDecoration: "none", boxShadow: "0 6px 16px rgba(6,199,85,0.28)" }}>
          <span style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name="chat" size={24} color="#fff" /></span>
          <span style={{ flex: 1, fontSize: 17, fontWeight: 800, color: "#fff" }}>傳到 LINE 聊天室</span>
          <ELIcon name="chevron" size={20} color="rgba(255,255,255,0.85)" />
        </a>
        <button onClick={copyShare} style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", minHeight: 56, padding: "0 16px", borderRadius: 14, background: "#fff", border: "1.5px solid #E4D7CC", cursor: "pointer", font: "inherit" }}>
          <span style={{ width: 42, height: 42, borderRadius: 11, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ELIcon name={copied ? "check" : "copy"} size={22} color={copied ? "#2E7D52" : "#F26B43"} /></span>
          <span style={{ flex: 1, textAlign: "left", fontSize: 17, fontWeight: 800, color: copied ? "#2E7D52" : "#241F1B" }}>{copied ? "已複製" : "複製資訊"}</span>
        </button>
      </div>
    </div>,
    document.body,
  ) : null;

  /* ── 完成頁 ── */
  if (phase === "done") {
    return (
      <div style={{ background: "#fff", minHeight: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE" }}>
          <button onClick={() => router.push("/activities")} aria-label="關閉" style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <ELIcon name="close" size={20} color="#574E47" stroke={2.2} />
          </button>
          <div style={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 800, color: "#241F1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          {headerActions(false)}
        </div>
        {shareSheet}

        <div style={{ padding: "24px 18px 0", textAlign: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: 999, background: "#E7F4EC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <ELIcon name="check" size={48} color="#2E7D52" stroke={2.4} />
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "#241F1B" }}>完成了，做得很好！</h1>
          <p style={{ margin: 0, fontSize: 16, color: "#574E47", lineHeight: 1.7 }}>「{title}」完成。可以拍張照紀錄，下次再試試其他主題！</p>
        </div>

        {nextCards.length > 0 && (
          <div style={{ padding: "24px 18px 0" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 12 }}>接著試試這些</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {nextCards.map((c) => (
                <button key={c.slug} type="button" onClick={() => router.push(`/activities/${c.slug}`)} style={{ display: "flex", alignItems: "center", gap: 13, background: "#fff", border: "1px solid #F0E6DE", borderRadius: 18, padding: 13, boxShadow: "0 2px 8px rgba(40,30,20,0.04)", cursor: "pointer", font: "inherit", textAlign: "left", width: "100%" }}>
                  <span style={{ width: 46, height: 46, borderRadius: 13, background: "#FFF4EF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ELIcon name={c.icon} size={24} color="#F26B43" />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: "#241F1B" }}>{c.title}</span>
                    <span style={{ display: "block", marginTop: 3, fontSize: 13, color: "#6E645C" }}>{c.steps} 步驟 · 約 {c.mins ?? 15} 分</span>
                  </span>
                  <ELIcon name="chevron" size={20} color="#CBBFB5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 回報問題 */}
        <div style={{ display: "flex", justifyContent: "center", padding: "22px 18px 0" }}>
          <ReportButton subject={title} kind="activity" />
        </div>

        <div style={{ display: "flex", gap: 10, padding: "14px 18px calc(20px + env(safe-area-inset-bottom))" }}>
          <button type="button" onClick={() => setSaved((v) => !v)} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 999, border: "1.5px solid " + (saved ? "#E0552E" : "#E4D7CC"), background: saved ? "#FFF4EF" : "#fff", color: saved ? "#B23F1E" : "#574E47", fontSize: 16, fontWeight: 800, cursor: "pointer", font: "inherit" }}>
            <ELIcon name="heart" size={19} color={saved ? "#F26B43" : "#6E645C"} /> {saved ? "已收藏" : "收藏"}
          </button>
          <button type="button" onClick={() => router.push("/activities")} style={{ flex: 1.4, height: 52, borderRadius: 999, border: "none", background: "#E0552E", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", font: "inherit", boxShadow: "0 6px 16px rgba(224,85,46,0.26)" }}>
            回圖卡列表
          </button>
        </div>
      </div>
    );
  }

  /* ── 逐步檢視 ── */
  if (typeof phase === "number") {
    const i = phase;
    const s = steps[i] ?? { order: i + 1, title: "", description: "" };
    const stepImg = s.image_url ?? ytThumb(s.video_url) ?? cover;
    const prev = () => { if (i > 0) setPhase(i - 1); else setPhase("cover"); };
    const next = () => { if (i < total - 1) setPhase(i + 1); else setPhase("done"); };
    return (
      <div style={{ background: "#fff", minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE" }}>
          <button onClick={prev} aria-label="上一步" style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <div style={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 800, color: "#241F1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#6E645C", whiteSpace: "nowrap" }}>{i + 1} / {total}</span>
        </div>

        <div style={{ padding: "14px 18px 0", flex: 1 }}>
          {/* 進度條 */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {steps.map((_, k) => (
              <span key={k} style={{ flex: 1, height: 6, borderRadius: 3, background: k <= i ? "#E0552E" : "#E4D7CC" }} />
            ))}
          </div>
          <PlayableMedia videoUrl={s.video_url} poster={stepImg} height={210} label={`步驟 ${i + 1}`} themeIcon={themeIcon} />
          <div style={{ marginTop: 18, display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: "#E0552E", color: "#fff", fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{s.title}</h1>
              <p style={{ margin: "8px 0 0", fontSize: 16.5, color: "#574E47", lineHeight: 1.75 }}>{s.description}</p>
              {s.tip && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, background: "#FFF4EF", borderRadius: 12, padding: "11px 13px" }}>
                  <ELIcon name="bulb" size={18} color="#F26B43" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ flex: 1, fontSize: 14.5, color: "#574E47", lineHeight: 1.6 }}>{s.tip}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, borderTop: "1px solid #F0E6DE", padding: "12px 18px calc(12px + env(safe-area-inset-bottom))", background: "#fff" }}>
          <button type="button" onClick={prev} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, minWidth: 110, height: 52, borderRadius: 999, border: "1.5px solid #E4D7CC", background: "#fff", color: "#574E47", fontSize: 16, fontWeight: 800, cursor: "pointer", font: "inherit" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#574E47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg> {i > 0 ? "上一張" : "返回"}
          </button>
          <button type="button" onClick={next} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, height: 52, borderRadius: 999, border: "none", background: "#E0552E", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", font: "inherit", boxShadow: "0 6px 16px rgba(224,85,46,0.26)" }}>
            {i < total - 1 ? "下一張" : "完成"} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    );
  }

  /* ── 封面（介紹 + 材料 + 步驟總覽） ── */
  return (
    <div style={{ background: "#fff", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px", borderBottom: "1px solid #F0E6DE" }}>
        <button onClick={back} aria-label="返回" style={{ width: 40, height: 40, minHeight: 0, borderRadius: 999, border: "1px solid #E4D7CC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 800, color: "#241F1B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {headerActions(true)}
      </div>
      {shareSheet}

      <div style={{ flex: 1 }}>
        <div style={{ padding: "14px 18px 0" }}>
          <PlayableMedia videoUrl={videoUrl} poster={cover} height={188} label="成品示意" themeIcon={themeIcon} />
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FFF4EF", color: "#B23F1E", fontSize: 13, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}><ELIcon name="social" size={13} color="#F26B43" /> 一步一步</span>
            <span style={{ background: "#FBF7F4", color: "#6E645C", fontSize: 13, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>{steps.length} 步驟</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#6E645C" }}><ELIcon name="clock" size={14} color="#6E645C" /> 約 {durationMin ?? 15} 分鐘</span>
          </div>
          <h1 style={{ margin: "12px 0 6px", fontSize: 22, fontWeight: 800, color: "#241F1B", lineHeight: 1.4 }}>{title}</h1>
          {summary && <p style={{ margin: 0, fontSize: 16, color: "#574E47", lineHeight: 1.7 }}>{summary}</p>}
        </div>

        {materials.length > 0 && (
          <div style={{ padding: "18px 18px 0" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 10 }}>會用到的材料</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {materials.map((m) => <span key={m} style={{ background: "#FFF4EF", color: "#B23F1E", fontSize: 14, fontWeight: 600, padding: "6px 12px", borderRadius: 999 }}>{m}</span>)}
            </div>
          </div>
        )}

        <div style={{ padding: "18px 18px 22px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#241F1B", marginBottom: 10 }}>步驟總覽</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 999, background: "#FFF4EF", color: "#B23F1E", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 16, color: "#241F1B", fontWeight: 600 }}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #F0E6DE", padding: "12px 18px calc(12px + env(safe-area-inset-bottom))", background: "#fff" }}>
        <button type="button" onClick={() => setPhase(0)} disabled={steps.length === 0} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 54, borderRadius: 999, border: "none", background: "#E0552E", color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", font: "inherit", boxShadow: "0 6px 16px rgba(224,85,46,0.28)" }}>
          開始第一步 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
