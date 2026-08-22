"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { StrategyCanvasSkeleton } from "@/components/nexa/PageSkeleton";
import { GTM_API } from "@/lib/api-client";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Target,
  Users,
  AlertCircle,
  Zap,
  Radio,
  Gift,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface StrategyNode {
  id: string;
  step: string;
  category: "ICP" | "Persona" | "PainPoint" | "Positioning" | "Channel" | "Offer";
  title: string;
  subtitle: string;
  details: string[];
  metrics: string;
  icon: any;
}

const DEFAULT_NODES: StrategyNode[] = [
  {
    id: "node-1",
    step: "Step 1",
    category: "ICP",
    title: "K-12 Private Schools",
    subtitle: "Established private academies with 250+ students in Lagos & Abuja",
    details: [
      "Annual tuition above ₦500,000 / student",
      "Multiple branches or expanding campus infrastructure",
      "Currently using manual paper receipts and fragmented bank alerts",
    ],
    metrics: "Market Size: 4,200 Schools · $18M TAM",
    icon: Target,
  },
  {
    id: "node-2",
    step: "Step 2",
    category: "Persona",
    title: "School Proprietors & Bursars",
    subtitle: "Executive owners & heads of finance managing term collections",
    details: [
      "Values: Financial leakage prevention, parent prestige, zero payroll delays",
      "KPI: 100% tuition collection within 14 days of term commencement",
      "Channel Preference: WhatsApp Direct, Executive Email, Physical Conferences",
    ],
    metrics: "Decision Velocity: 14–21 Days",
    icon: Users,
  },
  {
    id: "node-3",
    step: "Step 3",
    category: "PainPoint",
    title: "Tuition Leakage & Reconciliation",
    subtitle: "Loss of 8–12% term revenue through manual teller falsification",
    details: [
      "Fake bank alert screenshots presented during registration",
      "3–4 days spent manually reconciling bank statements against spreadsheets",
      "Delayed staff salaries causing teacher churn",
    ],
    metrics: "Severity: Mission Critical",
    icon: AlertCircle,
  },
  {
    id: "node-4",
    step: "Step 4",
    category: "Positioning",
    title: "Autonomous Revenue Operating System",
    subtitle: "The all-in-one payment portal with zero reconciliation friction",
    details: [
      "Instant parent payment receipts via automated WhatsApp bot",
      "Virtual bank accounts dedicated per student with instant ledger clearance",
      "Real-time bursar dashboard tracking pending term balances",
    ],
    metrics: "Differentiation: High Moat",
    icon: Zap,
  },
  {
    id: "node-5",
    step: "Step 5",
    category: "Channel",
    title: "WhatsApp & Principal Cold Sequences",
    subtitle: "Two-stage conversational outreach by Noah Sterling & Amara Obi",
    details: [
      "Personalized cold email with school tuition calculator attached",
      "Follow-up WhatsApp note to proprietor mobile within 4 hours of email open",
      "Meta Ads retargeting decision makers on Instagram & LinkedIn",
    ],
    metrics: "Conversion Rate: 24.2%",
    icon: Radio,
  },
  {
    id: "node-6",
    step: "Step 6",
    category: "Offer",
    title: "Risk-Free Term Fee Audit & 30-Day Trial",
    subtitle: "Free reconciliation audit of last term's fee collections",
    details: [
      "Full setup in under 48 hours before school resumption",
      "Zero upfront setup fees — paid on successful payment clearance",
      "Free dedicated WhatsApp Parent Support Desk",
    ],
    metrics: "Acceptance Rate: 41%",
    icon: Gift,
  },
];

export default function StrategyPage() {
  const [nodes, setNodes] = useState<StrategyNode[]>(DEFAULT_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-1");
  const [isLoading, setIsLoading] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    async function loadStrategy() {
      try {
        const liveStrategy = await GTM_API.getStrategy("org-01");
        if (liveStrategy && liveStrategy.strategy_graph_json) {
          // Live strategy JSON loaded
        }
      } catch (err) {
        console.warn("Using default strategy graph:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStrategy();
  }, []);

  const activeNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <AppShell>
      {isLoading ? (
        <StrategyCanvasSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <NexaBadge variant="brand" dot>
                  Marcus Aurel (Strategist) Active
                </NexaBadge>
                <span className="text-xs text-[var(--nexa-text-muted)]">
                  Autonomous GTM Execution Graph
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
                GTM Strategy Canvas
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                Acyclic strategic blueprint connecting ICP discovery to outreach offers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NexaButton
                size="sm"
                variant="primary"
                onClick={() => {
                  setIsSynthesizing(true);
                  setTimeout(() => setIsSynthesizing(false), 2000);
                }}
                disabled={isSynthesizing}
                leftIcon={isSynthesizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              >
                {isSynthesizing ? "Synthesizing Graph..." : "Regenerate Strategy"}
              </NexaButton>
            </div>
          </div>

          {/* Strategic Node Chain */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {nodes.map((node, idx) => {
              const Icon = node.icon;
              const isSelected = selectedNodeId === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-md dark:bg-[#3B82F6]"
                      : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] hover:border-[#1A56DB]/40 text-[var(--nexa-text-primary)]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-white/80" : "text-[var(--nexa-text-muted)]"}`}>
                      {node.step}
                    </span>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold truncate ${isSelected ? "text-white" : "text-[var(--nexa-text-primary)]"}`}>
                      {node.title}
                    </div>
                    <div className={`text-[10px] truncate ${isSelected ? "text-white/70" : "text-[var(--nexa-text-muted)]"}`}>
                      {node.category}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep Node Inspector */}
          {activeNode && (
            <NexaCard variant="glass" padding="lg" className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--nexa-border)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#EBF5FF] dark:bg-[#3B82F6]/15 text-[#1A56DB]">
                    <activeNode.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <NexaBadge variant="brand">{activeNode.step}</NexaBadge>
                      <span className="text-xs font-bold text-[#1A56DB] dark:text-[#60A5FA]">
                        {activeNode.category}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-[var(--nexa-text-primary)] text-display mt-1">
                      {activeNode.title}
                    </h2>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] font-mono text-xs font-bold text-[#0E9F6E]">
                  {activeNode.metrics}
                </div>
              </div>

              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                {activeNode.subtitle}
              </p>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)]">
                  Core Tactical Execution Specs:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeNode.details.map((detail, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0E9F6E] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </NexaCard>
          )}
        </div>
      )}
    </AppShell>
  );
}
