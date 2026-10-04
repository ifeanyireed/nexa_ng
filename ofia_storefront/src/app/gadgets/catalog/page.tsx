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
    <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Link href="/gadgets" className="hover:text-blue-400 transition-colors">
              Gadgets
            </Link>
            <span>/</span>
            <span className="text-white">Tech Catalog</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Flagship Tech Hardware
          </h1>
          <p className="text-sm text-zinc-400">
            Official distributor stock with direct manufacturer warranties, verified IMEI/Serials, and express dispatch.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chips, devices, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
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
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {(selectedBrand !== "All" || selectedCategory !== "All" || searchQuery) && (
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
              <span className="text-zinc-400">Filters applied</span>
              <button
                onClick={() => {
                  setSelectedBrand("All");
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {filteredGadgets.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <Cpu className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="font-dropa text-lg font-bold text-white">
              No devices found
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              We couldn&apos;t find devices matching your search. Try resetting your brand or category filters.
            </p>
            <button
              onClick={() => {
                setSelectedBrand("All");
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors"
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
                  className="group rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xs hover:shadow-2xl hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-16/10 overflow-hidden bg-black p-6 flex items-center justify-center">
                      <img
                        src={gadget.images[0]}
                        alt={gadget.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
                          {meta?.brand}
                        </span>
                        {meta?.modelYear && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            {meta.modelYear}
                          </span>
                        )}
                      </div>
                      {meta?.warrantyYears && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{meta.warrantyYears}-Year Warranty</span>
                        </div>
                      )}
                    </div>

                    {/* Specs */}
                    <div className="p-5 space-y-4">
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {gadget.category}
                        </span>
                        <h3 className="font-dropa text-lg font-bold text-white mt-0.5 line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {gadget.title}
                        </h3>
                      </div>

                      {meta?.specs && (
                        <div className="grid grid-cols-2 gap-2 py-2 border-y border-zinc-800 text-[11px] text-zinc-300">
                          {Object.entries(meta.specs).slice(0, 4).map(([key, val]) => (
                            <div key={key} className="truncate">
                              <span className="text-zinc-500 mr-1">{key}:</span>
                              <span className="font-medium text-zinc-200">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 border-t border-zinc-800 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block">
                        Official Retail
                      </span>
                      <span className="font-dropa text-lg font-bold text-white">
                        {store.currency}{gadget.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/gadgets/product/${gadget.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Cpu className="w-3.5 h-3.5" />
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
