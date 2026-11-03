"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  ArrowRight,
  Download,
  FileSpreadsheet,
  Clock,
  Briefcase,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";

export default function ReportsBusinessIntelligencePage() {
  const { kpis, people, deployments, clients, tasks } = useWorkforceManager();

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const REPORT_METRICS = [
    {
      kpi: "Time to Hire",
      value: "14 Days",
      benchmark: "Target: < 21 Days",
      status: "optimal",
      desc: "Average duration from vacancy publication to candidate offer acceptance.",
    },
    {
      kpi: "Time to Competence",
      value: "6 Weeks",
      benchmark: "Target: 8 Weeks",
      status: "optimal",
      desc: "Speed at which interns achieve verified practical certification and deployment clearance.",
    },
    {
      kpi: "Academy Completion Rate",
      value: "87.5%",
      benchmark: "Target: > 80%",
      status: "optimal",
      desc: "Percentage of cohort learners completing all coursework and assessment modules.",
    },
    {
      kpi: "Task First-Time Approval Rate",
      value: "94.2%",
      benchmark: "Target: > 90%",
      status: "optimal",
      desc: "Deliverables approved by line managers without requiring revisions.",
    },
    {
      kpi: "Workforce Utilisation Rate",
      value: `${kpis.utilizationRatePercent}%`,
      benchmark: "Target: > 50%",
      status: "optimal",
      desc: "Proportion of active workforce deployed on billable commercial client accounts.",
    },
    {
      kpi: "Deployment Fill Rate",
      value: "83.3%",
      benchmark: "Target: > 80%",
      status: "optimal",
      desc: "Speed and fulfillment percentage of incoming enterprise workforce requests.",
    },
    {
      kpi: "Average SLA Compliance",
      value: `${kpis.averageSlaCompliancePercent}%`,
      benchmark: "Target: > 95%",
      status: "optimal",
      desc: "Outsourced IT and customer success incident resolution within contract terms.",
    },
    {
      kpi: "Monthly Revenue per Deployed Staff",
      value: `₦${Math.round((kpis.monthlyClientBilledRevenue || 1500000) / (kpis.currentlyDeployed || 1)).toLocaleString()}`,
      benchmark: "Target: > ₦400,000",
      status: "optimal",
      desc: "Average monthly commercial productivity per deployed specialist.",
    },
  ];

  return (
    <ErpAdminShell
      title="Reports & Business Intelligence"
      subtitle="Module 10 · Executive workforce analytics, operational benchmarks, and regulatory compliance reports."
      activeModule="workforce"
      action={
        <NexaButton
          size="sm"
          variant="primary"
          className="gap-2 text-xs"
          onClick={handleExportReport}
        >
          <Download className="w-4 h-4" />
          Export Executive Report
        </NexaButton>
      }
    >
      <div className="space-y-8">
        {downloadSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span>Executive Workforce Audit Report exported successfully!</span>
          </div>
        )}

        {/* 1. EXECUTIVE SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Total Managed Workforce</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{kpis.totalWorkforce}</p>
            <p className="text-xs text-nexa-text-secondary mt-1">
              {kpis.activeEmployees} Staff · {kpis.activeInterns} Interns · {kpis.activeContractors} Contractors
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Workforce Utilisation</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{kpis.utilizationRatePercent}%</p>
            <p className="text-xs text-cyan-400 mt-1 font-medium">{kpis.currentlyDeployed} Deployed on Client Accounts</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Billed Monthly Revenue</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              ₦{(kpis.monthlyClientBilledRevenue || 1500000).toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Gross Margin: {kpis.grossMarginPercent}%</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">SLA Compliance Health</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{kpis.averageSlaCompliancePercent}%</p>
            <p className="text-xs text-emerald-400 mt-1">Zero critical SLA breaches</p>
          </div>
        </section>

        {/* 2. OPERATIONAL KPI BENCHMARK MATRIX */}
        <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                Workforce Operational KPI Scorecard
              </h2>
              <p className="text-xs text-nexa-text-secondary">
                Performance standards defined in the WorkforceOS blueprint benchmarked against operational actuals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_METRICS.map((m, idx) => (
              <div
                key={idx}
                className="p-4 bg-nexa-surface/70 rounded-xl border border-nexa-border space-y-2 hover:border-orange-500/40 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                    {m.status}
                  </span>
                  <span className="text-[10px] text-nexa-text-secondary">{m.benchmark}</span>
                </div>
                <h3 className="text-xs font-semibold text-nexa-text-secondary">{m.kpi}</h3>
                <p className="text-xl font-bold text-nexa-text-primary">{m.value}</p>
                <p className="text-[11px] text-nexa-text-secondary leading-snug pt-1 border-t border-nexa-border/60">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. WORKFORCE RETENTION & CLIENT SERVICE CAPACITY */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Workforce Distribution by Department
            </h3>
            <div className="space-y-3">
              {[
                { dept: "Technology", count: 18, pct: 45, color: "bg-blue-500" },
                { dept: "Operations & IT Support", count: 10, pct: 25, color: "bg-cyan-500" },
                { dept: "Compliance Hub", count: 6, pct: 15, color: "bg-purple-500" },
                { dept: "Customer Success", count: 6, pct: 15, color: "bg-emerald-500" },
              ].map((d, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-nexa-text-primary">{d.dept}</span>
                    <span className="text-nexa-text-secondary">{d.count} Members ({d.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-nexa-surface border border-nexa-border overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Statutory & Regulatory Audit Verification
            </h3>
            <p className="text-xs text-nexa-text-secondary">
              Ensures multi-tenant defense-in-depth isolation and Nigerian Data Protection Act compliance.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Tenant DEDICATED Database Isolation
                </span>
                <span className="font-mono font-bold text-[10px]">ENFORCED</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> NDPA 2023 Employee Privacy Safeguards
                </span>
                <span className="font-mono font-bold text-[10px]">COMPLIANT</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> SLA Incident Audit Trail
                </span>
                <span className="font-mono font-bold text-[10px]">LOGGED</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ErpAdminShell>
  );
}
