"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STORES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Wrench,
  ShieldCheck,
  Cpu,
  Laptop,
  Smartphone,
  Truck,
  CheckCircle2,
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Phone,
  FileCheck,
  Search,
} from "lucide-react";

export default function GadgetsRepairsPage() {
  const store = MOCK_STORES.gadgets;

  const [activeTab, setActiveTab] = useState<"book-repair" | "warranty-check">("book-repair");

  // Repair Booking Form State
  const [deviceType, setDeviceType] = useState<"Smartphone" | "Laptop" | "Audio / Wearable" | "Console / Appliance">(
    "Smartphone"
  );
  const [serviceOption, setServiceOption] = useState<"Lab Walk-in Diagnostics" | "Courier Express Dispatch Pickup">(
    "Courier Express Dispatch Pickup"
  );
  const [brandModel, setBrandModel] = useState("");
  const [issueCategory, setIssueCategory] = useState("OLED / Display Replacement");
  const [issueDetails, setIssueDetails] = useState("");
  const [preferredDate, setPreferredDate] = useState("2026-10-08");

  // Customer Contact
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [repairRef, setRepairRef] = useState("");

  // Warranty Check State
  const [imeiOrRef, setImeiOrRef] = useState("");
  const [warrantyResult, setWarrantyResult] = useState<{
    found: boolean;
    device?: string;
    status?: string;
    coverageExpiry?: string;
    tier?: string;
  } | null>(null);

  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    const ref = `FIX-${Math.floor(100000 + Math.random() * 900000)}`;
    setRepairRef(ref);
    setConfirmed(true);
  };

  const handleWarrantySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imeiOrRef) return;
    // Simulated instant lookup
    setWarrantyResult({
      found: true,
      device: "MacBook Pro 16\" M3 Max (36GB / 1TB)",
      status: "Active & Covered",
      coverageExpiry: "December 14, 2027",
      tier: "Ofia Care+ 2-Year Full Hardware & Battery Replacement",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/gadgets"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Gadgets Store</span>
        </Link>

        {/* Header Banner */}
        <div className="space-y-2 border-b border-slate-200 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5 text-blue-700" />
            <span>Authorized Diagnostics & Hardware Warranty</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-slate-900">
            Repairs, Diagnostics & Warranty Services
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl font-normal">
            Blueprint Section 2 & 3 dedicated electronics workflow. Request certified hardware diagnostics, screen and battery servicing, or verify active hardware warranty coverage.
          </p>
        </div>

        {/* Tab Switcher: Book Repair vs Check Warranty */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/80 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab("book-repair")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "book-repair"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Book Hardware Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("warranty-check")}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "warranty-check"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Check Warranty Status
          </button>
        </div>

        {activeTab === "warranty-check" ? (
          /* Warranty Status Check Screen */
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="font-dropa text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Verify Ofia Hardware Warranty Coverage</span>
              </h2>
              <p className="text-xs text-slate-500">
                Enter your device Serial Number, IMEI, or Storefront Order Reference to verify active repair and replacement entitlement.
              </p>
            </div>

            <form onSubmit={handleWarrantySearch} className="flex gap-2">
              <input
                type="text"
                required
                value={imeiOrRef}
                onChange={(e) => setImeiOrRef(e.target.value)}
                placeholder="e.g. C02G90XXMD6M or OFIA-882194"
                className="flex-1 px-5 py-3 rounded-full border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 font-mono"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Verify</span>
              </button>
            </form>

            {warrantyResult && (
              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Coverage Status: {warrantyResult.status}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-500 block">Covered Hardware:</span>
                    <strong className="text-slate-900">{warrantyResult.device}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Valid Through:</span>
                    <strong className="text-emerald-700">{warrantyResult.coverageExpiry}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">Coverage Tier:</span>
                    <strong className="text-slate-900">{warrantyResult.tier}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : confirmed ? (
          /* Confirmation Screen */
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                Service Ticket #{repairRef}
              </span>
              <h1 className="font-dropa text-3xl font-bold text-slate-900">
                Repair Ticket Created, {fullName}!
              </h1>
              <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                Your hardware diagnostic request has been logged. Our certified lab engineers will inspect your {brandModel || deviceType} upon receipt.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left max-w-md mx-auto space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Format:</span>
                <span className="font-bold text-slate-900">{serviceOption}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issue:</span>
                <span className="font-bold text-slate-900">{issueCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-bold text-slate-900">{preferredDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-bold text-slate-900">{phone}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/gadgets/catalog"
                className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors shadow-sm"
              >
                Browse Gadgets Catalog
              </Link>
              <Link
                href="/gadgets"
                className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Return to Gadgets Home
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleRepairSubmit} className="space-y-6">
            {/* Step 1: Device Category & Issue */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="font-dropa text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span>1. Hardware Category & Issue</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Smartphone", icon: Smartphone },
                  { label: "Laptop", icon: Laptop },
                  { label: "Audio / Wearable", icon: Wrench },
                  { label: "Console / Appliance", icon: Cpu },
                ].map((d) => {
                  const Icon = d.icon;
                  const isSelected = deviceType === d.label;
                  return (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => setDeviceType(d.label as any)}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 font-bold text-blue-900"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1.5" />
                      <div className="text-xs">{d.label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Device Brand & Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max or Dell XPS 15"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Category *
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 bg-white"
                  >
                    <option value="OLED / Display Replacement">OLED / Screen Replacement</option>
                    <option value="Battery Health & Degradation">Battery Degradation / Not Charging</option>
                    <option value="Liquid Ingress & Diagnostics">Liquid Contact Diagnostics</option>
                    <option value="Motherboard / Logic Board Chip Service">Logic Board / Motherboard Chip Service</option>
                    <option value="Software / OS Restore">OS Restore / Data Recovery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe Problem Symptoms
                </label>
                <textarea
                  rows={2}
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                  placeholder="Detail screen flickering, error codes, temperature issues, or impact damages..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>

            {/* Step 2: Service Delivery Mode */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="font-dropa text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>2. Logistics & Pickup Option</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setServiceOption("Courier Express Dispatch Pickup")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    serviceOption === "Courier Express Dispatch Pickup"
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">Courier Express Dispatch Pickup</div>
                  <div className="text-xs text-slate-500 mt-1">
                    An Ofia Logistics verified rider collects your device in a tamper-evident box.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceOption("Lab Walk-in Diagnostics")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    serviceOption === "Lab Walk-in Diagnostics"
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">Lab Walk-in Diagnostics</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Bring your device to PulseTech Engineering Center on Saka Tinubu, VI.
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Diagnostic Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>

            {/* Step 3: Contact Details */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="font-dropa text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>3. Customer Contact & Location</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Femi Alabi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 810 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="femi@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pickup Address (if Courier)
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Apartment, Street, Area"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero diagnostic booking fee. Full diagnostic report provided prior to repair authorization.</span>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-transform hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                Log Repair Ticket
              </button>
            </div>
          </form>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
