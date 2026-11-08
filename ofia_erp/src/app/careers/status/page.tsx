"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CareersNav } from "../CareersNav";
import { useWorkforceManager } from "@/lib/workforce-store";
import { ApplicationStage, Candidate } from "@/lib/workforce-types";
import {
  Search,
  CheckCircle2,
  Clock,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  UserCheck,
  AlertCircle,
  Award,
} from "lucide-react";

const STAGES: { key: ApplicationStage; label: string; desc: string }[] = [
  { key: "received", label: "Application Received", desc: "Profile registered in recruitment system." },
  { key: "screening", label: "Initial Screening", desc: "Credentials and qualifications being audited." },
  { key: "shortlisted", label: "Shortlisted", desc: "Selected for pre-screening assessment testing." },
  { key: "assessment", label: "Assessment Test", desc: "Aptitude and competency test in progress." },
  { key: "interview", label: "Interview", desc: "Technical interview and scenario evaluation." },
  { key: "final_selection", label: "Final Selection", desc: "Recruitment panel concluding allocations." },
  { key: "offer_issued", label: "Offer Issued", desc: "Remuneration offer and terms issued." },
  { key: "offer_accepted", label: "Offer Accepted", desc: "Terms accepted by candidate." },
  { key: "onboarded", label: "Onboarded as Staff", desc: "Permanent workforce profile activated." },
];

function StatusTrackerContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const initialEmail = searchParams.get("email") || "";

  const { candidates } = useWorkforceManager();

  const [lookupQuery, setLookupQuery] = useState(initialRef || initialEmail);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if ref or email provided in query params
  useEffect(() => {
    if (initialRef || initialEmail) {
      const q = (initialRef || initialEmail).toLowerCase().trim();
      const match = candidates.find(
        (c) =>
          c.id.toLowerCase() === q ||
          (c.email && c.email.toLowerCase() === q) ||
          c.name.toLowerCase().includes(q)
      );
      if (match) {
        setSelectedCandidate(match);
      }
      setHasSearched(true);
    } else if (candidates.length > 0 && !hasSearched) {
      // Default to first candidate for instant preview
      setSelectedCandidate(candidates[0]);
    }
  }, [initialRef, initialEmail, candidates, hasSearched]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    const q = lookupQuery.toLowerCase().trim();
    const match = candidates.find(
      (c) =>
        c.id.toLowerCase() === q ||
        (c.email && c.email.toLowerCase() === q) ||
        c.name.toLowerCase().includes(q)
    );

    setSelectedCandidate(match || null);
    setHasSearched(true);
  };

  const currentStageIndex = selectedCandidate
    ? STAGES.findIndex((s) => s.key === selectedCandidate.stage)
    : -1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      <CareersNav />

      <main className="pt-28 pb-20 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
              Live Recruitment Transparency
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Track Your Application Status
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Enter your email address or Application Reference ID to inspect your real-time recruitment pipeline progress.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter Email or Reference ID (e.g., emeka.okonkwo@gmail.com)..."
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Check Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Pill Links */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-semibold">
              <span>Quick Demo Lookups:</span>
              {candidates.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setLookupQuery(c.email);
                    setSelectedCandidate(c);
                    setHasSearched(true);
                  }}
                  className="text-blue-600 hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md"
                >
                  {c.name.split(" ")[0]} ({c.stage})
                </button>
              ))}
            </div>
          </div>

          {/* Results Display */}
          {selectedCandidate ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-8">
              {/* Candidate Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Ref: {selectedCandidate.id}
                    </span>
                    <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      {selectedCandidate.department}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {selectedCandidate.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Target Role: <strong className="text-slate-800">{selectedCandidate.appliedRole}</strong>
                    {selectedCandidate.appliedDate && ` • Applied: ${selectedCandidate.appliedDate}`}
                  </p>
                </div>

                {/* Score & Stage Badge */}
                <div className="flex items-center gap-3">
                  {selectedCandidate.score > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Assessment</span>
                      <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-emerald-600" />
                        {selectedCandidate.score}% Score
                      </span>
                    </div>
                  )}
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Stage</span>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 capitalize block">
                      {selectedCandidate.stage.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage Progression Stepper */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Recruitment Pipeline Progress
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STAGES.map((s, idx) => {
                    const isDone = currentStageIndex > idx;
                    const isCurrent = currentStageIndex === idx;
                    const isFuture = currentStageIndex < idx;

                    return (
                      <div
                        key={s.key}
                        className={`p-4 rounded-2xl border text-xs transition-all space-y-1.5 ${
                          isCurrent
                            ? "bg-blue-50/80 border-blue-300 shadow-sm"
                            : isDone
                            ? "bg-emerald-50/40 border-emerald-200"
                            : "bg-slate-50/60 border-slate-100 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black uppercase ${
                              isCurrent
                                ? "text-blue-700 font-extrabold"
                                : isDone
                                ? "text-emerald-700"
                                : "text-slate-400"
                            }`}
                          >
                            Stage 0{idx + 1}
                          </span>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isCurrent ? (
                            <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                          )}
                        </div>

                        <h5 className="font-black text-slate-800 text-xs">{s.label}</h5>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Step Action Box */}
              <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-blue-100 px-2 py-0.5 rounded-md">
                    Immediate Action
                  </span>
                  <h4 className="text-base font-black">
                    {selectedCandidate.stage === "assessment" || selectedCandidate.stage === "shortlisted"
                      ? "Pre-Screening Assessment Ready"
                      : selectedCandidate.stage === "onboarded"
                      ? "Onboarding Completed"
                      : "Application in Review"}
                  </h4>
                  <p className="text-xs text-blue-100/80 max-w-lg leading-relaxed">
                    {selectedCandidate.stage === "assessment" || selectedCandidate.stage === "shortlisted"
                      ? "You are invited to complete your timed aptitude & competency test to advance to the interview round."
                      : selectedCandidate.stage === "onboarded"
                      ? "Your account is active. Log in to the employee self-service portal to access your academy courses and daily tasks."
                      : "Our recruitment coordinators will contact you via email or phone with your next schedule."}
                  </p>
                </div>

                <div className="shrink-0">
                  {selectedCandidate.stage === "assessment" || selectedCandidate.stage === "shortlisted" ? (
                    <Link
                      href={`/careers/assessment?candidateId=${selectedCandidate.id}&email=${encodeURIComponent(selectedCandidate.email)}`}
                      className="px-5 py-3 bg-white text-indigo-900 hover:bg-blue-50 font-extrabold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Take Assessment Test Now</span>
                    </Link>
                  ) : selectedCandidate.stage === "onboarded" ? (
                    <Link
                      href="/erp/employee"
                      className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Open Employee Portal</span>
                    </Link>
                  ) : (
                    <Link
                      href="/careers"
                      className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
                    >
                      <span>Explore Other Roles</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-800">No Candidate Record Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We could not find an application matching &ldquo;{lookupQuery}&rdquo;. Check your reference ID or ensure you used the same email address as your application.
              </p>
              <Link
                href="/careers"
                className="inline-block px-5 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl hover:bg-blue-700 transition-colors mt-2"
              >
                Explore Open Positions
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function StatusTrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">Loading tracker...</div>}>
      <StatusTrackerContent />
    </Suspense>
  );
}
