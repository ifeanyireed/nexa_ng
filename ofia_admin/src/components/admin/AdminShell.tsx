"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Building2,
  Users,
  ToggleLeft,
  Activity,
  Cpu,
  Server,
  FileText,
  Mail,
  ShoppingBag,
  Store,
  Briefcase,
  Layers,
  Award,
  AlertOctagon,
  TrendingUp,
  Landmark,
  UserCheck,
  FolderTree,
  FileSpreadsheet,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Power,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTheme } from "@/components/nexa/ThemeProvider";
import { NexaBadge } from "@/components/nexa/NexaBadge";

interface AdminShellProps {
  children: React.ReactNode;
}

export const AdminShell = ({ children }: AdminShellProps) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalCircuitBreakerArmed, setIsGlobalCircuitBreakerArmed] = useState(false);
  const [isCircuitBreakerToast, setIsCircuitBreakerToast] = useState(false);

  const navGroups = [
    {
      title: "Command Center",
      badge: "Core",
      items: [
        { label: "Global Overview", href: "/", icon: ShieldAlert },
        { label: "System Health & DB", href: "/system", icon: Server, badge: "4 Services" },
        { label: "Global Feature Flags", href: "/features", icon: ToggleLeft, badge: "6 Live" },
        { label: "Platform Audit Logs", href: "/audit-logs", icon: FileText },
      ],
    },
    {
      title: "Ofia AI (GTM Swarm)",
      badge: "AI B2B",
      items: [
        { label: "AI Swarm Overview", href: "/ai", icon: Sparkles },
        { label: "Email Infra & Relays", href: "/ai/email", icon: Mail, badge: "Master Keys" },
        { label: "Tenant Organizations", href: "/ai/organizations", icon: Building2, badge: "240" },
        { label: "15 AI Specialists", href: "/ai/swarm", icon: Activity, badge: "Active" },
        { label: "LLM Costs & Traces", href: "/ai/observability", icon: Cpu },
        { label: "GTM Workspace Users", href: "/ai/users", icon: Users },
      ],
    },
    {
      title: "Ofia Marketplace",
      badge: "Nexa B2C/B2B",
      items: [
        { label: "Marketplace GMV", href: "/marketplace", icon: ShoppingBag },
        { label: "Pro Vetting & Badges", href: "/marketplace/pros", icon: Award, badge: "12 Pending" },
        { label: "99+ Niche Categories", href: "/marketplace/categories", icon: Layers },
        { label: "Escrow Disputes", href: "/marketplace/disputes", icon: AlertOctagon, badge: "2 Open" },
        { label: "City & Geo Analytics", href: "/marketplace/analytics", icon: TrendingUp },
      ],
    },
    {
      title: "Ofia ERP",
      badge: "Enterprise",
      items: [
        { label: "ERP Dashboard", href: "/erp", icon: Briefcase },
        { label: "Staff & 6 RBAC Roles", href: "/erp/users", icon: UserCheck, badge: "120 Staff" },
        { label: "Departments & KPIs", href: "/erp/departments", icon: FolderTree },
        { label: "Financial Audit Trail", href: "/erp/audit-trail", icon: FileSpreadsheet },
      ],
    },
  ];

  const triggerEmergencyCircuitBreaker = () => {
    setIsGlobalCircuitBreakerArmed(!isGlobalCircuitBreakerArmed);
    setIsCircuitBreakerToast(true);
    setTimeout(() => setIsCircuitBreakerToast(false), 3500);
  };

  const isCurrentActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    // Route alias backward-compatibility
    if (href === "/ai/email" && pathname === "/admin/email") return true;
    if (href === "/ai/organizations" && pathname === "/admin/organizations") return true;
    if (href === "/ai/swarm" && pathname === "/admin/swarm") return true;
    if (href === "/ai/observability" && pathname === "/admin/observability") return true;
    if (href === "/ai/users" && pathname === "/admin/users") return true;
    return false;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col antialiased">
      {/* Toast Alert */}
      {isCircuitBreakerToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-[#E02424] text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Power className="w-4 h-4" />
          {isGlobalCircuitBreakerArmed
            ? "EMERGENCY: Global Agent Circuit Breaker ARMED. Outbound sending paused across all tenants!"
            : "NORMAL: Global Agent Circuit Breaker disarmed. Autonomous agents resumed."}
        </div>
      )}

      <div className="flex flex-1 h-full relative overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/95 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 select-none ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--nexa-border)]">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="/logo.png"
                alt="Ofia Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              {isSidebarOpen && (
                <div className="flex flex-col leading-tight">
                  <span className="font-black text-sm tracking-tight text-[var(--nexa-text-primary)]">
                    Ofia Super Admin
                  </span>
                  <span className="text-[10px] font-semibold text-[#1A56DB] dark:text-[#60A5FA]">
                    Unified Platform Command
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-xl border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] transition-all cursor-pointer"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links Grouped */}
          <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {isSidebarOpen && (
                  <div className="px-3 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--nexa-text-muted)]">
                      {group.title}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]">
                      {group.badge}
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isCurrentActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                          active
                            ? "bg-[#1A56DB] text-white shadow-md"
                            : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]"
                        } ${!isSidebarOpen ? "justify-center px-0" : ""}`}
                        title={!isSidebarOpen ? item.label : undefined}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-[var(--nexa-text-muted)] group-hover:text-[var(--nexa-text-primary)]"}`} />
                        {isSidebarOpen && (
                          <div className="flex items-center justify-between flex-1 overflow-hidden">
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  active
                                    ? "bg-white/20 text-white"
                                    : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Killswitch & Theme */}
          <div className="p-3 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] space-y-2">
            {isSidebarOpen ? (
              <button
                onClick={triggerEmergencyCircuitBreaker}
                className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isGlobalCircuitBreakerArmed
                    ? "bg-[#E02424] text-white shadow-lg animate-pulse"
                    : "bg-[#E02424]/10 text-[#E02424] border border-[#E02424]/30 hover:bg-[#E02424] hover:text-white"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isGlobalCircuitBreakerArmed ? "Disarm Emergency Stop" : "Emergency Killswitch"}</span>
              </button>
            ) : (
              <button
                onClick={triggerEmergencyCircuitBreaker}
                className="w-full py-2 flex items-center justify-center rounded-xl bg-[#E02424]/10 text-[#E02424] hover:bg-[#E02424] hover:text-white transition-all cursor-pointer"
                title="Emergency Killswitch"
              >
                <Power className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center justify-between pt-1">
              {isSidebarOpen && (
                <span className="text-[11px] text-[var(--nexa-text-muted)] font-medium">Theme Mode</span>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] transition-all cursor-pointer"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Moon className="w-3.5 h-3.5 text-[#1A56DB]" />}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20 uppercase tracking-wider">
                  Super Admin
                </span>
                <span className="text-xs text-[var(--nexa-text-muted)] hidden sm:inline">
                  • 3 Applications Connected
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0E9F6E]/10 border border-[#0E9F6E]/20 text-[#0E9F6E] text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#0E9F6E] animate-ping" />
                <span>Microservices Operational</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A56DB] to-[#7E3AF2] text-white flex items-center justify-center font-black text-xs shadow-md">
                SA
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--nexa-bg-base)]">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 bg-[var(--nexa-bg-surface)] h-full flex flex-col p-4 z-10 border-r border-[var(--nexa-border)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--nexa-border)]">
              <span className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Ofia Super Admin</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-[var(--nexa-bg-base)]">
                <X className="w-5 h-5 text-[var(--nexa-text-muted)]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-[var(--nexa-text-muted)] px-2">
                    {group.title}
                  </span>
                  {group.items.map((item) => {
                    const active = isCurrentActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                          active ? "bg-[#1A56DB] text-white" : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20">{item.badge}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
