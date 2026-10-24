"use client";

import React from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
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
  const { store: dynamicStore, isFeatureEnabled, tenantSlug } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES.cars;

  const { products: carProducts, isLiveMerchantCatalog } = useStorefrontProducts("cars");
  const inspectionService = MOCK_SERVICES.find((s) => s.vertical === "cars");

  const canBookServices = isFeatureEnabled("services");

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col justify-between">
      <StoreHeader store={store} />

      {/* Hero & Category Collage Section */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow={store.tagline || "Certified Executive Fleet"}
              headline={store.name}
              highlightText="· Direct German Imports & Pre-Owned"
              description={store.description || "Curated luxury and executive fleet. Every vehicle undergoes a 150-point diagnostic audit with verified clean customs title and at-home valet test-drives."}
              ctaLabel={canBookServices ? "Book Valet Test-Drive" : "Explore Fleet Catalog"}
              ctaHref={canBookServices ? "/cars/book-test-drive/car-001" : "/cars/listings"}
              footnote="150-Point Valet Audit Verified · Clean Customs Clearance"
              image={store.coverImage || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"}
              imageAlt={`${store.name} Certified Luxury Fleet`}
              badge={tenantSlug ? undefined : "150-Pt Inspected"}
              bgColor="#F4F6F9"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={carProducts} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Executive\nSedans",
              count: "45+ vehicles",
              image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
              href: "/cars/listings",
              theme: "dark",
            }}
            card2={{
              title: "Performance\nSUVs",
              count: "70+ vehicles",
              image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
              href: "/cars/listings",
              theme: "light",
            }}
            card3={{
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
            }}
          />
        </div>
      </section>

      {/* Main Catalog & Inventory Feed */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16 pt-8">
        {/* Value Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <ShieldCheck className="w-7 h-7 text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">150-Point Audit</h4>
              <p className="text-xs text-slate-500">Every mechanical fault logged</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">Clean Customs Title</h4>
              <p className="text-xs text-slate-500">Verified VIN & import duty</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <Car className="w-7 h-7 text-indigo-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">Valet Test-Drive</h4>
              <p className="text-xs text-slate-500">Delivered to your residence</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <Settings2 className="w-7 h-7 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-900">Warranty Support</h4>
              <p className="text-xs text-slate-500">12-Month engine & gearbox</p>
            </div>
          </div>
        </section>

        {/* Featured Fleet Vehicles */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {store.name} Showroom
                </span>
                {isLiveMerchantCatalog && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Catalog
                  </span>
                )}
              </div>
              <h2 className="font-dropa text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                Verified Available Fleet
              </h2>
            </div>
            <Link
              href="/cars/listings"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Explore All {carProducts.length} Vehicles</span>
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

        {/* Mechanical Inspection Service Spotlight (Feature-Gated) */}
        {inspectionService && canBookServices && (
          <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Pre-Purchase Vehicle Diagnostics</span>
              </div>
              <h3 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                {inspectionService.title}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {inspectionService.description}
              </p>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 pt-1">
                <span>Duration: {inspectionService.durationMinutes} Mins</span>
                <span>•</span>
                <span>Lead: {inspectionService.specialistName}</span>
                <span>•</span>
                <span className="font-bold text-white">{store.currency}{inspectionService.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto shrink-0">
              <a
                href={`tel:${store.contact.phone}`}
                className="px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 border border-slate-700 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>Call Diagnostics Desk</span>
              </a>
              <Link
                href={`/cars/book-test-drive/${carProducts[0]?.id || "car-001"}`}
                className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Inspection Slot</span>
              </Link>
            </div>
          </section>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
