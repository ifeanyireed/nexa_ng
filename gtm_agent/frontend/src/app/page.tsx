"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Users,
  Target,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  ChevronRight,
  Zap,
  MessageSquare,
  DollarSign,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { AgentDrawer } from "@/components/gtm/AgentDrawer";
import { DashboardSkeleton } from "@/components/nexa/PageSkeleton";
import {
  INITIAL_AGENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_APPROVALS,
  DAILY_BRIEFING_CONTENT,
  AIAgent,
} from "@/lib/gtm-data";
import { GTM_API } from "@/lib/api-client";
import { useEffect } from "react";

export default function ExecutiveHome() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [campaigns, setCampaigns] = useState<any[]>(INITIAL_CAMPAIGNS);
  const [approvals, setApprovals] = useState<any[]>(INITIAL_APPROVALS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [liveAgents, liveCampaigns, liveApprovals] = await Promise.allSettled([
          GTM_API.getAgents("org-01"),
          GTM_API.getCampaigns("org-01"),
          GTM_API.getApprovals("org-01"),
        ]);

        if (liveAgents.status === "fulfilled" && Array.isArray(liveAgents.value) && liveAgents.value.length > 0) {
          const merged = INITIAL_AGENTS.map((init) => {
            const match = liveAgents.value.find((a: any) => a.key === init.id || a.id === init.id);
            if (match) {
              return {
                ...init,
                name: match.name || init.name,
                role: match.role || init.role,
                status: (match.status ? match.status.toLowerCase() : init.status) as any,
                currentTask: match.current_task || init.currentTask,
                taskProgress: match.task_progress || init.taskProgress,
                confidence: match.confidence_score ? Math.round(match.confidence_score) : init.confidence,
                recommendation: match.recommendation || init.recommendation,
              };
            }
            return init;
          });
          setAgents(merged);
        }

        if (liveCampaigns.status === "fulfilled" && Array.isArray(liveCampaigns.value) && liveCampaigns.value.length > 0) {
          setCampaigns(liveCampaigns.value);
        }

        if (liveApprovals.status === "fulfilled" && Array.isArray(liveApprovals.value) && liveApprovals.value.length > 0) {
          setApprovals(liveApprovals.value);
        }
      } catch (err) {
        console.warn("Dashboard loaded cached state:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <AppShell>
      <AgentDrawer
        agent={selectedAgent}
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-7">
        {/* Top Header / Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="brand" dot>
                Live Revenue Swarm
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)] font-medium">
                Workspace: EduTech Nigeria · Q3 2026 Plan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Executive Revenue Command
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/campaigns/new">
              <NexaButton
                size="md"
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Deploy Campaign
              </NexaButton>
            </Link>
            <Link href="/approvals">
              <NexaButton
                size="md"
                variant="secondary"
                leftIcon={<CheckCircle2 className="w-4 h-4 text-[#C88A3A]" />}
              >
                Review 3 Approvals
              </NexaButton>
            </Link>
          </div>
        </div>

        {/* Daily Executive Morning Briefing */}
        <NexaCard
          variant="glass"
          padding="lg"
          className="border-l-4 border-l-[#1A56DB] bg-gradient-to-r from-[var(--nexa-bg-surface)] to-[var(--nexa-brand-light)]/20 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#1A56DB] flex items-center justify-center text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A56DB] dark:text-[#60A5FA]">
                  Daily Briefing from Sterling Vance (CRO)
                </h3>
              </div>

              <div className="text-lg sm:text-xl font-bold text-[var(--nexa-text-primary)] text-display">
                "{DAILY_BRIEFING_CONTENT.headline}"
              </div>

              <p className="text-sm text-[var(--nexa-text-secondary)] leading-relaxed max-w-3xl">
                {DAILY_BRIEFING_CONTENT.body}
              </p>

              {/* High-value Recommendation Banner */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#ECFDF5] dark:bg-[#10B981]/10 border border-[#0E9F6E]/20 flex items-start gap-3">
                <div className="p-1 rounded-lg bg-[#0E9F6E] text-white shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#0E9F6E] dark:text-[#34D399]">
                    Recommended Action:
                  </div>
                  <p className="text-xs text-[var(--nexa-text-secondary)] mt-0.5">
                    {DAILY_BRIEFING_CONTENT.keyRecommendation}
                  </p>
                </div>
                <NexaButton size="sm" variant="success">
                  Execute Shift
                </NexaButton>
              </div>
            </div>

            {/* Audio Read-Aloud Player */}
            <div className="shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl liquid-glass border border-[var(--glass-border)] bg-[var(--nexa-bg-surface)]/80 self-start md:self-center">
              <button
                onClick={toggleAudio}
                className="w-12 h-12 rounded-full bg-[#1A56DB] dark:bg-[#3B82F6] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isPlayingAudio ? "Pause Audio Briefing" : "Listen to Audio Briefing"}
              >
                {isPlayingAudio ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <span className="text-[11px] font-bold text-[var(--nexa-text-muted)] mt-2">
                {isPlayingAudio ? "Streaming Audio..." : "Listen (1:45)"}
              </span>
              {isPlayingAudio && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1 h-3 bg-[#1A56DB] rounded-full animate-bounce" />
                  <span className="w-1 h-5 bg-[#1A56DB] rounded-full animate-bounce delay-75" />
                  <span className="w-1 h-2 bg-[#1A56DB] rounded-full animate-bounce delay-150" />
                </div>
              )}
            </div>
          </div>
        </NexaCard>

        {/* Executive Pulse Metrics (Yesterday vs. Today) */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Yesterday vs. Today Operations
            </h2>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-[#1A56DB] dark:text-[#60A5FA] hover:underline flex items-center gap-1"
            >
              Full Analytics Matrix <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <NexaCard variant="flat" padding="md" className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                <span>Leads Researched</span>
                <Users className="w-4 h-4 text-[#1A56DB]" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-mono">
                1,240
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#0E9F6E] font-semibold">+186 Qualified</span>
                <span className="text-[var(--nexa-text-faint)]">Goal: 1,000</span>
              </div>
            </NexaCard>

            {/* Metric 2 */}
            <NexaCard variant="flat" padding="md" className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                <span>Touchpoints Sent</span>
                <Mail className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-mono">
                342
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#0E9F6E] font-semibold">64.8% Open Rate</span>
                <span className="text-[var(--nexa-text-faint)]">58 Queued</span>
              </div>
            </NexaCard>

            {/* Metric 3 */}
            <NexaCard variant="flat" padding="md" className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                <span>Engaged Replies</span>
                <MessageSquare className="w-4 h-4 text-[#0E9F6E]" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-mono">
                14
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#0E9F6E] font-semibold">14.8% Reply Rate</span>
                <span className="text-[var(--nexa-text-faint)]">+2.4x vs avg</span>
              </div>
            </NexaCard>

            {/* Metric 4 */}
            <NexaCard variant="flat" padding="md" className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
                <span>Booked Enterprise Demos</span>
                <Calendar className="w-4 h-4 text-[#C88A3A]" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-mono">
                4 <span className="text-sm font-normal text-[var(--nexa-text-muted)]">($28k pipe)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#0E9F6E] font-semibold">100% Qualified</span>
                <span className="text-[var(--nexa-text-faint)]">Today: 6 calls</span>
              </div>
            </NexaCard>
          </div>
        </div>

        {/* Live AI Workforce Floor */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--nexa-text-primary)] text-display">
                AI Revenue Workforce Floor
              </h2>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Click on any AI specialist to inspect live reasoning, review deliverables, or chat directly.
              </p>
            </div>
            <Link
              href="/team"
              className="text-xs font-semibold text-[#1A56DB] dark:text-[#60A5FA] hover:underline flex items-center gap-1"
            >
              View All 15 Agents <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {agents.slice(0, 6).map((agent) => (
              <NexaCard
                key={agent.id}
                variant="interactive"
                padding="md"
                onClick={() => setSelectedAgent(agent)}
                className="space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <NexaAvatar
                      name={agent.name}
                      src={agent.avatar}
                      size="md"
                      status={agent.status}
                    />
                    <div>
                      <div className="font-bold text-sm text-[var(--nexa-text-primary)]">
                        {agent.name}
                      </div>
                      <div className="text-xs text-[var(--nexa-text-muted)]">
                        {agent.role}
                      </div>
                    </div>
                  </div>
                  <NexaBadge
                    variant={agent.status === "working" ? "brand" : "success"}
                    dot
                  >
                    {agent.status === "working" ? "Working" : "Active"}
                  </NexaBadge>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)]">
                    <span className="font-medium truncate pr-2">
                      {agent.currentTask}
                    </span>
                    <span className="text-mono font-bold shrink-0">
                      {agent.taskProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--nexa-border)] h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1A56DB] dark:bg-[#3B82F6] h-full rounded-full"
                      style={{ width: `${agent.taskProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[var(--nexa-text-muted)]">
                    Confidence: <span className="font-bold text-[var(--nexa-text-primary)] text-mono">{agent.confidence}%</span>
                  </span>
                  <span className="text-[#1A56DB] dark:text-[#60A5FA] font-bold flex items-center gap-1 group-hover:underline">
                    Workstation <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </NexaCard>
            ))}
          </div>
        </div>

        {/* Active Campaigns & Pending Approvals Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Campaigns Overview */}
          <NexaCard variant="glass" padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] text-display">
                  Active Multi-Channel Campaigns
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Live revenue engines operating across connected channels
                </p>
              </div>
              <Link href="/campaigns">
                <NexaButton size="sm" variant="ghost">
                  All Campaigns
                </NexaButton>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-3.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:border-[#1A56DB]/40 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[var(--nexa-text-primary)]">
                        {camp.name}
                      </div>
                      <div className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                        {camp.targetAudience}
                      </div>
                    </div>
                    <NexaBadge
                      variant={camp.status === "Active" ? "success" : "warning"}
                    >
                      {camp.status}
                    </NexaBadge>
                  </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--nexa-border)]/50">
                    <div className="flex items-center gap-2">
                      {camp.channels && camp.channels.map((ch: string) => (
                        <span
                          key={ch}
                          className="px-2 py-0.5 rounded-md bg-[var(--nexa-bg-base)] text-[10px] font-semibold text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                    <div className="text-mono font-bold text-[#0E9F6E]">
                      ${camp.revenuePipeline.toLocaleString()} Pipe
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>

          {/* Pending Approvals Quick Hub */}
          <NexaCard variant="glass" padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                  <span>Approval Center</span>
                  <NexaBadge variant="warning" dot>
                    3 Pending
                  </NexaBadge>
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Actions requiring executive authorization before execution
                </p>
              </div>
              <Link href="/approvals">
                <NexaButton size="sm" variant="ghost">
                  Open Center
                </NexaButton>
              </Link>
            </div>

            <div className="space-y-3">
              {approvals.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-[var(--nexa-text-primary)]">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                        Created by {item.creatorAgent} · {item.targetChannel}
                      </div>
                    </div>
                    <NexaBadge
                      variant={item.riskLevel === "High" ? "danger" : item.riskLevel === "Medium" ? "warning" : "brand"}
                    >
                      {item.riskLevel} Risk
                    </NexaBadge>
                  </div>

                  <p className="text-xs text-[var(--nexa-text-secondary)] line-clamp-2">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--nexa-border)]/50">
                    <Link href="/approvals">
                      <NexaButton size="sm" variant="outline">
                        Inspect Diff
                      </NexaButton>
                    </Link>
                    <NexaButton size="sm" variant="primary">
                      Approve
                    </NexaButton>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>
        </div>
      </div>
      )}
    </AppShell>
  );
}
