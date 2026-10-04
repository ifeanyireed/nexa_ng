"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STORES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Truck,
  Wrench,
  PackageCheck,
  Ruler,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  Building,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function HomeLivingDeliveryOptionsPage() {
  const store = MOCK_STORES["home-living"];

  // Calculator State
  const [selectedTier, setSelectedTier] = useState<"standard" | "room" | "white-glove">("white-glove");
  const [locationZone, setLocationZone] = useState("lagos-island");
  const [floorLevel, setFloorLevel] = useState("ground");
  const [hasElevator, setHasElevator] = useState(true);

  const getTierPrice = () => {
    let base = 0;
    if (selectedTier === "standard") base = 0;
    if (selectedTier === "room") base = 15000;
    if (selectedTier === "white-glove") base = 28000;

    let zoneFee = 0;
    if (locationZone === "lagos-mainland") zoneFee = 5000;
    if (locationZone === "abuja") zoneFee = 25000;

    let stairFee = 0;
    if (floorLevel !== "ground" && !hasElevator) {
      stairFee = 6000;
    }

    return base + zoneFee + stairFee;
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1E1F22] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        <Link
          href="/home-living/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Furniture Catalog</span>
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>Dedicated White-Glove Operations</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Delivery & Installation Options
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl">
            From threshold delivery to two-man in-room assembly with debris removal. Choose the service level suited to your residence.
          </p>
        </div>

        {/* 3 Delivery Service Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div
            onClick={() => setSelectedTier("standard")}
            className={`p-6 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
              selectedTier === "standard"
                ? "bg-white border-stone-900 ring-2 ring-stone-900/10 shadow-lg"
                : "bg-white/70 border-stone-300 hover:border-stone-400"
            }`}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-800">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-dropa text-lg font-bold text-stone-900">
                Standard Curbside
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Delivery directly to your building&apos;s main entrance or gated threshold. Boxed and secured on pallets.
              </p>
              <ul className="text-xs text-stone-600 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Scheduled delivery window</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gatehouse handover</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-stone-100 mt-4">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Service Fee</span>
              <span className="font-dropa text-lg font-bold text-stone-900">Included Free</span>
            </div>
          </div>

          {/* Tier 2 */}
          <div
            onClick={() => setSelectedTier("room")}
            className={`p-6 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
              selectedTier === "room"
                ? "bg-white border-stone-900 ring-2 ring-stone-900/10 shadow-lg"
                : "bg-white/70 border-stone-300 hover:border-stone-400"
            }`}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-800">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-dropa text-lg font-bold text-stone-900">
                Room-of-Choice
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Two-person logistics crew navigates doorways, elevators, and stairs to place boxes directly in your target room.
              </p>
              <ul className="text-xs text-stone-600 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Two-man trained logistics crew</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Up to 3rd floor staircase walk-up</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-stone-100 mt-4">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Service Fee</span>
              <span className="font-dropa text-lg font-bold text-stone-900">+₦15,000</span>
            </div>
          </div>

          {/* Tier 3 */}
          <div
            onClick={() => setSelectedTier("white-glove")}
            className={`p-6 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between relative ${
              selectedTier === "white-glove"
                ? "bg-white border-amber-800 ring-2 ring-amber-800/20 shadow-xl"
                : "bg-white/70 border-stone-300 hover:border-stone-400"
            }`}
          >
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-800 text-white">
              Recommended
            </span>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-dropa text-lg font-bold text-stone-900">
                White-Glove Assembly
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Full-service experience: In-room delivery, complete structural unboxing & tool assembly, floor protectors, and packaging haul-away.
              </p>
              <ul className="text-xs text-stone-600 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Complete furniture construction</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero cardboard or foam left behind</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-stone-100 mt-4">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Service Fee</span>
              <span className="font-dropa text-lg font-bold text-amber-900">+₦28,000</span>
            </div>
          </div>
        </div>

        {/* Interactive Delivery Cost Calculator */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-300/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-200">
            <Ruler className="w-5 h-5 text-amber-700" />
            <h3 className="font-dropa text-xl font-bold text-stone-900">
              Interactive Logistics Fee Estimator
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                Delivery Location Zone
              </label>
              <select
                value={locationZone}
                onChange={(e) => setLocationZone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="lagos-island">Lagos Island (Ikoyi, Lekki, VI)</option>
                <option value="lagos-mainland">Lagos Mainland (Ikeja, Surulere, Yaba)</option>
                <option value="abuja">Abuja Federal Capital Territory</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                Target Room Floor Level
              </label>
              <select
                value={floorLevel}
                onChange={(e) => setFloorLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="ground">Ground Floor / Compound</option>
                <option value="floor-1">1st Floor Walk-up</option>
                <option value="floor-2">2nd Floor Walk-up</option>
                <option value="floor-3-plus">3rd Floor or Higher</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                Freight / Passenger Elevator
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHasElevator(true)}
                  className={`py-2 px-3 text-xs font-bold rounded-full border transition-colors ${
                    hasElevator
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-stone-50 text-stone-700 border-stone-200"
                  }`}
                >
                  Yes, Elevator
                </button>
                <button
                  type="button"
                  onClick={() => setHasElevator(false)}
                  className={`py-2 px-3 text-xs font-bold rounded-full border transition-colors ${
                    !hasElevator
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-stone-50 text-stone-700 border-stone-200"
                  }`}
                >
                  Stairs Only
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 block">
                Estimated Delivery & Assembly Total
              </span>
              <span className="text-xs text-stone-600">
                Tier: <strong className="capitalize">{selectedTier}</strong> · Zone:{" "}
                <strong className="capitalize">{locationZone.replace("-", " ")}</strong>
              </span>
            </div>

            <div className="text-right">
              <span className="font-dropa text-2xl font-bold text-amber-950">
                {getTierPrice() === 0 ? "Free Included" : `₦${getTierPrice().toLocaleString()}`}
              </span>
            </div>
          </div>
        </section>

        {/* Doorway & Staircase Clearance Guide */}
        <section className="p-6 sm:p-8 rounded-3xl bg-stone-900 text-white space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-dropa text-lg font-bold text-white">
              Doorway & Hallway Pre-Delivery Checklist
            </h3>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed font-light">
            Before your delivery appointment, please measure your front entrance doorway width, interior hallway corners, and elevator door clearance against the blueprint dimensions listed on each piece.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-300 pt-2">
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
              <span className="font-bold text-white block mb-1">1. Doorways</span>
              <span className="text-stone-400">Ensure at least 82cm clearance for sectional sofa boxes.</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
              <span className="font-bold text-white block mb-1">2. Stairwells</span>
              <span className="text-stone-400">Check banister turns and ceiling height angles.</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
              <span className="font-bold text-white block mb-1">3. Elevators</span>
              <span className="text-stone-400">Verify internal cabin depth exceeds 210cm for credenzas.</span>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
