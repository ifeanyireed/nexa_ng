"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  FileCheck,
  Package,
  Plus,
  Truck,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const PURCHASE_ORDERS = [
  { id: "PO-2026-108", supplier: "SunTech Energy Direct Ltd", items: "15x Hybrid Solar Inverters 5kVA", totalAmount: "₦6,300,000", orderDate: "Aug 18, 2026", eta: "Aug 25, 2026", status: "CONFIRMED", paymentTerms: "Net 30" },
  { id: "PO-2026-107", supplier: "HikTech Security Systems", items: "30x 4K IP Bullet Cameras", totalAmount: "₦840,000", orderDate: "Aug 12, 2026", eta: "Aug 19, 2026", status: "DELIVERED", paymentTerms: "Advance 100%" },
];

export default function SuppliersPage() {
  return (
    <BusinessShell
      title="Vendor Restock Orders & Suppliers"
      subtitle="Issue vendor purchase orders, forecast inventory replenishment, and track supplier lead times."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/inventory">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Inventory Hub
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Create Purchase Order
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Ordered Items</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Order Date & ETA</th>
                <th className="py-3 px-3">Terms</th>
                <th className="py-3 px-4 text-right">PO Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {PURCHASE_ORDERS.map((po) => (
                <tr key={po.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-mono text-[#1A56DB]">{po.id}</td>
                  <td className="py-3.5 px-4 font-bold text-[var(--nexa-text-primary)]">{po.supplier}</td>
                  <td className="py-3.5 px-4 font-medium">{po.items}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">{po.totalAmount}</td>
                  <td className="py-3.5 px-3">
                    <div>{po.orderDate}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">ETA: {po.eta}</div>
                  </td>
                  <td className="py-3.5 px-3 text-[var(--nexa-text-secondary)]">{po.paymentTerms}</td>
                  <td className="py-3.5 px-4 text-right">
                    <NexaBadge variant={po.status === "DELIVERED" ? "green" : "brand"} dot>
                      {po.status}
                    </NexaBadge>
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
