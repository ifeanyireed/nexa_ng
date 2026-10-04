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
  Sparkles,
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-16">
        {/* Editorial Architecture Hero */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] flex items-end p-6 sm:p-12 border border-zinc-800">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exclusive Waterfront Portfolio</span>
            </div>

            <h1 className="font-dropa text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
              Architectural Grandeur. <br />
              <span className="text-blue-400">Pristine</span> Waterfronts.
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light max-w-2xl">
              Curated luxury penthouses, private villas, and high-yield executive residences across Lagos, Dubai, and New York. Verified titles with private concierge service.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/property/listings"
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Building2 className="w-4 h-4" />
                <span>Explore Available Residences</span>
              </Link>
              <Link
                href={`/property/schedule-viewing/${properties[0]?.id || "prp-001"}`}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-xs transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-blue-300" />
                <span>Schedule Private Viewing</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Value Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Verified Landlord Title</h4>
              <p className="text-[11px] text-slate-500">Zero legal encumbrances</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <KeyRound className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">24/7 Redundant Power</h4>
              <p className="text-[11px] text-slate-500">100% uninterrupted grid</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <Eye className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Virtual 4K Tours</h4>
              <p className="text-[11px] text-slate-500">Live walk-throughs anytime</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Private Concierge</h4>
              <p className="text-[11px] text-slate-500">Valet & facility manager</p>
            </div>
          </div>
        </section>

        {/* Featured Properties Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Featured Residences</span>
              <h2 className="font-dropa text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Prime Listings & Short-Lets
              </h2>
            </div>
            <Link
              href="/property/listings"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-4 h-4" />
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
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs border border-white/10">
                          {meta?.propertyType || "Apartment"}
                        </span>
                        {meta?.furnished && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            {meta.furnished}
                          </span>
                        )}
                      </div>
                      {meta?.location && (
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-900/80 text-white flex items-center gap-1 backdrop-blur-xs">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>{meta.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Property Specs */}
                    <div className="p-5 space-y-4">
                      <h3 className="font-dropa text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meta?.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meta?.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meta?.squareFeet} sqft</span>
                        </div>
                      </div>

                      {/* Amenities Pills */}
                      {meta?.amenities && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {meta.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                        {meta?.rentalTerms || "Annual Rent"}
                      </span>
                      <span className="font-dropa text-lg font-bold text-slate-900">
                        {store.currency}{item.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/property/listing/${item.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/property/schedule-viewing/${item.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Viewing</span>
                      </Link>
                    </div>
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
