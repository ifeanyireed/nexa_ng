"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  ShoppingBag,
  Boxes,
  ShoppingCart,
  Gift,
  Truck,
  Trophy,
  PieChart,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowRight,
  Eye,
  FileText,
  Tag,
  ShieldCheck,
  Zap,
  Check,
  CheckCheck,
  Store,
  Warehouse,
  Printer,
  Calendar,
  Activity,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import { useAuth } from "@/components/nexa/AuthContext";

export default function AdminCommandCenterPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const notifications = [
    { id: "1", title: "New AI Lead Qualified", message: "Adeyemi from Lagos verified interest in ERP Enterprise.", type: "AI", time: "2m ago", isRead: false },
    { id: "2", title: "Low Stock Alert: SKU-8492", message: "Solar Inverter 5kVa down to 3 units in Ikeja Depot.", type: "IMS", time: "14m ago", isRead: false },
    { id: "3", title: "POS Shift Closed", message: "Terminal 01 closed with ₦420,500 total balanced cash/card.", type: "POS", time: "1h ago", isRead: true },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Mission Control", icon: <LayoutDashboard className="w-5 h-5" />, href: "/erp/admin" },
    { label: "AI GTM Swarm", icon: <Bot className="w-5 h-5" />, href: "/erp/admin/ai", badge: "15 AI" },
    { label: "Marketplace Store", icon: <ShoppingBag className="w-5 h-5" />, href: "/erp/admin/marketplace" },
    { label: "Inventory (IMS)", icon: <Boxes className="w-5 h-5" />, href: "/erp/admin/inventory", badge: "Low" },
    { label: "Point of Sale (POS)", icon: <ShoppingCart className="w-5 h-5" />, href: "/erp/admin/pos" },
    { label: "Viral Referrals", icon: <Gift className="w-5 h-5" />, href: "/erp/admin/referrals" },
    { label: "Logistics Hub", icon: <Truck className="w-5 h-5" />, href: "/erp/admin/logistics" },
    { label: "Retreat Quests", icon: <Trophy className="w-5 h-5" />, href: "/erp/admin/quests" },
    { label: "General Ledger", icon: <PieChart className="w-5 h-5" />, href: "/erp/accountant" },
    { label: "HR & Appraisals", icon: <Users className="w-5 h-5" />, href: "/erp/hr" },
  ];

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
    <div className="min-h-screen bg-nexa-bg-base flex relative text-nexa-text-primary">
      {/* SIDEBAR — EXACT OFIA MARKETPLACE VERBATIM STYLING */}
      <aside
        className={cn(
          "bg-nexa-bg-surface border-r border-nexa-border transition-all duration-300 flex flex-col z-50 sticky top-0 h-screen",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        {/* COLLAPSE TOGGLE BUTTON */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-slate-800 border border-nexa-border rounded-full flex items-center justify-center shadow-lg text-nexa-brand hover:scale-110 transition-transform z-[60] cursor-pointer"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* LOGO AREA */}
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Ofia Compass" className="w-8 h-8 object-contain" />
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-display leading-tight">
                  Ofia Compass
                </span>
                <span className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-wider">
                  ERP Mission Control
                </span>
              </div>
            </Link>
          ) : (
            <img src="/logo.png" alt="Ofia Compass" className="w-8 h-8 mx-auto" />
          )}
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link href={item.href} key={i}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3.5 p-3 rounded-full transition-all group mb-1 cursor-pointer",
                    isActive
                      ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20 font-bold"
                      : "text-nexa-text-faint hover:bg-nexa-bg-base hover:text-nexa-text-primary font-semibold"
                  )}
                >
                  <div
                    className={cn(
                      "transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-nexa-brand"
                    )}
                  >
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span className="text-xs">{item.label}</span>
                      {item.badge && (
                        <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-nexa-border space-y-1.5">
          <Link href="/tenant/settings">
            <button
              className={cn(
                "w-full flex items-center gap-3.5 p-3 rounded-full transition-all text-nexa-text-faint hover:bg-nexa-bg-base hover:text-nexa-text-primary cursor-pointer",
                pathname === "/tenant/settings" && "bg-nexa-brand text-white shadow-md shadow-nexa-brand/20"
              )}
            >
              <Settings className="w-5 h-5 text-nexa-brand" />
              {isSidebarOpen && <span className="font-bold text-xs">Workspace Settings</span>}
            </button>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 p-3 rounded-full text-red-500 hover:bg-red-500/10 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-bold text-xs">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {/* DASHBOARD HEADER — EXACT OFIA MARKETPLACE HEADER */}
        <header className="h-20 bg-nexa-bg-surface/80 backdrop-blur-xl border-b border-nexa-border sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold hidden md:block">
              Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-nexa-bg-base px-4 py-2 rounded-full border border-nexa-border gap-3 w-64">
              <Search className="w-4 h-4 text-nexa-text-faint" />
              <input
                type="text"
                placeholder="Search ERP modules..."
                className="bg-transparent text-xs outline-none w-full"
              />
            </div>

            <NexaThemeToggle />

            {/* NOTIFICATION CENTER */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 hover:bg-nexa-bg-base rounded-full cursor-pointer text-nexa-text-secondary focus:outline-none transition-colors border border-nexa-border"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 text-[9px] font-bold text-white flex items-center justify-center px-1 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-nexa-bg-surface border border-nexa-border rounded-3xl shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[500px]">
                  <div className="p-4 border-b border-nexa-border flex items-center justify-between bg-nexa-bg-base/50">
                    <span className="font-extrabold text-sm text-display">ERP Live Alerts</span>
                    <span className="text-xs text-[#1A56DB] font-bold">Real-Time Sync</span>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-nexa-border max-h-[350px]">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "p-4 transition-colors flex gap-3 items-start relative group hover:bg-nexa-bg-base/30",
                          !notif.isRead && "bg-nexa-brand/5 dark:bg-nexa-brand/10"
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider bg-blue-500/10 text-blue-500 border-blue-500/20">
                              {notif.type}
                            </span>
                            <span className="text-[10px] text-nexa-text-faint font-semibold">
                              {notif.time}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-nexa-text-primary">{notif.title}</h4>
                          <p className="text-xs text-nexa-text-secondary mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-nexa-border" />

            {/* USER AVATAR & IDENTITY */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{user?.name || "Tenant Admin"}</p>
                <p className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider">
                  Enterprise Operator
                </p>
              </div>
              <NexaAvatar size="md" isOnline name={user?.name || "Admin"} />
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY — EXACT OFIA MARKETPLACE GRID */}
        <div className="p-8 space-y-10">
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
                    { term: "AI Autonomous Outreach", growth: "420 Replies", niche: "GTM Swarm" },
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
      </main>
    </div>
  );
}
