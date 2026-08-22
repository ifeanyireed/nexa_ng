"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  HelpCircle,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface DisputeRecord {
  id: string;
  bookingRef: string;
  clientName: string;
  proName: string;
  serviceTitle: string;
  escrowAmount: string;
  complaintReason: string;
  clientClaim: string;
  proRebuttal: string;
  status: "OPEN" | "RESOLVED_REFUND" | "RESOLVED_RELEASE";
  createdAt: string;
}

const INITIAL_DISPUTES: DisputeRecord[] = [
  {
    id: "DISP-101",
    bookingRef: "BK-98421",
    clientName: "Chief Adewale Adeleke",
    proName: "CoolBreeze Air Conditioners",
    serviceTitle: "Split AC Gas Refill & Compressor Servicing",
    escrowAmount: "₦45,000",
    complaintReason: "Incomplete Work / AC Still Blowing Warm Air",
    clientClaim: "Technician arrived 3 hours late, poured refrigerant, and left without waiting for cooling test. Room is still 31°C.",
    proRebuttal: "Compressor has severe electrical wiring fault that was not part of original booking scope.",
    status: "OPEN",
    createdAt: "Aug 20, 2026",
  },
  {
    id: "DISP-102",
    bookingRef: "BK-98319",
    clientName: "Dr. Ngozi Okonjo",
    proName: "Prime Painting & Screeding",
    serviceTitle: "Interior Wall Painting (4-Bedroom Duplex)",
    escrowAmount: "₦180,000",
    complaintReason: "Wrong Paint Shade Applied",
    clientClaim: "Agreed on Dulux Silk Off-White; painter applied chalky matte white with roller marks.",
    proRebuttal: "Client supplied the paint buckets directly from their own store. We applied exactly what was provided.",
    status: "OPEN",
    createdAt: "Aug 21, 2026",
  },
];

export default function MarketplaceDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRecord[]>(INITIAL_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(disputes[0]);
  const [resolutionMsg, setResolutionMsg] = useState("");

  const resolveDispute = (id: string, action: "REFUND" | "RELEASE") => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: action === "REFUND" ? "RESOLVED_REFUND" : "RESOLVED_RELEASE",
            }
          : d
      )
    );
    setResolutionMsg(
      action === "REFUND"
        ? `Dispute ${id} resolved: Escrow refunded 100% to client.`
        : `Dispute ${id} resolved: Escrow payout released 100% to merchant pro.`
    );
    setTimeout(() => setResolutionMsg(""), 5000);
  };

  return (
    <SuperAdminShell
      title="Escrow Disputes & Arbitration"
      subtitle="Mediate client-merchant grievances, review photographic evidence, and execute binding escrow payout or refund releases."
      action={
        <NexaBadge variant="coral" className="py-1 px-3 text-xs font-bold">
          {disputes.filter((d) => d.status === "OPEN").length} Open Grievances
        </NexaBadge>
      }
    >
      <div className="space-y-6">
        {resolutionMsg && (
          <div className="p-3.5 rounded-2xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/30 text-[#0E9F6E] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resolutionMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LIST OF DISPUTES */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Dispute Queue ({disputes.length})
            </h3>
            <div className="space-y-2.5">
              {disputes.map((d) => {
                const isSelected = selectedDispute?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDispute(d)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-[#E02424]/5 border-[#E02424] ring-1 ring-[#E02424] shadow-md"
                        : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] hover:border-[#E02424]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#E02424]">{d.id}</span>
                      <NexaBadge
                        variant={
                          d.status === "OPEN"
                            ? "coral"
                            : d.status === "RESOLVED_REFUND"
                            ? "neutral"
                            : "green"
                        }
                        className="text-[9px]"
                      >
                        {d.status}
                      </NexaBadge>
                    </div>
                    <div className="font-bold text-xs text-[var(--nexa-text-primary)]">{d.serviceTitle}</div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)] pt-1 border-t border-[var(--nexa-border)]">
                      <span>{d.bookingRef}</span>
                      <span className="font-mono font-bold text-[var(--nexa-text-primary)]">{d.escrowAmount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISPUTE ARBITRATION DETAILS */}
          {selectedDispute ? (
            <div className="lg:col-span-2 space-y-4">
              <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
                <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#E02424]">{selectedDispute.id}</span>
                    <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">{selectedDispute.serviceTitle}</h3>
                    <p className="text-xs text-[var(--nexa-text-muted)]">Booking Reference: {selectedDispute.bookingRef}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[var(--nexa-text-muted)]">Escrow Balance</span>
                    <div className="text-xl font-mono font-black text-[#0E9F6E]">{selectedDispute.escrowAmount}</div>
                  </div>
                </div>

                {/* Complaint Summary */}
                <div className="p-3.5 rounded-xl bg-[#E02424]/10 border border-[#E02424]/20 space-y-1">
                  <div className="text-xs font-bold text-[#E02424] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Complaint Reason: {selectedDispute.complaintReason}
                  </div>
                </div>

                {/* Side-by-side statements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#1A56DB]" />
                      Client Claim ({selectedDispute.clientName})
                    </div>
                    <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed italic">
                      "{selectedDispute.clientClaim}"
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0E9F6E]" />
                      Merchant Pro Statement ({selectedDispute.proName})
                    </div>
                    <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed italic">
                      "{selectedDispute.proRebuttal}"
                    </p>
                  </div>
                </div>

                {/* Arbitration Decision Actions */}
                {selectedDispute.status === "OPEN" ? (
                  <div className="p-4 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3 pt-4">
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Execute Superadmin Arbitration Ruling:</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <NexaButton
                        size="sm"
                        variant="danger"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => resolveDispute(selectedDispute.id, "REFUND")}
                        className="bg-[#E02424] text-white hover:bg-[#C81E1E]"
                      >
                        Refund Escrow to Client ({selectedDispute.escrowAmount})
                      </NexaButton>
                      <NexaButton
                        size="sm"
                        variant="primary"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => resolveDispute(selectedDispute.id, "RELEASE")}
                        className="bg-[#0E9F6E] text-white hover:bg-[#0B855D]"
                      >
                        Release Payout to Pro ({selectedDispute.escrowAmount})
                      </NexaButton>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] text-xs font-bold text-[#0E9F6E] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    This dispute is marked as {selectedDispute.status}. Escrow transaction is finalized.
                  </div>
                )}
              </NexaCard>
            </div>
          ) : null}
        </div>
      </div>
    </SuperAdminShell>
  );
}
