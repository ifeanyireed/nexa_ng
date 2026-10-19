import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
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
    <div className="min-h-screen bg-white text-[#13221C] flex flex-col justify-between">
      {/* Regulated Dispensary Alert Strip */}
      <div className="bg-[#0C4A3E] text-emerald-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-emerald-900">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Licensed Clinical Pharmacist on Duty · Immediate NAFDAC Verified Prescription Dispensing</span>
      </div>

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
              eyebrow="Licensed NAFDAC Dispensary"
              headline={"Rapid Prescription\nRefills"}
              highlightText="· Cold-Chain Wellness"
              description="Verified pharmaceutical dispensing, temperature-controlled cold-chain logistics, and confidential clinical consultation with licensed resident pharmacists."
              ctaLabel="Upload Doctor's Rx"
              ctaHref="/pharmacy/prescription"
              footnote="Licensed Clinical Pharmacists · 100% Verified Batch Numbers"
              image="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80"
              imageAlt="Nectar & Cure Dispensary Care"
              badge="NAFDAC Regulated"
              bgColor="#F2F8F6"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={products} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid (Card 1: 25%, Card 2: 25%, Card 3: 50%) */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Chronic Care\n& Refills",
              count: "320+ medications",
              image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80",
              href: "/pharmacy/catalog",
              theme: "light",
            }}
            card2={{
              title: "Vitamins &\nPreventative",
              count: "180+ supplements",
              image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
              href: "/pharmacy/catalog",
              theme: "light",
            }}
            card3={{
              title: "Top Collation",
              href: "/pharmacy/catalog",
              backgroundImage: "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1000&q=80",
              theme: "light",
              pills: [
                {
                  label: "BP & Glucose Monitors",
                  count: "45+ devices",
                  image: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=120&q=80",
                  href: "/pharmacy/catalog",
                },
                {
                  label: "Pediatric Nutrition",
                  count: "90+ items",
                  image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=120&q=80",
                  href: "/pharmacy/catalog",
                },
                {
                  label: "Dermatological Care",
                  count: "115+ remedies",
                  image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=120&q=80",
                  href: "/pharmacy/catalog",
                },
              ],
            }}
          />
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
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
        </main>

        <StoreFooter store={store} />
    </div>
  );
}
