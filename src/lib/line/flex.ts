type Resource = {
  id: string;
  name: string;
  summary?: string | null;
  phone?: string | null;
  website_url?: string | null;
  scope: string;
  regions?: { name: string } | null;
};

export function buildResourceMessages(resources: Resource[], siteUrl: string) {
  if (resources.length === 0) return null;

  const bubbles = resources.slice(0, 10).map((r) => buildBubble(r, siteUrl));

  if (bubbles.length === 1) {
    return { type: "flex", altText: resources[0].name, contents: bubbles[0] };
  }

  return {
    type: "flex",
    altText: `找到 ${resources.length} 筆相關資源`,
    contents: { type: "carousel", contents: bubbles },
  };
}

function buildBubble(r: Resource, siteUrl: string) {
  const scopeLabel =
    r.scope === "national" ? "全國" : (r.regions?.name ?? "在地");
  const isNational = r.scope === "national";
  const searchUrl = `${siteUrl}/search?q=${encodeURIComponent(r.name)}`;

  const bodyContents: object[] = [
    {
      type: "text",
      text: r.name,
      weight: "bold",
      size: "md",
      wrap: true,
      color: "#1C1917",
    },
  ];

  if (r.summary) {
    bodyContents.push({
      type: "text",
      text: r.summary,
      size: "sm",
      wrap: true,
      color: "#78716C",
      margin: "sm",
    });
  }

  if (r.phone) {
    bodyContents.push({
      type: "text",
      text: `📞 ${r.phone}`,
      size: "sm",
      color: "#8B5E3C",
      margin: "sm",
      weight: "bold",
    });
  }

  const footerContents: object[] = [];

  if (r.phone) {
    footerContents.push({
      type: "button",
      style: "primary",
      color: "#8B5E3C",
      height: "sm",
      action: {
        type: "uri",
        label: "📞 撥打電話",
        uri: `tel:${r.phone.replace(/[^\d+]/g, "")}`,
      },
    });
  }

  footerContents.push({
    type: "button",
    style: "secondary",
    height: "sm",
    action: {
      type: "uri",
      label: "📋 查看詳情",
      uri: searchUrl,
    },
  });

  if (r.website_url) {
    footerContents.push({
      type: "button",
      style: "secondary",
      height: "sm",
      action: {
        type: "uri",
        label: "🌐 官方網站",
        uri: r.website_url,
      },
    });
  }

  return {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      paddingAll: "8px",
      backgroundColor: isNational ? "#FEF3C7" : "#ECFDF5",
      contents: [
        {
          type: "text",
          text: scopeLabel,
          size: "xs",
          weight: "bold",
          color: isNational ? "#92400E" : "#065F46",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "12px",
      contents: bodyContents,
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "12px",
      contents: footerContents,
    },
  };
}

export function buildWelcomeMessage(siteUrl: string) {
  return {
    type: "flex",
    altText: "歡迎使用長者資源工具包",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "👋 您好！我是長者資源小幫手",
            weight: "bold",
            size: "md",
            wrap: true,
            color: "#1C1917",
          },
          {
            type: "text",
            text: "直接輸入需求，我來幫您找資源：",
            size: "sm",
            color: "#78716C",
            margin: "md",
            wrap: true,
          },
          {
            type: "text",
            text: "「我需要救護車」\n「高雄有什麼長照服務？」\n「我想了解租屋補助」",
            size: "sm",
            color: "#8B5E3C",
            margin: "sm",
            wrap: true,
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
              label: "🔍 瀏覽所有資源",
              uri: `${siteUrl}/resources`,
            },
          },
        ],
      },
    },
  };
}
