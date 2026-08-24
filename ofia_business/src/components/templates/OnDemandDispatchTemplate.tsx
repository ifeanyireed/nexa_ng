"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Bike,
  Car,
  Package,
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface VehicleClass {
  id: string;
  name: string;
  category: "Bike" | "Sedan" | "Van" | "Truck";
  eta: string;
  baseFare: number;
  perKm: number;
  capacity: string;
  icon: any;
}

const VEHICLE_CLASSES: VehicleClass[] = [
  {
    id: "v-bike",
    name: "Express Motorbike Courier",
    category: "Bike",
    eta: "4-8 mins",
    baseFare: 1500,
    perKm: 250,
    capacity: "Up to 15kg (Documents, food, small parcels)",
    icon: Bike,
  },
  {
    id: "v-sedan",
    name: "Comfort Private Ride / Parcel",
    category: "Sedan",
    eta: "6-10 mins",
    baseFare: 3500,
    perKm: 450,
    capacity: "4 Passengers or 50kg Luggage (AC cooled)",
    icon: Car,
  },
  {
    id: "v-van",
    name: "Cargo Delivery Van",
    category: "Van",
    eta: "15-20 mins",
    baseFare: 18000,
    perKm: 900,
    capacity: "Up to 1.5 Tons (Home appliances, stock boxes)",
    icon: Package,
  },
  {
    id: "v-truck",
    name: "Heavy Duty Haulage Truck",
    category: "Truck",
    eta: "30-45 mins",
    baseFare: 45000,
    perKm: 1800,
    capacity: "Up to 10 Tons (Industrial equipment, building items)",
    icon: Truck,
  },
];

interface OnDemandDispatchTemplateProps {
  title?: string;
  subtitle?: string;
  subdomain?: string;
}

export const OnDemandDispatchTemplate: React.FC<OnDemandDispatchTemplateProps> = ({
  title = "On-Demand Rides & Dispatch",
  subtitle = "Instant parcel delivery, interstate haulage, and verified commuter transit with live GPS tracking.",
  subdomain = "rides",
}) => {
  const [pickup, setPickup] = useState("14 Admiralty Way, Lekki Phase 1, Lagos");
  const [dropoff, setDropoff] = useState("Civic Centre, Ozumba Mbadiwe, Victoria Island, Lagos");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("v-bike");
  const [estimatedKm, setEstimatedKm] = useState<number>(8.5);

  const activeVehicle = VEHICLE_CLASSES.find((v) => v.id === selectedVehicle) || VEHICLE_CLASSES[0];
  const calculatedFare = Math.round(activeVehicle.baseFare + estimatedKm * activeVehicle.perKm);

  return (
    <div className="space-y-6 pb-20">
      {/* HERO & DISPATCH COCKPIT */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0E9F6E]/10 via-[var(--nexa-bg-surface)] to-[var(--nexa-bg-base)] border border-[#0E9F6E]/20 space-y-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <NexaBadge variant="green" className="font-mono text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 inline mr-1" />
            On-Demand Dispatch • {subdomain}.ofia.ng
          </NexaBadge>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--nexa-text-muted)]">
            <Zap className="w-3.5 h-3.5 text-[#0E9F6E]" />
            <span>420+ Verified Couriers Online in Lagos</span>
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

        {/* ROUTE PICKUP & DROPOFF INPUTS */}
        <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] shadow-inner space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#0E9F6E] shrink-0 ring-4 ring-[#0E9F6E]/20" />
            <div className="flex-1">
              <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
                Pickup Address
              </label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none"
              />
            </div>
          </div>

          <div className="border-t border-[var(--nexa-border)]" />

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#E02424] shrink-0 ring-4 ring-[#E02424]/20" />
            <div className="flex-1">
              <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
                Delivery Destination
              </label>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* VEHICLE CLASS SELECTION GRID */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center justify-between">
          <span>Choose Transport Mode</span>
          <span className="text-xs font-mono text-[var(--nexa-text-muted)] font-normal">
            Est. Distance: {estimatedKm} km
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VEHICLE_CLASSES.map((vc) => {
            const Icon = vc.icon;
            const fare = Math.round(vc.baseFare + estimatedKm * vc.perKm);
            const isSelected = selectedVehicle === vc.id;

            return (
              <div
                key={vc.id}
                onClick={() => setSelectedVehicle(vc.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                  isSelected
                    ? "bg-[#0E9F6E]/10 border-[#0E9F6E] shadow-sm ring-1 ring-[#0E9F6E]"
                    : "bg-[var(--nexa-bg-surface)] hover:bg-[var(--nexa-bg-base)] border-[var(--nexa-border)]"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-[#0E9F6E] text-white" : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)]"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-[var(--nexa-text-primary)]">{vc.name}</h3>
                    <span className="font-black font-mono text-sm text-[var(--nexa-text-primary)]">
                      ₦{fare.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--nexa-text-secondary)]">{vc.capacity}</p>

                  <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-[var(--nexa-text-muted)]">
                    <span className="flex items-center gap-1 text-[#0E9F6E] font-bold">
                      <Clock className="w-3 h-3" />
                      Arrives in {vc.eta}
                    </span>
                    <span>•</span>
                    <span>Instant Live GPS</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISPATCH EXECUTION DOCK */}
      <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/30 flex items-center justify-center text-[#0E9F6E] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
              {activeVehicle.name} Selected
            </div>
            <div className="text-[11px] text-[var(--nexa-text-muted)]">
              Estimated Trip Total: <span className="font-mono font-bold text-[#0E9F6E]">₦{calculatedFare.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Link href="/checkout" className="w-full sm:w-auto">
          <NexaButton size="md" variant="primary" className="w-full sm:w-auto bg-[#0E9F6E] hover:bg-[#0B855D] text-white font-bold text-xs justify-center">
            Confirm & Dispatch Courier Now <ArrowRight className="w-4 h-4 ml-1.5" />
          </NexaButton>
        </Link>
      </NexaCard>
    </div>
  );
};
