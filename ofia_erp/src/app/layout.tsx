import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ahnara/ThemeProvider";
import { NicheProvider } from "@/components/ahnara/NicheContext";
import { AuthProvider } from "@/components/ahnara/AuthContext";
import { LocationProvider } from "@/components/ahnara/LocationContext";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "NETS ERP - Unified Enterprise Resource Planning",
  description: "Comprehensive ERP Worksuite for New Era Transport Services (NETS) - managing finance, operations, human resources, performance reviews, and objective alignments in one unified platform.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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
