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
              <NexaBadge variant="purple" dot>
                15 Agent Heartbeats Active
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Autonomous Workforce Infrastructure
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              AI Swarm Health & Circuit Breakers
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {swarm.map((agent) => (
            <NexaCard
              key={agent.agentKey}
              variant="glass"
              padding="lg"
              className={`space-y-4 flex flex-col justify-between ${
                agent.circuitBreakerActive ? "border-l-4 border-l-[#E02424]" : "border-l-4 border-l-[#0E9F6E]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display">
                        {agent.name}
                      </h3>
                      <NexaBadge
                        variant={
                          agent.status === "Healthy"
                            ? "success"
                            : agent.status === "Paused"
                            ? "danger"
                            : "warning"
                        }
                        dot={agent.status === "Healthy"}
                      >
                        {agent.status}
                      </NexaBadge>
                    </div>
                    <div className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                      {agent.role} · {agent.category}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)]">
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">Throughput</div>
                    <div className="font-bold text-mono text-[var(--nexa-text-primary)] mt-0.5">
                      {agent.tasksPerMinute} t/min
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)]">
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">Avg Latency</div>
                    <div className="font-bold text-mono text-[var(--nexa-text-primary)] mt-0.5">
                      {agent.avgLatencyMs}ms
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)]">
                    <div className="text-[10px] text-[var(--nexa-text-muted)]">Error Rate</div>
                    <div className="font-bold text-mono text-[#0E9F6E] mt-0.5">
                      {agent.errorRatePct}%
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[var(--nexa-text-muted)] flex items-center justify-between pt-1">
                  <span>Primary Model: <strong className="text-[var(--nexa-text-primary)]">{agent.primaryModel}</strong></span>
                  <span className="font-mono">{(agent.totalExecutionsToday || 0).toLocaleString()} today</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--nexa-text-muted)]">
                  Tripwire: <strong className="text-[var(--nexa-text-secondary)]">Bounce &gt; 4%</strong>
                </span>

                <button
                  onClick={() => toggleCircuitBreaker(agent.agentKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    agent.circuitBreakerActive
                      ? "bg-[#0E9F6E] text-white hover:bg-[#0E9F6E]/90 shadow-sm"
                      : "bg-[#FEF2F2] text-[#E02424] dark:bg-[#EF4444]/15 dark:text-[#F87171] border border-[#E02424]/20 hover:bg-[#E02424] hover:text-white"
                  }`}
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
