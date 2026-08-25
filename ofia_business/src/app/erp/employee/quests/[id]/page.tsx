"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useERPStore, getSignedInERPUser, User } from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Play,
  Users,
  Target,
  Tv,
  Star,
  Lock,
  Send,
  HelpCircle,
  Award,
  ChevronRight
} from "lucide-react";

interface TeamItem {
  id: string;
  name: string;
  custom_name?: string;
  motto: string;
  logo: string;
  color: string;
  total_points: number;
  rank: number;
}

interface ParticipantItem {
  id: string;
  quest_id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  department: string;
  avatar: string;
  role: string;
}

interface ChallengeItem {
  id: string;
  day: string;
  category: string;
  engine_type: string;
  name: string;
  description: string;
  instructions: string;
  max_score: number;
  status: string;
}

// 10 Sample Quiz Questions for Day 2 Knowledge Quest
const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "What is the primary mission of the New Era Transports logistics ecosystem?",
    options: [
      "Providing safe, tech-enabled, reliable corporate mobility & supply chain solutions",
      "Manufacturing automobile spare parts locally",
      "Operating international airline charter services",
      "Public bus stop ticketing exclusively"
    ],
    correctIndex: 0
  },
  {
    id: "q2",
    question: "How frequently must logistics and vehicle fleet reconciliation reports be submitted to accounts?",
    options: ["Quarterly only", "Weekly before close of work on Mondays", "Once a year", "Every 6 months"],
    correctIndex: 1
  },
  {
    id: "q3",
    question: "What is the target SLA for resolving invoice account payment discrepancies?",
    options: ["Within 24 hours", "Within 14 business days", "Within 1 month", "At annual close"],
    correctIndex: 0
  },
  {
    id: "q4",
    question: "Which core competency category evaluates leadership, delegation, and KPI deployment?",
    options: ["Self-Development", "Leadership and Accountability", "Informative", "Physical Sports"],
    correctIndex: 1
  },
  {
    id: "q5",
    question: "What is the grand prize for the winning squad in the REIGNITE 2026 Championship?",
    options: ["₦100,000", "₦250,000", "₦500,000", "₦1,000,000"],
    correctIndex: 2
  },
  {
    id: "q6",
    question: "Which department oversees pre-trip vehicle inspections, maintenance logs, and workshop turnaround?",
    options: ["Finance & Accounts", "Fleet Operations & Maintenance", "Human Resources", "Legal Directorate"],
    correctIndex: 1
  },
  {
    id: "q7",
    question: "What is the total maximum points score across all 3 days of REIGNITE 2026?",
    options: ["500 Points", "850 Points", "1200 Points", "2000 Points"],
    correctIndex: 1
  },
  {
    id: "q8",
    question: "Which challenge on Day 2 requires duplicate-prevention concept approval before performance?",
    options: ["Egg & Spoon Race", "REIGNITE: The Core Challenge", "Who Are We?", "4x100m Relay"],
    correctIndex: 1
  },
  {
    id: "q9",
    question: "In the 5-point competency rating framework, what score represents 'Target Level / Proficient'?",
    options: ["Level 1", "Level 2", "Level 4", "Level 0"],
    correctIndex: 2
  },
  {
    id: "q10",
    question: "What is the key principle of the REIGNITE team quest scoring architecture?",
    options: [
      "Individual points only",
      "Team-based points where participant contributions advance the team standing",
      "Random lottery selection",
      "No points are recorded"
    ],
    correctIndex: 1
  }
];

