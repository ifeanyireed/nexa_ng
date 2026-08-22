"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Trophy,
  Flame,
  Maximize2,
  Minimize2,
  Sparkles,
  Award,
  RefreshCw,
  Clock,
  Tv,
  Target,
  Volume2,
} from "lucide-react";

interface TeamStanding {
  id: string;
  name: string;
  motto: string;
  logo: string;
  color: string;
  points: number;
  rank: number;
  recentGain?: number;
}

const INITIAL_STANDINGS: TeamStanding[] = [
  {
    id: "team-alpha",
    name: "Team Alpha (Blue Eagles)",
    motto: "Swift, Strategic, Unstoppable",
    logo: "🦅",
    color: "#1A56DB",
    points: 840,
    rank: 1,
    recentGain: 150,
  },
  {
    id: "team-bravo",
    name: "Team Bravo (Red Vipers)",
    motto: "Relentless Speed & Precision",
    logo: "🐍",
    color: "#E02424",
    points: 795,
    rank: 2,
    recentGain: 120,
  },
  {
    id: "team-delta",
    name: "Team Delta (Green Lions)",
    motto: "Courage in Every Stride",
    logo: "🦁",
    color: "#0E9F6E",
    points: 710,
    rank: 3,
    recentGain: 80,
  },
  {
    id: "team-charlie",
    name: "Team Charlie (Gold Titans)",
    motto: "Power, Intellect, Victory",
    logo: "⚡",
    color: "#D97706",
    points: 650,
    rank: 4,
    recentGain: 50,
  },
];

export default function StageTVScoreboardPage() {
  const params = useParams();
  const slug = params?.slug || "2026-staff-retreat";

  const [standings, setStandings] = useState<TeamStanding[]>(INITIAL_STANDINGS);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [liveTickerIndex, setLiveTickerIndex] = useState(0);

  const announcements = [
    "🔥 Next Challenge: Best Creative Team Mascot Photo closes in 35 minutes!",
    "⚡ Team Alpha took 1st place in the Executive Company Trivia round (+150 pts)!",
    "🏆 Evening Gala Awards Ceremony begins at 7:30 PM at the Palm Grand Ballroom.",
  ];

  // Auto-refresh timer for TV display
  useEffect(() => {
    setLastRefreshed(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Ticker rotation
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setLiveTickerIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(tickerInterval);
  }, [announcements.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* TOP HEADER */}
      <header className="p-6 border-b border-gray-800/80 bg-gray-950/60 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1A56DB] to-[#7E3AF2] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE STAGE SCOREBOARD
              </span>
              <span className="text-xs text-gray-400 font-medium">Epe Resort & Spa, Lagos</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
              2026 Annual Staff Retreat & Innovation Games
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs">
            <div className="text-gray-400 flex items-center gap-1.5 justify-end">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              Live Sync: <span className="font-mono text-white">{lastRefreshed}</span>
            </div>
            <div className="text-gray-500 text-[11px]">Auto-recalculating transactional score ledger</div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition-all shadow-md"
            title="Toggle Full Screen (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MAIN LEADERBOARD DISPLAY */}
      <main className="flex-1 p-8 flex flex-col justify-center max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {standings.map((team) => (
            <div
              key={team.id}
              className={`relative p-6 rounded-3xl border transition-all transform hover:scale-[1.01] duration-300 shadow-2xl backdrop-blur-xl flex items-center justify-between ${
                team.rank === 1
                  ? "bg-gradient-to-r from-[#1A56DB]/20 via-blue-950/40 to-indigo-950/30 border-[#1A56DB] shadow-blue-500/10"
                  : team.rank === 2
                  ? "bg-gradient-to-r from-red-950/20 via-gray-900/60 to-gray-900/30 border-red-900/50"
                  : team.rank === 3
                  ? "bg-gradient-to-r from-emerald-950/20 via-gray-900/60 to-gray-900/30 border-emerald-900/50"
                  : "bg-gray-900/40 border-gray-800"
              }`}
            >
              {/* RANK BADGE & LOGO */}
              <div className="flex items-center gap-5">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-inner border ${
                    team.rank === 1
                      ? "bg-amber-400 text-black border-amber-300 shadow-amber-500/40"
                      : team.rank === 2
                      ? "bg-slate-300 text-black border-slate-200"
                      : team.rank === 3
                      ? "bg-amber-700 text-white border-amber-600"
                      : "bg-gray-800 text-gray-300 border-gray-700"
                  }`}
                >
                  {team.rank === 1 && "🥇"}
                  {team.rank === 2 && "🥈"}
                  {team.rank === 3 && "🥉"}
                  {team.rank > 3 && `#${team.rank}`}
                </div>

                <div>
                  <div className="text-3xl mb-1">{team.logo}</div>
                  <h3 className="text-xl font-black text-white">{team.name}</h3>
                  <p className="text-xs text-gray-400 font-medium italic">&ldquo;{team.motto}&rdquo;</p>
                </div>
              </div>

              {/* POINTS ACCUMULATOR */}
              <div className="text-right">
                <div className="text-4xl font-black tracking-tight text-amber-300 font-mono">
                  {team.points.toLocaleString()}
                  <span className="text-lg text-gray-400 font-sans font-bold ml-1">pts</span>
                </div>
                {team.recentGain && (
                  <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1 justify-end">
                    <Flame className="w-3.5 h-3.5" /> +{team.recentGain} pts recently
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* BOTTOM TICKER & EVENT BANNER */}
      <footer className="p-4 bg-gray-950/80 border-t border-gray-800/80 backdrop-blur-xl flex items-center justify-between px-8 text-xs text-gray-400">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap">
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> Live Broadcast:
          </span>
          <span className="font-medium text-white truncate text-sm">
            {announcements[liveTickerIndex]}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-gray-500 font-mono">
          <span>OFIA TEAM QUESTS ENGINE</span>
          <span>·</span>
          <span>POWERED BY OFIA ERP</span>
        </div>
      </footer>
    </div>
  );
}
