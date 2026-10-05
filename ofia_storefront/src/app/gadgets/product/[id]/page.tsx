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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/gadgets/catalog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
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
            className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Share Device"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Top Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/90 flex items-center justify-center">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {meta?.brand}
                </span>
                {meta?.modelYear && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                    {meta.modelYear}
                  </span>
                )}
              </div>
              {meta?.warrantyYears && (
                <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 backdrop-blur-xs shadow-2xs">
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
                    className={`relative aspect-16/10 rounded-xl overflow-hidden bg-slate-50 p-2 border-2 transition-all cursor-pointer ${
                      selectedImage === idx
                        ? "border-blue-600 ring-2 ring-blue-600/30"
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="font-dropa text-xl sm:text-2xl font-bold text-slate-900">
                Engineering & Architecture Overview
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
                {product.description}
              </p>

              <div className="pt-2">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Technical Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700">
                  {product.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Buy Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6">
              <div>
                <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wider">
                  {meta?.brand} · {product.category}
                </span>
                <h1 className="font-dropa text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
                  {product.title}
                </h1>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                    Verified Direct Retail
                  </span>
                  <span className="font-dropa text-2xl sm:text-4xl font-bold text-slate-900">
                    {store.currency}{finalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    Sealed Box In Stock
                  </span>
                </div>
              </div>

              {/* Storage Variant Selector */}
              {meta?.storageOptions && meta.storageOptions.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">Storage Capacity:</span>
                    <span className="text-blue-600 font-semibold">{selectedStorage}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {meta.storageOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedStorage(opt)}
                        className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                          selectedStorage === opt
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
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
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">Finish:</span>
                    <span className="text-slate-600">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {meta.colorOptions.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-10 h-10 rounded-full border-2 transition-transform cursor-pointer ${
                          selectedColor === c.name
                            ? "border-blue-600 scale-110 ring-2 ring-blue-600/30"
                            : "border-slate-300 opacity-80 hover:opacity-100"
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
                className={`w-full py-4.5 px-6 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25"
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
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
                    <Box className="w-4 h-4 text-blue-600" />
                    <span>In The Sealed Box</span>
                  </div>
                  <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5">
                    {meta.inTheBox.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Official Warranty Details Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="font-dropa text-base sm:text-lg font-bold text-slate-900">
                  Official Manufacturer Warranty Policy
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {meta?.warrantyDetails ||
                  "Includes 2-year hardware coverage against manufacturing defects with direct replacement at authorized service centers in Lagos and Abuja."}
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>30-Day Instant Defect Exchange Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Specifications Matrix Table */}
        {meta?.specs && (
          <section className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <Cpu className="w-6 h-6 text-blue-600" />
              <h3 className="font-dropa text-2xl sm:text-3xl font-bold text-slate-900">
                Comprehensive Technical Specifications
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
              {Object.entries(meta.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 border-b border-slate-100 text-xs sm:text-sm"
                >
                  <span className="font-medium text-slate-500">{key}</span>
                  <span className="font-bold text-slate-900 text-right">{value}</span>
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
