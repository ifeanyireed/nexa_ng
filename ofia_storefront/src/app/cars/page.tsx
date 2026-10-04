import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
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
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cars",
  description: "Certified luxury, performance & executive fleet with verified 150-point inspections.",
};

export default function CarsStorefrontPage() {
  const store = MOCK_STORES.cars;
  const carProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "cars");
  const inspectionService = MOCK_SERVICES.find((s) => s.vertical === "cars");

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Dealership Showroom Hero - Spanning Entire Width on Left & Right */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-zinc-800">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-55 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Certified Executive & Luxury Fleet</span>
              </div>

              <h1 className="font-dropa text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-tight">
                Precision Engineering. <br />
                <span className="text-blue-400 font-bold">Verified</span> Provenance.
              </h1>

              <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-light max-w-2xl">
                Nigeria&apos;s curated luxury showroom. Every vehicle undergoes a rigorous 150-point electronic and mechanical audit with at-home valet test-drives.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/cars/listings"
                  className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base transition-colors flex items-center gap-2.5 shadow-lg shadow-blue-600/30"
                >
                  <Search className="w-5 h-5" />
                  <span>Explore Fleet Inventory</span>
                </Link>
                <Link
                  href={`/cars/book-test-drive/${carProducts[0]?.id || "car-001"}`}
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors flex items-center gap-2.5"
                >
                  <Calendar className="w-5 h-5 text-blue-300" />
                  <span>Book Valet Test-Drive</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Showroom Trust Badges */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <ShieldCheck className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">150-Point Audit</h4>
                <p className="text-xs text-slate-500 mt-0.5">Certified mechanical inspection</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Clean Title Verified</h4>
                <p className="text-xs text-slate-500 mt-0.5">Customs clearance & VIN audit</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <Car className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">At-Home Valet</h4>
                <p className="text-xs text-slate-500 mt-0.5">Test-drive brought to your gate</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <Settings2 className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Warranty Backed</h4>
                <p className="text-xs text-slate-500 mt-0.5">12-Month drivetrain coverage</p>
              </div>
            </div>
          </section>

          {/* Featured Fleet Grid */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-600">Certified Available Stock</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mt-1">
                  Featured Fleet Listings
                </h2>
              </div>
              <Link
                href="/cars/listings"
                className="text-sm sm:text-base font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
              >
                <span>View All Inventory</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carProducts.map((car) => {
                const meta = car.carMeta;
                return (
                  <div
                    key={car.id}
                    className="group rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Vehicle Image & Badges */}
                      <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                        <img
                          src={car.images[0]}
                          alt={car.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs border border-white/10">
                            {meta?.condition || "Certified"}
                          </span>
                          {meta?.year && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                              {meta.year}
                            </span>
                          )}
                        </div>
                        {meta?.inspectionScore && (
                          <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white flex items-center gap-1.5 backdrop-blur-xs shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Audit: {meta.inspectionScore}/100</span>
                          </div>
                        )}
                      </div>

                      {/* Vehicle Specs Overview */}
                      <div className="p-6 space-y-4">
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
                    <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
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
                        <span>View Details & Test-Drive</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Mechanical Inspection Service Spotlight */}
          {inspectionService && (
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
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
