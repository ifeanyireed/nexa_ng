"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Boxes,
  ShoppingCart,
  Gift,
  Truck,
  Trophy,
  PieChart,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function AdminCommandCenterPage() {
  const router = useRouter();
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Role Guard: Redirect non-admin personas to their assigned departmental dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("erp_current_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u && u.role && u.role !== "admin") {
            if (u.role === "md") router.replace("/erp/md");
            else if (u.role === "hr") router.replace("/erp/hr");
            else if (u.role === "accountant") router.replace("/erp/accountant");
            else if (u.role === "manager") router.replace("/erp/manager");
            else if (u.role === "employee") router.replace("/erp/employee");
          }
        } catch {}
      }
    }
  }, [router]);

  const kpis = [
    {
      label: "Autonomous AI Pipeline",
      value: "1,480 Leads",
      change: "+28%",
      trend: "up",
      icon: <Bot className="w-5 h-5 text-blue-500" />,
      sub: "15 Agents Active",
    },
    {
      label: "Stock Valuation (IMS)",
      value: "₦48.65M",
      change: "4 Depot Hubs",
      trend: "up",
      icon: <Boxes className="w-5 h-5 text-emerald-500" />,
      sub: "348 Active SKUs",
    },
    {
      label: "Today's POS Gross GMV",
      value: "₦1,850,200",
      change: "+14%",
      trend: "up",
      icon: <ShoppingCart className="w-5 h-5 text-purple-500" />,
      sub: "42 Cashier Transactions",
    },
    {
      label: "Active Courier Dispatches",
      value: "18 Waybills",
      change: "100% On-Time",
      trend: "up",
      icon: <Truck className="w-5 h-5 text-amber-500" />,
      sub: "Live GPS Tracking",
    },
  ];

  const quickActions = [
    {
      label: "Open POS Register",
      icon: <ShoppingCart className="w-6 h-6" />,
      desc: "Touch Cashier",
      href: "/erp/admin/pos",
    },
    {
      label: "Launch AI Campaign",
      icon: <Zap className="w-6 h-6" />,
      desc: "Cold Email & WhatsApp",
      href: "/erp/admin/ai/campaigns/new",
    },
    {
      label: "Restock Purchase Order",
      icon: <Boxes className="w-6 h-6" />,
      desc: "Supplier Inbound",
      href: "/erp/admin/inventory/suppliers",
    },
    {
      label: "Dispatch Courier",
      icon: <Truck className="w-6 h-6" />,
      desc: "Print 4x6 Waybill",
      href: "/erp/admin/logistics/dispatch",
    },
    {
      label: "Create Referral Rule",
      icon: <Gift className="w-6 h-6" />,
      desc: "Give ₦5k / Get ₦5k",
      href: "/erp/admin/referrals/campaigns",
    },
    {
      label: "Retreat TV Scoreboard",
      icon: <Trophy className="w-6 h-6" />,
      desc: "Live Stage Display",
      href: "/erp/admin/quests",
    },
  ];

  const recentOperations = [
    {
      id: "OP-9812",
      customer: "Dangote Logistics Hub",
      service: "Industrial Inverter Transfer (Lekki -> Ikeja)",
      amount: "₦1,250,000",
      time: "10 mins ago",
      type: "IMS Transit",
      status: "In Transit",
    },
    {
      id: "OP-9811",
      customer: "Victoria Crest Estate",
      service: "CCTV 16-Channel Surveillance Kit",
      amount: "₦420,000",
      time: "25 mins ago",
      type: "POS Checkout",
      status: "Completed",
    },
    {
      id: "OP-9810",
      customer: "Ahnara Global Health",
      service: "Cold Chain Logistics Express Delivery",
      amount: "₦85,000",
      time: "1 hour ago",
      type: "Waybill Dispatch",
      status: "Dispatched",
    },
  ];

  return (
    <ErpAdminShell activeModule="mission">
      <div className="space-y-10">
        {/* TOP 4 KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <NexaCard
              key={i}
              variant="glass"
              className="p-6 relative overflow-hidden group hover:border-nexa-brand/30 transition-all rounded-3xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                  {kpi.icon}
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {kpi.change}
                </span>
              </div>
              <p className="text-xs text-nexa-text-faint font-bold uppercase tracking-wider mb-1">
                {kpi.label}
              </p>
              <h3 className="text-2xl font-extrabold text-display text-nexa-text-primary mb-1">
                {kpi.value}
              </h3>
              <p className="text-[11px] text-nexa-text-secondary font-medium">{kpi.sub}</p>
            </NexaCard>
          ))}
        </section>

        {/* MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-10">
            {/* QUICK ACTIONS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold flex items-center gap-2 text-display">
                  <Zap className="w-5 h-5 text-nexa-brand" />
                  Quick Actions & Operations
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, i) => (
                  <Link href={action.href} key={i}>
                    <NexaCard
                      variant="interactive"
                      className="p-6 flex flex-col items-center text-center group cursor-pointer border border-nexa-border bg-nexa-bg-surface/50 hover:bg-nexa-bg-surface hover:shadow-xl transition-all rounded-3xl"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-nexa-brand group-hover:text-white transition-all shadow-sm">
                        {action.icon}
                      </div>
                      <h4 className="font-bold text-sm mb-1">{action.label}</h4>
                      <p className="text-[10px] text-nexa-text-faint uppercase font-bold tracking-wider">
                        {action.desc}
                      </p>
                    </NexaCard>
                  </Link>
                ))}
              </div>
            </section>

            {/* RECENT OPERATIONS FEED */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold flex items-center gap-2 text-display">
                  <Activity className="w-5 h-5 text-nexa-brand" />
                  Recent Live Transactions & Dispatches
                </h3>
                <Link href="/erp/admin/pos/receipts">
                  <NexaButton
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    View All
                  </NexaButton>
                </Link>
              </div>
              <div className="space-y-4">
                {recentOperations.map((op, i) => (
                  <NexaCard
                    key={i}
                    variant="flat"
                    className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-nexa-border bg-nexa-bg-surface/30 hover:bg-nexa-bg-surface/70 transition-all rounded-3xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center font-bold text-xs">
                        {op.id.split("-")[1]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{op.customer}</h4>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {op.status}
                          </span>
                        </div>
                        <p className="text-xs text-nexa-text-faint font-medium mt-0.5">
                          {op.service}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-nexa-text-primary">{op.amount}</p>
                        <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">
                          {op.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href="/erp/admin/logistics">
                          <NexaButton size="sm" variant="secondary" className="rounded-full">
                            Details
                          </NexaButton>
                        </Link>
                        <Link href="/erp/admin/pos">
                          <NexaButton size="sm" className="rounded-full">
                            Receipt
                          </NexaButton>
                        </Link>
                      </div>
                    </div>
                  </NexaCard>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <aside className="space-y-10">
            {/* OPERATIONAL STATUS / AVAILABILITY */}
            <section>
              <NexaCard
                variant="glass"
                className="p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20 rounded-3xl space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    Branch Operations Status
                  </h3>
                  <NexaBadge variant="success" className="rounded-full">
                    {isStoreOpen ? "Online & Open" : "Closed"}
                  </NexaBadge>
                </div>
                <p className="text-xs text-nexa-text-secondary leading-relaxed">
                  When active, POS registers, automated dispatch couriers, and store bookings accept live customer transactions.
                </p>
                <div className="bg-nexa-bg-base p-4 rounded-2xl border border-nexa-border flex items-center justify-between">
                  <span className="text-xs font-bold">Accept Inbound Orders</span>
                  <button
                    type="button"
                    onClick={() => setIsStoreOpen(!isStoreOpen)}
                    className={cn(
                      "w-12 h-6 rounded-full relative p-1 transition-colors cursor-pointer",
                      isStoreOpen ? "bg-emerald-500" : "bg-slate-400"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                        isStoreOpen ? "translate-x-6" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
                <Link href="/erp/admin/pos/sessions">
                  <NexaButton
                    variant="secondary"
                    className="w-full text-xs font-extrabold uppercase tracking-widest rounded-full"
                  >
                    View Shift Z-Reports
                  </NexaButton>
                </Link>
              </NexaCard>
            </section>

            {/* OPERATIONAL PULSE */}
            <section>
              <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2 text-display">
                <TrendingUp className="w-5 h-5 text-nexa-brand" />
                Live Enterprise Pulse
              </h3>
              <div className="space-y-3.5">
                {[
                  { term: "Lagos Mainland Dispatch", growth: "98.4% SLA", niche: "Logistics" },
                  { term: "AI Autonomous Outreach", growth: "420 Replies", niche: "Ofia AI" },
                  { term: "Paystack Bank Settled", growth: "₦3.4M Today", niche: "Treasury" },
                ].map((trend, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border hover:border-nexa-brand/30 transition-all cursor-default"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{trend.term}</span>
                      <span className="text-[10px] font-extrabold text-emerald-500">
                        {trend.growth}
                      </span>
                    </div>
                    <p className="text-[9px] text-nexa-text-faint font-bold uppercase tracking-widest">
                      {trend.niche}
                    </p>
                  </div>
                ))}
              </div>

              <NexaCard
                variant="glass"
                className="mt-6 p-6 bg-nexa-brand/5 border-nexa-brand/10 rounded-3xl"
              >
                <h4 className="text-xs font-extrabold mb-1.5 flex items-center gap-1.5 text-display">
                  <ShieldCheck className="w-4 h-4 text-[#1A56DB]" />
                  FIRS Tax Compliance Note
                </h4>
                <p className="text-xs text-nexa-text-secondary leading-relaxed">
                  7.5% VAT is computed on all POS receipts and invoices, automatically maintaining an export-ready General Ledger.
                </p>
              </NexaCard>
            </section>
          </aside>
        </div>
      </div>
    </ErpAdminShell>
  );
}
