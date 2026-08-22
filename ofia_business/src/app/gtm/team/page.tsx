"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { AgentDrawer } from "@/components/gtm/AgentDrawer";
import { CardsGridSkeleton } from "@/components/nexa/PageSkeleton";
import { INITIAL_AGENTS, AIAgent } from "@/lib/gtm-data";
import { GTM_API } from "@/lib/api-client";
import { Search, Sparkles, ArrowUpRight, Zap, RefreshCw } from "lucide-react";

export default function TeamPage() {
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const categories = ["All", "Executive", "Intelligence", "Strategy", "Content", "Outreach", "Advisory"];

  useEffect(() => {
    async function loadAgents() {
      try {
        const liveData = await GTM_API.getAgents("org-01");
        if (Array.isArray(liveData) && liveData.length > 0) {
          // Map backend agent models with frontend visual properties
          const merged = INITIAL_AGENTS.map((init) => {
            const match = liveData.find((a: any) => a.key === init.id || a.id === init.id);
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
      } catch (err) {
        console.warn("Using cached workforce data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAgents();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const matchesCat = filterCategory === "All" || agent.category === filterCategory;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.currentTask.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <AppShell>
      <AgentDrawer
        agent={selectedAgent}
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />

      {isLoading ? (
        <CardsGridSkeleton count={6} />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <NexaBadge variant="brand" dot>
                  15 Autonomous Specialists Live
                </NexaBadge>
                <span className="text-xs text-[var(--nexa-text-muted)]">
                  Autonomous Workforce Organization
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
                AI Revenue Organization
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                Each AI employee is an autonomous specialist operating under executive CRO supervision.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <NexaButton
                size="sm"
                variant="primary"
                onClick={() => setSelectedAgent(agents[0])}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Brief CRO
              </NexaButton>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl liquid-glass border border-[var(--glass-border)]">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    filterCategory === cat
                      ? "bg-[#1A56DB] text-white shadow-sm dark:bg-[#3B82F6]"
                      : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-brand-light)] hover:text-[#1A56DB] dark:hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--nexa-text-faint)]" />
              <input
                type="text"
                placeholder="Find agent or task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
              />
            </div>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAgents.map((agent) => (
              <NexaCard
                key={agent.id}
                variant="interactive"
                padding="lg"
                onClick={() => setSelectedAgent(agent)}
                className="space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Agent Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <NexaAvatar
                        name={agent.name}
                        src={agent.avatar}
                        size="lg"
                        status={agent.status}
                      />
                      <div>
                        <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display">
                          {agent.name}
                        </h3>
                        <p className="text-xs font-medium text-[var(--nexa-text-muted)]">
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    <NexaBadge
                      variant={
                        agent.category === "Executive"
                          ? "purple"
                          : agent.category === "Intelligence"
                          ? "cyan"
                          : agent.category === "Outreach"
                          ? "success"
                          : "brand"
                      }
                    >
                      {agent.category}
                    </NexaBadge>
                  </div>

                  {/* Current Active Task */}
                  <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[var(--nexa-text-muted)]">
                      <span className="font-bold text-[#1A56DB] dark:text-[#60A5FA] flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Current Task
                      </span>
                      <span className="text-mono font-bold">{agent.taskProgress}%</span>
                    </div>
                    <p className="text-xs text-[var(--nexa-text-secondary)] line-clamp-2">
                      {agent.currentTask}
                    </p>
                    <div className="w-full bg-[var(--nexa-border)] h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#1A56DB] to-[#0E9F6E] h-full rounded-full"
                        style={{ width: `${agent.taskProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Chips */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    {agent.todayStats.map((stat, i) => (
                      <div key={i} className="p-2 rounded-lg bg-[var(--nexa-bg-base)]/60 border border-[var(--nexa-border)]/40">
                        <div className="text-[10px] text-[var(--nexa-text-muted)] truncate">
                          {stat.label}
                        </div>
                        <div className="text-xs font-bold text-[var(--nexa-text-primary)] text-mono mt-0.5">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--nexa-text-muted)]">
                    Confidence: <span className="font-bold text-mono text-[var(--nexa-text-primary)]">{agent.confidence}%</span>
                  </span>
                  <NexaButton
                    size="sm"
                    variant="ghost"
                    rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  >
                    Open Workstation
                  </NexaButton>
                </div>
              </NexaCard>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
