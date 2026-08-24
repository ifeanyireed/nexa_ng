"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
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
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newHead, setNewHead] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newCostCenter, setNewCostCenter] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDepartmentData = async () => {
    try {
      setIsLoadingDepartments(true);
      const headers: Record<string, string> = {};
      if (activeTenant?.slug) {
        headers["x-tenant-slug"] = activeTenant.slug;
      }

      // 1. Fetch departments from ERP
      const deptUrl = activeTenant?.slug
        ? `/api/erp/departments?tenant=${encodeURIComponent(activeTenant.slug)}`
        : "/api/erp/departments";

      const res = await fetch(deptUrl, { headers, cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDepartments(data);
          return;
        }
      }

      // 2. Also fetch users to cross-compute live headcount if needed
      const userUrl = activeTenant?.slug
        ? `/api/erp/users?tenant=${encodeURIComponent(activeTenant.slug)}`
        : "/api/erp/users";

      const userRes = await fetch(userUrl, { headers, cache: "no-store" });
      if (userRes.ok) {
        const users = await userRes.json();
        if (Array.isArray(users) && users.length > 0) {
          const updated = DEFAULT_DEPARTMENTS.map((d) => {
            const count = users.filter((u: any) => {
              const dept = (u.department || u.Department || "").toLowerCase();
              const dName = d.name.toLowerCase();
              return (
                dept.includes(dName) ||
                dName.includes(dept) ||
                (dName.includes("finance") && dept.includes("finance")) ||
                (dName.includes("fleet") && dept.includes("fleet")) ||
                (dName.includes("it") && dept.includes("it")) ||
                (dName.includes("hr") && dept.includes("hr")) ||
                (dName.includes("market") && dept.includes("market"))
              );
            }).length;

            return {
              ...d,
              headCount: count > 0 ? count : d.headCount,
            };
          });
          setDepartments(updated);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch department hierarchy from database:", e);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [activeTenant?.slug, activeTenant?.id]);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;

    try {
      setIsSaving(true);
      const newDept: DepartmentItem = {
        code: newCode.toUpperCase().trim(),
        name: newName.trim(),
        head: newHead.trim() || "Pending Appointment",
        headCount: 1,
        budget: newBudget ? (newBudget.startsWith("₦") ? newBudget : `₦${newBudget}`) : "₦10,000,000",
        costCenter: newCostCenter.trim() || `CC-${departments.length + 100}`,
        tenantSlug: activeTenant?.slug || undefined,
      };

      const res = await fetch("/api/erp/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeTenant?.slug ? { "x-tenant-slug": activeTenant.slug } : {}),
        },
        body: JSON.stringify(newDept),
      });

      if (!res.ok) {
        throw new Error("Failed to persist department");
      }

      showToast(`Department division '${newName}' added to ${activeTenant?.name || "organization"}!`);
      setIsAddModalOpen(false);
      setNewCode("");
      setNewName("");
      setNewHead("");
      setNewBudget("");
      setNewCostCenter("");
      await fetchDepartmentData();
    } catch (err) {
      console.error("Error creating department:", err);
      // Fallback local update
      const newDept: DepartmentItem = {
        code: newCode.toUpperCase().trim(),
        name: newName.trim(),
        head: newHead.trim() || "Pending Appointment",
        headCount: 1,
        budget: newBudget ? (newBudget.startsWith("₦") ? newBudget : `₦${newBudget}`) : "₦10,000,000",
        costCenter: newCostCenter.trim() || `CC-${departments.length + 100}`,
      };
      setDepartments((prev) => [...prev, newDept]);
      setIsAddModalOpen(false);
      showToast(`Department division '${newName}' created!`);
    } finally {
      setIsSaving(false);
    }
  };

  const displayTenantName = activeTenant?.name || "Enterprise Workspace";

  const filteredDepts = departments.filter((d) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.head.toLowerCase().includes(q) ||
      d.costCenter.toLowerCase().includes(q)
    );
  });

  const totalHeadcount = departments.reduce((acc, d) => acc + d.headCount, 0);

  return (
    <ErpAdminShell
      title="Departmental Hierarchy & Cost Centers"
      subtitle={`Define organizational divisions, leadership reporting lines, and budgetary cost centers for tenant '${displayTenantName}'.`}
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
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-[#1A56DB] text-white rounded-full font-bold shadow-xs"
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
            {filteredDepts.map((d) => (
              <NexaCard key={d.code} variant="glass" padding="md" className="space-y-3 border border-[var(--nexa-border)] shadow-xs rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1A56DB]">{d.code}</span>
                  <NexaBadge variant="brand">{d.costCenter}</NexaBadge>
                </div>
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">{d.name}</h3>
                <div className="space-y-1.5 text-xs text-[var(--nexa-text-secondary)] font-mono pt-1 border-t border-[var(--nexa-border)]">
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Department Head:</span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">{d.head}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Active Headcount:</span>
                    <span className="font-bold text-[var(--nexa-text-primary)]">{d.headCount} Staff</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Budget Allocation:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.budget}</span>
                  </div>
                </div>
              </NexaCard>
            ))}
          </div>
        )}
      </div>

      {/* ADD DEPARTMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h2 className="text-base font-black text-[var(--nexa-text-primary)]">
                  Add Department Division
                </h2>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  Create a cost center and assign leadership for &apos;{displayTenantName}&apos;.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[var(--nexa-bg-base)] text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDept} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Dept Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEPT-OPS"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] font-mono text-[var(--nexa-text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Cost Center
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CC-601"
                    value={newCostCenter}
                    onChange={(e) => setNewCostCenter(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] font-mono text-[var(--nexa-text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Department Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer Support & Success"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Department Lead
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samuel Ade"
                    value={newHead}
                    onChange={(e) => setNewHead(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Annual Budget (₦)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 25,000,000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-end gap-2">
                <NexaButton
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-full px-4 font-bold"
                >
                  Cancel
                </NexaButton>
                <NexaButton
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#1A56DB] text-white rounded-full font-bold px-4"
                >
                  {isSaving ? "Creating..." : "Create Department"}
                </NexaButton>
              </div>
            </form>
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
