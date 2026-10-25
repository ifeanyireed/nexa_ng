"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { CardsGridSkeleton } from "@/components/nexa/PageSkeleton";
import { Campaign } from "@/lib/gtm-data";
import { crmFetch } from "@/lib/crm-client";
import {
  Megaphone,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Mail,
  MessageSquare,
  DollarSign,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const stages = ["All", "Active", "Approval", "Planning", "Completed"];

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await crmFetch("/api/erp/crm/campaigns");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.campaigns)) {
            const mapped: Campaign[] = data.campaigns.map((c: any) => ({
              id: c.id,
              name: c.name,
              targetAudience: c.target_audience || c.targetAudience || "Target Accounts",
              status: (c.status === "ACTIVE" || c.status === "Active"
                ? "Active"
                : c.status === "APPROVAL" || c.status === "Approval"
                ? "Approval"
                : c.status === "COMPLETED" || c.status === "Completed"
                ? "Completed"
                : "Planning") as any,
              channels: Array.isArray(c.channels)
                ? c.channels
                : c.channels_json
                ? JSON.parse(c.channels_json)
                : ["Voicebip Phone", "WhatsApp Follow-up"],
              prospectsCount: Number(c.prospects_count || c.prospectsCount || 0),
              sentCount: Number(c.sent_count || c.sentCount || 0),
              replyRate: Number(c.replyRate || (c.sent_count ? Math.round((Number(c.replies_count) / Number(c.sent_count)) * 100) : 0)),
              meetingsBooked: Number(c.meetings_count || c.meetingsBooked || 0),
              revenuePipeline: Number(c.pipeline_value || c.revenuePipeline || 0),
              createdAt: c.createdAt || c.created_at || new Date().toISOString(),
              startDate: c.startDate || c.start_date || new Date().toISOString().slice(0, 10),
              strategySummary: c.strategySummary || c.strategy_summary || c.goal || "Targeted qualification outreach",
              conversionFunnel: c.conversionFunnel || [
                { stage: "Scanned", count: Number(c.prospects_count) || 0, pct: 100 },
                { stage: "Sent", count: Number(c.sent_count) || 0, pct: 0 },
                { stage: "Replied", count: Number(c.replies_count) || 0, pct: 0 },
                { stage: "Meeting", count: Number(c.meetings_count) || 0, pct: 0 },
              ],
            }));
            setCampaigns(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch campaigns from CRM database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  const filteredCampaigns =
    activeTab === "All"
      ? campaigns
      : campaigns.filter((c) => c.status === activeTab);

  return (
    <AppShell>
      {isLoading ? (
        <CardsGridSkeleton count={4} />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <NexaBadge variant="brand" dot>
                  Campaign Command Center
                </NexaBadge>
                <span className="text-xs text-[var(--nexa-text-muted)]">
                  Autonomous Revenue Engines
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
                Voice Outreach Campaigns
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                Automated phone qualification batches targeted at verified B2B decision makers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/erp/admin/ai/campaigns/new">
                <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Launch Voice Campaign
                </NexaButton>
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2 overflow-x-auto scrollbar-hide">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveTab(stage)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === stage
                    ? "bg-[#1A56DB] text-white shadow-sm dark:bg-[#3B82F6]"
                    : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-brand-light)] hover:text-[#1A56DB] dark:hover:bg-white/5"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>

          {/* Campaigns Grid or Empty State */}
          {filteredCampaigns.length === 0 ? (
            <NexaCard className="p-12 text-center">
              <Megaphone className="w-10 h-10 text-[var(--nexa-text-muted)] mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)]">
                No Campaigns Found
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)] max-w-sm mx-auto mt-1 mb-4">
                Launch your first autonomous outbound voice campaign to begin qualifying B2B prospects at scale.
              </p>
              <Link href="/erp/admin/ai/campaigns/new">
                <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Create First Campaign
                </NexaButton>
              </Link>
            </NexaCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredCampaigns.map((camp) => (
              <NexaCard key={camp.id} variant="glass" padding="lg" className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <NexaBadge
                        variant={
                          camp.status === "Active"
                            ? "success"
                            : camp.status === "Approval"
                            ? "warning"
                            : camp.status === "Completed"
                            ? "neutral"
                            : "brand"
                        }
                        dot={camp.status === "Active"}
                      >
                        {camp.status}
                      </NexaBadge>
                      <span className="text-[11px] text-[var(--nexa-text-muted)]">
                        Target: {camp.targetAudience}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display">
                      {camp.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {camp.channels.map((ch) => (
                      <span
                        key={ch}
                        className="px-2 py-0.5 rounded-md bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[10px] font-bold text-[var(--nexa-text-secondary)]"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Funnel Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">Prospects</div>
                    <div className="text-xs font-bold text-mono text-[var(--nexa-text-primary)] mt-0.5">
                      {camp.prospectsCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">Sent</div>
                    <div className="text-xs font-bold text-mono text-[#1A56DB] mt-0.5">
                      {camp.sentCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">Reply Rate</div>
                    <div className="text-xs font-bold text-mono text-[#0E9F6E] mt-0.5">
                      {camp.replyRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">Pipeline</div>
                    <div className="text-xs font-bold text-mono text-[#7E22CE] mt-0.5">
                      ₦{(camp.revenuePipeline >= 1000000 ? (camp.revenuePipeline / 1000000).toFixed(1) + "M" : (camp.revenuePipeline / 1000).toFixed(0) + "k")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-xs">
                  <span className="text-[var(--nexa-text-muted)] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Started {camp.startDate}
                  </span>
                  <NexaButton size="sm" variant="ghost" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    View Analytics
                  </NexaButton>
                </div>
              </NexaCard>
            ))}
          </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
