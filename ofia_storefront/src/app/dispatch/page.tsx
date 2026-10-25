"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Truck,
  MapPin,
  Package,
  ShieldCheck,
  Clock,
  ArrowRight,
  ChevronLeft,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Utensils,
  Laptop,
  Shirt,
  Sparkles,
  CreditCard,
  Building,
  Navigation,
  Check,
  Search,
  MessageCircle,
  Layers,
  Banknote,
  Send,
} from "lucide-react";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";

function DispatchBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenantSlug, store, handshake } = useStorefrontTenant();

  // Branding context
  const activeTenantSlug = (tenantSlug || searchParams.get("tenant") || "").toLowerCase().trim();
  const storeName = store?.name || handshake?.storefrontConfig?.storeName || (activeTenantSlug ? activeTenantSlug.toUpperCase() : "Ofia Dispatch");
  const storePhone = store?.contact?.phone || "+234 803 123 4567";
  const storeWhatsApp = store?.contact?.whatsapp || "";
  const storeAddress = store?.contact?.address || "Lekki Phase 1 & Ikeja Logistics Corridor, Lagos";
  const primaryColor = store?.primaryColor || "#2563EB";

  // Quick Tracker State
  const [quickTrackRef, setQuickTrackRef] = useState("");

  // Form State
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCity, setPickupCity] = useState("Lagos");
  const [pickupNotes, setPickupNotes] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCity, setDropoffCity] = useState("Lagos");
  const [dropoffNotes, setDropoffNotes] = useState("");

  const [parcelCategory, setParcelCategory] = useState<string>("Documents");
  const [parcelDesc, setParcelDesc] = useState("");
  const [weightTier, setWeightTier] = useState<"light" | "medium" | "heavy" | "bulky">("light");
  const [vehicleType, setVehicleType] = useState<"bike" | "van">("bike");
  const [speed, setSpeed] = useState<"instant" | "standard">("instant");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "cod">("card");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Fare Ledger Calculation
  const baseFare = 1500;
  const distanceFare = 1650; // Estimated Lagos metro baseline
  const weightSurcharge =
    weightTier === "medium"
      ? 800
      : weightTier === "heavy"
      ? 1800
      : weightTier === "bulky"
      ? 4500
      : 0;
  const vehicleSurcharge = vehicleType === "van" ? 3000 : 0;
  const speedSurcharge = speed === "instant" ? 600 : 0;
  const insuranceFee = 150;

  const totalFare =
    baseFare +
    distanceFare +
    weightSurcharge +
    vehicleSurcharge +
    speedSurcharge +
    insuranceFee;

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG")}`;
  };

  const categories = [
    { label: "Documents", icon: FileText, desc: "Legal files, passports, contracts" },
    { label: "Food & Groceries", icon: Utensils, desc: "Meal boxes, pastries, produce" },
    { label: "Electronics", icon: Laptop, desc: "Phones, computers, accessories" },
    { label: "Fashion & Cloths", icon: Shirt, desc: "Apparel, footwear, bespoke tailoring" },
    { label: "Fragile / Luxury", icon: AlertCircle, desc: "Perfumes, eyewear, jewelry" },
    { label: "Box / Cargo", icon: Package, desc: "Medium to heavy wholesale parcels" },
  ];

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackRef.trim()) return;
    router.push(
      `/order-tracking?ref=${encodeURIComponent(quickTrackRef.trim())}&tenant=${encodeURIComponent(activeTenantSlug)}`
    );
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeTenantSlug) {
      setErrorMessage("tenant parameter is required for multi-tenant isolation. Please access via your operator subdomain (e.g. yourbrand.ofia.ng) or append ?tenant=yourbrand");
      return;
    }

    if (!pickupAddress || !dropoffAddress || !recipientName || !senderName || !senderPhone || !recipientPhone) {
      setErrorMessage("Please complete all required sender and recipient details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/storefront/dispatch?tenant=${encodeURIComponent(activeTenantSlug)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": activeTenantSlug,
        },
        body: JSON.stringify({
          tenantSlug: activeTenantSlug,
          senderName,
          senderPhone,
          pickupAddress,
          pickupCity,
          pickupNotes,
          recipientName,
          recipientPhone,
          dropoffAddress,
          dropoffCity,
          dropoffNotes,
          parcelCategory,
          parcelDesc: parcelDesc || `${parcelCategory} parcel`,
          weightTier,
          weightKg: weightTier === "light" ? 1.0 : weightTier === "medium" ? 4.5 : weightTier === "heavy" ? 15.0 : 35.0,
          vehicleType: vehicleType === "bike" ? "MOTORBIKE" : "VAN",
          speedTier: speed,
          totalFare,
          paymentMethod,
          priority: speed === "instant" ? "HIGH" : "STANDARD",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to book dispatch. Please try again.");
      }

      // Route to confirmation screen with live waybill tracking and handover OTP
      router.push(
        `/dispatch/confirmed?ref=${encodeURIComponent(data.trackingNumber)}&otp=${encodeURIComponent(data.deliveryOtp)}&fare=${encodeURIComponent(totalFare.toLocaleString())}&recipient=${encodeURIComponent(recipientName)}&tenant=${encodeURIComponent(activeTenantSlug)}`
      );
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred booking your dispatch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 text-[#111318] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar: Hub Navigation + Live Dispatch Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <Link
            href={`/?tenant=${encodeURIComponent(activeTenantSlug)}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to {storeName}</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Radar Active · 24/7 Citywide Couriers</span>
            </div>
            {storeWhatsApp && (
              <a
                href={`https://wa.me/${storeWhatsApp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Desk</span>
              </a>
            )}
          </div>
        </div>

        {/* Hero Section & Quick Waybill Tracker Bar */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5" />
                <span>On-Demand Dispatch · {storeName}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                Book Instant Courier Pickup & Delivery
              </h1>
              <p className="text-sm sm:text-base text-stone-600">
                Send contracts, corporate parcels, e-commerce orders, or food across town. Live motorcycle dispatch,
                real-time radar tracking, and OTP verification upon delivery.
              </p>
            </div>

            {/* Quick Track Input Bar */}
            <div className="lg:w-80 w-full bg-stone-50 border border-stone-200/90 rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Track an Existing Waybill</span>
              </span>
              <form onSubmit={handleQuickTrack} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. OFIA-DP-784910"
                  value={quickTrackRef}
                  onChange={(e) => setQuickTrackRef(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                >
                  Track
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Grid: 5-Step Booking Wizard (7 cols) + Live Fare Ledger (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 5-Step Interactive Booking Wizard */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleBooking} className="space-y-6">
              {/* STEP 1: ROUTE & CONTACTS */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Pickup & Destination Route</h2>
                    <p className="text-xs text-stone-500">Provide sender and recipient contacts and addresses</p>
                  </div>
                </div>

                {/* SENDER PICKUP */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pickup Location (Sender)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Sender Full Name *"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      required
                      className="text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Sender Phone Number *"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      required
                      className="text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Pickup Street Address, Estate & Landmark *"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Pickup Instructions (e.g. Ring gate bell, parcel at reception)"
                    value={pickupNotes}
                    onChange={(e) => setPickupNotes(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200/80 text-stone-600 bg-stone-50/50"
                  />
                </div>

                {/* RECIPIENT DROPOFF */}
                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Destination (Recipient)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Recipient Full Name *"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                      className="text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Recipient Phone Number *"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      required
                      className="text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Destination Street Address, Estate & Landmark *"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Delivery Notes (e.g. Call recipient upon arrival at main gate)"
                    value={dropoffNotes}
                    onChange={(e) => setDropoffNotes(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200/80 text-stone-600 bg-stone-50/50"
                  />
                </div>
              </div>

              {/* STEP 2: PARCEL CHARACTERIZATION */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Parcel Category & Weight</h2>
                    <p className="text-xs text-stone-500">Select what is being transported for proper handling</p>
                  </div>
                </div>

                {/* Category Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const isSelected = parcelCategory === c.label;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setParcelCategory(c.label)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-600"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-stone-500"}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <span className="text-xs font-bold text-stone-900">{c.label}</span>
                        <span className="text-[10px] text-stone-500 line-clamp-1">{c.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Weight Tiers */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Weight Class</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "light", label: "Light (< 2kg)", fee: "₦0" },
                      { id: "medium", label: "Medium (2-10kg)", fee: "+₦800" },
                      { id: "heavy", label: "Heavy (10-25kg)", fee: "+₦1,800" },
                      { id: "bulky", label: "Bulky (> 25kg)", fee: "+₦4,500" },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWeightTier(w.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          weightTier === w.id
                            ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                            : "border-stone-200 hover:bg-stone-50 text-stone-700 text-xs"
                        }`}
                      >
                        <div className="text-xs">{w.label}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">{w.fee}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Optional: Brief parcel description (e.g. Legal documents and spare keys)"
                  value={parcelDesc}
                  onChange={(e) => setParcelDesc(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* STEP 3: VEHICLE & SPEED */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Vehicle Type & Delivery Speed</h2>
                    <p className="text-xs text-stone-500">Select urgency and vehicle capacity</p>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVehicleType("bike")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      vehicleType === "bike"
                        ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">Dispatch Motorcycle</div>
                      <div className="text-[11px] text-stone-500">Instant urban delivery for envelopes & boxes up to 15kg</div>
                      <div className="text-xs font-semibold text-blue-700 mt-1">Standard Base</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleType("van")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      vehicleType === "van"
                        ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <Package className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">Cargo Van / SUV</div>
                      <div className="text-[11px] text-stone-500">Bulk boxes, electronics, retail stock up to 350kg</div>
                      <div className="text-xs font-semibold text-indigo-700 mt-1">+₦3,000 Van Surcharge</div>
                    </div>
                  </button>
                </div>

                {/* Speed Selection */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSpeed("instant")}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      speed === "instant"
                        ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                        : "border-stone-200 text-stone-700 text-xs"
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs">Express Instant (15m Pickup)</span>
                    <span className="block text-[10px] text-blue-700 mt-0.5">+₦600</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpeed("standard")}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      speed === "standard"
                        ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                        : "border-stone-200 text-stone-700 text-xs"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-stone-500" />
                    <span className="text-xs">Same-Day Economy</span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">Standard Rate</span>
                  </button>
                </div>
              </div>

              {/* STEP 4: PAYMENT SELECTION */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Payment & Settlement Method</h2>
                    <p className="text-xs text-stone-500">Secure online card checkout or pay-on-pickup</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">Paystack / Debit Card</div>
                      <div className="text-[10px] text-stone-500">Instant settlement & digital receipt</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === "cod"
                        ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">Pay on Pickup / Delivery</div>
                      <div className="text-[10px] text-stone-500">Cash or POS transfer at courier handover</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Broadcasting to Nearest Couriers...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Book Dispatch ({formatNaira(totalFare)})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Transparent Fare Ledger & Operator Trust (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Dynamic Fare Ledger */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5 sticky top-8">
              <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Live Delivery Ledger</h3>
                  <p className="text-[11px] text-stone-500">Real-time zone & weight pricing</p>
                </div>
                <span className="text-[11px] font-mono px-2 py-1 rounded bg-stone-100 text-stone-600 font-bold">
                  {activeTenantSlug.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Base Pickup & Flagfall</span>
                  <span className="font-mono text-stone-900">{formatNaira(baseFare)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated Distance (Lagos Metro)</span>
                  <span className="font-mono text-stone-900">{formatNaira(distanceFare)}</span>
                </div>
                {weightSurcharge > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Weight Surcharge ({weightTier})</span>
                    <span className="font-mono font-bold">+{formatNaira(weightSurcharge)}</span>
                  </div>
                )}
                {vehicleSurcharge > 0 && (
                  <div className="flex justify-between text-indigo-700">
                    <span>Van Vehicle Surcharge</span>
                    <span className="font-mono font-bold">+{formatNaira(vehicleSurcharge)}</span>
                  </div>
                )}
                {speedSurcharge > 0 && (
                  <div className="flex justify-between text-blue-700">
                    <span>Express Priority Pickup</span>
                    <span className="font-mono font-bold">+{formatNaira(speedSurcharge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Goods-In-Transit Insurance</span>
                  <span className="font-mono text-stone-900">{formatNaira(insuranceFee)}</span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-950">Total Waybill Fee</span>
                  <span className="text-xl font-black text-blue-700 font-mono">
                    {formatNaira(totalFare)}
                  </span>
                </div>
              </div>

              {/* Handover Security Notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Delivery OTP Verification Included</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Upon booking, a 4-digit security OTP is generated. The rider cannot mark the delivery complete
                  without entering this code.
                </p>
              </div>

              {/* Operator Contacts */}
              <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-stone-400" />
                  <span>{storeAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>Dispatch Operations: {storePhone}</span>
                </div>
              </div>
            </div>

            {/* B2B Merchant Retainer Box */}
            <div className="bg-gradient-to-br from-stone-900 to-zinc-950 text-white rounded-3xl p-6 space-y-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Enterprise Dispatch</span>
              </span>
              <h4 className="text-base font-bold">Corporate Accounts & Daily Merchant Pickups</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                E-commerce merchants, pharmaceutical distributors, and legal chambers qualify for discounted bulk rate cards
                and end-of-month invoice billing.
              </p>
              <a
                href={`mailto:${store?.contact?.email || "dispatch@ofia.ng"}?subject=Corporate%20Dispatch%20Account%20Inquiry`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                <span>Request B2B Corporate Rates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DispatchBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <DispatchBookingContent />
    </Suspense>
  );
}
