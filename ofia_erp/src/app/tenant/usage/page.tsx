"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  CreditCard,
  Mail,
  Package,
  RefreshCw,
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

export default function TenantUsagePage() {
  const [tenantSlug, setTenantSlug] = useState<string>("default");
  const [planTier, setPlanTier] = useState<PlanTierKey>("GROWTH");
  const [daysRemaining, setDaysRemaining] = useState<number>(24);
  const [usage, setUsage] = useState({
    productsCount: 0,
    teamSeatsCount: 1,
    monthlyLeadsCount: 360,
    activeCampaignsCount: 2,
    dailyEmailsSent: 320,
  });

  const loadUsage = async () => {
    try {
      const slug = resolveActiveTenantSlug();
      setTenantSlug(slug);
      const res = await fetch(`/api/tenant/subscription?tenant=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success && data.subscription) {
        if (data.subscription.planTier && PLAN_TIERS[data.subscription.planTier as PlanTierKey]) {
          setPlanTier(data.subscription.planTier as PlanTierKey);
        }
        if (typeof data.subscription.daysRemaining === "number") {
          setDaysRemaining(data.subscription.daysRemaining);
        }
        if (data.usage) {
          setUsage({
            productsCount: Number(data.usage.productsCount || 0),
            teamSeatsCount: Number(data.usage.teamSeatsCount || 1),
            monthlyLeadsCount: Number(data.usage.monthlyLeadsCount || 0),
            activeCampaignsCount: Number(data.usage.activeCampaignsCount || 0),
            dailyEmailsSent: Number(data.usage.dailyEmailsSent || 0),
          });
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const plan = PLAN_TIERS[planTier] || PLAN_TIERS.GROWTH;
  const maxLeads = Number(plan.quotas.leadsLimit || 2500);
  const maxEmails = Number(plan.quotas.dailyEmailLimit || 500);
  const maxSeats = plan.seatsIncluded === "Unlimited" ? 999 : Number(plan.seatsIncluded || 10);
  const maxSkus = plan.quotas.skuLimit === "Unlimited" ? 999999 : Number(plan.quotas.skuLimit || 100);

  const leadsPct = Math.min(100, Math.round((usage.monthlyLeadsCount / Math.max(1, maxLeads)) * 100));
  const emailsPct = Math.min(100, Math.round((usage.dailyEmailsSent / Math.max(1, maxEmails)) * 100));

  return (
    <BusinessShell
      title="Quota Utilization & Consumption Limits"
      subtitle={`Live resource telemetry across ${tenantSlug}.ofia.ng (ERP) and ${tenantSlug}.ofia.shop (Digital Shopfront) under the ${plan.name} Tier.`}
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="green" className="py-1 px-3 text-xs font-mono font-bold">
            ● {plan.name} Tier ({daysRemaining}d to reset)
          </NexaBadge>
          <NexaButton
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={loadUsage}
          >
            Refresh
          </NexaButton>
          <Link href="/tenant/billing">
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<CreditCard className="w-3.5 h-3.5" />}
              className="bg-[#1A56DB] text-white"
            >
              Upgrade Quotas
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#1A56DB]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Monthly Leads Quota</span>
              <Activity className="w-4 h-4 text-[#1A56DB]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
              {usage.monthlyLeadsCount.toLocaleString()} / {maxLeads.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#1A56DB] font-bold">
              {leadsPct}% Consumed ({100 - leadsPct}% Free)
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#0E9F6E]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Daily Email Sends</span>
              <Mail className="w-4 h-4 text-[#0E9F6E]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
              {usage.dailyEmailsSent.toLocaleString()} / {maxEmails.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">
              {emailsPct}% Today&apos;s Quota
            </div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#9061F9]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">AI Tokens Consumed</span>
              <Bot className="w-4 h-4 text-[#9061F9]" />
            </div>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
              1.24M Tokens
            </div>
            <div className="text-[11px] text-[#9061F9] font-mono">
              {plan.quotas.activeAgentsCount} Agents Provisioned
            </div>
          </NexaCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#0E9F6E]" />
                Shopfront Catalog SKUs ({tenantSlug}.ofia.shop)
              </span>
              <span className="text-xs font-mono font-bold text-[var(--nexa-text-primary)]">
                {usage.productsCount.toLocaleString()} /{" "}
                {plan.quotas.skuLimit === "Unlimited" ? "Unlimited" : maxSkus.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">
              Enforced on product creation across both ERP Catalog Manager and POS Inventory.
            </p>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-2 border border-[var(--nexa-border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#1A56DB]" />
                Workspace Staff Seats ({tenantSlug}.ofia.ng)
              </span>
              <span className="text-xs font-mono font-bold text-[var(--nexa-text-primary)]">
                {usage.teamSeatsCount} /{" "}
                {plan.seatsIncluded === "Unlimited" ? "Unlimited" : maxSeats}
              </span>
            </div>
            <p className="text-[11px] text-[var(--nexa-text-muted)]">
              Active staff accounts provisioned across Admin, HR, Finance, POS Cashier, and Employee portals.
            </p>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
