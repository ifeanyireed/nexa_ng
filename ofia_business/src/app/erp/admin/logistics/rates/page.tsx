"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Globe,
  MapPin,
  Plus,
  Sliders,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const RATES = [
  { id: "ZONE-01", zoneName: "Lagos Island & Lekki Axis", origin: "Lagos", dest: "VI, Lekki, Ikoyi, Ajah", baseFee: "₦2,000", perKgFee: "₦300 / kg", sla: "Same Day (3 hrs)" },
  { id: "ZONE-02", zoneName: "Lagos Mainland Central", origin: "Lagos", dest: "Ikeja, Surulere, Yaba, Maryland", baseFee: "₦2,500", perKgFee: "₦400 / kg", sla: "Same Day (4 hrs)" },
  { id: "ZONE-03", zoneName: "Interstate Southern Corridor", origin: "Lagos", dest: "Ibadan, Abeokuta, Benin, PH", baseFee: "₦5,500", perKgFee: "₦800 / kg", sla: "2 - 3 Business Days" },
  { id: "ZONE-04", zoneName: "Interstate Northern Express", origin: "Lagos", dest: "Abuja, Kaduna, Kano, Jos", baseFee: "₦7,500", perKgFee: "₦1,000 / kg", sla: "3 - 4 Business Days" },
];

export default function DeliveryRatesPage() {
  return (
    <BusinessShell
      title="Delivery Zones & Shipping Rates Matrix"
      subtitle="Configure regional shipping zones, base dispatch fees, per-kg weight surcharges, and SLA transit commitments."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/logistics">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Logistics Hub
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Add Delivery Zone
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Zone ID</th>
                <th className="py-3 px-4">Zone Name & Coverage</th>
                <th className="py-3 px-3">Base Dispatch Fee</th>
                <th className="py-3 px-3">Per-Kg Surcharge</th>
                <th className="py-3 px-3">SLA Commitment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {RATES.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-mono text-[#1A56DB]">{r.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[var(--nexa-text-primary)]">{r.zoneName}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">{r.dest}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">{r.baseFee}</td>
                  <td className="py-3.5 px-3 font-mono text-[var(--nexa-text-secondary)]">{r.perKgFee}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant="brand">{r.sla}</NexaBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <NexaButton size="sm" variant="outline">
                      Edit Rates
                    </NexaButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BusinessShell>
  );
}
