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
  return { type: "text", text };
}

/* 分類 → 線條 icon 名稱對應 */
export const CATEGORY_ICON: Record<string, string> = {
  "醫療健康": "health", "交通接駁": "send", "居住安全": "home", "經濟財務": "coin",
  "社會資源": "social", "休閒活動": "run", "教育進修": "education",
};
export const iconUrl = (siteUrl: string, name: string) => `${siteUrl}/line/${name}.png`;

/* 大按鈕選單（單欄、整排、字不擠不截斷、不用滑） */
function fullButton(label: string, data: string, primary = false, color = "#E0552E"): LineMsg {
  return {
    type: "button", style: primary ? "primary" : "secondary", color: primary ? color : undefined, height: "md",
    action: { type: "postback", label: label.slice(0, 20), data, displayText: label },
  };
}
export function pickerBubble(title: string, hint: string, fullBtns: LineMsg[], options: { label: string; data: string }[], color = "#E0552E"): LineMsg {
  const rows: LineMsg[] = [...fullBtns, ...options.map((o) => fullButton(o.label, o.data))];
  return {
    type: "flex", altText: title,
    contents: {
      type: "bubble", size: "mega",
      body: {
        type: "box", layout: "vertical", paddingAll: "20px", contents: [
          { type: "text", text: title, weight: "bold", size: "xl", color: "#241F1B", wrap: true },
          { type: "text", text: hint, size: "sm", color: "#9C8E84", margin: "sm", wrap: true },
          { type: "box", layout: "vertical", margin: "lg", spacing: "md", contents: rows },
        ],
      },
    },
    quickReply: undefined,
  };
}

/* ① 找資源 → 分類大按鈕 */
export function categoryMenu(cats: { name: string }[]): LineMsg {
  return pickerBubble("想找哪一類資源？", "點下面的分類，或直接打關鍵字也可以", [],
    cats.slice(0, 14).map((c) => ({ label: c.name, data: `cat=${encodeURIComponent(c.name)}` })));
}

/* ② 分類 → 細分類大按鈕（含「全部」） */
export function subcategoryMenu(catName: string, subs: { id: string; name: string }[]): LineMsg {
  return pickerBubble(catName, "想找哪一項？點選或直接打字",
    [fullButton(`全部${catName}`, `catall=${encodeURIComponent(catName)}`, true)],
    subs.slice(0, 12).map((s) => ({ label: s.name, data: `sub=${s.id}` })));
}

/* 通用連結清單（carousel；可帶配圖 hero，標題＋按鈕連到網站） */
export function buildLinkList(opts: {
  altText: string;
  headerColor?: string;
  headerLabel: string;
  icon?: string;
  emptyText: string;
  items: { title: string; meta?: string; desc?: string; uri: string; btn?: string; image?: string | null }[];
}): LineMsg {
  if (opts.items.length === 0) return menuText(opts.emptyText);
  const color = opts.headerColor ?? "#E0552E";
  const bubbles = opts.items.slice(0, 10).map((it) => {
    const bubble: Record<string, unknown> = {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box", layout: "vertical", paddingAll: "18px", contents: [
          { type: "box", layout: "horizontal", alignItems: "center", spacing: "sm", contents: [
            ...(opts.icon ? [{ type: "image", url: opts.icon, size: "22px", aspectMode: "fit", flex: 0 }] : []),
            { type: "text", text: opts.headerLabel, size: "sm", weight: "bold", color, flex: 0 },
          ] },
          { type: "text", text: it.title, weight: "bold", size: "xl", wrap: true, color: "#241F1B", margin: "lg" },
          ...(it.meta ? [{ type: "text", text: it.meta, size: "sm", weight: "bold", color, wrap: true, margin: "md" }] : []),
          ...(it.desc ? [{ type: "text", text: it.desc, size: "md", wrap: true, color: "#574E47", margin: "sm" }] : []),
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
  return bubbles.length === 1
    ? { type: "flex", altText: opts.altText, contents: bubbles[0] }
    : { type: "flex", altText: opts.altText, contents: { type: "carousel", contents: bubbles } };
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
