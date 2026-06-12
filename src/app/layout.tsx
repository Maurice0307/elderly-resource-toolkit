import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/siteConfig";
import { LiffProvider } from "@/components/liff/LiffProvider";
import { DailySearchProvider } from "@/contexts/DailySearchContext";
import { WebShell } from "@/components/layout/WebShell";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#E0552E",
  colorScheme: "light", // 輸出 <meta name="color-scheme" content="light">，避免手機 WebView 自動轉深色
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.shortName,
  metadataBase: new URL(siteConfig.url),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.shortName,
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased" style={{ colorScheme: "only light" }}>
      <body style={{ margin: 0, padding: 0 }}>
        <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID ?? "YOUR_LIFF_ID"}>
          <DailySearchProvider>
            <WebShell>
              {children}
            </WebShell>
          </DailySearchProvider>
        </LiffProvider>
      </body>
    </html>
  );
}
