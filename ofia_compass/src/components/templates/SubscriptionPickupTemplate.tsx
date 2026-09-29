"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Truck,
  ArrowRight,
  BadgePercent,
  Layers,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  pickupsPerMonth: number;
  bagCapacityKg: number;
  turnaround: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "sub-starter",
    name: "Executive Weekly Express Plan",
    monthlyPrice: 35000,
    pickupsPerMonth: 4,
    bagCapacityKg: 10,
    turnaround: "24 Hours",
    description: "Ideal for busy professionals. Weekly scheduled wash, starch, steam press, and hanger return.",
    features: [
      "4 Scheduled Doorstep Pickups (1x Weekly)",
      "10kg Wash & Iron Capacity per load",
      "Starch & Steam Press Finish",
      "Complimentary Eco-friendly Laundry Bag",
    ],
  },
  {
    id: "sub-family",
    name: "Family Deluxe Mega Plan",
    monthlyPrice: 65000,
    pickupsPerMonth: 8,
    bagCapacityKg: 25,
    turnaround: "48 Hours",
    description: "Complete household laundry solution. Includes bedding, curtains, and delicate fabric care.",
    features: [
      "8 Scheduled Doorstep Pickups (2x Weekly)",
      "25kg Heavy Family Load capacity",
      "Bedding, Duvets & Towels Included",
      "Fabric Softener & Anti-bacterial rinse",
      "VIP Priority Dispatch Routing",
    ],
    isPopular: true,
  },
  {
    id: "sub-corporate",
    name: "Corporate & Hospitality Bulk Plan",
    monthlyPrice: 150000,
    pickupsPerMonth: 12,
    bagCapacityKg: 70,
    turnaround: "24 Hours",
    description: "Tailored for small boutique hotels, clinics, offices, and executive service apartments.",
    features: [
      "12 Scheduled Pickups (3x Weekly)",
      "70kg Commercial Capacity",
      "Industrial Stain Treatment",
      "Dedicated Account Manager",
    ],
  },
];

interface SubscriptionPickupTemplateProps {
  title?: string;
  subtitle?: string;
  subdomain?: string;
}

export const SubscriptionPickupTemplate: React.FC<SubscriptionPickupTemplateProps> = ({
  title = "Subscription Laundry & Pickup Schedule",
  subtitle = "Never worry about laundry or pickup chores again. Subscribe to automated weekly doorstep collection, steam pressing, and delivery across Lagos and Abuja.",
  subdomain = "laundry",
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]);
  const [pickupDay, setPickupDay] = useState("Tuesday");
  const [pickupTime, setPickupTime] = useState("08:00 AM - 10:00 AM");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const times = ["07:00 AM - 09:00 AM", "09:00 AM - 11:00 AM", "01:00 PM - 03:00 PM", "04:00 PM - 06:00 PM"];

  return (
    <div className="space-y-6 pb-20">
      {/* HERO BANNER & PICKUP PREFERENCE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#3F83F8]/10 via-[var(--nexa-bg-surface)] to-[var(--nexa-bg-base)] border border-[#3F83F8]/20 space-y-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <NexaBadge variant="blue" className="font-mono text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
            Subscription Pickup • {subdomain}.ofia.ng
          </NexaBadge>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#0E9F6E] font-bold">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Automated Doorstep Logistics</span>
          </div>
        </div>

        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--nexa-text-primary)] tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)] leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* SCHEDULE PREFERENCES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] shadow-inner">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Preferred Weekly Pickup Day
            </label>
            <select
              value={pickupDay}
              onChange={(e) => setPickupDay(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            >
              {days.map((d) => (
                <option key={d} value={d} className="bg-[var(--nexa-bg-surface)]">
                  {d}s
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Pickup Time Window
            </label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            >
              {times.map((t) => (
                <option key={t} value={t} className="bg-[var(--nexa-bg-surface)]">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[var(--nexa-text-muted)] block">Selected Plan</span>
              <span className="text-xs font-bold text-[#3F83F8]">{selectedPlan.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PLANS SELECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          return (
            <NexaCard
              key={plan.id}
              variant="glass"
              padding="md"
              className={`border transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-[#3F83F8] ring-1 ring-[#3F83F8] bg-[#3F83F8]/5 shadow-sm"
                  : "border-[var(--nexa-border)] hover:border-[#3F83F8]/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#3F83F8] uppercase">
                    {plan.pickupsPerMonth} Pickups / Month
                  </span>
                  {plan.isPopular && <NexaBadge variant="brand">Recommended</NexaBadge>}
                </div>

                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] leading-tight">
                  {plan.name}
                </h3>

                <p className="text-[11px] text-[var(--nexa-text-secondary)]">{plan.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-[var(--nexa-border)]">
                  <span className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] font-bold">
                    Plan Benefits:
                  </span>
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-[var(--nexa-text-primary)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0E9F6E] shrink-0" />
                      <span className="text-[11px]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--nexa-border)] mt-4 flex items-center justify-between">
                <div>
                  <span className="text-base font-black font-mono text-[var(--nexa-text-primary)]">
                    ₦{plan.monthlyPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono"> / month</span>
                </div>

                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#3F83F8] text-white shadow-xs"
                      : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] hover:border-[#3F83F8]"
                  }`}
                >
                  {isSelected ? "Active Choice" : "Select Plan"}
                </button>
              </div>
            </NexaCard>
          );
        })}
      </div>

      {/* SUBSCRIPTION ACTIVATION DOCK */}
      <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3F83F8]/10 border border-[#3F83F8]/30 flex items-center justify-center text-[#3F83F8] shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
              {selectedPlan.name} (Recurring on {pickupDay}s)
            </div>
            <div className="text-[11px] text-[var(--nexa-text-muted)]">
              First pickup scheduled for next <span className="font-bold text-[var(--nexa-text-primary)]">{pickupDay} at {pickupTime}</span>
            </div>
          </div>
        </div>

        <Link href="/book/nexa-verified/checkout" className="w-full sm:w-auto">
          <NexaButton size="md" variant="primary" className="w-full sm:w-auto bg-[#3F83F8] hover:bg-[#2F6FD8] text-white font-bold text-xs justify-center">
            Subscribe & Schedule First Pickup (₦{selectedPlan.monthlyPrice.toLocaleString()}) <ArrowRight className="w-4 h-4 ml-1.5" />
          </NexaButton>
        </Link>
      </NexaCard>
    </div>
  );
};
