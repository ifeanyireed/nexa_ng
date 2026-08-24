"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useERPStore, User, Role, DEPARTMENTS } from "@/lib/erp-store";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { Pagination } from "@/components/nexa/Pagination";
import { Users, Plus, ArrowLeft, Search, Edit, Trash2, Building2 } from "lucide-react";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";

export default function UserRoleManagement() {
  const { user } = useAuth();
  const { activeTenant } = useActiveTenant(user?.email);
  const tenantName = activeTenant?.name || "Enterprise Workspace";
  const { users, updateUsers } = useERPStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Fleet 1 (Driver)");
  const [role, setRole] = useState<Role>("employee");
  const [managerName, setManagerName] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDept, setEditDept] = useState("");
  const [editRole, setEditRole] = useState<Role>("employee");
  const [editManagerId, setEditManagerId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleDeptChange = (val: string) => {
    setSelectedDept(val);
    setCurrentPage(1);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Please provide employee details.");
      return;
    }

    const managers = users.filter(u => u.role === "manager" || u.role === "hr" || u.role === "md");
    const defaultManager = managers.length > 0 ? managers[0].name : "Robert Vance";

    const newUser: User = {
      id: `${role === "employee" ? "EMP" : role === "manager" ? "MGR" : role.toUpperCase()}00${users.length + 1}`,
      name,
      email,
      role,
      department,
      avatar: `/character${Math.floor(Math.random() * 20) + 1}.jpg`,
      managerName: role === "employee" ? managerName || defaultManager : undefined,
    };

    const updated = [...users, newUser];
    updateUsers(updated);
    setName("");
    setEmail("");
    setManagerName("");
    alert("User account provisioned successfully!");
  };

  const handleDelete = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    updateUsers(updated);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === "All" || u.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <BusinessShell
      title="Staff Directory & Permissions"
      subtitle="Enterprise user roster, line manager reporting hierarchy, departmental partitioning, and RBAC roles."
      action={
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs font-mono">
            <Building2 className="w-3.5 h-3.5 text-[#1A56DB]" />
            <span className="font-bold text-[var(--nexa-text-primary)]">{tenantName}</span>
          </div>
          <Link href="/erp/hr">
            <NexaButton size="sm" variant="outline" className="rounded-full" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to HR Overview
            </NexaButton>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Roster list (7cols) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-7 space-y-4 rounded-3xl">
            <h3 className="font-extrabold text-[var(--nexa-text-primary)] text-sm pb-2 border-b border-[var(--nexa-border)]">
              Enterprise User Accounts
            </h3>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <NexaInput
                  placeholder="Search by name, ID, designation..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  variant="search"
                />
              </div>
              <div className="w-full sm:w-44">
                <select
                  value={selectedDept}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              {paginatedUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--nexa-text-muted)] font-medium bg-[var(--nexa-bg-base)] rounded-2xl border border-dashed border-[var(--nexa-border)]">
                  No matching user accounts found.
                </div>
              ) : (
                paginatedUsers.map((u, idx) => {
                  const avatarSrc = u.avatar && u.avatar.startsWith("/character") ? u.avatar : `/character${((startIndex + idx) % 20) + 1}.jpg`;
                  return (
                <div key={u.id} className={`p-3.5 bg-[var(--nexa-bg-base)] rounded-2xl border border-[var(--nexa-border)] flex justify-between ${editingUserId === u.id ? "flex-col sm:flex-row gap-4 items-start" : "items-center"}`}>
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={avatarSrc}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover border border-[var(--nexa-border)] shadow-xs"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-[var(--nexa-text-primary)] text-xs">{u.name}</p>
                      {editingUserId === u.id ? (
                        <div className="flex flex-col gap-2.5 mt-2 p-3.5 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-2xl w-full max-w-md">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-extrabold text-[var(--nexa-text-muted)] uppercase tracking-wide mb-0.5">Department</label>
                              <select
                                value={editDept}
                                onChange={(e) => setEditDept(e.target.value)}
                                className="w-full px-2 py-1 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-bold text-[var(--nexa-text-primary)] outline-none"
                              >
                                {DEPARTMENTS.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-[9px] font-extrabold text-[var(--nexa-text-muted)] uppercase tracking-wide mb-0.5">Role</label>
                              <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value as Role)}
                                className="w-full px-2 py-1 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-bold text-[var(--nexa-text-primary)] outline-none"
                              >
                                <option value="employee">Employee</option>
                                <option value="manager">Line Manager</option>
                                <option value="hr">HR Admin</option>
                                <option value="md">Managing Director</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-extrabold text-[var(--nexa-text-muted)] uppercase tracking-wide mb-0.5">Line Manager</label>
                            <select
                              value={editManagerId}
                              onChange={(e) => setEditManagerId(e.target.value)}
                              className="w-full px-2 py-1 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-lg text-xs font-bold text-[var(--nexa-text-primary)] outline-none"
                            >
                              <option value="">No Manager / Self</option>
                              {users
                                .filter(mgr => mgr.id !== u.id && (mgr.role === "manager" || mgr.role === "hr" || mgr.role === "md"))
                                .map(mgr => (
                                  <option key={mgr.id} value={mgr.id}>
                                    {mgr.name} ({mgr.role})
                                  </option>
                                ))
                              }
                            </select>
                          </div>

                          <div className="flex gap-2 justify-end mt-1">
                            <NexaButton
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                const selectedMgr = users.find(mgr => mgr.id === editManagerId);
                                const updated = users.map(user => {
                                  if (user.id === u.id) {
                                    return {
                                      ...user,
                                      department: editDept,
                                      role: editRole,
                                      managerName: selectedMgr ? selectedMgr.name : undefined,
                                      managerId: selectedMgr ? selectedMgr.id : undefined,
                                    };
                                  }
                                  return user;
                                });
                                updateUsers(updated);
                                setEditingUserId(null);
                              }}
                              className="rounded-full bg-[#1A56DB] text-white text-xs h-7"
                            >
                              Save
                            </NexaButton>
                            <NexaButton
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUserId(null)}
                              className="rounded-full text-xs h-7"
                            >
                              Cancel
                            </NexaButton>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-[var(--nexa-text-muted)] font-bold uppercase tracking-wide mt-0.5">
                          ID: {u.id} • {u.role} • {u.department} {u.managerName ? `• Mgr: ${u.managerName}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  {editingUserId !== u.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingUserId(u.id);
                          setEditDept(u.department);
                          setEditRole(u.role);
                          setEditManagerId(u.managerId || "");
                        }}
                        className="text-[#1A56DB] hover:underline text-xs font-bold mr-2 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-500 hover:underline text-xs font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                  );
                })
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </NexaCard>

          {/* Provisioning form (5cols) */}
          <NexaCard variant="glass" padding="lg" className="lg:col-span-5 rounded-3xl">
            <h3 className="font-extrabold text-[var(--nexa-text-primary)] text-sm pb-2 border-b border-[var(--nexa-border)] mb-4">
              Provision Employee Account
            </h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase mb-1.5 tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Adebayo Ogunlesi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-semibold text-[var(--nexa-text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase mb-1.5 tracking-wider">Corporate Email</label>
                <input
                  type="email"
                  placeholder="e.g. adebayo@ofia.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-semibold text-[var(--nexa-text-primary)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase mb-1.5 tracking-wider">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase mb-1.5 tracking-wider">Access Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Line Manager</option>
                    <option value="hr">HR Admin</option>
                    <option value="md">Managing Director</option>
                  </select>
                </div>
              </div>

              {role === "employee" && (
                <div>
                  <label className="block text-[10px] font-extrabold text-[var(--nexa-text-muted)] uppercase mb-1.5 tracking-wider">Reports to Manager</label>
                  <select
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer"
                  >
                    <option value="">Select Manager</option>
                    {users
                      .filter(u => u.role === "manager" || u.role === "hr" || u.role === "md")
                      .map(u => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role === "manager" ? "Line Manager" : u.role === "hr" ? "HR Admin" : "MD"})
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

              <NexaButton
                type="submit"
                size="md"
                variant="primary"
                className="w-full rounded-full bg-[#1A56DB] text-white"
              >
                Provision Account
              </NexaButton>
            </form>
          </NexaCard>

        </div>
      </div>
    </BusinessShell>
  );
}
