"use client";

import { useState, useEffect, useCallback } from "react";
import { USER_API } from "./api-client";
import { fetchDatabaseTenants, resolveTenantFromList, DatabaseTenant } from "./tenant-context";
import {
  DepartmentAccessItem,
  DEFAULT_DEPARTMENT_ACCESS,
  fetchTenantDepartmentAccess,
  getUserDepartmentAccess,
} from "./department-access";

export type RoleKey =
  | "admin"
  | "md"
  | "hr"
  | "manager"
  | "accountant"
  | "marketer"
  | "sales_closer"
  | "employee"
  | "cashier"
  | "inventory_officer"
  | "dispatcher";

export interface RoleInfo {
  key: RoleKey;
  label: string;
  badge: string;
  description: string;
  color: string;
  avatarBg: string;
}

export const ERP_ROLES: RoleInfo[] = [
  {
    key: "admin",
    label: "Tenant Administrator",
    badge: "Super Admin",
    description: "Full master privilege across all business modules, financial ledgers, and permissions.",
    color: "#0069FF",
    avatarBg: "bg-blue-600",
  },
  {
    key: "md",
    label: "Managing Director (MD)",
    badge: "Executive",
    description: "High-level visibility over departmental performance, financial standings, and analytics.",
    color: "#7E3AF2",
    avatarBg: "bg-purple-600",
  },
  {
    key: "hr",
    label: "Human Resources (HR)",
    badge: "People & Culture",
    description: "Orchestration of performance appraisal cycles, KPIs, staffing directories, and reviews.",
    color: "#E02424",
    avatarBg: "bg-rose-600",
  },
  {
    key: "accountant",
    label: "Chief Accountant",
    badge: "Finance",
    description: "Double-entry bookkeeping, trial balance, tax remittances, invoices, and payroll processing.",
    color: "#0E9F6E",
    avatarBg: "bg-emerald-600",
  },
  {
    key: "marketer",
    label: "Growth Marketer / Sales",
    badge: "Marketing",
    description: "Manage CRM sales pipelines, B2B deal stages, viral promoter campaigns, and customer conversions.",
    color: "#EC4899",
    avatarBg: "bg-pink-600",
  },
  {
    key: "sales_closer",
    label: "Sales Closer",
    badge: "Sales Closer",
    description: "Assigned to the Employee Portal and CRM (Sales Closer Portal) for high-ticket client closing.",
    color: "#059669",
    avatarBg: "bg-emerald-600",
  },
  {
    key: "manager",
    label: "Team / Line Manager",
    badge: "Supervisor",
    description: "Subordinate appraisal evaluation, scoring calibrations, and departmental task pipelines.",
    color: "#D97706",
    avatarBg: "bg-amber-600",
  },
  {
    key: "employee",
    label: "General Employee",
    badge: "Staff",
    description: "Self-service reviews, career growth tracks, quest challenges, and internal messaging.",
    color: "#4B5563",
    avatarBg: "bg-slate-600",
  },
  {
    key: "cashier",
    label: "Point of Sale Cashier",
    badge: "Retail & POS",
    description: "Touch counter cashiering, barcode checkout, cash drawer reconciliation, and receipts.",
    color: "#0694A2",
    avatarBg: "bg-cyan-600",
  },
  {
    key: "inventory_officer",
    label: "Warehouse / IMS Officer",
    badge: "Supply Chain",
    description: "Multi-depot stock intake, bin transfers, stock takes, adjustments, and supplier orders.",
    color: "#F59E0B",
    avatarBg: "bg-amber-500",
  },
  {
    key: "dispatcher",
    label: "Logistics & Fleet Dispatcher",
    badge: "Fulfillment",
    description: "Zonal dispatch routing, driver manifests, parcel tracking, and proof-of-delivery.",
    color: "#3B82F6",
    avatarBg: "bg-blue-500",
  },
];

// Configurable roles on the tenant access matrix (Tenant Admin is locked/unrestricted by default)
export const CONFIGURABLE_ERP_ROLES: RoleInfo[] = ERP_ROLES.filter(
  (r) => r.key !== "admin"
);

export interface ErpModuleDef {
  key: string;
  label: string;
  category: "Operations" | "Ofia Enterprise Suite" | "Portals & Team" | "Core Control" | "Finance & HR";
  description: string;
  href: string;
  badge?: string;
}

