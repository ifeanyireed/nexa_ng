import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
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
    <div className="min-h-screen bg-[#ECEEF2] text-slate-900 flex flex-col justify-between">
      <StoreHeader store={store} />

      {/* Hero & Category Collage Section:
          Fits exactly in desktop viewport height (100vh - header),
          Cards on Line 1 and Line 2 have almost the same height (flex-1 min-h-0),
          and their sum fits into the screen height. */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow="Official Flagship Tech"
              headline={"Up to 30%\nTrade-In Credit"}
              highlightText="· Pro Laptops & Smart Audio"
              description="Authorized retailer for Apple, Samsung, Sony, and Dell flagship technology with guaranteed manufacturer warranties and express doorstep delivery."
              ctaLabel="Shop Apple & Flagships"
              ctaHref="/gadgets/catalog"
              footnote="2-Year PulseCare Warranty · Same-Day Lagos Dispatch"
              image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
              imageAlt="PulseTech Pro Workstations"
              badge="Trade-In Ready"
              bgColor="#F4F7FA"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={gadgetProducts} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid (Card 1: 25%, Card 2: 25%, Card 3: 50%) */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Smartphones\n& Flagships",
              count: "120+ devices",
              image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
              href: "/gadgets/catalog",
            }}
            card2={{
              title: "Pro Laptops\n& Mac",
              count: "85+ machines",
              image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
              href: "/gadgets/catalog",
            }}
            card3={{
              title: "Top Collation",
              href: "/gadgets/catalog",
              backgroundImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80",
              pills: [
                {
                  label: "Studio Headphones & ANC",
                  count: "60+ units",
                  image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80",
                  href: "/gadgets/catalog",
                },
                {
                  label: "Smartwatches & Health",
                  count: "45+ devices",
                  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80",
                  href: "/gadgets/catalog",
                },
                {
                  label: "Fast Chargers & Docks",
                  count: "150+ accessories",
                  image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=120&q=80",
                  href: "/gadgets/catalog",
                },
              ],
            }}
          />
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
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
        </main>

        <StoreFooter store={store} />
    </div>
  );
}
