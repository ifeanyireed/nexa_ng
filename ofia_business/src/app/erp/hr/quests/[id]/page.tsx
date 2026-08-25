"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useERPStore, User } from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Trophy,
  Users,
  Target,
  Tv,
  Calendar,
  Sparkles,
  Plus,
  Flame,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  Play,
  FileText,
  Shield,
  Star,
  Lock,
  Unlock,
  History,
  Send,
  Edit3,
  Trash2,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface TeamItem {
  id: string;
  name: string;
  custom_name?: string;
  motto: string;
  logo: string;
  color: string;
  total_points: number;
  rank: number;
  captain_id?: string;
  member_count: number;
}

interface ParticipantItem {
  id: string;
  quest_id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  department: string;
  avatar: string;
  role: string;
  status: string;
}

interface ChallengeItem {
  id: string;
  day: string;
  category: string;
  engine_type: "RUBRIC" | "PARTICIPATION" | "CONCEPT_AND_RUBRIC" | "RANK_TO_POINTS" | "QUIZ";
  name: string;
  description: string;
  instructions: string;
  max_score: number;
  status: "LOCKED" | "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "VERIFIED" | "COMPLETED";
  rubric?: Array<{ criterion: string; max_points: number }>;
  settings?: Record<string, number>;
}

interface ConceptItem {
  id: string;
  challenge_id: string;
  team_id: string;
  team_name: string;
  title: string;
  description: string;
  format: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  locked_by?: string;
}

interface ScoreAuditItem {
  id: string;
  challenge_id: string;
  team_id: string;
  previous_score: number;
  new_score: number;
  reason: string;
  modified_by: string;
  created_at: string;
}

