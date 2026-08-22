"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  DollarSign,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function ERPAuditTrailPage() {
  const auditLogs = [
    { id: "LOG-901", action: "PAYROLL_DISBURSEMENT", actor: "Oluwatobiloba Olateju (CFO)", details: "Authorized August 2026 Salary Batch for 120 staff (₦18.45M)", timestamp: "2026-08-22 09:30 AM", status: "SUCCESS" },
    { id: "LOG-902", action: "APPRAISAL_CYCLE_EXTENDED", actor: "Goldy Nnanna (HR Lead)", details: "Extended Q3 Appraisal submission window to Aug 28 for Fleet Dept", timestamp: "2026-08-21 04:15 PM", status: "SUCCESS" },
    { id: "LOG-903", action: "GL_JOURNAL_ADJUSTMENT", actor: "Queen Okonkwo (Finance)", details: "Posted adjusting journal JRN-4820 for fuel expense reconciliation (₦340k)", timestamp: "2026-08-21 02:00 PM", status: "SUCCESS" },
    { id: "LOG-904", action: "ROLE_PERMISSION_CHANGE", actor: "Ifeanyi Ibeh (MD)", details: "Promoted Queen Okonkwo from Accountant to Finance Lead", timestamp: "2026-08-20 11:10 AM", status: "SUCCESS" },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/erp" className="text-xs font-bold text-[#7E3AF2] hover:underline">
                ← ERP Admin
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5 mt-1">
              <FileSpreadsheet className="w-6 h-6 text-[#7E3AF2]" />
              Executive Financial & HR Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Immutable system record of payroll authorizations, journal adjustments, appraisal cycle modifications, and role reassignments.
            </p>
          </div>

          <NexaBadge variant="purple">Tamper-Proof Audit Log</NexaBadge>
        </div>

        {/* LOGS TABLE */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Log ID & Action</th>
                  <th className="py-3 px-4">Authorized Operator</th>
                  <th className="py-3 px-4">Event Description</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold font-mono text-[var(--nexa-text-primary)]">{log.id}</div>
                      <div className="text-[10px] font-mono text-[#7E3AF2]">{log.action}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--nexa-text-primary)]">{log.actor}</td>
                    <td className="py-3.5 px-4 text-[var(--nexa-text-secondary)]">{log.details}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--nexa-text-muted)]">{log.timestamp}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E9F6E] bg-[#0E9F6E]/10 px-2 py-0.5 rounded-full border border-[#0E9F6E]/20">
                        <ShieldCheck className="w-3 h-3" /> {log.status}
                      </span>
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
