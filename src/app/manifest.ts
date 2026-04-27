import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "長者資源工具包",
    short_name: "長者工具包",
    description: "中高齡者、家屬與志工的全方位陪伴與資源導航平台",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFBF5",
    theme_color: "#B45309",
    orientation: "portrait-primary",
    lang: "zh-Hant",
    categories: ["health", "lifestyle", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    screenshots: [],
  };
}
