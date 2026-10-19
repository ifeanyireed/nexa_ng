"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Compass,
  ShoppingCart,
  Tag,
  Mail,
  Wallet,
  Percent,
  Settings,
  User,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function StickySidebarNav() {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();
  const [showPromoBadge, setShowPromoBadge] = useState(false);

  // Extract current vertical from pathname if present
  const segments = pathname.split("/").filter(Boolean);
  const currentVertical = segments[0] || "fashion";

  // Check if current page is the vertical storefront home
  const isVerticalHome =
    pathname === `/${currentVertical}` ||
    pathname === "/" ||
    pathname === "/templates";

  return (
    <>
      {/* Desktop Sticky Icon Sidebar - Always Visible on Left */}
      <aside
        className="sticky top-0 h-screen max-h-screen h-dvh w-18 md:w-20 bg-[#ECEEF2] z-40 hidden lg:flex flex-col items-center justify-between pb-4 shrink-0 select-none overflow-hidden"
        aria-label="Storefront Icon Navigation"
      >
        {/* Primary Navigation Stack - Dropped vertical start position aligning with Hero Card */}
        <nav className="flex flex-col items-center gap-2 xl:gap-2.5 w-full px-3 pt-16 xl:pt-[70px]">
          {/* 1. Dashboard / Storefront Home (Active Pill matching moodboard) */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href={`/${currentVertical}`}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isVerticalHome
                  ? "bg-[#111318] text-white shadow-md scale-100"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </Link>
            {/* Tooltip */}
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Dashboard / Home
            </span>
          </div>

          {/* 2. Compass / Explore All Verticals */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href="/templates"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                pathname === "/templates"
                  ? "bg-[#111318] text-white shadow-md"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <Compass className="w-5 h-5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Explore 10 Verticals
            </span>
          </div>

          {/* 3. Shopping Cart / Bag with Live Counter Badge */}
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-11 h-11 rounded-full flex items-center justify-center text-stone-500 hover:text-zinc-950 hover:bg-black/5 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Cart ({totalCount} items)
            </span>
          </div>

          {/* 4. Tag / Catalog & Promotions */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href={`/${currentVertical}/catalog`}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                pathname.includes("/catalog") || pathname.includes("/listings") || pathname.includes("/menu")
                  ? "bg-[#111318] text-white shadow-md"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <Tag className="w-5 h-5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Catalog & Special Drops
            </span>
          </div>

          {/* 5. Mail / Concierge & Direct Inquiries */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href="/info"
              className="w-11 h-11 rounded-full flex items-center justify-center text-stone-500 hover:text-zinc-950 hover:bg-black/5 transition-all"
            >
              <Mail className="w-5 h-5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Concierge & Inquiries
            </span>
          </div>

          {/* 6. Wallet / Order Tracking & Transactions */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href="/order-tracking"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                pathname.includes("/order-tracking")
                  ? "bg-[#111318] text-white shadow-md"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <Wallet className="w-5 h-5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Orders & Tracking
            </span>
          </div>

          {/* 7. Percent / Promotional Campaign */}
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={() => setShowPromoBadge(!showPromoBadge)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-stone-500 hover:text-zinc-950 hover:bg-black/5 transition-all cursor-pointer"
            >
              <Percent className="w-5 h-5" />
            </button>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Seasonal 50% Off Promo
            </span>
          </div>
        </nav>

        {/* Bottom Pinned Controls (Settings & Account) */}
        <div className="flex flex-col items-center gap-2 w-full px-3 pt-3 pb-2 border-t border-stone-300/40">
          {/* Settings */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href="/info"
              className="w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:text-zinc-950 hover:bg-black/5 transition-all"
            >
              <Settings className="w-4.5 h-4.5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Store Settings & Currency
            </span>
          </div>

          {/* Customer Profile / Account */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href="/account"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                pathname === "/account"
                  ? "bg-[#111318] text-white shadow-md"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <User className="w-4.5 h-4.5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Customer Account
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Icon Bar (Always There on Small Screens) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ECEEF2]/95 backdrop-blur-md border-t border-stone-300/60 px-3 py-2 flex items-center justify-around shadow-lg"
        aria-label="Mobile Navigation Bar"
      >
        <Link
          href={`/${currentVertical}`}
          className={`p-2.5 rounded-2xl flex flex-col items-center ${
            isVerticalHome ? "bg-zinc-900 text-white" : "text-stone-500 hover:text-zinc-900"
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
        </Link>

        <Link
          href="/templates"
          className={`p-2.5 rounded-2xl flex flex-col items-center ${
            pathname === "/templates" ? "bg-zinc-900 text-white" : "text-stone-500 hover:text-zinc-900"
          }`}
        >
          <Compass className="w-5 h-5" />
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-2.5 rounded-2xl flex flex-col items-center text-stone-500 hover:text-zinc-900 cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>

        <Link
          href="/order-tracking"
          className={`p-2.5 rounded-2xl flex flex-col items-center ${
            pathname.includes("/order-tracking") ? "bg-zinc-900 text-white" : "text-stone-500 hover:text-zinc-900"
          }`}
        >
          <Wallet className="w-5 h-5" />
        </Link>

        <Link
          href="/account"
          className={`p-2.5 rounded-2xl flex flex-col items-center ${
            pathname === "/account" ? "bg-zinc-900 text-white" : "text-stone-500 hover:text-zinc-900"
          }`}
        >
          <User className="w-5 h-5" />
        </Link>
      </nav>

      {/* Floating Promo Toast if triggered */}
      {showPromoBadge && (
        <div className="fixed top-16 left-24 z-50 bg-[#111318] text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-200">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-sm block">SUMMER50 Active</span>
            <span>Use code at checkout for up to 50% off seasonal items.</span>
          </div>
          <button
            onClick={() => setShowPromoBadge(false)}
            className="text-stone-400 hover:text-white text-xs underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
