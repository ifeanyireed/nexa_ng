"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Search,
  Zap,
  Filter,
  X,
  ShieldCheck,
  Calculator,
  ArrowRight,
  BatteryCharging,
  Sun,
  Wrench,
} from "lucide-react";

function HardwareCatalogContent() {
  const searchParams = useSearchParams();
  const initialSystem = searchParams.get("system") || "all";

  const store = MOCK_STORES["hardware"];
  const products = MOCK_PRODUCTS.filter((p) => p.vertical === "hardware");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showContractorPricing, setShowContractorPricing] = useState(false);

  const systemTypes = [
    "all",
    "Hybrid Inverter",
    "Lithium Battery",
    "Solar Panel",
    "Industrial Tool",
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const meta = prod.hardwareMeta;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.title.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        meta?.powerRating?.toLowerCase().includes(q) ||
        meta?.systemType.toLowerCase().includes(q);

      const matchesType = selectedType === "all" || meta?.systemType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [products, searchQuery, selectedType]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E252B] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Industrial Technical Equipment Registry</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Renewable Energy, Inverters & Heavy Industrial Hardware
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light max-w-2xl leading-relaxed">
            All systems certified with manufacturer warranty coverage. Professional engineering site sizing and COREN installation available.
          </p>
        </div>

        {/* Filter & Pricing Bar */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specs (e.g. 5kVA, 10.24kWh, LiFePO4, 550W, Monocrystalline)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Contractor Pricing Toggle */}
            <div className="sm:col-span-4 flex items-center justify-end">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                <input
                  type="checkbox"
                  checked={showContractorPricing}
                  onChange={(e) => setShowContractorPricing(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>Show Contractor Wholesale Tiers</span>
              </label>
            </div>
          </div>

          {/* Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-2">
              System:
            </span>
            {systemTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedType === type
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-stone-100 text-slate-700 hover:bg-stone-200"
                }`}
              >
                {type === "all" ? "All Equipment" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Load Sizing Banner */}
        <div className="bg-[#182129] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Unsure what size inverter or battery bank you need?</p>
              <p className="text-[11px] text-stone-300">Input your appliances (ACs, pumps, freezers) and get an engineered system specification.</p>
            </div>
          </div>
          <Link
            href="/hardware/calculator"
            className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-colors"
          >
            Launch Sizing Calculator
          </Link>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const meta = prod.hardwareMeta;
            const priceToDisplay = showContractorPricing && meta?.contractorPrice
              ? meta.contractorPrice
              : prod.price;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100 flex items-center justify-center">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                        {meta?.systemType}
                      </span>
                      {meta?.powerRating && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {meta.powerRating}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <span className="text-[10px] font-bold text-stone-500">
                        {meta?.warrantyYears}-Yr Warranty
                      </span>
                    </div>

                    <Link href={`/hardware/product/${prod.id}`}>
                      <h3 className="font-extrabold text-base text-slate-900 line-clamp-1 hover:text-amber-700 transition-colors">
                        {prod.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
                      {prod.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      {meta?.voltage && <div>Volt: <span className="font-bold text-slate-900">{meta.voltage}</span></div>}
                      {meta?.capacity && <div>Cap: <span className="font-bold text-slate-900">{meta.capacity}</span></div>}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-2">
                  <div>
                    {showContractorPricing ? (
                      <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider">
                        Contractor Tier
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-stone-400 block">
                        Retail Price
                      </span>
                    )}
                    <span className="font-black text-lg text-slate-900">
                      ₦{priceToDisplay.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/hardware/product/${prod.id}`}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}

export default function HardwareCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-8">Loading Technical Hardware Catalog...</div>}>
      <HardwareCatalogContent />
    </Suspense>
  );
}
