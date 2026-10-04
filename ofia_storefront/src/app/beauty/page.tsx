import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Calendar,
  Heart,
  ShieldCheck,
  Leaf,
  Clock,
  ArrowRight,
  ShoppingBag,
  UserCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beauty",
  description: "Clinical botanical skincare and master aesthetic spa studio services.",
};

export default function BeautyStorefrontPage() {
  const store = MOCK_STORES.beauty;
  const beautyProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "beauty");
  const beautyServices = MOCK_SERVICES.filter((s) => s.vertical === "beauty");

  return (
    <div className="min-h-screen bg-[#FCF9F6] text-[#201D1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Editorial Sanctuary Hero - Spanning Entire Width on Left & Right */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-rose-900/20">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-[50%_35%] opacity-55 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
                <Leaf className="w-4 h-4" />
                <span>Botanical Chemistry & Aesthetic Sanctuary</span>
              </div>

              <h1 className="font-dropa text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-tight">
                Pure Botanicals. <br />
                <span className="italic font-cormorant text-rose-300">Clinical</span> Radiance.
              </h1>

              <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                Nourish your skin barrier with bioactive African botanicals and schedule clinical hydra-facials with our licensed dermatologists.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/beauty/products"
                  className="px-7 py-3.5 rounded-full bg-white text-zinc-900 font-bold text-sm sm:text-base hover:bg-rose-100 transition-colors flex items-center gap-2.5 shadow-lg"
                >
                  <span>Shop Skincare Formulations</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/beauty/book-appointment"
                  className="px-7 py-3.5 rounded-full bg-rose-500/90 hover:bg-rose-500 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors flex items-center gap-2.5 shadow-lg shadow-rose-500/25"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Studio Appointment</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Value Badges */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-3.5">
              <Leaf className="w-7 h-7 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">100% Organic Actives</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Pure cold-pressed botanicals</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-3.5">
              <ShieldCheck className="w-7 h-7 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Dermatologist Tested</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Hypoallergenic & safe</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-3.5">
              <Heart className="w-7 h-7 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Cruelty-Free</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Never tested on animals</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-3.5">
              <UserCheck className="w-7 h-7 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Certified Specialists</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Licensed aesthetic practitioners</p>
              </div>
            </div>
          </section>

          {/* Section 1: Retail Skincare Formulations */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-rose-600">Daily Barrier Ritual</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Clinical Skincare Formulations
                </h2>
              </div>
              <Link
                href="/beauty/products"
                className="text-sm sm:text-base font-bold text-rose-600 hover:text-rose-700 flex items-center gap-2 transition-colors"
              >
                <span>Explore All Products</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beautyProducts.map((prod) => {
                const meta = prod.beautyMeta;
                return (
                  <div
                    key={prod.id}
                    className="group rounded-3xl bg-white border border-rose-100/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-rose-50/40 p-6 flex items-center justify-center">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-200">
                            {meta?.routineStep || "Treat"}
                          </span>
                          {meta?.volume && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-zinc-700 border border-zinc-200 shadow-2xs">
                              {meta.volume}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-6 space-y-3.5">
                        <div>
                          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                            {prod.category}
                          </span>
                          <h3 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900 mt-1 line-clamp-1 group-hover:text-rose-600 transition-colors">
                            {prod.title}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed font-light">
                          {prod.description}
                        </p>

                        {/* Ingredients */}
                        {meta?.ingredientsHighlights && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {meta.ingredientsHighlights.slice(0, 3).map((ing) => (
                              <span
                                key={ing}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-800"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing and Action */}
                    <div className="p-6 pt-0 border-t border-rose-100 mt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                          Retail Price
                        </span>
                        <span className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                          {store.currency}{prod.price.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/beauty/product/${prod.id}`}
                        className="px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center gap-2 shadow-xs"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>View Formula</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Studio Aesthetic Services */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-rose-600">In-Studio Treatments</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Aesthetic Salon & Spa Services
                </h2>
              </div>
              <Link
                href="/beauty/services"
                className="text-sm sm:text-base font-bold text-rose-600 hover:text-rose-700 flex items-center gap-2 transition-colors"
              >
                <span>View All Services</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {beautyServices.map((srv) => (
                <div
                  key={srv.id}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-rose-100/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-6"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700">
                        {srv.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-500">
                        <Clock className="w-4 h-4 text-rose-600" />
                        <span>{srv.durationMinutes} Minutes</span>
                      </div>
                    </div>

                    <h3 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900">
                      {srv.title}
                    </h3>

                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-light">
                      {srv.description}
                    </p>

                    {/* Specialist card preview */}
                    {srv.specialistName && (
                      <div className="flex items-center gap-3.5 pt-2">
                        <img
                          src={srv.specialistAvatar}
                          alt={srv.specialistName}
                          className="w-12 h-12 rounded-full object-cover border border-rose-200"
                        />
                        <div>
                          <span className="text-sm font-bold text-zinc-900 block">
                            {srv.specialistName}
                          </span>
                          <span className="text-xs text-rose-700 block">
                            {srv.specialistRole}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                        Treatment Fee
                      </span>
                      <span className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900">
                        {store.currency}{srv.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/beauty/book-appointment?service=${srv.id}`}
                      className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-rose-600/20 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
