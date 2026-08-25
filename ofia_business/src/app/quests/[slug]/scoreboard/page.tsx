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
  Volume2,
  VolumeX,
  Search,
  Users,
  ChevronRight,
  Medal,
} from "lucide-react";

export interface Contestant {
  id: string;
  rank: number;
  name: string;
  fullName: string;
  country: string;
  avatar: string;
  score: number;
  team: string;
  recentDelta?: number;
}

export interface TeamStanding {
  id: string;
  rank: number;
  name: string;
  motto: string;
  color: string;
  initial: string;
  points: number;
  recentGain?: number;
  membersCount: number;
}

// 30 Contestants with 3D avatars (avatar1.png to avatar30.png)
const ALL_30_CONTESTANTS: Contestant[] = [
  {
    id: "c-1",
    rank: 1,
    name: "Haylie",
    fullName: "Haylie Adebayo",
    country: "USA",
    avatar: "/avatar1.png",
    score: 8,
    team: "Team Alpha (Blue Eagles)",
    recentDelta: 1,
  },
  {
    id: "c-2",
    rank: 2,
    name: "Rayna",
    fullName: "Rayna Okafor",
    country: "Japan",
    avatar: "/avatar2.png",
    score: 8,
    team: "Team Bravo (Red Vipers)",
    recentDelta: 2,
  },
  {
    id: "c-3",
    rank: 3,
    name: "Liam",
    fullName: "Liam Nwachukwu",
    country: "Canada",
    avatar: "/avatar3.png",
    score: 7,
    team: "Team Alpha (Blue Eagles)",
    recentDelta: 1,
  },
  {
    id: "c-4",
    rank: 4,
    name: "Sofia",
    fullName: "Sofia Jinadu",
    country: "UK",
    avatar: "/avatar4.png",
    score: 6,
    team: "Team Delta (Green Lions)",
  },
  {
    id: "c-5",
    rank: 5,
    name: "Jasper",
    fullName: "Jasper Aliyu",
    country: "Australia",
    avatar: "/avatar5.png",
    score: 5,
    team: "Team Charlie (Gold Titans)",
  },
  {
    id: "c-6",
    rank: 6,
    name: "Amara",
    fullName: "Amara Obi",
    country: "Nigeria",
    avatar: "/avatar6.png",
    score: 5,
    team: "Team Bravo (Red Vipers)",
  },
  {
    id: "c-7",
    rank: 7,
    name: "Klaus",
    fullName: "Klaus Weber",
    country: "Germany",
    avatar: "/avatar7.png",
    score: 5,
    team: "Team Alpha (Blue Eagles)",
  },
  {
    id: "c-8",
    rank: 8,
    name: "Chloe",
    fullName: "Chloe Dubois",
    country: "France",
    avatar: "/avatar8.png",
    score: 4,
    team: "Team Delta (Green Lions)",
  },
  {
    id: "c-9",
    rank: 9,
    name: "Tariq",
    fullName: "Tariq Kimani",
    country: "Kenya",
    avatar: "/avatar9.png",
    score: 4,
    team: "Team Charlie (Gold Titans)",
  },
  {
    id: "c-10",
    rank: 10,
    name: "Zara",
    fullName: "Zara Van der Merwe",
    country: "South Africa",
    avatar: "/avatar10.png",
    score: 4,
    team: "Team Bravo (Red Vipers)",
  },
  {
    id: "c-11",
    rank: 11,
    name: "Kwame",
    fullName: "Kwame Mensah",
    country: "Ghana",
    avatar: "/avatar11.png",
    score: 4,
    team: "Team Alpha (Blue Eagles)",
  },
  {
    id: "c-12",
    rank: 12,
    name: "Elena",
    fullName: "Elena Santos",
    country: "Brazil",
    avatar: "/avatar12.png",
    score: 3,
    team: "Team Delta (Green Lions)",
  },
  {
    id: "c-13",
    rank: 13,
    name: "Matteo",
    fullName: "Matteo Rossi",
    country: "Italy",
    avatar: "/avatar13.png",
    score: 3,
    team: "Team Charlie (Gold Titans)",
  },
  {
    id: "c-14",
    rank: 14,
    name: "Lucia",
    fullName: "Lucia Fernandez",
    country: "Spain",
    avatar: "/avatar14.png",
    score: 3,
    team: "Team Bravo (Red Vipers)",
  },
  {
    id: "c-15",
    rank: 15,
    name: "Lars",
    fullName: "Lars Van Dijk",
    country: "Netherlands",
    avatar: "/avatar15.png",
    score: 3,
    team: "Team Alpha (Blue Eagles)",
  },
  {
    id: "c-16",
    rank: 16,
    name: "Mei",
    fullName: "Mei Tan",
    country: "Singapore",
    avatar: "/avatar16.png",
    score: 3,
    team: "Team Delta (Green Lions)",
  },
  {
    id: "c-17",
    rank: 17,
    name: "Freja",
    fullName: "Freja Lindqvist",
    country: "Sweden",
    avatar: "/avatar17.png",
    score: 2,
    team: "Team Charlie (Gold Titans)",
  },
  {
    id: "c-18",
    rank: 18,
    name: "Marc",
    fullName: "Marc Meier",
    country: "Switzerland",
    avatar: "/avatar18.png",
    score: 2,
    team: "Team Bravo (Red Vipers)",
  },
  {
    id: "c-19",
    rank: 19,
    name: "Nour",
    fullName: "Nour Al-Mansoor",
    country: "UAE",
    avatar: "/avatar19.png",
    score: 2,
    team: "Team Alpha (Blue Eagles)",
  },
  {
    id: "c-20",
    rank: 20,
    name: "Sean",
    fullName: "Sean O'Connor",
    country: "Ireland",
    avatar: "/avatar20.png",
    score: 2,
    team: "Team Delta (Green Lions)",
  },
  {
    id: "c-21",
    rank: 21,
    name: "Kahu",
    fullName: "Kahu Te Rangi",
    country: "New Zealand",
    avatar: "/avatar21.png",
    score: 2,
    team: "Team Charlie (Gold Titans)",
  },
  {
    id: "c-22",
    rank: 22,
    name: "Diego",
    fullName: "Diego Morales",
    country: "Mexico",
    avatar: "/avatar22.png",
    score: 2,
    team: "Team Bravo (Red Vipers)",
  },
  {
    id: "c-23",
    rank: 23,
    name: "Min-jun",
    fullName: "Min-jun Park",
    country: "South Korea",
    avatar: "/avatar23.png",
    score: 2,
    team: "Team Alpha (Blue Eagles)",
  },
  {
    id: "c-24",
    rank: 24,
    name: "Astrid",
    fullName: "Astrid Hansen",
    country: "Norway",
    avatar: "/avatar24.png",
    score: 1,
    team: "Team Delta (Green Lions)",
  },
  {
    id: "c-25",
    rank: 25,
    name: "Mikkel",
    fullName: "Mikkel Nielsen",
    country: "Denmark",
    avatar: "/avatar25.png",
    score: 1,
    team: "Team Charlie (Gold Titans)",
  },
  {
    id: "c-26",
    rank: 26,
    name: "Ines",
    fullName: "Ines Silva",
    country: "Portugal",
    avatar: "/avatar26.png",
    score: 1,
    team: "Team Bravo (Red Vipers)",
  },
  {
    id: "c-27",
    rank: 27,
    name: "Lucas",
    fullName: "Lucas Peeters",
    country: "Belgium",
    avatar: "/avatar27.png",
    score: 1,
    team: "Team Alpha (Blue Eagles)",
  },
  {
    id: "c-28",
    rank: 28,
    name: "Hannah",
    fullName: "Hannah Gruber",
    country: "Austria",
    avatar: "/avatar28.png",
    score: 1,
    team: "Team Delta (Green Lions)",
  },
  {
    id: "c-29",
    rank: 29,
    name: "Chinedu",
    fullName: "Chinedu Nwosu",
    country: "Finland",
    avatar: "/avatar29.png",
    score: 1,
    team: "Team Charlie (Gold Titans)",
  },
  {
    id: "c-30",
    rank: 30,
    name: "Zikora",
    fullName: "Zikora Martins",
    country: "India",
    avatar: "/avatar30.png",
    score: 1,
    team: "Team Alpha (Blue Eagles)",
  },
];

