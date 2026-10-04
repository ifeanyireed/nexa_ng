import Link from "next/link";
import { MOCK_STORES, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beauty",
  description: "Spa, salon and clinical aesthetic treatments performed by master practitioners.",
};

export default function BeautyServicesPage() {
  const store = MOCK_STORES.beauty;
  const services = MOCK_SERVICES.filter((s) => s.vertical === "beauty");

  return (
    <div className="min-h-screen bg-[#FCF9F6] text-[#201D1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
            <Link href="/beauty" className="hover:text-rose-700 transition-colors">
              Beauty
            </Link>
            <span>/</span>
            <span className="text-zinc-900">Studio Treatment Menu</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            Aesthetic Studio & Spa Services
          </h1>
          <p className="text-sm text-zinc-500">
            One-on-one appointments tailored to your skin and hair texture using high-frequency ultrasonic tools and bio-active masks.
          </p>
        </div>

        {/* Services List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-rose-100/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-100">
                    {srv.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    <span>{srv.durationMinutes} Minutes Session</span>
                  </div>
                </div>

                <h2 className="font-dropa text-2xl font-bold text-zinc-900">
                  {srv.title}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                  {srv.description}
                </p>

                {/* Specialist Profile */}
                {srv.specialistName && (
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center gap-3.5">
                    <img
                      src={srv.specialistAvatar}
                      alt={srv.specialistName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">
                        Lead Specialist: {srv.specialistName}
                      </span>
                      <span className="text-[11px] text-rose-800 block">
                        {srv.specialistRole}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                    Session Fee
                  </span>
                  <span className="font-dropa text-2xl font-bold text-zinc-900">
                    {store.currency}{srv.price.toLocaleString()}
                  </span>
                </div>

                <Link
                  href={`/beauty/book-appointment?service=${srv.id}`}
                  className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/25 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Time Slot</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
