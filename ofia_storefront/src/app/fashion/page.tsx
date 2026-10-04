import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import { ArrowRight, Sparkles, Shield, Ruler, Truck, RefreshCw } from "lucide-react";

export default function FashionStorefrontPage() {
  const store = MOCK_STORES.fashion;
  const fashionProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "fashion");

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Editorial Fashion Hero - Spanning Entire Width on Left & Right */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-stone-800">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-[50%_30%] opacity-60 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Harmattan / Resort 2026 Collection</span>
              </div>

              <h1 className="font-dropa text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
                Raw Silhouettes. <br />
                <span className="italic font-cormorant text-amber-400">Timeless</span> Heritage.
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light max-w-xl">
                Artisanal linen tunics, hand-embroidered kaftans, and architectural outerwear tailored for effortless tropical elegance.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/fashion/catalog"
                  className="px-6 py-3 rounded-full bg-white text-zinc-900 font-bold text-xs sm:text-sm hover:bg-amber-400 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <span>Shop Product Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/fashion/custom-tailoring"
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-xs transition-colors flex items-center gap-2"
                >
                  <span>Book Bespoke Fitting</span>
                  <Ruler className="w-4 h-4 text-amber-300" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Value Badges */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
            <Ruler className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Custom Sizing</h4>
              <p className="text-[11px] text-stone-500">Made-to-measure tailoring</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-zinc-900">100% French Flax</h4>
              <p className="text-[11px] text-stone-500">Sustainable raw textiles</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
            <Truck className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Ofia Dispatch</h4>
              <p className="text-[11px] text-stone-500">Express doorstep delivery</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Free Exchanges</h4>
              <p className="text-[11px] text-stone-500">7-day fit guarantee</p>
            </div>
          </div>
        </section>

        {/* Featured Seasonal Drops */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Curated Capsule</span>
              <h2 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mt-1">
                Featured Collection Drops
              </h2>
            </div>
            <Link
              href="/fashion/catalog"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
            >
              <span>View All 24 Pieces</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fashionProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.isNewDrop && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm uppercase tracking-wider">
                        New Drop
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white shadow-sm uppercase tracking-wider">
                        Atelier Pick
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-base text-zinc-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-light leading-relaxed">
                      {product.subtitle || product.description}
                    </p>
                  </div>

                  {/* Size & Color Swatches Preview */}
                  {product.fashionMeta && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1">
                        {product.fashionMeta.colors.map((c) => (
                          <span
                            key={c.name}
                            className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <div className="text-[11px] font-mono text-stone-500 font-semibold">
                        Sizes: {product.fashionMeta.sizes.join(", ")}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-sm font-bold text-zinc-900">
                        ₦{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-stone-400 line-through ml-2">
                          ₦{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/fashion/product/${product.id}`}
                      className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>Select Size</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bespoke Tailoring Feature Banner */}
        <section className="rounded-3xl bg-amber-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3 z-10">
            <span className="text-xs font-bold tracking-widest text-amber-300 uppercase">
              Bespoke Fitting Service
            </span>
            <h3 className="font-dropa text-2xl sm:text-4xl font-normal leading-tight">
              Custom Tailored to Your Exact Proportions
            </h3>
            <p className="text-amber-100/80 text-xs sm:text-sm font-light leading-relaxed">
              Book a private appointment with our master pattern maker in Lekki Phase 1 or submit your anatomical measurements online for a personalized cut.
            </p>
            <div className="pt-2">
              <Link
                href="/fashion/custom-tailoring"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-900 hover:bg-amber-100 font-bold text-xs sm:text-sm transition-all shadow-md"
              >
                <span>Schedule Fitting Appointment</span>
                <Ruler className="w-4 h-4 text-amber-700" />
              </Link>
            </div>
          </div>

          <div className="relative w-full md:w-80 aspect-square rounded-2xl overflow-hidden border border-amber-700/50 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80"
              alt="Bespoke Tailoring Workshop"
              className="w-full h-full object-cover"
            />
          </div>
        </section>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
