"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Menu,
  X,
  Phone,
  ShoppingBag,
  Calendar,
  Car,
  UtensilsCrossed,
  Scissors,
  ArrowRight,
  Search,
  Wrench,
  Bell,
  ChevronDown,
} from "lucide-react";
import { VendorStore } from "@/types/storefront";
import { useCart } from "@/context/CartContext";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";

interface StoreHeaderProps {
  store: VendorStore;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();
  const { isFeatureEnabled } = useStorefrontTenant();

  // Vertical-specific navigation links
  const getNavLinks = () => {
    switch (store.vertical) {
      case "fashion":
        return [
          { label: "Home", href: "/fashion" },
          { label: "Collection Catalog", href: "/fashion/catalog" },
          { label: "Bespoke Tailoring", href: "/fashion/custom-tailoring" },
        ];
      case "cars":
        return [
          { label: "Showroom", href: "/cars" },
          { label: "Vehicle Listings", href: "/cars/listings" },
          { label: "Book Test-Drive", href: "/cars/book-test-drive/car-001" },
        ];
      case "food":
        return [
          { label: "Bistro Home", href: "/food" },
          { label: "Menu & Order", href: "/food/menu" },
          { label: "Custom Cakes & Catering", href: "/food/custom-order" },
        ];
      case "property":
        return [
          { label: "Residences", href: "/property" },
          { label: "Available Listings", href: "/property/listings" },
          { label: "Schedule Viewing", href: "/property/schedule-viewing/prp-001" },
        ];
      case "gadgets":
        return [
          { label: "Store", href: "/gadgets" },
          { label: "Tech Catalog", href: "/gadgets/catalog" },
          { label: "Repairs & Warranty", href: "/gadgets/repairs" },
        ];
      case "beauty":
        return [
          { label: "Sanctuary", href: "/beauty" },
          { label: "Skincare Products", href: "/beauty/products" },
          { label: "Studio Services", href: "/beauty/services" },
        ];
      case "home-living":
        return [
          { label: "Studio", href: "/home-living" },
          { label: "Furniture Catalog", href: "/home-living/catalog" },
          { label: "Assembly & Custom", href: "/home-living/services" },
          { label: "Delivery Options", href: "/home-living/delivery-options" },
        ];
      case "pharmacy":
        return [
          { label: "Dispensary", href: "/pharmacy" },
          { label: "Medication Catalog", href: "/pharmacy/catalog" },
          { label: "Upload Rx", href: "/pharmacy/prescription" },
          { label: "Consult Pharmacist", href: "/pharmacy/consultation" },
        ];
      case "hardware":
        return [
          { label: "Energy Store", href: "/hardware" },
          { label: "Equipment Catalog", href: "/hardware/catalog" },
          { label: "Sizing Calculator", href: "/hardware/calculator" },
          { label: "Installation / RFQ", href: "/hardware/services" },
        ];
      case "retail":
        return [
          { label: "Specialty Shop", href: "/retail" },
          { label: "Department Catalog", href: "/retail/catalog" },
          { label: "Gift Registry & Engraving", href: "/retail/customization" },
        ];
      default:
        return [{ label: "Home", href: "/" }];
    }
  };

  const getPrimaryCta = () => {
    switch (store.vertical) {
      case "cars":
        return {
          label: "Book Test-Drive",
          href: "/cars/book-test-drive/car-001",
          icon: Car,
        };
      case "food":
        return {
          label: "View Menu & Order",
          href: "/food/menu",
          icon: UtensilsCrossed,
        };
      case "property":
        return {
          label: "Schedule Viewing",
          href: "/property/schedule-viewing/prp-001",
          icon: Calendar,
        };
      case "beauty":
        return {
          label: "Book Appointment",
          href: "/beauty/book-appointment",
          icon: Calendar,
        };
      case "fashion":
        return {
          label: "Bespoke Fitting",
          href: "/fashion/custom-tailoring",
          icon: Scissors,
        };
      case "gadgets":
        return {
          label: "Explore Catalog",
          href: "/gadgets/catalog",
          icon: ArrowRight,
        };
      case "home-living":
        return {
          label: "Room Catalog",
          href: "/home-living/catalog",
          icon: ArrowRight,
        };
      case "pharmacy":
        return {
          label: "Upload Prescription",
          href: "/pharmacy/prescription",
          icon: ArrowRight,
        };
      case "hardware":
        return {
          label: "Book Installation",
          href: "/hardware/services",
          icon: Wrench,
        };
      case "retail":
        return {
          label: "Gift Registry",
          href: "/retail/customization",
          icon: ArrowRight,
        };
      default:
        return {
          label: "Shop Now",
          href: `/${store.slug}`,
          icon: ArrowRight,
        };
    }
  };

