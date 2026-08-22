"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bike,
  Car,
  CheckCircle2,
  Compass,
  MapPin,
  Phone,
  Plus,
  Radio,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const FLEET_ROSTER = [
  { id: "FLEET-01", name: "Ibrahim Musa", phone: "+2348033344455", vehicle: "Yamaha Crux 110", plate: "KJA-482-XA", type: "MOTORBIKE", status: "ON_TRIP", location: "Opebi Link Bridge, Ikeja", totalTrips: 142, rating: 4.9 },
  { id: "FLEET-02", name: "Emeka Okafor", phone: "+2348077788899", vehicle: "Toyota HiAce Delivery Van", plate: "APP-912-LK", type: "VAN", status: "AVAILABLE", location: "Lekki Distribution Depot", totalTrips: 98, rating: 4.8 },
  { id: "FLEET-03", name: "Tunde Bakare", phone: "+2348022211100", vehicle: "Bajaj Boxer 150", plate: "SMK-103-YT", type: "MOTORBIKE", status: "AVAILABLE", location: "Garki Commercial Hub, Abuja", totalTrips: 215, rating: 5.0 },
];

export default function FleetManagementPage() {
  return (
    <BusinessShell
      title="Courier Fleet & Live GPS Tracking"
      subtitle="Manage delivery vehicles (Motorbikes, Vans), plate numbers, driver phone contacts, and live location telemetry."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/logistics">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Logistics Hub
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Register Driver / Vehicle
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FLEET_ROSTER.map((driver) => (
            <NexaCard key={driver.id} variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {driver.type === "MOTORBIKE" ? <Bike className="w-5 h-5 text-[#1A56DB]" /> : <Truck className="w-5 h-5 text-[#0E9F6E]" />}
                    <span className="font-mono text-xs text-[var(--nexa-text-muted)]">{driver.id}</span>
                  </div>
                  <NexaBadge variant={driver.status === "AVAILABLE" ? "green" : "brand"} dot>
                    {driver.status}
                  </NexaBadge>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{driver.name}</h3>
                  <div className="text-xs text-[var(--nexa-text-muted)] flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#1A56DB]" />
                    {driver.phone}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Vehicle & Plate:</span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">{driver.plate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">GPS Location:</span>
                    <span className="font-semibold text-[#1A56DB]">{driver.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Completed Trips:</span>
                    <span className="font-bold text-[#0E9F6E]">{driver.totalTrips} Trips (⭐ {driver.rating})</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                <span className="text-xs text-[var(--nexa-text-muted)] font-mono">{driver.vehicle}</span>
                <NexaButton size="sm" variant="outline">
                  Live GPS Ping
                </NexaButton>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
