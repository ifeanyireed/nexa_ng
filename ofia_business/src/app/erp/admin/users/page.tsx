"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Trash2,
  X,
  Key,
  RefreshCw,
  ChevronDown,
  Globe,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { Pagination } from "@/components/nexa/Pagination";
import { RoleKey } from "@/lib/access-control";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant, DatabaseTenant } from "@/lib/tenant-context";

interface ERPStaffUser {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  department: string;
  designation: string;
  managerName?: string;
  managerId?: string;
  avatar: string;
  company?: string;
  location?: string;
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
}

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

function UserManagementContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tenantSlugParam = searchParams.get("tenant");

  // Dynamic batched lookup of all tenant organizations directly from MySQL
  const {
    tenants,
    activeTenant,
    setActiveTenant,
    isLoading: isTenantLoading,
    reloadTenants,
  } = useActiveTenant(user?.email, tenantSlugParam);

  const [users, setUsers] = useState<ERPStaffUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Inline Role Change State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleKey>("employee");

  // Modal State for Add & Full Edit
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState<ERPStaffUser | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<RoleKey>("employee");
  const [formDepartment, setFormDepartment] = useState(DEPARTMENTS[0]);
  const [formDesignation, setFormDesignation] = useState("");
  const [formManager, setFormManager] = useState("");
  const [formManagerId, setFormManagerId] = useState<string | undefined>(undefined);
  const [formCompany, setFormCompany] = useState("");
  const [formLocation, setFormLocation] = useState("Lagos, Nigeria");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const headers: Record<string, string> = {};
      if (activeTenant?.slug) {
        headers["x-tenant-slug"] = activeTenant.slug;
      }

      const url = activeTenant?.slug
        ? `/api/erp/users?tenant=${encodeURIComponent(activeTenant.slug)}`
        : "/api/erp/users";

      const res = await fetch(url, {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: ERPStaffUser[] = data.map((u: any, idx: number) => {
            const rawRole = (u.role || u.Role || "employee").toLowerCase();
            const validRole = (["admin", "md", "hr", "manager", "accountant", "marketer", "employee", "cashier", "inventory_officer", "dispatcher"].includes(rawRole)
              ? rawRole
              : "employee") as RoleKey;

            return {
              id: u.id || u.ID || `USR-${idx + 1}`,
              name: u.name || u.Name || "Staff Member",
              email: u.email || u.Email || "",
              role: validRole,
              department: u.department || u.Department || "Executive Directorate",
              designation: u.designation || u.Designation || "Corporate Officer",
              managerName: u.managerName || u.ManagerName || undefined,
              managerId: u.managerId || u.ManagerId || undefined,
              avatar: u.avatar || `/character${(idx % 20) + 1}.jpg`,
              company: u.company || u.Company || activeTenant?.name || "Corporate Staff",
              location: u.location || u.Location || "Lagos, Nigeria",
              status: "ACTIVE",
            };
          });
          setUsers(mapped);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch ERP users from MySQL database:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTenant?.slug, activeTenant?.id]);

  const handleRoleChange = async (id: string, updatedRole: RoleKey) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/erp/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeTenant?.slug ? { "x-tenant-slug": activeTenant.slug } : {}),
        },
        body: JSON.stringify({
          ...target,
          role: updatedRole,
        }),
      });
      if (!res.ok) throw new Error("Failed to update user role");
      showToast(`Updated role for ${target.name} to ${updatedRole.toUpperCase()}`);
      await fetchUsers();
    } catch (e) {
      console.error("Failed to update role:", e);
      showToast("Error updating user role in database");
    } finally {
      setIsSaving(false);
      setEditingUserId(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStaffUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("employee");
    setFormDepartment(DEPARTMENTS[0]);
    setFormDesignation("");
    setFormManager("");
    setFormManagerId(undefined);
    setFormCompany(activeTenant?.name || "");
    setFormLocation("Lagos, Nigeria");
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditModal = (staffUser: ERPStaffUser) => {
    setEditingStaffUser(staffUser);
    setFormName(staffUser.name);
    setFormEmail(staffUser.email);
    setFormRole(staffUser.role);
    setFormDepartment(staffUser.department);
    setFormDesignation(staffUser.designation);
    setFormManager(staffUser.managerName || "");
    setFormManagerId(staffUser.managerId || undefined);
    setFormCompany(staffUser.company || activeTenant?.name || "");
    setFormLocation(staffUser.location || "Lagos, Nigeria");
    setIsAddUserModalOpen(true);
  };

  const handleSaveStaffUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    try {
      setIsSaving(true);
      const avatarNum = editingStaffUser
        ? editingStaffUser.avatar
        : `/character${(users.length % 20) + 1}.jpg`;

      const payload = {
        id: editingStaffUser ? editingStaffUser.id : `USR-${Date.now()}`,
        name: formName,
        email: formEmail,
        role: formRole,
        department: formDepartment,
        designation: formDesignation || "Corporate Officer",
        managerName: formManager || undefined,
        managerId: formManagerId || undefined,
        avatar: avatarNum,
        company: formCompany || activeTenant?.name || "Corporate Staff",
        location: formLocation,
      };

      const res = await fetch("/api/erp/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeTenant?.slug ? { "x-tenant-slug": activeTenant.slug } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save staff member");

      showToast(
        editingStaffUser
          ? `Staff record for ${formName} updated in MySQL database!`
          : `Staff member ${formName} onboarded and saved to database!`
      );
      setIsAddUserModalOpen(false);
      await fetchUsers();
    } catch (e) {
      console.error("Failed to save user:", e);
      showToast("Failed to save user to database");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaffUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the database?`)) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/erp/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...(activeTenant?.slug ? { "x-tenant-slug": activeTenant.slug } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      showToast(`User ${name} deleted from database`);
      await fetchUsers();
    } catch (e) {
      console.error("Failed to delete user:", e);
      showToast("Error deleting user from database");
    } finally {
      setIsSaving(false);
    }
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedUsers = filtered.slice((page - 1) * itemsPerPage, (page - 1) * itemsPerPage + itemsPerPage);

  const displayTenantName = activeTenant?.name || "Enterprise Workspace";

  // Filter staff members with manager role (excluding the user currently being edited to avoid circular reporting)
  const managerStaffOptions = users.filter((u) => {
    if (editingStaffUser && u.id === editingStaffUser.id) return false;
    return u.role === "manager" || u.role === "md" || u.role === "admin";
  });

  return (
    <ErpAdminShell
      title="User Management & Staff Directory"
      subtitle={`Corporate identity governance and 10-tier RBAC role assignment for tenant '${displayTenantName}' synced directly to MySQL.`}
      action={
        <div className="flex items-center gap-2">
          {/* Dynamic Tenant Selector / Badge */}
          {tenants.length > 1 ? (
            <div className="relative">
              <select
                value={activeTenant?.id || ""}
                onChange={(e) => {
                  const chosen = tenants.find((t) => t.id === e.target.value);
                  if (chosen) setActiveTenant(chosen);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs font-bold text-[var(--nexa-text-primary)] outline-none cursor-pointer focus:border-[#1A56DB]"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--nexa-text-muted)]" />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs font-mono">
              <Building2 className="w-3.5 h-3.5 text-[#1A56DB]" />
              <span className="font-bold text-[var(--nexa-text-primary)]">{displayTenantName}</span>
              {activeTenant?.slug && (
                <span className="text-[10px] text-[var(--nexa-text-muted)]">({activeTenant.slug})</span>
              )}
            </div>
          )}

          <button
            onClick={() => {
              reloadTenants();
              fetchUsers();
            }}
            disabled={isLoadingUsers || isTenantLoading}
            className="p-2 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] transition-colors cursor-pointer"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 text-[#1A56DB] ${isLoadingUsers || isTenantLoading ? "animate-spin" : ""}`} />
          </button>

          <NexaButton
            size="sm"
            variant="primary"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs"
          >
            Add Staff Member
          </NexaButton>
        </div>
      }
    >
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toastMessage}
        </div>
      )}

      <div className="space-y-4 font-sans">
        {/* KPI COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Total Staff Accounts
            </span>
            <p className="text-xl font-black font-mono text-[var(--nexa-text-primary)] mt-1">
              {isLoadingUsers ? "..." : users.length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Active Status
            </span>
            <p className="text-xl font-black font-mono text-emerald-500 mt-1">
              {isLoadingUsers ? "..." : users.filter((u) => u.status === "ACTIVE").length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Live Database Tenant
            </span>
            <p className="text-sm font-black text-[#1A56DB] mt-1 truncate" title={activeTenant?.domain || displayTenantName}>
              {displayTenantName}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Database Persistence
            </span>
            <p className="text-xl font-black font-mono text-purple-500 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MySQL Live
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name, email, department..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
            {["ALL", "admin", "md", "hr", "accountant", "marketer", "manager", "employee", "cashier", "inventory_officer", "dispatcher"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRoleFilter(r);
                  setPage(1);
                }}
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
                <th className="py-3 px-3">Tenant Organization</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[var(--nexa-text-muted)]">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-[#1A56DB]" />
                    Loading staff records from database...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[var(--nexa-text-muted)]">
                    No staff members match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-[#1A56DB]/15 shadow-xs border border-[var(--nexa-border)]"
                        />
                        <div>
                          <div className="font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-[var(--nexa-text-muted)] font-mono">{u.email} • {u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[var(--nexa-text-primary)]">{u.department}</div>
                      <div className="text-[11px] text-[var(--nexa-text-muted)]">{u.designation}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-[var(--nexa-text-muted)]">
                      {u.managerName ? (
                        <span className="flex items-center gap-1 font-medium text-[var(--nexa-text-primary)]">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                          {u.managerName}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {editingUserId === u.id ? (
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
                          {u.role.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                        {u.company || displayTenantName}
                      </div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)]">
                        {u.location || "Lagos, Nigeria"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {editingUserId === u.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRoleChange(u.id, selectedRole)}
                            disabled={isSaving}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs cursor-pointer shadow-xs"
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="px-2.5 py-1 rounded-lg bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setSelectedRole(u.role);
                            }}
                            className="p-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] hover:border-[#1A56DB] font-semibold transition-colors cursor-pointer"
                            title="Quick Change Role"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] hover:text-[#1A56DB] hover:border-[#1A56DB] font-semibold transition-colors cursor-pointer"
                            title="Edit Full Staff Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaffUser(u.id, u.name)}
                            className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLLER */}
        {!isLoadingUsers && filtered.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* ADD / EDIT STAFF USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h2 className="text-base font-black text-[var(--nexa-text-primary)]">
                  {editingStaffUser ? `Edit Staff Member: ${editingStaffUser.name}` : "Add Corporate Staff Member"}
                </h2>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  {editingStaffUser
                    ? `Modify staff record for tenant workspace '${displayTenantName}' in MySQL.`
                    : `Onboard a new user into '${displayTenantName}' and configure their access role in database.`}
                </p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Ade"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={activeTenant?.slug ? `samuel@${activeTenant.slug}.com` : "samuel@company.com"}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
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
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as RoleKey)}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
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
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Reporting Manager
                  </label>
                  <select
                    value={formManager}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setFormManager(selectedName);
                      const matched = users.find((u) => u.name === selectedName);
                      setFormManagerId(matched ? matched.id : undefined);
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
                  >
                    <option value="">-- No Direct Reporting Manager --</option>
                    {/* Preserve current manager name if set but not present in manager-filtered array */}
                    {formManager && !managerStaffOptions.some((m) => m.name === formManager) && (
                      <option value={formManager}>
                        {formManager} (Current Manager)
                      </option>
                    )}
                    {managerStaffOptions.map((mgr) => (
                      <option key={mgr.id} value={mgr.name}>
                        {mgr.name} — {mgr.designation || mgr.department} ({mgr.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Tenant Organization
                  </label>
                  <input
                    type="text"
                    placeholder={displayTenantName}
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Location / Office Base
                  </label>
                  <input
                    type="text"
                    placeholder="Lagos, Nigeria"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-end gap-2">
                <NexaButton
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="rounded-full px-4 font-bold"
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#1A56DB] text-white rounded-full font-bold px-4 shadow-sm"
                >
                  {isSaving ? "Saving to Database..." : editingStaffUser ? "Save Changes" : "Save & Onboard Staff"}
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpAdminShell>
  );
}

export default function UserManagementPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs text-[var(--nexa-text-muted)]">
        <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-[#1A56DB]" />
        Loading tenant user directory...
      </div>
    }>
      <UserManagementContent />
    </Suspense>
  );
}
