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
  Store,
  Layers,
  FileText,
  UserCheck,
  Calendar,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useTenantProvisioning, ERP_MODULES } from "@/lib/access-control";

interface ModuleKpiCard {
  id: string;
  module: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  sub: string;
  priority: number;
}

interface ModuleQuickAction {
  id: string;
  module: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
  href: string;
}

interface ModuleOperation {
  id: string;
  module: string;
  customer: string;
  service: string;
  amount: string;
  time: string;
  type: string;
  status: string;
  link: string;
}

const ALL_KPIS: ModuleKpiCard[] = [
  // AI Swarm Module
  {
    id: "kpi-ai",
    module: "ai",
    label: "Autonomous AI Pipeline",
    value: "1,480 Leads",
    change: "+28%",
    trend: "up",
    icon: <Bot className="w-5 h-5 text-blue-500" />,
    sub: "15 Agents Active",
    priority: 1,
  },
  // CRM Module
  {
    id: "kpi-crm",
    module: "crm",
    label: "CRM Deals Pipeline",
    value: "₦34.8M Deals",
    change: "+19%",
    trend: "up",
    icon: <TrendingUp className="w-5 h-5 text-pink-500" />,
    sub: "28 Active B2B Deals",
    priority: 2,
  },
  // Shop Module (POS)
  {
    id: "kpi-shop-gmv",
    module: "shop",
    label: "Today's POS Gross GMV",
    value: "₦1,850,200",
    change: "+14%",
    trend: "up",
    icon: <ShoppingCart className="w-5 h-5 text-purple-500" />,
    sub: "42 Cashier Transactions",
    priority: 3,
  },
  // Shop Module (IMS Warehouse)
  {
    id: "kpi-shop-ims",
    module: "shop",
    label: "Stock Valuation (IMS)",
    value: "₦48.65M",
    change: "4 Depot Hubs",
    trend: "up",
    icon: <Boxes className="w-5 h-5 text-emerald-500" />,
    sub: "348 Active SKUs",
    priority: 4,
  },
  // Logistics Module
  {
    id: "kpi-logistics",
    module: "logistics",
    label: "Active Courier Dispatches",
    value: "18 Waybills",
    change: "100% On-Time",
    trend: "up",
    icon: <Truck className="w-5 h-5 text-amber-500" />,
    sub: "Live GPS Tracking",
    priority: 5,
  },
  // Accounting Module
  {
    id: "kpi-accounting",
    module: "accounting",
    label: "General Ledger Balance",
    value: "₦14.2M Settled",
    change: "+8% MoM",
    trend: "up",
    icon: <PieChart className="w-5 h-5 text-emerald-600" />,
    sub: "Paystack & Bank Reconciled",
    priority: 6,
  },
  // HR Module
  {
    id: "kpi-hr",
    module: "hr",
    label: "Staff Appraisal Progress",
    value: "92% Scored",
    change: "Active Cycle",
    trend: "up",
    icon: <Users className="w-5 h-5 text-rose-500" />,
    sub: "14 Depts Evaluated",
    priority: 7,
  },
  // Marketplace Module
  {
    id: "kpi-marketplace",
    module: "marketplace",
    label: "Storefront Bookings & GMV",
    value: "₦2.4M Orders",
    change: "+32%",
    trend: "up",
    icon: <Store className="w-5 h-5 text-indigo-500" />,
    sub: "19 Live Bookings",
    priority: 8,
  },
  // Users / Team Module
  {
    id: "kpi-users",
    module: "users",
    label: "Active Staff Directory",
    value: "52 Personnel",
    change: "10 Roles",
    trend: "up",
    icon: <UserCheck className="w-5 h-5 text-blue-600" />,
    sub: "6 Operational Cost Centers",
    priority: 9,
  },
];

