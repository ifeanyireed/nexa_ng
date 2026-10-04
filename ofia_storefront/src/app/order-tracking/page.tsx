"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Store,
  Compass,
} from "lucide-react";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "OFIA-882194";
  const [trackingNumber, setTrackingNumber] = useState(initialRef);

  const steps = [
    {
      title: "Order Confirmed",
      time: "10:14 AM",
      desc: "Merchant received order & payment confirmed via Ofia Escrow",
      completed: true,
      current: false,
    },
    {
      title: "Atelier Preparation",
      time: "11:30 AM",
      desc: "Items verified, quality inspected & packaged for dispatch",
      completed: true,
      current: false,
    },
    {
      title: "Ofia Dispatch Assigned",
      time: "12:10 PM",
      desc: "Rider assigned: Chidi Okeke · Yamaha Force (Plate: KJA-482-XA)",
      completed: true,
      current: false,
    },
    {
      title: "Out for Delivery",
      time: "01:25 PM",
      desc: "Rider is 3.2km away approaching destination address",
      completed: true,
      current: true,
    },
    {
      title: "Delivered & Verified",
      time: "Est. 01:50 PM",
      desc: "Recipient verification code: 8291",
      completed: false,
      current: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </Link>
        <span className="text-xs font-semibold text-stone-500">
          Live GPS Logistics Network · Powered by Ofia Dispatch
        </span>
      </div>

      {/* Main Tracking Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-stone-200/90 shadow-xl space-y-8">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
              <Truck className="w-3.5 h-3.5" />
              <span>Live Delivery Tracking</span>
            </div>
            <h1 className="font-dropa text-2xl sm:text-3xl font-bold text-zinc-900">
              Order #{trackingNumber}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Estimated Delivery: <strong>Today, by 02:00 PM</strong> · Destination: Victoria Island, Lagos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-right">
              <div className="text-[10px] font-black uppercase tracking-wider">Status</div>
              <div className="text-sm font-bold">In-Transit</div>
            </div>
          </div>
        </div>

        {/* Visual Progress Steps */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Dispatch Progress Timeline
          </h2>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {steps.map((s, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Node indicator */}
                <div
                  className={`absolute -left-6 sm:-left-8 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    s.completed
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-stone-300 text-stone-400"
                  } ${s.current ? "ring-4 ring-blue-100 animate-pulse" : ""}`}
                >
                  {s.completed ? "✓" : idx + 1}
                </div>

                <div className="flex-1 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-900">{s.title}</span>
                    <span className="text-xs font-semibold text-stone-400">{s.time}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rider & Logistics Job Card (Blueprint Section 5.2) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1117] text-white space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-bold uppercase tracking-wider text-[#0069FF]">
              Assigned Logistics Rider
            </span>
            <span>OTP Code on Arrival: <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">8291</strong></span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 text-[#0069FF] font-bold flex items-center justify-center text-base border border-blue-500/30">
                CO
              </div>
              <div>
                <div className="font-bold text-sm text-white">Chidi Okeke</div>
                <div className="text-xs text-zinc-400">Yamaha Force 155 · Blue Express Box</div>
              </div>
            </div>

            <a
              href="tel:+2348039912040"
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Rider</span>
            </a>
          </div>
        </div>

        {/* Escrow & Guarantee Details */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Funds held safely in Ofia Escrow until successful OTP verification.</span>
          </div>
          <Link href="/templates" className="font-bold text-blue-600 hover:underline">
            Visit Templates Hub
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#111318] py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center py-20 text-stone-500">Loading tracking information...</div>}>
        <TrackingContent />
      </Suspense>
    </div>
  );
}
