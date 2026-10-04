import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import TemplateSwitcher from "@/components/common/TemplateSwitcher";
import CartDrawer from "@/components/common/CartDrawer";

const dropa = localFont({
  src: "../fonts/Dropa-Regular.woff2",
  variable: "--font-dropa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ofia Storefront · 7 Industry Vertical Experience Templates",
  description: "Industry-native storefronts tailored to Fashion, Cars, Food, Property, Gadgets, Beauty, and Home & Living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dropa.variable} antialiased`}>
      <body className="min-h-screen bg-[#F8F6F1] text-[#111318] selection:bg-[#0069ff]/20 selection:text-[#0069ff]">
        <CartProvider>
          <TemplateSwitcher />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
