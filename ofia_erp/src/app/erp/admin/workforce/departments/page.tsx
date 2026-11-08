"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Users,
  Layers,
  Network,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  X,
  DollarSign,
  TrendingUp,
  ChevronRight,
  UserCheck,
  Search,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { WorkforceDepartment, WorkforceBranch } from "@/lib/workforce-types";

export default function DepartmentsPage() {
  const {
    departments,
    branches,
    people,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createBranch,
    updateBranch,
    deleteBranch,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"departments" | "branches" | "org_chart">("departments");
  const [searchQuery, setSearchQuery] = useState("");

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptHeadId, setDeptHeadId] = useState("");
  const [deptHeadName, setDeptHeadName] = useState("");
  const [deptBudget, setDeptBudget] = useState(2500000);
  const [deptTargetHeadcount, setDeptTargetHeadcount] = useState(10);
  const [deptDescription, setDeptDescription] = useState("");

  // Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState("");
  const [branchCity, setBranchCity] = useState("Lagos");
  const [branchState, setBranchState] = useState("Lagos State");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchIsHQ, setBranchIsHQ] = useState(false);
  const [branchManager, setBranchManager] = useState("");

  // KPI aggregates
  const totalDepartments = departments.length;
  const totalBranches = branches.length;
  const totalTargetHeadcount = departments.reduce((acc, d) => acc + d.targetHeadcount, 0);
  const totalActiveHeadcount = departments.reduce((acc, d) => acc + d.activeHeadcount, 0);
  const totalMonthlyBudget = departments.reduce((acc, d) => acc + d.budgetMonthly, 0);

  // Filtered lists
  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.headPersonName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.managerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateDeptModal = () => {
    setEditingDeptId(null);
    setDeptName("");
    setDeptCode("");
    setDeptHeadId("");
    setDeptHeadName(people[0]?.name || "Unassigned");
    setDeptBudget(2500000);
    setDeptTargetHeadcount(10);
    setDeptDescription("");
    setIsDeptModalOpen(true);
  };

  const openEditDeptModal = (d: WorkforceDepartment) => {
    setEditingDeptId(d.id);
    setDeptName(d.name);
    setDeptCode(d.code);
    setDeptHeadId(d.headPersonId || "");
    setDeptHeadName(d.headPersonName);
    setDeptBudget(d.budgetMonthly);
    setDeptTargetHeadcount(d.targetHeadcount);
    setDeptDescription(d.description);
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;

    if (editingDeptId) {
      updateDepartment(editingDeptId, {
        name: deptName,
        code: deptCode.toUpperCase(),
        headPersonId: deptHeadId || undefined,
        headPersonName: deptHeadName,
        budgetMonthly: Number(deptBudget),
        targetHeadcount: Number(deptTargetHeadcount),
        description: deptDescription,
      });
    } else {
      const newDept: WorkforceDepartment = {
        id: `dept-${Date.now()}`,
        name: deptName,
        code: deptCode.toUpperCase(),
        headPersonId: deptHeadId || undefined,
        headPersonName: deptHeadName,
        budgetMonthly: Number(deptBudget),
        targetHeadcount: Number(deptTargetHeadcount),
        activeHeadcount: 0,
        description: deptDescription,
      };
      createDepartment(newDept);
    }
    setIsDeptModalOpen(false);
  };

  const openCreateBranchModal = () => {
    setEditingBranchId(null);
    setBranchName("");
    setBranchCity("Lagos");
    setBranchState("Lagos State");
    setBranchAddress("");
    setBranchIsHQ(false);
    setBranchManager(people[0]?.name || "Branch Manager");
    setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (b: WorkforceBranch) => {
    setEditingBranchId(b.id);
    setBranchName(b.name);
    setBranchCity(b.city);
    setBranchState(b.state);
    setBranchAddress(b.address);
    setBranchIsHQ(b.isHeadquarters);
    setBranchManager(b.managerName);
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName || !branchAddress) return;

    if (editingBranchId) {
      updateBranch(editingBranchId, {
        name: branchName,
        city: branchCity,
        state: branchState,
        address: branchAddress,
        isHeadquarters: branchIsHQ,
        managerName: branchManager,
      });
    } else {
      const newBranch: WorkforceBranch = {
        id: `branch-${Date.now()}`,
        name: branchName,
        city: branchCity,
        state: branchState,
        address: branchAddress,
        isHeadquarters: branchIsHQ,
        managerName: branchManager,
      };
      createBranch(newBranch);
    }
    setIsBranchModalOpen(false);
  };

  return (
    <ErpAdminShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 1 · Organizational Architecture
              </span>
              <span className="text-xs text-zinc-500">WorkforceOS Governance</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-emerald-500" />
              Departments, Branches & Org Chart
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Configure corporate divisions, operating branches, departmental budgets, and visual reporting structures.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <NexaButton
              variant="outline"
              size="sm"
              onClick={openCreateBranchModal}
              className="text-xs border-zinc-700 hover:border-zinc-500 text-zinc-200"
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              New Branch
            </NexaButton>
            <NexaButton
              variant="primary"
              size="sm"
              onClick={openCreateDeptModal}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm shadow-emerald-900/40"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Department
            </NexaButton>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Departments</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{totalDepartments}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">Active Governance Units</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Operating Branches</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{totalBranches}</p>
              <p className="text-[11px] text-blue-400 mt-0.5">Across Nigeria</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Headcount Fill Rate</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">
                {totalActiveHeadcount} <span className="text-sm font-normal text-zinc-400">/ {totalTargetHeadcount}</span>
              </p>
              <p className="text-[11px] text-amber-400 mt-0.5">
                {totalTargetHeadcount > 0 ? Math.round((totalActiveHeadcount / totalTargetHeadcount) * 100) : 0}% Capacity
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Monthly Payroll Budget</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">
                ₦{(totalMonthlyBudget / 1000000).toFixed(1)}M
              </p>
              <p className="text-[11px] text-emerald-400 mt-0.5">Total Ceiling</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* View Selection Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveTab("departments")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "departments"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" />
              Departments ({departments.length})
            </button>
            <button
              onClick={() => setActiveTab("branches")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "branches"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-blue-400" />
              Branches & Locations ({branches.length})
            </button>
            <button
              onClick={() => setActiveTab("org_chart")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "org_chart"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Network className="w-3.5 h-3.5 inline mr-1.5 text-amber-400" />
              Visual Org Chart
            </button>
          </div>

          {activeTab !== "org_chart" && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />
            </div>
          )}
        </div>

        {/* TAB 1: DEPARTMENTS DIRECTORY */}
        {activeTab === "departments" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDepartments.map((dept) => {
              const fillPercent =
                dept.targetHeadcount > 0
                  ? Math.min(100, Math.round((dept.activeHeadcount / dept.targetHeadcount) * 100))
                  : 0;

              return (
                <div
                  key={dept.id}
                  className="rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-800 text-emerald-400 border border-zinc-700">
                            {dept.code}
                          </span>
                          <h3 className="font-semibold text-zinc-100 text-base">{dept.name}</h3>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{dept.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditDeptModal(dept)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                          title="Edit Department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${dept.name}?`)) {
                              deleteDepartment(dept.id);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 py-3 border-y border-zinc-800/80 my-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
                          Department Head:
                        </span>
                        <span className="font-medium text-zinc-200">{dept.headPersonName}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                          Monthly Budget:
                        </span>
                        <span className="font-mono text-zinc-200">₦{dept.budgetMonthly.toLocaleString()}</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-zinc-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-zinc-500" />
                            Headcount Fill:
                          </span>
                          <span className="text-zinc-300 font-medium">
                            {dept.activeHeadcount} / {dept.targetHeadcount} ({fillPercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              fillPercent >= 80
                                ? "bg-emerald-500"
                                : fillPercent >= 50
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href={`/erp/admin/workforce/people?dept=${encodeURIComponent(dept.name)}`}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                    >
                      View Team Directory
                      <ChevronRight className="w-3 h-3" />
                    </Link>

                    <Link
                      href={`/erp/admin/workforce/recruitment?dept=${encodeURIComponent(dept.name)}`}
                      className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                    >
                      <Briefcase className="w-3 h-3 text-zinc-500" />
                      Open Roles
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: BRANCHES & OPERATING LOCATIONS */}
        {activeTab === "branches" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className="rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {branch.isHeadquarters ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            HQ Office
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Regional Hub
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-zinc-100 text-base mt-2">{branch.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditBranchModal(branch)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                        title="Edit Branch"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${branch.name}?`)) {
                            deleteBranch(branch.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 py-3 border-y border-zinc-800/80 my-3 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      <span className="text-zinc-300 leading-relaxed">{branch.address}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-zinc-400">Jurisdiction:</span>
                      <span className="font-medium text-zinc-200">
                        {branch.city}, {branch.state}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Branch Operations Lead:</span>
                      <span className="font-medium text-zinc-200">{branch.managerName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Geofenced Clock-In Ready</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Facility
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: INTERACTIVE VISUAL ORGANISATIONAL CHART */}
        {activeTab === "org_chart" && (
          <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 overflow-x-auto">
            <div className="min-w-[850px] flex flex-col items-center space-y-8">
              {/* LEVEL 1: EXECUTIVE LEADERSHIP */}
              <div className="flex flex-col items-center">
                <div className="px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/40 text-center shadow-lg shadow-black/40 min-w-[280px]">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300">
                    Executive Leadership
                  </span>
                  <h4 className="text-base font-bold text-zinc-100 mt-2">Managing Director & CEO</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Ifeanyi Felix · Group Direction</p>
                  <div className="flex items-center justify-center gap-2 mt-2.5 text-[11px] text-zinc-500">
                    <span>Ofia Enterprise Suite</span>
                    <span>·</span>
                    <span>All Business Units</span>
                  </div>
                </div>
                {/* Connecting Line Down */}
                <div className="w-px h-8 bg-zinc-700" />
              </div>

              {/* LEVEL 2: DEPARTMENT HEADS */}
              <div className="w-full">
                <div className="relative flex justify-around items-start pt-4 before:content-[''] before:absolute before:top-0 before:left-[10%] before:right-[10%] before:h-px before:bg-zinc-700">
                  {departments.slice(0, 5).map((dept) => {
                    const deptMembers = people.filter(
                      (p) =>
                        p.department.toLowerCase() === dept.name.toLowerCase() ||
                        p.department.toLowerCase().includes(dept.code.toLowerCase())
                    );

                    return (
                      <div key={dept.id} className="flex flex-col items-center w-48 relative">
                        {/* Connecting Line From Horizontal Header */}
                        <div className="w-px h-4 bg-zinc-700 absolute -top-4" />

                        {/* Head Card */}
                        <div className="w-full p-3.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-center hover:border-emerald-500/50 transition-all shadow-md shadow-black/20">
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold">
                            {dept.code}
                          </span>
                          <h5 className="text-xs font-semibold text-zinc-100 mt-1 truncate">{dept.name}</h5>
                          <p className="text-[11px] text-emerald-400 font-medium mt-1 truncate">
                            {dept.headPersonName}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Head of Department</p>

                          <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
                            <span>Team:</span>
                            <span className="font-mono text-zinc-200 font-medium">
                              {deptMembers.length > 0 ? deptMembers.length : dept.activeHeadcount} staff
                            </span>
                          </div>
                        </div>

                        {/* Line to Team Members */}
                        <div className="w-px h-6 bg-zinc-800" />

                        {/* LEVEL 3: SAMPLE TEAM ROSTER */}
                        <div className="w-full space-y-1.5">
                          {deptMembers.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80 text-left hover:border-zinc-700 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium text-zinc-200 truncate">{member.name}</span>
                                <span
                                  className={`text-[9px] px-1 rounded uppercase font-bold ${
                                    member.role === "intern"
                                      ? "bg-amber-500/10 text-amber-400"
                                      : "bg-emerald-500/10 text-emerald-400"
                                  }`}
                                >
                                  {member.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{member.designation}</p>
                            </div>
                          ))}

                          {deptMembers.length > 3 && (
                            <Link
                              href={`/erp/admin/workforce/people?dept=${encodeURIComponent(dept.name)}`}
                              className="block text-center text-[10px] text-zinc-500 hover:text-emerald-400 py-1 transition-colors"
                            >
                              + {deptMembers.length - 3} more members
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE / EDIT DEPARTMENT */}
        {isDeptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  {editingDeptId ? "Edit Department" : "Create New Department"}
                </h3>
                <button
                  onClick={() => setIsDeptModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-zinc-400 font-medium">Department Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Technology & Engineering"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium">Code (e.g. TECH)</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="TECH"
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 uppercase font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium">Department Head</label>
                  <select
                    value={deptHeadName}
                    onChange={(e) => {
                      setDeptHeadName(e.target.value);
                      const matched = people.find((p) => p.name === e.target.value);
                      if (matched) setDeptHeadId(matched.id);
                    }}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.designation})
                      </option>
                    ))}
                    <option value="Unassigned">Unassigned (Vacant)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium">Monthly Budget (₦)</label>
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      value={deptBudget}
                      onChange={(e) => setDeptBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium">Target Headcount</label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={deptTargetHeadcount}
                      onChange={(e) => setDeptTargetHeadcount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium">Department Mission & Scope</label>
                  <textarea
                    rows={3}
                    placeholder="Describe key responsibilities and operational mandates..."
                    value={deptDescription}
                    onChange={(e) => setDeptDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <NexaButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeptModalOpen(false)}
                    className="text-xs border-zinc-700"
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  >
                    {editingDeptId ? "Save Changes" : "Create Department"}
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE / EDIT BRANCH */}
        {isBranchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {editingBranchId ? "Edit Branch" : "Add Operating Branch"}
                </h3>
                <button
                  onClick={() => setIsBranchModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBranch} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium">Branch Facility Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lagos Executive Headquarters"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Lagos, Abuja, etc."
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium">State</label>
                    <input
                      type="text"
                      required
                      placeholder="Lagos State, FCT, etc."
                      value={branchState}
                      onChange={(e) => setBranchState(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium">Physical Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Plot 12, Adeola Odeku Street, Victoria Island"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium">Branch Operations Lead</label>
                  <select
                    value={branchManager}
                    onChange={(e) => setBranchManager(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.department})
                      </option>
                    ))}
                    <option value="Branch Manager">Generic Facility Lead</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isHQ"
                    checked={branchIsHQ}
                    onChange={(e) => setBranchIsHQ(e.target.checked)}
                    className="rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <label htmlFor="isHQ" className="text-zinc-300 font-medium cursor-pointer">
                    Mark as National Corporate Headquarters (HQ)
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <NexaButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBranchModalOpen(false)}
                    className="text-xs border-zinc-700"
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium"
                  >
                    {editingBranchId ? "Save Changes" : "Create Branch"}
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
