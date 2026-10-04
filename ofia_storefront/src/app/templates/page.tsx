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
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates · Ofia Storefront 7 Industry Verticals",
  description: "Explore the 7 purpose-built storefront templates with tailored workflows and screens.",
};

export default function TemplatesDirectoryPage() {
  const templates = [
    {
      vertical: "fashion",
      title: "Fashion",
      slug: "fashion",
      tagline: "Contemporary Afro-Minimalist Silhouettes & Tailoring",
      description: "Apparel catalog with multi-axis size & color matrices, interactive chest/waist size guides, and bespoke made-to-measure tailoring booking.",
      icon: Sparkles,
      cover: MOCK_STORES.fashion.coverImage,
      badge: "Apparel & Luxury",
      screens: [
        { name: "Editorial Lookbook Home", href: "/fashion" },
        { name: "Product Collection Catalog", href: "/fashion/catalog" },
        { name: "Size & Color Selector with Size Guide", href: "/fashion/product/fsh-001" },
        { name: "Bespoke Made-to-Measure Fitting", href: "/fashion/custom-tailoring" },
      ],
      features: [
        "Interactive Size Guide Modal",
        "Color swatch previews",
        "Made-to-measure measurement request",
        "Cart & Express bag integration",
      ],
    },
    {
      vertical: "cars",
      title: "Cars",
      slug: "cars",
      tagline: "Certified Luxury, Performance & Executive Fleet",
      description: "Dealership showroom featuring verified 150-point pre-purchase vehicle audits, VIN checks, dealership inquiries, and VIP showroom/at-home valet test-drives.",
      icon: Car,
      cover: MOCK_STORES.cars.coverImage,
      badge: "Automotive Dealership",
      screens: [
        { name: "Showroom Fleet Home", href: "/cars" },
        { name: "Filterable Inventory & Listings", href: "/cars/listings" },
        { name: "Vehicle Specs & 150-Point Audit Report", href: "/cars/listing/car-001" },
        { name: "Showroom & At-Home Valet Test-Drive", href: "/cars/book-test-drive/car-001" },
      ],
      features: [
        "150-Point mechanical checklist",
        "At-home valet vs showroom selector",
        "Direct WhatsApp & phone broker dispatch",
        "Chassis VIN & customs verification",
      ],
    },
    {
      vertical: "food",
      title: "Food",
      slug: "food",
      tagline: "Gourmet Afro-Fusion, Artisan Pastries & Grills",
      description: "Bistro ordering with live kitchen preparation time tracking, customizable portion sizes, add-on toppings, cooking preferences, and custom event catering.",
      icon: UtensilsCrossed,
      cover: MOCK_STORES.food.coverImage,
      badge: "Hospitality & Bistro",
      screens: [
        { name: "Bistro Live Ticker Home", href: "/food" },
        { name: "Dietary-Filterable Menu", href: "/food/menu" },
        { name: "Portion Sizing & Add-On Toppings", href: "/food/item/food-001" },
        { name: "Custom Celebration Cake & Catering Request", href: "/food/custom-order" },
      ],
      features: [
        "Live 20-25 min kitchen prep ticker",
        "Portion tiers (Single / Regular / Platter)",
        "Add-on topping price modifiers",
        "Dietary tags (Halal, Vegan, Gluten-Free)",
      ],
    },
    {
      vertical: "property",
      title: "Property",
      slug: "property",
      tagline: "Ultra-Luxury Waterfront Penthouses & Villas",
      description: "Real estate showcase with bedroom/sqft filters, verified landlord title assurances, architectural floor plans, and interactive private in-person or live video tour booking.",
      icon: Building2,
      cover: MOCK_STORES.property.coverImage,
      badge: "Real Estate & Short-lets",
      screens: [
        { name: "Waterfront Portfolio Home", href: "/property" },
        { name: "Filterable Residences Catalog", href: "/property/listings" },
        { name: "Architectural Specs & Amenities Matrix", href: "/property/listing/prp-001" },
        { name: "In-Person & Live 4K Video Tour Booking", href: "/property/schedule-viewing/prp-001" },
      ],
      features: [
        "Floorplan & square-footage matrix",
        "In-person vs live 4K video walkthrough",
        "Verified landlord title guarantee",
        "Direct leasing broker inquiry form",
      ],
    },
    {
      vertical: "gadgets",
      title: "Gadgets",
      slug: "gadgets",
      tagline: "Flagship Silicon, Workstations & Noise-Canceling Audio",
      description: "High-tech consumer electronics with dynamic storage capacity modifiers, deep processor/battery specs tables, manufacturer warranty breakdowns, and repair diagnostics.",
      icon: Cpu,
      cover: MOCK_STORES.gadgets.coverImage,
      badge: "Consumer Electronics",
      screens: [
        { name: "Dark Silicon Storefront Home", href: "/gadgets" },
        { name: "Filterable Tech Hardware Catalog", href: "/gadgets/catalog" },
        { name: "Storage Tiers, Specs & Warranty Details", href: "/gadgets/product/gdt-001" },
        { name: "Side-by-Side Spec Matrix & Repair Diagnostics", href: "/gadgets/compare" },
      ],
      features: [
        "Dynamic storage price calculator",
        "Deep technical specs matrix",
        "Official 2-year warranty breakdown",
        "Hardware repair & diagnostic clinic",
      ],
    },
    {
      vertical: "beauty",
      title: "Beauty",
      slug: "beauty",
      tagline: "Botanical Chemistry & Aesthetic Spa Sanctuary",
      description: "Dual-mode wellness sanctuary integrating clinical barrier skincare products with an interactive 4-step appointment booking wizard for salon, hair, and dermatological spa sessions.",
      icon: Heart,
      cover: MOCK_STORES.beauty.coverImage,
      badge: "Wellness & Aesthetics",
      screens: [
        { name: "Sanctuary Dual-Mode Home", href: "/beauty" },
        { name: "Skincare Products with Skin-Routine Filters", href: "/beauty/products" },
        { name: "Studio Spa & Salon Treatment Menu", href: "/beauty/services" },
        { name: "4-Step Studio Appointment Booking Wizard", href: "/beauty/book-appointment" },
      ],
      features: [
        "Routine filters (Cleanse / Tone / Treat)",
        "Specialist doctor & practitioner profiles",
        "4-step slot booking calendar wizard",
        "Skin sensitivity & allergy notes",
      ],
    },
    {
      vertical: "home-living",
      title: "Home & Living",
      slug: "home-living",
      tagline: "Architectural Furniture & Tactile Living Essentials",
      description: "Visual furniture catalog categorized by lifestyle rooms, exact blueprint height/width/seat-depth specifications, sustainable ashwood materials, and white-glove assembly calculators.",
      icon: Armchair,
      cover: MOCK_STORES["home-living"].coverImage,
      badge: "Furniture & Decor",
      screens: [
        { name: "Architectural Studio Home", href: "/home-living" },
        { name: "Visual Furniture & Room Catalog", href: "/home-living/catalog" },
        { name: "Exact Dimensions Blueprint & Finishes", href: "/home-living/product/hom-001" },
        { name: "White-Glove Delivery Tiers & Assembly Calculator", href: "/home-living/delivery-options" },
      ],
      features: [
        "Exact blueprint dimensions (H × W × D)",
        "Curbside vs Room vs White-Glove tiers",
        "Interactive assembly & logistics estimator",
        "Tactile fabric & solid timber swatches",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#111318] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Ofia Storefront Architecture</span>
            </div>
            <h1 className="font-dropa text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
              7 Industry-Native Storefront Templates
            </h1>
            <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed">
              Every vertical on Ofia is engineered with dedicated screens, domain-specific metadata, customized checkouts, and booking workflows tailored to each industry.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-xs font-bold text-stone-800 transition-colors"
            >
              Back to Overview
            </Link>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="space-y-12">
          {templates.map((tpl, index) => {
            const IconComponent = tpl.icon;
            return (
              <div
                key={tpl.slug}
                id={tpl.slug}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Cover & Identity (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="relative aspect-16/10 rounded-2xl overflow-hidden shadow-xs bg-stone-900">
                      <img
                        src={tpl.cover}
                        alt={tpl.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center p-1.5 border border-white/20">
                            <img src="/logo-icon.svg" alt="logo" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider block">
                              {tpl.title}
                            </span>
                            <span className="text-[10px] text-stone-300">{tpl.badge}</span>
                          </div>
                        </div>

                        <Link
                          href={`/${tpl.slug}`}
                          className="px-3.5 py-1.5 rounded-full bg-white text-stone-900 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Launch</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="font-dropa text-2xl font-bold text-stone-900">
                        {index + 1}. {tpl.title} Template
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                        {tpl.description}
                      </p>
                    </div>

                    {/* Feature Badges */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {tpl.features.map((feat, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200/60"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Tailored Screens List (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
                      Dedicated Template Screens & Deep Links
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tpl.screens.map((screen, sIdx) => (
                        <Link
                          key={sIdx}
                          href={screen.href}
                          className="p-4 rounded-2xl bg-stone-50 hover:bg-white border border-stone-200/80 hover:border-blue-600 hover:shadow-md transition-all group flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 group-hover:bg-blue-600 group-hover:text-white text-[11px] font-bold flex items-center justify-center transition-colors">
                              {sIdx + 1}
                            </span>
                            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          </div>

                          <h3 className="font-dropa text-sm font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                            {screen.name}
                          </h3>
                          <span className="text-[11px] font-mono text-stone-500 mt-1 truncate">
                            {screen.href}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Responsive across mobile, tablet, and ultra-wide screens</span>
                      </span>

                      <Link
                        href={`/${tpl.slug}`}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        Enter {tpl.title} Storefront →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
