"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import { Product } from "@/types/storefront";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { useCart } from "@/context/CartContext";
import {
  Search,
  Filter,
  X,
  Pill,
  ShieldCheck,
  FileText,
  ArrowRight,
  AlertCircle,
  Upload,
} from "lucide-react";

function PharmacyCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const store = MOCK_STORES["pharmacy"];
  const products = MOCK_PRODUCTS.filter((p) => p.vertical === "pharmacy");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState<string>("all");
  const [rxFilter, setRxFilter] = useState<"all" | "rx" | "otc">("all");

  const dosageForms = ["all", "Tablet", "Capsule", "Drops", "Syrup", "Medical Device"];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const meta = prod.pharmacyMeta;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.title.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        meta?.activeIngredients.some((i) => i.toLowerCase().includes(q));

      const matchesForm = selectedForm === "all" || meta?.dosageForm === selectedForm;

      const matchesRx =
        rxFilter === "all" ||
        (rxFilter === "rx" && meta?.prescriptionRequired) ||
        (rxFilter === "otc" && !meta?.prescriptionRequired);

      return matchesSearch && matchesForm && matchesRx;
    });
  }, [products, searchQuery, selectedForm, rxFilter]);

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#13221C] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Header */}
        <div className="space-y-2 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>NAFDAC Regulated Dispensary Catalog</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Prescription Medications & Wellness Inventory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light max-w-2xl leading-relaxed">
            All pharmaceuticals are stored under strict temperature and humidity monitoring with certified batch-level cold-chain tracking.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-3xl border border-teal-100 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by drug name, brand, or active ingredient (e.g. Amlodipine, Paracetamol)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-teal-100 bg-teal-50/20 text-xs sm:text-sm text-teal-950 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
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

            {/* Rx Filter Toggle */}
            <div className="sm:col-span-4 flex items-center bg-teal-50/60 p-1 rounded-full border border-teal-100">
              <button
                onClick={() => setRxFilter("all")}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                  rxFilter === "all" ? "bg-teal-800 text-white shadow-xs" : "text-teal-900 hover:text-teal-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRxFilter("otc")}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                  rxFilter === "otc" ? "bg-teal-800 text-white shadow-xs" : "text-teal-900 hover:text-teal-700"
                }`}
              >
                OTC Only
              </button>
              <button
                onClick={() => setRxFilter("rx")}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                  rxFilter === "rx" ? "bg-rose-800 text-white shadow-xs" : "text-rose-900 hover:text-rose-700"
                }`}
              >
                Rx Required
              </button>
            </div>
          </div>

          {/* Dosage Form Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-teal-50">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-2">
              Form:
            </span>
            {dosageForms.map((form) => (
              <button
                key={form}
                onClick={() => setSelectedForm(form)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all capitalize whitespace-nowrap ${
                  selectedForm === form
                    ? "bg-teal-800 text-white shadow-xs"
                    : "bg-teal-50 text-teal-900 hover:bg-teal-100"
                }`}
              >
                {form === "all" ? "All Dosage Forms" : form}
              </button>
            ))}
          </div>
        </div>

        {/* Prescription Callout */}
        <div className="bg-teal-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-800 text-emerald-400 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Have a physical paper or digital prescription?</p>
              <p className="text-[11px] text-teal-200">Our pharmacists will prepare your medication order for same-day delivery.</p>
            </div>
          </div>
          <Link
            href="/pharmacy/prescription"
            className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-bold text-xs whitespace-nowrap transition-colors"
          >
            Upload Prescription
          </Link>
        </div>

        {/* Medication Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-teal-100 p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="font-bold text-sm text-teal-950">No medications found matching your criteria</p>
            <p className="text-xs text-stone-500">
              Can&apos;t find what you need? Speak directly with our pharmacist for compound or special orders.
            </p>
            <Link
              href="/pharmacy/consultation"
              className="inline-block mt-2 px-5 py-2 rounded-full bg-teal-800 text-white text-xs font-bold"
            >
              Ask Resident Pharmacist
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const meta = prod.pharmacyMeta;
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-4/3 overflow-hidden bg-teal-50/40 p-5 flex items-center justify-center">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="max-h-full max-w-full object-contain"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {meta?.prescriptionRequired ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                            Prescription (Rx)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            OTC
                          </span>
                        )}
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-white text-teal-900 border border-teal-200">
                          {meta?.dosageForm}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <Link href={`/pharmacy/product/${prod.id}`}>
                        <h3 className="font-extrabold text-base text-teal-950 line-clamp-1 hover:text-teal-700 transition-colors">
                          {prod.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
                        {prod.description}
                      </p>

                      {meta?.activeIngredients && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {meta.activeIngredients.map((ing) => (
                            <span
                              key={ing}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-100"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-teal-50 mt-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-medium text-stone-400 block">
                        Pack: {meta?.packSize}
                      </span>
                      <span className="font-black text-lg text-teal-950">
                        ₦{prod.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/pharmacy/product/${prod.id}`}
                      className="px-5 py-2.5 rounded-full text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>View Medication</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}

export default function PharmacyCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7FAF9] flex items-center justify-center p-8">Loading Pharmacy Catalog...</div>}>
      <PharmacyCatalogContent />
    </Suspense>
  );
}
