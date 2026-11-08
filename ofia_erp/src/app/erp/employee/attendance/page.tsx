"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { useTenantProvisioning } from "@/lib/access-control";
import { useERPStore, getSignedInERPUser, User } from "@/lib/erp-store";
import { useWorkforceManager } from "@/lib/workforce-store";
import { AttendanceRecord, LeaveRequest } from "@/lib/workforce-types";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Send,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Plus,
  FileText,
  Activity,
} from "lucide-react";

export default function EmployeeAttendancePage() {
  const { isModuleProvisioned, isLoading: isProvisioningLoading } = useTenantProvisioning();
  const { users } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const {
    attendance,
    leaveRequests,
    recordClockIn,
    recordClockOut,
    requestLeave,
    isLoaded: isWorkforceLoaded,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"timesheet" | "leave">("timesheet");
  const [workMode, setWorkMode] = useState<"Office" | "Remote" | "Field">("Office");

  // Leave Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveRequest["leaveType"]>("Annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Live time ticker
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getSignedInERPUser(users);
      setCurrentUser(active);
    }
  }, [users]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isWorkforceProvisioned = isModuleProvisioned("workforce");

  // Filter attendance records for current user
  const userAttendance = attendance.filter((a) => {
    if (!currentUser.name) return true;
    return (
      a.personName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      a.personName.toLowerCase().includes(currentUser.name.toLowerCase().split(" ")[0])
    );
  });
  const displayedAttendance = userAttendance.length > 0 ? userAttendance : attendance;

  // Today's attendance record
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecord = displayedAttendance.find(
    (a) =>
      a.date === todayStr &&
      (currentUser.name ? a.personName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() : true)
  );

  const isClockedInToday = Boolean(todayRecord);
  const isClockedOutToday = Boolean(todayRecord && todayRecord.clockOut);

  // Filter leave requests for current user
  const userLeave = leaveRequests.filter((l) => {
    if (!currentUser.name) return true;
    return (
      l.personName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      l.personName.toLowerCase().includes(currentUser.name.toLowerCase().split(" ")[0])
    );
  });

  const handleClockInAction = () => {
    recordClockIn(currentUser.name || "Team Member", (currentUser.role as any) || "employee");
  };

  const handleClockOutAction = () => {
    recordClockOut(currentUser.name || "Team Member");
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason.trim()) return;

    setIsSubmittingLeave(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      requestLeave({
        personName: currentUser.name || "Team Member",
        department: currentUser.department || "Operations",
        leaveType,
        startDate,
        endDate,
        daysCount: diffDays > 0 ? diffDays : 1,
        reason: leaveReason.trim(),
      });

      setLeaveSuccess(true);
      setTimeout(() => {
        setIsSubmittingLeave(false);
        setShowLeaveModal(false);
        setLeaveReason("");
        setStartDate("");
        setEndDate("");
        setLeaveSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to submit leave request:", err);
      setIsSubmittingLeave(false);
    }
  };

  if (!isProvisioningLoading && !isWorkforceProvisioned) {
    return (
      <BusinessShell
        title="Time, Attendance & Leave"
        subtitle="Workforce Management module is not provisioned for this organization."
      >
        <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Attendance Module Not Activated</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            The <strong>Time, Attendance & Leave Management</strong> module is not provisioned for your organization workspace. Contact your administrator to activate WorkforceOS.
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
      title={`Time, Attendance & Leave — ${currentUser.name}`}
      subtitle="One-click clock in/out, punctuality metrics, monthly timesheet logs, and self-service leave requests."
      isLoading={isProvisioningLoading || !isWorkforceLoaded}
    >
      <div className="space-y-6">
        {/* Clock-In / Clock-Out Interactive Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Live Attendance Terminal
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 font-mono">
              {currentTimeStr || "09:00:00 AM"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Work location mode selector */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
              {(["Office", "Remote", "Field"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkMode(mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    workMode === mode
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Clock action button */}
            {!isClockedInToday ? (
              <button
                onClick={handleClockInAction}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs shadow-md shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Clock In Now ({workMode})</span>
              </button>
            ) : !isClockedOutToday ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Clocked in at</span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {todayRecord?.clockIn}
                  </span>
                </div>
                <button
                  onClick={handleClockOutAction}
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-xs shadow-md shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock Out</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Shift Concluded</span>
                <span className="text-xs font-bold text-slate-700">
                  In: {todayRecord?.clockIn} • Out: {todayRecord?.clockOut}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">98%</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Punctuality & presence this cycle</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days Logged</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">{displayedAttendance.length}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Verified work days recorded</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Annual Leave Balance</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">15 Days</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">5 days taken out of 20</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Applications</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">{userLeave.length}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {userLeave.filter((l) => l.status === "pending").length} pending approval
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls & Apply Leave CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("timesheet")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "timesheet"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-gray-100"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Monthly Timesheet</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
                {displayedAttendance.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("leave")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "leave"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-gray-100"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Leave Management</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-black">
                {userLeave.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply for Leave</span>
          </button>
        </div>

        {/* TAB 1: Monthly Timesheet */}
        {activeTab === "timesheet" && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
            <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-black text-base text-slate-800">
                  Personal Attendance History
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Verified check-ins, location timestamps, and work hours
                </p>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Clock In</th>
                    <th className="py-3 px-3">Clock Out</th>
                    <th className="py-3 px-3">Location Mode</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {displayedAttendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-black text-slate-800">
                        {rec.date}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {rec.clockIn}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {rec.clockOut || "—"}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.location}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {rec.verifiedGps ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            GPS Verified
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Standard</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Leave Management */}
        {activeTab === "leave" && (
          <div className="space-y-6">
            {/* Leave Balance Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { type: "Annual Leave", available: 15, total: 20, bg: "bg-blue-50 text-blue-700" },
                { type: "Sick Leave", available: 5, total: 5, bg: "bg-emerald-50 text-emerald-700" },
                { type: "Study / Exam", available: 3, total: 5, bg: "bg-purple-50 text-purple-700" },
                { type: "Compassionate", available: 3, total: 3, bg: "bg-amber-50 text-amber-700" },
              ].map((bal, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${bal.bg}`}>
                    {bal.type}
                  </span>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <h3 className="text-2xl font-black text-slate-800">{bal.available}</h3>
                    <span className="text-xs text-slate-400 font-bold">/ {bal.total} Days</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Available balance for 2027</p>
                </div>
              ))}
            </div>

            {/* Leave Applications History */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h4 className="font-black text-base text-slate-800">
                  Leave Applications & Status
                </h4>
                <span className="text-xs font-semibold text-slate-400">
                  {userLeave.length} Requests on File
                </span>
              </div>

              <div className="overflow-x-auto">
                {userLeave.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                        <th className="py-3 px-3">Leave Type</th>
                        <th className="py-3 px-3">Duration</th>
                        <th className="py-3 px-3">Days</th>
                        <th className="py-3 px-3">Reason</th>
                        <th className="py-3 px-3 text-right">Approval Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {userLeave.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-3 font-black text-slate-800">
                            {req.leaveType} Leave
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-700">
                            {req.startDate} to {req.endDate}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-slate-800">
                            {req.daysCount} Days
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">
                            {req.reason}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            {req.status === "approved" && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Approved
                              </span>
                            )}
                            {req.status === "pending" && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Pending Supervisor
                              </span>
                            )}
                            {req.status === "rejected" && (
                              <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Declined
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-10 text-center text-slate-400 font-semibold text-xs">
                    No leave applications submitted yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leave Application Modal */}
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                    Self-Service Time Off
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-0.5">
                    Apply for Leave
                  </h3>
                </div>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {leaveSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-slate-800">
                    Leave Request Submitted!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your request has been routed to your line manager for review and operational sign-off.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Leave Type
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as any)}
                      className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-slate-700"
                    >
                      <option value="Annual">Annual Leave (Paid)</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Study">Study & Exam Leave</option>
                      <option value="Compassionate">Compassionate Leave</option>
                      <option value="Maternity">Maternity / Paternity Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Start Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        End Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reason / Handover Coverage Notes <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain reason for leave and peer delegate covering urgent responsibilities..."
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLeaveModal(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingLeave || !startDate || !endDate || !leaveReason.trim()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingLeave ? "Submitting..." : "Submit Application"}</span>
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