const ALL_QUICK_ACTIONS: ModuleQuickAction[] = [
  // CRM
  {
    id: "qa-crm",
    module: "crm",
    label: "CRM Sales Pipeline",
    icon: <TrendingUp className="w-6 h-6" />,
    desc: "Deals & Leads",
    href: "/erp/marketer",
  },
  // Shop (POS & Inventory)
  {
    id: "qa-pos",
    module: "shop",
    label: "Open POS Register",
    icon: <ShoppingCart className="w-6 h-6" />,
    desc: "Touch Cashier",
    href: "/erp/admin/shop/pos",
  },
  {
    id: "qa-po",
    module: "shop",
    label: "Restock Purchase Order",
    icon: <Boxes className="w-6 h-6" />,
    desc: "Supplier Inbound",
    href: "/erp/admin/shop/inventory/suppliers",
  },
  {
    id: "qa-ref",
    module: "shop",
    label: "Create Referral Rule",
    icon: <Gift className="w-6 h-6" />,
    desc: "Give ₦5k / Get ₦5k",
    href: "/erp/admin/shop/referrals/campaigns",
  },
  // AI
  {
    id: "qa-ai",
    module: "ai",
    label: "Launch AI Campaign",
    icon: <Zap className="w-6 h-6" />,
    desc: "Email & WhatsApp",
    href: "/erp/admin/ai/campaigns/new",
  },
  // Logistics
  {
    id: "qa-log",
    module: "logistics",
    label: "Dispatch Courier",
    icon: <Truck className="w-6 h-6" />,
    desc: "Print 4x6 Waybill",
    href: "/erp/admin/logistics/dispatch",
  },
  // Accounting
  {
    id: "qa-inv",
    module: "accounting",
    label: "Invoices & Billing",
    icon: <FileText className="w-6 h-6" />,
    desc: "Client Tax Invoices",
    href: "/erp/accountant/invoices",
  },
  {
    id: "qa-coa",
    module: "accounting",
    label: "Chart of Accounts",
    icon: <Layers className="w-6 h-6" />,
    desc: "Ledgers & Balance",
    href: "/erp/accountant/coa",
  },
  // HR
  {
    id: "qa-hr-quest",
    module: "hr",
    label: "Retreat TV Scoreboard",
    icon: <Trophy className="w-6 h-6" />,
    desc: "Live Stage Display",
    href: "/erp/hr/quests",
  },
  {
    id: "qa-cycle",
    module: "hr",
    label: "Appraisal Cycles",
    icon: <Calendar className="w-6 h-6" />,
    desc: "Staff Performance",
    href: "/erp/hr/cycle",
  },
  // Marketplace
  {
    id: "qa-marketplace",
    module: "marketplace",
    label: "Compass Storefront",
    icon: <Store className="w-6 h-6" />,
    desc: "Merchant Catalog",
    href: "/erp/admin/marketplace",
  },
  // Users & Staff
  {
    id: "qa-users",
    module: "users",
    label: "Staff Directory",
    icon: <Users className="w-6 h-6" />,
    desc: "Roles & Directory",
    href: "/erp/admin/users",
  },
];

const ALL_OPERATIONS: ModuleOperation[] = [
  {
    id: "OP-9812",
    module: "shop",
    customer: "Dangote Logistics Hub",
    service: "Industrial Inverter Transfer (Lekki -> Ikeja)",
    amount: "₦1,250,000",
    time: "10 mins ago",
    type: "IMS Transit",
    status: "In Transit",
    link: "/erp/admin/shop/inventory/transfers",
  },
  {
    id: "OP-9811",
    module: "shop",
    customer: "Victoria Crest Estate",
    service: "CCTV 16-Channel Surveillance Kit",
    amount: "₦420,000",
    time: "25 mins ago",
    type: "POS Checkout",
    status: "Completed",
    link: "/erp/admin/shop/pos/receipts",
  },
  {
    id: "OP-9810",
    module: "logistics",
    customer: "Ahnara Global Health",
    service: "Cold Chain Logistics Express Delivery",
    amount: "₦85,000",
    time: "1 hour ago",
    type: "Waybill Dispatch",
    status: "Dispatched",
    link: "/erp/admin/logistics",
  },
  {
    id: "OP-9809",
    module: "accounting",
    customer: "Zenith Bank Automated Feed",
    service: "Paystack Gateway Batch Settlement Reconciled",
    amount: "₦3,420,000",
    time: "2 hours ago",
    type: "Treasury GL",
    status: "Reconciled",
    link: "/erp/accountant/reconcile",
  },
  {
    id: "OP-9808",
    module: "crm",
    customer: "MainOne Telecoms B2B",
    service: "Annual Fiber Enterprise License Won",
    amount: "₦8,750,000",
    time: "3 hours ago",
    type: "Deal Closed",
    status: "Won",
    link: "/erp/marketer/pipeline",
  },
  {
    id: "OP-9807",
    module: "ai",
    customer: "Autonomous Outreach Lead Swarm",
    service: "128 Verified WhatsApp & Cold Inbound Inquiries",
    amount: "42 Replies",
    time: "4 hours ago",
    type: "AI Pipeline",
    status: "Qualified",
    link: "/erp/admin/ai/leads",
  },
  {
    id: "OP-9806",
    module: "hr",
    customer: "Departmental Calibration Committee",
    service: "Q3 Performance Review Submissions Approved",
    amount: "14 Reviews",
    time: "5 hours ago",
    type: "HR Appraisal",
    status: "Completed",
    link: "/erp/hr/cycle",
  },
];

