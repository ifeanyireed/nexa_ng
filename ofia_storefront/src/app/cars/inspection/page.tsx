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
  Calendar,
  Clock,
  Car,
  FileText,
  MapPin,
} from "lucide-react";

export default function CarsInspectionPage() {
  const store = MOCK_STORES["cars"];
  const service = MOCK_SERVICES.find((s) => s.id === "srv-car-01") || MOCK_SERVICES[0];

  const [date, setDate] = useState("2026-10-18");
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 11:30 AM");
  const [vehicleInfo, setVehicleInfo] = useState("Mercedes-Benz GLE 450 (VIN: 4JGDDA...)");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const timeSlots = [
    "08:30 AM - 10:00 AM",
    "10:00 AM - 11:30 AM",
    "01:00 PM - 02:30 PM",
    "03:30 PM - 05:00 PM",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/cars"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dealership</span>
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Inspection Docket #CAR-{(Math.random() * 90000 + 10000).toFixed(0)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                150-Point Inspection Booking Confirmed
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your diagnostic session with <strong>{service.specialistName}</strong> has been secured for {date} at {timeSlot}. A comprehensive 12-page mechanical report and paint gauge scan will be generated at completion.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/cars"
                className="px-6 py-3 rounded-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
              >
                Return to Vehicle Showroom
              </Link>
              <Link
                href="/account"
                className="px-6 py-3 rounded-full border border-slate-300 text-slate-900 font-bold text-xs hover:bg-slate-50"
              >
                View in Account Bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <Wrench className="w-4 h-4" />
                <span>Certified Automotive Engineering</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                150-Point Pre-Purchase Mechanical Inspection
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Electronic OBD-II powertrain scan, paint depth meter body audit, transmission hydraulic pressure test, undercarriage rust analysis, and high-speed road test.
              </p>
            </div>

            {/* Service Highlight Card */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Lead Diagnostic Inspector
                </span>
                <p className="font-extrabold text-base">{service.specialistName}</p>
                <p className="text-xs text-slate-300">{service.specialistRole}</p>
              </div>
              <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Standard Audit Fee</span>
                <span className="text-2xl font-black text-white">₦{service.price.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Vehicle & Inspection Details
                </label>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Target Vehicle Model / VIN / Stock Number
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    placeholder="e.g. 2023 Mercedes-Benz GLE 450 or Showroom Stock #GLE-01"
                    className="w-full px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Diagnostic Time Window
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Your Contact Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Chief Emeka Danjuma"
                      className="w-full px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Phone Number / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Confirm Inspection Booking · ₦{service.price.toLocaleString()}</span>
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
