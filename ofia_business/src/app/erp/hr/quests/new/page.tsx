"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Trophy,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Settings,
  Shield,
  Palette,
  Sliders,
  Flame,
  Plus,
  Trash2,
  Edit3,
  Gift,
  Coins,
  MapPin,
  Clock,
  Target,
  FileText,
  Tv,
  Lock,
  Star,
  Layers,
  Award,
} from "lucide-react";

interface TeamFormItem {
  id: string;
  name: string;
  custom_name: string;
  motto: string;
  color: string;
  initial: string;
  status: "ACTIVE" | "INACTIVE";
}

interface ScheduleFormItem {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  category: string;
  location: string;
  max_score: number;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
}

interface ChallengeFormItem {
  id: string;
  day: string;
  category: string;
  engine_type: "RUBRIC" | "PARTICIPATION" | "CONCEPT_AND_RUBRIC" | "RANK_TO_POINTS" | "QUIZ";
  name: string;
  description: string;
  instructions: string;
  max_score: number;
  status: "LOCKED" | "OPEN" | "IN_PROGRESS" | "COMPLETED";
}

interface PrizeFormItem {
  id: string;
  rank?: number;
  title: string;
  award_type: "CASH" | "TROPHY" | "GIFT" | "CERTIFICATE";
  amount: string;
  description: string;
  icon: string;
}

const DEFAULT_TEAMS: TeamFormItem[] = [
  { id: "team-1", name: "Team Alpha (Blue Eagles)", custom_name: "Blue Eagles", motto: "Swift, Strategic, Unstoppable", color: "#1A56DB", initial: "A", status: "ACTIVE" },
  { id: "team-2", name: "Team Bravo (Red Vipers)", custom_name: "Red Vipers", motto: "Relentless Speed & Precision", color: "#EF4444", initial: "B", status: "ACTIVE" },
  { id: "team-3", name: "Team Delta (Green Lions)", custom_name: "Green Lions", motto: "Courage in Every Stride", color: "#10B981", initial: "D", status: "ACTIVE" },
  { id: "team-4", name: "Team Charlie (Gold Titans)", custom_name: "Gold Titans", motto: "Power, Intellect, Victory", color: "#F59E0B", initial: "C", status: "ACTIVE" },
  { id: "team-5", name: "Team Echo (Silver Wolves)", custom_name: "Silver Wolves", motto: "Silent, United, Lethal", color: "#64748B", initial: "E", status: "ACTIVE" },
  { id: "team-6", name: "Team Foxtrot (Iron Rhinos)", custom_name: "Iron Rhinos", motto: "Unbreakable Resolve", color: "#8B5CF6", initial: "F", status: "ACTIVE" },
  { id: "team-7", name: "Team Golf (Shadow Panthers)", custom_name: "Shadow Panthers", motto: "Agile & Stealth Champions", color: "#0EA5E9", initial: "G", status: "INACTIVE" },
  { id: "team-8", name: "Team Hotel (Solar Hawks)", custom_name: "Solar Hawks", motto: "Rising Above All Limits", color: "#EC4899", initial: "H", status: "INACTIVE" },
  { id: "team-9", name: "Team India (Thunder Bulls)", custom_name: "Thunder Bulls", motto: "Raw Energy & Team Power", color: "#14B8A6", initial: "I", status: "INACTIVE" },
  { id: "team-10", name: "Team Juliet (Cyber Dragons)", custom_name: "Cyber Dragons", motto: "Future Leaders of the Arena", color: "#6366F1", initial: "J", status: "INACTIVE" },
];

