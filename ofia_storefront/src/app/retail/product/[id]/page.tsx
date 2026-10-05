"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { useCart } from "@/context/CartContext";
import {
  Award,
  Gift,
  PenTool,
  ShoppingBag,
  Check,
  ChevronLeft,
  Share2,
  CheckCircle2,
  BookOpen,
  Package,
} from "lucide-react";

export default function RetailProductDetailPage() {
  const params = useParams();
  const store = MOCK_STORES["retail"];
  const { addToCart, setIsCartOpen } = useCart();

  const productId = (params?.id as string) || "rtl-001";
  const product =
    MOCK_PRODUCTS.find((p) => p.id === productId && p.vertical === "retail") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "retail") ||
    MOCK_PRODUCTS[0];

  const meta = product.retailMeta;
  const [selectedImage, setSelectedImage] = useState(0);
  const [engravingText, setEngravingText] = useState("");
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const giftWrapFee = 6000;
  const totalPrice = product.price + (includeGiftWrap ? giftWrapFee : 0);

  const handleAddToCart = () => {
    let customTitle = product.title;
    if (engravingText.trim()) {
      customTitle += ` (Engraved: "${engravingText.trim()}")`;
    }
    if (includeGiftWrap) {
      customTitle += " (+ Deluxe Gift Wrap)";
    }

    addToCart({
      productId: product.id,
      title: customTitle,
      price: totalPrice,
      image: product.images[selectedImage] || product.images[0],
      quantity: 1,
      vertical: "retail",
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsCartOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#222129] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/retail/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 hover:text-purple-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Specialty Catalog</span>
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
            className="p-2 rounded-full border border-purple-200 text-purple-900 hover:bg-purple-50 transition-colors"
            title="Share Item"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/3 sm:aspect-16/11 rounded-3xl overflow-hidden bg-white border border-purple-100 flex items-center justify-center shadow-xs">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-purple-900 text-white">
                  {meta?.department}
                </span>
                {meta?.customEngravingAvailable && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Complimentary Engraving
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 flex-shrink-0 p-2 transition-all ${
                      selectedImage === idx
                        ? "border-purple-900 ring-2 ring-purple-200"
                        : "border-purple-100 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Personalization (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-1 rounded-full">
                  {meta?.authorOrBrand || product.category}
                </span>
                {meta?.ageGroup && (
                  <span className="text-xs font-semibold text-stone-500">
                    Age: {meta.ageGroup}
                  </span>
                )}
              </div>

              <h1 className="font-dropa text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 leading-snug tracking-tight">
                {product.title}
              </h1>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-2 border-t border-purple-100">
              <span className="text-3xl font-black text-purple-950 tracking-tight">
                ₦{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  ₦{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Custom Engraving Field (if eligible) */}
            {meta?.customEngravingAvailable && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <PenTool className="w-4 h-4 text-amber-700" />
                  <span>Complimentary Laser Engraving / Monogramming</span>
                </div>
                <input
                  type="text"
                  maxLength={36}
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  placeholder="Enter name, initials, or date (e.g. 'For Amina · 2026')"
                  className="w-full px-4 py-2 rounded-full border border-amber-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-stone-500">
                  Precision laser-etched on brass dedication plate or embossed spine.
                </p>
              </div>
            )}

            {/* Artisan Gift Wrapping Option */}
            {meta?.giftWrapAvailable && (
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGiftWrap}
                    onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                    className="mt-1 rounded text-purple-900 focus:ring-purple-900 w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-purple-950 block">
                      Artisan Mulberry Gift Wrap & Hand-Poured Wax Seal (+₦{giftWrapFee.toLocaleString()})
                    </span>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Includes handmade textured paper, botanical rosemary sprig, and hand-written calligraphy greeting card.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Action Button */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || addedSuccess}
                className={`w-full py-4 px-6 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-purple-900 hover:bg-purple-800 text-white"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Order</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Bag · ₦{totalPrice.toLocaleString()}</span>
                  </>
                )}
              </button>

              <Link
                href="/retail/customization"
                className="w-full py-2.5 px-4 rounded-full border border-purple-200 bg-white hover:bg-purple-50 text-purple-950 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Add to Wedding / Baby Gift Registry</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Attributes Grid */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-900" />
            <h3 className="text-lg font-bold text-slate-900">Product Specifications & Provenance</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100">
                <span className="text-stone-500 font-medium">Department:</span>
                <span className="font-bold text-slate-900">{meta?.department}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100">
                <span className="text-stone-500 font-medium">Author / Manufacturer:</span>
                <span className="font-bold text-slate-900">{meta?.authorOrBrand || "Curated Edition"}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100">
                <span className="text-stone-500 font-medium">ISBN / Catalog Identifier:</span>
                <span className="font-bold font-mono text-slate-900">{meta?.isbnOrSku || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100">
                <span className="text-stone-500 font-medium">Weight & Dimensions:</span>
                <span className="font-bold text-slate-900">{meta?.weightOrDimension || "Standard Packing"}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100">
                <span className="text-stone-500 font-medium">Laser Engraving Eligibility:</span>
                <span className="font-bold text-emerald-700">{meta?.customEngravingAvailable ? "Complimentary Available" : "Standard Edition"}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100">
                <span className="text-stone-500 font-medium">Packaging Presentation:</span>
                <span className="font-bold text-slate-900">{meta?.giftWrapAvailable ? "Artisan Wrap Compatible" : "Protective Box"}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Item Highlights:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.highlights?.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
