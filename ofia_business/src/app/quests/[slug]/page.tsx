"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Trophy,
  Flame,
  Calendar,
  Users,
  Target,
  Tv,
  Award,
  Sparkles,
  MapPin,
  Share2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaCard } from "@/components/nexa/NexaCard";

export default function PublicQuestLandingPage() {
  const params = useParams();
  const slug = params?.slug || "2026-staff-retreat";

  const topContestants = [
    { rank: 1, name: "Haylie", country: "USA", flag: "🇺🇸", avatar: "/avatar1.png", score: 8, team: "Team Alpha (Blue Eagles)" },
    { rank: 2, name: "Rayna", country: "Japan", flag: "🇯🇵", avatar: "/avatar2.png", score: 8, team: "Team Bravo (Red Vipers)" },
    { rank: 3, name: "Liam", country: "Canada", flag: "🇨🇦", avatar: "/avatar3.png", score: 7, team: "Team Alpha (Blue Eagles)" },
    { rank: 4, name: "Sofia", country: "UK", flag: "🇬🇧", avatar: "/avatar4.png", score: 6, team: "Team Delta (Green Lions)" },
    { rank: 5, name: "Jasper", country: "Australia", flag: "🇦🇺", avatar: "/avatar5.png", score: 5, team: "Team Charlie (Gold Titans)" },
  ];

  const teams = [
    { name: "Team Alpha (Blue Eagles)", logo: "🦅", points: 840, rank: 1, motto: "Swift, Strategic, Unstoppable", color: "#1A56DB" },
    { name: "Team Bravo (Red Vipers)", logo: "🐍", points: 795, rank: 2, motto: "Relentless Speed & Precision", color: "#E02424" },
    { name: "Team Delta (Green Lions)", logo: "🦁", points: 710, rank: 3, motto: "Courage in Every Stride", color: "#0E9F6E" },
    { name: "Team Charlie (Gold Titans)", logo: "👑", points: 650, rank: 4, motto: "Power, Intellect, Victory", color: "#D97706" },
  ];

  const challenges = [
    { name: "Executive Company Trivia", type: "Speed Quiz", winner: "Team Alpha (150 pts)", status: "COMPLETED" },
    { name: "Best Creative Team Mascot Photo", type: "Evidence Review", winner: "In Review", status: "ACTIVE" },
    { name: "2-Hour Product Innovation Pitch", type: "Panel Pitch", winner: "Starts 5:00 PM", status: "UPCOMING" },
  ];

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] font-sans">
      {/* PUBLIC NAVBAR */}
      <header className="sticky top-0 z-40 bg-[var(--nexa-card-bg)]/80 backdrop-blur-xl border-b border-[var(--nexa-border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A56DB] to-[#7E3AF2] flex items-center justify-center text-white">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#1A56DB] uppercase">Ofia Team Quests</div>
            <h1 className="text-sm font-black text-[var(--nexa-text-primary)]">2026 Annual Staff Retreat</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/quests/${slug}/scoreboard`} target="_blank">
            <NexaButton size="sm" variant="primary" leftIcon={<Tv className="w-4 h-4" />}>
              Open TV Scoreboard
            </NexaButton>
          </Link>
          <Link href="/login">
            <NexaButton size="sm" variant="outline">
              Employee Login
            </NexaButton>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="relative h-80 overflow-hidden bg-gray-950 flex items-end">
        <img
          src="/background.jpeg"
          alt="Retreat Background"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--nexa-bg-base)] via-[var(--nexa-bg-base)]/50 to-black/30" />

        <div className="relative max-w-5xl mx-auto px-6 pb-8 w-full space-y-2">
          <div className="flex items-center gap-2">
            <NexaBadge variant="green" size="sm" className="flex items-center gap-1 rounded-full">
              <Flame className="w-3 h-3 text-emerald-400" /> LIVE RETREAT EVENT
            </NexaBadge>
            <span className="text-xs font-mono text-white/90">Epe Resort & Spa, Lagos · Aug 22–25</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            2026 Annual Staff Retreat & Innovation Games
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
            Celebrating cross-department collaboration, agility sports, team building, and executive product hackathon pitches.
          </p>
        </div>
      </div>

      {/* CONTENT CONTAINER */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* TOP INDIVIDUAL CONTESTANTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Top Contestants (3D Avatars)
            </h2>
            <Link href={`/quests/${slug}/scoreboard`} className="text-xs text-[#1A56DB] font-bold hover:underline flex items-center gap-1">
              <span>View Full Stage TV Scoreboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {topContestants.map((c) => (
              <NexaCard key={c.name} variant="glass" padding="md" className="space-y-3 text-center rounded-3xl relative overflow-hidden group hover:border-amber-400/40 transition-all">
                <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-white/20 bg-black/20 shadow-md group-hover:scale-105 transition-transform">
                  <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--nexa-text-primary)] flex items-center justify-center gap-1.5">
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)] truncate">{c.team}</div>
                </div>
                <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between px-1">
                  <span className="text-xs text-[var(--nexa-text-muted)] font-medium">Rank #{c.rank}</span>
                  <span className="text-base font-black text-[#1A56DB] font-mono">{c.score} pts</span>
                </div>
              </NexaCard>
            ))}
          </div>
        </div>

        {/* TEAM SQUAD RANKS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Team Squad Standings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((t) => (
              <NexaCard key={t.name} variant="glass" padding="md" className="space-y-3 text-center rounded-3xl">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto shadow-inner border border-white/10"
                  style={{ backgroundColor: `${t.color}20` }}
                >
                  {t.logo}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--nexa-text-primary)]">{t.name}</div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)] italic">&ldquo;{t.motto}&rdquo;</div>
                </div>
                <div className="pt-2 border-t border-[var(--nexa-border)]">
                  <div className="text-xl font-black text-[#1A56DB] font-mono">{t.points} pts</div>
                  <NexaBadge variant={t.rank === 1 ? "green" : "brand"} size="sm" className="rounded-full flex items-center gap-1 justify-center">
                    {t.rank === 1 ? (
                      <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-500" /> 1st Place</span>
                    ) : t.rank === 2 ? (
                      <span className="flex items-center gap-1"><Award className="w-3 h-3 text-slate-400" /> 2nd Place</span>
                    ) : t.rank === 3 ? (
                      <span className="flex items-center gap-1"><Award className="w-3 h-3 text-amber-700" /> 3rd Place</span>
                    ) : (
                      "4th Place"
                    )}
                  </NexaBadge>
                </div>
              </NexaCard>
            ))}
          </div>
        </div>

        {/* CHALLENGE SCHEDULE */}
        <div className="space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-[#1A56DB]" /> Event Challenges & Activities
          </h2>

          <div className="space-y-3">
            {challenges.map((c) => (
              <NexaCard key={c.name} variant="glass" padding="md" className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[var(--nexa-text-primary)]">{c.name}</div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)]">{c.type} · Status: {c.winner}</div>
                </div>
                <NexaBadge variant={c.status === "ACTIVE" ? "green" : c.status === "COMPLETED" ? "secondary" : "brand"} size="sm">
                  {c.status}
                </NexaBadge>
              </NexaCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
