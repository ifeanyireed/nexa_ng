"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
import { ErpStatGrid } from "@/components/erp/ErpStatCard";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { Pagination } from "@/components/nexa/Pagination";
import { RoleKey } from "@/lib/access-control";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant, DatabaseTenant } from "@/lib/tenant-context";
import { resolveAvatarUrl } from "@/lib/avatar";
import { INITIAL_USERS } from "@/lib/erp-store";

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

// Comprehensive tenant-specific departments and operational units
const TENANT_SPECIFIC_DEPARTMENTS: Record<string, string[]> = {
  // New Era Transport Solutions (Transport & Logistics Operations)
  neweratransports: [
    "Fleet 1 (Bus Assistant)",
    "Fleet 2 (Fleet Supervisor)",
    "Fleet 4 (Facility Manager)",
    "Fleet 5 (Fleet Maintenance North)",
    "Fleet 6 (Fleet Operations Manager)",
    "Fleet 7 (HSE Executive)",
    "Fleet 8 (Fleet Supervisor)",
    "NOC 1 (Fleet Monitoring & NOC Supervisor)",
    "NOC 2 (Fleet Monitoring Officer)",
    "Workshop 3 (Workshop Manager)",
    "Finance 1 (Acc Payable)",
    "Finance 2 (Acc Receivable)",
    "Finance 3 (Accountant)",
    "Finance 4 (Finance Analyst)",
    "Finance 5 (Head of Finance)",
    "Admin/HR 1 (Front Desk & Account Support)",
    "Admin/HR 2 (Front Desk)",
    "Admin/HR 3 (Office Assistant)",
    "HR 1 (HR Executive 1)",
    "HR 2 (HR Executive 2)",
    "HR 3 (Head of HR)",
    "Marketing 1 (Head of Marketing)",
    "Marketing 2 (Marketing Executive & CSR)",
    "Marketing 3 (Marketing Executive)",
    "Marketing 5 (Social Media Executive)",
    "Marketing 6 (Sales Closer)",
    "ERP/IT 1 (ERP/IT Officer)",
    "Legal 1 (Legal Counsel & EA)",
    "Legal 2 (Legal Counsel & PM)",
    "Internal Control 1 (Internal Control)",
    "Head of Operations",
    "Regional Head of Operations",
  ],
  nets: [
    "Fleet 1 (Bus Assistant)",
    "Fleet 2 (Fleet Supervisor)",
    "Fleet 4 (Facility Manager)",
    "Fleet 5 (Fleet Maintenance North)",
    "Fleet 6 (Fleet Operations Manager)",
    "Fleet 7 (HSE Executive)",
    "Fleet 8 (Fleet Supervisor)",
    "NOC 1 (Fleet Monitoring & NOC Supervisor)",
    "NOC 2 (Fleet Monitoring Officer)",
    "Workshop 3 (Workshop Manager)",
    "Finance 1 (Acc Payable)",
    "Finance 2 (Acc Receivable)",
    "Finance 3 (Accountant)",
    "Finance 4 (Finance Analyst)",
    "Finance 5 (Head of Finance)",
    "Admin/HR 1 (Front Desk & Account Support)",
    "Admin/HR 2 (Front Desk)",
    "Admin/HR 3 (Office Assistant)",
    "HR 1 (HR Executive 1)",
    "HR 2 (HR Executive 2)",
    "HR 3 (Head of HR)",
    "Marketing 1 (Head of Marketing)",
    "Marketing 2 (Marketing Executive & CSR)",
    "Marketing 3 (Marketing Executive)",
    "Marketing 5 (Social Media Executive)",
    "Marketing 6 (Sales Closer)",
    "ERP/IT 1 (ERP/IT Officer)",
    "Legal 1 (Legal Counsel & EA)",
    "Legal 2 (Legal Counsel & PM)",
    "Internal Control 1 (Internal Control)",
    "Head of Operations",
    "Regional Head of Operations",
  ],
  // Logitrack Express (Logistics & Dispatch)
  "logitrack-express": [
    "Express Line-Haul & Dispatch",
    "Fleet Maintenance & Telematics",
    "Central Hub & Sortation Center",
    "Route Optimization & Control",
    "Safety & Hazardous Materials",
    "Client Account Management",
    "Driver Welfare & Training",
  ],
  // EduSuite NG / Knowledge Horizons Learning Center (KHLC)
  "edusuite-ng": [
    "KHLC 1 (Instructor)",
    "KHLC 2 (Supervisor)",
    "KHLC 3 (Program Coordinator)",
    "KHLC 4 (Admin Officer)",
    "KHLC 5 (Head of C&R/CBT)",
    "KHLC 6 (IT/Technical Support)",
    "SU 1 (Program Coordinator)",
    "Academic Affairs & Curriculum",
    "Student Admissions & Records",
    "Faculty & Instructional Staff",
    "Bursary & Student Accounts",
    "ICT & E-Learning Infrastructure",
  ],
  khlc: [
    "KHLC 1 (Instructor)",
    "KHLC 2 (Supervisor)",
    "KHLC 3 (Program Coordinator)",
    "KHLC 4 (Admin Officer)",
    "KHLC 5 (Head of C&R/CBT)",
    "KHLC 6 (IT/Technical Support)",
    "SU 1 (Program Coordinator)",
    "Academic Affairs & Curriculum",
    "Student Admissions & Records",
    "Faculty & Instructional Staff",
  ],
  // PayDirect Africa (Fintech & Payment Gateway)
  "paydirect-africa": [
    "Payment Operations & Settlement",
    "Merchant Acquiring & Onboarding",
    "Compliance, AML & Risk Management",
    "Core Banking & API Integrations",
    "Treasury & Financial Accounting",
    "Fraud Monitoring & Security",
    "Customer Success & Tier-2 Support",
  ],
  // HealthPulse NG (Healthcare & Clinical Diagnostics)
  "healthpulse-ng": [
    "Clinical Operations & Nursing",
    "Medical Records & Diagnostics",
    "Pharmacy & Inventory Management",
    "Patient Care & Front Desk",
    "Health Informatics & Telehealth",
    "Quality Assurance & Clinical Compliance",
  ],
  // ReedBreed Enterprise (Software & Cloud Technology)
  reedbreed: [
    "Core Engineering & Architecture",
    "Product Design & Systems UI",
    "Cloud Infrastructure & DevOps",
    "Finance & Corporate Strategy",
    "Growth & Customer Operations",
    "Security & Compliance",
    "Executive Leadership & Governance",
  ],
  // Generic / Fallback
  default: [
    "Executive Directorate",
    "Human Resources & Talent",
    "Finance & Accounts",
    "Commercial & Growth",
    "Fleet & Warehouse Operations",
    "Retail & Front Desk",
    "Supply Chain & Depot",
    "Logistics & Fulfillment",
    "Systems & IT",
  ],
};

