import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/nexa/ThemeProvider";

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
  title: "Ofia AI | Autonomous B2B Go-To-Market & Revenue Platform",
  description:
    "Autonomous B2B Go-To-Market platform powered by 14 specialized AI agents. Verified lead extraction, high-converting multi-channel outreach across Email, WhatsApp, and LinkedIn, with 1-tap Telegram mobile approvals.",
  metadataBase: new URL("https://ofia.ng"),
  openGraph: {
    title: "Ofia AI | Autonomous B2B Go-To-Market & Revenue Platform",
    description:
      "Autonomous B2B Go-To-Market platform powered by 14 specialized AI agents. Verified lead extraction, high-converting multi-channel outreach across Email, WhatsApp, and LinkedIn, with 1-tap Telegram mobile approvals.",
    url: "https://ofia.ng",
    siteName: "Ofia AI",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Ofia AI Logo",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofia AI | Autonomous B2B Go-To-Market & Revenue Platform",
    description:
      "Autonomous B2B Go-To-Market platform powered by 14 specialized AI agents. Verified lead extraction, high-converting multi-channel outreach across Email, WhatsApp, and LinkedIn, with 1-tap Telegram mobile approvals.",
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
