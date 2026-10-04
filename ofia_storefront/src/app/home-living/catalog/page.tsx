"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Armchair,
  Search,
  Ruler,
  Wrench,
  X,
  SlidersHorizontal,
} from "lucide-react";

export default function HomeLivingCatalogPage() {
  const store = MOCK_STORES["home-living"];
  const allHomeProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "home-living");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const rooms = ["All", "Living Room", "Bedroom", "Dining", "Office", "Outdoor"];
  const materials = ["All", "Bouclé", "Solid Ashwood", "Linen", "Travertine", "Leather"];

  const filteredProducts = useMemo(() => {
    return allHomeProducts
      .filter((prod) => {
        const meta = prod.homeLivingMeta;
        if (!meta) return true;

        if (
          searchQuery &&
          !prod.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !prod.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        if (selectedRoom !== "All" && meta.room !== selectedRoom) {
          return false;
        }

        if (selectedMaterial !== "All") {
          const hasMaterial = meta.materials.some((m) =>
            m.toLowerCase().includes(selectedMaterial.toLowerCase())
          );
          if (!hasMaterial) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return 0;
      });
  }, [allHomeProducts, searchQuery, selectedRoom, selectedMaterial, sortBy]);

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1E1F22] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Link href="/home-living" className="hover:text-amber-800 transition-colors">
              Home & Living
            </Link>
            <span>/</span>
            <span className="text-stone-900">Visual Catalog</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Furniture & Living Architecture
          </h1>
          <p className="text-sm text-stone-600">
            Tactile materials, exact architectural dimensions, and custom upholstery crafted for longevity.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sofas, credenzas, materials, or finishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700"
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

            {/* Room Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {rooms.map((room) => (
                <button
                  key={room}
                  onClick={() => setSelectedRoom(room)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    selectedRoom === room
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          {/* Material Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
            <span className="text-stone-400 font-medium">Material:</span>
            {materials.map((mat) => (
              <button
                key={mat}
                onClick={() => setSelectedMaterial(mat)}
                className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                  selectedMaterial === mat
                    ? "bg-amber-800 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {mat}
              </button>
            ))}

            {(selectedRoom !== "All" || selectedMaterial !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedRoom("All");
                  setSelectedMaterial("All");
                  setSearchQuery("");
                }}
                className="ml-auto text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const meta = prod.homeLivingMeta;
            return (
              <div
                key={prod.id}
                className="group rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Visual Image */}
                  <div className="relative aspect-16/11 overflow-hidden bg-stone-100">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-900/90 text-white backdrop-blur-xs">
                        {meta?.room || "Living Room"}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h3 className="font-dropa text-lg font-bold text-stone-900 mt-0.5 line-clamp-1 group-hover:text-amber-800 transition-colors">
                        {prod.title}
                      </h3>
                    </div>

                    {/* Dimensions Schema */}
                    {meta?.dimensions && (
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-[11px] text-stone-600 flex items-center justify-between">
                        <span className="font-semibold text-stone-500">Dimensions:</span>
                        <span className="font-mono font-medium text-stone-800">
                          W {meta.dimensions.width} × D {meta.dimensions.depth} × H {meta.dimensions.height}
                        </span>
                      </div>
                    )}

                    {/* Finishes */}
                    {meta?.finishes && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-stone-400 font-semibold">Finishes:</span>
                        <div className="flex items-center gap-1.5">
                          {meta.finishes.map((f) => (
                            <div
                              key={f.name}
                              className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                              style={{ backgroundColor: f.colorCode }}
                              title={f.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price and Action */}
                <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block">
                      Direct Price
                    </span>
                    <span className="font-dropa text-lg font-bold text-stone-900">
                      {store.currency}{prod.price.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/home-living/product/${prod.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Ruler className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dimensions & Specs</span>
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
