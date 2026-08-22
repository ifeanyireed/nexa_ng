"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { INITIAL_MODEL_METRICS, ModelGatewayMetric } from "@/lib/admin-data";
import {
  Cpu,
  DollarSign,
  TrendingDown,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function AdminObservabilityPage() {
  const totalModelSpend = INITIAL_MODEL_METRICS.reduce((sum, m) => sum + m.monthlySpendUSD, 0);

  const sampleTraces = [
    {
      id: "trace-9482",
      flow: "User Command → CRO (Sterling) → Gemini 1.5 Flash → Lead Extraction Tool → MySQL DB",
      latency: "380ms",
      cost: "₦2.70",
      tokens: "2,420",
      status: "SUCCESS",
      timestamp: "Just now",
    },
    {
      id: "trace-9481",
      flow: "Campaign Trigger → Copywriter (Julian) → GPT-4o → WhatsApp Template Formatter",
      latency: "840ms",
      cost: "₦12.60",
      tokens: "4,850",
      status: "SUCCESS",
      timestamp: "1m ago",
    },
    {
      id: "trace-9480",
      flow: "Strategy Canvas Update → GTM Strategist (Marcus) → Claude 3.5 Sonnet → Strategy Map Node DB",
      latency: "1,150ms",
      cost: "₦36.00",
      tokens: "8,920",
      status: "SUCCESS",
      timestamp: "4m ago",
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
                Model Gateway Routing
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Dynamic Provider Allocation & Cost Audit
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Observability & Model Gateway
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Track token consumption, prompt cache hit rates, and distributed multi-agent execution traces.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#ECFDF5] dark:bg-[#10B981]/15 text-[#0E9F6E] border border-[#0E9F6E]/20 text-xs font-bold flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> 42% Cost Saved via Prompt Caching
          </div>
        </div>

        {/* Model Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_MODEL_METRICS.map((model) => (
            <NexaCard key={model.modelName} variant="glass" padding="lg" className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <NexaBadge
                    variant={
                      model.provider === "Anthropic"
                        ? "purple"
                        : model.provider === "Google"
                        ? "brand"
                        : model.provider === "OpenAI"
                        ? "success"
                        : "cyan"
                    }
                  >
                    {model.provider}
                  </NexaBadge>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] mt-1">
                    {model.modelName}
                  </h3>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center justify-between text-mono">
                  <span className="text-[var(--nexa-text-muted)]">Monthly Spend:</span>
                  <span className="font-bold text-[#0E9F6E]">₦{Math.round(model.monthlySpendUSD * 1500).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-mono">
                  <span className="text-[var(--nexa-text-muted)]">Tokens Used:</span>
                  <span>{(model.promptTokensMillion + model.completionTokensMillion).toFixed(1)}M</span>
                </div>
                <div className="flex items-center justify-between text-mono">
                  <span className="text-[var(--nexa-text-muted)]">Cache Hit Rate:</span>
                  <span className="font-bold text-[#1A56DB] dark:text-[#60A5FA]">{model.cacheHitRatePct}%</span>
                </div>
                <div className="flex items-center justify-between text-mono">
                  <span className="text-[var(--nexa-text-muted)]">Avg Latency:</span>
                  <span>{model.avgLatencyMs}ms</span>
                </div>
              </div>

              <p className="text-[11px] text-[var(--nexa-text-muted)] pt-2 border-t border-[var(--nexa-border)] leading-tight">
                {model.primaryUseCases}
              </p>
            </NexaCard>
          ))}
        </div>

        {/* Distributed Execution Traces */}
        <NexaCard variant="glass" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1A56DB]" />
                Distributed Trace Logs
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                End-to-end request tracing: User Request → Agent → Task → Model → Tool → DB
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {sampleTraces.map((trace) => (
              <div
                key={trace.id}
                className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--nexa-text-primary)]">
                      {trace.id}
                    </span>
                    <NexaBadge variant="success" dot>
                      {trace.status}
                    </NexaBadge>
                    <span className="text-[10px] text-[var(--nexa-text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {trace.timestamp}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[var(--nexa-text-secondary)] font-mono truncate">
                    {trace.flow}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                  <span>Latency: <strong className="text-[var(--nexa-text-primary)]">{trace.latency}</strong></span>
                  <span>Tokens: <strong className="text-[var(--nexa-text-primary)]">{trace.tokens}</strong></span>
                  <span className="font-bold text-[#0E9F6E]">{trace.cost}</span>
                  <NexaButton size="sm" variant="ghost">
                    Inspect Trace
                  </NexaButton>
                </div>
              </div>
            ))}
          </div>
        </NexaCard>
      </div>
    </AdminShell>
  );
}
