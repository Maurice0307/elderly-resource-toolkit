/* Phase 2：LINE 五大功能選單 + 清單訊息 */

const FUNCS = [
  { label: "🔍 找資源", text: "找資源" },
  { label: "🎴 活動圖卡", text: "活動圖卡" },
  { label: "💬 溝通錦囊", text: "溝通錦囊" },
  { label: "📰 今日新知", text: "今日新知" },
  { label: "🙋 互助問答", text: "互助問答" },
];

type LineMsg = Record<string, unknown>;

/* 在任何訊息底下附上「快速選單」按鈕（出現在鍵盤上方） */
export function withMenu(message: LineMsg): LineMsg {
  return {
    ...message,
    quickReply: {
      items: FUNCS.map((f) => ({
        type: "action",
        action: { type: "message", label: f.label, text: f.text },
      })),
    },
  };
}

export function menuText(text: string): LineMsg {
  return withMenu({ type: "text", text });
}

/* 通用連結清單（carousel；每張卡一個標題＋按鈕連到網站） */
export function buildLinkList(opts: {
  altText: string;
  headerColor?: string;
  headerLabel: string;
  emptyText: string;
  items: { title: string; sub?: string; uri: string; btn?: string }[];
}): LineMsg {
  if (opts.items.length === 0) return menuText(opts.emptyText);
  const color = opts.headerColor ?? "#E0552E";
  const bubbles = opts.items.slice(0, 10).map((it) => ({
    type: "bubble",
    size: "kilo",
    header: {
      type: "box", layout: "vertical", paddingAll: "8px", backgroundColor: color,
      contents: [{ type: "text", text: opts.headerLabel, size: "xs", weight: "bold", color: "#FFFFFF" }],
    },
    body: {
      type: "box", layout: "vertical", paddingAll: "12px",
      contents: [
        { type: "text", text: it.title, weight: "bold", size: "md", wrap: true, color: "#1C1917" },
        ...(it.sub ? [{ type: "text", text: it.sub, size: "sm", wrap: true, color: "#78716C", margin: "sm" }] : []),
      ],
    },
    footer: {
      type: "box", layout: "vertical", paddingAll: "12px",
      contents: [{
        type: "button", style: "primary", color, height: "sm",
        action: { type: "uri", label: it.btn ?? "查看", uri: it.uri },
      }],
    },
  }));
  const flex: LineMsg = bubbles.length === 1
    ? { type: "flex", altText: opts.altText, contents: bubbles[0] }
    : { type: "flex", altText: opts.altText, contents: { type: "carousel", contents: bubbles } };
  return withMenu(flex);
}

/* 判斷訊息要走哪個功能；回傳 null 代表當作資源關鍵字搜尋 */
export function routeIntent(text: string): "menu" | "resource" | "activity" | "script" | "news" | "qa" | null {
  const t = text.trim();
  if (/^(選單|功能|menu|主選單|嗨|hi|hello|你好|哈囉|home|開始)$/i.test(t)) return "menu";
  if (/^找資源$|找資源|^資源$/.test(t)) return "resource";
  if (/活動|圖卡/.test(t)) return "activity";
  if (/錦囊|溝通|怎麼說|怎麼講|怎麼開口/.test(t)) return "script";
  if (/新知|新聞|消息|時事/.test(t)) return "news";
  if (/問答|提問|發問|問問題|互助/.test(t)) return "qa";
  return null;
}
