"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  Copy,
  Check,
  Share2,
  Navigation,
  ShieldCheck,
  Phone,
  ArrowRight,
  MessageCircle,
  Clock,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import { useStorefrontTenant } from "@/context/StorefrontTenantContext";

function DispatchConfirmedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tenantSlug, store } = useStorefrontTenant();

  const waybillRef = searchParams.get("ref") || "OFIA-DP-782910";
  const deliveryOtp = searchParams.get("otp") || "4819";
  const fare = searchParams.get("fare") || "3,650";
  const recipientName = searchParams.get("recipient") || "Recipient";

  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const storeDisplayName = store?.name || (tenantSlug ? tenantSlug.toUpperCase() : "Ofia Dispatch");
  const storePhone = store?.contact?.phone || "+234 800 000 0000";
  const storeWhatsApp = store?.contact?.whatsapp || "";

  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/order-tracking?ref=${encodeURIComponent(waybillRef)}&tenant=${encodeURIComponent(tenantSlug || "")}`
    : `/order-tracking?ref=${encodeURIComponent(waybillRef)}`;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(waybillRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(deliveryOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const shareText = `Hi ${recipientName}, I have dispatched a parcel to you via ${storeDisplayName}.\n\n📦 Waybill: ${waybillRef}\n🔑 Delivery OTP: ${deliveryOtp}\n📍 Track Live Delivery: ${trackingUrl}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href={`/dispatch${tenantSlug ? `?tenant=${tenantSlug}` : ""}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Book Another Courier Delivery</span>
        </Link>

        {/* Confirmation Hero Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wider uppercase">
              <Truck className="w-3.5 h-3.5" />
              <span>Courier Booking Confirmed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Your Pickup Has Been Dispatched
            </h1>
            <p className="text-stone-600 text-sm max-w-md mx-auto">
              Our operations team at <span className="font-semibold text-stone-900">{storeDisplayName}</span> has
              ingested your waybill. A nearby rider is being allocated now.
            </p>
          </div>

          {/* Key Reference Cards: Waybill & OTP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
            {/* Waybill Card */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
              <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">
                Waybill Tracking Number
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-lg font-black text-blue-700 tracking-wide">
                  {waybillRef}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="p-1.5 rounded-lg hover:bg-stone-200/70 text-stone-600 transition-colors"
                  title="Copy Waybill"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-stone-500">Use this reference for live GPS radar lookup.</p>
            </div>

            {/* Delivery OTP Card */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Handover OTP</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="p-1.5 rounded-lg hover:bg-emerald-200/70 text-emerald-700 transition-colors"
                  title="Copy OTP"
                >
                  {copiedOtp ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="font-mono text-2xl font-black text-emerald-950 tracking-widest">
                {deliveryOtp}
              </div>
              <p className="text-[11px] text-emerald-800">
                Give this code to <span className="font-bold">{recipientName}</span> to verify final delivery.
              </p>
            </div>
          </div>

          {/* Fare Summary & Payment Notice */}
          <div className="bg-stone-50 rounded-2xl p-4 flex items-center justify-between border border-stone-200/80 text-sm">
            <span className="text-stone-600 font-medium">Settled Delivery Fee:</span>
            <span className="font-bold text-stone-900 font-mono text-base">₦{fare}</span>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Link
              href={`/order-tracking?ref=${encodeURIComponent(waybillRef)}${tenantSlug ? `&tenant=${encodeURIComponent(tenantSlug)}` : ""}`}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow"
            >
              <Navigation className="w-5 h-5" />
              <span>Track Live Delivery On Radar</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>Share Tracking & OTP to Recipient via WhatsApp</span>
            </a>
          </div>

          {/* Dispatch Desk Support */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Dispatcher Response: Under 3 mins</span>
            </span>
            <a
              href={`tel:${storePhone}`}
              className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-blue-600"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Dispatch Desk: {storePhone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DispatchConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <DispatchConfirmedContent />
    </Suspense>
  );
}
