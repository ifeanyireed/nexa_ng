import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/nexa/ThemeProvider";
import { NicheProvider } from "@/components/nexa/NicheContext";
import { AuthProvider } from "@/components/nexa/AuthContext";
import { LocationProvider } from "@/components/nexa/LocationContext";
import { TenantMetaTitleSync } from "@/components/nexa/TenantMetaTitleSync";

const dropa = localFont({
  src: "../fonts/Dropa-Regular.woff2",
  variable: "--font-dropa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ofia ERP | Unified African Enterprise & Commerce Operating System",
  description:
    "The unified multi-tenant enterprise business operating system for African trade. Run storefronts, ERP operations, autonomous AI lead generation, and nationwide logistics from a single login.",
  metadataBase: new URL("https://ofia.ng"),
  openGraph: {
    title: "Ofia ERP | Unified African Enterprise & Commerce Operating System",
    description:
      "The unified multi-tenant enterprise business operating system for African trade. Run storefronts, ERP operations, autonomous AI lead generation, and nationwide logistics from a single login.",
    url: "https://ofia.ng",
    siteName: "Ofia ERP",
    images: [
      {
        url: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png",
        width: 800,
        height: 800,
        alt: "Ofia ERP Logo",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofia ERP | Unified African Enterprise & Commerce Operating System",
    description:
      "The unified multi-tenant enterprise business operating system for African trade. Run storefronts, ERP operations, autonomous AI lead generation, and nationwide logistics from a single login.",
    images: ["https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"],
  },
  icons: {
    icon: [
      { url: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png" },
      { url: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/aa9nvrmyrc38lbpz1mkp.png" },
    ],
    apple: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png",
    shortcut: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png",
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
        className={`${dropa.variable} font-sans antialiased selection:bg-[#1A56DB]/20 selection:text-[#1A56DB]`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              <NicheProvider>
                <TenantMetaTitleSync />
                {children}
              </NicheProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
