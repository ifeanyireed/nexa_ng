"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  Building,
  Calendar,
  Clock,
  Send,
  PhoneCall,
} from "lucide-react";

export default function HardwareServicesPage() {
  const store = MOCK_STORES["hardware"];
  const services = MOCK_SERVICES.filter((s) => s.vertical === "hardware");

  const [activeTab, setActiveTab] = useState<"book-service" | "contractor-rfq">("book-service");
  const [selectedService, setSelectedService] = useState(services[0]?.id || "srv-hdw-01");
  const [date, setDate] = useState("2026-10-18");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [rfqDetails, setRfqDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const currentService = services.find((s) => s.id === selectedService) || services[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E252B] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/hardware"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Hardware Flagship</span>
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                Engineering Work Order #ENG-{(Math.random() * 90000 + 10000).toFixed(0)}
              </span>
              <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                {activeTab === "book-service" ? "Field Engineering Service Booked" : "Contractor RFQ Dispatched"}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {activeTab === "book-service"
                  ? `Your site inspection appointment has been logged with ${currentService?.specialistName}. Our lead engineer will contact you 24 hours prior to confirm site access.`
                  : "Our industrial project estimators are compiling your wholesale bill-of-materials quotation. Expect formal PDF dispatch to your email within 2 business hours."}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/hardware"
                className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
              >
                Return to Hardware Store
              </Link>
              <Link
                href="/account"
                className="px-6 py-3 rounded-full border border-stone-300 text-slate-900 font-bold text-xs hover:bg-stone-50"
              >
                View in Account Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-stone-200 pb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
                <Wrench className="w-4 h-4" />
                <span>Field Engineering & Wholesale Contracting</span>
              </div>
              <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                Installation, Site Audits & Contractor RFQ
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
                COREN-certified renewable energy installations, structural roof audits, earthing resistance measurements, and bulk contractor supply quotations.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-stone-200/80 p-1 rounded-full max-w-md">
              <button
                onClick={() => setActiveTab("book-service")}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === "book-service"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Field Engineering Services
              </button>
              <button
                onClick={() => setActiveTab("contractor-rfq")}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === "contractor-rfq"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Contractor Wholesale RFQ
              </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8">
              {activeTab === "book-service" ? (
                <>
                  {/* Select Service */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                      1. Select Engineering Service
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {services.map((srv) => (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedService(srv.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                            selectedService === srv.id
                              ? "border-slate-900 bg-amber-50/40 shadow-xs"
                              : "border-stone-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                              {srv.category}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-900">
                              {srv.title}
                            </h4>
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                          </div>

                          <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">₦{srv.price.toLocaleString()}</span>
                            <span className="text-stone-400 font-medium">{srv.durationMinutes} Mins</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                      2. Preferred Inspection Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </>
              ) : (
                /* Contractor RFQ */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                    <p className="text-xs font-bold text-amber-900">Commercial & Industrial Volume Quotes</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      For housing developments, commercial estates, and microgrid installations. Tiered contractor pricing applies to orders of 5+ solar panels or 2+ inverters.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Project Bill of Quantities / Scope Description
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={rfqDetails}
                      onChange={(e) => setRfqDetails(e.target.value)}
                      placeholder="Specify required capacity (e.g. 3x 10kVA Deye inverters, 20x 550W Jinko panels, 4x 10kWh LiFePO4 batteries), project location, and required delivery timeline..."
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Contact & Site Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Contact Person / Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Arc. Tunde Adeleke / Apex Projects"
                      className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Phone Number / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500 block mb-1">
                    Physical Site Address for Engineer Dispatch
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot / Street, Estate Name, City, State"
                    className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    {activeTab === "book-service"
                      ? `Confirm Field Inspection Booking · ₦${currentService?.price.toLocaleString()}`
                      : "Submit Commercial RFQ for Engineering Review"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
