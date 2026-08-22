"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaCard } from "@/components/nexa/NexaCard";
import {
  Boxes,
  ShoppingCart,
  Gift,
  Truck,
  PieChart,
  Users,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Bot,
  Zap,
  Globe,
  DollarSign,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Tv,
  Target,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  Check,
  Star,
} from "lucide-react";

export default function ERPMarketingPage() {
  const [activeModule, setActiveModule] = useState(0);

  const modules = [
    {
      id: "ims",
      title: "Inventory Management (IMS)",
      badge: "Asset Control",
      icon: Boxes,
      color: "#0E9F6E",
      headline: "Multi-Warehouse Stock Tracking & Automated Restock POs",
      desc: "Gain total visibility over every SKU across nationwide fulfillment hubs, store branches, and transit depots with real-time stock balance alerts and barcode verification.",
      features: [
        "Multi-warehouse hub & bin mapping with aisle-level precision",
        "Inter-branch Good Received Notes (GRN) & transfer tracking",
        "Automated vendor Purchase Orders with predictive reorder points",
        "Shrinkage audits, stock adjustment ledgers & write-off tracking",
      ],
      metrics: "₦48.6M Inventory Value Tracked",
      demoLink: "/erp/admin/inventory",
    },
    {
      id: "pos",
      title: "Point of Sale (POS)",
      badge: "Fast Checkout",
      icon: ShoppingCart,
      color: "#1A56DB",
      headline: "Lightning-Fast Touch Cashier & Multi-Tender Checkout",
      desc: "Empower retail branch staff with an intuitive touch terminal that handles barcode scanning, customer profiles, split tender payments, and automated shift Z-report audits.",
      features: [
        "Split payments: Cash, Debit Card (POS Terminal), and Direct Bank Transfer",
        "Barcode & SKU rapid search with customizable quick-action tiles",
        "Automated cashier shift sessions with opening float & closing Z-reports",
        "Instant thermal receipt printing, WhatsApp e-receipts & PDF dispatch",
      ],
      metrics: "0.8s Average Checkout Time",
      demoLink: "/erp/admin/pos",
    },
    {
      id: "referrals",
      title: "Viral Referrals & Affiliates",
      badge: "Viral Growth",
      icon: Gift,
      color: "#9061F9",
      headline: "Automated Referral Engine & Paystack Instant Payouts",
      desc: "Turn your customers and staff into a high-octane growth workforce with custom referral links, tiered reward rules, viral coefficient analytics, and automated wallet disbursements.",
      features: [
        "Dynamic referral reward rules (e.g. Give ₦5,000 / Get ₦5,000)",
        "Automated fraud detection, duplicate device & IP ring prevention",
        "Integrated Paystack & Flutterwave bank wallet batch payouts",
        "Real-time K-factor and viral funnel conversion telemetry",
      ],
      metrics: "K = 1.48 Viral Growth Multiplier",
      demoLink: "/erp/admin/referrals",
    },
    {
      id: "logistics",
      title: "Logistics & Dispatch",
      badge: "Fleet GPS",
      icon: Truck,
      color: "#F59E0B",
      headline: "Waybill Generation, Courier GPS & Nigerian Rate Engine",
      desc: "Automate delivery operations with digital waybills, nearest-courier dispatch assignment, live transit waypoint checkpoints, and multi-state delivery rate matrices.",
      features: [
        "Instant barcode waybill generation and dispatch slip printing",
        "Live courier & dispatch rider GPS location tracking",
        "Checkpoint waypoint scanning with photo proof-of-delivery",
        "Configurable Nigerian zonal pricing matrix (Intra-state, Inter-state, Express)",
      ],
      metrics: "98.2% On-Time Delivery SLA",
      demoLink: "/erp/admin/logistics",
    },
    {
      id: "finance",
      title: "Finance & General Ledger",
      badge: "Full GAAP / IFRS",
      icon: PieChart,
      color: "#3F83F8",
      headline: "Double-Entry Accounting, P&L, Invoices & Bank Feeds",
      desc: "Automate financial operations with compliant Chart of Accounts, recurring journal entries, aging receivables/payables, statutory VAT/PAYE remittances, and bank statement reconciliations.",
      features: [
        "Double-entry General Ledger with automated journal audit trails",
        "Real-time Income Statement (P&L), Balance Sheet & Cash Flow reports",
        "Accounts Receivable (Invoices, Estimates) & Accounts Payable (Vendor Bills)",
        "Statutory tax calculation & automated PAYE/WHT remittance exports",
      ],
      metrics: "₦184.2M Reconciled Transactions",
      demoLink: "/erp/accountant",
    },
    {
      id: "hr",
      title: "HR & 360 Appraisals",
      badge: "Talent & OKRs",
      icon: Users,
      color: "#0694A2",
      headline: "Staff Roster, Objective Bank & Automated Review Cycles",
      desc: "Manage your workforce lifecycle from onboarding to performance appraisal cycles with department objective alignments, peer reviews, and executive rating trendlines.",
      features: [
        "Centralized employee directory with grade levels, designations & roles",
        "Company-wide & departmental OKR / Objective Bank repository",
        "Structured 360 appraisal review cycles with automated manager workflows",
        "Employee self-service portal for reviews, profiles & goal submissions",
      ],
      metrics: "100% Appraisal Compliance",
      demoLink: "/erp/hr",
    },
    {
      id: "quests",
      title: "Team Quests Engine",
      badge: "Gamification",
      icon: Trophy,
      color: "#D97706",
      headline: "Corporate Retreats, Innovation Hackathons & Live TV Scoreboards",
      desc: "Ignite internal team competition and camaraderie with multi-day quests, photo/video evidence review desks, transactional score ledgers, and zero-login stage projector displays.",
      features: [
        "Multi-day quest builder with squad assignments & secret claim codes",
        "Generic challenge engine: Speed Trivia, Evidence Uploads, Pitch Panels",
        "Judge control room with live review desk and 1-click score awards",
        "Zero-login stage TV live scoreboard with full-screen auto-refresh mode",
      ],
      metrics: "8 Squads · 120 Staff Engaged",
      demoLink: "/erp/admin/quests",
    },
  ];

  const comparisonFeatures = [
    { name: "Unified Inventory & Multi-Warehouse IMS", ofia: true, traditional: "Add-on Plugin ($$$)" },
    { name: "Fast POS Touch Terminal with Split Tenders", ofia: true, traditional: "Separate Hardware Vendor" },
    { name: "Viral Referral & Affiliate Commission Payouts", ofia: true, traditional: "Not Supported" },
    { name: "Automated Waybill & Nigerian Zonal Logistics", ofia: true, traditional: "Third-party Integration" },
    { name: "Full Double-Entry General Ledger & Tax Reports", ofia: true, traditional: true },
    { name: "360 Performance Appraisals & OKR Bank", ofia: true, traditional: "Separate HR App" },
    { name: "Retreat Quests & Stage TV Live Scoreboard", ofia: true, traditional: "Not Supported" },
    { name: "Autonomous AI Cold Outreach & GTM Swarm", ofia: true, traditional: "Not Supported" },
    { name: "Local Nigerian Payment Rails (Paystack, Transfers)", ofia: true, traditional: "USD Cards Only" },
    { name: "Subdomain Tenant Isolation (tenant.ofia.ng)", ofia: true, traditional: "Complex Setup" },
  ];

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-sans">
      <PublicNav />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-[var(--nexa-border)] bg-gradient-to-b from-[var(--nexa-bg-surface)] via-[var(--nexa-bg-base)] to-[var(--nexa-bg-base)]">
        <div className="absolute inset-0 bg-[radial-gradient(#1A56DB_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UNIFIED ENTERPRISE OPERATING SYSTEM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto text-display leading-tight">
            The Complete ERP Suite Built for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1A56DB] via-[#7E3AF2] to-[#0E9F6E]">
              African Enterprise Scale
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--nexa-text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Eliminate operational fragmentation. Seamlessly orchestrate inventory, point of sale, viral referrals, automated logistics, general ledger accounting, 360 appraisals, and staff retreat quests in one cohesive platform.
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/erp/admin">
              <NexaButton size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Live Sandboxes
              </NexaButton>
            </Link>
            <Link href="/signup">
              <NexaButton size="lg" variant="outline" leftIcon={<Sparkles className="w-4 h-4 text-[#1A56DB]" />}>
                Start 14-Day Free Trial
              </NexaButton>
            </Link>
            <Link href="/contact">
              <NexaButton size="lg" variant="outline" leftIcon={<Building2 className="w-4 h-4" />}>
                Book Enterprise Walkthrough
              </NexaButton>
            </Link>
          </div>

          {/* KEY METRICS COCKPIT */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <NexaCard variant="glass" padding="md" className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#1A56DB] font-mono">₦184.2M+</div>
              <div className="text-xs text-[var(--nexa-text-muted)] font-medium">Reconciled Monthly Volume</div>
            </NexaCard>

            <NexaCard variant="glass" padding="md" className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#0E9F6E] font-mono">142 SKUs</div>
              <div className="text-xs text-[var(--nexa-text-muted)] font-medium">Live Multi-Warehouse IMS</div>
            </NexaCard>

            <NexaCard variant="glass" padding="md" className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#9061F9] font-mono">98.2% SLA</div>
              <div className="text-xs text-[var(--nexa-text-muted)] font-medium">On-Time Logistics Dispatch</div>
            </NexaCard>

            <NexaCard variant="glass" padding="md" className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#F59E0B] font-mono">7 Modules</div>
              <div className="text-xs text-[var(--nexa-text-muted)] font-medium">Single Integrated Database</div>
            </NexaCard>
          </div>
        </div>
      </section>

      {/* INTERACTIVE 7-MODULE SHOWCASE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <NexaBadge variant="brand">MODULAR ARCHITECTURE</NexaBadge>
          <h2 className="text-3xl sm:text-4xl font-black text-display">
            7 Specialized Modules. Zero Fragmented Data.
          </h2>
          <p className="text-sm text-[var(--nexa-text-secondary)] max-w-2xl mx-auto">
            Every transaction, barcode scan, dispatch waybill, and appraisal cycle flows seamlessly into your General Ledger in real-time.
          </p>
        </div>

        {/* MODULE TABS NAV */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 justify-start lg:justify-center no-scrollbar">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            const isSelected = activeModule === idx;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#1A56DB] text-white shadow-lg shadow-blue-500/20"
                    : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{m.title.split("(")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE MODULE DETAIL CARD */}
        {(() => {
          const m = modules[activeModule];
          const Icon = m.icon;
          return (
            <NexaCard
              variant="glass"
              padding="lg"
              className="border-2 border-[var(--nexa-border)] rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: m.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <NexaBadge variant="brand">{m.badge}</NexaBadge>
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] mt-1">
                      {m.title}
                    </h3>
                  </div>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-[var(--nexa-text-primary)] leading-snug">
                  {m.headline}
                </h4>

                <p className="text-sm text-[var(--nexa-text-secondary)] leading-relaxed">{m.desc}</p>

                <div className="space-y-2.5 pt-2">
                  {m.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[var(--nexa-text-primary)] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#0E9F6E] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Link href={m.demoLink}>
                    <NexaButton size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Open Module Console
                    </NexaButton>
                  </Link>
                  <span className="text-xs font-mono font-bold text-[var(--nexa-text-muted)] bg-[var(--nexa-bg-base)] px-3 py-1.5 rounded-lg border border-[var(--nexa-border)]">
                    {m.metrics}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[var(--nexa-bg-base)] p-6 rounded-2xl border border-[var(--nexa-border)] space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-[var(--nexa-text-primary)]">
                      LIVE TELEMETRY
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--nexa-text-muted)]">service_erp :8084</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-[var(--nexa-card-bg)] rounded-xl border border-[var(--nexa-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--nexa-text-secondary)] font-medium">Database Sync</span>
                    <NexaBadge variant="green">GORM v2 Live</NexaBadge>
                  </div>

                  <div className="p-3 bg-[var(--nexa-card-bg)] rounded-xl border border-[var(--nexa-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--nexa-text-secondary)] font-medium">Tenant Scoping</span>
                    <span className="text-xs font-mono font-bold text-[#1A56DB]">x-tenant-slug</span>
                  </div>

                  <div className="p-3 bg-[var(--nexa-card-bg)] rounded-xl border border-[var(--nexa-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--nexa-text-secondary)] font-medium">GL Transaction Audit</span>
                    <NexaBadge variant="purple">Double-Entry Immutable</NexaBadge>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-tr from-[#1A56DB]/10 to-indigo-500/5 border border-[#1A56DB]/20 text-center space-y-2">
                  <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Ready to experience {m.title}?
                  </div>
                  <p className="text-[11px] text-[var(--nexa-text-muted)]">
                    Test the complete interactive workflow in our sandbox demo environment.
                  </p>
                  <Link href={m.demoLink} className="inline-block pt-1">
                    <NexaButton size="sm" variant="outline">
                      Launch Interactive Simulator →
                    </NexaButton>
                  </Link>
                </div>
              </div>
            </NexaCard>
          );
        })()}
      </section>

      {/* ALL 7 MODULES GRID OVERVIEW */}
      <section className="py-20 bg-[var(--nexa-bg-surface)]/50 border-y border-[var(--nexa-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <NexaBadge variant="brand">MODULE DIRECTORY</NexaBadge>
            <h2 className="text-3xl font-black text-display">Explore All Core Enterprise Hubs</h2>
            <p className="text-sm text-[var(--nexa-text-secondary)] max-w-2xl mx-auto">
              Each module operates independently or as a unified, synchronizing enterprise brain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <NexaCard
                  key={mod.id}
                  variant="glass"
                  padding="lg"
                  className="space-y-4 border border-[var(--nexa-border)] flex flex-col justify-between hover:border-[#1A56DB] transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: mod.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <NexaBadge variant="brand">{mod.badge}</NexaBadge>
                    </div>

                    <div>
                      <h3 className="font-black text-base text-[var(--nexa-text-primary)] group-hover:text-[#1A56DB] transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-[var(--nexa-text-muted)] mt-1.5 leading-relaxed line-clamp-3">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--nexa-border)] flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--nexa-text-primary)]">
                      {mod.metrics}
                    </span>
                    <Link href={mod.demoLink}>
                      <NexaButton size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Explore
                      </NexaButton>
                    </Link>
                  </div>
                </NexaCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* AFRICAN LOCALIZATION ADVANTAGES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <NexaBadge variant="green">AFRICAN ENTERPRISE LOCALIZATION</NexaBadge>
          <h2 className="text-3xl sm:text-4xl font-black text-display">
            Built for Local Commerce Realities
          </h2>
          <p className="text-sm text-[var(--nexa-text-secondary)] max-w-2xl mx-auto">
            Traditional Western ERPs struggle with local payment methods, tax regulations, and network connectivity. Ofia is architected from day one for Nigerian and African operational workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NexaCard variant="glass" padding="lg" className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center font-bold">
              ₦
            </div>
            <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Multi-Rail Local Payments</h3>
            <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
              Native integration with Paystack, Flutterwave, and direct NIBSS bank transfers with automated payment webhook verification and instant wallet disbursements.
            </p>
          </NexaCard>

          <NexaCard variant="glass" padding="lg" className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-[var(--nexa-text-primary)]">FIRS Tax & Withholding Ready</h3>
            <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
              Automated 7.5% VAT calculation, 5%/10% Withholding Tax (WHT) deductions, and automated monthly statutory remittance schedule exports.
            </p>
          </NexaCard>

          <NexaCard variant="glass" padding="lg" className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#9061F9]/10 text-[#9061F9] flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Mobile Telegram CRO Approvals</h3>
            <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
              Managing Directors and department leads approve expenses, restock POs, and discount exceptions with 1 tap directly inside Telegram on mobile.
            </p>
          </NexaCard>
        </div>
      </section>

      {/* FEATURE COMPARISON TABLE */}
      <section className="py-20 bg-[var(--nexa-bg-surface)]/50 border-t border-[var(--nexa-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <NexaBadge variant="brand">THE COMPETITIVE ADVANTAGE</NexaBadge>
            <h2 className="text-3xl font-black text-display">Why Enterprises Migrate to Ofia ERP</h2>
          </div>

          <div className="border border-[var(--nexa-border)] rounded-2xl overflow-hidden bg-[var(--nexa-card-bg)] shadow-xl">
            <div className="grid grid-cols-12 bg-[var(--nexa-bg-surface)] p-4 text-xs font-bold text-[var(--nexa-text-primary)] border-b border-[var(--nexa-border)]">
              <div className="col-span-6 sm:col-span-7">Capability / Feature</div>
              <div className="col-span-3 sm:col-span-2 text-center text-[#1A56DB]">Ofia ERP Suite</div>
              <div className="col-span-3 text-center text-[var(--nexa-text-muted)]">Legacy ERPs</div>
            </div>

            <div className="divide-y divide-[var(--nexa-border)]">
              {comparisonFeatures.map((feat, idx) => (
                <div key={idx} className="grid grid-cols-12 p-4 text-xs items-center hover:bg-[var(--nexa-bg-base)] transition-colors">
                  <div className="col-span-6 sm:col-span-7 font-medium text-[var(--nexa-text-primary)]">
                    {feat.name}
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-center font-bold text-[#0E9F6E] flex items-center justify-center gap-1">
                    <Check className="w-4 h-4 text-[#0E9F6E]" /> Included
                  </div>
                  <div className="col-span-3 text-center text-[var(--nexa-text-muted)] font-mono text-[11px]">
                    {typeof feat.traditional === "boolean" ? (
                      <Check className="w-4 h-4 text-slate-400 mx-auto" />
                    ) : (
                      feat.traditional
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <NexaBadge variant="brand">ELEVATE YOUR BUSINESS</NexaBadge>
        <h2 className="text-3xl sm:text-4xl font-black text-display">
          Ready to Modernize Your Operations?
        </h2>
        <p className="text-sm text-[var(--nexa-text-secondary)] max-w-xl mx-auto">
          Join high-growth retailers, multi-branch distributors, and enterprise teams scaling across Africa on Ofia ERP.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/signup">
            <NexaButton size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start 14-Day Free Trial
            </NexaButton>
          </Link>
          <Link href="/erp/admin">
            <NexaButton size="lg" variant="outline">
              Explore Live Admin Demo
            </NexaButton>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
