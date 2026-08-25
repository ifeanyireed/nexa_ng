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
  initial?: string;
  total_points: number;
  rank: number;
  captain_id?: string;
  member_count: number;
  status?: "ACTIVE" | "INACTIVE";
}

const DEFAULT_TEAMS_A_TO_J: TeamItem[] = [
  { id: "team-1", name: "Team Alpha (Blue Eagles)", motto: "Swift, Strategic, Unstoppable", logo: "", color: "#1A56DB", total_points: 840, rank: 1, member_count: 10, status: "ACTIVE" },
  { id: "team-2", name: "Team Bravo (Red Vipers)", motto: "Relentless Speed & Precision", logo: "", color: "#EF4444", total_points: 795, rank: 2, member_count: 10, status: "ACTIVE" },
  { id: "team-3", name: "Team Delta (Green Lions)", motto: "Courage in Every Stride", logo: "", color: "#10B981", total_points: 710, rank: 3, member_count: 10, status: "ACTIVE" },
  { id: "team-4", name: "Team Charlie (Gold Titans)", motto: "Power, Intellect, Victory", logo: "", color: "#F59E0B", total_points: 650, rank: 4, member_count: 10, status: "ACTIVE" },
  { id: "team-5", name: "Team Echo (Silver Wolves)", motto: "Silent, United, Lethal", logo: "", color: "#64748B", total_points: 590, rank: 5, member_count: 10, status: "ACTIVE" },
  { id: "team-6", name: "Team Foxtrot (Iron Rhinos)", motto: "Unbreakable Resolve", logo: "", color: "#8B5CF6", total_points: 530, rank: 6, member_count: 10, status: "ACTIVE" },
  { id: "team-7", name: "Team Golf (Shadow Panthers)", motto: "Agile & Stealth Champions", logo: "", color: "#0EA5E9", total_points: 0, rank: 7, member_count: 0, status: "INACTIVE" },
  { id: "team-8", name: "Team Hotel (Solar Hawks)", motto: "Rising Above All Limits", logo: "", color: "#EC4899", total_points: 0, rank: 8, member_count: 0, status: "INACTIVE" },
  { id: "team-9", name: "Team India (Thunder Bulls)", motto: "Raw Energy & Team Power", logo: "", color: "#14B8A6", total_points: 0, rank: 9, member_count: 0, status: "INACTIVE" },
  { id: "team-10", name: "Team Juliet (Cyber Dragons)", motto: "Future Leaders of the Arena", logo: "", color: "#6366F1", total_points: 0, rank: 10, member_count: 0, status: "INACTIVE" },
];

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

