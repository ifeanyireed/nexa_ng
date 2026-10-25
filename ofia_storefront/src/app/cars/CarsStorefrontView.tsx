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
import StorefrontValueBadges from "@/components/common/StorefrontValueBadges";
import StorefrontFeatureBanner from "@/components/common/StorefrontFeatureBanner";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";
import { useStorefrontProducts } from "@/hooks/useStorefrontProducts";
import {
  Car,
  ShieldCheck,
  Gauge,
  Fuel,
  Settings2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Search,
} from "lucide-react";

export default function CarsStorefrontView() {
  const { store: dynamicStore, isFeatureEnabled, tenantSlug, handshake } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES.cars;
  const config = handshake?.storefrontConfig;

  const { products: carProducts, isLiveMerchantCatalog } = useStorefrontProducts("cars");
  const inspectionService = MOCK_SERVICES.find((s) => s.vertical === "cars");

  const canBookServices = isFeatureEnabled("services");

  const {
    isEnabled: isCollectionsEnabled,
    card1: bentoCard1,
    card2: bentoCard2,
    card3: bentoCard3,
  } = useCollectionsBento({
    config,
    products: carProducts,
    catalogPath: "/cars/listings",
    itemUnit: "vehicles",
    defaults: {
      card1: {
        title: "Executive\nSedans",
        count: "45+ vehicles",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
        href: "/cars/listings",
        theme: "dark",
      },
      card2: {
        title: "Performance\nSUVs",
        count: "70+ vehicles",
        image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
        href: "/cars/listings",
        theme: "light",
      },
      card3: {
        title: "Top Collation",
        href: "/cars/listings",
        backgroundImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
        theme: "dark",
        pills: [
          {
            label: "AMG & Maybach",
            count: "28 units",
            image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=120&q=80",
            href: "/cars/listings",
          },
          {
            label: "Range Rover & Defender",
            count: "34 units",
            image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80",
            href: "/cars/listings",
          },
          {
            label: "Porsche & Exotic",
            count: "15 units",
            image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=120&q=80",
            href: "/cars/listings",
          },
        ],
      },
    },
  });

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col justify-between">
      <StoreHeader store={store} />

      {/* Hero & Category Collage Section */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow={config?.hero?.eyebrow || store.tagline || "Certified Executive Fleet"}
              headline={config?.hero?.headline || store.name}
              highlightText={config?.hero?.highlightText !== undefined ? config.hero.highlightText : "· Direct German Imports & Pre-Owned"}
              description={config?.hero?.description || store.description || "Curated luxury and executive fleet. Every vehicle undergoes a 150-point diagnostic audit with verified clean customs title and at-home valet test-drives."}
              ctaLabel={config?.hero?.ctaLabel || (canBookServices ? "Book Valet Test-Drive" : "Explore Fleet Catalog")}
              ctaHref={config?.hero?.ctaHref || (canBookServices ? "/cars/book-test-drive/car-001" : "/cars/listings")}
              footnote={config?.hero?.footnote || "150-Point Valet Audit Verified · Clean Customs Clearance"}
              image={config?.hero?.image || store.coverImage || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"}
              imageAlt={`${store.name} Certified Luxury Fleet`}
              badge={config?.hero?.badge || (tenantSlug ? undefined : "150-Pt Inspected")}
              bgColor={config?.hero?.bgColor || "#F4F6F9"}
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={carProducts} />
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

      {/* Main Catalog & Inventory Feed */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16 pt-8">
        {/* Value Badges */}
        <StorefrontValueBadges
          customBadges={config?.valueBadges}
          isVisible={config?.sectionVisibility?.valueBadges !== false}
          accentColor="text-blue-600"
          defaultBadges={[
            {
              title: "150-Point Audit",
              description: "Every mechanical fault logged",
              icon: <ShieldCheck className="w-7 h-7 text-blue-600 shrink-0" />,
            },
            {
              title: "Clean Customs Title",
              description: "Verified VIN & import duty",
              icon: <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />,
            },
            {
              title: "Valet Test-Drive",
              description: "Delivered to your residence",
              icon: <Car className="w-7 h-7 text-indigo-600 shrink-0" />,
            },
            {
              title: "Warranty Support",
              description: "12-Month engine & gearbox",
              icon: <Settings2 className="w-7 h-7 text-amber-600 shrink-0" />,
            },
          ]}
        />

        {/* Featured Fleet Vehicles */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {config?.featuredSection?.eyebrow || `${store.name} Showroom`}
                </span>
                {isLiveMerchantCatalog && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Catalog
                  </span>
                )}
              </div>
              <h2 className="font-dropa text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                {config?.featuredSection?.title || "Verified Available Fleet"}
              </h2>
            </div>
            <Link
              href={config?.featuredSection?.viewAllHref || "/cars/listings"}
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>{config?.featuredSection?.viewAllLabel || `Explore All ${carProducts.length} Vehicles`}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {carProducts.map((car) => {
              const meta = car.carMeta;
              return (
                <div
                  key={car.id}
                  className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Vehicle Image */}
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                      <img
                        src={car.images[0]}
                        alt={car.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-sm">
                          {meta?.year}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
                          {meta?.condition}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="px-6 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {meta?.make} · {meta?.model}
                        </span>
                        <h3 className="font-dropa text-xl sm:text-2xl font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {car.title}
                        </h3>
                      </div>

                      {/* Spec Pills */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-xs sm:text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Gauge className="w-4 h-4 text-slate-400" />
                          <span>{meta?.mileage || "Low Miles"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Settings2 className="w-4 h-4 text-slate-400" />
                          <span>{meta?.transmission || "Auto"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Fuel className="w-4 h-4 text-slate-400" />
                          <span>{meta?.fuelType || "Petrol"}</span>
                        </div>
                      </div>

                      {/* Key Highlights */}
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                        {car.highlights.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                        Outright Price
                      </span>
                      <span className="font-dropa text-xl sm:text-2xl font-bold text-slate-900">
                        {store.currency}{car.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/cars/listing/${car.id}`}
                      className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-xs"
                    >
                      <Car className="w-4 h-4" />
                      <span>{canBookServices ? "Details & Test-Drive" : "View Specs"}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mechanical Inspection Service Spotlight (Feature-Gated or Custom Config) */}
        {((config?.featureBanner?.enabled ?? (Boolean(inspectionService) && canBookServices))) && (
          <StorefrontFeatureBanner
            customBanner={config?.featureBanner}
            isVisible={config?.sectionVisibility?.featureBanner !== false}
            defaultEyebrow="Pre-Purchase Vehicle Diagnostics"
            defaultHeadline={inspectionService?.title || "150-Point Diagnostic Inspection"}
            defaultDescription={inspectionService?.description || "Book a comprehensive multi-point mechanical inspection with our certified diagnostic technicians before purchase."}
            defaultCtaLabel="Book Inspection Slot"
            defaultCtaHref={`/cars/book-test-drive/${carProducts[0]?.id || "car-001"}`}
            defaultImage="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
            bgClassName="bg-slate-900 text-white border-slate-800"
            accentTextClassName="text-blue-400"
            ctaIcon={<Calendar className="w-5 h-5" />}
          />
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
