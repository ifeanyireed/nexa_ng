"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Loader2,
  PauseCircle,
  PlayCircle,
  Plus,
  Printer,
  RefreshCw,
  ShieldCheck,
  Store,
  Trash2,
  X,
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
  dailyEmailsSent?: number;
}

interface SavedPaymentMethod {
  id: string;
  tenantSlug: string;
  brand: "VISA" | "MASTERCARD" | "VERVE";
  last4: string;
  expMonth: string;
  expYear: string;
  cardholderName: string;
  bank: string;
  authCode: string;
  isDefault: boolean;
  createdAt: string;
}

interface BillingInvoiceItem {
  id: string;
  invoiceNumber: string;
  tenantSlug: string;
  description: string;
  planTier: PlanTierKey;
  billingCycle: string;
  amountNGN: number;
  status: "PAID" | "PAST_DUE" | "FAILED" | "PENDING";
  paystackReference: string;
  paymentMethodLabel: string;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
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
  const [tenantSlug, setTenantSlug] = useState<string>("default");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [activeTier, setActiveTier] = useState<PlanTierKey>("GROWTH");
  const [subStatus, setSubStatus] = useState<string>("ACTIVE");
  const [currentPeriodStart, setCurrentPeriodStart] = useState<string>(
    new Date(Date.now() - 6 * 86400000).toISOString()
  );
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string>(
    new Date(Date.now() + 24 * 86400000).toISOString()
  );
  const [daysRemaining, setDaysRemaining] = useState<number>(24);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState<boolean>(false);
  const [paystackSubCode, setPaystackSubCode] = useState<string>("");
  const [enabledAddons, setEnabledAddons] = useState<Record<string, boolean>>({});
  const [erpModules, setErpModules] = useState<Record<string, boolean>>({});
  const [shopSubModules, setShopSubModules] = useState<Record<string, boolean>>({});
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoiceItem[]>([]);
  const [usage, setUsage] = useState<LiveUsage>({
    productsCount: 0,
    teamSeatsCount: 1,
    monthlyLeadsCount: 0,
    activeCampaignsCount: 0,
  });

  const [loadingTier, setLoadingTier] = useState<PlanTierKey | null>(null);
  const [isRenewing, setIsRenewing] = useState<boolean>(false);
  const [isTogglingAutoRenew, setIsTogglingAutoRenew] = useState<boolean>(false);
  const [loadingAddonKey, setLoadingAddonKey] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Add Payment Card Modal State
  const [isAddCardOpen, setIsAddCardOpen] = useState<boolean>(false);
  const [cardBrand, setCardBrand] = useState<"VISA" | "MASTERCARD" | "VERVE">("VISA");
  const [cardNumberInput, setCardNumberInput] = useState<string>("");
  const [cardExpMonth, setCardExpMonth] = useState<string>("09");
  const [cardExpYear, setCardExpYear] = useState<string>("2029");
  const [cardHolderName, setCardHolderName] = useState<string>("");
  const [cardBankName, setCardBankName] = useState<string>("GTBank PLC (Paystack)");
  const [isSavingCard, setIsSavingCard] = useState<boolean>(false);

  // Printable Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<BillingInvoiceItem | null>(null);

  const currentPlan = PLAN_TIERS[activeTier] || PLAN_TIERS.GROWTH;

