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
  Clock,
  Tv,
  Target,
  Users,
  RefreshCw,
  Calendar,
  MapPin,
  Radio
} from "lucide-react";

interface TeamStanding {
  id: string;
  rank: number;
  name: string;
  custom_name?: string;
  motto: string;
  color: string;
  logo: string;
  total_points: number;
  member_count: number;
}

interface ActiveChallenge {
  id: string;
  name: string;
  day: string;
  category: string;
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
  status: "UPCOMING" | "LIVE" | "COMPLETED";
}

const DEFAULT_TEAMS: TeamStanding[] = [
  { id: "team-1", rank: 1, name: "Team 1", custom_name: "Red Phoenix", motto: "Igniting Excellence & Passion", color: "#EF4444", logo: "🔥", total_points: 0, member_count: 10 },
  { id: "team-2", rank: 2, name: "Team 2", custom_name: "Blue Falcons", motto: "Soaring Above All Limits", color: "#3B82F6", logo: "🦅", total_points: 0, member_count: 10 },
  { id: "team-3", rank: 3, name: "Team 3", custom_name: "Golden Titans", motto: "Power, Intellect, Victory", color: "#F59E0B", logo: "⚡", total_points: 0, member_count: 10 },
  { id: "team-4", rank: 4, name: "Team 4", custom_name: "Emerald Lions", motto: "Courage in Every Stride", color: "#10B981", logo: "🦁", total_points: 0, member_count: 10 },
  { id: "team-5", rank: 5, name: "Team 5", custom_name: "Purple Vipers", motto: "Speed, Precision & Synergy", color: "#8B5CF6", logo: "🐍", total_points: 0, member_count: 10 },
  { id: "team-6", rank: 6, name: "Team 6", custom_name: "Silver Sharks", motto: "Relentless Focus & Tenacity", color: "#06B6D4", logo: "🦈", total_points: 0, member_count: 10 },
];

