"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Car,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Fuel,
  Settings2,
  Calendar,
  ChevronLeft,
  Share2,
  Phone,
  MessageSquare,
  FileText,
  BadgeCheck,
  Send,
  Check,
} from "lucide-react";

export default function CarDetailPage() {
  const params = useParams();
  const store = MOCK_STORES.cars;

  const carId = (params?.id as string) || "car-001";
  const car =
    MOCK_PRODUCTS.find((p) => p.id === carId && p.vertical === "cars") ||
    MOCK_PRODUCTS.find((p) => p.vertical === "cars") ||
    MOCK_PRODUCTS[0];

  const meta = car.carMeta;
  const [selectedImage, setSelectedImage] = useState(0);

  // Inquiry Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState<"Price Offer" | "Availability" | "Finance Options">("Availability");
  const [message, setMessage] = useState(
    `Hello, I would like to inquire about the ${car.title} listed on Ofia.`
  );
  const [inquirySent, setInquirySent] = useState(false);

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setInquirySent(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/cars/listings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: car.title,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Listing URL copied to clipboard");
              }
            }}
            className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Share Vehicle"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Vehicle Showcase Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
              <img
                src={car.images[selectedImage] || car.images[0]}
                alt={car.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs border border-white/10">
                  {meta?.condition || "Certified"}
                </span>
                {meta?.year && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                    {meta.year} Model
                  </span>
                )}
              </div>
              {meta?.vin && (
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-900/80 text-slate-300 backdrop-blur-xs">
                  VIN: {meta.vin}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {car.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {car.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-16/10 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-blue-600 ring-2 ring-blue-600/20"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${car.title} preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Vehicle Description */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-dropa text-lg font-bold text-slate-900">
                Dealer Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                {car.description}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Standard Factory Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {car.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing, Actions & Inquiry Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Title & Price Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {meta?.make} · {meta?.model}
                </span>
                <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {car.title}
                </h1>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                    Verified Dealership Price
                  </span>
                  <span className="font-dropa text-2xl sm:text-3xl font-bold text-slate-900">
                    {store.currency}{car.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Available in Stock
                  </span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2.5">
                <Link
                  href={`/cars/book-test-drive/${car.id}`}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                >
                  <Car className="w-4 h-4" />
                  <span>Book Test-Drive & Inspection</span>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${store.contact.whatsapp?.replace(/[^0-9]/g, "")}?text=Hi,%20I%20am%20interested%20in%20the%20${encodeURIComponent(car.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Desk</span>
                  </a>
                  <a
                    href={`tel:${store.contact.phone}`}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Sales Rep</span>
                  </a>
                </div>
              </div>

              {/* Key Quick Specs Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mileage</span>
                  <span className="font-bold text-slate-800">{meta?.mileage || "N/A"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Transmission</span>
                  <span className="font-bold text-slate-800">{meta?.transmission || "Automatic"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Engine / Power</span>
                  <span className="font-bold text-slate-800">{meta?.engine || "V6"} ({meta?.horsepower || "300 hp"})</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Drivetrain</span>
                  <span className="font-bold text-slate-800">{meta?.drivetrain || "AWD"}</span>
                </div>
              </div>
            </div>

            {/* Direct Inquiry Form Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-dropa text-base font-bold text-slate-900">
                  Direct Dealer Inquiry
                </h3>
              </div>

              {inquirySent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Inquiry Dispatched Successfully!</span>
                  </div>
                  <p className="text-emerald-800">
                    A dedicated representative from {store.name} will reach out to you via phone/WhatsApp within 20 minutes with the vehicle dossier.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Inquiry Intent
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["Availability", "Price Offer", "Finance Options"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setInquiryType(type)}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                            inquiryType === type
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adebayo Adeleke"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Phone / WhatsApp
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
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Message / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 150-Point Certified Inspection Checklist */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-dropa text-xl font-bold text-slate-900">
                  Certified 150-Point Pre-Sale Inspection Audit
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Performed by certified master technicians on chassis VIN: {meta?.vin || "VERIFIED-OK"}
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block">Audit Score</span>
                <span className="font-dropa text-lg font-bold">{meta?.inspectionScore || 98}/100 Grade A</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Powertrain & Transmission</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Compression & cylinder balance: 100%</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Transmission shift points: Smooth</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Fluid purity & leak audit: Zero leaks</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>2. Frame & Body Integrity</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Digital paint meter scan: Factory coat</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Accident history: Clean record</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Undercarriage & chassis: Pristine</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3. Electronics & Safety</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>OBD-II ECU computer scan: 0 error codes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>ABS, Airbags & Radar sensors: Passed</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Dual climate AC compressor: Peak chill</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
