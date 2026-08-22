"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  Database,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe,
  Key,
  Layers,
  LayoutDashboard,
  Lock,
  Mail,
  Package,
  PieChart,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Store,
  Tag,
  Target,
  Terminal,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function AdminCommandCenterPage() {
  return (
    <BusinessShell
      title="Admin Command Center"
      subtitle="Executive management over Autonomous AI GTM Outreach, Marketplace Storefront Operations, and Design System Components."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/erp/admin/ai/campaigns/new">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<Zap className="w-3.5 h-3.5" />}
              className="bg-[#1A56DB] text-white hover:bg-[#1545B0]"
            >
              Launch AI Campaign
            </NexaButton>
          </Link>
          <Link href="/erp/admin/marketplace/shop">
            <NexaButton size="sm" variant="outline" leftIcon={<Package className="w-3.5 h-3.5" />}>
              Add Product SKU
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP METRICS BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">AI Outbound Pipeline</span>
              <Bot className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              1,480 Leads
            </div>
            <div className="text-[11px] text-[#1A56DB] font-semibold">
              15 Autonomous Agents Active
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Store GMV & Revenue</span>
              <DollarSign className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              ₦14,850,000
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">
              +28.4% this month
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Deliverability Score</span>
              <Mail className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              99.4%
            </div>
            <div className="text-[11px] text-[#9061F9] font-bold">
              Resend / SMTP Relay Active
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#F59E0B]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Pending Human Approvals</span>
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              3 Tasks
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-semibold">
              Telegram 1-Tap Sync Ready
            </div>
          </NexaCard>
        </div>

        {/* 3 ADMIN MODULE HUBS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* MODULE 1: AI GTM SWARM */}
          <NexaCard
            variant="glass"
            padding="lg"
            className="space-y-5 border border-[#1A56DB]/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Autonomous AI GTM</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">Multi-Channel Swarm</p>
                  </div>
                </div>
                <NexaBadge variant="brand">15 Agents</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Autonomous outbound sales execution, ICP lead intelligence, multi-channel campaigns, AI Studio copywriting, and RAG knowledge base.
              </p>

              <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Active Campaigns:</span>
                  <span className="font-bold text-[#1A56DB]">4 Live</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Daily Emails Sent:</span>
                  <span className="font-bold text-[#0E9F6E]">320 / 500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Positive Reply Rate:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">14.8%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/erp/admin/ai/campaigns" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>Campaigns</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/erp/admin/ai/leads" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>Lead Database</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/erp/admin/ai/studio" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>AI Studio</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/erp/admin/ai/team" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] transition-all flex items-center justify-between">
                  <span>Agent Swarm</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
              </div>

              <Link href="/erp/admin/ai" className="block pt-1">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#1A56DB] text-white hover:bg-[#1545B0] justify-center">
                  Open AI Dashboard
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 2: MARKETPLACE STOREFRONT */}
          <NexaCard
            variant="glass"
            padding="lg"
            className="space-y-5 border border-[#0E9F6E]/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Marketplace Storefront</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">E-Commerce & Bookings</p>
                  </div>
                </div>
                <NexaBadge variant="green">Merchant Hub</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Direct commerce storefront management, product catalog SKUs, service appointment booking schedules, flash deals, and Paystack payouts.
              </p>

              <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Active Catalog SKUs:</span>
                  <span className="font-bold text-[#0E9F6E]">38 Items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Pending Bookings:</span>
                  <span className="font-bold text-[#1A56DB]">8 Appointments</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Wallet Balance:</span>
                  <span className="font-bold text-[var(--nexa-text-primary)]">₦845,200</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/erp/admin/marketplace/shop" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Product SKUs</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/erp/admin/marketplace/bookings" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Bookings</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/erp/admin/marketplace/deals" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Flash Deals</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
                <Link href="/erp/admin/marketplace/wallet" className="p-2 rounded-xl bg-[var(--nexa-bg-base)] hover:bg-[#0E9F6E]/10 hover:text-[#0E9F6E] transition-all flex items-center justify-between">
                  <span>Payout Wallet</span>
                  <ArrowRight className="w-3 h-3 text-[var(--nexa-text-muted)]" />
                </Link>
              </div>

              <Link href="/erp/admin/marketplace" className="block pt-1">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#0E9F6E] text-white hover:bg-[#0B855D] justify-center">
                  Open Storefront Admin
                </NexaButton>
              </Link>
            </div>
          </NexaCard>

          {/* MODULE 3: DESIGN SYSTEM & COMPONENTS */}
          <NexaCard
            variant="glass"
            padding="lg"
            className="space-y-5 border border-[#9061F9]/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#9061F9]/10 text-[#9061F9]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--nexa-text-primary)]">Design System UI</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">Components & Tokens</p>
                  </div>
                </div>
                <NexaBadge variant="purple">UI Primitives</NexaBadge>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Standardized atomic component library, liquid-glass cards, buttons, badges, modals, form controls, and dark/light color tokens.
              </p>

              <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Component Library:</span>
                  <span className="font-bold text-[#9061F9]">100% Type-Safe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Theme Engine:</span>
                  <span className="font-bold text-[#0E9F6E]">Dark / Light Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-muted)]">Voice Assistant HUD:</span>
                  <span className="font-bold text-[#1A56DB]">Integrated</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <Link href="/erp/admin/components" className="block pt-1">
                <NexaButton size="sm" variant="primary" className="w-full bg-[#9061F9] text-white hover:bg-[#7E3AF2] justify-center">
                  Explore UI Component Library
                </NexaButton>
              </Link>
            </div>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
