"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Trophy,
  Flame,
  Target,
  Tv,
  Award,
  Medal,
  ArrowRight,
} from "lucide-react";
import {
  fetchDatabaseTenants,
  extractSubdomainOrParam,
  slugToTenantName,
} from "@/lib/tenant-context";

export default function PublicQuestLandingPage() {
  const params = useParams();
  const slug = params?.slug || "2026-staff-retreat";
  const [mounted, setMounted] = useState(false);
  const [tenantName, setTenantName] = useState<string>("Ofia Workspace");

  useEffect(() => {
    setMounted(true);
    fetchDatabaseTenants()
      .then((list) => {
        const sub = extractSubdomainOrParam();
        const matched = list.find(
          (t) => t.slug.toLowerCase() === sub?.toLowerCase()
        );
        if (matched?.name) {
          setTenantName(matched.name);
        } else if (sub) {
          setTenantName(slugToTenantName(sub));
        }
      })
      .catch(() => {});
  }, []);

  const topContestants = [
    { rank: 1, name: "Haylie", avatar: "/avatar1.png", score: 8, team: "Team Alpha (Blue Eagles)" },
    { rank: 2, name: "Rayna", avatar: "/avatar2.png", score: 8, team: "Team Bravo (Red Vipers)" },
    { rank: 3, name: "Liam", avatar: "/avatar3.png", score: 7, team: "Team Alpha (Blue Eagles)" },
    { rank: 4, name: "Sofia", avatar: "/avatar4.png", score: 6, team: "Team Delta (Green Lions)" },
    { rank: 5, name: "Jasper", avatar: "/avatar5.png", score: 5, team: "Team Charlie (Gold Titans)" },
  ];

  const teams = [
    { name: "Team Alpha (Blue Eagles)", initial: "A", points: 840, rank: 1, motto: "Swift, Strategic, Unstoppable", color: "#1A56DB" },
    { name: "Team Bravo (Red Vipers)", initial: "B", points: 795, rank: 2, motto: "Relentless Speed & Precision", color: "#E02424" },
    { name: "Team Delta (Green Lions)", initial: "D", points: 710, rank: 3, motto: "Courage in Every Stride", color: "#0E9F6E" },
    { name: "Team Charlie (Gold Titans)", initial: "C", points: 650, rank: 4, motto: "Power, Intellect, Victory", color: "#D97706" },
  ];

  const challenges = [
    { name: "Executive Company Trivia", type: "Speed Quiz", winner: "Team Alpha (150 pts)", status: "COMPLETED" },
    { name: "Best Creative Team Mascot Photo", type: "Evidence Review", winner: "In Review", status: "ACTIVE" },
    { name: "2-Hour Product Innovation Pitch", type: "Panel Pitch", winner: "Starts 5:00 PM", status: "UPCOMING" },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white font-sans" />
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-black text-white font-sans selection:bg-[#1A56DB]/30"
    >
      {/* HERO SECTION WITH EXPANDED GRADIENT SPREAD */}
      <div className="relative overflow-hidden bg-black min-h-[460px] flex flex-col justify-between pb-16 pt-2">
        <img
          src="/background.jpeg"
          alt="Retreat Background"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-80"
        />
        {/* ULTRA-SMOOTH SPREAD GRADIENT: FULL-HEIGHT PROGRESSIVE SPREAD */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0.06) 20%, rgba(0,0,0,0.18) 32%, rgba(0,0,0,0.36) 48%, rgba(0,0,0,0.58) 64%, rgba(0,0,0,0.80) 80%, rgba(0,0,0,0.95) 92%, rgba(0,0,0,1) 100%)",
          }}
        />

        {/* PUBLIC NAVBAR FLOATING OVER HERO IMAGE */}
        <header className="relative z-40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Ofia Logo" className="w-9 h-9 object-contain shrink-0" />
            <div>
              <div className="text-xs font-mono font-medium text-[#3B82F6] uppercase tracking-wider">{tenantName}</div>
              <h1 className="text-sm font-semibold text-white">2026 Annual Staff Retreat</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/quests/${slug}/scoreboard`} target="_blank">
              <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A56DB] hover:bg-[#1E429F] text-white text-xs font-medium border border-[#3F83F8]/30 shadow-[0_4px_14px_rgba(26,86,219,0.35)] transition-all">
                <Tv className="w-4 h-4" />
                <span>Open TV Scoreboard</span>
              </button>
            </Link>
            <Link href="/login">
              <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/90 hover:text-white text-xs font-medium border border-white/10 backdrop-blur-md transition-all">
                Employee Login
              </button>
            </Link>
          </div>
        </header>

        {/* HERO TITLE & EVENT INFO */}
        <div className="relative max-w-5xl mx-auto px-6 pt-14 pb-4 w-full space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" /> LIVE RETREAT EVENT
            </span>
            <span className="text-xs font-mono text-white/75">Epe Resort & Spa, Lagos · Aug 22–25</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            2026 Annual Staff Retreat & Innovation Games
          </h1>
          <p className="text-xs sm:text-sm text-white/70 max-w-2xl">
            Celebrating cross-department collaboration, agility sports, team building, and executive product hackathon pitches.
          </p>
        </div>
      </div>

      {/* CONTENT CONTAINER */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* TOP INDIVIDUAL CONTESTANTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2 text-white">
              <Medal className="w-5 h-5 text-[#3B82F6]" /> Top Contestants
            </h2>
            <Link href={`/quests/${slug}/scoreboard`} className="text-xs text-[#3B82F6] hover:text-[#60A5FA] font-medium hover:underline flex items-center gap-1">
              <span>View Full Stage TV Scoreboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {topContestants.map((c) => (
              <div key={c.name} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-4 space-y-3 text-center rounded-3xl relative overflow-hidden group hover:border-[#1A56DB]/50 hover:bg-white/[0.07] transition-all shadow-sm flex flex-col justify-between">
                <div className="relative h-20 sm:h-24 flex items-center justify-center pt-1">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="h-full w-auto max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-white flex items-center justify-center">
                    <span className="whitespace-nowrap">{c.name}</span>
                  </div>
                  <div className="text-[11px] text-white/50 truncate whitespace-nowrap">{c.team}</div>
                </div>
                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between px-1">
                  <span className="text-xs text-white/50 font-normal whitespace-nowrap">Rank #{c.rank}</span>
                  <span className="text-base font-semibold text-[#3B82F6] font-mono whitespace-nowrap">{c.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TEAM SQUAD RANKS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-[#3B82F6]" /> Team Squad Standings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((t) => (
              <div key={t.name} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-4 space-y-3 text-center rounded-3xl hover:border-[#1A56DB]/40 hover:bg-white/[0.07] transition-all shadow-sm">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-semibold mx-auto shadow-inner border border-white/10"
                  style={{ backgroundColor: `${t.color}25`, color: t.color }}
                >
                  {t.initial}
                </div>
                <div>
                  <div className="font-medium text-white text-sm tracking-tight truncate whitespace-nowrap">{t.name}</div>
                  <div className="text-[11px] text-white/40 italic truncate whitespace-nowrap">&ldquo;{t.motto}&rdquo;</div>
                </div>
                <div className="pt-2 border-t border-white/[0.08]">
                  <div className="text-xl font-semibold text-[#3B82F6] font-mono mb-1.5">{t.points} pts</div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-normal bg-white/10 text-white/80 border border-white/10">
                    {t.rank === 1 ? (
                      <span className="flex items-center gap-1 text-amber-400"><Trophy className="w-3 h-3 text-amber-400" /> 1st Place</span>
                    ) : t.rank === 2 ? (
                      <span className="flex items-center gap-1 text-slate-300"><Award className="w-3 h-3 text-slate-300" /> 2nd Place</span>
                    ) : t.rank === 3 ? (
                      <span className="flex items-center gap-1 text-amber-600"><Award className="w-3 h-3 text-amber-600" /> 3rd Place</span>
                    ) : (
                      "4th Place"
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHALLENGE SCHEDULE */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-[#3B82F6]" /> Event Challenges & Activities
          </h2>

          <div className="space-y-3">
            {challenges.map((c) => (
              <div key={c.name} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between hover:border-[#1A56DB]/40 hover:bg-white/[0.07] transition-all shadow-sm">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-white">{c.name}</div>
                  <div className="text-[11px] text-white/50">{c.type} · Status: {c.winner}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  c.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse"
                    : c.status === "COMPLETED"
                    ? "bg-white/10 text-white/70 border-white/10"
                    : "bg-[#1A56DB]/20 text-[#60A5FA] border-[#1A56DB]/30"
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
