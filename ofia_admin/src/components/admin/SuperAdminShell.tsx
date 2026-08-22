"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
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
  Search,
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
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import { NexaBadge, NexaBadgeVariant } from "@/components/nexa/NexaBadge";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeVariant?: NexaBadgeVariant;
}

interface NavGroup {
  id: string;
  title: string;
  appCode: "AI" | "MARKETPLACE" | "ERP";
  appColor: string;
  icon: any;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "ai",
    title: "Ofia AI Swarm",
    appCode: "AI",
    appColor: "#1A56DB",
    icon: Bot,
    items: [
      { label: "AI Cockpit", href: "/ai", icon: LayoutDashboard },
      { label: "Email Infrastructure", href: "/ai/email", icon: Mail, badge: "Master Relay", badgeVariant: "brand" },
      { label: "Tenants & Plans", href: "/ai/organizations", icon: Building2 },
      { label: "Platform Users", href: "/ai/users", icon: Users },
      { label: "LLM Observability", href: "/ai/observability", icon: Activity },
      { label: "Agent Swarm (15)", href: "/ai/swarm", icon: Bot, badge: "15 Agents", badgeVariant: "purple" },
      { label: "Feature Flags", href: "/ai/features", icon: Sliders },
      { label: "System Health", href: "/ai/system", icon: Server },
      { label: "Security & Audit", href: "/ai/audit-logs", icon: ShieldAlert },
    ],
  },
  {
    id: "marketplace",
    title: "Ofia Marketplace",
    appCode: "MARKETPLACE",
    appColor: "#0E9F6E",
    icon: ShoppingBag,
    items: [
      { label: "Marketplace Hub", href: "/marketplace", icon: Store },
      { label: "GMV & Analytics", href: "/marketplace/analytics", icon: TrendingUp },
      { label: "Pro Merchants & Badges", href: "/marketplace/merchants", icon: ShieldCheck, badge: "Verified", badgeVariant: "green" },
      { label: "Job Assignments", href: "/marketplace/assignments", icon: Wrench },
      { label: "Disputes & Escrow", href: "/marketplace/disputes", icon: ShieldAlert },
      { label: "Field Technicians", href: "/marketplace/technicians", icon: UserCheck },
    ],
  },
  {
    id: "erp",
    title: "Ofia Enterprise ERP",
    appCode: "ERP",
    appColor: "#9061F9",
    icon: Building2,
    items: [
      { label: "ERP Administration", href: "/erp", icon: LayoutDashboard },
      { label: "User & Role Governance", href: "/erp/users", icon: Lock, badge: "6 RBAC", badgeVariant: "cyan" },
      { label: "Departmental Structure", href: "/erp/departments", icon: Layers, badge: "11 Depts", badgeVariant: "purple" },
    ],
  },
];

