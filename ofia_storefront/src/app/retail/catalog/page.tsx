"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Search,
  Filter,
  X,
  Gift,
  ArrowRight,
  BookOpen,
  Award,
  PenTool,
} from "lucide-react";

function RetailCatalogContent() {
  const searchParams = useSearchParams();
  const initialDept = searchParams.get("dept") || "all";

  const store = MOCK_STORES["retail"];
  const products = MOCK_PRODUCTS.filter((p) => p.vertical === "retail");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [onlyGiftWrap, setOnlyGiftWrap] = useState(false);

  const departments = [
    "all",
    "Books & Stationery",
    "Sports & Fitness",
    "Baby & Toys",
    "Specialty Gifts",
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const meta = prod.retailMeta;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.title.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        meta?.authorOrBrand?.toLowerCase().includes(q) ||
        meta?.isbnOrSku?.toLowerCase().includes(q);

      const matchesDept = selectedDept === "all" || meta?.department === selectedDept;
      const matchesWrap = !onlyGiftWrap || meta?.giftWrapAvailable;

      return matchesSearch && matchesDept && matchesWrap;
    });
  }, [products, searchQuery, selectedDept, onlyGiftWrap]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#222129] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>Curated Specialty Catalog</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Specialty Books, Home Gym, Montessori Toys & Keepsakes
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light max-w-2xl leading-relaxed">
            Multi-department goods with verified craftsmanship. Custom laser engraving, monogramming, and artisan gift presentation available on qualifying items.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, brand, or ISBN..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-purple-100 bg-purple-50/20 text-xs sm:text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-900"
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

            {/* Gift Wrap Filter */}
            <div className="sm:col-span-4 flex items-center justify-end">
              <label className="flex items-center gap-2.5 text-xs font-bold text-purple-950 cursor-pointer bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                <input
                  type="checkbox"
                  checked={onlyGiftWrap}
                  onChange={(e) => setOnlyGiftWrap(e.target.checked)}
                  className="rounded text-purple-900 focus:ring-purple-900 w-4 h-4"
                />
                <span>Gift Wrap Eligible Only</span>
              </label>
            </div>
          </div>

          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-purple-50">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-2">
              Department:
            </span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? "bg-purple-900 text-white shadow-xs"
                    : "bg-purple-50 text-purple-950 hover:bg-purple-100"
                }`}
              >
                {dept === "all" ? "All Departments" : dept}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const meta = prod.retailMeta;
            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-purple-100 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden bg-purple-50/20 flex items-center justify-center">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-900 text-white">
                        {meta?.department}
                      </span>
                      {meta?.customEngravingAvailable && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Engraving Available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                      {meta?.authorOrBrand || prod.category}
                    </span>

                    <Link href={`/retail/product/${prod.id}`}>
                      <h3 className="font-extrabold text-base text-slate-900 line-clamp-1 hover:text-purple-700 transition-colors">
                        {prod.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
                      {prod.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {meta?.isbnOrSku && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-stone-500 bg-stone-100">
                          {meta.isbnOrSku}
                        </span>
                      )}
                      {meta?.weightOrDimension && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-stone-500 bg-stone-100">
                          {meta.weightOrDimension}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-purple-50 mt-2 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-medium text-stone-400 block">
                      Price
                    </span>
                    <span className="font-black text-lg text-purple-950">
                      ₦{prod.price.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/retail/product/${prod.id}`}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-purple-900 hover:bg-purple-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View Details</span>
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

export default function RetailCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">Loading Specialty Catalog...</div>}>
      <RetailCatalogContent />
    </Suspense>
  );
}
