"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Laptop,
  Smartphone,
  Search,
  ShieldCheck,
  Cpu,
  X,
  SlidersHorizontal,
} from "lucide-react";

export default function GadgetsCatalogPage() {
  const store = MOCK_STORES.gadgets;
  const allGadgets = MOCK_PRODUCTS.filter((p) => p.vertical === "gadgets");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const brands = useMemo(() => {
    const list = new Set<string>();
    allGadgets.forEach((g) => {
      if (g.gadgetMeta?.brand) list.add(g.gadgetMeta.brand);
    });
    return ["All", ...Array.from(list)];
  }, [allGadgets]);

  const categories = useMemo(() => {
    const list = new Set<string>();
    allGadgets.forEach((g) => list.add(g.category));
    return ["All", ...Array.from(list)];
  }, [allGadgets]);

  const filteredGadgets = useMemo(() => {
    return allGadgets
      .filter((gadget) => {
        const meta = gadget.gadgetMeta;
        if (!meta) return true;

        if (
          searchQuery &&
          !gadget.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !meta.brand.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        if (selectedBrand !== "All" && meta.brand !== selectedBrand) {
          return false;
        }

        if (selectedCategory !== "All" && gadget.category !== selectedCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return 0;
      });
  }, [allGadgets, searchQuery, selectedBrand, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
            <Link href="/gadgets" className="hover:text-blue-600 transition-colors">
              Gadgets
            </Link>
            <span>/</span>
            <span className="text-slate-900">Tech Catalog</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Flagship Tech Hardware
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Official distributor stock with direct manufacturer warranties, verified IMEI/Serials, and express dispatch.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chips, devices, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Brand */}
            <div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                aria-label="Filter by brand"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    Brand: {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort tech products"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {(selectedBrand !== "All" || selectedCategory !== "All" || searchQuery) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs sm:text-sm">
              <span className="text-slate-500">Filters applied</span>
              <button
                onClick={() => {
                  setSelectedBrand("All");
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {filteredGadgets.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 space-y-4 shadow-xs">
            <Cpu className="w-14 h-14 text-slate-400 mx-auto" />
            <h3 className="font-dropa text-xl font-bold text-slate-900">
              No devices found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              We couldn&apos;t find devices matching your search. Try resetting your brand or category filters.
            </p>
            <button
              onClick={() => {
                setSelectedBrand("All");
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGadgets.map((gadget) => {
              const meta = gadget.gadgetMeta;
              return (
                <div
                  key={gadget.id}
                  className="group rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-50 p-6 flex items-center justify-center border-b border-slate-100">
                      <img
                        src={gadget.images[0]}
                        alt={gadget.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 shadow-2xs">
                          {meta?.brand}
                        </span>
                        {meta?.modelYear && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                            {meta.modelYear}
                          </span>
                        )}
                      </div>
                      {meta?.warrantyYears && (
                        <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 backdrop-blur-xs flex items-center gap-1.5 shadow-2xs">
                          <ShieldCheck className="w-4 h-4" />
                          <span>{meta.warrantyYears}-Year Warranty</span>
                        </div>
                      )}
                    </div>

                    {/* Specs */}
                    <div className="p-6 space-y-4">
                      <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          {gadget.category}
                        </span>
                        <h3 className="font-dropa text-xl sm:text-2xl font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {gadget.title}
                        </h3>
                      </div>

                      {meta?.specs && (
                        <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 text-xs sm:text-sm text-slate-700">
                          {Object.entries(meta.specs).slice(0, 4).map(([key, val]) => (
                            <div key={key} className="truncate">
                              <span className="text-slate-400 mr-1.5">{key}:</span>
                              <span className="font-semibold text-slate-800">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Official Retail
                      </span>
                      <span className="font-dropa text-xl sm:text-2xl font-bold text-slate-900">
                        {store.currency}{gadget.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/gadgets/product/${gadget.id}`}
                      className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-xs"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Specs & Warranty</span>
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
