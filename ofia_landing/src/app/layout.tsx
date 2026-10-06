import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LandingNavbar } from "@/components/nexa/LandingNavbar";
import { Footer } from "@/components/nexa/Footer";

const dropa = localFont({
  src: "./fonts/Dropa-Regular.woff2",
  variable: "--font-dropa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ofia | The Multi-Tenant Business Operating System",
  description:
    "Storefront, ERP, Autonomous AI, Logistics, and Discovery all in one unified platform for Nigerian and African businesses.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dropa.variable} font-sans antialiased bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] selection:bg-[#1A56DB]/20 selection:text-[#1A56DB] flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <LandingNavbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
