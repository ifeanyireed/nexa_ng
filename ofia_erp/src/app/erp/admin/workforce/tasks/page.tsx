"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  ChevronRight,
  ArrowRight,
  Star,
  X,
  FileText,
  FolderGit2,
  UploadCloud,
  Lock,
  Unlock,
  ExternalLink,
  ShieldCheck,
  Layers,
  DollarSign,
  AlertTriangle,
  FileCode,
  Check,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import {
  WorkforceTask,
  WorkforceProject,
  WorkforceDeliverable,
} from "@/lib/workforce-types";

export default function WorkTaskManagementPage() {
  const {
    tasks,
    projects,
    deliverables,
    people,
    departments,
    addTask,
    updateTaskStatus,
    createProject,
    updateProject,
    uploadDeliverable,
    reviewDeliverable,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"kanban" | "projects" | "vault">("kanban");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterProject, setFilterProject] = useState("ALL");
  const [selectedTask, setSelectedTask] = useState<WorkforceTask | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<WorkforceDeliverable | null>(null);

  // New task modal state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || "");
  const [newDept, setNewDept] = useState("Technology");
  const [newAssigneeId, setNewAssigneeId] = useState(people[0]?.id || "");
  const [newPriority, setNewPriority] = useState<WorkforceTask["priority"]>("high");
  const [newDeadline, setNewDeadline] = useState("2027-04-25");
  const [newEstimatedHours, setNewEstimatedHours] = useState(24);
  const [newDependencies, setNewDependencies] = useState<string[]>([]);
  const [newSummary, setNewSummary] = useState("");

  // New project modal state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjCode, setNewProjCode] = useState("PRJ-ENG-05");
  const [newProjDept, setNewProjDept] = useState("Technology");
  const [newProjClient, setNewProjClient] = useState("Ofia Platform Systems");
  const [newProjLeadId, setNewProjLeadId] = useState(people[0]?.id || "");
  const [newProjBudget, setNewProjBudget] = useState(5000000);
  const [newProjPriority, setNewProjPriority] = useState<WorkforceProject["priority"]>("high");
  const [newProjStartDate, setNewProjStartDate] = useState("2027-05-01");
  const [newProjEndDate, setNewProjEndDate] = useState("2027-06-30");
  const [newProjDesc, setNewProjDesc] = useState("");

  // Submit Deliverable modal state
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [delivTitle, setDelivTitle] = useState("");
  const [delivTaskId, setDelivTaskId] = useState("");
  const [delivFileUrl, setDelivFileUrl] = useState("");
  const [delivFileType, setDelivFileType] = useState<WorkforceDeliverable["fileType"]>("github_pr");
  const [delivVersion, setDelivVersion] = useState(1);
  const [delivSubmitterId, setDelivSubmitterId] = useState(people[0]?.id || "");

  // Review Deliverable modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewScore, setReviewScore] = useState(90);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewDecision, setReviewDecision] = useState<"approved" | "revision_requested">("approved");

  const COLUMNS: { key: WorkforceTask["status"]; label: string; color: string }[] = [
    { key: "backlog", label: "Backlog", color: "border-slate-500/30" },
    { key: "in_progress", label: "In Progress", color: "border-blue-500/40" },
    { key: "review", label: "Supervisor Review / QA", color: "border-amber-500/40" },
    { key: "approved", label: "Approved & Completed", color: "border-emerald-500/40" },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesDept = filterDepartment === "ALL" || t.department === filterDepartment;
    const matchesPriority = filterPriority === "ALL" || t.priority === filterPriority;
    const matchesProject = filterProject === "ALL" || t.projectId === filterProject || t.project === filterProject;
    return matchesDept && matchesPriority && matchesProject;
  });

  // Calculate dependency blockers
  const isTaskBlocked = (task: WorkforceTask): boolean => {
    if (!task.dependencies || task.dependencies.length === 0) return false;
    return task.dependencies.some((depId) => {
      const depTask = tasks.find((t) => t.id === depId);
      return !depTask || depTask.status !== "approved";
    });
  };

  const getBlockingTaskTitles = (task: WorkforceTask): string[] => {
    if (!task.dependencies) return [];
    return task.dependencies
      .map((depId) => tasks.find((t) => t.id === depId))
      .filter((t): t is WorkforceTask => !!t && t.status !== "approved")
      .map((t) => t.title);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const proj = projects.find((p) => p.id === newProjectId);
    const assignee = people.find((p) => p.id === newAssigneeId);

    const task: WorkforceTask = {
      id: `task-${Date.now()}`,
      title: newTitle,
      project: proj ? proj.title : "Ad-hoc Initiative",
      projectId: newProjectId || undefined,
      department: newDept,
      assignedTo: assignee ? assignee.name : "Unassigned Specialist",
      assignees: assignee ? [{ id: assignee.id, name: assignee.name, role: assignee.designation }] : [],
      supervisor: proj ? proj.leadPersonName : "Tunde Bakare",
      priority: newPriority,
      status: "backlog",
      deadline: newDeadline,
      estimatedHours: newEstimatedHours,
      actualHours: 0,
      dependencies: newDependencies,
      deliverableSummary: newSummary || "Milestone technical deliverable",
    };

    addTask(task);
    setIsNewTaskModalOpen(false);
    setNewTitle("");
    setNewSummary("");
    setNewDependencies([]);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle) return;

    const leadPerson = people.find((p) => p.id === newProjLeadId);

    const proj: WorkforceProject = {
      id: `proj-${Date.now()}`,
      title: newProjTitle,
      code: newProjCode,
      department: newProjDept,
      clientId: "cl-internal",
      clientName: newProjClient || "Internal Operations",
      leadPersonId: leadPerson?.id || undefined,
      leadPersonName: leadPerson ? leadPerson.name : "Lead Specialist",
      budget: Number(newProjBudget || 0),
      spent: 0,
      status: "active",
      priority: newProjPriority,
      startDate: newProjStartDate,
      endDate: newProjEndDate || undefined,
      description: newProjDesc,
      deliverablesCount: 0,
      tasksCount: 0,
      completedTasksCount: 0,
      createdAt: new Date().toISOString(),
    };

    createProject(proj);
    setIsNewProjectModalOpen(false);
    setNewProjTitle("");
    setNewProjDesc("");
  };

  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivTitle || !delivTaskId) return;

    const targetTask = tasks.find((t) => t.id === delivTaskId);
    const submitter = people.find((p) => p.id === delivSubmitterId);
    const targetProject = projects.find((p) => p.id === targetTask?.projectId);

    const deliverable: WorkforceDeliverable = {
      id: `deliv-${Date.now()}`,
      projectId: targetTask?.projectId || "proj-general",
      projectTitle: targetProject?.title || targetTask?.project,
      taskId: delivTaskId,
      taskTitle: targetTask?.title,
      title: delivTitle,
      submittedById: submitter ? submitter.id : `person-${Date.now()}`,
      submittedByName: submitter ? submitter.name : "Assigned Specialist",
      fileUrl: delivFileUrl || "https://github.com/ifeanyireed/nexa_ng",
      fileType: delivFileType,
      fileSizeBytes: 650000,
      version: delivVersion,
      status: "pending_review",
      submittedAt: new Date().toISOString(),
    };

    uploadDeliverable(deliverable);
    setIsDeliverableModalOpen(false);
    setDelivTitle("");
    setDelivFileUrl("");
    if (selectedTask && selectedTask.id === delivTaskId) {
      setSelectedTask({ ...selectedTask, status: "review", deliverableId: deliverable.id });
    }
  };

  const handleReviewDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliverable) return;

    reviewDeliverable(
      selectedDeliverable.id,
      reviewDecision,
      reviewFeedback || "Approved against specifications.",
      reviewScore,
      "Tunde Bakare"
    );

    setIsReviewModalOpen(false);
    setSelectedDeliverable(null);
    setReviewFeedback("");
  };

  const handleMoveStatus = (taskId: string, newStatus: WorkforceTask["status"]) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if ((newStatus === "in_progress" || newStatus === "review") && isTaskBlocked(task)) {
      alert("This task cannot move forward yet: prerequisite task dependencies have not been approved.");
      return;
    }

    updateTaskStatus(taskId, newStatus);
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  const blockedTasksCount = tasks.filter(isTaskBlocked).length;
  const pendingVaultDeliverables = deliverables.filter((d) => d.status === "pending_review").length;

  return (
    <ErpAdminShell
      title="Projects, Tasks & Deliverables Vault"
      subtitle="Module 04 · Strategic project milestones, task dependency chains, multi-assignees, and cryptographically verified deliverable reviews."
      activeModule="workforce"
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => setIsDeliverableModalOpen(true)}
          >
            <UploadCloud className="w-4 h-4 text-purple-400" />
            Upload Deliverable
          </NexaButton>
          <NexaButton
            size="sm"
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => setIsNewProjectModalOpen(true)}
          >
            <FolderGit2 className="w-4 h-4 text-blue-400" />
            New Project
          </NexaButton>
          <NexaButton
            size="sm"
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => setIsNewTaskModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Task
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* TOP STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active Projects</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{projects.length} Initiatives</p>
            <p className="text-xs text-blue-400 mt-1 font-medium">
              {projects.filter((p) => p.status === "active").length} in active execution
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Sprint Tasks</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{tasks.length} Assigned</p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">
              {tasks.filter((t) => t.status === "approved").length} approved & completed
            </p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Dependency Blockers</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{blockedTasksCount} Blocked</p>
            <p className="text-xs text-nexa-text-secondary mt-1">Awaiting prerequisite task sign-off</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Deliverable Vault</span>
            <p className="text-2xl font-bold text-purple-400 mt-1">{deliverables.length} Submissions</p>
            <p className="text-xs text-purple-300 mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> {pendingVaultDeliverables} pending supervisor sign-off
            </p>
          </div>
        </section>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-nexa-border gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "kanban"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Tasks & Dependencies Kanban ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "projects"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            Projects & Initiatives ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("vault")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "vault"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Deliverables Vault ({deliverables.length})
            {pendingVaultDeliverables > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* TAB 1: KANBAN BOARD WITH DEPENDENCY AWARENESS */}
        {activeTab === "kanban" && (
          <div className="space-y-4">
            {/* FILTERS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-nexa-surface border border-nexa-border rounded-xl">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                >
                  <option value="ALL">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} · {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-nexa-text-secondary font-mono">
                Showing {filteredTasks.length} tasks
              </span>
            </div>

            {/* KANBAN COLUMNS */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLUMNS.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.key);
                return (
                  <div
                    key={col.key}
                    className="p-4 bg-nexa-surface rounded-xl border border-nexa-border flex flex-col space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-nexa-border">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <h3 className="text-xs font-bold text-nexa-text-primary uppercase tracking-wider">
                          {col.label}
                        </h3>
                      </div>
                      <NexaBadge variant="secondary" className="text-[10px] py-0 font-mono">
                        {colTasks.length}
                      </NexaBadge>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[65vh]">
                      {colTasks.map((task) => {
                        const blocked = isTaskBlocked(task);
                        const blockers = getBlockingTaskTitles(task);
                        const attachedDeliverable = deliverables.find((d) => d.taskId === task.id || d.id === task.deliverableId);

                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="p-4 bg-nexa-surface/70 border border-nexa-border rounded-xl hover:border-blue-500/50 transition-all cursor-pointer space-y-2.5 shadow-sm group relative"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase text-nexa-text-secondary truncate max-w-[140px]">
                                {task.project}
                              </span>
                              <NexaBadge
                                variant={task.priority === "critical" ? "primary" : "secondary"}
                                className="text-[9px] uppercase font-mono py-0"
                              >
                                {task.priority}
                              </NexaBadge>
                            </div>

                            <h4 className="text-xs font-bold text-nexa-text-primary group-hover:text-blue-400 transition-colors">
                              {task.title}
                            </h4>

                            {/* DEPENDENCY STATUS BADGE */}
                            {task.dependencies && task.dependencies.length > 0 && (
                              <div className="pt-1">
                                {blocked ? (
                                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-1.5">
                                    <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span className="truncate">Blocked: {blockers[0] || "Prerequisite"}</span>
                                  </div>
                                ) : (
                                  <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 flex items-center gap-1">
                                    <Unlock className="w-3 h-3" />
                                    <span>Prerequisites Met</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* DELIVERABLE ATTACHMENT BADGE */}
                            {attachedDeliverable && (
                              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-300 flex items-center justify-between">
                                <span className="flex items-center gap-1 truncate">
                                  <UploadCloud className="w-3 h-3 text-purple-400 shrink-0" />
                                  <span className="truncate">{attachedDeliverable.title}</span>
                                </span>
                                <span className="uppercase text-[9px] font-mono px-1 rounded bg-purple-500/20">
                                  {attachedDeliverable.fileType}
                                </span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-nexa-border/60 flex items-center justify-between text-[11px]">
                              <span className="text-nexa-text-secondary flex items-center gap-1">
                                <Users className="w-3 h-3" /> {task.assignedTo}
                              </span>
                              <span className="text-nexa-text-secondary flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {task.deadline}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {colTasks.length === 0 && (
                        <div className="p-4 text-center text-xs text-nexa-text-secondary/60 border border-dashed border-nexa-border/60 rounded-xl">
                          No tasks in {col.label.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        )}

        {/* TAB 2: PROJECTS & INITIATIVES */}
        {activeTab === "projects" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id || t.project === proj.title);
              const completedTasks = projTasks.filter((t) => t.status === "approved").length;
              const taskProgress = projTasks.length > 0 ? Math.round((completedTasks / projTasks.length) * 100) : 0;
              const budgetSpentPercent = proj.budget > 0 ? Math.round((proj.spent / proj.budget) * 100) : 0;

              return (
                <div
                  key={proj.id}
                  className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4 hover:border-blue-500/40 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                          {proj.code} · {proj.department}
                        </span>
                        <h3 className="text-base font-bold text-nexa-text-primary mt-2">{proj.title}</h3>
                        <p className="text-xs text-nexa-text-secondary mt-0.5 line-clamp-2">
                          {proj.description}
                        </p>
                      </div>
                      <NexaBadge variant="secondary" className="capitalize text-[10px]">
                        {proj.status}
                      </NexaBadge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-nexa-border/60 text-xs">
                      <div>
                        <span className="text-nexa-text-secondary text-[10px] block">Project Lead</span>
                        <span className="font-semibold text-nexa-text-primary">{proj.leadPersonName}</span>
                      </div>
                      <div>
                        <span className="text-nexa-text-secondary text-[10px] block">Client / Account</span>
                        <span className="font-semibold text-nexa-text-primary">{proj.clientName || "Internal Operations"}</span>
                      </div>
                      <div>
                        <span className="text-nexa-text-secondary text-[10px] block">Budget (Spent / Total)</span>
                        <span className="font-mono text-nexa-text-primary">
                          ₦{(proj.spent / 1000000).toFixed(1)}M / ₦{(proj.budget / 1000000).toFixed(1)}M ({budgetSpentPercent}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-nexa-text-secondary text-[10px] block">Timeline</span>
                        <span className="font-mono text-nexa-text-primary">{proj.startDate} &rarr; {proj.endDate || "Ongoing"}</span>
                      </div>
                    </div>

                    {/* Task Execution Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-nexa-text-secondary">Milestone Tasks</span>
                        <span className="font-bold text-nexa-text-primary">
                          {completedTasks} / {projTasks.length} Completed ({taskProgress}%)
                        </span>
                      </div>
                      <div className="w-full bg-nexa-border/60 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-nexa-border/60 flex items-center justify-between text-xs">
                    <span className="text-purple-400 font-semibold flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5" /> {proj.deliverablesCount} Vault Deliverables
                    </span>
                    <NexaButton
                      size="sm"
                      variant="secondary"
                      className="text-[11px] py-1 px-3"
                      onClick={() => {
                        setNewProjectId(proj.id);
                        setNewDept(proj.department);
                        setIsNewTaskModalOpen(true);
                      }}
                    >
                      + Add Sprint Task
                    </NexaButton>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* TAB 3: DELIVERABLES VAULT */}
        {activeTab === "vault" && (
          <section className="space-y-4">
            <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-purple-400" />
                    Technical Deliverables Review Vault
                  </h3>
                  <p className="text-xs text-nexa-text-secondary">
                    All digital assets, code PRs, architectural specs, and field calibration audits submitted by specialists.
                  </p>
                </div>
                <NexaButton
                  size="sm"
                  variant="primary"
                  className="gap-2 text-xs"
                  onClick={() => setIsDeliverableModalOpen(true)}
                >
                  <UploadCloud className="w-4 h-4" /> Submit Deliverable
                </NexaButton>
              </div>
            </div>

            <div className="overflow-x-auto bg-nexa-surface border border-nexa-border rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-nexa-surface/80 border-b border-nexa-border text-nexa-text-secondary uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Deliverable Title & Version</th>
                    <th className="py-3 px-4">Project & Task</th>
                    <th className="py-3 px-4">Submitted By</th>
                    <th className="py-3 px-4">Asset Type</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nexa-border/60">
                  {deliverables.map((deliv) => (
                    <tr key={deliv.id} className="hover:bg-nexa-border/10 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-nexa-text-primary flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>{deliv.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            v{deliv.version}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-nexa-text-secondary max-w-xs truncate">
                        <span className="block font-medium text-nexa-text-primary truncate">
                          {deliv.projectTitle || "Project Initiative"}
                        </span>
                        <span className="text-[11px] text-nexa-text-secondary truncate">
                          Task: {deliv.taskTitle || deliv.taskId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-nexa-text-primary">
                        {deliv.submittedByName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-nexa-border/50 text-nexa-text-primary">
                          {deliv.fileType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-nexa-text-secondary">
                        {new Date(deliv.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border capitalize ${
                            deliv.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : deliv.status === "revision_requested"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {deliv.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={deliv.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-purple-400 hover:bg-purple-500/10"
                            title="Inspect File Artifact"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <NexaButton
                            size="sm"
                            variant={deliv.status === "approved" ? "secondary" : "primary"}
                            className="text-[11px] py-1 px-2.5"
                            onClick={() => {
                              setSelectedDeliverable(deliv);
                              setIsReviewModalOpen(true);
                            }}
                          >
                            {deliv.status === "approved" ? "Re-evaluate" : "Review Deliverable"}
                          </NexaButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TASK DETAILS MODAL */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-nexa-border">
                <div>
                  <div className="flex items-center gap-2">
                    <NexaBadge variant="secondary" className="uppercase font-mono text-[10px]">
                      {selectedTask.department}
                    </NexaBadge>
                    <NexaBadge variant="primary" className="uppercase font-mono text-[10px]">
                      {selectedTask.priority}
                    </NexaBadge>
                    {isTaskBlocked(selectedTask) ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Dependency Blocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Ready for Work
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-nexa-text-primary mt-2">{selectedTask.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-nexa-text-secondary block">Assigned Specialist:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedTask.assignedTo}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Supervising Lead:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedTask.supervisor}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Project Initiative:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedTask.project}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Delivery Deadline:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedTask.deadline}</span>
                </div>
              </div>

              {/* Task Dependencies Roster */}
              {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                <div className="p-3 rounded-lg bg-nexa-surface/60 border border-nexa-border text-xs space-y-1.5">
                  <span className="font-semibold text-nexa-text-primary block flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Prerequisite Task Dependencies ({selectedTask.dependencies.length})
                  </span>
                  <div className="space-y-1">
                    {selectedTask.dependencies.map((depId) => {
                      const depTask = tasks.find((t) => t.id === depId);
                      const isDepApproved = depTask?.status === "approved";

                      return (
                        <div
                          key={depId}
                          className="flex items-center justify-between text-[11px] p-1.5 rounded bg-nexa-base/40 border border-nexa-border/60"
                        >
                          <span className="text-nexa-text-primary font-medium truncate max-w-sm">
                            {depTask ? depTask.title : depId}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                              isDepApproved
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {depTask ? depTask.status : "Pending"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Deliverable info if attached */}
              {selectedTask.deliverableSummary && (
                <div className="p-3 rounded-lg bg-nexa-surface/60 border border-nexa-border text-xs space-y-1">
                  <span className="font-semibold text-nexa-text-primary block">Deliverable Summary</span>
                  <p className="text-nexa-text-secondary">{selectedTask.deliverableSummary}</p>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-nexa-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-nexa-text-secondary block">
                    Update Workflow Status
                  </span>
                  <button
                    onClick={() => {
                      setDelivTaskId(selectedTask.id);
                      setDelivTitle(`Deliverable: ${selectedTask.title}`);
                      setIsDeliverableModalOpen(true);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Submit to Vault
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {COLUMNS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => handleMoveStatus(selectedTask.id, c.key)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        selectedTask.status === c.key
                          ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                          : "bg-nexa-surface border-nexa-border text-nexa-text-secondary hover:text-nexa-text-primary"
                      }`}
                    >
                      {c.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CREATE TASK MODAL */}
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Create Sprint Task</h3>
                <button
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Implement webhook authentication middleware"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Associated Project</label>
                    <select
                      value={newProjectId}
                      onChange={(e) => setNewProjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} · {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Assignee Specialist</label>
                    <select
                      value={newAssigneeId}
                      onChange={(e) => setNewAssigneeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Target Deadline</label>
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      value={newEstimatedHours}
                      onChange={(e) => setNewEstimatedHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Prerequisite Task Dependencies Selection */}
                <div>
                  <label className="block text-nexa-text-secondary mb-1">
                    Prerequisite Task Dependencies (Hold Ctrl/Cmd to select multiple)
                  </label>
                  <select
                    multiple
                    value={newDependencies}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                      setNewDependencies(selected);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none h-20"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.status.toUpperCase()}] {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Deliverable Specification</label>
                  <textarea
                    rows={2}
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="Milestone expectations, acceptance criteria, test cases..."
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsNewTaskModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Assign Task
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE PROJECT MODAL */}
        {isNewProjectModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">Create Strategic Project</h3>
                <button
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    placeholder="e.g. Omnichannel Merchant Settlement Reconciliation"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Project Code</label>
                    <input
                      type="text"
                      required
                      value={newProjCode}
                      onChange={(e) => setNewProjCode(e.target.value)}
                      placeholder="e.g. PRJ-FIN-05"
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Department</label>
                    <select
                      value={newProjDept}
                      onChange={(e) => setNewProjDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Project Lead</label>
                    <select
                      value={newProjLeadId}
                      onChange={(e) => setNewProjLeadId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Client / Beneficiary</label>
                    <input
                      type="text"
                      value={newProjClient}
                      onChange={(e) => setNewProjClient(e.target.value)}
                      placeholder="e.g. ReedBreed Logistics"
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Budget Allocation (₦)</label>
                    <input
                      type="number"
                      value={newProjBudget}
                      onChange={(e) => setNewProjBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Strategic Priority</label>
                    <select
                      value={newProjPriority}
                      onChange={(e) => setNewProjPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Description & Scope</label>
                  <textarea
                    rows={2}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Project charter and architectural deliverable goals..."
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsNewProjectModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Launch Project
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUBMIT DELIVERABLE MODAL */}
        {isDeliverableModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-purple-400" />
                  Submit Technical Deliverable
                </h3>
                <button
                  onClick={() => setIsDeliverableModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitDeliverable} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Associated Task</label>
                  <select
                    required
                    value={delivTaskId}
                    onChange={(e) => setDelivTaskId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    <option value="">-- Choose Task --</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.project})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Deliverable Title</label>
                  <input
                    type="text"
                    required
                    value={delivTitle}
                    onChange={(e) => setDelivTitle(e.target.value)}
                    placeholder="e.g. Database Pooling Integration PR"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Asset Type</label>
                    <select
                      value={delivFileType}
                      onChange={(e) => setDelivFileType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="github_pr">GitHub PR</option>
                      <option value="pdf">PDF Document</option>
                      <option value="document">Report / Doc</option>
                      <option value="figma">Figma Design</option>
                      <option value="code">Code Repository</option>
                      <option value="zip">ZIP Bundle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Version</label>
                    <input
                      type="number"
                      min="1"
                      value={delivVersion}
                      onChange={(e) => setDelivVersion(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Asset URL / Repository Link</label>
                  <input
                    type="url"
                    required
                    value={delivFileUrl}
                    onChange={(e) => setDelivFileUrl(e.target.value)}
                    placeholder="https://github.com/ifeanyireed/nexa_ng/pull/42"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Submitted By</label>
                  <select
                    value={delivSubmitterId}
                    onChange={(e) => setDelivSubmitterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsDeliverableModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Upload to Vault
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REVIEW DELIVERABLE MODAL */}
        {isReviewModalOpen && selectedDeliverable && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  Sign-Off Deliverable
                </h3>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReviewDeliverable} className="space-y-3 text-xs">
                <div>
                  <span className="text-nexa-text-secondary block">Deliverable Title</span>
                  <span className="font-bold text-nexa-text-primary">{selectedDeliverable.title}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Submitted By</span>
                  <span className="font-medium text-purple-400">{selectedDeliverable.submittedByName}</span>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Decision</label>
                  <select
                    value={reviewDecision}
                    onChange={(e) => setReviewDecision(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none font-semibold"
                  >
                    <option value="approved">Approve & Sign-Off (Award Competency Points)</option>
                    <option value="revision_requested">Request Revisions & Re-submission</option>
                  </select>
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Evaluation Score (0 - 100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Supervisor Review Notes</label>
                  <textarea
                    rows={3}
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Enter architectural and test feedback..."
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsReviewModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Record Evaluation
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
