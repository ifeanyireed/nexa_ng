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
  Upload,
  ShieldCheck,
  Pill,
  Stethoscope,
  ThermometerSnowflake,
  Clock,
  ArrowRight,
  HeartPulse,
  FileText,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

export default function PharmacyStorefrontView() {
  const { store: dynamicStore, isFeatureEnabled, tenantSlug } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES["pharmacy"];
  const { products, isLiveMerchantCatalog } = useStorefrontProducts("pharmacy");

  const canBookServices = isFeatureEnabled("services");
  const tenantQuery = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : "";

  return (
    <div className="min-h-screen bg-white text-[#13221C] flex flex-col justify-between">
      {/* Regulated Dispensary Alert Strip */}
      <div className="bg-[#0C4A3E] text-emerald-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-emerald-900">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Licensed Clinical Pharmacist on Duty · Immediate NAFDAC Verified Prescription Dispensing</span>
      </div>

      <StoreHeader store={store} />

      {/* Hero & Category Collage Section */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow={store.tagline || "Licensed NAFDAC Clinical Dispensary"}
              headline={store.name.split(" ")[0] ? `${store.name.split(" ")[0]}\nDispensary` : "Rapid Rx\nRefills"}
              highlightText="· Cold-Chain Care & Tele-Pharmacy"
              description={store.description || "Verified pharmaceutical dispensing, temperature-controlled cold-chain logistics, and confidential clinical consultation with licensed resident pharmacists."}
              ctaLabel={canBookServices ? "Upload Doctor's Rx / Consult" : "Explore Medical Catalog"}
              ctaHref={canBookServices ? `/pharmacy/prescription${tenantQuery}` : `/pharmacy/catalog${tenantQuery}`}
              footnote="Licensed Clinical Pharmacists · 100% Verified Batch Numbers"
              image={store.coverImage || "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80"}
              imageAlt={`${store.name} Dispensary Care`}
              badge={tenantSlug ? "Verified Dispensary" : "NAFDAC Regulated"}
              bgColor="#F3F9F6"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={products} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Prescription\nMedications",
              count: "140+ verified items",
              image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
              href: `/pharmacy/catalog${tenantQuery}`,
              theme: "light",
            }}
            card2={{
              title: "Immunity &\nVitamins",
              count: "85+ essentials",
              image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
              href: `/pharmacy/catalog${tenantQuery}`,
              theme: "light",
            }}
            card3={{
              title: "Diagnostics & Care",
              href: `/pharmacy/catalog${tenantQuery}`,
              backgroundImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
              theme: "light",
              pills: [
                {
                  label: "Cardiac & BP",
                  count: "Clinical grade",
                  image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=120&q=80",
                  href: `/pharmacy/catalog${tenantQuery}`,
                },
                {
                  label: "Blood Glucose Kits",
                  count: "With test strips",
                  image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=120&q=80",
                  href: `/pharmacy/catalog${tenantQuery}`,
                },
                {
                  label: "First Aid Supplies",
                  count: "Antiseptic packs",
                  image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=120&q=80",
                  href: `/pharmacy/catalog${tenantQuery}`,
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
            <ShieldCheck className="w-7 h-7 text-teal-700 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">NAFDAC Certified</h4>
              <p className="text-xs text-stone-500 mt-0.5">100% genuine batch tracked</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <ThermometerSnowflake className="w-7 h-7 text-teal-700 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Cold-Chain Transit</h4>
              <p className="text-xs text-stone-500 mt-0.5">Vaccines & insulin safeguarded</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <Stethoscope className="w-7 h-7 text-teal-700 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Resident Pharmacist</h4>
              <p className="text-xs text-stone-500 mt-0.5">Consultation & dosage advice</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <Clock className="w-7 h-7 text-teal-700 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Emergency Dispatch</h4>
              <p className="text-xs text-stone-500 mt-0.5">Rapid 45-min courier delivery</p>
            </div>
          </div>
        </section>

        {/* Featured Medications Catalog */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-teal-700">Verified Dispensary</span>
                {isLiveMerchantCatalog && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Catalog
                  </span>
                )}
              </div>
              <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                Featured Medications & OTC Care
              </h2>
            </div>
            <Link
              href={`/pharmacy/catalog${tenantQuery}`}
              className="text-sm sm:text-base font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 group"
            >
              <span>Search All Medications</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => {
              const meta = prod.pharmacyMeta;
              return (
                <div
                  key={prod.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-teal-50/40 flex items-center justify-center overflow-hidden">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                        {meta?.prescriptionRequired ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                            Prescription (Rx)
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            OTC
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-teal-900 border border-teal-200">
                          {meta?.dosageForm}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                          {prod.category} · {meta?.dosageForm}
                        </span>
                        <h3 className="font-bold text-lg sm:text-xl text-zinc-900 line-clamp-1 group-hover:text-teal-700 transition-colors mt-0.5">
                          {prod.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 mt-1 font-light leading-relaxed">
                          {prod.description}
                        </p>
                      </div>

                      {meta?.activeIngredients && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {meta.activeIngredients.map((act) => (
                            <span
                              key={act}
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-100"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                        Pack Size: {meta?.packSize}
                      </span>
                      <span className="text-lg font-bold text-zinc-900">
                        ₦{prod.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/checkout${tenantQuery}`}
                      className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-teal-700 hover:bg-teal-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
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

        {/* Clinical Consultation & Prescription Upload Feature Banner (Gated by Services Provisioning) */}
        {canBookServices && (
          <section className="rounded-3xl bg-teal-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-teal-900">
            <div className="max-w-xl space-y-4 z-10">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-teal-300 uppercase">
                Clinical Pharmacist Consultation & Script Desk
              </span>
              <h3 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Confidential Regimen Review & Cold-Chain Dispensing
              </h3>
              <p className="text-teal-100/90 text-sm sm:text-base font-light leading-relaxed">
                Upload your doctor&apos;s prescription for instant clinical verification, check drug-drug interactions, or schedule recurring chronic maintenance refills with temperature-guaranteed courier transit.
              </p>
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href={`/pharmacy/prescription${tenantQuery}`}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-teal-500 hover:bg-teal-400 text-teal-950 font-extrabold text-sm sm:text-base transition-all shadow-md"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Doctor&apos;s Script</span>
                </Link>
                <Link
                  href={`/pharmacy/consultation${tenantQuery}`}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors"
                >
                  <Stethoscope className="w-5 h-5 text-teal-300" />
                  <span>Book Consultation</span>
                </Link>
              </div>
            </div>

            <div className="relative w-full md:w-80 aspect-square rounded-2xl overflow-hidden border border-teal-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80"
                alt="Clinical Dispensary"
                className="w-full h-full object-cover"
              />
            </div>
          </section>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
