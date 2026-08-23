"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Plus,
  RefreshCw,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const ADJUSTMENTS = [
  { id: "ADJ-2026-041", date: "Aug 20, 2026", sku: "SKU-SEC-001 (4K Bullet Cam)", type: "DAMAGED", quantity: -2, reason: "Water damage during heavy transit rain", auditor: "Babajide Sanni", value: "-₦56,000" },
  { id: "ADJ-2026-040", date: "Aug 15, 2026", sku: "SKU-SOL-002 (LiFePO4 Battery)", type: "AUDIT_SURPLUS", quantity: +1, reason: "Found unrecorded batch unit during physical cycle count", auditor: "Chidinma Nwosu", value: "+₦850,000" },
];

export default function StockAdjustmentsPage() {
  return (
    <BusinessShell
      title="Stock Adjustments, Shrinkage & Write-Offs"
      subtitle="Log physical inventory cycle count discrepancies, damaged goods write-offs, and shrinkage variances."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/inventory">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Inventory Hub
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Log Stock Adjustment
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Adjustment ID</th>
                <th className="py-3 px-4">Date & Auditor</th>
                <th className="py-3 px-4">Item Affected</th>
                <th className="py-3 px-3">Variance Type</th>
                <th className="py-3 px-3">Variance Qty</th>
                <th className="py-3 px-4">Reason & Justification</th>
                <th className="py-3 px-4 text-right">Asset Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {ADJUSTMENTS.map((adj) => (
                <tr key={adj.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-mono text-[#1A56DB]">{adj.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold">{adj.date}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">By {adj.auditor}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{adj.sku}</td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant={adj.type === "DAMAGED" ? "danger" : "green"}>
                      {adj.type}
                    </NexaBadge>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold">
                    <span className={adj.quantity < 0 ? "text-[#E02424]" : "text-[#0E9F6E]"}>
                      {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity} Units
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--nexa-text-secondary)]">{adj.reason}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span className={adj.value.startsWith("-") ? "text-[#E02424]" : "text-[#0E9F6E]"}>
                      {adj.value}
                    </span>
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
