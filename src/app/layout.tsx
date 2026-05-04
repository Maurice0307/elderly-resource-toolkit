import type { Metadata } from "next";
import { siteConfig } from "@/config/siteConfig";
import { NavBar } from "@/components/auth/NavBar";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { LiffProvider } from "@/components/liff/LiffProvider";
import "./globals.css";

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
    statusBarStyle: "default",
    title: siteConfig.shortName,
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased" style={{ colorScheme: "light only" }}>
      <body className="min-h-full flex flex-col">
        <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID ?? "YOUR_LIFF_ID"}>
          <NavBar />
          {children}
          <ScrollToTop />
        </LiffProvider>
      </body>
    </html>
  );
}
