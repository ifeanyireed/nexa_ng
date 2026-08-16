"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Compass,
  Megaphone,
  CheckSquare,
  Target,
  Sparkles,
  Calendar,
  BarChart3,
  BookOpen,
  Plug,
  Settings,
  Mic,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bot,
  Send,
  Globe,
} from "lucide-react";
import { useTheme } from "@/components/nexa/ThemeProvider";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { VoiceAssistantHUD } from "@/components/gtm/VoiceAssistantHUD";
import { AgentDrawer } from "@/components/gtm/AgentDrawer";
import { AIAgent, INITIAL_AGENTS } from "@/lib/gtm-data";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const navItems = [
    { label: "Executive Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "AI Organization", href: "/team", icon: Users, badge: "15" },
    { label: "GTM Strategy", href: "/strategy", icon: Compass },
    { label: "Campaigns", href: "/campaigns", icon: Megaphone, badge: "4" },
    { label: "Lead Intel & CRM", href: "/leads", icon: Target },
    { label: "Approval Center", href: "/approvals", icon: CheckSquare, badge: "3", alert: true },
    { label: "Content & Creative", href: "/studio", icon: Sparkles },
    { label: "Publishing Calendar", href: "/calendar", icon: Calendar },
    { label: "Revenue Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Memory & Knowledge", href: "/knowledge", icon: BookOpen },
    { label: "Channel Integrations", href: "/integrations", icon: Plug },
    { label: "Telegram CRO Bot", href: "/telegram", icon: Send, badge: "Free" },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col antialiased">
      {/* Voice Assistant HUD Modal */}
      <VoiceAssistantHUD isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      {/* Agent Workstation Chat Drawer */}
      <AgentDrawer
        agent={selectedAgent}
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />

      <div className="flex flex-1 h-full relative overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/80 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 select-none ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--nexa-border)]">
            <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
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
                    Autonomous Revenue Swarm
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
                      ? "bg-[#1A56DB] text-white shadow-sm dark:bg-[#3B82F6]"
                      : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-brand-light)]/60 dark:hover:bg-white/5"
                  }`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-[var(--nexa-text-muted)] group-hover:text-[#1A56DB] dark:group-hover:text-[#60A5FA]"
                    }`}
                  />
                  {isSidebarOpen && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {isSidebarOpen && item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.alert
                          ? "bg-[#FEF2F2] text-[#E02424] dark:bg-[#EF4444]/20 dark:text-[#F87171] animate-pulse"
                          : isActive
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

          {/* Quick Active Agents Desk */}
          {isSidebarOpen && (
            <div className="p-3.5 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/50">
              <div className="flex items-center justify-between text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider mb-2">
                <span>Active Swarm</span>
                <span className="flex items-center gap-1 text-[#0E9F6E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E] animate-ping" />
                  15 Live
                </span>
              </div>
              <div className="flex items-center -space-x-1.5 overflow-hidden py-1">
                {INITIAL_AGENTS.slice(0, 5).map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className="hover:scale-115 transition-transform relative cursor-pointer"
                    title={`${agent.name} (${agent.role})`}
                  >
                    <NexaAvatar
                      name={agent.name}
                      src={agent.avatar}
                      size="sm"
                      status={agent.status}
                    />
                  </button>
                ))}
                <Link
                  href="/team"
                  className="w-8 h-8 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-center text-[10px] font-bold text-[var(--nexa-text-muted)] hover:text-[#1A56DB] shadow-sm z-10"
                >
                  +10
                </Link>
              </div>
            </div>
          )}

          {/* Footer User Profile & Theme Toggle */}
          <div className="p-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                NG
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                    EduTech Nigeria
                  </span>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] truncate">
                    Growth Tier · Active
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
                {theme === "dark" ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4" />}
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

              <div className="relative hidden sm:flex items-center w-72">
                <Search className="absolute left-3 w-4 h-4 text-[var(--nexa-text-faint)]" />
                <input
                  type="text"
                  placeholder="Search campaigns, leads, agents... (Cmd+K)"
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] transition-all"
                />
              </div>
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2.5">
              {/* Voice Executive Orb Button */}
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1A56DB] to-[#3B82F6] text-white text-xs font-semibold shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask AI Voice</span>
              </button>

              {/* Public Website Link */}
              <Link
                href="/"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] text-xs font-semibold hover:bg-[var(--nexa-bg-surface)] transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-[#1A56DB]" />
                <span>Public Site</span>
              </Link>

              {/* Approval Quick Link */}
              <Link
                href="/approvals"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFBEB] dark:bg-[#F59E0B]/15 text-[#C88A3A] dark:text-[#FBBF24] border border-[#C88A3A]/20 text-xs font-bold hover:bg-[#FFFBEB]/80 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>3 Approvals</span>
              </Link>

              {/* Notification Bell */}
              <button className="p-2 rounded-xl text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] relative cursor-pointer">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E02424]" />
              </button>
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
