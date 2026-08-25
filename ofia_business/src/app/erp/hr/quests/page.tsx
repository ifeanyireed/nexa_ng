"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  Trophy,
  Flame,
  Plus,
  Users,
  Target,
  Calendar,
  Sparkles,
  Play,
  CheckCircle2,
  Tv,
  ArrowUpRight,
  Clock,
  Layers,
  Award,
  Swords,
  Edit3,
} from "lucide-react";

interface QuestCardData {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: "ACTIVE" | "UPCOMING" | "COMPLETED" | "DRAFT";
  participantsCount: number;
  teamsCount: number;
  challengesCount: number;
  startsAt: string;
  endsAt: string;
  location: string;
  coverImage: string;
  topTeam?: { name: string; points: number };
}

const DEMO_QUESTS: QuestCardData[] = [
  {
    id: "qst-retreat-2026",
    slug: "2026-staff-retreat",
    name: "2026 Annual Staff Retreat & Innovation Games",
    description: "Company-wide executive retreat featuring innovation hackathon sprints, trivia wars, and outdoor agility challenges.",
    status: "ACTIVE",
    participantsCount: 120,
    teamsCount: 8,
    challengesCount: 14,
    startsAt: "Aug 22, 2026",
    endsAt: "Aug 25, 2026",
    location: "Epe Resort & Spa, Lagos",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    topTeam: { name: "Team Alpha (Blue Eagles)", points: 840 },
  },
  {
    id: "qst-q3-sales-blitz",
    slug: "q3-sales-sprint",
    name: "Q3 Revenue Blitz & Deal Acceleration Quest",
    description: "Enterprise sales rep competition for fastest pipeline velocity, demo completions, and closed-won ARR.",
    status: "UPCOMING",
    participantsCount: 24,
    teamsCount: 4,
    challengesCount: 6,
    startsAt: "Sep 01, 2026",
    endsAt: "Sep 30, 2026",
    location: "Hybrid / All Hubs",
    coverImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "qst-onboarding-july",
    slug: "q2-onboarding-challenge",
    name: "Q2 Engineering & Product Onboarding Sprint",
    description: "Gamified onboarding challenges testing architecture knowledge, first pull request merges, and team culture integration.",
    status: "COMPLETED",
    participantsCount: 18,
    teamsCount: 3,
    challengesCount: 10,
    startsAt: "Jul 01, 2026",
    endsAt: "Jul 15, 2026",
    location: "Lagos HQ",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    topTeam: { name: "Byte Busters", points: 1250 },
  },
];

