"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { Filter, ArrowUpDown, ArrowRight, Check } from "lucide-react";

export default function FashionCatalogPage() {
  const store = MOCK_STORES.fashion;
  const allProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "fashion");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const categories = ["All", "Resort & Traditional", "Outerwear", "Tops & Tunics", "Accessories"];
  const sizes = ["All", "XS", "S", "M", "L", "XL"];

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSize =
          selectedSize === "All" || (p.fashionMeta && p.fashionMeta.sizes.includes(selectedSize));
        return matchesCat && matchesSize;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [allProducts, selectedCategory, selectedSize, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Catalog Banner */}
        <div className="space-y-2 border-b border-stone-200 pb-6">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            Aura & Loom Ateliers · Autumn / Resort Collection
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Apparel & Garment Catalog
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm font-light max-w-2xl">
            Filter through our curated hand-embroidered tunics, bespoke two-pieces, and structured seasonal outerwear.
          </p>
        </div>

        {/* Filters & Sorting Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === c
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Size Filter & Sort Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500">Size:</span>
              <div className="flex items-center gap-1">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      selectedSize === s
                        ? "bg-amber-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 border border-stone-200 text-stone-700 outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {product.isNewDrop && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm uppercase tracking-wider">
                      New
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-base text-zinc-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-light leading-relaxed">
                    {product.subtitle || product.description}
                  </p>
                </div>

                {product.fashionMeta && (
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1">
                      {product.fashionMeta.colors.map((c) => (
                        <span
                          key={c.name}
                          className="w-3.5 h-3.5 rounded-full border border-stone-300"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <div className="text-[11px] font-mono text-stone-500 font-semibold">
                      Sizes: {product.fashionMeta.sizes.join(", ")}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-zinc-900">
                    ₦{product.price.toLocaleString()}
                  </span>

                  <Link
                    href={`/fashion/product/${product.id}`}
                    className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>View & Select Size</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
