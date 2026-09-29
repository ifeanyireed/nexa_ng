import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/nexa/ThemeProvider";
import { NicheProvider } from "@/components/nexa/NicheContext";
import { AuthProvider } from "@/components/nexa/AuthContext";
import { LocationProvider } from "@/components/nexa/LocationContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"],
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
        className={`${dmSans.variable} ${jetbrains.variable} antialiased selection:bg-[#1A56DB]/20 selection:text-[#1A56DB]`}
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
