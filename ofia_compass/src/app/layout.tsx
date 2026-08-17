import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/nexa/ThemeProvider";
import { NicheProvider } from "@/components/nexa/NicheContext";
import { AuthProvider } from "@/components/nexa/AuthContext";
import { LocationProvider } from "@/components/nexa/LocationContext";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Ofia Compass | Nigeria's Premier Business Discovery & Navigation Platform",
  description: "Navigate Nigeria's business terrain. Discover, book, and buy from verified local businesses across every state.",
  metadataBase: new URL("https://compass.ofia.ng"),
  openGraph: {
    title: "Ofia Compass | Nigeria's Premier Business Discovery & Navigation Platform",
    description: "Navigate Nigeria's business terrain. Discover, book, and buy from verified local businesses across every state.",
    url: "https://compass.ofia.ng",
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
    title: "Ofia Compass | Nigeria's Premier Business Discovery & Navigation Platform",
    description: "Navigate Nigeria's business terrain. Discover, book, and buy from verified local businesses across every state.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${jetbrains.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <NicheProvider>
              <LocationProvider>
                {children}
              </LocationProvider>
            </NicheProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
