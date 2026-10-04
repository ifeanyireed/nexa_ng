"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { useCart } from "@/context/CartContext";
import {
  Sparkles,
  Search,
  Filter,
  ShoppingBag,
  Check,
  X,
  Heart,
} from "lucide-react";

export default function BeautyProductsPage() {
  const store = MOCK_STORES.beauty;
  const allProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "beauty");
  const { addToCart, setIsCartOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoutine, setSelectedRoutine] = useState("All");
  const [selectedSkinType, setSelectedSkinType] = useState("All");
  const [addedId, setAddedId] = useState<string | null>(null);

  const routineSteps = ["All", "Cleanse", "Tone", "Treat", "Moisturize", "Protect"];
  const skinTypes = ["All", "All Skin Types", "Dry", "Oily", "Combination", "Sensitive"];

  const filteredProducts = useMemo(() => {
    return allProducts.filter((prod) => {
      const meta = prod.beautyMeta;
      if (!meta) return true;

      if (
        searchQuery &&
        !prod.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prod.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (selectedRoutine !== "All" && meta.routineStep !== selectedRoutine) {
        return false;
      }

      if (selectedSkinType !== "All") {
        if (!meta.skinType.includes(selectedSkinType) && !meta.skinType.includes("All Skin Types")) {
          return false;
        }
      }

      return true;
    });
  }, [allProducts, searchQuery, selectedRoutine, selectedSkinType]);

  const handleQuickAdd = (product: typeof allProducts[0]) => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      vertical: "beauty",
    });

    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
      setIsCartOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FCF9F6] text-[#201D1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
            <Link href="/beauty" className="hover:text-rose-700 transition-colors">
              Beauty
            </Link>
            <span>/</span>
            <span className="text-zinc-900">Skincare Products</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Clinical Botanical Formulations
          </h1>
          <p className="text-sm text-zinc-500">
            Barrier-supportive organic actives tailored to your specific skin routine and dermatological concerns.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search actives, ingredients, serums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50/30 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Routine Step Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {routineSteps.map((step) => (
                <button
                  key={step}
                  onClick={() => setSelectedRoutine(step)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    selectedRoutine === step
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-rose-50 text-rose-900 hover:bg-rose-100"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Type Filter */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-100 text-xs">
            <span className="text-zinc-400 font-medium">Skin Type:</span>
            {skinTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSkinType(type)}
                className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                  selectedSkinType === type
                    ? "bg-zinc-900 text-white"
                    : "bg-stone-100 text-zinc-600 hover:bg-stone-200"
                }`}
              >
                {type}
              </button>
            ))}

            {(selectedRoutine !== "All" || selectedSkinType !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedRoutine("All");
                  setSelectedSkinType("All");
                  setSearchQuery("");
                }}
                className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const meta = prod.beautyMeta;
            const isAdded = addedId === prod.id;
            return (
              <div
                key={prod.id}
                className="group rounded-3xl bg-white border border-rose-100/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-rose-50/40 p-6 flex items-center justify-center">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-200">
                        {meta?.routineStep || "Treat"}
                      </span>
                      {meta?.volume && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-zinc-700 border border-zinc-200 shadow-2xs">
                          {meta.volume}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h3 className="font-dropa text-lg font-bold text-zinc-900 mt-0.5 line-clamp-1 group-hover:text-rose-600 transition-colors">
                        {prod.title}
                      </h3>
                    </div>

                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-light">
                      {prod.description}
                    </p>

                    {meta?.ingredientsHighlights && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {meta.ingredientsHighlights.slice(0, 3).map((ing) => (
                          <span
                            key={ing}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 text-rose-800"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price and Add to Bag */}
                <div className="p-5 pt-0 border-t border-rose-100 mt-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                      Retail Price
                    </span>
                    <span className="font-dropa text-lg font-bold text-zinc-900">
                      {store.currency}{prod.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickAdd(prod)}
                    disabled={isAdded}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-rose-600 hover:bg-rose-500 text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
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
