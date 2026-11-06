"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  GraduationCap,
  CheckSquare,
  Clock,
  Award,
  Network,
  Headphones,
  DollarSign,
  BarChart3,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  Plus,
  Radio,
  FileCheck2,
  Zap,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaCard } from "@/components/nexa/NexaCard";
import { useWorkforceManager } from "@/lib/workforce-store";

export default function WorkforceCommandCenter() {
  const {
    kpis,
    people,
    candidates,
    courses,
    tasks,
    deployments,
    clients,
    recordClockIn,
  } = useWorkforceManager();

  const [clockInSuccess, setClockInSuccess] = useState(false);

  const handleSimulateClockIn = () => {
    recordClockIn("Operations Associate", "employee");
    setClockInSuccess(true);
    setTimeout(() => setClockInSuccess(false), 4000);
  };

  const moduleCards = [
    {
      num: "01",
      title: "Recruitment & Talent Acquisition",
      desc: "Job openings, multi-stage candidate screening pipeline, interview scoring panels, and automatic person onboarding.",
      href: "/erp/admin/workforce/recruitment",
      icon: <Briefcase className="w-5 h-5 text-blue-500" />,
      badge: `${candidates.length} Applicants`,
      metricLabel: "Active Pipeline",
      metricValue: `${candidates.filter((c) => c.stage !== "onboarded" && c.stage !== "rejected").length} in review`,
      color: "border-blue-500/20 hover:border-blue-500/50",
    },
    {
      num: "02",
      title: "People Management & Directory",
      desc: "Single unified record for employees, interns, contractors, and consultants with 14-point detailed career profiles.",
      href: "/erp/admin/workforce/people",
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      badge: `${people.length} Total Profiles`,
      metricLabel: "Workforce Roster",
      metricValue: `${people.filter((p) => p.status === "active").length} Active / ${people.filter((p) => p.status === "deployed").length} Deployed`,
      color: "border-indigo-500/20 hover:border-indigo-500/50",
    },
    {
      num: "03",
      title: "Talent Academy / LMS",
      desc: "Cohort learning tracks, course library, practical task assignments, gradebooks, and verifiable competency certifications.",
      href: "/erp/admin/workforce/academy",
      icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
      badge: `${courses.length} Active Courses`,
      metricLabel: "Cohort Training",
      metricValue: `${courses.reduce((sum, c) => sum + c.enrolledLearners, 0)} Trainees Enrolled`,
      color: "border-purple-500/20 hover:border-purple-500/50",
    },
    {
      num: "04",
      title: "Work & Task Management",
      desc: "Project deliverables, Kanban workflow, competency-tagged task assignments, deliverable submissions, and reviews.",
      href: "/erp/admin/workforce/tasks",
      icon: <CheckSquare className="w-5 h-5 text-emerald-500" />,
      badge: `${tasks.length} Tracked Tasks`,
      metricLabel: "Sprint Execution",
      metricValue: `${tasks.filter((t) => t.status === "in_progress").length} In Progress / ${tasks.filter((t) => t.status === "review").length} in QA`,
      color: "border-emerald-500/20 hover:border-emerald-500/50",
    },
    {
      num: "05",
      title: "Time, Attendance & Scheduling",
      desc: "Live daily attendance with GPS verification, shift roster planning, leave workflow approvals, and weekly timesheets.",
      href: "/erp/admin/workforce/attendance",
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      badge: "Real-Time GPS",
      metricLabel: "Daily Punctuality",
      metricValue: "98.4% Present Today",
      color: "border-amber-500/20 hover:border-amber-500/50",
    },
    {
      num: "06",
      title: "Performance & Competencies",
      desc: "Role-specific appraisal templates, 5-level competency skill ratings, 360 feedback, PIPs, and promotion tracks.",
      href: "/erp/admin/workforce/performance",
      icon: <Award className="w-5 h-5 text-rose-500" />,
      badge: "Competency Radar",
      metricLabel: "Avg Competency",
      metricValue: "4.7 / 5.0 Rating",
      color: "border-rose-500/20 hover:border-rose-500/50",
    },
    {
      num: "07",
      title: "Workforce Planning & Deployment",
      desc: "Skills-based search engine, staffing request fulfillment, client deployment rosters, and capacity utilisation matching.",
      href: "/erp/admin/workforce/deployment",
      icon: <Network className="w-5 h-5 text-cyan-500" />,
      badge: `${deployments.length} Active Deployments`,
      metricLabel: "Utilization Rate",
      metricValue: `${kpis.utilizationRatePercent}% Staff Deployed`,
      color: "border-cyan-500/20 hover:border-cyan-500/50",
    },
    {
      num: "08",
      title: "Service Delivery Management",
      desc: "Outsource client accounts, service agreements, ticket resolution, SLA breach alarms, and daily verified work logs.",
      href: "/erp/admin/workforce/service-delivery",
      icon: <Headphones className="w-5 h-5 text-teal-500" />,
      badge: `${clients.length} Client Accounts`,
      metricLabel: "SLA Health",
      metricValue: `${kpis.averageSlaCompliancePercent}% SLA Met`,
      color: "border-teal-500/20 hover:border-teal-500/50",
    },
    {
      num: "09",
      title: "Compensation & Workforce Costing",
      desc: "Stipend distribution, contractor daily rates, timesheet costing, and contract billing margin profitability.",
      href: "/erp/admin/workforce/compensation",
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      badge: "Margin Engine",
      metricLabel: "Gross Margin",
      metricValue: `${kpis.grossMarginPercent}% Contract ROI`,
      color: "border-green-500/20 hover:border-green-500/50",
    },
    {
      num: "10",
      title: "Reports & Business Intelligence",
      desc: "Executive talent analytics, time-to-hire, time-to-competence, revenue per deployed worker, and regulatory audit reports.",
      href: "/erp/admin/workforce/reports",
      icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
      badge: "Executive BI",
      metricLabel: "Time to Competence",
      metricValue: `${kpis.timeToCompetenceWeeks} Weeks Avg`,
      color: "border-orange-500/20 hover:border-orange-500/50",
    },
  ];

  return (
    <ErpAdminShell
      title="Worforce manager"
      subtitle="The end-to-end operating system for managing people, skills, training, tasks, and client deployment."
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="secondary"
            className="gap-2 text-xs"
            onClick={handleSimulateClockIn}
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            Quick Clock In
          </NexaButton>
          <Link href="/erp/admin/workforce/deployment">
            <NexaButton size="sm" variant="primary" className="gap-2 text-xs">
              <Network className="w-4 h-4" />
              Staff Deployment
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {clockInSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400 text-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Clock-in recorded successfully with verified Lagos HQ GPS stamp!</span>
            </div>
            <Link href="/erp/admin/workforce/attendance" className="underline font-semibold text-xs">
              View Attendance Ledger &rarr;
            </Link>
          </div>
        )}

        {/* 1. TOP EXECUTIVE KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-nexa-text-secondary">
                Total Managed Workforce
              </h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">{kpis.totalWorkforce}</p>
            <p className="text-xs text-nexa-text-secondary mt-2 flex items-center gap-1.5">
              <span className="text-emerald-500 font-semibold">{kpis.activeEmployees} Employees</span> ·{" "}
              <span>{kpis.activeInterns} Interns</span> ·{" "}
              <span>{kpis.activeContractors} Contractors</span>
            </p>
          </div>

          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-nexa-text-secondary">
                Client Deployment Rate
              </h3>
              <Network className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">{kpis.utilizationRatePercent}%</p>
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{kpis.currentlyDeployed} deployed on revenue contracts</span>
            </p>
          </div>

          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-nexa-text-secondary">
                Monthly Billed Labor Revenue
              </h3>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">
              ₦{(kpis.monthlyClientBilledRevenue || 1500000).toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <span>Gross Margin: {kpis.grossMarginPercent || 53}%</span>
            </p>
          </div>

          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-nexa-text-secondary">
                SLA Compliance Target
              </h3>
              <ShieldCheck className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-nexa-text-primary">{kpis.averageSlaCompliancePercent}%</p>
            <p className="text-xs text-nexa-text-secondary mt-2">Across 3 active client SLAs</p>
          </div>
        </section>

        {/* 2. THE 10 WORKFORCEOS MODULES GRID */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-nexa-text-primary">WorkforceOS Modules</h2>
              <p className="text-xs text-nexa-text-secondary">
                Ten integrated systems driving recruitment, learning, operations, and client service delivery.
              </p>
            </div>
            <span className="text-xs text-nexa-text-secondary font-mono">10 of 10 Modules Provisioned</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {moduleCards.map((mod) => (
              <Link
                key={mod.num}
                href={mod.href}
                className={`p-6 bg-nexa-surface rounded-xl border ${mod.color} transition-all duration-200 flex flex-col justify-between group hover:shadow-lg`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-lg bg-nexa-surface/80 border border-nexa-border">
                        {mod.icon}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-nexa-text-secondary uppercase">
                          Module {mod.num}
                        </span>
                        <h3 className="text-base font-bold text-nexa-text-primary group-hover:text-blue-500 transition-colors">
                          {mod.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-nexa-text-secondary leading-relaxed mb-4">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-nexa-border/60 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-nexa-text-secondary block">
                      {mod.metricLabel}
                    </span>
                    <span className="text-xs font-semibold text-nexa-text-primary">
                      {mod.metricValue}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-blue-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. LIVE CLIENT DEPLOYMENTS & RECENT ACTIVITIES */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Client Engagements */}
          <div className="lg:col-span-2 p-6 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Active Outsource Client Deployments
                </h3>
                <p className="text-xs text-nexa-text-secondary">
                  Trained personnel currently deployed on customer service agreements
                </p>
              </div>
              <Link href="/erp/admin/workforce/service-delivery">
                <span className="text-xs text-blue-500 hover:underline font-semibold">
                  Manage Clients &rarr;
                </span>
              </Link>
            </div>

            <div className="divide-y divide-nexa-border/60">
              {deployments.map((d) => (
                <div key={d.id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-nexa-text-primary">{d.personName}</span>
                      <NexaBadge variant="secondary" className="text-[10px] py-0">
                        {d.role}
                      </NexaBadge>
                    </div>
                    <p className="text-xs text-nexa-text-secondary">
                      Deployed to <span className="font-medium text-nexa-text-primary">{d.clientName}</span> ·{" "}
                      {d.contractTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-emerald-400 block">
                      ₦{d.billingRateMonthly.toLocaleString()}/mo
                    </span>
                    <span className="text-[10px] text-nexa-text-secondary">
                      Allocated: {d.allocationPercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Lifecycle Quick Actions */}
          <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Workforce Lifecycle Actions
            </h3>
            <p className="text-xs text-nexa-text-secondary">
              Accelerate talent conversion from application to client deployment.
            </p>

            <div className="space-y-2.5 pt-2">
              <Link href="/erp/admin/workforce/recruitment" className="block">
                <div className="p-3 rounded-lg border border-nexa-border hover:border-blue-500/40 bg-nexa-surface/60 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-nexa-text-primary group-hover:text-blue-500 transition-colors">
                        Post New Vacancy
                      </h4>
                      <p className="text-[11px] text-nexa-text-secondary">Internship or staff role</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-nexa-text-secondary group-hover:text-blue-500" />
                </div>
              </Link>

              <Link href="/erp/admin/workforce/academy" className="block">
                <div className="p-3 rounded-lg border border-nexa-border hover:border-purple-500/40 bg-nexa-surface/60 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-purple-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-nexa-text-primary group-hover:text-purple-500 transition-colors">
                        Enroll Cohort in Track
                      </h4>
                      <p className="text-[11px] text-nexa-text-secondary">Curriculum & practical work</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-nexa-text-secondary group-hover:text-purple-500" />
                </div>
              </Link>

              <Link href="/erp/admin/workforce/deployment" className="block">
                <div className="p-3 rounded-lg border border-nexa-border hover:border-cyan-500/40 bg-nexa-surface/60 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <Network className="w-4 h-4 text-cyan-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-nexa-text-primary group-hover:text-cyan-500 transition-colors">
                        Match & Deploy Talent
                      </h4>
                      <p className="text-[11px] text-nexa-text-secondary">Skills-based staffing request</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-nexa-text-secondary group-hover:text-cyan-500" />
                </div>
              </Link>

              <Link href="/erp/admin/workforce/service-delivery" className="block">
                <div className="p-3 rounded-lg border border-nexa-border hover:border-teal-500/40 bg-nexa-surface/60 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-4 h-4 text-teal-500" />
                    <div>
                      <h4 className="text-xs font-semibold text-nexa-text-primary group-hover:text-teal-500 transition-colors">
                        SLA Incident Support
                      </h4>
                      <p className="text-[11px] text-nexa-text-secondary">Escalation & ticket triage</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-nexa-text-secondary group-hover:text-teal-500" />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ErpAdminShell>
  );
}
