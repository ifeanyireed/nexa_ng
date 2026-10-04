"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { useCart } from "@/context/CartContext";
import {
  ShieldCheck,
  Cpu,
  ShoppingBag,
  Check,
  ChevronLeft,
  Share2,
  Box,
  Truck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function GadgetProductDetailPage() {
  const params = useParams();
  const store = MOCK_STORES.gadgets;
  const { addToCart, setIsCartOpen } = useCart();

  const productId = (params?.id as string) || "gdt-001";
  const product =
    MOCK_PRODUCTS.find((p) => p.id === productId && p.vertical === "gadgets") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "gadgets") ||
    MOCK_PRODUCTS[0];

  const meta = product.gadgetMeta;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(
    meta?.storageOptions?.[0] || "256GB"
  );
  const [selectedColor, setSelectedColor] = useState(
    meta?.colorOptions?.[0]?.name || "Natural Titanium"
  );
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Storage pricing multiplier or tiered delta
  const getStorageDelta = (storage: string) => {
    if (storage.includes("512GB")) return 180000;
    if (storage.includes("1TB")) return 380000;
    return 0;
  };

  const finalPrice = product.price + getStorageDelta(selectedStorage);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: finalPrice,
      image: product.images[selectedImage] || product.images[0],
      quantity: 1,
      vertical: "gadgets",
      selectedColor,
      selectedVariant: selectedStorage,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsCartOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/gadgets/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Tech Catalog</span>
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: product.title,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Product URL copied to clipboard");
              }
            }}
            className="p-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Share Device"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Top Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-black border border-zinc-800 p-8 flex items-center justify-center">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
                  {meta?.brand}
                </span>
                {meta?.modelYear && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                    {meta.modelYear}
                  </span>
                )}
              </div>
              {meta?.warrantyYears && (
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{meta.warrantyYears}-Year Manufacturer Warranty</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-16/10 rounded-xl overflow-hidden bg-black p-2 border-2 transition-all ${
                      selectedImage === idx
                        ? "border-blue-600 ring-2 ring-blue-600/30"
                        : "border-zinc-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} preview ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description Card */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xs space-y-4">
              <h3 className="font-dropa text-lg font-bold text-white">
                Engineering & Architecture Overview
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                {product.description}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Key Technical Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                  {product.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Buy Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-5">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {meta?.brand} · {product.category}
                </span>
                <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-white mt-1">
                  {product.title}
                </h1>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                    Verified Direct Retail
                  </span>
                  <span className="font-dropa text-2xl sm:text-3xl font-bold text-white">
                    {store.currency}{finalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Sealed Box In Stock
                  </span>
                </div>
              </div>

              {/* Storage Variant Selector */}
              {meta?.storageOptions && meta.storageOptions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">Storage Capacity:</span>
                    <span className="text-blue-400 font-semibold">{selectedStorage}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {meta.storageOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedStorage(opt)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                          selectedStorage === opt
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Finish Selector */}
              {meta?.colorOptions && meta.colorOptions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">Finish:</span>
                    <span className="text-zinc-300">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {meta.colorOptions.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-9 h-9 rounded-full border-2 transition-transform ${
                          selectedColor === c.name
                            ? "border-blue-500 scale-110 ring-2 ring-blue-500/30"
                            : "border-zinc-700 opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedSuccess}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Bag · {store.currency}{finalPrice.toLocaleString()}</span>
                  </>
                )}
              </button>

              {/* In-The-Box Inventory */}
              {meta?.inTheBox && (
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Box className="w-4 h-4 text-blue-400" />
                    <span>In The Sealed Box</span>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-1">
                    {meta.inTheBox.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Official Warranty Details Card */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-dropa text-base font-bold text-white">
                  Official Manufacturer Warranty Policy
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {meta?.warrantyDetails ||
                  "Includes 2-year hardware coverage against manufacturing defects with direct replacement at authorized service centers in Lagos and Abuja."}
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs text-zinc-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>30-Day Instant Defect Exchange Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Specifications Matrix Table */}
        {meta?.specs && (
          <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
              <Cpu className="w-5 h-5 text-blue-500" />
              <h3 className="font-dropa text-xl font-bold text-white">
                Comprehensive Technical Specifications
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(meta.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 border-b border-zinc-800/60 text-xs"
                >
                  <span className="font-medium text-zinc-400">{key}</span>
                  <span className="font-bold text-white text-right">{value}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
