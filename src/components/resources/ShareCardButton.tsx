"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

type Props = {
  resource: {
    name: string;
    summary?: string | null;
    phone?: string | null;
    address?: string | null;
    website_url?: string | null;
  };
};

export function ShareCardButton({ resource }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#FFFBF5",
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${resource.name}.png`, { type: "image/png" });

      const nav = navigator as Navigator & {
        canShare?: (d: { files?: File[] }) => boolean;
        share?: (d: { files?: File[]; title?: string }) => Promise<void>;
      };

      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: resource.name });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${resource.name}.png`;
        a.click();
      }
    } catch (err) {
      console.error("share-card error", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        aria-label={`生成 ${resource.name} 分享圖卡`}
        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl py-6 text-2xl font-bold shadow-md transition active:scale-95 disabled:opacity-60"
        style={{ background: "var(--cta)", color: "var(--cta-on)", minHeight: "var(--hit)" }}
      >
        {busy ? "生成中…" : "🖼 生成圖卡"}
      </button>

      {/* 螢幕外圖卡模板 */}
      <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, width: 720 }}>
        <div
          ref={cardRef}
          style={{
            width: 720,
            padding: 52,
            background: "linear-gradient(160deg,#FEF3C7 0%,#FFFBF5 55%,#FEF9EE 100%)",
            fontFamily: "'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif",
            color: "#1C1917",
          }}
        >
          <div style={{ fontSize: 20, color: "#92400E", fontWeight: 600, letterSpacing: 2 }}>
            長者資源工具包
          </div>
          <div style={{ marginTop: 16, fontSize: 46, fontWeight: 800, lineHeight: 1.2, color: "#1C1917" }}>
            {resource.name}
          </div>

          {resource.summary ? (
            <div style={{ marginTop: 20, fontSize: 26, lineHeight: 1.65, color: "#44403C" }}>
              {resource.summary}
            </div>
          ) : null}

          {resource.phone ? (
            <div style={{ marginTop: 28, padding: "20px 28px", background: "#ECFDF5", borderRadius: 20, border: "1px solid #A7F3D0" }}>
              <div style={{ fontSize: 22, color: "#065F46", fontWeight: 600 }}>📞 電話</div>
              <div style={{ marginTop: 8, fontSize: 60, fontWeight: 900, letterSpacing: 3, color: "#15803D" }}>
                {resource.phone}
              </div>
            </div>
          ) : null}

          {resource.address ? (
            <div style={{ marginTop: 20, fontSize: 24, color: "#44403C" }}>📍 {resource.address}</div>
          ) : null}

          {resource.website_url ? (
            <div style={{ marginTop: 14, fontSize: 20, color: "#78716C", wordBreak: "break-all" }}>
              🔗 {resource.website_url}
            </div>
          ) : null}

          <div style={{ marginTop: 36, fontSize: 18, color: "#A8A29E", textAlign: "right" }}>
            由「長者資源工具包」整理提供
          </div>
        </div>
      </div>
    </>
  );
}
