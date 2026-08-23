"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  MapPin,
  Package,
  Plus,
  Radio,
  Send,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function LogisticsDashboardPage() {
  const activeShipments = [
    { id: "NX-849204-NG", order: "ORD-9821", origin: "Lekki Central Hub", destination: "Ikeja Industrial Estate", recipient: "Dangote Sugar", carrier: "IN_HOUSE (Ibrahim Musa)", status: "IN_TRANSIT", eta: "In 45 mins", items: "1x Solar Inverter 5kVA" },
    { id: "NX-849205-NG", order: "ORD-9822", origin: "Ikeja Warehouse Depot", destination: "Victoria Island", recipient: "Fidelity Bank VI", carrier: "GIGL Express", status: "OUT_FOR_DELIVERY", eta: "In 20 mins", items: "2x 4K IP Security Camera" },
    { id: "NX-849206-NG", order: "ORD-9823", origin: "Lekki Central Hub", destination: "Garki 2, Abuja", recipient: "Transcorp Hilton Hub", carrier: "Sendbox Interstate", status: "PENDING_PICKUP", eta: "Tomorrow, 2:00 PM", items: "1x LiFePO4 Battery 100Ah" },
  ];

  return (
    <BusinessShell
      title="Ofia Logistics Manager"
      subtitle="Real-time order shipment tracking, automated technician/courier dispatch, fleet GPS tracking, and delivery rate matrix."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/logistics/shipments">
            <NexaButton size="sm" variant="outline" leftIcon={<Package className="w-3.5 h-3.5" />}>
              Waybills & Shipments
            </NexaButton>
          </Link>
          <Link href="/erp/admin/logistics/dispatch">
            <NexaButton size="sm" variant="outline" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Dispatch Console
            </NexaButton>
          </Link>
          <Link href="/erp/admin/logistics/shipments">
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
              Create New Waybill
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Active In-Transit Orders",
              value: "14 Shipments",
              change: "11 Intra • 3 Interstate",
              sub: "Live GPS Tracking Active",
              icon: <Truck className="w-5 h-5 text-blue-500" />,
              iconBg: "bg-blue-500/10 text-blue-500",
            },
            {
              label: "On-Time SLA Delivery",
              value: "98.2% SLA",
              change: "Avg. 2h 45m",
              sub: "Within guaranteed SLA window",
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              iconBg: "bg-emerald-500/10 text-emerald-500",
            },
            {
              label: "Active Fleet Couriers",
              value: "8 Online",
              change: "6 Bikes • 2 Vans",
              sub: "Assigned & dispatched",
              icon: <Users className="w-5 h-5 text-purple-500" />,
              iconBg: "bg-purple-500/10 text-purple-500",
            },
            {
              label: "Delivery Fee Revenue",
              value: "₦485,000",
              change: "+12% This Week",
              sub: "Automated Paystack settlement",
              icon: <DollarSign className="w-5 h-5 text-amber-500" />,
              iconBg: "bg-amber-500/10 text-amber-500",
            },
          ]}
        />

        {/* ACTIVE SHIPMENTS LIVE TABLE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#1A56DB]" />
              Live Shipments & In-Flight Waybills
            </h2>
            <Link href="/erp/admin/logistics/shipments" className="text-xs text-[#1A56DB] font-bold hover:underline flex items-center gap-1">
              <span>View All Shipments</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
                <tr>
                  <th className="py-3 px-4">Tracking #</th>
                  <th className="py-3 px-4">Recipient & Destination</th>
                  <th className="py-3 px-3">Cargo Items</th>
                  <th className="py-3 px-3">Carrier / Driver</th>
                  <th className="py-3 px-3">ETA</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                {activeShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold font-mono text-[#1A56DB]">
                      <div>{s.id}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] font-normal">{s.order}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{s.recipient}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#E02424]" />
                        {s.destination}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium">{s.items}</td>
                    <td className="py-3.5 px-3 text-[var(--nexa-text-secondary)]">{s.carrier}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">{s.eta}</td>
                    <td className="py-3.5 px-4 text-right">
                      <NexaBadge variant={s.status === "OUT_FOR_DELIVERY" ? "green" : "brand"} dot>
                        {s.status}
                      </NexaBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK SHORTCUTS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/erp/admin/logistics/shipments" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#1A56DB] transition-all">
              <Package className="w-5 h-5 text-[#1A56DB]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Waybills & Labels</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Generate 4x6 QR shipping labels & milestone logs.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/logistics/dispatch" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#0E9F6E] transition-all">
              <Send className="w-5 h-5 text-[#0E9F6E]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Dispatch Console</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Smart automatic driver and field technician dispatch.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/logistics/fleet" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#9061F9] transition-all">
              <Truck className="w-5 h-5 text-[#9061F9]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Courier Fleet GPS</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Live vehicle tracking, plate numbers, and driver ratings.</p>
            </NexaCard>
          </Link>

          <Link href="/erp/admin/logistics/rates" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#F59E0B] transition-all">
              <DollarSign className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Delivery Rate Matrix</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Configure intra-city and interstate delivery fees.</p>
            </NexaCard>
          </Link>
        </div>
      </div>
    </BusinessShell>
  );
}
