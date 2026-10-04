"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Cpu,
  SlidersHorizontal,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  Check,
  Smartphone,
  Send,
} from "lucide-react";

export default function GadgetsComparePage() {
  const store = MOCK_STORES.gadgets;
  const gadgetProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "gadgets");

  const [deviceAId, setDeviceAId] = useState(gadgetProducts[0]?.id || "gdt-001");
  const [deviceBId, setDeviceBId] = useState(gadgetProducts[1]?.id || "gdt-002");

  const devA = gadgetProducts.find((p) => p.id === deviceAId) || gadgetProducts[0];
  const devB = gadgetProducts.find((p) => p.id === deviceBId) || gadgetProducts[1] || gadgetProducts[0];

  // Diagnostic form state
  const [repairDevice, setRepairDevice] = useState("Apple iPhone 15 / 16 Series");
  const [issueType, setIssueType] = useState("Screen / OLED Replacement");
  const [serviceMode, setServiceMode] = useState<"Express Drop-off" | "Doorstep Courier Pickup">("Express Drop-off");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [ticketNo, setTicketNo] = useState("");

  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;
    setTicketNo(`REP-${Math.floor(100000 + Math.random() * 900000)}`);
    setBookingConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        <Link
          href="/gadgets/catalog"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Tech Catalog</span>
        </Link>

        {/* Section 1: Side-by-Side Comparison */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs sm:text-sm font-bold uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Side-by-Side Hardware Comparison</span>
            </div>
            <h1 className="font-dropa text-3xl sm:text-5xl font-bold text-slate-900">
              Compare Flagship Specifications
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Benchmark silicon performance, battery stamina, storage tiers, and warranty coverage across models.
            </p>
          </div>

          {/* Device Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Select Primary Device
              </label>
              <select
                value={deviceAId}
                onChange={(e) => setDeviceAId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {gadgetProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.gadgetMeta?.brand})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Select Secondary Device
              </label>
              <select
                value={deviceBId}
                onChange={(e) => setDeviceBId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {gadgetProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.gadgetMeta?.brand})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-xl">
            <div className="grid grid-cols-3 p-6 sm:p-8 border-b border-slate-200 bg-slate-50/70 items-center">
              <span className="font-dropa text-sm sm:text-base font-bold text-slate-600 uppercase tracking-wider">
                Specification Matrix
              </span>
              <div className="text-center space-y-2">
                <img
                  src={devA.images[0]}
                  alt={devA.title}
                  className="w-20 h-20 object-contain mx-auto"
                />
                <h3 className="font-dropa text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                  {devA.title}
                </h3>
                <span className="text-blue-600 font-bold text-sm sm:text-base block">
                  {store.currency}{devA.price.toLocaleString()}
                </span>
              </div>
              <div className="text-center space-y-2">
                <img
                  src={devB.images[0]}
                  alt={devB.title}
                  className="w-20 h-20 object-contain mx-auto"
                />
                <h3 className="font-dropa text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                  {devB.title}
                </h3>
                <span className="text-blue-600 font-bold text-sm sm:text-base block">
                  {store.currency}{devB.price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-5 items-center">
                <span className="font-semibold text-slate-500">Brand / Maker</span>
                <span className="text-center text-slate-900 font-medium">{devA.gadgetMeta?.brand}</span>
                <span className="text-center text-slate-900 font-medium">{devB.gadgetMeta?.brand}</span>
              </div>
              <div className="grid grid-cols-3 p-5 items-center">
                <span className="font-semibold text-slate-500">Category</span>
                <span className="text-center text-slate-900 font-medium">{devA.category}</span>
                <span className="text-center text-slate-900 font-medium">{devB.category}</span>
              </div>
              <div className="grid grid-cols-3 p-5 items-center">
                <span className="font-semibold text-slate-500">Official Warranty</span>
                <span className="text-center text-emerald-700 font-bold">
                  {devA.gadgetMeta?.warrantyYears || 1}-Year Hardware
                </span>
                <span className="text-center text-emerald-700 font-bold">
                  {devB.gadgetMeta?.warrantyYears || 1}-Year Hardware
                </span>
              </div>
              <div className="grid grid-cols-3 p-5 items-center">
                <span className="font-semibold text-slate-500">Available Storage</span>
                <span className="text-center text-slate-700">
                  {devA.gadgetMeta?.storageOptions?.join(", ") || "Standard"}
                </span>
                <span className="text-center text-slate-700">
                  {devB.gadgetMeta?.storageOptions?.join(", ") || "Standard"}
                </span>
              </div>
              <div className="grid grid-cols-3 p-5 items-center">
                <span className="font-semibold text-slate-500">Actions</span>
                <div className="text-center">
                  <Link
                    href={`/gadgets/product/${devA.id}`}
                    className="inline-block px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xs"
                  >
                    View Device
                  </Link>
                </div>
                <div className="text-center">
                  <Link
                    href={`/gadgets/product/${devB.id}`}
                    className="inline-block px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xs"
                  >
                    View Device
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Certified Hardware Diagnostic & Repair Clinic */}
        <section className="p-6 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
            <Wrench className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="font-dropa text-2xl sm:text-3xl font-bold text-slate-900">
                Authorized Hardware Diagnostic & Repair Booking
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Experiencing cracked glass, liquid exposure, or battery issues? Book OEM servicing.
              </p>
            </div>
          </div>

          {bookingConfirmed ? (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold">
                Diagnostic Ticket: {ticketNo}
              </span>
              <h3 className="font-dropa text-2xl font-bold text-slate-900">
                Service Appointment Scheduled
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Our lead hardware engineer will contact you on {clientPhone} to coordinate {serviceMode.toLowerCase()}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRepairSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                    Device Model
                  </label>
                  <input
                    type="text"
                    required
                    value={repairDevice}
                    onChange={(e) => setRepairDevice(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                    Issue Category
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Screen / OLED Replacement">Screen / OLED Replacement</option>
                    <option value="Battery Health & Degradation">Battery Health & Degradation</option>
                    <option value="Charging Port / Logic Board">Charging Port / Logic Board</option>
                    <option value="Audio / Speaker Failure">Audio / Speaker Failure</option>
                    <option value="Firmware / Diagnostic Scan">Firmware / Diagnostic Scan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                    Service Hand-off Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Express Drop-off", "Doorstep Courier Pickup"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setServiceMode(mode)}
                        className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          serviceMode === mode
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ebuka Okafor"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                    Phone Number (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 800 000 0000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                  Symptoms & Diagnostic Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe when the issue started, error messages, or device state..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="py-4 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/25 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Diagnostic Service Ticket</span>
              </button>
            </form>
          )}
        </section>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
