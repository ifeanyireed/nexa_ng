import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/nexa/ThemeProvider";
import { NicheProvider } from "@/components/nexa/NicheContext";
import { AuthProvider } from "@/components/nexa/AuthContext";
import { LocationProvider } from "@/components/nexa/LocationContext";

const dropa = localFont({
  src: "../fonts/Dropa-Regular.woff2",
  variable: "--font-dropa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ofia Compass | Nigeria's #1 Business & Service Discovery Marketplace",
  description:
    "Nigeria's #1 business discovery and navigation platform. Empowering local businesses and consumers to navigate commercial opportunities.",
  metadataBase: new URL("https://ofia.ng"),
  openGraph: {
    title: "Ofia Compass | Nigeria's #1 Business & Service Discovery Marketplace",
    description:
      "Nigeria's #1 business discovery and navigation platform. Empowering local businesses and consumers to navigate commercial opportunities.",
    url: "https://ofia.ng",
    siteName: "Ofia Compass",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Ofia Compass Logo",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofia Compass | Nigeria's #1 Business & Service Discovery Marketplace",
    description:
      "Nigeria's #1 business discovery and navigation platform. Empowering local businesses and consumers to navigate commercial opportunities.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/icon.png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
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
              <NicheProvider>{children}</NicheProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
