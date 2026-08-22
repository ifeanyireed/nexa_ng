"use client";

import React from "react";
import {
  Activity,
  Bot,
  Flame,
  Mail,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";

export default function TenantUsagePage() {
  return (
    <BusinessShell
      title="Quota Utilization & Consumption Limits"
      subtitle="Track monthly lead allocations, daily cold email dispatch limits, and AI inference token quotas."
      action={
        <NexaBadge variant="green" className="py-1 px-3 text-xs font-mono font-bold">
          ● All Systems Under Quota
        </NexaBadge>
      }
    >
      <div className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#1A56DB]">
            <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Monthly Leads Quota</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">360 / 2,000</div>
            <div className="text-[11px] text-[#1A56DB] font-bold">18% Consumed (82% Free)</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#0E9F6E]">
            <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Daily Email Sends</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">320 / 500</div>
            <div className="text-[11px] text-[#0E9F6E] font-bold">64% Today's Quota</div>
          </NexaCard>

          <NexaCard variant="glass" padding="md" className="space-y-1.5 border-l-4 border-l-[#9061F9]">
            <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">AI Tokens Consumed</span>
            <div className="text-2xl font-black text-[var(--nexa-text-primary)]">1.24M Tokens</div>
            <div className="text-[11px] text-[#9061F9] font-mono">15 Agents Active</div>
          </NexaCard>
        </div>
      </div>
    </BusinessShell>
  );
}
