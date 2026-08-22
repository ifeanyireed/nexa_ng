"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { INITIAL_AUDIT_LOGS, AuditLogEntry } from "@/lib/admin-data";
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Download,
  Calendar,
  User,
  Clock,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");

  const types = ["All", "Tenant", "User", "FeatureFlag", "Billing"];

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "All" || log.targetType === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.operatorEmail.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.targetId.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="purple" dot>
                Security & Compliance
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Immutable Operator Audit Trail
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Operator Security Audit Trail
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Every administrative action, tenant quota override, feature toggle, and role change is permanently logged.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              Export Audit CSV
            </NexaButton>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl liquid-glass border border-[var(--glass-border)]">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide py-0.5">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterType === t
                    ? "bg-[#1A56DB] text-white shadow-sm dark:bg-[#2563EB]"
                    : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-brand-light)]/60 hover:text-[#1A56DB] dark:hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--nexa-text-faint)]" />
            <input
              type="text"
              placeholder="Search audit actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
            />
          </div>
        </div>

        {/* Audit Logs Table */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/60 text-[var(--nexa-text-muted)] uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-3">Target Entity</th>
                  <th className="py-3.5 px-3">Details</th>
                  <th className="py-3.5 px-3">Operator</th>
                  <th className="py-3.5 px-3">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--nexa-bg-base)]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[var(--nexa-text-primary)] bg-[var(--nexa-bg-base)] px-2 py-1 rounded-md border border-[var(--nexa-border)]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <NexaBadge variant="purple">{log.targetType}</NexaBadge>
                        <span className="font-semibold text-[11px] text-[var(--nexa-text-primary)]">
                          {log.targetId}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[var(--nexa-text-secondary)] max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[var(--nexa-text-muted)]">
                      {log.operatorEmail}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[var(--nexa-text-faint)]">
                      {log.ipAddress}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-[var(--nexa-text-muted)]">
                      {log.timestamp}
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
