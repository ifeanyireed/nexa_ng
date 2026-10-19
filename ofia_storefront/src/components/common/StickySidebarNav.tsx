"use client";

import { useState, useRef, useEffect } from "react";
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
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { MOCK_STORES } from "@/data/mockStores";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
}

export default function StickySidebarNav() {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();

  // Slide-over drawers state
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showPromoBadge, setShowPromoBadge] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Extract current vertical from pathname if present
  const segments = pathname.split("/").filter(Boolean);
  const currentVertical = segments[0] || "fashion";
  const store = MOCK_STORES[currentVertical] || MOCK_STORES.fashion;

  // Live Concierge Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome-1",
      sender: "bot",
      text: `Hello! Welcome to ${store.name}. How can I assist you with products, sizing, or store orders today?`,
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Wallet / Refund states
  const [refundFormOpen, setRefundFormOpen] = useState(false);
  const [refundSubmitted, setRefundSubmitted] = useState(false);
  const [refundOrderRef, setRefundOrderRef] = useState("OF-8419");
  const [refundReason, setRefundReason] = useState("Size exchange or fit adjustment");

  // Auto-scroll chat
  useEffect(() => {
    if (isInquiryOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping, isInquiryOpen]);

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
          shortLabel: "Fitting",
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

  // Conversational response logic
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = `Thanks for messaging ${store.name}! Our showroom concierge has received this and will respond shortly. You can also chat with us directly on WhatsApp via the button above for instant photo sharing.`;

      const lower = text.toLowerCase();
      if (lower.includes("sizing") || lower.includes("size") || lower.includes("fit")) {
        replyText = `Our pieces follow bespoke contemporary tailoring. You can see exact garment measurements on each catalog item, or schedule a fitting with our master tailor via the Calendar icon.`;
      } else if (lower.includes("delivery") || lower.includes("dispatch") || lower.includes("shipping") || lower.includes("lagos")) {
        replyText = `We dispatch directly from our Lekki showroom with live GPS courier tracking across Nigeria. Lagos deliveries arrive within 24-48 hours, with same-day express dispatch available!`;
      } else if (lower.includes("return") || lower.includes("exchange") || lower.includes("refund")) {
        replyText = `All purchases are backed by Ofia Buyer Protection. If you need a size exchange or refund, you can request it anytime via the Store Wallet icon in the left menu!`;
      } else if (lower.includes("custom") || lower.includes("tailor") || lower.includes("book") || lower.includes("appointment")) {
        replyText = `We specialize in bespoke tailoring and tailored orders. Tap the Calendar icon on the sidebar to book your private session directly.`;
      } else if (lower.includes("price") || lower.includes("discount") || lower.includes("promo") || lower.includes("coupon")) {
        replyText = `You can apply code SUMMER50 at checkout for up to 50% off select seasonal capsule items. Tap the % icon on the sidebar to copy active coupons!`;
      } else if (lower.includes("hours") || lower.includes("location") || lower.includes("address")) {
        replyText = `Our showroom is located at ${store.contact.address}. We are open ${store.contact.operatingHours}.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-reply`,
          sender: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    setRefundSubmitted(true);
  };

  const quickPrompts = [
    "What is your sizing guide?",
    "How fast is dispatch in Lagos?",
    "Can I book a custom fitting?",
    "What is your return policy?",
  ];

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

          {/* 6. Mail / Live Concierge Chat Drawer (Light Mode) */}
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
              Live Concierge Chat
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
          title="Live Chat"
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

      {/* LIVE CONCIERGE CHAT DRAWER (LIGHT MODE, MATCHING CART DRAWER) */}
      {isInquiryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsInquiryOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body - Light Mode (Matching CartDrawer.tsx) */}
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header (Matching Cart Drawer Header) */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/90 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-9 h-9 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-dropa font-bold text-base text-zinc-900 truncate">
                    {store.name} Concierge
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online · Typically replies in ~2m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Direct WhatsApp Switch */}
                <a
                  href={`https://wa.me/${store.contact.whatsapp?.replace(/[^0-9]/g, "") || "2348025550192"}?text=${encodeURIComponent(
                    `Hello ${store.name}, I'm browsing your storefront on Ofia and have an inquiry.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  title="Switch to WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>

                {/* Direct Call Switch */}
                <a
                  href={`tel:${store.contact.phone}`}
                  className="p-1.5 rounded-full text-stone-500 hover:text-zinc-900 hover:bg-stone-200 transition-colors"
                  title={`Call ${store.contact.phone}`}
                >
                  <Phone className="w-4 h-4" />
                </a>

                {/* Close Button */}
                <button
                  onClick={() => setIsInquiryOpen(false)}
                  className="p-1.5 rounded-full text-stone-500 hover:text-zinc-900 hover:bg-stone-200 transition-colors cursor-pointer"
                  aria-label="Close Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Thread Messages (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#FAF9F5] min-h-0">
              {/* Showroom & Operating Hours Badge */}
              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2 text-stone-800 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{store.contact.address}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{store.contact.operatingHours}</span>
                </div>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left text-xs px-3 py-1.5 rounded-full bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80 font-medium transition-all shadow-2xs hover:border-stone-300 cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Bubbles */}
              <div className="space-y-3 pt-2">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 items-end ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <img
                        src={store.logo}
                        alt="Bot"
                        className="w-6 h-6 object-contain shrink-0 mb-1"
                      />
                    )}
                    <div
                      className={`max-w-[82%] sm:max-w-[78%] p-3.5 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#111318] text-white rounded-2xl rounded-tr-xs shadow-xs"
                          : "bg-white text-zinc-900 border border-stone-200/80 rounded-2xl rounded-tl-xs shadow-2xs"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[10px] mt-1.5 block font-medium ${
                          msg.sender === "user" ? "text-stone-400 text-right" : "text-stone-400"
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-stone-500 text-xs">
                    <img
                      src={store.logo}
                      alt="Bot"
                      className="w-6 h-6 object-contain shrink-0"
                    />
                    <div className="bg-white border border-stone-200 px-3.5 py-2 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            </div>

            {/* Chat Input Bar (Sticky at Bottom) */}
            <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-white shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question or inquire about an order..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full bg-stone-100 border border-stone-200 text-xs sm:text-sm text-zinc-900 placeholder-stone-400 focus:outline-hidden focus:bg-white focus:border-zinc-900 transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-xs cursor-pointer"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-[10px] text-stone-400 text-center mt-2 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified Direct Line · Powered by Ofia Live Commerce</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* STORE WALLET & CUSTOMER REFUNDS DRAWER (LIGHT MODE, MATCHING CART DRAWER) */}
      {isWalletOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsWalletOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body - Light Mode (Matching CartDrawer.tsx) */}
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-dropa font-bold text-base text-zinc-900 leading-tight">
                    Store Wallet &amp; Refunds
                  </h3>
                  <p className="text-xs text-stone-500">{store.name} Customer Credit</p>
                </div>
              </div>
              <button
                onClick={() => setIsWalletOpen(false)}
                className="p-1.5 rounded-full text-stone-500 hover:text-zinc-900 hover:bg-stone-200 transition-colors cursor-pointer"
                aria-label="Close Wallet Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#FAF9F5] min-h-0">
              {/* Wallet Balance Card */}
              <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#111216] text-white border border-stone-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-300 tracking-wide">
                    Available Store Credit
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Instant at Checkout
                  </span>
                </div>

                <div>
                  <span className="font-dropa text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {store.currency === "$" ? "$120.00" : "₦38,500.00"}
                  </span>
                  <p className="text-[11px] text-stone-300/80 mt-1">
                    Applicable automatically toward any item or booking across {store.name}.
                  </p>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsWalletOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white text-zinc-950 hover:bg-stone-100 font-bold text-xs transition-colors shadow-xs cursor-pointer text-center"
                  >
                    Apply Credit to Bag
                  </button>
                  <button
                    onClick={() => setRefundFormOpen(!refundFormOpen)}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors border border-white/15 cursor-pointer text-center"
                  >
                    Request Refund
                  </button>
                </div>
              </div>

              {/* Request Refund Form Accordion */}
              {refundFormOpen && (
                <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Submit Return / Refund Request
                    </span>
                    <button
                      onClick={() => setRefundFormOpen(false)}
                      className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {refundSubmitted ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-emerald-900">Refund Request Logged</p>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Refund reference #RF-9482 has been created. Funds return directly to your Store Wallet upon merchant verification.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRefund} className="space-y-2.5">
                      <div>
                        <label className="text-[11px] text-stone-600 font-semibold block mb-1">
                          Select Order
                        </label>
                        <select
                          value={refundOrderRef}
                          onChange={(e) => setRefundOrderRef(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-zinc-900 focus:outline-hidden"
                        >
                          <option value="OF-8419">Order #OF-8419 (Delivered 3 days ago)</option>
                          <option value="OF-7910">Order #OF-7910 (Delivered 1 week ago)</option>
                          <option value="BK-4291">Booking #BK-4291 (Upcoming appointment)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-stone-600 font-semibold block mb-1">
                          Reason for Refund / Exchange
                        </label>
                        <input
                          type="text"
                          required
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-zinc-900 focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        Submit Refund Request
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Refund & Transaction Activity */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Recent Wallet &amp; Refund Activity
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Refund #RF-9481 Approved</p>
                        <p className="text-[11px] text-stone-500">Size Exchange Adjustment · Store Credit</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">
                      +{store.currency === "$" ? "$45.00" : "₦18,500.00"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Order #OF-8419 Redemption</p>
                        <p className="text-[11px] text-stone-500">Applied at Checkout</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-700">
                      -{store.currency === "$" ? "$30.00" : "₦12,000.00"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">Verified Customer Welcome</p>
                        <p className="text-[11px] text-stone-500">Patron Tier Loyalty Credit</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">
                      +{store.currency === "$" ? "$105.00" : "₦32,000.00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ofia Buyer Protection Banner */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-start gap-3 text-xs text-stone-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-zinc-900 text-xs">Ofia Buyer Escrow Protection</h4>
                  <p className="text-[11px] leading-relaxed mt-0.5">
                    All customer refunds and size exchanges are backed by Ofia escrow. Store wallet credits never expire.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 bg-white text-[11px] text-stone-500 flex items-center justify-between shrink-0">
              <Link href="/account" className="text-zinc-900 font-semibold hover:underline">
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
