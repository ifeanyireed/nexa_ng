import Link from "next/link";
import { ArrowLeft, Compass, Store, Home } from "lucide-react";

export default function NotFound() {
  const verticals = [
    { name: "Fashion & Apparel", href: "/fashion", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    { name: "Cars & Automotive", href: "/cars", color: "bg-blue-50 text-blue-800 border-blue-200" },
    { name: "Food & Groceries", href: "/food", color: "bg-amber-50 text-amber-800 border-amber-200" },
    { name: "Property Rentals", href: "/property", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    { name: "Gadgets & Tech", href: "/gadgets", color: "bg-cyan-50 text-cyan-800 border-cyan-200" },
    { name: "Beauty & Wellness", href: "/beauty", color: "bg-rose-50 text-rose-800 border-rose-200" },
    { name: "Home & Living", href: "/home-living", color: "bg-amber-50 text-amber-800 border-amber-200" },
    { name: "Health & Pharmacy", href: "/pharmacy", color: "bg-teal-50 text-teal-800 border-teal-200" },
    { name: "Hardware & Energy", href: "/hardware", color: "bg-orange-50 text-orange-800 border-orange-200" },
    { name: "General Retail & Gifts", href: "/retail", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/ofia-logo.png" alt="Ofia" className="h-8 w-auto object-contain" />
            <span className="font-bold text-base tracking-tight text-slate-900">Ofia Storefront</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-full text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Storefront Hub</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Body */}
      <main className="flex-1 flex items-center justify-center p-6 my-12">
        <div className="max-w-2xl w-full text-center space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 text-slate-400">
            <Store className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">404 — Store Not Found</span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              This Storefront Is Not Published Yet
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
              The merchant domain or page you requested does not exist or has been relocated. Explore our active vertical storefront templates below:
            </p>
          </div>

          {/* Quick Jumps */}
          <div className="space-y-3 text-left pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center">
              Active Storefront Experiences
            </span>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {verticals.map((v) => (
                <Link
                  key={v.name}
                  href={v.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-transform hover:scale-105 ${v.color}`}
                >
                  {v.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Storefront Showcase</span>
            </Link>
            <Link
              href="/templates"
              className="w-full sm:w-auto px-7 py-3 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Browse All Templates</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Ofia Commerce & Logistics Ecosystem. All rights reserved.
      </footer>
    </div>
  );
}
