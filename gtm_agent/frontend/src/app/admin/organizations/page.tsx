"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { NexaInput } from "@/components/nexa/NexaInput";
import { INITIAL_TENANTS, TenantOrg } from "@/lib/admin-data";
import {
  Building2,
  Search,
  Filter,
  Plus,
  Sliders,
  LogIn,
  ShieldAlert,
  Ban,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

export default function AdminOrganizationsPage() {
  const [tenants, setTenants] = useState<TenantOrg[]>(INITIAL_TENANTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenantForQuota, setSelectedTenantForQuota] = useState<TenantOrg | null>(null);
  const [extraLeads, setExtraLeads] = useState("2000");
  const [extraCampaigns, setExtraCampaigns] = useState("5");
  const [isQuotaSaved, setIsQuotaSaved] = useState(false);
  const [impersonationTenant, setImpersonationTenant] = useState<TenantOrg | null>(null);

  const filteredTenants = tenants.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.domain.toLowerCase().includes(q) ||
      t.ownerName.toLowerCase().includes(q)
    );
  });

  const handleSaveQuota = () => {
    if (!selectedTenantForQuota) return;
    setTenants((prev) =>
      prev.map((t) =>
        t.id === selectedTenantForQuota.id
          ? {
              ...t,
              leadsLimit: t.leadsLimit + parseInt(extraLeads || "0", 10),
              campaignsLimit: t.campaignsLimit + parseInt(extraCampaigns || "0", 10),
            }
          : t
      )
    );
    setIsQuotaSaved(true);
    setTimeout(() => {
      setIsQuotaSaved(false);
      setSelectedTenantForQuota(null);
    }, 1500);
  };

  const handleToggleSuspend = (id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Suspended" ? "Active" : "Suspended" }
          : t
      )
    );
  };

  return (
    <AdminShell>
      {/* Quota Override Modal */}
      <NexaModal
        isOpen={!!selectedTenantForQuota}
        onClose={() => setSelectedTenantForQuota(null)}
        title={`Adjust Subscription Limits for ${selectedTenantForQuota?.name}`}
        subtitle="Centralized SubscriptionHelper quota override for enterprise onboarding or pilot campaigns"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-secondary)] space-y-1">
            <div>
              <strong>Current Plan Tier: </strong>
              <span className="font-mono text-[#1A56DB] dark:text-[#60A5FA] font-bold">
                {selectedTenantForQuota?.planTier}
              </span>
            </div>
            <div>
              <strong>Current Limits: </strong>
              <span className="font-mono">
                {selectedTenantForQuota?.leadsLimit?.toLocaleString() || "0"} leads / mo ·{" "}
                {selectedTenantForQuota?.campaignsLimit || 0} active campaigns
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NexaInput
              label="Add Extra Lead Credits"
              value={extraLeads}
              onChange={(e) => setExtraLeads(e.target.value)}
            />
            <NexaInput
              label="Add Extra Active Campaigns"
              value={extraCampaigns}
              onChange={(e) => setExtraCampaigns(e.target.value)}
            />
          </div>

          {isQuotaSaved && (
            <div className="p-3 rounded-xl bg-[#ECFDF5] text-[#0E9F6E] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Subscription limits overridden in SubscriptionService!
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton
              size="sm"
              variant="outline"
              onClick={() => setSelectedTenantForQuota(null)}
            >
              Cancel
            </NexaButton>
            <NexaButton size="sm" variant="primary" onClick={handleSaveQuota}>
              Apply Quota Update
            </NexaButton>
          </div>
        </div>
      </NexaModal>

      {/* Impersonation Modal */}
      <NexaModal
        isOpen={!!impersonationTenant}
        onClose={() => setImpersonationTenant(null)}
        title={`Impersonate Tenant: ${impersonationTenant?.name}`}
        subtitle="Launch a sandboxed operator session with full tenant owner privileges"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
            You are initiating an impersonated operator session for{" "}
            <strong>{impersonationTenant?.name}</strong> ({impersonationTenant?.domain}). All actions taken will be recorded in the security audit log under your SuperAdmin identity.
          </p>

          <div className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border border-[#C88A3A]/20 text-[#C88A3A] font-medium">
            Tenant owner: {impersonationTenant?.ownerName} ({impersonationTenant?.ownerEmail})
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton size="sm" variant="outline" onClick={() => setImpersonationTenant(null)}>
              Cancel
            </NexaButton>
            <Link href="/" target="_blank">
              <NexaButton
                size="sm"
                variant="primary"
                leftIcon={<LogIn className="w-4 h-4" />}
                onClick={() => setImpersonationTenant(null)}
              >
                Launch Workspace Session
              </NexaButton>
            </Link>
          </div>
        </div>
      </NexaModal>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="purple" dot>
                240 Active Workspaces
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Multi-Tenant Enterprise Directory
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Tenant Organizations
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Manage organization accounts, override subscription limits, and monitor usage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Provision New Workspace
            </NexaButton>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl liquid-glass border border-[var(--glass-border)]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--nexa-text-faint)]" />
            <input
              type="text"
              placeholder="Search organization, domain, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
            />
          </div>

          <div className="text-xs text-[var(--nexa-text-muted)] font-medium">
            Showing <strong>{filteredTenants.length}</strong> Tenant Workspaces
          </div>
        </div>

        {/* Organizations Table */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/60 text-[var(--nexa-text-muted)] uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-3">Plan Tier</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Monthly MRR</th>
                  <th className="py-3.5 px-3">Lead Quota</th>
                  <th className="py-3.5 px-3">Campaigns</th>
                  <th className="py-3.5 px-3">AI Spend</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--nexa-bg-base)]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--nexa-text-primary)]">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
                        {t.ownerName} · {t.domain}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <NexaBadge
                        variant={
                          t.planTier === "ENTERPRISE" || t.planTier === "GROWTH"
                            ? "brand"
                            : t.planTier === "SCALE"
                            ? "cyan"
                            : "neutral"
                        }
                      >
                        {t.planTier}
                      </NexaBadge>
                    </td>
                    <td className="py-3.5 px-3">
                      <NexaBadge
                        variant={
                          t.status === "Active"
                            ? "success"
                            : t.status === "Suspended"
                            ? "danger"
                            : "warning"
                        }
                        dot={t.status === "Active"}
                      >
                        {t.status}
                      </NexaBadge>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#0E9F6E]">
                      ${(t.mrr || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      {(t.leadsUsed || 0).toLocaleString()} / {(t.leadsLimit || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      {t.campaignsActive} / {t.campaignsLimit}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[var(--nexa-text-secondary)]">
                      ${t.monthlyAiSpendUSD.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setImpersonationTenant(t)}
                          className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] text-[var(--nexa-text-muted)] transition-colors cursor-pointer"
                          title="Impersonate Tenant"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedTenantForQuota(t)}
                          className="p-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-[#1A56DB]/10 hover:text-[#1A56DB] text-[var(--nexa-text-muted)] transition-colors cursor-pointer"
                          title="Override Quotas"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(t.id)}
                          className={`p-1.5 rounded-lg border border-[var(--nexa-border)] transition-colors cursor-pointer ${
                            t.status === "Suspended"
                              ? "bg-[#ECFDF5] text-[#0E9F6E]"
                              : "hover:bg-[#FEF2F2] hover:text-[#E02424] text-[var(--nexa-text-muted)]"
                          }`}
                          title={t.status === "Suspended" ? "Activate Tenant" : "Suspend Tenant"}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
