"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STORES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Shirt,
  Scissors,
  Ruler,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  User,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function CustomTailoringPage() {
  const store = MOCK_STORES.fashion;

  const [serviceType, setServiceType] = useState<
    "Bespoke Tailoring" | "Garment Alteration" | "Styling & Fitting Session"
  >("Bespoke Tailoring");
  const [sessionLocation, setSessionLocation] = useState<"Atelier Showroom" | "At-Home Private Fitting">(
    "Atelier Showroom"
  );
  const [selectedDate, setSelectedDate] = useState("2026-10-09");
  const [selectedSlot, setSelectedSlot] = useState("02:00 PM - 03:30 PM");

  // Measurements
  const [chestBust, setChestBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [inseam, setInseam] = useState("");
  const [height, setHeight] = useState("");
  const [fitPreference, setFitPreference] = useState<"Slim Cut" | "Tailored Regular" | "Relaxed / Oversized">(
    "Tailored Regular"
  );

  // Client Details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const timeSlots = [
    "10:00 AM - 11:30 AM",
    "11:30 AM - 01:00 PM",
    "02:00 PM - 03:30 PM",
    "04:00 PM - 05:30 PM",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    const ref = `AURA-FIT-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(ref);
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/fashion"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </Link>

        {confirmed ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200/80 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                Booking Reference: {bookingRef}
              </span>
              <h1 className="font-dropa text-3xl font-bold text-zinc-900">
                Fitting Session Reserved, {fullName}!
              </h1>
              <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
                Your master artisan consultation is confirmed for{" "}
                <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-xs text-left max-w-md mx-auto space-y-2.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Service:</span>
                <span className="font-bold text-zinc-900">{serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Location:</span>
                <span className="font-bold text-zinc-900">{sessionLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Fit Silhouette:</span>
                <span className="font-bold text-zinc-900">{fitPreference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Contact:</span>
                <span className="font-bold text-zinc-900">{phone}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/fashion/catalog"
                className="px-6 py-2.5 rounded-full bg-amber-800 text-white font-bold text-xs hover:bg-amber-900 transition-colors shadow-sm"
              >
                Browse Fabrics & Ready Catalog
              </Link>
              <Link
                href="/fashion"
                className="px-6 py-2.5 rounded-full border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
              >
                Return to Fashion Studio
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Title */}
            <div className="space-y-2 border-b border-stone-200 pb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Scissors className="w-3.5 h-3.5" />
                <span>Atelier Master Craftsman Service</span>
              </div>
              <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900">
                Bespoke Fitting & Tailoring Request
              </h1>
              <p className="text-stone-600 text-sm max-w-2xl font-normal">
                Blueprint Section 2 & 3 custom atelier workflow. Book an artisan measurement session, request garment alterations, or commission a bespoke seasonal silhouette.
              </p>
            </div>

            {/* 1. Select Service Type */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="font-dropa text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-700" />
                <span>1. Select Service Type</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: "Bespoke Tailoring",
                    desc: "Handcrafted 2-piece / 3-piece from raw textile cuts",
                    icon: Scissors,
                  },
                  {
                    title: "Garment Alteration",
                    desc: "Precision taper, hem adjustment, or waist resizing",
                    icon: Ruler,
                  },
                  {
                    title: "Styling & Fitting Session",
                    desc: "1-on-1 wardrobe curation and drape consultation",
                    icon: Shirt,
                  },
                ].map((s) => {
                  const Icon = s.icon;
                  const isSelected = serviceType === s.title;
                  return (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => setServiceType(s.title as any)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "border-amber-800 bg-amber-50/60 ring-2 ring-amber-800/20"
                          : "border-stone-200 hover:border-stone-300 bg-stone-50/50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mb-2 ${
                          isSelected ? "text-amber-800" : "text-stone-500"
                        }`}
                      />
                      <div className="font-bold text-sm text-zinc-900">{s.title}</div>
                      <div className="text-xs text-stone-500 mt-1 leading-snug">{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Measurements & Silhouette */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-5">
              <h2 className="font-dropa text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-amber-700" />
                <span>2. Tailoring Specifications & Fit Preference</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Chest / Bust (in)
                  </label>
                  <input
                    type="text"
                    value={chestBust}
                    onChange={(e) => setChestBust(e.target.value)}
                    placeholder="e.g. 38"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Waist (in)
                  </label>
                  <input
                    type="text"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    placeholder="e.g. 32"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Hips (in)
                  </label>
                  <input
                    type="text"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    placeholder="e.g. 40"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Inseam / Length (in)
                  </label>
                  <input
                    type="text"
                    value={inseam}
                    onChange={(e) => setInseam(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Height (cm/ft)
                  </label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 5ft 11in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Silhouette Style
                  </label>
                  <select
                    value={fitPreference}
                    onChange={(e) => setFitPreference(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 bg-white"
                  >
                    <option value="Slim Cut">Slim Cut</option>
                    <option value="Tailored Regular">Tailored Regular</option>
                    <option value="Relaxed / Oversized">Relaxed / Oversized</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Date, Time & Venue */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-5">
              <h2 className="font-dropa text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-700" />
                <span>3. Date & Appointment Window</span>
              </h2>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSessionLocation("Atelier Showroom")}
                  className={`flex-1 p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                    sessionLocation === "Atelier Showroom"
                      ? "border-amber-800 bg-amber-50 text-amber-900"
                      : "border-stone-200 text-stone-700"
                  }`}
                >
                  Atelier Showroom (Lekki Phase 1)
                </button>
                <button
                  type="button"
                  onClick={() => setSessionLocation("At-Home Private Fitting")}
                  className={`flex-1 p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                    sessionLocation === "At-Home Private Fitting"
                      ? "border-amber-800 bg-amber-50 text-amber-900"
                      : "border-stone-200 text-stone-700"
                  }`}
                >
                  At-Home Private Valet Fitting
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select Appointment Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select Time Window
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 bg-white"
                  >
                    {timeSlots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Client Contact */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="font-dropa text-lg font-bold text-zinc-900 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-700" />
                <span>4. Client Contact Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Stephanie Okonjo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="stephanie@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Fitting Address (if Valet)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, Estate, City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Design Notes or Fabric Reference
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail your desired fabric, event date, lapel style, or any specific alteration requirement..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>No initial charge. Payment settled upon master artisan consultation.</span>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md transition-transform hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                Confirm Fitting Reservation
              </button>
            </div>
          </form>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
