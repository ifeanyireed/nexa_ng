"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Armchair,
  Wrench,
  CheckCircle2,
  ChevronLeft,
  Calendar,
  Clock,
  Paintbrush,
  Ruler,
} from "lucide-react";

export default function HomeLivingServicesPage() {
  const store = MOCK_STORES["home-living"];
  const service = MOCK_SERVICES.find((s) => s.id === "srv-hml-01") || MOCK_SERVICES[0];

  const [serviceType, setServiceType] = useState<"assembly" | "custom-furniture">("assembly");
  const [date, setDate] = useState("2026-10-20");
  const [furniturePieces, setFurniturePieces] = useState("Solid Teak Dining Table & 6 Cloud Bouclé Chairs");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1E1F22] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/home-living"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Living Collection</span>
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-3 py-1 rounded-full">
                Work Order #HML-{(Math.random() * 90000 + 10000).toFixed(0)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
                {serviceType === "assembly"
                  ? "White-Glove Assembly Scheduled"
                  : "Bespoke Furniture Design Request Logged"}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Our master carpenter <strong>{service.specialistName}</strong> has received your staging request. We will coordinate delivery vehicle arrival and precision assembly for {date}.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/home-living"
                className="px-6 py-3 rounded-full bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs shadow-xs"
              >
                Return to Furniture Studio
              </Link>
              <Link
                href="/account"
                className="px-6 py-3 rounded-full border border-stone-300 text-stone-900 font-bold text-xs hover:bg-stone-50"
              >
                View in Account Bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Armchair className="w-4 h-4" />
                <span>White-Glove Craftsmanship & Spatial Styling</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
                Furniture Assembly & Custom Carpentry
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Professional assembly for solid teak, marble, and modular furniture. Includes precision wall-anchoring, floor leveling pads, and complete packaging debris removal.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="flex bg-stone-200/80 p-1 rounded-full max-w-md">
              <button
                onClick={() => setServiceType("assembly")}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  serviceType === "assembly"
                    ? "bg-amber-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-900"
                }`}
              >
                White-Glove Assembly
              </button>
              <button
                onClick={() => setServiceType("custom-furniture")}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  serviceType === "custom-furniture"
                    ? "bg-amber-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-900"
                }`}
              >
                Custom Made-to-Order
              </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                  Furniture & Project Details
                </label>
                <div>
                  <label className="text-xs font-medium text-stone-500 block mb-1">
                    Furniture Items / Description
                  </label>
                  <input
                    type="text"
                    required
                    value={furniturePieces}
                    onChange={(e) => setFurniturePieces(e.target.value)}
                    placeholder="e.g. 6-Seater Solid Oak Table, Cloud Bouclé Sofa, King Bed Frame"
                    className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Assembly Window
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900">
                      <option>Morning (09:00 AM - 12:00 PM)</option>
                      <option>Afternoon (01:00 PM - 04:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                  Delivery & Contact Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Ronke Williams"
                      className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900"
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
                      className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500 block mb-1">
                    Installation Residence Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Floor number, Apartment / House No, Street, City"
                    className="w-full px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-amber-900 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    {serviceType === "assembly"
                      ? `Book White-Glove Assembly · ₦${service.price.toLocaleString()}`
                      : "Submit Bespoke Furniture Commission"}
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
