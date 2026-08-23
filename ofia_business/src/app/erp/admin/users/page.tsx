"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Filter,
  Lock,
  Mail,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Briefcase,
  Building2,
  Sliders,
  Sparkles,
  Edit3,
  X,
  Key,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { RoleKey } from "@/lib/access-control";

interface ERPStaffUser {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  department: string;
  designation: string;
  managerName?: string;
  avatar: string;
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
}

const INITIAL_STAFF_USERS: ERPStaffUser[] = [
  { id: "USR-001", name: "Adeyemi Phillips", email: "admin@edusuite.ng", role: "admin", department: "Executive Directorate", designation: "Tenant Administrator / Operations Lead", avatar: "/character1.jpg", status: "ACTIVE" },
  { id: "USR-002", name: "Dr. Babatunde Jinadu", email: "md@edusuite.ng", role: "md", department: "Executive Directorate", designation: "Managing Director / CEO", avatar: "/character2.jpg", status: "ACTIVE" },
  { id: "USR-003", name: "Goldy Okeke", email: "hr@edusuite.ng", role: "hr", department: "Human Resources & Talent", designation: "HR Lead / People Ops", avatar: "/character3.jpg", status: "ACTIVE" },
  { id: "USR-004", name: "Oluwatobiloba Olateju", email: "accountant@edusuite.ng", role: "accountant", department: "Finance & Accounts", designation: "Chief Accountant / Controller", avatar: "/character4.jpg", status: "ACTIVE" },
  { id: "USR-005", name: "Chioma Okonkwo", email: "marketing@edusuite.ng", role: "marketer", department: "Commercial & Growth", designation: "Growth & CRM Lead", avatar: "/character5.jpg", status: "ACTIVE" },
  { id: "USR-006", name: "Babajide Sanwo", email: "manager@edusuite.ng", role: "manager", department: "Fleet & Warehouse Operations", designation: "Operations Line Manager", avatar: "/character6.jpg", status: "ACTIVE" },
  { id: "USR-007", name: "Sunday Johnson", email: "employee@edusuite.ng", role: "employee", department: "Fleet & Warehouse Operations", designation: "Operations Officer", managerName: "Babajide Sanwo", avatar: "/character7.jpg", status: "ACTIVE" },
  { id: "USR-008", name: "Chinedu Eze", email: "cashier@edusuite.ng", role: "cashier", department: "Retail & Front Desk", designation: "Lead POS Terminal Cashier", managerName: "Babajide Sanwo", avatar: "/character8.jpg", status: "ACTIVE" },
  { id: "USR-009", name: "Ngozi Obi", email: "inventory@edusuite.ng", role: "inventory_officer", department: "Supply Chain & Depot", designation: "Central Warehouse Inventory Officer", managerName: "Babajide Sanwo", avatar: "/character9.jpg", status: "ACTIVE" },
  { id: "USR-010", name: "Ibrahim Musa", email: "dispatch@edusuite.ng", role: "dispatcher", department: "Logistics & Fulfillment", designation: "Zonal Route Dispatcher", managerName: "Babajide Sanwo", avatar: "/character10.jpg", status: "ACTIVE" },
];

