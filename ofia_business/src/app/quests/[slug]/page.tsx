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
  Users,
} from "lucide-react";
import {
  fetchDatabaseTenants,
  extractSubdomainOrParam,
  slugToTenantName,
} from "@/lib/tenant-context";

interface TopContestant {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  team: string;
}

interface TeamSquad {
  name: string;
  initial: string;
  points: number;
  rank: number;
  motto: string;
  color: string;
}

interface QuestChallengeItem {
  name: string;
  type: string;
  winner: string;
  status: "ACTIVE" | "COMPLETED" | "UPCOMING" | "LOCKED";
}

export default function PublicQuestLandingPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "reignite-2026";

  const [tenantName, setTenantName] = useState<string>("Corporate Workspace");
  const [quest, setQuest] = useState<any | null>(null);
  const [isActiveQuest, setIsActiveQuest] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize strictly from live database data - no hardcoded mocks
  const [topContestants, setTopContestants] = useState<TopContestant[]>([]);
  const [teams, setTeams] = useState<TeamSquad[]>([]);
  const [challenges, setChallenges] = useState<QuestChallengeItem[]>([]);

  useEffect(() => {
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

    async function loadQuestData() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/erp/quests/scoreboard?slug=${slug}&quest_id=${slug}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data && data.quest && (data.quest.status === "ACTIVE" || data.active)) {
            setQuest(data.quest);
            setIsActiveQuest(true);

            // Active Squads (Team A, B, C...)
            if (data.leaderboard && data.leaderboard.length > 0) {
              const activeSquads: TeamSquad[] = data.leaderboard
                .filter((t: any) => t.status === "ACTIVE" || t.status === "" || !t.status)
                .map((t: any, idx: number) => {
                  const initialLetter = t.initial || (t.name ? t.name.replace(/^Team\s*/i, "").charAt(0).toUpperCase() : String.fromCharCode(65 + idx));
                  const formattedName = t.name?.startsWith("Team ") ? t.name : `Team ${initialLetter} (${t.name || "Squad"})`;
                  const displayName = t.custom_name ? `${formattedName} - ${t.custom_name}` : formattedName;

                  return {
                    name: displayName,
                    initial: initialLetter,
                    points: Number(t.total_points ?? t.points ?? 0),
                    rank: idx + 1,
                    motto: t.motto || "Champions of the Arena",
                    color: t.color || "#1A56DB",
                  };
                });
              setTeams(activeSquads);
            } else {
              setTeams([]);
            }

            // Active Participants (Only populated if players were assigned)
            if (data.participants && data.participants.length > 0) {
              const activeSquadIds = new Set(
                (data.leaderboard || [])
                  .filter((t: any) => t.status === "ACTIVE" || t.status === "" || !t.status)
                  .map((t: any) => t.id)
              );

              const mapped: TopContestant[] = data.participants
                .filter((p: any) => (p.status === "ACTIVE" || p.status === "" || !p.status) && (activeSquadIds.size === 0 || activeSquadIds.has(p.team_id)))
                .slice(0, 5)
                .map((p: any, idx: number) => {
                  const teamObj = data.leaderboard?.find((t: any) => t.id === p.team_id);
                  const initialLetter = teamObj?.initial || (teamObj?.name ? teamObj.name.replace(/^Team\s*/i, "").charAt(0).toUpperCase() : "A");
                  const teamName = teamObj ? (teamObj.custom_name ? `Team ${initialLetter} (${teamObj.custom_name})` : teamObj.name) : (p.team_name || "Assigned Squad");
                  return {
                    rank: idx + 1,
                    name: p.user_name?.split(" ")[0] || `Player ${idx + 1}`,
                    avatar: p.avatar || `/avatar${(idx % 30) + 1}.png`,
                    score: Number(p.score ?? p.points ?? 0),
                    team: teamName,
                  };
                });

              setTopContestants(mapped);
            } else {
              setTopContestants([]);
            }

            // Challenges
            if (data.schedule && data.schedule.length > 0) {
              const chls: QuestChallengeItem[] = data.schedule
                .filter((s: any) => s.category === "Challenge" || s.category === "Sports")
                .slice(0, 4)
                .map((s: any) => ({
                  name: s.title,
                  type: s.category,
                  winner: s.status === "COMPLETED" ? "Evaluated" : s.status === "LIVE" ? "In Progress" : "Upcoming",
                  status: s.status === "LIVE" ? "ACTIVE" : s.status === "COMPLETED" ? "COMPLETED" : "UPCOMING",
                }));
              setChallenges(chls);
            } else {
              setChallenges([]);
            }
          } else {
            setQuest(null);
            setIsActiveQuest(false);
            setTeams([]);
            setTopContestants([]);
            setChallenges([]);
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
                      name: displayName,
                      initial: initialLetter,
                      points: Number(t.total_points ?? 0),
                      rank: idx + 1,
                      motto: t.motto || "Champions of the Arena",
                      color: t.color || "#1A56DB",
                    };
                  });
                setTeams(activeSquads);
              }
              setTopContestants([]);
            } else {
              setQuest(null);
              setIsActiveQuest(false);
              setTeams([]);
              setTopContestants([]);
            }
          } else {
            setQuest(null);
            setIsActiveQuest(false);
            setTeams([]);
            setTopContestants([]);
          }
        }
      } catch (err) {
        console.warn("Quest landing load error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestData();
  }, [slug]);

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
        {/* ULTRA-SMOOTH SPREAD GRADIENT */}
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
              <h1 className="text-sm font-semibold text-white">{quest?.name || "Corporate Championship Quest"}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/quests/${slug}/scoreboard`} target="_blank">
              <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A56DB] hover:bg-[#1E429F] text-white text-xs font-medium border border-[#3F83F8]/30 shadow-[0_4px_14px_rgba(26,86,219,0.35)] transition-all cursor-pointer">
                <Tv className="w-4 h-4" />
                <span>Open TV Scoreboard</span>
              </button>
            </Link>
            <Link href="/login">
              <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/90 hover:text-white text-xs font-medium border border-white/10 backdrop-blur-md transition-all cursor-pointer">
                Employee Login
              </button>
            </Link>
          </div>
        </header>

        {/* HERO TITLE & EVENT INFO */}
        <div className="relative max-w-5xl mx-auto px-6 pt-14 pb-4 w-full space-y-2">
          {!isLoading && !isActiveQuest ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Tv className="w-3.5 h-3.5 text-amber-400" /> STANDBY MODE
                </span>
                <span className="text-xs font-mono text-white/60">No Live Quest Scheduled</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                No Active Quest
              </h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-2xl">
                There is currently no active championship tournament running for this workspace. Please contact your HR facilitator or check back when the tournament begins.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                  <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" /> LIVE RETREAT EVENT
                </span>
                <span className="text-xs font-mono text-white/75">
                  {quest?.location || "Championship Arena"} · {quest?.starts_at ? new Date(quest.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Live Tournament"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {quest?.name || "Corporate Team Quest & Championship"}
              </h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-2xl">
                {quest?.description || "Celebrating cross-department collaboration, sports, innovation pitches, and team championship."}
              </p>
            </>
          )}
        </div>
      </div>

      {/* CONTENT CONTAINER */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8 relative z-10">
        {!isLoading && !isActiveQuest ? (
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-8 text-center rounded-3xl space-y-4 max-w-md mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Tv className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Championship Standby</h3>
              <p className="text-xs text-white/60">
                The facilitator has not published an active quest for this link yet.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/erp/hr/quests">
                <button className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1E429F] text-white text-xs font-semibold rounded-full cursor-pointer transition-all">
                  Open HR Facilitator Desk
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* TEAM SQUAD RANKS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5 text-[#3B82F6]" /> Active Team Squad Standings ({teams.length})
                </h2>
                <Link href={`/quests/${slug}/scoreboard`} className="text-xs text-[#3B82F6] hover:text-[#60A5FA] font-medium hover:underline flex items-center gap-1">
                  <span>Open Stage TV Scoreboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {teams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            `#${t.rank} Place`
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-6 text-center rounded-3xl text-white/40 text-xs">
                  {isLoading ? "Loading active squads..." : "No active squads configured for this quest yet."}
                </div>
              )}
            </div>

            {/* TOP INDIVIDUAL CONTESTANTS (ONLY IF PLAYERS ENROLLED) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold flex items-center gap-2 text-white">
                  <Medal className="w-5 h-5 text-[#3B82F6]" /> Top Contestants (Individual MVPs)
                </h2>
              </div>

              {topContestants.length > 0 ? (
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
              ) : (
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-6 text-center rounded-3xl space-y-2">
                  <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-medium">
                    <Users className="w-4 h-4" />
                    <span>No individual players assigned to squads yet. Team squads are active and ready for competition!</span>
                  </div>
                </div>
              )}
            </div>

            {/* CHALLENGE SCHEDULE */}
            {challenges.length > 0 && (
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
            )}
          </>
        )}
      </main>
    </div>
  );
}
