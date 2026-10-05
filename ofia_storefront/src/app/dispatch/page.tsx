"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function DispatchBookingPage() {
  const router = useRouter();

  // Form State
  const [senderName, setSenderName] = useState("Sarah Johnson");
  const [senderPhone, setSenderPhone] = useState("+234 803 123 4567");
  const [pickupAddress, setPickupAddress] = useState("14B Admiralty Way, Lekki Phase 1");
  const [pickupCity, setPickupCity] = useState("Lagos");
  const [pickupNotes, setPickupNotes] = useState("Ring bell at gate, parcel at reception desk");

  const [recipientName, setRecipientName] = useState("Dr. Babatunde Alabi");
  const [recipientPhone, setRecipientPhone] = useState("+234 812 345 6789");
  const [dropoffAddress, setDropoffAddress] = useState("42 Isaac John Street, GRA, Ikeja");
  const [dropoffCity, setDropoffCity] = useState("Lagos");
  const [dropoffNotes, setDropoffNotes] = useState("Call recipient upon arrival at main gate");

  const [parcelCategory, setParcelCategory] = useState<string>("Documents");
  const [parcelDesc, setParcelDesc] = useState("Legal agreements, corporate documents and duplicate keys");
  const [weightTier, setWeightTier] = useState<"light" | "medium" | "heavy" | "bulky">("light");
  const [vehicleType, setVehicleType] = useState<"bike" | "van">("bike");
  const [speed, setSpeed] = useState<"instant" | "standard">("instant");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "cod">("wallet");

  const [isMatching, setIsMatching] = useState(false);
  const [matchedRider, setMatchedRider] = useState<{
    name: string;
    vehicle: string;
    rating: string;
    eta: string;
  } | null>(null);

  // Dynamic Fare Ledger Calculation
  const baseFare = 1500;
  const distanceFare = 1650; // Estimated 18.2 km between Lekki & Ikeja
  const weightSurcharge =
    weightTier === "medium"
      ? 800
      : weightTier === "heavy"
      ? 1800
      : weightTier === "bulky"
      ? 4500
      : 0;
  const vehicleSurcharge = vehicleType === "van" ? 2500 : 0;
  const speedSurcharge = speed === "instant" ? 500 : 0;
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
    { label: "Documents", icon: FileText },
    { label: "Food & Groceries", icon: Utensils },
    { label: "Electronics", icon: Laptop },
    { label: "Fashion & Cloths", icon: Shirt },
    { label: "Fragile / Glass", icon: AlertCircle },
    { label: "Box / Cargo", icon: Package },
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress || !dropoffAddress || !recipientName || !senderName) {
      alert("Please fill in both pickup and destination details.");
      return;
    }

    setIsMatching(true);

    // Simulate proximity rider search
    setTimeout(() => {
      setMatchedRider({
        name: "Ibrahim Musa",
        vehicle: "Yamaha NMAX 155 (Plate: KJA-482-XA)",
        rating: "4.9 ★ (412 trips)",
        eta: "5 mins to pickup",
      });
    }, 1800);
  };

  const handleProceedToTracking = () => {
    const waybillRef = `OFIA-DP-${Math.floor(100000 + Math.random() * 900000)}`;
    router.push(`/order-tracking?ref=${waybillRef}&type=dispatch`);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#111318] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Storefronts Hub</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Dispatch Active · 24/7 Citywide Fleet</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>Independent Courier Dispatch · Blueprint §6.4</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            Book On-Demand Courier Pickup
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl">
            Send corporate files, eCommerce orders, or personal packages across town with instant rider dispatch and real-time GPS delivery tracking.
          </p>
        </div>

        {/* Main Grid: Form (7 cols) + Live Quote & Trust (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleBooking} className="space-y-6">
              {/* SECTION 1: ROUTE & CONTACTS */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 border-b border-stone-100 pb-3">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>1. Pickup & Destination Route</span>
                </div>

                <div className="space-y-6">
                  {/* Origin / Pickup */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <label className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Pickup Location (Sender)
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-500">Sender Full Name</label>
                        <input
                          type="text"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full mt-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-500">Sender Phone</label>
                        <input
                          type="tel"
                          required
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          className="w-full mt-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-500">Street Address & Landmark</label>
                      <input
                        type="text"
                        required
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="e.g. 14B Admiralty Way, Lekki Phase 1"
                        className="w-full mt-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-500">Gate / Reception Notes</label>
                      <input
                        type="text"
                        value={pickupNotes}
                        onChange={(e) => setPickupNotes(e.target.value)}
                        placeholder="Floor, apartment, or pickup instructions"
                        className="w-full mt-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="border-t border-dashed border-stone-200"></div>

                  {/* Destination / Drop-off */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <label className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Delivery Destination (Recipient)
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-500">Recipient Full Name</label>
                        <input
                          type="text"
                          required
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full mt-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-500">Recipient Phone</label>
                        <input
                          type="tel"
                          required
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="w-full mt-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-500">Street Address & Landmark</label>
                      <input
                        type="text"
                        required
                        value={dropoffAddress}
                        onChange={(e) => setDropoffAddress(e.target.value)}
                        placeholder="e.g. 42 Isaac John Street, GRA, Ikeja"
                        className="w-full mt-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-500">Drop-off Instructions</label>
                      <input
                        type="text"
                        value={dropoffNotes}
                        onChange={(e) => setDropoffNotes(e.target.value)}
                        placeholder="Call recipient on arrival / Leave at gatehouse"
                        className="w-full mt-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PARCEL SPECIFICATION */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 border-b border-stone-100 pb-3">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>2. Parcel Details & Weight Tier</span>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800">Select Item Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = parcelCategory === cat.label;
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => setParcelCategory(cat.label)}
                          className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all text-left ${
                            isSelected
                              ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-stone-400"}`} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-zinc-800">Brief Description of Contents</label>
                  <input
                    type="text"
                    required
                    value={parcelDesc}
                    onChange={(e) => setParcelDesc(e.target.value)}
                    placeholder="e.g. Contract paperwork, shoebox, electronics"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Weight Tiers */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800">Weight & Size Tier</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "light", label: "Small (<1kg)", sub: "Envelopes / Docs", price: "Free" },
                      { id: "medium", label: "Medium (1-5kg)", sub: "Shoebox / Tech", price: "+₦800" },
                      { id: "heavy", label: "Heavy (5-15kg)", sub: "Medium Cartons", price: "+₦1,800" },
                      { id: "bulky", label: "Bulky (15+kg)", sub: "Large Appliances", price: "+₦4,500" },
                    ].map((w) => {
                      const isSelected = weightTier === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setWeightTier(w.id as any)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? "bg-blue-50 border-blue-600 shadow-sm"
                              : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          <div className={`text-xs font-bold ${isSelected ? "text-blue-700" : "text-zinc-900"}`}>
                            {w.label}
                          </div>
                          <div className="text-[10px] text-stone-500 mt-0.5">{w.sub}</div>
                          <div className="text-[11px] font-bold text-emerald-600 mt-1">{w.price}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 3: VEHICLE & SPEED */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 border-b border-stone-100 pb-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>3. Vehicle Type & Delivery Speed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vehicle Choice */}
                  <div
                    onClick={() => setVehicleType("bike")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      vehicleType === "bike"
                        ? "bg-blue-50/70 border-blue-600 shadow-sm"
                        : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Express Motorbike</span>
                      {vehicleType === "bike" && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Fastest intra-city lane-splitting. Ideal for items up to 10kg.
                    </p>
                    <div className="text-xs font-bold text-zinc-800 mt-2">Standard Fare Included</div>
                  </div>

                  <div
                    onClick={() => setVehicleType("van")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      vehicleType === "van"
                        ? "bg-blue-50/70 border-blue-600 shadow-sm"
                        : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Dedicated Cargo Van</span>
                      {vehicleType === "van" && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Weatherproof enclosed cargo van for large boxes & fragile supplies.
                    </p>
                    <div className="text-xs font-bold text-emerald-600 mt-2">+₦2,500 Van Surcharge</div>
                  </div>
                </div>

                {/* Speed Choice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div
                    onClick={() => setSpeed("instant")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      speed === "instant"
                        ? "bg-blue-50/70 border-blue-600 shadow-sm"
                        : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Instant Rush Priority</span>
                      {speed === "instant" && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Rider dispatched immediately. Direct transit to dropoff.
                    </p>
                    <div className="text-xs font-bold text-blue-600 mt-2">+₦500 Rush Priority</div>
                  </div>

                  <div
                    onClick={() => setSpeed("standard")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      speed === "standard"
                        ? "bg-blue-50/70 border-blue-600 shadow-sm"
                        : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Standard Same-Day</span>
                      {speed === "standard" && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Guaranteed doorstep delivery before 6:00 PM today.
                    </p>
                    <div className="text-xs font-bold text-emerald-600 mt-2">Standard Timing</div>
                  </div>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isMatching}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm & Request Courier Dispatch · {formatNaira(totalFare)}</span>
              </button>
            </form>
          </div>

          {/* Right Sticky Column: Fare Ledger & Real-Time Matching */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            {/* RIDER MATCHING MODAL / RADAR (WHEN BOOKED) */}
            {isMatching && (
              <div className="p-6 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-2xl space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                    <span>Proximity Dispatch Radar</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Zone: Lekki Hub</span>
                </div>

                {!matchedRider ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                      <Truck className="w-8 h-8 text-blue-400 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-white">Contacting Nearby Couriers</h4>
                      <p className="text-xs text-zinc-400">
                        Scanning 8 active verified riders near 14B Admiralty Way...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-emerald-400">Rider Accepted Dispatch Job!</div>
                        <div className="text-[11px] text-zinc-300">
                          {matchedRider.name} is on their way to pick up the parcel.
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-800/80 p-4 rounded-2xl border border-zinc-700/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{matchedRider.name}</span>
                        <span className="text-xs font-bold text-amber-400">{matchedRider.rating}</span>
                      </div>
                      <div className="text-xs text-zinc-300 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{matchedRider.vehicle}</span>
                      </div>
                      <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{matchedRider.eta}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleProceedToTracking}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30"
                    >
                      <span>Track Live Courier On Map</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Fare Summary Card */}
            <div className="bg-[#0F1117] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-dropa text-base font-bold">Fare Breakdown</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  Instant Quote
                </span>
              </div>

              <div className="space-y-3 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span>Base Pickup & Handling</span>
                  <span className="font-semibold text-white">{formatNaira(baseFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Distance (18.2 km)</span>
                  <span className="font-semibold text-white">{formatNaira(distanceFare)}</span>
                </div>
                {weightSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Weight Tier Surcharge ({weightTier.toUpperCase()})</span>
                    <span className="font-semibold text-white">{formatNaira(weightSurcharge)}</span>
                  </div>
                )}
                {vehicleSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Cargo Van Surcharge</span>
                    <span className="font-semibold text-white">{formatNaira(vehicleSurcharge)}</span>
                  </div>
                )}
                {speedSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Instant Rush Priority</span>
                    <span className="font-semibold text-white">{formatNaira(speedSurcharge)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Transit Insurance & Digital Waybill</span>
                  <span className="font-semibold text-white">{formatNaira(insuranceFee)}</span>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                  <div>
                    <div className="text-sm font-bold text-white">Total Guaranteed Fare</div>
                    <div className="text-[10px] text-zinc-400">All tolls, fuel & rider commission included</div>
                  </div>
                  <div className="text-2xl font-black text-[#38BDF8]">{formatNaira(totalFare)}</div>
                </div>
              </div>

              {/* Payment Selector */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300">Payment Option</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "wallet", label: "Ofia Wallet", sub: "₦244,000" },
                    { id: "card", label: "Paystack", sub: "Card / Transfer" },
                    { id: "cod", label: "Recipient", sub: "Cash / POS" },
                  ].map((p) => {
                    const isSelected = paymentMethod === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-500 shadow-md"
                            : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-[11px] font-bold">{p.label}</div>
                        <div className="text-[9px] opacity-75">{p.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Trust & Guarantees */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ofia Secure Dispatch Protection</span>
              </div>
              <ul className="text-xs text-stone-600 space-y-2 list-disc list-inside">
                <li>Strict OTP verification before cargo handover to recipient</li>
                <li>Live GPS turn-by-turn tracking shared with sender & receiver</li>
                <li>Goods in transit protected up to ₦500,000 value cover</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
