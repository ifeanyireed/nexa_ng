import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const dropa = localFont({
  src: "../fonts/Dropa-Regular.woff2",
  variable: "--font-dropa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Veloura | Luxury Living Residences",
  description: "Luxury Living Designed Around Your Lifestyle. Modern architecture, coastal apartments, and curated residences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dropa.variable} antialiased`}>
      <body className="min-h-screen bg-[#F8F6F1] text-[#111318] selection:bg-[#0069ff]/20 selection:text-[#0069ff]">
        {children}
      </body>
    </html>
  );
}
