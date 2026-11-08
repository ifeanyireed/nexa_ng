"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CareersNav } from "../CareersNav";
import { useWorkforceManager } from "@/lib/workforce-store";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  Check,
  ShieldCheck,
  HelpCircle,
  FileCheck,
} from "lucide-react";

interface QuestionItem {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const TRACK_QUESTIONS: Record<string, QuestionItem[]> = {
  technology: [
    {
      question: "Why does Ofia enforce dedicated database connections per enterprise tenant rather than a shared cluster?",
      options: [
        "To save storage memory costs",
        "Strict database-per-tenant data isolation and zero cross-tenant contamination",
        "It eliminates the need for SQL indexes",
        "It is required by Next.js client router",
      ],
      correct: 1,
      explanation: "Enterprise security demands strict physical database separation for commerce, inventory, and personnel data.",
    },
    {
      question: "What is the recommended caching standard for tenant database URL lookups to balance freshness with performance?",
      options: [
        "Zero seconds (never cache)",
        "60 seconds in-memory TTL with manual invalidation on credential modification",
        "24-hour persistent disk cache",
        "Store connection passwords in plain text localStorage",
      ],
      correct: 1,
      explanation: "A 60-second in-memory TTL prevents database connection registry bottlenecks.",
    },
    {
      question: "Which index pattern is mandatory on tenant-scoped tables to optimize filter queries?",
      options: [
        "CREATE INDEX ON table(created_at)",
        "CREATE INDEX ON table(LOWER(tenant_slug), created_at DESC)",
        "Single index on phone number",
        "No indexes are required on PostgreSQL",
      ],
      correct: 1,
      explanation: "Composite indexes on LOWER(tenant_slug) guarantee query isolation and high throughput.",
    },
    {
      question: "In RESTful API design, which HTTP method should be used to partially modify an existing resource?",
      options: ["GET", "POST", "PATCH", "DELETE"],
      correct: 2,
      explanation: "PATCH is designated for partial modifications of resource representations.",
    },
    {
      question: "When writing React components with client interactivity, which directive is required at the top in Next.js App Router?",
      options: ['"use server"', '"use client"', '"use dynamic"', '"use react"'],
      correct: 1,
      explanation: '"use client" marks boundary components for browser-side React hydration.',
    },
    {
      question: "What constitutes zero-downtime database schema migration practice?",
      options: [
        "Dropping the table and recreating it with seed data",
        "Backward-compatible additive schema changes tested on isolated staging branches",
        "Manually running raw queries in production during peak hours",
        "Deleting old columns before migrating new data",
      ],
      correct: 1,
      explanation: "Additive schema migrations on isolated test branches ensure zero service disruptions.",
    },
  ],
  operations: [
    {
      question: "What is the primary purpose of a Service Level Agreement (SLA) in managed talent deployment?",
      options: [
        "To negotiate lunch breaks for interns",
        "To legally define response, resolution, and availability commitments for client services",
        "To set staff social media guidelines",
        "To eliminate client feedback",
      ],
      correct: 1,
      explanation: "SLAs govern service commitments, uptime expectations, and response velocity.",
    },
    {
      question: "If a P1 (Priority 1) client ticket is reported, what is the standard protocol for customer success?",
      options: [
        "Wait until the next business day to respond",
        "Acknowledge within 15 minutes, trigger emergency escalation, and provide continuous updates",
        "Close the ticket automatically",
        "Ask the client to call back next week",
      ],
      correct: 1,
      explanation: "P1 incidents require immediate acknowledgment, rapid escalation, and real-time status communication.",
    },
    {
      question: "Why are daily work logs signed off by both the deployed specialist and the supervisor?",
      options: [
        "To justify invoice billing and maintain delivery transparency",
        "Because Nigerian labor law bans spreadsheets",
        "To share login passwords",
        "To prevent remote working",
      ],
      correct: 0,
      explanation: "Work logs verify delivered operational hours for billing accuracy and service quality audit.",
    },
    {
      question: "Which metric best measures resource allocation effectiveness in a workforce deployment platform?",
      options: [
        "Total number of office chairs",
        "Workforce Utilization Rate (% of available talent deployed on active contracts)",
        "Candidate rejection count",
        "Email blast frequency",
      ],
      correct: 1,
      explanation: "Utilization rate measures the proportion of qualified talent generating service revenue.",
    },
    {
      question: "When onboarding a new enterprise client, what is the critical initial milestone?",
      options: [
        "Sending an unsolicited marketing newsletter",
        "Configuring organizational workspace, reporting lines, and verifying dedicated database connectivity",
        "Changing the company logo",
        "Hiring 50 new contractors without requisitions",
      ],
      correct: 1,
      explanation: "Initial client onboarding requires provisioning database connectivity, workspace boundaries, and roles.",
    },
    {
      question: "In conflict resolution with an unhappy client stakeholder, what is the best first step?",
      options: [
        "Defend the company and deny errors",
        "Listen actively, validate their operational pain point, and present an actionable resolution roadmap",
        "Ignore the email thread",
        "Cancel the client contract immediately",
      ],
      correct: 1,
      explanation: "Empathetic active listening combined with a clear resolution plan de-escalates tension.",
    },
  ],
  compliance: [
    {
      question: "Which statutory remittance in Nigeria is governed by the Pension Reform Act?",
      options: ["CAC Annual Return", "Contributory Pension Scheme (minimum 10% employer, 8% employee)", "Stamp Duty", "VAT 7.5%"],
      correct: 1,
      explanation: "The Pension Reform Act mandates 18% total minimum contributory pension contributions.",
    },
    {
      question: "What is the primary role of the Corporate Affairs Commission (CAC) for Nigerian businesses?",
      options: [
        "Collecting state income taxes",
        "Regulating company incorporation, registered entities, and statutory filings",
        "Managing internet domain registrations",
        "Auditing CBT examination questions",
      ],
      correct: 1,
      explanation: "CAC governs statutory company registration, post-incorporation filings, and corporate status.",
    },
    {
      question: "Under the Nigeria Data Protection Act (NDPA), how should sensitive personnel documents (CVs, IDs) be handled?",
      options: [
        "Stored in public unprotected buckets",
        "Encrypted in transit and at rest with access restricted strictly to authorized HR personnel",
        "Shared freely on public WhatsApp groups",
        "Deleted within 2 hours of application",
      ],
      correct: 1,
      explanation: "NDPA mandates strict data confidentiality, access restrictions, and secure encrypted storage.",
    },
    {
      question: "What is required before deploying an outsourced compliance analyst to supervise a financial client case?",
      options: [
        "Only candidate photo verification",
        "Verified AML/KYC competency certification and signed non-disclosure agreement (NDA)",
        "Three years of social media history",
        "Cash deposit payment",
      ],
      correct: 1,
      explanation: "Financial compliance work requires verified AML/KYC qualifications and confidentiality agreements.",
    },
    {
      question: "Which state agency oversees Pay-As-You-Earn (PAYE) personal income tax for employees resident in Lagos State?",
      options: ["FIRS (Federal Inland Revenue)", "LIRS (Lagos State Internal Revenue Service)", "CAC", "SUBEB"],
      correct: 1,
      explanation: "LIRS administers personal income tax and PAYE for individuals resident in Lagos State.",
    },
    {
      question: "What constitutes an audit trail in workforce enterprise governance?",
      options: [
        "A list of printed papers in the office",
        "Immutable chronological logs recording user identity, timestamps, actions taken, and before/after states",
        "Candidate LinkedIn testimonials",
        "A verbal confirmation between managers",
      ],
      correct: 1,
      explanation: "Immutable electronic audit logs provide verifiable legal evidence of administrative actions.",
    },
  ],
};

function AssessmentCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramCandId = searchParams.get("candidateId") || "";
  const paramEmail = searchParams.get("email") || "";

