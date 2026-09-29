import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/nexa/ThemeProvider";

const dropa = localFont({
  src: "../fonts/Dropa-Regular.woff2",
  variable: "--font-dropa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ofia Business Suite SUPER-ADMIN | Master Overview",
  description:
    "Unified Super Admin & Multi-App Governance for Ofia AI Swarm, Ofia Compass, and Multi-Tenant Workspaces.",
  icons: {
    icon: [{ url: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png" }, { url: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/aa9nvrmyrc38lbpz1mkp.png" }],
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
        className={`${dropa.variable} font-sans antialiased bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] min-h-screen selection:bg-[#1A56DB]/20 selection:text-[#1A56DB]`}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
