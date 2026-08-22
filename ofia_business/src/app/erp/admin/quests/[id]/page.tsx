"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BusinessShell } from "@/components/business/BusinessShell";
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
  Settings,
  ArrowUpRight,
  CheckCircle2,
  Share2,
  Clock,
  Play,
  FileText,
  Sliders,
  Shield,
} from "lucide-react";

interface TeamItem {
  id: string;
  name: string;
  motto: string;
  logo: string;
  color: string;
  points: number;
  rank: number;
  membersCount: number;
}

const DEMO_TEAMS: TeamItem[] = [
  {
    id: "team-alpha",
    name: "Team Alpha (Blue Eagles)",
    motto: "Swift, Strategic, Unstoppable",
    logo: "🦅",
    color: "#1A56DB",
    points: 840,
    rank: 1,
    membersCount: 15,
  },
  {
    id: "team-bravo",
    name: "Team Bravo (Red Vipers)",
    motto: "Relentless Speed & Precision",
    logo: "🐍",
    color: "#E02424",
    points: 795,
    rank: 2,
    membersCount: 15,
  },
  {
    id: "team-delta",
    name: "Team Delta (Green Lions)",
    motto: "Courage in Every Stride",
    logo: "🦁",
    color: "#0E9F6E",
    points: 710,
    rank: 3,
    membersCount: 14,
  },
  {
    id: "team-charlie",
    name: "Team Charlie (Gold Titans)",
    motto: "Power, Intellect, Victory",
    logo: "⚡",
    color: "#D97706",
    points: 650,
    rank: 4,
    membersCount: 14,
  },
];

const DEMO_CHALLENGES = [
  {
    id: "chl-01",
    name: "🧠 Executive Company & Industry Trivia",
    type: "Speed Quiz",
    status: "COMPLETED",
    points: 150,
    winner: "Team Alpha (+150 pts)",
  },
  {
    id: "chl-02",
    name: "📸 Best Creative Team Mascot Photo",
    type: "Evidence Upload",
    status: "ACTIVE",
    points: 200,
    submissions: "3 / 4 Teams Submitted",
  },
  {
    id: "chl-03",
    name: "💡 2-Hour Product Innovation Pitch",
    type: "Judge Panel",
    status: "UPCOMING",
    points: 300,
    submissions: "Starting at 5:00 PM",
  },
  {
    id: "chl-04",
    name: "🏃 Beach Relay Agility Sprint",
    type: "Outdoor Race",
    status: "UPCOMING",
    points: 250,
    submissions: "Tomorrow 7:30 AM",
  },
];

