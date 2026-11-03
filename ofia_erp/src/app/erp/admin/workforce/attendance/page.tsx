"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Plus,
  Filter,
  Search,
  Check,
  X,
  TrendingUp,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { AttendanceRecord, LeaveRequest } from "@/lib/workforce-types";

export default function TimeAttendanceSchedulingPage() {
  const {
    attendance,
    leaveRequests,
    recordClockIn,
    updateLeaveStatus,
  } = useWorkforceManager();

  const [clockInName, setClockInName] = useState("Kalu Nwosu");
  const [activeTab, setActiveTab] = useState<"attendance" | "leave" | "shifts">("attendance");
  const [justClockedIn, setJustClockedIn] = useState(false);

  const handleQuickClockIn = () => {
    recordClockIn(clockInName, "employee");
    setJustClockedIn(true);
    setTimeout(() => setJustClockedIn(false), 3000);
  };

  const SHIFT_ROSTER = [
    { shift: "Morning Operations Shift", hours: "08:00 AM - 04:00 PM", staffCount: 14, leads: "Ifeanyi Felix" },
    { shift: "Afternoon Customer Success Shift", hours: "12:00 PM - 08:00 PM", staffCount: 6, leads: "Damilola Coker" },
    { shift: "Night NOC & Infrastructure Roster", hours: "08:00 PM - 08:00 AM", staffCount: 4, leads: "Zainab Al-Hassan" },
    { shift: "Field Outsource Client Rotation", hours: "08:30 AM - 05:00 PM", staffCount: 5, leads: "Client Operations" },
  ];

  return (
    <ErpAdminShell
      title="Time, Attendance & Scheduling"
      subtitle="Module 05 · Real-time attendance verification, shift rosters, timesheets, and leave approval workflows."
      activeModule="workforce"
      action={
        <NexaButton
          size="sm"
          variant="primary"
          className="gap-2 text-xs"
          onClick={handleQuickClockIn}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          Punch Live Clock In
        </NexaButton>
      }
    >
      <div className="space-y-8">
        {justClockedIn && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span>Clock-in registered for <strong>{clockInName}</strong> with verified GPS coordinate stamp!</span>
          </div>
        )}

        {/* TOP METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Today&apos;s Punctuality</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">98.4%</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% verified location badges
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Logged Timesheets Today</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{attendance.length} Shifts</p>
            <p className="text-xs text-nexa-text-secondary mt-1">On-premises and outsourced client sites</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Pending Leave Requests</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {leaveRequests.filter((l) => l.status === "pending").length}
            </p>
            <p className="text-xs text-amber-400 mt-1">Awaiting manager sign-off</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Overtime Hours (Weekly)</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">16.5 Hrs</p>
            <p className="text-xs text-nexa-text-secondary mt-1">Approved for client emergency SLA</p>
          </div>
        </section>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-nexa-border gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "attendance"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Clock className="w-4 h-4" />
            Daily Attendance Ledger ({attendance.length})
          </button>
          <button
            onClick={() => setActiveTab("leave")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "leave"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Leave Applications & Approvals ({leaveRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("shifts")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "shifts"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <Users className="w-4 h-4" />
            Shift Schedules & Rosters (4 Active)
          </button>
        </div>

        {/* TAB 1: ATTENDANCE LEDGER */}
        {activeTab === "attendance" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Today&apos;s Attendance Ledger</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Geo-verified timestamps from office headquarters and client work locations.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-nexa-surface/60 text-nexa-text-secondary uppercase text-[10px] tracking-wider border-b border-nexa-border">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4">Location & Telemetry</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexa-border/60">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-nexa-surface/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-nexa-text-primary">{att.personName}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono uppercase text-nexa-text-secondary">{att.role}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-nexa-text-secondary">{att.date}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">{att.clockIn}</td>
                      <td className="py-3.5 px-4 font-mono text-nexa-text-secondary">{att.clockOut || "Active Shift"}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-nexa-text-secondary flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" /> {att.location}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <NexaBadge variant="secondary" className="capitalize text-[10px]">
                          {att.status}
                        </NexaBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: LEAVE APPLICATIONS */}
        {activeTab === "leave" && (
          <section className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-nexa-text-primary">Staff Leave Requests</h3>
                <p className="text-xs text-nexa-text-secondary">
                  Annual, study, medical, and compassionate leave applications with supervisor approval gates.
                </p>
              </div>
            </div>

            <div className="divide-y divide-nexa-border/60">
              {leaveRequests.map((leave) => (
                <div key={leave.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-nexa-text-primary">{leave.personName}</h4>
                      <NexaBadge variant="secondary" className="text-[10px] py-0">
                        {leave.department}
                      </NexaBadge>
                      <span className="text-xs font-semibold text-amber-400">
                        {leave.leaveType} Leave ({leave.daysCount} Days)
                      </span>
                    </div>
                    <p className="text-xs text-nexa-text-secondary">{leave.reason}</p>
                    <p className="text-[11px] text-nexa-text-secondary font-mono">
                      Dates: {leave.startDate} to {leave.endDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {leave.status === "pending" ? (
                      <>
                        <NexaButton
                          size="sm"
                          variant="secondary"
                          className="text-xs py-1 px-2.5 text-rose-400 gap-1"
                          onClick={() => updateLeaveStatus(leave.id, "rejected")}
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </NexaButton>
                        <NexaButton
                          size="sm"
                          variant="primary"
                          className="text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 gap-1"
                          onClick={() => updateLeaveStatus(leave.id, "approved")}
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Leave
                        </NexaButton>
                      </>
                    ) : (
                      <NexaBadge
                        variant={leave.status === "approved" ? "primary" : "secondary"}
                        className="capitalize"
                      >
                        {leave.status}
                      </NexaBadge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: SHIFT SCHEDULES */}
        {activeTab === "shifts" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHIFT_ROSTER.map((s, idx) => (
              <div key={idx} className="p-5 bg-nexa-surface border border-nexa-border rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-nexa-text-primary">{s.shift}</h4>
                  <NexaBadge variant="secondary" className="font-mono text-[10px]">
                    {s.staffCount} Staff
                  </NexaBadge>
                </div>
                <p className="text-xs text-nexa-text-secondary flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {s.hours}
                </p>
                <div className="pt-2 border-t border-nexa-border/60 flex items-center justify-between text-xs text-nexa-text-secondary">
                  <span>Roster Lead: <strong className="text-nexa-text-primary">{s.leads}</strong></span>
                  <span className="text-blue-500 font-semibold hover:underline cursor-pointer">
                    Adjust Roster &rarr;
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </ErpAdminShell>
  );
}
