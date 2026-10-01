"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { INITIAL_SWARM_HEALTH, AgentHealthMetric } from "@/lib/admin-data";
import {
  Activity,
  Power,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  RefreshCw,
  Sliders,
} from "lucide-react";

export default function AdminSwarmPage() {
  const [swarm, setSwarm] = useState<AgentHealthMetric[]>(INITIAL_SWARM_HEALTH);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleCircuitBreaker = (key: string) => {
    setSwarm((prev) =>
      prev.map((agent) => {
        if (agent.agentKey === key) {
          const nextActive = !agent.circuitBreakerActive;
          setToastMessage(
            nextActive
              ? `Circuit Breaker TRIPPED for ${agent.name}. Agent execution paused.`
              : `Circuit Breaker RESET for ${agent.name}. Agent resumed normal execution.`
          );
          setTimeout(() => setToastMessage(null), 3000);
          return {
            ...agent,
            circuitBreakerActive: nextActive,
            status: nextActive ? "Paused" : "Healthy",
          };
        }
        return agent;
      })
    );
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="brand" dot>
                15 Agent Heartbeats Active
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Autonomous Workforce Infrastructure
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              AI Agent Health & Circuit Breakers
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Real-time throughput, model inference latency, error rates, and granular safety circuit breakers per agent.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton size="sm" variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh Heartbeat
            </NexaButton>
          </div>
        </div>

        {toastMessage && (
          <div className="p-3 rounded-xl bg-[#FFFBEB] dark:bg-[#F59E0B]/20 text-[#C88A3A] dark:text-[#FBBF24] border border-[#C88A3A]/30 text-xs font-bold flex items-center gap-2 animate-bounce">
            <AlertTriangle className="w-4 h-4" /> {toastMessage}
          </div>
        )}

        {/* Swarm Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {swarm.map((agent) => (
            <NexaCard
              key={agent.agentKey}
              variant="glass"
              className={cn(
                "p-6 rounded-3xl border flex flex-col justify-between space-y-4 transition-all shadow-xs",
                agent.circuitBreakerActive
                  ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60"
                  : "border-nexa-border hover:border-nexa-brand/30 hover:bg-nexa-bg-surface"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0",
                        agent.circuitBreakerActive
                          ? "bg-red-500/10 text-red-500"
                          : "bg-nexa-brand/10 text-nexa-brand"
                      )}
                    >
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-display text-nexa-text-primary">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-nexa-text-faint font-medium mt-0.5">
                        {agent.role} · {agent.category}
                      </p>
                    </div>
                  </div>
                  <NexaBadge
                    variant={
                      agent.status === "Healthy"
                        ? "success"
                        : agent.status === "Paused"
                        ? "danger"
                        : "warning"
                    }
                    dot={agent.status === "Healthy"}
                    className="rounded-full text-[10px] font-bold"
                  >
                    {agent.status}
                  </NexaBadge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border">
                    <div className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">Throughput</div>
                    <div className="font-bold font-mono text-nexa-text-primary mt-0.5 text-xs">
                      {agent.tasksPerMinute} t/m
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border">
                    <div className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">Avg Latency</div>
                    <div className="font-bold font-mono text-nexa-text-primary mt-0.5 text-xs">
                      {agent.avgLatencyMs}ms
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-nexa-bg-base/70 border border-nexa-border">
                    <div className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">Error Rate</div>
                    <div
                      className={cn(
                        "font-bold font-mono mt-0.5 text-xs",
                        agent.errorRatePct > 2 ? "text-red-500" : "text-emerald-500"
                      )}
                    >
                      {agent.errorRatePct}%
                    </div>
                  </div>
                </div>

                <div className="text-xs text-nexa-text-faint flex items-center justify-between pt-1 font-mono">
                  <span>Model: <strong className="text-nexa-text-primary">{agent.primaryModel}</strong></span>
                  <span>{(agent.totalExecutionsToday || 0).toLocaleString()} runs</span>
                </div>
              </div>

              <div className="pt-3 border-t border-nexa-border flex items-center justify-between">
                <span className="text-[11px] text-nexa-text-faint font-medium">
                  Tripwire: <strong className="text-nexa-text-secondary">Bounce &gt; 4%</strong>
                </span>

                <button
                  onClick={() => toggleCircuitBreaker(agent.agentKey)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs",
                    agent.circuitBreakerActive
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                  )}
                >
                  <Power className="w-3.5 h-3.5" />
                  {agent.circuitBreakerActive ? "Reset Breaker" : "Trip Breaker"}
                </button>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
