import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
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
    <div className="min-h-screen bg-white text-[#1E1F22] flex flex-col justify-between">
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
              eyebrow="Sculptural Living"
              headline={"Solid White Oak\nDining"}
              highlightText="· Bouclé Lounges & Ceramics"
              description="Handcrafted solid oak tables, Italian leather lounges, bouclé accent seating, and ambient ceramic lighting engineered to endure generations."
              ctaLabel="Explore Visual Catalog"
              ctaHref="/home-living/catalog"
              footnote="White-Glove Room Assembly · Lifetime Solid Wood Frame Guarantee"
              image="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
              imageAlt="Nordic & Clay Sculptural Furniture"
              badge="White-Glove Assembly"
              bgColor="#F7F4ED"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={homeProducts} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid (Card 1: 25%, Card 2: 25%, Card 3: 50%) */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Solid Oak\nDining",
              count: "65+ pieces",
              image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80",
              href: "/home-living/catalog",
              theme: "light",
            }}
            card2={{
              title: "Living Room\nLounges",
              count: "110+ pieces",
              image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
              href: "/home-living/catalog",
              theme: "dark",
            }}
            card3={{
              title: "Top Collation",
              href: "/home-living/catalog",
              backgroundImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
              theme: "light",
              pills: [
                {
                  label: "Ceramic Lamps",
                  count: "80+ designs",
                  image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=120&q=80",
                  href: "/home-living/catalog",
                },
                {
                  label: "Bouclé Armchairs",
                  count: "45+ models",
                  image: "https://images.unsplash.com/photo-1580481077114-1e05f63d0c3a?auto=format&fit=crop&w=120&q=80",
                  href: "/home-living/catalog",
                },
                {
                  label: "Wool Area Rugs",
                  count: "70+ textiles",
                  image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=120&q=80",
                  href: "/home-living/catalog",
                },
              ],
            }}
          />
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
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
        </main>

        <StoreFooter store={store} />
    </div>
  );
}
