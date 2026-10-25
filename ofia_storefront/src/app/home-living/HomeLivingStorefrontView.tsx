"use client";

import React from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import { useCollectionsBento } from "@/hooks/useCollectionsBento";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { useStorefrontProducts } from "@/hooks/useStorefrontProducts";
import {
  Armchair,
  Ruler,
  Truck,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

export default function HomeLivingStorefrontView() {
  const { store: dynamicStore, isFeatureEnabled, tenantSlug, handshake } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES["home-living"];
  const config = handshake?.storefrontConfig;
  const { products: homeProducts, isLiveMerchantCatalog } = useStorefrontProducts("home-living");

  const canBookServices = isFeatureEnabled("services") || isFeatureEnabled("dispatchBooking");
  const tenantQuery = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : "";

  const {
    isEnabled: isCollectionsEnabled,
    card1: bentoCard1,
    card2: bentoCard2,
    card3: bentoCard3,
  } = useCollectionsBento({
    config,
    products: homeProducts,
    catalogPath: `/home-living/catalog${tenantQuery}`,
    itemUnit: "pieces",
    defaults: {
      card1: {
        title: "Living &\nSofas",
        count: "35+ pieces",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        href: `/home-living/catalog${tenantQuery}`,
        theme: "light",
      },
      card2: {
        title: "Dining &\nTables",
        count: "25+ pieces",
        image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80",
        href: `/home-living/catalog${tenantQuery}`,
        theme: "light",
      },
      card3: {
        title: "Lamps & Ceramics",
        href: `/home-living/catalog${tenantQuery}`,
        backgroundImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
        theme: "light",
        pills: [
          {
            label: "Modular Sectionals",
            count: "Custom fabric",
            image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=120&q=80",
            href: `/home-living/catalog${tenantQuery}`,
          },
          {
            label: "Solid Oak Dining",
            count: "6-10 seaters",
            image: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=120&q=80",
            href: `/home-living/catalog${tenantQuery}`,
          },
          {
            label: "Ceramic Vessels",
            count: "Hand-thrown",
            image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=120&q=80",
            href: `/home-living/catalog${tenantQuery}`,
          },
        ],
      },
    },
  });

  return (
    <div className="min-h-screen bg-white text-[#1E1F22] flex flex-col justify-between">
      <StoreHeader store={store} />

      {/* Hero & Category Collage Section */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow={store.tagline || "Sculptural Living & Bespoke Timber"}
              headline={store.name}
              highlightText="· Bouclé Lounges & Ceramics"
              description={store.description || "Handcrafted solid oak tables, Italian leather lounges, bouclé accent seating, and ambient ceramic lighting engineered to endure generations."}
              ctaLabel={canBookServices ? "Explore Delivery & Setup" : "Explore Visual Catalog"}
              ctaHref={canBookServices ? `/home-living/delivery-options${tenantQuery}` : `/home-living/catalog${tenantQuery}`}
              footnote="White-Glove Room Assembly · Lifetime Solid Wood Frame Guarantee"
              image={store.coverImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"}
              imageAlt={`${store.name} Living Collections`}
              badge={tenantSlug ? undefined : "White-Glove Assembly"}
              bgColor="#F7F4ED"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={homeProducts} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid */}
        {isCollectionsEnabled && (
          <div className="w-full lg:flex-1 min-h-0">
            <VerticalCategoryBentoGrid
              card1={bentoCard1}
              card2={bentoCard2}
              card3={bentoCard3}
            />
          </div>
        )}
      </section>

      {/* Content Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
        {/* Value Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <ShieldCheck className="w-7 h-7 text-stone-700 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-stone-900">Lifetime Frame Warranty</h4>
              <p className="text-xs text-stone-500 mt-0.5">Kiln-dried solid hardwood</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <Truck className="w-7 h-7 text-stone-700 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-stone-900">White-Glove Delivery</h4>
              <p className="text-xs text-stone-500 mt-0.5">Room-of-choice setup & unpack</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <Ruler className="w-7 h-7 text-stone-700 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-stone-900">Custom Dimensions</h4>
              <p className="text-xs text-stone-500 mt-0.5">Tailored to your floor plan</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <Armchair className="w-7 h-7 text-stone-700 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-stone-900">Performance Fabrics</h4>
              <p className="text-xs text-stone-500 mt-0.5">Stain-resistant Belgian linen</p>
            </div>
          </div>
        </section>

        {/* Collections Catalog Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-stone-600">Curated Living</span>
                {isLiveMerchantCatalog && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Catalog
                  </span>
                )}
              </div>
              <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight mt-1">
                Featured Furniture Pieces
              </h2>
            </div>
            <Link
              href={`/home-living/catalog${tenantQuery}`}
              className="text-sm sm:text-base font-bold text-stone-700 hover:text-stone-900 flex items-center gap-2 transition-colors"
            >
              <span>Explore All Pieces</span>
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
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-6 space-y-3">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h3 className="font-dropa text-xl sm:text-2xl font-bold text-stone-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {prod.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed font-light">
                        {prod.description}
                      </p>

                      {meta?.dimensions && (
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-600 flex items-center justify-between font-mono">
                          <span className="text-stone-400 font-sans">Dimensions:</span>
                          <span>W {meta.dimensions.width} × D {meta.dimensions.depth} × H {meta.dimensions.height}</span>
                        </div>
                      )}
                    </div>
                  </div>

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
                      href={`/checkout${tenantQuery}`}
                      className="px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-xs"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Order Now</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* White-Glove Delivery Calculator Spotlight (Gated by Services Provisioning) */}
        {canBookServices && (
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
                href={`/home-living/delivery-options${tenantQuery}`}
                className="w-full md:w-auto px-7 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-400/20 transition-colors"
              >
                <span>Explore Delivery Tiers & Calculator</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