const DEFAULT_CHALLENGES: ChallengeItem[] = [
  {
    id: "chl-day1-identity",
    day: "Day 1",
    category: "Entertainment",
    engine_type: "RUBRIC",
    name: "Team Identity Presentation",
    description: "Each team presents its custom Team Name, Motto, Pose, and Team Chant / Celebration Song.",
    instructions: "5-minute stage presentation judged on creativity, teamwork, energy, and overall delivery.",
    max_score: 50,
    status: "OPEN",
    rubric: [
      { criterion: "Creativity & Originality", max_points: 15 },
      { criterion: "Teamwork & Cohesion", max_points: 15 },
      { criterion: "Energy & Stage Presence", max_points: 10 },
      { criterion: "Presentation Quality", max_points: 10 },
    ],
  },
  {
    id: "chl-day1-who-are-we",
    day: "Day 1",
    category: "Informative",
    engine_type: "PARTICIPATION",
    name: "Who Are We? (5 Incredible Things)",
    description: "Each participant shares 5 incredible facts about themselves and how the company contributed to their journey.",
    instructions: "Facilitator marks each team member's active contribution. 100% participation yields maximum 50 points.",
    max_score: 50,
    status: "LOCKED",
  },
  {
    id: "chl-day1-games",
    day: "Day 1",
    category: "Entertainment",
    engine_type: "RUBRIC",
    name: "Card Games & Karaoke Fun",
    description: "Team connection night featuring interactive board/card games, karaoke showdowns, and bonding activities.",
    instructions: "Facilitators award up to 50 points based on team spirit, participation, creativity, and sportsmanship.",
    max_score: 50,
    status: "LOCKED",
    rubric: [
      { criterion: "Team Spirit & Vibe", max_points: 15 },
      { criterion: "Participation Rate", max_points: 15 },
      { criterion: "Performance & Talent", max_points: 10 },
      { criterion: "Sportsmanship", max_points: 10 },
    ],
  },
  {
    id: "chl-day2-core-challenge",
    day: "Day 2",
    category: "Conventional / Creative",
    engine_type: "CONCEPT_AND_RUBRIC",
    name: "REIGNITE: The Core Challenge",
    description: "Each team creates and performs a 10-minute original performance bringing the REIGNITE theme to life.",
    instructions: "Teams must first register and lock their concept. Performances are scored across 6 weighted judging dimensions.",
    max_score: 200,
    status: "LOCKED",
    rubric: [
      { criterion: "Interpretation of REIGNITE", max_points: 40 },
      { criterion: "Creativity & Originality", max_points: 40 },
      { criterion: "Teamwork & Member Involvement", max_points: 30 },
      { criterion: "Entertainment & Engagement", max_points: 30 },
      { criterion: "Execution & Pacing", max_points: 30 },
      { criterion: "Overall Impact & Message", max_points: 30 },
    ],
  },
  {
    id: "chl-day2-egg-race",
    day: "Day 2",
    category: "Entertainment",
    engine_type: "RANK_TO_POINTS",
    name: "Egg & Spoon Agility Race",
    description: "Fast-paced team balance relay requiring agility, coordination, and steady nerves.",
    instructions: "Facilitators enter finish rankings. Points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.",
    max_score: 50,
    status: "LOCKED",
    settings: { "1st": 50, "2nd": 40, "3rd": 30, "4th": 20, "5th": 10, "6th": 5 },
  },
  {
    id: "chl-day2-quiz",
    day: "Day 2",
    category: "Educative",
    engine_type: "QUIZ",
    name: "The Knowledge Quest (10 Questions)",
    description: "10 objective corporate and industry knowledge questions testing reasoning and operational know-how.",
    instructions: "10 questions × 10 points = 100 points maximum. Automated marking using the official answer key.",
    max_score: 100,
    status: "LOCKED",
  },
  {
    id: "chl-day2-think-fast",
    day: "Day 2",
    category: "Educative",
    engine_type: "QUIZ",
    name: "Think Fast Rapid-Fire Round",
    description: "10 rapid-fire buzzer questions asked to all teams concurrently.",
    instructions: "10 questions × 5 points = 50 points maximum. Instant scoreboard update on facilitator confirmation.",
    max_score: 50,
    status: "LOCKED",
  },
  {
    id: "chl-day3-volleyball",
    day: "Day 3",
    category: "Sports",
    engine_type: "RANK_TO_POINTS",
    name: "Girls' Volleyball Championship",
    description: "Competitive women's volleyball tournament with group matches and knockout finals.",
    instructions: "Facilitators enter finish rankings. Points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.",
    max_score: 75,
    status: "LOCKED",
    settings: { "1st": 75, "2nd": 60, "3rd": 45, "4th": 30, "5th": 20, "6th": 10 },
  },
  {
    id: "chl-day3-football",
    day: "Day 3",
    category: "Sports",
    engine_type: "RANK_TO_POINTS",
    name: "Corporate Football Championship",
    description: "Full inter-team football tournament. High intensity, tactics, and team collaboration.",
    instructions: "Facilitators enter tournament finish rankings. Points: 1st=100, 2nd=75, 3rd=60, 4th=45, 5th=30, 6th=20.",
    max_score: 100,
    status: "LOCKED",
    settings: { "1st": 100, "2nd": 75, "3rd": 60, "4th": 45, "5th": 30, "6th": 20 },
  },
  {
    id: "chl-day3-relay",
    day: "Day 3",
    category: "Sports",
    engine_type: "RANK_TO_POINTS",
    name: "4×100m Track Relay Race",
    description: "Speed and baton handover sprint showdown featuring mixed gender relay runners.",
    instructions: "Facilitators enter sprint rankings. Points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.",
    max_score: 50,
    status: "LOCKED",
    settings: { "1st": 50, "2nd": 40, "3rd": 30, "4th": 20, "5th": 10, "6th": 5 },
  },
  {
    id: "chl-day3-tug-of-war",
    day: "Day 3",
    category: "Sports",
    engine_type: "RANK_TO_POINTS",
    name: "Grand Tug of War Final",
    description: "The ultimate test of collective power, grip, and team resilience.",
    instructions: "Facilitators enter tournament finish rankings. Points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.",
    max_score: 75,
    status: "LOCKED",
    settings: { "1st": 75, "2nd": 60, "3rd": 45, "4th": 30, "5th": 20, "6th": 10 },
  },
];

