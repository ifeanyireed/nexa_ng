"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { useTenantProvisioning } from "@/lib/access-control";
import { useERPStore, getSignedInERPUser, User } from "@/lib/erp-store";
import { useWorkforceManager } from "@/lib/workforce-store";
import { DailyWorkLog, ServiceTicket } from "@/lib/workforce-types";
import {
  Network,
  Building2,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Send,
  Plus,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Activity,
  FileText,
} from "lucide-react";

export default function EmployeeDeploymentPage() {
  const { isModuleProvisioned, isLoading: isProvisioningLoading } = useTenantProvisioning();
  const { users } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const {
    deployments,
    workLogs,
    tickets,
    logWorkHours,
    resolveTicket,
    isLoaded: isWorkforceLoaded,
  } = useWorkforceManager();

  // Work Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logClientName, setLogClientName] = useState("");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [logHours, setLogHours] = useState(8);
  const [logSummary, setLogSummary] = useState("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getSignedInERPUser(users);
      setCurrentUser(active);
    }
  }, [users]);

  const isWorkforceProvisioned = isModuleProvisioned("workforce");

  // Find active deployment for current user
  const userDeployments = deployments.filter((d) => {
    if (!currentUser.name) return true;
    return (
      d.personName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      d.personName.toLowerCase().includes(currentUser.name.toLowerCase().split(" ")[0])
    );
  });
  const activeDeployment = userDeployments.find((d) => d.status === "active") || userDeployments[0];

  // Set default client name for logging
  useEffect(() => {
    if (activeDeployment && !logClientName) {
      setLogClientName(activeDeployment.clientName);
    }
  }, [activeDeployment, logClientName]);

  // Filter personal work logs
  const userLogs = workLogs.filter((w) => {
    if (!currentUser.name) return true;
    return (
      w.personName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      w.personName.toLowerCase().includes(currentUser.name.toLowerCase().split(" ")[0])
    );
  });
  const displayedLogs = userLogs.length > 0 ? userLogs : workLogs;

  // Filter assigned service tickets
  const userTickets = tickets.filter((t) => {
    if (!currentUser.name) return true;
    return (
      t.assignedSpecialist.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      t.assignedSpecialist.toLowerCase().includes(currentUser.name.toLowerCase().split(" ")[0])
    );
  });
  const displayedTickets = userTickets.length > 0 ? userTickets : tickets;

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logClientName || !logSummary.trim()) return;

    setIsSubmittingLog(true);
    try {
      logWorkHours({
        personName: currentUser.name || "Team Member",
        clientName: logClientName,
        date: logDate,
        hoursWorked: Number(logHours),
        summary: logSummary.trim(),
      });

      setLogSuccess(true);
      setTimeout(() => {
        setIsSubmittingLog(false);
        setShowLogModal(false);
        setLogSummary("");
        setLogSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to submit work log:", err);
      setIsSubmittingLog(false);
    }
  };

  if (!isProvisioningLoading && !isWorkforceProvisioned) {
    return (
      <BusinessShell
        title="Client Deployment & Operations"
        subtitle="Workforce Management module is not provisioned for this organization."
      >
        <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Deployment Module Not Activated</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            The <strong>Workforce Deployment & Service Delivery</strong> module is not provisioned on this tenant&apos;s plan. Contact your administrator to activate WorkforceOS.
          </p>
          <div className="pt-2">
            <Link
              href="/erp/employee"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
            >
              <span>Back to Employee Overview</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </BusinessShell>
    );
  }

  return (
    <BusinessShell
      title={`Client Deployment & Operations — ${currentUser.name}`}
      subtitle="Client contract assignments, SLA expectations, daily delivery logs, and customer support tickets."
      isLoading={isProvisioningLoading || !isWorkforceLoaded}
    >
      <div className="space-y-6">
        {/* Active Deployment Card */}
        {activeDeployment ? (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    Active Client Engagement
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-0.5">
                    {activeDeployment.clientName}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Deployed ({activeDeployment.allocationPercent}% Allocation)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Contract Title</span>
                <span className="text-slate-800 font-black text-sm">{activeDeployment.contractTitle}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Deployment Role</span>
                <span className="text-slate-800 font-black text-sm">{activeDeployment.role}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                <span className="text-slate-800 font-black text-sm">
                  {activeDeployment.startDate} to {activeDeployment.endDate}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">SLA Commitment</span>
                <span className="text-emerald-700 font-black text-sm">99.5% Uptime / 2hr P1</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800">Currently on Internal Operations & Bench</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  You are currently assigned to internal product development. You will be notified when an external client deployment request matches your competencies.
                </p>
              </div>
            </div>
            <span className="text-xs font-black uppercase bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
              Bench Pool
            </span>
          </div>
        )}

        {/* Daily Work Logs & Ticket Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Daily Work Logs (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h4 className="font-black text-base text-slate-800">
                  Daily Activity & Delivery Logs
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Log operational hours delivered for supervisor sign-off
                </p>
              </div>
              <button
                onClick={() => setShowLogModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Daily Work</span>
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {displayedLogs.length > 0 ? (
                displayedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 font-black">{log.clientName}</span>
                      <span className="text-slate-400">{log.date} • {log.hoursWorked} Hours Logged</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {log.summary}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Logged by {log.personName}</span>
                      {log.supervisorSignedOff ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Supervisor Signed Off
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md font-extrabold">
                          Pending Supervisor Sign-Off
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                  No work logs recorded yet. Click &ldquo;Log Daily Work&rdquo; to submit today&apos;s hours.
                </div>
              )}
            </div>
          </div>

          {/* Assigned Client Service Tickets (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-black text-base text-slate-800">
                  Assigned Support Cases
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Client tickets under SLA governance
                </p>
              </div>
              <span className="text-xs font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl">
                {displayedTickets.filter((t) => t.status !== "resolved").length} Active
              </span>
            </div>

            <div className="space-y-3">
              {displayedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-slate-500">
                      {ticket.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        ticket.priority === "P1"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : ticket.priority === "P2"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {ticket.priority} Priority
                    </span>
                  </div>

                  <h5 className="text-xs font-black text-slate-800 leading-snug">
                    {ticket.subject}
                  </h5>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>{ticket.clientName}</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      SLA: {ticket.slaMinutesRemaining}m left
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        ticket.status === "resolved" ? "text-emerald-600" : "text-blue-600"
                      }`}
                    >
                      {ticket.status}
                    </span>
                    {ticket.status !== "resolved" && (
                      <button
                        onClick={() => resolveTicket(ticket.id)}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-200 transition-colors cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Log Daily Work Modal */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                    Service Delivery Log
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-0.5">
                    Log Daily Work Hours
                  </h3>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {logSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-slate-800">
                    Work Hours Logged Successfully!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your daily log has been registered and submitted for supervisor sign-off.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLogSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Client / Project Account
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prime Logistics Ltd or Internal ERP"
                      value={logClientName}
                      onChange={(e) => setLogClientName(e.target.value)}
                      className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date Logged
                      </label>
                      <input
                        type="date"
                        required
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hours Worked
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="16"
                        step="0.5"
                        required
                        value={logHours}
                        onChange={(e) => setLogHours(Number(e.target.value))}
                        className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Summary of Operations Delivered <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Bullet points of tasks performed, tickets resolved, client meetings held, or code shipped..."
                      value={logSummary}
                      onChange={(e) => setLogSummary(e.target.value)}
                      className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLogModal(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingLog || !logSummary.trim()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingLog ? "Submitting..." : "Submit Log"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
