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
} from "lucide-react";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaCard } from "@/components/nexa/NexaCard";

export default function PublicQuestLandingPage() {
  const params = useParams();
  const slug = params?.slug || "2026-staff-retreat";

  const teams = [
    { name: "Team Alpha (Blue Eagles)", logo: "🦅", points: 840, rank: 1, motto: "Swift, Strategic, Unstoppable" },
    { name: "Team Bravo (Red Vipers)", logo: "🐍", points: 795, rank: 2, motto: "Relentless Speed & Precision" },
    { name: "Team Delta (Green Lions)", logo: "🦁", points: 710, rank: 3, motto: "Courage in Every Stride" },
    { name: "Team Charlie (Gold Titans)", logo: "⚡", points: 650, rank: 4, motto: "Power, Intellect, Victory" },
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
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80"
          alt="Retreat"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--nexa-bg-base)] via-[var(--nexa-bg-base)]/40 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 pb-8 w-full space-y-2">
          <div className="flex items-center gap-2">
            <NexaBadge variant="green" size="sm">🟢 LIVE RETREAT EVENT</NexaBadge>
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
        {/* LEADERBOARD STANDINGS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Current Leaderboard Ranks
            </h2>
            <Link href={`/quests/${slug}/scoreboard`} className="text-xs text-[#1A56DB] font-bold hover:underline">
              View Stage Display →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((t) => (
              <NexaCard key={t.name} variant="glass" padding="md" className="space-y-3 text-center">
                <div className="text-3xl">{t.logo}</div>
                <div>
                  <div className="text-xs font-bold text-[var(--nexa-text-primary)]">{t.name}</div>
                  <div className="text-[11px] text-[var(--nexa-text-muted)] italic">&ldquo;{t.motto}&rdquo;</div>
                </div>
                <div className="pt-2 border-t border-[var(--nexa-border)]">
                  <div className="text-xl font-black text-[#1A56DB] font-mono">{t.points} pts</div>
                  <NexaBadge variant={t.rank === 1 ? "green" : "brand"} size="sm">
                    {t.rank === 1 ? "🥇 1st Place" : t.rank === 2 ? "🥈 2nd Place" : t.rank === 3 ? "🥉 3rd Place" : "4th Place"}
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