export default function QuestArenaScoreboardPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "reignite-2026";

  const [teams, setTeams] = useState<TeamStanding[]>(DEFAULT_TEAMS);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchScoreboard = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/erp/quests/scoreboard?slug=${slug}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.leaderboard && data.leaderboard.length > 0) {
          setTeams(data.leaderboard);
        }
        if (data.active_challenge) {
          setActiveChallenge(data.active_challenge);
        }
        if (data.schedule) {
          setSchedule(data.schedule);
        }
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn("Failed to fetch scoreboard:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScoreboard();
    const timer = setInterval(fetchScoreboard, 5000); // 5s live polling
    return () => clearInterval(timer);
  }, [slug]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const sortedTeams = [...teams].sort((a, b) => b.total_points - a.total_points);
  const first = sortedTeams[0] || DEFAULT_TEAMS[0];
  const second = sortedTeams[1] || DEFAULT_TEAMS[1];
  const third = sortedTeams[2] || DEFAULT_TEAMS[2];

  const liveScheduleItem = schedule.find((s) => s.status === "LIVE");
  const nextUpcoming = schedule.find((s) => s.status === "UPCOMING");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans select-none overflow-x-hidden">
      {/* 1. TOP ARENA HEADER */}
      <header className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                REIGNITE 2026: Championship Leaderboard
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-xs text-white/50 font-medium">
              Epe Resort & Conference Centre · 60 Staff Delegates · 850 Points Target · ₦500,000 Grand Prize
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/40 font-mono">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
            <span>Updated: {lastUpdated || "Live"}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Toggle TV Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. ACTIVE EVENT & NEXT UPCOMING SCHEDULE TICKER */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LIVE SESSION */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full">
                  HAPPENING NOW
                </span>
                <span className="text-xs font-bold text-white">
                  {liveScheduleItem ? `${liveScheduleItem.title} (${liveScheduleItem.start_time})` : activeChallenge?.name || "Team Identity Presentation"}
                </span>
              </div>
              <p className="text-[11px] text-white/70 line-clamp-1">
                {liveScheduleItem ? `${liveScheduleItem.location} · ${liveScheduleItem.description}` : "Epe Resort Amphitheatre"}
              </p>
            </div>
          </div>
          {liveScheduleItem?.max_score ? (
            <div className="text-right shrink-0">
              <span className="text-xs font-black text-emerald-400">+{liveScheduleItem.max_score} pts</span>
            </div>
          ) : null}
        </div>

        {/* NEXT UPCOMING */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/30 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase bg-blue-500/30 text-blue-300 px-2 py-0.2 rounded-full">
                  UP NEXT
                </span>
                <span className="text-xs font-bold text-white">
                  {nextUpcoming ? `${nextUpcoming.title} (${nextUpcoming.start_time})` : "Card Games & Karaoke Fun (07:30 PM)"}
                </span>
              </div>
              <p className="text-[11px] text-white/70 line-clamp-1">
                {nextUpcoming ? `${nextUpcoming.location} · ${nextUpcoming.day}` : "Poolside Lounge · Day 1"}
              </p>
            </div>
          </div>
          {nextUpcoming?.max_score ? (
            <div className="text-right shrink-0">
              <span className="text-xs font-black text-blue-400">+{nextUpcoming.max_score} pts</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* 3. PODIUM STANDINGS (TOP 3) */}
      <div className="grid grid-cols-3 gap-4 mb-8 items-end max-w-4xl mx-auto w-full">
        {/* 2ND PLACE */}
        <div className="flex flex-col items-center">
          <div className="w-full p-4 rounded-t-3xl bg-slate-900/90 border border-white/10 text-center space-y-2 relative overflow-hidden shadow-xl">
            <div className="absolute top-2 left-2 text-[10px] font-black text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
              🥈 2ND PLACE
            </div>
            <div className="text-4xl pt-4">{second.logo}</div>
            <h3 className="font-black text-base text-white truncate">{second.custom_name || second.name}</h3>
            <p className="text-[10px] text-white/50 truncate">{second.motto}</p>
            <div className="text-2xl font-black text-slate-200">{second.total_points} <span className="text-xs font-normal text-white/40">pts</span></div>
          </div>
          <div className="w-full h-24 bg-gradient-to-b from-slate-800 to-slate-900 border-x border-b border-white/10 flex items-center justify-center font-black text-3xl text-slate-500">
            2
          </div>
        </div>

        {/* 1ST PLACE CHAMPION */}
        <div className="flex flex-col items-center -mt-6">
          <div className="w-full p-5 rounded-t-3xl bg-gradient-to-b from-amber-500/20 via-slate-900/95 to-slate-900 border-2 border-amber-500/50 text-center space-y-2 relative overflow-hidden shadow-2xl shadow-amber-500/10">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 rounded-full flex items-center gap-1">
              👑 1ST PLACE LEADER
            </div>
            <div className="text-5xl pt-4 animate-bounce">{first.logo}</div>
            <h3 className="font-black text-lg text-amber-300 truncate">{first.custom_name || first.name}</h3>
            <p className="text-[11px] text-white/60 truncate">{first.motto}</p>
            <div className="text-3xl font-black text-amber-400">{first.total_points} <span className="text-xs font-normal text-white/40">/ 850 pts</span></div>
          </div>
          <div className="w-full h-36 bg-gradient-to-b from-amber-600/30 via-slate-800 to-slate-900 border-x-2 border-b-2 border-amber-500/50 flex flex-col items-center justify-center font-black text-5xl text-amber-400 shadow-xl">
            1
            <span className="text-[10px] font-bold text-amber-300/80 uppercase tracking-widest mt-1">CHAMPION</span>
          </div>
        </div>

        {/* 3RD PLACE */}
        <div className="flex flex-col items-center">
          <div className="w-full p-4 rounded-t-3xl bg-slate-900/90 border border-white/10 text-center space-y-2 relative overflow-hidden shadow-xl">
            <div className="absolute top-2 left-2 text-[10px] font-black text-amber-600 bg-white/5 px-2 py-0.5 rounded-full">
              🥉 3RD PLACE
            </div>
            <div className="text-4xl pt-4">{third.logo}</div>
            <h3 className="font-black text-base text-white truncate">{third.custom_name || third.name}</h3>
            <p className="text-[10px] text-white/50 truncate">{third.motto}</p>
            <div className="text-2xl font-black text-amber-600/90">{third.total_points} <span className="text-xs font-normal text-white/40">pts</span></div>
          </div>
          <div className="w-full h-16 bg-gradient-to-b from-slate-800 to-slate-900 border-x border-b border-white/10 flex items-center justify-center font-black text-2xl text-slate-600">
            3
          </div>
        </div>
      </div>

      {/* 4. FULL SQUAD STANDINGS TABLE */}
      <div className="max-w-5xl mx-auto w-full bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 shadow-2xl space-y-3">
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-blue-400" /> Complete 6-Squad Championship Standing
        </h3>

        <div className="space-y-2">
          {sortedTeams.map((team, idx) => (
            <div
              key={team.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                idx === 0
                  ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5"
                  : "bg-slate-950/60 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-sm">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </div>
                <span className="text-2xl">{team.logo}</span>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    {team.custom_name || team.name}
                    <span className="text-[10px] text-white/40 font-mono font-normal">({team.name})</span>
                  </h4>
                  <p className="text-[11px] text-white/50">{team.motto} · {team.member_count} Staff Assigned</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-black text-white">{team.total_points} <span className="text-xs font-normal text-white/40">pts</span></div>
                <div className="text-[10px] text-emerald-400 font-semibold">{((team.total_points / 850) * 100).toFixed(0)}% Completed</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. FOOTER GRAND PRIZE BANNER */}
      <footer className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <div>
          <span>REIGNITE 2026 Enterprise Games · Powered by Ofia ERP Quest Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black px-3 py-1 rounded-full text-xs shadow-lg shadow-amber-500/20">
            🏆 ₦500,000 GRAND PRIZE
          </span>
        </div>
      </footer>
    </div>
  );
}