export const ERP_MODULES: ErpModuleDef[] = [
  {
    key: "ai",
    label: "Ofia Voice Agent",
    category: "Operations",
    description: "Autonomous phone caller for corporate sales outreach and qualification.",
    href: "/erp/admin/ai",
    badge: "Voice",
  },
  {
    key: "crm",
    label: "CRM & Email Marketing",
    category: "Ofia Enterprise Suite",
    description: "B2B sales pipelines, contact lists, scheduled email blasts, and lead scoring.",
    href: "/erp/admin/crm",
    badge: "CRM",
  },
  {
    key: "marketplace",
    label: "Marketplace Manager",
    category: "Operations",
    description: "Public storefront, order fulfillments, merchant catalogs, and payments.",
    href: "/erp/admin/marketplace",
  },
  {
    key: "shop",
    label: "Ofia Shop Manager",
    category: "Operations",
    description: "Point of sale (POS) cash registers, warehouse inventory (IMS), and viral customer referral campaigns.",
    href: "/erp/admin/shop",
    badge: "Retail",
  },
  {
    key: "mobility",
    label: "Ofia Mobility Manager",
    category: "Operations",
    description: "Fleet telemetry, multi-modal transport services, live dispatch console, driver rosters, and vehicle ROI.",
    href: "/erp/admin/mobility",
    badge: "Mobility",
  },
  {
    key: "dispatch",
    label: "Ofia Dispatch Manager",
    category: "Operations",
    description: "Operational control center for dispatch agents, waybill tracking, and rider allocation.",
    href: "/erp/admin/dispatch",
    badge: "Admin",
  },
  {
    key: "accounting",
    label: "Accounting & Ledgers",
    category: "Ofia Enterprise Suite",
    description: "General ledger, charts of accounts, trial balance, and tax remittances.",
    href: "/erp/accountant",
    badge: "GL",
  },
  {
    key: "hr",
    label: "HR & Appraisals",
    category: "Ofia Enterprise Suite",
    description: "Staff performance review cycles, objectives, calibrations, and reports.",
    href: "/erp/hr",
  },
  {
    key: "users",
    label: "User Management",
    category: "Ofia Enterprise Suite",
    description: "Corporate staff directory, departmental hierarchy, 10-tier role governance, and mass messaging.",
    href: "/erp/admin/users",
    badge: "Staff",
  },
  {
    key: "employee",
    label: "Employee Portal",
    category: "Portals & Team",
    description: "Personal self-service appraisals, profile audit, and quest participation.",
    href: "/erp/employee",
  },
  {
    key: "manager",
    label: "Manager Portal",
    category: "Portals & Team",
    description: "Direct reports evaluation, scoring verifications, and return notes.",
    href: "/erp/manager",
  },
  {
    key: "md",
    label: "MD Executive Deep Dive",
    category: "Portals & Team",
    description: "Enterprise-wide departmental rankings, averages, and executive audit.",
    href: "/erp/md",
  },
  {
    key: "mobility_ops",
    label: "Mobility Operations",
    category: "Portals & Team",
    description: "Real-time dispatch, vehicle telemetry, active trip queue, and incident management.",
    href: "/erp/ops/mobility",
    badge: "Live",
  },
  {
    key: "sales_closer",
    label: "Sales Closer Portal",
    category: "Portals & Team",
    description: "Dedicated pipeline for assigned leads, sales outreach, calls, demos, and closing activities.",
    href: "/erp/ops/crm",
    badge: "Closer",
  },
];

export interface AssignablePage {
  key: string;
  label: string;
  description: string;
  route: string;
  category: "Portals & Team" | "Ofia Enterprise Suite" | "Operations";
  badge?: string;
}

