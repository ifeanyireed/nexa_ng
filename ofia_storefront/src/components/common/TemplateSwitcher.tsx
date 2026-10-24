"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shirt,
  ShoppingBag,
  Car,
  UtensilsCrossed,
  Building2,
  Smartphone,
  HeartHandshake,
  Armchair,
  Layers,
  User,
  Pill,
  Zap,
  Gift,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { VerticalType } from "@/types/storefront";
import { extractSubdomainFromHost } from "@/lib/storefront-tenant";

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
    icon: Shirt,
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
  {
    id: "pharmacy",
    label: "Pharmacy",
    storeName: "Nectar & Cure Dispensary",
    href: "/pharmacy",
    icon: Pill,
    color: "#0D9488",
  },
  {
    id: "hardware",
    label: "Hardware",
    storeName: "VoltForge Energy & Tools",
    href: "/hardware",
    icon: Zap,
    color: "#D97706",
  },
  {
    id: "retail",
    label: "Retail",
    storeName: "The Artisan Guild",
    href: "/retail",
    icon: Gift,
    color: "#7C3AED",
  },
  {
    id: "dispatch",
    label: "Dispatch",
    storeName: "Ofia Fleet Courier",
    href: "/dispatch",
    icon: Truck,
    color: "#2563EB",
  },
];

export default function TemplateSwitcher() {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();
  const { tenantSlug, handshake } = useStorefrontTenant();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ofia_verticals_nav_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    } else {
      // Default collapsed on storefront vertical pages to keep UI clean and fit screen height
      setIsCollapsed(true);
    }
  }, []);

  const handleToggle = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem("ofia_verticals_nav_collapsed", String(collapsed));
  };

  // Strict tenant branding: NEVER display the floating or expanded verticals switcher on tenant subdomains or custom domains.
  // Only display on the platform root domain (e.g. ofia.ng / domain.com / bare localhost)
  const isTenantWorkspace = Boolean(
    tenantSlug ||
      (typeof window !== "undefined" && extractSubdomainFromHost(window.location.host))
  );

  if (!mounted || isTenantWorkspace) {
    return null;
  }

  return (
    <>
      {/* Floating Toggle Button when Collapsed/Hidden */}
      {isCollapsed ? (
        <div className="fixed bottom-5 right-6 z-50 hidden lg:flex items-center gap-2">
          {tenantSlug && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-md border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{handshake?.storefrontConfig.storeName || tenantSlug}</span>
              <span className="opacity-75 font-mono text-[10px]">({tenantSlug}.ofia.ng)</span>
            </div>
          )}
          <button
            onClick={() => handleToggle(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/90 hover:bg-zinc-950 text-white text-xs font-bold shadow-xl backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="Expand 10 Industry Verticals Navigation"
          >
            <Layers className="w-3.5 h-3.5 text-[#0069FF] group-hover:rotate-12 transition-transform" />
            <span>10 Verticals</span>
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      ) : (
        /* Full Expanded Verticals Bar */
        <div className="sticky top-0 z-50 w-full bg-[#0F1117]/95 backdrop-blur-md border-b border-white/10 text-white shadow-xl transition-all animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-2 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            {/* Left: Ecosystem Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/templates"
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 transition-colors"
                title="Browse all 10 Templates Directory"
              >
                <Layers className="w-3.5 h-3.5 text-[#0069FF]" />
                <span className="hidden sm:inline">10 Storefront Templates</span>
                <span className="sm:hidden">10 Templates</span>
              </Link>

              {tenantSlug && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{handshake?.storefrontConfig.storeName || tenantSlug}</span>
                  <span className="text-[10px] text-blue-200/70 font-mono">({tenantSlug}.ofia.ng)</span>
                </div>
              )}
            </div>

            {/* Center: 10 Vertical Jump Tabs */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                const isActive = pathname.startsWith(t.href);

                return (
                  <Link
                    key={t.id}
                    href={t.href}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-white text-zinc-900 shadow-md font-bold scale-[1.02]"
                        : "text-zinc-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? "text-[#0069FF]" : "text-zinc-400"
                      }`}
                    />
                    <span>{t.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right: Collapse / Hide Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggle(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
                title="Collapse Verticals Bar"
              >
                <ChevronUp className="w-3.5 h-3.5 text-zinc-300" />
                <span>Hide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
