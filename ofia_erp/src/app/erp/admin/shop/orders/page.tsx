"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  ArrowRight,
  Send,
  Eye,
  Building2,
  Package,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";
import { CommerceOrderItem } from "@/lib/verticals";

export default function OmnichannelOrdersPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);

  const [orders, setOrders] = useState<CommerceOrderItem[]>([
    {
      id: "ORD-9021",
      orderNumber: "OFIA-2026-9021",
      customerName: "Chief Babatunde Alabi",
      customerEmail: "babatunde.alabi@gmail.com",
      channel: "STOREFRONT",
      itemsSummary: "Felicity 5kVA Solar Inverter + 2x 100Ah Lithium Batteries",
      itemCount: 3,
      totalAmount: "₦2,985,000",
      rawAmount: 2985000,
      status: "IN_PREPARATION",
      paymentStatus: "PAID",
      createdAt: "Today at 09:15 AM",
      deliveryMethod: "DISPATCH",
    },
    {
      id: "ORD-9020",
      orderNumber: "OFIA-2026-9020",
      customerName: "Mrs. Amaka Okoye",
      customerEmail: "amaka.okoye@yahoo.com",
      channel: "POS_COUNTER",
      itemsSummary: "Charcoal Peppered Chicken (x4), Fried Plantain Platter",
      itemCount: 5,
      totalAmount: "₦38,500",
      rawAmount: 38500,
      status: "READY_DISPATCH",
      paymentStatus: "PAID",
      createdAt: "Today at 10:45 AM",
      deliveryMethod: "STORE_PICKUP",
    },
    {
      id: "ORD-9019",
      orderNumber: "OFIA-2026-9019",
      customerName: "Alhaji Musa Danjuma",
      customerEmail: "musa.danjuma@outlook.com",
      channel: "INQUIRY",
      itemsSummary: "Toyota Land Cruiser 300 VXR (Reservation Deposit)",
      itemCount: 1,
      totalAmount: "₦10,000,000",
      rawAmount: 10000000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      createdAt: "Yesterday at 04:20 PM",
      deliveryMethod: "STORE_PICKUP",
    },
  ]);

  const [filterChannel, setFilterChannel] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.itemsSummary.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = filterChannel === "ALL" || o.channel === filterChannel;
    return matchesSearch && matchesChannel;
  });

  const handleUpdateStatus = (id: string, newStatus: CommerceOrderItem["status"]) => {
    setOrders(
      orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <BusinessShell
      title="Omnichannel Orders & Fulfillment"
      subtitle="Unified order pipeline syncing Online Storefront checkouts, Retail POS receipts, and fulfillment dispatches."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/pos">
            <NexaButton size="sm" variant="outline" leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}>
              Open POS Register
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
              label: "Total Orders Today",
              value: `${orders.length} Active`,
              change: "Omnichannel Sync",
              trend: "up",
              icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
              sub: "Storefront & in-store counter",
            },
            {
              label: "Fulfillment In Prep",
              value: `${orders.filter((o) => o.status === "IN_PREPARATION" || o.status === "CONFIRMED").length} Orders`,
              change: "Readying Parcels",
              trend: "neutral",
              icon: <Clock className="w-5 h-5 text-amber-500" />,
              sub: "Warehouse picking & packing",
            },
            {
              label: "Awaiting Dispatch Rider",
              value: `${orders.filter((o) => o.status === "READY_DISPATCH").length} Parcels`,
              change: "Driver Calling",
              trend: "up",
              icon: <Truck className="w-5 h-5 text-purple-500" />,
              sub: "Waybill & courier handover",
            },
            {
              label: "Gross Realized Revenue",
              value: `₦${(orders.reduce((acc, o) => acc + o.rawAmount, 0) / 1000000).toFixed(2)}M`,
              change: "100% Settled",
              trend: "up",
              icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
              sub: "Bank-grade ledger integrated",
            },
          ]}
        />

        {/* ORDER PIPELINE TABLE */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
            <div>
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Omnichannel Order Stream
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                Live stream of customer purchases across web storefront, walk-in counter, and direct orders
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search orders, clients, items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3 pr-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium rounded-full text-xs outline-none focus:border-[#1A56DB] w-48 sm:w-60"
              />

              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-bold rounded-full text-xs outline-none cursor-pointer"
              >
                <option value="ALL">All Channels</option>
                <option value="STOREFRONT">Online Storefront</option>
                <option value="POS_COUNTER">POS Retail Counter</option>
                <option value="INQUIRY">Direct Inquiries</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)]">
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Order & Customer</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Channel</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Items Summary</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Total Amount</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Fulfillment Status</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider text-right">Logistics Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-bold text-xs">{ord.customerName}</span>
                        <div className="text-[10px] text-[var(--nexa-text-muted)] font-mono">
                          {ord.orderNumber} • {ord.createdAt}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <NexaBadge
                        variant={ord.channel === "STOREFRONT" ? "brand" : ord.channel === "POS_COUNTER" ? "green" : "purple"}
                        size="sm"
                        className="rounded-full"
                      >
                        {ord.channel.replace("_", " ")}
                      </NexaBadge>
                    </td>
                    <td className="py-3.5 px-3 max-w-[240px] truncate text-[var(--nexa-text-secondary)]">
                      {ord.itemsSummary}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#1A56DB]">{ord.totalAmount}</td>
                    <td className="py-3.5 px-3">
                      <NexaBadge
                        variant={
                          ord.status === "DELIVERED"
                            ? "green"
                            : ord.status === "READY_DISPATCH"
                            ? "brand"
                            : ord.status === "IN_PREPARATION"
                            ? "amber"
                            : "neutral"
                        }
                        size="sm"
                        className="rounded-full"
                      >
                        {ord.status.replace("_", " ")}
                      </NexaBadge>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status === "READY_DISPATCH" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "DELIVERED")}
                            className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {ord.status === "IN_PREPARATION" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "READY_DISPATCH")}
                            className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 text-xs cursor-pointer"
                          >
                            Mark Ready
                          </button>
                        )}
                        {ord.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "IN_PREPARATION")}
                            className="px-2.5 py-1 rounded-full bg-amber-600 text-white font-bold hover:bg-amber-700 text-xs cursor-pointer"
                          >
                            Start Prep
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