function mapToParentDepartment(val: string): string {
  if (!val) return DEPARTMENTS[0];
  const lower = val.toLowerCase();
  if (
    lower.includes("fleet") ||
    lower.includes("workshop") ||
    lower.includes("maintenance") ||
    lower.includes("facility") ||
    lower.includes("warehouse")
  ) {
    return "Fleet & Warehouse Operations";
  }
  if (
    lower.includes("finance") ||
    lower.includes("acc") ||
    lower.includes("bursary") ||
    lower.includes("accountant") ||
    lower.includes("payable") ||
    lower.includes("receivable") ||
    lower.includes("treasury") ||
    lower.includes("audit") ||
    lower.includes("tax")
  ) {
    return "Finance & Accounts";
  }
  if (
    lower.includes("noc") ||
    lower.includes("dispatch") ||
    lower.includes("fulfillment") ||
    lower.includes("logistics") ||
    lower.includes("monitoring") ||
    lower.includes("hub") ||
    lower.includes("route")
  ) {
    return "Logistics & Fulfillment";
  }
  if (
    lower.includes("hr") ||
    lower.includes("talent") ||
    lower.includes("human resource") ||
    lower.includes("people") ||
    lower.includes("recruitment") ||
    lower.includes("welfare")
  ) {
    return "Human Resources & Talent";
  }
  if (
    lower.includes("market") ||
    lower.includes("sales") ||
    lower.includes("growth") ||
    lower.includes("csr") ||
    lower.includes("social media") ||
    lower.includes("commercial") ||
    lower.includes("merchant")
  ) {
    return "Commercial & Growth";
  }
  if (
    lower.includes("it") ||
    lower.includes("systems") ||
    lower.includes("erp") ||
    lower.includes("devops") ||
    lower.includes("engineering") ||
    lower.includes("software") ||
    lower.includes("robotics") ||
    lower.includes("technical") ||
    lower.includes("informatics")
  ) {
    return "Systems & IT";
  }
  if (
    lower.includes("legal") ||
    lower.includes("executive") ||
    lower.includes("internal control") ||
    lower.includes("operations") ||
    lower.includes("director") ||
    lower.includes("general manager") ||
    lower.includes("governance") ||
    lower.includes("compliance") ||
    lower.includes("aml") ||
    lower.includes("risk")
  ) {
    return "Executive Directorate";
  }
  if (
    lower.includes("supply") ||
    lower.includes("depot") ||
    lower.includes("procurement") ||
    lower.includes("inventory") ||
    lower.includes("pharmacy")
  ) {
    return "Supply Chain & Depot";
  }
  if (
    lower.includes("khlc") ||
    lower.includes("instructor") ||
    lower.includes("student") ||
    lower.includes("academic") ||
    lower.includes("front desk") ||
    lower.includes("retail") ||
    lower.includes("desk") ||
    lower.includes("patient") ||
    lower.includes("clinical") ||
    lower.includes("reception")
  ) {
    return "Retail & Front Desk";
  }
  return DEPARTMENTS[0];
}

function UserManagementContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tenantSlugParam = searchParams.get("tenant");

  // Dynamic batched lookup of all tenant organizations directly from Postgres
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
  const [deptFilter, setDeptFilter] = useState("");
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
  const [isCustomDesignation, setIsCustomDesignation] = useState(false);
  const [fetchedDepts, setFetchedDepts] = useState<{ code: string; name: string }[]>([]);
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

      // Fetch dynamic departments for the active tenant
      if (activeTenant?.slug) {
        fetch(`/api/erp/departments?tenant=${encodeURIComponent(activeTenant.slug)}`, {
          headers: { "x-tenant-slug": activeTenant.slug },
          cache: "no-store",
        })
          .then((r) => (r.ok ? r.json() : []))
          .then((d) => {
            if (Array.isArray(d)) {
              setFetchedDepts(d);
            }
          })
          .catch(() => {});
      }

      const url = activeTenant?.slug
        ? `/api/erp/users?tenant=${encodeURIComponent(activeTenant.slug)}`
        : "/api/erp/users";

      const res = await fetch(url, {
        headers,
        cache: "no-store",
      });

      let rawList: any[] = [];
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          rawList = data;
        }
      }

      if (rawList.length === 0 && INITIAL_USERS && INITIAL_USERS.length > 0) {
        rawList = INITIAL_USERS;
      }

      const mapped: ERPStaffUser[] = rawList.map((u: any, idx: number) => {
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
          avatar: resolveAvatarUrl(u.avatar || u.Avatar, u.name || u.email || u.id, idx),
          company: u.company || u.Company || activeTenant?.name || "Corporate Staff",
          location: u.location || u.Location || "Lagos, Nigeria",
          status: "ACTIVE",
        };
      });
      setUsers(mapped);
    } catch (e) {
      console.error("Failed to fetch ERP users from Postgres database:", e);
      if (INITIAL_USERS && INITIAL_USERS.length > 0) {
        const mappedFallback: ERPStaffUser[] = INITIAL_USERS.map((u: any, idx: number) => ({
          id: u.id || `USR-${idx + 1}`,
          name: u.name || "Staff Member",
          email: u.email || "",
          role: (u.role || "employee") as RoleKey,
          department: u.department || "Executive Directorate",
          designation: u.designation || "Corporate Officer",
          managerName: u.managerName,
          managerId: u.managerId,
          avatar: resolveAvatarUrl(u.avatar, u.name || u.id, idx),
          company: u.company || activeTenant?.name || "Corporate Staff",
          location: u.location || "Lagos, Nigeria",
          status: "ACTIVE",
        }));
        setUsers(mappedFallback);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTenant?.slug, activeTenant?.id]);

  // Compute tenant-specific departments list dynamically
  const tenantDepartments = useMemo(() => {
    const slugKey = (activeTenant?.slug || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const presetList =
      TENANT_SPECIFIC_DEPARTMENTS[slugKey] ||
      (slugKey.includes("transport") || slugKey.includes("nets")
        ? TENANT_SPECIFIC_DEPARTMENTS.neweratransports
        : slugKey.includes("edu") || slugKey.includes("khlc")
        ? TENANT_SPECIFIC_DEPARTMENTS["edusuite-ng"]
        : slugKey.includes("paydirect") || slugKey.includes("pay")
        ? TENANT_SPECIFIC_DEPARTMENTS["paydirect-africa"]
        : slugKey.includes("health") || slugKey.includes("pulse")
        ? TENANT_SPECIFIC_DEPARTMENTS["healthpulse-ng"]
        : slugKey.includes("logi") || slugKey.includes("track")
        ? TENANT_SPECIFIC_DEPARTMENTS["logitrack-express"]
        : slugKey.includes("reed")
        ? TENANT_SPECIFIC_DEPARTMENTS.reedbreed
        : TENANT_SPECIFIC_DEPARTMENTS.default);

    const set = new Set<string>(presetList);

    // Dynamic departments fetched from database
    fetchedDepts.forEach((d) => {
      if (d && d.name && d.name.trim()) set.add(d.name.trim());
    });

    // Also include unique departments from currently loaded tenant users
    users.forEach((u) => {
      if (u.department && u.department.trim()) set.add(u.department.trim());
    });

    return Array.from(set).filter(Boolean);
  }, [activeTenant?.slug, fetchedDepts, users]);

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
    const initialDesignation = tenantDepartments[0] || "";
    setFormDesignation(initialDesignation);
    setFormDepartment(mapToParentDepartment(initialDesignation));
    setFormManager("");
    setFormManagerId(undefined);
    setFormCompany(activeTenant?.name || "");
    setFormLocation("Lagos, Nigeria");
    setIsCustomDesignation(false);
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditModal = (staffUser: ERPStaffUser) => {
    setEditingStaffUser(staffUser);
    setFormName(staffUser.name);
    setFormEmail(staffUser.email);
    setFormRole(staffUser.role);
    setFormDepartment(staffUser.department);
    const initialDesig = staffUser.designation || staffUser.department || "";
    setFormDesignation(initialDesig);
    setFormManager(staffUser.managerName || "");
    setFormManagerId(staffUser.managerId || undefined);
    setFormCompany(staffUser.company || activeTenant?.name || "");
    setFormLocation(staffUser.location || "Lagos, Nigeria");
    setIsCustomDesignation(false);
    setIsAddUserModalOpen(true);
  };

  const handleSaveStaffUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    try {
      setIsSaving(true);
      const avatarNum = editingStaffUser
        ? editingStaffUser.avatar
        : `https://res.cloudinary.com/ihfqdysu/image/upload/ofia_ng_assets/character${(users.length % 20) + 1}.jpg`;

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
          ? `Staff record for ${formName} updated in Postgres database!`
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

  const departmentsList = Array.from(new Set(users.map((u) => u.department).filter(Boolean))).sort();

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase()) ||
      u.designation.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesDept = deptFilter === "" || u.department === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedUsers = filtered.slice((page - 1) * itemsPerPage, (page - 1) * itemsPerPage + itemsPerPage);

  const displayTenantName = activeTenant?.name || "Enterprise Workspace";

  // Filter staff members with manager role (excluding the user currently being edited to avoid circular reporting)
  const managerStaffOptions = users.filter((u) => {
    if (editingStaffUser && u.id === editingStaffUser.id) return false;
    return u.role === "manager" || u.role === "md" || u.role === "admin";
  });

  const leadershipCount = users.filter((u) => ["manager", "md", "admin", "hr"].includes(u.role)).length;
  const departmentsCount = departmentsList.length || DEPARTMENTS.length;

  const getRoleBadge = (role: RoleKey) => {
    switch (role) {
      case "admin":
        return <NexaBadge variant="red" size="sm" className="rounded-full">Admin</NexaBadge>;
      case "md":
        return <NexaBadge variant="brand" size="sm" className="rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">MD (Exec)</NexaBadge>;
      case "hr":
        return <NexaBadge variant="green" size="sm" className="rounded-full">HR Lead</NexaBadge>;
      case "manager":
        return <NexaBadge variant="brand" size="sm" className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">Manager</NexaBadge>;
      case "accountant":
        return <NexaBadge variant="neutral" size="sm" className="rounded-full bg-teal-500/10 text-teal-600 border border-teal-500/20">Accountant</NexaBadge>;
      case "marketer":
        return <NexaBadge variant="neutral" size="sm" className="rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">Marketer</NexaBadge>;
      case "employee":
        return <NexaBadge variant="secondary" size="sm" className="rounded-full">Employee</NexaBadge>;
      default:
        return <NexaBadge variant="secondary" size="sm" className="rounded-full capitalize">{role.replace("_", " ")}</NexaBadge>;
    }
  };

  return (
    <ErpAdminShell
      title="User Management & Staff Directory"
      subtitle={`Corporate identity governance and 10-tier RBAC role assignment for tenant '${displayTenantName}' synced directly to Postgres.`}
      action={
        <div className="flex items-center gap-2.5">
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

      <div className="space-y-10">
        {/* TOP 4 KPI CARDS — MATCHING HR & ADMIN VERBATIM */}
        <ErpStatGrid
          stats={[
            {
              label: "Total Staff",
              value: `${isLoadingUsers ? "..." : users.length} Accounts`,
              change: "100% Enrolled",
              trend: "up",
              icon: <Users className="w-5 h-5 text-blue-500" />,
              sub: "Active workspace corporate staff",
            },
            {
              label: "Leadership & Managers",
              value: `${leadershipCount} Officers`,
              change: "Direct Hierarchy",
              trend: "up",
              icon: <ShieldCheck className="w-5 h-5 text-purple-500" />,
              sub: "Supervisory & MD tiers",
            },
            {
              label: "Departments",
              value: `${departmentsCount} Divisions`,
              change: "Operational",
              trend: "up",
              icon: <Briefcase className="w-5 h-5 text-emerald-500" />,
              sub: "Assigned business units",
            },
            {
              label: "Database Persistence",
              value: "Postgres Live",
              change: activeTenant?.slug || "Live Sync",
              trend: "up",
              icon: <CheckCircle2 className="w-5 h-5 text-amber-500" />,
              sub: `${displayTenantName} verified`,
            },
          ]}
        />

        {/* STAFF DIRECTORY TABLE CONTAINER — MATCHING HR PAGE CARD DESIGN */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 rounded-3xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
            <div>
              <h3 className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                Corporate Staff Directory & Access Governance
              </h3>
              <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                Manage workforce accounts, RBAC permissions, and reporting hierarchies
              </p>
            </div>

            {/* Filters matching HR page */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--nexa-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by name, email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium rounded-full text-xs outline-none focus:border-[#1A56DB] transition-all w-48 sm:w-60"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-bold rounded-full text-xs outline-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-bold rounded-full text-xs outline-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="admin">Admin</option>
                <option value="md">MD (Executive)</option>
                <option value="hr">HR</option>
                <option value="manager">Manager</option>
                <option value="accountant">Accountant</option>
                <option value="marketer">Marketer</option>
                <option value="employee">Employee</option>
                <option value="cashier">POS Cashier</option>
                <option value="inventory_officer">Inventory Officer</option>
                <option value="dispatcher">Dispatcher</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--nexa-border)] text-[var(--nexa-text-muted)]">
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Employee</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Department</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Designation</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Reporting Manager</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider">Access Role</th>
                  <th className="pb-3 px-3 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)]">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[var(--nexa-text-muted)] font-medium">
                      <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-[#1A56DB]" />
                      Loading staff records from database...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--nexa-text-muted)] font-medium">
                      No staff members match the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u, idx) => {
                    const avatarSrc = resolveAvatarUrl(u.avatar, u.name || u.id, (page - 1) * itemsPerPage + idx);
                    return (
                      <tr key={u.id} className="hover:bg-[var(--nexa-bg-base)]/50 transition-colors">
                        <td className="py-3.5 px-3 flex items-center gap-3">
                          <img
                            src={avatarSrc}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-[var(--nexa-border)] shadow-xs"
                            onError={(e) => {
                              const fallbackIndex = (((page - 1) * itemsPerPage + idx) % 20) + 1;
                              (e.currentTarget as HTMLImageElement).src = `https://res.cloudinary.com/ihfqdysu/image/upload/ofia_ng_assets/character${fallbackIndex}.jpg`;
                            }}
                          />
                          <div>
                            <p className="font-bold text-xs">{u.name}</p>
                            <p className="text-[10px] text-[var(--nexa-text-muted)] font-mono">{u.email} • {u.id}</p>
                          </div>
                        </td>
                      <td className="py-3.5 px-3 text-[var(--nexa-text-muted)] font-medium">{u.department}</td>
                      <td className="py-3.5 px-3 text-[var(--nexa-text-primary)] font-semibold">{u.designation}</td>
                      <td className="py-3.5 px-3">
                        {u.managerName ? (
                          <span className="font-medium text-xs text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                            {u.managerName}
                          </span>
                        ) : (
                          <span className="text-[var(--nexa-text-muted)] font-medium">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {editingUserId === u.id ? (
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as RoleKey)}
                            className="px-2.5 py-1 text-xs font-bold rounded-full bg-[var(--nexa-bg-base)] border border-[#1A56DB] text-[var(--nexa-text-primary)] outline-none"
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
                          getRoleBadge(u.role)
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {editingUserId === u.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRoleChange(u.id, selectedRole)}
                              disabled={isSaving}
                              className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs cursor-pointer shadow-xs"
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="px-3 py-1 rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <NexaButton
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-7"
                              onClick={() => handleOpenEditModal(u)}
                            >
                              Edit
                            </NexaButton>
                            <NexaButton
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-7 hover:border-red-500 hover:text-red-500 text-rose-500"
                              onClick={() => handleDeleteStaffUser(u.id, u.name)}
                            >
                              Delete
                            </NexaButton>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
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
        </NexaCard>
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
                    ? `Modify staff record for tenant workspace '${displayTenantName}' in Postgres.`
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
                    {formDepartment && !DEPARTMENTS.includes(formDepartment) && (
                      <option value={formDepartment}>
                        {formDepartment} (Current Department)
                      </option>
                    )}
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      Job Title / Designation
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomDesignation(!isCustomDesignation)}
                      className="text-[10px] text-[#1A56DB] hover:underline cursor-pointer"
                    >
                      {isCustomDesignation ? "Select from list" : "+ Custom"}
                    </button>
                  </div>
                  {isCustomDesignation ? (
                    <input
                      type="text"
                      placeholder="e.g. Senior Operations Officer"
                      value={formDesignation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormDesignation(val);
                        const matched = mapToParentDepartment(val);
                        if (matched) setFormDepartment(matched);
                      }}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                    />
                  ) : (
                    <select
                      value={formDesignation}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__CUSTOM__") {
                          setIsCustomDesignation(true);
                          return;
                        }
                        setFormDesignation(val);
                        const matched = mapToParentDepartment(val);
                        if (matched) setFormDepartment(matched);
                      }}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      <option value="" disabled>
                        -- Select Tenant Department / Title --
                      </option>
                      {/* Preserve current designation if not in preset list */}
                      {formDesignation && !tenantDepartments.includes(formDesignation) && (
                        <option value={formDesignation}>
                          {formDesignation} (Current Designation)
                        </option>
                      )}
                      {tenantDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                      <option value="__CUSTOM__">+ Enter Custom Title / Designation...</option>
                    </select>
                  )}
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-xs text-[var(--nexa-text-muted)] bg-[var(--nexa-bg-base)]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1A56DB]" />
          <span>Loading tenant user directory...</span>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-xs text-[var(--nexa-text-muted)] bg-[var(--nexa-bg-base)]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1A56DB]" />
          <span>Loading tenant user directory...</span>
        </div>
      </div>
    }>
      <UserManagementContent />
    </Suspense>
  );
}
