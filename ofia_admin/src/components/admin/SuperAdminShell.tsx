"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe,
  Grid,
  Headphones,
  Key,
  Layers,
  LayoutDashboard,
  Lock,
  Mail,
  PieChart,
  Radio,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Store,
  Terminal,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import { NexaBadge, NexaBadgeVariant } from "@/components/nexa/NexaBadge";

export interface SubNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface SuperAdminShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  subTabs?: SubNavItem[];
}

export function SuperAdminShell({
  children,
  title,
  subtitle,
  action,
  subTabs,
}: SuperAdminShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Automatic sub-navigation tabs according to current pathname
  const getSubTabs = (): SubNavItem[] => {
    if (subTabs !== undefined) return subTabs;

    if (pathname === "/") {
      return [];
    }

    if (pathname.startsWith("/tenants")) {
      return [
        { label: "All Tenants", href: "/tenants?tenant=all", icon: <Building2 className="w-3.5 h-3.5" />, badge: "5 Orgs" },
        { label: "EduSuite", href: "/tenants?tenant=org-01", icon: <Building2 className="w-3.5 h-3.5" />, badge: "Growth" },
        { label: "PayFlow Africa", href: "/tenants?tenant=org-02", icon: <Building2 className="w-3.5 h-3.5" />, badge: "Enterprise" },
        { label: "HealthBridge", href: "/tenants?tenant=org-03", icon: <Building2 className="w-3.5 h-3.5" />, badge: "Starter" },
        { label: "Apex Logistics", href: "/tenants?tenant=org-04", icon: <Building2 className="w-3.5 h-3.5" />, badge: "Scale" },
        { label: "Zenith Realty", href: "/tenants?tenant=org-05", icon: <Building2 className="w-3.5 h-3.5" />, badge: "Trial" },
      ];
    }

    if (pathname.startsWith("/ai")) {
      return [
        { label: "AI Cockpit", href: "/ai", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
        { label: "Email Infrastructure", href: "/ai/email", icon: <Mail className="w-3.5 h-3.5" />, badge: "Relay" },
        { label: "Tenants & Plans", href: "/ai/organizations", icon: <Building2 className="w-3.5 h-3.5" /> },
        { label: "Platform Users", href: "/ai/users", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "LLM Observability", href: "/ai/observability", icon: <Activity className="w-3.5 h-3.5" /> },
        { label: "Agent Swarm", href: "/ai/swarm", icon: <Bot className="w-3.5 h-3.5" />, badge: "15 AI" },
        { label: "Feature Flags", href: "/ai/features", icon: <Sliders className="w-3.5 h-3.5" /> },
        { label: "System Health", href: "/ai/system", icon: <Server className="w-3.5 h-3.5" /> },
        { label: "Security & Audit", href: "/ai/audit-logs", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/marketplace")) {
      return [
        { label: "Marketplace Hub", href: "/marketplace", icon: <Store className="w-3.5 h-3.5" /> },
        { label: "GMV & Analytics", href: "/marketplace/analytics", icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { label: "Pro Merchants", href: "/marketplace/merchants", icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />, badge: "Verified" },
        { label: "Job Assignments", href: "/marketplace/assignments", icon: <Wrench className="w-3.5 h-3.5" /> },
        { label: "Disputes & Escrow", href: "/marketplace/disputes", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
        { label: "Field Technicians", href: "/marketplace/technicians", icon: <UserCheck className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/erp")) {
      return [
        { label: "ERP Administration", href: "/erp", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
        { label: "User & Role Governance", href: "/erp/users", icon: <Lock className="w-3.5 h-3.5" />, badge: "6 RBAC" },
        { label: "Departmental Structure", href: "/erp/departments", icon: <Layers className="w-3.5 h-3.5" />, badge: "11 Depts" },
      ];
    }

    return [];
  };

  const activeSubTabs = getSubTabs();

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex relative font-sans">
      {/* SIDEBAR — EXACT OFIA MARKETPLACE & BUSINESS VERBATIM STYLING */}
      <aside
        className={cn(
          "bg-[var(--nexa-bg-surface)] border-r border-[var(--nexa-border)] transition-all duration-300 flex flex-col z-50 sticky top-0 h-screen",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        {/* COLLAPSE TOGGLE BUTTON WITH PURE WHITE BACKGROUND */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 !bg-white bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-slate-700 hover:text-[#1A56DB] hover:scale-110 transition-transform z-[60] cursor-pointer"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* LOGO AREA */}
        <div className="p-6 pb-2 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Ofia Super Admin"
                className="w-8 h-8 object-contain shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-extrabold text-display leading-tight text-[var(--nexa-text-primary)]">
                    Ofia Super Admin
                  </span>
                  <span className="text-[10px] font-extrabold font-mono uppercase text-[#1A56DB] bg-[#1A56DB]/10 border border-[#1A56DB]/20 px-2 py-0.5 rounded-full">
                    CROSS-APP
                  </span>
                </div>
                <span className="text-[9px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider mt-0.5">
                  Master Overview
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <img
                src="/logo.png"
                alt="Ofia Super Admin"
                className="w-8 h-8 object-contain mx-auto"
              />
            </Link>
          )}
        </div>

        {/* SEARCH BAR — DIRECTLY UNDER LOGO AND TITLE */}
        <div className="px-4 py-2">
          {isSidebarOpen ? (
            <div className="flex items-center bg-[var(--nexa-bg-base)] px-3.5 py-2 rounded-full border border-[var(--nexa-border)] gap-2.5 w-full focus-within:border-[#1A56DB] transition-all">
              <Search className="w-3.5 h-3.5 text-[var(--nexa-text-faint)] shrink-0" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs outline-none w-full text-[var(--nexa-text-primary)] placeholder:text-[var(--nexa-text-faint)] font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[var(--nexa-text-faint)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 mx-auto rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-center text-[var(--nexa-text-faint)] hover:text-[#1A56DB] transition-colors cursor-pointer"
              title="Search modules"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* NAV ITEMS — TOP LEVEL NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
          {[
            {
              label: "Overview",
              href: "/",
              icon: LayoutDashboard,
              badge: "HUB",
            },
            {
              label: "Tenant Management",
              href: "/tenants",
              icon: Building2,
              badge: "5 Orgs",
            },
            {
              label: "Ofia AI Swarm",
              href: "/ai",
              icon: Bot,
              badge: "15 AI",
            },
            {
              label: "Ofia Marketplace",
              href: "/marketplace",
              icon: ShoppingBag,
              badge: "PRO",
            },
            {
              label: "Enterprise ERP",
              href: "/erp",
              icon: Layers,
              badge: "ERP",
            },
          ]
            .filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href);
              const ItemIcon = item.icon;

              return (
                <Link href={item.href} key={item.href}>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3.5 p-3 rounded-full transition-all group mb-1 cursor-pointer",
                      isActive
                        ? "bg-[#1A56DB] text-white shadow-lg shadow-[#1A56DB]/20 font-bold"
                        : "text-[var(--nexa-text-faint)] hover:bg-[var(--nexa-bg-base)] hover:text-[var(--nexa-text-primary)] font-semibold"
                    )}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <div
                      className={cn(
                        "transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-[#1A56DB]"
                      )}
                    >
                      <ItemIcon className="w-5 h-5 shrink-0" />
                    </div>
                    {isSidebarOpen && (
                      <div className="flex-1 flex items-center justify-between text-left">
                        <span className="text-xs">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[9px] font-extrabold px-2 py-0.5 rounded-full",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-[#1A56DB]/10 text-[#1A56DB]"
                            )}
                          >
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
        <div className="p-4 border-t border-[var(--nexa-border)] space-y-2 relative">
          {/* User Profile / Status Row */}
          {isSidebarOpen ? (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-[var(--nexa-bg-base)]/70 border border-[var(--nexa-border)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <NexaAvatar size="sm" status="online" name="Super Admin" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                    Super Admin
                  </p>
                  <p className="text-[9px] text-emerald-500 font-extrabold uppercase tracking-wider truncate">
                    3 / 3 Clusters Live
                  </p>
                </div>
              </div>
              <div className="shrink-0 ml-1.5">
                <NexaThemeToggle />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <NexaAvatar size="sm" status="online" name="Super Admin" />
              <NexaThemeToggle />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* CONTENT WRAPPER */}
        <div className="p-8 space-y-6 flex-1">
          {/* HEADER TITLE & ACTIONS */}
          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {title && (
                  <h1 className="text-2xl font-black text-display tracking-tight text-[var(--nexa-text-primary)]">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs text-[var(--nexa-text-secondary)] mt-1 leading-relaxed max-w-3xl">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div className="shrink-0 flex items-center gap-2.5">{action}</div>}
            </div>
          )}

          {/* HORIZONTAL SUB-NAVIGATION PILL TABS */}
          {activeSubTabs.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-[var(--nexa-border)] pt-1">
              {activeSubTabs.map((tab, idx) => {
                const isTabActive =
                  pathname === tab.href ||
                  (tab.href !== "/" &&
                    tab.href !== "/ai" &&
                    tab.href !== "/marketplace" &&
                    tab.href !== "/erp" &&
                    pathname.startsWith(tab.href));
                return (
                  <Link href={tab.href} key={idx} className="shrink-0">
                    <button
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm",
                        isTabActive
                          ? "bg-[#1A56DB] text-white shadow-md shadow-[#1A56DB]/25 font-bold border border-[#1A56DB]"
                          : "bg-[var(--nexa-bg-surface)] hover:bg-[var(--nexa-bg-surface)]/80 text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] hover:border-[#1A56DB]/30"
                      )}
                    >
                      {tab.icon && <span>{tab.icon}</span>}
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={cn(
                            "text-[9px] px-1.5 py-0.2 rounded-full font-extrabold",
                            isTabActive ? "bg-white text-[#1A56DB]" : "bg-[#1A56DB]/10 text-[#1A56DB]"
                          )}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* PAGE BODY */}
          <div className="pt-2">{children}</div>
        </div>
      </main>
    </div>
  );
}
