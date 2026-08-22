"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

export default function MarketplaceDisputesPage() {
  const disputes = [
    {
      id: "DSP-8401",
      bookingRef: "BK-94820",
      client: "Amina Yusuf",
      pro: "Lekki Solar Energy Solutions",
      amount: "₦145,000",
      reason: "Incomplete inverter cabling upon delivery",
      status: "OPEN",
      openedDate: "3 hours ago",
    },
    {
      id: "DSP-8399",
      bookingRef: "BK-94711",
      client: "Dr. Okey Eze",
      pro: "Apex Cold Chain Refrigeration",
      amount: "₦85,000",
      reason: "Compressor part arrived delayed by 2 days",
      status: "UNDER_REVIEW",
      openedDate: "Yesterday",
    },
    {
      id: "DSP-8380",
      bookingRef: "BK-94102",
      client: "Engr. Folake Davies",
      pro: "Prime Plumbing Services",
      amount: "₦32,000",
      reason: "Pipe fitting leak resolved after re-visit",
      status: "RESOLVED",
      openedDate: "3 days ago",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/marketplace" className="text-xs font-bold text-[#0E9F6E] hover:underline">
                ← Marketplace Admin
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5 mt-1">
              <AlertOctagon className="w-6 h-6 text-[#E02424]" />
              Paystack Escrow Dispute Arbitration
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Mediate disputes between clients and service pros, hold escrow payouts, and authorize refund disbursements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NexaBadge variant="danger">2 Active Disputes</NexaBadge>
          </div>
        </div>

        {/* DISPUTES TABLE */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Dispute ID & Booking</th>
                  <th className="py-3 px-4">Client vs Pro</th>
                  <th className="py-3 px-4">Escrow Amount</th>
                  <th className="py-3 px-4">Dispute Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Arbitration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] font-medium">
                {disputes.map((dsp) => (
                  <tr key={dsp.id} className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{dsp.id}</div>
                      <div className="text-[11px] font-mono text-[var(--nexa-text-muted)]">{dsp.bookingRef} • {dsp.openedDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[var(--nexa-text-primary)] font-semibold">{dsp.client}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)]">vs. {dsp.pro}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1A56DB]">
                      {dsp.amount}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--nexa-text-secondary)] max-w-xs truncate">
                      {dsp.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      {dsp.status === "OPEN" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E02424] bg-[#E02424]/10 px-2 py-0.5 rounded-full border border-[#E02424]/20">
                          Action Required
                        </span>
                      )}
                      {dsp.status === "UNDER_REVIEW" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full border border-[#F59E0B]/20">
                          Under Review
                        </span>
                      )}
                      {dsp.status === "RESOLVED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E9F6E] bg-[#0E9F6E]/10 px-2 py-0.5 rounded-full border border-[#0E9F6E]/20">
                          Resolved
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <NexaButton size="sm" variant="outline" className="text-xs">
                        Review Evidence
                      </NexaButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>
      </div>
    </AdminShell>
  );
}
