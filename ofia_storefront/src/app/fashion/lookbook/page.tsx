"use client";

import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  ArrowRight,
  ChevronLeft,
  Ruler,
  Scissors,
  Eye,
} from "lucide-react";

export default function FashionLookbookPage() {
  const store = MOCK_STORES["fashion"];
  const products = MOCK_PRODUCTS.filter((p) => p.vertical === "fashion");

  const editorialLooks = [
    {
      id: "look-01",
      title: "Harmattan Silk Nocturne Ensemble",
      season: "Harmattan / Winter Haute Couture",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
      description: "Structured raw silk tunic over tailored cigarette trousers. Accented with brass filigree cuff links and midnight black patent leather brogues.",
      productId: "fsh-001",
    },
    {
      id: "look-02",
      title: "The Lagos Riviera Linen Silhouette",
      season: "Resort & Architectural Leisure",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
      description: "Breathable Italian-milled double-breasted cream linen blazer paired with relaxed pleated trousers and woven calfskin loafers.",
      productId: "fsh-002",
    },
    {
      id: "look-03",
      title: "Monochrome Heritage Safari Drape",
      season: "Trans-Seasonal Tailoring",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
      description: "Minimalist asymmetrical kimono silhouette crafted from organic Nigerian hand-dyed adire cotton with horn buttons.",
      productId: "fsh-003",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E1E1E] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/fashion"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Maison Véleste</span>
          </Link>
          <Link
            href="/fashion/custom-tailoring"
            className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Bespoke Fitting Atelier</span>
          </Link>
        </div>

        {/* Hero Title */}
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full">
            Seasonal Runway & Editorial Archive
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
            The Haute Couture Lookbook
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-serif italic">
            &ldquo;Form follows heritage. An exploration of West African textile geometry reimagined for modern cosmopolitan silhouettes.&rdquo;
          </p>
        </div>

        {/* Editorial Feed */}
        <div className="space-y-16">
          {editorialLooks.map((look, idx) => (
            <div
              key={look.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className={`lg:col-span-7 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="relative aspect-16/11 sm:aspect-16/10 rounded-3xl overflow-hidden bg-stone-100 shadow-md border border-stone-200">
                  <img
                    src={look.image}
                    alt={look.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-900 shadow-xs">
                    {look.season}
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-5 space-y-4 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest block">
                  Ensemble 0{idx + 1}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  {look.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                  {look.description}
                </p>

                <div className="pt-2">
                  <Link
                    href={`/fashion/product/${look.productId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <span>View Garment Details</span>
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
