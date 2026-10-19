"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Compass,
  ShoppingCart,
  Calendar,
  Tag,
  Mail,
  Wallet,
  Percent,
  Settings,
  User,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowUpRight,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  CreditCard,
  Send,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { MOCK_STORES } from "@/data/mockStores";

export default function StickySidebarNav() {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();

  // Slide-over drawers state
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showPromoBadge, setShowPromoBadge] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Form states
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: "", contact: "", message: "" });
  const [refundFormOpen, setRefundFormOpen] = useState(false);
  const [refundSubmitted, setRefundSubmitted] = useState(false);
  const [refundOrderRef, setRefundOrderRef] = useState("OF-8419");
  const [refundReason, setRefundReason] = useState("Size exchange or fit adjustment");

  // Extract current vertical from pathname if present
  const segments = pathname.split("/").filter(Boolean);
  const currentVertical = segments[0] || "fashion";
  const store = MOCK_STORES[currentVertical] || MOCK_STORES.fashion;

  // Check if current page is the vertical storefront home
  const isVerticalHome =
    pathname === `/${currentVertical}` ||
    pathname === "/";

  // Vertical-specific Lookbook route
  const getLookbookHref = () => {
    if (currentVertical === "fashion") return "/fashion/lookbook";
    return `/${currentVertical}/catalog`;
  };

  // Vertical-specific Catalog route
  const getCatalogHref = () => {
    switch (currentVertical) {
      case "cars":
        return "/cars/listings";
      case "food":
        return "/food/menu";
      case "property":
        return "/property/listings";
      case "beauty":
        return "/beauty/products";
      default:
        return `/${currentVertical}/catalog`;
    }
  };

  // Vertical-specific Booking route & metadata
  const getBookingInfo = () => {
    switch (currentVertical) {
      case "fashion":
        return {
          href: "/fashion/custom-tailoring",
          label: "Book Fitting Atelier",
          shortLabel: "Bespoke Fitting",
        };
      case "cars":
        return {
          href: "/cars/book-test-drive/car-001",
          label: "Book Showroom Test-Drive",
          shortLabel: "Test Drive",
        };
      case "food":
        return {
          href: "/food/custom-order",
          label: "Book Event Catering & Custom Cakes",
          shortLabel: "Catering",
        };
      case "property":
        return {
          href: "/property/schedule-viewing/prp-001",
          label: "Schedule In-Person / Video Tour",
          shortLabel: "Viewing",
        };
      case "gadgets":
        return {
          href: "/gadgets/repairs",
          label: "Book Hardware Diagnostic & Repair",
          shortLabel: "Diagnostics",
        };
      case "beauty":
        return {
          href: "/beauty/book-appointment",
          label: "Book Salon & Spa Specialist",
          shortLabel: "Salon Slot",
        };
      case "pharmacy":
        return {
          href: "/pharmacy/consultation",
          label: "Book Pharmacist Clinical Consultation",
          shortLabel: "Consult Rx",
        };
      case "hardware":
        return {
          href: "/hardware/calculator",
          label: "Book Solar Sizing & Site Survey",
          shortLabel: "Solar Survey",
        };
      case "home-living":
        return {
          href: "/home-living/delivery-options",
          label: "Book White-Glove Installation",
          shortLabel: "Installation",
        };
      case "retail":
        return {
          href: "/retail/customization",
          label: "Book Personal Shopper & Registry",
          shortLabel: "Registry",
        };
      default:
        return {
          href: "/account",
          label: "Customer Bookings & Services",
          shortLabel: "Bookings",
        };
    }
  };

  const bookingInfo = getBookingInfo();
  const catalogHref = getCatalogHref();
  const lookbookHref = getLookbookHref();

  const handleCopyCode = () => {
    navigator.clipboard.writeText("SUMMER50");
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    setRefundSubmitted(true);
  };

  return (
    <>
      {/* Desktop Sticky Icon Sidebar - Always Visible on Left */}
      <aside
        className="sticky top-0 h-screen max-h-screen h-dvh w-18 md:w-20 bg-[#ECEEF2] z-40 hidden lg:flex flex-col items-center justify-between pb-4 shrink-0 select-none overflow-hidden border-r border-stone-300/30"
        aria-label="Storefront Icon Navigation"
      >
        {/* Primary Navigation Stack - Dropped vertical start position aligning with Hero Card */}
        <nav className="flex flex-col items-center gap-2 xl:gap-2.5 w-full px-3 pt-16 xl:pt-[70px]">
          {/* 1. Storefront Home */}
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
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Home
            </span>
          </div>

          {/* 2. Compass / Editorial Lookbook */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href={lookbookHref}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                pathname.includes("/lookbook")
                  ? "bg-[#111318] text-white shadow-md"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <Compass className="w-5 h-5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Editorial Lookbook
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
              Bag ({totalCount} items)
            </span>
          </div>

          {/* 4. Calendar / Bookings & Appointments */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href={bookingInfo.href}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                pathname === bookingInfo.href
                  ? "bg-[#111318] text-white shadow-md"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <Calendar className="w-5 h-5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              {bookingInfo.label}
            </span>
          </div>

          {/* 5. Tag / Catalog & Special Drops */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href={catalogHref}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                pathname.includes("/catalog") || pathname.includes("/listings") || pathname.includes("/menu")
                  ? "bg-[#111318] text-white shadow-md"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <Tag className="w-5 h-5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Collections & Catalog
            </span>
          </div>

          {/* 6. Mail / Quick Inquiry Slide-Over Drawer (WhatsApp, Phone, Chat) */}
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={() => setIsInquiryOpen(true)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isInquiryOpen
                  ? "bg-[#111318] text-white shadow-md"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <Mail className="w-5 h-5" />
            </button>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Contact Concierge (WhatsApp & Chat)
            </span>
          </div>

          {/* 7. Wallet / Store Wallet & Customer Refunds */}
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={() => setIsWalletOpen(true)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isWalletOpen
                  ? "bg-[#111318] text-white shadow-md"
                  : "text-stone-500 hover:text-zinc-950 hover:bg-black/5"
              }`}
            >
              <Wallet className="w-5 h-5" />
            </button>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Store Wallet & Refunds
            </span>
          </div>

          {/* 8. Percent / Promotional Campaign */}
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={() => setShowPromoBadge(!showPromoBadge)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-stone-500 hover:text-zinc-950 hover:bg-black/5 transition-all cursor-pointer"
            >
              <Percent className="w-5 h-5" />
            </button>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Active Offers & Vouchers
            </span>
          </div>
        </nav>

        {/* Bottom Pinned Controls (Settings & Account) */}
        <div className="flex flex-col items-center gap-2 w-full px-3 pt-3 pb-2 border-t border-stone-300/40">
          {/* Store Info & Policies */}
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href={`/info?vertical=${currentVertical}`}
              className="w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:text-zinc-950 hover:bg-black/5 transition-all"
            >
              <Settings className="w-4.5 h-4.5" />
            </Link>
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
              Store Info & Policies
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

      {/* Mobile Sticky Bottom Icon Bar (Always Visible on Small Screens) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ECEEF2]/95 backdrop-blur-md border-t border-stone-300/60 px-3 py-2 flex items-center justify-around shadow-lg"
        aria-label="Mobile Navigation Bar"
      >
        <Link
          href={`/${currentVertical}`}
          className={`p-2 rounded-2xl flex flex-col items-center ${
            isVerticalHome ? "bg-zinc-900 text-white" : "text-stone-500 hover:text-zinc-900"
          }`}
          title="Home"
        >
          <LayoutGrid className="w-5 h-5" />
        </Link>

        <Link
          href={lookbookHref}
          className={`p-2 rounded-2xl flex flex-col items-center ${
            pathname.includes("/lookbook") ? "bg-zinc-900 text-white" : "text-stone-500 hover:text-zinc-900"
          }`}
          title="Lookbook"
        >
          <Compass className="w-5 h-5" />
        </Link>

        <Link
          href={bookingInfo.href}
          className={`p-2 rounded-2xl flex flex-col items-center ${
            pathname === bookingInfo.href ? "bg-zinc-900 text-white" : "text-stone-500 hover:text-zinc-900"
          }`}
          title={bookingInfo.shortLabel}
        >
          <Calendar className="w-5 h-5" />
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 rounded-2xl flex flex-col items-center text-stone-500 hover:text-zinc-900 cursor-pointer"
          title="Bag"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsInquiryOpen(true)}
          className="p-2 rounded-2xl flex flex-col items-center text-stone-500 hover:text-zinc-900 cursor-pointer"
          title="Inquiry"
        >
          <Mail className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsWalletOpen(true)}
          className="p-2 rounded-2xl flex flex-col items-center text-stone-500 hover:text-zinc-900 cursor-pointer"
          title="Wallet & Refunds"
        >
          <Wallet className="w-5 h-5" />
        </button>

        <Link
          href="/account"
          className={`p-2 rounded-2xl flex flex-col items-center ${
            pathname === "/account" ? "bg-zinc-900 text-white" : "text-stone-500 hover:text-zinc-900"
          }`}
          title="Account"
        >
          <User className="w-5 h-5" />
        </Link>
      </nav>

      {/* QUICK INQUIRY SLIDE-OVER DRAWER (WhatsApp, Phone, Chat) */}
      {isInquiryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsInquiryOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <aside className="relative z-10 w-full sm:w-[440px] h-full bg-[#111216] text-white flex flex-col justify-between p-6 sm:p-7 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-9 h-9 object-contain shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-base text-white leading-tight">{store.name} Concierge</h3>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Verified Merchant Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsInquiryOpen(false)}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close Inquiry Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Direct Channels (WhatsApp & Phone) */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Instant Support Channels
                </p>

                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/${store.contact.whatsapp?.replace(/[^0-9]/g, "") || "2348025550192"}?text=${encodeURIComponent(
                    `Hello ${store.name}, I am browsing your storefront on Ofia and would like to make an inquiry.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 hover:bg-emerald-600/25 transition-all text-emerald-400 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Chat on WhatsApp
                      </p>
                      <p className="text-xs text-emerald-400/80">Direct concierge · Fast response</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                {/* Phone Call Button */}
                <a
                  href={`tel:${store.contact.phone}`}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        Call Direct Line
                      </p>
                      <p className="text-xs text-zinc-400">{store.contact.phone}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                </a>
              </div>

              {/* In-Store Live Message Form */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Send Store Inquiry
                </p>

                {inquirySubmitted ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-in fade-in">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-sm text-white">Inquiry Dispatched!</h4>
                    <p className="text-xs text-emerald-300/80 leading-relaxed">
                      Your message has been forwarded to the {store.name} desk. A representative will contact you via WhatsApp or Email shortly.
                    </p>
                    <button
                      onClick={() => setInquirySubmitted(false)}
                      className="text-xs text-zinc-400 underline hover:text-white pt-1 cursor-pointer"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendInquiry} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="WhatsApp / Phone or Email"
                        value={inquiryForm.contact}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, contact: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <textarea
                        required
                        rows={3}
                        placeholder={`Ask about items, sizing, deliveries, or bespoke requests...`}
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-tight transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message to Merchant</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Showroom Operating Hours & Location */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-zinc-400">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Operating Hours</span>
                    <span>{store.contact.operatingHours}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 pt-1 border-t border-white/5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Showroom Address</span>
                    <span>{store.contact.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-zinc-500 flex items-center justify-between">
              <span>Direct Merchant Inquiries</span>
              <span className="text-zinc-400">Avg. Reply &lt; 15 mins</span>
            </div>
          </aside>
        </div>
      )}

      {/* STORE WALLET & CUSTOMER REFUNDS DRAWER */}
      {isWalletOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsWalletOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <aside className="relative z-10 w-full sm:w-[440px] h-full bg-[#111216] text-white flex flex-col justify-between p-6 sm:p-7 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white leading-tight">Store Wallet & Refunds</h3>
                    <p className="text-xs text-zinc-400">{store.name} Customer Balance</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWalletOpen(false)}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close Wallet Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wallet Card */}
              <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border border-white/15 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 tracking-wide">Available Store Credit</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Instant at Checkout
                  </span>
                </div>

                <div>
                  <span className="font-dropa text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {store.currency === "$" ? "$120.00" : "₦38,500.00"}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Applicable automatically toward any item or booking on this shop.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsWalletOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs transition-colors shadow-xs cursor-pointer text-center"
                  >
                    Apply Credit to Bag
                  </button>
                  <button
                    onClick={() => setRefundFormOpen(!refundFormOpen)}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors border border-white/10 cursor-pointer text-center"
                  >
                    Request Refund
                  </button>
                </div>
              </div>

              {/* Request Refund Form Accordion */}
              {refundFormOpen && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Submit Return / Refund Request
                    </span>
                    <button
                      onClick={() => setRefundFormOpen(false)}
                      className="text-zinc-500 hover:text-zinc-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  {refundSubmitted ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-white">Refund Request Logged</p>
                      <p className="text-[11px] text-emerald-300/80">
                        Refund reference #RF-9482 has been created. Funds return directly to your Store Wallet upon merchant verification.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRefund} className="space-y-2.5">
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Order Reference</label>
                        <select
                          value={refundOrderRef}
                          onChange={(e) => setRefundOrderRef(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-hidden"
                        >
                          <option value="OF-8419">Order #OF-8419 (Delivered 3 days ago)</option>
                          <option value="OF-7910">Order #OF-7910 (Delivered 1 week ago)</option>
                          <option value="BK-4291">Booking #BK-4291 (Upcoming appointment)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Reason for Refund / Exchange</label>
                        <input
                          type="text"
                          required
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        Submit Refund Request
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Refund & Transaction Activity */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Recent Wallet & Refund Activity
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Refund #RF-9481 Approved</p>
                        <p className="text-[11px] text-zinc-400">Size Exchange Adjustment · Store Credit</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">
                      +{store.currency === "$" ? "$45.00" : "₦18,500.00"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Order #OF-8419 Redemption</p>
                        <p className="text-[11px] text-zinc-400">Applied at Checkout</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-300">
                      -{store.currency === "$" ? "$30.00" : "₦12,000.00"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Verified Customer Welcome</p>
                        <p className="text-[11px] text-zinc-400">Patron Tier Loyalty Credit</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">
                      +{store.currency === "$" ? "$105.00" : "₦32,000.00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ofia Buyer Protection Banner */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-zinc-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs">Ofia Buyer Protection</h4>
                  <p className="text-[11px] leading-relaxed mt-0.5">
                    All customer refunds and size exchanges are backed by Ofia escrow. Store wallet credits never expire.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-zinc-500 flex items-center justify-between">
              <Link href="/account" className="text-zinc-400 hover:text-white underline">
                View Complete Account History
              </Link>
              <span>Instant Escrow Return</span>
            </div>
          </aside>
        </div>
      )}

      {/* FLOATING PROMO TOAST / VOUCHER SHEET */}
      {showPromoBadge && (
        <div className="fixed top-16 left-24 z-50 bg-[#111318] text-white px-5 py-4 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-200">
          <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-sm block">Voucher Code: SUMMER50</span>
            <span className="text-zinc-400 block">50% off seasonal capsules &amp; free sizing exchange.</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer ml-1"
          >
            {copiedPromo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPromo ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={() => setShowPromoBadge(false)}
            className="text-stone-400 hover:text-white text-xs ml-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