const INITIAL_TEAMS: TeamStanding[] = [
  {
    id: "team-alpha",
    rank: 1,
    name: "Team Alpha (Blue Eagles)",
    motto: "Swift, Strategic, Unstoppable",
    color: "#1A56DB",
    initial: "A",
    points: 840,
    recentGain: 150,
    membersCount: 8,
  },
  {
    id: "team-bravo",
    rank: 2,
    name: "Team Bravo (Red Vipers)",
    motto: "Relentless Speed & Precision",
    color: "#E02424",
    initial: "B",
    points: 795,
    recentGain: 120,
    membersCount: 7,
  },
  {
    id: "team-delta",
    rank: 3,
    name: "Team Delta (Green Lions)",
    motto: "Courage in Every Stride",
    color: "#0E9F6E",
    initial: "D",
    points: 710,
    recentGain: 80,
    membersCount: 8,
  },
  {
    id: "team-charlie",
    rank: 4,
    name: "Team Charlie (Gold Titans)",
    motto: "Power, Intellect, Victory",
    color: "#D97706",
    initial: "C",
    points: 650,
    recentGain: 50,
    membersCount: 7,
  },
];

export default function StageTVScoreboardPage() {
  const params = useParams();
  const slug = params?.slug || "2026-staff-retreat";

  const [mounted, setMounted] = useState(false);
  const [contestants, setContestants] = useState<Contestant[]>(ALL_30_CONTESTANTS);
  const [teams, setTeams] = useState<TeamStanding[]>(INITIAL_TEAMS);
  const [viewMode, setViewMode] = useState<"top5" | "top10" | "all30" | "teams">("top5");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleFullscreen = () => {
    if (typeof document !== "undefined") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Filtered contestants list
  const filteredContestants = contestants.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.fullName.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.team.toLowerCase().includes(q)
    );
  });

  const displayedContestants =
    viewMode === "top5"
      ? filteredContestants.slice(0, 5)
      : viewMode === "top10"
      ? filteredContestants.slice(0, 10)
      : filteredContestants;

  if (!mounted) {
    return (
      <div className="relative min-h-screen text-white flex flex-col justify-between font-sans bg-black">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url('/background.jpeg')` }}
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[7px]" />
          <div className="absolute inset-0 bg-radial from-black/20 via-black/50 to-black/85 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen text-white flex flex-col justify-between select-none overflow-x-hidden font-sans bg-black"
    >
      {/* BACKGROUND IMAGE WITH BLURRED DARK OVERLAY */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url('/background.jpeg')` }}
      >
        {/* Dark blur overlay matching leaderboard reference */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[7px]" />
        <div className="absolute inset-0 bg-radial from-black/20 via-black/50 to-black/85 pointer-events-none" />
      </div>

      {/* TOP FLOATING CONTROLS */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/quests/${slug}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/75 hover:text-white text-xs font-medium backdrop-blur-md transition-all shadow-md"
          >
            <span>← Quest Hub</span>
          </Link>

          {/* VIEW SELECTOR PILLS */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs">
            <button
              onClick={() => setViewMode("top5")}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                viewMode === "top5"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Top 5 (Stage View)
            </button>
            <button
              onClick={() => setViewMode("top10")}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                viewMode === "top10"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setViewMode("all30")}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                viewMode === "all30"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              All 30 Contestants
            </button>
            <button
              onClick={() => setViewMode("teams")}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                viewMode === "teams"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Team Standings
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/75 hover:text-white backdrop-blur-md transition-all shadow-md"
            title={isSoundMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/75 hover:text-white backdrop-blur-md transition-all shadow-md"
            title="Toggle Fullscreen (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN CENTER LEADERBOARD CARD */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-3xl sm:max-w-4xl relative rounded-[32px] bg-[#140e0c]/75 backdrop-blur-2xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.85)] p-6 sm:p-10 overflow-hidden transition-all">
          {/* TOP WARM GLOW BACKGROUND ACCENT */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-amber-600/25 via-red-600/10 to-transparent blur-3xl pointer-events-none" />

          {/* CARD HEADER: RED LIVE DOT + LEADERBOARD TITLE */}
          <div className="relative text-center mb-6 sm:mb-8 space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
              <span className="text-xs sm:text-sm font-medium tracking-[0.25em] text-white/95 uppercase">
                LIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-white drop-shadow-md">
              {viewMode === "teams" ? "TEAM STANDINGS" : "LEADERBOARD"}
            </h1>
          </div>

          {/* CONTESTANTS TABLE VIEW */}
          {viewMode !== "teams" ? (
            <div className="space-y-1">
              {/* SEARCH BAR (FOR ALL 30 VIEW) */}
              {viewMode === "all30" && (
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search 30 contestants by name or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              )}

              {/* TABLE COLUMN HEADERS */}
              <div className="grid grid-cols-12 items-center text-xs sm:text-sm font-normal text-white/40 tracking-wider pb-3 border-b border-white/[0.06] px-2 select-none">
                <div className="col-span-1 text-center"></div>
                <div className="col-span-3 pl-2 whitespace-nowrap">Player</div>
                <div className="col-span-6 whitespace-nowrap">Teams</div>
                <div className="col-span-2 text-right pr-2 whitespace-nowrap">Score</div>
              </div>

              {/* TABLE ROWS */}
              <div
                className={`divide-y divide-white/[0.04] ${
                  viewMode === "all30" ? "max-h-[480px] overflow-y-auto pr-1" : ""
                }`}
              >
                {displayedContestants.map((contestant) => (
                  <div
                    key={contestant.id}
                    className="grid grid-cols-12 items-center py-3.5 sm:py-4 px-2 rounded-2xl transition-all duration-200 hover:bg-white/[0.06] group cursor-default"
                  >
                    {/* RANK NUMBER */}
                    <div className="col-span-1 text-center font-normal text-white/70 text-sm sm:text-base whitespace-nowrap">
                      {contestant.rank}
                    </div>

                    {/* PLAYER */}
                    <div className="col-span-3 pl-2 truncate min-w-0">
                      <div className="font-medium text-white/95 text-base sm:text-lg tracking-tight group-hover:text-white transition-colors truncate whitespace-nowrap">
                        {contestant.name}
                      </div>
                    </div>

                    {/* TEAM */}
                    <div className="col-span-6 flex items-center text-white/85 text-sm sm:text-base font-normal pr-2 min-w-0">
                      <span className="truncate whitespace-nowrap w-full">{contestant.team}</span>
                    </div>

                    {/* SCORE (INTEGER / POINTS) */}
                    <div className="col-span-2 text-right pr-2 font-normal text-white/90 text-base sm:text-lg whitespace-nowrap">
                      {contestant.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* TEAM STANDINGS VIEW */
            <div className="space-y-3">
              <div className="grid grid-cols-12 items-center text-xs sm:text-sm font-normal text-white/40 tracking-wider pb-3 border-b border-white/[0.06] px-2 select-none">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-9 pl-2 whitespace-nowrap">Team Squad</div>
                <div className="col-span-2 text-right pr-2 whitespace-nowrap">Total Points</div>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-12 items-center py-4 px-2 rounded-2xl transition-all duration-200 hover:bg-white/[0.06] group"
                  >
                    <div className="col-span-1 text-center font-normal text-white/70 text-base sm:text-lg whitespace-nowrap">
                      {t.rank === 1 ? (
                        <Trophy className="w-5 h-5 text-amber-400 mx-auto" />
                      ) : t.rank === 2 ? (
                        <Award className="w-5 h-5 text-slate-300 mx-auto" />
                      ) : t.rank === 3 ? (
                        <Award className="w-5 h-5 text-amber-700 mx-auto" />
                      ) : (
                        `#${t.rank}`
                      )}
                    </div>

                    <div className="col-span-9 flex items-center gap-3 pl-2 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-semibold shrink-0 border border-white/20 shadow-md"
                        style={{ backgroundColor: `${t.color}25`, color: t.color }}
                      >
                        {t.initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-white text-base sm:text-lg tracking-tight group-hover:text-amber-200 transition-colors truncate whitespace-nowrap">
                          {t.name}
                        </div>
                        <div className="text-xs text-white/40 italic truncate whitespace-nowrap">
                          &ldquo;{t.motto}&rdquo;
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 text-right pr-2 whitespace-nowrap">
                      <div className="font-mono font-medium text-amber-300 text-lg sm:text-2xl">
                        {t.points.toLocaleString()}
                        <span className="text-xs text-white/50 font-sans font-normal ml-1">
                          pts
                        </span>
                      </div>
                      {t.recentGain && (
                        <div className="text-[11px] font-medium text-emerald-400 flex items-center justify-end gap-1 whitespace-nowrap">
                          <Flame className="w-3 h-3" /> +{t.recentGain} pts
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
