"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  Network,
  RotateCcw,
  Sliders,
  X,
  MapPin,
  Briefcase,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { DeploymentAllocation, WorkforceGanttItem } from "@/lib/workforce-types";

const MONTHS_2027 = [
  { key: "2027-01", label: "Jan 2027", quarter: "Q1" },
  { key: "2027-02", label: "Feb 2027", quarter: "Q1" },
  { key: "2027-03", label: "Mar 2027", quarter: "Q1" },
  { key: "2027-04", label: "Apr 2027", quarter: "Q2" },
  { key: "2027-05", label: "May 2027", quarter: "Q2" },
  { key: "2027-06", label: "Jun 2027", quarter: "Q2" },
  { key: "2027-07", label: "Jul 2027", quarter: "Q3" },
  { key: "2027-08", label: "Aug 2027", quarter: "Q3" },
  { key: "2027-09", label: "Sep 2027", quarter: "Q3" },
  { key: "2027-10", label: "Oct 2027", quarter: "Q4" },
  { key: "2027-11", label: "Nov 2027", quarter: "Q4" },
  { key: "2027-12", label: "Dec 2027", quarter: "Q4" },
];

export default function WorkforceGanttCalendarPage() {
  const {
    ganttItems,
    deployments,
    people,
    deployPerson,
    rollOffDeployment,
  } = useWorkforceManager();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeQuarter, setActiveQuarter] = useState<string>("all");
  const [selectedAlloc, setSelectedAlloc] = useState<DeploymentAllocation | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [rollingOffId, setRollingOffId] = useState<string | null>(null);

  // Deploy allocation form state
  const [deployPersonId, setDeployPersonId] = useState("");
  const [deployClient, setDeployClient] = useState("Prime Logistics Ltd");
  const [deployContract, setDeployContract] = useState("Warehouse Tech Support");
  const [deployBilling, setDeployBilling] = useState(600000);
  const [deployCost, setDeployCost] = useState(250000);
  const [deployPercent, setDeployPercent] = useState(100);
  const [deployStartDate, setDeployStartDate] = useState("2027-05-01");
  const [deployEndDate, setDeployEndDate] = useState("2027-10-31");

  const visibleMonths = useMemo(() => {
    if (activeQuarter === "all") return MONTHS_2027;
    return MONTHS_2027.filter((m) => m.quarter === activeQuarter);
  }, [activeQuarter]);

  const filteredItems = useMemo(() => {
    return ganttItems.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === "all" || item.department.toLowerCase() === selectedDept.toLowerCase();
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [ganttItems, searchQuery, selectedDept, selectedStatus]);

  // Helper to calculate bar positioning percentage across visible months
  const getBarCoordinates = (startDateStr: string, endDateStr: string) => {
    const minMonthIdx = 0;
    const maxMonthIdx = visibleMonths.length - 1;

    // Get month index for start
    const startYearMonth = startDateStr.slice(0, 7);
    const endYearMonth = endDateStr.slice(0, 7);

    let startIdx = visibleMonths.findIndex((m) => m.key === startYearMonth);
    let endIdx = visibleMonths.findIndex((m) => m.key === endYearMonth);

    if (startIdx === -1 && endIdx === -1) {
      if (startDateStr < visibleMonths[0].key && endDateStr > visibleMonths[maxMonthIdx].key) {
        startIdx = 0;
        endIdx = maxMonthIdx;
      } else {
        return null;
      }
    } else {
      if (startIdx === -1) startIdx = 0;
      if (endIdx === -1) endIdx = maxMonthIdx;
    }

    const totalCols = visibleMonths.length;
    const leftPercent = (startIdx / totalCols) * 100;
    const widthPercent = Math.max(12, ((endIdx - startIdx + 1) / totalCols) * 100);

    return { leftPercent, widthPercent };
  };

  const handleRollOff = async (depId: string) => {
    setRollingOffId(depId);
    try {
      await rollOffDeployment(depId, "Staff rolled off via Gantt Timeline Console");
      setSelectedAlloc(null);
    } finally {
      setRollingOffId(null);
    }
  };

  const handleExecuteDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    const person = people.find((p) => p.id === deployPersonId);
    if (!person) return;

    deployPerson({
      id: `dep-${Date.now()}`,
      personId: person.id,
      personName: person.name,
      role: person.designation,
      clientName: deployClient,
      contractTitle: deployContract,
      startDate: deployStartDate,
      endDate: deployEndDate,
      allocationPercent: deployPercent,
      status: "active",
      billingRateMonthly: deployBilling,
      costRateMonthly: deployCost,
      requestedBy: "Gantt Timeline Planner",
    });

    setIsDeployModalOpen(false);
  };

  return (
    <ErpAdminShell
      title="Gantt Availability Calendar & Capacity Matrix"
      subtitle="Interactive multi-period operational scheduler · Track field allocations, roll-off countdowns, and bench availability."
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/admin/workforce/deployment">
            <NexaButton size="sm" variant="secondary" className="gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Overview
            </NexaButton>
          </Link>
          <NexaButton
            size="sm"
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsDeployModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Deploy Specialist
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* FILTER & QUARTER CONTROL BAR */}
        <div className="p-4 bg-nexa-surface border border-nexa-border rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-nexa-text-secondary" />
              <input
                type="text"
                placeholder="Search specialist name or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
              />
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-xs text-nexa-text-primary focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Technology">Technology</option>
              <option value="Operations">Operations</option>
              <option value="Human Resources">Human Resources</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-nexa-surface border border-nexa-border text-xs text-nexa-text-primary focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="deployed">Deployed</option>
              <option value="bench">Bench Ready</option>
            </select>
          </div>

          {/* Quarter switchers */}
          <div className="flex items-center gap-1 bg-nexa-surface/80 p-1 rounded-lg border border-nexa-border text-xs">
            {["all", "Q1", "Q2", "Q3", "Q4"].map((q) => (
              <button
                key={q}
                onClick={() => setActiveQuarter(q)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors uppercase ${
                  activeQuarter === q
                    ? "bg-rose-500 text-white"
                    : "text-nexa-text-secondary hover:text-nexa-text-primary"
                }`}
              >
                {q === "all" ? "Full Year 2027" : q}
              </button>
            ))}
          </div>
        </div>

        {/* GANTT TIMELINE MATRIX */}
        <div className="bg-nexa-surface border border-nexa-border rounded-xl overflow-hidden shadow-sm">
          {/* Timeline Header */}
          <div className="grid grid-cols-12 bg-nexa-surface/80 border-b border-nexa-border text-xs">
            <div className="col-span-4 p-3 font-bold text-nexa-text-primary uppercase tracking-wider text-[11px] border-r border-nexa-border flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-400" />
              Specialist & Department
            </div>
            <div className="col-span-8 grid" style={{ gridTemplateColumns: `repeat(${visibleMonths.length}, minmax(0, 1fr))` }}>
              {visibleMonths.map((m) => (
                <div
                  key={m.key}
                  className="p-3 text-center border-r border-nexa-border/60 text-xs font-mono font-semibold text-nexa-text-secondary last:border-r-0"
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="divide-y divide-nexa-border/60">
            {filteredItems.map((item) => (
              <div key={item.personId} className="grid grid-cols-12 hover:bg-nexa-surface/40 transition-colors">
                {/* Person info */}
                <div className="col-span-4 p-3.5 border-r border-nexa-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-nexa-text-primary">{item.personName}</span>
                    <NexaBadge
                      variant={item.status === "deployed" ? "primary" : "secondary"}
                      className="text-[9px] uppercase font-mono py-0"
                    >
                      {item.status}
                    </NexaBadge>
                  </div>
                  <div className="text-[11px] text-nexa-text-secondary flex items-center justify-between">
                    <span>{item.designation}</span>
                    <span className="text-nexa-text-primary font-medium">{item.department}</span>
                  </div>
                  {item.upcomingRollOffDays != null && (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> Roll-off in {item.upcomingRollOffDays} days
                    </span>
                  )}
                </div>

                {/* Timeline Grid Cell */}
                <div
                  className="col-span-8 relative py-3.5 px-1 flex items-center"
                  style={{ gridTemplateColumns: `repeat(${visibleMonths.length}, minmax(0, 1fr))` }}
                >
                  {/* Background grid vertical lines */}
                  <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${visibleMonths.length}, minmax(0, 1fr))` }}>
                    {visibleMonths.map((m) => (
                      <div key={m.key} className="border-r border-nexa-border/30 h-full last:border-r-0" />
                    ))}
                  </div>

                  {/* Allocations Bars */}
                  {item.allocations.map((alloc) => {
                    const coords = getBarCoordinates(alloc.startDate, alloc.endDate);
                    if (!coords) return null;

                    const isEndingSoon = alloc.status === "ending_soon";
                    const isPending = alloc.status === "pending_approval";

                    const fullAllocRecord = deployments.find((d) => d.id === alloc.id);

                    return (
                      <div
                        key={alloc.id}
                        onClick={() => setSelectedAlloc(fullAllocRecord || null)}
                        style={{
                          left: `${coords.leftPercent}%`,
                          width: `${coords.widthPercent}%`,
                        }}
                        className={`absolute h-8 rounded-lg px-2.5 flex items-center justify-between shadow-md cursor-pointer transition-all hover:scale-[1.01] hover:brightness-110 z-10 text-xs font-semibold ${
                          isPending
                            ? "bg-purple-600/90 text-white border border-purple-400"
                            : isEndingSoon
                            ? "bg-amber-600/90 text-white border border-amber-400"
                            : "bg-emerald-600/90 text-white border border-emerald-400"
                        }`}
                      >
                        <span className="truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3 shrink-0" />
                          {alloc.clientName}
                        </span>
                        <span className="text-[10px] font-mono opacity-90 hidden sm:inline">
                          {alloc.allocationPercent}%
                        </span>
                      </div>
                    );
                  })}

                  {item.allocations.length === 0 && (
                    <div className="w-full text-center text-[11px] text-nexa-text-secondary/60 italic font-mono">
                      Bench Availability · Ready for allocation
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-xs text-nexa-text-secondary">
                No specialists found matching your search or filters.
              </div>
            )}
          </div>
        </div>

        {/* ALLOCATION DETAILS MODAL */}
        {selectedAlloc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary">{selectedAlloc.personName}</h3>
                  <span className="text-xs text-cyan-400 font-semibold">{selectedAlloc.clientName}</span>
                </div>
                <button
                  onClick={() => setSelectedAlloc(null)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-nexa-surface/80 border border-nexa-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-nexa-text-secondary">Contract Scope:</span>
                    <strong className="text-nexa-text-primary">{selectedAlloc.contractTitle}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-nexa-text-secondary">Contract Duration:</span>
                    <span className="font-mono text-nexa-text-primary">
                      {selectedAlloc.startDate} → {selectedAlloc.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-nexa-text-secondary">Allocation Quota:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedAlloc.allocationPercent}% Full-Time</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 bg-nexa-surface/60 border border-nexa-border rounded-xl">
                    <span className="text-[10px] uppercase text-nexa-text-secondary block">Monthly Billed</span>
                    <strong className="text-emerald-400 text-sm">₦{selectedAlloc.billingRateMonthly.toLocaleString()}</strong>
                  </div>
                  <div className="p-3 bg-nexa-surface/60 border border-nexa-border rounded-xl">
                    <span className="text-[10px] uppercase text-nexa-text-secondary block">Labor Cost</span>
                    <strong className="text-nexa-text-secondary text-sm">₦{selectedAlloc.costRateMonthly.toLocaleString()}</strong>
                  </div>
                </div>

                {selectedAlloc.location && (
                  <p className="text-xs text-nexa-text-secondary flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {selectedAlloc.location}
                  </p>
                )}

                {selectedAlloc.notes && (
                  <p className="text-xs text-nexa-text-secondary italic">
                    &quot;{selectedAlloc.notes}&quot;
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-nexa-border flex items-center justify-between">
                <NexaButton
                  size="sm"
                  variant="secondary"
                  className="text-xs text-rose-400 hover:text-rose-300 gap-1"
                  disabled={rollingOffId === selectedAlloc.id}
                  onClick={() => handleRollOff(selectedAlloc.id)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {rollingOffId === selectedAlloc.id ? "Rolling off..." : "Roll Off to Bench"}
                </NexaButton>

                <NexaButton
                  size="sm"
                  variant="primary"
                  className="text-xs"
                  onClick={() => setSelectedAlloc(null)}
                >
                  Done
                </NexaButton>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DEPLOY SPECIALIST */}
        {isDeployModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Deploy Specialist to Client</h3>
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
                    Allocate to Client
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
