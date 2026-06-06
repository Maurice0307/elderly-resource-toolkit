export const siteConfig = {
  name: "幸福好厝邊",
  shortName: "好厝邊",
  englishName: "ELDERLINK",
  description: "中高齡者、家屬與志工的全方位資源導航平台",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://elderly-resource-toolkit.vercel.app",
  defaultRegionCode: process.env.NEXT_PUBLIC_DEFAULT_REGION_CODE ?? "TW-TYC-ZL",
  brand: {
    primary: "#E0552E",
    accent:  "#F26B43",
    bg:      "#FBF7F4",
    text:    "#241F1B",
  },
  typography: {
    minFontPx: 16,
  },
  contact: {
    email: "itchiang2025@gmail.com",
    phone: "0968786545",
    maintainer: "堉璘團隊 MC",
  },
  social: {
    github: "",
    line: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
