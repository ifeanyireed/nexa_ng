import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { StorefrontTenantProvider } from "@/context/StorefrontTenantContext";
import TemplateSwitcher from "@/components/common/TemplateSwitcher";
import CartDrawer from "@/components/common/CartDrawer";
import StickySidebarNav from "@/components/common/StickySidebarNav";

import { resolveStorefrontMetadata } from "@/lib/storefront-metadata";

const dropa = localFont({
  src: "../fonts/Dropa-Regular.woff2",
  variable: "--font-dropa",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const meta = await resolveStorefrontMetadata(
    "Ofia Storefront · 11 Industry Verticals",
    "Enterprise multi-vertical commerce templates tailored to Fashion, Cars, Food, Property, Gadgets, Beauty, Home & Living, Pharmacy, Hardware, Retail, and Fleet Dispatch."
  );

  return {
    ...meta,
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/ofia-logo.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dropa.variable} antialiased`}>
      <body className="min-h-screen bg-white text-[#111318] selection:bg-[#0069ff]/20 selection:text-[#0069ff]">
        <StorefrontTenantProvider>
          <CartProvider>
            <TemplateSwitcher />
            <div className="flex min-h-screen w-full bg-white">
              <StickySidebarNav />
              <div className="flex-1 min-w-0 pb-16 lg:pb-0 bg-white">
                {children}
              </div>
            </div>
            <CartDrawer />
          </CartProvider>
        </StorefrontTenantProvider>
      </body>
    </html>
  );
}
