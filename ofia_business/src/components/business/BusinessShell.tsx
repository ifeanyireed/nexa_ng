"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Compass,
  Target,
  Send,
  Users,
  CheckSquare,
  Wand2,
  BookOpen,
  Calendar,
  BarChart3,
  UserPlus,
  Settings,
  ShoppingBag,
  Store,
  Wallet,
  MessageSquare,
  User,
  Briefcase,
  Landmark,
  UserCheck,
  Award,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { useTheme } from "@/components/nexa/ThemeProvider";

interface BusinessShellProps {
  children: React.ReactNode;
}

export const BusinessShell = ({ children }: BusinessShellProps) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const businessGroups = [
    {
      title: "Autonomous GTM (/ai)",
      badge: "Ofia AI",
      items: [
        { label: "GTM Dashboard", href: "/ai/dashboard", icon: Target },
        { label: "GTM Strategy & ICP", href: "/ai/strategy", icon: Compass },
        { label: "Outbound Campaigns", href: "/ai/campaigns", icon: Send, badge: "3 Active" },
        { label: "Leads & ICP Signals", href: "/ai/leads", icon: Users, badge: "1.4k" },
        { label: "1-Tap Approvals", href: "/ai/approvals", icon: CheckSquare, badge: "2 Pending" },
        { label: "AI Content Studio", href: "/ai/studio", icon: Wand2 },
        { label: "Company Knowledge", href: "/ai/knowledge", icon: BookOpen },
        { label: "Calendar & Meetings", href: "/ai/calendar", icon: Calendar },
        { label: "Revenue Analytics", href: "/ai/analytics", icon: BarChart3 },
        { label: "Workspace Team", href: "/ai/team", icon: UserPlus },
        { label: "Settings & BYOK", href: "/ai/settings", icon: Settings },
      ],
    },
    {
      title: "Marketplace Client (/marketplace)",
      badge: "Nexa Portal",
      items: [
        { label: "Marketplace Portal", href: "/marketplace", icon: ShoppingBag },
        { label: "Client Dashboard", href: "/marketplace/client/dashboard", icon: Store },
        { label: "Bookings", href: "/marketplace/client/dashboard/bookings", icon: Calendar, badge: "8 New" },
        { label: "Direct Messages", href: "/marketplace/client/dashboard/messages", icon: MessageSquare },
        { label: "Purchases & Orders", href: "/marketplace/client/dashboard/shop", icon: Store },
        { label: "Client Wallet", href: "/marketplace/client/dashboard/wallet", icon: Wallet, badge: "₦420k" },
        { label: "Client Profile", href: "/marketplace/client/dashboard/profile", icon: User },
        { label: "Client Settings", href: "/marketplace/client/dashboard/settings", icon: Settings },
      ],
    },
    {
      title: "Enterprise Operations (/erp)",
      badge: "ERP Suite",
      items: [
        { label: "ERP Executive", href: "/erp", icon: Briefcase },
        { label: "Finance & Accounts", href: "/erp/accountant", icon: Landmark, badge: "General Ledger" },
        { label: "HR & Appraisals", href: "/erp/hr", icon: Award, badge: "Q3 Cycle" },
        { label: "Manager Reviews", href: "/erp/manager", icon: UserCheck },
        { label: "Employee Portal", href: "/erp/employee", icon: Users },
        { label: "Managing Director", href: "/erp/md", icon: Building2 },
      ],
    },
  ];

  const isCurrentActive = (href: string) => {
    if (href === "/ai/dashboard" && (pathname === "/ai/dashboard" || pathname === "/ai" || pathname === "/" || pathname === "/gtm")) return true;
    if (pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col antialiased">
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
                alt="Ofia Business Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              {isSidebarOpen && (
                <div className="flex flex-col leading-tight">
                  <span className="font-black text-sm tracking-tight text-[var(--nexa-text-primary)]">
                    Ofia Business
                  </span>
                  <span className="text-[10px] font-semibold text-[#1A56DB] dark:text-[#60A5FA]">
                    Enterprise Growth Suite
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

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 custom-scrollbar">
            {businessGroups.map((group) => (
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

          {/* Theme & Organization Switcher */}
          <div className="p-3 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-lg bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center font-bold text-xs">
                  O
                </div>
                <div className="flex flex-col leading-tight overflow-hidden">
                  <span className="font-bold text-xs truncate text-[var(--nexa-text-primary)]">Ofia Enterprise</span>
                  <span className="text-[10px] text-[#0E9F6E] font-semibold">Growth Tier</span>
                </div>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Moon className="w-3.5 h-3.5 text-[#1A56DB]" />}
            </button>
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
                  Business Suite
                </span>
                <span className="text-xs text-[var(--nexa-text-muted)] hidden sm:inline">
                  • /ai (GTM Swarm) • /marketplace (/client/*) • /erp (Enterprise Operations)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A56DB] to-[#0E9F6E] text-white flex items-center justify-center font-black text-xs shadow-md">
                OB
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
              <span className="font-extrabold text-sm text-[var(--nexa-text-primary)]">Ofia Business</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-[var(--nexa-bg-base)]">
                <X className="w-5 h-5 text-[var(--nexa-text-muted)]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {businessGroups.map((group) => (
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
