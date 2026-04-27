import type { Metadata } from "next";
import { siteConfig } from "@/config/siteConfig";
import { NavBar } from "@/components/auth/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.shortName,
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-slate-900 text-[20px] leading-relaxed">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
