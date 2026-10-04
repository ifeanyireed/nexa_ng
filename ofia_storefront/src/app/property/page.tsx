import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#111318] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Editorial Architecture Hero - Spanning Entire Width on Left & Right */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-zinc-800">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
                <Building2 className="w-4 h-4" />
                <span>Exclusive Waterfront Portfolio</span>
              </div>

              <h1 className="font-dropa text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-tight">
                Architectural Grandeur. <br />
                <span className="text-blue-400 font-bold">Pristine</span> Waterfronts.
              </h1>

              <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-light max-w-2xl">
                Curated luxury penthouses, private villas, and high-yield executive residences across Lagos, Dubai, and New York. Verified titles with private concierge service.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/property/listings"
                  className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base transition-colors flex items-center gap-2.5 shadow-lg shadow-blue-600/30"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Explore Available Residences</span>
                </Link>
                <Link
                  href={`/property/schedule-viewing/${properties[0]?.id || "prp-001"}`}
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors flex items-center gap-2.5"
                >
                  <Calendar className="w-5 h-5 text-blue-300" />
                  <span>Schedule Private Viewing</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
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
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