const INITIAL_TEAMS: TeamItem[] = [
  { id: "team-1", name: "Team 1", custom_name: "Red Phoenix", logo: "🔥", color: "#EF4444", motto: "Igniting Excellence & Passion", total_points: 0, rank: 1, member_count: 10 },
  { id: "team-2", name: "Team 2", custom_name: "Blue Falcons", logo: "🦅", color: "#3B82F6", motto: "Soaring Above All Limits", total_points: 0, rank: 2, member_count: 10 },
  { id: "team-3", name: "Team 3", custom_name: "Golden Titans", logo: "⚡", color: "#F59E0B", motto: "Power, Intellect, Victory", total_points: 0, rank: 3, member_count: 10 },
  { id: "team-4", name: "Team 4", custom_name: "Emerald Lions", logo: "🦁", color: "#10B981", motto: "Courage in Every Stride", total_points: 0, rank: 4, member_count: 10 },
  { id: "team-5", name: "Team 5", custom_name: "Purple Vipers", logo: "🐍", color: "#8B5CF6", motto: "Speed, Precision & Synergy", total_points: 0, rank: 5, member_count: 10 },
  { id: "team-6", name: "Team 6", custom_name: "Silver Sharks", logo: "🦈", color: "#06B6D4", motto: "Relentless Focus & Tenacity", total_points: 0, rank: 6, member_count: 10 },
];