const DEFAULT_CHALLENGES: ChallengeItem[] = [
  // Day 1
  {
    id: "chl-day1-identity",
    day: "Day 1",
    category: "Challenge",
    engine_type: "RUBRIC",
    name: "Quest 1: Team Identity Presentation",
    description: "Each team takes the stage to present their custom Name, Motto, Pose, and Team Chant.",
    instructions: "5 minutes per team. Judged across creativity, teamwork, energy, and delivery.",
    max_score: 50,
    status: "OPEN",
    rubric: [
      { criterion: "Theme Alignment & Custom Identity", max_points: 15 },
      { criterion: "Team Energy & Delivery", max_points: 15 },
      { criterion: "Chant & Pose Synchronization", max_points: 20 },
    ],
  },
  {
    id: "chl-day1-who-are-we",
    day: "Day 1",
    category: "Challenge",
    engine_type: "PARTICIPATION",
    name: "Quest 2: Who Are We? (5 Incredible Things)",
    description: "Every team member shares 5 unique facts about their journey and how the company shaped them.",
    instructions: "Participation engine: 100% active member sharing awards maximum 50 points.",
    max_score: 50,
    status: "LOCKED",
  },
  {
    id: "chl-day1-games",
    day: "Day 1",
    category: "Challenge",
    engine_type: "RUBRIC",
    name: "Quest 3: Card Games & Karaoke Fun",
    description: "Evening bonding featuring interactive board/card games, karaoke battles, and social connection.",
    instructions: "Spirit & sportsmanship rubric scoring.",
    max_score: 50,
    status: "LOCKED",
    rubric: [
      { criterion: "Karaoke Performance & Crowd Engagement", max_points: 25 },
      { criterion: "Board & Card Game Mastery", max_points: 25 },
    ],
  },
  // Day 2
  {
    id: "chl-day2-core-challenge",
    day: "Day 2",
    category: "Challenge",
    engine_type: "RUBRIC",
    name: "Quest 4: REIGNITE — The Core Challenge",
    description: "10-minute theatrical, musical, or innovation presentations bringing the REIGNITE theme to life.",
    instructions: "6 rubric dimensions (40, 40, 30, 30, 30, 30 = 200 pts total).",
    max_score: 200,
    status: "LOCKED",
    rubric: [
      { criterion: "Creativity & Originality", max_points: 40 },
      { criterion: "Theme Alignment (REIGNITE)", max_points: 40 },
      { criterion: "Teamwork & Total Member Participation", max_points: 30 },
      { criterion: "Stage Execution & Delivery", max_points: 30 },
      { criterion: "Innovation & Strategic Thinking", max_points: 30 },
      { criterion: "Overall Audience Impact", max_points: 30 },
    ],
  },
  {
    id: "chl-day2-egg-race",
    day: "Day 2",
    category: "Sports",
    engine_type: "RANK_TO_POINTS",
    name: "Quest 5: Egg & Spoon Agility Race",
    description: "Fast-paced team balance relay requiring speed, coordination, and steady teamwork.",
    instructions: "Rank to points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.",
    max_score: 50,
    status: "LOCKED",
    settings: { "1st": 50, "2nd": 40, "3rd": 30, "4th": 20, "5th": 10, "6th": 5 },
  },
  {
    id: "chl-day2-quiz",
    day: "Day 2",
    category: "Trivia",
    engine_type: "QUIZ",
    name: "Quest 6: The Knowledge Quest (10 Questions)",
    description: "Objective corporate and industry knowledge test. Automated scoring via official answer key.",
    instructions: "10 questions × 10 points = 100 points maximum.",
    max_score: 100,
    status: "LOCKED",
  },
  {
    id: "chl-day2-think-fast",
    day: "Day 2",
    category: "Trivia",
    engine_type: "QUIZ",
    name: "Quest 7: Think Fast Rapid-Fire Round",
    description: "10 rapid-fire buzzer questions asked to all 6 teams simultaneously.",
    instructions: "10 questions × 5 points = 50 points.",
    max_score: 50,
    status: "LOCKED",
  },
  // Day 3
  {
    id: "chl-day3-volleyball",
    day: "Day 3",
    category: "Sports",
    engine_type: "RANK_TO_POINTS",
    name: "Quest 8: Girls' Volleyball Championship",
    description: "Inter-squad women's volleyball tournament with group matches and finals.",
    instructions: "Rank to points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.",
    max_score: 75,
    status: "LOCKED",
    settings: { "1st": 75, "2nd": 60, "3rd": 45, "4th": 30, "5th": 20, "6th": 10 },
  },
  {
    id: "chl-day3-football",
    day: "Day 3",
    category: "Sports",
    engine_type: "RANK_TO_POINTS",
    name: "Quest 9: Corporate Football Championship",
    description: "Full inter-squad football tournament. Group stages, semi-finals, and championship final match.",
    instructions: "Rank to points: 1st=100, 2nd=75, 3rd=60, 4th=45, 5th=30, 6th=20.",
    max_score: 100,
    status: "LOCKED",
    settings: { "1st": 100, "2nd": 75, "3rd": 60, "4th": 45, "5th": 30, "6th": 20 },
  },
  {
    id: "chl-day3-relay",
    day: "Day 3",
    category: "Sports",
    engine_type: "RANK_TO_POINTS",
    name: "Quest 10: 4×100m Track Relay Race",
    description: "Sprint track showdown featuring mixed gender relay runners.",
    instructions: "Rank to points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.",
    max_score: 50,
    status: "LOCKED",
    settings: { "1st": 50, "2nd": 40, "3rd": 30, "4th": 20, "5th": 10, "6th": 5 },
  },
  {
    id: "chl-day3-tug-of-war",
    day: "Day 3",
    category: "Sports",
    engine_type: "RANK_TO_POINTS",
    name: "Quest 11: Grand Tug of War Final",
    description: "The ultimate contest of endurance, grip, and team synergy.",
    instructions: "Rank to points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.",
    max_score: 75,
    status: "LOCKED",
    settings: { "1st": 75, "2nd": 60, "3rd": 45, "4th": 30, "5th": 20, "6th": 10 },
  },
];

