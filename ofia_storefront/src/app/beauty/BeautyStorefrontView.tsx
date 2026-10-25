"use client";

import React from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import { useCollectionsBento } from "@/hooks/useCollectionsBento";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { useStorefrontProducts } from "@/hooks/useStorefrontProducts";
import {
  Calendar,
  Heart,
  ShieldCheck,
  Leaf,
  Clock,
  ArrowRight,
  ShoppingBag,
  UserCheck,
} from "lucide-react";

export default function BeautyStorefrontView() {
  const { store: dynamicStore, isFeatureEnabled, tenantSlug, handshake } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES.beauty;
  const config = handshake?.storefrontConfig;
  const { products: beautyProducts, isLiveMerchantCatalog } = useStorefrontProducts("beauty");
  const beautyServices = MOCK_SERVICES.filter((s) => s.vertical === "beauty");

  const canBookServices = isFeatureEnabled("services");
  const tenantQuery = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : "";

  const {
    isEnabled: isCollectionsEnabled,
    card1: bentoCard1,
    card2: bentoCard2,
    card3: bentoCard3,
  } = useCollectionsBento({
    config,
    products: beautyProducts,
    catalogPath: `/beauty/products${tenantQuery}`,
    itemUnit: "formulas",
    defaults: {
      card1: {
        title: "Serums &\nElixirs",
        count: "40+ formulas",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        href: `/beauty/products${tenantQuery}`,
        theme: "light",
      },
      card2: {
        title: "Facial\nRituals",
        count: "15+ services",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
        href: canBookServices ? `/beauty/services${tenantQuery}` : `/beauty/products${tenantQuery}`,
        theme: "light",
      },
      card3: {
        title: "Atelier Picks",
        href: `/beauty/products${tenantQuery}`,
        backgroundImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
        theme: "light",
        pills: [
          {
            label: "Hydration Creams",
            count: "Top rated",
            image: "https://images.unsplash.com/photo-1608248597359-5735b5a2bf61?auto=format&fit=crop&w=120&q=80",
            href: `/beauty/products${tenantQuery}`,
          },
          {
            label: "Pure Seed Oils",
            count: "Cold-pressed",
            image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=120&q=80",
            href: `/beauty/products${tenantQuery}`,
          },
          {
            label: "Exfoliants",
            count: "Gentle acids",
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=120&q=80",
            href: `/beauty/products${tenantQuery}`,
          },
        ],
      },
    },
  });

  return (
    <div className="min-h-screen bg-white text-[#201D1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      {/* Hero & Category Collage Section */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow={store.tagline || "Clinical Botanicals & Sanctuary Spa"}
              headline={store.name}
              highlightText="· Bioactive Botanicals & Rituals"
              description={store.description || "Nourish your skin barrier with bioactive botanicals, cold-pressed seed oils, and restorative facial rituals by certified aestheticians."}
              ctaLabel={canBookServices ? "Book Sanctuary Facial" : "Explore Skincare Line"}
              ctaHref={canBookServices ? `/beauty/book-appointment${tenantQuery}` : `/beauty/products${tenantQuery}`}
              footnote="100% Cruelty-Free & Dermatologist Certified · Zero Parabens"
              image={store.coverImage || "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1200&q=80"}
              imageAlt={`${store.name} Botanical Skincare`}
              badge={tenantSlug ? undefined : "Clean & Cruelty-Free"}
              bgColor="#FAF4F4"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={beautyProducts} />
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
          <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-3.5">
            <Leaf className="w-7 h-7 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">100% Bioactive</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Cold-pressed plant lipids</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-3.5">
            <ShieldCheck className="w-7 h-7 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Dermatologist Tested</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Hypoallergenic & safe</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-3.5">
            <Heart className="w-7 h-7 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Cruelty-Free</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Never tested on animals</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-3.5">
            <UserCheck className="w-7 h-7 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Certified Specialists</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Licensed aesthetic practitioners</p>
            </div>
          </div>
        </section>

        {/* Section 1: Retail Skincare Formulations */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-rose-600">Daily Barrier Ritual</span>
                {isLiveMerchantCatalog && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Catalog
                  </span>
                )}
              </div>
              <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                Clinical Skincare Formulations
              </h2>
            </div>
            <Link
              href={`/beauty/products${tenantQuery}`}
              className="text-sm sm:text-base font-bold text-rose-600 hover:text-rose-700 flex items-center gap-2 transition-colors"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beautyProducts.map((prod) => {
              const meta = prod.beautyMeta;
              return (
                <div
                  key={prod.id}
                  className="group rounded-3xl bg-white border border-rose-100/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square overflow-hidden bg-rose-50/40 flex items-center justify-center">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-200">
                          {meta?.routineStep || "Treat"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-2">
                      <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h3 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                        {prod.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-500 line-clamp-2 leading-relaxed font-light">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-rose-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                        Price
                      </span>
                      <span className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                        {store.currency}{prod.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/checkout${tenantQuery}`}
                      className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center gap-2 shadow-xs"
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

        {/* Section 2: Studio Aesthetic Services (Gated by Services Provisioning) */}
        {canBookServices && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-rose-600">In-Studio Treatments</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Aesthetic Salon & Spa Services
                </h2>
              </div>
              <Link
                href={`/beauty/services${tenantQuery}`}
                className="text-sm sm:text-base font-bold text-rose-600 hover:text-rose-700 flex items-center gap-2 transition-colors"
              >
                <span>View All Services</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {beautyServices.map((srv) => (
                <div
                  key={srv.id}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-rose-100/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-6"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700">
                        {srv.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-500">
                        <Clock className="w-4 h-4 text-rose-600" />
                        <span>{srv.durationMinutes} Minutes</span>
                      </div>
                    </div>

                    <h3 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900">
                      {srv.title}
                    </h3>

                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-light">
                      {srv.description}
                    </p>

                    {srv.specialistName && (
                      <div className="flex items-center gap-3.5 pt-2">
                        <img
                          src={srv.specialistAvatar}
                          alt={srv.specialistName}
                          className="w-12 h-12 rounded-full object-cover border border-rose-200"
                        />
                        <div>
                          <span className="text-sm font-bold text-zinc-900 block">
                            {srv.specialistName}
                          </span>
                          <span className="text-xs text-rose-700 block">
                            {srv.specialistRole}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                        Treatment Fee
                      </span>
                      <span className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900">
                        {store.currency}{srv.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/beauty/book-appointment?service=${srv.id}${tenantSlug ? `&tenant=${encodeURIComponent(tenantSlug)}` : ""}`}
                      className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-rose-600/20 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
