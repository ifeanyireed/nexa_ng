"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Car,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  MapPin,
  Building,
  User,
  CreditCard,
  Check,
  Sparkles,
} from "lucide-react";

export default function BookTestDrivePage() {
  const params = useParams();
  const store = MOCK_STORES.cars;

  const vehicleId = (params?.id as string) || "car-001";
  const vehicle =
    MOCK_PRODUCTS.find((p) => p.id === vehicleId && p.vertical === "cars") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "cars") ||
    MOCK_PRODUCTS[0];

  const meta = vehicle.carMeta;

  // Booking Flow State
  const [driveType, setDriveType] = useState<"Dealership Showroom" | "At-Home Valet">("Dealership Showroom");
  const [selectedDate, setSelectedDate] = useState("2026-10-06");
  const [selectedSlot, setSelectedSlot] = useState("11:00 AM - 12:00 PM");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const timeSlots = [
    "09:30 AM - 10:30 AM",
    "11:00 AM - 12:00 PM",
    "02:00 PM - 03:00 PM",
    "04:00 PM - 05:00 PM",
  ];

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    const ref = `TD-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(ref);
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href={`/cars/listing/${vehicle.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to {vehicle.title}</span>
        </Link>

        {confirmed ? (
          /* Confirmation Screen */
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                Booking Reference: {bookingRef}
              </span>
              <h1 className="font-dropa text-3xl font-bold text-slate-900">
                Test-Drive Slot Reserved!
              </h1>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Your test-drive request for the <strong>{vehicle.title}</strong> has been logged with the executive sales team.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Service Type:</span>
                <span className="font-bold text-slate-900">{driveType}</span>
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
                <span className="text-slate-500">Driver / Client:</span>
                <span className="font-bold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-900">
                  {driveType === "At-Home Valet" ? address : store.contact.address}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/cars/listings"
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Browse More Fleet
              </Link>
              <Link
                href={`/cars/listing/${vehicle.id}`}
                className="px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                View Vehicle Specs
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form Screen */
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Car className="w-3.5 h-3.5" />
                <span>Test-Drive & Mechanical Inspection</span>
              </div>
              <h1 className="font-dropa text-3xl font-bold text-slate-900">
                Schedule a VIP Test-Drive
              </h1>
              <p className="text-sm text-slate-500">
                Experience the performance and comfort firsthand with our certified product specialists.
              </p>
            </div>

            {/* Selected Vehicle Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <img
                src={vehicle.images[0]}
                alt={vehicle.title}
                className="w-24 h-20 rounded-2xl object-cover shrink-0 bg-slate-900"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Selected Vehicle
                </span>
                <h3 className="font-dropa text-base font-bold text-slate-900 truncate">
                  {vehicle.title}
                </h3>
                <p className="text-xs text-slate-600">
                  {meta?.year} · {meta?.mileage} · {meta?.transmission} · {meta?.engine}
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-slate-400 block">Outright</span>
                <span className="font-dropa text-base font-bold text-slate-900">
                  {store.currency}{vehicle.price.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-6">
              {/* Step 1: Drive Format */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Select Test-Drive Experience</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDriveType("Dealership Showroom")}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      driveType === "Dealership Showroom"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-xs text-slate-900">Dealership Showroom</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Visit our flagship showroom on Victoria Island with dedicated test circuits and hydraulic ramp inspection.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDriveType("At-Home Valet")}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      driveType === "At-Home Valet"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-900">At-Home Valet Delivery</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Our certified specialist drives the car to your residence or office in Lagos for private assessment.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 2: Date & Slot */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Preferred Date & Appointment Slot</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Select Inspection Date
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
                      Preferred Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2">
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

              {/* Step 3: Client & Driver Details */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="font-dropa text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Driver & Contact Credentials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Babatunde Adeleke"
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
                      placeholder="driver@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Driver&apos;s License ID
                    </label>
                    <input
                      type="text"
                      placeholder="FRSC license or International permit"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {driveType === "At-Home Valet" && (
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Residential / Office Delivery Address (Lagos)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Street, Estate Name, Lekki / Ikoyi / Ikeja"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm VIP Test-Drive Reservation</span>
              </button>
            </form>
          </div>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