export default function QuestOverviewCommandPage() {
  const params = useParams();
  const questId = params?.id || "qst-retreat-2026";
  const [activeTab, setActiveTab] = useState<
    "overview" | "teams" | "participants" | "challenges" | "scoreboard" | "announcements" | "results" | "settings"
  >("overview");

  const [pointsAdjustmentModal, setPointsAdjustmentModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("team-alpha");
  const [adjustPoints, setAdjustPoints] = useState("50");
  const [adjustReason, setAdjustReason] = useState("Judge bonus for team agility");

  return (
    <BusinessShell
      title="2026 Staff Retreat & Innovation Games"
      subtitle="120 Participants · 8 Teams · 14 Challenges · Epe Resort & Spa"
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/quests/2026-staff-retreat/scoreboard" target="_blank">
            <NexaButton size="sm" variant="outline" leftIcon={<Tv className="w-4 h-4 text-[#1A56DB]" />}>
              Open Stage TV Scoreboard
            </NexaButton>
          </Link>
          <Link href="/quests/2026-staff-retreat" target="_blank">
            <NexaButton size="sm" variant="outline" leftIcon={<Share2 className="w-4 h-4" />}>
              Public Page
            </NexaButton>
          </Link>
          <Link href={`/erp/admin/quests/${questId}/challenges/new`}>
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Challenge
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* QUEST NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 border-b border-[var(--nexa-border)] pb-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Flame },
            { id: "teams", label: "Teams (4)", icon: Users },
            { id: "participants", label: "Participants (120)", icon: Shield },
            { id: "challenges", label: "Challenges (4)", icon: Target },
            { id: "scoreboard", label: "Scoreboard", icon: Trophy },
            { id: "announcements", label: "Announcements", icon: Bell },
            { id: "results", label: "Results & Awards", icon: Award },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#1A56DB] text-white shadow-sm"
                    : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* LIVE LEADERBOARD BANNER */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1A56DB] via-[#1E429F] to-[#7E3AF2] text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <NexaBadge variant="green" size="sm">
                    🟢 LIVE COMPETITION
                  </NexaBadge>
                  <span className="text-xs font-mono text-white/80">Day 2 of 4 · Epe Resort & Spa</span>
                </div>
                <h2 className="text-2xl font-black">Team Alpha holds 1st Place (840 pts)</h2>
                <p className="text-xs text-white/80 max-w-xl">
                  Next Challenge: <strong>Best Creative Team Mascot Photo</strong> closes in 45 minutes. Stage scoreboard is running in Main Hall.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/erp/admin/quests/${questId}/challenges/chl-02`}>
                  <NexaButton size="md" variant="secondary" leftIcon={<Play className="w-4 h-4 text-[#1A56DB]" />} className="bg-white text-[#1A56DB] hover:bg-gray-100">
                    Judge Control Room
                  </NexaButton>
                </Link>
              </div>
            </div>

            {/* TWO COLUMN SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEADERBOARD STANDINGS */}
              <NexaCard variant="glass" padding="md" className="space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> Current Squad Standings
                  </h3>
                  <button
                    onClick={() => setActiveTab("teams")}
                    className="text-xs text-[#1A56DB] font-bold hover:underline"
                  >
                    Manage Teams →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {DEMO_TEAMS.map((team) => (
                    <div
                      key={team.id}
                      className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between hover:border-[var(--nexa-border-hover)] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[var(--nexa-card-bg)] border border-[var(--nexa-border)]">
                          {team.rank === 1 && "🥇"}
                          {team.rank === 2 && "🥈"}
                          {team.rank === 3 && "🥉"}
                          {team.rank > 3 && `#${team.rank}`}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                            <span>{team.logo}</span>
                            <span>{team.name}</span>
                          </div>
                          <div className="text-[11px] text-[var(--nexa-text-muted)]">{team.motto} · {team.membersCount} members</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-[var(--nexa-text-primary)]">{team.points} pts</div>
                        <div className="text-[10px] text-emerald-500 font-semibold">+150 today</div>
                      </div>
                    </div>
                  ))}
                </div>
              </NexaCard>

              {/* ACTIVE CHALLENGES QUEUE */}
              <NexaCard variant="glass" padding="md" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#1A56DB]" /> Challenge Track
                  </h3>
                  <button
                    onClick={() => setActiveTab("challenges")}
                    className="text-xs text-[#1A56DB] font-bold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {DEMO_CHALLENGES.map((chl) => (
                    <div key={chl.id} className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--nexa-text-primary)] line-clamp-1">{chl.name}</span>
                        <NexaBadge
                          variant={chl.status === "ACTIVE" ? "green" : chl.status === "COMPLETED" ? "secondary" : "brand"}
                          size="sm"
                        >
                          {chl.status}
                        </NexaBadge>
                      </div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)] flex items-center justify-between">
                        <span>{chl.type}</span>
                        <span className="font-semibold text-[var(--nexa-text-primary)]">+{chl.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </NexaCard>
            </div>
          </div>
        )}

        {/* TEAMS TAB */}
        {activeTab === "teams" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--nexa-text-primary)]">Squad Management (4 Teams)</h3>
              <div className="flex items-center gap-2">
                <NexaButton size="sm" variant="outline" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Auto-Balance Squads
                </NexaButton>
                <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Create Squad
                </NexaButton>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_TEAMS.map((team) => (
                <NexaCard key={team.id} variant="glass" padding="md" className="space-y-3 border-l-4" style={{ borderLeftColor: team.color }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{team.logo}</span>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--nexa-text-primary)]">{team.name}</h4>
                        <div className="text-[11px] text-[var(--nexa-text-muted)]">{team.motto}</div>
                      </div>
                    </div>
                    <NexaBadge variant="brand" size="sm">Rank #{team.rank}</NexaBadge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--nexa-border)] text-xs">
                    <div>
                      <span className="text-[var(--nexa-text-muted)]">Points: </span>
                      <strong className="text-[var(--nexa-text-primary)]">{team.points} pts</strong>
                    </div>
                    <div>
                      <span className="text-[var(--nexa-text-muted)]">Members: </span>
                      <strong className="text-[var(--nexa-text-primary)]">{team.membersCount} staff</strong>
                    </div>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}

        {/* CHALLENGES TAB */}
        {activeTab === "challenges" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--nexa-text-primary)]">Quest Challenges & Activities</h3>
              <Link href={`/erp/admin/quests/${questId}/challenges/new`}>
                <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  New Challenge
                </NexaButton>
              </Link>
            </div>

            <div className="space-y-3">
              {DEMO_CHALLENGES.map((chl) => (
                <NexaCard key={chl.id} variant="glass" padding="md" className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[var(--nexa-text-primary)]">{chl.name}</h4>
                      <NexaBadge variant={chl.status === "ACTIVE" ? "green" : chl.status === "COMPLETED" ? "secondary" : "brand"} size="sm">
                        {chl.status}
                      </NexaBadge>
                    </div>
                    <div className="text-xs text-[var(--nexa-text-muted)]">
                      {chl.type} · Max Points: <strong>+{chl.points} pts</strong> · {chl.submissions || chl.winner}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/erp/admin/quests/${questId}/challenges/${chl.id}`}>
                      <NexaButton size="sm" variant="outline">
                        Judge Desk
                      </NexaButton>
                    </Link>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}

        {/* SCOREBOARD TAB */}
        {activeTab === "scoreboard" && (
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Tv className="w-4 h-4 text-[#1A56DB]" /> Live Projector Scoreboard Telemetry
              </h3>
              <Link href="/quests/2026-staff-retreat/scoreboard" target="_blank">
                <NexaButton size="sm" variant="primary" leftIcon={<Tv className="w-4 h-4" />}>
                  Launch Full Screen
                </NexaButton>
              </Link>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)]">
              This scoreboard automatically recalculates whenever points are logged in the transactional audit ledger.
            </p>
          </NexaCard>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === "announcements" && (
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--nexa-text-primary)]">Broadcast Event Announcements</h3>
              <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Post Announcement
              </NexaButton>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)]">
              Announcements broadcast in real-time to participant mobile web consoles and the stage TV scoreboard.
            </p>
          </NexaCard>
        )}

        {/* RESULTS TAB */}
        {activeTab === "results" && (
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--nexa-text-primary)]">Podium Results & Custom Awards</h3>
              <NexaButton size="sm" variant="primary" leftIcon={<Award className="w-3.5 h-3.5" />}>
                Configure Awards
              </NexaButton>
            </div>
            <p className="text-xs text-[var(--nexa-text-secondary)]">
              Crown team champions, challenge specific medalists, and custom staff awards (MVP, Most Creative, Hustler).
            </p>
          </NexaCard>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <NexaCard variant="glass" padding="lg" className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--nexa-text-primary)]">Quest Configuration & Access</h3>
            <p className="text-xs text-[var(--nexa-text-secondary)]">
              Manage event dates, venue location, security claim codes, and custom domain CNAME branding.
            </p>
          </NexaCard>
        )}
      </div>
    </BusinessShell>
  );
}
