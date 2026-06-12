type Resource = {
  id: string;
  name: string;
  summary?: string | null;
  phone?: string | null;
  website_url?: string | null;
  address?: string | null;
  scope: string;
  regions?: { name: string } | null;
};

const CORAL = "#E0552E";
const INK = "#241F1B";
const MUTED = "#9C8E84";
const SUB = "#574E47";

export function buildResourceMessages(resources: Resource[], siteUrl: string, iconName = "pin") {
  if (resources.length === 0) return null;
  const icon = `${siteUrl}/line/${iconName}.png`;
  const bubbles = resources.slice(0, 10).map((r) => buildBubble(r, siteUrl, icon));
  if (bubbles.length === 1) return { type: "flex", altText: resources[0].name, contents: bubbles[0] };
  return { type: "flex", altText: `找到 ${resources.length} 筆相關資源`, contents: { type: "carousel", contents: bubbles } };
}

function row(iconUrl: string, label: string, value: string, valueColor = SUB, bold = false) {
  return {
    type: "box", layout: "horizontal", alignItems: "center", spacing: "sm", margin: "md", contents: [
      { type: "image", url: iconUrl, size: "20px", aspectMode: "fit", flex: 0 },
      { type: "text", text: label, size: "sm", color: MUTED, flex: 0 },
      { type: "text", text: value, size: "md", color: valueColor, weight: bold ? "bold" : "regular", wrap: true, margin: "sm" },
    ],
  };
}

function buildBubble(r: Resource, siteUrl: string, icon: string) {
  const isNational = r.scope === "national";
  const scopeLabel = isNational ? "全國服務" : (r.regions?.name ?? "在地服務");
  const accent = isNational ? "#B45309" : CORAL;
  const searchUrl = `${siteUrl}/search?q=${encodeURIComponent(r.name)}`;

  const body: object[] = [
    { type: "box", layout: "horizontal", alignItems: "center", spacing: "sm", contents: [
      { type: "image", url: icon, size: "22px", aspectMode: "fit", flex: 0 },
      { type: "text", text: scopeLabel, size: "sm", color: accent, weight: "bold", flex: 0 },
    ] },
    { type: "text", text: r.name, weight: "bold", size: "xl", wrap: true, color: INK, margin: "md" },
  ];
  if (r.summary) body.push({ type: "text", text: r.summary, size: "md", wrap: true, color: SUB, margin: "md" });

  const info: object[] = [];
  if (r.phone) info.push(row(`${siteUrl}/line/phone.png`, "電話", r.phone, accent, true));
  if (r.address) info.push(row(`${siteUrl}/line/pin.png`, "地址", r.address, SUB));
  if (info.length) {
    body.push({ type: "separator", margin: "lg", color: "#F0E6DE" });
    body.push(...info);
  }

  const footer: object[] = [];
  if (r.phone) footer.push({
    type: "button", style: "primary", color: accent, height: "md",
    action: { type: "uri", label: "撥打電話", uri: `tel:${r.phone.replace(/[^\d+]/g, "")}` },
  });
  footer.push({ type: "button", style: "secondary", height: "md", action: { type: "postback", label: "查看詳情", data: `rd=${r.id}`, displayText: r.name.slice(0, 20) } });
  void searchUrl;
  if (r.website_url) footer.push({ type: "button", style: "link", height: "sm", action: { type: "uri", label: "前往官網 ›", uri: r.website_url } });

  return {
    type: "bubble", size: "mega",
    body: { type: "box", layout: "vertical", paddingAll: "20px", contents: body },
    footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "20px", paddingTop: "4px", contents: footer },
  };
}

export function buildWelcomeMessage(siteUrl: string) {
  return {
    type: "flex",
    altText: "歡迎使用幸福好厝邊",
    contents: {
      type: "bubble", size: "mega",
      body: {
        type: "box", layout: "vertical", paddingAll: "0px", contents: [
          { type: "box", layout: "vertical", backgroundColor: CORAL, paddingAll: "22px", contents: [
            { type: "text", text: "幸福好厝邊", color: "#FFFFFF", size: "xl", weight: "bold" },
            { type: "text", text: "長者資源小幫手", color: "#FFE7DD", size: "sm", margin: "xs" },
          ] },
          { type: "box", layout: "vertical", paddingAll: "20px", spacing: "md", contents: [
            { type: "text", text: "您好！我幫您找在地長者資源、活動、新知，也能解答生活問題 🙂", size: "md", wrap: true, color: INK },
            { type: "text", text: "點下方選單，或直接打字告訴我，例如：「中壢 量血壓」", size: "sm", wrap: true, color: MUTED },
          ] },
        ],
      },
      footer: {
        type: "box", layout: "vertical", paddingAll: "18px", paddingTop: "0px", contents: [
          { type: "button", style: "primary", color: CORAL, height: "sm",
            action: { type: "uri", label: "🔍 瀏覽所有資源", uri: `${siteUrl}/resources` } },
        ],
      },
    },
  };
}
