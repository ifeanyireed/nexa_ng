"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Car,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Zap,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Gauge,
  Cpu,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface InspectionPackage {
  id: string;
  name: string;
  price: number;
  points: number;
  description: string;
  includes: string[];
  isPopular?: boolean;
}

const INSPECTION_PACKAGES: InspectionPackage[] = [
  {
    id: "pkg-basic",
    name: "Pre-Purchase OBD2 & Engine Diagnostic Scan",
    price: 25000,
    points: 65,
    description: "Essential computerized scan to detect cleared fault codes, ECU errors, and engine sensor health.",
    includes: ["Full OBD2 Computer Scan", "Engine & Transmission Health", "Battery & Alternator Test", "Digital PDF Report"],
  },
  {
    id: "pkg-comprehensive",
    name: "150-Point Master Pre-Purchase Inspection",
    price: 45000,
    points: 150,
    description: "Complete vehicle physical and electronic inspection before buying any Nigerian or foreign-used car.",
    includes: [
      "OBD2 Live Sensor Diagnostics",
      "Gearbox Surge & Transmission Test",
      "Suspension, Shocks & Brake Pads",
      "Chassis, Flood & Accident Frame Check",
      "AC Cooling & Compressor Pressure",
      "Road Test & Valuation Certificate",
    ],
    isPopular: true,
  },
  {
    id: "pkg-annual",
    name: "Fleet & Complete Roadworthiness Overhaul",
    price: 85000,
    points: 210,
    description: "Comprehensive multi-point mechanical inspection with fluid flushes and mobile artisan servicing.",
    includes: ["Complete Engine Tune-up", "Brake System Bleed & Pad Service", "Wheel Alignment & Balancing", "Full Mechanical Certification"],
  },
];

interface VehicleInspectionTemplateProps {
  title?: string;
  subtitle?: string;
  subdomain?: string;
}

export const VehicleInspectionTemplate: React.FC<VehicleInspectionTemplateProps> = ({
  title = "Certified Vehicle Inspection & Autocare",
  subtitle = "Book mobile certified automotive engineers for 150-point pre-purchase vehicle inspections, OBD2 diagnostics, and mechanical repairs across Nigeria.",
  subdomain = "autocare",
}) => {
  const [vehicleMake, setVehicleMake] = useState("Toyota");
  const [vehicleModel, setVehicleModel] = useState("Camry / Corolla");
  const [vehicleYear, setVehicleYear] = useState("2018");
  const [location, setLocation] = useState("Lekki / Victoria Island, Lagos");
  const [selectedPkg, setSelectedPkg] = useState<InspectionPackage>(INSPECTION_PACKAGES[1]);

  const makes = ["Toyota", "Honda", "Mercedes-Benz", "Lexus", "Hyundai", "Ford", "BMW", "Nissan", "Kia"];

  return (
    <div className="space-y-6 pb-20">
      {/* HERO BANNER & VEHICLE SELECTOR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#C88A3A]/10 via-[var(--nexa-bg-surface)] to-[var(--nexa-bg-base)] border border-[#C88A3A]/20 space-y-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <NexaBadge variant="amber" className="font-mono text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5 inline mr-1" />
            Vehicle Inspection • {subdomain}.ofia.ng
          </NexaBadge>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#0E9F6E] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Certified Diagnostic Engineers</span>
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

        {/* VEHICLE METADATA STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] shadow-inner">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Vehicle Make
            </label>
            <select
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
            >
              {makes.map((m) => (
                <option key={m} value={m} className="bg-[var(--nexa-bg-surface)]">
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Model
            </label>
            <input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="e.g. Prado / RX350"
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Year of Manufacture
            </label>
            <input
              type="text"
              value={vehicleYear}
              onChange={(e) => setVehicleYear(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] block font-bold">
              Inspection Base Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-[var(--nexa-text-primary)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* INSPECTION PACKAGES GRID */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center justify-between">
          <span>Choose Diagnostic Inspection Scope</span>
          <span className="text-xs font-mono text-[var(--nexa-text-muted)] font-normal">
            Target Vehicle: {vehicleYear} {vehicleMake} {vehicleModel}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INSPECTION_PACKAGES.map((pkg) => {
            const isSelected = selectedPkg.id === pkg.id;
            return (
              <NexaCard
                key={pkg.id}
                variant="glass"
                padding="md"
                className={`border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-[#C88A3A] ring-1 ring-[#C88A3A] bg-[#C88A3A]/5 shadow-sm"
                    : "border-[var(--nexa-border)] hover:border-[#C88A3A]/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#C88A3A] uppercase">
                      {pkg.points}-Point Inspection
                    </span>
                    {pkg.isPopular && <NexaBadge variant="amber">Most Popular</NexaBadge>}
                  </div>

                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] leading-tight">
                    {pkg.name}
                  </h3>

                  <p className="text-[11px] text-[var(--nexa-text-secondary)]">{pkg.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-[var(--nexa-border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--nexa-text-muted)] font-bold">
                      Coverage Checklist:
                    </span>
                    {pkg.includes.map((inc) => (
                      <div key={inc} className="flex items-center gap-2 text-xs text-[var(--nexa-text-primary)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0E9F6E] shrink-0" />
                        <span className="text-[11px]">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--nexa-border)] mt-4 flex items-center justify-between">
                  <div className="text-base font-black font-mono text-[var(--nexa-text-primary)]">
                    ₦{pkg.price.toLocaleString()}
                  </div>

                  <button
                    onClick={() => setSelectedPkg(pkg)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#C88A3A] text-white shadow-xs"
                        : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] hover:border-[#C88A3A]"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select Package"}
                  </button>
                </div>
              </NexaCard>
            );
          })}
        </div>
      </div>

      {/* DISPATCH ENGINEER BOOKING DOCK */}
      <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C88A3A]/10 border border-[#C88A3A]/30 flex items-center justify-center text-[#C88A3A] shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
              {selectedPkg.name} ({vehicleYear} {vehicleMake})
            </div>
            <div className="text-[11px] text-[var(--nexa-text-muted)]">
              Certified Mobile Technician Dispatched to <span className="font-bold text-[var(--nexa-text-primary)]">{location}</span>
            </div>
          </div>
        </div>

        <Link href="/book/nexa-verified/checkout" className="w-full sm:w-auto">
          <NexaButton size="md" variant="primary" className="w-full sm:w-auto bg-[#C88A3A] hover:bg-[#B07830] text-white font-bold text-xs justify-center">
            Schedule Mobile Inspection (₦{selectedPkg.price.toLocaleString()}) <ArrowRight className="w-4 h-4 ml-1.5" />
          </NexaButton>
        </Link>
      </NexaCard>
    </div>
  );
};
