import Link from "next/link";
import { MOCK_STORES } from "@/data/mockStores";
import {
  Sparkles,
  ArrowRight,
  Car,
  UtensilsCrossed,
  Building2,
  Cpu,
  Heart,
  Armchair,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ofia Storefront · 7 Industry Verticals",
  description: "Enterprise multi-vertical commerce templates with tailored workflows for Fashion, Cars, Food, Property, Gadgets, Beauty, and Home & Living.",
};

export default function Home() {
  const verticals = [
    {
      slug: "fashion",
      name: "Fashion",
      icon: Sparkles,
      color: "bg-amber-500",
      accent: "text-amber-700 bg-amber-50 border-amber-200",
      tagline: "Contemporary Afro-Minimalist Silhouettes",
      heroAction: "Product catalog & bespoke fitting",
      keyScreens: [
        { label: "Product Catalog", path: "/fashion/catalog" },
        { label: "Size/Color Selector & Guide", path: "/fashion/product/fsh-001" },
        { label: "Bespoke Tailoring Request", path: "/fashion/custom-tailoring" },
      ],
      cover: MOCK_STORES.fashion.coverImage,
    },
    {
      slug: "cars",
      name: "Cars",
      icon: Car,
      color: "bg-blue-600",
      accent: "text-blue-700 bg-blue-50 border-blue-200",
      tagline: "Certified Luxury, Performance & Executive Fleet",
      heroAction: "Listings, 150-point audit & test-drives",
      keyScreens: [
        { label: "Vehicle Fleet Inventory", path: "/cars/listings" },
        { label: "Inspection Report & Inquiry", path: "/cars/listing/car-001" },
        { label: "Valet & Showroom Test-Drive", path: "/cars/book-test-drive/car-001" },
      ],
      cover: MOCK_STORES.cars.coverImage,
    },
    {
      slug: "food",
      name: "Food",
      icon: UtensilsCrossed,
      color: "bg-amber-600",
      accent: "text-amber-800 bg-amber-50 border-amber-200",
      tagline: "Gourmet Afro-Fusion & Wood-Fired Grills",
      heroAction: "Menu ordering & live prep tracking",
      keyScreens: [
        { label: "Dietary-Filterable Menu", path: "/food/menu" },
        { label: "Portion Sizes & Toppings", path: "/food/item/food-001" },
        { label: "Custom Cakes & Catering", path: "/food/custom-order" },
      ],
      cover: MOCK_STORES.food.coverImage,
    },
    {
      slug: "property",
      name: "Property",
      icon: Building2,
      color: "bg-blue-600",
      accent: "text-blue-800 bg-blue-50 border-blue-200",
      tagline: "Ultra-Luxury Waterfront Penthouses & Villas",
      heroAction: "Listings, floor plans & 4K tours",
      keyScreens: [
        { label: "Residences & Short-Lets", path: "/property/listings" },
        { label: "Amenities & Broker Inquiry", path: "/property/listing/prp-001" },
        { label: "Schedule 4K / In-Person Tour", path: "/property/schedule-viewing/prp-001" },
      ],
      cover: MOCK_STORES.property.coverImage,
    },
    {
      slug: "gadgets",
      name: "Gadgets",
      icon: Cpu,
      color: "bg-indigo-600",
      accent: "text-indigo-700 bg-indigo-50 border-indigo-200",
      tagline: "Next-Gen Silicon & Flagship Hardware",
      heroAction: "Tech catalog, specs & 2-year warranty",
      keyScreens: [
        { label: "Hardware Catalog", path: "/gadgets/catalog" },
        { label: "Storage Variants & Warranty", path: "/gadgets/product/gdt-001" },
        { label: "Compare Specs & Repair Clinic", path: "/gadgets/compare" },
      ],
      cover: MOCK_STORES.gadgets.coverImage,
    },
    {
      slug: "beauty",
      name: "Beauty",
      icon: Heart,
      color: "bg-rose-500",
      accent: "text-rose-700 bg-rose-50 border-rose-200",
      tagline: "Pure Botanicals & Aesthetic Sanctuary",
      heroAction: "Skincare routines & 4-step booking",
      keyScreens: [
        { label: "Barrier Skincare Catalog", path: "/beauty/products" },
        { label: "Spa & Salon Treatments", path: "/beauty/services" },
        { label: "4-Step Appointment Wizard", path: "/beauty/book-appointment" },
      ],
      cover: MOCK_STORES.beauty.coverImage,
    },
    {
      slug: "home-living",
      name: "Home & Living",
      icon: Armchair,
      color: "bg-stone-800",
      accent: "text-stone-800 bg-stone-100 border-stone-300",
      tagline: "Architectural Furniture & Living Essentials",
      heroAction: "Visual catalog & white-glove assembly",
      keyScreens: [
        { label: "Furniture Room Catalog", path: "/home-living/catalog" },
        { label: "Blueprint Dimensions & Finishes", path: "/home-living/product/hom-001" },
        { label: "White-Glove Assembly Calculator", path: "/home-living/delivery-options" },
      ],
      cover: MOCK_STORES["home-living"].coverImage,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#111318] flex flex-col justify-between">
      {/* Top Launchpad Bar */}
      <header className="w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 sticky top-10 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-stone-200 bg-white flex items-center justify-center shrink-0 p-1.5 group-hover:scale-105 transition-transform">
              <img src="/logo-icon.svg" alt="Ofia" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-dropa font-bold text-lg text-stone-900 tracking-tight leading-none">
                  Ofia Storefront
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  7 Verticals
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-normal">
                Multi-vertical industry templates & purposeful routing
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/templates"
              className="px-4 py-2 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-colors"
            >
              Templates Index
            </Link>
            <Link
              href="/checkout"
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Unified Checkout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Showcase */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-200/70 border border-stone-300 text-stone-800 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Architecture & Routing Ready</span>
          </div>

          <h1 className="font-dropa text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-900 leading-tight">
            One Core Engine. <br />
            <span className="text-blue-600 font-bold">7 Industry-Native</span> Experiences.
          </h1>

          <p className="text-sm sm:text-base text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
            Each storefront template features purposeful screens, domain metadata, specialized booking wizards, and customized checkouts matching the real-world operational needs of its industry.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/templates"
              className="px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-lg"
            >
              <span>Explore All Template Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 7 Verticals Visual Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Interactive Directory
              </span>
              <h2 className="font-dropa text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-0.5">
                Choose a Vertical to Experience
              </h2>
            </div>
            <Link
              href="/templates"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:underline"
            >
              View Full Specs →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verticals.map((vert) => {
              const IconComp = vert.icon;
              return (
                <div
                  key={vert.slug}
                  className="group rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Card Cover */}
                    <div className="relative aspect-16/10 overflow-hidden bg-stone-900">
                      <img
                        src={vert.cover}
                        alt={vert.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${vert.accent}`}>
                          {vert.name}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-dropa text-xl font-bold">{vert.name}</h3>
                        <p className="text-[11px] text-stone-300 line-clamp-1">{vert.tagline}</p>
                      </div>
                    </div>

                    {/* Dedicated Screen Routes */}
                    <div className="p-5 space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Included Tailored Screens:
                      </span>
                      <div className="space-y-1.5">
                        {vert.keyScreens.map((s, idx) => (
                          <Link
                            key={idx}
                            href={s.path}
                            className="p-2 rounded-xl bg-stone-50 hover:bg-blue-50/70 border border-stone-100 hover:border-blue-200 transition-colors flex items-center justify-between text-xs group/item"
                          >
                            <span className="font-medium text-stone-700 group-hover/item:text-blue-700">
                              {s.label}
                            </span>
                            <ExternalLink className="w-3 h-3 text-stone-400 group-hover/item:text-blue-600 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Launch Footer */}
                  <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500">
                      Site Title: <strong>{vert.name}</strong>
                    </span>

                    <Link
                      href={`/${vert.slug}`}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Open Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#111216] text-white py-10 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white p-1 flex items-center justify-center">
              <img src="/logo-icon.svg" alt="logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-dropa font-bold text-sm text-white">Ofia Storefront</span>
            <span>· 7 Industry Vertical Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/templates" className="hover:text-white transition-colors">
              Templates Directory
            </Link>
            <span>·</span>
            <Link href="/checkout" className="hover:text-white transition-colors">
              Checkout
            </Link>
            <span>·</span>
            <span>© 2026 Ofia Commerce</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