  const rawNavLinks = getNavLinks();
  const navLinks = rawNavLinks.filter((l) => {
    if (!isFeatureEnabled("services")) {
      const lower = l.label.toLowerCase();
      if (
        lower.includes("service") ||
        lower.includes("tailoring") ||
        lower.includes("test-drive") ||
        lower.includes("viewing") ||
        lower.includes("consult") ||
        lower.includes("appointment") ||
        lower.includes("installation")
      ) {
        return false;
      }
    }
    return true;
  });

  let cta = getPrimaryCta();
  if (
    !isFeatureEnabled("services") &&
    (cta.label.includes("Book") || cta.label.includes("Viewing") || cta.label.includes("Fitting"))
  ) {
    cta = {
      label: "Explore Catalog",
      href: `/${store.vertical}/catalog`,
      icon: ArrowRight,
    };
  }
  const CtaIcon = cta.icon;

  return (
    <header className="sticky top-0 w-full bg-white/95 backdrop-blur-md z-30 transition-colors pt-2.5 pb-1.5">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand & Store Identity with Ofia logo just like in footer */}
        <Link href={`/${store.slug}`} className="flex items-center gap-2.5 group">
          <img
            src={store.logo}
            alt={store.name}
            className="w-9 h-9 object-contain shrink-0 group-hover:scale-105 transition-transform"
          />
          <span className="font-dropa font-extrabold text-2xl tracking-tighter text-zinc-950 uppercase">
            {store.name}
          </span>
        </Link>

        {/* Center Pill Category Tabs matching moodboard (Dashboard, Women, Men, Kids) */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#E2E4E8]/80 p-1.5 rounded-full shadow-2xs overflow-x-auto max-w-[50vw] xl:max-w-[60vw]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 whitespace-nowrap px-6 py-2 rounded-full text-xs sm:text-sm transition-all text-center flex items-center justify-center ${
                  isActive
                    ? "bg-white text-zinc-950 shadow-sm font-bold"
                    : "text-stone-600 hover:text-zinc-950 font-medium hover:bg-white/40"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Search + Bag + Bell + User Avatar Pill matching moodboard */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search */}
          <Link
            href={`/search?vertical=${store.vertical}`}
            className="p-2.5 rounded-full text-stone-700 hover:text-zinc-950 hover:bg-stone-200/60 transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full text-stone-700 hover:text-zinc-950 hover:bg-stone-200/60 transition-colors cursor-pointer"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {totalCount}
              </span>
            )}
          </button>

          {/* Bell Notification */}
          <button
            className="p-2.5 rounded-full text-stone-700 hover:text-zinc-950 hover:bg-stone-200/60 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* User Avatar with circular photo & dropdown chevron matching moodboard */}
          <Link
            href="/account"
            className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-white/80 hover:bg-white shadow-2xs border border-stone-200/60 transition-all cursor-pointer"
            title="Account"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
              alt="User Avatar"
              className="w-7 h-7 rounded-full object-cover"
            />
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-full text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white/95 px-5 py-4 space-y-3 shadow-lg">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-full text-base font-semibold transition-colors ${
                  pathname === link.href
                    ? "bg-zinc-900 text-white"
                    : "text-stone-800 hover:bg-stone-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-base font-semibold text-stone-800 hover:bg-stone-100 transition-colors"
            >
              <User className="w-5 h-5 text-blue-600" />
              <span>Customer Account</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2.5">
            <Link
              href={cta.href}
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-white text-center shadow-sm"
              style={{ backgroundColor: store.primaryColor }}
            >
              <CtaIcon className="w-4 h-4" />
              <span>{cta.label}</span>
            </Link>
            <div className="text-center text-sm text-stone-600 pt-1">
              📞 {store.contact.phone} · {store.contact.operatingHours}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
