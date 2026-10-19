import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
import { ArrowRight, Shirt, Scissors, Shield, Ruler, Truck, RefreshCw } from "lucide-react";

export default function FashionStorefrontPage() {
  const store = MOCK_STORES.fashion;
  const fashionProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "fashion");

  return (
    <div className="min-h-screen bg-[#ECEEF2] text-[#111318] flex flex-col justify-between">
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
              eyebrow="Summer Weekend's"
              headline={"Get Up to\n50% Off"}
              highlightText=""
              description="Artisanal linen tunics, hand-embroidered kaftans, and architectural outerwear tailored for effortless tropical elegance."
              ctaLabel="Get Discount"
              ctaHref="/fashion/catalog"
              footnote="Valid Until 05 April 2026 · Free Doorstep Sizing Exchanges"
              image="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
              imageAlt="Aura & Loom Harmattan Collection"
              badge="Capsule Drop"
              bgColor="#FAF9F5"
            />
          </div>

          {/* Companion Cart Rail (3 cols on desktop) */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={fashionProducts} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid (Card 1: 25%, Card 2: 25%, Card 3: 50%) */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Men's\nCollection",
              count: "180+ pieces",
              image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
              href: "/fashion/catalog",
            }}
            card2={{
              title: "Women's\nCollection",
              count: "260+ pieces",
              image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
              href: "/fashion/catalog",
            }}
            card3={{
              title: "Top Collation",
              href: "/fashion/catalog",
              backgroundImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80",
              pills: [
                {
                  label: "Linen Tunics",
                  count: "1.2k+ pieces",
                  image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=120&q=80",
                  href: "/fashion/catalog",
                },
                {
                  label: "Kaftans & Agbada",
                  count: "850+ pieces",
                  image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=120&q=80",
                  href: "/fashion/catalog",
                },
                {
                  label: "Leather Sandals & Bags",
                  count: "420+ pieces",
                  image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=120&q=80",
                  href: "/fashion/catalog",
                },
              ],
            }}
          />
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
          {/* Value Badges */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <Ruler className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Custom Sizing</h4>
                <p className="text-xs text-stone-500 mt-0.5">Made-to-measure tailoring</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <Scissors className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">100% French Flax</h4>
                <p className="text-xs text-stone-500 mt-0.5">Sustainable raw textiles</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <Truck className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Ofia Dispatch</h4>
                <p className="text-xs text-stone-500 mt-0.5">Express doorstep delivery</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <RefreshCw className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Free Exchanges</h4>
                <p className="text-xs text-stone-500 mt-0.5">7-day fit guarantee</p>
              </div>
            </div>
          </section>

          {/* Featured Seasonal Drops */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-700">Curated Capsule</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Featured Collection Drops
                </h2>
              </div>
              <Link
                href="/fashion/catalog"
                className="text-sm sm:text-base font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 group"
              >
                <span>View All 24 Pieces</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                      {product.isNewDrop && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm uppercase tracking-wider">
                          New Drop
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 text-white shadow-sm uppercase tracking-wider">
                          Atelier Pick
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-3.5">
                    <div>
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="font-bold text-lg sm:text-xl text-zinc-900 line-clamp-1 group-hover:text-amber-700 transition-colors mt-0.5">
                        {product.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 mt-1 font-light leading-relaxed">
                        {product.subtitle || product.description}
                      </p>
                    </div>

                    {/* Size & Color Swatches Preview */}
                    {product.fashionMeta && (
                      <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
                        <div className="flex items-center gap-1.5">
                          {product.fashionMeta.colors.map((c) => (
                            <span
                              key={c.name}
                              className="w-4 h-4 rounded-full border border-stone-300 shadow-xs"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                        <div className="text-xs font-mono text-stone-600 font-semibold">
                          Sizes: {product.fashionMeta.sizes.join(", ")}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2.5">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-zinc-900">
                          ₦{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs sm:text-sm text-stone-400 line-through ml-2">
                            ₦{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/fashion/product/${product.id}`}
                        className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
                      >
                        <span>Select Size</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bespoke Tailoring Feature Banner */}
          <section className="rounded-3xl bg-amber-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-4 z-10">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-amber-300 uppercase">
                Bespoke Fitting Service
              </span>
              <h3 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Custom Tailored to Your Exact Proportions
              </h3>
              <p className="text-amber-100/90 text-sm sm:text-base font-light leading-relaxed">
                Book a private appointment with our master pattern maker in Lekki Phase 1 or submit your anatomical measurements online for a personalized cut.
              </p>
              <div className="pt-2">
                <Link
                  href="/fashion/custom-tailoring"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-zinc-900 hover:bg-amber-100 font-bold text-sm sm:text-base transition-all shadow-md"
                >
                  <span>Schedule Fitting Appointment</span>
                  <Ruler className="w-5 h-5 text-amber-700" />
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
        </main>

        <StoreFooter store={store} />
    </div>
  );
}