export default function QuestCommandDeskPage() {
  const params = useParams();
  const questId = (params?.id as string) || "qst-reignite-2026";
  const { users } = useERPStore();

  const [activeTab, setActiveTab] = useState<"overview" | "roster" | "challenges" | "concepts" | "audit" | "scoreboard">("overview");
  const [teams, setTeams] = useState<TeamItem[]>(INITIAL_TEAMS);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>(DEFAULT_CHALLENGES);
  const [concepts, setConcepts] = useState<ConceptItem[]>([]);
  const [scoreAudits, setScoreAudits] = useState<ScoreAuditItem[]>([]);
  const [dayFilter, setDayFilter] = useState<string>("ALL");

  // Scoring Modal State
  const [scoringModal, setScoringModal] = useState<{
    open: boolean;
    challenge: ChallengeItem | null;
    teamScores: Record<string, number>;
    rankings: Record<string, string>;
    participation: Record<string, string[]>; // teamId -> list of userId who participated
    reason: string;
  }>({
    open: false,
    challenge: null,
    teamScores: {},
    rankings: {},
    participation: {},
    reason: "Facilitator Verified Evaluation",
  });

  // Confirmation Modal
  const [confirmPublishModal, setConfirmPublishModal] = useState(false);

  // Edit Team Modal
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);

  // Manual Assign Modal
  const [manualAssignModal, setManualAssignModal] = useState<{ open: boolean; selectedUser: User | null; teamId: string }>({
    open: false,
    selectedUser: null,
    teamId: "team-1",
  });

  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Load initial quest data from backend / local state
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/erp/quests/detail?id=${questId}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.teams && data.teams.length > 0) {
            setTeams(data.teams);
          }
          if (data.challenges && data.challenges.length > 0) {
            setChallenges(data.challenges);
          }
          if (data.participants) {
            setParticipants(data.participants);
          }
          if (data.concepts) {
            setConcepts(data.concepts);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live quest details:", err);
      }
    }
    loadData();
  }, [questId]);

  // Handle 1-Click Auto-Balance across staff pool
  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    try {
      const res = await fetch(`/api/erp/quests/participants/auto-assign?quest_id=${questId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.participants) {
          setParticipants(data.participants);
        }
        if (data.teams) {
          setTeams(data.teams);
        }
        alert(data.message || "Staff successfully balanced across 6 teams!");
      }
    } catch (err) {
      alert("Failed to auto-assign staff: " + err);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  // Handle manual staff assignment
  const handleAssignUser = async (user: User, teamId: string) => {
    try {
      const res = await fetch(`/api/erp/quests/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quest_id: questId,
          team_id: teamId,
          user_id: user.id,
          user_name: user.name,
          user_email: user.email,
          department: user.department,
          avatar: user.avatar || "/character1.jpg",
          role: "member",
        }),
      });
      if (res.ok) {
        const newP = await res.json();
        setParticipants((prev) => [...prev.filter((p) => p.user_id !== user.id), newP]);
        // Update local team count
        setTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, member_count: t.member_count + 1 } : t))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle captain role
  const handleToggleCaptain = async (p: ParticipantItem) => {
    const newRole = p.role === "captain" ? "member" : "captain";
    setParticipants((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, role: newRole } : item.team_id === p.team_id && newRole === "captain" ? { ...item, role: "member" } : item))
    );
  };

  // Challenge Status Toggle
  const handleToggleChallengeStatus = async (chl: ChallengeItem, newStatus: ChallengeItem["status"]) => {
    setChallenges((prev) => prev.map((c) => (c.id === chl.id ? { ...c, status: newStatus } : c)));
    try {
      await fetch(`/api/erp/quests/challenges`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chl.id, status: newStatus }),
      });
    } catch (e) {}
  };

  // Open Score Entry Modal
  const openScoringModal = (chl: ChallengeItem) => {
    const initialScores: Record<string, number> = {};
    const initialRankings: Record<string, string> = {};
    teams.forEach((t) => {
      initialScores[t.id] = 0;
      initialRankings[t.id] = "1st";
    });
    setScoringModal({
      open: true,
      challenge: chl,
      teamScores: initialScores,
      rankings: initialRankings,
      participation: {},
      reason: `Facilitator Scoring for ${chl.name}`,
    });
  };

  // Publish Scores (With Confirmation)
  const handlePublishScores = async () => {
    if (!scoringModal.challenge) return;
    const chl = scoringModal.challenge;

    for (const team of teams) {
      let pts = scoringModal.teamScores[team.id] || 0;

      // Handle Rank-to-points
      if (chl.engine_type === "RANK_TO_POINTS" && chl.settings) {
        const rank = scoringModal.rankings[team.id] || "6th";
        pts = chl.settings[rank] || 0;
      }

      // Handle Participation points
      if (chl.engine_type === "PARTICIPATION") {
        const teamParticipants = participants.filter((p) => p.team_id === team.id);
        const count = scoringModal.participation[team.id]?.length || 0;
        const total = teamParticipants.length || 10;
        pts = Math.round((count / total) * chl.max_score);
      }

      try {
        const res = await fetch(`/api/erp/quests/scores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quest_id: questId,
            challenge_id: chl.id,
            challenge_name: chl.name,
            team_id: team.id,
            team_name: team.custom_name || team.name,
            points: pts,
            max_points: chl.max_score,
            reason: scoringModal.reason,
            scored_by: "Game Facilitator",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.leaderboard) {
            setTeams(data.leaderboard);
          }
          if (data.audit) {
            setScoreAudits((prev) => [data.audit, ...prev]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Mark challenge completed
    handleToggleChallengeStatus(chl, "COMPLETED");
    setConfirmPublishModal(false);
    setScoringModal((prev) => ({ ...prev, open: false, challenge: null }));
    alert(`Scores published for ${chl.name}! The live leaderboard has been updated.`);
  };

  // Approve / Lock Concept
  const handleConceptAction = async (conceptId: string, status: "APPROVED" | "REJECTED") => {
    setConcepts((prev) =>
      prev.map((c) => (c.id === conceptId ? { ...c, status, locked_by: "Chief Facilitator" } : c))
    );
    try {
      await fetch(`/api/erp/quests/concepts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: conceptId, status, locked_by: "Chief Facilitator" }),
      });
    } catch (e) {}
  };

  // Filtered Challenges
  const filteredChallenges = challenges.filter((c) => {
    if (dayFilter === "ALL") return true;
    return c.day === dayFilter;
  });

  const leadingTeam = [...teams].sort((a, b) => b.total_points - a.total_points)[0] || teams[0];
  const assignedCount = participants.length;

  return (
    <BusinessShell
      title="REIGNITE 2026: Facilitator Command Center"
      subtitle="Corporate Team Championship · 60 Staff · 6 Teams · 11 Quests · ₦500,000 Grand Prize"
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/quests/reignite-2026/scoreboard" target="_blank">
            <NexaButton size="sm" variant="outline" className="rounded-full" leftIcon={<Tv className="w-4 h-4 text-blue-600" />}>
              Arena TV Scoreboard
            </NexaButton>
          </Link>
          <NexaButton
            size="sm"
            variant="primary"
            className="rounded-full bg-blue-600 text-white"
            onClick={handleAutoAssign}
            disabled={isAutoAssigning}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {isAutoAssigning ? "Auto-Balancing..." : "1-Click Auto-Balance 60 Staff"}
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP 4 KPI CARDS */}
        <ErpStatGrid
          stats={[
            {
              label: "Leading Squad Standings",
              value: `${leadingTeam.total_points} pts`,
              change: `Rank #1: ${leadingTeam.custom_name || leadingTeam.name}`,
              trend: "up",
              icon: <Trophy className="w-5 h-5 text-amber-500" />,
              sub: "850 Total Points Available",
            },
            {
              label: "Staff Pool Enrolled",
              value: `${assignedCount} / 60 Staff`,
              change: `${teams.length} Balanced Squads`,
              trend: "up",
              icon: <Users className="w-5 h-5 text-blue-500" />,
              sub: "Live NETS Employee Directory",
            },
            {
              label: "Completed Quests",
              value: `${challenges.filter((c) => c.status === "COMPLETED").length} of ${challenges.length} Done`,
              change: "Day 1 to Day 3 Program",
              trend: "up",
              icon: <Target className="w-5 h-5 text-purple-500" />,
              sub: "5 Evaluation Engines Live",
            },
            {
              label: "Grand Championship Prize",
              value: "₦500,000",
              change: "Winner Takes All",
              trend: "up",
              icon: <Award className="w-5 h-5 text-emerald-500" />,
              sub: "Day 3 Grand Finale",
            },
          ]}
        />

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
          {[
            { id: "overview", label: "Live Overview & Arena Standings", icon: Flame },
            { id: "roster", label: `Staff Pool & Team Builder (${assignedCount}/60)`, icon: Users },
            { id: "challenges", label: `Quest Engine & Scoring (${challenges.length})`, icon: Target },
            { id: "concepts", label: `Concept Lock Desk (${concepts.length})`, icon: Lock },
            { id: "audit", label: `Score Audit Trail (${scoreAudits.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & STANDINGS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* HERO BANNER */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    🟢 CHAMPIONSHIP LIVE
                  </span>
                  <span className="text-xs font-mono text-white/80">3 Days · Epe Resort & Spa, Lagos</span>
                </div>
                <h2 className="text-2xl font-black">{leadingTeam.custom_name || leadingTeam.name} leads the Board with {leadingTeam.total_points} Points</h2>
                <p className="text-xs text-white/80 max-w-xl">
                  Facilitators can open quests, judge rubric performances, record sports rankings, lock team concepts, and broadcast score updates to the Arena Scoreboard.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/quests/reignite-2026/scoreboard" target="_blank">
                  <NexaButton size="md" variant="secondary" className="bg-white text-blue-700 font-bold rounded-full hover:bg-gray-100" leftIcon={<Tv className="w-4 h-4" />}>
                    Launch Scoreboard TV
                  </NexaButton>
                </Link>
              </div>
            </div>

            {/* LEADERBOARD CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team, idx) => (
                <NexaCard key={team.id} variant="glass" padding="md" className="rounded-3xl border-l-4 space-y-3" style={{ borderLeftColor: team.color }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{team.logo}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-850">{team.custom_name || team.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{team.name} · {team.motto}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      idx === 0 ? "bg-amber-100 text-amber-800" : idx === 1 ? "bg-slate-200 text-slate-700" : idx === 2 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-slate-500"
                    }`}>
                      Rank #{team.rank}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Total Score:</span>
                      <p className="font-black text-slate-800 text-sm">{team.total_points} / 850 pts</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Squad Roster:</span>
                      <p className="font-bold text-slate-700 text-sm">{participants.filter((p) => p.team_id === team.id).length} Members</p>
                    </div>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STAFF POOL & TEAM BUILDER ROSTER */}
        {activeTab === "roster" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-blue-50 border border-blue-100">
              <div>
                <h3 className="font-bold text-slate-850 text-sm">Staff Pool Roster & Team Builder</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Participants are automatically drawn from the active tenant directory. Use 1-Click Auto-Balance to evenly mix 60 staff members across 6 teams by department.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <NexaButton
                  size="sm"
                  variant="primary"
                  className="rounded-full bg-blue-600 text-white"
                  onClick={handleAutoAssign}
                  disabled={isAutoAssigning}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  {isAutoAssigning ? "Balancing..." : "1-Click Auto-Distribute (60 Staff)"}
                </NexaButton>
              </div>
            </div>

            {/* 6 TEAM COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => {
                const teamMembers = participants.filter((p) => p.team_id === team.id);
                return (
                  <NexaCard key={team.id} variant="glass" padding="md" className="rounded-3xl border-t-4 space-y-4" style={{ borderTopColor: team.color }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{team.logo}</span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-850">{team.custom_name || team.name}</h4>
                          <p className="text-[10px] text-slate-400">{teamMembers.length} / 10 Members Assigned</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                        title="Edit Team Name / Motto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* MEMBER ROSTER LIST */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {teamMembers.length > 0 ? (
                        teamMembers.map((m) => (
                          <div key={m.id} className="p-2 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <img src={m.avatar} alt={m.user_name} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                              <div>
                                <p className="font-bold text-slate-800 text-[11px] leading-tight flex items-center gap-1">
                                  {m.user_name}
                                  {m.role === "captain" && (
                                    <span className="text-amber-500" title="Team Captain">⭐</span>
                                  )}
                                </p>
                                <p className="text-[9px] text-slate-400 font-medium truncate max-w-[120px]">{m.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleCaptain(m)}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                                  m.role === "captain" ? "bg-amber-100 text-amber-800" : "text-slate-400 hover:bg-gray-200"
                                }`}
                                title="Toggle Captain"
                              >
                                {m.role === "captain" ? "Captain" : "Make Captain"}
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                          No staff assigned yet. Click Auto-Balance above.
                        </div>
                      )}
                    </div>
                  </NexaCard>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CHALLENGES & SCORING ENGINES */}
        {activeTab === "challenges" && (
          <div className="space-y-6">
            {/* DAY FILTER */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                {["ALL", "Day 1", "Day 2", "Day 3"].map((day) => (
                  <button
                    key={day}
                    onClick={() => setDayFilter(day)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      dayFilter === day
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Showing {filteredChallenges.length} Quests ({challenges.reduce((sum, c) => sum + c.max_score, 0)} Total Points)
              </span>
            </div>

            {/* CHALLENGES TABLE / CARDS */}
            <div className="space-y-3.5">
              {filteredChallenges.map((chl) => (
                <NexaCard key={chl.id} variant="glass" padding="md" className="rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        {chl.day}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                        {chl.category}
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                        Engine: {chl.engine_type}
                      </span>
                      <span className="font-black text-xs text-emerald-700">+{chl.max_score} pts</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-850">{chl.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{chl.description}</p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        chl.status === "OPEN" || chl.status === "IN_PROGRESS"
                          ? "bg-emerald-100 text-emerald-800"
                          : chl.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-slate-400"
                      }`}>
                        {chl.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {chl.status === "LOCKED" ? (
                        <button
                          onClick={() => handleToggleChallengeStatus(chl, "OPEN")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Open Quest
                        </button>
                      ) : chl.status === "OPEN" || chl.status === "IN_PROGRESS" ? (
                        <>
                          <button
                            onClick={() => openScoringModal(chl)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5" /> Score Activity
                          </button>
                          <button
                            onClick={() => handleToggleChallengeStatus(chl, "LOCKED")}
                            className="px-2.5 py-1.5 bg-gray-100 text-slate-600 hover:bg-gray-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                          >
                            Lock
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openScoringModal(chl)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" /> Review Scores
                        </button>
                      )}
                    </div>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONCEPT REGISTRATION DESK */}
        {activeTab === "concepts" && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-amber-900 text-sm">Core Challenge Concept Duplicate Prevention Desk</h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Teams must register and get their performance concept approved before taking the stage. Approved concepts are permanently locked so no other team can copy them.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {concepts.length > 0 ? (
                concepts.map((c) => (
                  <NexaCard key={c.id} variant="glass" padding="md" className="rounded-3xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-blue-600">{c.team_name}</span>
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {c.format}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          c.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-850 mt-1">{c.title}</h4>
                      <p className="text-xs text-slate-500">{c.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.status !== "APPROVED" && (
                        <button
                          onClick={() => handleConceptAction(c.id, "APPROVED")}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 cursor-pointer"
                        >
                          Approve & Lock
                        </button>
                      )}
                    </div>
                  </NexaCard>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No concepts submitted yet by team captains.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SCORE AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-850 text-sm">Immutable Score Modification Ledger</h3>
            <p className="text-xs text-slate-400">
              Every score awarded or adjusted is permanently recorded with the facilitator identity and timestamp to protect competition integrity.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Quest Challenge</th>
                    <th className="pb-3">Team</th>
                    <th className="pb-3">Previous</th>
                    <th className="pb-3">New Score</th>
                    <th className="pb-3">Delta</th>
                    <th className="pb-3">Facilitator</th>
                    <th className="pb-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {scoreAudits.length > 0 ? (
                    scoreAudits.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-mono text-[10px] text-slate-500">{new Date(a.created_at).toLocaleTimeString()}</td>
                        <td className="py-3 font-bold text-slate-800">{a.challenge_id}</td>
                        <td className="py-3 font-semibold text-blue-600">{a.team_id}</td>
                        <td className="py-3 text-slate-400">{a.previous_score}</td>
                        <td className="py-3 font-black text-slate-800">{a.new_score}</td>
                        <td className="py-3 font-bold text-emerald-600">+{a.new_score - a.previous_score} pts</td>
                        <td className="py-3 font-medium text-slate-600">{a.modified_by}</td>
                        <td className="py-3 text-slate-500 max-w-xs truncate">{a.reason}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold text-xs">
                        No scores recorded yet. Scores published will appear here in real time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SCORING MODAL */}
      {scoringModal.open && scoringModal.challenge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Engine: {scoringModal.challenge.engine_type}
                </span>
                <span className="text-xs font-bold text-emerald-600">Max {scoringModal.challenge.max_score} Points</span>
              </div>
              <h3 className="font-bold text-lg text-slate-850 mt-1">{scoringModal.challenge.name}</h3>
              <p className="text-xs text-slate-500">{scoringModal.challenge.instructions}</p>
            </div>

            {/* SCORING INPUTS BASED ON ENGINE TYPE */}
            <div className="space-y-4">
              {scoringModal.challenge.engine_type === "RANK_TO_POINTS" ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">Select Finish Rank per Team (Points auto-calculated):</p>
                  {teams.map((team) => (
                    <div key={team.id} className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{team.logo}</span>
                        <span className="font-bold text-xs text-slate-800">{team.custom_name || team.name}</span>
                      </div>
                      <select
                        value={scoringModal.rankings[team.id] || "1st"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setScoringModal((prev) => ({
                            ...prev,
                            rankings: { ...prev.rankings, [team.id]: val },
                          }));
                        }}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-xs text-slate-800"
                      >
                        {["1st", "2nd", "3rd", "4th", "5th", "6th"].map((r) => (
                          <option key={r} value={r}>{r} Place</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : scoringModal.challenge.engine_type === "PARTICIPATION" ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">Check participating team members:</p>
                  {teams.map((team) => {
                    const teamMembers = participants.filter((p) => p.team_id === team.id);
                    const selected = scoringModal.participation[team.id] || [];
                    return (
                      <div key={team.id} className="p-3 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{team.custom_name || team.name}</span>
                          <span className="text-[10px] font-bold text-emerald-600">{selected.length} / {teamMembers.length} Present</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {teamMembers.map((m) => (
                            <label key={m.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selected.includes(m.user_id)}
                                onChange={(e) => {
                                  const cur = selected;
                                  const next = e.target.checked ? [...cur, m.user_id] : cur.filter((id) => id !== m.user_id);
                                  setScoringModal((prev) => ({
                                    ...prev,
                                    participation: { ...prev.participation, [team.id]: next },
                                  }));
                                }}
                                className="rounded text-blue-600"
                              />
                              <span className="truncate">{m.user_name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">Enter Rubric Score (0 to {scoringModal.challenge.max_score} pts):</p>
                  {teams.map((team) => (
                    <div key={team.id} className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{team.logo}</span>
                        <span className="font-bold text-xs text-slate-800">{team.custom_name || team.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={scoringModal.challenge?.max_score}
                          value={scoringModal.teamScores[team.id] ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setScoringModal((prev) => ({
                              ...prev,
                              teamScores: { ...prev.teamScores, [team.id]: val },
                            }));
                          }}
                          className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-black text-center text-sm text-slate-800"
                        />
                        <span className="text-xs text-slate-400">/ {scoringModal.challenge?.max_score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Score Verification Note / Reason:</label>
                <input
                  type="text"
                  value={scoringModal.reason}
                  onChange={(e) => setScoringModal((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
              <button
                onClick={() => setScoringModal((prev) => ({ ...prev, open: false, challenge: null }))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setConfirmPublishModal(true)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Verify & Publish Scores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION PUBLISH MODAL */}
      {confirmPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-850">Publish Scores to Live Scoreboard?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to publish these scores? This will immediately recalculate the live team leaderboard and record an entry in the score audit ledger.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmPublishModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handlePublishScores}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                YES — PUBLISH NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TEAM MODAL */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-850">Edit Squad Branding ({editingTeam.name})</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Custom Team Name:</label>
                <input
                  type="text"
                  value={editingTeam.custom_name || ""}
                  onChange={(e) => setEditingTeam({ ...editingTeam, custom_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Team Motto / Chant:</label>
                <input
                  type="text"
                  value={editingTeam.motto || ""}
                  onChange={(e) => setEditingTeam({ ...editingTeam, motto: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setEditingTeam(null)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button
                onClick={async () => {
                  setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? editingTeam : t)));
                  await fetch(`/api/erp/quests/teams`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editingTeam),
                  }).catch(() => {});
                  setEditingTeam(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessShell>
  );
}
