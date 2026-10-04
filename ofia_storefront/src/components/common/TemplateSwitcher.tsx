"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ShoppingBag,
  Car,
  UtensilsCrossed,
  Building2,
  Smartphone,
  HeartHandshake,
  Armchair,
  Layers,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { VerticalType } from "@/types/storefront";

const TEMPLATES: Array<{
  id: VerticalType;
  label: string;
  storeName: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    id: "fashion",
    label: "Fashion",
    storeName: "Aura & Loom",
    href: "/fashion",
    icon: Sparkles,
    color: "#B45309",
  },
  {
    id: "cars",
    label: "Cars",
    storeName: "Apex Velocity",
    href: "/cars",
    icon: Car,
    color: "#0069FF",
  },
  {
    id: "food",
    label: "Food",
    storeName: "Savory Republic",
    href: "/food",
    icon: UtensilsCrossed,
    color: "#D97706",
  },
  {
    id: "property",
    label: "Property",
    storeName: "Veloura Prime",
    href: "/property",
    icon: Building2,
    color: "#0069FF",
  },
  {
    id: "gadgets",
    label: "Gadgets",
    storeName: "PulseTech",
    href: "/gadgets",
    icon: Smartphone,
    color: "#06B6D4",
  },
  {
    id: "beauty",
    label: "Beauty",
    storeName: "LuxeGlow",
    href: "/beauty",
    icon: HeartHandshake,
    color: "#E11D48",
  },
  {
    id: "home-living",
    label: "Home & Living",
    storeName: "Nordic & Clay",
    href: "/home-living",
    icon: Armchair,
    color: "#4D7C0F",
  },
];

export default function TemplateSwitcher() {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();

  // Determine current active template
  const currentTemplate = TEMPLATES.find((t) => pathname.startsWith(t.href)) || TEMPLATES[0];

  return (
    <div className="sticky top-0 z-50 w-full bg-[#0F1117]/95 backdrop-blur-md border-b border-white/10 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Left: Ecosystem Brand & Template Selector Label */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/templates"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-zinc-300 transition-colors"
            title="Browse all 7 Templates Directory"
          >
            <Layers className="w-3.5 h-3.5 text-[#0069FF]" />
            <span className="hidden sm:inline">7 Storefront Templates</span>
            <span className="sm:hidden">7 Templates</span>
          </Link>
          <span className="text-zinc-600 hidden md:inline">|</span>
        </div>

        {/* Center: 7 Vertical Template Quick Jump Tabs */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            const isActive = pathname.startsWith(t.href);

            return (
              <Link
                key={t.id}
                href={t.href}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-zinc-900 shadow-md font-bold scale-[1.02]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-[#0069FF]" : "text-zinc-500"
                  }`}
                />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Cart Button & Directory Hub */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bag</span>
            {totalCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
