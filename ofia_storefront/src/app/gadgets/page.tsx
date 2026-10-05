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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Tech Hero - Spanning Entire Width on Left & Right */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-slate-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-slate-200/80">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
                <Cpu className="w-4 h-4" />
                <span>Next-Gen Silicon & Flagship Hardware</span>
              </div>

              <h1 className="font-dropa text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-tight">
                Uncompromising Power. <br />
                <span className="text-blue-400 font-bold">2-Year Direct</span> Warranty.
              </h1>

              <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                Authentic factory-sealed flagship phones, M-series workstations, and audiophile noise-canceling acoustics. Backed by official service warranties.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/gadgets/catalog"
                  className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base transition-colors flex items-center gap-2.5 shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  <span>Shop Tech Catalog</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/gadgets/compare"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-5 h-5 text-blue-300" />
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
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <ShieldCheck className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">2-Year Warranty</h4>
                <p className="text-xs text-slate-500 mt-0.5">Direct hardware replacement</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">100% Factory Sealed</h4>
                <p className="text-xs text-slate-500 mt-0.5">Verified manufacturer serial</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <Truck className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Same-Day Dispatch</h4>
                <p className="text-xs text-slate-500 mt-0.5">Express delivery in Lagos</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <Wrench className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Authorized Repair</h4>
                <p className="text-xs text-slate-500 mt-0.5">Certified technician support</p>
              </div>
            </div>
          </section>

          {/* Featured Hardware Catalog */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-600">Curated Flagships</span>
                <h2 className="font-dropa text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-1">
                  Featured Hardware & Flagships
                </h2>
              </div>
              <Link
                href="/gadgets/catalog"
                className="text-sm sm:text-base font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
              >
                <span>View Full Tech Catalog</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gadgetProducts.map((gadget) => {
                const meta = gadget.gadgetMeta;
                return (
                  <div
                    key={gadget.id}
                    className="group rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative aspect-16/10 overflow-hidden bg-slate-50 flex items-center justify-center border-b border-slate-100">
                        <img
                          src={gadget.images[0]}
                          alt={gadget.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 shadow-xs">
                            {meta?.brand}
                          </span>
                          {meta?.modelYear && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                              {meta.modelYear}
                            </span>
                          )}
                        </div>
                        {meta?.warrantyYears && (
                          <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
                            <ShieldCheck className="w-4 h-4" />
                            <span>{meta.warrantyYears}-Year Warranty</span>
                          </div>
                        )}
                      </div>

                      {/* Specs Overview */}
                      <div className="p-6 space-y-4">
                        <div>
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            {gadget.category}
                          </span>
                          <h3 className="font-dropa text-xl sm:text-2xl font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {gadget.title}
                          </h3>
                        </div>

                        {/* Specs Matrix Preview */}
                        {meta?.specs && (
                          <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 text-xs sm:text-sm text-slate-700">
                            {Object.entries(meta.specs).slice(0, 4).map(([key, val]) => (
                              <div key={key} className="truncate">
                                <span className="text-slate-400 mr-1.5">{key}:</span>
                                <span className="font-semibold text-slate-800">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Highlights */}
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                          {gadget.highlights.slice(0, 2).map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pricing and Action */}
                    <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                          Official Retail
                        </span>
                        <span className="font-dropa text-xl sm:text-2xl font-bold text-slate-900">
                          {store.currency}{gadget.price.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/gadgets/product/${gadget.id}`}
                        className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-xs"
                      >
                        <Cpu className="w-4 h-4" />
                        <span>Specs & Warranty</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Spec Comparison & Diagnostic Repair Banner */}
          <section className="rounded-3xl bg-white text-slate-900 p-8 sm:p-12 border border-slate-200/90 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <Wrench className="w-4 h-4" />
                <span>Diagnostic Clinic & Tech Repair</span>
              </div>
              <h3 className="font-dropa text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                Official Diagnostics & Warranty Servicing
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Have an issue with your Mac, iPhone, or acoustic gear? Book our certified hardware diagnostic service with genuine OEM replacement parts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto shrink-0">
              <Link
                href="/gadgets/compare"
                className="px-7 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Compare Specs & Book Repair</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
