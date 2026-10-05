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
  Zap,
  Wrench,
  Download,
  ShoppingBag,
  Check,
  ChevronLeft,
  Share2,
  CheckCircle2,
  Cpu,
  Layers,
  Calculator,
} from "lucide-react";

export default function HardwareProductDetailPage() {
  const params = useParams();
  const store = MOCK_STORES["hardware"];
  const { addToCart, setIsCartOpen } = useCart();

  const productId = (params?.id as string) || "hdw-001";
  const product =
    MOCK_PRODUCTS.find((p) => p.id === productId && p.vertical === "hardware") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "hardware") ||
    MOCK_PRODUCTS[0];

  const meta = product.hardwareMeta;
  const [selectedImage, setSelectedImage] = useState(0);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const installationFee = 60000;
  const totalPrice = product.price + (includeInstallation ? installationFee : 0);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: includeInstallation ? `${product.title} (+ COREN Installation)` : product.title,
      price: totalPrice,
      image: product.images[selectedImage] || product.images[0],
      quantity: 1,
      vertical: "hardware",
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsCartOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E252B] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/hardware/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Equipment Catalog</span>
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
                alert("Hardware spec URL copied to clipboard");
              }
            }}
            className="p-2 rounded-full border border-stone-300 text-slate-700 hover:bg-stone-100 transition-colors"
            title="Share Technical Specs"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/3 sm:aspect-16/11 rounded-3xl overflow-hidden bg-white border border-stone-200 flex items-center justify-center shadow-xs">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-900 text-white">
                  {meta?.systemType}
                </span>
                {meta?.powerRating && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {meta.powerRating}
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
                        ? "border-slate-900 ring-2 ring-slate-300"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Engineering Options (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  {meta?.warrantyYears}-Year Manufacturer Warranty
                </span>
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

            {/* Price & Wholesale Tier */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ₦{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {meta?.contractorPrice && (
                <p className="text-xs text-amber-800 font-bold">
                  Registered Contractor Tier: ₦{meta.contractorPrice.toLocaleString()} (Min. 2 Units)
                </p>
              )}
            </div>

            {/* Professional Installation Addon */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInstallation}
                  onChange={(e) => setIncludeInstallation(e.target.checked)}
                  className="mt-1 rounded text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      Add COREN-Certified Turnkey Installation (+₦{installationFee.toLocaleString()})
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Includes heavy-gauge DC breaker box, earthing pit verification, surge arrestors, and mobile cloud monitoring setup.
                  </p>
                </div>
              </label>
            </div>

            {/* Action CTA */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || addedSuccess}
                className={`w-full py-4 px-6 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Equipment Order</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Order System · ₦{totalPrice.toLocaleString()}</span>
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <a
                  href={meta?.specSheetUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!meta?.specSheetUrl) {
                      e.preventDefault();
                      alert("Official OEM Engineering Spec Sheet downloaded.");
                    }
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Spec Sheet (PDF)</span>
                </a>
                <Link
                  href="/hardware/calculator"
                  className="flex-1 py-2.5 px-4 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Audit Load Fit</span>
                </Link>
              </div>
            </div>

            {/* Engineering Field Signoff */}
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-stone-200 text-xs text-stone-600">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Compliant with Nigerian Electrical Code</span>
                <span>All installations covered by 12-month zero-fault field workmanship guarantee.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specification Matrix */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-slate-800" />
            <h3 className="text-lg font-bold text-slate-900">Technical Specifications & Engineering Matrix</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">System Classification:</span>
                <span className="font-bold text-slate-900">{meta?.systemType}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Power / Continuous Wattage:</span>
                <span className="font-bold text-slate-900">{meta?.powerRating || "N/A"}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Operational Voltage (Nominal):</span>
                <span className="font-bold text-slate-900">{meta?.voltage || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Capacity / Storage Rating:</span>
                <span className="font-bold text-slate-900">{meta?.capacity || "N/A"}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Warranty Period:</span>
                <span className="font-bold text-emerald-700">{meta?.warrantyYears} Years Limited</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-stone-500 font-medium">Installation Compatibility:</span>
                <span className="font-bold text-slate-900">{meta?.installationEligible ? "Turnkey Eligible" : "Direct Supply Only"}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Engineering Highlights:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.highlights?.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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
