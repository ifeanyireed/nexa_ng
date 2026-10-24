"use client";

import React from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { useStorefrontProducts } from "@/hooks/useStorefrontProducts";
import {
  Building2,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  KeyRound,
} from "lucide-react";

export default function PropertyStorefrontView() {
  const { store: dynamicStore, isFeatureEnabled, tenantSlug } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES.property;
  const { products: properties, isLiveMerchantCatalog } = useStorefrontProducts("property");

  const canBookServices = isFeatureEnabled("services");
  const tenantQuery = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : "";

  return (
    <div className="min-h-screen bg-white text-[#111318] flex flex-col justify-between">
      <StoreHeader store={store} />

      {/* Hero & Category Collage Section */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow={store.tagline || "Waterfront Architecture & Residences"}
              headline={store.name}
              highlightText="· Serviced Luxury Villas & Short-Lets"
              description={store.description || "Curated luxury penthouses, private villas, and high-yield residences across prime corridors with verified land titles and 24/7 concierge service."}
              ctaLabel={canBookServices ? "Schedule Private Viewing" : "Explore Property Listings"}
              ctaHref={canBookServices ? `/property/schedule-viewing/${properties[0]?.id || "prp-001"}${tenantQuery}` : `/property/listings${tenantQuery}`}
              footnote="Verified Governor's Consent / C-of-O · 24/7 Shoreline Power"
              image={store.coverImage || "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686504/ofia_ng_assets/wuuq3envwns5v2hbkjr3.jpg"}
              imageAlt={`${store.name} Prime Portfolio`}
              badge={tenantSlug ? undefined : "Verified Title"}
              bgColor="#F4F8FC"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={properties} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Waterfront\nPenthouses",
              count: "12 units available",
              image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
              href: `/property/listings${tenantQuery}`,
              theme: "dark",
            }}
            card2={{
              title: "Contemporary\nVillas",
              count: "8 exclusive estates",
              image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
              href: `/property/listings${tenantQuery}`,
              theme: "dark",
            }}
            card3={{
              title: "Commercial & Land",
              href: `/property/listings${tenantQuery}`,
              backgroundImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
              theme: "dark",
              pills: [
                {
                  label: "Serviced Short-Lets",
                  count: "Daily rates",
                  image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=120&q=80",
                  href: `/property/listings${tenantQuery}`,
                },
                {
                  label: "Grade-A Offices",
                  count: "Corporate floors",
                  image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=120&q=80",
                  href: `/property/listings${tenantQuery}`,
                },
                {
                  label: "Gated Land Parcels",
                  count: "Governor's consent",
                  image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=120&q=80",
                  href: `/property/listings${tenantQuery}`,
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
            <ShieldCheck className="w-7 h-7 text-sky-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Perfection of Title</h4>
              <p className="text-xs text-stone-500 mt-0.5">Governor's Consent & C-of-O</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <KeyRound className="w-7 h-7 text-sky-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Ready for Handover</h4>
              <p className="text-xs text-stone-500 mt-0.5">Immediate keys & residency</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <Building2 className="w-7 h-7 text-sky-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">24/7 Power & Security</h4>
              <p className="text-xs text-stone-500 mt-0.5">Uninterrupted shoreline utilities</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <CheckCircle2 className="w-7 h-7 text-sky-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">High-Yield ROI</h4>
              <p className="text-xs text-stone-500 mt-0.5">14–18% short-let rental return</p>
            </div>
          </div>
        </section>

        {/* Property Portfolio Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-sky-700">Curated Portfolio</span>
                {isLiveMerchantCatalog && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Catalog
                  </span>
                )}
              </div>
              <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                Featured Available Residences
              </h2>
            </div>
            <Link
              href={`/property/listings${tenantQuery}`}
              className="text-sm sm:text-base font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1.5 group"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => {
              const meta = p.propertyMeta;
              return (
                <div
                  key={p.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {meta?.location && (
                        <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-white flex items-center gap-1 backdrop-blur-xs">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          <span>{meta.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                        {p.category}
                      </span>
                      <h3 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900 line-clamp-1 group-hover:text-sky-700 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed font-light">
                        {p.description}
                      </p>

                      {meta && (
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-100 text-xs text-stone-600 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4 text-sky-600" />
                            <span>{meta.bedrooms} Beds</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4 text-sky-600" />
                            <span>{meta.bathrooms} Baths</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize2 className="w-4 h-4 text-sky-600" />
                            <span>{meta.squareFeet} sqft</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-stone-400 uppercase tracking-wider block">
                        Listing Price
                      </span>
                      <span className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                        {store.currency}{p.price.toLocaleString()}
                      </span>
                    </div>

                    {canBookServices ? (
                      <Link
                        href={`/property/schedule-viewing/${p.id}${tenantQuery}`}
                        className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-sky-700 hover:bg-sky-600 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Book Viewing</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/checkout${tenantQuery}`}
                        className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-zinc-900 hover:bg-sky-700 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Reserve Unit</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
