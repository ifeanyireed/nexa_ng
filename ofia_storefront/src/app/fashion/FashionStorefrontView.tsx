"use client";

import React from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
import StorefrontValueBadges from "@/components/common/StorefrontValueBadges";
import StorefrontFeatureBanner from "@/components/common/StorefrontFeatureBanner";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { useStorefrontProducts } from "@/hooks/useStorefrontProducts";
import { ArrowRight, Shirt, Scissors, Shield, Ruler, Truck, RefreshCw } from "lucide-react";

export default function FashionStorefrontView() {
  const { store: dynamicStore, isFeatureEnabled, tenantSlug, handshake } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES.fashion;
  const config = handshake?.storefrontConfig;
  const { products: fashionProducts, isLiveMerchantCatalog } = useStorefrontProducts("fashion");

  const canBookServices = isFeatureEnabled("services");
  const tenantQuery = "";

  return (
    <div className="min-h-screen bg-white text-[#111318] flex flex-col justify-between">
      <StoreHeader store={store} />

      {/* Hero & Category Collage Section */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow={config?.hero?.eyebrow || store.tagline || "Capsule Drop & Couture"}
              headline={config?.hero?.headline || store.name}
              highlightText={config?.hero?.highlightText !== undefined ? config.hero.highlightText : "· Artisanal Tailoring & Silhouettes"}
              description={config?.hero?.description || store.description || "Artisanal linen tunics, hand-embroidered kaftans, and architectural outerwear tailored for effortless tropical elegance."}
              ctaLabel={config?.hero?.ctaLabel || (canBookServices ? "Schedule Bespoke Fitting" : "Explore Capsule Catalog")}
              ctaHref={config?.hero?.ctaHref || (canBookServices ? `/fashion/custom-tailoring${tenantQuery}` : `/fashion/catalog${tenantQuery}`)}
              footnote={config?.hero?.footnote || "Free Doorstep Sizing Exchanges · 7-Day Fit Guarantee"}
              image={config?.hero?.image || store.coverImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"}
              imageAlt={`${store.name} Capsule Collection`}
              badge={config?.hero?.badge || (tenantSlug ? undefined : "Capsule Drop")}
              bgColor={config?.hero?.bgColor || "#FAF9F5"}
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={fashionProducts} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Men's\nCollection",
              count: "180+ pieces",
              image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
              href: `/fashion/catalog${tenantQuery}`,
              theme: "light",
            }}
            card2={{
              title: "Women's\nCollection",
              count: "260+ pieces",
              image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
              href: `/fashion/catalog${tenantQuery}`,
              theme: "light",
            }}
            card3={{
              title: "Top Collation",
              href: `/fashion/catalog${tenantQuery}`,
              backgroundImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80",
              theme: "light",
              pills: [
                {
                  label: "Linen Tunics",
                  count: "1.2k+ pieces",
                  image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=120&q=80",
                  href: `/fashion/catalog${tenantQuery}`,
                },
                {
                  label: "Kaftans & Agbada",
                  count: "850+ pieces",
                  image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=120&q=80",
                  href: `/fashion/catalog${tenantQuery}`,
                },
                {
                  label: "Leather Sandals & Bags",
                  count: "420+ pieces",
                  image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=120&q=80",
                  href: `/fashion/catalog${tenantQuery}`,
                },
              ],
            }}
          />
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
        {/* Value Badges */}
        <StorefrontValueBadges
          customBadges={config?.valueBadges}
          isVisible={config?.sectionVisibility?.valueBadges !== false}
          accentColor="text-amber-600"
          defaultBadges={[
            {
              title: "Custom Sizing",
              description: "Made-to-measure tailoring",
              icon: <Ruler className="w-7 h-7 text-amber-600 shrink-0" />,
            },
            {
              title: "French Flax & Silk",
              description: "Sustainable raw textiles",
              icon: <Scissors className="w-7 h-7 text-amber-600 shrink-0" />,
            },
            {
              title: "Ofia Dispatch",
              description: "Express doorstep delivery",
              icon: <Truck className="w-7 h-7 text-amber-600 shrink-0" />,
            },
            {
              title: "Free Exchanges",
              description: "7-day fit guarantee",
              icon: <RefreshCw className="w-7 h-7 text-amber-600 shrink-0" />,
            },
          ]}
        />

        {/* Featured Seasonal Drops */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-700">
                  {config?.featuredSection?.eyebrow || "Signature Apparel"}
                </span>
                {isLiveMerchantCatalog && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Catalog
                  </span>
                )}
              </div>
              <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                {config?.featuredSection?.title || "Featured Collection Drops"}
              </h2>
            </div>
            <Link
              href={config?.featuredSection?.viewAllHref || `/fashion/catalog${tenantQuery}`}
              className="text-sm sm:text-base font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 group"
            >
              <span>{config?.featuredSection?.viewAllLabel || "View All Pieces"}</span>
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
                        Featured Piece
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

                  {product.fashionMeta ? (
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
                  ) : (
                    <div className="flex items-center justify-between pt-2.5 border-t border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border border-stone-300 shadow-xs bg-[#111111]" title="Obsidian Black" />
                        <span className="w-4 h-4 rounded-full border border-stone-300 shadow-xs bg-[#D6C7B2]" title="Raw Sandstone" />
                        <span className="w-4 h-4 rounded-full border border-stone-300 shadow-xs bg-[#1F4E3D]" title="Forest Emerald" />
                      </div>
                      <div className="text-xs font-mono text-stone-600 font-semibold">
                        Sizes: XS, S, M, L, XL
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
                      href={`/checkout${tenantQuery}`}
                      className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      <span>Order Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bespoke Tailoring Feature Banner (Gated by Services Provisioning or Custom Config) */}
        {((config?.featureBanner?.enabled ?? canBookServices)) && (
          <StorefrontFeatureBanner
            customBanner={config?.featureBanner}
            isVisible={config?.sectionVisibility?.featureBanner !== false}
            defaultEyebrow="Bespoke Fitting Service"
            defaultHeadline="Custom Tailored to Your Exact Proportions"
            defaultDescription="Book a private appointment with our master pattern maker or submit your anatomical measurements online for a personalized cut."
            defaultCtaLabel="Schedule Fitting Appointment"
            defaultCtaHref={`/fashion/custom-tailoring${tenantQuery}`}
            defaultImage="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80"
            bgClassName="bg-amber-900 text-white border-amber-800"
            accentTextClassName="text-amber-300"
            ctaIcon={<Ruler className="w-5 h-5 text-amber-700" />}
          />
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
