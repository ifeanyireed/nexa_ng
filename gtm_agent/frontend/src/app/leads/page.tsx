"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { TableSkeleton } from "@/components/nexa/PageSkeleton";
import { INITIAL_LEADS, Lead } from "@/lib/gtm-data";
import { GTM_API } from "@/lib/api-client";
import {
  Target,
  Search,
  Plus,
  ArrowUpRight,
  Mail,
  Building2,
  MapPin,
  Sparkles,
  CheckCircle2,
  Flame,
  Globe,
  RefreshCw,
} from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);

  useEffect(() => {
    async function loadLeads() {
      try {
        const liveLeads = await GTM_API.getLeads("org-01");
        if (Array.isArray(liveLeads) && liveLeads.length > 0) {
          const mapped: Lead[] = liveLeads.map((l: any) => ({
            id: l.id,
            companyName: l.company_name || l.companyName,
            website: l.website || "https://example.com",
            industry: l.industry || "Education & Technology",
            location: l.location || "Lagos, Nigeria",
            contactName: l.contact_name || l.contactName,
            contactTitle: l.contact_title || l.contactTitle || "Decision Maker",
            contactEmail: l.contact_email || l.contactEmail,
            contactPhone: l.contact_phone || l.contactPhone,
            icpFitScore: l.icp_fit_score || l.icpFitScore || 90,
            buyingSignals: l.buying_signals_json ? JSON.parse(l.buying_signals_json) : (l.buyingSignals || ["Expanding campus operations"]),
            status: (l.status || "Identified") as any,
            assignedAgent: l.assigned_agent_key || "Olivia Chen",
            lastActivity: l.last_activity || "Qualified 15m ago",
          }));
          setLeads(mapped);
        }
      } catch (err) {
        console.warn("Using cached leads data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLeads();
  }, []);

  const handleExtractMore = async () => {
    setIsExtracting(true);
    try {
      await GTM_API.extractLeads("org-01", {
        query: "Private K-12 Academies & High Schools",
        location: "Lagos & Abuja",
        target_size: 25,
      });
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 3500);
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    return (
      lead.companyName.toLowerCase().includes(q) ||
      lead.contactName.toLowerCase().includes(q) ||
      lead.location.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell>
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <NexaBadge variant="cyan" dot>
                  Olivia Chen (Lead Hunter) Active
                </NexaBadge>
                <span className="text-xs text-[var(--nexa-text-muted)]">
                  Autonomous Prospect Extraction & Scoring
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
                Lead Intelligence & CRM Pipeline
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                1,240 organizations scanned · {leads.length} verified decision makers qualified in workspace.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <NexaButton
                size="sm"
                variant="primary"
                onClick={handleExtractMore}
                disabled={isExtracting}
                leftIcon={isExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              >
                {isExtracting ? "Hunter Extracting..." : "Extract New Leads"}
              </NexaButton>
            </div>
          </div>

          {extractSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#ECFDF5] text-[#0E9F6E] dark:bg-[#10B981]/20 dark:text-[#34D399] border border-[#0E9F6E]/30 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Olivia Chen synthesized and queued 25 new verified leads!
            </div>
          )}

          {/* Search Bar */}
          <div className="p-3 rounded-2xl liquid-glass border border-[var(--glass-border)] flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--nexa-text-faint)]" />
              <input
                type="text"
                placeholder="Search by school, contact name, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
              />
            </div>
            <NexaBadge variant="brand">{filteredLeads.length} Prospects</NexaBadge>
          </div>

          {/* Leads Table */}
          <NexaCard variant="glass" padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] uppercase tracking-wider text-[10px] border-b border-[var(--nexa-border)] font-bold">
                  <tr>
                    <th className="p-4">Target Organization</th>
                    <th className="p-4">Decision Maker</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">ICP Score</th>
                    <th className="p-4">Buying Signals</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)]">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-[var(--nexa-bg-surface)] transition-colors group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="p-4">
                        <div className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#1A56DB]" />
                          {lead.companyName}
                        </div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3" />
                          {lead.website}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-[var(--nexa-text-primary)]">
                          {lead.contactName}
                        </div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)]">
                          {lead.contactTitle}
                        </div>
                      </td>

                      <td className="p-4 text-[var(--nexa-text-secondary)]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[var(--nexa-text-faint)]" />
                          {lead.location}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-mono font-bold text-sm text-[#0E9F6E] flex items-center gap-1">
                          <Flame className="w-4 h-4 text-[#FF5A1F]" />
                          {lead.icpFitScore}%
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {lead.buyingSignals.map((signal, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[10px] text-[var(--nexa-text-secondary)]"
                            >
                              {signal}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <NexaBadge
                          variant={
                            lead.status === "Meeting Booked"
                              ? "success"
                              : lead.status === "Replied"
                              ? "cyan"
                              : lead.status === "Contacted"
                              ? "brand"
                              : "neutral"
                          }
                        >
                          {lead.status}
                        </NexaBadge>
                      </td>

                      <td className="p-4 text-right">
                        <NexaButton size="sm" variant="outline" rightIcon={<ArrowUpRight className="w-3 h-3" />}>
                          Engage
                        </NexaButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NexaCard>
        </div>
      )}
    </AppShell>
  );
}
