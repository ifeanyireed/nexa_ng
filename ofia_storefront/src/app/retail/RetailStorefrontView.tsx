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
  BookOpen,
  Dumbbell,
  Baby,
  Gift,
  Award,
  ArrowRight,
  PenTool,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

export default function RetailStorefrontView() {
  const { store: dynamicStore, isFeatureEnabled, tenantSlug } = useStorefrontTenant();
  const store = dynamicStore || MOCK_STORES["retail"];
  const { products, isLiveMerchantCatalog } = useStorefrontProducts("retail");

  const canBookServices = isFeatureEnabled("services");
  const tenantQuery = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : "";

  const departments = [
    { name: "Books & Literature", count: "1,200+ Titles", icon: BookOpen, href: `/retail/catalog${tenantQuery}` },
    { name: "Sports & Home Gym", count: "340+ Units", icon: Dumbbell, href: `/retail/catalog${tenantQuery}` },
    { name: "Baby Gear & Sensory Toys", count: "210+ Items", icon: Baby, href: `/retail/catalog${tenantQuery}` },
    { name: "Curated Artisan Gifts", count: "180+ Keepsakes", icon: Gift, href: `/retail/catalog${tenantQuery}` },
  ];

  return (
    <div className="min-h-screen bg-white text-[#222129] flex flex-col justify-between">
      {/* Luxury Packaging Banner Strip */}
      <div className="bg-[#1C1826] text-amber-200 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-indigo-950">
        <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
        <span>Complimentary Artisan Wax-Sealed Gift Wrapping & Custom Brass Engraving on Curated Orders</span>
      </div>

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
              eyebrow={store.tagline || "Curated Multi-Department Emporium"}
              headline={store.name.split(" ")[0] ? `${store.name.split(" ")[0]}\nKeepsakes` : "Literature &\nKeepsakes"}
              highlightText="· Custom Engraved Gifts"
              description={store.description || "Discover rare literature anthologies, high-performance athletic gear, certified heirloom toys, and artisan gifts customized with personal monograms."}
              ctaLabel="Explore All Departments"
              ctaHref={`/retail/catalog${tenantQuery}`}
              footnote="Complimentary Gift Wrapping · Custom Laser Engraving"
              image={store.coverImage || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80"}
              imageAlt={`${store.name} Curated Emporium`}
              badge={tenantSlug ? "Curated Emporium" : "Artisan Emporium"}
              bgColor="#F7F5FA"
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
              title: "Literature &\nRare Editions",
              count: "400+ titles",
              image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80",
              href: `/retail/catalog${tenantQuery}`,
              theme: "dark",
            }}
            card2={{
              title: "Specialty\nKeepsakes",
              count: "220+ items",
              image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
              href: canBookServices ? `/retail/customization${tenantQuery}` : `/retail/catalog${tenantQuery}`,
              theme: "light",
            }}
            card3={{
              title: "Top Collation",
              href: `/retail/catalog${tenantQuery}`,
              backgroundImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
              theme: "light",
              pills: [
                {
                  label: "Artisan Stationery",
                  count: "180+ items",
                  image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=120&q=80",
                  href: `/retail/catalog${tenantQuery}`,
                },
                {
                  label: "Heirloom Toys",
                  count: "95+ crafts",
                  image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=120&q=80",
                  href: `/retail/catalog${tenantQuery}`,
                },
                {
                  label: "Fitness & Travel Gear",
                  count: "130+ products",
                  image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=120&q=80",
                  href: `/retail/catalog${tenantQuery}`,
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
            <PenTool className="w-7 h-7 text-purple-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Laser Engraving</h4>
              <p className="text-xs text-stone-500 mt-0.5">Complimentary brass & leather</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <Gift className="w-7 h-7 text-purple-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Mulberry Wrap</h4>
              <p className="text-xs text-stone-500 mt-0.5">Hand-poured wax seal</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <BookOpen className="w-7 h-7 text-purple-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Curated Anthologies</h4>
              <p className="text-xs text-stone-500 mt-0.5">Rare editions & collector titles</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <PackageCheck className="w-7 h-7 text-purple-600 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900">Milestone Registries</h4>
              <p className="text-xs text-stone-500 mt-0.5">Wedding, baby & bespoke lists</p>
            </div>
          </div>
        </section>

        {/* Department Hubs */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-purple-700">Specialty Departments</span>
              <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                Shop by Specialty Department
              </h2>
            </div>
            <Link
              href={`/retail/catalog${tenantQuery}`}
              className="text-sm sm:text-base font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1.5 group"
            >
              <span>View Entire Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <Link
                  key={dept.name}
                  href={dept.href}
                  className="bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-900 group-hover:text-purple-800 transition-colors">
                    {dept.name}
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">{dept.count}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Goods */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-purple-700">Curated Goods</span>
                {isLiveMerchantCatalog && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Catalog
                  </span>
                )}
              </div>
              <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                Featured Multi-Department Items
              </h2>
            </div>
            <Link
              href={`/retail/catalog${tenantQuery}`}
              className="text-sm sm:text-base font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1.5 group"
            >
              <span>Browse Full Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => {
              const meta = prod.retailMeta;
              return (
                <div
                  key={prod.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-purple-50/30 flex items-center justify-center overflow-hidden">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-900 text-white">
                          {meta?.department}
                        </span>
                        {meta?.giftWrapAvailable && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Gift Wrapped
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
                          {meta?.authorOrBrand || prod.category}
                        </span>
                        <h3 className="font-bold text-lg sm:text-xl text-zinc-900 line-clamp-1 group-hover:text-purple-700 transition-colors mt-0.5">
                          {prod.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 mt-1 font-light leading-relaxed">
                          {prod.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {meta?.isbnOrSku && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-stone-500 bg-stone-100">
                            {meta.isbnOrSku}
                          </span>
                        )}
                        {meta?.customEngravingAvailable && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-purple-900 bg-purple-50 border border-purple-200">
                            Engraving Free
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-medium text-stone-400 block">
                        Specialty Price
                      </span>
                      <span className="text-lg font-bold text-zinc-900">
                        ₦{prod.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/checkout${tenantQuery}`}
                        className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-purple-900 hover:bg-purple-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Order</span>
                      </Link>
                      <Link
                        href={`/retail/product/${prod.id}${tenantQuery}`}
                        className="px-3.5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-stone-100 hover:bg-stone-200 text-zinc-800 transition-colors flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Artisan Gift Presentation & Custom Engraving Feature Banner (Gated by Services Provisioning) */}
        {canBookServices && (
          <section className="rounded-3xl bg-[#1C1826] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-purple-900/40">
            <div className="max-w-xl space-y-4 z-10">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-amber-300 uppercase">
                Artisan Gift Atelier & Custom Engraving Studio
              </span>
              <h3 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Custom Laser Engraving & Mulberry Wax-Sealed Packaging
              </h3>
              <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed">
                Turn books, fitness gear, and keepsakes into unforgettable heirloom gifts. Includes personalized handwritten calligraphy note, botanical sprig, and deep wax seal.
              </p>
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href={`/retail/customization${tenantQuery}`}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm sm:text-base transition-all shadow-md"
                >
                  <PenTool className="w-5 h-5" />
                  <span>Build Registry / Engrave</span>
                </Link>
                <Link
                  href={`/retail/catalog${tenantQuery}`}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 text-amber-300" />
                  <span>Browse Specialty Goods</span>
                </Link>
              </div>
            </div>

            <div className="relative w-full md:w-80 aspect-square rounded-2xl overflow-hidden border border-purple-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
                alt="Artisan Books and Keepsakes"
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
