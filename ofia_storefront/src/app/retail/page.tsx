import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
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

export default function RetailHomePage() {
  const store = MOCK_STORES["retail"];
  const products = MOCK_PRODUCTS.filter((p) => p.vertical === "retail");

  const departments = [
    { name: "Books & Literature", count: "1,200+ Titles", icon: BookOpen, href: "/retail/catalog?dept=books" },
    { name: "Sports & Home Gym", count: "340+ Units", icon: Dumbbell, href: "/retail/catalog?dept=sports" },
    { name: "Baby Gear & Sensory Toys", count: "210+ Items", icon: Baby, href: "/retail/catalog?dept=baby" },
    { name: "Curated Artisan Gifts", count: "180+ Keepsakes", icon: Gift, href: "/retail/catalog?dept=gifts" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#222129] flex flex-col justify-between">
      {/* Luxury Packaging Banner Strip (Minimal Height, No Extra Padding) */}
      <div className="bg-[#1C1826] text-amber-200 text-xs py-1 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-indigo-950">
        <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
        <span>Complimentary Artisan Wax-Sealed Gift Wrapping & Custom Brass Engraving on Curated Orders</span>
      </div>

      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Full-Bleed Editorial Retail Hero */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-stone-800">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-[50%_35%] opacity-55 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
                <Award className="w-4 h-4" />
                <span>Curated Multi-Department Specialty Emporium</span>
              </div>

              <h1 className="font-dropa text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-tight">
                Curated Heritage. <br />
                <span className="italic font-cormorant text-purple-300">Bespoke</span> Keepsakes.
              </h1>

              <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                Discover rare literature anthologies, high-performance home gym systems, certified non-toxic Montessori playcraft, and artisan gifts customized with personal monograms.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/retail/catalog"
                  className="px-7 py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm sm:text-base transition-colors flex items-center gap-2.5 shadow-lg shadow-purple-950/40"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Explore All 4 Departments</span>
                </Link>
                <Link
                  href="/retail/customization"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors flex items-center gap-2.5"
                >
                  <PenTool className="w-5 h-5 text-purple-300" />
                  <span>Personalize & Gift Registries</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
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
                href="/retail/catalog"
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
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-purple-700">Curated Goods</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Featured Multi-Department Items
                </h2>
              </div>
              <Link
                href="/retail/catalog"
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
                      <div className="relative aspect-[4/3] bg-purple-50/30 p-6 flex items-center justify-center overflow-hidden">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
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

                      <Link
                        href={`/retail/product/${prod.id}`}
                        className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-purple-900 hover:bg-purple-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Artisan Gift Presentation & Custom Engraving Feature Banner */}
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
                  href="/retail/customization"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm sm:text-base transition-all shadow-md"
                >
                  <PenTool className="w-5 h-5" />
                  <span>Build Registry / Engrave</span>
                </Link>
                <Link
                  href="/retail/catalog"
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
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
