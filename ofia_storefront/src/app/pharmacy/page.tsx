import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Upload,
  ShieldCheck,
  Pill,
  Stethoscope,
  ThermometerSnowflake,
  Clock,
  ArrowRight,
  HeartPulse,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function PharmacyHomePage() {
  const store = MOCK_STORES["pharmacy"];
  const products = MOCK_PRODUCTS.filter((p) => p.vertical === "pharmacy");

  const categories = [
    { name: "Prescription (Rx)", count: "140+ Items", icon: FileText, href: "/pharmacy/catalog?category=prescription" },
    { name: "Vitamins & Minerals", count: "85+ Items", icon: HeartPulse, href: "/pharmacy/catalog?category=vitamins" },
    { name: "Heart & Blood Pressure", count: "42+ Items", icon: Pill, href: "/pharmacy/catalog?category=cardiac" },
    { name: "First Aid & Diagnostics", count: "30+ Items", icon: AlertCircle, href: "/pharmacy/catalog?category=devices" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#13221C] flex flex-col justify-between">
      {/* Regulated Dispensary Alert Strip (Minimal Height, No Extra Padding) */}
      <div className="bg-[#0C4A3E] text-emerald-100 text-xs py-1 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-emerald-900">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Licensed Clinical Pharmacist on Duty · Immediate NAFDAC Verified Prescription Dispensing</span>
      </div>

      <StoreHeader store={store} />

      <main className="flex-1 w-full space-y-16 pb-12">
        {/* Full-Bleed Editorial Pharmacy Hero */}
        <section className="relative w-full overflow-hidden shadow-2xl bg-zinc-950 text-white min-h-[520px] sm:min-h-[580px] flex items-end p-6 sm:p-12 lg:p-16 border-y border-stone-800">
          <img
            src={store.coverImage}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover object-[50%_35%] opacity-55 scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>NAFDAC Regulated & Cold-Chain Certified Dispensary</span>
              </div>

              <h1 className="font-dropa text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-tight">
                Clinical Purity. <br />
                <span className="italic font-cormorant text-teal-400">Regulated</span> Healing.
              </h1>

              <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-light max-w-xl">
                Verified pharmaceutical dispensing, temperature-controlled cold-chain logistics, and confidential clinical consultation with licensed resident pharmacists.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/pharmacy/prescription"
                  className="px-7 py-3.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm sm:text-base transition-colors flex items-center gap-2.5 shadow-lg shadow-teal-950/40"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Doctor&apos;s Prescription</span>
                </Link>
                <Link
                  href="/pharmacy/catalog"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors flex items-center gap-2.5"
                >
                  <Pill className="w-5 h-5 text-teal-300" />
                  <span>Browse Medication Catalog</span>
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
              <ShieldCheck className="w-7 h-7 text-teal-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">NAFDAC Certified</h4>
                <p className="text-xs text-stone-500 mt-0.5">100% authentic batches</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <ThermometerSnowflake className="w-7 h-7 text-teal-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Cold-Chain Transit</h4>
                <p className="text-xs text-stone-500 mt-0.5">2°C – 8°C thermal insulation</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <Stethoscope className="w-7 h-7 text-teal-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Resident Pharmacist</h4>
                <p className="text-xs text-stone-500 mt-0.5">1-on-1 confidential review</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <Clock className="w-7 h-7 text-teal-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Monthly Refill Desk</h4>
                <p className="text-xs text-stone-500 mt-0.5">Auto-dispatch for chronic care</p>
              </div>
            </div>
          </section>

          {/* Category Hubs */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-teal-700">Regulated Departments</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Medication & Wellness Categories
                </h2>
              </div>
              <Link
                href="/pharmacy/catalog"
                className="text-sm sm:text-base font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 group"
              >
                <span>View All Catalog</span>
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
                    className="bg-white p-5 rounded-2xl border border-stone-200/80 hover:border-teal-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-zinc-900 group-hover:text-teal-700 transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-stone-500 font-medium">{cat.count}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Featured Medications */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-teal-700">Regulated Formulations</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Dispensing Highlights
                </h2>
              </div>
              <Link
                href="/pharmacy/catalog"
                className="text-sm sm:text-base font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 group"
              >
                <span>Search All Medications</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const meta = prod.pharmacyMeta;
                return (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/3] bg-teal-50/40 flex items-center justify-center overflow-hidden">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                          {meta?.prescriptionRequired ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                              Prescription (Rx)
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                              OTC
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-teal-900 border border-teal-200">
                            {meta?.dosageForm}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                            {prod.category} · {meta?.dosageForm}
                          </span>
                          <h3 className="font-bold text-lg sm:text-xl text-zinc-900 line-clamp-1 group-hover:text-teal-700 transition-colors mt-0.5">
                            {prod.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 mt-1 font-light leading-relaxed">
                            {prod.description}
                          </p>
                        </div>

                        {meta?.activeIngredients && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {meta.activeIngredients.map((act) => (
                              <span
                                key={act}
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-100"
                              >
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                          Pack Size: {meta?.packSize}
                        </span>
                        <span className="text-lg font-bold text-zinc-900">
                          ₦{prod.price.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/pharmacy/product/${prod.id}`}
                        className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-teal-700 hover:bg-teal-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>View Medication</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Clinical Consultation & Prescription Upload Feature Banner */}
          <section className="rounded-3xl bg-teal-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-teal-900">
            <div className="max-w-xl space-y-4 z-10">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-teal-300 uppercase">
                Clinical Pharmacist Consultation & Script Desk
              </span>
              <h3 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Confidential Regimen Review & Cold-Chain Dispensing
              </h3>
              <p className="text-teal-100/90 text-sm sm:text-base font-light leading-relaxed">
                Upload your doctor&apos;s prescription for instant 15-minute clinical verification, check drug-drug interactions, or schedule recurring chronic maintenance refills with temperature-guaranteed courier transit.
              </p>
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/pharmacy/prescription"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-teal-500 hover:bg-teal-400 text-teal-950 font-extrabold text-sm sm:text-base transition-all shadow-md"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Doctor&apos;s Script</span>
                </Link>
                <Link
                  href="/pharmacy/consultation"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-colors"
                >
                  <Stethoscope className="w-5 h-5 text-teal-300" />
                  <span>Book Consultation</span>
                </Link>
              </div>
            </div>

            <div className="relative w-full md:w-80 aspect-square rounded-2xl overflow-hidden border border-teal-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80"
                alt="Clinical Dispensary"
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
