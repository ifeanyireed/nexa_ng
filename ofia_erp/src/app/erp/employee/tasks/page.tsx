"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { useTenantProvisioning } from "@/lib/access-control";
import { useERPStore, getSignedInERPUser, User } from "@/lib/erp-store";
import { useWorkforceManager } from "@/lib/workforce-store";
import { WorkforceTask } from "@/lib/workforce-types";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Send,
  ExternalLink,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  MessageSquare,
  FileText,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

export default function EmployeeTasksPage() {
  const router = useRouter();
  const { isModuleProvisioned, isLoading: isProvisioningLoading } = useTenantProvisioning();
  const { users } = useERPStore();
  const [currentUser, setCurrentUser] = useState<User>(() => getSignedInERPUser(users));
  const { tasks, submitDeliverable, isLoaded: isWorkforceLoaded } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "review" | "approved" | "backlog">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewScope, setViewScope] = useState<"my_tasks" | "all_team">("my_tasks");

  // Deliverable submission modal state
  const [selectedTask, setSelectedTask] = useState<WorkforceTask | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [deliverableSummary, setDeliverableSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = getSignedInERPUser(users);
      setCurrentUser(active);
    }
  }, [users]);

  const isWorkforceProvisioned = isModuleProvisioned("workforce");

  // Filter tasks
  const userFilteredTasks = tasks.filter((task) => {
    // Scope filter
    if (viewScope === "my_tasks" && currentUser.name) {
      const isAssigned =
        task.assignedTo.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
        task.assignedTo.toLowerCase().includes(currentUser.name.toLowerCase().split(" ")[0]);
      if (!isAssigned) return false;
    }

    // Status tab filter
    if (activeTab !== "all" && task.status !== activeTab) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.project.toLowerCase().includes(q) ||
        task.department.toLowerCase().includes(q) ||
        task.supervisor.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Calculate personal metrics
  const myTasks = tasks.filter(
    (t) =>
      currentUser.name &&
      (t.assignedTo.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
        t.assignedTo.toLowerCase().includes(currentUser.name.toLowerCase().split(" ")[0]))
  );
  const relevantList = viewScope === "my_tasks" && myTasks.length > 0 ? myTasks : tasks;

  const inProgressCount = relevantList.filter((t) => t.status === "in_progress").length;
  const reviewCount = relevantList.filter((t) => t.status === "review").length;
  const approvedCount = relevantList.filter((t) => t.status === "approved").length;
  const scoredTasks = relevantList.filter((t) => t.score !== undefined && t.score > 0);
  const avgScore =
    scoredTasks.length > 0
      ? (scoredTasks.reduce((acc, t) => acc + (t.score || 0), 0) / scoredTasks.length).toFixed(1)
      : null;

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !deliverableSummary.trim()) return;

    setIsSubmitting(true);
    try {
      const combinedSummary = deliverableUrl.trim()
        ? `${deliverableSummary.trim()} • Artifact Link: ${deliverableUrl.trim()}`
        : deliverableSummary.trim();

      submitDeliverable(selectedTask.id, combinedSummary);
      setSubmissionSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSelectedTask(null);
        setDeliverableSummary("");
        setDeliverableUrl("");
        setSubmissionSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to submit deliverable:", err);
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: WorkforceTask["priority"]) => {
    switch (priority) {
      case "critical":
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
            Critical
          </span>
        );
      case "high":
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
            Medium
          </span>
        );
      default:
        return (
          <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: WorkforceTask["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case "review":
        return (
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            In Review
          </span>
        );
      case "in_progress":
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-full">
            Backlog
          </span>
        );
    }
  };

  if (!isProvisioningLoading && !isWorkforceProvisioned) {
    return (
      <BusinessShell
        title="My Tasks & Deliverables"
        subtitle="Workforce Management module is not provisioned for this organization."
      >
        <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Workforce OS Not Activated</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            The <strong>Workforce Management & Talent Operations</strong> module is not provisioned for your organization workspace. Please contact your organization administrator to activate WorkforceOS.
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
      title={`My Tasks & Deliverables — ${currentUser.name}`}
      subtitle="Track assigned project deliverables, submit practical work for review, and receive supervisor ratings."
      isLoading={isProvisioningLoading || !isWorkforceLoaded}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Tasks</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">{inProgressCount}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Currently in progress</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Review</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">{reviewCount}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Submitted to supervisor</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Work</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-800">{approvedCount}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Signed off deliverables</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Score</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-2xl font-black text-slate-800">{avgScore ? avgScore : "—"}</h3>
                {avgScore && <span className="text-xs font-bold text-slate-400">/ 100</span>}
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">Average deliverable rating</p>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Tasks" },
              { id: "in_progress", label: "In Progress" },
              { id: "review", label: "Under Review" },
              { id: "approved", label: "Approved" },
              { id: "backlog", label: "Backlog" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setViewScope(viewScope === "my_tasks" ? "all_team" : "my_tasks")}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              title="Toggle between personal and team tasks"
            >
              {viewScope === "my_tasks" ? "View Team Tasks" : "View My Tasks Only"}
            </button>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {userFilteredTasks.length > 0 ? (
            userFilteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                      {task.project}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      • {task.department}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-800 leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due: {task.deadline}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      Supervisor: <strong className="text-slate-700">{task.supervisor}</strong>
                    </span>
                    {task.assignedTo && (
                      <span className="text-slate-400">
                        Assigned to: <strong className="text-slate-600">{task.assignedTo}</strong>
                      </span>
                    )}
                  </div>

                  {/* Deliverable submission notes if present */}
                  {task.deliverableSummary && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 mt-2">
                      <span className="font-extrabold text-slate-700 block mb-0.5">Submitted Deliverable:</span>
                      {task.deliverableSummary}
                    </div>
                  )}

                  {/* Supervisor review feedback if present */}
                  {task.feedback && (
                    <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-xs text-emerald-900 mt-2 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black text-emerald-800">
                          Supervisor Feedback {task.score ? `(Score: ${task.score}/100)` : ""}:
                        </span>{" "}
                        {task.feedback}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Action Column */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div>{getStatusBadge(task.status)}</div>

                  {task.status === "in_progress" || task.status === "backlog" ? (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setDeliverableSummary(task.deliverableSummary || "");
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Deliverable</span>
                    </button>
                  ) : task.status === "review" ? (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setDeliverableSummary(task.deliverableSummary || "");
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Update Submission</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                      <Award className="w-3.5 h-3.5" />
                      <span>Quality Score: {task.score || 95}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-700">No Tasks Matching Filter</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active deliverables match your filter. Select &ldquo;View Team Tasks&rdquo; to explore department project backlogs.
              </p>
            </div>
          )}
        </div>

        {/* Deliverable Submission Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                    Submit Deliverable
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-0.5">
                    {selectedTask.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {submissionSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-slate-800">
                    Deliverable Submitted Successfully!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your work has been routed to <strong>{selectedTask.supervisor}</strong> for review and quality evaluation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Deliverable Summary / Work Notes <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe what was built, key outcomes, testing conducted, or implementation notes..."
                      value={deliverableSummary}
                      onChange={(e) => setDeliverableSummary(e.target.value)}
                      className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Artifact Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/... or Figma / Google Doc link"
                      value={deliverableUrl}
                      onChange={(e) => setDeliverableUrl(e.target.value)}
                      className="w-full p-3 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Provide a direct link to your code branch, prototype, presentation, or report.
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Submitting marks this task as <strong>In Review</strong> for supervisor <strong>{selectedTask.supervisor}</strong>.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTask(null)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !deliverableSummary.trim()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? "Submitting..." : "Submit to Supervisor"}</span>
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