  const applyApiData = (data: any) => {
    if (data?.subscription) {
      const sub = data.subscription;
      if (sub.tenantSlug) setTenantSlug(sub.tenantSlug);
      if (sub.planTier && PLAN_TIERS[sub.planTier as PlanTierKey]) {
        setActiveTier(sub.planTier as PlanTierKey);
      }
      if (sub.billingCycle === "ANNUAL") {
        setBillingCycle("annually");
      } else if (sub.billingCycle === "MONTHLY") {
        setBillingCycle("monthly");
      }
      if (sub.status) setSubStatus(sub.status);
      if (sub.currentPeriodStart) setCurrentPeriodStart(sub.currentPeriodStart);
      if (sub.currentPeriodEnd) setCurrentPeriodEnd(sub.currentPeriodEnd);
      if (typeof sub.daysRemaining === "number") setDaysRemaining(sub.daysRemaining);
      if (typeof sub.cancelAtPeriodEnd === "boolean") {
        setCancelAtPeriodEnd(sub.cancelAtPeriodEnd);
      }
      if (sub.paystackSubscriptionCode) setPaystackSubCode(sub.paystackSubscriptionCode);
      if (sub.enabledAddons) setEnabledAddons(sub.enabledAddons);
      if (sub.erpModules) setErpModules(sub.erpModules);
      if (sub.shopSubModules) setShopSubModules(sub.shopSubModules);
    }
    if (Array.isArray(data?.paymentMethods)) {
      setPaymentMethods(data.paymentMethods);
    }
    if (Array.isArray(data?.invoices)) {
      setInvoices(data.invoices);
    }
    if (data?.usage) {
      setUsage(data.usage);
    }
  };

