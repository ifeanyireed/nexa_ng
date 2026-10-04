"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  ChevronLeft,
  Share2,
  Droplets,
  Heart,
  Leaf,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function BeautyProductDetailPage() {
  const params = useParams();
  const store = MOCK_STORES["beauty"];
  const { addToCart, setIsCartOpen } = useCart();

  const productId = (params?.id as string) || "bty-001";
  const product =
    MOCK_PRODUCTS.find((p) => p.id === productId && p.vertical === "beauty") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "beauty") ||
    MOCK_PRODUCTS[0];

  const meta = product.beautyMeta;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedShade, setSelectedShade] = useState(
    meta?.shadeOptions?.[0]?.name || "Universal Nude"
  );
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[selectedImage] || product.images[0],
      quantity: 1,
      vertical: "beauty",
      selectedColor: selectedShade,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsCartOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2D2424] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/beauty/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-rose-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Botanical Formulas</span>
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
                alert("Formula link copied to clipboard");
              }
            }}
            className="p-2 rounded-full border border-stone-200 text-stone-600 hover:bg-rose-50 transition-colors"
            title="Share Formula"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Product Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/3 sm:aspect-16/11 rounded-3xl overflow-hidden bg-rose-50/50 border border-rose-100 shadow-sm">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              {meta?.routineStep && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-rose-800 shadow-sm">
                  Step: {meta.routineStep}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === idx
                        ? "border-rose-600 ring-2 ring-rose-200 scale-95"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
                {meta?.volume && (
                  <span className="text-xs font-semibold text-stone-500">
                    {meta.volume}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 leading-snug">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="text-sm text-stone-600 leading-relaxed font-medium">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-1 border-t border-stone-200">
              <span className="text-3xl font-black text-rose-900 tracking-tight">
                ₦{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-base text-stone-400 line-through">
                  ₦{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Shade Selection (if available) */}
            {meta?.shadeOptions && meta.shadeOptions.length > 0 && (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                  <span>Selected Shade:</span>
                  <span className="text-rose-700 font-extrabold">{selectedShade}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {meta.shadeOptions.map((shade) => (
                    <button
                      key={shade.name}
                      onClick={() => setSelectedShade(shade.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                        selectedShade === shade.name
                          ? "border-rose-600 bg-rose-50 text-rose-900 shadow-sm"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-inner"
                        style={{ backgroundColor: shade.hex }}
                      />
                      <span>{shade.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Skin Type Compatibility */}
            {meta?.skinType && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Target Skin Types:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {meta.skinType.map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-stone-200 text-stone-700"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || addedSuccess}
                className={`w-full py-4 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98] ${
                  addedSuccess
                    ? "bg-emerald-600 text-white shadow-emerald-200"
                    : "bg-rose-700 hover:bg-rose-800 text-white shadow-rose-200 hover:shadow-lg"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Vanity Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Vanity Bag · ₦{product.price.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-600 bg-white p-3 rounded-2xl border border-stone-200">
                <Leaf className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Clean Botanical Formulation</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-600 bg-white p-3 rounded-2xl border border-stone-200">
                <ShieldCheck className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Dermatologist Certified Safe</span>
              </div>
            </div>

            {/* Studio Treatment Cross-Sell */}
            <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-rose-950">
                  Experience with a Clinical Treatment
                </p>
                <p className="text-[11px] text-stone-600">
                  Pair this home formula with our Hydra-Facial or Hair Therapy.
                </p>
              </div>
              <Link
                href="/beauty/services"
                className="px-4 py-2 rounded-full bg-rose-900 text-white font-bold text-xs hover:bg-rose-950 transition-colors whitespace-nowrap"
              >
                Book Spa
              </Link>
            </div>
          </div>
        </div>

        {/* Botanical Highlights & Routine Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-stone-200">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-rose-600" />
              <span>Key Botanical Actives & Benefits</span>
            </h3>
            <ul className="space-y-2.5">
              {product.highlights?.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <span>Full Ingredient Profile</span>
            </h3>
            {meta?.ingredientsHighlights ? (
              <div className="flex flex-wrap gap-2">
                {meta.ingredientsHighlights.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="text-xs text-stone-600 leading-relaxed pt-2">
              {product.description}
            </p>
          </div>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