export default function EmployeeQuestConsolePage() {
  const params = useParams();
  const questId = (params?.id as string) || "qst-reignite-2026";
  const { users } = useERPStore();

  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);

  // Interactive Quiz Modal
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Concept Submission Modal
  const [conceptModalOpen, setConceptModalOpen] = useState(false);
  const [conceptTitle, setConceptTitle] = useState("");
  const [conceptFormat, setConceptFormat] = useState("Drama/Comedy");
  const [conceptDesc, setConceptDesc] = useState("");
  const [conceptSubmitted, setConceptSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUser(getSignedInERPUser(users));
    }
  }, [users]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/erp/quests/detail?id=${questId}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.teams) setTeams(data.teams);
          if (data.participants) setParticipants(data.participants);
          if (data.challenges) setChallenges(data.challenges);
        }
      } catch (e) {}
    }
    load();
  }, [questId]);

  // Find user's assigned team
  const myParticipant = participants.find((p) => p.user_id === currentUser.id);
  const myTeamId = myParticipant?.team_id || "team-1";
  const myTeam = teams.find((t) => t.id === myTeamId) || teams[0] || {
    id: "team-1",
    name: "Team 1",
    custom_name: "Red Phoenix",
    logo: "🔥",
    color: "#EF4444",
    motto: "Igniting Excellence & Passion",
    total_points: 0,
    rank: 1,
  };

  const myTeamMembers = participants.filter((p) => p.team_id === myTeam.id);
  const activeChallenge = challenges.find((c) => c.status === "OPEN" || c.status === "IN_PROGRESS") || challenges[0];

  // Submit Quiz
  const handleQuizSubmit = async () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        score += 10;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    try {
      await fetch(`/api/erp/quests/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quest_id: questId,
          challenge_id: "chl-day2-quiz",
          challenge_name: "The Knowledge Quest",
          team_id: myTeam.id,
          team_name: myTeam.custom_name || myTeam.name,
          points: score,
          max_points: 100,
          reason: `Auto-Scored Quiz by ${currentUser.name} (${score}/100)`,
          scored_by: "Quiz Automated Engine",
        }),
      });
    } catch (e) {}
  };

  // Submit Concept
  const handleConceptSubmit = async () => {
    if (!conceptTitle.trim()) return;
    try {
      await fetch(`/api/erp/quests/concepts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quest_id: questId,
          challenge_id: "chl-day2-core-challenge",
          team_id: myTeam.id,
          team_name: myTeam.custom_name || myTeam.name,
          title: conceptTitle,
          description: conceptDesc,
          format: conceptFormat,
        }),
      });
      setConceptSubmitted(true);
      setTimeout(() => {
        setConceptModalOpen(false);
        setConceptSubmitted(false);
      }, 1500);
    } catch (e) {}
  };

  return (
    <BusinessShell
      title={`Player Console — ${myTeam.custom_name || myTeam.name}`}
      subtitle={`Welcome, ${currentUser.name} · Squad Rank #${myTeam.rank} · ${myTeam.total_points} Points`}
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/quests/reignite-2026/scoreboard" target="_blank">
            <NexaButton size="sm" variant="outline" className="rounded-full" leftIcon={<Tv className="w-4 h-4 text-blue-600" />}>
              Arena TV Scoreboard
            </NexaButton>
          </Link>
          <Link href="/erp/employee/quests">
            <NexaButton size="sm" variant="outline" className="rounded-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              All Quests
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* 1. HERO BANNER — WHAT AM I SUPPOSED TO DO RIGHT NOW? */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                🟢 LIVE QUEST NOW
              </span>
              <span className="text-xs font-mono text-white/80">{activeChallenge?.day || "Day 1"} · {activeChallenge?.category || "Championship"}</span>
            </div>
            <h2 className="text-2xl font-black">{activeChallenge?.name || "Team Identity Presentation"}</h2>
            <p className="text-xs text-white/80 max-w-xl">
              {activeChallenge?.instructions || "Work closely with your 10 squad teammates. Make sure your team concept and identity are ready!"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeChallenge?.id === "chl-day2-quiz" ? (
              <NexaButton
                size="md"
                variant="secondary"
                onClick={() => setQuizModalOpen(true)}
                className="bg-white text-blue-700 font-bold rounded-full hover:bg-gray-100"
                leftIcon={<Play className="w-4 h-4" />}
              >
                Take Knowledge Quiz
              </NexaButton>
            ) : activeChallenge?.id === "chl-day2-core-challenge" ? (
              <NexaButton
                size="md"
                variant="secondary"
                onClick={() => setConceptModalOpen(true)}
                className="bg-white text-blue-700 font-bold rounded-full hover:bg-gray-100"
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Register Concept
              </NexaButton>
            ) : (
              <Link href="/quests/reignite-2026/scoreboard" target="_blank">
                <NexaButton size="md" variant="secondary" className="bg-white text-blue-700 font-bold rounded-full hover:bg-gray-100" leftIcon={<Tv className="w-4 h-4" />}>
                  View Live Scoreboard
                </NexaButton>
              </Link>
            )}
          </div>
        </div>

        {/* 2. TWO COLUMN LAYOUT: MY SQUAD & QUEST TRACK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MY TEAM ROSTER (10 MEMBERS) */}
          <NexaCard variant="glass" padding="md" className="space-y-4 rounded-3xl border-t-4" style={{ borderTopColor: myTeam.color }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{myTeam.logo}</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-850">{myTeam.custom_name || myTeam.name}</h3>
                  <p className="text-[10px] text-slate-400">{myTeam.motto}</p>
                </div>
              </div>
              <NexaBadge variant="brand" size="sm">Rank #{myTeam.rank}</NexaBadge>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Squad Points:</span>
                <p className="font-black text-blue-700 text-base">{myTeam.total_points} / 850 pts</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Roster Size:</span>
                <p className="font-bold text-slate-800 text-base">{myTeamMembers.length || 10} Staff</p>
              </div>
            </div>

            {/* SQUAD MEMBERS LIST */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Squad Teammates</p>
              {myTeamMembers.length > 0 ? (
                myTeamMembers.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      m.user_id === currentUser.id ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={m.avatar} alt={m.user_name} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs leading-tight flex items-center gap-1">
                          {m.user_name}
                          {m.user_id === currentUser.id && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">You</span>
                          )}
                          {m.role === "captain" && (
                            <span className="text-amber-500" title="Team Captain">⭐</span>
                          )}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium truncate max-w-[140px]">{m.department}</p>
                      </div>
                    </div>
                    {m.role === "captain" && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        Captain
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                  Teammates will appear as soon as the facilitator confirms the auto-balanced roster.
                </div>
              )}
            </div>
          </NexaCard>

          {/* 3. QUEST PROGRESS & SCHEDULE (11 QUESTS) */}
          <NexaCard variant="glass" padding="md" className="space-y-4 lg:col-span-2 rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-850 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" /> 3-Day Championship Quest Schedule
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  11 Quests totaling 850 points. Winning team claims the ₦500,000 Grand Prize.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {challenges.map((chl) => (
                <div
                  key={chl.id}
                  className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-4 hover:border-gray-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {chl.day}
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {chl.category}
                      </span>
                      <span className="text-xs font-black text-emerald-700">+{chl.max_score} pts</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-850">{chl.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{chl.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      chl.status === "OPEN" || chl.status === "IN_PROGRESS"
                        ? "bg-emerald-100 text-emerald-800"
                        : chl.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-slate-400"
                    }`}>
                      {chl.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </NexaCard>
        </div>
      </div>

      {/* INTERACTIVE QUIZ MODAL */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Day 2 · Educative
                </span>
                <h3 className="font-bold text-lg text-slate-850 mt-1">The Knowledge Quest (10 Questions)</h3>
                <p className="text-xs text-slate-400">10 questions × 10 points = 100 points maximum for {myTeam.custom_name || myTeam.name}</p>
              </div>
            </div>

            {!quizSubmitted ? (
              <div className="space-y-6">
                {QUIZ_QUESTIONS.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                    <p className="font-bold text-xs text-slate-800">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            quizAnswers[qIdx] === optIdx
                              ? "bg-blue-50 border-blue-500 font-bold text-blue-900"
                              : "bg-white border-gray-200 text-slate-700 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${qIdx}`}
                            checked={quizAnswers[qIdx] === optIdx}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                            className="text-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setQuizModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs disabled:opacity-50"
                  >
                    Submit & Auto-Grade Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-xl text-slate-850">Quiz Completed!</h4>
                <p className="text-2xl font-black text-emerald-600">{quizScore} / 100 Points</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your squad score has been recorded in the tournament database and submitted for live scoreboard sync.
                </p>
                <button
                  onClick={() => setQuizModalOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
                >
                  Return to Console
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONCEPT SUBMISSION MODAL */}
      {conceptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-850">Register Core Challenge Concept</h3>
            <p className="text-xs text-slate-500">
              Submit your team's concept for <strong>REIGNITE: The Core Challenge</strong>. Once approved, the title is locked to prevent duplicate topics.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Performance Title:</label>
                <input
                  type="text"
                  placeholder="e.g. The Office After the Apocalypse"
                  value={conceptTitle}
                  onChange={(e) => setConceptTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Performance Format:</label>
                <select
                  value={conceptFormat}
                  onChange={(e) => setConceptFormat(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                >
                  <option value="Drama/Comedy">Drama / Comedy Sketch</option>
                  <option value="Musical/Choreography">Musical / Choreography</option>
                  <option value="Spoken Word/Poetry">Spoken Word / Poetry</option>
                  <option value="Innovation Pitch">Innovation Pitch & Demonstration</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brief Synopsis / Description:</label>
                <textarea
                  rows={3}
                  placeholder="Describe how your 10-minute performance brings REIGNITE to life..."
                  value={conceptDesc}
                  onChange={(e) => setConceptDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConceptModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConceptSubmit}
                disabled={!conceptTitle.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs disabled:opacity-50"
              >
                {conceptSubmitted ? "Registered!" : "Submit for Lock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessShell>
  );
}
