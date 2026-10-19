import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
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
  Eye,
  KeyRound,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property",
  description: "Ultra-luxury waterfront penthouses, serviced residences & executive villas.",
};

export default function PropertyStorefrontPage() {
  const store = MOCK_STORES.property;
  const properties = MOCK_PRODUCTS.filter((p) => p.vertical === "property");

  return (
    <div className="min-h-screen bg-[#ECEEF2] text-[#111318] flex flex-col justify-between">
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
              eyebrow="Waterfront Architecture"
              headline={"Waterfront\nPenthouses"}
              highlightText="· Serviced Luxury Villas"
              description="Curated luxury penthouses, private villas, and high-yield residences across Lagos, Dubai, and New York with verified land titles and 24/7 concierge service."
              ctaLabel="Schedule Private Viewing"
              ctaHref={`/property/schedule-viewing/${properties[0]?.id || "prp-001"}`}
              footnote="Verified Governor's Consent / C-of-O · 24/7 Shoreline Power"
              image="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686504/ofia_ng_assets/wuuq3envwns5v2hbkjr3.jpg"
              imageAlt="Veloura Prime Waterfront Residences"
              badge="Verified Title"
              bgColor="#F4F8FC"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={properties} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid (Card 1: 25%, Card 2: 25%, Card 3: 50%) */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Waterfront\nPenthouses",
              count: "18 residences",
              image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
              href: "/property/listings",
            }}
            card2={{
              title: "Private Serviced\nVillas",
              count: "24 estates",
              image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
              href: "/property/listings",
            }}
            card3={{
              title: "Top Collation",
              href: "/property/listings",
              backgroundImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
              pills: [
                {
                  label: "Eko Atlantic Towers",
                  count: "12 suites",
                  image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80",
                  href: "/property/listings",
                },
                {
                  label: "Ikoyi Old Suburb",
                  count: "16 villas",
                  image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=120&q=80",
                  href: "/property/listings",
                },
                {
                  label: "Banana Island",
                  count: "9 estates",
                  image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=120&q=80",
                  href: "/property/listings",
                },
              ],
            }}
          />
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
          {/* Value Badges */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <ShieldCheck className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Verified Landlord Title</h4>
                <p className="text-xs text-slate-500 mt-0.5">Zero legal encumbrances</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <KeyRound className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">24/7 Redundant Power</h4>
                <p className="text-xs text-slate-500 mt-0.5">100% uninterrupted grid</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <Eye className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Virtual 4K Tours</h4>
                <p className="text-xs text-slate-500 mt-0.5">Live walk-throughs anytime</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <Building2 className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Private Concierge</h4>
                <p className="text-xs text-slate-500 mt-0.5">Valet & facility manager</p>
              </div>
            </div>
          </section>

          {/* Featured Properties Grid */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-600">Featured Residences</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mt-1">
                  Prime Listings & Short-Lets
                </h2>
              </div>
              <Link
                href="/property/listings"
                className="text-sm sm:text-base font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
              >
                <span>View All Properties</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((item) => {
                const meta = item.propertyMeta;
                return (
                  <div
                    key={item.id}
                    className="group rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image & Type Badge */}
                      <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs border border-white/10">
                            {meta?.propertyType || "Apartment"}
                          </span>
                          {meta?.furnished && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                              {meta.furnished}
                            </span>
                          )}
                        </div>
                        {meta?.location && (
                          <div className="absolute bottom-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-white flex items-center gap-1.5 backdrop-blur-xs">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            <span>{meta.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Property Specs */}
                      <div className="p-6 space-y-4">
                        <h3 className="font-dropa text-xl sm:text-2xl font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>

                        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-xs sm:text-sm text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4 text-slate-400" />
                            <span>{meta?.bedrooms} Beds</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4 text-slate-400" />
                            <span>{meta?.bathrooms} Baths</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize2 className="w-4 h-4 text-slate-400" />
                            <span>{meta?.squareFeet} sqft</span>
                          </div>
                        </div>

                        {/* Amenities Pills */}
                        {meta?.amenities && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {meta.amenities.slice(0, 3).map((amenity) => (
                              <span
                                key={amenity}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200/60"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing and Actions */}
                    <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                          {meta?.rentalTerms || "Annual Rent"}
                        </span>
                        <span className="font-dropa text-xl sm:text-2xl font-bold text-slate-900">
                          {store.currency}{item.price.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/property/listing/${item.id}`}
                        className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-xs"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>View Residence & Schedule</span>
                      </Link>
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
