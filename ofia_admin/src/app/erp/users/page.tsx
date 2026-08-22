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
} from "lucide-react";
import { SuperAdminShell } from "@/components/admin/SuperAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

type ERPUserRole = "employee" | "manager" | "hr" | "accountant" | "md" | "admin";

interface ERPUser {
  id: string;
  name: string;
  email: string;
  role: ERPUserRole;
  department: string;
  designation: string;
  managerName?: string;
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
}

const INITIAL_ERP_USERS: ERPUser[] = [
  { id: "MD001", name: "Ifeanyi Ibeh", email: "ifeanyi.i@neweratransport.com", role: "md", department: "Executive Management", designation: "Managing Director / CEO", status: "ACTIVE" },
  { id: "HR001", name: "Goldy Okeke", email: "goldy.o@neweratransport.com", role: "hr", department: "Human Resources", designation: "HR Executive Lead", status: "ACTIVE" },
  { id: "ACC001", name: "Oluwatobiloba Olateju", email: "olateju.o@neweratransport.com", role: "accountant", department: "Finance & Accounts", designation: "Head of Finance / CFO", status: "ACTIVE" },
  { id: "ACC002", name: "Queen Okonkwo", email: "queen.o@neweratransport.com", role: "accountant", department: "Finance & Accounts", designation: "Senior Accountant", status: "ACTIVE" },
  { id: "MGR001", name: "Babajide Sanwo", email: "sanwo.b@neweratransport.com", role: "manager", department: "Fleet Operations", designation: "Fleet Operations Manager", status: "ACTIVE" },
  { id: "EMP001", name: "Sunday Johnson", email: "sunday.j@neweratransport.com", role: "employee", department: "Fleet Operations", designation: "Fleet Support Officer", managerName: "Babajide Sanwo", status: "ACTIVE" },
  { id: "ADM001", name: "System Administrator", email: "admin@neweratransport.com", role: "admin", department: "Systems & IT", designation: "IT / ERP Lead", status: "ACTIVE" },
];

export default function ERPUsersPage() {
  const [users, setUsers] = useState<ERPUser[]>(INITIAL_ERP_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<ERPUserRole>("employee");

  const handleRoleChange = (id: string, newRole: ERPUserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
    setEditingUserId(null);
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
    <SuperAdminShell
      title="ERP User & 6-Tier Role Governance"
      subtitle="Manage corporate staff accounts and enforce Role-Based Access Control (Employee, Manager, HR, Accountant, MD, Admin)."
      action={
        <div className="flex items-center gap-2">
          <NexaBadge variant="cyan" className="py-1 px-3 text-xs font-bold font-mono">
            {users.length} Total Accounts
          </NexaBadge>
        </div>
      }
    >
      <div className="space-y-4">
        {/* FILTERS */}
        <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#9061F9]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
            {["ALL", "admin", "md", "accountant", "hr", "manager", "employee"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  roleFilter === r
                    ? "bg-[#9061F9] text-white"
                    : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                {r === "md" ? "MD (Exec)" : r}
              </button>
            ))}
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] font-semibold">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Department & Designation</th>
                <th className="py-3 px-3">Reporting Line</th>
                <th className="py-3 px-3">Access Role</th>
                <th className="py-3 px-4 text-right">RBAC Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold">{user.name}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">{user.email} • {user.id}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-[var(--nexa-text-primary)]">{user.department}</div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">{user.designation}</div>
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-[var(--nexa-text-muted)]">
                    {user.managerName ? `Reports to: ${user.managerName}` : "—"}
                  </td>
                  <td className="py-3.5 px-3">
                    {editingUserId === user.id ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as ERPUserRole)}
                        className="px-2 py-1 text-xs rounded-lg bg-[var(--nexa-bg-base)] border border-[#9061F9] text-[var(--nexa-text-primary)]"
                      >
                        <option value="employee">employee</option>
                        <option value="manager">manager</option>
                        <option value="hr">hr</option>
                        <option value="accountant">accountant</option>
                        <option value="md">md</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <NexaBadge
                        variant={
                          user.role === "admin" || user.role === "md"
                            ? "coral"
                            : user.role === "accountant"
                            ? "brand"
                            : user.role === "hr"
                            ? "purple"
                            : user.role === "manager"
                            ? "green"
                            : "neutral"
                        }
                        className="uppercase text-[9px] font-bold"
                      >
                        {user.role}
                      </NexaBadge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <NexaButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleRoleChange(user.id, selectedRole)}
                          className="bg-[#0E9F6E] text-white"
                        >
                          Save
                        </NexaButton>
                        <NexaButton size="sm" variant="ghost" onClick={() => setEditingUserId(null)}>
                          Cancel
                        </NexaButton>
                      </div>
                    ) : (
                      <NexaButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUserId(user.id);
                          setSelectedRole(user.role);
                        }}
                      >
                        Change Role
                      </NexaButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminShell>
  );
}
