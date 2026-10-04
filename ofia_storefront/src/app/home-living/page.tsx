import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Armchair,
  Ruler,
  Truck,
  ShieldCheck,
  ArrowRight,
  Layers,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home & Living",
  description: "Architectural furniture, bouclé seating, and heirloom solid wood living collections.",
};

export default function HomeLivingStorefrontPage() {
  const store = MOCK_STORES["home-living"];
  const homeProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "home-living");

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1E1F22] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Architectural Hero - Spanning Entire Width on Left & Right */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-stone-800">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-65 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-500/20 border border-stone-400/40 text-stone-200 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
                <Armchair className="w-4 h-4" />
                <span>Architectural Form & Tactile Comfort</span>
              </div>

              <h1 className="font-dropa text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-tight">
                Calm Geometry. <br />
                <span className="italic font-cormorant text-amber-200">Heirloom</span> Craft.
              </h1>

              <p className="text-stone-200 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                Sculptural bouclé sofas, solid ashwood dining credenzas, and ambient ceramic fixtures designed for tranquil tropical living.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/home-living/catalog"
                  className="px-7 py-3.5 rounded-full bg-white text-stone-900 font-bold text-sm sm:text-base hover:bg-amber-100 transition-colors flex items-center gap-2.5 shadow-lg"
                >
                  <span>Explore Visual Catalog</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/home-living/delivery-options"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors flex items-center gap-2.5"
                >
                  <Truck className="w-5 h-5 text-amber-200" />
                  <span>White-Glove Delivery & Assembly</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Craftsmanship Guarantees */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="p-5 rounded-2xl bg-white border border-stone-300/60 shadow-xs flex items-center gap-3.5">
              <Layers className="w-7 h-7 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900">FSC Solid Ashwood</h4>
                <p className="text-xs text-stone-500 mt-0.5">Sustainably harvested timber</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-300/60 shadow-xs flex items-center gap-3.5">
              <Ruler className="w-7 h-7 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900">Exact Dimensions</h4>
                <p className="text-xs text-stone-500 mt-0.5">Floorplan clearance verified</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-300/60 shadow-xs flex items-center gap-3.5">
              <Truck className="w-7 h-7 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900">White-Glove Delivery</h4>
                <p className="text-xs text-stone-500 mt-0.5">Room unboxing & assembly</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-300/60 shadow-xs flex items-center gap-3.5">
              <ShieldCheck className="w-7 h-7 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900">10-Year Frame Warranty</h4>
                <p className="text-xs text-stone-500 mt-0.5">Structural integrity backing</p>
              </div>
            </div>
          </section>

          {/* Featured Visual Catalog Grid */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-800">Interior Essentials</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight mt-1">
                  Visual Furniture Catalog
                </h2>
              </div>
              <Link
                href="/home-living/catalog"
                className="text-sm sm:text-base font-bold text-amber-800 hover:text-amber-900 flex items-center gap-2 transition-colors"
              >
                <span>View Full Collection</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homeProducts.map((prod) => {
                const meta = prod.homeLivingMeta;
                return (
                  <div
                    key={prod.id}
                    className="group rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Visual Image */}
                      <div className="relative aspect-16/11 overflow-hidden bg-stone-100">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-900/90 text-white backdrop-blur-xs">
                            {meta?.room || "Living Room"}
                          </span>
                          {meta?.assemblyRequired && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Assembly Available</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-6 space-y-4">
                        <div>
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                            {prod.category}
                          </span>
                          <h3 className="font-dropa text-xl sm:text-2xl font-bold text-stone-900 mt-1 line-clamp-1 group-hover:text-amber-800 transition-colors">
                            {prod.title}
                          </h3>
                        </div>

                        {/* Dimensions Pills */}
                        {meta?.dimensions && (
                          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs sm:text-sm text-stone-600 flex items-center justify-between">
                            <span className="font-semibold text-stone-500">Dimensions:</span>
                            <span className="font-mono font-medium text-stone-800">
                              W {meta.dimensions.width} × D {meta.dimensions.depth} × H {meta.dimensions.height}
                            </span>
                          </div>
                        )}

                        {/* Finish swatches preview */}
                        {meta?.finishes && (
                          <div className="flex items-center gap-2.5 pt-1">
                            <span className="text-xs text-stone-500 font-semibold">Available Finishes:</span>
                            <div className="flex items-center gap-2">
                              {meta.finishes.map((f) => (
                                <div
                                  key={f.name}
                                  className="w-5 h-5 rounded-full border border-stone-300 shadow-2xs"
                                  style={{ backgroundColor: f.colorCode }}
                                  title={f.name}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing and Actions */}
                    <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider block">
                          Direct Price
                        </span>
                        <span className="font-dropa text-xl sm:text-2xl font-bold text-stone-900">
                          {store.currency}{prod.price.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/home-living/product/${prod.id}`}
                        className="px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-xs"
                      >
                        <Ruler className="w-4 h-4 text-amber-400" />
                        <span>Dimensions & Specs</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* White-Glove Delivery Calculator Spotlight */}
          <section className="rounded-3xl bg-stone-900 text-white p-8 sm:p-12 border border-stone-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Full-Service Logistics & Installation</span>
              </div>
              <h3 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                White-Glove Delivery & Room Assembly
              </h3>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Never worry about narrow staircases or assembly hex keys. Our white-glove two-man crew delivers into your room of choice, structures each piece, and removes all packaging.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Link
                href="/home-living/delivery-options"
                className="w-full md:w-auto px-7 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-400/20 transition-colors"
              >
                <span>Explore Delivery Tiers & Calculator</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
