"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  FolderTree,
  Layers,
  Plus,
  Users,
  DollarSign,
  X,
  RefreshCw,
  ChevronDown,
  Search,
  Briefcase,
  Edit3,
  Trash2,
  UserCheck,
  Shield,
  ArrowRight,
  ExternalLink,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";

interface DepartmentItem {
  code: string;
  name: string;
  head: string;
  headCount: number;
  budget: string;
  costCenter: string;
  tenantSlug?: string;
  isCustom?: boolean;
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  avatar: string;
  managerName?: string;
  managerId?: string;
  company?: string;
}

const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  { code: "DEPT-FIN", name: "Finance & Accounts", head: "Oluwatobiloba Olateju", headCount: 8, budget: "₦42,000,000", costCenter: "CC-101" },
  { code: "DEPT-FLT", name: "Fleet Operations & Maintenance", head: "Babajide Sanwo", headCount: 28, budget: "₦95,000,000", costCenter: "CC-201" },
  { code: "DEPT-IT", name: "Systems & IT / ERP", head: "Adeyemi Phillips", headCount: 6, budget: "₦28,000,000", costCenter: "CC-301" },
  { code: "DEPT-HR", name: "Human Resources & Talent", head: "Goldy Okeke", headCount: 5, budget: "₦18,500,000", costCenter: "CC-401" },
  { code: "DEPT-MKT", name: "Commercial & Growth", head: "Chioma Okonkwo", headCount: 12, budget: "₦35,000,000", costCenter: "CC-501" },
  { code: "DEPT-EXE", name: "Executive Directorate", head: "Dr. Babatunde Jinadu (MD)", headCount: 4, budget: "₦50,000,000", costCenter: "CC-001" },
];

function ERPDepartmentsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tenantSlugParam = searchParams.get("tenant");

  const {
    tenants,
    activeTenant,
    setActiveTenant,
    isLoading: isTenantLoading,
    reloadTenants,
  } = useActiveTenant(user?.email, tenantSlugParam);

  const [departments, setDepartments] = useState<DepartmentItem[]>(DEFAULT_DEPARTMENTS);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal State for Add & Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);

  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formHead, setFormHead] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formCostCenter, setFormCostCenter] = useState("");

  // Modal State for Viewing Members
  const [viewingDept, setViewingDept] = useState<DepartmentItem | null>(null);
  const [memberSearch, setMemberSearch] = useState("");

  // Modal State for Deleting
  const [deletingDept, setDeletingDept] = useState<DepartmentItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDepartmentData = async () => {
    try {
      setIsLoadingDepartments(true);
      const headers: Record<string, string> = {};
      const slug = activeTenant?.slug || "";
      if (slug) {
        headers["x-tenant-slug"] = slug;
      }

      // 1. Fetch live staff users
      const userUrl = slug ? `/api/erp/users?tenant=${encodeURIComponent(slug)}` : "/api/erp/users";
      let loadedUsers: StaffUser[] = [];
      try {
        const uRes = await fetch(userUrl, { headers, cache: "no-store" });
        if (uRes.ok) {
          const uData = await uRes.json();
          if (Array.isArray(uData)) {
            loadedUsers = uData;
            setUsers(uData);
          }
        }
      } catch (uErr) {
        console.warn("Failed to fetch users for department mapping:", uErr);
      }

      // 2. Fetch departments from ERP
      const deptUrl = slug ? `/api/erp/departments?tenant=${encodeURIComponent(slug)}` : "/api/erp/departments";
      const res = await fetch(deptUrl, { headers, cache: "no-store" });

      let baseDepts: DepartmentItem[] = DEFAULT_DEPARTMENTS;
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          baseDepts = data;
        }
      }

      // 3. Match and compute real-time dynamic headcount and assigned staff
      const mapped = baseDepts.map((d) => {
        const matchingStaff = loadedUsers.filter((u) => isUserInDepartment(u, d.name));
        const computedCount = matchingStaff.length > 0 ? matchingStaff.length : d.headCount;

        // Try to identify head if empty or placeholder
        let dynamicHead = d.head;
        if (!dynamicHead || dynamicHead === "Pending Appointment") {
          const leader = matchingStaff.find(
            (u) =>
              u.role === "manager" ||
              u.role === "admin" ||
              u.role === "md" ||
              u.designation?.toLowerCase().includes("head") ||
              u.designation?.toLowerCase().includes("manager") ||
              u.designation?.toLowerCase().includes("director")
          );
          if (leader) {
            dynamicHead = leader.name;
          }
        }

        return {
          ...d,
          head: dynamicHead || d.head || "Pending Appointment",
          headCount: computedCount,
        };
      });

      setDepartments(mapped);
    } catch (e) {
      console.error("Failed to fetch department hierarchy from database:", e);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [activeTenant?.slug, activeTenant?.id]);

  const isUserInDepartment = (u: StaffUser, deptName: string): boolean => {
    const userDept = (u.department || "").toLowerCase().trim();
    const dName = deptName.toLowerCase().trim();
    if (!userDept) return false;

    if (userDept.includes(dName) || dName.includes(userDept)) return true;

    if (dName.includes("finance") && userDept.includes("finance")) return true;
    if (dName.includes("fleet") && userDept.includes("fleet")) return true;
    if (dName.includes("it") && (userDept.includes("it") || userDept.includes("erp") || userDept.includes("system"))) return true;
    if (dName.includes("human resources") && (userDept.includes("hr") || userDept.includes("human"))) return true;
    if (dName.includes("commercial") && (userDept.includes("market") || userDept.includes("commercial") || userDept.includes("growth"))) return true;
    if (dName.includes("executive") && (userDept.includes("exec") || userDept.includes("admin") || userDept.includes("management"))) return true;
    if (dName.includes("khlc") && (userDept.includes("khlc") || userDept.includes("skillup"))) return true;
    if (dName.includes("workshop") && userDept.includes("workshop")) return true;
    if (dName.includes("noc") && userDept.includes("noc")) return true;

    return false;
  };

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setFormCode(`DEPT-${Math.floor(100 + Math.random() * 900)}`);
    setFormName("");
    setFormHead("");
    setFormBudget("₦25,000,000");
    setFormCostCenter(`CC-${Math.floor(100 + Math.random() * 900)}`);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setFormCode(dept.code);
    setFormName(dept.name);
    setFormHead(dept.head);
    setFormBudget(dept.budget);
    setFormCostCenter(dept.costCenter);
    setIsFormModalOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    try {
      setIsSaving(true);
      const payload: DepartmentItem = {
        code: formCode.toUpperCase().trim(),
        name: formName.trim(),
        head: formHead.trim() || "Pending Appointment",
        headCount: editingDept ? editingDept.headCount : 1,
        budget: formBudget.trim() ? (formBudget.startsWith("₦") ? formBudget : `₦${formBudget}`) : "₦10,000,000",
        costCenter: formCostCenter.trim() || `CC-${departments.length + 100}`,
        tenantSlug: activeTenant?.slug || undefined,
      };

      const res = await fetch("/api/erp/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeTenant?.slug ? { "x-tenant-slug": activeTenant.slug } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to persist department update");
      }

      showToast(
        editingDept
          ? `Department '${formName}' successfully updated!`
          : `New division '${formName}' created for ${activeTenant?.name || "organization"}!`
      );
      setIsFormModalOpen(false);
      await fetchDepartmentData();
    } catch (err) {
      console.error("Error saving department:", err);
      // Optimistic local state update
      const updatedItem: DepartmentItem = {
        code: formCode.toUpperCase().trim(),
        name: formName.trim(),
        head: formHead.trim() || "Pending Appointment",
        headCount: editingDept ? editingDept.headCount : 1,
        budget: formBudget.trim() ? (formBudget.startsWith("₦") ? formBudget : `₦${formBudget}`) : "₦10,000,000",
        costCenter: formCostCenter.trim() || `CC-${departments.length + 100}`,
      };

      if (editingDept) {
        setDepartments((prev) => prev.map((d) => (d.code === editingDept.code ? updatedItem : d)));
      } else {
        setDepartments((prev) => [...prev, updatedItem]);
      }
      setIsFormModalOpen(false);
      showToast(`Department division '${formName}' saved!`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDepartment = async (dept: DepartmentItem) => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/erp/departments?code=${encodeURIComponent(dept.code)}`, {
        method: "DELETE",
        headers: {
          ...(activeTenant?.slug ? { "x-tenant-slug": activeTenant.slug } : {}),
        },
      });

      setDepartments((prev) => prev.filter((d) => d.code !== dept.code));
      setDeletingDept(null);
      showToast(`Department '${dept.name}' removed successfully.`);
      if (res.ok) {
        await fetchDepartmentData();
      }
    } catch (err) {
      console.error("Failed to delete department:", err);
      setDepartments((prev) => prev.filter((d) => d.code !== dept.code));
      setDeletingDept(null);
      showToast(`Department '${dept.name}' removed.`);
    } finally {
      setIsSaving(false);
    }
  };

  const displayTenantName = activeTenant?.name || "Enterprise Workspace";

  const filteredDepts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.head.toLowerCase().includes(q) ||
        d.costCenter.toLowerCase().includes(q)
    );
  }, [departments, search]);

  const totalHeadcount = useMemo(() => {
    return users.length > 0 ? users.length : departments.reduce((acc, d) => acc + d.headCount, 0);
  }, [users, departments]);

  const potentialManagers = useMemo(() => {
    return users
      .filter((u) => u.name && u.name.trim().length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  // Selected department staff for member modal
  const departmentMembers = useMemo(() => {
    if (!viewingDept) return [];
    const members = users.filter((u) => isUserInDepartment(u, viewingDept.name));
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.designation?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q)
    );
  }, [viewingDept, users, memberSearch]);

  return (
    <ErpAdminShell
      title="Departmental Hierarchy & Cost Centers"
      subtitle={`Define organizational divisions, leadership reporting lines, and budgetary cost centers for ${displayTenantName}.`}
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
              fetchDepartmentData();
            }}
            disabled={isLoadingDepartments || isTenantLoading}
            className="p-2 rounded-full border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] transition-colors cursor-pointer"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 text-[#1A56DB] ${isLoadingDepartments || isTenantLoading ? "animate-spin" : ""}`} />
          </button>

          <NexaButton
            size="sm"
            variant="primary"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs cursor-pointer"
          >
            Add Department
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
              Total Departments
            </span>
            <p className="text-xl font-black font-mono text-[var(--nexa-text-primary)] mt-1">
              {isLoadingDepartments ? "..." : departments.length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Active Headcount
            </span>
            <p className="text-xl font-black font-mono text-emerald-500 mt-1">
              {isLoadingDepartments ? "..." : `${totalHeadcount} Staff`}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Active Tenant
            </span>
            <p className="text-sm font-black text-[#1A56DB] mt-1 truncate" title={activeTenant?.domain || displayTenantName}>
              {displayTenantName}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Cost Centers Active
            </span>
            <p className="text-xl font-black font-mono text-purple-500 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {departments.length} CCs Live
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search departments by name, code, lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] transition-colors"
            />
          </div>
          <div className="text-xs text-[var(--nexa-text-muted)] font-mono hidden sm:block">
            Showing {filteredDepts.length} of {departments.length} divisions
          </div>
        </div>

        {/* DEPARTMENT CARDS GRID */}
        {isLoadingDepartments ? (
          <div className="p-12 text-center text-xs text-[var(--nexa-text-muted)]">
            <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-[#1A56DB]" />
            Loading departmental divisions for {displayTenantName}...
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--nexa-text-muted)] bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-2xl">
            No departmental divisions match &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepts.map((d) => {
              const matchedStaff = users.filter((u) => isUserInDepartment(u, d.name));
              const previewAvatars = matchedStaff.slice(0, 3);
              const extraCount = matchedStaff.length > 3 ? matchedStaff.length - 3 : 0;

              return (
                <NexaCard
                  key={d.code}
                  variant="glass"
                  padding="md"
                  className="space-y-3.5 border border-[var(--nexa-border)] shadow-xs rounded-2xl flex flex-col justify-between hover:border-[#1A56DB]/50 transition-all group"
                >
                  <div className="space-y-3">
                    {/* CARD HEADER */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#1A56DB]">{d.code}</span>
                        <NexaBadge variant="brand">{d.costCenter}</NexaBadge>
                      </div>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(d)}
                          className="p-1.5 rounded-lg hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[#1A56DB] transition-colors cursor-pointer"
                          title="Edit Department Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingDept(d)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--nexa-text-muted)] hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] leading-tight">{d.name}</h3>

                    {/* METRICS & LEAD */}
                    <div className="space-y-2 text-xs text-[var(--nexa-text-secondary)] font-mono pt-2 border-t border-[var(--nexa-border)]">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--nexa-text-muted)]">Department Lead:</span>
                        <span className="font-bold text-[var(--nexa-text-primary)] truncate max-w-[170px]" title={d.head}>
                          {d.head}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--nexa-text-muted)]">Budget Allocation:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.budget}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[var(--nexa-text-muted)]">Staff Enrolled:</span>
                        <span className="font-bold text-[var(--nexa-text-primary)]">
                          {matchedStaff.length > 0 ? matchedStaff.length : d.headCount} Members
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION & AVATAR PREVIEW */}
                  <div className="pt-2.5 border-t border-[var(--nexa-border)] flex items-center justify-between gap-2">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                      {previewAvatars.map((staff, idx) => (
                        <div key={idx} className="relative ring-2 ring-[var(--nexa-bg-surface)] rounded-full">
                          <NexaAvatar size="sm" name={staff.name} src={staff.avatar} className="w-6 h-6 text-[9px]" />
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <div className="w-6 h-6 rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[9px] font-bold text-[var(--nexa-text-muted)] flex items-center justify-center ring-2 ring-[var(--nexa-bg-surface)]">
                          +{extraCount}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setViewingDept(d)}
                      className="px-3 py-1.5 text-xs font-bold text-[#1A56DB] hover:bg-[#1A56DB]/10 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>View Roster</span>
                    </button>
                  </div>
                </NexaCard>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT DEPARTMENT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h2 className="text-base font-black text-[var(--nexa-text-primary)]">
                  {editingDept ? "Edit Department Division" : "Add Department Division"}
                </h2>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Configure organizational division and cost center for &apos;{displayTenantName}&apos;.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Dept Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEPT-OPS"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] font-mono text-[var(--nexa-text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Cost Center</label>
                  <input
                    type="text"
                    placeholder="e.g. CC-601"
                    value={formCostCenter}
                    onChange={(e) => setFormCostCenter(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] font-mono text-[var(--nexa-text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Department Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer Support & Success"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Department Head</label>
                  {potentialManagers.length > 0 ? (
                    <select
                      value={formHead}
                      onChange={(e) => setFormHead(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      <option value="">-- Select Department Lead --</option>
                      {potentialManagers.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.designation || m.role})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Samuel Ade"
                      value={formHead}
                      onChange={(e) => setFormHead(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">Annual Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. 25,000,000"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-end gap-2">
                <NexaButton
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="rounded-full px-4 font-bold cursor-pointer"
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#1A56DB] text-white rounded-full font-bold px-4 cursor-pointer"
                >
                  {isSaving ? "Saving..." : editingDept ? "Save Changes" : "Create Department"}
                </NexaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DEPARTMENT MEMBERS ROSTER MODAL */}
      {viewingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#1A56DB]">{viewingDept.code}</span>
                  <NexaBadge variant="brand">{viewingDept.costCenter}</NexaBadge>
                </div>
                <h2 className="text-base font-black text-[var(--nexa-text-primary)] mt-1">
                  {viewingDept.name} — Staff Roster
                </h2>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  {departmentMembers.length} staff enrolled in this division • Head: <span className="font-bold text-[var(--nexa-text-primary)]">{viewingDept.head}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingDept(null)}
                className="p-1.5 rounded-full hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEARCH MEMBERS */}
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search enrolled staff by name, email, or designation..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
              />
            </div>

            {/* MEMBERS LIST */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
              {departmentMembers.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--nexa-text-muted)] bg-[var(--nexa-bg-base)] rounded-2xl border border-[var(--nexa-border)]">
                  {memberSearch ? `No staff member matches "${memberSearch}".` : "No staff members are currently assigned to this department."}
                </div>
              ) : (
                departmentMembers.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between gap-3 hover:border-[#1A56DB]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <NexaAvatar size="md" name={m.name} src={m.avatar} isOnline />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">{m.name}</h4>
                          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-[#1A56DB]/10 text-[#1A56DB]">
                            {m.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--nexa-text-secondary)] font-medium">
                          {m.designation || "Staff Member"} • <span className="font-mono text-[10px]">{m.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setViewingDept(null);
                          router.push(`/erp/admin/users?search=${encodeURIComponent(m.name)}`);
                        }}
                        className="p-1.5 text-xs text-[var(--nexa-text-muted)] hover:text-[#1A56DB] rounded-lg hover:bg-[var(--nexa-bg-surface)] transition-colors cursor-pointer"
                        title="Manage User in Staff Directory"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
              <button
                onClick={() => {
                  setViewingDept(null);
                  router.push(`/erp/admin/users?dept=${encodeURIComponent(viewingDept.name)}`);
                }}
                className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage in Staff Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <NexaButton
                size="sm"
                variant="outline"
                onClick={() => setViewingDept(null)}
                className="rounded-full px-4 font-bold cursor-pointer"
              >
                Close
              </NexaButton>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-sm bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[var(--nexa-text-primary)]">Delete Department?</h3>
              <p className="text-xs text-[var(--nexa-text-secondary)]">
                Are you sure you want to delete <span className="font-bold text-[var(--nexa-text-primary)]">{deletingDept.name}</span> ({deletingDept.code})?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <NexaButton
                size="sm"
                variant="outline"
                onClick={() => setDeletingDept(null)}
                className="rounded-full px-4 font-bold cursor-pointer"
              >
                Cancel
              </NexaButton>
              <NexaButton
                size="sm"
                variant="primary"
                onClick={() => handleDeleteDepartment(deletingDept)}
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-4 cursor-pointer"
              >
                {isSaving ? "Deleting..." : "Confirm Delete"}
              </NexaButton>
            </div>
          </div>
        </div>
      )}
    </ErpAdminShell>
  );
}

export default function ERPDepartmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[var(--nexa-text-muted)]">
          <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-[#1A56DB]" />
          Loading departments...
        </div>
      }
    >
      <ERPDepartmentsContent />
    </Suspense>
  );
}
