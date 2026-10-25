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
  Laptop,
  Smartphone,
  ShieldCheck,
  Cpu,
  Truck,
  RotateCcw,
  ArrowRight,
  SlidersHorizontal,
  Wrench,
  ShoppingBag,
} from "lucide-react";

export default function GadgetsStorefrontView() {
  const { store: dynamicStore, isFeatureEnabled, tenantSlug, handshake } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES.gadgets;
  const config = handshake?.storefrontConfig;
  const { products: gadgetProducts, isLiveMerchantCatalog } = useStorefrontProducts("gadgets");

  const canBookServices = isFeatureEnabled("services");
  const tenantQuery = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : "";

  const {
    isEnabled: isCollectionsEnabled,
    card1: bentoCard1,
    card2: bentoCard2,
    card3: bentoCard3,
  } = useCollectionsBento({
    config,
    products: gadgetProducts,
    catalogPath: `/gadgets/catalog${tenantQuery}`,
    itemUnit: "devices",
    defaults: {
      card1: {
        title: "Laptops &\nWorkstations",
        count: "40+ models",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        href: `/gadgets/catalog${tenantQuery}`,
        theme: "dark",
      },
      card2: {
        title: "Pro Smart\nPhones",
        count: "30+ flagships",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
        href: `/gadgets/catalog${tenantQuery}`,
        theme: "dark",
      },
      card3: {
        title: "Audio & Drones",
        href: `/gadgets/catalog${tenantQuery}`,
        backgroundImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
        theme: "dark",
        pills: [
          {
            label: "Noise Cancelling",
            count: "Top rated",
            image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=120&q=80",
            href: `/gadgets/catalog${tenantQuery}`,
          },
          {
            label: "Pro Drones & Gimbals",
            count: "4K 60fps",
            image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=120&q=80",
            href: `/gadgets/catalog${tenantQuery}`,
          },
          {
            label: "GaN Fast Chargers",
            count: "65W - 140W",
            image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=120&q=80",
            href: `/gadgets/catalog${tenantQuery}`,
          },
        ],
      },
    },
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
      <StoreHeader store={store} />

      {/* Hero & Category Collage Section */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow={store.tagline || "Official Flagship Technology"}
              headline={store.name}
              highlightText="· Pro Laptops & Smart Audio"
              description={store.description || "Authorized retailer for flagship technology with guaranteed manufacturer warranties, trade-in credit, and express doorstep delivery."}
              ctaLabel={canBookServices ? "Book Hardware Diagnostics" : "Explore Tech Catalog"}
              ctaHref={canBookServices ? `/gadgets/compare${tenantQuery}` : `/gadgets/catalog${tenantQuery}`}
              footnote="2-Year Hardware Warranty · Express Doorstep Dispatch"
              image={store.coverImage || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"}
              imageAlt={`${store.name} Flagship Technology`}
              badge={tenantSlug ? undefined : "Official Retail"}
              bgColor="#F4F7FA"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={gadgetProducts} />
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
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <ShieldCheck className="w-7 h-7 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">2-Year Warranty</h4>
              <p className="text-xs text-slate-500 mt-0.5">OEM guaranteed support</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <Truck className="w-7 h-7 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">Express Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5">Same-day regional dispatch</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <RotateCcw className="w-7 h-7 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">Instant Trade-In</h4>
              <p className="text-xs text-slate-500 mt-0.5">Trade older devices for credit</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <Cpu className="w-7 h-7 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">100% Genuine Tech</h4>
              <p className="text-xs text-slate-500 mt-0.5">Brand-sealed hardware</p>
            </div>
          </div>
        </section>

        {/* Featured Hardware Catalog */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-600">Flagship Hardware</span>
                {isLiveMerchantCatalog && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Catalog
                  </span>
                )}
              </div>
              <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mt-1">
                Featured Flagships & Workstations
              </h2>
            </div>
            <Link
              href={`/gadgets/catalog${tenantQuery}`}
              className="text-sm sm:text-base font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
            >
              <span>Explore All Devices</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gadgetProducts.map((gadget) => {
              const meta = gadget.gadgetMeta;
              return (
                <div
                  key={gadget.id}
                  className="group rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden flex items-center justify-center p-6">
                      <img
                        src={gadget.images[0]}
                        alt={gadget.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      {meta?.brand && (
                        <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-white shadow-xs">
                          {meta.brand}
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {gadget.category}
                      </span>
                      <h3 className="font-dropa text-xl sm:text-2xl font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {gadget.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed font-light">
                        {gadget.description}
                      </p>

                      {meta?.specs && (
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                          {Object.entries(meta.specs).slice(0, 4).map(([k, v]) => (
                            <div key={k} className="truncate">
                              <span className="text-slate-400 mr-1">{k}:</span>
                              <span>{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Official Price
                      </span>
                      <span className="font-dropa text-xl sm:text-2xl font-bold text-slate-900">
                        {store.currency}{gadget.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/checkout${tenantQuery}`}
                      className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-xs"
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

        {/* Spec Comparison & Diagnostic Repair Banner (Gated by Services Provisioning) */}
        {canBookServices && (
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
                href={`/gadgets/compare${tenantQuery}`}
                className="px-7 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Compare Specs & Book Repair</span>
              </Link>
            </div>
          </section>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
