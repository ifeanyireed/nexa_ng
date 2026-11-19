"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  Building2,
  CreditCard,
  Key,
  Settings,
  Sliders,
  Store,
  Users,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { PLAN_TIERS, PlanTierKey } from "@/lib/pricing-plans";

function resolveActiveTenantSlug(): string {
  if (typeof window === "undefined") return "default";
  try {
    const params = new URLSearchParams(window.location.search);
    const paramTenant = params.get("tenant") || params.get("slug");
    if (paramTenant) return paramTenant.toLowerCase().trim();

    const storedUser = localStorage.getItem("erp_current_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.tenantSlug) return String(parsed.tenantSlug).toLowerCase().trim();
    }
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.endsWith(".ofia.ng")) {
      const sub = hostname.replace(".ofia.ng", "");
      if (sub && sub !== "www" && sub !== "erp" && sub !== "app") return sub;
    }
  } catch {}
  return "default";
}

export default function TenantHubPage() {
  const [tenantSlug, setTenantSlug] = useState<string>("edusuite");
  const [planTier, setPlanTier] = useState<PlanTierKey>("GROWTH");
  const [daysRemaining, setDaysRemaining] = useState<number>(24);
  const [seatsUsed, setSeatsUsed] = useState<number>(4);
  const [leadsUsed, setLeadsUsed] = useState<number>(1640);

  useEffect(() => {
    const slug = resolveActiveTenantSlug();
    if (slug && slug !== "default") setTenantSlug(slug);
    fetch(`/api/tenant/subscription?tenant=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.subscription) {
          if (data.subscription.tenantSlug && data.subscription.tenantSlug !== "default") {
            setTenantSlug(data.subscription.tenantSlug);
          }
          if (data.subscription.planTier && PLAN_TIERS[data.subscription.planTier as PlanTierKey]) {
            setPlanTier(data.subscription.planTier as PlanTierKey);
          }
          if (typeof data.subscription.daysRemaining === "number") {
            setDaysRemaining(data.subscription.daysRemaining);
          }
          if (data.usage) {
            if (typeof data.usage.teamSeatsCount === "number") setSeatsUsed(data.usage.teamSeatsCount);
            if (typeof data.usage.monthlyLeadsCount === "number") setLeadsUsed(data.usage.monthlyLeadsCount);
          }
        }
      })
      .catch(() => null);
  }, []);

  const plan = PLAN_TIERS[planTier] || PLAN_TIERS.GROWTH;
  const maxSeats = plan.seatsIncluded === "Unlimited" ? 999 : Number(plan.seatsIncluded || 10);
  const maxLeads = Number(plan.quotas.leadsLimit || 2500);
  const leadsRemainingPct = Math.max(
    0,
    Math.round(((maxLeads - leadsUsed) / Math.max(1, maxLeads)) * 1000) / 10
  );

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
          <Link href="/tenant/usage">
            <NexaButton size="sm" variant="outline" leftIcon={<Activity className="w-3.5 h-3.5" />}>
              Quota Usage
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
              {plan.name} Tier
            </div>
            <div className="text-[11px] text-[#1A56DB] font-semibold">
              {plan.formattedMonthly} / month • {daysRemaining}d left
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Team Seats Used</span>
              <Users className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              {seatsUsed} / {plan.seatsIncluded === "Unlimited" ? "∞" : maxSeats} Seats
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">
              {plan.seatsIncluded === "Unlimited"
                ? "Unlimited Enterprise Seats"
                : `${Math.max(0, maxSeats - seatsUsed)} Seats Available`}
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
              <span className="font-semibold">Monthly Lead Quota</span>
              <Bot className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">
              {leadsUsed.toLocaleString()} / {maxLeads.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#9061F9] font-mono">
              {leadsRemainingPct}% Remaining
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
            Active Modular Tenant Extensions (Unified Subscription)
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
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">Served on {tenantSlug}.ofia.ng</p>
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
                    <p className="text-[11px] text-[var(--nexa-text-muted)] font-mono">Served on {tenantSlug}.ofia.shop</p>
                  </div>
                </div>
                <NexaBadge variant="green">Enabled</NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Public-facing branded digital storefront allowing customers to discover products, schedule service bookings, and make direct WhatsApp inquiries.
              </p>
              <div className="pt-2 border-t border-[var(--nexa-border)] flex justify-between items-center text-xs">
                <span className="text-[var(--nexa-text-muted)]">Public URL: {tenantSlug}.ofia.shop</span>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Link href="/tenant/settings" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#1A56DB] transition-all h-full">
              <Settings className="w-5 h-5 text-[#1A56DB]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Settings & DNS</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Workspace branding, logo, and custom domain CNAME.</p>
            </NexaCard>
          </Link>

          <Link href="/tenant/billing" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#0E9F6E] transition-all h-full">
              <CreditCard className="w-5 h-5 text-[#0E9F6E]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Billing & Tiers</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Manage Paystack cards, renewals, invoices, and upgrades.</p>
            </NexaCard>
          </Link>

          <Link href="/tenant/usage" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#1A56DB] transition-all h-full">
              <Activity className="w-5 h-5 text-[#1A56DB]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Quota & Usage</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Track SKU, lead, email, and AI token consumption.</p>
            </NexaCard>
          </Link>

          <Link href="/tenant/team" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#9061F9] transition-all h-full">
              <Users className="w-5 h-5 text-[#9061F9]" />
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Team Seats</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">Invite team members and assign workplace roles.</p>
            </NexaCard>
          </Link>

          <Link href="/tenant/byok" className="block group">
            <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)] group-hover:border-[#F59E0B] transition-all h-full">
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
