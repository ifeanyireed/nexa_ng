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
} from "lucide-react";
import { VendorStore } from "@/types/storefront";
import { useCart } from "@/context/CartContext";

interface StoreHeaderProps {
  store: VendorStore;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();

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
          { label: "Compare Specs", href: "/gadgets/compare" },
          { label: "Repairs & Warranty", href: "/gadgets/repairs" },
        ];
      case "beauty":
        return [
          { label: "Sanctuary", href: "/beauty" },
          { label: "Skincare Products", href: "/beauty/products" },
          { label: "Studio Services", href: "/beauty/services" },
          { label: "Book Appointment", href: "/beauty/book-appointment" },
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
          label: "Sizing Calculator",
          href: "/hardware/calculator",
          icon: ArrowRight,
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

  const navLinks = getNavLinks();
  const cta = getPrimaryCta();
  const CtaIcon = cta.icon;

  return (
    <header className="w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 sticky top-11 z-40 transition-colors">
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 py-3.5 sm:py-4 flex items-center justify-between gap-6">
        {/* Brand & Store Identity */}
        <Link href={`/${store.slug}`} className="flex items-center gap-3 group">
          <img
            src={store.logo}
            alt={store.name}
            className="w-11 h-11 object-contain shrink-0 group-hover:scale-105 transition-transform"
          />
          <span className="font-dropa font-bold text-xl sm:text-2xl text-zinc-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
            {store.name}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2 bg-stone-100/90 p-2 rounded-full border border-stone-200/80 shadow-xs">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`min-w-[120px] xl:min-w-[145px] px-6 sm:px-8 py-2.5 rounded-full text-sm font-semibold transition-all text-center flex items-center justify-center ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-stone-700 hover:text-zinc-900 hover:bg-stone-200/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Phone + CTA + Account + Cart + Mobile Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href={`tel:${store.contact.phone}`}
            className="hidden md:flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-zinc-900 px-3.5 py-2 rounded-full hover:bg-stone-200/60 transition-colors"
          >
            <Phone className="w-4 h-4 text-stone-500" />
            <span>{store.contact.phone}</span>
          </a>

          {/* Vertical Primary Action Button */}
          <Link
            href={cta.href}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
            style={{ backgroundColor: store.primaryColor }}
          >
            <CtaIcon className="w-4 h-4" />
            <span>{cta.label}</span>
          </Link>

          {/* Search Trigger */}
          <Link
            href={`/search?vertical=${store.vertical}`}
            className="p-2.5 sm:p-3 rounded-full bg-stone-100 hover:bg-stone-200 text-zinc-900 transition-colors cursor-pointer"
            title="Search Storefront"
          >
            <Search className="w-5 h-5" />
          </Link>


          {/* Customer Account Trigger */}
          <Link
            href="/account"
            className="p-2.5 sm:p-3 rounded-full bg-stone-100 hover:bg-stone-200 text-zinc-900 transition-colors cursor-pointer"
            title="Customer Account: Profile, Addresses, Orders, Bookings"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 sm:p-3 rounded-full bg-stone-100 hover:bg-stone-200 text-zinc-900 transition-colors cursor-pointer"
            title="Open Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                {totalCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 rounded-full text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
