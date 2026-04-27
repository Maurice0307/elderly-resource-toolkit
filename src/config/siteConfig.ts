export const siteConfig = {
  name: "長者資源工具包",
  shortName: "長者工具包",
  description: "中高齡者、家屬與志工的全方位陪伴與資源導航平台",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://elderly-resource-toolkit.vercel.app",
  defaultRegionCode: process.env.NEXT_PUBLIC_DEFAULT_REGION_CODE ?? "TW-TYC-ZL",
  brand: {
    primary: "#2563EB",
    accent: "#F97316",
    bg: "#FFFFFF",
    text: "#0F172A",
  },
  typography: {
    minFontPx: 20,
  },
  contact: {
    email: "itchiang2025@gmail.com",
    maintainer: "Morris Chiang",
  },
  social: {
    github: "",
    line: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
