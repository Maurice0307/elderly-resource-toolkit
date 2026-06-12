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

/* 分類 → 線條 icon 名稱對應 */
export const CATEGORY_ICON: Record<string, string> = {
  "醫療健康": "health", "交通接駁": "send", "居住安全": "home", "經濟財務": "coin",
  "社會資源": "social", "休閒活動": "run", "教育進修": "education",
};
export const iconUrl = (siteUrl: string, name: string) => `${siteUrl}/line/${name}.png`;

/* 階層式 ①：點「找資源」後彈出分類子選單（postback，不洗版） */
export function categoryMenu(cats: { name: string }[]): LineMsg {
  return {
    type: "text",
    text: "想找哪一類資源呢？點下面的分類 👇",
    quickReply: {
      items: cats.slice(0, 13).map((c) => ({
        type: "action",
        action: { type: "postback", label: c.name.slice(0, 20), data: `cat=${encodeURIComponent(c.name)}`, displayText: c.name },
      })),
    },
  };
}

/* 階層式 ②：點分類後彈出細分類（postback），加上「全部」選項 */
export function subcategoryMenu(catName: string, subs: { id: string; name: string }[]): LineMsg {
  const items = subs.slice(0, 12).map((s) => ({
    type: "action" as const,
    action: { type: "postback" as const, label: s.name.slice(0, 20), data: `sub=${s.id}`, displayText: s.name },
  }));
  items.unshift({
    type: "action",
    action: { type: "postback", label: `全部${catName}`.slice(0, 20), data: `catall=${encodeURIComponent(catName)}`, displayText: `全部 ${catName}` },
  });
  return { type: "text", text: `「${catName}」想找哪一項？也可以直接打關鍵字 👇`, quickReply: { items } };
}

/* 通用連結清單（carousel；可帶配圖 hero，標題＋按鈕連到網站） */
export function buildLinkList(opts: {
  altText: string;
  headerColor?: string;
  headerLabel: string;
  icon?: string;
  emptyText: string;
  items: { title: string; sub?: string; uri: string; btn?: string; image?: string | null }[];
}): LineMsg {
  if (opts.items.length === 0) return menuText(opts.emptyText);
  const color = opts.headerColor ?? "#E0552E";
  const bubbles = opts.items.slice(0, 10).map((it) => {
    const bubble: Record<string, unknown> = {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box", layout: "vertical", paddingAll: "16px", spacing: "sm",
        contents: [
          { type: "box", layout: "baseline", contents: [
            ...(opts.icon ? [{ type: "icon", url: opts.icon, size: "lg" }] : []),
            { type: "text", text: opts.headerLabel, size: "xs", weight: "bold", color, margin: opts.icon ? "sm" : "none" },
          ] },
          { type: "text", text: it.title, weight: "bold", size: "md", wrap: true, color: "#241F1B", margin: "sm" },
          ...(it.sub ? [{ type: "text", text: it.sub, size: "sm", wrap: true, color: "#9C8E84" }] : []),
        ],
      },
      footer: {
        type: "box", layout: "vertical", paddingAll: "16px", paddingTop: "0px",
        contents: [{
          type: "button", style: "primary", color, height: "sm",
          action: { type: "uri", label: it.btn ?? "查看", uri: it.uri },
        }],
      },
    };
    if (it.image) {
      bubble.hero = { type: "image", url: it.image, size: "full", aspectRatio: "20:13", aspectMode: "cover" };
    }
    return bubble;
  });
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
