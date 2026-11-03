"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Star,
  TrendingUp,
  Target,
  CheckCircle2,
  Users,
  ShieldCheck,
  Plus,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Check,
  X,
  FileCheck2,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { PromotionNomination, CompetencyMatrixItem } from "@/lib/workforce-types";

export default function PerformanceCareerManagementPage() {
  const {
    competencies,
    promotions,
    people,
    nominatePromotion,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"competencies" | "promotions" | "pips">("competencies");
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);
  const [nomineeName, setNomineeName] = useState("Kalu Nwosu");
  const [proposedRole, setProposedRole] = useState("Full-Stack Software Engineer");
  const [nomineeDept, setNomineeDept] = useState("Technology");
  const [nomineeRating, setNomineeRating] = useState(4.8);

  const handleCreateNomination = (e: React.FormEvent) => {
    e.preventDefault();
    const nomination: PromotionNomination = {
      id: `prom-${Date.now()}`,
      personName: nomineeName,
      currentDesignation: "Associate Developer",
      proposedDesignation: proposedRole,
      department: nomineeDept,
      nominatedBy: "Ifeanyi Felix",
      tenureMonths: 8,
      competencyRating: nomineeRating,
      status: "under_review",
    };
    nominatePromotion(nomination);
    setIsNominateModalOpen(false);
  };

  return (
    <ErpAdminShell
      title="Performance & Competencies"
      subtitle="Module 06 · Tailored evaluation cycles, 5-level competency matrices, 360 feedback, and promotion tracks."
      activeModule="workforce"
      action={
        <NexaButton
          size="sm"
          variant="primary"
          className="gap-2 text-xs"
          onClick={() => setIsNominateModalOpen(true)}
        >
          <Award className="w-4 h-4" />
          Nominate for Promotion
        </NexaButton>
      }
    >
      <div className="space-y-8">
        {/* TOP PERFORMANCE METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Average Rating</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">4.7 / 5.0</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-emerald-400" /> Across 25 active appraisals
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Defined Competencies</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{competencies.length} Domains</p>
            <p className="text-xs text-nexa-text-secondary mt-1">Tech, Ops, Compliance, Success</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Promotion Nominations</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{promotions.length} Pipeline</p>
            <p className="text-xs text-purple-400 mt-1 font-medium">
              {promotions.filter((p) => p.status === "approved").length} Approved by Executive Directorate
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active PIP Plans</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">0</p>
            <p className="text-xs text-emerald-400 mt-1">Zero formal improvement plans active</p>
          </div>
        </section>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-nexa-border gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("competencies")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "competencies"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Award className="w-4 h-4" />
            Competency Matrix ({competencies.length})
          </button>
          <button
            onClick={() => setActiveTab("promotions")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "promotions"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Promotion & Career Pathways ({promotions.length})
          </button>
          <button
            onClick={() => setActiveTab("pips")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "pips"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Performance Improvement Plans (PIP)
          </button>
        </div>

        {/* TAB 1: COMPETENCY MATRIX */}
        {activeTab === "competencies" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Enterprise Competency Radar</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Standards required to qualify staff for specialized roles and revenue client deployments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competencies.map((comp) => (
                <div
                  key={comp.id}
                  className="p-5 bg-nexa-surface/70 border border-nexa-border rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {comp.category}
                    </span>
                    <NexaBadge variant="secondary" className="text-[10px]">
                      Target: {comp.requiredLevel}
                    </NexaBadge>
                  </div>

                  <h4 className="text-sm font-bold text-nexa-text-primary">{comp.competency}</h4>

                  <div className="pt-2 border-t border-nexa-border/60 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {comp.totalCertifiedPeople} Certified Personnel
                    </span>
                    <span className="text-nexa-text-secondary font-mono">
                      {comp.inTrainingPeople} in Training
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: PROMOTIONS */}
        {activeTab === "promotions" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Promotion Nominations & Transitions</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Supervised progression from intern to associate and full-time senior roles.
                </p>
              </div>
            </div>

            <div className="divide-y divide-nexa-border/60">
              {promotions.map((p) => (
                <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-nexa-text-primary">{p.personName}</h4>
                      <NexaBadge variant="secondary" className="text-[10px] py-0">
                        {p.department}
                      </NexaBadge>
                      <NexaBadge
                        variant={p.status === "approved" ? "primary" : "secondary"}
                        className="text-[10px] capitalize"
                      >
                        {p.status.replace(/_/g, " ")}
                      </NexaBadge>
                    </div>
                    <p className="text-xs text-nexa-text-secondary flex items-center gap-2">
                      <span>{p.currentDesignation}</span>
                      <ArrowRight className="w-3 h-3 text-blue-400" />
                      <strong className="text-emerald-400">{p.proposedDesignation}</strong>
                    </p>
                    <p className="text-[11px] text-nexa-text-secondary">
                      Nominated by: {p.nominatedBy} · Tenure: {p.tenureMonths} Months · Competency Score: {p.competencyRating}/5.0
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status === "approved" ? (
                      <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Ratified by Executive
                      </span>
                    ) : (
                      <span className="text-amber-400 text-xs font-medium">Pending MD Ratification</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: PIPS */}
        {activeTab === "pips" && (
          <div className="p-8 bg-nexa-surface border border-nexa-border rounded-xl text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-nexa-text-primary">Zero Active Corrective Action Plans</h4>
            <p className="text-xs text-nexa-text-secondary max-w-sm mx-auto">
              All workforce members are currently meeting or exceeding deliverable benchmarks.
            </p>
          </div>
        )}

        {/* NOMINATE MODAL */}
        {isNominateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Nominate for Promotion</h3>
                <button
                  onClick={() => setIsNominateModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNomination} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Team Member</label>
                  <select
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Proposed New Designation</label>
                  <input
                    type="text"
                    required
                    value={proposedRole}
                    onChange={(e) => setProposedRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Department</label>
                    <select
                      value={nomineeDept}
                      onChange={(e) => setNomineeDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Operations">Operations</option>
                      <option value="Compliance Hub">Compliance Hub</option>
                      <option value="Customer Success">Customer Success</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Competency Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={nomineeRating}
                      onChange={(e) => setNomineeRating(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsNominateModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Submit Nomination
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}
