"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  CreditCard,
  Database,
  Globe,
  Key,
  Layers,
  Lock,
  Package,
  PieChart,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Store,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function TenantHubPage() {
  return (
    <BusinessShell
      title="Tenant Administration & Workspace Settings"
      subtitle="Manage corporate workspace profile, plan subscriptions, team seat allocations, BYOK AI keys, and active extensions."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/tenant/billing">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<CreditCard className="w-3.5 h-3.5" />}
              className="bg-[#1A56DB] text-white hover:bg-[#1545B0]"
            >
              Manage Subscription
            </NexaButton>
          </Link>
          <Link href="/tenant/byok">
            <NexaButton size="sm" variant="outline" leftIcon={<Key className="w-3.5 h-3.5" />}>
              BYOK Keys
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TENANT SUMMARY BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Current Plan Tier</span>
              <CreditCard className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              Growth Tier
            </div>
            <div className="text-[11px] text-[#1A56DB] font-semibold">
              ₦65,000 / month • Active
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Team Seats Used</span>
              <Users className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              4 / 5 Seats
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">
              1 Seat Available
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Monthly Lead Quota</span>
              <Bot className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              1,640 / 2,000
            </div>
            <div className="text-[11px] text-[#9061F9] font-mono">
              82% Remaining
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#F59E0B]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Active Extensions</span>
              <Sliders className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              2 / 2 Active
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-semibold">
              ERP Suite & Shopfront
            </div>
          </NexaCard>
        </div>

        {/* ACTIVE EXTENSIONS CARDS */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-[var(--nexa-text-primary)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#1A56DB]" />
            Active Modular Tenant Extensions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EXTENSION 1: ERP EXT */}
            <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[#1A56DB]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Enterprise ERP Suite (`erp_ext`)</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">Served on client_slug.domain.ng</p>
                  </div>
                </div>
                <NexaBadge variant="green">Enabled</NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Internal corporate operations across Admin (AI Swarm & Marketplace), Accountant General Ledger, Human Resources, Manager reviews, and Executive Cockpit.
              </p>
              <div className="pt-2 border-t border-[var(--nexa-border)] flex justify-between items-center text-xs">
                <span className="text-[var(--nexa-text-muted)]">Active Portals: Admin, Finance, HR, MD</span>
                <Link href="/erp/admin">
                  <NexaButton size="sm" variant="primary" className="bg-[#1A56DB] text-white">
                    Open ERP Suite
                  </NexaButton>
                </Link>
              </div>
            </NexaCard>

            {/* EXTENSION 2: SHOP FRONT EXT */}
            <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[#0E9F6E]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Digital Shopfront (`shop_front_ext`)</h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">Served on client_slug.domain.shop</p>
                  </div>
                </div>
                <NexaBadge variant="green">Enabled</NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Public-facing branded digital storefront allowing customers to discover products, schedule service bookings, and make direct WhatsApp inquiries.
              </p>
              <div className="pt-2 border-t border-[var(--nexa-border)] flex justify-between items-center text-xs">
                <span className="text-[var(--nexa-text-muted)]">Public URL: edusuite.ofia.shop</span>
                <Link href="/shopfront">
                  <NexaButton size="sm" variant="primary" className="bg-[#0E9F6E] text-white">
                    Preview Shopfront
                  </NexaButton>
                </Link>
              </div>
            </NexaCard>
          </div>
        </div>

        {/* TENANT MANAGEMENT QUICK LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/tenant/settings" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#1A56DB] transition-all">
              <Settings className="w-5 h-5 text-[#1A56DB]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Settings & DNS</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Workspace branding, logo, and custom domain CNAME.</p>
            </NexaCard>
          </Link>

          <Link href="/tenant/billing" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#0E9F6E] transition-all">
              <CreditCard className="w-5 h-5 text-[#0E9F6E]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Billing & Tiers</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Manage Paystack cards, invoices, and tier upgrades.</p>
            </NexaCard>
          </Link>

          <Link href="/tenant/team" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#9061F9] transition-all">
              <Users className="w-5 h-5 text-[#9061F9]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Team Seats</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Invite team members and assign workplace roles.</p>
            </NexaCard>
          </Link>

          <Link href="/tenant/byok" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#F59E0B] transition-all">
              <Key className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">BYOK AI Keys</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">AES-256 encrypted keys for Claude, OpenAI, and Gemini.</p>
            </NexaCard>
          </Link>
        </div>
      </div>
    </BusinessShell>
  );
}
