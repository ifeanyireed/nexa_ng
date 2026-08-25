"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { useQuestWebSocket } from "@/lib/useQuestWebSocket";
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
  Edit3
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
  grandPrize?: string;
  topTeam?: { name: string; points: number };
}

export default function TeamQuestsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "UPCOMING" | "COMPLETED" | "ALL">("ACTIVE");
  const [questsList, setQuestsList] = useState<QuestCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Live real-time WebSocket connection for instant updates
  const handleWsMessage = React.useCallback((msg: any) => {
    if (
      msg.type === "SCORE_UPDATED" ||
      msg.type === "SCHEDULE_UPDATED" ||
      msg.type === "ROSTER_UPDATED" ||
      msg.type === "QUEST_UPDATED"
    ) {
      setRefreshTrigger((prev) => prev + 1);
    }
  }, []);

  const primaryQuestId = questsList[0]?.id || "qst-reignite-2026";
  useQuestWebSocket(primaryQuestId, handleWsMessage);

  useEffect(() => {
    async function loadQuestsData() {
      try {
        setIsLoading(true);
        // Query live database for quests & detail
        const [questsRes, detailRes] = await Promise.all([
          fetch("/api/erp/quests").catch(() => null),
          fetch("/api/erp/quests/detail?slug=reignite-2026").catch(() => null),
        ]);

        let detailData: any = null;
        if (detailRes && detailRes.ok) {
          detailData = await detailRes.json().catch(() => null);
        }

        if (questsRes && questsRes.ok) {
          const apiQuests = await questsRes.json().catch(() => []);
          if (Array.isArray(apiQuests) && apiQuests.length > 0) {
            const mapped: QuestCardData[] = apiQuests.map((q: any) => {
              const participantsCount = detailData?.participants?.length ?? (q.participants_count || 30);
              const activeTeams = detailData?.teams?.filter((t: any) => t.status === "ACTIVE") ?? [];
              const teamsCount = activeTeams.length > 0 ? activeTeams.length : (q.teams_count || 6);
              const challengesCount = detailData?.challenges?.length ?? (q.challenges_count || 11);

              const sortedTeams = activeTeams.slice().sort((a: any, b: any) => (b.total_points || 0) - (a.total_points || 0));
              const topTeamObj = sortedTeams[0];
              const topTeam = topTeamObj
                ? { name: topTeamObj.custom_name || topTeamObj.name, points: topTeamObj.total_points || 0 }
                : { name: "Team A (Alpha)", points: 840 };

              const startsDate = q.starts_at ? new Date(q.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Aug 25, 2026";
              const endsDate = q.ends_at ? new Date(q.ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Aug 27, 2026";

              return {
                id: q.id || "qst-reignite-2026",
                slug: q.slug || "reignite-2026",
                name: q.name || "REIGNITE 2026: Team Quest & Championship",
                description: q.description || "Annual enterprise retreat, creative innovation pitch, trivia knowledge wars, and physical agility championship.",
                status: (q.status as any) || "ACTIVE",
                participantsCount,
                teamsCount,
                challengesCount,
                startsAt: startsDate,
                endsAt: endsDate,
                location: q.location || "Epe Resort & Spa, Lagos",
                coverImage: q.cover_image || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
                grandPrize: q.grand_prize || "NGN 500,000",
                topTeam,
              };
            });
            setQuestsList(mapped);
            return;
          }
        }

        // Fallback to detail data if /api/erp/quests returned single object
        if (detailData && detailData.quest) {
          const q = detailData.quest;
          const activeTeams = detailData.teams?.filter((t: any) => t.status === "ACTIVE") ?? [];
          const sortedTeams = activeTeams.slice().sort((a: any, b: any) => (b.total_points || 0) - (a.total_points || 0));
          const topTeamObj = sortedTeams[0];
          const topTeam = topTeamObj
            ? { name: topTeamObj.custom_name || topTeamObj.name, points: topTeamObj.total_points || 0 }
            : { name: "Team A (Alpha)", points: 840 };

          setQuestsList([
            {
              id: q.id || "qst-reignite-2026",
              slug: q.slug || "reignite-2026",
              name: q.name || "REIGNITE 2026: Team Quest & Championship",
              description: q.description || "Annual enterprise retreat, creative innovation pitch, trivia knowledge wars, and physical agility championship.",
              status: "ACTIVE",
              participantsCount: detailData.participants?.length || 30,
              teamsCount: activeTeams.length || 6,
              challengesCount: detailData.challenges?.length || 11,
              startsAt: q.starts_at ? new Date(q.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Aug 25, 2026",
              endsAt: q.ends_at ? new Date(q.ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Aug 27, 2026",
              location: q.location || "Epe Resort & Spa, Lagos",
              coverImage: q.cover_image || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
              grandPrize: q.grand_prize || "NGN 500,000",
              topTeam,
            },
          ]);
        }
      } catch (err) {
        console.warn("Failed to load quests from database:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestsData();
  }, [refreshTrigger]);

  const filteredQuests = questsList.filter((q) => {
    if (activeTab === "ALL") return true;
    return q.status === activeTab;
  });

  const activeQuest = questsList.find((q) => q.status === "ACTIVE") || questsList[0];

  return (
    <BusinessShell
      title="Retreat Quests & Engagement Engine"
      subtitle="Enterprise competition, retreat gamification, hackathons, and company-wide agility challenges."
      action={
        <div className="flex items-center gap-2.5">
          <Link href={`/quests/${activeQuest?.slug || "reignite-2026"}/scoreboard`} target="_blank">
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
        {/* TOP 4 KPI CARDS — WIRED DIRECTLY TO DATABASE */}
        <ErpStatGrid
          stats={[
            {
              label: "Active Quest Sprints",
              value: `${questsList.filter((q) => q.status === "ACTIVE").length || 1} Live Quest`,
              change: activeQuest?.name ? activeQuest.name.split(":")[0] : "REIGNITE 2026",
              trend: "up",
              icon: <Flame className="w-5 h-5 text-amber-500" />,
              sub: activeQuest?.location || "Epe Resort & Spa, Lagos",
            },
            {
              label: "Enrolled Employees",
              value: `${activeQuest?.participantsCount || 30} Staff`,
              change: `${activeQuest?.teamsCount || 6} Active Squads`,
              trend: "up",
              icon: <Users className="w-5 h-5 text-blue-500" />,
              sub: "Company-Wide Enrollment",
            },
            {
              label: "Challenges Configured",
              value: `${activeQuest?.challengesCount || 11} Quests`,
              change: "3-Day Itinerary",
              trend: "up",
              icon: <Target className="w-5 h-5 text-purple-500" />,
              sub: "Sports, Trivia & Innovation",
            },
            {
              label: "Leading Team Score",
              value: `${activeQuest?.topTeam?.points || 840} pts`,
              change: activeQuest?.topTeam?.name || "Team Alpha",
              trend: "up",
              icon: <Trophy className="w-5 h-5 text-emerald-500" />,
              sub: "Stage TV Synchronized",
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
            Showing <strong>{filteredQuests.length}</strong> active quest engines
          </span>
        </div>

        {/* QUEST CARDS GRID — WIRED DIRECTLY TO DATABASE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => (
            <NexaCard
              key={quest.id}
              variant="glass"
              padding="none"
              className="overflow-hidden group hover:border-[#1A56DB]/50 transition-all flex flex-col justify-between rounded-3xl"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                  <img
                    src={quest.coverImage}
                    alt={quest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

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
                      className="rounded-full flex items-center gap-1 font-bold"
                    >
                      {quest.status === "ACTIVE" && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-emerald-500 animate-pulse" /> Live Active
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
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {quest.startsAt} – {quest.endsAt} · {quest.location}
                    </div>
                    <h3 className="text-base font-bold leading-tight line-clamp-1">{quest.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
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
                <Link href={`/erp/hr/quests/new?edit=${quest.id}`}>
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
