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

export default function StageTVScoreboardPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "reignite-2026";

  const [quest, setQuest] = useState<any | null>(null);
  const [isActiveQuest, setIsActiveQuest] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize strictly from live database data - no hardcoded fallbacks
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [teams, setTeams] = useState<TeamStanding[]>([]);
  const [viewMode, setViewMode] = useState<"top5" | "top10" | "all" | "teams">("teams");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(true);

  useEffect(() => {
    async function loadScoreboard() {
      try {
        const res = await fetch(`/api/erp/quests/scoreboard?slug=${slug}&quest_id=${slug}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data && data.quest && (data.quest.status === "ACTIVE" || data.active)) {
            setQuest(data.quest);
            setIsActiveQuest(true);

            // 1. Filter and Map Active Squads Only
            if (data.leaderboard && data.leaderboard.length > 0) {
              const activeSquads: TeamStanding[] = data.leaderboard
                .filter((t: any) => t.status === "ACTIVE" || t.status === "" || !t.status)
                .map((t: any, idx: number) => {
                  const initialLetter = t.initial || (t.name ? t.name.replace(/^Team\s*/i, "").charAt(0).toUpperCase() : String.fromCharCode(65 + idx));
                  const formattedName = t.name?.startsWith("Team ") ? t.name : `Team ${initialLetter} (${t.name || "Squad"})`;
                  const displayName = t.custom_name ? `${formattedName} - ${t.custom_name}` : formattedName;

                  return {
                    id: t.id,
                    rank: idx + 1,
                    name: displayName,
                    motto: t.motto || "Champions of the Arena",
                    color: t.color || "#1A56DB",
                    initial: initialLetter,
                    points: Number(t.total_points ?? t.points ?? 0),
                    recentGain: t.recent_gain || undefined,
                    membersCount: t.member_count ?? 0,
                  };
                });
              setTeams(activeSquads);
            } else {
              setTeams([]);
            }

            // 2. Map Active Participants (Only if players were enrolled)
            if (data.participants && data.participants.length > 0) {
              const activeSquadIds = new Set(
                (data.leaderboard || [])
                  .filter((t: any) => t.status === "ACTIVE" || t.status === "" || !t.status)
                  .map((t: any) => t.id)
              );

              const mappedContestants: Contestant[] = data.participants
                .filter((p: any) => (p.status === "ACTIVE" || p.status === "" || !p.status) && (activeSquadIds.size === 0 || activeSquadIds.has(p.team_id)))
                .map((p: any, idx: number) => {
                  const teamObj = data.leaderboard?.find((t: any) => t.id === p.team_id);
                  const initialLetter = teamObj?.initial || (teamObj?.name ? teamObj.name.replace(/^Team\s*/i, "").charAt(0).toUpperCase() : "A");
                  const teamName = teamObj ? (teamObj.custom_name ? `Team ${initialLetter} (${teamObj.custom_name})` : teamObj.name) : (p.team_name || "Assigned Squad");
                  return {
                    id: p.id || `p-${idx}`,
                    rank: idx + 1,
                    name: p.user_name?.split(" ")[0] || `Player ${idx + 1}`,
                    fullName: p.user_name || `Contestant ${idx + 1}`,
                    country: p.department || "Enterprise",
                    avatar: p.avatar || `/avatar${(idx % 30) + 1}.png`,
                    score: Number(p.score ?? p.points ?? 0),
                    team: teamName,
                    recentDelta: idx < 3 ? 1 : undefined,
                  };
                });

              if (mappedContestants.length > 0) {
                mappedContestants.sort((a, b) => b.score - a.score);
                mappedContestants.forEach((c, idx) => { c.rank = idx + 1; });
                setContestants(mappedContestants);
              } else {
                setContestants([]);
              }
            } else {
              setContestants([]);
            }
          } else {
            setQuest(null);
            setIsActiveQuest(false);
            setTeams([]);
            setContestants([]);
          }
        } else {
          // Check detail endpoint fallback
          const detailRes = await fetch(`/api/erp/quests/detail?slug=${slug}&id=${slug}`).catch(() => null);
          if (detailRes && detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData && detailData.quest && detailData.quest.status === "ACTIVE") {
              setQuest(detailData.quest);
              setIsActiveQuest(true);
              if (detailData.teams && detailData.teams.length > 0) {
                const activeSquads = detailData.teams
                  .filter((t: any) => t.status === "ACTIVE" || !t.status)
                  .map((t: any, idx: number) => {
                    const initialLetter = t.initial || (t.name ? t.name.replace(/^Team\s*/i, "").charAt(0).toUpperCase() : String.fromCharCode(65 + idx));
                    const formattedName = t.name?.startsWith("Team ") ? t.name : `Team ${initialLetter} (${t.name || "Squad"})`;
                    const displayName = t.custom_name ? `${formattedName} - ${t.custom_name}` : formattedName;
                    return {
                      id: t.id,
                      rank: idx + 1,
                      name: displayName,
                      motto: t.motto || "Champions of the Arena",
                      color: t.color || "#1A56DB",
                      initial: initialLetter,
                      points: Number(t.total_points ?? 0),
                      membersCount: t.member_count ?? 0,
                    };
                  });
                setTeams(activeSquads);
              }
              setContestants([]);
            } else {
              setQuest(null);
              setIsActiveQuest(false);
              setTeams([]);
              setContestants([]);
            }
          } else {
            setQuest(null);
            setIsActiveQuest(false);
            setTeams([]);
            setContestants([]);
          }
        }
      } catch (err) {
        console.warn("Scoreboard sync notice:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadScoreboard();
    const interval = setInterval(loadScoreboard, 10000);
    return () => clearInterval(interval);
  }, [slug]);

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
          {isActiveQuest && (
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs">
              <button
                onClick={() => setViewMode("teams")}
                className={`px-3 py-1 rounded-full transition-all font-medium cursor-pointer ${
                  viewMode === "teams"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Team Standings ({teams.length})
              </button>
              <button
                onClick={() => setViewMode("top5")}
                className={`px-3 py-1 rounded-full transition-all font-medium cursor-pointer ${
                  viewMode === "top5"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Top 5 (Stage View)
              </button>
              <button
                onClick={() => setViewMode("top10")}
                className={`px-3 py-1 rounded-full transition-all font-medium cursor-pointer ${
                  viewMode === "top10"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Top 10
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`px-3 py-1 rounded-full transition-all font-medium cursor-pointer ${
                  viewMode === "all"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {contestants.length > 0 ? `All Contestants (${contestants.length})` : "Contestants (0)"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/75 hover:text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
            title={isSoundMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/75 hover:text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
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

          {/* NO ACTIVE QUEST MESSAGE */}
          {!isLoading && !isActiveQuest ? (
            <div className="relative text-center py-10 sm:py-14 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
                <Tv className="w-8 h-8 opacity-80" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <span className="text-xs font-medium tracking-[0.25em] text-white/60 uppercase">
                    STANDBY
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
                  NO ACTIVE QUEST
                </h2>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed pt-1">
                  There is currently no active championship tournament running for this scoreboard. Please check back when the facilitator launches the next live quest.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <Link
                  href="/erp/hr/quests"
                  className="px-5 py-2.5 rounded-full bg-[#1A56DB] hover:bg-[#1E429F] text-white text-xs font-medium border border-[#3F83F8]/30 shadow-[0_4px_14px_rgba(26,86,219,0.35)] transition-all"
                >
                  Facilitator Command Desk
                </Link>
                <Link
                  href={`/quests/${slug}`}
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 backdrop-blur-md transition-all"
                >
                  Quest Hub
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                {quest?.name && (
                  <p className="text-xs text-white/60 font-medium tracking-wide">
                    {quest.name}
                  </p>
                )}
              </div>

              {/* CONTESTANTS TABLE VIEW */}
              {viewMode !== "teams" ? (
                <div className="space-y-1">
                  {/* SEARCH BAR (FOR ALL VIEW) */}
                  {viewMode === "all" && contestants.length > 0 && (
                    <div className="relative mb-4">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder={`Search ${contestants.length} contestants by name or team...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  )}

                  {contestants.length > 0 ? (
                    <>
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
                          viewMode === "all" ? "max-h-[480px] overflow-y-auto pr-1" : ""
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

                            {/* SCORE */}
                            <div className="col-span-2 text-right pr-2 font-normal text-white/90 text-base sm:text-lg whitespace-nowrap">
                              {contestant.score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* EMPTY STATE WHEN NO PLAYERS ARE ADDED TO SQUADS */
                    <div className="py-12 sm:py-16 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/40">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-white">No Individual Players Added Yet</h3>
                        <p className="text-xs text-white/50 max-w-sm mx-auto">
                          Squad members have not been allocated from the staff pool yet. Active team squad standings are available below.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => setViewMode("teams")}
                          className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white font-medium border border-white/15 transition-all cursor-pointer"
                        >
                          View Active Team Standings
                        </button>
                      </div>
                    </div>
                  )}
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
                    {teams.length > 0 ? (
                      teams.map((t) => (
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
                      ))
                    ) : (
                      <div className="py-8 text-center text-white/40 text-xs font-medium">
                        {isLoading ? "Loading tournament data..." : "No active squads configured for this quest yet."}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
