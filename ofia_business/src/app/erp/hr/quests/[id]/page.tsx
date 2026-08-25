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
  AlertCircle,
  MapPin,
  ListOrdered,
  ChevronRight,
  Radio
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

interface ScheduleItem {
  id: string;
  quest_id: string;
  day: string;
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  category: string;
  location: string;
  challenge_id?: string;
  max_score?: number;
  facilitator_notes?: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  order_index: number;
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

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  // Day 1
  { id: "sch-d1-01", quest_id: "qst-reignite-2026", day: "Day 1", start_time: "09:00 AM", end_time: "11:00 AM", title: "Executive Arrival & Hotel Check-in", description: "Delegates arrive at Epe Resort & Conference Centre, pick up badge credentials and retreat kits.", category: "Arrival", location: "Resort Lobby & Reception", status: "COMPLETED", order_index: 1 },
  { id: "sch-d1-02", quest_id: "qst-reignite-2026", day: "Day 1", start_time: "11:30 AM", end_time: "01:00 PM", title: "Welcome Address & Opening Ceremony", description: "Opening remarks by MD/CEO, unveiling of the REIGNITE 2026 Theme, rules, and grand ₦500,000 prize.", category: "Ceremony", location: "Main Conference Auditorium", status: "COMPLETED", order_index: 2 },
  { id: "sch-d1-03", quest_id: "qst-reignite-2026", day: "Day 1", start_time: "01:00 PM", end_time: "02:30 PM", title: "Networking Lunch & Squad Formations", description: "Delegates break into assigned 10-person squads across 6 tables for strategy and bonding.", category: "Meal", location: "Dining Pavilion", status: "COMPLETED", order_index: 3 },
  { id: "sch-d1-04", quest_id: "qst-reignite-2026", day: "Day 1", start_time: "03:00 PM", end_time: "04:30 PM", title: "Quest 1: Team Identity Presentation", description: "Each team takes the stage to present their custom Name, Motto, Pose, and Team Chant.", category: "Challenge", location: "Outdoor Amphitheatre", challenge_id: "chl-day1-identity", max_score: 50, facilitator_notes: "5 minutes per team. Judged across creativity, teamwork, energy, and delivery.", status: "LIVE", order_index: 4 },
  { id: "sch-d1-05", quest_id: "qst-reignite-2026", day: "Day 1", start_time: "05:00 PM", end_time: "06:30 PM", title: "Quest 2: Who Are We? (5 Incredible Things)", description: "Every team member shares 5 unique facts about their journey and how the company shaped them.", category: "Challenge", location: "Outdoor Amphitheatre", challenge_id: "chl-day1-who-are-we", max_score: 50, facilitator_notes: "Participation engine: 100% active member sharing awards maximum 50 points.", status: "UPCOMING", order_index: 5 },
  { id: "sch-d1-06", quest_id: "qst-reignite-2026", day: "Day 1", start_time: "07:30 PM", end_time: "10:00 PM", title: "Quest 3: Card Games & Karaoke Fun", description: "Evening bonding featuring interactive board/card games, karaoke battles, and social connection.", category: "Challenge", location: "Poolside Lounge", challenge_id: "chl-day1-games", max_score: 50, facilitator_notes: "Spirit & sportsmanship rubric scoring.", status: "UPCOMING", order_index: 6 },
  // Day 2
  { id: "sch-d2-01", quest_id: "qst-reignite-2026", day: "Day 2", start_time: "07:30 AM", end_time: "08:30 AM", title: "Energy Breakfast & Daily Briefing", description: "Full breakfast buffet and facilitator announcements for Day 2 schedule.", category: "Meal", location: "Dining Pavilion", status: "UPCOMING", order_index: 7 },
  { id: "sch-d2-02", quest_id: "qst-reignite-2026", day: "Day 2", start_time: "09:00 AM", end_time: "09:30 AM", title: "Core Challenge Concept Registration Deadline", description: "Team captains must register and lock their 10-minute performance concepts to avoid topic duplication.", category: "Ceremony", location: "Facilitator Command Desk", facilitator_notes: "Duplicate lock enforced by Chief Facilitator.", status: "UPCOMING", order_index: 8 },
  { id: "sch-d2-03", quest_id: "qst-reignite-2026", day: "Day 2", start_time: "10:00 AM", end_time: "01:00 PM", title: "Quest 4: REIGNITE — The Core Challenge", description: "10-minute theatrical, musical, or innovation presentations bringing the REIGNITE theme to life.", category: "Challenge", location: "Main Auditorium Stage", challenge_id: "chl-day2-core-challenge", max_score: 200, facilitator_notes: "6 rubric dimensions (40, 40, 30, 30, 30, 30 = 200 pts).", status: "UPCOMING", order_index: 9 },
  { id: "sch-d2-04", quest_id: "qst-reignite-2026", day: "Day 2", start_time: "01:00 PM", end_time: "02:30 PM", title: "Power Lunch & Mid-Day Recharge", description: "Buffet lunch, rest, and preparation for the afternoon agility and trivia rounds.", category: "Meal", location: "Dining Pavilion", status: "UPCOMING", order_index: 10 },
  { id: "sch-d2-05", quest_id: "qst-reignite-2026", day: "Day 2", start_time: "03:00 PM", end_time: "04:00 PM", title: "Quest 5: Egg & Spoon Agility Race", description: "Fast-paced team balance relay requiring speed, coordination, and steady teamwork.", category: "Challenge", location: "Lawn Arena", challenge_id: "chl-day2-egg-race", max_score: 50, facilitator_notes: "Rank to points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.", status: "UPCOMING", order_index: 11 },
  { id: "sch-d2-06", quest_id: "qst-reignite-2026", day: "Day 2", start_time: "04:30 PM", end_time: "05:30 PM", title: "Quest 6: The Knowledge Quest (10 Questions)", description: "Objective corporate and industry knowledge test. Automated scoring via official answer key.", category: "Challenge", location: "Conference Hall", challenge_id: "chl-day2-quiz", max_score: 100, facilitator_notes: "10 questions × 10 points = 100 points maximum.", status: "UPCOMING", order_index: 12 },
  { id: "sch-d2-07", quest_id: "qst-reignite-2026", day: "Day 2", start_time: "06:00 PM", end_time: "07:00 PM", title: "Quest 7: Think Fast Rapid-Fire Round", description: "10 rapid-fire buzzer questions asked to all 6 teams simultaneously.", category: "Challenge", location: "Conference Hall", challenge_id: "chl-day2-think-fast", max_score: 50, facilitator_notes: "10 questions × 5 points = 50 points.", status: "UPCOMING", order_index: 13 },
  { id: "sch-d2-08", quest_id: "qst-reignite-2026", day: "Day 2", start_time: "08:00 PM", end_time: "10:00 PM", title: "Dinner & Mid-Championship Standings Broadcast", description: "Evening banquet and stage broadcast of Day 1 & Day 2 cumulative standings.", category: "Meal", location: "Grand Ballroom", status: "UPCOMING", order_index: 14 },
  // Day 3
  { id: "sch-d3-01", quest_id: "qst-reignite-2026", day: "Day 3", start_time: "07:30 AM", end_time: "08:30 AM", title: "Athletes' Warm-up & Light Breakfast", description: "High-protein breakfast and team stretching before outdoor sports championship.", category: "Meal", location: "Sports Pavilion", status: "UPCOMING", order_index: 15 },
  { id: "sch-d3-02", quest_id: "qst-reignite-2026", day: "Day 3", start_time: "09:00 AM", end_time: "10:30 AM", title: "Quest 8: Girls' Volleyball Championship", description: "Inter-squad women's volleyball tournament with group matches and finals.", category: "Sports", location: "Resort Sports Arena", challenge_id: "chl-day3-volleyball", max_score: 75, facilitator_notes: "Rank to points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.", status: "UPCOMING", order_index: 16 },
  { id: "sch-d3-03", quest_id: "qst-reignite-2026", day: "Day 3", start_time: "11:00 AM", end_time: "01:00 PM", title: "Quest 9: Corporate Football Championship", description: "Full inter-squad football tournament. Group stages, semi-finals, and championship final match.", category: "Sports", location: "Football Pitch", challenge_id: "chl-day3-football", max_score: 100, facilitator_notes: "Rank to points: 1st=100, 2nd=75, 3rd=60, 4th=45, 5th=30, 6th=20.", status: "UPCOMING", order_index: 17 },
  { id: "sch-d3-04", quest_id: "qst-reignite-2026", day: "Day 3", start_time: "01:00 PM", end_time: "02:30 PM", title: "Champions Lunch & Rest Interval", description: "Buffet lunch, rest, and warm-up for track relay and tug of war.", category: "Meal", location: "Dining Pavilion", status: "UPCOMING", order_index: 18 },
  { id: "sch-d3-05", quest_id: "qst-reignite-2026", day: "Day 3", start_time: "03:00 PM", end_time: "04:00 PM", title: "Quest 10: 4×100m Track Relay Race", description: "Sprint track showdown featuring mixed gender relay runners.", category: "Sports", location: "Running Track", challenge_id: "chl-day3-relay", max_score: 50, facilitator_notes: "Rank to points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.", status: "UPCOMING", order_index: 19 },
  { id: "sch-d3-06", quest_id: "qst-reignite-2026", day: "Day 3", start_time: "04:30 PM", end_time: "05:30 PM", title: "Quest 11: Grand Tug of War Final", description: "The ultimate contest of endurance, grip, and team synergy.", category: "Sports", location: "Central Lawn Arena", challenge_id: "chl-day3-tug-of-war", max_score: 75, facilitator_notes: "Rank to points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.", status: "UPCOMING", order_index: 20 },
  { id: "sch-d3-07", quest_id: "qst-reignite-2026", day: "Day 3", start_time: "06:30 PM", end_time: "09:00 PM", title: "Gala Awards Dinner & ₦500,000 Grand Trophy Ceremony", description: "Final banquet, leadership remarks, live scoreboard countdown, and trophy award to the Champion Squad.", category: "Awards", location: "Grand Ballroom", facilitator_notes: "Winner takes all: ₦500,000 Grand Prize.", status: "UPCOMING", order_index: 21 },
];