  const { candidates, recordCandidateAssessment } = useWorkforceManager();

  const [candidateIdentifier, setCandidateIdentifier] = useState(paramCandId || paramEmail);
  const [selectedTrack, setSelectedTrack] = useState<"technology" | "operations" | "compliance">("technology");
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Time ticker (12 minutes total = 720s)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(720);

  useEffect(() => {
    if (paramCandId || paramEmail) {
      setCandidateIdentifier(paramCandId || paramEmail);
      // Auto-detect track
      const match = candidates.find(
        (c) =>
          c.id.toLowerCase() === paramCandId.toLowerCase() ||
          (c.email && c.email.toLowerCase() === paramEmail.toLowerCase())
      );
      if (match) {
        if (match.department?.toLowerCase().includes("tech")) setSelectedTrack("technology");
        else if (match.department?.toLowerCase().includes("compliance")) setSelectedTrack("compliance");
        else setSelectedTrack("operations");
      }
    }
  }, [paramCandId, paramEmail, candidates]);

  useEffect(() => {
    if (!isTestStarted || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTestStarted, isSubmitted]);

  const questions = TRACK_QUESTIONS[selectedTrack] || TRACK_QUESTIONS.technology;

  const handleSelectAnswer = (optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIdx,
    }));
  };

  const handleFinishTest = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correct++;
    });
    const calculated = Math.round((correct / questions.length) * 100);
    setFinalScore(calculated);
    setIsSubmitted(true);

    if (candidateIdentifier.trim()) {
      recordCandidateAssessment(candidateIdentifier.trim(), calculated);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      <CareersNav />

      <main className="pt-28 pb-20 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Pre-Screening Assessment Centre
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Competency Evaluation Test
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Validate your technical aptitude, problem-solving ability, and domain knowledge to qualify for interview scheduling.
            </p>
          </div>

          {!isTestStarted ? (
            /* Start Test Configuration Card */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Candidate Email or Reference ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your application email or candidate ID..."
                    value={candidateIdentifier}
                    onChange={(e) => setCandidateIdentifier(e.target.value)}
                    className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Your test score will automatically sync with your application record.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Assessment Track
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "technology",
                        title: "Engineering & Systems",
                        desc: "Postgres, Next.js, APIs & Architecture",
                      },
                      {
                        id: "operations",
                        title: "Client & Operations",
                        desc: "SLAs, Customer Success & Delivery",
                      },
                      {
                        id: "compliance",
                        title: "Compliance & Governance",
                        desc: "AML/KYC, CAC & Labor Regulations",
                      },
                    ].map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => setSelectedTrack(track.id as any)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedTrack === track.id
                            ? "bg-indigo-50/80 border-indigo-400 text-indigo-900 shadow-sm"
                            : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <h5 className="font-black text-xs">{track.title}</h5>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                          {track.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>Number of Questions:</span>
                    <strong className="text-slate-900">{questions.length} Items</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Allowed:</span>
                    <strong className="text-slate-900">12 Minutes</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Benchmark:</span>
                    <strong className="text-emerald-700">75% Score</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsTestStarted(true)}
                  disabled={!candidateIdentifier.trim()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl text-xs shadow-md shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Begin Timed Assessment</span>
                </button>
              </div>
            </div>
          ) : isSubmitted ? (
            /* Test Result Card */
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border shadow-sm ${
                  (finalScore || 0) >= 75
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}
              >
                {(finalScore || 0) >= 75 ? (
                  <Award className="w-10 h-10" />
                ) : (
                  <AlertCircle className="w-10 h-10" />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Assessment Completed
                </span>
                <h2 className="text-3xl font-black text-slate-900">
                  Score: {finalScore}%
                </h2>
                <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto pt-1 leading-relaxed">
                  {(finalScore || 0) >= 75
                    ? "Exceptional performance! You have surpassed the 75% benchmark. Your score has been submitted to the recruitment review panel for interview shortlisting."
                    : "Thank you for completing the assessment. Your score has been logged on your candidate dossier for panel review."}
                </p>
              </div>

              {/* Assessment Breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto text-left text-xs text-slate-600 space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span>Candidate:</span>
                  <strong className="text-slate-800 font-mono text-[11px] truncate max-w-[160px]">
                    {candidateIdentifier}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Track Evaluated:</span>
                  <strong className="text-slate-800 capitalize">{selectedTrack}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className={(finalScore || 0) >= 75 ? "text-emerald-700" : "text-amber-700"}>
                    {(finalScore || 0) >= 75 ? "Benchmark Exceeded" : "Pending Panel Review"}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/careers/status?ref=${encodeURIComponent(candidateIdentifier)}`}
                  className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>View Updated Application Tracker</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/careers"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center"
                >
                  Return to Careers
                </Link>
              </div>
            </div>
          ) : (
            /* Active Test Engine */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              {/* Top Status Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <h4 className="text-xs font-bold text-slate-500 capitalize">
                    {selectedTrack} Knowledge Check
                  </h4>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-xl text-xs font-black font-mono text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>{formatTimer(timeLeftSeconds)}</span>
                </div>
              </div>

              {/* Question Statement */}
              <div className="space-y-5">
                <h3 className="text-base font-black text-slate-900 leading-relaxed">
                  {questions[currentIndex].question}
                </h3>

                {/* Option Buttons */}
                <div className="space-y-2.5">
                  {questions[currentIndex].options.map((option, oIdx) => {
                    const isSelected = answers[currentIndex] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(oIdx)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/90 border-indigo-500 text-indigo-950 shadow-sm ring-1 ring-indigo-400/30"
                            : "bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="leading-snug">{option}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2.5 bg-slate-100 disabled:opacity-30 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    onClick={handleFinishTest}
                    className="px-6 py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700 shadow-md transition-all cursor-pointer"
                  >
                    Submit Test for Scoring
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AssessmentCenterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">Loading assessment...</div>}>
      <AssessmentCenterContent />
    </Suspense>
  );
}
