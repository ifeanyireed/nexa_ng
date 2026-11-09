"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Headphones,
  Building2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  X,
  Radio,
  FileCheck2,
  ExternalLink,
  UserPlus,
  Mail,
  Send,
  Check,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { ServiceTicket, DailyWorkLog, ClientServiceAccount } from "@/lib/workforce-types";

export default function ServiceDeliveryManagementPage() {
  const {
    clients,
    tickets,
    workLogs,
    addTicket,
    resolveTicket,
    addClientAccount,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"clients" | "tickets" | "logs">("clients");
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketClient, setTicketClient] = useState("First Zenith Financial");
  const [ticketSpecialist, setTicketSpecialist] = useState("Zainab Al-Hassan");
  const [ticketPriority, setTicketPriority] = useState<ServiceTicket["priority"]>("P1");

  // Client provisioning modal state
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("Enterprise Logistics & Fleet Ops");
  const [slaTargetHours, setSlaTargetHours] = useState<number>(2);
  const [monthlyContractValue, setMonthlyContractValue] = useState<number>(2500000);
  const [accountManager, setAccountManager] = useState("Tunde Bakare");
  const [stakeholderName, setStakeholderName] = useState("");
  const [stakeholderEmail, setStakeholderEmail] = useState("");
  const [stakeholderDesig, setStakeholderDesig] = useState("Operations Director");
  const [sendActivationEmail, setSendActivationEmail] = useState(true);
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);
  const [provisionToast, setProvisionToast] = useState<string | null>(null);

  const handleProvisionClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setIsSubmittingClient(true);
    try {
      const newClient: ClientServiceAccount = {
        id: `cli-${Date.now()}`,
        clientName: clientName.trim(),
        industry,
        activeContractsCount: 1,
        deployedStaffCount: 0,
        monthlyContractValue: Number(monthlyContractValue) || 2500000,
        slaTargetHours: Number(slaTargetHours) || 2,
        slaCompliancePercent: 100,
        accountManager,
        health: "healthy",
      };

      const primaryStakeholder = stakeholderEmail.trim()
        ? {
            name: stakeholderName.trim() || `${clientName.trim()} Stakeholder`,
            email: stakeholderEmail.trim().toLowerCase(),
            designation: stakeholderDesig.trim() || "Operations Director",
          }
        : undefined;

      await addClientAccount(newClient, primaryStakeholder);
      setIsNewClientModalOpen(false);
      setProvisionToast(
        `Corporate account "${clientName.trim()}" successfully provisioned${
          primaryStakeholder ? ` and activation credentials dispatched to ${primaryStakeholder.email}` : ""
        }!`
      );
      setTimeout(() => setProvisionToast(null), 6000);

      // Reset form
      setClientName("");
      setStakeholderName("");
      setStakeholderEmail("");
    } catch (err) {
      console.error("Failed to provision client:", err);
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject) return;

    const tkt: ServiceTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: ticketClient,
      subject: ticketSubject,
      priority: ticketPriority,
      assignedSpecialist: ticketSpecialist,
      status: "open",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      slaMinutesRemaining: ticketPriority === "P1" ? 60 : 240,
    };

    addTicket(tkt);
    setIsNewTicketModalOpen(false);
    setTicketSubject("");
  };

  return (
    <ErpAdminShell
      title="Service Delivery Management"
      subtitle="Module 08 · Client service accounts, SLA tracking, outsourced incident tickets, and verified work logs."
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2.5">
          <Link href="/erp/client">
            <NexaButton
              size="sm"
              variant="secondary"
              className="gap-2 text-xs"
            >
              <ExternalLink className="w-4 h-4" />
              Restricted Client Portal
            </NexaButton>
          </Link>
          <NexaButton
            size="sm"
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => setIsNewTicketModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Log Service Ticket
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsNewClientModalOpen(true)}
          >
            <UserPlus className="w-4 h-4" />
            Provision Client Account
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {provisionToast && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{provisionToast}</span>
            </div>
            <button
              onClick={() => setProvisionToast(null)}
              className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TOP SERVICE DELIVERY METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active Client Accounts</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{clients.length} Accounts</p>
            <p className="text-xs text-nexa-text-secondary mt-1">Banking, Education & Logistics</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Overall SLA Compliance</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">98.2%</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> High tier operational health
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active Service Tickets</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {tickets.filter((t) => t.status !== "resolved").length} Open
            </p>
            <p className="text-xs text-amber-400 mt-1 font-medium">1 P1 Incident in progress</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Monthly Retainer Value</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              ₦{(clients.reduce((sum, c) => sum + c.monthlyContractValue, 0)).toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400 mt-1">Across managed service contracts</p>
          </div>
        </section>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-nexa-border gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("clients")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "clients"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Client Accounts & Scope ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "tickets"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Headphones className="w-4 h-4" />
            SLA Tickets & Escalations ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "logs"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <FileText className="w-4 h-4" />
            Daily Signed Work Logs ({workLogs.length})
          </button>
        </div>

        {/* TAB 1: CLIENT ACCOUNTS */}
        {activeTab === "clients" && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {clients.map((c) => (
              <div
                key={c.id}
                className="p-6 bg-nexa-surface rounded-xl border border-nexa-border hover:border-teal-500/50 transition-all space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-nexa-text-primary">{c.clientName}</h3>
                    <p className="text-xs text-nexa-text-secondary">{c.industry}</p>
                  </div>
                  <NexaBadge
                    variant={c.health === "healthy" ? "primary" : "secondary"}
                    className="capitalize text-[10px]"
                  >
                    {c.health}
                  </NexaBadge>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-nexa-border/60 text-xs">
                  <div>
                    <span className="text-nexa-text-secondary text-[10px] block">Contract Retainer</span>
                    <span className="font-semibold text-emerald-400">₦{c.monthlyContractValue.toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary text-[10px] block">Deployed Staff</span>
                    <span className="font-semibold text-nexa-text-primary">{c.deployedStaffCount} Specialists</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary text-[10px] block">SLA Response</span>
                    <span className="font-semibold text-nexa-text-primary">&lt; {c.slaTargetHours} Hours</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary text-[10px] block">Compliance</span>
                    <span className="font-semibold text-emerald-400">{c.slaCompliancePercent}%</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-nexa-text-secondary">
                  <span>Manager: <strong className="text-nexa-text-primary">{c.accountManager}</strong></span>
                  <Link href="/erp/admin/workforce/deployment" className="text-teal-400 font-semibold hover:underline">
                    View Staff &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* TAB 2: SERVICE TICKETS */}
        {activeTab === "tickets" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Live Outsource Service Tickets</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Operational cases handled by deployed technicians and customer success associates.
                </p>
              </div>
            </div>

            <div className="divide-y divide-nexa-border/60">
              {tickets.map((t) => (
                <div key={t.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-nexa-text-secondary">{t.ticketNumber}</span>
                      <NexaBadge
                        variant={t.priority === "P1" ? "primary" : "secondary"}
                        className="text-[9px] uppercase font-mono py-0"
                      >
                        {t.priority}
                      </NexaBadge>
                      <h4 className="text-sm font-semibold text-nexa-text-primary">{t.subject}</h4>
                    </div>
                    <p className="text-xs text-nexa-text-secondary">
                      Client: <strong className="text-nexa-text-primary">{t.clientName}</strong> · Specialist:{" "}
                      <strong className="text-nexa-text-primary">{t.assignedSpecialist}</strong>
                    </p>
                    <p className="text-[11px] text-nexa-text-secondary font-mono">
                      Logged at: {t.createdAt} · SLA remaining: {t.slaMinutesRemaining} mins
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {t.status !== "resolved" ? (
                      <NexaButton
                        size="sm"
                        variant="primary"
                        className="text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-500 gap-1"
                        onClick={() => resolveTicket(t.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Ticket
                      </NexaButton>
                    ) : (
                      <NexaBadge variant="secondary" className="capitalize text-emerald-400">
                        Resolved
                      </NexaBadge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: WORK LOGS */}
        {activeTab === "logs" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Supervisor Signed Work Logs</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Audited daily logs verifying deployed personnel deliverable delivery.
                </p>
              </div>
            </div>

            <div className="divide-y divide-nexa-border/60">
              {workLogs.map((log) => (
                <div key={log.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-nexa-text-primary">{log.personName}</span>
                      <NexaBadge variant="secondary" className="text-[10px]">
                        {log.clientName}
                      </NexaBadge>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {log.hoursWorked} Hours Logged
                    </span>
                  </div>
                  <p className="text-xs text-nexa-text-secondary italic">
                    &ldquo;{log.summary}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-nexa-text-secondary">
                    <span>Date: {log.date}</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified by Supervisor
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LOG SERVICE TICKET MODAL */}
        {isNewTicketModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Log Service Incident Ticket</h3>
                <button
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Client Account</label>
                  <select
                    value={ticketClient}
                    onChange={(e) => setTicketClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.clientName}>
                        {c.clientName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Incident Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Primary network switch failover anomaly"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Priority SLA</label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="P1">P1 - Critical (1 Hr SLA)</option>
                      <option value="P2">P2 - Major (4 Hr SLA)</option>
                      <option value="P3">P3 - Minor (24 Hr SLA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Assigned Specialist</label>
                    <input
                      type="text"
                      value={ticketSpecialist}
                      onChange={(e) => setTicketSpecialist(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsNewTicketModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Create Incident Ticket
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PROVISION CLIENT ACCOUNT & STAKEHOLDER MODAL */}
        {isNewClientModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-nexa-card border border-nexa-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-nexa-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-nexa-text-primary">
                      Provision Client Account & Stakeholder Login
                    </h3>
                    <p className="text-xs text-nexa-text-secondary mt-0.5">
                      Register B2B service contract, define SLA commitments, and issue restricted portal access.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-nexa-surface text-nexa-text-secondary transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleProvisionClient} className="space-y-4 text-xs">
                {/* SECTION 1: CLIENT ENTITY */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-nexa-text-secondary flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    Corporate Entity & Contract SLA
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Company / Organization Name *</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Zenith Horizon Logistics"
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Industry Vertical</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      >
                        <option value="Enterprise Logistics & Fleet Ops">Enterprise Logistics & Fleet Ops</option>
                        <option value="Banking, FinTech & Payment Rails">Banking, FinTech & Payment Rails</option>
                        <option value="Oil & Gas / Energy Infrastructure">Oil & Gas / Energy Infrastructure</option>
                        <option value="Telecommunications & Cloud ISP">Telecommunications & Cloud ISP</option>
                        <option value="Healthcare & Diagnostic Services">Healthcare & Diagnostic Services</option>
                        <option value="Omnichannel Retail & FMCG">Omnichannel Retail & FMCG</option>
                        <option value="Public Sector & Institutions">Public Sector & Institutions</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">SLA Target (Hours)</label>
                      <select
                        value={slaTargetHours}
                        onChange={(e) => setSlaTargetHours(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      >
                        <option value={1}>1 Hour (P1 Critical)</option>
                        <option value={2}>2 Hours (Tier-1 Enterprise)</option>
                        <option value={4}>4 Hours (Standard SLA)</option>
                        <option value={8}>8 Hours (Business Day)</option>
                        <option value={24}>24 Hours (Next Day)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Monthly Contract (NGN)</label>
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        value={monthlyContractValue}
                        onChange={(e) => setMonthlyContractValue(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Account Manager</label>
                      <input
                        type="text"
                        value={accountManager}
                        onChange={(e) => setAccountManager(e.target.value)}
                        placeholder="Internal Lead"
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PRIMARY STAKEHOLDER / LOGIN */}
                <div className="space-y-3 pt-3 border-t border-nexa-border">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-nexa-text-secondary flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    Primary Client Stakeholder (Portal Login Access)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Stakeholder Full Name</label>
                      <input
                        type="text"
                        value={stakeholderName}
                        onChange={(e) => setStakeholderName(e.target.value)}
                        placeholder="e.g. Babajide Coker"
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Corporate Email Address *</label>
                      <input
                        type="email"
                        required
                        value={stakeholderEmail}
                        onChange={(e) => setStakeholderEmail(e.target.value)}
                        placeholder="e.g. b.coker@company.ng"
                        className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Corporate Designation / Role</label>
                    <input
                      type="text"
                      value={stakeholderDesig}
                      onChange={(e) => setStakeholderDesig(e.target.value)}
                      placeholder="e.g. Operations Director / Head of Infrastructure"
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-slate-300">
                    <input
                      type="checkbox"
                      id="sendActivation"
                      checked={sendActivationEmail}
                      onChange={(e) => setSendActivationEmail(e.target.checked)}
                      className="rounded border-nexa-border text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sendActivation" className="text-xs text-nexa-text-secondary">
                      Dispatch activation invitation & password initialization link to stakeholder email
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-nexa-border flex justify-end gap-2.5">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsNewClientModalOpen(false)}
                    disabled={isSubmittingClient}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={isSubmittingClient}
                    className="gap-2"
                  >
                    {isSubmittingClient ? (
                      <span>Provisioning...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Provision Account & Issue Access</span>
                      </>
                    )}
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