export const ASSIGNABLE_PAGES: AssignablePage[] = [
  {
    key: "sales_closer",
    label: "Sales Closer Portal",
    description: "Dedicated pipeline for assigned leads directory, sales outreach, calls, demos, and closing activities.",
    route: "/erp/ops/crm",
    category: "Portals & Team",
    badge: "Closer",
  },
  {
    key: "employee",
    label: "Employee Portal",
    description: "Personal self-service appraisals, profile audit, career quest challenges, and reviews.",
    route: "/erp/employee",
    category: "Portals & Team",
    badge: "Portal",
  },
  {
    key: "crm",
    label: "CRM & Email Marketing",
    description: "B2B sales pipelines, contact lists, lead scoring, deals stages, and client outreach.",
    route: "/erp/admin/crm",
    category: "Ofia Enterprise Suite",
    badge: "CRM",
  },
  {
    key: "manager",
    label: "Manager Portal",
    description: "Direct reports appraisal evaluation, scoring verifications, return notes, and calibrations.",
    route: "/erp/manager",
    category: "Portals & Team",
    badge: "Portal",
  },
  {
    key: "md",
    label: "MD Executive Portal",
    description: "Enterprise-wide departmental rankings, executive audit, company averages, and KPI metrics.",
    route: "/erp/md",
    category: "Portals & Team",
    badge: "Executive",
  },
  {
    key: "accounting",
    label: "Accounting & Ledgers",
    description: "General ledger, charts of accounts, trial balance, tax remittances, and invoices.",
    route: "/erp/accountant",
    category: "Ofia Enterprise Suite",
    badge: "GL",
  },
  {
    key: "hr",
    label: "HR & Appraisals",
    description: "Staff performance review cycles, objectives, calibrations, and departmental reports.",
    route: "/erp/hr",
    category: "Ofia Enterprise Suite",
  },
  {
    key: "users",
    label: "User Management",
    description: "Corporate staff directory, departmental hierarchy, role administration, and page access.",
    route: "/erp/admin/users",
    category: "Ofia Enterprise Suite",
    badge: "Staff",
  },
  {
    key: "shop",
    label: "Ofia Shop & POS",
    description: "Point of sale (POS) cash registers, warehouse inventory (IMS), and viral referral campaigns.",
    route: "/erp/admin/shop",
    category: "Operations",
    badge: "Retail",
  },
  {
    key: "mobility",
    label: "Ofia Mobility Manager",
    description: "Fleet telemetry, multi-modal transport services, driver rosters, and vehicle ROI.",
    route: "/erp/admin/mobility",
    category: "Operations",
    badge: "Mobility",
  },
  {
    key: "mobility_ops",
    label: "Mobility Operations",
    description: "Real-time dispatch, vehicle telemetry, active trip queue, driver rosters, and manifests.",
    route: "/erp/ops/mobility",
    category: "Portals & Team",
    badge: "Live",
  },
  {
    key: "dispatch",
    label: "Ofia Dispatch Manager",
    description: "Operational control center for dispatch agents, waybill tracking, and rider allocation.",
    route: "/erp/admin/dispatch",
    category: "Operations",
    badge: "Admin",
  },
  {
    key: "marketplace",
    label: "Marketplace Manager",
    description: "Public storefront, order fulfillments, merchant catalogs, bookings, and payments.",
    route: "/erp/admin/marketplace",
    category: "Operations",
  },
  {
    key: "ai",
    label: "Ofia AI Swarm",
    description: "15 autonomous marketing, sales, and lead automation agent swarm.",
    route: "/erp/admin/ai",
    category: "Operations",
    badge: "15 AI",
  },
  {
    key: "overview",
    label: "Admin Command Center",
    description: "Master tenant administrative dashboard, system health, and operations pulse.",
    route: "/erp/admin",
    category: "Operations",
  },
];

export function getDefaultPagesForRole(role: RoleKey | string, designation?: string): string[] {
  const normalizedRole = (role || "").toLowerCase();
  const desig = (designation || "").toLowerCase();

  // A sales closer sees the employee portal and the Sales Closer Portal (/erp/ops/crm)
  if (
    normalizedRole === "sales_closer" ||
    desig.includes("sales closer") ||
    desig.includes("closer")
  ) {
    return ["sales_closer", "employee"];
  }

  switch (normalizedRole) {
    case "admin":
      return ASSIGNABLE_PAGES.map((p) => p.key);
    case "md":
      return ["employee", "md", "crm", "accounting", "hr", "shop", "mobility"];
    case "manager":
      return ["employee", "manager"];
    case "hr":
      return ["employee", "manager", "hr", "users"];
    case "accountant":
      return ["employee", "accounting"];
    case "marketer":
      return ["employee", "crm", "ai", "marketplace"];
    case "cashier":
      return ["employee", "shop"];
    case "inventory_officer":
      return ["employee", "shop"];
    case "dispatcher":
      return ["employee", "dispatch", "dispatch_ops", "mobility", "mobility_ops"];
    case "employee":
    default:
      return ["employee"];
  }
}

/**
 * Determines whether a user or employee has been granted access to the Sales Closer Portal.
 * An employee has access if:
 * 1. Their assignedPages includes "sales_closer" (or "closer")
 * 2. Their role is "sales_closer"
 * 3. Their designation explicitly includes "sales closer" or "closer"
 *
 * System administrators and general employees without closer access are strictly excluded.
 */
