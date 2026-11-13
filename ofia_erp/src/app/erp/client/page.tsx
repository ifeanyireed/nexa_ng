"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  FileCheck2,
  Star,
  Download,
  ExternalLink,
  ChevronRight,
  Headphones,
  UserCheck,
  Users,
  Send,
  Sparkles,
  Layers,
  ArrowUpRight,
  FileText,
  BadgeCheck,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { useWorkforceManager } from "@/lib/workforce-store";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { ServiceTicket } from "@/lib/workforce-types";

export default function RestrictedClientPortalPage() {
  const {
    clients,
    deployments,
    people,
    tickets,
    workLogs,
    deliverables,
    projects,
    csatReviews,
    clientSignWorkLog,
    submitCsatReview,
    logClientTicket,
  } = useWorkforceManager();

  // Active client selector (default to first available client)
  const defaultClientName = clients[0]?.clientName || "Prime Logistics Ltd";
  const [selectedClientName, setSelectedClientName] = useState<string>(defaultClientName);
  const [isLockedToClient, setIsLockedToClient] = useState(false);

  // Auto-bind to authenticated corporate stakeholder session
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("erp_current_user");
      const userRole = localStorage.getItem("nexa_user_role") || "";
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setStakeholderName(u.name + (u.designation ? ` (${u.designation})` : ""));
        if (u.email) setStakeholderEmail(u.email);

        const company = u.company || "";
        const effectiveRole = u.role || userRole;

        if (effectiveRole === "client" || company) {
          const matched = clients.find(
            (c) =>
              c.clientName.toLowerCase() === company.toLowerCase() ||
              company.toLowerCase().includes(c.clientName.toLowerCase()) ||
              c.clientName.toLowerCase().includes(company.toLowerCase())
          );
          if (matched) {
            setSelectedClientName(matched.clientName);
          } else if (company) {
            setSelectedClientName(company);
          }
          if (effectiveRole === "client") {
            setIsLockedToClient(true);
          }
        }
      } else if (userRole === "client") {
        setIsLockedToClient(true);
      }
    } catch {}
  }, [clients]);

  // Active portal tab
  const [activeTab, setActiveTab] = useState<"overview" | "tickets" | "timesheets" | "deliverables" | "csat">("overview");

  // Stakeholder representative details
  const [stakeholderName, setStakeholderName] = useState<string>("Babajide Coker (Operations Director)");
  const [stakeholderEmail, setStakeholderEmail] = useState<string>("b.coker@primelogistics.ng");

  // Ticket creation modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"P1" | "P2" | "P3">("P2");
  const [ticketSpecialist, setTicketSpecialist] = useState("");

  // CSAT modal
  const [isCsatModalOpen, setIsCsatModalOpen] = useState(false);
  const [csatMonth, setCsatMonth] = useState("2027-05");
  const [ratingTech, setRatingTech] = useState(5);
  const [ratingPunct, setRatingPunct] = useState(5);
  const [ratingSla, setRatingSla] = useState(5);
  const [csatFeedback, setCsatFeedback] = useState("");

  // Timesheet sign-off feedback toast state
  const [signedToast, setSignedToast] = useState<string | null>(null);

  // Active client object
  const activeClient = useMemo(() => {
    return (
      clients.find((c) => c.clientName.toLowerCase() === selectedClientName.toLowerCase()) || {
        id: "cli-default",
        clientName: selectedClientName,
        industry: "Enterprise Logistics & Fleet Ops",
        activeContractsCount: 1,
        deployedStaffCount: 2,
        monthlyContractValue: 2450000,
        slaTargetHours: 2,
        slaCompliancePercent: 99.4,
        accountManager: "Tunde Bakare",
        health: "excellent" as const,
      }
    );
  }, [clients, selectedClientName]);

  // Filtered resources for this client only (strict isolation)
  const clientDeployments = useMemo(() => {
    return deployments.filter(
      (d) => d.clientName.toLowerCase() === selectedClientName.toLowerCase()
    );
  }, [deployments, selectedClientName]);

  const clientSpecialists = useMemo(() => {
    const personIds = new Set(clientDeployments.map((d) => d.personId));
    return people.filter((p) => personIds.has(p.id));
  }, [people, clientDeployments]);

  const clientTickets = useMemo(() => {
    return tickets.filter(
      (t) => t.clientName.toLowerCase() === selectedClientName.toLowerCase()
    );
  }, [tickets, selectedClientName]);

  const clientWorkLogs = useMemo(() => {
    return workLogs.filter(
      (w) => w.clientName.toLowerCase() === selectedClientName.toLowerCase()
    );
  }, [workLogs, selectedClientName]);

  const clientProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        (p.clientName && p.clientName.toLowerCase() === selectedClientName.toLowerCase()) ||
        (p.clientId && p.clientId.toLowerCase() === activeClient.id.toLowerCase())
    );
  }, [projects, selectedClientName, activeClient]);

  const clientDeliverables = useMemo(() => {
    const projectIds = new Set(clientProjects.map((p) => p.id));
    return deliverables.filter((d) => projectIds.has(d.projectId));
  }, [deliverables, clientProjects]);

  const clientCsats = useMemo(() => {
    return csatReviews.filter(
      (r) => r.clientName.toLowerCase() === selectedClientName.toLowerCase()
    );
  }, [csatReviews, selectedClientName]);

  // Actions
  const handleSignOffTimesheet = (logId: string) => {
    clientSignWorkLog(logId, stakeholderName);
    setSignedToast("Timesheet approved & signed off successfully");
    setTimeout(() => setSignedToast(null), 4000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;

    logClientTicket({
      clientName: selectedClientName,
      subject: ticketSubject.trim(),
      priority: ticketPriority,
      assignedSpecialist: ticketSpecialist || clientSpecialists[0]?.name || "Triage Desk",
    });

    setTicketSubject("");
    setIsTicketModalOpen(false);
  };

  const handleSubmitCsat = (e: React.FormEvent) => {
    e.preventDefault();
    const overallScorePercent = Math.round(((ratingTech + ratingPunct + ratingSla) / 15) * 100);

    submitCsatReview({
      clientName: selectedClientName,
      stakeholderName,
      stakeholderEmail,
      month: csatMonth,
      ratingTechnical: ratingTech,
      ratingPunctuality: ratingPunct,
      ratingSla: ratingSla,
      overallScorePercent,
      feedbackText: csatFeedback,
    });

    setIsCsatModalOpen(false);
    setCsatFeedback("");
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col font-sans">
      {/* Top Restricted Client Navigation Banner */}
      <header className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]/95 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Restricted Client Portal
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono">
                  SLA Active
                </span>
              </div>
              <h1 className="text-base font-bold text-[var(--nexa-text-primary)] tracking-tight flex items-center gap-2">
                Ofia WorkforceOS
                <span className="text-[var(--nexa-text-secondary)]">·</span>
                <span className="text-[var(--nexa-text-primary)]">{selectedClientName}</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Corporate Account Scope / Switcher */}
            {isLockedToClient ? (
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-300">
                <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{selectedClientName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300 font-medium">
                  Dedicated Scope
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg px-3 py-1.5">
                <Building2 className="w-4 h-4 text-[var(--nexa-text-secondary)] shrink-0" />
                <label htmlFor="client-switch" className="text-xs text-[var(--nexa-text-secondary)] sr-only">
                  Active Client
                </label>
                <select
                  id="client-switch"
                  value={selectedClientName}
                  onChange={(e) => setSelectedClientName(e.target.value)}
                  aria-label="Active Client Account"
                  className="bg-transparent text-xs font-medium text-[var(--nexa-text-primary)] focus:outline-none cursor-pointer"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.clientName} className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-primary)]">
                      {c.clientName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stakeholder Identity */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-secondary)]">
              <BadgeCheck className="w-4 h-4 text-blue-500" />
              <span>{stakeholderName}</span>
            </div>

            {/* Link back to Workforce Admin for operators (hidden for client role) */}
            {!isLockedToClient && (
              <Link
                href="/erp/admin/workforce/service-delivery"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] px-3 py-1.5 rounded-lg border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] transition"
              >
                <span>Console</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Toast alert */}
        {signedToast && (
          <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-blue-500" />
              {signedToast}
            </div>
            <button onClick={() => setSignedToast(null)} className="text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)]">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Client Executive Header Banner */}
        <section className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-2xl p-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                  {activeClient.industry}
                </span>
                <span className="text-xs text-[var(--nexa-text-secondary)]">Account Lead: {activeClient.accountManager}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--nexa-text-primary)]">{selectedClientName}</h2>
              <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                Dedicated outsourcing & managed engineering operations. Monitor active specialists, real-time SLA compliance, sign off weekly work logs, and submit service delivery reviews.
              </p>
            </div>

            {/* Quick KPI Stat Widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto shrink-0">
              <div className="bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] p-3.5 rounded-xl text-center">
                <div className="text-xs text-[var(--nexa-text-secondary)] uppercase tracking-wider font-semibold">Specialists</div>
                <div className="text-xl font-bold text-[var(--nexa-text-primary)] mt-1">{clientSpecialists.length || activeClient.deployedStaffCount}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 font-medium">100% Deployed</div>
              </div>
              <div className="bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] p-3.5 rounded-xl text-center">
                <div className="text-xs text-[var(--nexa-text-secondary)] uppercase tracking-wider font-semibold">SLA Target</div>
                <div className="text-xl font-bold text-[var(--nexa-text-primary)] mt-1">{activeClient.slaTargetHours}h</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">{activeClient.slaCompliancePercent}% Compliance</div>
              </div>
              <div className="bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] p-3.5 rounded-xl text-center col-span-2 sm:col-span-1">
                <div className="text-xs text-[var(--nexa-text-secondary)] uppercase tracking-wider font-semibold">Open Tickets</div>
                <div className="text-xl font-bold text-[var(--nexa-text-primary)] mt-1">
                  {clientTickets.filter((t) => t.status === "open").length}
                </div>
                <div className="text-[10px] text-[var(--nexa-text-secondary)] mt-0.5">Active Queue</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold"
                : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Assigned Specialists ({clientSpecialists.length})
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "tickets"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold"
                : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            SLA Service Desk ({clientTickets.length})
          </button>
          <button
            onClick={() => setActiveTab("timesheets")}
            className={`px-4 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "timesheets"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold"
                : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Timesheets & Sign-Off ({clientWorkLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("deliverables")}
            className={`px-4 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "deliverables"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold"
                : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Deliverables & Reports ({clientDeliverables.length})
          </button>
          <button
            onClick={() => setActiveTab("csat")}
            className={`px-4 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "csat"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold"
                : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Quality CSAT ({clientCsats.length})
          </button>
        </div>

        {/* Tab 1: Overview & Assigned Specialists */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--nexa-text-primary)]">Dedicated Embedded Personnel</h3>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Pre-vetted engineering and operations specialists on active deployment to {selectedClientName}.
                </p>
              </div>
            </div>

            {clientSpecialists.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[var(--nexa-border)] rounded-2xl bg-[var(--nexa-bg-surface)] space-y-3">
                <Users className="w-10 h-10 text-[var(--nexa-text-secondary)] mx-auto opacity-40" />
                <div className="text-sm font-medium text-[var(--nexa-text-primary)]">No personnel currently deployed</div>
                <p className="text-xs text-[var(--nexa-text-secondary)] max-w-sm mx-auto">
                  Deployment allocations for {selectedClientName} are pending approval or in scheduling.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientSpecialists.map((person) => {
                  const alloc = clientDeployments.find((d) => d.personId === person.id);
                  return (
                    <div
                      key={person.id}
                      className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-blue-500/40 rounded-xl p-5 space-y-4 transition shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-sm text-blue-600 dark:text-blue-400">
                            {person.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--nexa-text-primary)]">{person.name}</h4>
                            <p className="text-xs text-[var(--nexa-text-secondary)]">{person.designation}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                          {alloc?.allocationPercent || 100}% Allocation
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-[var(--nexa-text-secondary)] border-t border-[var(--nexa-border)] pt-3">
                        <div className="flex justify-between">
                          <span className="opacity-70">Department:</span>
                          <span className="text-[var(--nexa-text-primary)] font-medium">{person.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Contract Role:</span>
                          <span className="text-[var(--nexa-text-primary)] font-medium">{alloc?.role || person.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Location:</span>
                          <span className="text-[var(--nexa-text-primary)] font-medium">{alloc?.location || person.location || "Lagos On-site"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-70">Active Since:</span>
                          <span className="text-[var(--nexa-text-primary)] font-medium">{alloc?.startDate || person.joinDate}</span>
                        </div>
                      </div>

                      {person.skills && person.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {person.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]"
                            >
                              {typeof skill === "string" ? skill : (skill as any).name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Service Desk & SLA Incident Tickets */}
        {activeTab === "tickets" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--nexa-text-primary)]">SLA Service Desk & Support Incidents</h3>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Target resolution window: {activeClient.slaTargetHours} hours. Escalate urgent issues directly to the assigned lead.
                </p>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Incident Ticket
              </button>
            </div>

            {clientTickets.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[var(--nexa-border)] rounded-2xl bg-[var(--nexa-bg-surface)] space-y-3">
                <Headphones className="w-10 h-10 text-[var(--nexa-text-secondary)] mx-auto opacity-40" />
                <div className="text-sm font-medium text-[var(--nexa-text-primary)]">No active incidents logged</div>
                <p className="text-xs text-[var(--nexa-text-secondary)] max-w-sm mx-auto">
                  All systems operating normally with zero SLA breaches recorded.
                </p>
              </div>
            ) : (
              <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border-b border-[var(--nexa-border)] uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Ticket</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Assigned Specialist</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">SLA Remaining</th>
                        <th className="py-3 px-4">Logged At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--nexa-border)]">
                      {clientTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition">
                          <td className="py-3 px-4 font-mono font-medium text-blue-600 dark:text-blue-400">{t.ticketNumber}</td>
                          <td className="py-3 px-4 font-medium text-[var(--nexa-text-primary)]">{t.subject}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                t.priority === "P1"
                                  ? "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
                                  : t.priority === "P2"
                                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                                  : "bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              {t.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[var(--nexa-text-secondary)]">{t.assignedSpecialist}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                t.status === "resolved"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-[var(--nexa-text-secondary)]">
                              <Clock className="w-3.5 h-3.5 text-[var(--nexa-text-secondary)]" />
                              <span>{t.slaMinutesRemaining} mins</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[var(--nexa-text-secondary)]">{t.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Daily Timesheets & Corporate Sign-Off */}
        {activeTab === "timesheets" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-[var(--nexa-text-primary)]">Daily Timesheets & Corporate Sign-Off</h3>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Review logged hours and deliverables submitted by deployed staff. Sign off to confirm completion for monthly billing.
                </p>
              </div>
            </div>

            {clientWorkLogs.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[var(--nexa-border)] rounded-2xl bg-[var(--nexa-bg-surface)] space-y-3">
                <FileCheck2 className="w-10 h-10 text-[var(--nexa-text-secondary)] mx-auto opacity-40" />
                <div className="text-sm font-medium text-[var(--nexa-text-primary)]">No timesheets logged for {selectedClientName}</div>
                <p className="text-xs text-[var(--nexa-text-secondary)] max-w-sm mx-auto">
                  Assigned staff will submit daily activity summaries here for verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientWorkLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-[var(--nexa-text-primary)]">{log.personName}</span>
                        <span className="text-[var(--nexa-text-secondary)]">•</span>
                        <span className="text-[var(--nexa-text-secondary)] font-mono">{log.date}</span>
                        <span className="text-[var(--nexa-text-secondary)]">•</span>
                        <span className="px-2 py-0.5 rounded bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] font-mono text-[11px]">
                          {log.hoursWorked} hrs
                        </span>
                        {log.supervisorSignedOff && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                            <Check className="w-3 h-3" />
                            Internal Supervisor Approved
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">{log.summary}</p>
                      {log.clientSignedOff && (
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1.5 pt-1">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>
                            Corporate Sign-off: {log.clientSignedBy || "Client Representative"} (
                            {log.clientSignedAt ? new Date(log.clientSignedAt).toLocaleDateString() : "Verified"}
                            )
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 w-full md:w-auto flex items-center justify-end">
                      {log.clientSignedOff ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Approved & Signed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSignOffTimesheet(log.id)}
                          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-xs"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Sign Off Timesheet</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Project Deliverables & Reports */}
        {activeTab === "deliverables" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--nexa-text-primary)]">Project Deliverables & Artifacts</h3>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Engineering documentation, technical architectures, and monthly milestone audit files.
                </p>
              </div>
            </div>

            {clientDeliverables.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[var(--nexa-border)] rounded-2xl bg-[var(--nexa-bg-surface)] space-y-3">
                <FileText className="w-10 h-10 text-[var(--nexa-text-secondary)] mx-auto opacity-40" />
                <div className="text-sm font-medium text-[var(--nexa-text-primary)]">No deliverables uploaded for active projects</div>
                <p className="text-xs text-[var(--nexa-text-secondary)] max-w-sm mx-auto">
                  As engineers reach sprint milestones, deliverables will appear here for client review and acceptance.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientDeliverables.map((deliv) => (
                  <div
                    key={deliv.id}
                    className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl p-5 space-y-3 hover:border-blue-500/40 transition shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">{deliv.projectTitle || "Active Initiative"}</div>
                        <h4 className="text-sm font-semibold text-[var(--nexa-text-primary)]">{deliv.title}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          deliv.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {deliv.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--nexa-text-secondary)] space-y-1">
                      <div>Submitted by: <span className="text-[var(--nexa-text-primary)] font-medium">{deliv.submittedByName}</span></div>
                      <div>Date: <span className="text-[var(--nexa-text-primary)] font-mono">{deliv.submittedAt}</span></div>
                      <div>File: <span className="text-[var(--nexa-text-primary)] font-mono">{deliv.fileType} (v{deliv.version})</span></div>
                    </div>

                    {deliv.reviewFeedback && (
                      <div className="p-2.5 rounded bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-secondary)] italic">
                        &quot;{deliv.reviewFeedback}&quot;
                      </div>
                    )}

                    <div className="pt-2 border-t border-[var(--nexa-border)] flex items-center justify-between">
                      <a
                        href={deliv.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Artifact</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Quality CSAT & Monthly Feedback */}
        {activeTab === "csat" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--nexa-text-primary)]">Client Satisfaction (CSAT) & Quality Audits</h3>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Rate technical competence, team communication, and SLA adherence across monthly outsourcing cycles.
                </p>
              </div>
              <button
                onClick={() => setIsCsatModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit Monthly CSAT Review
              </button>
            </div>

            {clientCsats.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[var(--nexa-border)] rounded-2xl bg-[var(--nexa-bg-surface)] space-y-3">
                <Star className="w-10 h-10 text-[var(--nexa-text-secondary)] mx-auto opacity-40" />
                <div className="text-sm font-medium text-[var(--nexa-text-primary)]">No CSAT reviews recorded yet</div>
                <p className="text-xs text-[var(--nexa-text-secondary)] max-w-sm mx-auto">
                  Submit monthly stakeholder feedback to align service quality and drive continuous engineering improvements.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientCsats.map((review) => (
                  <div
                    key={review.id}
                    className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">Cycle: {review.month}</div>
                        <h4 className="text-sm font-semibold text-[var(--nexa-text-primary)]">{review.stakeholderName}</h4>
                        <div className="text-xs text-[var(--nexa-text-secondary)]">{review.stakeholderEmail}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{review.overallScorePercent}%</div>
                        <div className="text-[10px] text-[var(--nexa-text-secondary)] uppercase tracking-wider">Quality Index</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[var(--nexa-bg-base)] rounded-lg border border-[var(--nexa-border)]">
                      <div>
                        <div className="text-[10px] text-[var(--nexa-text-secondary)]">Technical</div>
                        <div className="text-sm font-bold text-[var(--nexa-text-primary)] mt-0.5">{review.ratingTechnical} / 5</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--nexa-text-secondary)]">Punctuality</div>
                        <div className="text-sm font-bold text-[var(--nexa-text-primary)] mt-0.5">{review.ratingPunctuality} / 5</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--nexa-text-secondary)]">SLA Adherence</div>
                        <div className="text-sm font-bold text-[var(--nexa-text-primary)] mt-0.5">{review.ratingSla} / 5</div>
                      </div>
                    </div>

                    {review.feedbackText && (
                      <p className="text-xs text-[var(--nexa-text-secondary)] italic bg-[var(--nexa-bg-base)] p-3 rounded-lg border border-[var(--nexa-border)] leading-relaxed">
                        &quot;{review.feedbackText}&quot;
                      </p>
                    )}

                    <div className="text-[10px] text-[var(--nexa-text-secondary)] text-right font-mono opacity-80">
                      Recorded: {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Log Incident Ticket */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Headphones className="w-5 h-5 text-blue-500" />
                Log Incident or Service Request
              </h3>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--nexa-text-secondary)] font-medium mb-1">Client Organization</label>
                <input
                  type="text"
                  value={selectedClientName}
                  disabled
                  className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg px-3 py-2 text-[var(--nexa-text-secondary)] cursor-not-allowed opacity-80"
                />
              </div>

              <div>
                <label className="block text-[var(--nexa-text-primary)] font-medium mb-1">Issue / Request Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Courier WebSocket ping timeouts on mainland cluster"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg px-3 py-2 text-[var(--nexa-text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--nexa-text-primary)] font-medium mb-1">Priority Level</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg px-3 py-2 text-[var(--nexa-text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="P1">Critical P1 (1h SLA)</option>
                    <option value="P2">High P2 (2h SLA)</option>
                    <option value="P3">Standard P3 (4h SLA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--nexa-text-primary)] font-medium mb-1">Assigned Specialist</label>
                  <select
                    value={ticketSpecialist}
                    onChange={(e) => setTicketSpecialist(e.target.value)}
                    className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg px-3 py-2 text-[var(--nexa-text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Auto-Triage Desk</option>
                    {clientSpecialists.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs transition-colors"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Monthly CSAT Review */}
      {isCsatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
              <h3 className="text-base font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Submit Monthly Quality CSAT Review
              </h3>
              <button
                onClick={() => setIsCsatModalOpen(false)}
                className="text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCsat} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--nexa-text-primary)] font-medium mb-1">Stakeholder Name</label>
                  <input
                    type="text"
                    required
                    value={stakeholderName}
                    onChange={(e) => setStakeholderName(e.target.value)}
                    className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg px-3 py-2 text-[var(--nexa-text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[var(--nexa-text-primary)] font-medium mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={stakeholderEmail}
                    onChange={(e) => setStakeholderEmail(e.target.value)}
                    className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg px-3 py-2 text-[var(--nexa-text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--nexa-text-primary)] font-medium mb-1">Evaluation Cycle Month</label>
                <input
                  type="month"
                  value={csatMonth}
                  onChange={(e) => setCsatMonth(e.target.value)}
                  className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg px-3 py-2 text-[var(--nexa-text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Rating 1: Technical Competence */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-primary)] font-medium">Technical Competence & Execution:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{ratingTech} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={ratingTech}
                  onChange={(e) => setRatingTech(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Rating 2: Punctuality */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-primary)] font-medium">Punctuality & Communication:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{ratingPunct} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={ratingPunct}
                  onChange={(e) => setRatingPunct(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Rating 3: SLA */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--nexa-text-primary)] font-medium">SLA Resolution & Incident Speed:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{ratingSla} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={ratingSla}
                  onChange={(e) => setRatingSla(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Computed Score */}
              <div className="p-3 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
                <span className="text-[var(--nexa-text-secondary)]">Computed Overall Quality Score:</span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(((ratingTech + ratingPunct + ratingSla) / 15) * 100)}%
                </span>
              </div>

              <div>
                <label className="block text-[var(--nexa-text-primary)] font-medium mb-1">Qualitative Feedback & Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Commendations, specific areas of focus, or commendations for deployed personnel..."
                  value={csatFeedback}
                  onChange={(e) => setCsatFeedback(e.target.value)}
                  className="w-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg px-3 py-2 text-[var(--nexa-text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCsatModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] border border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-base)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs transition-colors"
                >
                  Submit CSAT Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
