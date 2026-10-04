"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_SERVICES } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
  ChevronLeft,
  CheckCircle2,
  Check,
  MapPin,
} from "lucide-react";

function AppointmentBookingForm() {
  const searchParams = useSearchParams();
  const store = MOCK_STORES.beauty;
  const services = MOCK_SERVICES.filter((s) => s.vertical === "beauty");

  const initialServiceId = searchParams.get("service") || services[0]?.id || "srv-bty-01";
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);

  const activeService =
    services.find((s) => s.id === selectedServiceId) || services[0];

  const [selectedDate, setSelectedDate] = useState("2026-10-09");
  const [selectedSlot, setSelectedSlot] = useState("11:30 AM");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [appointmentCode, setAppointmentCode] = useState("");

  const timeSlots = [
    "09:30 AM",
    "11:30 AM",
    "01:30 PM",
    "03:30 PM",
    "05:00 PM",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;
    const code = `SPA-${Math.floor(100000 + Math.random() * 900000)}`;
    setAppointmentCode(code);
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-rose-100 shadow-xl text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
            Appointment ID: {appointmentCode}
          </span>
          <h1 className="font-dropa text-3xl font-bold text-zinc-900">
            Studio Session Reserved!
          </h1>
          <p className="text-zinc-600 text-sm max-w-md mx-auto">
            Your appointment for <strong>{activeService.title}</strong> has been logged in our studio calendar.
          </p>
        </div>

        <div className="max-w-md mx-auto p-5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs text-left space-y-2.5">
          <div className="flex justify-between py-1 border-b border-rose-100">
            <span className="text-zinc-500">Service:</span>
            <span className="font-bold text-zinc-900">{activeService.title}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-rose-100">
            <span className="text-zinc-500">Specialist:</span>
            <span className="font-bold text-zinc-900">{activeService.specialistName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-rose-100">
            <span className="text-zinc-500">Date & Slot:</span>
            <span className="font-bold text-zinc-900">{selectedDate} at {selectedSlot}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-rose-100">
            <span className="text-zinc-500">Client:</span>
            <span className="font-bold text-zinc-900">{clientName} ({clientPhone})</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-zinc-500">Studio Address:</span>
            <span className="font-bold text-zinc-900">{store.contact.address}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/beauty/products"
            className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            Shop Home Skincare
          </Link>
          <Link
            href="/beauty"
            className="px-6 py-3 rounded-full border border-rose-200 hover:bg-rose-50 text-zinc-700 font-bold text-xs transition-colors"
          >
            Return to Sanctuary Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Aesthetic Sanctuary Appointments</span>
        </div>
        <h1 className="font-dropa text-3xl font-bold text-zinc-900">
          Book an In-Studio Aesthetic Ritual
        </h1>
        <p className="text-sm text-zinc-500">
          Select your customized clinical facial or hair wellness session with our lead aesthetic practitioners.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Service */}
        <div className="p-6 rounded-3xl bg-white border border-rose-100/80 shadow-xs space-y-4">
          <h3 className="font-dropa text-base font-bold text-zinc-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            <span>Select Aesthetic Treatment</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => setSelectedServiceId(srv.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedServiceId === srv.id
                    ? "border-rose-600 bg-rose-50/50 ring-2 ring-rose-600/20"
                    : "border-rose-100 hover:border-rose-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-zinc-900">{srv.title}</span>
                  <span className="text-xs font-bold text-rose-700">
                    {store.currency}{srv.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>
                <div className="mt-2 text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-500" />
                  <span>{srv.durationMinutes} Minutes Session</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Date & Slot */}
        <div className="p-6 rounded-3xl bg-white border border-rose-100/80 shadow-xs space-y-4">
          <h3 className="font-dropa text-base font-bold text-zinc-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            <span>Appointment Date & Time Slot</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-600 block mb-1.5">
                Preferred Date
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-rose-100 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-600 block mb-1.5">
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-colors ${
                      selectedSlot === slot
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-rose-50/50 text-zinc-700 border-rose-100 hover:bg-rose-100"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Guest Contact & Notes */}
        <div className="p-6 rounded-3xl bg-white border border-rose-100/80 shadow-xs space-y-4">
          <h3 className="font-dropa text-base font-bold text-zinc-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            <span>Client Profile & Skin Sensitivity Notes</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zainab Balogun"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                WhatsApp / Phone
              </label>
              <input
                type="tel"
                required
                placeholder="+234 800 000 0000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="client@domain.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 block mb-1">
              Skin Sensitivities or Special Requests
            </label>
            <textarea
              rows={2}
              placeholder="Allergies (e.g. nuts, fragrance), current retinoid usage, or specific areas of concern..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Confirm Studio Booking · {store.currency}{activeService.price.toLocaleString()}</span>
        </button>
      </form>
    </div>
  );
}

export default function BeautyBookAppointmentPage() {
  const store = MOCK_STORES.beauty;

  return (
    <div className="min-h-screen bg-[#FCF9F6] text-[#201D1A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/beauty/services"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Treatment Menu</span>
        </Link>

        <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading booking wizard...</div>}>
          <AppointmentBookingForm />
        </Suspense>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
