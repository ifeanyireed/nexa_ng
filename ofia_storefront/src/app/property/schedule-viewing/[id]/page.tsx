"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Building2,
  Calendar,
  Clock,
  Video,
  Users,
  MapPin,
  ChevronLeft,
  CheckCircle2,
  Check,
  Sparkles,
} from "lucide-react";

export default function ScheduleViewingPage() {
  const params = useParams();
  const store = MOCK_STORES.property;

  const propertyId = (params?.id as string) || "prp-001";
  const property =
    MOCK_PRODUCTS.find((p) => p.id === propertyId && p.vertical === "property") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "property") ||
    MOCK_PRODUCTS[0];

  const meta = property.propertyMeta;

  // Form State
  const [viewingType, setViewingType] = useState<"In-Person Guided Tour" | "Live Video Walkthrough">(
    "In-Person Guided Tour"
  );
  const [selectedDate, setSelectedDate] = useState("2026-10-08");
  const [selectedSlot, setSelectedSlot] = useState("11:00 AM - 12:00 PM");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [viewingRef, setViewingRef] = useState("");

  const timeSlots = [
    "10:00 AM - 11:00 AM",
    "11:30 AM - 12:30 PM",
    "02:00 PM - 03:00 PM",
    "04:30 PM - 05:30 PM (Sunset Tour)",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    const ref = `VW-${Math.floor(100000 + Math.random() * 900000)}`;
    setViewingRef(ref);
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111318] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href={`/property/listing/${property.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to {property.title}</span>
        </Link>

        {confirmed ? (
          /* Confirmation Screen */
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                Viewing Pass: {viewingRef}
              </span>
              <h1 className="font-dropa text-3xl font-bold text-slate-900">
                Viewing Tour Confirmed!
              </h1>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Your private viewing for <strong>{property.title}</strong> has been scheduled with the resident broker.
              </p>
            </div>

            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Tour Format:</span>
                <span className="font-bold text-slate-900">{viewingType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-bold text-slate-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Time Window:</span>
                <span className="font-bold text-slate-900">{selectedSlot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Guest Name:</span>
                <span className="font-bold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Property Location:</span>
                <span className="font-bold text-slate-900">{meta?.location}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/property/listings"
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Browse More Residences
              </Link>
              <Link
                href={`/property/listing/${property.id}`}
                className="px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                View Residence Details
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Private Viewing Tour</span>
              </div>
              <h1 className="font-dropa text-3xl font-bold text-slate-900">
                Schedule a Residence Walkthrough
              </h1>
              <p className="text-sm text-slate-500">
                Choose an in-person guided tour or a live 4K interactive video walkthrough with our licensed broker.
              </p>
            </div>

            {/* Selected Property Preview */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-24 h-20 rounded-2xl object-cover shrink-0 bg-slate-900"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Selected Residence
                </span>
                <h3 className="font-dropa text-base font-bold text-slate-900 truncate">
                  {property.title}
                </h3>
                <p className="text-xs text-slate-600">
                  {meta?.location} · {meta?.bedrooms} Beds · {meta?.bathrooms} Baths · {meta?.squareFeet} sqft
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-slate-400 block">{meta?.rentalTerms || "Annual Rent"}</span>
                <span className="font-dropa text-base font-bold text-slate-900">
                  {store.currency}{property.price.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Viewing Format */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Select Tour Format</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setViewingType("In-Person Guided Tour")}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      viewingType === "In-Person Guided Tour"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-xs text-slate-900">In-Person Guided Tour</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Meet the resident broker on-site for a private tour of the apartment, amenities, security, and parking facilities.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingType("Live Video Walkthrough")}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      viewingType === "Live Video Walkthrough"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-900">Live 4K Video Tour</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Convenient for diaspora or busy executives. Live interactive FaceTime / Zoom walkthrough showing view angles and room dimensions.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 2: Date & Slot */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Date & Availability Window</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Select Tour Date
                    </label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Select Preferred Slot
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-2 text-[10px] font-bold rounded-xl border transition-colors ${
                            selectedSlot === slot
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Guest Credentials */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Guest & Leaseholder Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tunde Oladele"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="guest@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Move-In Timeline & Special Requirements
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Looking to move within 3 weeks, need parking for 2 vehicles..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm Private Viewing Tour</span>
              </button>
            </form>
          </div>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
