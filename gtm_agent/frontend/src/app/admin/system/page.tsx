"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { INITIAL_SYSTEM_QUEUES, SystemQueueMetric } from "@/lib/admin-data";
import {
  Server,
  Database,
  Mail,
  MessageSquare,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function AdminSystemPage() {
  const channelIntegrations = [
    {
      name: "Meta WhatsApp Cloud API (WABA)",
      metric: "Quality Tier: HIGH (Green)",
      status: "Optimal",
      details: "Rate Limit: Tier 3 (100k messages / 24h) · Response latency: 85ms",
    },
    {
      name: "SMTP / Resend Outreach Pipes",
      metric: "Deliverability: 98.8%",
      status: "Optimal",
      details: "IP Warmup Score: 99/100 · 0 blacklists reported across 24 sending domains",
    },
    {
      name: "LinkedIn Marketing & Messaging API",
      metric: "Quota Used: 34%",
      status: "Optimal",
      details: "OAuth tokens valid · Rate limits reset at 00:00 UTC",
    },
    {
      name: "Meta Ads Marketing Gateway",
      metric: "Sync Status: 100%",
      status: "Optimal",
      details: "Budget updates syncing with &lt; 2s latency",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="brand" dot>
                Infrastructure Telemetry
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Shared Database: <strong className="text-mono">u721451974_nexa_db</strong>
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              System Health & Worker Queues
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Third-party channel quality ratings, Redis worker queue depths, and MySQL connection pools.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton size="sm" variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
              Run System Diagnostics
            </NexaButton>
          </div>
        </div>

        {/* Third-Party Channel Health */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)]">
            Channel Provider Health Ratings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channelIntegrations.map((ch, idx) => (
              <NexaCard key={idx} variant="glass" padding="lg" className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                      {ch.name}
                    </h3>
                    <div className="text-xs font-semibold text-[#0E9F6E] mt-0.5">
                      {ch.metric}
                    </div>
                  </div>
                  <NexaBadge variant="success" dot>
                    {ch.status}
                  </NexaBadge>
                </div>

                <p className="text-xs text-[var(--nexa-text-secondary)] font-mono p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  {ch.details}
                </p>
              </NexaCard>
            ))}
          </div>
        </div>

        {/* Worker Queue Depths */}
        <NexaCard variant="glass" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                <Server className="w-4 h-4 text-[#1A56DB]" />
                Background Worker Queues (Redis / BullMQ)
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Active job processing rates, depth, and retry queues
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INITIAL_SYSTEM_QUEUES.map((q) => (
              <div
                key={q.queueName}
                className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--nexa-text-primary)] truncate">
                    {q.queueName}
                  </span>
                  <NexaBadge variant="success">{q.status}</NexaBadge>
                </div>

                <div className="space-y-1 text-xs text-mono pt-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Queue Depth:</span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">{q.depth} jobs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Rate:</span>
                    <span className="text-[#0E9F6E]">{q.processingRatePerSec} / sec</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Errors:</span>
                    <span>{q.errorCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NexaCard>
      </div>
    </AdminShell>
  );
}
