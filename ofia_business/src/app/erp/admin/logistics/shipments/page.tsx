"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  MapPin,
  Package,
  Plus,
  Printer,
  QrCode,
  Search,
  Truck,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

const SHIPMENTS = [
  { id: "NX-849204-NG", orderId: "ORD-9821", sender: "Lekki Hub Depot", recipient: "Dangote Sugar (Ikeja)", carrier: "IN_HOUSE", driver: "Ibrahim Musa", weight: "4.5 kg", fee: "₦3,500", status: "IN_TRANSIT", date: "Today, 10:15 AM" },
  { id: "NX-849205-NG", orderId: "ORD-9822", sender: "Ikeja Warehouse", recipient: "Fidelity Bank (VI)", carrier: "GIGL", driver: "Fleet Dispatch", weight: "1.2 kg", fee: "₦2,500", status: "OUT_FOR_DELIVERY", date: "Today, 09:30 AM" },
  { id: "NX-849206-NG", orderId: "ORD-9823", sender: "Lekki Hub Depot", recipient: "Transcorp Hilton (Abuja)", carrier: "SENDBOX", driver: "Interstate Freight", weight: "28.0 kg", fee: "₦14,000", status: "PENDING_PICKUP", date: "Today, 11:00 AM" },
];

export default function ShipmentsListPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <BusinessShell
      title="Waybills & Live Shipments Registry"
      subtitle="Generate 4x6 thermal QR shipping labels, track package milestones, and view proof-of-delivery signatures."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/logistics">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Logistics Hub
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Create Shipment Label
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-96">
            <NexaInput
              placeholder="Search tracking #, recipient, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="search"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Tracking Number</th>
                <th className="py-3 px-4">Sender & Recipient</th>
                <th className="py-3 px-3">Carrier / Driver</th>
                <th className="py-3 px-3">Weight & Fee</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Waybill Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {SHIPMENTS.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-mono text-[#1A56DB]">
                    <div>{s.id}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)] font-normal">{s.orderId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[var(--nexa-text-primary)]">{s.recipient}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">From: {s.sender}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold">{s.carrier}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">{s.driver}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <div>{s.weight}</div>
                    <div className="text-[11px] text-[#0E9F6E] font-bold">{s.fee}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <NexaBadge variant={s.status === "OUT_FOR_DELIVERY" ? "green" : "brand"} dot>
                      {s.status}
                    </NexaBadge>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <NexaButton size="sm" variant="outline" leftIcon={<Printer className="w-3 h-3" />}>
                      Print 4x6 Label
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
