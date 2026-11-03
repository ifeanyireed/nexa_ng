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
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { useWorkforceManager } from "@/lib/workforce-store";
import { ApplicationStage, Candidate } from "@/lib/workforce-types";

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
    updateCandidateStage,
    convertCandidateToPerson,
  } = useWorkforceManager();

  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDept, setNewJobDept] = useState("Technology");
  const [newJobOpenings, setNewJobOpenings] = useState(5);
  const [newJobLocation, setNewJobLocation] = useState("Lagos / Hybrid");
  const [newJobSalary, setNewJobSalary] = useState("₦150,000 / mo");

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

  return (
    <ErpAdminShell
      title="Recruitment & Talent Acquisition"
      subtitle="Module 01 · Vacancy postings, application screening, assessment scoring, and automatic person onboarding."
      activeModule="workforce"
      action={
        <NexaButton
          size="sm"
          variant="primary"
          className="gap-2 text-xs"
          onClick={() => setIsNewJobModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create Vacancy
        </NexaButton>
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
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Offers Accepted</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {candidates.filter((c) => c.stage === "offer_accepted" || c.stage === "onboarded").length}
            </p>
            <p className="text-xs text-nexa-text-secondary mt-1">Ready for academy onboarding</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Time to Hire Avg</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">14 Days</p>
            <p className="text-xs text-emerald-500 mt-1">3 days faster than target SLA</p>
          </div>
        </section>

        {/* JOB OPENINGS LIST */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Published Requisitions & Programmes
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
                  <span className="text-nexa-text-secondary">Filled: {job.filled} / {job.openings}</span>
                  <span className="text-blue-500 font-medium">Closes {job.closingDate}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RECRUITMENT PIPELINE & APPLICANTS */}
        <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Applicant Pipeline & Candidate Selection
              </h2>
              <p className="text-xs text-nexa-text-secondary">
                Review assessments, interview scores, and auto-convert accepted offers into permanent workforce profiles.
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
                        {cand.stage === "offer_accepted" ? (
                          <NexaButton
                            size="sm"
                            variant="primary"
                            className="text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 gap-1"
                            onClick={() => handleConvert(cand)}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Auto-Convert to Person
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

        {/* CANDIDATE DETAIL MODAL */}
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
                  <span className="text-nexa-text-secondary block">Assigned Interviewer:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedCandidate.interviewer || "HR Lead"}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Current Stage:</span>
                  <NexaBadge variant="secondary" className="capitalize text-[10px]">
                    {selectedCandidate.stage.replace(/_/g, " ")}
                  </NexaBadge>
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

              <div className="p-4 rounded-xl bg-nexa-surface/60 border border-nexa-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-nexa-text-secondary block">Pipeline Transition</span>
                  <p className="text-xs font-medium text-nexa-text-primary">
                    Move forward through assessment, interview, and formal offer.
                  </p>
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
                      Convert to Permanent Person
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
                      <CheckCircle2 className="w-4 h-4" /> Successfully Converted to Person Record
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CREATE JOB VACANCY MODAL */}
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
