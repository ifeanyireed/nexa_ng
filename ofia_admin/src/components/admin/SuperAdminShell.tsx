"use client";

import React, { useState, useEffect, useRef } from "react";
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
  LogOut,
  Bell,
  BarChart3,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { SuperAdminUser } from "@/lib/jwt-auth";
import { useAdminAuth } from "@/lib/auth-context";

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
  const {
    user: currentUser,
    role,
    permissions,
    isLoading,
    isAuthenticated,
    logout: handleLogout,
  } = useAdminAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: "1",
      title: "New Organization Provisioned",
      message: "New Era Transports activated with 142 seats and Autonomous AI.",
      type: "TENANT",
      time: "3m ago",
      isRead: false,
    },
    {
      id: "2",
      title: "Escrow Dispute Escalation",
      message: "Order #DISP-9842 in Ofia Compass flagged for manual mediation.",
      type: "DISPUTE",
      time: "18m ago",
      isRead: false,
    },
    {
      id: "3",
      title: "Autonomous Outreach Milestone",
      message: "GTM Agent Swarm qualified 350 enterprise leads across 5 tenants today.",
      type: "AI",
      time: "1h ago",
      isRead: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Automatic sub-navigation tabs according to current pathname
  const getSubTabs = (): SubNavItem[] => {
    if (subTabs !== undefined) return subTabs;

    if (pathname === "/") {
      return [];
    }

    if (pathname.startsWith("/tenants")) {
      return [];
    }

    if (pathname.startsWith("/subscriptions")) {
      return [];
    }

    if (pathname.startsWith("/ai")) {
      return [
        { label: "AI Cockpit", href: "/ai", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
        { label: "Email Infrastructure", href: "/ai/email", icon: <Mail className="w-3.5 h-3.5" />, badge: "Relay" },
        { label: "Agent Swarm", href: "/ai/swarm", icon: <Bot className="w-3.5 h-3.5" />, badge: "15 AI" },
        { label: "LLM Observability", href: "/ai/observability", icon: <Activity className="w-3.5 h-3.5" /> },
        { label: "Tenants & Plans", href: "/ai/organizations", icon: <Building2 className="w-3.5 h-3.5" /> },
        { label: "Feature Flags", href: "/ai/features", icon: <Sliders className="w-3.5 h-3.5" /> },
        { label: "System Health", href: "/ai/system", icon: <Server className="w-3.5 h-3.5" /> },
        { label: "Security & Audit", href: "/ai/audit-logs", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/marketplace")) {
      return [
        { label: "Compass Overview", href: "/marketplace", icon: <Store className="w-3.5 h-3.5" /> },
        { label: "Verticals & Categories", href: "/marketplace/verticals", icon: <Layers className="w-3.5 h-3.5" />, badge: "24 Subcats" },
        { label: "GMV & Analytics", href: "/marketplace/analytics", icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { label: "Pro Merchants", href: "/marketplace/merchants", icon: <ShieldCheck className="w-3.5 h-3.5" />, badge: "Verified" },
        { label: "Job Assignments", href: "/marketplace/assignments", icon: <Wrench className="w-3.5 h-3.5" /> },
        { label: "Disputes & Escrow", href: "/marketplace/disputes", icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />, badge: "Mediation" },
        { label: "Field Technicians", href: "/marketplace/technicians", icon: <UserCheck className="w-3.5 h-3.5" /> },
      ];
    }

    if (pathname.startsWith("/crm")) {
      return [
        { label: "Waitlist Pipeline", href: "/crm/waitlist", icon: <Users className="w-3.5 h-3.5 text-blue-500" />, badge: "2.8k Leads" },
        { label: "Contact Inquiries", href: "/crm/contact", icon: <Mail className="w-3.5 h-3.5 text-emerald-500" />, badge: "Support" },
        { label: "Enterprise Inquiries", href: "/crm/leads", icon: <Building2 className="w-3.5 h-3.5" /> },
        { label: "Conversion Analytics", href: "/crm/analytics", icon: <TrendingUp className="w-3.5 h-3.5" /> },
      ];
    }

    return [];
  };

  const activeSubTabs = getSubTabs();

  const navItems: {
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: string;
    key: string;
    section: "Governance & Hub" | "Tenants & Subscriptions" | "Autonomous AI Swarm" | "Ofia Compass & Commerce" | "CRM & Growth";
  }[] = [
    // 1. GOVERNANCE & HUB
    {
      label: "Master Overview",
      icon: <LayoutDashboard className="w-6 h-6" />,
      href: "/",
      badge: "HUB",
      key: "overview",
      section: "Governance & Hub",
    },

    // 2. TENANTS & SUBSCRIPTIONS
    {
      label: "Tenant Organizations",
      icon: <Building2 className="w-6 h-6" />,
      href: "/tenants",
      badge: "5 Orgs",
      key: "tenants",
      section: "Tenants & Subscriptions",
    },
    {
      label: "Plan Tiers & Quotas",
      icon: <CreditCard className="w-6 h-6" />,
      href: "/subscriptions",
      badge: "Billing",
      key: "subscriptions",
      section: "Tenants & Subscriptions",
    },

    // 3. AUTONOMOUS AI SWARM
    {
      label: "AI Swarm Cockpit",
      icon: <Bot className="w-6 h-6" />,
      href: "/ai",
      badge: "15 AI",
      key: "ai",
      section: "Autonomous AI Swarm",
    },

    // 4. OFIA COMPASS & COMMERCE
    {
      label: "Compass Marketplace",
      icon: <ShoppingBag className="w-6 h-6" />,
      href: "/marketplace",
      badge: "PRO",
      key: "marketplace",
      section: "Ofia Compass & Commerce",
    },

    // 5. CRM & GROWTH
    {
      label: "CRM & Growth",
      icon: <Users className="w-6 h-6" />,
      href: "/crm",
      badge: "2.8k",
      key: "crm",
      section: "CRM & Growth",
    },
  ];

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-nexa-bg-base flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-nexa-brand/10 border border-nexa-brand/20 flex items-center justify-center animate-pulse mb-4">
          <Shield className="w-6 h-6 text-nexa-brand" />
        </div>
        <p className="text-sm font-black text-display text-nexa-text-primary">Verifying SuperAdmin Session...</p>
        <p className="text-xs text-nexa-text-muted mt-1">Evaluating cryptographic operator token and RBAC claims</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexa-bg-base text-nexa-text-primary flex relative font-sans">
      {/* SIDEBAR — MATCHING OFIA ERP VERBATIM */}
      <aside
        className={cn(
          "bg-nexa-bg-surface border-r border-nexa-border transition-all duration-300 flex flex-col z-50 sticky top-0 h-screen",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        {/* COLLAPSE TOGGLE BUTTON WITH PURE WHITE BACKGROUND & SHADOW */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 !bg-white bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-slate-700 hover:text-nexa-brand hover:scale-110 transition-transform z-[60] cursor-pointer"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* LOGO AREA */}
        <div className="p-6 pb-2 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <img
                src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
                alt="Ofia Super Admin"
                className="w-8 h-8 rounded-lg object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-display leading-tight text-nexa-text-primary truncate">
                  Ofia Ecosystem
                </span>
                <span className="text-[11px] font-black text-nexa-brand tracking-wide uppercase mt-0.5">
                  SUPER ADMIN
                </span>
                <span className="text-[9px] font-bold text-nexa-text-muted uppercase tracking-wider">
                  Master Governance
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <img
                src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
                alt="Ofia Super Admin"
                className="w-8 h-8 rounded-lg object-contain mx-auto"
              />
            </Link>
          )}
        </div>

        {/* SEARCH BAR — DIRECTLY UNDER LOGO AND TITLE */}
        <div className="px-4 py-2">
          {isSidebarOpen ? (
            <div className="flex items-center bg-nexa-bg-base px-3.5 py-2 rounded-full border border-nexa-border gap-2.5 w-full focus-within:border-nexa-brand transition-all">
              <Search className="w-3.5 h-3.5 text-nexa-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search console..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs outline-none w-full text-nexa-text-primary placeholder:text-nexa-text-muted font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-nexa-text-muted hover:text-nexa-text-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 mx-auto rounded-full bg-nexa-bg-base border border-nexa-border flex items-center justify-center text-nexa-text-muted hover:text-nexa-text-primary hover:border-nexa-brand/30 transition-colors cursor-pointer"
              title="Search console"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* NAV ITEMS WITH CATEGORIZED SECTION GROUPINGS */}
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto scrollbar-hide">
          {(() => {
            const filtered = navItems.filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            );

            let currentSection = "";

            return filtered.map((item, i) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              const showSectionHeader = item.section && item.section !== currentSection;
              if (showSectionHeader) {
                currentSection = item.section;
              }

              return (
                <React.Fragment key={item.key || i}>
                  {showSectionHeader && (
                    <div className={cn("pt-3 pb-1", i === 0 && "pt-0")}>
                      {isSidebarOpen ? (
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-nexa-text-muted px-3 flex items-center gap-1.5">
                          <span>{item.section}</span>
                        </div>
                      ) : (
                        <div className="w-8 h-[1px] bg-nexa-border mx-auto my-1" />
                      )}
                    </div>
                  )}

                  <Link href={item.href}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3.5 p-3 rounded-full transition-all group mb-1 cursor-pointer",
                        isActive
                          ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20 font-bold"
                          : "text-nexa-text-secondary hover:bg-nexa-bg-base hover:text-nexa-text-primary font-semibold"
                      )}
                      title={!isSidebarOpen ? item.label : undefined}
                    >
                      <div
                        className={cn(
                          "transition-transform group-hover:scale-110",
                          isActive ? "text-white" : "text-nexa-text-muted group-hover:text-nexa-brand transition-colors"
                        )}
                      >
                        {item.icon}
                      </div>
                      {isSidebarOpen && (
                        <div className="flex-1 flex items-center justify-between text-left">
                          <span className="text-[14px]">{item.label}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] font-extrabold px-2 py-0.5 rounded-full",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-nexa-brand/10 text-nexa-brand"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </Link>
                </React.Fragment>
              );
            });
          })()}
        </nav>

        {/* FOOTER ACTIONS WITH USER PROFILE & NOTIFICATION ROW */}
        <div className="p-4 border-t border-nexa-border space-y-2 relative">
          <div className="relative" ref={dropdownRef}>
            {isSidebarOpen ? (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <NexaAvatar
                    size="sm"
                    isOnline
                    src={currentUser?.avatar}
                    name={currentUser?.name || "Super Admin"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-nexa-text-primary truncate">
                      {currentUser?.name || "Super Admin"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase border",
                          role === "SUPER_ADMIN"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : role === "SECURITY_ADMIN"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        )}
                      >
                        {role ? role.replace("_", " ") : "SUPER ADMIN"}
                      </span>
                      <span className="text-[8px] text-emerald-500 font-bold truncate">
                        • Live
                      </span>
                    </div>
                  </div>
                </div>

                {/* NOTIFICATION BELL BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-1.5 hover:bg-nexa-bg-surface rounded-full cursor-pointer text-nexa-text-secondary focus:outline-none transition-colors border border-nexa-border shrink-0 ml-1.5"
                  title="Cross-App Alert Feed"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-rose-500 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center px-0.5 shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <NexaAvatar
                  size="sm"
                  isOnline
                  src={currentUser?.avatar}
                  name={currentUser?.name || "Super Admin"}
                />
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 hover:bg-nexa-bg-base rounded-full cursor-pointer text-nexa-text-secondary focus:outline-none transition-colors border border-nexa-border"
                  title="Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-rose-500 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center px-0.5 shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* NOTIFICATION CENTER DROPDOWN */}
            {isNotifOpen && (
              <div className="absolute left-full bottom-0 ml-3 w-80 sm:w-96 bg-nexa-bg-surface border border-nexa-border rounded-3xl shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[500px]">
                <div className="p-4 border-b border-nexa-border flex items-center justify-between bg-nexa-bg-base/50">
                  <span className="font-extrabold text-sm text-display">Ecosystem Live Feeds</span>
                  <span className="text-xs text-nexa-brand font-bold">Real-Time Sync</span>
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
                          <span className="text-[10px] text-nexa-text-muted font-semibold">
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

          {/* LOGOUT & THEME TOGGLE ROW */}
          <div className="flex items-center gap-1.5 justify-between">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3.5 p-3 rounded-full text-rose-500 hover:bg-rose-500/10 transition-all text-left cursor-pointer",
                isSidebarOpen ? "flex-1" : "w-full justify-center"
              )}
              title="Logout"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="font-bold text-xs">Log Out</span>}
            </button>

            {isSidebarOpen && (
              <div className="shrink-0">
                <NexaThemeToggle />
              </div>
            )}
          </div>
          {!isSidebarOpen && (
            <div className="flex justify-center pt-1">
              <NexaThemeToggle />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 space-y-6 flex-1">
          {/* RBAC ROLE BANNER FOR AUDITOR / VIEWER */}
          {role === "VIEWER" && (
            <div className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-2.5 min-w-0">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                <p className="text-xs font-semibold truncate">
                  <strong className="font-extrabold">Read-Only Mode:</strong> Signed in as <span className="font-mono underline">{currentUser?.name}</span> (VIEWER / Auditor). All tenant and infrastructure mutations are restricted.
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 shrink-0">
                AUDIT COMPLIANCE
              </span>
            </div>
          )}

          {/* RBAC ROLE BANNER FOR SECURITY ADMIN */}
          {role === "SECURITY_ADMIN" && (
            <div className="px-4 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-3 text-blue-600 dark:text-blue-400 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
                <span className="font-medium truncate">SecOps & Trust Scope ({currentUser?.department}) — Tenant mutation restricted</span>
              </div>
              <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 shrink-0">
                SECOPS SCOPE
              </span>
            </div>
          )}

          {/* HEADER TITLE & ACTIONS */}
          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {title && (
                  <h1 className="text-2xl font-black text-display tracking-tight text-nexa-text-primary">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs text-nexa-text-secondary mt-1 leading-relaxed max-w-3xl">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div className="shrink-0 flex items-center gap-2.5">{action}</div>}
            </div>
          )}

          {/* HORIZONTAL SUB-NAVIGATION PILL TABS */}
          {activeSubTabs.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-nexa-border pt-1">
              {activeSubTabs.map((tab, idx) => {
                const isTabActive =
                  pathname === tab.href ||
                  (tab.href !== "/" &&
                    tab.href !== "/ai" &&
                    tab.href !== "/marketplace" &&
                    tab.href !== "/tenants" &&
                    pathname.startsWith(tab.href));
                return (
                  <Link href={tab.href} key={idx} className="shrink-0">
                    <button
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm",
                        isTabActive
                          ? "bg-nexa-brand text-white shadow-md shadow-nexa-brand/25 font-bold border border-nexa-brand"
                          : "bg-nexa-bg-surface hover:bg-nexa-bg-surface/80 text-nexa-text-secondary hover:text-nexa-text-primary border border-nexa-border hover:border-nexa-brand/30"
                      )}
                    >
                      {tab.icon && <span>{tab.icon}</span>}
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={cn(
                            "text-[9px] px-1.5 py-0.2 rounded-full font-extrabold",
                            isTabActive ? "bg-white text-nexa-brand" : "bg-nexa-brand/10 text-nexa-brand"
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
