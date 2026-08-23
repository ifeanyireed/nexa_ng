"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Award,
  Bike,
  Bot,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  Database,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Flame,
  Gavel,
  Gift,
  Globe,
  Grid,
  Headphones,
  History,
  Key,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Mic,
  MessageSquare,
  Package,
  PieChart,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  Sparkles,
  Store,
  Tag,
  Target,
  Terminal,
  TrendingUp,
  Trophy,
  Truck,
  Tv,
  UserCheck,
  Users,
  Wallet,
  Warehouse,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import { NexaBadge, NexaBadgeVariant } from "@/components/nexa/NexaBadge";
import { VoiceAssistantHUD } from "@/components/gtm/VoiceAssistantHUD";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeVariant?: NexaBadgeVariant;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function BusinessShell({
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
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  // Active module detection
  const isAdmin = pathname.startsWith("/erp/admin");
  const isQuests = pathname.startsWith("/erp/admin/quests") || pathname.startsWith("/erp/hr/quests");
  const isInventory = pathname.startsWith("/erp/admin/inventory");
  const isPOS = pathname.startsWith("/erp/admin/pos");
  const isReferrals = pathname.startsWith("/erp/admin/referrals");
  const isLogistics = pathname.startsWith("/erp/admin/logistics");
  const isAI = pathname.startsWith("/erp/admin/ai");
  const isMarketplace = pathname.startsWith("/erp/admin/marketplace");
  const isComponents = pathname.startsWith("/erp/admin/components");
  const isAccountant = pathname.startsWith("/erp/accountant");
  const isHR = pathname.startsWith("/erp/hr");
  const isManager = pathname.startsWith("/erp/manager");
  const isEmployee = pathname.startsWith("/erp/employee");
  const isMD = pathname.startsWith("/erp/md");
  const isTenant = pathname.startsWith("/tenant");

  // Contextual Nav Sections
  const getNavSections = (): NavSection[] => {
    if (isQuests) {
      return [
        {
          title: "Team Quests Engine",
          items: [
            { label: "Quests Dashboard", href: "/erp/admin/quests", icon: LayoutDashboard },
            { label: "Create New Quest", href: "/erp/admin/quests/new", icon: Sparkles },
            { label: "2026 Staff Retreat", href: "/erp/admin/quests/qst-retreat-2026", icon: Flame, badge: "Live", badgeVariant: "green" },
            { label: "Judge Control Desk", href: "/erp/admin/quests/qst-retreat-2026/challenges/chl-02", icon: Gavel },
          ],
        },
        {
          title: "Public Displays & Portals",
          items: [
            { label: "Stage TV Scoreboard", href: "/quests/2026-staff-retreat/scoreboard", icon: Tv, badge: "Live", badgeVariant: "purple" },
            { label: "Public Quest Page", href: "/quests/2026-staff-retreat", icon: Globe },
            { label: "Admin Mission Control", href: "/erp/admin", icon: Shield },
          ],
        },
      ];
    }

    if (isInventory) {
      return [
        {
          title: "Inventory Management (IMS)",
          items: [
            { label: "Inventory Cockpit", href: "/erp/admin/inventory", icon: LayoutDashboard },
            { label: "Master SKU Catalog", href: "/erp/admin/inventory/items", icon: Package, badge: "142 SKUs", badgeVariant: "brand" },
            { label: "Warehouse Hubs & Bins", href: "/erp/admin/inventory/warehouses", icon: Warehouse },
            { label: "Stock Transfers (GRN)", href: "/erp/admin/inventory/transfers", icon: Truck },
            { label: "Stock Audits & Shrinkage", href: "/erp/admin/inventory/adjustments", icon: RefreshCw },
            { label: "Vendor Restock POs", href: "/erp/admin/inventory/suppliers", icon: Boxes },
          ],
        },
        {
          title: "Commercial Modules",
          items: [
            { label: "POS Cashier", href: "/erp/admin/pos", icon: ShoppingCart },
            { label: "Logistics Dispatch", href: "/erp/admin/logistics", icon: Send },
            { label: "Admin Mission Control", href: "/erp/admin", icon: Shield },
          ],
        },
      ];
    }

    if (isPOS) {
      return [
        {
          title: "Point of Sale (POS)",
          items: [
            { label: "POS Touch Terminal", href: "/erp/admin/pos", icon: ShoppingCart, badge: "Live", badgeVariant: "green" },
            { label: "Shift History (Z-Report)", href: "/erp/admin/pos/sessions", icon: History },
            { label: "Receipt Archive", href: "/erp/admin/pos/receipts", icon: Receipt },
            { label: "SmartPOS Terminals", href: "/erp/admin/pos/terminals", icon: Sliders },
          ],
        },
        {
          title: "Commercial Modules",
          items: [
            { label: "Inventory (IMS)", href: "/erp/admin/inventory", icon: Boxes },
            { label: "Logistics Dispatch", href: "/erp/admin/logistics", icon: Truck },
            { label: "Admin Mission Control", href: "/erp/admin", icon: Shield },
          ],
        },
      ];
    }

    if (isReferrals) {
      return [
        {
          title: "Viral Referral & Affiliates",
          items: [
            { label: "Referral Cockpit", href: "/erp/admin/referrals", icon: LayoutDashboard, badge: "K=1.48", badgeVariant: "purple" },
            { label: "Campaign Rules (₦5k/₦5k)", href: "/erp/admin/referrals/campaigns", icon: Gift },
            { label: "Affiliate Directory", href: "/erp/admin/referrals/affiliates", icon: Users, badge: "184", badgeVariant: "brand" },
            { label: "Paystack Payouts", href: "/erp/admin/referrals/payouts", icon: DollarSign },
            { label: "Funnels & Anti-Fraud", href: "/erp/admin/referrals/analytics", icon: TrendingUp },
          ],
        },
        {
          title: "Admin Operations",
          items: [
            { label: "Admin Mission Control", href: "/erp/admin", icon: Shield },
            { label: "AI GTM Swarm", href: "/erp/admin/ai", icon: Bot },
            { label: "Marketplace Store", href: "/erp/admin/marketplace", icon: Store },
          ],
        },
      ];
    }

    if (isLogistics) {
      return [
        {
          title: "Logistics Command Center",
          items: [
            { label: "Logistics Overview", href: "/erp/admin/logistics", icon: LayoutDashboard, badge: "98% SLA", badgeVariant: "green" },
            { label: "Waybills & Shipments", href: "/erp/admin/logistics/shipments", icon: Package },
            { label: "Dispatch Console", href: "/erp/admin/logistics/dispatch", icon: Send },
            { label: "Courier Fleet GPS", href: "/erp/admin/logistics/fleet", icon: Truck },
            { label: "Delivery Rate Matrix", href: "/erp/admin/logistics/rates", icon: DollarSign },
          ],
        },
        {
          title: "Admin Operations",
          items: [
            { label: "Inventory (IMS)", href: "/erp/admin/inventory", icon: Boxes },
            { label: "POS Cashier", href: "/erp/admin/pos", icon: ShoppingCart },
            { label: "Admin Mission Control", href: "/erp/admin", icon: Shield },
          ],
        },
      ];
    }

    if (isAI) {
      return [
        {
          title: "Autonomous GTM Swarm",
          items: [
            { label: "GTM Dashboard", href: "/erp/admin/ai", icon: LayoutDashboard },
            { label: "Campaigns", href: "/erp/admin/ai/campaigns", icon: Zap, badge: "Live", badgeVariant: "brand" },
            { label: "New Campaign", href: "/erp/admin/ai/campaigns/new", icon: Sparkles },
            { label: "Lead Intelligence", href: "/erp/admin/ai/leads", icon: Target },
            { label: "AI Studio", href: "/erp/admin/ai/studio", icon: Sparkles },
            { label: "Knowledge Base", href: "/erp/admin/ai/knowledge", icon: Database },
            { label: "GTM Strategy", href: "/erp/admin/ai/strategy", icon: Flame },
            { label: "Agent Swarm (15)", href: "/erp/admin/ai/team", icon: Bot, badge: "15 Agents", badgeVariant: "purple" },
            { label: "Approval Center", href: "/erp/admin/ai/approvals", icon: ShieldCheck },
            { label: "Telegram Sync", href: "/erp/admin/ai/telegram", icon: MessageSquare },
            { label: "Analytics & ROI", href: "/erp/admin/ai/analytics", icon: TrendingUp },
            { label: "Integrations", href: "/erp/admin/ai/integrations", icon: Layers },
          ],
        },
        {
          title: "Admin Operations",
          items: [
            { label: "Admin Hub", href: "/erp/admin", icon: Shield },
            { label: "Marketplace Store", href: "/erp/admin/marketplace", icon: Store },
            { label: "UI Components", href: "/erp/admin/components", icon: Layers },
          ],
        },
      ];
    }

    if (isMarketplace) {
      return [
        {
          title: "Marketplace Storefront",
          items: [
            { label: "Store Dashboard", href: "/erp/admin/marketplace", icon: Store },
            { label: "Product Catalog", href: "/erp/admin/marketplace/shop", icon: Package },
            { label: "Bookings & Schedule", href: "/erp/admin/marketplace/bookings", icon: Calendar },
            { label: "Flash Deals & Promos", href: "/erp/admin/marketplace/deals", icon: Tag },
            { label: "Inbound Buyer Leads", href: "/erp/admin/marketplace/leads", icon: Target },
            { label: "Buyer Messages", href: "/erp/admin/marketplace/messages", icon: MessageSquare },
            { label: "Payout Wallet", href: "/erp/admin/marketplace/wallet", icon: Wallet, badge: "₦ Payout", badgeVariant: "green" },
            { label: "Store Analytics", href: "/erp/admin/marketplace/analytics", icon: TrendingUp },
          ],
        },
        {
          title: "Admin Operations",
          items: [
            { label: "Admin Hub", href: "/erp/admin", icon: Shield },
            { label: "AI GTM Swarm", href: "/erp/admin/ai", icon: Bot },
            { label: "UI Components", href: "/erp/admin/components", icon: Layers },
          ],
        },
      ];
    }

    if (isComponents) {
      return [
        {
          title: "Nexa Design System",
          items: [
            { label: "Component Gallery", href: "/erp/admin/components", icon: Layers },
            { label: "Admin Hub", href: "/erp/admin", icon: Shield },
            { label: "AI GTM Swarm", href: "/erp/admin/ai", icon: Bot },
            { label: "Marketplace Store", href: "/erp/admin/marketplace", icon: Store },
          ],
        },
      ];
    }

    if (isAdmin) {
      return [
        {
          title: "Admin Command Center",
          items: [
            { label: "Admin Mission Control", href: "/erp/admin", icon: LayoutDashboard },
            { label: "Inventory (IMS)", href: "/erp/admin/inventory", icon: Boxes, badge: "142 SKUs", badgeVariant: "green" },
            { label: "POS Cashier", href: "/erp/admin/pos", icon: ShoppingCart, badge: "Terminal", badgeVariant: "brand" },
            { label: "Viral Referrals", href: "/erp/admin/referrals", icon: Gift, badge: "K=1.48", badgeVariant: "purple" },
            { label: "Logistics & Dispatch", href: "/erp/admin/logistics", icon: Truck, badge: "98% SLA", badgeVariant: "green" },
            { label: "Team Quests", href: "/erp/admin/quests", icon: Trophy, badge: "Games", badgeVariant: "purple" },
            { label: "AI GTM Swarm", href: "/erp/admin/ai", icon: Bot, badge: "15 Agents", badgeVariant: "purple" },
            { label: "Marketplace Store", href: "/erp/admin/marketplace", icon: Store, badge: "Merchant", badgeVariant: "green" },
            { label: "UI Component Library", href: "/erp/admin/components", icon: Layers },
          ],
        },
        {
          title: "Enterprise ERP",
          items: [
            { label: "Finance & Accounts", href: "/erp/accountant", icon: PieChart },
            { label: "Human Resources", href: "/erp/hr", icon: Users },
            { label: "Managing Director", href: "/erp/md", icon: Building2 },
          ],
        },
      ];
    }

    if (isAccountant) {
      return [
        {
          title: "Finance & General Ledger",
          items: [
            { label: "Finance Cockpit", href: "/erp/accountant", icon: LayoutDashboard },
            { label: "Cash Flow Overview", href: "/erp/accountant/overview", icon: TrendingUp },
            { label: "Invoices (AR)", href: "/erp/accountant/invoices", icon: FileText },
            { label: "Vendor Bills (AP)", href: "/erp/accountant/bills", icon: CreditCard },
            { label: "Expenses", href: "/erp/accountant/expenses", icon: CreditCard },
            { label: "Chart of Accounts", href: "/erp/accountant/coa", icon: Layers },
            { label: "General Ledger", href: "/erp/accountant/ledger", icon: FileSpreadsheet },
            { label: "Banking & Feeds", href: "/erp/accountant/banking", icon: Building2 },
            { label: "Reconciliation", href: "/erp/accountant/reconcile", icon: CheckCircle2 },
            { label: "Salary Payouts", href: "/erp/accountant/payroll-payment-processing", icon: Users },
            { label: "Financial Position", href: "/erp/accountant/financial-position", icon: PieChart },
            { label: "Income Statement (P&L)", href: "/erp/accountant/income-statement", icon: TrendingUp },
            { label: "Statutory Tax", href: "/erp/accountant/statutory-remittances", icon: ShieldCheck },
            { label: "Period Close", href: "/erp/accountant/period-close", icon: Lock },
          ],
        },
        {
          title: "Cross-Department",
          items: [
            { label: "Admin Hub", href: "/erp/admin", icon: Shield, badge: "Admin", badgeVariant: "purple" },
            { label: "Human Resources", href: "/erp/hr", icon: Users },
          ],
        },
      ];
    }

    if (isHR) {
      return [
        {
          title: "Human Resources",
          items: [
            { label: "HR Dashboard", href: "/erp/hr", icon: LayoutDashboard },
            { label: "Employee Directory", href: "/erp/hr/users", icon: Users },
            { label: "Objective Bank", href: "/erp/hr/objectives", icon: Target },
            { label: "Appraisal Cycles", href: "/erp/hr/cycle", icon: Calendar },
            { label: "Team Quests", href: "/erp/admin/quests", icon: Trophy, badge: "Games", badgeVariant: "purple" },
            { label: "Department Reports", href: "/erp/hr/reports", icon: FileSpreadsheet },
          ],
        },
        {
          title: "Enterprise Roles",
          items: [
            { label: "Admin Hub", href: "/erp/admin", icon: Shield },
            { label: "Finance & Accounts", href: "/erp/accountant", icon: PieChart },
          ],
        },
      ];
    }

    if (isManager) {
      return [
        {
          title: "Department Management",
          items: [
            { label: "Team Overview", href: "/erp/manager", icon: LayoutDashboard },
          ],
        },
      ];
    }

    if (isEmployee) {
      return [
        {
          title: "Staff Self-Service",
          items: [
            { label: "Workplace Portal", href: "/erp/employee", icon: LayoutDashboard },
            { label: "My Team Quests", href: "/erp/employee/quests", icon: Trophy, badge: "Rank #1", badgeVariant: "green" },
            { label: "Personal Profile", href: "/erp/employee/profile", icon: UserCheck },
            { label: "My Appraisals", href: "/erp/employee/reviews", icon: CheckCircle2 },
          ],
        },
      ];
    }

    if (isMD) {
      return [
        {
          title: "Executive Directorate",
          items: [
            { label: "Executive Cockpit", href: "/erp/md", icon: Building2 },
          ],
        },
        {
          title: "Department Overviews",
          items: [
            { label: "Admin Hub", href: "/erp/admin", icon: Shield },
            { label: "Finance & Accounts", href: "/erp/accountant", icon: PieChart },
            { label: "Human Resources", href: "/erp/hr", icon: Users },
          ],
        },
      ];
    }

    if (isTenant) {
      return [
        {
          title: "Tenant Administration",
          items: [
            { label: "Tenant Hub", href: "/tenant", icon: LayoutDashboard },
            { label: "Workspace Settings", href: "/tenant/settings", icon: Settings },
            { label: "Billing & Subscriptions", href: "/tenant/billing", icon: CreditCard, badge: "Growth", badgeVariant: "brand" },
            { label: "Team Seats & Invites", href: "/tenant/team", icon: Users },
            { label: "BYOK Key Vault", href: "/tenant/byok", icon: Key, badge: "AES-256", badgeVariant: "purple" },
            { label: "Quota & Usage Limits", href: "/tenant/usage", icon: Activity },
          ],
        },
      ];
    }

    // Default ERP Navigation
    return [
      {
        title: "Enterprise Portals",
        items: [
          { label: "ERP Hub", href: "/erp", icon: LayoutDashboard },
          { label: "Admin (AI & Store)", href: "/erp/admin", icon: Shield, badge: "Admin", badgeVariant: "purple" },
          { label: "Finance & Accounts", href: "/erp/accountant", icon: PieChart, badge: "Finance", badgeVariant: "brand" },
          { label: "Human Resources", href: "/erp/hr", icon: Users, badge: "HR", badgeVariant: "green" },
          { label: "Manager Reviews", href: "/erp/manager", icon: ShieldCheck, badge: "Manager", badgeVariant: "amber" },
          { label: "Employee Workplace", href: "/erp/employee", icon: UserCheck, badge: "Staff", badgeVariant: "neutral" },
          { label: "Managing Director", href: "/erp/md", icon: Building2, badge: "MD / Exec", badgeVariant: "coral" },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col font-sans">
      {/* TOPBAR */}
      <header className="sticky top-0 z-40 h-16 border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>

          {/* Platform Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Ofia Compass Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-[var(--nexa-text-primary)]">
                  Ofia Compass
                </span>
                <NexaBadge variant="brand" className="text-[9px] py-0 px-2 font-mono uppercase rounded-full">
                  Enterprise
                </NexaBadge>
              </div>
              <p className="text-[10px] text-[var(--nexa-text-muted)] font-mono hidden sm:block">
                Unified Business Platform
              </p>
            </div>
          </Link>

          {/* Module Switcher Tabs */}
          <div className="hidden xl:flex items-center gap-1 pl-4 border-l border-[var(--nexa-border)] text-xs font-semibold">
            <Link
              href="/erp/admin"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                isAdmin
                  ? "bg-[#9061F9]/10 text-[#9061F9] font-bold border border-[#9061F9]/30"
                  : "text-[var(--nexa-text-muted)] hover:text-[#9061F9]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin (AI & Store)
            </Link>

            <Link
              href="/erp/accountant"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                isAccountant
                  ? "bg-[#0E9F6E]/10 text-[#0E9F6E] font-bold border border-[#0E9F6E]/30"
                  : "text-[var(--nexa-text-muted)] hover:text-[#0E9F6E]"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              Finance & Accounting
            </Link>

            <Link
              href="/erp/hr"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                isHR
                  ? "bg-[#1A56DB]/10 text-[#1A56DB] font-bold border border-[#1A56DB]/30"
                  : "text-[var(--nexa-text-muted)] hover:text-[#1A56DB]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Human Resources
            </Link>

            <Link
              href="/tenant"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                isTenant
                  ? "bg-[#C88A3A]/10 text-[#C88A3A] font-bold border border-[#C88A3A]/30"
                  : "text-[var(--nexa-text-muted)] hover:text-[#C88A3A]"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Tenant Admin
            </Link>

            <Link
              href="/shopfront"
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors text-[var(--nexa-text-muted)] hover:text-[#0E9F6E]"
            >
              <Store className="w-3.5 h-3.5" />
              Shopfront Preview
            </Link>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* AI Voice Assistant Trigger */}
          <button
            onClick={() => setShowVoiceAssistant(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1A56DB]/10 to-[#7E3AF2]/10 border border-[#1A56DB]/20 text-[#1A56DB] hover:border-[#1A56DB]/50 transition-all text-xs font-bold cursor-pointer"
            title="Open AI Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 text-[#1A56DB] animate-pulse" />
            <span className="hidden sm:inline">AI Voice</span>
          </button>

          <NexaThemeToggle />

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--nexa-border)]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A56DB] to-[#7E3AF2] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              OB
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold leading-tight text-[var(--nexa-text-primary)]">EduSuite Nigeria</div>
              <div className="text-[10px] text-[var(--nexa-text-muted)] font-mono">Marketer / Finance</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-68 bg-[var(--nexa-bg-surface)] border-r border-[var(--nexa-border)] flex flex-col transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } pt-16 lg:pt-0 overflow-y-auto`}
        >
          {/* Search Box */}
          <div className="p-3.5 border-b border-[var(--nexa-border)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search screen or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] placeholder-[var(--nexa-text-muted)] outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          {/* Dynamic Navigation Sections */}
          <div className="p-3 space-y-5 flex-1">
            {navSections.map((section, idx) => {
              const filteredItems = section.items.filter((item) =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredItems.length === 0 && searchQuery) return null;

              return (
                <div key={idx} className="space-y-1">
                  <div className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
                    {section.title}
                  </div>

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
                </div>
              );
            })}
          </div>

          {/* Bottom Active Workspace Indicator */}
          <div className="p-3 border-t border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/40 text-[10px] font-mono text-[var(--nexa-text-muted)] space-y-1">
            <div className="flex justify-between items-center">
              <span>Organization:</span>
              <span className="text-[var(--nexa-text-primary)] font-bold">EduSuite NG</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Current Plan:</span>
              <span className="text-[#0E9F6E] font-bold">Growth Tier</span>
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

      {/* VOICE ASSISTANT MODAL */}
      <VoiceAssistantHUD
        isOpen={showVoiceAssistant}
        onClose={() => setShowVoiceAssistant(false)}
      />
    </div>
  );
}
