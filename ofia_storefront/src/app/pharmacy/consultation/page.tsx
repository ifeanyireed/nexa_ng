"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Stethoscope,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
  User,
  Phone,
} from "lucide-react";

export default function PharmacyConsultationPage() {
  const store = MOCK_STORES["pharmacy"];
  const services = MOCK_SERVICES.filter((s) => s.vertical === "pharmacy");

  const [selectedService, setSelectedService] = useState(services[0]?.id || "srv-phm-01");
  const [sessionType, setSessionType] = useState<"virtual" | "in-person">("virtual");
  const [date, setDate] = useState("2026-10-15");
  const [timeSlot, setTimeSlot] = useState("11:00 AM - 11:30 AM");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const availableSlots = [
    "09:30 AM - 10:00 AM",
    "11:00 AM - 11:30 AM",
    "02:00 PM - 02:30 PM",
    "04:30 PM - 05:00 PM",
  ];

  const currentService = services.find((s) => s.id === selectedService) || services[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#13221C] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/pharmacy"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Pharmacy</span>
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-teal-100 p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Appointment Reference #PHM-{(Math.random() * 90000 + 10000).toFixed(0)}
              </span>
              <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                Consultation Appointment Confirmed
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Your appointment with <strong>{currentService?.specialistName}</strong> has been secured for {date} at {timeSlot}. We have sent a calendar invite and encrypted tele-health link to your contact details.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/pharmacy"
                className="px-6 py-3 rounded-full bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs"
              >
                Return to Pharmacy
              </Link>
              <Link
                href="/account"
                className="px-6 py-3 rounded-full border border-teal-200 text-teal-900 font-bold text-xs hover:bg-teal-50"
              >
                View in Account Bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 border-b border-stone-200 pb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-widest">
                <Stethoscope className="w-4 h-4" />
                <span>Licensed Clinical Pharmacy Service</span>
              </div>
              <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                Book a Pharmacist Consultation
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
                Comprehensive medication therapy reviews, drug interaction checks, dosage timing adjustments, and automated maintenance refill plans.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-teal-100 p-6 sm:p-10 shadow-xs space-y-8">
              {/* Service Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-teal-950 block">
                  1. Select Clinical Service
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedService === srv.id
                          ? "border-teal-700 bg-teal-50/60 shadow-xs"
                          : "border-stone-200 bg-white hover:border-teal-200"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                          {srv.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-teal-950">
                          {srv.title}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {srv.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-teal-100/60 flex items-center justify-between text-xs">
                        <span className="font-bold text-teal-950">₦{srv.price.toLocaleString()}</span>
                        <span className="text-stone-400 font-medium">{srv.durationMinutes} Mins</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Type */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-teal-950 block">
                  2. Consultation Medium
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSessionType("virtual")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      sessionType === "virtual"
                        ? "border-teal-700 bg-teal-50 text-teal-950 font-bold"
                        : "border-stone-200 bg-white text-stone-600"
                    }`}
                  >
                    <Video className="w-5 h-5 text-teal-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Encrypted Telehealth Video / Phone</p>
                      <p className="text-[11px] text-stone-500">Consult from the comfort of home</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSessionType("in-person")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      sessionType === "in-person"
                        ? "border-teal-700 bg-teal-50 text-teal-950 font-bold"
                        : "border-stone-200 bg-white text-stone-600"
                    }`}
                  >
                    <MapPin className="w-5 h-5 text-teal-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">In-Dispensary Private Consultation Room</p>
                      <p className="text-[11px] text-stone-500">Visit our verified flagship pharmacy</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-teal-950 block">
                    3. Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full border border-teal-100 bg-teal-50/10 text-xs sm:text-sm text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-teal-950 block">
                    4. Available Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full border border-teal-100 bg-teal-50/10 text-xs sm:text-sm text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  >
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient Info */}
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-teal-950 block">
                  5. Patient Contact Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Samuel Okon"
                      className="w-full px-4 py-2.5 rounded-full border border-teal-100 bg-teal-50/10 text-xs sm:text-sm text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-700"
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
                      className="w-full px-4 py-2.5 rounded-full border border-teal-100 bg-teal-50/10 text-xs sm:text-sm text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Confirm Consultation Booking · ₦{currentService?.price.toLocaleString()}</span>
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
