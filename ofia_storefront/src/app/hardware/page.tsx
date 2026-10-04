import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Zap,
  Calculator,
  ShieldCheck,
  Wrench,
  ArrowRight,
  BatteryCharging,
  Sun,
  Building,
} from "lucide-react";

export default function HardwareHomePage() {
  const store = MOCK_STORES["hardware"];
  const products = MOCK_PRODUCTS.filter((p) => p.vertical === "hardware");

  const categories = [
    { name: "Hybrid Inverters", count: "24 Systems", icon: Zap, href: "/hardware/catalog?system=inverter" },
    { name: "Solar Panels", count: "18 Models", icon: Sun, href: "/hardware/catalog?system=solar" },
    { name: "Lithium Batteries", count: "14 Banks", icon: BatteryCharging, href: "/hardware/catalog?system=battery" },
    { name: "Industrial & Tools", count: "32 Units", icon: Wrench, href: "/hardware/catalog?system=industrial" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E252B] flex flex-col justify-between">
      {/* Industrial Grade Strip (Minimal Height, No Extra Padding) */}
      <div className="bg-[#151D24] text-amber-400 text-xs py-1 px-4 text-center font-mono tracking-wider flex items-center justify-center gap-2 border-b border-stone-800">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>COREN Certified Renewable Engineers On-Call · Wholesale Contractor Bulk Discounts Active</span>
      </div>

      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Full-Bleed Editorial Hardware Hero */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-stone-800">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-[50%_35%] opacity-55 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Tier-1 Renewable Hardware · Up to 25-Year Warranties</span>
              </div>

              <h1 className="font-dropa text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-tight">
                Unbroken Power. <br />
                <span className="italic font-cormorant text-amber-400">Engineered</span> Yield.
              </h1>

              <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                Engineered for Nigerian grid unreliability. Calculate your exact home or factory power requirements, order factory-warranted equipment, and book certified COREN installation engineers.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/hardware/calculator"
                  className="px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm sm:text-base transition-colors flex items-center gap-2.5 shadow-lg shadow-amber-950/40"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Run Solar Load Calculator</span>
                </Link>
                <Link
                  href="/hardware/catalog"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors flex items-center gap-2.5"
                >
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Browse Technical Equipment</span>
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
              <Wrench className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">COREN Certified</h4>
                <p className="text-xs text-stone-500 mt-0.5">Licensed electrical engineers</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <ShieldCheck className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Tier-1 Warranties</h4>
                <p className="text-xs text-stone-500 mt-0.5">Up to 25-yr panel performance</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <Building className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Contractor Wholesale</h4>
                <p className="text-xs text-stone-500 mt-0.5">Bulk RFQ trade discounts</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <BatteryCharging className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Turnkey Commissioning</h4>
                <p className="text-xs text-stone-500 mt-0.5">Earthing & load audit included</p>
              </div>
            </div>
          </section>

          {/* Technical Categories */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-700">Technical Categories</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Renewable & Industrial Hardware
                </h2>
              </div>
              <Link
                href="/hardware/catalog"
                className="text-sm sm:text-base font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 group"
              >
                <span>View All Equipment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-amber-400 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-zinc-900 group-hover:text-amber-800 transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-stone-500 font-mono">{cat.count}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Featured Inverters & Storage */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-700">Engineered Solutions</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Featured Inverters & Power Storage
                </h2>
              </div>
              <Link
                href="/hardware/catalog"
                className="text-sm sm:text-base font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 group"
              >
                <span>Technical Spec Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const meta = prod.hardwareMeta;
                return (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/3] bg-stone-100 p-6 flex items-center justify-center overflow-hidden">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white">
                            {meta?.systemType}
                          </span>
                          {meta?.powerRating && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {meta.powerRating}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                            {prod.category} · {meta?.warrantyYears}-Year Warranty
                          </span>
                          <h3 className="font-bold text-lg sm:text-xl text-zinc-900 line-clamp-1 group-hover:text-amber-700 transition-colors mt-0.5">
                            {prod.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 mt-1 font-light leading-relaxed">
                            {prod.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono text-zinc-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          {meta?.voltage && (
                            <div>
                              Volt: <span className="font-bold text-zinc-900">{meta.voltage}</span>
                            </div>
                          )}
                          {meta?.capacity && (
                            <div>
                              Cap: <span className="font-bold text-zinc-900">{meta.capacity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                          Contractor: ₦{meta?.contractorPrice?.toLocaleString()}
                        </span>
                        <span className="text-lg font-bold text-zinc-900">
                          ₦{prod.price.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/hardware/product/${prod.id}`}
                        className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-zinc-900 hover:bg-amber-600 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>View Specs</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Contractor RFQ & Commissioning Feature Banner */}
          <section className="rounded-3xl bg-[#151D24] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-stone-800">
            <div className="max-w-xl space-y-4 z-10">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-amber-400 uppercase">
                COREN-Certified Engineering Field Services
              </span>
              <h3 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Turnkey Solar Sizing, Earthing & Commercial Commissioning
              </h3>
              <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed">
                Avoid premature battery degradation and wiring fire hazards. Our certified electrical engineers perform calibrated load audits, earth resistance testing, and seamless high-yield installations across Nigeria.
              </p>
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/hardware/services"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm sm:text-base transition-all shadow-md"
                >
                  <Wrench className="w-5 h-5" />
                  <span>Book Site Inspection / RFQ</span>
                </Link>
                <Link
                  href="/hardware/calculator"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors"
                >
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <span>Calculate Load Sizing</span>
                </Link>
              </div>
            </div>

            <div className="relative w-full md:w-80 aspect-square rounded-2xl overflow-hidden border border-stone-700 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80"
                alt="Solar Commissioning"
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