export function isUserSalesCloser(u: any): boolean {
  if (!u) return false;

  const role = String(u.role || u.Role || "").toLowerCase().trim();
  const desig = String(u.designation || u.Designation || "").toLowerCase().trim();

  // Administrators have system-wide access but are not individual sales closer employees
  // unless their designation explicitly designates them as a sales closer.
  if (role === "admin" || role === "super_admin" || role === "superadmin") {
    return desig.includes("sales closer");
  }

  // 1. Check assignedPages (handles arrays, JSON string, double-stringified JSON, comma-separated)
  const rawPages = u.assignedPages ?? u.AssignedPages;
  let pages: string[] = [];
  if (Array.isArray(rawPages)) {
    pages = rawPages.map((p: any) => String(p).trim().toLowerCase());
  } else if (typeof rawPages === "string" && rawPages.trim()) {
    try {
      const parsed = JSON.parse(rawPages);
      if (Array.isArray(parsed)) {
        pages = parsed.map((p: any) => String(p).trim().toLowerCase());
      } else if (typeof parsed === "string") {
        try {
          const nested = JSON.parse(parsed);
          if (Array.isArray(nested)) pages = nested.map((p: any) => String(p).trim().toLowerCase());
        } catch {
          pages = [parsed.trim().toLowerCase()];
        }
      }
    } catch {
      pages = rawPages.split(",").map((s: string) => s.trim().toLowerCase());
    }
  }

  if (pages.includes("sales_closer") || pages.includes("closer")) {
    return true;
  }

  // 2. Direct role check
  if (role === "sales_closer" || role === "closer" || role === "salescloser") {
    return true;
  }

  // 3. Designation check
  if (desig.includes("sales closer") || desig === "closer") {
    return true;
  }

  return false;
}

/**
 * Filters an array of user objects to strictly return only employees given access to the Sales Closer page.
 */
export function filterSalesClosers(users: any[]): { id: string; name: string; email: string }[] {
  if (!Array.isArray(users)) return [];
  const closers = users.filter(isUserSalesCloser);
  return closers.map((u) => ({
    id: u.id || u.ID || "",
    name: u.name || u.Name || u.email || u.Email || "Sales Closer",
    email: u.email || u.Email || "",
  }));
}

export type PermissionMatrix = Record<RoleKey, Record<string, boolean>>;

/**
 * Strict Zero-Default Empty Permission Matrix.
 * Guarantees that unprovisioned modules are NEVER leaked or rendered.
 */
export const EMPTY_PERMISSION_MATRIX: PermissionMatrix = {
  admin: { mission: true, overview: true },
  md: { mission: true, overview: true },
  hr: { mission: true },
  manager: { mission: true },
  accountant: { mission: true },
  marketer: { mission: true },
  sales_closer: { mission: true },
  employee: { mission: true, employee: true },
  cashier: { mission: true },
  inventory_officer: { mission: true },
  dispatcher: { mission: true },
};

export const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = EMPTY_PERMISSION_MATRIX;

export function getTenantPermissionMatrix(tenantId: string): PermissionMatrix {
  return EMPTY_PERMISSION_MATRIX;
}

export function saveTenantPermissionMatrix(
  tenantId: string,
  matrix: PermissionMatrix
): void {
  if (typeof window === "undefined") return;
  // Dispatch in-memory custom event for real-time reactivity in shells and components
  window.dispatchEvent(
    new CustomEvent("ofia_rbac_updated", {
      detail: { tenantId, matrix },
    })
  );
}