export default function TeamQuestsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "UPCOMING" | "COMPLETED" | "ALL">("ACTIVE");

  const filteredQuests = DEMO_QUESTS.filter((q) => {
    if (activeTab === "ALL") return true;
    return q.status === activeTab;
  });

  return (
    <BusinessShell
      title="Retreat Quests & Engagement Engine"
      subtitle="Enterprise competition, retreat gamification, hackathons, and company-wide agility challenges."
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/quests/2026-staff-retreat/scoreboard" target="_blank">
            <NexaButton size="sm" variant="outline" className="rounded-full" leftIcon={<Tv className="w-4 h-4 text-[#1A56DB]" />}>
              Stage Scoreboard
            </NexaButton>
          </Link>
          <Link href="/erp/hr/quests/new">
            <NexaButton size="sm" variant="primary" className="rounded-full bg-[#1A56DB] text-white" leftIcon={<Plus className="w-4 h-4" />}>
              Create Quest
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-10">
        {/* TOP 4 KPI CARDS — MATCHING /erp/admin VERBATIM */}
        <ErpStatGrid
          stats={[
            {
              label: "Active Quest Sprints",
              value: "1 Live Quest",
              change: "2026 Staff Retreat",
              trend: "up",
              icon: <Flame className="w-5 h-5 text-amber-500" />,
              sub: "Epe Resort & Spa, Lagos",
            },
            {
              label: "Enrolled Employees",
              value: "162 Staff",
              change: "15 Teams",
              trend: "up",
              icon: <Users className="w-5 h-5 text-blue-500" />,
              sub: "Company-Wide Enrollment",
            },
            {
              label: "Challenges Completed",
              value: "84 Done",
              change: "92% SLA",
              trend: "up",
              icon: <Target className="w-5 h-5 text-purple-500" />,
              sub: "High participation velocity",
            },
            {
              label: "Leading Team Score",
              value: "840 pts",
              change: "Team Alpha",
              trend: "up",
              icon: <Trophy className="w-5 h-5 text-emerald-500" />,
              sub: "Stage TV Display Live",
            },
          ]}
        />

        {/* TABS & FILTER */}
        <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
          <div className="flex items-center gap-2">
            {(["ACTIVE", "UPCOMING", "COMPLETED", "ALL"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#1A56DB] text-white shadow-md shadow-[#1A56DB]/20"
                    : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-transparent hover:border-[var(--nexa-border)]"
                }`}
              >
                {tab === "ACTIVE" && (
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-emerald-500" /> Active Quests
                  </span>
                )}
                {tab === "UPCOMING" && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Upcoming
                  </span>
                )}
                {tab === "COMPLETED" && (
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-blue-500" /> Completed
                  </span>
                )}
                {tab === "ALL" && (
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-500" /> All Quests
                  </span>
                )}
              </button>
            ))}
          </div>

          <span className="text-xs text-[var(--nexa-text-muted)] font-medium">
            Showing <strong>{filteredQuests.length}</strong> competition engines
          </span>
        </div>

        {/* QUEST CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => (
            <NexaCard
              key={quest.id}
              variant="glass"
              padding="none"
              className="overflow-hidden group hover:border-[#1A56DB]/50 transition-all flex flex-col justify-between rounded-3xl"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-gray-900">
                  <img
                    src={quest.coverImage}
                    alt={quest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <NexaBadge
                      variant={
                        quest.status === "ACTIVE"
                          ? "green"
                          : quest.status === "UPCOMING"
                          ? "brand"
                          : "secondary"
                      }
                      size="sm"
                      className="rounded-full flex items-center gap-1"
                    >
                      {quest.status === "ACTIVE" && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-emerald-500" /> Live Active
                        </span>
                      )}
                      {quest.status === "UPCOMING" && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> Starting Soon
                        </span>
                      )}
                      {quest.status === "COMPLETED" && (
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-blue-500" /> Finalized
                        </span>
                      )}
                      {quest.status === "DRAFT" && (
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400" /> Draft
                        </span>
                      )}
                    </NexaBadge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-xs font-semibold text-white/80 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {quest.startsAt} – {quest.endsAt} · {quest.location}
                    </div>
                    <h3 className="text-base font-bold leading-tight line-clamp-1">{quest.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-3.5">
                  <p className="text-xs text-[var(--nexa-text-secondary)] line-clamp-2 leading-relaxed">
                    {quest.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--nexa-border)] text-center">
                    <div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] font-medium">Participants</div>
                      <div className="text-sm font-black text-[var(--nexa-text-primary)]">
                        {quest.participantsCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] font-medium">Teams</div>
                      <div className="text-sm font-black text-[var(--nexa-text-primary)]">
                        {quest.teamsCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] font-medium">Challenges</div>
                      <div className="text-sm font-black text-[var(--nexa-text-primary)]">
                        {quest.challengesCount}
                      </div>
                    </div>
                  </div>

                  {quest.topTeam && (
                    <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--nexa-text-muted)] flex items-center gap-1.5 font-medium">
                        <Trophy className="w-4 h-4 text-amber-500" /> Leader:
                      </span>
                      <span className="font-bold text-[var(--nexa-text-primary)]">
                        {quest.topTeam.name} ({quest.topTeam.points} pts)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2">
                <Link href={`/erp/hr/quests/${quest.id}`} className="flex-1">
                  <NexaButton size="sm" variant="primary" className="w-full justify-center rounded-full bg-[#1A56DB]">
                    Manage Quest
                  </NexaButton>
                </Link>
                <Link href={`/erp/hr/quests/${quest.id}`}>
                  <NexaButton size="sm" variant="outline" className="px-3 rounded-full" title="Edit Quest Settings">
                    <Edit3 className="w-4 h-4 text-amber-500" />
                  </NexaButton>
                </Link>
                <Link href={`/quests/${quest.slug}/scoreboard`} target="_blank">
                  <NexaButton size="sm" variant="outline" className="px-3 rounded-full" title="Open Stage TV Scoreboard">
                    <Tv className="w-4 h-4 text-[#1A56DB]" />
                  </NexaButton>
                </Link>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
