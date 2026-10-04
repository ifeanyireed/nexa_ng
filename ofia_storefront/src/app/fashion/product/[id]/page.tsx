"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  X,
  Info,
} from "lucide-react";

export default function FashionProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const store = MOCK_STORES.fashion;
  const { addToCart } = useCart();

  const productId = (params?.id as string) || "fsh-001";
  const product =
    MOCK_PRODUCTS.find((p) => p.id === productId && p.vertical === "fashion") ||
    MOCK_PRODUCTS[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.fashionMeta?.colors[0]?.name || "Raw Sandstone"
  );
  const [selectedSize, setSelectedSize] = useState(
    product.fashionMeta?.sizes[1] || "M"
  );
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[selectedImage] || product.images[0],
      quantity: 1,
      vertical: "fashion",
      selectedColor,
      selectedSize,
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/fashion" className="hover:text-zinc-900 transition-colors">
            Aura & Loom
          </Link>
          <span>/</span>
          <Link href="/fashion/catalog" className="hover:text-zinc-900 transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold truncate">{product.title}</span>
        </div>

        {/* Product Workspace: Gallery + Size/Color Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] bg-stone-100 rounded-3xl overflow-hidden border border-stone-200/80 shadow-md">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {product.isNewDrop && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                  New Drop
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === idx
                      ? "border-amber-700 shadow-md scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Product Configurator & Purchasing (5 cols) */}
          <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                {product.category}
              </span>
              <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mt-1">
                {product.title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light leading-relaxed">
                {product.subtitle}
              </p>

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-bold text-zinc-900">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ₦{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  In Stock & Ready
                </span>
              </div>
            </div>

            {/* COLOR SELECTION */}
            {product.fashionMeta?.colors && (
              <div className="space-y-2 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900">Color:</span>
                  <span className="font-semibold text-amber-700">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.fashionMeta.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                        selectedColor === c.name
                          ? "border-amber-700 scale-110 shadow-md ring-2 ring-amber-700/20"
                          : "border-stone-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check
                          className={`w-4 h-4 ${
                            c.hex === "#111111" || c.hex === "#1E2A38"
                              ? "text-white"
                              : "text-zinc-900"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SIZE SELECTION & SIZE GUIDE TRIGGER */}
            {product.fashionMeta?.sizes && (
              <div className="space-y-2 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-900">Select Size:</span>
                    <span className="font-mono font-bold text-amber-700">{selectedSize}</span>
                  </div>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {product.fashionMeta.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedSize === s
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag ({selectedSize} · {selectedColor})</span>
              </button>

              {addedSuccess && (
                <div className="p-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Added to your bag! You can proceed to checkout anytime.</span>
                </div>
              )}

              <Link
                href="/fashion/custom-tailoring"
                className="w-full py-3 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold text-center block transition-colors"
              >
                Need custom measurements? Request Atelier Bespoke Fitting
              </Link>
            </div>

            {/* Assurance Perks */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Dispatched via Ofia Logistics within 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Genuine Heritage Fabric Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Garment Highlights & Care */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          <h2 className="font-dropa text-xl font-bold text-zinc-900">Garment Craftsmanship & Details</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            {product.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Key Highlights</h4>
              <ul className="space-y-1.5 text-xs text-stone-600 list-disc pl-4 font-light">
                {product.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">Fit & Care Notes</h4>
              <p className="text-xs text-stone-600 font-light mb-1">
                <strong>Fit:</strong> {product.fashionMeta?.fit}
              </p>
              <p className="text-xs text-stone-600 font-light">
                <strong>Care:</strong> {product.fashionMeta?.careInstructions}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && product.fashionMeta?.sizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-amber-700" />
                <h3 className="font-dropa font-bold text-lg text-zinc-900">Atelier Size Guide</h3>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 font-light">
              Measurements reflect anatomical body dimensions in inches. For custom bespoke tailored fit, choose "Bespoke Fit" during checkout.
            </p>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold">
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Chest / Bust</th>
                  <th className="p-2.5">Waist</th>
                  <th className="p-2.5">Hips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {product.fashionMeta.sizeGuide.map((row) => (
                  <tr key={row.size} className="hover:bg-amber-50/50">
                    <td className="p-2.5 font-bold text-zinc-900">{row.size}</td>
                    <td className="p-2.5 text-stone-600">{row.chest}</td>
                    <td className="p-2.5 text-stone-600">{row.waist}</td>
                    <td className="p-2.5 text-stone-600">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="px-5 py-2 rounded-full bg-zinc-900 text-white font-bold text-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      <StoreFooter store={store} />
    </div>
  );
}