export function SuperAdminShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col font-sans">
      {/* TOPBAR */}
      <header className="sticky top-0 z-40 h-16 border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>

          {/* Logo & Platform Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1A56DB] via-[#7E3AF2] to-[#0E9F6E] p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center text-white font-black text-sm">
                OF
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-[var(--nexa-text-primary)]">
                  Ofia Super Admin
                </span>
                <NexaBadge variant="brand" className="text-[9px] py-0 px-1.5 font-mono uppercase">
                  Cross-App
                </NexaBadge>
              </div>
              <p className="text-[10px] text-[var(--nexa-text-muted)] font-mono hidden sm:block">
                Master Mission Control
              </p>
            </div>
          </Link>

          {/* App Switcher Tabs */}
          <div className="hidden xl:flex items-center gap-1 pl-4 border-l border-[var(--nexa-border)] text-xs font-semibold">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                pathname === "/"
                  ? "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-bold shadow-xs border border-[var(--nexa-border)]"
                  : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
              }`}
            >
              Unified Cockpit
            </Link>
            <Link
              href="/ai"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                pathname.startsWith("/ai")
                  ? "bg-[#1A56DB]/10 text-[#1A56DB] font-bold border border-[#1A56DB]/30"
                  : "text-[var(--nexa-text-muted)] hover:text-[#1A56DB]"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Ofia AI
            </Link>
            <Link
              href="/marketplace"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                pathname.startsWith("/marketplace")
                  ? "bg-[#0E9F6E]/10 text-[#0E9F6E] font-bold border border-[#0E9F6E]/30"
                  : "text-[var(--nexa-text-muted)] hover:text-[#0E9F6E]"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Marketplace
            </Link>
            <Link
              href="/erp"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                pathname.startsWith("/erp")
                  ? "bg-[#9061F9]/10 text-[#9061F9] font-bold border border-[#9061F9]/30"
                  : "text-[var(--nexa-text-muted)] hover:text-[#9061F9]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Enterprise ERP
            </Link>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          {/* Global System Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[11px] font-mono text-[var(--nexa-text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[#0E9F6E] animate-pulse" />
            <span>3 / 3 Clusters Live</span>
          </div>

          <NexaThemeToggle />

          {/* Superadmin avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[var(--nexa-border)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A56DB] to-[#7E3AF2] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              SA
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold leading-tight text-[var(--nexa-text-primary)]">Super Admin</div>
              <div className="text-[10px] text-[var(--nexa-text-muted)] font-mono">root@ofia.ng</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-[var(--nexa-bg-surface)] border-r border-[var(--nexa-border)] flex flex-col transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } pt-16 lg:pt-0 overflow-y-auto`}
        >
          {/* Search Box */}
          <div className="p-3.5 border-b border-[var(--nexa-border)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Jump to setting or app..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] placeholder-[var(--nexa-text-muted)] outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-5 flex-1">
            {/* Quick Master Cockpit Link */}
            <div>
              <Link
                href="/"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/"
                    ? "bg-[#1A56DB] text-white shadow-md"
                    : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Master Mission Control</span>
                </div>
                <NexaBadge variant={pathname === "/" ? "neutral" : "brand"} className="text-[9px] py-0 px-1">
                  HUB
                </NexaBadge>
              </Link>
            </div>

            {/* 3 Application Group Accordions */}
            {NAV_GROUPS.map((group) => {
              const isCollapsed = collapsedGroups[group.id];
              const isGroupActive = pathname.startsWith(`/${group.id}`);
              const Icon = group.icon;

              const filteredItems = group.items.filter((item) =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredItems.length === 0 && searchQuery) return null;

              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: group.appColor }}
                      />
                      <span>{group.title}</span>
                    </div>
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Group Items */}
                  {!isCollapsed && (
                    <div className="space-y-0.5 pt-0.5">
                      {filteredItems.map((item) => {
                        const isActive = pathname === item.href;
                        const ItemIcon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                              isActive
                                ? "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-bold border border-[var(--nexa-border)] shadow-xs"
                                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)]/60 hover:text-[var(--nexa-text-primary)]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <ItemIcon
                                className={`w-4 h-4 shrink-0 ${
                                  isActive ? "text-[#1A56DB]" : "text-[var(--nexa-text-muted)]"
                                }`}
                              />
                              <span className="truncate">{item.label}</span>
                            </div>

                            {item.badge && (
                              <NexaBadge
                                variant={item.badgeVariant || "neutral"}
                                className="text-[9px] py-0 px-1 font-mono shrink-0"
                              >
                                {item.badge}
                              </NexaBadge>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Version / Droplet Info */}
          <div className="p-3 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/40 text-[10px] font-mono text-[var(--nexa-text-muted)] space-y-1">
            <div className="flex justify-between items-center">
              <span>Cluster:</span>
              <span className="text-[var(--nexa-text-secondary)]">Production (Hostinger/DO)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Core Microservices:</span>
              <span className="text-[#0E9F6E] font-bold">4 Active</span>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Banner */}
          {title && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--nexa-border)]">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--nexa-text-primary)]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1 max-w-3xl leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
          )}

          {/* Children Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
