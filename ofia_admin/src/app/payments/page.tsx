"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Activity,
  Lock,
  FileText,
} from "lucide-react";

export default function SuperAdminPaymentsOversightPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "escrow" | "disputes" | "webhooks" | "exceptions"
  >("escrow");

  const loadOversight = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments/oversight", { cache: "no-store" });
      const json = await res.json();
      if (json?.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch Super Admin payment oversight:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOversight();
  }, [loadOversight]);

  const ov = data?.overview || {
    providerAccountStatus: "OPERATIONAL",
    totalFundsHeldByProvider: 0,
    totalReleases: 0,
    totalRefunds: 0,
    outstandingDisputes: 0,
    reconciliationDifferencesCount: 0,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ofia Super Admin · Cross-Tenant Financial &amp; Escrow Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Payment &amp; Escrow Governance Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Read-only custody verification, webhook audit logs, dispute monitoring, and provider reconciliation across all tenant databases.
          </p>
        </div>
        <button
          onClick={loadOversight}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Cross-Tenant Ledger</span>
        </button>
      </div>

      {/* KPI Cards (Part J Section 18) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Provider Status</span>
          <span className="text-base font-black text-emerald-400 mt-1 block">
            {ov.providerAccountStatus}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Reported Held by Escrow Partner
          </span>
          <span className="text-lg font-black text-white mt-1 block">
            ₦{Number(ov.totalFundsHeldByProvider || 0).toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Releases</span>
          <span className="text-lg font-black text-emerald-400 mt-1 block">
            ₦{Number(ov.totalReleases || 0).toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Refunds</span>
          <span className="text-lg font-black text-amber-400 mt-1 block">
            ₦{Number(ov.totalRefunds || 0).toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Outstanding Disputes
          </span>
          <span className="text-lg font-black text-rose-400 mt-1 block">
            {ov.outstandingDisputes}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Webhook / Recon Exceptions
          </span>
          <span className="text-lg font-black text-amber-400 mt-1 block">
            {ov.reconciliationDifferencesCount}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { key: "escrow", label: `All Escrow Cases (${data?.escrowCases?.length || 0})` },
          { key: "disputes", label: `Disputes (${data?.disputes?.length || 0})` },
          { key: "webhooks", label: `Provider Webhook Logs (${data?.webhookEvents?.length || 0})` },
          {
            key: "exceptions",
            label: `Failed Events & Exceptions (${data?.reconciliationExceptions?.length || 0})`,
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === t.key
                ? "bg-blue-600 text-white"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "escrow" && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-2">Tenant</th>
                <th className="py-2.5 px-2">Order #</th>
                <th className="py-2.5 px-2">Escrow Partner Ref</th>
                <th className="py-2.5 px-2">Gross</th>
                <th className="py-2.5 px-2">Protection Fee</th>
                <th className="py-2.5 px-2">Merchant Net</th>
                <th className="py-2.5 px-2">Escrow Status</th>
                <th className="py-2.5 px-2">Fulfilment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(data?.escrowCases || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No escrow cases recorded across tenants.
                  </td>
                </tr>
              ) : (
                (data?.escrowCases || []).map((c: any) => (
                  <tr key={`${c.tenant_slug}-${c.id}`}>
                    <td className="py-2.5 px-2 font-bold">{c.tenant_slug}</td>
                    <td className="py-2.5 px-2 font-mono">{c.order_number}</td>
                    <td className="py-2.5 px-2 font-mono">{c.provider_escrow_reference}</td>
                    <td className="py-2.5 px-2">₦{Number(c.gross_amount || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-2">₦{Number(c.protection_fee || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-2 font-bold text-emerald-400">
                      ₦{Number(c.merchant_net_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 uppercase font-bold text-blue-400">{c.status}</td>
                    <td className="py-2.5 px-2 uppercase">{c.fulfilment_status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "disputes" && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-2">Tenant</th>
                <th className="py-2.5 px-2">Order #</th>
                <th className="py-2.5 px-2">Opened By</th>
                <th className="py-2.5 px-2">Reason</th>
                <th className="py-2.5 px-2">Description</th>
                <th className="py-2.5 px-2">Merchant Response</th>
                <th className="py-2.5 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(data?.disputes || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No active or historical escrow disputes.
                  </td>
                </tr>
              ) : (
                (data?.disputes || []).map((d: any) => (
                  <tr key={`${d.tenant_slug}-${d.id}`}>
                    <td className="py-2.5 px-2 font-bold">{d.tenant_slug}</td>
                    <td className="py-2.5 px-2 font-mono">{d.order_number}</td>
                    <td className="py-2.5 px-2 uppercase">{d.opened_by}</td>
                    <td className="py-2.5 px-2 font-semibold">{d.reason}</td>
                    <td className="py-2.5 px-2">{d.description}</td>
                    <td className="py-2.5 px-2">{d.merchant_response || "Awaiting response"}</td>
                    <td className="py-2.5 px-2 uppercase font-bold text-rose-400">{d.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "webhooks" && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-2">Tenant</th>
                <th className="py-2.5 px-2">Provider</th>
                <th className="py-2.5 px-2">Event ID</th>
                <th className="py-2.5 px-2">Normalized Event</th>
                <th className="py-2.5 px-2">Reference</th>
                <th className="py-2.5 px-2">Signature</th>
                <th className="py-2.5 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(data?.webhookEvents || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No provider webhook events logged yet.
                  </td>
                </tr>
              ) : (
                (data?.webhookEvents || []).map((w: any) => (
                  <tr key={`${w.tenant_slug}-${w.id}`}>
                    <td className="py-2.5 px-2 font-bold">{w.tenant_slug}</td>
                    <td className="py-2.5 px-2 uppercase">{w.provider}</td>
                    <td className="py-2.5 px-2 font-mono">{w.event_id}</td>
                    <td className="py-2.5 px-2 font-mono">{w.normalized_event}</td>
                    <td className="py-2.5 px-2 font-mono">{w.provider_reference}</td>
                    <td className="py-2.5 px-2">
                      {w.signature_valid ? "VALID" : "INVALID"}
                    </td>
                    <td className="py-2.5 px-2 font-bold">{w.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "exceptions" && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-2">Tenant</th>
                <th className="py-2.5 px-2">Provider</th>
                <th className="py-2.5 px-2">Reference</th>
                <th className="py-2.5 px-2">Exception / Error</th>
                <th className="py-2.5 px-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(data?.reconciliationExceptions || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Zero failed webhook events or reconciliation exceptions.
                  </td>
                </tr>
              ) : (
                (data?.reconciliationExceptions || []).map((ex: any) => (
                  <tr key={ex.id}>
                    <td className="py-2.5 px-2 font-bold">{ex.tenantSlug}</td>
                    <td className="py-2.5 px-2 uppercase">{ex.provider}</td>
                    <td className="py-2.5 px-2 font-mono">{ex.reference}</td>
                    <td className="py-2.5 px-2 text-rose-400">{ex.issue}</td>
                    <td className="py-2.5 px-2">
                      {ex.createdAt ? new Date(ex.createdAt).toLocaleString() : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