const ALL_PULSE_ITEMS = [
  { module: "logistics", term: "Lagos Mainland Dispatch", growth: "98.4% SLA", niche: "Logistics" },
  { module: "ai", term: "AI Autonomous Outreach", growth: "420 Replies", niche: "Ofia AI" },
  { module: "accounting", term: "Paystack Bank Settled", growth: "₦3.4M Today", niche: "Treasury" },
  { module: "crm", term: "B2B Deal Conversion", growth: "₦34.8M Active", niche: "CRM Sales" },
  { module: "hr", term: "Staff Cycle Calibration", growth: "92% Scored", niche: "Appraisals" },
  { module: "shop", term: "Ikeja Depot Stock SLA", growth: "99.1% In-Stock", niche: "Warehouse" },
];

export default function AdminCommandCenterPage() {
  const router = useRouter();
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const { isModuleProvisioned, tenant, isLoading } = useTenantProvisioning();

  // Role Guard: Redirect non-admin personas to their assigned departmental dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      let currentRole = "";
      const stored = localStorage.getItem("erp_current_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u && u.role) currentRole = u.role;
        } catch {}
      }
      if (!currentRole) {
        currentRole = localStorage.getItem("nexa_user_role") || "";
      }
      if (currentRole && currentRole !== "admin") {
        if (currentRole === "employee") router.replace("/erp/employee");
        else if (currentRole === "md") router.replace("/erp/md");
        else if (currentRole === "hr") router.replace("/erp/hr");
        else if (currentRole === "accountant") router.replace("/erp/accountant");
        else if (currentRole === "manager") router.replace("/erp/manager");
      }
    }
  }, [router]);

  // Dynamically filter KPI cards matching modules provisioned to this tenant in Postgres
  const activeKpis = ALL_KPIS.filter((kpi) => isModuleProvisioned(kpi.module)).sort(
    (a, b) => a.priority - b.priority
  );
  const displayedKpis = activeKpis.slice(0, 4);

  // Dynamically filter Quick Actions matching modules provisioned to this tenant in Postgres
  const activeQuickActions = ALL_QUICK_ACTIONS.filter((action) =>
    isModuleProvisioned(action.module)
  );

  // Dynamically filter Recent Operations matching active modules
  const activeOperations = ALL_OPERATIONS.filter((op) =>
    isModuleProvisioned(op.module)
  ).slice(0, 4);

  // Determine whether this tenant has physical retail or logistics operations
  const hasPhysicalOperations =
    isModuleProvisioned("shop") ||
    isModuleProvisioned("logistics") ||
    isModuleProvisioned("marketplace");

  // Filter Enterprise Pulse by provisioned modules
  const activePulseItems = ALL_PULSE_ITEMS.filter((item) =>
    isModuleProvisioned(item.module)
  ).slice(0, 3);

  // Get active provisioned module list for the banner
  const provisionedModulesList = ERP_MODULES.filter(
    (m) => isModuleProvisioned(m.key) && m.category !== "Portals & Team"
  );

  return (
    <ErpAdminShell activeModule="mission" isLoading={isLoading}>
      <div className="space-y-8">
        {/* TENANT PROVISIONING BADGE BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-nexa-bg-surface/50 border border-nexa-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-nexa-text-primary">
                {tenant?.name || "Enterprise Workspace"} — Provisioned Modules
              </p>
              <p className="text-[10px] text-nexa-text-faint font-medium">
                Sourced from Postgres RBAC Tenant Provisioning Matrix
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {provisionedModulesList.map((m) => (
              <span
                key={m.key}
                className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-nexa-brand/10 text-nexa-brand border border-nexa-brand/20 flex items-center gap-1"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* TOP DYNAMIC KPI CARDS (ADAPTIVE GRID) */}
        <section
          className={cn(
            "grid gap-6",
            displayedKpis.length === 1 && "grid-cols-1",
            displayedKpis.length === 2 && "grid-cols-1 sm:grid-cols-2",
            displayedKpis.length === 3 && "grid-cols-1 sm:grid-cols-3",
            displayedKpis.length >= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {displayedKpis.map((kpi) => (
            <NexaCard
              key={kpi.id}
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
            {/* DYNAMIC QUICK ACTIONS & OPERATIONS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold flex items-center gap-2 text-display">
                  <Zap className="w-5 h-5 text-nexa-brand" />
                  Quick Actions & Operations
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activeQuickActions.map((action) => (
                  <Link href={action.href} key={action.id}>
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

            {/* DYNAMIC RECENT OPERATIONS FEED */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold flex items-center gap-2 text-display">
                  <Activity className="w-5 h-5 text-nexa-brand" />
                  Recent Live Transactions & Operations
                </h3>
                <Link
                  href={
                    isModuleProvisioned("shop")
                      ? "/erp/admin/shop/pos/receipts"
                      : isModuleProvisioned("accounting")
                      ? "/erp/accountant/invoices"
                      : isModuleProvisioned("crm")
                      ? "/erp/marketer/pipeline"
                      : "/erp/admin/users"
                  }
                >
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
                {activeOperations.length > 0 ? (
                  activeOperations.map((op) => (
                    <NexaCard
                      key={op.id}
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
                          <Link href={op.link}>
                            <NexaButton size="sm" variant="secondary" className="rounded-full">
                              Details
                            </NexaButton>
                          </Link>
                        </div>
                      </div>
                    </NexaCard>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-nexa-text-faint bg-nexa-bg-surface/30 rounded-3xl border border-nexa-border">
                    No recent live operations recorded for the current provisioned modules.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <aside className="space-y-10">
            {/* OPERATIONAL STATUS / CONTEXTUAL AVAILABILITY */}
            <section>
              {hasPhysicalOperations ? (
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
                  {isModuleProvisioned("shop") && (
                    <Link href="/erp/admin/shop/pos/sessions">
                      <NexaButton
                        variant="secondary"
                        className="w-full text-xs font-extrabold uppercase tracking-widest rounded-full"
                      >
                        View Shift Z-Reports
                      </NexaButton>
                    </Link>
                  )}
                </NexaCard>
              ) : (
                <NexaCard
                  variant="glass"
                  className="p-6 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20 rounded-3xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2 text-sm">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Enterprise System Status
                    </h3>
                    <NexaBadge variant="brand" className="rounded-full">
                      Active
                    </NexaBadge>
                  </div>
                  <p className="text-xs text-nexa-text-secondary leading-relaxed">
                    Automated ledger entries, performance cycle calibrations, and CRM lead capture pipelines are synchronized and operating normally.
                  </p>
                  <Link href="/erp/admin/users">
                    <NexaButton
                      variant="secondary"
                      className="w-full text-xs font-extrabold uppercase tracking-widest rounded-full mt-2"
                    >
                      Manage Staff Directory & Roles
                    </NexaButton>
                  </Link>
                </NexaCard>
              )}
            </section>

            {/* OPERATIONAL PULSE (DYNAMIC BY MODULE) */}
            <section>
              <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2 text-display">
                <TrendingUp className="w-5 h-5 text-nexa-brand" />
                Live Enterprise Pulse
              </h3>
              <div className="space-y-3.5">
                {activePulseItems.map((trend, i) => (
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

              {/* CONTEXTUAL REGULATORY / COMPLIANCE NOTE */}
              {isModuleProvisioned("accounting") || isModuleProvisioned("shop") ? (
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
              ) : isModuleProvisioned("hr") ? (
                <NexaCard
                  variant="glass"
                  className="mt-6 p-6 bg-nexa-brand/5 border-nexa-brand/10 rounded-3xl"
                >
                  <h4 className="text-xs font-extrabold mb-1.5 flex items-center gap-1.5 text-display">
                    <ShieldCheck className="w-4 h-4 text-[#1A56DB]" />
                    Statutory Labor Compliance
                  </h4>
                  <p className="text-xs text-nexa-text-secondary leading-relaxed">
                    Employee appraisal documentation and staff role records adhere to statutory pension and labor governance guidelines.
                  </p>
                </NexaCard>
              ) : (
                <NexaCard
                  variant="glass"
                  className="mt-6 p-6 bg-nexa-brand/5 border-nexa-brand/10 rounded-3xl"
                >
                  <h4 className="text-xs font-extrabold mb-1.5 flex items-center gap-1.5 text-display">
                    <ShieldCheck className="w-4 h-4 text-[#1A56DB]" />
                    Role-Based Access Governance
                  </h4>
                  <p className="text-xs text-nexa-text-secondary leading-relaxed">
                    Enterprise permissions and module provisioning are securely enforced across all workspace departmental accounts.
                  </p>
                </NexaCard>
              )}
            </section>
          </aside>
        </div>
      </div>
    </ErpAdminShell>
  );
}
