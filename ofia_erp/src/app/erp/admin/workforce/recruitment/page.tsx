"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  ChevronRight,
  FileText,
  Star,
  MapPin,
  Calendar,
  X,
  Phone,
  Mail,
  GraduationCap,
  Video,
  DollarSign,
  ExternalLink,
  Award,
  Sparkles,
  Copy,
  Check,
  Send,
  Building,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { useWorkforceManager } from "@/lib/workforce-store";
import { ApplicationStage, Candidate, WorkforceInterview, WorkforceOffer, WorkforceRoleCategory } from "@/lib/workforce-types";

const STAGES: { key: ApplicationStage; label: string; color: string }[] = [
  { key: "received", label: "Application Received", color: "text-slate-400" },
  { key: "screening", label: "Initial Screening", color: "text-blue-400" },
  { key: "shortlisted", label: "Shortlisted", color: "text-indigo-400" },
  { key: "assessment", label: "Assessment Test", color: "text-purple-400" },
  { key: "interview", label: "Interview", color: "text-amber-400" },
  { key: "final_selection", label: "Final Selection", color: "text-rose-400" },
  { key: "offer_issued", label: "Offer Issued", color: "text-cyan-400" },
  { key: "offer_accepted", label: "Offer Accepted", color: "text-emerald-400" },
  { key: "onboarded", label: "Onboarded as Staff", color: "text-green-500" },
];

