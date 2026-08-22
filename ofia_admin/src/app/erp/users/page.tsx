"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  CheckCircle2,
  Filter,
  Plus,
  ShieldCheck,
  Building2,
  Mail,
  Edit2,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";

export type ERPRole = "employee" | "manager" | "hr" | "accountant" | "md" | "admin";

export default function ERPUsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [staffList, setStaffList] = useState([
    { id: "EMP-001", name: "Oluwatobiloba Olateju", email: "olateju.o@ofia.ng", role: "accountant", department: "Finance & Accounts", manager: "Ifeanyi Ibeh (MD)", designation: "Chief Financial Officer" },
    { id: "EMP-002", name: "Queen Okonkwo", email: "queen.o@ofia.ng", role: "accountant", department: "Finance & Accounts", manager: "Oluwatobiloba Olateju", designation: "Finance Lead" },
    { id: "EMP-003", name: "Ifeanyi Ibeh", email: "ifeanyi.i@ofia.ng", role: "md", department: "Executive Office", manager: "Board of Directors", designation: "Managing Director" },
    { id: "EMP-004", name: "Goldy Nnanna", email: "goldy.n@ofia.ng", role: "hr", department: "Human Resources", manager: "Ifeanyi Ibeh (MD)", designation: "HR Executive Lead" },
    { id: "EMP-005", name: "Emeka Alabi", email: "emeka.a@ofia.ng", role: "manager", department: "Fleet Operations", manager: "Ifeanyi Ibeh (MD)", designation: "Fleet Operations Manager" },
    { id: "EMP-006", name: "Samuel Adebayo", email: "samuel.a@ofia.ng", role: "employee", department: "Fleet Operations", manager: "Emeka Alabi", designation: "Fleet Supervisor" },
    { id: "EMP-007", name: "Kester Briggs", email: "kester.b@ofia.ng", role: "admin", department: "Systems and IT", manager: "Ifeanyi Ibeh (MD)", designation: "Lead Systems Architect" },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateRole = (newRole: ERPRole) => {
    if (!selectedUser) return;
    setStaffList((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
    );
    setSelectedUser(null);
    showToast(`Role updated to '${newRole}' for ${selectedUser.name}.`);
  };

  const filteredStaff = staffList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "md": return "purple";
      case "admin": return "brand";
      case "accountant": return "cyan";
      case "hr": return "brand";
      case "manager": return "neutral";
      default: return "neutral";
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-[#7E3AF2] text-white text-xs font-bold shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {toastMessage}
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/erp" className="text-xs font-bold text-[#7E3AF2] hover:underline">
                ← ERP Admin
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--nexa-text-primary)] flex items-center gap-2.5 mt-1">
              <UserCheck className="w-6 h-6 text-[#7E3AF2]" />
              Enterprise Staff & 6 RBAC Access Roles
            </h1>
            <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] mt-1">
              Assign roles (`employee`, `manager`, `hr`, `accountant`, `md`, `admin`) and configure managerial approval chains.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NexaBadge variant="purple">{staffList.length} Active Staff</NexaBadge>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)]" />
            <input
              type="text"
              placeholder="Search staff by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#7E3AF2]"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            {(["ALL", "employee", "manager", "hr", "accountant", "md", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  roleFilter === r
                    ? "bg-[#7E3AF2] text-white shadow-sm"
                    : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)] hover:text-[var(--nexa-text-primary)]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* STAFF ROSTER TABLE */}
        <NexaCard variant="glass" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-muted)] border-b border-[var(--nexa-border)] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Staff Member & Email</th>
                  <th className="py-3 px-4">Designation & Dept</th>
                  <th className="py-3 px-4">Manager</th>
                  <th className="py-3 px-4">Access Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] font-medium">
                {filteredStaff.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--nexa-bg-surface)]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--nexa-text-primary)]">{u.name}</div>
                      <div className="text-[11px] font-mono text-[var(--nexa-text-muted)]">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[var(--nexa-text-primary)]">{u.designation}</div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">{u.department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--nexa-text-secondary)]">{u.manager}</td>
                    <td className="py-3.5 px-4">
                      <NexaBadge variant={getRoleBadgeVariant(u.role) as any}>
                        {u.role.toUpperCase()}
                      </NexaBadge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <NexaButton
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUser(u)}
                        leftIcon={<Edit2 className="w-3 h-3" />}
                      >
                        Edit Role
                      </NexaButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NexaCard>

        {/* ROLE MODAL */}
        {selectedUser && (
          <NexaModal
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            title={`Modify Role for ${selectedUser.name}`}
          >
            <div className="space-y-4 text-xs">
              <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
                Select the new ERP RBAC role for <strong>{selectedUser.name}</strong> ({selectedUser.designation}):
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(["employee", "manager", "hr", "accountant", "md", "admin"] as ERPRole[]).map((roleKey) => (
                  <button
                    key={roleKey}
                    onClick={() => handleUpdateRole(roleKey)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedUser.role === roleKey
                        ? "border-[#7E3AF2] bg-[#7E3AF2]/10 font-bold text-[#7E3AF2]"
                        : "border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:border-[#7E3AF2]/40"
                    }`}
                  >
                    <div className="font-bold text-xs uppercase">{roleKey}</div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
                      {roleKey === "md" && "Executive C-Suite Oversight"}
                      {roleKey === "admin" && "System Configuration"}
                      {roleKey === "hr" && "Appraisals & Staff Directory"}
                      {roleKey === "accountant" && "Finance, Ledger & Payroll"}
                      {roleKey === "manager" && "Direct Report Reviews"}
                      {roleKey === "employee" && "Self-Service Portal"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </NexaModal>
        )}
      </div>
    </AdminShell>
  );
}
