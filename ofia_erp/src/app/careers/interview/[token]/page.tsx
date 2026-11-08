"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Video,
  Clock,
  Calendar,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Shield,
  AlertCircle,
  HelpCircle,
  MapPin,
  ChevronRight,
  FileCode2,
  Cpu,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { CareersNav } from "../../CareersNav";
import { useWorkforceManager } from "@/lib/workforce-store";
import { WorkforceInterview } from "@/lib/workforce-types";

export default function CandidateInterviewLobbyPage() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";

  const { interviews, isLoaded } = useWorkforceManager();
  const [interview, setInterview] = useState<WorkforceInterview | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (token) {
      const match = interviews.find(
        (i) => i.token.toLowerCase() === token.toLowerCase() || i.id.toLowerCase() === token.toLowerCase()
      );
      if (match) {
        setInterview(match);
      }
    }
  }, [token, interviews]);

  // Compute countdown timer
  useEffect(() => {
    if (!interview?.scheduledStart) return;

    const interval = setInterval(() => {
      const target = new Date(interview.scheduledStart).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeRemaining("Session is Live Now");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [interview?.scheduledStart]);

  const handleCopyMeetingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const stageTitles: Record<string, { label: string; color: string; desc: string }> = {
    preliminary: {
      label: "Preliminary Screening",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      desc: "Initial conversation covering your career background, aspirations, and foundational competencies.",
    },
    technical: {
      label: "Technical Architecture & Code Evaluation",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      desc: "Deep dive into TypeScript, PostgreSQL schema modeling, API performance, and system diagnostics.",
    },
    partner: {
      label: "Practice Lead & Partner Interview",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      desc: "Leadership alignment, client-facing consulting communication, and strategic problem-solving.",
    },
    final: {
      label: "Executive Committee Review",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "Final formal discussion regarding department placement, remuneration package, and commencement terms.",
    },
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-medium">
        Loading interview briefing...
      </div>
    );
  }

  // Fallback if not found in state
  const currentInterview = interview || {
    id: "int-fallback",
    candidateId: "cand-temp",
    candidateName: "Candidate",
    appliedRole: "Talent Requisition",
    stage: "technical" as const,
    scheduledStart: "2027-04-20T10:00:00Z",
    scheduledEnd: "2027-04-20T11:00:00Z",
    meetingUrl: "https://meet.google.com/ofia-tech-eval",
    locationDetails: "Virtual Google Meet / Ofia Engineering Room",
    panelMembers: [
      { name: "Tunde Bakare", designation: "Principal Solutions Architect" },
      { name: "Chinedu Eze", designation: "Senior Infrastructure Specialist" },
    ],
    status: "scheduled" as const,
    token: token || "tok_int_demo",
    createdAt: "2027-04-12",
  };

  const stageInfo = stageTitles[currentInterview.stage] || stageTitles.technical;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <CareersNav />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/careers" className="hover:text-blue-600 transition-colors">
              Careers
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/careers/status" className="hover:text-blue-600 transition-colors">
              Tracker
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-bold">Interview Briefing Lobby</span>
          </div>

          {/* HERO BANNER */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/20 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Official Ofia Talent Requisition</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {currentInterview.candidateName}
                </h1>
                <p className="text-sm text-slate-300">
                  Scheduled Evaluation for:{" "}
                  <span className="text-white font-semibold underline decoration-blue-400 underline-offset-4">
                    {currentInterview.appliedRole}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${stageInfo.color}`}
                  >
                    {stageInfo.label}
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    Token: {currentInterview.token}
                  </span>
                </div>
              </div>

              {/* Countdown / Join Button */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl flex flex-col items-center text-center min-w-[260px]">
                <Clock className="w-6 h-6 text-blue-400 mb-2" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Countdown to Session</span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1">
                  {timeRemaining || "Scheduled Window"}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">West Africa Time (WAT / GMT+1)</p>

                {currentInterview.meetingUrl ? (
                  <a
                    href={currentInterview.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
                  >
                    <Video className="w-4 h-4" />
                    Enter Google Meet Room
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                ) : (
                  <div className="w-full mt-4 py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 font-medium">
                    {currentInterview.locationDetails || "In-person at Lagos HQ"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TWO-COLUMN DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT / MAIN COLUMN */}
            <div className="md:col-span-2 space-y-6">
              {/* STAGE & OBJECTIVES */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3 text-slate-900 font-black text-base">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  Stage Overview & Focus Area
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{stageInfo.desc}</p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">System Design & Tenancy</span>
                      <span className="text-[11px] text-slate-500">Postgres schemas, isolated tenant connections, caching.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Clean Coding Patterns</span>
                      <span className="text-[11px] text-slate-500">Generics, Next.js App Router, SSR state machines.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PANEL MEMBERS */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4 text-slate-900 font-black text-base">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Assigned Evaluation Panel
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentInterview.panelMembers.map((member, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-200">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{member.name}</span>
                        <span className="text-[11px] text-slate-500 block">{member.designation}</span>
                        <span className="text-[10px] font-semibold text-blue-600 mt-0.5 block">
                          Verified Lead Evaluator
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CANDIDATE PREPARATION CHECKLIST */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3 text-slate-900 font-black text-base">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Pre-Session Readiness Checklist
                </div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">Stable Internet Connection:</strong> We recommend a minimum
                      of 10 Mbps bandwidth with low jitter to support audio/video and screen sharing.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">Development Environment:</strong> Have your preferred code
                      editor (VS Code, Cursor, WebStorm) open with Node.js 20+ configured.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">Quiet Setting:</strong> Choose a private room with sufficient
                      lighting and minimal background echo.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* RIGHT SIDEBAR / LOGISTICS */}
            <div className="space-y-6">
              {/* MEETING ROOM LINK CARD */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Session Room Link
                </span>
                {currentInterview.meetingUrl ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl break-all font-mono text-[11px] text-slate-700">
                      {currentInterview.meetingUrl}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyMeetingLink(currentInterview.meetingUrl!)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLink ? "Link Copied to Clipboard" : "Copy Meeting URL"}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-blue-600 inline mr-1" />
                    {currentInterview.locationDetails}
                  </div>
                )}
              </div>

              {/* TIMING SUMMARY */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Schedule Details
                </span>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Date</span>
                  <span className="font-bold text-slate-800">
                    {new Date(currentInterview.scheduledStart).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Start Time</span>
                  <span className="font-bold text-slate-800">
                    {new Date(currentInterview.scheduledStart).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-500">End Time</span>
                  <span className="font-bold text-slate-800">
                    {new Date(currentInterview.scheduledEnd).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-emerald-600 uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {currentInterview.status}
                  </span>
                </div>
              </div>

              {/* NEED TO RESCHEDULE */}
              <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Need to Reschedule?
                </div>
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  If an unforeseen conflict arises, please notify talent operations at least 24 hours prior to your
                  session via the scheduling portal.
                </p>
                <Link
                  href={`/careers/interview/schedule?candidateId=${currentInterview.candidateId}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                >
                  Change Session Slot →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