export default function QuestCommandDeskPage() {
  const params = useParams();
  const questId = (params?.id as string) || "qst-reignite-2026";
  const { users } = useERPStore();

  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "roster" | "challenges" | "concepts" | "audit">("overview");
  const [teams, setTeams] = useState<TeamItem[]>(DEFAULT_TEAMS_A_TO_J);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>(DEFAULT_CHALLENGES);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [concepts, setConcepts] = useState<ConceptItem[]>([]);
  const [scoreAudits, setScoreAudits] = useState<ScoreAuditItem[]>([]);
  const [dayFilter, setDayFilter] = useState<string>("ALL");
  const [scheduleDayFilter, setScheduleDayFilter] = useState<string>("Day 1");
  const [hideInactive, setHideInactive] = useState<boolean>(false);

  // Staff Pool Modal State
  const [staffPoolTeam, setStaffPoolTeam] = useState<TeamItem | null>(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>("");
  const [staffDeptFilter, setStaffDeptFilter] = useState<string>("ALL");

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
  const [editingChallenge, setEditingChallenge] = useState<ChallengeItem | null>(null);
  const [newChallengeModal, setNewChallengeModal] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Form state for new challenge item
  const [newChallengeForm, setNewChallengeForm] = useState<Partial<ChallengeItem>>({
    day: "Day 1",
    category: "Challenge",
    engine_type: "RUBRIC",
    name: "",
    description: "",
    instructions: "",
    max_score: 50,
    status: "LOCKED",
  });

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
          if (data.teams && data.teams.length > 0) {
            const merged = DEFAULT_TEAMS_A_TO_J.map((def) => {
              const fromApi = data.teams.find((t: any) => t.id === def.id);
              return fromApi ? { ...def, ...fromApi, status: fromApi.status || "ACTIVE" } : def;
            });
            setTeams(merged);
          }
          if (data.challenges && data.challenges.length > 0) {
            const mergedChallenges = DEFAULT_CHALLENGES.map((def) => {
              const fromApi = data.challenges.find((c: any) => c.id === def.id || c.name?.toLowerCase().trim() === def.name.toLowerCase().trim());
              return fromApi
                ? {
                    ...def,
                    ...fromApi,
                    day: fromApi.day || def.day,
                    category: fromApi.category || def.category,
                    engine_type: fromApi.engine_type || fromApi.engineType || def.engine_type,
                    max_score: fromApi.max_score || def.max_score,
                  }
                : def;
            });
            const extraChallenges = data.challenges.filter(
              (c: any) => !DEFAULT_CHALLENGES.some((def) => def.id === c.id || def.name?.toLowerCase().trim() === c.name?.toLowerCase().trim())
            ).map((c: any) => ({
              ...c,
              day: c.day || "Day 1",
              category: c.category || "Challenge",
              engine_type: c.engine_type || c.engineType || "RUBRIC",
              max_score: c.max_score || 50,
            }));
            setChallenges([...mergedChallenges, ...extraChallenges]);
          }
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

  // Toggle active status for team A-J
  const toggleTeamActive = (teamId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const nextStatus = t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Staff Pool Assignment Handlers
  const handleAssignUserToTeam = (user: User, teamId: string) => {
    setParticipants((prev) => {
      const existing = prev.find((p) => p.user_id === user.id);
      if (existing) {
        return prev.map((p) => (p.user_id === user.id ? { ...p, team_id: teamId } : p));
      }
      const newParticipant: ParticipantItem = {
        id: `prt-${Date.now()}-${user.id}`,
        quest_id: questId,
        team_id: teamId,
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        department: user.department || "General",
        avatar: user.avatar || `/character${(prev.length % 20) + 1}.jpg`,
        role: "member",
        status: "confirmed",
      };
      return [...prev, newParticipant];
    });
  };

  const handleRemoveUserFromTeam = (userId: string) => {
    setParticipants((prev) => prev.filter((p) => p.user_id !== userId));
  };

  const handleToggleCaptainForUser = (userId: string, teamId: string) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.team_id === teamId) {
          if (p.user_id === userId) {
            return { ...p, role: p.role === "captain" ? "member" : "captain" };
          } else if (p.role === "captain") {
            return { ...p, role: "member" };
          }
        }
        return p;
      })
    );
  };

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
        alert(data.message || "Staff successfully balanced across active teams!");
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

  // Create Challenge Item
  const handleCreateChallenge = async () => {
    if (!newChallengeForm.name) return;
    const newChl: ChallengeItem = {
      id: `chl-${Date.now()}`,
      day: newChallengeForm.day || "Day 1",
      category: newChallengeForm.category || "Challenge",
      engine_type: newChallengeForm.engine_type || "RUBRIC",
      name: newChallengeForm.name,
      description: newChallengeForm.description || "",
      instructions: newChallengeForm.instructions || "",
      max_score: Number(newChallengeForm.max_score) || 50,
      status: "LOCKED",
    };

    setChallenges((prev) => [...prev, newChl]);
    setNewChallengeModal(false);
    setNewChallengeForm({
      day: "Day 1",
      category: "Challenge",
      engine_type: "RUBRIC",
      name: "",
      description: "",
      instructions: "",
      max_score: 50,
      status: "LOCKED",
    });

    try {
      await fetch(`/api/erp/quests/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChl),
      });
    } catch (e) {}
  };

  // Update Challenge Item
  const handleUpdateChallenge = async () => {
    if (!editingChallenge) return;
    setChallenges((prev) => prev.map((c) => (c.id === editingChallenge.id ? editingChallenge : c)));
    try {
      await fetch(`/api/erp/quests/challenges`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingChallenge),
      });
    } catch (e) {}
    setEditingChallenge(null);
  };

  // Delete Challenge Item
  const handleDeleteChallenge = async (id: string) => {
    setChallenges((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/erp/quests/challenges?id=${id}`, { method: "DELETE" });
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

  const activeTeams = teams.filter((t) => t.status === "ACTIVE");
  const leadingTeam = [...activeTeams].sort((a, b) => b.total_points - a.total_points)[0] || {
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
      subtitle={`Corporate Team Championship · 60 Staff · ${activeTeams.length} Active Teams · 11 Quests · 21 Scheduled Events · ₦500,000 Grand Prize`}
      action={
        <div className="flex items-center gap-2.5">
          <Link
            href="/quests/reignite-2026/scoreboard"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 h-8 px-3.5 text-xs font-bold rounded-full border border-nexa-border bg-transparent text-nexa-text-secondary hover:bg-nexa-bg-surface hover:text-nexa-text-primary transition-all shadow-xs"
          >
            <Tv className="w-4 h-4 text-blue-600" />
            <span>Arena TV Scoreboard</span>
          </Link>
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
              change: `${activeTeams.length} Active Squads`,
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
            { id: "overview", label: "Overview", icon: Flame },
            { id: "schedule", label: `Schedule (${schedule.length})`, icon: Calendar },
            { id: "roster", label: `Team Roster (${assignedCount}/60)`, icon: Users },
            { id: "challenges", label: `Challenges (${challenges.length})`, icon: Target },
            { id: "concepts", label: `Concept Lock (${concepts.length})`, icon: Lock },
            { id: "audit", label: `Audit Trail (${scoreAudits.length})`, icon: History },
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
            {/* ACTIVE SQUAD SPRINT CARDS — MATCHING ErpStatCard STYLING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams
                .filter((team) => team.status === "ACTIVE")
                .slice()
                .sort((a, b) => b.total_points - a.total_points)
                .map((team, idx) => {
                  const teamMembers = participants.filter((p) => p.team_id === team.id);
                  const initialChar = team.initial || (team.name.replace(/^Team\s+/i, "")[0] || "T").toUpperCase();
                  return (
                    <NexaCard
                      key={team.id}
                      variant="glass"
                      className="p-6 relative overflow-hidden group hover:border-[#1A56DB]/40 transition-all rounded-3xl"
                    >
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform shadow-xs shrink-0"
                          style={{ backgroundColor: `${team.color}18`, color: team.color }}
                        >
                          {initialChar}
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
                            idx === 0
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : idx === 1
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : idx === 2
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                          }`}
                        >
                          Rank #{team.rank} {idx === 0 ? "· Leader" : ""}
                        </span>
                      </div>
                      <div className="w-full min-w-0 mb-1 overflow-hidden">
                        <p
                          className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis w-full block"
                          title={team.name}
                        >
                          <span className="whitespace-nowrap inline">{team.name}</span>
                        </p>
                      </div>
                      <h3 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] mb-1 whitespace-nowrap">
                        {team.total_points} <span className="text-xs font-normal text-[var(--nexa-text-muted)]">/ 850 pts</span>
                      </h3>
                      <p className="text-[11px] text-[var(--nexa-text-secondary)] font-medium whitespace-nowrap truncate w-full">
                        &ldquo;{team.motto}&rdquo; · {teamMembers.length} Staff Assigned
                      </p>
                    </NexaCard>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 2: CONFIGURABLE EVENT CALENDAR & TIMELINE */}
        {activeTab === "schedule" && (
          <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  Event Schedule & Timeline
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  Facilitators can add, edit, and broadcast live activities to the Stage TV Scoreboard
                </p>
              </div>

              {/* Day filters and Add button */}
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
                <NexaButton
                  size="sm"
                  variant="primary"
                  className="rounded-full bg-[#1A56DB] text-xs h-8 ml-1"
                  onClick={() => setNewScheduleModal(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Event
                </NexaButton>
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
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
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
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status !== "LIVE" && (
                              <button
                                onClick={() => handleUpdateScheduleStatus(item, "LIVE")}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                title="Mark Live"
                              >
                                <Radio className="w-3 h-3" /> Live
                              </button>
                            )}
                            {item.status === "LIVE" && (
                              <button
                                onClick={() => handleUpdateScheduleStatus(item, "COMPLETED")}
                                className="px-2.5 py-1 bg-[#1A56DB] hover:bg-blue-700 text-white font-bold rounded-full text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </button>
                            )}
                            <button
                              onClick={() => setEditingScheduleItem(item)}
                              className="p-1.5 text-[var(--nexa-text-muted)] hover:text-[#1A56DB] hover:bg-[var(--nexa-bg-base)] rounded-lg transition-colors cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteScheduleItem(item.id)}
                              className="p-1.5 text-[var(--nexa-text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--nexa-text-muted)] font-medium">
                        No scheduled activities found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </NexaCard>
        )}

        {/* TAB 3: STAFF POOL & TEAM BUILDER ROSTER */}
        {activeTab === "roster" && (
          <div className="space-y-6">
            {/* HEADER BANNER & CONTROLS */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-blue-50 border border-blue-100">
              <div>
                <h3 className="font-bold text-slate-850 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" /> Team Roster & Staff Pool
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure championship squads (Team A through Team J). Assign staff from the employee pool or use 1-click auto-balance.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* HIDE INACTIVE TOGGLE */}
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs text-xs font-bold text-slate-700 hover:border-blue-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={hideInactive}
                    onChange={(e) => setHideInactive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                  />
                  <span>Hide Inactive</span>
                </label>

                <NexaBadge variant="secondary" size="sm" className="rounded-full font-bold">
                  {teams.filter((t) => t.status === "ACTIVE").length} Active · {teams.filter((t) => t.status === "INACTIVE").length} Standby
                </NexaBadge>

                <NexaButton
                  size="sm"
                  variant="primary"
                  className="rounded-full bg-blue-600 text-white shadow-xs"
                  onClick={handleAutoAssign}
                  disabled={isAutoAssigning}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  {isAutoAssigning ? "Balancing..." : "1-Click Auto-Balance"}
                </NexaButton>
              </div>
            </div>

            {/* 3-COLUMN TEAM GRID — EXACT SAME STYLING AS OVERVIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams
                .slice()
                .filter((team) => (hideInactive ? team.status === "ACTIVE" : true))
                .sort((a, b) => {
                  if (a.status === "ACTIVE" && b.status === "INACTIVE") return -1;
                  if (a.status === "INACTIVE" && b.status === "ACTIVE") return 1;
                  return b.total_points - a.total_points;
                })
                .map((team, idx) => {
                  const teamMembers = participants.filter((p) => p.team_id === team.id);
                  const isInactive = team.status === "INACTIVE";
                  const initialChar = team.initial || (team.name.replace(/^Team\s+/i, "")[0] || "T").toUpperCase();

                  if (isInactive) {
                    return (
                      <NexaCard
                        key={team.id}
                        variant="glass"
                        className="p-6 relative overflow-hidden group border border-gray-200 opacity-65 hover:opacity-100 transition-all rounded-3xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center font-black text-xl shrink-0 border border-gray-200">
                              {initialChar}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap shrink-0">
                                Standby
                              </span>
                              {/* SWITCH TOGGLE */}
                              <button
                                type="button"
                                onClick={() => toggleTeamActive(team.id)}
                                className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-300 hover:bg-gray-400 transition-colors duration-200 ease-in-out focus:outline-none"
                                title="Inactive — Click to activate"
                                role="switch"
                                aria-checked={false}
                              >
                                <span
                                  aria-hidden="true"
                                  className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out translate-x-0"
                                />
                              </button>
                            </div>
                          </div>

                          <div className="w-full min-w-0 mb-1 overflow-hidden">
                            <p
                              className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis w-full block"
                              title={team.name}
                            >
                              <span className="whitespace-nowrap inline">{team.name}</span>
                            </p>
                          </div>

                          <h3 className="text-2xl font-extrabold text-gray-400 mb-1 whitespace-nowrap">
                            0 <span className="text-xs font-normal text-gray-400">/ 850 pts</span>
                          </h3>

                          <p className="text-[11px] text-[var(--nexa-text-secondary)] font-medium whitespace-nowrap truncate w-full mb-4">
                            Standby Squad · Flip switch to activate
                          </p>
                        </div>

                        <button
                          onClick={() => toggleTeamActive(team.id)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Activate Team
                        </button>
                      </NexaCard>
                    );
                  }

                  return (
                    <NexaCard
                      key={team.id}
                      variant="glass"
                      className="p-6 relative overflow-hidden group hover:border-[#1A56DB]/40 transition-all rounded-3xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform shadow-xs shrink-0"
                            style={{ backgroundColor: `${team.color}18`, color: team.color }}
                          >
                            {initialChar}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
                                idx === 0
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : idx === 1
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  : idx === 2
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                              }`}
                            >
                              Rank #{team.rank} {idx === 0 ? "· Leader" : ""}
                            </span>

                            {/* SWITCH TOGGLE */}
                            <button
                              type="button"
                              onClick={() => toggleTeamActive(team.id)}
                              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none"
                              title="Active — Click switch to deactivate"
                              role="switch"
                              aria-checked={true}
                            >
                              <span
                                aria-hidden="true"
                                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out translate-x-4"
                              />
                            </button>

                            <button
                              onClick={() => setEditingTeam(team)}
                              className="text-slate-400 hover:text-blue-600 p-1 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                              title="Edit Branding"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="w-full min-w-0 mb-1 overflow-hidden">
                          <p
                            className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis w-full block"
                            title={team.name}
                          >
                            <span className="whitespace-nowrap inline">{team.name}</span>
                          </p>
                        </div>

                        <h3 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] mb-1 whitespace-nowrap">
                          {team.total_points} <span className="text-xs font-normal text-[var(--nexa-text-muted)]">/ 850 pts</span>
                        </h3>

                        <p className="text-[11px] text-[var(--nexa-text-secondary)] font-medium whitespace-nowrap truncate w-full mb-4">
                          &ldquo;{team.motto}&rdquo; · {teamMembers.length} Staff Assigned
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setStaffPoolTeam(team);
                          setStaffSearchQuery("");
                          setStaffDeptFilter("ALL");
                        }}
                        className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-100 shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5" /> Select Staff Pool ({teamMembers.length})
                      </button>
                    </NexaCard>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 4: CHALLENGES & SCORING ENGINES */}
        {activeTab === "challenges" && (
          <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                  Championship Challenges & Scoring Engines
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                  Official quests, scoring engines, and live facilitator grading
                </p>
              </div>

              {/* Day filters & Add Challenge */}
              <div className="flex items-center gap-2 flex-wrap">
                {["Day 1", "Day 2", "Day 3", "ALL"].map((day) => (
                  <button
                    key={day}
                    onClick={() => setDayFilter(day)}
                    className={`px-3 py-1.5 border font-bold rounded-full text-xs cursor-pointer transition-all ${
                      dayFilter === day
                        ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-xs"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
                <NexaButton
                  size="sm"
                  variant="primary"
                  className="rounded-full bg-[#1A56DB] text-xs h-8 ml-1"
                  onClick={() => setNewChallengeModal(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Challenge
                </NexaButton>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)]">
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider w-[42%] min-w-[340px]">Challenge Quest</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Schedule & Engine</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Category</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Max Points</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="pb-3 px-3 font-bold uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                  {challenges.filter((c) => dayFilter === "ALL" || c.day === dayFilter).length > 0 ? (
                    challenges
                      .filter((c) => dayFilter === "ALL" || c.day === dayFilter)
                      .map((chl) => (
                        <tr key={chl.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                          <td className="py-3.5 px-3 min-w-[340px]">
                            <div>
                              <p className="font-bold text-xs flex items-center gap-1.5">
                                {chl.name}
                                {(chl.status === "OPEN" || chl.status === "IN_PROGRESS") && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                )}
                              </p>
                              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium mt-0.5">
                                {chl.description}
                              </p>
                              {chl.instructions && (
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Guide: {chl.instructions}</span>
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div>
                              <p className="font-bold text-xs text-blue-600">{chl.day || "Day 1"}</p>
                              <p className="text-[10px] text-[var(--nexa-text-muted)] font-mono">
                                Engine: {chl.engine_type || (chl as any).engineType || "RUBRIC"}
                              </p>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                (chl.category || "Challenge") === "Challenge"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  : chl.category === "Sports"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : chl.category === "Awards"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : chl.category === "Trivia"
                                  ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                  : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                              }`}
                            >
                              {chl.category || "Challenge"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="bg-emerald-500/10 text-emerald-600 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-xs">
                              +{chl.max_score} pts
                            </span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {chl.status === "OPEN" || chl.status === "IN_PROGRESS" ? (
                              <span className="bg-emerald-500/10 text-emerald-600 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-xs inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                              </span>
                            ) : chl.status === "COMPLETED" ? (
                              <span className="bg-blue-500/10 text-blue-600 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/20 text-xs">
                                Completed
                              </span>
                            ) : (
                              <span className="bg-slate-500/10 text-slate-600 font-extrabold px-2.5 py-0.5 rounded-full border border-slate-500/20 text-xs">
                                Locked
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {chl.status === "LOCKED" ? (
                                <button
                                  onClick={() => handleToggleChallengeStatus(chl, "OPEN")}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                  title="Open Quest"
                                >
                                  <Unlock className="w-3 h-3" /> Open
                                </button>
                              ) : chl.status === "OPEN" || chl.status === "IN_PROGRESS" ? (
                                <>
                                  <button
                                    onClick={() => openScoringModal(chl)}
                                    className="px-2.5 py-1 bg-[#1A56DB] hover:bg-blue-700 text-white font-bold rounded-full text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                  >
                                    <Award className="w-3 h-3" /> Score
                                  </button>
                                  <button
                                    onClick={() => handleToggleChallengeStatus(chl, "LOCKED")}
                                    className="p-1.5 text-[var(--nexa-text-muted)] hover:text-slate-700 hover:bg-[var(--nexa-bg-base)] rounded-lg transition-colors cursor-pointer"
                                    title="Lock Quest"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => openScoringModal(chl)}
                                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold rounded-full text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <History className="w-3 h-3" /> Review
                                </button>
                              )}

                              {/* EDIT ACTION */}
                              <button
                                onClick={() => setEditingChallenge(chl)}
                                className="p-1.5 text-[var(--nexa-text-muted)] hover:text-[#1A56DB] hover:bg-[var(--nexa-bg-base)] rounded-lg transition-colors cursor-pointer"
                                title="Edit Challenge Quest"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* DELETE ACTION */}
                              <button
                                onClick={() => handleDeleteChallenge(chl.id)}
                                className="p-1.5 text-[var(--nexa-text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Challenge Quest"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--nexa-text-muted)] font-medium">
                        No challenges found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </NexaCard>
        )}

        {/* TAB 5: CONCEPT REGISTRATION DESK */}
        {activeTab === "concepts" && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-amber-900 text-sm">Concept Lock</h3>
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
            <h3 className="font-bold text-slate-850 text-sm">Audit Trail</h3>
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

      {/* CREATE / EDIT CHALLENGE MODAL */}
      {(newChallengeModal || editingChallenge) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-850">
              {editingChallenge ? "Edit Championship Challenge" : "Add New Challenge Quest"}
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Day:</label>
                  <select
                    value={editingChallenge ? editingChallenge.day : newChallengeForm.day}
                    onChange={(e) => {
                      if (editingChallenge) setEditingChallenge({ ...editingChallenge, day: e.target.value as any });
                      else setNewChallengeForm({ ...newChallengeForm, day: e.target.value as any });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="Day 1">Day 1</option>
                    <option value="Day 2">Day 2</option>
                    <option value="Day 3">Day 3</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={editingChallenge ? editingChallenge.category : newChallengeForm.category}
                    onChange={(e) => {
                      if (editingChallenge) setEditingChallenge({ ...editingChallenge, category: e.target.value });
                      else setNewChallengeForm({ ...newChallengeForm, category: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="Challenge">Challenge Quest</option>
                    <option value="Sports">Sports & Physical</option>
                    <option value="Awards">Awards</option>
                    <option value="Icebreaker">Icebreaker</option>
                    <option value="Trivia">Trivia / Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Max Score (pts):</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={editingChallenge ? editingChallenge.max_score : newChallengeForm.max_score}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (editingChallenge) setEditingChallenge({ ...editingChallenge, max_score: val });
                      else setNewChallengeForm({ ...newChallengeForm, max_score: val });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Challenge Name / Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Quest 12: Escape Room Cipher Challenge"
                  value={editingChallenge ? editingChallenge.name : newChallengeForm.name}
                  onChange={(e) => {
                    if (editingChallenge) setEditingChallenge({ ...editingChallenge, name: e.target.value });
                    else setNewChallengeForm({ ...newChallengeForm, name: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Scoring Engine Type:</label>
                <select
                  value={editingChallenge ? editingChallenge.engine_type : newChallengeForm.engine_type}
                  onChange={(e) => {
                    const eng = e.target.value as any;
                    if (editingChallenge) setEditingChallenge({ ...editingChallenge, engine_type: eng });
                    else setNewChallengeForm({ ...newChallengeForm, engine_type: eng });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white font-mono"
                >
                  <option value="RUBRIC">RUBRIC (Graded Rubric / Criterion scoring)</option>
                  <option value="PARTICIPATION">PARTICIPATION (Points per active member attended)</option>
                  <option value="RANK_TO_POINTS">RANK_TO_POINTS (Rank 1st to 6th mapped point pool)</option>
                  <option value="QUIZ">QUIZ (Official quiz answers verified)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Description:</label>
                <textarea
                  rows={2}
                  placeholder="Short description of the quest challenge..."
                  value={editingChallenge ? editingChallenge.description : newChallengeForm.description}
                  onChange={(e) => {
                    if (editingChallenge) setEditingChallenge({ ...editingChallenge, description: e.target.value });
                    else setNewChallengeForm({ ...newChallengeForm, description: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Facilitator Instructions / Rules Guide:</label>
                <input
                  type="text"
                  placeholder="e.g. 5-min timer, strict 3 judges consensus required"
                  value={editingChallenge ? (editingChallenge.instructions || "") : (newChallengeForm.instructions || "")}
                  onChange={(e) => {
                    if (editingChallenge) setEditingChallenge({ ...editingChallenge, instructions: e.target.value });
                    else setNewChallengeForm({ ...newChallengeForm, instructions: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setNewChallengeModal(false);
                  setEditingChallenge(null);
                }}
                className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingChallenge) {
                    handleUpdateChallenge();
                  } else {
                    handleCreateChallenge();
                  }
                }}
                className="px-5 py-2 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Save Challenge Quest
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
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 border border-slate-200/60"
                          style={{ backgroundColor: `${team.color}18`, color: team.color }}
                        >
                          {team.initial || (team.name.replace(/^Team\s+/i, "")[0] || "T").toUpperCase()}
                        </div>
                        <span className="font-bold text-xs text-slate-800">{team.name}</span>
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
                          <span className="font-bold text-xs text-slate-800">{team.name}</span>
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
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 border border-slate-200/60"
                          style={{ backgroundColor: `${team.color}18`, color: team.color }}
                        >
                          {team.initial || (team.name.replace(/^Team\s+/i, "")[0] || "T").toUpperCase()}
                        </div>
                        <span className="font-bold text-xs text-slate-800">{team.name}</span>
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
                  placeholder="e.g. Red Phoenix or Red Vipers"
                  value={editingTeam.custom_name || ""}
                  onChange={(e) => setEditingTeam({ ...editingTeam, custom_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Team Motto / Chant:</label>
                <input
                  type="text"
                  placeholder="e.g. Relentless Speed & Precision"
                  value={editingTeam.motto || ""}
                  onChange={(e) => setEditingTeam({ ...editingTeam, motto: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
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

      {/* STAFF POOL SELECTOR MODAL */}
      {staffPoolTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shrink-0 border border-slate-200/50"
                  style={{ backgroundColor: `${staffPoolTeam.color}18`, color: staffPoolTeam.color }}
                >
                  {staffPoolTeam.initial || (staffPoolTeam.name.replace(/^Team\s+/i, "")[0] || "T").toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-850">
                    Select Staff Pool · {staffPoolTeam.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assign, transfer, or remove staff members from the active tenant directory into this squad.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStaffPoolTeam(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <input
                type="text"
                placeholder="Search staff by name or email..."
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
              <select
                value={staffDeptFilter}
                onChange={(e) => setStaffDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {Array.from(new Set(users.map((u) => u.department).filter(Boolean))).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* SQUAD HEADCOUNT STATS */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-500 shrink-0">
              <span>
                <strong className="text-slate-850">
                  {participants.filter((p) => p.team_id === staffPoolTeam.id).length}
                </strong>{" "}
                members in this squad
              </span>
              <span>
                <strong className="text-blue-600">
                  {users.filter((u) => !participants.some((p) => p.user_id === u.id)).length}
                </strong>{" "}
                unassigned in company
              </span>
            </div>

            {/* STAFF LIST */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1 min-h-0 divide-y divide-gray-50">
              {users
                .filter((u) => {
                  const matchesSearch =
                    !staffSearchQuery ||
                    u.name?.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                    u.email?.toLowerCase().includes(staffSearchQuery.toLowerCase());
                  const matchesDept = staffDeptFilter === "ALL" || u.department === staffDeptFilter;
                  return matchesSearch && matchesDept;
                })
                .map((u, idx) => {
                  const assignedParticipant = participants.find((p) => p.user_id === u.id);
                  const isCurrentTeam = assignedParticipant?.team_id === staffPoolTeam.id;
                  const isOtherTeam = assignedParticipant && !isCurrentTeam;
                  const otherTeam = isOtherTeam ? teams.find((t) => t.id === assignedParticipant.team_id) : null;
                  const avatarSrc = u.avatar && u.avatar.startsWith("/character") ? u.avatar : `/character${(idx % 20) + 1}.jpg`;

                  return (
                    <div
                      key={u.id}
                      className={`pt-2 p-2.5 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                        isCurrentTeam
                          ? "bg-blue-50/60 border border-blue-100"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={avatarSrc}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-850 flex items-center gap-1.5 truncate">
                            {u.name}
                            {assignedParticipant?.role === "captain" && isCurrentTeam && (
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200 font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Captain
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">
                            {u.department || "Staff"} · {u.email}
                          </p>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrentTeam ? (
                          <>
                            <button
                              onClick={() => handleToggleCaptainForUser(u.id, staffPoolTeam.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-xl cursor-pointer transition-colors ${
                                assignedParticipant?.role === "captain"
                                  ? "bg-amber-500 text-white hover:bg-amber-600"
                                  : "bg-gray-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                              }`}
                              title="Toggle Squad Captain"
                            >
                              {assignedParticipant?.role === "captain" ? "★ Captain" : "Make Captain"}
                            </button>
                            <button
                              onClick={() => handleRemoveUserFromTeam(u.id)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                            >
                              Remove
                            </button>
                          </>
                        ) : isOtherTeam ? (
                          <>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-slate-500">
                              In {otherTeam?.name || "Other Team"}
                            </span>
                            <button
                              onClick={() => handleAssignUserToTeam(u, staffPoolTeam.id)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                            >
                              Move Here
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleAssignUserToTeam(u, staffPoolTeam.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
                          >
                            + Add to Squad
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 shrink-0">
              <span className="text-xs text-slate-400">Changes are applied immediately.</span>
              <button
                onClick={() => setStaffPoolTeam(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessShell>
  );
}
