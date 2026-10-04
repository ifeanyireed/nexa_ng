"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_STORES } from "@/data/mockStores";
import { VerticalType } from "@/types/storefront";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Building2,
  Clock,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Calendar,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

function StoreInfoContent() {
  const searchParams = useSearchParams();
  const requestedVertical = (searchParams.get("vertical") as VerticalType) || "fashion";
  const [selectedVertical, setSelectedVertical] = useState<VerticalType>(
    MOCK_STORES[requestedVertical] ? requestedVertical : "fashion"
  );

  const store = MOCK_STORES[selectedVertical] || MOCK_STORES["fashion"];

  const verticalOptions: { key: VerticalType; label: string }[] = [
    { key: "fashion", label: "Fashion & Apparel" },
    { key: "cars", label: "Cars & Automotive" },
    { key: "food", label: "Food & Groceries" },
    { key: "property", label: "Property Rentals" },
    { key: "gadgets", label: "Gadgets & Tech" },
    { key: "beauty", label: "Beauty & Wellness" },
    { key: "home-living", label: "Home & Living" },
    { key: "pharmacy", label: "Health & Pharmacy" },
    { key: "hardware", label: "Hardware & Energy" },
    { key: "retail", label: "General Retail & Specialty" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Top Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full">
            Official Store Verification & Directory
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
            Store Information & Policies
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Verified operating details, physical location, opening hours, customer care channels, and merchant policies.
          </p>

          {/* Quick Vertical Selector */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {verticalOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedVertical(opt.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedVertical === opt.key
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Store Profile Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                {store.vertical} Merchant
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                Ofia Ecosystem Verified
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {store.name}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {store.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-stone-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-500" />
                {store.contact.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-stone-500" />
                {store.contact.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-stone-500" />
                {store.contact.email}
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Direct Customer Desk</span>
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Connect directly with verified store operators via WhatsApp or cellular dispatch.
            </p>
            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/${store.contact.whatsapp?.replace(/[^0-9]/g, "") || store.contact.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href={`tel:${store.contact.phone}`}
                className="w-full py-2.5 px-4 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Store Dispatch</span>
              </a>
            </div>
          </div>
        </div>

        {/* Operating Hours & Dispatch Windows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-stone-700" />
              <h3 className="text-lg font-bold text-stone-900">Operating & Dispatch Hours</h3>
            </div>

            <div className="divide-y divide-stone-100 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-stone-700">Monday – Friday</span>
                <span className="font-bold text-stone-900">8:00 AM – 7:30 PM WAT</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-stone-700">Saturday</span>
                <span className="font-bold text-stone-900">9:00 AM – 6:00 PM WAT</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-stone-700">Sunday</span>
                <span className="font-bold text-emerald-700">Online Orders Active (Dispatch Mon 8AM)</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-stone-700">Public Holidays</span>
                <span className="font-bold text-stone-600">Express Delivery Only (10AM – 4PM)</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                Order fulfillment and rider dispatch run continuously during business hours with live GPS order tracking.
              </p>
            </div>
          </div>

          {/* Delivery & Pickup Policies */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-stone-700" />
              <h3 className="text-lg font-bold text-stone-900">Fulfillment & Delivery Coverage</h3>
            </div>

            <div className="space-y-3.5 text-xs text-stone-600 leading-relaxed">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Same-Day Intra-City Dispatch</h4>
                  <p>Orders confirmed before 2:00 PM qualify for same-day delivery via Ofia Logistics network.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Showroom / Storefront Pickup</h4>
                  <p>Customers can pick up pre-packaged orders directly from our verified address with zero handling fees.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Nationwide Interstate Transit</h4>
                  <p>Interstate orders are dispatched through secure regional logistics hubs with 24–48hr delivery guarantees.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Protection, Return & Warranty Policies */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-stone-900">Customer Protection & Merchant Policies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-sm text-stone-900">100% Authenticity Guarantee</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                All merchandise is sourced directly from certified brand distributors and licensed manufacturers with verifiable batch tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-sm text-stone-900">Inspection on Delivery</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Customers retain the right to inspect goods at handover prior to OTP confirmation. Immediate replacement for damaged transit items.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-sm text-stone-900">Escrow Payment Protection</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Your payment is safely held in escrow until successful delivery confirmation, backed by Ofia Platform Buyer Protection.
              </p>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter store={store} />
    </div>
  );
}

export default function StoreInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center p-8">Loading Store Details...</div>}>
      <StoreInfoContent />
    </Suspense>
  );
}