export async function fetchTenantPermissionMatrix(tenantId: string): Promise<PermissionMatrix> {
  try {
    const res = await USER_API.getTenantRBAC(tenantId);
    if (res && res.matrix && Object.keys(res.matrix).length > 0) {
      // Build permission matrix strictly starting from empty, NEVER assuming default true
      const merged: PermissionMatrix = {
        admin: { mission: true, overview: true },
        md: { mission: true, overview: true },
        hr: { mission: true },
        manager: { mission: true },
        accountant: { mission: true },
        marketer: { mission: true },
        sales_closer: { mission: true },
        employee: { mission: true, employee: true },
        cashier: { mission: true },
        inventory_officer: { mission: true },
        dispatcher: { mission: true },
      };

      // Super Admin provisioned module set (stored under 'tenant_provision' or 'admin')
      const tp = res.matrix.tenant_provision || {};
      const ad = res.matrix.admin || {};

      for (const role of ERP_ROLES) {
        merged[role.key] = {
          ...(merged[role.key] || {}),
          ...(res.matrix[role.key] || {}),
        };
      }

      if (res.matrix.tenant_provision) {
        (merged as any).tenant_provision = { ...res.matrix.tenant_provision };
      }

      // Normalize on_demand and on-demand in merged.admin and tenant_provision
      if (merged.admin) {
        if (merged.admin.on_demand !== undefined) {
          (merged.admin as any)["on-demand"] = merged.admin.on_demand;
        } else if ((merged.admin as any)["on-demand"] !== undefined) {
          merged.admin.on_demand = (merged.admin as any)["on-demand"];
        }
      }
      if ((merged as any).tenant_provision) {
        if ((merged as any).tenant_provision.on_demand !== undefined) {
          (merged as any).tenant_provision["on-demand"] = (merged as any).tenant_provision.on_demand;
        } else if ((merged as any).tenant_provision["on-demand"] !== undefined) {
          (merged as any).tenant_provision.on_demand = (merged as any).tenant_provision["on-demand"];
        }
      }

      // 1. Tenant Administrator (admin) gets ONLY modules explicitly provisioned (=== true)
      for (const mod of ERP_MODULES) {
        const isAllowed = tp[mod.key] === true || ad[mod.key] === true;
        merged.admin[mod.key] = isAllowed;
      }

      // Explicitly tie Sales Closer Portal and CRM access to workspace CRM module provisioning
      const isCrmProvisioned = tp.crm === true || ad.crm === true;
      merged.admin.crm = isCrmProvisioned;
      merged.admin.sales_closer = isCrmProvisioned && (tp.sales_closer === true || ad.sales_closer === true);

      if ((merged as any).tenant_provision) {
        (merged as any).tenant_provision.crm = isCrmProvisioned;
        (merged as any).tenant_provision.sales_closer = merged.admin.sales_closer;
      }

      // 2. For other roles, a module is enabled ONLY IF:
      // a) Allowed for the tenant in the database, AND
      // b) Granted to that role
      for (const role of ERP_ROLES) {
        if (role.key !== "admin") {
          for (const mod of ERP_MODULES) {
            const isTenantAllowed = merged.admin[mod.key] === true;
            const isRoleGranted = merged[role.key]?.[mod.key] === true;
            merged[role.key][mod.key] = isTenantAllowed && isRoleGranted;
          }
        }
      }

      // Explicitly synchronize role permissions for Sales Closer & Marketer with CRM provisioning
      if (merged.sales_closer) {
        merged.sales_closer.sales_closer = isCrmProvisioned;
      }
      if (merged.marketer) {
        merged.marketer.crm = isCrmProvisioned;
      }
      if (!isCrmProvisioned) {
        for (const role of ERP_ROLES) {
          merged[role.key].crm = false;
          merged[role.key].sales_closer = false;
        }
      }

      // Dispatch in-memory event to update active shell state
      saveTenantPermissionMatrix(tenantId, merged);
      return merged;
    }
  } catch (err) {
    console.warn(`[RBAC] Database lookup for tenant '${tenantId}':`, err);
  }

  // Under NO circumstances fallback to all-modules. Return empty matrix when data is unavailable
  return EMPTY_PERMISSION_MATRIX;
}

export async function saveTenantPermissionMatrixRemote(
  tenantId: string,
  matrix: PermissionMatrix
): Promise<{ success: boolean; message: string }> {
  // 1. Instantly update active components via in-memory event
  saveTenantPermissionMatrix(tenantId, matrix);

  // 2. Persist directly to Postgres database table TenantRolePermission via backend API
  try {
    const res = await USER_API.saveTenantRBAC(tenantId, matrix);
    return {
      success: true,
      message: res.message || "Permissions successfully persisted to Postgres database",
    };
  } catch (err: any) {
    console.error(`[RBAC] Remote database sync failed:`, err);
    return {
      success: false,
      message: "Database sync error: " + (err?.message || "Could not reach database"),
    };
  }
}

export function isModuleEnabledForRole(
  tenantId: string,
  role: string,
  moduleKey: string
): boolean {
  const matrix = getTenantPermissionMatrix(tenantId);
  const roleKey = role as RoleKey;

  // Tenant Admin gets strictly provisioned modules
  if (role === "admin") {
    return matrix.admin?.[moduleKey] === true;
  }

  if (!matrix[roleKey]) {
    return false;
  }
  return Boolean(matrix[roleKey][moduleKey]);
}