const DEFAULT_SCHEDULE_PRESETS: ScheduleFormItem[] = [
  { id: "sch-1", day: "Day 1", start_time: "09:00 AM", end_time: "11:00 AM", title: "Executive Arrival & Hotel Check-in", description: "Delegates arrive at resort, pick up badge credentials and retreat kits.", category: "Arrival", location: "Resort Lobby & Reception", max_score: 0, status: "COMPLETED" },
  { id: "sch-2", day: "Day 1", start_time: "11:30 AM", end_time: "01:00 PM", title: "Welcome Address & Opening Ceremony", description: "Opening remarks by MD/CEO, unveiling of the Theme, rules, and Grand Prize.", category: "Ceremony", location: "Main Conference Auditorium", max_score: 0, status: "COMPLETED" },
  { id: "sch-3", day: "Day 1", start_time: "03:00 PM", end_time: "04:30 PM", title: "Quest 1: Team Identity Presentation", description: "Each team takes the stage to present their custom Name, Motto, Pose, and Chant.", category: "Challenge", location: "Outdoor Amphitheatre", max_score: 50, status: "LIVE" },
  { id: "sch-4", day: "Day 1", start_time: "05:00 PM", end_time: "06:30 PM", title: "Quest 2: Who Are We? (5 Incredible Things)", description: "Every team member shares unique facts about their journey and growth.", category: "Challenge", location: "Outdoor Amphitheatre", max_score: 50, status: "UPCOMING" },
  { id: "sch-5", day: "Day 2", start_time: "10:00 AM", end_time: "01:00 PM", title: "Quest 4: REIGNITE — The Core Challenge", description: "10-minute theatrical, musical, or innovation presentations bringing the theme to life.", category: "Challenge", location: "Main Auditorium Stage", max_score: 200, status: "UPCOMING" },
  { id: "sch-6", day: "Day 2", start_time: "03:00 PM", end_time: "04:00 PM", title: "Quest 5: Egg & Spoon Agility Race", description: "Fast-paced team balance relay requiring speed and coordination.", category: "Challenge", location: "Lawn Arena", max_score: 50, status: "UPCOMING" },
  { id: "sch-7", day: "Day 3", start_time: "09:00 AM", end_time: "10:30 AM", title: "Quest 8: Girls' Volleyball Championship", description: "Inter-squad women's volleyball tournament with finals.", category: "Sports", location: "Resort Sports Arena", max_score: 75, status: "UPCOMING" },
  { id: "sch-8", day: "Day 3", start_time: "11:00 AM", end_time: "01:00 PM", title: "Quest 9: Corporate Football Championship", description: "Inter-squad football tournament and championship final match.", category: "Sports", location: "Football Pitch", max_score: 100, status: "UPCOMING" },
  { id: "sch-9", day: "Day 3", start_time: "06:30 PM", end_time: "09:00 PM", title: "Gala Awards Dinner & Grand Trophy Ceremony", description: "Final banquet, scoreboard countdown, and trophy award to the Champion Squad.", category: "Awards", location: "Grand Ballroom", max_score: 0, status: "UPCOMING" },
];

const DEFAULT_CHALLENGE_PRESETS: ChallengeFormItem[] = [
  { id: "chl-1", day: "Day 1", category: "Challenge", engine_type: "RUBRIC", name: "Quest 1: Team Identity Presentation", description: "Custom Name, Motto, Pose, and Team Chant presentation.", instructions: "5 minutes per team. Judged across creativity, teamwork, energy, and delivery.", max_score: 50, status: "OPEN" },
  { id: "chl-2", day: "Day 1", category: "Challenge", engine_type: "PARTICIPATION", name: "Quest 2: Who Are We? (5 Incredible Things)", description: "Every team member shares unique facts about their growth.", instructions: "100% active member sharing awards maximum 50 points.", max_score: 50, status: "LOCKED" },
  { id: "chl-3", day: "Day 1", category: "Challenge", engine_type: "RUBRIC", name: "Quest 3: Card Games & Karaoke Fun", description: "Interactive board games and karaoke battles.", instructions: "Spirit & sportsmanship rubric scoring.", max_score: 50, status: "LOCKED" },
  { id: "chl-4", day: "Day 2", category: "Challenge", engine_type: "RUBRIC", name: "Quest 4: REIGNITE — The Core Challenge", description: "10-minute theatrical, musical, or innovation presentations.", instructions: "6 rubric dimensions (40, 40, 30, 30, 30, 30 = 200 pts total).", max_score: 200, status: "LOCKED" },
  { id: "chl-5", day: "Day 2", category: "Sports", engine_type: "RANK_TO_POINTS", name: "Quest 5: Egg & Spoon Agility Race", description: "Fast-paced team balance relay.", instructions: "Rank to points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.", max_score: 50, status: "LOCKED" },
  { id: "chl-6", day: "Day 2", category: "Trivia", engine_type: "QUIZ", name: "Quest 6: The Knowledge Quest (10 Questions)", description: "Objective corporate and industry knowledge test.", instructions: "10 questions × 10 points = 100 points maximum.", max_score: 100, status: "LOCKED" },
  { id: "chl-7", day: "Day 2", category: "Trivia", engine_type: "QUIZ", name: "Quest 7: Think Fast Rapid-Fire Round", description: "10 rapid-fire buzzer questions asked to all teams simultaneously.", instructions: "10 questions × 5 points = 50 points.", max_score: 50, status: "LOCKED" },
  { id: "chl-8", day: "Day 3", category: "Sports", engine_type: "RANK_TO_POINTS", name: "Quest 8: Girls' Volleyball Championship", description: "Inter-squad women's volleyball tournament.", instructions: "Rank to points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.", max_score: 75, status: "LOCKED" },
  { id: "chl-9", day: "Day 3", category: "Sports", engine_type: "RANK_TO_POINTS", name: "Quest 9: Corporate Football Championship", description: "Inter-squad football tournament and championship final match.", instructions: "Rank to points: 1st=100, 2nd=75, 3rd=60, 4th=45, 5th=30, 6th=20.", max_score: 100, status: "LOCKED" },
  { id: "chl-10", day: "Day 3", category: "Sports", engine_type: "RANK_TO_POINTS", name: "Quest 10: 4×100m Track Relay Race", description: "Sprint track showdown featuring mixed gender relay runners.", instructions: "Rank to points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.", max_score: 50, status: "LOCKED" },
  { id: "chl-11", day: "Day 3", category: "Sports", engine_type: "RANK_TO_POINTS", name: "Quest 11: Grand Tug of War Final", description: "The ultimate contest of endurance, grip, and team synergy.", instructions: "Rank to points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.", max_score: 75, status: "LOCKED" },
];