export default function QuestCommandDeskPage() {
  const params = useParams();
  const questId = (params?.id as string) || "qst-reignite-2026";
  const { users } = useERPStore();

  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "roster" | "challenges" | "concepts" | "audit">("overview");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [concepts, setConcepts] = useState<ConceptItem[]>([]);
  const [scoreAudits, setScoreAudits] = useState<ScoreAuditItem[]>([]);
  const [dayFilter, setDayFilter] = useState<string>("ALL");
  const [scheduleDayFilter, setScheduleDayFilter] = useState<string>("Day 1");

  // Scoring Modal State
  const [scoringModal, setScoringModal] = useState<{
    open: boolean;
    challenge: ChallengeItem | null;
    teamScores: Record<string, number>;
    rankings: Record<string, string>;
    participation: Record<string, string[]>;
    reason: string;
  }>({
    open: false,
    challenge: null,
    teamScores: {},
    rankings: {},
    participation: {},
    reason: "Facilitator Verified Evaluation",
  });

  const [confirmPublishModal, setConfirmPublishModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [newScheduleModal, setNewScheduleModal] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Form state for new schedule item
  const [newScheduleForm, setNewScheduleForm] = useState<Partial<ScheduleItem>>({
    day: "Day 1",
    start_time: "10:00 AM",
    end_time: "11:00 AM",
    title: "",
    description: "",
    category: "Challenge",
    location: "Main Auditorium",
    max_score: 0,
    facilitator_notes: "",
    status: "UPCOMING",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/erp/quests/detail?id=${questId}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.teams && data.teams.length > 0) setTeams(data.teams);
          if (data.challenges && data.challenges.length > 0) setChallenges(data.challenges);
          if (data.participants) setParticipants(data.participants);
          if (data.concepts) setConcepts(data.concepts);
          if (data.schedule && data.schedule.length > 0) setSchedule(data.schedule);
        }
      } catch (err) {
        console.warn("Failed to fetch live quest details:", err);
      }
    }
    loadData();
  }, [questId]);

  // Handle 1-Click Auto-Balance
  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    try {
      const res = await fetch(`/api/erp/quests/participants/auto-assign?quest_id=${questId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.participants) setParticipants(data.participants);
        if (data.teams) setTeams(data.teams);
        alert(data.message || "Staff successfully balanced across 6 teams!");
      }
    } catch (err) {
      alert("Failed to auto-assign staff: " + err);
    } finally {
      setIsAutoAssigning(false);
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

  // Schedule Item Status Trigger (Mark LIVE / UPCOMING / COMPLETED)
  const handleUpdateScheduleStatus = async (item: ScheduleItem, newStatus: ScheduleItem["status"]) => {
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.id === item.id) {
          return { ...s, status: newStatus };
        }
        // If marking one live, demote previous live to completed if needed
        if (newStatus === "LIVE" && s.status === "LIVE") {
          return { ...s, status: "COMPLETED" };
        }
        return s;
      })
    );

    // If this schedule item is linked to a challenge, automatically sync challenge status!
    if (item.challenge_id) {
      const chl = challenges.find((c) => c.id === item.challenge_id);
      if (chl) {
        if (newStatus === "LIVE") handleToggleChallengeStatus(chl, "OPEN");
        if (newStatus === "COMPLETED") handleToggleChallengeStatus(chl, "COMPLETED");
      }
    }

    try {
      await fetch(`/api/erp/quests/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      });
    } catch (e) {}
  };

  // Save new schedule item
  const handleCreateScheduleItem = async () => {
    if (!newScheduleForm.title) return;
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      quest_id: questId,
      day: newScheduleForm.day || "Day 1",
      start_time: newScheduleForm.start_time || "10:00 AM",
      end_time: newScheduleForm.end_time || "11:00 AM",
      title: newScheduleForm.title,
      description: newScheduleForm.description || "",
      category: newScheduleForm.category || "Challenge",
      location: newScheduleForm.location || "Main Stage",
      challenge_id: newScheduleForm.challenge_id || "",
      max_score: newScheduleForm.max_score || 0,
      facilitator_notes: newScheduleForm.facilitator_notes || "",
      status: "UPCOMING",
      order_index: schedule.length + 1,
    };

    setSchedule((prev) => [...prev, newItem]);
    setNewScheduleModal(false);
    setNewScheduleForm({ day: "Day 1", start_time: "10:00 AM", end_time: "11:00 AM", title: "", description: "", category: "Challenge", location: "Main Auditorium", max_score: 0, facilitator_notes: "", status: "UPCOMING" });

    try {
      await fetch(`/api/erp/quests/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
    } catch (e) {}
  };

  // Delete schedule item
  const handleDeleteScheduleItem = async (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/erp/quests/schedule?id=${id}`, { method: "DELETE" });
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

      if (chl.engine_type === "RANK_TO_POINTS" && chl.settings) {
        const rank = scoringModal.rankings[team.id] || "6th";
        pts = chl.settings[rank] || 0;
      }

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
          if (data.leaderboard) setTeams(data.leaderboard);
          if (data.audit) setScoreAudits((prev) => [data.audit, ...prev]);
        }
      } catch (e) {
        console.error(e);
      }
    }

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

  const leadingTeam = [...teams].sort((a, b) => b.total_points - a.total_points)[0] || {
    id: "team-1",
    name: "Team 1",
    custom_name: "Red Phoenix",
    total_points: 0,
    rank: 1,
  };

  const assignedCount = participants.length;

  const filteredSchedule = schedule.filter((s) => {
    if (scheduleDayFilter === "ALL") return true;
    return s.day === scheduleDayFilter;
  });

  const activeLiveScheduleItem = schedule.find((s) => s.status === "LIVE");

  return (
    <BusinessShell
      title="REIGNITE 2026: Facilitator Command Center"
      subtitle="Corporate Team Championship · 60 Staff · 6 Teams · 11 Quests · 21 Scheduled Events · ₦500,000 Grand Prize"
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
              label: "Configured Calendar Events",
              value: `${schedule.length} Schedule Items`,
              change: `${schedule.filter((s) => s.status === "COMPLETED").length} Completed`,
              trend: "up",
              icon: <Calendar className="w-5 h-5 text-indigo-500" />,
              sub: "3-Day Itinerary Program",
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
            { id: "schedule", label: `Event Calendar & Timeline (${schedule.length})`, icon: Calendar },
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
                  {activeLiveScheduleItem
                    ? `Current Active Session: ${activeLiveScheduleItem.title} (${activeLiveScheduleItem.start_time} - ${activeLiveScheduleItem.end_time}) at ${activeLiveScheduleItem.location}`
                    : "Facilitators can configure calendar schedules, open quests, score rubric performances, and broadcast updates live to the Arena Scoreboard."}
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

        {/* TAB 2: CONFIGURABLE EVENT CALENDAR & TIMELINE */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-indigo-50/80 border border-indigo-100">
              <div>
                <h3 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" /> Configurable 3-Day Event Calendar & Itinerary
                </h3>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Facilitators can add, reorder, edit, and mark items as "Live Now" to sync with participant countdown timers and the Arena Stage Scoreboard.
                </p>
              </div>
              <NexaButton
                size="sm"
                variant="primary"
                className="rounded-full bg-indigo-600 text-white"
                onClick={() => setNewScheduleModal(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Schedule Event
              </NexaButton>
            </div>

            {/* DAY SELECTOR FILTER */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                {["Day 1", "Day 2", "Day 3", "ALL"].map((day) => (
                  <button
                    key={day}
                    onClick={() => setScheduleDayFilter(day)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      scheduleDayFilter === day
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {filteredSchedule.length} Scheduled Activities
              </span>
            </div>

            {/* TIMELINE LIST */}
            <div className="space-y-3.5">
              {filteredSchedule.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    item.status === "LIVE"
                      ? "bg-emerald-50/70 border-emerald-300 shadow-md shadow-emerald-500/5 ring-2 ring-emerald-500/20"
                      : item.status === "COMPLETED"
                      ? "bg-gray-50/50 border-gray-100 opacity-75"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* TIME BADGE */}
                    <div className="px-3 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-center shrink-0 min-w-[100px]">
                      <span className="text-[10px] font-black text-indigo-600 uppercase block">{item.day}</span>
                      <span className="text-xs font-black text-slate-800 block">{item.start_time}</span>
                      <span className="text-[10px] text-slate-400 block">{item.end_time}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.category === "Challenge" ? "bg-purple-100 text-purple-800" : item.category === "Sports" ? "bg-blue-100 text-blue-800" : item.category === "Awards" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-slate-600"
                        }`}>
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                        </span>
                        {item.max_score ? (
                          <span className="text-xs font-black text-emerald-600">+{item.max_score} pts</span>
                        ) : null}
                      </div>

                      <h4 className="font-bold text-sm text-slate-850 flex items-center gap-2">
                        {item.title}
                        {item.status === "LIVE" && (
                          <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.2 rounded-full uppercase animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">{item.description}</p>
                      {item.facilitator_notes && (
                        <p className="text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-100 inline-block font-medium">
                          📋 Facilitator Guide: {item.facilitator_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {item.status !== "LIVE" && (
                      <button
                        onClick={() => handleUpdateScheduleStatus(item, "LIVE")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                        title="Broadcast as Live Session on TV"
                      >
                        <Radio className="w-3 h-3" /> Mark Live
                      </button>
                    )}
                    {item.status === "LIVE" && (
                      <button
                        onClick={() => handleUpdateScheduleStatus(item, "COMPLETED")}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Finish Event
                      </button>
                    )}
                    <button
                      onClick={() => setEditingScheduleItem(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteScheduleItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STAFF POOL & TEAM BUILDER ROSTER */}
        {activeTab === "roster" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-blue-50 border border-blue-100">
              <div>
                <h3 className="font-bold text-slate-850 text-sm">Staff Pool Roster & Team Builder</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Participants are automatically drawn from the active tenant directory. Use 1-Click Auto-Balance to evenly mix 60 staff members across 6 teams by department.
                </p>
              </div>
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
                            <button
                              onClick={() => handleToggleCaptain(m)}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                                m.role === "captain" ? "bg-amber-100 text-amber-800" : "text-slate-400 hover:bg-gray-200"
                              }`}
                            >
                              {m.role === "captain" ? "Captain" : "Make Captain"}
                            </button>
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

        {/* TAB 4: CHALLENGES & SCORING ENGINES */}
        {activeTab === "challenges" && (
          <div className="space-y-6">
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
                Showing {challenges.filter((c) => dayFilter === "ALL" || c.day === dayFilter).length} Quests ({challenges.reduce((sum, c) => sum + c.max_score, 0)} Total Points)
              </span>
            </div>

            <div className="space-y-3.5">
              {challenges.filter((c) => dayFilter === "ALL" || c.day === dayFilter).map((chl) => (
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
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      chl.status === "OPEN" || chl.status === "IN_PROGRESS"
                        ? "bg-emerald-100 text-emerald-800"
                        : chl.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-slate-400"
                    }`}>
                      {chl.status}
                    </span>

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

        {/* TAB 5: CONCEPT REGISTRATION DESK */}
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

        {/* TAB 6: SCORE AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-850 text-sm">Immutable Score Modification Ledger</h3>
            <p className="text-xs text-slate-400">
              Every score awarded or adjusted is permanently recorded with facilitator identity and timestamp to protect competition integrity.
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
                        No score modifications logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT SCHEDULE EVENT MODAL */}
      {(newScheduleModal || editingScheduleItem) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-850">
              {editingScheduleItem ? "Edit Schedule Activity" : "Add Calendar Activity"}
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Day:</label>
                  <select
                    value={editingScheduleItem ? editingScheduleItem.day : newScheduleForm.day}
                    onChange={(e) => {
                      if (editingScheduleItem) setEditingScheduleItem({ ...editingScheduleItem, day: e.target.value });
                      else setNewScheduleForm({ ...newScheduleForm, day: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="Day 1">Day 1</option>
                    <option value="Day 2">Day 2</option>
                    <option value="Day 3">Day 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Start Time:</label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={editingScheduleItem ? editingScheduleItem.start_time : newScheduleForm.start_time}
                    onChange={(e) => {
                      if (editingScheduleItem) setEditingScheduleItem({ ...editingScheduleItem, start_time: e.target.value });
                      else setNewScheduleForm({ ...newScheduleForm, start_time: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">End Time:</label>
                  <input
                    type="text"
                    placeholder="10:30 AM"
                    value={editingScheduleItem ? editingScheduleItem.end_time : newScheduleForm.end_time}
                    onChange={(e) => {
                      if (editingScheduleItem) setEditingScheduleItem({ ...editingScheduleItem, end_time: e.target.value });
                      else setNewScheduleForm({ ...newScheduleForm, end_time: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Activity Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Quest 8: Girls' Volleyball Championship"
                  value={editingScheduleItem ? editingScheduleItem.title : newScheduleForm.title}
                  onChange={(e) => {
                    if (editingScheduleItem) setEditingScheduleItem({ ...editingScheduleItem, title: e.target.value });
                    else setNewScheduleForm({ ...newScheduleForm, title: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={editingScheduleItem ? editingScheduleItem.category : newScheduleForm.category}
                    onChange={(e) => {
                      if (editingScheduleItem) setEditingScheduleItem({ ...editingScheduleItem, category: e.target.value });
                      else setNewScheduleForm({ ...newScheduleForm, category: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="Challenge">Quest Challenge</option>
                    <option value="Sports">Sports & Physical</option>
                    <option value="Ceremony">Ceremony / Briefing</option>
                    <option value="Meal">Meal / Break</option>
                    <option value="Arrival">Arrival / Check-in</option>
                    <option value="Awards">Awards & Grand Finale</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Venue / Location:</label>
                  <input
                    type="text"
                    placeholder="e.g. Lawn Arena"
                    value={editingScheduleItem ? editingScheduleItem.location : newScheduleForm.location}
                    onChange={(e) => {
                      if (editingScheduleItem) setEditingScheduleItem({ ...editingScheduleItem, location: e.target.value });
                      else setNewScheduleForm({ ...newScheduleForm, location: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={editingScheduleItem ? editingScheduleItem.description : newScheduleForm.description}
                  onChange={(e) => {
                    if (editingScheduleItem) setEditingScheduleItem({ ...editingScheduleItem, description: e.target.value });
                    else setNewScheduleForm({ ...newScheduleForm, description: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Facilitator Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Official answer key required / 5 min timer"
                  value={editingScheduleItem ? editingScheduleItem.facilitator_notes : newScheduleForm.facilitator_notes}
                  onChange={(e) => {
                    if (editingScheduleItem) setEditingScheduleItem({ ...editingScheduleItem, facilitator_notes: e.target.value });
                    else setNewScheduleForm({ ...newScheduleForm, facilitator_notes: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setNewScheduleModal(false);
                  setEditingScheduleItem(null);
                }}
                className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (editingScheduleItem) {
                    setSchedule((prev) => prev.map((s) => (s.id === editingScheduleItem.id ? editingScheduleItem : s)));
                    await fetch(`/api/erp/quests/schedule`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(editingScheduleItem),
                    }).catch(() => {});
                    setEditingScheduleItem(null);
                  } else {
                    handleCreateScheduleItem();
                  }
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Save Schedule Event
              </button>
            </div>
          </div>
        </div>
      )}

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