export default function RecruitmentTalentAcquisitionPage() {
  const {
    jobOpenings,
    candidates,
    interviews,
    offers,
    updateCandidateStage,
    convertCandidateToPerson,
    scheduleInterview,
    updateInterviewStatus,
    issueOffer,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"pipeline" | "interviews" | "offers">("pipeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // New Job Modal
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDept, setNewJobDept] = useState("Technology");
  const [newJobOpenings, setNewJobOpenings] = useState(5);
  const [newJobLocation, setNewJobLocation] = useState("Lagos / Hybrid");
  const [newJobSalary, setNewJobSalary] = useState("₦150,000 / mo");

  // Schedule Interview Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [interviewCandidateId, setInterviewCandidateId] = useState("");
  const [interviewStage, setInterviewStage] = useState<"preliminary" | "technical" | "partner" | "final">("technical");
  const [interviewDate, setInterviewDate] = useState("2027-04-25");
  const [interviewTime, setInterviewTime] = useState("10:00");
  const [interviewUrl, setInterviewUrl] = useState("https://meet.google.com/ofia-talent-eval");
  const [interviewPanel, setInterviewPanel] = useState("Tunde Bakare (Lead Architect), Dayo Oladipo (Talent Lead)");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [lastGeneratedInterviewToken, setLastGeneratedInterviewToken] = useState<string | null>(null);

  // Issue Offer Modal
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerCandidateId, setOfferCandidateId] = useState("");
  const [offerRoleCategory, setOfferRoleCategory] = useState<WorkforceRoleCategory>("employee");
  const [offerDesignation, setOfferDesignation] = useState("");
  const [offerDept, setOfferDept] = useState("Technology");
  const [offerBaseSalary, setOfferBaseSalary] = useState(250000);
  const [offerAllowances, setOfferAllowances] = useState(40000);
  const [offerStartDate, setOfferStartDate] = useState("2027-05-03");
  const [offerExpiryDate, setOfferExpiryDate] = useState("2027-04-28");
  const [offerLetterCustomText, setOfferLetterCustomText] = useState("");
  const [lastGeneratedOfferToken, setLastGeneratedOfferToken] = useState<string | null>(null);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStage = stageFilter === "ALL" || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const handleAdvanceStage = (cand: Candidate) => {
    const currentIndex = STAGES.findIndex((s) => s.key === cand.stage);
    if (currentIndex >= 0 && currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1].key;
      updateCandidateStage(cand.id, nextStage);
      if (selectedCandidate?.id === cand.id) {
        setSelectedCandidate({ ...cand, stage: nextStage });
      }
    }
  };

  const handleConvert = (cand: Candidate) => {
    convertCandidateToPerson(cand.id, cand.appliedRole.toLowerCase().includes("intern") ? "intern" : "employee");
    setSelectedCandidate(null);
  };

  const handleOpenScheduleForCandidate = (cand: Candidate) => {
    setInterviewCandidateId(cand.id);
    setInterviewStage("technical");
    setInterviewNotes(`Assessing technical fit for ${cand.appliedRole}`);
    setIsScheduleModalOpen(true);
    setLastGeneratedInterviewToken(null);
  };

  const handleOpenOfferForCandidate = (cand: Candidate) => {
    setOfferCandidateId(cand.id);
    setOfferDesignation(cand.appliedRole);
    setOfferDept(cand.department || "Technology");
    const isIntern = cand.appliedRole.toLowerCase().includes("intern");
    setOfferRoleCategory(isIntern ? "intern" : "employee");
    setOfferBaseSalary(isIntern ? 150000 : 280000);
    setOfferAllowances(isIntern ? 25000 : 40000);
    setOfferLetterCustomText(
      `Dear ${cand.name},\n\nWe are pleased to offer you the position of ${cand.appliedRole} at Ofia Enterprise Suite.\n\nTotal Monthly Package: ₦${(
        (isIntern ? 150000 : 280000) + (isIntern ? 25000 : 40000)
      ).toLocaleString()} (Subject to statutory deductions).\n\nAnticipated Start Date: ${offerStartDate}.\n\nPlease review and execute this agreement by ${offerExpiryDate}.`
    );
    setIsOfferModalOpen(true);
    setLastGeneratedOfferToken(null);
  };

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find((c) => c.id === interviewCandidateId);
    if (!cand) return;

    const panelMembers = interviewPanel
      .split(",")
      .map((item) => {
        const parts = item.trim().split("(");
        return {
          name: parts[0]?.trim() || "Evaluator",
          designation: parts[1]?.replace(")", "").trim() || "Practice Specialist",
        };
      });

    const scheduledStart = `${interviewDate}T${interviewTime}:00Z`;
    const scheduledEnd = `${interviewDate}T${Number(interviewTime.split(":")[0]) + 1}:00:00Z`;

    const res = scheduleInterview({
      candidateId: cand.id,
      candidateName: cand.name,
      appliedRole: cand.appliedRole,
      stage: interviewStage,
      scheduledStart,
      scheduledEnd,
      meetingUrl: interviewUrl,
      locationDetails: "Virtual Google Meet Evaluation Room",
      panelMembers,
      interviewerNotes: interviewNotes,
    });

    setLastGeneratedInterviewToken(res.token);
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find((c) => c.id === offerCandidateId);
    if (!cand) return;

    const totalMonthly = Number(offerBaseSalary) + Number(offerAllowances);
    const letterText =
      offerLetterCustomText ||
      `Dear ${cand.name},\n\nWe are delighted to formally offer you the position of ${offerDesignation} in our ${offerDept} department.\n\nBase Monthly: ₦${offerBaseSalary.toLocaleString()}\nAllowances: ₦${offerAllowances.toLocaleString()}\nTotal Monthly Package: ₦${totalMonthly.toLocaleString()}.\n\nStart Date: ${offerStartDate}.\n\nPlease electronically accept this offer by ${offerExpiryDate}.`;

    const res = issueOffer({
      candidateId: cand.id,
      candidateName: cand.name,
      candidateEmail: cand.email,
      roleCategory: offerRoleCategory,
      offeredDesignation: offerDesignation,
      department: offerDept,
      monthlyStipendSalary: Number(offerBaseSalary),
      allowances: Number(offerAllowances),
      totalMonthly,
      startDate: offerStartDate,
      expiryDate: offerExpiryDate,
      offerLetterText: letterText,
    });

    setLastGeneratedOfferToken(res.token);
  };

  return (
    <ErpAdminShell
      title="Recruitment & Talent Acquisition"
      subtitle="Module 01 · Vacancy postings, application screening, interview scheduling, offer acceptance, and staff conversion."
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => {
              setIsScheduleModalOpen(true);
              setLastGeneratedInterviewToken(null);
            }}
          >
            <Calendar className="w-3.5 h-3.5" />
            Schedule Interview
          </NexaButton>
          <NexaButton
            size="sm"
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => {
              setIsOfferModalOpen(true);
              setLastGeneratedOfferToken(null);
            }}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Issue Offer
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsNewJobModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Vacancy
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active Openings</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{jobOpenings.length} Requisitions</p>
            <p className="text-xs text-nexa-text-secondary mt-1">Across 4 departments</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Total Applicants</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{candidates.length} Profiles</p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">92% average qualification match</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Scheduled Interviews</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {interviews.filter((i) => i.status === "scheduled").length} Active Sessions
            </p>
            <p className="text-xs text-blue-500 mt-1 font-medium">Evaluation panels assigned</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Offers Accepted</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {candidates.filter((c) => c.stage === "offer_accepted" || c.stage === "onboarded").length} Signed
            </p>
            <p className="text-xs text-emerald-500 mt-1 font-medium">Ready for academy onboarding</p>
          </div>
        </section>

        {/* WORKSPACE SUB-NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-nexa-border pb-3">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "pipeline"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-surface"
            }`}
          >
            <Users className="w-4 h-4" />
            Applicant Pipeline ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab("interviews")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "interviews"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-surface"
            }`}
          >
            <Video className="w-4 h-4" />
            Scheduled Interviews ({interviews.length})
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "offers"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-surface"
            }`}
          >
            <Award className="w-4 h-4" />
            Formal Offers Issued ({offers.length})
          </button>
        </div>

        {/* TAB 1: APPLICANT PIPELINE */}
        {activeTab === "pipeline" && (
          <div className="space-y-8">
            {/* PUBLISHED REQUISITIONS */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Published Requisitions & Vacancies
                </h2>
                <span className="text-xs text-nexa-text-secondary">{jobOpenings.length} active postings</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {jobOpenings.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 bg-nexa-surface rounded-xl border border-nexa-border space-y-3 hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <NexaBadge variant="secondary" className="text-[10px] uppercase font-mono">
                        {job.type}
                      </NexaBadge>
                      <span className="text-[11px] text-emerald-500 font-semibold">{job.stipendOrSalary}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-nexa-text-primary leading-snug">{job.title}</h3>
                      <p className="text-xs text-nexa-text-secondary flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-nexa-border/60 flex items-center justify-between text-xs">
                      <span className="text-nexa-text-secondary">
                        Filled: {job.filled} / {job.openings}
                      </span>
                      <span className="text-blue-500 font-medium">Closes {job.closingDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PIPELINE CANDIDATES */}
            <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Candidate Pipeline & Lifecycle
                  </h2>
                  <p className="text-xs text-nexa-text-secondary">
                    Review candidate profiles, schedule interviews, issue legally binding offers, and convert accepted talent into permanent staff.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-nexa-text-secondary" />
                    <input
                      type="text"
                      placeholder="Filter name, role, skill..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="py-1.5 px-3 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="ALL">All Stages</option>
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TABLE OF CANDIDATES */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-nexa-surface/60 text-nexa-text-secondary uppercase text-[10px] tracking-wider border-b border-nexa-border">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Target Role</th>
                      <th className="py-3 px-4">Pipeline Stage</th>
                      <th className="py-3 px-4">Assessment</th>
                      <th className="py-3 px-4">Key Competencies</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nexa-border/60">
                    {filteredCandidates.map((cand) => (
                      <tr
                        key={cand.id}
                        className="hover:bg-nexa-surface/80 transition-colors cursor-pointer"
                        onClick={() => setSelectedCandidate(cand)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-nexa-text-primary">{cand.name}</div>
                          <div className="text-[11px] text-nexa-text-secondary">{cand.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-nexa-text-primary">
                          <div>{cand.appliedRole}</div>
                          <div className="text-[10px] text-nexa-text-secondary">{cand.education}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <NexaBadge
                            variant="secondary"
                            className="text-[11px] font-medium capitalize py-0.5"
                          >
                            {cand.stage.replace(/_/g, " ")}
                          </NexaBadge>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 font-semibold text-emerald-400">
                            <Star className="w-3.5 h-3.5 fill-emerald-400" />
                            {cand.score}%
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {cand.skills.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-nexa-surface border border-nexa-border text-nexa-text-secondary"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {cand.stage === "screening" || cand.stage === "assessment" || cand.stage === "shortlisted" ? (
                              <NexaButton
                                size="sm"
                                variant="secondary"
                                className="text-xs py-1 px-2.5 gap-1 text-blue-400 hover:text-blue-300"
                                onClick={() => handleOpenScheduleForCandidate(cand)}
                              >
                                <Calendar className="w-3 h-3" /> Interview
                              </NexaButton>
                            ) : null}

                            {cand.stage === "interview" || cand.stage === "final_selection" ? (
                              <NexaButton
                                size="sm"
                                variant="secondary"
                                className="text-xs py-1 px-2.5 gap-1 text-cyan-400 hover:text-cyan-300"
                                onClick={() => handleOpenOfferForCandidate(cand)}
                              >
                                <DollarSign className="w-3 h-3" /> Issue Offer
                              </NexaButton>
                            ) : null}

                            {cand.stage === "offer_accepted" ? (
                              <NexaButton
                                size="sm"
                                variant="primary"
                                className="text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 gap-1"
                                onClick={() => handleConvert(cand)}
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Convert to Staff
                              </NexaButton>
                            ) : cand.stage !== "onboarded" ? (
                              <NexaButton
                                size="sm"
                                variant="secondary"
                                className="text-xs py-1 px-2.5 gap-1"
                                onClick={() => handleAdvanceStage(cand)}
                              >
                                Advance <ChevronRight className="w-3 h-3" />
                              </NexaButton>
                            ) : (
                              <span className="text-emerald-500 font-semibold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Onboarded
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: SCHEDULED INTERVIEWS */}
        {activeTab === "interviews" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-500" />
                  Interview Registry & Panel Evaluation
                </h2>
                <p className="text-xs text-nexa-text-secondary">
                  Active interview appointments, video room access, candidate tokens, and evaluation records.
                </p>
              </div>

              <NexaButton
                size="sm"
                variant="primary"
                className="gap-2 text-xs"
                onClick={() => {
                  setIsScheduleModalOpen(true);
                  setLastGeneratedInterviewToken(null);
                }}
              >
                <Plus className="w-4 h-4" /> Schedule New Session
              </NexaButton>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-nexa-surface/60 text-nexa-text-secondary uppercase text-[10px] tracking-wider border-b border-nexa-border">
                  <tr>
                    <th className="py-3 px-4">Candidate & Role</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Scheduled Window</th>
                    <th className="py-3 px-4">Panel Evaluators</th>
                    <th className="py-3 px-4">Score / Status</th>
                    <th className="py-3 px-4 text-right">Lobby & Meeting Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexa-border/60">
                  {interviews.map((int) => (
                    <tr key={int.id} className="hover:bg-nexa-surface/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-nexa-text-primary">{int.candidateName}</div>
                        <div className="text-[11px] text-nexa-text-secondary">{int.appliedRole}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {int.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-nexa-text-primary">
                        <div className="font-medium">
                          {new Date(int.scheduledStart).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-nexa-text-secondary">
                          {new Date(int.scheduledStart).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(int.scheduledEnd).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {int.panelMembers.map((m, idx) => (
                            <div key={idx} className="text-[11px] text-nexa-text-primary">
                              {m.name} <span className="text-nexa-text-secondary">({m.designation})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {int.score != null ? (
                          <div className="flex items-center gap-1 font-bold text-emerald-400">
                            <Star className="w-3.5 h-3.5 fill-emerald-400" />
                            {int.score}% (Scored)
                          </div>
                        ) : (
                          <NexaBadge variant="secondary" className="capitalize text-[10px]">
                            {int.status}
                          </NexaBadge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/careers/interview/${int.token}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Candidate Lobby
                          </Link>

                          {int.meetingUrl && (
                            <a
                              href={int.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-secondary hover:text-nexa-text-primary transition-colors"
                              title="Direct Google Meet Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: ISSUED OFFERS */}
        {activeTab === "offers" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  Formal Employment Offers & Electronic Contracts
                </h2>
                <p className="text-xs text-nexa-text-secondary">
                  Legally binding offer letters, remuneration schedules, electronic signatures, and staff conversion.
                </p>
              </div>

              <NexaButton
                size="sm"
                variant="primary"
                className="gap-2 text-xs"
                onClick={() => {
                  setIsOfferModalOpen(true);
                  setLastGeneratedOfferToken(null);
                }}
              >
                <Plus className="w-4 h-4" /> Issue Formal Offer
              </NexaButton>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-nexa-surface/60 text-nexa-text-secondary uppercase text-[10px] tracking-wider border-b border-nexa-border">
                  <tr>
                    <th className="py-3 px-4">Candidate & Appointed Designation</th>
                    <th className="py-3 px-4">Department & Category</th>
                    <th className="py-3 px-4">Monthly Remuneration</th>
                    <th className="py-3 px-4">Validity / Start Date</th>
                    <th className="py-3 px-4">Agreement Status</th>
                    <th className="py-3 px-4 text-right">Offer Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexa-border/60">
                  {offers.map((o) => (
                    <tr key={o.id} className="hover:bg-nexa-surface/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-nexa-text-primary">{o.candidateName}</div>
                        <div className="text-[11px] text-blue-400 font-medium">{o.offeredDesignation}</div>
                        <div className="text-[10px] text-nexa-text-secondary">{o.candidateEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-nexa-text-primary">
                        <div>{o.department}</div>
                        <span className="capitalize text-[10px] text-nexa-text-secondary bg-nexa-surface px-1.5 py-0.5 rounded border border-nexa-border">
                          {o.roleCategory}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-nexa-text-primary">₦{o.totalMonthly.toLocaleString()} / mo</div>
                        <div className="text-[10px] text-nexa-text-secondary">
                          Base: ₦{o.monthlyStipendSalary.toLocaleString()} + Allowances
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-nexa-text-primary">
                        <div>Start: {o.startDate}</div>
                        <div className="text-[10px] text-amber-400">Expires: {o.expiryDate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {o.status === "accepted" ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Signed & Accepted
                            </span>
                            {o.candidateSignature && (
                              <div className="text-[10px] italic text-nexa-text-secondary font-serif">
                                Signed: "{o.candidateSignature}"
                              </div>
                            )}
                          </div>
                        ) : o.status === "declined" ? (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            Declined
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            Issued / Awaiting Signature
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/careers/offer/${o.token}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Letter Portal
                          </Link>

                          {o.status === "accepted" && (
                            <NexaButton
                              size="sm"
                              variant="primary"
                              className="text-xs py-1 px-2 bg-emerald-600 hover:bg-emerald-500 gap-1"
                              onClick={() => {
                                const cand = candidates.find((c) => c.id === o.candidateId);
                                if (cand) handleConvert(cand);
                              }}
                            >
                              <UserCheck className="w-3 h-3" /> Convert
                            </NexaButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* CANDIDATE DETAIL DRAWER / MODAL */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-nexa-border">
                <div>
                  <h3 className="text-lg font-bold text-nexa-text-primary">{selectedCandidate.name}</h3>
                  <p className="text-xs text-nexa-text-secondary">{selectedCandidate.appliedRole}</p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-nexa-text-secondary block">Contact Phone:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedCandidate.phone}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Email Address:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedCandidate.email}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Academic Qualifications:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedCandidate.education}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Experience:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedCandidate.experienceYears} Years</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Current Stage:</span>
                  <NexaBadge variant="secondary" className="capitalize text-[10px]">
                    {selectedCandidate.stage.replace(/_/g, " ")}
                  </NexaBadge>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Assessment Score:</span>
                  <span className="font-bold text-emerald-400">{selectedCandidate.score}%</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-nexa-text-secondary mb-2">Evaluated Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-md text-xs bg-nexa-surface border border-nexa-border text-nexa-text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* QUICK LIFECYCLE ACTIONS */}
              <div className="p-4 rounded-xl bg-nexa-surface/60 border border-nexa-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <NexaButton
                    size="sm"
                    variant="secondary"
                    className="text-xs gap-1.5"
                    onClick={() => {
                      handleOpenScheduleForCandidate(selectedCandidate);
                    }}
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Book Interview
                  </NexaButton>

                  <NexaButton
                    size="sm"
                    variant="secondary"
                    className="text-xs gap-1.5"
                    onClick={() => {
                      handleOpenOfferForCandidate(selectedCandidate);
                    }}
                  >
                    <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                    Issue Offer
                  </NexaButton>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCandidate.stage === "offer_accepted" ? (
                    <NexaButton
                      size="sm"
                      variant="primary"
                      className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-500"
                      onClick={() => handleConvert(selectedCandidate)}
                    >
                      <UserCheck className="w-4 h-4" />
                      Convert to Permanent Staff
                    </NexaButton>
                  ) : selectedCandidate.stage !== "onboarded" ? (
                    <NexaButton
                      size="sm"
                      variant="primary"
                      className="gap-2 text-xs"
                      onClick={() => handleAdvanceStage(selectedCandidate)}
                    >
                      Advance to Next Stage &rarr;
                    </NexaButton>
                  ) : (
                    <span className="text-emerald-500 font-semibold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Converted to Staff Dossier
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: SCHEDULE INTERVIEW */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-500" />
                  Schedule Interview Session
                </h3>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {lastGeneratedInterviewToken ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-nexa-text-primary">Interview Scheduled!</h4>
                  <p className="text-xs text-nexa-text-secondary">
                    Candidate stage updated to <strong className="text-blue-400">Interview</strong>. Share the direct
                    access link with the candidate:
                  </p>
                  <div className="p-3 bg-nexa-surface/80 border border-nexa-border rounded-xl text-xs font-mono break-all text-slate-300 flex items-center justify-between gap-2">
                    <span>{`/careers/interview/${lastGeneratedInterviewToken}`}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyLink(
                          `${window.location.origin}/careers/interview/${lastGeneratedInterviewToken}`
                        )
                      }
                      className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <NexaButton
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setIsScheduleModalOpen(false);
                        setActiveTab("interviews");
                      }}
                    >
                      Done & View Registry
                    </NexaButton>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitSchedule} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Select Candidate</label>
                    <select
                      value={interviewCandidateId}
                      onChange={(e) => setInterviewCandidateId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="">-- Choose Candidate --</option>
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.appliedRole} ({c.stage})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Evaluation Stage</label>
                      <select
                        value={interviewStage}
                        onChange={(e) => setInterviewStage(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      >
                        <option value="preliminary">Preliminary</option>
                        <option value="technical">Technical</option>
                        <option value="partner">Partner</option>
                        <option value="final">Final Executive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Session Date</label>
                      <input
                        type="date"
                        required
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Start Time (WAT)</label>
                      <input
                        type="time"
                        required
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Video Meeting URL</label>
                      <input
                        type="url"
                        value={interviewUrl}
                        onChange={(e) => setInterviewUrl(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-nexa-text-secondary mb-1">
                      Assigned Panelists (Comma-separated: Name (Designation))
                    </label>
                    <input
                      type="text"
                      value={interviewPanel}
                      onChange={(e) => setInterviewPanel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Internal Instructions / Focus</label>
                    <textarea
                      rows={2}
                      value={interviewNotes}
                      onChange={(e) => setInterviewNotes(e.target.value)}
                      placeholder="Assess distributed cache, query optimization, and team fit."
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                    <NexaButton
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={() => setIsScheduleModalOpen(false)}
                    >
                      Cancel
                    </NexaButton>
                    <NexaButton size="sm" variant="primary" type="submit">
                      Book & Generate Token
                    </NexaButton>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL: ISSUE FORMAL OFFER */}
        {isOfferModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  Issue Formal Employment Offer
                </h3>
                <button
                  onClick={() => setIsOfferModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {lastGeneratedOfferToken ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-nexa-text-primary">Formal Offer Dispatched!</h4>
                  <p className="text-xs text-nexa-text-secondary">
                    Candidate stage updated to <strong className="text-cyan-400">Offer Issued</strong>. Share the formal
                    acceptance portal link with the candidate:
                  </p>
                  <div className="p-3 bg-nexa-surface/80 border border-nexa-border rounded-xl text-xs font-mono break-all text-slate-300 flex items-center justify-between gap-2">
                    <span>{`/careers/offer/${lastGeneratedOfferToken}`}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyLink(
                          `${window.location.origin}/careers/offer/${lastGeneratedOfferToken}`
                        )
                      }
                      className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <NexaButton
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setIsOfferModalOpen(false);
                        setActiveTab("offers");
                      }}
                    >
                      Done & View Offers
                    </NexaButton>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitOffer} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Select Candidate</label>
                    <select
                      value={offerCandidateId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setOfferCandidateId(id);
                        const cand = candidates.find((c) => c.id === id);
                        if (cand) {
                          setOfferDesignation(cand.appliedRole);
                          setOfferDept(cand.department || "Technology");
                        }
                      }}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="">-- Choose Candidate --</option>
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.appliedRole} ({c.stage})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Appointed Designation</label>
                      <input
                        type="text"
                        required
                        value={offerDesignation}
                        onChange={(e) => setOfferDesignation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Department</label>
                      <input
                        type="text"
                        required
                        value={offerDept}
                        onChange={(e) => setOfferDept(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Monthly Base Salary (₦)</label>
                      <input
                        type="number"
                        required
                        value={offerBaseSalary}
                        onChange={(e) => setOfferBaseSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Monthly Allowances (₦)</label>
                      <input
                        type="number"
                        required
                        value={offerAllowances}
                        onChange={(e) => setOfferAllowances(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={offerStartDate}
                        onChange={(e) => setOfferStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Acceptance Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={offerExpiryDate}
                        onChange={(e) => setOfferExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-blue-300">Total Monthly Guaranteed Package:</span>
                    <span className="font-bold text-sm text-blue-200">
                      ₦{(Number(offerBaseSalary) + Number(offerAllowances)).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                    <NexaButton
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={() => setIsOfferModalOpen(false)}
                    >
                      Cancel
                    </NexaButton>
                    <NexaButton size="sm" variant="primary" type="submit">
                      Issue Formal Offer
                    </NexaButton>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL: CREATE VACANCY */}
        {isNewJobModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Create Requisition</h3>
                <button
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Job or Programme Title</label>
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="e.g. 2027 QA & Automation Intern"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Department</label>
                    <select
                      value={newJobDept}
                      onChange={(e) => setNewJobDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Operations">Operations</option>
                      <option value="Compliance Hub">Compliance Hub</option>
                      <option value="Customer Success">Customer Success</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Target Openings</label>
                    <input
                      type="number"
                      value={newJobOpenings}
                      onChange={(e) => setNewJobOpenings(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Location</label>
                    <input
                      type="text"
                      value={newJobLocation}
                      onChange={(e) => setNewJobLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Remuneration / Stipend</label>
                    <input
                      type="text"
                      value={newJobSalary}
                      onChange={(e) => setNewJobSalary(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                <NexaButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsNewJobModalOpen(false)}
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={() => setIsNewJobModalOpen(false)}
                >
                  Publish Vacancy
                </NexaButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}
