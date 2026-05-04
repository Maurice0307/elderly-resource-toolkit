"use client";
import { useLiff } from "./LiffProvider";

export function LineShareButton({
  resourceName,
  resourceUrl,
}: {
  resourceName: string;
  resourceUrl: string;
}) {
  const { isInClient, liff } = useLiff();

  if (!isInClient || !liff) return null;

  async function handleShare() {
    try {
      await liff!.shareTargetPicker([
        {
          type: "flex",
          altText: `長者資源：${resourceName}`,
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "長者資源工具包",
                  size: "xs",
                  color: "#78716C",
                },
                {
                  type: "text",
                  text: resourceName,
                  weight: "bold",
                  size: "md",
                  wrap: true,
                  color: "#1C1917",
                  margin: "sm",
                },
              ],
            },
            footer: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  color: "#8B5E3C",
                  action: {
                    type: "uri",
                    label: "查看資源詳情",
                    uri: resourceUrl,
                  },
                },
              ],
            },
          },
        },
      ]);
    } catch {
      // user cancelled or error — do nothing
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-base font-semibold text-white transition active:opacity-80"
      style={{ background: "#06C755" }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="white" aria-hidden="true">
        <path d="M9 1.5C4.86 1.5 1.5 4.36 1.5 7.88c0 2.17 1.24 4.08 3.12 5.27l-.78 2.85 3.26-1.71c.61.17 1.25.26 1.9.26 4.14 0 7.5-2.86 7.5-6.38S13.14 1.5 9 1.5z" />
      </svg>
      分享給 LINE 朋友
    </button>
  );
}
