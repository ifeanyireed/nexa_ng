"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { CareersNav } from "../../CareersNav";
import { useWorkforceManager } from "@/lib/workforce-store";

function ScheduleInterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { candidates, scheduleInterview, interviews } = useWorkforceManager();

  const candidateIdParam = searchParams.get("candidateId") || searchParams.get("id") || "";
  const emailParam = searchParams.get("email") || "";

  const [selectedCandidateId, setSelectedCandidateId] = useState(candidateIdParam);
  const [candidateEmail, setCandidateEmail] = useState(emailParam);
  const [candidateName, setCandidateName] = useState("");
  const [appliedRole, setAppliedRole] = useState("");
  const [interviewStage, setInterviewStage] = useState<"preliminary" | "technical" | "partner" | "final">("technical");
  const [selectedDate, setSelectedDate] = useState("2027-04-25");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:00 AM - 11:00 AM");
  const [meetingType, setMeetingType] = useState<"virtual" | "in_person">("virtual");
  const [candidateNotes, setCandidateNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState<string | null>(null);

  // Sync candidate details from store if matched
  useEffect(() => {
    if (selectedCandidateId || candidateEmail) {
      const match = candidates.find(
        (c) =>
          (selectedCandidateId && c.id.toLowerCase() === selectedCandidateId.toLowerCase()) ||
          (candidateEmail && c.email.toLowerCase() === candidateEmail.toLowerCase())
      );
      if (match) {
        setSelectedCandidateId(match.id);
        setCandidateName(match.name);
        setCandidateEmail(match.email);
        setAppliedRole(match.appliedRole);
      }
    }
  }, [selectedCandidateId, candidateEmail, candidates]);

  const availableSlots = [
    { time: "09:30 AM - 10:30 AM", label: "Morning Session A" },
    { time: "11:00 AM - 12:00 PM", label: "Morning Session B" },
    { time: "02:00 PM - 03:00 PM", label: "Afternoon Session A" },
    { time: "03:30 PM - 04:30 PM", label: "Afternoon Session B" },
  ];

  const handleBookInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !appliedRole.trim()) return;

    setIsSubmitting(true);
    try {
      const [startHourStr] = selectedTimeSlot.split(" - ")[0].split(" ");
      const scheduledStart = `${selectedDate}T10:00:00Z`;
      const scheduledEnd = `${selectedDate}T11:00:00Z`;

      const meetingUrl =
        meetingType === "virtual"
          ? "https://meet.google.com/ofia-talent-eval"
          : "4th Floor Executive Suite, 142 Herbert Macaulay Way, Yaba, Lagos";

      const panel =
        interviewStage === "technical"
          ? [
              { name: "Tunde Bakare", designation: "Principal Solutions Architect" },
              { name: "Chinedu Eze", designation: "Senior Infrastructure Specialist" },
            ]
          : [
              { name: "Dayo Oladipo", designation: "Head of Talent & Compliance" },
              { name: "Ngozi Adeleke", designation: "Operations Director" },
            ];

      const res = scheduleInterview({
        candidateId: selectedCandidateId || `cand-${Date.now()}`,
        candidateName,
        appliedRole,
        stage: interviewStage,
        scheduledStart,
        scheduledEnd,
        meetingUrl: meetingType === "virtual" ? meetingUrl : undefined,
        locationDetails: meetingType === "in_person" ? meetingUrl : "Google Meet Video Call",
        panelMembers: panel,
        interviewerNotes: candidateNotes || "Candidate confirmed preferred slot via self-service scheduler.",
      });

      setConfirmedToken(res.token);
    } catch (err) {
      console.error("Failed to book interview:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <CareersNav />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <Link href="/careers" className="hover:text-blue-600 transition-colors">
              Careers
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/careers/status" className="hover:text-blue-600 transition-colors">
              Application Status
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700">Interview Slot Reservation</span>
          </div>

          {confirmedToken ? (
            <div className="bg-white border border-emerald-100 rounded-3xl p-8 sm:p-10 shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Interview Confirmed & Calibrated
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                You're Scheduled with Ofia Engineering!
              </h1>
              <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
                A calendar invitation and technical evaluation brief have been calibrated for{" "}
                <span className="font-semibold text-slate-800">{candidateName}</span> for the{" "}
                <span className="font-semibold text-slate-800">{appliedRole}</span> position.
              </p>

              <div className="mt-8 p-6 bg-slate-50 border border-slate-200/70 rounded-2xl text-left max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200">
                  <span className="text-slate-400 font-medium">Session Date</span>
                  <span className="font-bold text-slate-800">{selectedDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200">
                  <span className="text-slate-400 font-medium">Assigned Window</span>
                  <span className="font-bold text-slate-800">{selectedTimeSlot}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200">
                  <span className="text-slate-400 font-medium">Format</span>
                  <span className="font-bold text-blue-700 uppercase">{meetingType}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Pass Token</span>
                  <span className="font-mono text-[11px] font-bold text-slate-700">{confirmedToken}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/careers/interview/${confirmedToken}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
                >
                  <Video className="w-4 h-4" />
                  Enter Interview Briefing Room
                </Link>
                <Link
                  href="/careers/status"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Return to Application Tracker
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                Workforce Talent Acquisition
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Select Your Interview Session
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Congratulations on advancing past initial screening. Please select your preferred date and time slot
                to meet with our panel of technical leads and domain directors.
              </p>

              <form onSubmit={handleBookInterview} className="mt-8 space-y-6">
                {/* Candidate Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bolaji Adeleke"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. bolaji@yahoo.com"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Applied Position
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2027 Graduate Tech Internship"
                      value={appliedRole}
                      onChange={(e) => setAppliedRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Interview Stage
                    </label>
                    <select
                      value={interviewStage}
                      onChange={(e) => setInterviewStage(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="preliminary">Preliminary Talent Screening</option>
                      <option value="technical">Technical Evaluation & Code Review</option>
                      <option value="partner">Partner / Practice Director Interview</option>
                      <option value="final">Final Executive Board Review</option>
                    </select>
                  </div>
                </div>

                {/* Session Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Preferred Session Delivery
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMeetingType("virtual")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        meetingType === "virtual"
                          ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${meetingType === "virtual" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">Virtual Video Conference</span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          High-definition Google Meet session with live code editor and architecture whiteboarding.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMeetingType("in_person")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        meetingType === "in_person"
                          ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${meetingType === "in_person" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">In-Person at Lagos HQ</span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          Executive Boardroom, 142 Herbert Macaulay Way, Yaba, Lagos. Free visitor parking included.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Date & Time Slot Selection */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Select Session Date
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="date"
                          value={selectedDate}
                          min="2027-04-15"
                          max="2027-06-30"
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Available Time Windows for {selectedDate}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot.time;
                        return (
                          <button
                            type="button"
                            key={slot.time}
                            onClick={() => setSelectedTimeSlot(slot.time)}
                            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Clock className={`w-4 h-4 ${isSelected ? "text-blue-100" : "text-slate-400"}`} />
                              <div>
                                <span className="font-bold text-xs block">{slot.time}</span>
                                <span className={`text-[10px] block ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                                  {slot.label}
                                </span>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Candidate Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Special Inquiries or Accessibility Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any technical environment requests, bandwidth disclosures, or accommodations."
                    value={candidateNotes}
                    onChange={(e) => setCandidateNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Instant confirmation token generated on submission</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !candidateName.trim() || !appliedRole.trim()}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:shadow-none"
                  >
                    {isSubmitting ? "Locking Window..." : "Confirm & Book Slot"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ScheduleInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-medium">
          Loading reservation scheduler...
        </div>
      }
    >
      <ScheduleInterviewContent />
    </Suspense>
  );
}