  const loadSubscriptionState = async () => {
    try {
      const slug = resolveActiveTenantSlug();
      setTenantSlug(slug);
      const res = await fetch(`/api/tenant/subscription?tenant=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success) {
        applyApiData(data);
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
        applyApiData(data);
        setStatusBanner(
          data.message ||
            `Switched to ${PLAN_TIERS[targetTier].name} (${targetTier}). ERP & Storefront module entitlements synchronized.`
        );
        await fetchTenantPermissionMatrix(slug);
      } else {
        setStatusBanner(data?.error || "Could not update subscription plan.");
      }
    } catch (err: any) {
      setStatusBanner("Error updating plan: " + err.message);
    } finally {
      setLoadingTier(null);
    }
  };

  const handleRenewNow = async () => {
    if (isRenewing) return;
    setIsRenewing(true);
    setStatusBanner(null);
    try {
      const slug = resolveActiveTenantSlug();
      const res = await fetch("/api/tenant/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          action: "RENEW_NOW",
        }),
      });
      const data = await res.json();
      if (data?.success) {
        applyApiData(data);
        setStatusBanner(data.message || "Subscription renewed and invoice generated.");
      }
    } catch (err: any) {
      setStatusBanner("Renewal failed: " + err.message);
    } finally {
      setIsRenewing(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (isTogglingAutoRenew) return;
    setIsTogglingAutoRenew(true);
    setStatusBanner(null);
    try {
      const slug = resolveActiveTenantSlug();
      const res = await fetch("/api/tenant/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          action: "TOGGLE_AUTO_RENEW",
          cancelAtPeriodEnd: !cancelAtPeriodEnd,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        applyApiData(data);
        setStatusBanner(data.message);
      }
    } catch (err: any) {
      setStatusBanner("Could not update auto-renew setting: " + err.message);
    } finally {
      setIsTogglingAutoRenew(false);
    }
  };

  const toggleAddon = async (key: string) => {
    if (loadingAddonKey) return;
    setLoadingAddonKey(key);
    setStatusBanner(null);
    try {
      const slug = resolveActiveTenantSlug();
      const nextVal = !Boolean(enabledAddons[key]);
      const res = await fetch("/api/tenant/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          action: "TOGGLE_ADDON",
          addonKey: key,
          enabled: nextVal,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        applyApiData(data);
        setStatusBanner(data.message);
        await fetchTenantPermissionMatrix(slug);
      }
    } catch (err: any) {
      setStatusBanner("Error updating add-on: " + err.message);
    } finally {
      setLoadingAddonKey(null);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingCard) return;
    setIsSavingCard(true);
    try {
      const slug = resolveActiveTenantSlug();
      const digits = cardNumberInput.replace(/\D/g, "");
      const last4 = digits.slice(-4) || "8841";
      const res = await fetch("/api/tenant/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          action: "ADD_PAYMENT_METHOD",
          brand: cardBrand,
          last4,
          expMonth: cardExpMonth,
          expYear: cardExpYear,
          cardholderName: cardHolderName || `${slug.toUpperCase()} CORPORATE`,
          bank: cardBankName,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        applyApiData(data);
        setStatusBanner(data.message || "Payment card added.");
        setIsAddCardOpen(false);
        setCardNumberInput("");
        setCardHolderName("");
      }
    } catch (err: any) {
      setStatusBanner("Failed to save card: " + err.message);
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleSetDefaultCard = async (cardId: string) => {
    try {
      const slug = resolveActiveTenantSlug();
      const res = await fetch("/api/tenant/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          action: "SET_DEFAULT_PAYMENT_METHOD",
          cardId,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        applyApiData(data);
        setStatusBanner(data.message);
      }
    } catch {}
  };

  const handleRemoveCard = async (cardId: string) => {
    try {
      const slug = resolveActiveTenantSlug();
      const res = await fetch("/api/tenant/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          action: "REMOVE_PAYMENT_METHOD",
          cardId,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        applyApiData(data);
        setStatusBanner(data.message);
      }
    } catch {}
  };

  const maxProductsNum =
    currentPlan.quotas.skuLimit === "Unlimited" ? 999999 : Number(currentPlan.quotas.skuLimit);
  const maxSeatsNum =
    currentPlan.seatsIncluded === "Unlimited" ? 999 : Number(currentPlan.seatsIncluded);
  const maxLeadsNum = Number(currentPlan.quotas.leadsLimit);
  const maxCampaignsNum = Number(currentPlan.quotas.campaignsLimit);

  const cycleTotalDays = billingCycle === "annually" ? 365 : 30;
  const renewalPct = Math.min(
    100,
    Math.max(5, Math.round((daysRemaining / cycleTotalDays) * 100))
  );

  const activeErpModuleLabels = Object.entries(erpModules)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([k]) => k.toUpperCase());

  const activeShopSubLabels = Object.entries(shopSubModules)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([k]) => k.toUpperCase());

  return (
    <BusinessShell
      title="Subscription Plans, Add-Ons & Invoices"
      subtitle="Manage your organization's unified ERP + Digital Shopfront tier, renewal schedule, Paystack cards, and billing ledger."
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/tenant/usage">
            <NexaButton size="sm" variant="outline">
              Quota Telemetry
            </NexaButton>
          </Link>
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
            onClick={() => setIsAddCardOpen(true)}
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
              className="text-[11px] underline ml-4 cursor-pointer"
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
                <NexaBadge variant={cancelAtPeriodEnd ? "amber" : "green"}>
                  {cancelAtPeriodEnd ? "Cancels at Period End" : "Auto-Renew Active"}
                </NexaBadge>
                <NexaBadge variant="green">
                  {currentPlan.takeRates.directCheckoutPct}% Direct /{" "}
                  {currentPlan.takeRates.escrowCheckoutPct}% Escrow Fee
                </NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                Billed {billingCycle === "monthly" ? "Monthly" : "Annually"} via Paystack •{" "}
                {currentPlan.dbIsolation} • {currentPlan.domainEntitlement}
                {paystackSubCode ? ` • Ref: ${paystackSubCode}` : ""}
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

        {/* UNIFIED ERP + SHOPFRONT COVERAGE & RENEWAL LIFECYCLE CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* COVERAGE 1: ERP WORKSPACE */}
          <NexaCard
            variant="glass"
            padding="md"
            className="space-y-3 border border-[#1A56DB]/30 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">
                      Enterprise ERP Workspace
                    </h4>
                    <p className="text-[11px] font-mono text-[#1A56DB] font-bold">
                      {tenantSlug}.ofia.ng
                    </p>
                  </div>
                </div>
                <NexaBadge variant={subStatus === "ACTIVE" ? "green" : "amber"}>
                  {subStatus === "ACTIVE" ? "Covered" : subStatus}
                </NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Covers internal ERP portals, CRM, General Ledger, HR & Appraisals, and AI Swarm operations under your active tier.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {(activeErpModuleLabels.length > 0
                  ? activeErpModuleLabels
                  : ["OVERVIEW", "CRM", "USERS", "SHOP", "AI"]
                ).map((mod) => (
                  <span
                    key={mod}
                    className="px-2 py-0.5 rounded-md bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[9px] font-mono font-bold text-[var(--nexa-text-secondary)]"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--nexa-text-muted)]">Unified Tenant License</span>
              <Link
                href="/erp/admin"
                className="text-[#1A56DB] font-bold inline-flex items-center gap-1 hover:underline"
              >
                Open ERP <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </NexaCard>

          {/* COVERAGE 2: DIGITAL SHOPFRONT */}
          <NexaCard
            variant="glass"
            padding="md"
            className="space-y-3 border border-[#0E9F6E]/30 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E]">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">
                      Digital Shopfront & POS
                    </h4>
                    <p className="text-[11px] font-mono text-[#0E9F6E] font-bold">
                      {tenantSlug}.ofia.shop
                    </p>
                  </div>
                </div>
                <NexaBadge variant={subStatus === "ACTIVE" ? "green" : "amber"}>
                  {subStatus === "ACTIVE" ? "Covered" : subStatus}
                </NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Covers public storefront checkout ({currentPlan.takeRates.directCheckoutPct}% Direct / {currentPlan.takeRates.escrowCheckoutPct}% Escrow), service bookings, and 0%-fee POS registers.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {(activeShopSubLabels.length > 0
                  ? activeShopSubLabels
                  : ["STORE", "CATALOG", "ORDERS", "POS", "INVENTORY"]
                ).map((mod) => (
                  <span
                    key={mod}
                    className="px-2 py-0.5 rounded-md bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[9px] font-mono font-bold text-[var(--nexa-text-secondary)]"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--nexa-text-muted)]">Shared SKU & Order DB</span>
              <Link
                href="/erp/admin/shop"
                className="text-[#0E9F6E] font-bold inline-flex items-center gap-1 hover:underline"
              >
                Shop Manager <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </NexaCard>

          {/* COVERAGE 3: RENEWAL & AUTO-RENEW CONTROLS */}
          <NexaCard
            variant="glass"
            padding="md"
            className="space-y-3 border border-[var(--nexa-border)] flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">
                      Renewal & Lifecycle Controls
                    </h4>
                    <p className="text-[11px] text-[var(--nexa-text-muted)]">
                      Next billing date:{" "}
                      <span className="font-mono font-bold text-[var(--nexa-text-primary)]">
                        {new Date(currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
                <NexaBadge variant={daysRemaining > 7 ? "brand" : "amber"}>
                  {daysRemaining} Days Left
                </NexaBadge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[var(--nexa-text-muted)] font-mono">
                  <span>Start: {new Date(currentPeriodStart).toLocaleDateString()}</span>
                  <span>End: {new Date(currentPeriodEnd).toLocaleDateString()}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--nexa-bg-base)] overflow-hidden border border-[var(--nexa-border)]">
                  <div
                    className="h-full bg-gradient-to-r from-[#1A56DB] to-[#0E9F6E] transition-all"
                    style={{ width: `${renewalPct}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-[var(--nexa-text-secondary)]">
                {cancelAtPeriodEnd
                  ? "Auto-renew is paused. Your ERP and Shopfront will remain active until period end."
                  : "Auto-renew is active via your default Paystack card."}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center gap-2">
              <NexaButton
                size="sm"
                variant="primary"
                disabled={isRenewing}
                leftIcon={
                  isRenewing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )
                }
                onClick={handleRenewNow}
                className="flex-1 justify-center bg-[#1A56DB] text-white"
              >
                {isRenewing ? "Renewing..." : "Renew Now"}
              </NexaButton>
              <NexaButton
                size="sm"
                variant="outline"
                disabled={isTogglingAutoRenew}
                leftIcon={
                  cancelAtPeriodEnd ? (
                    <PlayCircle className="w-3.5 h-3.5 text-[#0E9F6E]" />
                  ) : (
                    <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                  )
                }
                onClick={handleToggleAutoRenew}
              >
                {cancelAtPeriodEnd ? "Resume Auto-Renew" : "Pause Auto-Renew"}
              </NexaButton>
            </div>
          </NexaCard>
        </div>

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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
              const isTogglingThis = loadingAddonKey === addon.key;

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
                      disabled={isIncludedInTier || isTogglingThis}
                      onClick={() => toggleAddon(addon.key)}
                      className={
                        !isActive ? "bg-[#1A56DB] text-white" : undefined
                      }
                    >
                      {isIncludedInTier
                        ? "Included"
                        : isTogglingThis
                        ? "Updating..."
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

        {/* PAYMENT METHODS MANAGER */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0E9F6E]" />
                Saved Payment Methods (Paystack Card Vault)
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Cards tokenized via Paystack for automated recurring billing across {tenantSlug}.ofia.ng and {tenantSlug}.ofia.shop.
              </p>
            </div>
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddCardOpen(true)}
            >
              Add New Card
            </NexaButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((pm) => (
              <NexaCard
                key={pm.id}
                variant="glass"
                padding="md"
                className={`space-y-3 border ${
                  pm.isDefault
                    ? "border-[#0E9F6E] bg-[#0E9F6E]/5"
                    : "border-[var(--nexa-border)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#1A56DB] text-white font-mono font-black text-xs">
                      {pm.brand}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[var(--nexa-text-primary)]">
                          •••• •••• •••• {pm.last4}
                        </span>
                        {pm.isDefault && (
                          <NexaBadge variant="green" className="text-[9px]">
                            Default
                          </NexaBadge>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--nexa-text-muted)]">
                        Expires {pm.expMonth}/{pm.expYear} • {pm.bank}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!pm.isDefault && (
                      <NexaButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefaultCard(pm.id)}
                      >
                        Set Default
                      </NexaButton>
                    )}
                    {paymentMethods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(pm.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)]">
                  <span>Cardholder: {pm.cardholderName}</span>
                  <span className="font-mono">Token: {pm.authCode}</span>
                </div>
              </NexaCard>
            ))}
          </div>
        </div>

        {/* BILLING & INVOICE HISTORY LEDGER */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1A56DB]" />
                Billing & Invoice History Ledger
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Complete audit ledger of ERP + Shopfront subscription charges, modular add-ons, and Paystack receipts.
              </p>
            </div>
            <NexaBadge variant="brand">{invoices.length} Invoices</NexaBadge>
          </div>

          <NexaCard variant="glass" padding="none" className="overflow-hidden border border-[var(--nexa-border)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[10px] font-bold uppercase text-[var(--nexa-text-muted)]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Cycle</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Paystack Ref</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[var(--nexa-text-primary)] whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-[var(--nexa-text-secondary)] whitespace-nowrap">
                        {new Date(inv.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-[var(--nexa-text-primary)] max-w-xs">
                        <div className="font-semibold truncate" title={inv.description}>
                          {inv.description}
                        </div>
                        <div className="text-[10px] text-[var(--nexa-text-muted)] font-mono">
                          Paid via {inv.paymentMethodLabel}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--nexa-text-secondary)]">
                        {inv.billingCycle}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-[var(--nexa-text-primary)] whitespace-nowrap">
                        ₦{Number(inv.amountNGN || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--nexa-text-muted)] whitespace-nowrap">
                        {inv.paystackReference}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <NexaBadge
                          variant={
                            inv.status === "PAID"
                              ? "green"
                              : inv.status === "PAST_DUE"
                              ? "amber"
                              : "brand"
                          }
                        >
                          {inv.status}
                        </NexaBadge>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <NexaButton
                          size="sm"
                          variant="outline"
                          leftIcon={<Printer className="w-3 h-3" />}
                          onClick={() => setSelectedReceipt(inv)}
                        >
                          Receipt
                        </NexaButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NexaCard>
        </div>
      </div>

      {/* ADD PAYMENT CARD MODAL */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <NexaCard
            variant="glass"
            padding="lg"
            className="w-full max-w-md space-y-4 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0E9F6E]" />
                <h3 className="font-black text-sm text-[var(--nexa-text-primary)]">
                  Authorize Payment Card (Paystack Vault)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCardOpen(false)}
                className="p-1 rounded-lg text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--nexa-text-primary)] block">
                  Cardholder / Corporate Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EDUSUITE CORPORATE TREASURY"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--nexa-text-primary)] block">
                    Card Network
                  </label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none"
                  >
                    <option value="VISA">VISA</option>
                    <option value="MASTERCARD">MASTERCARD</option>
                    <option value="VERVE">VERVE</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-[var(--nexa-text-primary)] block">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="4532 •••• •••• 8841"
                    value={cardNumberInput}
                    onChange={(e) => setCardNumberInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-mono outline-none focus:border-[#1A56DB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--nexa-text-primary)] block">
                    Exp Month
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={cardExpMonth}
                    onChange={(e) => setCardExpMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-mono outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[var(--nexa-text-primary)] block">
                    Exp Year
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardExpYear}
                    onChange={(e) => setCardExpYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-mono outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[var(--nexa-text-primary)] block">
                    Issuing Bank
                  </label>
                  <input
                    type="text"
                    value={cardBankName}
                    onChange={(e) => setCardBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/20 text-[11px] text-[#0E9F6E] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  PCI-DSS Level 1 compliant via Paystack. Only the last 4 digits and reusable authorization signature are stored.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <NexaButton
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddCardOpen(false)}
                >
                  Cancel
                </NexaButton>
                <button
                  type="submit"
                  disabled={isSavingCard}
                  className="px-4 py-2 rounded-xl bg-[#0E9F6E] text-white font-bold text-xs cursor-pointer hover:opacity-95 disabled:opacity-50"
                >
                  {isSavingCard ? "Authorizing..." : "Save & Set Default"}
                </button>
              </div>
            </form>
          </NexaCard>
        </div>
      )}

      {/* OFFICIAL PRINTABLE RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <NexaCard
            variant="glass"
            padding="lg"
            className="w-full max-w-lg space-y-5 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-[var(--nexa-text-primary)]">
                    OFIA ENTERPRISE CLOUD
                  </span>
                  <NexaBadge variant="green">{selectedReceipt.status}</NexaBadge>
                </div>
                <p className="text-[11px] font-mono text-[var(--nexa-text-muted)] mt-0.5">
                  Official Subscription Tax Invoice & Payment Receipt
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">
                  Invoice Number
                </div>
                <div className="font-mono font-bold text-[var(--nexa-text-primary)]">
                  {selectedReceipt.invoiceNumber}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">
                  Issued Date
                </div>
                <div className="font-mono font-bold text-[var(--nexa-text-primary)]">
                  {new Date(selectedReceipt.issuedAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">
                  Covered Tenant Properties
                </div>
                <div className="font-mono font-bold text-[#1A56DB]">
                  {selectedReceipt.tenantSlug}.ofia.ng + {selectedReceipt.tenantSlug}.ofia.shop
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--nexa-text-muted)]">
                  Paystack Reference
                </div>
                <div className="font-mono text-[var(--nexa-text-secondary)]">
                  {selectedReceipt.paystackReference}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[var(--nexa-border)]">
                <span className="text-[var(--nexa-text-secondary)]">
                  {selectedReceipt.description}
                </span>
                <span className="font-mono font-bold text-[var(--nexa-text-primary)] ml-4">
                  ₦{Number(selectedReceipt.amountNGN || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 text-[11px] text-[var(--nexa-text-muted)]">
                <span>Billing Cycle</span>
                <span className="font-mono">{selectedReceipt.billingCycle}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-[11px] text-[var(--nexa-text-muted)]">
                <span>Payment Method</span>
                <span className="font-mono">{selectedReceipt.paymentMethodLabel}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-[11px] text-[var(--nexa-text-muted)]">
                <span>Service Period</span>
                <span className="font-mono">
                  {new Date(selectedReceipt.periodStart).toLocaleDateString()} —{" "}
                  {new Date(selectedReceipt.periodEnd).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--nexa-border)] text-sm font-black text-[var(--nexa-text-primary)]">
                <span>Total Amount Paid</span>
                <span className="font-mono text-[#0E9F6E]">
                  ₦{Number(selectedReceipt.amountNGN || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--nexa-border)]">
              <NexaButton
                size="sm"
                variant="outline"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </NexaButton>
              <NexaButton
                size="sm"
                variant="primary"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
                className="bg-[#1A56DB] text-white"
              >
                Print / Save PDF
              </NexaButton>
            </div>
          </NexaCard>
        </div>
      )}
    </BusinessShell>
  );
}