const DEFAULT_PRIZES: PrizeFormItem[] = [
  { id: "prz-1", rank: 1, title: "1st Place Grand Championship Winner", award_type: "CASH", amount: "500,000", description: "Awarded to the squad with the highest cumulative championship points across all 11 quests.", icon: "🏆" },
  { id: "prz-2", rank: 2, title: "2nd Place Silver Podium Award", award_type: "CASH", amount: "250,000", description: "Runner-up squad award for high performance and sportsmanship.", icon: "🥈" },
  { id: "prz-3", rank: 3, title: "3rd Place Bronze Podium Award", award_type: "CASH", amount: "100,000", description: "Bronze medal championship podium squad prize.", icon: "🥉" },
  { id: "prz-4", rank: 0, title: "Best Theme Identity & Team Spirit", award_type: "CASH", amount: "50,000", description: "Special award for the most energetic chant, banner, and synchronized team identity.", icon: "🔥" },
  { id: "prz-5", rank: 0, title: "Championship MVP Performer", award_type: "CASH", amount: "25,000", description: "Individual recognition award for exceptional leadership, agility, and participation.", icon: "⭐" },
];

export default function CreateQuestWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "REIGNITE 2026: Team Quest & Championship",
    slug: "reignite-2026",
    description: "Annual enterprise retreat, creative innovation pitch, trivia knowledge wars, and physical agility championship.",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-08-25",
    endsAt: "2026-08-27",
    location: "Epe Resort & Conference Centre, Lagos",
    currency: "NGN",
    currencySymbol: "₦",
    participationType: "BOTH", // INDIVIDUAL, TEAM, BOTH
    autoBalance: true,
    scoringMode: "AUTOMATIC_WITH_JUDGE_OVERRIDE",
    allowManualAdjustments: true,
    conceptLockEnabled: true,
    primaryColor: "#1A56DB",
    accentColor: "#F59E0B",
    enableStageTV: true,
  });

  // Teams State
  const [teams, setTeams] = useState<TeamFormItem[]>(DEFAULT_TEAMS);

  // Schedule State
  const [scheduleItems, setScheduleItems] = useState<ScheduleFormItem[]>(DEFAULT_SCHEDULE_PRESETS);
  const [newScheduleDay, setNewScheduleDay] = useState("Day 1");
  const [newScheduleTitle, setNewScheduleTitle] = useState("");
  const [newScheduleCategory, setNewScheduleCategory] = useState("Challenge");
  const [newScheduleStart, setNewScheduleStart] = useState("09:00 AM");
  const [newScheduleEnd, setNewScheduleEnd] = useState("10:30 AM");
  const [newScheduleLocation, setNewScheduleLocation] = useState("Main Auditorium");
  const [newScheduleMaxScore, setNewScheduleMaxScore] = useState(50);
  const [showAddSchedule, setShowAddSchedule] = useState(false);

  // Challenges State
  const [challenges, setChallenges] = useState<ChallengeFormItem[]>(DEFAULT_CHALLENGE_PRESETS);
  const [newChlName, setNewChlName] = useState("");
  const [newChlDay, setNewChlDay] = useState("Day 1");
  const [newChlCategory, setNewChlCategory] = useState("Challenge");
  const [newChlEngine, setNewChlEngine] = useState<ChallengeFormItem["engine_type"]>("RUBRIC");
  const [newChlMaxScore, setNewChlMaxScore] = useState(50);
  const [newChlDesc, setNewChlDesc] = useState("");
  const [showAddChallenge, setShowAddChallenge] = useState(false);

  // Prizes State
  const [prizes, setPrizes] = useState<PrizeFormItem[]>(DEFAULT_PRIZES);
  const [newPrizeTitle, setNewPrizeTitle] = useState("");
  const [newPrizeAmount, setNewPrizeAmount] = useState("");
  const [newPrizeType, setNewPrizeType] = useState<PrizeFormItem["award_type"]>("CASH");
  const [newPrizeDesc, setNewPrizeDesc] = useState("");
  const [newPrizeIcon, setNewPrizeIcon] = useState("🎁");
  const [showAddPrize, setShowAddPrize] = useState(false);

  // Helpers
  const handleToggleTeamStatus = (index: number) => {
    const updated = [...teams];
    updated[index].status = updated[index].status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setTeams(updated);
  };

  const handleAddScheduleItem = () => {
    if (!newScheduleTitle.trim()) return;
    const newItem: ScheduleFormItem = {
      id: `sch-${Date.now()}`,
      day: newScheduleDay,
      start_time: newScheduleStart,
      end_time: newScheduleEnd,
      title: newScheduleTitle.trim(),
      description: "",
      category: newScheduleCategory,
      location: newScheduleLocation,
      max_score: Number(newScheduleMaxScore) || 0,
      status: "UPCOMING",
    };
    setScheduleItems([...scheduleItems, newItem]);
    setNewScheduleTitle("");
    setShowAddSchedule(false);
  };

  const handleDeleteScheduleItem = (id: string) => {
    setScheduleItems(scheduleItems.filter((s) => s.id !== id));
  };

  const handleAddChallenge = () => {
    if (!newChlName.trim()) return;
    const newItem: ChallengeFormItem = {
      id: `chl-${Date.now()}`,
      day: newChlDay,
      category: newChlCategory,
      engine_type: newChlEngine,
      name: newChlName.trim(),
      description: newChlDesc.trim(),
      instructions: "Facilitator evaluated quest.",
      max_score: Number(newChlMaxScore) || 50,
      status: "LOCKED",
    };
    setChallenges([...challenges, newItem]);
    setNewChlName("");
    setNewChlDesc("");
    setShowAddChallenge(false);
  };

  const handleDeleteChallenge = (id: string) => {
    setChallenges(challenges.filter((c) => c.id !== id));
  };

  const handleAddPrize = () => {
    if (!newPrizeTitle.trim()) return;
    const newItem: PrizeFormItem = {
      id: `prz-${Date.now()}`,
      rank: 0,
      title: newPrizeTitle.trim(),
      award_type: newPrizeType,
      amount: newPrizeAmount.trim() || "50,000",
      description: newPrizeDesc.trim(),
      icon: newPrizeIcon,
    };
    setPrizes([...prizes, newItem]);
    setNewPrizeTitle("");
    setNewPrizeAmount("");
    setNewPrizeDesc("");
    setShowAddPrize(false);
  };

  const handleDeletePrize = (id: string) => {
    setPrizes(prizes.filter((p) => p.id !== id));
  };

  const activeTeamsCount = teams.filter((t) => t.status === "ACTIVE").length;
  const totalMaxScore = challenges.reduce((acc, c) => acc + (c.max_score || 0), 0);
  const grandPrizeItem = prizes.find((p) => p.rank === 1);
  const grandPrizeText = grandPrizeItem ? `${formData.currencySymbol}${grandPrizeItem.amount}` : `${formData.currencySymbol}500,000`;

  const handleCreateQuest = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const questId = `qst-${formData.slug || Date.now()}`;
      const payload = {
        id: questId,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        cover_image: formData.coverImage,
        status: "ACTIVE",
        grand_prize: grandPrizeText,
        currency: formData.currency,
        total_max_points: totalMaxScore,
        location: formData.location,
        starts_at: formData.startsAt,
        ends_at: formData.endsAt,
        participation_type: formData.participationType,
        auto_balance: formData.autoBalance,
        enable_stage_tv: formData.enableStageTV,
        allow_manual_adjustments: formData.allowManualAdjustments,
        primary_color: formData.primaryColor,
        accent_color: formData.accentColor,
        scoring_mode: formData.scoringMode,
        concept_lock_enabled: formData.conceptLockEnabled,
        prizes: prizes.map((p, idx) => ({
          id: p.id,
          quest_id: questId,
          rank: p.rank || 0,
          title: p.title,
          award_type: p.award_type,
          amount: p.amount.startsWith(formData.currencySymbol) ? p.amount : `${formData.currencySymbol}${p.amount}`,
          description: p.description,
          icon: p.icon,
          order_index: idx + 1,
        })),
        teams: teams.map((t, idx) => ({
          id: `team-${idx + 1}`,
          quest_id: questId,
          name: t.name,
          custom_name: t.custom_name,
          slug: `team-${idx + 1}`,
          logo: "🏆",
          color: t.color,
          initial: t.initial,
          motto: t.motto,
          total_points: 0,
          rank: idx + 1,
          member_count: 10,
          status: t.status,
        })),
        challenges: challenges.map((c, idx) => ({
          id: c.id,
          quest_id: questId,
          day: c.day,
          category: c.category,
          engine_type: c.engine_type,
          name: c.name,
          description: c.description,
          instructions: c.instructions,
          max_score: c.max_score,
          status: c.status,
        })),
        schedule: scheduleItems.map((s, idx) => ({
          id: s.id,
          quest_id: questId,
          day: s.day,
          start_time: s.start_time,
          end_time: s.end_time,
          title: s.title,
          description: s.description,
          category: s.category,
          location: s.location,
          max_score: s.max_score,
          status: s.status,
          order_index: idx + 1,
        })),
      };

      const res = await fetch("/api/erp/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save quest to database");
      }

      router.push(`/erp/hr/quests/${questId}`);
    } catch (err: any) {
      console.error("Create quest error:", err);
      setSubmitError(err.message || "Failed to create quest. Please check database connection.");
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Identity", icon: Sparkles },
    { num: 2, title: "Squads", icon: Users },
    { num: 3, title: "Schedule", icon: Calendar },
    { num: 4, title: "Quests", icon: Target },
    { num: 5, title: "Prizes", icon: Trophy },
    { num: 6, title: "Branding", icon: Palette },
    { num: 7, title: "Launch", icon: CheckCircle2 },
  ];

  return (
    <BusinessShell
      title="Create Championship Quest"
      subtitle="Configure multi-squad rosters, timeline schedule, scoring engines, prize pool, and arena scoreboard."
      action={
        <Link href="/erp/hr/quests">
          <NexaButton size="sm" variant="outline">
            Cancel
          </NexaButton>
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* STEP PROGRESS BAR */}
        <div className="grid grid-cols-7 gap-2 pb-2 overflow-x-auto">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  currentStep === s.num
                    ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB] shadow-xs"
                    : currentStep > s.num
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-[var(--nexa-card-bg)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)]"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Step {s.num}</span>
                </div>
                <div className="text-xs font-bold truncate">{s.title}</div>
              </div>
            );
          })}
        </div>

        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <NexaCard variant="glass" padding="lg" className="space-y-5 rounded-3xl">
            <div className="border-b border-[var(--nexa-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1A56DB]" /> Step 1: Quest Identity & Venue Details
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                Set up the primary championship title, slug, description, dates, and event location.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Championship Quest Name *
                </label>
                <NexaInput
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. REIGNITE 2026: Team Quest & Championship"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Event Slug (URL identifier) *
                  </label>
                  <NexaInput
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    placeholder="reignite-2026"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Resort / Venue Location *
                  </label>
                  <NexaInput
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Epe Resort & Conference Centre, Lagos"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                  Quest Objective & Narrative
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                  placeholder="Explain the retreat purpose, games, spirit, and incentives..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Tournament Start Date *
                  </label>
                  <NexaInput
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Tournament End Date *
                  </label>
                  <NexaInput
                    type="date"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </NexaCard>
        )}

        {/* STEP 2: PARTICIPATION & SQUADS */}
        {currentStep === 2 && (
          <NexaCard variant="glass" padding="lg" className="space-y-5 rounded-3xl">
            <div className="border-b border-[var(--nexa-border)] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1A56DB]" /> Step 2: Championship Squads (Teams A - J)
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                  Configure preset squads, customize colors/mascots, and toggle Active vs Standby teams.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full">
                  {activeTeamsCount} Active Squads
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {teams.map((t, idx) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    t.status === "ACTIVE"
                      ? "bg-[var(--nexa-card-bg)] border-[var(--nexa-border)] shadow-xs"
                      : "bg-gray-500/5 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl font-black text-white flex items-center justify-center text-sm shadow-xs"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">{t.name}</h4>
                        <p className="text-[10px] text-[var(--nexa-text-muted)]">{t.motto}</p>
                      </div>
                    </div>

                    {/* Switch Toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[var(--nexa-text-muted)]">
                        {t.status === "ACTIVE" ? "Active" : "Standby"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleTeamStatus(idx)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          t.status === "ACTIVE" ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            t.status === "ACTIVE" ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[9px] font-bold text-[var(--nexa-text-muted)] uppercase">Custom Name</label>
                      <input
                        type="text"
                        value={t.custom_name}
                        onChange={(e) => {
                          const updated = [...teams];
                          updated[idx].custom_name = e.target.value;
                          setTeams(updated);
                        }}
                        className="w-full px-2 py-1 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[var(--nexa-text-muted)] uppercase">Motto / Tagline</label>
                      <input
                        type="text"
                        value={t.motto}
                        onChange={(e) => {
                          const updated = [...teams];
                          updated[idx].motto = e.target.value;
                          setTeams(updated);
                        }}
                        className="w-full px-2 py-1 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-[#1A56DB]" />
                <div>
                  <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Cross-Department Auto Balance</div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)]">
                    Evenly distribute departments (Finance, Fleet, Legal, Tech, Operations) across active squads.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoBalance}
                onChange={(e) => setFormData({ ...formData, autoBalance: e.target.checked })}
                className="w-4 h-4 text-[#1A56DB] rounded"
              />
            </div>
          </NexaCard>
        )}

        {/* STEP 3: SCHEDULE & ITINERARY */}
        {currentStep === 3 && (
          <NexaCard variant="glass" padding="lg" className="space-y-5 rounded-3xl">
            <div className="border-b border-[var(--nexa-border)] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1A56DB]" /> Step 3: Event Calendar & Timeline Builder
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                  Plan daily activities, challenge start/end times, meal breaks, and gala ceremonies.
                </p>
              </div>
              <button
                onClick={() => setShowAddSchedule(true)}
                className="px-3 py-1.5 bg-[#1A56DB] hover:bg-[#1546b3] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Timeline Event
              </button>
            </div>

            {/* Inline Add Schedule Modal / Panel */}
            {showAddSchedule && (
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                <h4 className="font-bold text-xs text-[#1A56DB]">Add New Event to Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Day</label>
                    <select
                      value={newScheduleDay}
                      onChange={(e) => setNewScheduleDay(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    >
                      <option value="Day 1">Day 1</option>
                      <option value="Day 2">Day 2</option>
                      <option value="Day 3">Day 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Category</label>
                    <select
                      value={newScheduleCategory}
                      onChange={(e) => setNewScheduleCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    >
                      <option value="Challenge">Challenge</option>
                      <option value="Sports">Sports</option>
                      <option value="Ceremony">Ceremony</option>
                      <option value="Meal">Meal</option>
                      <option value="Arrival">Arrival</option>
                      <option value="Awards">Awards</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Location / Venue</label>
                    <input
                      type="text"
                      value={newScheduleLocation}
                      onChange={(e) => setNewScheduleLocation(e.target.value)}
                      placeholder="e.g. Main Auditorium"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Event Title</label>
                    <input
                      type="text"
                      value={newScheduleTitle}
                      onChange={(e) => setNewScheduleTitle(e.target.value)}
                      placeholder="e.g. Quest 1: Team Identity Presentation"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Time Slot</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newScheduleStart}
                        onChange={(e) => setNewScheduleStart(e.target.value)}
                        className="w-1/2 px-2 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-mono text-center"
                      />
                      <span className="text-xs text-[var(--nexa-text-muted)]">-</span>
                      <input
                        type="text"
                        value={newScheduleEnd}
                        onChange={(e) => setNewScheduleEnd(e.target.value)}
                        className="w-1/2 px-2 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAddSchedule(false)}
                    className="px-3 py-1.5 text-xs text-[var(--nexa-text-muted)] hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddScheduleItem}
                    className="px-3 py-1.5 bg-[#1A56DB] text-white text-xs font-bold rounded-xl"
                  >
                    Add Event
                  </button>
                </div>
              </div>
            )}

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)] font-mono text-[10px]">
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold">Time & Day</th>
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold">Activity / Event</th>
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold">Category</th>
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold">Location</th>
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                  {scheduleItems.map((s) => (
                    <tr key={s.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-xs text-blue-600 block">{s.day}</span>
                        <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono">{s.start_time} - {s.end_time}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-xs min-w-[240px]">
                        {s.title}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[var(--nexa-text-muted)] whitespace-nowrap">
                        {s.location}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteScheduleItem(s.id)}
                          className="p-1 text-[var(--nexa-text-muted)] hover:text-red-600 rounded-md"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NexaCard>
        )}

        {/* STEP 4: CHALLENGES & SCORING ENGINES */}
        {currentStep === 4 && (
          <NexaCard variant="glass" padding="lg" className="space-y-5 rounded-3xl">
            <div className="border-b border-[var(--nexa-border)] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#1A56DB]" /> Step 4: Championship Challenges & Engines ({challenges.length} Quests)
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                  Define tournament quests, scoring engines (Rubric, Participation, Rank-to-Points, Quiz), and max points.
                </p>
              </div>
              <button
                onClick={() => setShowAddChallenge(true)}
                className="px-3 py-1.5 bg-[#1A56DB] hover:bg-[#1546b3] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Quest
              </button>
            </div>

            {/* Add Challenge Inline Panel */}
            {showAddChallenge && (
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                <h4 className="font-bold text-xs text-[#1A56DB]">Create Championship Quest</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Quest Name</label>
                    <input
                      type="text"
                      value={newChlName}
                      onChange={(e) => setNewChlName(e.target.value)}
                      placeholder="e.g. Quest 12: Innovation Pitch"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Day</label>
                    <select
                      value={newChlDay}
                      onChange={(e) => setNewChlDay(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    >
                      <option value="Day 1">Day 1</option>
                      <option value="Day 2">Day 2</option>
                      <option value="Day 3">Day 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Scoring Engine</label>
                    <select
                      value={newChlEngine}
                      onChange={(e) => setNewChlEngine(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    >
                      <option value="RUBRIC">RUBRIC (Multi-dimension)</option>
                      <option value="RANK_TO_POINTS">RANK_TO_POINTS (1st, 2nd, 3rd)</option>
                      <option value="PARTICIPATION">PARTICIPATION (100% Team)</option>
                      <option value="QUIZ">QUIZ (Objective Automated)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Max Score</label>
                    <input
                      type="number"
                      value={newChlMaxScore}
                      onChange={(e) => setNewChlMaxScore(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Description / Goal</label>
                    <input
                      type="text"
                      value={newChlDesc}
                      onChange={(e) => setNewChlDesc(e.target.value)}
                      placeholder="Brief description of the challenge..."
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button onClick={() => setShowAddChallenge(false)} className="px-3 py-1.5 text-xs text-[var(--nexa-text-muted)]">
                    Cancel
                  </button>
                  <button onClick={handleAddChallenge} className="px-3 py-1.5 bg-[#1A56DB] text-white text-xs font-bold rounded-xl">
                    Add Quest
                  </button>
                </div>
              </div>
            )}

            {/* Challenges List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)] font-mono text-[10px]">
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold">Quest Name & Goal</th>
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold">Day & Engine</th>
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold">Category</th>
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold">Points</th>
                    <th className="pb-2.5 px-3 uppercase tracking-wider font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                  {challenges.map((c) => (
                    <tr key={c.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                      <td className="py-2.5 px-3 min-w-[260px]">
                        <p className="font-bold text-xs">{c.name}</p>
                        <p className="text-[10px] text-[var(--nexa-text-muted)] truncate max-w-sm">{c.description}</p>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-blue-600 block">{c.day}</span>
                        <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono">Engine: {c.engine_type}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-extrabold text-emerald-600">
                        +{c.max_score} pts
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteChallenge(c.id)}
                          className="p-1 text-[var(--nexa-text-muted)] hover:text-red-600 rounded-md"
                          title="Delete Quest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Concept Lock Toggle */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Concept Lock & Duplicate Topic Prevention
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">
                    Enforces first-come, first-served concept approvals for stage drama/skits so squads cannot duplicate ideas.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.conceptLockEnabled}
                onChange={(e) => setFormData({ ...formData, conceptLockEnabled: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded"
              />
            </div>
          </NexaCard>
        )}

        {/* STEP 5: PRIZES & AWARDS DEFINITION */}
        {currentStep === 5 && (
          <NexaCard variant="glass" padding="lg" className="space-y-5 rounded-3xl">
            <div className="border-b border-[var(--nexa-border)] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#1A56DB]" /> Step 5: Prize Structure & Awards Definition
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                  Define the championship grand prize, podium payouts, and special recognition awards.
                </p>
              </div>
              <button
                onClick={() => setShowAddPrize(true)}
                className="px-3 py-1.5 bg-[#1A56DB] hover:bg-[#1546b3] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Award
              </button>
            </div>

            {/* Currency Selector & Quick Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">
                  Prize Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => {
                    const c = e.target.value;
                    const symbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€", KES: "KSh", GHS: "GH₵" };
                    setFormData({ ...formData, currency: c, currencySymbol: symbols[c] || "₦" });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-card-bg)] text-xs font-bold"
                >
                  <option value="NGN">NGN - Nigerian Naira (₦)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="KES">KES - Kenyan Shilling (KSh)</option>
                  <option value="GHS">GHS - Ghanaian Cedi (GH₵)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-[10px] font-bold text-amber-700 uppercase">1st Place Grand Champion Prize</div>
                <div className="text-xl font-black text-amber-900 dark:text-amber-300 mt-0.5">
                  {grandPrizeText}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Total Awards Configured</div>
                <div className="text-xl font-black text-blue-900 dark:text-blue-300 mt-0.5">
                  {prizes.length} Categories
                </div>
              </div>
            </div>

            {/* Add Prize Inline Panel */}
            {showAddPrize && (
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                <h4 className="font-bold text-xs text-[#1A56DB]">Add Custom Award / Prize</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Award Title</label>
                    <input
                      type="text"
                      value={newPrizeTitle}
                      onChange={(e) => setNewPrizeTitle(e.target.value)}
                      placeholder="e.g. Best Team Chant & Spirit"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">
                      Amount ({formData.currencySymbol})
                    </label>
                    <input
                      type="text"
                      value={newPrizeAmount}
                      onChange={(e) => setNewPrizeAmount(e.target.value)}
                      placeholder="e.g. 50,000"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Award Type</label>
                    <select
                      value={newPrizeType}
                      onChange={(e) => setNewPrizeType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs font-semibold"
                    >
                      <option value="CASH">Cash Prize</option>
                      <option value="TROPHY">Trophy & Plaque</option>
                      <option value="GIFT">Gift Package</option>
                      <option value="CERTIFICATE">Executive Certificate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block mb-1">Description / Criteria</label>
                  <input
                    type="text"
                    value={newPrizeDesc}
                    onChange={(e) => setNewPrizeDesc(e.target.value)}
                    placeholder="Criteria for awarding this category..."
                    className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button onClick={() => setShowAddPrize(false)} className="px-3 py-1.5 text-xs text-[var(--nexa-text-muted)]">
                    Cancel
                  </button>
                  <button onClick={handleAddPrize} className="px-3 py-1.5 bg-[#1A56DB] text-white text-xs font-bold rounded-xl">
                    Save Award
                  </button>
                </div>
              </div>
            )}

            {/* Prizes List */}
            <div className="space-y-3">
              {prizes.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-[var(--nexa-card-bg)] border border-[var(--nexa-border)] flex items-center justify-between shadow-xs hover:border-[#1A56DB]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg shrink-0">
                      {p.icon || "🏆"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-[var(--nexa-text-primary)]">{p.title}</h4>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 uppercase">
                          {p.award_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">{p.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      {p.amount.startsWith(formData.currencySymbol) ? p.amount : `${formData.currencySymbol}${p.amount}`}
                    </span>
                    <button
                      onClick={() => handleDeletePrize(p.id)}
                      className="p-1.5 text-[var(--nexa-text-muted)] hover:text-red-600 rounded-lg cursor-pointer"
                      title="Delete Prize"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>
        )}

        {/* STEP 6: BRANDING & ARENA STAGE TV */}
        {currentStep === 6 && (
          <NexaCard variant="glass" padding="lg" className="space-y-5 rounded-3xl">
            <div className="border-b border-[var(--nexa-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#1A56DB]" /> Step 6: Event Branding & Projector TV Scoreboard
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                Customize event colors and live arena display settings for high-contrast projector displays.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-[var(--nexa-border)]"
                    />
                    <NexaInput
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-secondary)] block mb-1">
                    Accent & Gold Podium Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-[var(--nexa-border)]"
                    />
                    <NexaInput
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-2">
                    <Tv className="w-4 h-4 text-amber-400" /> Stage TV / Projector Live Scoreboard Screen
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.enableStageTV}
                    onChange={(e) => setFormData({ ...formData, enableStageTV: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Enables a dedicated zero-login, high-contrast full-screen projector view at{" "}
                  <code className="text-amber-400 font-mono">/quests/{formData.slug}/scoreboard</code> for conference hall displays with real-time rankings and podium countdowns.
                </p>
              </div>
            </div>
          </NexaCard>
        )}

        {/* STEP 7: BLUEPRINT REVIEW & LAUNCH */}
        {currentStep === 7 && (
          <NexaCard variant="glass" padding="lg" className="space-y-5 rounded-3xl">
            <div className="border-b border-[var(--nexa-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Step 7: Championship Blueprint & Launch
              </h3>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                Review your configured tournament structure before deploying to the live database.
              </p>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block">Active Squads</span>
                <span className="text-lg font-black text-blue-600">{activeTeamsCount} Teams</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block">Challenges</span>
                <span className="text-lg font-black text-purple-600">{challenges.length} Quests</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block">Max Points</span>
                <span className="text-lg font-black text-emerald-600">{totalMaxScore} Pts</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                <span className="text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase block">Grand Prize</span>
                <span className="text-lg font-black text-amber-600">{grandPrizeText}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--nexa-text-muted)] font-medium">Championship Name:</span>
                <span className="font-bold text-[var(--nexa-text-primary)]">{formData.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--nexa-text-muted)] font-medium">Dates & Venue:</span>
                <span className="font-semibold text-[var(--nexa-text-primary)]">{formData.startsAt} to {formData.endsAt} · {formData.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--nexa-text-muted)] font-medium">Prize Purse Distribution:</span>
                <span className="font-semibold text-emerald-600">{prizes.length} Categories Configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--nexa-text-muted)] font-medium">Stage Scoreboard Display:</span>
                <span className="font-mono text-[#1A56DB]">/quests/{formData.slug}/scoreboard</span>
              </div>
            </div>
          </NexaCard>
        )}

        {/* WIZARD NAVIGATION CONTROLS */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--nexa-border)]">
          <NexaButton
            size="sm"
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </NexaButton>

          {currentStep < 7 ? (
            <NexaButton
              size="sm"
              variant="primary"
              onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Step {currentStep + 1}
            </NexaButton>
          ) : (
            <NexaButton
              size="sm"
              variant="primary"
              onClick={handleCreateQuest}
              isLoading={isSubmitting}
              leftIcon={<Flame className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Publish & Launch Championship Quest
            </NexaButton>
          )}
        </div>
      </div>
    </BusinessShell>
  );
}
