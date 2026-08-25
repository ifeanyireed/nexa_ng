"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { useERPStore, getSignedInERPUser, User } from "@/lib/erp-store";
import {
  Trophy,
  Flame,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Tv,
  MapPin,
  Clock,
  Layers,
  Award,
  Swords,
  Play
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

interface TeamData {
  id: string;
  name: string;
  custom_name?: string;
  motto: string;
  color: string;
  initial?: string;
  total_points: number;
  rank: number;
  status: string;
}

interface ParticipantData {
  id: string;
  quest_id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  department: string;
  avatar: string;
  role: string;
}

export default function EmployeeMyQuestsPage() {
  const { users } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "UPCOMING" | "COMPLETED" | "ALL">("ACTIVE");

  const [questsList, setQuestsList] = useState<QuestCardData[]>([]);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUser(getSignedInERPUser(users));
    }
  }, [users]);

  useEffect(() => {
    async function loadQuests() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/erp/quests/detail?slug=reignite-2026").catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.quest) {
            const q = data.quest;
            const topT = data.teams && data.teams.length > 0 ? data.teams[0] : null;
            setQuestsList([
              {
                id: q.id || "qst-reignite-2026",
                slug: q.slug || "reignite-2026",
                name: q.name || "REIGNITE 2026: Team Quest & Championship",
                description: q.description || "Annual enterprise retreat, creative innovation pitch, trivia knowledge wars, and physical agility championship.",
                status: "ACTIVE",
                participantsCount: data.participants ? data.participants.length : 30,
                teamsCount: data.teams ? data.teams.filter((t: any) => t.status === "ACTIVE").length : 6,
                challengesCount: data.challenges ? data.challenges.length : 11,
                startsAt: q.starts_at ? new Date(q.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Aug 25, 2026",
                endsAt: q.ends_at ? new Date(q.ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Aug 27, 2026",
                location: q.location || "Epe Resort & Conference Centre, Lagos",
                coverImage: q.cover_image || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
                grandPrize: q.grand_prize || "NGN 500,000",
                topTeam: topT ? { name: topT.custom_name || topT.name, points: topT.total_points || 0 } : { name: "Team A (Alpha)", points: 0 },
              },
            ]);
          }
          if (data.teams) setTeams(data.teams);
          if (data.participants) setParticipants(data.participants);
        }
      } catch (e) {
        console.warn("Failed to fetch employee quests:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuests();
  }, []);

  // Find current user's team
  const myParticipant = participants.find((p) => p.user_id === currentUser.id);
  const myTeamId = myParticipant?.team_id || (teams.length > 0 ? teams[0].id : "team-a");
  const myTeam = teams.find((t) => t.id === myTeamId) || teams[0] || {
    id: "team-a",
    name: "Team A",
    custom_name: "Alpha (Blue Eagles)",
    motto: "Swift, Strategic, Unstoppable",
    color: "#1A56DB",
    initial: "A",
    total_points: 0,
    rank: 1,
    status: "ACTIVE",
  };

  const filteredQuests = questsList.filter((q) => {
    if (activeTab === "ALL") return true;
    return q.status === activeTab;
  });

  return (
    <BusinessShell
      title="My Team Quests & Retreats"
      subtitle="Enterprise competitions, staff retreat tournaments, innovation hackathons, and agility challenges."
      action={
        <div className="flex items-center gap-2.5">
          <Link href={`/quests/${questsList[0]?.slug || "reignite-2026"}/scoreboard`} target="_blank">
            <NexaButton size="sm" variant="outline" className="rounded-full" leftIcon={<Tv className="w-4 h-4 text-[#1A56DB]" />}>
              Stage Scoreboard
            </NexaButton>
          </Link>
          <Link href={`/erp/employee/quests/${questsList[0]?.id || "qst-reignite-2026"}`}>
            <NexaButton size="sm" variant="primary" className="rounded-full bg-[#1A56DB] text-white" leftIcon={<Play className="w-4 h-4" />}>
              Enter Player Console
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-10">
        {/* TOP 4 KPI STATS CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "My Assigned Squad",
              value: myTeam.custom_name || myTeam.name,
              change: `Rank #${myTeam.rank}`,
              trend: "up",
              icon: <Users className="w-5 h-5 text-blue-500" />,
              sub: myTeam.motto || "Champions of the Arena",
            },
            {
              label: "Squad Score",
              value: `${myTeam.total_points} pts`,
              change: "Active Standings",
              trend: "up",
              icon: <Flame className="w-5 h-5 text-amber-500" />,
              sub: "Stage TV Synchronized",
            },
            {
              label: "Total Challenges",
              value: `${questsList[0]?.challengesCount || 11} Quests`,
              change: "3-Day Itinerary",
              trend: "up",
              icon: <Target className="w-5 h-5 text-purple-500" />,
              sub: "Sports, Trivia & Skits",
            },
            {
              label: "Grand Prize Purse",
              value: questsList[0]?.grandPrize || "NGN 500,000",
              change: "Champion Trophy",
              trend: "up",
              icon: <Trophy className="w-5 h-5 text-emerald-500" />,
              sub: "Winner takes all",
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

        {/* QUEST CARDS 3-COL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((questItem) => (
            <NexaCard
              key={questItem.id}
              variant="glass"
              padding="none"
              className="overflow-hidden group hover:border-[#1A56DB]/50 transition-all flex flex-col justify-between rounded-3xl"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                  <img
                    src={questItem.coverImage}
                    alt={questItem.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <NexaBadge
                      variant={
                        questItem.status === "ACTIVE"
                          ? "green"
                          : questItem.status === "UPCOMING"
                          ? "brand"
                          : "secondary"
                      }
                      size="sm"
                      className="rounded-full flex items-center gap-1 font-bold"
                    >
                      {questItem.status === "ACTIVE" && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-emerald-500 animate-pulse" /> Live Active
                        </span>
                      )}
                      {questItem.status === "UPCOMING" && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> Starting Soon
                        </span>
                      )}
                      {questItem.status === "COMPLETED" && (
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-blue-500" /> Finalized
                        </span>
                      )}
                      {questItem.status === "DRAFT" && (
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400" /> Draft
                        </span>
                      )}
                    </NexaBadge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-xs font-semibold text-white/80 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {questItem.startsAt} – {questItem.endsAt} · {questItem.location}
                    </div>
                    <h3 className="text-base font-bold leading-tight line-clamp-1">{questItem.name}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs text-[var(--nexa-text-secondary)] line-clamp-2 leading-relaxed">
                    {questItem.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--nexa-border)] text-center">
                    <div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] font-medium">My Squad</div>
                      <div className="text-sm font-black text-[#1A56DB] truncate">
                        {myTeam.custom_name || myTeam.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] font-medium">Rank</div>
                      <div className="text-sm font-black text-amber-600">
                        #{myTeam.rank}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] font-medium">Challenges</div>
                      <div className="text-sm font-black text-purple-600">
                        {questItem.challengesCount}
                      </div>
                    </div>
                  </div>

                  {questItem.topTeam && (
                    <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--nexa-text-muted)] flex items-center gap-1.5 font-medium">
                        <Trophy className="w-4 h-4 text-amber-500" /> Grand Prize:
                      </span>
                      <span className="font-bold text-emerald-600">
                        {questItem.grandPrize || "NGN 500,000"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2">
                <Link href={`/erp/employee/quests/${questItem.id}`} className="flex-1">
                  <NexaButton size="sm" variant="primary" className="w-full justify-center rounded-full bg-[#1A56DB]">
                    Enter Player Console
                  </NexaButton>
                </Link>
                <Link href={`/quests/${questItem.slug}/scoreboard`} target="_blank">
                  <NexaButton size="sm" variant="outline" className="px-3 rounded-full" title="Open Stage Scoreboard">
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
