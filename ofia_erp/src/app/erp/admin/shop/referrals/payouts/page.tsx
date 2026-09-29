"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const PAYOUTS = [
  { id: "PAY-2026-091", affiliate: "Khalil Ibrahim", bank: "GTBank (0123456789)", grossAmount: "₦180,000", whtTax: "₦9,000 (5%)", netPay: "₦171,000", cycle: "Aug 1 - Aug 15", status: "READY", paystackRef: "TRF_9849201" },
  { id: "PAY-2026-092", affiliate: "SolarInstallers Hub", bank: "Zenith Bank (2089123456)", grossAmount: "₦120,000", whtTax: "₦6,000 (5%)", netPay: "₦114,000", cycle: "Aug 1 - Aug 15", status: "READY", paystackRef: "TRF_9849202" },
  { id: "PAY-2026-090", affiliate: "TechPoint West Africa", bank: "Access Bank (0099887766)", grossAmount: "₦350,000", whtTax: "₦17,500 (5%)", netPay: "₦332,500", cycle: "July 16 - July 31", status: "PAID", paystackRef: "TRF_9849188" },
];

export default function ReferralPayoutsPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDisburseAll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <BusinessShell
      title="Paystack Commission Payouts"
      subtitle="Process direct bank transfers to Nigerian affiliate accounts with automated 5% Withholding Tax (WHT) deduction."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/shop/referrals">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Referral Hub
            </NexaButton>
          </Link>
          <NexaButton
            size="sm"
            variant="primary"
            disabled={isProcessing}
            onClick={handleDisburseAll}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
            className="bg-[#0E9F6E] text-white font-bold"
          >
            {isProcessing ? "Processing Paystack Transfers..." : "Disburse All Pending (₦285,000)"}
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {success && (
          <div className="p-4 rounded-2xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/30 text-[#0E9F6E] flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>All pending payouts successfully sent via Paystack Transfer API!</span>
            </div>
            <span className="font-mono text-[11px]">NIBSS Ref: PSTK_BATCH_20260822</span>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4">Affiliate & Bank Details</th>
                <th className="py-3 px-3">Gross Commission</th>
                <th className="py-3 px-3">WHT (5%)</th>
                <th className="py-3 px-3">Net Disbursed</th>
                <th className="py-3 px-3">Billing Cycle</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {PAYOUTS.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold font-mono text-[#1A56DB]">{p.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[var(--nexa-text-primary)]">{p.affiliate}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">{p.bank}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold">{p.grossAmount}</td>
                  <td className="py-3.5 px-3 font-mono text-[var(--nexa-text-muted)]">{p.whtTax}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">{p.netPay}</td>
                  <td className="py-3.5 px-3 text-[var(--nexa-text-secondary)]">{p.cycle}</td>
                  <td className="py-3.5 px-4 text-right">
                    <NexaBadge variant={p.status === "PAID" ? "green" : "brand"} dot>
                      {p.status}
                    </NexaBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BusinessShell>
  );
}
