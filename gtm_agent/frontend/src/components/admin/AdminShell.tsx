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
  ArrowLeft,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  Zap,
  Power,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { useTheme } from "@/components/nexa/ThemeProvider";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

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

  const navItems = [
    { label: "Platform Overview", href: "/admin", icon: ShieldAlert },
    { label: "Platform Email & Limits", href: "/admin/email", icon: Mail, badge: "Global" },
    { label: "Tenant Organizations", href: "/admin/organizations", icon: Building2, badge: "240" },
    { label: "User Directory", href: "/admin/users", icon: Users, badge: "1.4k" },
    { label: "Feature Flags", href: "/admin/features", icon: ToggleLeft, badge: "6 Active" },
    { label: "AI Swarm Health", href: "/admin/swarm", icon: Activity, badge: "15 Agents", alert: false },
    { label: "Model Gateway & Costs", href: "/admin/observability", icon: Cpu },
    { label: "System & Queues", href: "/admin/system", icon: Server },
    { label: "Operator Audit Trail", href: "/admin/audit-logs", icon: FileText },
  ];

  const triggerEmergencyCircuitBreaker = () => {
    setIsGlobalCircuitBreakerArmed(!isGlobalCircuitBreakerArmed);
    setIsCircuitBreakerToast(true);
    setTimeout(() => setIsCircuitBreakerToast(false), 3500);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col antialiased">
      {isCircuitBreakerToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-[#E02424] text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Power className="w-4 h-4" />
          {isGlobalCircuitBreakerArmed
            ? "EMERGENCY: Global Agent Circuit Breaker ARMED. Outbound sending paused across all tenants!"
            : "NORMAL: Global Agent Circuit Breaker disarmed. Autonomous swarm resumed."}
        </div>
      )}

      <div className="flex flex-1 h-full relative overflow-hidden">
        {/* Admin Sidebar */}
        <aside
          className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/90 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 select-none ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--nexa-border)]">
            <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="/logo.png"
                alt="GTM AI Agency Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              {isSidebarOpen && (
                <div className="flex flex-col leading-tight">
                  <span className="font-extrabold text-sm tracking-tight text-[var(--nexa-text-primary)] text-display">
                    GTM AI Agency
                  </span>
                  <span className="text-[10px] font-semibold text-[#1A56DB] dark:text-[#60A5FA]">
                    SuperAdmin Operator
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-[var(--nexa-text-faint)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)] transition-colors cursor-pointer"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? "bg-[#1A56DB] text-white shadow-sm dark:bg-[#2563EB]"
                      : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-brand-light)]/60 dark:hover:bg-white/5"
                  }`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-[var(--nexa-text-muted)] group-hover:text-[#1A56DB] dark:group-hover:text-[#60A5FA]"
                    }`}
                  />
                  {isSidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
                  {isSidebarOpen && item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[var(--nexa-border)] text-[var(--nexa-text-muted)]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Return to Tenant App */}
          <div className="p-3 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/50">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:border-[#1A56DB]/40 text-xs font-bold text-[#1A56DB] dark:text-[#60A5FA] transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              {isSidebarOpen && <span>Switch to Tenant View</span>}
            </Link>
          </div>

          {/* Footer User Profile & Theme Toggle */}
          <div className="p-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#1A56DB] flex items-center justify-center text-white font-bold text-xs shrink-0">
                SA
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                    Platform SuperAdmin
                  </span>
                  <span className="text-[10px] text-[#1A56DB] dark:text-[#60A5FA] truncate font-mono">
                    root-access
                  </span>
                </div>
              )}
            </div>

            {isSidebarOpen && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)] transition-colors cursor-pointer"
                title="Toggle Dark/Light Mode"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#1A56DB]" />}
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Bar Header */}
          <header className="h-16 border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-20 shrink-0 sticky top-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <NexaBadge variant="brand" dot>
                  SUPER ADMIN CONSOLE
                </NexaBadge>
                <span className="hidden sm:inline text-xs text-[var(--nexa-text-muted)]">
                  Database: <strong className="text-mono font-bold text-[var(--nexa-text-primary)]">u721451974_nexa_db</strong>
                </span>
              </div>
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center gap-3">
              {/* Emergency Circuit Breaker */}
              <button
                onClick={triggerEmergencyCircuitBreaker}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isGlobalCircuitBreakerArmed
                    ? "bg-[#E02424] text-white animate-pulse"
                    : "bg-[#FEF2F2] text-[#E02424] dark:bg-[#EF4444]/15 dark:text-[#F87171] border border-[#E02424]/20 hover:bg-[#E02424] hover:text-white"
                }`}
                title="Emergency Swarm Circuit Breaker"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isGlobalCircuitBreakerArmed ? "Circuit Breaker ARMED" : "Global Swarm Killswitch"}</span>
              </button>

              <div className="h-5 w-px bg-[var(--nexa-border)] hidden sm:block" />

              <Link href="/dashboard">
                <NexaButton size="sm" variant="ghost" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Exit Admin
                </NexaButton>
              </Link>
            </div>
          </header>

          {/* Main Body View */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};
