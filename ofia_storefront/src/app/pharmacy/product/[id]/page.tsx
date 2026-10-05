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
  AlertTriangle,
  Upload,
  ShoppingBag,
  Check,
  ChevronLeft,
  Share2,
  Clock,
  Pill,
  FileText,
  Calendar,
  ThermometerSnowflake,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function PharmacyProductDetailPage() {
  const params = useParams();
  const store = MOCK_STORES["pharmacy"];
  const { addToCart, setIsCartOpen } = useCart();

  const productId = (params?.id as string) || "phm-001";
  const product =
    MOCK_PRODUCTS.find((p) => p.id === productId && p.vertical === "pharmacy") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "pharmacy") ||
    MOCK_PRODUCTS[0];

  const meta = product.pharmacyMeta;
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[selectedImage] || product.images[0],
      quantity: 1,
      vertical: "pharmacy",
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsCartOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#13221C] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/pharmacy/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Medication Catalog</span>
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
                alert("Medication link copied to clipboard");
              }
            }}
            className="p-2 rounded-full border border-teal-200 text-teal-800 hover:bg-teal-50 transition-colors"
            title="Share Medication Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/3 sm:aspect-16/11 rounded-3xl overflow-hidden bg-white border border-teal-100 flex items-center justify-center shadow-xs">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {meta?.prescriptionRequired ? (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    Prescription Required (Rx)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Over-The-Counter (OTC)
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200">
                  {meta?.dosageForm}
                </span>
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
                        ? "border-teal-700 ring-2 ring-teal-200"
                        : "border-teal-100 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Prescription Flow (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
                {meta?.strength && (
                  <span className="text-xs font-semibold text-stone-500">
                    Strength: {meta.strength}
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
            <div className="flex items-baseline gap-3 pt-2 border-t border-teal-100">
              <span className="text-3xl font-black text-teal-950 tracking-tight">
                ₦{product.price.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-stone-500">
                / Pack of {meta?.packSize}
              </span>
            </div>

            {/* Regulatory & Safety Badges */}
            <div className="bg-white p-4 rounded-2xl border border-teal-100 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">NAFDAC Reg No:</span>
                <span className="font-bold text-teal-950">{meta?.nafdacNumber || "A4-8921"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Verified Batch:</span>
                <span className="font-bold text-teal-950">{meta?.batchNumber || "BN-2024-91"}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500 font-medium">Expiry Date:</span>
                <span className="font-bold text-emerald-700">{meta?.expiryDate || "11/2026"}</span>
              </div>
            </div>

            {/* Action CTA: Rx vs OTC */}
            {meta?.prescriptionRequired ? (
              <div className="space-y-3 bg-amber-50/70 p-5 rounded-3xl border border-amber-200">
                <div className="flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-extrabold block">Prescription Required</span>
                    <span>Federal regulations mandate a signed medical prescription from a licensed physician before dispensing.</span>
                  </div>
                </div>

                <Link
                  href={`/pharmacy/prescription?medication=${encodeURIComponent(product.title)}`}
                  className="w-full py-4 px-6 rounded-full bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Prescription to Order</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addedSuccess}
                  className={`w-full py-4 px-6 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md ${
                    addedSuccess
                      ? "bg-emerald-600 text-white shadow-emerald-200"
                      : "bg-teal-700 hover:bg-teal-800 text-white shadow-teal-200"
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Added to Prescription Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Add to Cart · ₦{product.price.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Cold Chain Guarantee */}
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-teal-100 text-xs text-stone-600">
              <ThermometerSnowflake className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <span className="font-bold text-teal-950 block">Cold-Chain Temperature Controlled</span>
                <span>Dispatched in insulated medical pouches to preserve chemical potency.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-teal-100">
          {/* Active Ingredients & Usage */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-teal-950 flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <span>Active Chemical Profile & Usage</span>
            </h3>

            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Active Chemical Substances:
              </span>
              <div className="flex flex-wrap gap-2">
                {meta?.activeIngredients.map((act) => (
                  <span
                    key={act}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Dispensing Instructions:
              </span>
              <p className="text-xs text-stone-700 leading-relaxed bg-teal-50/40 p-4 rounded-2xl border border-teal-100/60 font-medium">
                {meta?.usageInstructions || "Take strictly as prescribed by your medical practitioner."}
              </p>
            </div>
          </div>

          {/* Safety Warnings & Consultation */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-teal-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Precautions & Contraindications</span>
            </h3>

            <ul className="space-y-2">
              {meta?.warnings?.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-teal-950 block">Unsure of dosage?</span>
                <span className="text-[11px] text-stone-500">Speak with resident pharmacist</span>
              </div>
              <Link
                href="/pharmacy/consultation"
                className="px-4 py-2 rounded-full bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors"
              >
                Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
