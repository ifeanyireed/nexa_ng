"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  ShieldCheck,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Search,
  DollarSign,
  FileText,
  Truck,
  ArrowUpRight,
  Sliders,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant, extractSubdomainOrParam } from "@/lib/tenant-context";

export default function TenantPaymentsAndSettlementsPage() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "settlements" | "escrow" | "settings"
  >("overview");

  const tenantSlug =
    activeTenant?.slug ||
    (typeof window !== "undefined" ? extractSubdomainOrParam() : "") ||
    "";

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Financial Ledger State (Part I)
  const [summary, setSummary] = useState({
    totalSales: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    pendingSettlements: 0,
    settledFunds: 0,
    paymentFees: 0,
    refunds: 0,
    escrowFundsHeld: 0,
    escrowReleaseEligible: 0,
    escrowFundsReleased: 0,
    disputedEscrowFunds: 0,
    currency: "NGN",
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [escrowCases, setEscrowCases] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);

  // Filters
  const [txSearch, setTxSearch] = useState("");
  const [txModeFilter, setTxModeFilter] = useState("ALL");
  const [txProviderFilter, setTxProviderFilter] = useState("ALL");
  const [txStatusFilter, setTxStatusFilter] = useState("ALL");
  const [escrowFilter, setEscrowFilter] = useState("ALL");

  // Escrow Fulfilment Evidence Form State
  const [selectedEscrowOrder, setSelectedEscrowOrder] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("");
  const [deliveryEvidenceNotes, setDeliveryEvidenceNotes] = useState("");

  // Payment Settings State (Part F)
  const [byokEnabled, setByokEnabled] = useState(false);
  const [byokProvider, setByokProvider] = useState<"paystack" | "nomba">("paystack");
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackSecretKey, setPaystackSecretKey] = useState("");
  const [paystackSecretMasked, setPaystackSecretMasked] = useState("");
  const [nombaAccountId, setNombaAccountId] = useState("");
  const [nombaClientId, setNombaClientId] = useState("");
  const [nombaPrivateKey, setNombaPrivateKey] = useState("");
  const [nombaPrivateMasked, setNombaPrivateMasked] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [managedPaymentsEnabled, setManagedPaymentsEnabled] = useState(true);
  const [managedPaymentsEligible, setManagedPaymentsEligible] = useState(true);
  const [managedFeePct, setManagedFeePct] = useState(1.5);
  const [managedSettlementArrangement, setManagedSettlementArrangement] = useState(
    "Approved Provider Subaccount Split (T+1)"
  );
  const [protectedPaymentsEnabled, setProtectedPaymentsEnabled] = useState(true);
  const [protectedPaymentsEligible, setProtectedPaymentsEligible] = useState(true);
  const [escrowProviderAvailable, setEscrowProviderAvailable] = useState(true);
  const [protectionFeePct, setProtectionFeePct] = useState(2.5);
  const [deliveryConfirmationMode, setDeliveryConfirmationMode] = useState(
    "buyer_confirmation_and_pod"
  );

  const loadPaymentData = useCallback(async () => {
    if (!tenantSlug) return;
    setIsLoading(true);
    try {
      const [ledgerRes, settingsRes] = await Promise.all([
        fetch(`/api/erp/payments/ledger?tenant=${encodeURIComponent(tenantSlug)}`, {
          cache: "no-store",
        }).then((r) => r.json()),
        fetch(`/api/erp/payments/settings?tenant=${encodeURIComponent(tenantSlug)}`, {
          cache: "no-store",
        }).then((r) => r.json()),
      ]);

      if (ledgerRes?.success) {
        if (ledgerRes.summary) setSummary(ledgerRes.summary);
        setTransactions(Array.isArray(ledgerRes.transactions) ? ledgerRes.transactions : []);
        setSettlements(Array.isArray(ledgerRes.settlements) ? ledgerRes.settlements : []);
        setRefunds(Array.isArray(ledgerRes.refunds) ? ledgerRes.refunds : []);
        setEscrowCases(Array.isArray(ledgerRes.escrowCases) ? ledgerRes.escrowCases : []);
        setDisputes(Array.isArray(ledgerRes.disputes) ? ledgerRes.disputes : []);
      }

      if (settingsRes?.success && settingsRes.settings) {
        const s = settingsRes.settings;
        setByokEnabled(Boolean(s.byokEnabled));
        setByokProvider(s.byokProvider === "nomba" ? "nomba" : "paystack");
        setPaystackPublicKey(s.paystackPublicKey || "");
        setPaystackSecretMasked(s.paystackSecretKeyMasked || "");
        setNombaAccountId(s.nombaAccountId || "");
        setNombaClientId(s.nombaClientId || "");
        setNombaPrivateMasked(s.nombaPrivateKeyMasked || "");
        setConnectionStatus(s.connectionStatus || "disconnected");
        setManagedPaymentsEnabled(Boolean(s.managedPaymentsEnabled));
        setManagedPaymentsEligible(s.managedPaymentsEligible !== false);
        setManagedFeePct(Number(s.managedFeePct ?? 1.5));
        setManagedSettlementArrangement(
          s.managedSettlementArrangement || "Approved Provider Subaccount Split (T+1)"
        );
        setProtectedPaymentsEnabled(Boolean(s.protectedPaymentsEnabled));
        setProtectedPaymentsEligible(s.protectedPaymentsEligible !== false);
        setEscrowProviderAvailable(s.escrowProviderAvailable !== false);
        setProtectionFeePct(Number(s.protectionFeePct ?? 2.5));
        setDeliveryConfirmationMode(
          s.deliveryConfirmationMode || "buyer_confirmation_and_pod"
        );
      }
    } catch (err: any) {
      console.warn("Failed to load payment ledger/settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  const handleSaveSettings = async (action?: string) => {
    if (!tenantSlug) return;
    setStatusMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/erp/payments/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({
          tenantSlug,
          action,
          byokEnabled,
          byokProvider,
          paystackPublicKey,
          paystackSecretKey: paystackSecretKey || undefined,
          nombaAccountId,
          nombaClientId,
          nombaPrivateKey: nombaPrivateKey || undefined,
          managedPaymentsEnabled,
          protectedPaymentsEnabled,
          deliveryConfirmationMode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update payment configuration");
      }
      setPaystackSecretKey("");
      setNombaPrivateKey("");
      setStatusMessage({ type: "success", text: data.message || "Payment settings saved." });
      await loadPaymentData();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFulfilmentEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug || !selectedEscrowOrder) return;
    setStatusMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/erp/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-slug": tenantSlug },
        body: JSON.stringify({
          action: "SUBMIT_FULFILMENT_EVIDENCE",
          tenantSlug,
          orderNumber: selectedEscrowOrder,
          trackingNumber,
          courierName,
          deliveryEvidenceNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not submit fulfilment evidence");
      }
      setStatusMessage({ type: "success", text: data.message });
      setSelectedEscrowOrder("");
      setTrackingNumber("");
      setCourierName("");
      setDeliveryEvidenceNotes("");
      await loadPaymentData();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (txModeFilter !== "ALL" && tx.payment_mode !== txModeFilter) return false;
    if (txProviderFilter !== "ALL" && tx.provider !== txProviderFilter) return false;
    if (txStatusFilter !== "ALL" && tx.status !== txStatusFilter) return false;
    if (txSearch.trim()) {
      const q = txSearch.toLowerCase();
      return (
        String(tx.order_number || "").toLowerCase().includes(q) ||
        String(tx.provider_reference || "").toLowerCase().includes(q) ||
        String(tx.customer_name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredEscrow = escrowCases.filter((esc) => {
    if (escrowFilter === "ALL") return true;
    return esc.status === escrowFilter;
  });

  return (
    <BusinessShell
      title="Payments, Settlements & Protected Escrow"
      subtitle="Unified financial ledger separating Merchant BYOK, Ofia Managed Payments, and Escrow Partner custody."
      action={
        <NexaButton
          size="sm"
          variant="outline"
          onClick={loadPaymentData}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
        >
          Refresh Ledger
        </NexaButton>
      }
    >
      <div className="space-y-6">
        {/* Top Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--nexa-border)] pb-3">
          {[
            { key: "overview", label: "Overview & KPIs" },
            { key: "transactions", label: `Transactions (${transactions.length})` },
            { key: "settlements", label: `Settlements (${settlements.length})` },
            { key: "escrow", label: `Protected Escrow (${escrowCases.length})` },
            { key: "settings", label: "Payment Settings (BYOK / Managed / Escrow)" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#1A56DB] text-white shadow-sm"
                  : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                : "bg-rose-500/10 border-rose-500/30 text-rose-700"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW & 12 SUMMARY CARDS (Part I Section 14) */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] mb-3">
                Standard &amp; Managed Payment Performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Verified Sales", value: summary.totalSales, sub: "Verified gross payment volume" },
                  { label: "Successful Payments", value: summary.successfulPayments, sub: "Confirmed by provider webhook/API" },
                  { label: "Pending Payments", value: summary.pendingPayments, sub: "Awaiting customer completion" },
                  { label: "Failed Payments", value: summary.failedPayments, sub: "Declined or expired attempts" },
                  { label: "Pending Settlements", value: summary.pendingSettlements, sub: "Verified payments awaiting provider payout" },
                  { label: "Settled Funds", value: summary.settledFunds, sub: "Reconciled provider settlements" },
                  { label: "Payment & Platform Fees", value: summary.paymentFees, sub: "Provider + applicable Ofia fees" },
                  { label: "Total Refunds", value: summary.refunds, sub: "Processed and pending refunds" },
                ].map((c, idx) => (
                  <NexaCard key={idx} variant="glass" padding="md" className="border border-[var(--nexa-border)]">
                    <span className="text-[11px] font-bold text-[var(--nexa-text-muted)] block">{c.label}</span>
                    <span className="text-xl font-black text-[var(--nexa-text-primary)] mt-1 block">
                      ₦{Number(c.value || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">{c.sub}</span>
                  </NexaCard>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Protected Payments · External Escrow Partner Custody (Not Available Balance)
                </h3>
                <NexaBadge variant="brand">Custody Separated</NexaBadge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Escrow Funds Held by Partner", value: summary.escrowFundsHeld, sub: "Safeguarded by escrow partner pending delivery" },
                  { label: "Escrow Eligible / Pending Release", value: summary.escrowReleaseEligible, sub: "Buyer confirmed; release requested from partner" },
                  { label: "Escrow Funds Released", value: summary.escrowFundsReleased, sub: "Confirmed released by escrow partner" },
                  { label: "Disputed Escrow Funds", value: summary.disputedEscrowFunds, sub: "Release frozen due to open buyer/merchant dispute" },
                ].map((c, idx) => (
                  <NexaCard key={idx} variant="glass" padding="md" className="border border-blue-500/20 bg-blue-500/5">
                    <span className="text-[11px] font-bold text-blue-600 block">{c.label}</span>
                    <span className="text-xl font-black text-[var(--nexa-text-primary)] mt-1 block">
                      ₦{Number(c.value || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">{c.sub}</span>
                  </NexaCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS TABLE (Part I Section 14) */}
        {activeTab === "transactions" && (
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Search order #, transaction ref, or customer..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]"
                />
              </div>
              <select
                value={txModeFilter}
                onChange={(e) => setTxModeFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold"
              >
                <option value="ALL">All Payment Modes</option>
                <option value="merchant_byok">Merchant BYOK</option>
                <option value="ofia_managed">Ofia Managed</option>
                <option value="protected_escrow">Protected Escrow</option>
              </select>
              <select
                value={txProviderFilter}
                onChange={(e) => setTxProviderFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold"
              >
                <option value="ALL">All Providers</option>
                <option value="paystack">Paystack</option>
                <option value="nomba">Nomba</option>
                <option value="escrow_partner">Escrow Partner</option>
              </select>
              <select
                value={txStatusFilter}
                onChange={(e) => setTxStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="successful">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--nexa-border)] text-[10px] uppercase text-[var(--nexa-text-muted)]">
                    <th className="py-2.5 px-2">Transaction / Ref</th>
                    <th className="py-2.5 px-2">Order #</th>
                    <th className="py-2.5 px-2">Customer</th>
                    <th className="py-2.5 px-2">Mode</th>
                    <th className="py-2.5 px-2">Provider</th>
                    <th className="py-2.5 px-2">Gross</th>
                    <th className="py-2.5 px-2">Provider Fee</th>
                    <th className="py-2.5 px-2">Ofia / Escrow Fee</th>
                    <th className="py-2.5 px-2">Net Amount</th>
                    <th className="py-2.5 px-2">Payment Status</th>
                    <th className="py-2.5 px-2">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-[var(--nexa-text-muted)]">
                        No transactions found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[var(--nexa-bg-base)]">
                        <td className="py-2.5 px-2 font-mono font-semibold">{tx.provider_reference}</td>
                        <td className="py-2.5 px-2 font-mono">{tx.order_number}</td>
                        <td className="py-2.5 px-2">{tx.customer_name || tx.customer_email || "Buyer"}</td>
                        <td className="py-2.5 px-2">
                          <NexaBadge variant={tx.payment_mode === "protected_escrow" ? "brand" : "neutral"}>
                            {tx.payment_mode}
                          </NexaBadge>
                        </td>
                        <td className="py-2.5 px-2 uppercase font-semibold">{tx.provider}</td>
                        <td className="py-2.5 px-2 font-bold">₦{Number(tx.gross_amount || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-2">₦{Number(tx.provider_fee || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-2">
                          ₦{(Number(tx.ofia_fee || 0) + Number(tx.protection_fee || 0)).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 font-bold text-emerald-600">
                          ₦{Number(tx.net_amount || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 uppercase font-bold">{tx.status}</td>
                        <td className="py-2.5 px-2 font-mono text-[11px]">{tx.settlement_status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </NexaCard>
        )}

        {/* TAB 3: SETTLEMENTS SCREEN (Part I Section 14) */}
        {activeTab === "settlements" && (
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] space-y-4">
            <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-secondary)]">
              <strong>Settlement Separation Policy:</strong> A successful payment is not automatically a settled payment. BYOK settlements follow your connected provider&apos;s payout schedule; Managed Payments follow the approved subaccount split schedule.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--nexa-border)] text-[10px] uppercase text-[var(--nexa-text-muted)]">
                    <th className="py-2.5 px-2">Settlement Ref</th>
                    <th className="py-2.5 px-2">Provider</th>
                    <th className="py-2.5 px-2">Mode</th>
                    <th className="py-2.5 px-2">Gross</th>
                    <th className="py-2.5 px-2">Fees &amp; Deductions</th>
                    <th className="py-2.5 px-2">Net Settled</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)]">
                  {settlements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[var(--nexa-text-muted)]">
                        No settlement batches recorded yet.
                      </td>
                    </tr>
                  ) : (
                    settlements.map((stl) => (
                      <tr key={stl.id}>
                        <td className="py-2.5 px-2 font-mono font-semibold">{stl.settlement_reference}</td>
                        <td className="py-2.5 px-2 uppercase">{stl.provider}</td>
                        <td className="py-2.5 px-2">{stl.payment_mode}</td>
                        <td className="py-2.5 px-2">₦{Number(stl.gross_amount || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-2">
                          ₦{(Number(stl.provider_fee || 0) + Number(stl.ofia_fee || 0)).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 font-bold text-emerald-600">
                          ₦{Number(stl.net_amount || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 uppercase font-bold">{stl.status}</td>
                        <td className="py-2.5 px-2">
                          {stl.created_at ? new Date(stl.created_at).toLocaleDateString() : "Pending"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </NexaCard>
        )}

        {/* TAB 4: PROTECTED ESCROW & DISPUTES (Part J Section 17) */}
        {activeTab === "escrow" && (
          <div className="space-y-6">
            <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                    Protected Orders &amp; Escrow Partner Custody
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Merchants can submit fulfilment evidence and respond to disputes. Escrow release is executed strictly by the escrow partner after verified buyer confirmation.
                  </p>
                </div>
                <select
                  value={escrowFilter}
                  onChange={(e) => setEscrowFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold"
                >
                  <option value="ALL">All Escrow States</option>
                  <option value="held">Funds Held</option>
                  <option value="awaiting_fulfilment">Awaiting Fulfilment</option>
                  <option value="awaiting_buyer_confirmation">Awaiting Buyer Confirmation</option>
                  <option value="release_pending">Release Pending</option>
                  <option value="released">Released</option>
                  <option value="disputed">Disputed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--nexa-border)] text-[10px] uppercase text-[var(--nexa-text-muted)]">
                      <th className="py-2.5 px-2">Order #</th>
                      <th className="py-2.5 px-2">Escrow Partner Ref</th>
                      <th className="py-2.5 px-2">Customer</th>
                      <th className="py-2.5 px-2">Gross Funded</th>
                      <th className="py-2.5 px-2">Merchant Net</th>
                      <th className="py-2.5 px-2">Escrow Status</th>
                      <th className="py-2.5 px-2">Fulfilment</th>
                      <th className="py-2.5 px-2">Tracking / POD</th>
                      <th className="py-2.5 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--nexa-border)]">
                    {filteredEscrow.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-[var(--nexa-text-muted)]">
                          No Protected Payment escrow cases found.
                        </td>
                      </tr>
                    ) : (
                      filteredEscrow.map((esc) => (
                        <tr key={esc.id}>
                          <td className="py-2.5 px-2 font-mono font-bold">{esc.order_number}</td>
                          <td className="py-2.5 px-2 font-mono">{esc.provider_escrow_reference}</td>
                          <td className="py-2.5 px-2">{esc.customer_name || esc.customer_email}</td>
                          <td className="py-2.5 px-2">₦{Number(esc.gross_amount || 0).toLocaleString()}</td>
                          <td className="py-2.5 px-2 font-bold">
                            ₦{Number(esc.merchant_net_amount || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2 uppercase font-bold text-blue-600">{esc.status}</td>
                          <td className="py-2.5 px-2 uppercase">{esc.fulfilment_status}</td>
                          <td className="py-2.5 px-2">
                            {esc.tracking_number
                              ? `${esc.courier_name || "Courier"}: ${esc.tracking_number}`
                              : esc.delivery_evidence_notes || "None"}
                          </td>
                          <td className="py-2.5 px-2">
                            <button
                              type="button"
                              onClick={() => setSelectedEscrowOrder(esc.order_number)}
                              className="px-2.5 py-1 rounded-lg bg-[#1A56DB] text-white text-[11px] font-bold cursor-pointer"
                            >
                              Submit POD Evidence
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {selectedEscrowOrder && (
                <form
                  onSubmit={handleSubmitFulfilmentEvidence}
                  className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3"
                >
                  <div className="font-bold text-xs text-[var(--nexa-text-primary)]">
                    Submit Fulfilment &amp; Delivery Evidence for Order #{selectedEscrowOrder}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <NexaInput
                      label="Courier / Logistics Partner"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. Ofia Express Dispatch / GIGL"
                    />
                    <NexaInput
                      label="Waybill / Tracking Number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. TRK-2026-9941"
                    />
                  </div>
                  <NexaInput
                    label="Proof of Delivery Notes / Signed Waybill Link"
                    value={deliveryEvidenceNotes}
                    onChange={(e) => setDeliveryEvidenceNotes(e.target.value)}
                    placeholder="Handed over to recipient at security gate..."
                  />
                  <div className="flex justify-end gap-2">
                    <NexaButton
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => setSelectedEscrowOrder("")}
                    >
                      Cancel
                    </NexaButton>
                    <NexaButton size="sm" variant="primary" type="submit">
                      Save Evidence &amp; Notify Buyer
                    </NexaButton>
                  </div>
                </form>
              )}
            </NexaCard>
          </div>
        )}

        {/* TAB 5: MERCHANT PAYMENT SETTINGS (Part F Section 10) */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-3xl">
            {/* D. Payment Connection Status Banner */}
            <NexaCard variant="glass" padding="md" className="border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#1A56DB]" />
                <div>
                  <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Payment Provider Connection Status
                  </div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)]">
                    All provider secret keys are encrypted at rest with AES-256-GCM and never exposed after saving.
                  </div>
                </div>
              </div>
              <NexaBadge
                variant={
                  connectionStatus === "connected"
                    ? "green"
                    : connectionStatus === "invalid_credentials"
                    ? "red"
                    : "neutral"
                }
              >
                {connectionStatus.toUpperCase()}
              </NexaBadge>
            </NexaCard>

            {/* A. Standard Payment Configuration (Merchant BYOK) */}
            <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                    A. Standard Payment Configuration (Merchant BYOK)
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Connect your own Paystack or Nomba merchant account. Ordinary sales settle directly to your provider account.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={byokEnabled}
                    onChange={(e) => setByokEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#1A56DB]"
                  />
                  <span>Enable BYOK</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                    BYOK Payment Provider
                  </label>
                  <select
                    value={byokProvider}
                    onChange={(e) => setByokProvider(e.target.value as "paystack" | "nomba")}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-semibold"
                  >
                    <option value="paystack">Paystack (Direct Merchant Account)</option>
                    <option value="nomba">Nomba (Direct Merchant Account)</option>
                  </select>
                </div>

                {byokProvider === "paystack" ? (
                  <div className="space-y-3">
                    <NexaInput
                      label="Paystack Public Key (pk_live_... or pk_test_...)"
                      value={paystackPublicKey}
                      onChange={(e) => setPaystackPublicKey(e.target.value)}
                      placeholder="pk_live_..."
                    />
                    <NexaInput
                      label={`Paystack Secret Key ${paystackSecretMasked ? `(Saved: ${paystackSecretMasked})` : ""}`}
                      type="password"
                      value={paystackSecretKey}
                      onChange={(e) => setPaystackSecretKey(e.target.value)}
                      placeholder={paystackSecretMasked || "sk_live_... (encrypted at rest)"}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <NexaInput
                      label="Nomba Account ID"
                      value={nombaAccountId}
                      onChange={(e) => setNombaAccountId(e.target.value)}
                    />
                    <NexaInput
                      label="Nomba Client ID"
                      value={nombaClientId}
                      onChange={(e) => setNombaClientId(e.target.value)}
                    />
                    <NexaInput
                      label={`Nomba Private Key ${nombaPrivateMasked ? `(Saved: ${nombaPrivateMasked})` : ""}`}
                      type="password"
                      value={nombaPrivateKey}
                      onChange={(e) => setNombaPrivateKey(e.target.value)}
                      placeholder={nombaPrivateMasked || "Enter Nomba Private Key (encrypted at rest)"}
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <NexaButton
                    size="sm"
                    variant="primary"
                    onClick={() => handleSaveSettings("verify_connection")}
                  >
                    Save &amp; Verify Connection
                  </NexaButton>
                  <NexaButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveSettings("disconnect_byok")}
                  >
                    Disconnect Provider
                  </NexaButton>
                </div>
              </div>
            </NexaCard>

            {/* B. Ofia Managed Payments */}
            <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                    B. Ofia Managed Payments
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Used for standard orders when BYOK is not active, subject to approved provider subaccount settlement.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={managedPaymentsEnabled}
                    disabled={!managedPaymentsEligible}
                    onChange={(e) => setManagedPaymentsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#1A56DB]"
                  />
                  <span>Activate Managed Payments</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">Eligibility</span>
                  <span className="font-bold">{managedPaymentsEligible ? "Approved & Eligible" : "Not Eligible"}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">Platform Fee</span>
                  <span className="font-bold">{managedFeePct}% per standard order</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">Settlement Arrangement</span>
                  <span className="font-bold">{managedSettlementArrangement}</span>
                </div>
              </div>
            </NexaCard>

            {/* C. Protected Payments (Escrow) */}
            <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                    C. Protected Payments (Approved Escrow Partner)
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Optional customer-selected escrow protection. Entire custody lifecycle is handled by the approved escrow partner.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={protectedPaymentsEnabled}
                    disabled={!protectedPaymentsEligible}
                    onChange={(e) => setProtectedPaymentsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#1A56DB]"
                  />
                  <span>Enable Protected Payment</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">Escrow Partner Status</span>
                  <span className="font-bold">
                    {escrowProviderAvailable ? "Available & Active" : "Unavailable (No Fallback)"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">Protection Fee</span>
                  <span className="font-bold">{protectionFeePct}% (Disclosed to Buyer)</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <span className="text-[10px] text-[var(--nexa-text-muted)] uppercase font-bold block">Release Condition</span>
                  <span className="font-bold">Verified POD + Buyer Confirmation</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <NexaButton size="sm" variant="primary" onClick={() => handleSaveSettings()}>
                  Save All Payment Preferences
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    setStatusMessage("Dispatching Regulatory Licensing & Escrow RFP inquiry emails (Reply-To: ifeanyireed@gmail.com)...");
                    try {
                      const res = await fetch("/api/erp/payments/partner-outreach", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          replyTo: "ifeanyireed@gmail.com",
                          ccSenderCopy: true,
                        }),
                      });
                      const data = await res.json();
                      const sentCount = Array.isArray(data?.results)
                        ? data.results.filter((r: any) => r.success).length
                        : 0;
                      setStatusMessage(
                        `Dispatched ${sentCount}/${data?.results?.length || 0} Fintech Licensing & Escrow RFP emails (Reply-To & CC: ${data?.replyTo || "ifeanyireed@gmail.com"}).`
                      );
                    } catch (err: any) {
                      setStatusMessage("Failed to dispatch partner outreach emails: " + err.message);
                    }
                  }}
                >
                  Send Fintech Licensing &amp; Escrow RFP Emails (ifeanyireed@gmail.com)
                </NexaButton>
              </div>
            </NexaCard>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
