"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  PackageCheck,
  Truck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("ref") || "OFIA-882194";
  const customerName = searchParams.get("name") || "Customer";

  return (
    <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 shadow-xl text-center space-y-6 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          Order Reference: {orderRef}
        </span>
        <h1 className="font-dropa text-3xl font-bold text-stone-900">
          Payment Confirmed, {customerName}!
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          Your order has been transmitted directly to the merchant atelier. A live GPS dispatch tracking link has been sent to your WhatsApp number.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-left space-y-3">
        <div className="flex items-center gap-2 text-stone-800 font-bold">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>Estimated Dispatch Timeline</span>
        </div>
        <p className="text-stone-600 leading-relaxed">
          Standard orders are processed within 2-4 hours. You will receive an SMS and email notification once your rider picks up the parcel.
        </p>
        <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-stone-500">
          <span>Escrow Protection: Active</span>
          <span className="text-emerald-700 font-bold">Verified by Ofia Commerce</span>
        </div>
      </div>

      <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/order-tracking?ref=${orderRef}`}
          className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-colors"
        >
          <Truck className="w-4 h-4" />
          <span>Track Live Dispatch</span>
        </Link>
        <Link
          href="/templates"
          className="px-6 py-3 rounded-full border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <span>Explore All 7 Templates</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#111318] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-xs text-stone-500">Loading order details...</div>}>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
