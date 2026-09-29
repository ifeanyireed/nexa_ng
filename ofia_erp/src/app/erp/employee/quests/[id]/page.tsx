"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useERPStore, getSignedInERPUser, User } from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Play,
  Users,
  Target,
  Tv,
  Star,
  Lock,
  Send,
  HelpCircle,
  Award,
  ChevronRight,
  Calendar,
  MapPin,
  Radio,
  Coins,
  Gift,
  Layers,
  Swords,
  Plus,
  FileText
} from "lucide-react";
import { useQuestWebSocket } from "@/lib/useQuestWebSocket";

interface TeamItem {
  id: string;
  name: string;
  custom_name?: string;
  motto: string;
  logo: string;
  color: string;
  initial?: string;
  total_points: number;
  rank: number;
  member_count?: number;
  status: string;
}

interface ParticipantItem {
  id: string;
  quest_id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  department: string;
  avatar: string;
  role: string;
}

interface ChallengeItem {
  id: string;
  day: string;
  category: string;
  engine_type: string;
  name: string;
  description: string;
  instructions: string;
  max_score: number;
  status: string;
}

interface ScheduleItem {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  category: string;
  location: string;
  max_score?: number;
  facilitator_notes?: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
}

interface PrizeItem {
  id: string;
  rank?: number;
  title: string;
  award_type: string;
  amount: string;
  description: string;
  icon: string;
}

interface QuestDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cover_image?: string;
  location?: string;
  starts_at?: string;
  ends_at?: string;
  grand_prize?: string;
  currency?: string;
  total_max_points?: number;
  enable_stage_tv?: boolean;
}

const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "What is the primary mission of the enterprise mobility and logistics operations?",
    options: [
      "Providing safe, tech-enabled, reliable corporate mobility & supply chain solutions",
      "Manufacturing automobile spare parts locally",
      "Operating international airline charter services",
      "Public bus stop ticketing exclusively"
    ],
    correctIndex: 0
  },
  {
    id: "q2",
    question: "How frequently must logistics and vehicle fleet reconciliation reports be submitted to accounts?",
    options: ["Quarterly only", "Weekly before close of work on Mondays", "Once a year", "Every 6 months"],
    correctIndex: 1
  },
  {
    id: "q3",
    question: "What is the target SLA for resolving invoice account payment discrepancies?",
    options: ["Within 24 hours", "Within 14 business days", "Within 1 month", "At annual close"],
    correctIndex: 0
  },
  {
    id: "q4",
    question: "Which core competency category evaluates leadership, delegation, and KPI deployment?",
    options: ["Self-Development", "Leadership and Accountability", "Informative", "Physical Sports"],
    correctIndex: 1
  },
  {
    id: "q5",
    question: "What is the grand prize for the winning squad in the REIGNITE Championship?",
    options: ["NGN 100,000", "NGN 250,000", "NGN 500,000", "NGN 1,000,000"],
    correctIndex: 2
  },
  {
    id: "q6",
    question: "Which department oversees pre-trip vehicle inspections, maintenance logs, and workshop turnaround?",
    options: ["Finance & Accounts", "Fleet Operations & Maintenance", "Human Resources", "Legal Directorate"],
    correctIndex: 1
  },
  {
    id: "q7",
    question: "What is the total maximum points score across all 3 days of REIGNITE?",
    options: ["500 Points", "850 Points", "1200 Points", "2000 Points"],
    correctIndex: 1
  },
  {
    id: "q8",
    question: "Which challenge on Day 2 requires duplicate-prevention concept approval before performance?",
    options: ["Egg & Spoon Race", "REIGNITE: The Core Challenge", "Who Are We?", "4x100m Relay"],
    correctIndex: 1
  },
  {
    id: "q9",
    question: "In the 5-point competency rating framework, what score represents 'Target Level / Proficient'?",
    options: ["Level 1", "Level 2", "Level 4", "Level 0"],
    correctIndex: 2
  },
  {
    id: "q10",
    question: "What is the key principle of the REIGNITE team quest scoring architecture?",
    options: [
      "Individual points only",
      "Team-based points where participant contributions advance the team standing",
      "Random lottery selection",
      "No points are recorded"
    ],
    correctIndex: 1
  }
];