/**
 * React hook to reactively track ERP module provisioning for the active tenant.
 * Pulls from the Postgres database (via USER_API) and updates in real-time when Super Admin toggles permissions.
 * Guarantees zero-fallback: while loading or if data fails, no unprovisioned modules are shown.
 */
export function useTenantProvisioning() {
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [departmentConfigs, setDepartmentConfigs] = useState<DepartmentAccessItem[]>([]);
  const [tenant, setTenant] = useState<DatabaseTenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCurrent = true;

    async function loadProvisioning(attempt = 1) {
      try {
        setIsLoading(true);
        const list = await fetchDatabaseTenants();
        if (!isCurrent) return;

        let userEmail: string | null = null;
        let searchParamSlug: string | null = null;
        if (typeof window !== "undefined") {
          userEmail = localStorage.getItem("nexa_user_email");
          const storedUser = localStorage.getItem("erp_current_user");
          if (storedUser) {
            try {
              const u = JSON.parse(storedUser);
              if (u?.email) userEmail = u.email;
              if (u?.tenantSlug) searchParamSlug = u.tenantSlug;
              if (u?.company && !searchParamSlug) searchParamSlug = u.company;
            } catch {}
          }
          if (!searchParamSlug) {
            const urlParams = new URLSearchParams(window.location.search);
            searchParamSlug =
              urlParams.get("tenant") ||
              urlParams.get("tenant_slug") ||
              urlParams.get("orgId") ||
              urlParams.get("org");
          }
        }

        const matched = resolveTenantFromList(list, userEmail, searchParamSlug);
        setTenant(matched);

        const tenantKey = matched?.slug || matched?.id || searchParamSlug || "";

        // Fetch live provisioned matrix from Postgres backend
        if (tenantKey) {
          const remoteMatrix = await fetchTenantPermissionMatrix(tenantKey);
          if (remoteMatrix && isCurrent) {
            const hasAnyConfigured = Object.keys(remoteMatrix.admin || {}).length > 2;
            if (hasAnyConfigured) {
              setMatrix(remoteMatrix);
              setIsLoading(false);
            } else if (attempt < 5) {
              // Still unpopulated or backend starting up: keep loading and retry
              setTimeout(() => {
                if (isCurrent) loadProvisioning(attempt + 1);
              }, attempt * 1200);
              return;
            } else {
              setMatrix(remoteMatrix);
              setIsLoading(false);
            }
          }

          // Fetch live department access configurations
          const remoteDepts = await fetchTenantDepartmentAccess(tenantKey);
          if (remoteDepts && remoteDepts.length > 0 && isCurrent) {
            setDepartmentConfigs(remoteDepts);
          }
        } else {
          setMatrix(EMPTY_PERMISSION_MATRIX);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("[Provisioning] Failed to fetch tenant provisioning:", err);
        if (attempt < 5) {
          setTimeout(() => {
            if (isCurrent) loadProvisioning(attempt + 1);
          }, attempt * 1500);
          return;
        }
        if (isCurrent) {
          setMatrix(EMPTY_PERMISSION_MATRIX);
          setIsLoading(false);
        }
      }
    }

    loadProvisioning();

    // Listen to real-time RBAC updates from Super Admin / Access Control changes
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.matrix) {
        setMatrix(customEvent.detail.matrix);
      }
    };

    const handleDeptUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.departments) {
        setDepartmentConfigs(customEvent.detail.departments);
      }
    };

    window.addEventListener("ofia_rbac_updated", handleUpdate);
    window.addEventListener("ofia_dept_access_updated", handleDeptUpdate);
    return () => {
      isCurrent = false;
      window.removeEventListener("ofia_rbac_updated", handleUpdate);
      window.removeEventListener("ofia_dept_access_updated", handleDeptUpdate);
    };
  }, []);

  const isModuleProvisioned = useCallback(
    (moduleKey: string): boolean => {
      // While loading or if data is not yet resolved, NEVER display provisioned modules
      if (isLoading || !matrix) return false;
      if (moduleKey === "mission" || moduleKey === "overview") return true;
      if (moduleKey === "departments") {
        return Boolean(matrix.admin?.users || (matrix as any).tenant_provision?.users);
      }
      if (moduleKey === "dispatch_ops") {
        return Boolean(matrix.admin?.dispatch || (matrix as any).tenant_provision?.dispatch);
      }
      if (moduleKey === "sales_closer") {
        return Boolean(matrix.admin?.crm || (matrix as any).tenant_provision?.crm);
      }
      return Boolean(matrix.admin?.[moduleKey] || (matrix as any).tenant_provision?.[moduleKey]);
    },
    [matrix, isLoading]
  );

  const isShopSubModuleProvisioned = useCallback(
    (subKey: string): boolean => {
      // While loading or if data is not yet resolved, NEVER display sub-modules
      if (isLoading || !matrix) return false;
      if (tenant?.shopSubModules && tenant.shopSubModules[subKey] !== undefined) {
        return Boolean(tenant.shopSubModules[subKey]);
      }
      return isModuleProvisioned(subKey);
    },
    [tenant, isModuleProvisioned, isLoading, matrix]
  );

  return {
    matrix,
    tenant,
    departmentConfigs,
    isLoading,
    isModuleProvisioned,
    isShopSubModuleProvisioned,
  };
}

