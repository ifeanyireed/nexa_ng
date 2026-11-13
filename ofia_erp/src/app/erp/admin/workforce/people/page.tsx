"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Award,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  X,
  Phone,
  Mail,
  Network,
  FileText,
  Plus,
  Edit2,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import { WorkforcePerson, WorkforceRoleCategory } from "@/lib/workforce-types";

export default function PeopleDirectoryPage() {
  const { people, addPerson, updatePersonProfile } = useWorkforceManager();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [selectedPerson, setSelectedPerson] = useState<WorkforcePerson | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "deployment" | "history">("overview");

  // Edit Profile State
  const [editingPerson, setEditingPerson] = useState<WorkforcePerson | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<WorkforceRoleCategory>("employee");
  const [editDesignation, setEditDesignation] = useState("");
  const [editDept, setEditDept] = useState("Technology");
  const [editStatus, setEditStatus] = useState<"active" | "deployed" | "bench" | "leave" | "offboarded">("active");
  const [editLocation, setEditLocation] = useState("Lagos Headquarters");
  const [editManager, setEditManager] = useState("");

  const handleOpenEdit = (p: WorkforcePerson) => {
    setEditingPerson(p);
    setEditName(p.name);
    setEditEmail(p.email);
    setEditPhone(p.phone);
    setEditRole(p.role);
    setEditDesignation(p.designation);
    setEditDept(p.department);
    setEditStatus(p.status);
    setEditLocation(p.location);
    setEditManager(p.managerName || "Department Head");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson) return;

    updatePersonProfile(editingPerson.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      designation: editDesignation,
      department: editDept,
      status: editStatus,
      location: editLocation,
      managerName: editManager,
    });

    if (selectedPerson && selectedPerson.id === editingPerson.id) {
      setSelectedPerson((prev) =>
        prev
          ? {
              ...prev,
              name: editName,
              email: editEmail,
              phone: editPhone,
              role: editRole,
              designation: editDesignation,
              department: editDept,
              status: editStatus,
              location: editLocation,
              managerName: editManager,
            }
          : null
      );
    }

    setEditingPerson(null);
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<WorkforceRoleCategory>("employee");
  const [newDesignation, setNewDesignation] = useState("");
  const [newDept, setNewDept] = useState("Technology");
  const [newLocation, setNewLocation] = useState("Lagos Headquarters");

  const filteredPeople = people.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "ALL" || p.role === roleFilter;
    const matchesDept = departmentFilter === "ALL" || p.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const person: WorkforcePerson = {
      id: `person-${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || "+234 800 000 0000",
      role: newRole,
      designation: newDesignation || "Operations Staff",
      department: newDept,
      status: "active",
      location: newLocation,
      joinDate: new Date().toISOString().split("T")[0],
      managerName: "Department Head",
      competencyScore: 90,
      skills: [{ name: "Core Business Protocol", level: "Intermediate", verified: true }],
      activeTasksCount: 0,
      attendanceRate: 100,
    };

    addPerson(person);
    setIsAddModalOpen(false);
    setNewName("");
    setNewEmail("");
    setNewDesignation("");
  };

  return (
    <ErpAdminShell
      title="People Management & Directory"
      subtitle="Module 02 · Unified permanent person records across employees, interns, contractors, and consultants."
      activeModule="workforce"
      action={
        <NexaButton
          size="sm"
          variant="primary"
          className="gap-2 text-xs"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Workforce Profile
        </NexaButton>
      }
    >
      <div className="space-y-8">
        {/* SUMMARY STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Full-Time Employees</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {people.filter((p) => p.role === "employee").length}
            </p>
            <p className="text-xs text-nexa-text-secondary mt-1">Permanent core staff</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Active Academy Interns</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {people.filter((p) => p.role === "intern").length}
            </p>
            <p className="text-xs text-purple-400 mt-1 font-medium">Cohort 2027-Alpha</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Contractors & Specialists</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {people.filter((p) => p.role === "contractor" || p.role === "consultant").length}
            </p>
            <p className="text-xs text-nexa-text-secondary mt-1">Field & technical specialists</p>
          </div>
          <div className="p-5 bg-nexa-surface border border-nexa-border rounded-xl">
            <span className="text-xs font-semibold text-nexa-text-secondary uppercase">Currently Deployed</span>
            <p className="text-2xl font-bold text-nexa-text-primary mt-1">
              {people.filter((p) => p.status === "deployed").length}
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Outsourced on client contracts</p>
          </div>
        </section>

        {/* SEARCH AND FILTER BAR */}
        <section className="p-5 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-nexa-text-secondary" />
              <input
                type="text"
                placeholder="Search staff by name, designation, skill (e.g. Cisco, PostgreSQL, Compliance)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-2 px-3 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="employee">Employees</option>
                <option value="intern">Interns</option>
                <option value="contractor">Contractors</option>
                <option value="consultant">Consultants</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="py-2 px-3 text-xs rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                <option value="Technology">Technology</option>
                <option value="Operations">Operations</option>
                <option value="Compliance Hub">Compliance Hub</option>
                <option value="Customer Success">Customer Success</option>
              </select>
            </div>
          </div>

          {/* PEOPLE CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className="p-5 bg-nexa-surface/70 rounded-xl border border-nexa-border hover:border-blue-500/50 transition-all cursor-pointer space-y-4 group shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-nexa-text-primary group-hover:text-blue-500 transition-colors">
                        {person.name}
                      </h3>
                      <NexaBadge
                        variant={person.status === "deployed" ? "primary" : "secondary"}
                        className="text-[10px] capitalize py-0"
                      >
                        {person.status}
                      </NexaBadge>
                    </div>
                    <p className="text-xs text-nexa-text-secondary font-medium">{person.designation}</p>
                    <p className="text-[11px] text-nexa-text-secondary flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-400" /> {person.department}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-nexa-surface border border-nexa-border text-nexa-text-secondary">
                    {person.role}
                  </span>
                </div>

                {person.currentClient && (
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center justify-between">
                    <span>Deployed to:</span>
                    <span className="font-semibold text-cyan-200">{person.currentClient}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-nexa-text-secondary">Verified Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {person.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-nexa-surface border border-nexa-border text-nexa-text-secondary flex items-center gap-1"
                      >
                        {s.name}
                        {s.verified && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-nexa-border/60 flex items-center justify-between text-xs text-nexa-text-secondary">
                  <span>Score: {person.competencyScore}%</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(person);
                      }}
                      className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 font-medium transition-colors flex items-center gap-1 text-[11px]"
                      title="Edit Staff Profile"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <span className="text-blue-500 font-semibold group-hover:underline flex items-center gap-1">
                      Quick View
                    </span>
                    <Link
                      href={`/erp/admin/workforce/people/${person.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      Full Dossier &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 14-POINT INDIVIDUAL PROFILE DRAWER / MODAL */}
        {selectedPerson && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-4 border-b border-nexa-border">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-400">
                    {selectedPerson.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-nexa-text-primary">{selectedPerson.name}</h3>
                      <NexaBadge variant="secondary" className="uppercase font-mono text-[10px]">
                        {selectedPerson.role}
                      </NexaBadge>
                      <NexaBadge
                        variant={selectedPerson.status === "deployed" ? "primary" : "secondary"}
                        className="text-[10px]"
                      >
                        {selectedPerson.status}
                      </NexaBadge>
                    </div>
                    <p className="text-sm text-nexa-text-secondary">{selectedPerson.designation} · {selectedPerson.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <NexaButton
                    size="sm"
                    variant="secondary"
                    className="gap-1.5 text-xs"
                    onClick={() => handleOpenEdit(selectedPerson)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </NexaButton>
                  <Link
                    href={`/erp/admin/workforce/people/${selectedPerson.id}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    Open Full 14-Tab Dossier &rarr;
                  </Link>
                  <button
                    onClick={() => setSelectedPerson(null)}
                    className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-nexa-border gap-6 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-500"
                      : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
                  }`}
                >
                  Overview & Contact
                </button>
                <button
                  onClick={() => setActiveTab("skills")}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === "skills"
                      ? "border-blue-500 text-blue-500"
                      : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
                  }`}
                >
                  Skills & Competencies
                </button>
                <button
                  onClick={() => setActiveTab("deployment")}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === "deployment"
                      ? "border-blue-500 text-blue-500"
                      : "border-transparent text-nexa-text-secondary hover:text-nexa-text-primary"
                  }`}
                >
                  Client Deployments
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-nexa-text-secondary block">Official Email</span>
                    <span className="font-semibold text-nexa-text-primary">{selectedPerson.email}</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">Mobile Phone</span>
                    <span className="font-semibold text-nexa-text-primary">{selectedPerson.phone}</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">Primary Location</span>
                    <span className="font-semibold text-nexa-text-primary">{selectedPerson.location}</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">Assigned Reporting Manager</span>
                    <span className="font-semibold text-nexa-text-primary">{selectedPerson.managerName}</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">Employment / Onboarding Date</span>
                    <span className="font-semibold text-nexa-text-primary">{selectedPerson.joinDate}</span>
                  </div>
                  <div>
                    <span className="text-nexa-text-secondary block">Historical Attendance Rate</span>
                    <span className="font-semibold text-emerald-400">{selectedPerson.attendanceRate}%</span>
                  </div>
                </div>
              )}

              {/* TAB 2: SKILLS */}
              {activeTab === "skills" && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-semibold text-nexa-text-primary">Verified Competency Framework</h4>
                  <div className="space-y-2">
                    {selectedPerson.skills.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-nexa-surface/60 border border-nexa-border flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-nexa-text-primary block">{s.name}</span>
                          <span className="text-[11px] text-nexa-text-secondary">Proficiency: {s.level}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Certified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DEPLOYMENT */}
              {activeTab === "deployment" && (
                <div className="space-y-4 text-xs">
                  {selectedPerson.currentClient ? (
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-200 text-sm">Active Contract Assignment</span>
                        <NexaBadge variant="primary">Active</NexaBadge>
                      </div>
                      <p className="text-xs text-nexa-text-secondary">
                        Client Account: <span className="font-bold text-nexa-text-primary">{selectedPerson.currentClient}</span>
                      </p>
                      <p className="text-xs text-nexa-text-secondary">
                        Designated Role: <span className="font-medium text-nexa-text-primary">{selectedPerson.designation}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-nexa-border rounded-xl text-nexa-text-secondary">
                      <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>This team member is currently available on the internal bench.</p>
                      <Link href="/erp/admin/workforce/deployment" className="text-blue-500 font-semibold text-xs mt-2 inline-block">
                        Allocate to Client Project &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADD WORKFORCE PROFILE MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <h3 className="text-base font-bold text-nexa-text-primary">New Workforce Profile</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePerson} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Adeola Johnson"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="adeola@ofia.ng"
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Engagement Category</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as WorkforceRoleCategory)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                    >
                      <option value="employee">Full-Time Employee</option>
                      <option value="intern">Academy Intern</option>
                      <option value="contractor">Specialist Contractor</option>
                      <option value="consultant">Consultant</option>
                    </select>
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

                <div>
                  <label className="block text-nexa-text-secondary mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    placeholder="e.g. Associate Cloud Engineer"
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Save Person Profile
                  </NexaButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT WORKFORCE PROFILE MODAL */}
        {editingPerson && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-nexa-surface border border-nexa-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-nexa-border">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-500" />
                  <h3 className="text-base font-bold text-nexa-text-primary">Edit Workforce Profile</h3>
                </div>
                <button
                  onClick={() => setEditingPerson(null)}
                  className="p-1 rounded-lg hover:bg-nexa-surface/80 text-nexa-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-nexa-text-secondary mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Engagement Category</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as WorkforceRoleCategory)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="employee">Full-Time Employee</option>
                      <option value="intern">Academy Intern</option>
                      <option value="contractor">Specialist Contractor</option>
                      <option value="consultant">Consultant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Department</label>
                    <select
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Operations">Operations</option>
                      <option value="Compliance Hub">Compliance Hub</option>
                      <option value="Customer Success">Customer Success</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Designation / Title</label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="deployed">Deployed</option>
                      <option value="bench">Bench</option>
                      <option value="leave">On Leave</option>
                      <option value="offboarded">Offboarded</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Reporting Manager</label>
                    <input
                      type="text"
                      value={editManager}
                      onChange={(e) => setEditManager(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-nexa-surface border border-nexa-border text-nexa-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-nexa-border flex justify-end gap-2">
                  <NexaButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingPerson(null)}
                  >
                    Cancel
                  </NexaButton>
                  <NexaButton type="submit" size="sm" variant="primary">
                    Update Profile
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