export default function EmployeeQuestConsolePage() {
  const params = useParams();
  const questId = (params?.id as string) || "qst-reignite-2026";
  const { users } = useERPStore();

  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const [quest, setQuest] = useState<QuestDetail | null>(null);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);

  // Navigation tab state: Overview, Schedule, Challenges, Prizes
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "challenges" | "prizes">("schedule");
  const [scheduleDayFilter, setScheduleDayFilter] = useState<string>("ALL");

  // Quiz Modal
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Concept Modal
  const [conceptModalOpen, setConceptModalOpen] = useState(false);
  const [conceptTitle, setConceptTitle] = useState("");
  const [conceptFormat, setConceptFormat] = useState("Drama/Comedy");
  const [conceptDesc, setConceptDesc] = useState("");
  const [conceptSubmitted, setConceptSubmitted] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWsMessage = React.useCallback((msg: any) => {
    if (
      msg.type === "SCORE_UPDATED" ||
      msg.type === "SCHEDULE_UPDATED" ||
      msg.type === "CONCEPT_UPDATED" ||
      msg.type === "ROSTER_UPDATED" ||
      msg.type === "QUEST_UPDATED"
    ) {
      setRefreshTrigger((prev) => prev + 1);
    }
  }, []);

  const { isConnected } = useQuestWebSocket(questId, handleWsMessage);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUser(getSignedInERPUser(users));
    }
  }, [users]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/erp/quests/detail?id=${questId}&slug=${questId}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.quest) setQuest(data.quest);
          if (data.teams) setTeams(data.teams);
          if (data.participants) setParticipants(data.participants);
          if (data.challenges) setChallenges(data.challenges);
          if (data.schedule) setSchedule(data.schedule);
          if (data.prizes) setPrizes(data.prizes);
        }
      } catch (e) {
        console.warn("Failed to load quest details:", e);
      }
    }
    load();
  }, [questId, refreshTrigger]);

  const activeTeams = teams.filter((t) => t.status === "ACTIVE");
  const myParticipant = participants.find((p) => p.user_id === currentUser.id);
  const myTeamId = myParticipant?.team_id || (teams.length > 0 ? teams[0].id : "team-a");
  const myTeam = teams.find((t) => t.id === myTeamId) || teams[0] || {
    id: "team-a",
    name: "Team A",
    custom_name: "Alpha (Blue Eagles)",
    logo: "Alpha",
    color: "#1A56DB",
    motto: "Swift, Strategic, Unstoppable",
    total_points: 0,
    rank: 1,
    status: "ACTIVE",
  };

  const myTeamMembers = participants.filter((p) => p.team_id === myTeam.id);
  const liveScheduleItem = schedule.find((s) => s.status === "LIVE");
  const activeChallenge = challenges.find((c) => c.status === "OPEN" || c.status === "IN_PROGRESS") || challenges[0];

  const filteredSchedule = schedule.filter((s) => {
    if (scheduleDayFilter === "ALL") return true;
    return s.day === scheduleDayFilter;
  });

  const handleQuizSubmit = async () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) score += 10;
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    try {
      await fetch(`/api/erp/quests/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quest_id: quest?.id || questId,
          challenge_id: "chl-day2-quiz",
          challenge_name: "The Knowledge Quest",
          team_id: myTeam.id,
          team_name: myTeam.custom_name || myTeam.name,
          points: score,
          max_points: 100,
          reason: `Auto-Scored Quiz by ${currentUser.name} (${score}/100)`,
          scored_by: "Quiz Automated Engine",
        }),
      });

      // Update local team points
      setTeams((prev) =>
        prev.map((t) => (t.id === myTeam.id ? { ...t, total_points: t.total_points + score } : t))
      );
    } catch (e) {}
  };

  const handleConceptSubmit = async () => {
    if (!conceptTitle.trim()) return;
    try {
      await fetch(`/api/erp/quests/concepts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quest_id: quest?.id || questId,
          challenge_id: "chl-day2-core-challenge",
          team_id: myTeam.id,
          team_name: myTeam.custom_name || myTeam.name,
          title: conceptTitle,
          description: conceptDesc,
          format: conceptFormat,
        }),
      });
      setConceptSubmitted(true);
      setTimeout(() => {
        setConceptModalOpen(false);
        setConceptSubmitted(false);
      }, 1500);
    } catch (e) {}
  };

  return (
    <BusinessShell
      title={`Player Console — ${myTeam.custom_name || myTeam.name}`}
      subtitle={`Welcome, ${currentUser.name} · Squad Rank #${myTeam.rank} · ${myTeam.total_points} Accumulated Points · ${quest?.location || "Epe Resort & Spa, Lagos"}`}
      action={
        <div className="flex items-center gap-2.5">
          <Link
            href={`/quests/${quest?.slug || "reignite-2026"}/scoreboard`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 h-8 px-3.5 text-xs font-bold rounded-full border border-nexa-border bg-transparent text-nexa-text-secondary hover:bg-nexa-bg-surface hover:text-nexa-text-primary transition-all shadow-xs"
          >
            <Tv className="w-4 h-4 text-blue-600" />
            <span>Arena TV Scoreboard</span>
          </Link>
          <Link
            href="/erp/employee/quests"
            className="inline-flex items-center justify-center gap-2 h-8 px-3.5 text-xs font-bold rounded-full border border-nexa-border bg-nexa-bg-base text-nexa-text-primary hover:bg-nexa-bg-surface transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Quests</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP 4 KPI CARDS — MATCHING /erp/hr/quests/[id] */}
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
              label: "Squad Points",
              value: `${myTeam.total_points} pts`,
              change: `Max ${quest?.total_max_points || 850} pts`,
              trend: "up",
              icon: <Flame className="w-5 h-5 text-amber-500" />,
              sub: "Stage TV Synchronized",
            },
            {
              label: "Live Activity Now",
              value: liveScheduleItem ? liveScheduleItem.title : activeChallenge?.name || "Team Identity Presentation",
              change: liveScheduleItem ? liveScheduleItem.day : "Day 1",
              trend: "up",
              icon: <Target className="w-5 h-5 text-purple-500" />,
              sub: liveScheduleItem?.location || "Main Auditorium Arena",
            },
            {
              label: "Grand Championship Prize",
              value: quest?.grand_prize || "NGN 500,000",
              change: "Champion Trophy",
              trend: "up",
              icon: <Award className="w-5 h-5 text-emerald-500" />,
              sub: "Day 3 Grand Finale",
            },
          ]}
        />

        {/* 1. HERO LIVE BANNER */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Activity Now
              </span>
              <span className="text-xs font-mono text-white/80">
                {liveScheduleItem ? `${liveScheduleItem.day} · ${liveScheduleItem.start_time} - ${liveScheduleItem.end_time}` : activeChallenge?.day || "Day 1"}
              </span>
            </div>
            <h2 className="text-2xl font-black">
              {liveScheduleItem ? liveScheduleItem.title : activeChallenge?.name || "Team Identity Presentation"}
            </h2>
            <p className="text-xs text-white/80 max-w-xl">
              {liveScheduleItem
                ? `${liveScheduleItem.description} Venue: ${liveScheduleItem.location}`
                : activeChallenge?.instructions || "Work closely with your squad teammates. Make sure your team chant, motto, and banner are ready!"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeChallenge?.id === "chl-day2-quiz" ? (
              <NexaButton
                size="md"
                variant="secondary"
                onClick={() => setQuizModalOpen(true)}
                className="bg-white text-blue-700 font-bold rounded-full hover:bg-gray-100 cursor-pointer shadow-md"
                leftIcon={<Play className="w-4 h-4" />}
              >
                Take Knowledge Quiz
              </NexaButton>
            ) : activeChallenge?.id === "chl-day2-core-challenge" ? (
              <NexaButton
                size="md"
                variant="secondary"
                onClick={() => setConceptModalOpen(true)}
                className="bg-white text-blue-700 font-bold rounded-full hover:bg-gray-100 cursor-pointer shadow-md"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Register Concept
              </NexaButton>
            ) : (
              <Link href={`/quests/${quest?.slug || "reignite-2026"}/scoreboard`} target="_blank">
                <NexaButton size="md" variant="secondary" className="bg-white text-blue-700 font-bold rounded-full hover:bg-gray-100 cursor-pointer shadow-md" leftIcon={<Tv className="w-4 h-4" />}>
                  View Live Scoreboard
                </NexaButton>
              </Link>
            )}
          </div>
        </div>

        {/* NAVIGATION TABS — MATCHING /erp/hr/quests/[id] */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-3 overflow-x-auto">
          {[
            { id: "schedule", label: `Schedule & Timeline (${schedule.length})`, icon: Calendar },
            { id: "overview", label: "My Squad & Roster", icon: Users },
            { id: "challenges", label: `Quests Curriculum (${challenges.length})`, icon: Target },
            { id: "prizes", label: `Prize Purse (${prizes.length})`, icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1A56DB] text-white shadow-md shadow-[#1A56DB]/20"
                    : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-transparent hover:border-[var(--nexa-border)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SCHEDULE & TIMELINE (EXACT VERBATIM UI LIST FROM /erp/hr/quests/qst-retreat-2026) */}
        {activeTab === "schedule" && (
          <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  Event Schedule & Timeline
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  3-Day championship itinerary, keynote presentations, meal intervals, and sports challenges
                </p>
              </div>

              {/* Day filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {["Day 1", "Day 2", "Day 3", "ALL"].map((day) => (
                  <button
                    key={day}
                    onClick={() => setScheduleDayFilter(day)}
                    className={`px-3 py-1.5 border font-bold rounded-full text-xs cursor-pointer transition-all ${
                      scheduleDayFilter === day
                        ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-xs"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)]">
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider w-[42%] min-w-[340px]">Activity</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Schedule & Location</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Category</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Points</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                  {filteredSchedule.length > 0 ? (
                    filteredSchedule.map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                        <td className="py-3.5 px-3 min-w-[340px]">
                          <div>
                            <p className="font-bold text-xs flex items-center gap-1.5">
                              {item.title}
                              {item.status === "LIVE" && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              )}
                            </p>
                            <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium mt-0.5">
                              {item.description}
                            </p>
                            {item.facilitator_notes && (
                              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
                                <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Guide: {item.facilitator_notes}</span>
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div>
                            <p className="font-bold text-xs text-blue-600">
                              {item.day} · {item.start_time} – {item.end_time}
                            </p>
                            <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {item.location}
                            </p>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              item.category === "Challenge"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : item.category === "Sports"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : item.category === "Awards"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {item.max_score ? (
                            <span className="bg-emerald-500/10 text-emerald-600 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-xs">
                              +{item.max_score} pts
                            </span>
                          ) : (
                            <span className="text-[var(--nexa-text-muted)] font-semibold">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {item.status === "LIVE" ? (
                            <span className="bg-emerald-500/10 text-emerald-600 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-xs inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Now
                            </span>
                          ) : item.status === "COMPLETED" ? (
                            <span className="bg-blue-500/10 text-blue-600 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/20 text-xs">
                              Completed
                            </span>
                          ) : (
                            <span className="bg-slate-500/10 text-slate-600 font-extrabold px-2.5 py-0.5 rounded-full border border-slate-500/20 text-xs">
                              Scheduled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[var(--nexa-text-muted)] font-medium">
                        No scheduled items found for this day filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </NexaCard>
        )}

        {/* TAB 2: MY SQUAD & ROSTER */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MY SQUAD CARD */}
            <NexaCard
              variant="glass"
              padding="md"
              className="space-y-4 rounded-3xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs shrink-0"
                    style={{ backgroundColor: `${myTeam.color}18`, color: myTeam.color }}
                  >
                    {(myTeam.name.replace(/^Team\s+/i, "")[0] || "T").toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">{myTeam.custom_name || myTeam.name}</h3>
                    <p className="text-[10px] text-[var(--nexa-text-muted)]">{myTeam.motto}</p>
                  </div>
                </div>
                <NexaBadge variant="brand" size="sm" className="rounded-full">Rank #{myTeam.rank}</NexaBadge>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[var(--nexa-text-muted)] text-[10px] uppercase font-bold">Squad Points</span>
                  <p className="font-black text-blue-600 text-base">{myTeam.total_points} / {quest?.total_max_points || 850} pts</p>
                </div>
                <div>
                  <span className="text-[var(--nexa-text-muted)] text-[10px] uppercase font-bold">Roster Size</span>
                  <p className="font-bold text-[var(--nexa-text-primary)] text-base">{myTeamMembers.length || 10} Staff</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                <p className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">Squad Teammates</p>
                {myTeamMembers.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                      m.user_id === currentUser.id
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-[var(--nexa-card-bg)] border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-surface)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={m.avatar} alt={m.user_name} className="w-7 h-7 rounded-full object-cover border border-[var(--nexa-border)] shadow-xs" />
                      <div>
                        <p className="font-bold text-[var(--nexa-text-primary)] text-xs leading-tight flex items-center gap-1.5">
                          {m.user_name}
                          {m.user_id === currentUser.id && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">You</span>
                          )}
                          {m.role === "captain" && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </p>
                        <p className="text-[10px] text-[var(--nexa-text-muted)] font-medium truncate max-w-[140px]">{m.department}</p>
                      </div>
                    </div>
                    {m.role === "captain" && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Captain
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </NexaCard>

            {/* SQUAD STANDINGS CARDS */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  Championship Squad Standings
                </h3>
                <span className="text-xs text-[var(--nexa-text-muted)] font-medium">
                  {activeTeams.length} Teams Competing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeTeams
                  .slice()
                  .sort((a, b) => b.total_points - a.total_points)
                  .map((team, idx) => {
                    const teamMembers = participants.filter((p) => p.team_id === team.id);
                    const isMySquad = team.id === myTeam.id;

                    return (
                      <NexaCard
                        key={team.id}
                        variant="glass"
                        className={`p-5 rounded-3xl relative overflow-hidden group transition-all ${
                          isMySquad ? "ring-2 ring-[#1A56DB] shadow-md" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs shrink-0"
                            style={{ backgroundColor: `${team.color}18`, color: team.color }}
                          >
                            {(team.name.replace(/^Team\s+/i, "")[0] || "T").toUpperCase()}
                          </div>
                          <div className="flex items-center gap-1">
                            {isMySquad && (
                              <span className="bg-[#1A56DB] text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                                You
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                                idx === 0
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                              }`}
                            >
                              Rank #{team.rank}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-bold text-[var(--nexa-text-primary)] truncate">{team.custom_name || team.name}</p>
                        <h4 className="text-xl font-black text-[var(--nexa-text-primary)] my-0.5">
                          {team.total_points} <span className="text-xs font-normal text-[var(--nexa-text-muted)]">/ 850 pts</span>
                        </h4>
                        <p className="text-[10px] text-[var(--nexa-text-secondary)] truncate">&ldquo;{team.motto}&rdquo; · {teamMembers.length} Staff</p>
                      </NexaCard>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CHALLENGES & QUESTS CURRICULUM */}
        {activeTab === "challenges" && (
          <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
            <div className="pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Quests & Competition Curriculum ({challenges.length})
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                11 official challenges across sports, intellect, innovation, and teamwork
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)]">
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider w-[42%] min-w-[340px]">Challenge & Details</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Schedule</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Category</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Max Points</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                  {challenges.map((chl) => (
                    <tr key={chl.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                      <td className="py-3.5 px-3 min-w-[340px]">
                        <div>
                          <p className="font-bold text-xs">{chl.name}</p>
                          <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium mt-0.5">{chl.description}</p>
                          <p className="text-[10px] text-blue-700 dark:text-blue-400 font-medium mt-1">
                            Rubric: {chl.instructions}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-bold text-blue-600">
                        {chl.day}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="bg-purple-500/10 text-purple-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-purple-500/20">
                          {chl.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="bg-emerald-500/10 text-emerald-600 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-xs">
                          +{chl.max_score} pts
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${
                          chl.status === "OPEN" || chl.status === "IN_PROGRESS"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : chl.status === "COMPLETED"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        }`}>
                          {chl.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        {chl.id === "chl-day2-quiz" && (
                          <NexaButton
                            size="sm"
                            variant="primary"
                            onClick={() => setQuizModalOpen(true)}
                            className="rounded-full bg-[#1A56DB] text-xs h-7 ml-auto"
                            leftIcon={<Play className="w-3 h-3" />}
                          >
                            Take Quiz
                          </NexaButton>
                        )}
                        {chl.id === "chl-day2-core-challenge" && (
                          <NexaButton
                            size="sm"
                            variant="primary"
                            onClick={() => setConceptModalOpen(true)}
                            className="rounded-full bg-purple-600 text-xs h-7 ml-auto"
                            leftIcon={<Sparkles className="w-3 h-3" />}
                          >
                            Register Concept
                          </NexaButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NexaCard>
        )}

        {/* TAB 4: PRIZE PURSE & TROPHIES */}
        {activeTab === "prizes" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 border border-amber-500/20">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-[var(--nexa-text-primary)]">Championship Grand Prize</h4>
                  <p className="text-xs text-[var(--nexa-text-secondary)]">Awarded to the overall winning squad on the final Gala night</p>
                </div>
              </div>
              <span className="text-2xl font-black text-amber-600">{quest?.grand_prize || "NGN 500,000"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prizes.map((p) => (
                <NexaCard key={p.id} variant="glass" padding="md" className="space-y-2.5 rounded-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 border border-purple-500/20">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[var(--nexa-text-primary)]">{p.title}</h5>
                        <span className="text-[10px] font-bold text-purple-600 uppercase">{p.award_type}</span>
                      </div>
                    </div>
                    <span className="font-black text-sm text-emerald-600">
                      {p.amount.startsWith("NGN") || p.amount.startsWith("$") ? p.amount : `NGN ${p.amount}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--nexa-text-secondary)]">{p.description}</p>
                </NexaCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QUIZ MODAL */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-card-bg)] rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-[var(--nexa-border)]">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <span className="bg-purple-500/10 text-purple-600 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  Day 2 · Educative
                </span>
                <h3 className="font-bold text-lg text-[var(--nexa-text-primary)] mt-1">The Knowledge Quest (10 Questions)</h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">10 questions × 10 points = 100 points maximum for {myTeam.custom_name || myTeam.name}</p>
              </div>
            </div>

            {!quizSubmitted ? (
              <div className="space-y-6">
                {QUIZ_QUESTIONS.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                    <p className="font-bold text-xs text-[var(--nexa-text-primary)]">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            quizAnswers[qIdx] === optIdx
                              ? "bg-blue-500/10 border-blue-500 font-bold text-blue-600"
                              : "bg-[var(--nexa-card-bg)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${qIdx}`}
                            checked={quizAnswers[qIdx] === optIdx}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                            className="text-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setQuizModalOpen(false)}
                    className="px-4 py-2 bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs disabled:opacity-50 cursor-pointer"
                  >
                    Submit & Auto-Grade Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Trophy className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-xl text-[var(--nexa-text-primary)]">Quiz Completed!</h4>
                <p className="text-2xl font-black text-emerald-600">{quizScore} / 100 Points</p>
                <p className="text-xs text-[var(--nexa-text-secondary)] max-w-md mx-auto">
                  Your squad score has been recorded in the tournament database and submitted for live scoreboard sync.
                </p>
                <button
                  onClick={() => setQuizModalOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Return to Console
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONCEPT SUBMISSION MODAL */}
      {conceptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-card-bg)] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[var(--nexa-border)]">
            <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">Register Core Challenge Concept</h3>
            <p className="text-xs text-[var(--nexa-text-secondary)]">
              Submit your team's concept for <strong>REIGNITE: The Core Challenge</strong>. Once approved, the title is locked to prevent duplicate topics.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Performance Title:</label>
                <input
                  type="text"
                  placeholder="e.g. The Office After the Apocalypse"
                  value={conceptTitle}
                  onChange={(e) => setConceptTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs text-[var(--nexa-text-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Performance Format:</label>
                <select
                  value={conceptFormat}
                  onChange={(e) => setConceptFormat(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs text-[var(--nexa-text-primary)]"
                >
                  <option value="Drama/Comedy">Drama / Comedy Sketch</option>
                  <option value="Musical/Choreography">Musical / Choreography</option>
                  <option value="Spoken Word/Poetry">Spoken Word / Poetry</option>
                  <option value="Innovation Pitch">Innovation Pitch & Demonstration</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">Brief Synopsis / Description:</label>
                <textarea
                  rows={3}
                  placeholder="Describe how your 10-minute performance brings REIGNITE to life..."
                  value={conceptDesc}
                  onChange={(e) => setConceptDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs text-[var(--nexa-text-primary)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConceptModalOpen(false)}
                className="px-4 py-2 bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConceptSubmit}
                disabled={!conceptTitle.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs disabled:opacity-50 cursor-pointer"
              >
                {conceptSubmitted ? "Registered!" : "Submit for Lock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessShell>
  );
}