export interface RoleCapability {
  key: RoleKey;
  label: string;
  // Main control panels managed by this role:
  controlPanels: string[];
  // Portals accessible to this role:
  portals: ("employee" | "manager" | "md")[];
  // Default home route:
  homeRoute: string;
}

export const ROLE_CAPABILITIES: Record<RoleKey, RoleCapability> = {
  admin: {
    key: "admin",
    label: "Tenant Administrator",
    controlPanels: ["overview", "ai", "crm", "marketplace", "shop", "mobility", "mobility_ops", "dispatch", "dispatch_ops", "accounting", "hr", "users", "departments"],
    portals: ["employee", "manager", "md"],
    homeRoute: "/erp/admin",
  },
  md: {
    key: "md",
    label: "Managing Director",
    controlPanels: ["accounting", "hr", "crm", "shop", "mobility", "mobility_ops"],
    portals: ["md", "employee"],
    homeRoute: "/erp/md",
  },
  manager: {
    key: "manager",
    label: "Line Manager",
    controlPanels: [],
    portals: ["manager", "employee"],
    homeRoute: "/erp/manager",
  },
  employee: {
    key: "employee",
    label: "General Employee",
    controlPanels: [],
    portals: ["employee"],
    homeRoute: "/erp/employee",
  },
  hr: {
    key: "hr",
    label: "HR Lead",
    controlPanels: ["hr", "users", "departments"],
    portals: ["manager", "employee"],
    homeRoute: "/erp/hr",
  },
  accountant: {
    key: "accountant",
    label: "Finance Lead",
    controlPanels: ["accounting"],
    portals: ["manager", "employee"],
    homeRoute: "/erp/accountant",
  },
  marketer: {
    key: "marketer",
    label: "Growth & Marketing Lead",
    controlPanels: ["crm", "ai", "marketplace"],
    portals: ["manager", "employee"],
    homeRoute: "/erp/marketer",
  },
  sales_closer: {
    key: "sales_closer",
    label: "Sales Closer",
    controlPanels: ["crm"],
    portals: ["employee", "sales_closer" as any],
    homeRoute: "/erp/ops/crm",
  },
  dispatcher: {
    key: "dispatcher",
    label: "Fleet Dispatcher",
    controlPanels: ["dispatch", "dispatch_ops", "mobility", "mobility_ops"],
    portals: ["employee"],
    homeRoute: "/erp/admin/dispatch",
  },
  inventory_officer: {
    key: "inventory_officer",
    label: "Warehouse / IMS Officer",
    controlPanels: ["shop"],
    portals: ["employee"],
    homeRoute: "/erp/admin/shop/inventory",
  },
  cashier: {
    key: "cashier",
    label: "POS Cashier",
    controlPanels: ["shop"],
    portals: ["employee"],
    homeRoute: "/erp/admin/shop/pos",
  },
};

export function isUserLineManager(
  user: { id?: string; name?: string; role?: string; isLineManager?: boolean } | null,
  allUsers?: any[]
): boolean {
  if (!user) return false;
  if (user.role === "manager") return true;
  if (user.isLineManager) return true;
  if (allUsers && allUsers.length > 0) {
    return allUsers.some(
      (u) =>
        u.id !== user.id &&
        ((user.id && u.managerId === user.id) ||
          (user.name &&
            u.managerName &&
            u.managerName.toLowerCase().trim() === user.name.toLowerCase().trim()))
    );
  }
  return false;
}

