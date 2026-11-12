"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  PLAN_TIERS,
  PUBLIC_PRICING_PLANS,
  MODULE_ADDONS,
  PlanTierKey,
} from "@/lib/pricing-plans";
import { fetchTenantPermissionMatrix } from "@/lib/access-control";

interface LiveUsage {
  productsCount: number;
  teamSeatsCount: number;
  monthlyLeadsCount: number;
  activeCampaignsCount: number;
}

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

export default function TenantBillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [activeTier, setActiveTier] = useState<PlanTierKey>("GROWTH");
  const [subStatus, setSubStatus] = useState<string>("ACTIVE");
  const [enabledAddons, setEnabledAddons] = useState<Record<string, boolean>>({});
  const [usage, setUsage] = useState<LiveUsage>({
    productsCount: 0,
    teamSeatsCount: 1,
    monthlyLeadsCount: 0,
    activeCampaignsCount: 0,
  });
  const [loadingTier, setLoadingTier] = useState<PlanTierKey | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const currentPlan = PLAN_TIERS[activeTier] || PLAN_TIERS.GROWTH;

  const loadSubscriptionState = async () => {
    try {
      const slug = resolveActiveTenantSlug();
      const res = await fetch(`/api/tenant/subscription?tenant=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success && data.subscription) {
        if (data.subscription.planTier && PLAN_TIERS[data.subscription.planTier as PlanTierKey]) {
          setActiveTier(data.subscription.planTier as PlanTierKey);
        }
        if (data.subscription.billingCycle === "ANNUAL") {
          setBillingCycle("annually");
        }
        if (data.subscription.status) {
          setSubStatus(data.subscription.status);
        }
        if (data.usage) {
          setUsage(data.usage);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadSubscriptionState();
  }, []);

  const handleSelectTier = async (targetTier: PlanTierKey) => {
    if (targetTier === activeTier || loadingTier) return;
    setLoadingTier(targetTier);
    setStatusBanner(null);

    try {
      const slug = resolveActiveTenantSlug();
      const res = await fetch("/api/tenant/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          planTier: targetTier,
          billingCycle: billingCycle === "annually" ? "ANNUAL" : "MONTHLY",
          action: "INITIALIZE_CHECKOUT",
        }),
      });
      const data = await res.json();

      if (data?.mode === "LIVE_PAYSTACK" && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      if (data?.success) {
        setActiveTier(targetTier);
        setSubStatus("ACTIVE");
        setStatusBanner(
          data.message ||
            `Switched to ${PLAN_TIERS[targetTier].name} (${targetTier}). ERP & Storefront module entitlements synchronized.`
        );
        await fetchTenantPermissionMatrix(slug);
        await loadSubscriptionState();
      } else {
        setStatusBanner(data?.error || "Could not update subscription plan.");
      }
    } catch (err: any) {
      setStatusBanner("Error updating plan: " + err.message);
    } finally {
      setLoadingTier(null);
    }
  };

  const toggleAddon = (key: string) => {
    setEnabledAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const maxProductsNum =
    currentPlan.quotas.skuLimit === "Unlimited" ? 999999 : Number(currentPlan.quotas.skuLimit);
  const maxSeatsNum =
    currentPlan.seatsIncluded === "Unlimited" ? 999 : Number(currentPlan.seatsIncluded);
  const maxLeadsNum = Number(currentPlan.quotas.leadsLimit);
  const maxCampaignsNum = Number(currentPlan.quotas.campaignsLimit);

  return (
    <BusinessShell
      title="Subscription Plans, Add-Ons & Invoices"
      subtitle="Manage your organization's active tier, quota allowances, modular ERP extensions, Escrow take-rates, and Paystack billing."
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={loadSubscriptionState}
          >
            Sync Quotas
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="bg-[#0E9F6E] text-white"
          >
            Add Payment Card
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {statusBanner && (
          <div className="p-3.5 rounded-xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/30 text-xs font-bold text-[#0E9F6E] flex items-center justify-between">
            <span>{statusBanner}</span>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-[11px] underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* CURRENT SUBSCRIPTION SUMMARY & LIVE QUOTA ENFORCEMENT */}
        <NexaCard
          variant="glass"
          padding="lg"
          className="space-y-4 border border-[var(--nexa-border)] border-l-4 border-l-[#1A56DB]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-[var(--nexa-text-primary)]">
                  {currentPlan.name} Tier Subscription
                </h3>
                <NexaBadge variant={subStatus === "ACTIVE" ? "brand" : "amber"}>
                  {subStatus}
                </NexaBadge>
                <NexaBadge variant="green">
                  {currentPlan.takeRates.directCheckoutPct}% Direct /{" "}
                  {currentPlan.takeRates.escrowCheckoutPct}% Escrow Fee
                </NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                Billed {billingCycle === "monthly" ? "Monthly" : "Annually"} via Paystack •{" "}
                {currentPlan.dbIsolation} • {currentPlan.domainEntitlement}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[var(--nexa-text-primary)] font-mono">
                {billingCycle === "monthly"
                  ? currentPlan.formattedMonthly
                  : currentPlan.formattedAnnual}
                <span className="text-xs text-[var(--nexa-text-muted)] font-normal">
                  {" "}
                  / {billingCycle === "monthly" ? "mo" : "yr"}
                </span>
              </div>
              <div className="text-[11px] text-[#0E9F6E] font-bold">
                {currentPlan.seatsIncluded} Team Seats •{" "}
                {currentPlan.quotas.leadsLabel}
              </div>
            </div>
          </div>

          {/* LIVE ENFORCED QUOTA TELEMETRY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-[var(--nexa-border)]">
            <div className="p-2.5 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <div className="text-[10px] font-bold uppercase text-[var(--nexa-text-muted)]">
                Catalog SKUs
              </div>
              <div className="text-sm font-black font-mono text-[var(--nexa-text-primary)] mt-0.5">
                {usage.productsCount.toLocaleString()} /{" "}
                {currentPlan.quotas.skuLimit === "Unlimited"
                  ? "∞"
                  : maxProductsNum.toLocaleString()}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <div className="text-[10px] font-bold uppercase text-[var(--nexa-text-muted)]">
                Team Seats
              </div>
              <div className="text-sm font-black font-mono text-[var(--nexa-text-primary)] mt-0.5">
                {usage.teamSeatsCount} /{" "}
                {currentPlan.seatsIncluded === "Unlimited" ? "∞" : maxSeatsNum}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <div className="text-[10px] font-bold uppercase text-[var(--nexa-text-muted)]">
                Monthly CRM Leads
              </div>
              <div className="text-sm font-black font-mono text-[var(--nexa-text-primary)] mt-0.5">
                {usage.monthlyLeadsCount.toLocaleString()} /{" "}
                {maxLeadsNum.toLocaleString()}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <div className="text-[10px] font-bold uppercase text-[var(--nexa-text-muted)]">
                Active Campaigns
              </div>
              <div className="text-sm font-black font-mono text-[var(--nexa-text-primary)] mt-0.5">
                {usage.activeCampaignsCount} / {maxCampaignsNum}
              </div>
            </div>
          </div>
        </NexaCard>

        {/* TIERS MATRIX */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                Core Workspace Subscription Tiers
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Higher tiers unlock full ERP modules, more seats, and lower Storefront & Escrow transaction fees.
              </p>
            </div>

            <div className="inline-flex items-center bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] p-1 rounded-xl self-start">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[#1A56DB] text-white shadow-sm"
                    : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annually")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === "annually"
                    ? "bg-[#1A56DB] text-white shadow-sm"
                    : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                Annual
                <span className="px-1.5 py-0.5 rounded bg-[#0E9F6E] text-white text-[9px] font-black uppercase">
                  2 Mo Free
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PUBLIC_PRICING_PLANS.map((t) => {
              const isCurrent = t.key === activeTier;
              const isUpdatingThis = loadingTier === t.key;
              const displayPrice =
                billingCycle === "monthly"
                  ? t.formattedMonthly
                  : t.formattedAnnual;

              return (
                <NexaCard
                  key={t.key}
                  variant="glass"
                  padding="md"
                  className={`space-y-4 border flex flex-col justify-between ${
                    isCurrent
                      ? "border-[#1A56DB] bg-[#1A56DB]/5 shadow-md"
                      : "border-[var(--nexa-border)]"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] block">
                          {t.tag}
                        </span>
                        <h4 className="font-bold text-base text-[var(--nexa-text-primary)]">
                          {t.name}
                        </h4>
                      </div>
                      {isCurrent && (
                        <NexaBadge variant="brand" className="text-[9px]">
                          Current
                        </NexaBadge>
                      )}
                    </div>

                    <div>
                      <div className="text-xl font-black text-[var(--nexa-text-primary)] font-mono">
                        {displayPrice}
                        <span className="text-xs font-normal text-[var(--nexa-text-muted)]">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)] font-mono">
                        {t.usdEquivalentMonthly} • {t.seatsIncluded} Seats
                      </div>
                    </div>

                    <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                      {t.description}
                    </p>

                    <div className="p-2 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--nexa-text-muted)]">
                          Direct Checkout:
                        </span>
                        <span className="font-mono font-bold text-[var(--nexa-text-primary)]">
                          {t.takeRates.directCheckoutPct}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--nexa-text-muted)]">
                          Protected Escrow:
                        </span>
                        <span className="font-mono font-bold text-[#0E9F6E]">
                          {t.takeRates.escrowCheckoutPct}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--nexa-text-muted)]">
                          POS Counter Fee:
                        </span>
                        <span className="font-mono font-bold text-[#1A56DB]">
                          0%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[var(--nexa-border)] text-xs text-[var(--nexa-text-secondary)]">
                      {t.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0E9F6E] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3">
                    {isCurrent ? (
                      <NexaButton
                        size="sm"
                        variant="outline"
                        className="w-full justify-center"
                        disabled
                      >
                        Active Tier
                      </NexaButton>
                    ) : (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        disabled={Boolean(loadingTier)}
                        leftIcon={
                          isUpdatingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )
                        }
                        onClick={() => handleSelectTier(t.key)}
                        className="w-full bg-[#1A56DB] text-white justify-center"
                      >
                        {isUpdatingThis ? "Provisioning..." : t.ctaLabel}
                      </NexaButton>
                    )}
                  </div>
                </NexaCard>
              );
            })}
          </div>
        </div>

        {/* MODULAR ADD-ONS */}
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1A56DB]" />
              Specialized Industry Module Add-Ons (À La Carte)
            </h3>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Activate specialized enterprise suites on any Growth or Scale workspace without upgrading to a full Enterprise contract.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODULE_ADDONS.map((addon) => {
              const isIncludedInTier =
                (addon.includedFromTier === "SCALE" &&
                  (activeTier === "SCALE" || activeTier === "ENTERPRISE")) ||
                (addon.includedFromTier === "ENTERPRISE" &&
                  activeTier === "ENTERPRISE");
              const isActive = isIncludedInTier || Boolean(enabledAddons[addon.key]);

              return (
                <NexaCard
                  key={addon.key}
                  variant="glass"
                  padding="md"
                  className={`space-y-3 border ${
                    isActive
                      ? "border-[#0E9F6E] bg-[#0E9F6E]/5"
                      : "border-[var(--nexa-border)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                          {addon.name}
                        </h4>
                        <NexaBadge variant="brand" className="text-[9px]">
                          {addon.badge}
                        </NexaBadge>
                      </div>
                      <p className="text-[11px] font-mono text-[#0E9F6E] font-bold mt-0.5">
                        {isIncludedInTier
                          ? `Included in ${currentPlan.name} Tier`
                          : `${addon.formattedPrice} • ${addon.overageNote}`}
                      </p>
                    </div>

                    <NexaButton
                      size="sm"
                      variant={isActive ? "outline" : "primary"}
                      disabled={isIncludedInTier}
                      onClick={() => toggleAddon(addon.key)}
                      className={
                        !isActive ? "bg-[#1A56DB] text-white" : undefined
                      }
                    >
                      {isIncludedInTier
                        ? "Included"
                        : isActive
                        ? "Enabled"
                        : "Add Module"}
                    </NexaButton>
                  </div>

                  <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                    {addon.description}
                  </p>
                </NexaCard>
              );
            })}
          </div>
        </div>
      </div>
    </BusinessShell>
  );
}
