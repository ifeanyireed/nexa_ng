import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Laptop,
  Smartphone,
  ShieldCheck,
  Cpu,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gadgets",
  description: "Flagship smartphones, pro workstations, and audiophile acoustics with verified warranties.",
};

export default function GadgetsStorefrontPage() {
  const store = MOCK_STORES.gadgets;
  const gadgetProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "gadgets");

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Dark Tech Hero - Spanning Entire Width on Left & Right */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-zinc-800">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/70 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <Cpu className="w-3.5 h-3.5" />
                <span>Next-Gen Silicon & Flagship Hardware</span>
              </div>

              <h1 className="font-dropa text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
                Uncompromising Power. <br />
                <span className="text-blue-500">2-Year Direct</span> Warranty.
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light max-w-xl">
                Authentic factory-sealed flagship phones, M-series workstations, and audiophile noise-canceling headphones. Backed by official service warranties.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/gadgets/catalog"
                  className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <span>Shop Tech Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/gadgets/compare"
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-xs transition-colors flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                  <span>Compare Specs & Diagnostics</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Tech Guarantees Badges */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">2-Year Warranty</h4>
              <p className="text-[11px] text-zinc-400">Direct hardware replacement</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">100% Factory Sealed</h4>
              <p className="text-[11px] text-zinc-400">Verified manufacturer serial</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs flex items-center gap-3">
            <Truck className="w-6 h-6 text-blue-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Same-Day Dispatch</h4>
              <p className="text-[11px] text-zinc-400">Express delivery in Lagos</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs flex items-center gap-3">
            <Wrench className="w-6 h-6 text-blue-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Authorized Repair</h4>
              <p className="text-[11px] text-zinc-400">Certified technician support</p>
            </div>
          </div>
        </section>

        {/* Featured Hardware Catalog */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Curated Flagships</span>
              <h2 className="font-dropa text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Featured Hardware & Flagships
              </h2>
            </div>
            <Link
              href="/gadgets/catalog"
              className="text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
            >
              <span>View Full Tech Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gadgetProducts.map((gadget) => {
              const meta = gadget.gadgetMeta;
              return (
                <div
                  key={gadget.id}
                  className="group rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xs hover:shadow-2xl hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-16/10 overflow-hidden bg-black p-6 flex items-center justify-center">
                      <img
                        src={gadget.images[0]}
                        alt={gadget.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
                          {meta?.brand}
                        </span>
                        {meta?.modelYear && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            {meta.modelYear}
                          </span>
                        )}
                      </div>
                      {meta?.warrantyYears && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{meta.warrantyYears}-Year Warranty</span>
                        </div>
                      )}
                    </div>

                    {/* Specs Overview */}
                    <div className="p-5 space-y-4">
                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {gadget.category}
                        </span>
                        <h3 className="font-dropa text-lg font-bold text-white mt-0.5 line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {gadget.title}
                        </h3>
                      </div>

                      {/* Specs Matrix Preview */}
                      {meta?.specs && (
                        <div className="grid grid-cols-2 gap-2 py-2 border-y border-zinc-800 text-[11px] text-zinc-300">
                          {Object.entries(meta.specs).slice(0, 4).map(([key, val]) => (
                            <div key={key} className="truncate">
                              <span className="text-zinc-500 mr-1">{key}:</span>
                              <span className="font-medium text-zinc-200">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Highlights */}
                      <ul className="space-y-1 text-xs text-zinc-400">
                        {gadget.highlights.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="p-5 pt-0 border-t border-zinc-800/80 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block">
                        Official Retail
                      </span>
                      <span className="font-dropa text-lg font-bold text-white">
                        {store.currency}{gadget.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/gadgets/product/${gadget.id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Specs & Warranty</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Spec Comparison & Diagnostic Repair Banner */}
        <section className="rounded-3xl bg-zinc-900 text-white p-6 sm:p-10 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Wrench className="w-4 h-4" />
              <span>Diagnostic Clinic & Tech Repair</span>
            </div>
            <h3 className="font-dropa text-2xl sm:text-3xl font-bold text-white">
              Official Diagnostics & Warranty Servicing
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Have an issue with your Mac, iPhone, or acoustic gear? Book our certified hardware diagnostic service with genuine OEM replacement parts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/gadgets/compare"
              className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Compare Specs & Book Repair</span>
            </Link>
          </div>
        </section>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
