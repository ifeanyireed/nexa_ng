"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Layers,
  MapPin,
  Package,
  Plus,
  Warehouse,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const WAREHOUSES = [
  { id: "wh-01", name: "Ikeja Central Distribution Depot", city: "Ikeja, Lagos", address: "Plot 8, Commercial Way, Ikeja Industrial Estate", manager: "Babajide Sanni", capacity: "85%", totalSKUs: 94, isPrimary: true },
  { id: "wh-02", name: "Lekki Fulfillment & Rapid Hub", city: "Lekki Phase 1, Lagos", address: "14 Admiralty Way, Lekki, Lagos", manager: "Chidinma Nwosu", capacity: "62%", totalSKUs: 48, isPrimary: false },
  { id: "wh-03", name: "Abuja Regional Transit Depot", city: "Garki 2, Abuja", address: "Plot 402, Garki Commercial Hub, Abuja", manager: "Aliyu Mohammed", capacity: "40%", totalSKUs: 32, isPrimary: false },
];

export default function WarehousesPage() {
  return (
    <BusinessShell
      title="Multi-Warehouse & Storage Bins"
      subtitle="Partition inventory across regional depots, fulfillment hubs, and manage aisle/shelf storage locations."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/inventory">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Inventory Hub
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Add Warehouse Facility
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {WAREHOUSES.map((wh) => (
            <NexaCard key={wh.id} variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-[#1A56DB]" />
                    <span className="font-mono text-xs text-[var(--nexa-text-muted)]">{wh.id}</span>
                  </div>
                  {wh.isPrimary && <NexaBadge variant="brand">Primary Depot</NexaBadge>}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{wh.name}</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-[#E02424]" />
                    {wh.address}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Facility Manager:</span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">{wh.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Storage Capacity:</span>
                    <span className="font-bold text-[#0E9F6E]">{wh.capacity} Used</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Active SKU Count:</span>
                    <span className="font-bold text-[#1A56DB]">{wh.totalSKUs} SKUs</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                <span className="text-xs text-[var(--nexa-text-muted)]">Bin Mapping: Active</span>
                <NexaButton size="sm" variant="outline">
                  Manage Bins
                </NexaButton>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