export function isNavItemVisibleForRole(
  itemKey: string,
  role: RoleKey,
  isLineManager: boolean,
  isModuleProvisioned: (key: string) => boolean,
  userDepartment?: string,
  departmentConfigs?: DepartmentAccessItem[]
): boolean {
  // If the module is not provisioned for the workspace, it's not present for any portal or role
  if (!isModuleProvisioned(itemKey)) {
    return false;
  }

  // Admin gets all active workspace modules & all portals
  if (role === "admin") {
    return true;
  }

  // Dynamic Department Access Check:
  // If the user belongs to a department and department configurations are provided,
  // the department's allowed pages grant direct access!
  if (userDepartment && departmentConfigs && departmentConfigs.length > 0) {
    const deptAccess = getUserDepartmentAccess({ department: userDepartment, role }, departmentConfigs);
    if (deptAccess.matchedDepartment && deptAccess.isPageAllowed(itemKey)) {
      return true;
    }
  }

  // General employee only sees Employee Portal
  if (role === "employee") {
    return itemKey === "employee";
  }

  // Sales Closer sees Sales Closer Portal and Employee Portal (only if CRM is provisioned)
  if (role === "sales_closer") {
    const hasCrm = isModuleProvisioned("crm");
    if (itemKey === "sales_closer") {
      return hasCrm;
    }
    return itemKey === "employee";
  }

  // Line Manager sees Manager Portal and Employee Portal
  if (role === "manager") {
    return itemKey === "manager" || itemKey === "employee";
  }

  // MD sees MD Executive Portal, Employee Portal, and Manager Portal if they are a line manager
  if (role === "md") {
    if (itemKey === "md" || itemKey === "employee") return true;
    if (itemKey === "manager") return isLineManager;
    // MD also has executive control panel visibility into provisioned modules
    const mdExecutivePanels = ["accounting", "hr", "crm", "shop", "mobility", "mobility_ops"];
    return mdExecutivePanels.includes(itemKey);
  }

  // Functional Leads (HR, Accountant, Marketer, Dispatcher, Inventory, Cashier)
  const cap = ROLE_CAPABILITIES[role];
  if (!cap) return itemKey === "employee";

  if (cap.controlPanels.includes(itemKey)) {
    return true;
  }

  if (cap.portals.includes(itemKey as any)) {
    return true;
  }

  return false;
}

export function isNavItemVisibleForUser(
  itemKey: string,
  user: { department?: string; role?: string; isLineManager?: boolean; assignedPages?: string[] } | null | undefined,
  isModuleProvisioned: (key: string) => boolean,
  departmentConfigs?: DepartmentAccessItem[]
): boolean {
  if (!isModuleProvisioned(itemKey)) {
    return false;
  }

  const role = (user?.role as RoleKey) || "employee";
  if (role === "admin") return true;

  // Direct Assigned Pages Check:
  // If the user has assignedPages configured (e.g. A sales closer assigned Employee Portal + Sales Closer Portal):
  const rawAssigned = user?.assignedPages ?? (user as any)?.AssignedPages;
  let assignedPages: string[] = [];
  if (Array.isArray(rawAssigned)) {
    assignedPages = rawAssigned;
  } else if (typeof rawAssigned === "string" && rawAssigned.trim()) {
    try {
      const parsed = JSON.parse(rawAssigned);
      if (Array.isArray(parsed)) assignedPages = parsed;
    } catch {
      assignedPages = rawAssigned.split(",").map((s) => s.trim());
    }
  }

  // If designated or role is sales_closer, ensure sales_closer is included
  if (itemKey === "sales_closer") {
    if (isUserSalesCloser(user)) {
      return isModuleProvisioned("crm");
    }
  }

  if (assignedPages.length > 0) {
    if (itemKey === "sales_closer") {
      return isModuleProvisioned("crm") && (assignedPages.includes("sales_closer") || assignedPages.includes("closer"));
    }
    if (itemKey === "crm") {
      return isModuleProvisioned("crm") && assignedPages.includes("crm");
    }
    return assignedPages.includes(itemKey);
  }

  const isLineMgr = Boolean(user?.isLineManager || role === "manager");
  return isNavItemVisibleForRole(
    itemKey,
    role,
    isLineMgr,
    isModuleProvisioned,
    user?.department,
    departmentConfigs
  );
}


