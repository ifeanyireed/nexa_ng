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
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { WorkforceTask } from "@/lib/workforce-types";

export default function WorkTaskManagementPage() {
  const { tasks, addTask, updateTaskStatus } = useWorkforceManager();

  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [selectedTask, setSelectedTask] = useState<WorkforceTask | null>(null);

  // New task modal state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProject, setNewProject] = useState("Merchant Scaling Sprint");
  const [newDept, setNewDept] = useState("Technology");
  const [newAssignee, setNewAssignee] = useState("Kalu Nwosu");
  const [newPriority, setNewPriority] = useState<WorkforceTask["priority"]>("high");
  const [newDeadline, setNewDeadline] = useState("2027-04-20");

  const COLUMNS: { key: WorkforceTask["status"]; label: string; color: string }[] = [
    { key: "backlog", label: "Backlog", color: "border-slate-500/30" },
    { key: "in_progress", label: "In Progress", color: "border-blue-500/40" },
    { key: "review", label: "Supervisor Review / QA", color: "border-amber-500/40" },
    { key: "approved", label: "Approved & Completed", color: "border-emerald-500/40" },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesDept = filterDepartment === "ALL" || t.department === filterDepartment;
    const matchesPriority = filterPriority === "ALL" || t.priority === filterPriority;
    return matchesDept && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const task: WorkforceTask = {
      id: `task-${Date.now()}`,
      title: newTitle,
      project: newProject,
      department: newDept,
      assignedTo: newAssignee,
      supervisor: "Ifeanyi Felix",
      priority: newPriority,
      status: "backlog",
      deadline: newDeadline,
      deliverableSummary: "Structured milestone deliverable",
    };

    addTask(task);
    setIsNewTaskModalOpen(false);
    setNewTitle("");
  };

  const handleMoveStatus = (taskId: string, newStatus: WorkforceTask["status"]) => {
    updateTaskStatus(taskId, newStatus);
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  return (
    <ErpAdminShell
      title="Work & Task Management"
      subtitle="Module 04 · Project assignments, deliverables, competency-linked task review, and approval history."
      activeModule="workforce"
      action={
        <NexaButton
          size="sm"
          variant="primary"
          className="gap-2 text-xs"
          onClick={() => setIsNewTaskModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create Task
        </NexaButton>
      }
    >
      <div className="space-y-8">
        {/* TOP STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Total Active Tasks</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">{tasks.length}</p>
            <p className="text-xs text-nexa-text-secondary mt-1">Across 4 live projects</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">In Execution</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {tasks.filter((t) => t.status === "in_progress").length}
            </p>
            <p className="text-xs text-blue-400 mt-1 font-medium">Under active development</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Awaiting QA Review</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {tasks.filter((t) => t.status === "review").length}
            </p>
            <p className="text-xs text-amber-400 mt-1 font-medium">Pending supervisor sign-off</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">First-Time Approval Rate</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">94.2%</p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">High quality deliverables</p>
          </div>
        </section>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-nexa-surface border border-nexa-border rounded-xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Technology">Technology</option>
              <option value="Operations">Operations</option>
              <option value="Compliance Hub">Compliance Hub</option>
              <option value="Customer Success">Customer Success</option>
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
          </div>

          <span className="text-xs text-nexa-text-secondary font-mono">
            Showing {filteredTasks.length} tasks
          </span>
        </div>

        {/* KANBAN BOARD */}
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
                  <NexaBadge variant="secondary" className="text-[10px] py-0">
                    {colTasks.length}
                  </NexaBadge>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[65vh]">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-4 bg-nexa-surface/70 border border-nexa-border rounded-xl hover:border-blue-500/50 transition-all cursor-pointer space-y-2 shadow-sm group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-nexa-text-secondary">
                          {task.department}
                        </span>
                        <NexaBadge
                          variant={task.priority === "critical" ? "primary" : "secondary"}
                          className="text-[9px] uppercase font-mono py-0"
                        >
                          {task.priority}
                        </NexaBadge>
                      </div>

                      <h4 className="text-xs font-bold text-nexa-text-primary group-hover:text-blue-500 transition-colors">
                        {task.title}
                      </h4>

                      <p className="text-[11px] text-nexa-text-secondary">
                        Project: <strong className="text-nexa-text-primary">{task.project}</strong>
                      </p>

                      <div className="pt-2 border-t border-nexa-border/60 flex items-center justify-between text-[11px]">
                        <span className="text-nexa-text-secondary flex items-center gap-1">
                          <Users className="w-3 h-3" /> {task.assignedTo}
                        </span>
                        <span className="text-nexa-text-secondary flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.deadline}
                        </span>
                      </div>
                    </div>
                  ))}

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
                  <span className="text-nexa-text-secondary block">Supervising Manager:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedTask.supervisor}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Project / Initiative:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedTask.project}</span>
                </div>
                <div>
                  <span className="text-nexa-text-secondary block">Delivery Deadline:</span>
                  <span className="font-semibold text-nexa-text-primary">{selectedTask.deadline}</span>
                </div>
              </div>

              {selectedTask.deliverableSummary && (
                <div className="p-3 rounded-lg bg-nexa-surface/60 border border-nexa-border text-xs space-y-1">
                  <span className="font-semibold text-nexa-text-primary block">Expected Deliverable</span>
                  <p className="text-nexa-text-secondary">{selectedTask.deliverableSummary}</p>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-nexa-border">
                <span className="text-xs font-semibold text-nexa-text-secondary block">Update Workflow Status</span>
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
                <h3 className="text-base font-bold text-nexa-text-primary">Create Work Task</h3>
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
                    placeholder="e.g. Audit core PostgreSQL database indexes"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Project</label>
                    <input
                      type="text"
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Operations">Operations</option>
                      <option value="Compliance Hub">Compliance Hub</option>
                      <option value="Customer Success">Customer Success</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Assignee</label>
                    <input
                      type="text"
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
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
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Deadline</label>
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
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
                    Create & Assign Task
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
