"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Network,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar as CalendarIcon,
  AlertCircle,
  Plus,
  Compass,
  Star,
  Check,
  X,
  FileCheck2,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  Layers,
  ChevronRight,
  UserCheck,
  RotateCcw,
  Sliders,
  DollarSign,
  Maximize2,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import {
  WorkforceRequest,
  DeploymentAllocation,
  WorkforceCapacitySkillDeficit,
} from "@/lib/workforce-types";

export default function WorkforcePlanningDeploymentPage() {
  const {
    workforceRequests,
    deployments,
    people,
    capacityDeficits,
    ganttItems,
    deployPerson,
    approveDeployment,
    rollOffDeployment,
    updateDeployment,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"gantt" | "capacity" | "gate" | "requests">("gantt");
  const [searchSkill, setSearchSkill] = useState("");
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rollingOffId, setRollingOffId] = useState<string | null>(null);

  // Deploy allocation form state
  const [deployPersonId, setDeployPersonId] = useState("");
  const [deployClient, setDeployClient] = useState("Prime Logistics Ltd");
  const [deployContract, setDeployContract] = useState("Tier-1 Network & Infrastructure Support");
  const [deployBilling, setDeployBilling] = useState(650000);
  const [deployCost, setDeployCost] = useState(250000);
  const [deployPercent, setDeployPercent] = useState(100);
  const [deployStartDate, setDeployStartDate] = useState("2027-05-01");
  const [deployEndDate, setDeployEndDate] = useState("2027-10-31");
  const [deployLocation, setDeployLocation] = useState("Victoria Island Hub, Lagos");
  const [deployNotes, setDeployNotes] = useState("");
  const [deployRequiresGate, setDeployRequiresGate] = useState(true);

  // Filter state for Gantt
  const [ganttDeptFilter, setGanttDeptFilter] = useState("all");
  const [ganttStatusFilter, setGanttStatusFilter] = useState("all");

  // Metrics
  const activeDeployments = deployments.filter((d) => d.status === "active" || d.status === "ending_soon");
  const pendingGateDeployments = deployments.filter((d) => d.status === "pending_approval");
  const benchPeople = people.filter((p) => p.status === "active" || p.status === "bench");

  const totalMonthlyBilled = activeDeployments.reduce((sum, d) => sum + d.billingRateMonthly, 0);
  const totalMonthlyLaborCost = activeDeployments.reduce((sum, d) => sum + d.costRateMonthly, 0);
  const monthlyMargin = totalMonthlyBilled - totalMonthlyLaborCost;
  const marginPercent = totalMonthlyBilled > 0 ? Math.round((monthlyMargin / totalMonthlyBilled) * 100) : 0;

  const handleExecuteDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    const person = people.find((p) => p.id === deployPersonId);
    if (!person) return;

    const allocation: DeploymentAllocation = {
      id: `dep-${Date.now()}`,
      personId: person.id,
      personName: person.name,
      role: person.designation,
      clientName: deployClient,
      contractTitle: deployContract,
      startDate: deployStartDate,
      endDate: deployEndDate,
      allocationPercent: deployPercent,
      status: deployRequiresGate ? "pending_approval" : "active",
      billingRateMonthly: deployBilling,
      costRateMonthly: deployCost,
      requestedBy: "Operations Planning Manager",
      location: deployLocation,
      notes: deployNotes,
    };

    deployPerson(allocation);
    setIsDeployModalOpen(false);
  };

  const handleApproveGate = async (depId: string) => {
    setApprovingId(depId);
    try {
      await approveDeployment(depId, "Managing Director");
    } finally {
      setApprovingId(null);
    }
  };

  const handleRollOff = async (depId: string) => {
    setRollingOffId(depId);
    try {
      await rollOffDeployment(depId, "Contract completed and personnel returned to active bench");
    } finally {
      setRollingOffId(null);
    }
  };

  const filteredGantt = ganttItems.filter((item) => {
    const matchesDept = ganttDeptFilter === "all" || item.department.toLowerCase() === ganttDeptFilter.toLowerCase();
    const matchesStatus = ganttStatusFilter === "all" || item.status === ganttStatusFilter;
    return matchesDept && matchesStatus;
  });

  return (
    <ErpAdminShell
      title="Workforce Planning & Deployment"
      subtitle="Module 07 · Capacity Matrix, Visual Availability Calendar, Skills Deficit Analysis, and Multi-Stage Deployment Approval Gate."
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/workforce/deployment/calendar">
            <NexaButton size="sm" variant="secondary" className="gap-2 text-xs">
              <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
              Full-Screen Gantt
            </NexaButton>
          </Link>
          <NexaButton
            size="sm"
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsDeployModalOpen(true)}
          >
            <Network className="w-4 h-4" />
            Deploy Personnel
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active Deployments</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{activeDeployments.length} Specialists</p>
            <p className="text-xs text-cyan-400 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> ₦{totalMonthlyBilled.toLocaleString()} / mo billed
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Available on Bench</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{benchPeople.length} Specialists</p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Ready for immediate client allocation</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Directorate Gate Queue</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{pendingGateDeployments.length} Pending</p>
            <p className="text-xs text-amber-400 mt-1 font-medium">
              {pendingGateDeployments.length > 0 ? "Awaiting Director authorization" : "Zero pending deployment gates"}
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Deployment Margin</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              ₦{monthlyMargin.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +{marginPercent}% Gross Profitability
            </p>
          </div>
        </section>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-nexa-border gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("gantt")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "gantt"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Gantt Availability Timeline ({ganttItems.length})
          </button>
          <button
            onClick={() => setActiveTab("capacity")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "capacity"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Capacity & Skill Deficit Analysis ({capacityDeficits.length})
          </button>
          <button
            onClick={() => setActiveTab("gate")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "gate"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Deployment Approval Gate ({pendingGateDeployments.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "requests"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Client Staffing Requisitions ({workforceRequests.length})
          </button>
        </div>

        {/* TAB 1: GANTT AVAILABILITY TIMELINE */}
        {activeTab === "gantt" && (
          <div className="space-y-6">
            <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary">Gantt Availability & Roll-off Timeline</h3>
                  <p className="text-xs text-nexa-text-secondary">
                    Real-time operational view of currently deployed contracts, upcoming roll-off dates, and bench status.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={ganttDeptFilter}
                    onChange={(e) => setGanttDeptFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-xs text-nexa-text-primary focus:outline-none"
                  >
                    <option value="all">All Departments</option>
                    <option value="Technology">Technology</option>
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                  <select
                    value={ganttStatusFilter}
                    onChange={(e) => setGanttStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-xs text-nexa-text-primary focus:outline-none"
                  >
                    <option value="all">All Availability</option>
                    <option value="deployed">Currently Deployed</option>
                    <option value="bench">Available on Bench</option>
                  </select>
                  <Link href="/erp/admin/workforce/deployment/calendar">
                    <NexaButton size="sm" variant="secondary" className="text-xs gap-1">
                      <Maximize2 className="w-3.5 h-3.5" /> Full View
                    </NexaButton>
                  </Link>
                </div>
              </div>

              {/* Gantt List */}
              <div className="divide-y divide-nexa-border/60">
                {filteredGantt.map((item) => {
                  const activeAlloc = item.allocations.find((a) => a.status === "active" || a.status === "ending_soon");
                  const pendingAlloc = item.allocations.find((a) => a.status === "pending_approval");
                  return (
                    <div
                      key={item.personId}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-nexa-surface/40 px-3 rounded-lg transition-colors"
                    >
                      <div className="space-y-1 md:w-1/3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-nexa-text-primary">{item.personName}</h4>
                          <NexaBadge
                            variant={item.status === "deployed" ? "primary" : "secondary"}
                            className="text-[9px] uppercase font-mono py-0"
                          >
                            {item.status}
                          </NexaBadge>
                        </div>
                        <p className="text-xs text-nexa-text-secondary">
                          {item.designation} · <span className="text-nexa-text-primary">{item.department}</span>
                        </p>
                      </div>

                      {/* Timeline Bar representation */}
                      <div className="flex-1 space-y-1.5">
                        {activeAlloc ? (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" /> {activeAlloc.clientName}
                              </span>
                              <span className="text-[11px] font-mono text-nexa-text-secondary">
                                {activeAlloc.startDate} → {activeAlloc.endDate}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-nexa-text-secondary">
                              <span>{activeAlloc.contractTitle}</span>
                              <span className="font-mono font-semibold text-emerald-300">
                                {activeAlloc.allocationPercent}% Allocated
                              </span>
                            </div>
                          </div>
                        ) : pendingAlloc ? (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> Gate Pending: {pendingAlloc.clientName}
                              </span>
                              <span className="text-[11px] font-mono text-nexa-text-secondary">
                                Scheduled: {pendingAlloc.startDate}
                              </span>
                            </div>
                            <p className="text-[11px] text-nexa-text-secondary">{pendingAlloc.contractTitle}</p>
                          </div>
                        ) : (
                          <div className="p-3 bg-nexa-surface/60 border border-dashed border-nexa-border rounded-lg text-xs text-nexa-text-secondary flex items-center justify-between">
                            <span>Available on Bench · Unassigned to active client SLA</span>
                            <span className="text-emerald-400 font-semibold text-[11px]">Immediate Availability</span>
                          </div>
                        )}
                      </div>

                      {/* Status / Roll-off Actions */}
                      <div className="md:w-44 text-right flex md:flex-col items-center md:items-end justify-between gap-1">
                        {activeAlloc && item.upcomingRollOffDays != null && (
                          <div className="space-y-1">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${item.upcomingRollOffDays <= 30 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                              {item.upcomingRollOffDays} Days to Roll-Off
                            </span>
                            <NexaButton
                              size="sm"
                              variant="secondary"
                              className="text-[11px] py-0.5 px-2 text-rose-400 hover:text-rose-300 gap-1"
                              disabled={rollingOffId === activeAlloc.id}
                              onClick={() => handleRollOff(activeAlloc.id)}
                            >
                              <RotateCcw className="w-3 h-3" />
                              {rollingOffId === activeAlloc.id ? "Rolling Off..." : "Roll Off to Bench"}
                            </NexaButton>
                          </div>
                        )}

                        {!activeAlloc && !pendingAlloc && (
                          <NexaButton
                            size="sm"
                            variant="primary"
                            className="text-xs py-1 px-3"
                            onClick={() => {
                              setDeployPersonId(item.personId);
                              setIsDeployModalOpen(true);
                            }}
                          >
                            Allocate
                          </NexaButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAPACITY MATRIX & SKILL DEFICIT ANALYSIS */}
        {activeTab === "capacity" && (
          <div className="space-y-6">
            <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary">Capacity Matrix & Skill Deficit Radar</h3>
                  <p className="text-xs text-nexa-text-secondary">
                    Compares current client demand from open staffing requisitions against available bench headcount.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/erp/admin/workforce/recruitment">
                    <NexaButton size="sm" variant="secondary" className="text-xs gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> Post Job Requisition
                    </NexaButton>
                  </Link>
                  <Link href="/erp/admin/workforce/academy">
                    <NexaButton size="sm" variant="secondary" className="text-xs gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> Upskill via Academy
                    </NexaButton>
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-nexa-surface/60 text-nexa-text-secondary uppercase text-[10px] tracking-wider border-b border-nexa-border">
                    <tr>
                      <th className="py-3 px-4">Skill / Competency Domain</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Client Demand</th>
                      <th className="py-3 px-4 text-center">Bench Ready</th>
                      <th className="py-3 px-4 text-center">Deployed</th>
                      <th className="py-3 px-4 text-center">Net Deficit / Balance</th>
                      <th className="py-3 px-4 text-right">Strategic Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nexa-border/60">
                    {capacityDeficits.map((item, idx) => (
                      <tr key={idx} className="hover:bg-nexa-surface/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-nexa-text-primary flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          {item.skill}
                        </td>
                        <td className="py-3.5 px-4 text-nexa-text-secondary font-mono text-[11px]">
                          {item.category}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-400">
                          {item.demandHeadcount} Roles
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-400">
                          {item.availableBenchHeadcount} Available
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-cyan-400">
                          {item.deployedHeadcount} In Field
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.deficit > 0 ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              <AlertTriangle className="w-3 h-3" /> -{item.deficit} Shortage
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <Check className="w-3 h-3" /> +{Math.abs(item.deficit)} Surplus
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {item.deficit > 0 ? (
                            <Link href="/erp/admin/workforce/recruitment">
                              <span className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline text-[11px]">
                                Requisition Staff &rarr;
                              </span>
                            </Link>
                          ) : (
                            <span className="text-nexa-text-secondary text-[11px]">Capacity Satisfied</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEPLOYMENT APPROVAL GATE */}
        {activeTab === "gate" && (
          <div className="space-y-6">
            <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary">Multi-Stage Deployment Approval Gate</h3>
                  <p className="text-xs text-nexa-text-secondary">
                    Formal authorization checkpoint: prevents unauthorized field staff dispatch until approved by the Directorate.
                  </p>
                </div>
              </div>

              {pendingGateDeployments.length === 0 ? (
                <div className="p-8 text-center bg-nexa-surface/40 border border-dashed border-nexa-border rounded-xl space-y-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-nexa-text-primary">Directorate Gate Clear</h4>
                  <p className="text-xs text-nexa-text-secondary">
                    All client allocations have been verified and ratified by executive management.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-nexa-border/60">
                  {pendingGateDeployments.map((dep) => (
                    <div
                      key={dep.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-2"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-nexa-text-primary">{dep.personName}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                            Pending Directorate Ratification
                          </span>
                          <span className="text-xs text-nexa-text-secondary font-mono">
                            Requested by: {dep.requestedBy || "Operations Lead"}
                          </span>
                        </div>

                        <p className="text-xs text-nexa-text-primary flex items-center gap-2">
                          <strong>{dep.clientName}</strong>
                          <span className="text-nexa-text-secondary">·</span>
                          <span className="text-cyan-400">{dep.contractTitle}</span>
                        </p>

                        {dep.notes && (
                          <p className="text-xs text-nexa-text-secondary italic">
                            &quot;{dep.notes}&quot;
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs font-mono pt-1">
                          <span className="text-emerald-400">Billed: ₦{dep.billingRateMonthly.toLocaleString()} / mo</span>
                          <span className="text-nexa-text-secondary">Cost: ₦{dep.costRateMonthly.toLocaleString()} / mo</span>
                          <span className="text-emerald-300 font-bold">
                            Margin: +₦{(dep.billingRateMonthly - dep.costRateMonthly).toLocaleString()} / mo
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <NexaButton
                          size="sm"
                          variant="primary"
                          className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                          disabled={approvingId === dep.id}
                          onClick={() => handleApproveGate(dep.id)}
                        >
                          <UserCheck className="w-4 h-4" />
                          {approvingId === dep.id ? "Authorizing..." : "Authorize & Deploy"}
                        </NexaButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Deployments Table */}
            <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
              <h3 className="text-base font-bold text-nexa-text-primary">Ratified Active Client Engagements</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-nexa-surface/60 text-nexa-text-secondary uppercase text-[10px] tracking-wider border-b border-nexa-border">
                    <tr>
                      <th className="py-3 px-4">Specialist</th>
                      <th className="py-3 px-4">Client Account</th>
                      <th className="py-3 px-4">Contract Title</th>
                      <th className="py-3 px-4">Allocation</th>
                      <th className="py-3 px-4">Monthly Billed</th>
                      <th className="py-3 px-4">Labor Cost</th>
                      <th className="py-3 px-4 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nexa-border/60">
                    {activeDeployments.map((dep) => {
                      const margin = dep.billingRateMonthly - dep.costRateMonthly;
                      const marginPct = dep.billingRateMonthly > 0 ? Math.round((margin / dep.billingRateMonthly) * 100) : 0;
                      return (
                        <tr key={dep.id} className="hover:bg-nexa-surface/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-nexa-text-primary">{dep.personName}</div>
                            <div className="text-[11px] text-nexa-text-secondary">{dep.role}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-nexa-text-primary">{dep.clientName}</td>
                          <td className="py-3.5 px-4 text-nexa-text-secondary">{dep.contractTitle}</td>
                          <td className="py-3.5 px-4 font-mono">{dep.allocationPercent}% Full-Time</td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                            ₦{dep.billingRateMonthly.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-nexa-text-secondary">
                            ₦{dep.costRateMonthly.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                            +{marginPct}% (₦{margin.toLocaleString()})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CLIENT STAFFING REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-500" />
                    Client Staffing Requests (Outsourcing)
                  </h3>
                  <p className="text-xs text-nexa-text-secondary">
                    Incoming demand from B2B partners requiring certified and trained technical personnel.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workforceRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 bg-nexa-surface/70 rounded-xl border border-nexa-border hover:border-cyan-500/50 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-nexa-text-primary">{req.clientName}</span>
                      <NexaBadge
                        variant={req.status === "fulfilled" ? "primary" : "secondary"}
                        className="capitalize text-[10px]"
                      >
                        {req.status.replace(/_/g, " ")}
                      </NexaBadge>
                    </div>

                    <p className="text-xs font-medium text-cyan-300">{req.contractTitle}</p>

                    <div className="flex items-center justify-between text-xs py-2 border-y border-nexa-border/60">
                      <span className="text-nexa-text-secondary">Headcount:</span>
                      <span className="font-semibold text-nexa-text-primary">
                        {req.fulfilledHeadcount} / {req.requiredHeadcount} Deployed
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-nexa-text-secondary">Required Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {req.requiredSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-nexa-surface border border-nexa-border text-nexa-text-secondary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-nexa-text-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-nexa-text-secondary" /> {req.location}
                      </span>
                      <NexaButton
                        size="sm"
                        variant="secondary"
                        className="text-xs py-1 px-2.5 text-cyan-400 gap-1"
                        onClick={() => {
                          setDeployClient(req.clientName);
                          setDeployContract(req.contractTitle);
                          setIsDeployModalOpen(true);
                        }}
                      >
                        Match & Allocate &rarr;
                      </NexaButton>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* MODAL: DEPLOY PERSONNEL */}
        {isDeployModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Deploy Personnel to Client Contract</h3>
                <button
                  onClick={() => setIsDeployModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteDeployment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Select Candidate from Bench</label>
                  <select
                    value={deployPersonId}
                    onChange={(e) => setDeployPersonId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="">Select available bench personnel...</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role} · {p.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Client Organisation</label>
                  <input
                    type="text"
                    required
                    value={deployClient}
                    onChange={(e) => setDeployClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Contract / Scope of Work</label>
                  <input
                    type="text"
                    required
                    value={deployContract}
                    onChange={(e) => setDeployContract(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={deployStartDate}
                      onChange={(e) => setDeployStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={deployEndDate}
                      onChange={(e) => setDeployEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Monthly Billing Rate (₦)</label>
                    <input
                      type="number"
                      value={deployBilling}
                      onChange={(e) => setDeployBilling(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Monthly Cost Rate (₦)</label>
                    <input
                      type="number"
                      value={deployCost}
                      onChange={(e) => setDeployCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Work Location</label>
                  <input
                    type="text"
                    value={deployLocation}
                    onChange={(e) => setDeployLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="reqGate"
                    checked={deployRequiresGate}
                    onChange={(e) => setDeployRequiresGate(e.target.checked)}
                    className="accent-rose-500 rounded"
                  />
                  <label htmlFor="reqGate" className="text-nexa-text-primary font-medium cursor-pointer">
                    Submit to Directorate Gate for formal executive authorization
                  </label>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsDeployModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    {deployRequiresGate ? "Submit for Gate Approval" : "Confirm & Deploy"}
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
