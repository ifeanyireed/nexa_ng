"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { useCart } from "@/context/CartContext";
import {
  Ruler,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  ChevronLeft,
  Share2,
  Wrench,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function HomeLivingProductDetailPage() {
  const params = useParams();
  const store = MOCK_STORES["home-living"];
  const { addToCart, setIsCartOpen } = useCart();

  const productId = (params?.id as string) || "hom-001";
  const product =
    MOCK_PRODUCTS.find((p) => p.id === productId && p.vertical === "home-living") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "home-living") ||
    MOCK_PRODUCTS[0];

  const meta = product.homeLivingMeta;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState(
    meta?.finishes?.[0]?.name || "Cream Cloud Bouclé"
  );
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[selectedImage] || product.images[0],
      quantity: 1,
      vertical: "home-living",
      selectedColor: selectedFinish,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsCartOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1E1F22] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/home-living/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Furniture Catalog</span>
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
            className="p-2 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-200/50 transition-colors"
            title="Share Furniture Piece"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Top Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-16/11 rounded-3xl overflow-hidden bg-stone-100 border border-stone-300/80 shadow-md">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-900/90 text-white backdrop-blur-xs">
                  {meta?.room || "Living Room"}
                </span>
                {meta?.assemblyRequired && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>~{meta.assemblyTimeMinutes}m Assembly</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-16/11 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-amber-700 ring-2 ring-amber-700/20"
                        : "border-stone-300 opacity-70 hover:opacity-100"
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

            {/* Description & Materials */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
              <h3 className="font-dropa text-lg font-bold text-stone-900">
                Design & Material Construction
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                {product.description}
              </p>

              {meta?.materials && (
                <div className="pt-2 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Artisan Materials Used
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {meta.materials.map((mat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Buy Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xl space-y-5">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {meta?.room} Collection
                </span>
                <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                  {product.title}
                </h1>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Direct Artisan Price
                  </span>
                  <span className="font-dropa text-2xl sm:text-3xl font-bold text-stone-900">
                    {store.currency}{product.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    Custom Built to Order
                  </span>
                </div>
              </div>

              {/* Fabric / Finish Selector */}
              {meta?.finishes && meta.finishes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-stone-900">Upholstery & Finish:</span>
                    <span className="text-amber-800 font-semibold">{selectedFinish}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {meta.finishes.map((f) => (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => setSelectedFinish(f.name)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                          selectedFinish === f.name
                            ? "border-stone-900 bg-stone-50 ring-2 ring-stone-900/10 font-bold"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-stone-400 shrink-0"
                          style={{ backgroundColor: f.colorCode }}
                        />
                        <span className="text-[11px] text-stone-800 line-clamp-1">
                          {f.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedSuccess}
                className={`w-full py-4 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-900 hover:bg-stone-800 text-white shadow-lg"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <span>Add to Bag · {store.currency}{product.price.toLocaleString()}</span>
                  </>
                )}
              </button>

              {/* White-Glove Dispatch Teaser */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3 text-xs">
                <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-stone-900 block">White-Glove Dispatch</span>
                  <p className="text-stone-500 leading-relaxed text-[11px]">
                    Includes room-of-choice placement, unboxing, structural assembly, and eco-packaging removal.
                  </p>
                  <Link
                    href="/home-living/delivery-options"
                    className="text-[11px] font-bold text-amber-800 hover:underline block pt-1"
                  >
                    View Delivery Options & Tiers →
                  </Link>
                </div>
              </div>
            </div>

            {/* Exact Architectural Dimensions Blueprint */}
            {meta?.dimensions && (
              <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-amber-700" />
                  <h3 className="font-dropa text-base font-bold text-stone-900">
                    Exact Blueprint Dimensions
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Width</span>
                    <span className="font-bold text-stone-900">{meta.dimensions.width}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Depth</span>
                    <span className="font-bold text-stone-900">{meta.dimensions.depth}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Height</span>
                    <span className="font-bold text-stone-900">{meta.dimensions.height}</span>
                  </div>
                  {meta.dimensions.seatHeight && (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Seat Height</span>
                      <span className="font-bold text-stone-900">{meta.dimensions.seatHeight}</span>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Net Weight</span>
                    <span className="font-bold text-stone-900">{meta.dimensions.weight}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Assembly Time</span>
                    <span className="font-bold text-stone-900">{meta.assemblyTimeMinutes} Mins</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
