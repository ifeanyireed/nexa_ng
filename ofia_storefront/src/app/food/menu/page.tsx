"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  UtensilsCrossed,
  Search,
  Clock,
  Flame,
  ChefHat,
  ShoppingBag,
  X,
  Filter,
} from "lucide-react";

export default function FoodMenuPage() {
  const store = MOCK_STORES.food;
  const allFood = MOCK_PRODUCTS.filter((p) => p.vertical === "food");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDietary, setSelectedDietary] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    allFood.forEach((f) => set.add(f.category));
    return ["All", ...Array.from(set)];
  }, [allFood]);

  const dietaryOptions = ["All", "Chef Special", "Spicy", "Halal", "Gluten-Free", "Vegan"];

  const filteredItems = useMemo(() => {
    return allFood.filter((item) => {
      const meta = item.foodMeta;
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      if (
        selectedDietary !== "All" &&
        (!meta?.dietary || !(meta.dietary as string[]).includes(selectedDietary))
      ) {
        return false;
      }
      if (
        searchQuery &&
        !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [allFood, selectedCategory, selectedDietary, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#1E1B18] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Link href="/food" className="hover:text-amber-600 transition-colors">
              Food
            </Link>
            <span>/</span>
            <span className="text-zinc-900">Bistro Menu & Orders</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Curated Bistro Menu
          </h1>
          <p className="text-sm text-stone-500">
            Freshly prepared to order. Customize your portion sizes, side pairings, and spice heat levels.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dishes, ingredients, or spices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-zinc-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
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

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Filter Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
            <span className="text-stone-400 font-medium">Dietary & Heat:</span>
            {dietaryOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedDietary(opt)}
                className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                  selectedDietary === opt
                    ? "bg-zinc-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {opt}
              </button>
            ))}

            {(selectedCategory !== "All" || selectedDietary !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedDietary("All");
                  setSearchQuery("");
                }}
                className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-stone-200/80 space-y-4">
            <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-dropa text-lg font-bold text-zinc-800">
              No dishes found
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              We couldn&apos;t find any dishes matching your selections. Try resetting your dietary or search filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedDietary("All");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-full bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 transition-colors"
            >
              Show Entire Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((dish) => {
              const meta = dish.foodMeta;
              return (
                <div
                  key={dish.id}
                  className="group rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                      <img
                        src={dish.images[0]}
                        alt={dish.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {meta?.prepTime && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-950/80 text-white flex items-center gap-1 backdrop-blur-xs">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Prep: {meta.prepTime}</span>
                        </div>
                      )}
                      {meta?.dietary && meta.dietary.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                          {meta.dietary.map((d) => (
                            <span
                              key={d}
                              className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/95 text-zinc-800 shadow-xs"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          {dish.category}
                        </span>
                        <h3 className="font-dropa text-lg font-bold text-zinc-900 mt-0.5 line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {dish.title}
                        </h3>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-light">
                        {dish.description}
                      </p>

                      {meta?.portionSizes && (
                        <div className="text-[11px] text-stone-600 pt-2 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-stone-400">Portions:</span>
                          <span className="font-medium text-stone-700">
                            {meta.portionSizes.map((p) => p.name).join(" · ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block">
                        Base Price
                      </span>
                      <span className="font-dropa text-lg font-bold text-zinc-900">
                        {store.currency}{dish.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/food/item/${dish.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Customize & Add</span>
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