const DEPARTMENTS = [
  "Executive Directorate",
  "Human Resources & Talent",
  "Finance & Accounts",
  "Commercial & Growth",
  "Fleet & Warehouse Operations",
  "Retail & Front Desk",
  "Supply Chain & Depot",
  "Logistics & Fulfillment",
  "Systems & IT",
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<ERPStaffUser[]>(INITIAL_STAFF_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleKey>("employee");

  // Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<RoleKey>("employee");
  const [newDepartment, setNewDepartment] = useState(DEPARTMENTS[0]);
  const [newDesignation, setNewDesignation] = useState("");
  const [newManager, setNewManager] = useState("");

  const handleRoleChange = (id: string, updatedRole: RoleKey) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: updatedRole } : u))
    );
    setEditingUserId(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const avatarNum = (users.length % 20) + 1;
    const newUser: ERPStaffUser = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDepartment,
      designation: newDesignation || "Corporate Officer",
      managerName: newManager || undefined,
      avatar: `/character${avatarNum}.jpg`,
      status: "ACTIVE",
    };

    setUsers([newUser, ...users]);
    setIsAddUserModalOpen(false);
    setNewName("");
    setNewEmail("");
    setNewDesignation("");
    setNewManager("");
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase()) ||
      u.designation.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <ErpAdminShell
      title="User Management & Staff Directory"
      subtitle="Corporate identity governance, 10-tier role assignment, departmental structure, and reporting hierarchy."
      action={
        <div className="flex items-center gap-2">
          <NexaButton
            size="sm"
            variant="primary"
            onClick={() => setIsAddUserModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white"
          >
            Add Staff Member
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-4 font-sans">
        {/* KPI COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Total Staff Accounts
            </span>
            <p className="text-xl font-black font-mono text-[var(--nexa-text-primary)] mt-1">
              {users.length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Active Status
            </span>
            <p className="text-xl font-black font-mono text-emerald-500 mt-1">
              {users.filter((u) => u.status === "ACTIVE").length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Departments Active
            </span>
            <p className="text-xl font-black font-mono text-[#1A56DB] mt-1">
              {new Set(users.map((u) => u.department)).size}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              RBAC Role Personas
            </span>
            <p className="text-xl font-black font-mono text-purple-500 mt-1">
              10 Roles
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
            {["ALL", "admin", "md", "hr", "accountant", "marketer", "manager", "employee", "cashier", "inventory_officer", "dispatcher"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  roleFilter === r
                    ? "bg-[#1A56DB] text-white shadow-xs font-bold"
                    : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]"
                }`}
              >
                {r === "md" ? "MD (Exec)" : r.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Department & Designation</th>
                <th className="py-3 px-3">Reporting Manager</th>
                <th className="py-3 px-3">Active RBAC Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Role Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[var(--nexa-border)] shadow-xs"
                      />
                      <div>
                        <div className="font-bold text-[var(--nexa-text-primary)]">{user.name}</div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">{user.email} • {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-[var(--nexa-text-primary)]">{user.department}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">{user.designation}</div>
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-[var(--nexa-text-muted)]">
                    {user.managerName ? (
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {user.managerName}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    {editingUserId === user.id ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as RoleKey)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[var(--nexa-bg-base)] border border-[#1A56DB] text-[var(--nexa-text-primary)] outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="md">MD (Executive)</option>
                        <option value="hr">HR</option>
                        <option value="accountant">Accountant</option>
                        <option value="marketer">Marketer</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                        <option value="cashier">POS Cashier</option>
                        <option value="inventory_officer">Inventory Officer</option>
                        <option value="dispatcher">Dispatcher</option>
                      </select>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20">
                        {user.role.replace("_", " ")}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {editingUserId === user.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRoleChange(user.id, selectedRole)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setSelectedRole(user.role);
                        }}
                        className="px-3 py-1 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] hover:border-[#1A56DB] font-semibold transition-colors cursor-pointer text-xs"
                      >
                        Reassign Role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STAFF USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h2 className="text-base font-black text-[var(--nexa-text-primary)]">
                  Add Corporate Staff Member
                </h2>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Onboard a new user and configure their department and 10-tier access role.
                </p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Ade"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="samuel@edusuite.ng"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Department
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Assigned Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as RoleKey)}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="marketer">Growth Marketer</option>
                    <option value="hr">Human Resources</option>
                    <option value="accountant">Chief Accountant</option>
                    <option value="cashier">POS Cashier</option>
                    <option value="inventory_officer">Inventory Officer</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="md">Managing Director (MD)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Billing Specialist"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Reporting Manager
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Babajide Sanwo"
                    value={newManager}
                    onChange={(e) => setNewManager(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-end gap-2">
                <NexaButton
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="primary"
                  type="submit"
                  className="bg-[#1A56DB] text-white"
                >
                  Save & Onboard Staff
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpAdminShell>
  );
}
