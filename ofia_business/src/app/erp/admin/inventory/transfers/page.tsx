"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Package,
  Plus,
  Truck,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const TRANSFERS = [
  { id: "TRF-2026-001", from: "Ikeja Central Depot", to: "Lekki Fulfillment Hub", items: "10x Solar Inverter 5kVA", status: "IN_TRANSIT", dispatchedAt: "Today, 10:30 AM", driver: "Ibrahim Musa (KJA-482-XA)", grn: "GRN-9841-PENDING" },
  { id: "TRF-2026-002", from: "Ikeja Central Depot", to: "Abuja Regional Depot", items: "25x Cat6 Outdoor Cable", status: "RECEIVED", dispatchedAt: "Yesterday, 2:00 PM", driver: "GIGL Logistics Freight", grn: "GRN-9840-VERIFIED" },
];

export default function StockTransfersPage() {
  return (
    <BusinessShell
      title="Inter-Branch Stock Transfers (GRN)"
      subtitle="Dispatch inventory between warehouse hubs, track transit waybills, and receive Goods Received Notes."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/inventory">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Inventory Hub
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Initiate Transfer
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Transfer ID</th>
                <th className="py-3 px-4">Origin & Destination</th>
                <th className="py-3 px-4">Items Transferred</th>
                <th className="py-3 px-3">Carrier / Driver</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">GRN Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {TRANSFERS.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-mono text-[#1A56DB]">{t.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{t.from}</span>
                      <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                      <span className="font-bold text-[var(--nexa-text-primary)]">{t.to}</span>
                    </div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">{t.dispatchedAt}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{t.items}</td>
                  <td className="py-3.5 px-3 text-[var(--nexa-text-secondary)]">{t.driver}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant={t.status === "IN_TRANSIT" ? "brand" : "green"} dot>
                      {t.status}
                    </NexaBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono text-xs text-[var(--nexa-text-muted)]">{t.grn}</span>
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
