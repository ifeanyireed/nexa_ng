"use client";

import { useState, useEffect, useCallback } from "react";
import { USER_API } from "./api-client";
import { fetchDatabaseTenants, resolveTenantFromList, DatabaseTenant } from "./tenant-context";

export type RoleKey =
  | "admin"
  | "md"
  | "hr"
  | "manager"
  | "accountant"
  | "marketer"
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
    label: "Ofia AI Swarm",
    category: "Operations",
    description: "15 autonomous marketing, sales, and lead automation agent swarm.",
    href: "/erp/admin/ai",
    badge: "15 AI",
  },
  {
    key: "crm",
    label: "CRM and Sales",
    category: "Ofia Enterprise Suite",
    description: "B2B sales pipelines, customer deals, account contacts, and revenue tracking.",
    href: "/erp/marketer",
    badge: "Sales",
  },
  {
    key: "marketplace",
    label: "Ofia Compass Manager",
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
    key: "logistics",
    label: "Ofia Logistics Manager",
    category: "Operations",
    description: "Zonal route dispatching, fleet management, and shipment tracking.",
    href: "/erp/admin/logistics",
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
    description: "Corporate staff directory, 10-tier role governance, designations, and supervisory reporting.",
    href: "/erp/admin/users",
    badge: "Staff",
  },
  {
    key: "departments",
    label: "Departments",
    category: "Ofia Enterprise Suite",
    description: "Corporate organizational divisions, budgetary cost centers, leadership lines, and staff headcount.",
    href: "/erp/admin/departments",
    badge: "Org",
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
];

export type PermissionMatrix = Record<RoleKey, Record<string, boolean>>;

export const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = {
  admin: {
    mission: true,
    ai: true,
    crm: true,
    users: true,
    departments: true,
    access_control: true,
    marketplace: true,
    shop: true,
    inventory: true,
    pos: true,
    logistics: true,
    referrals: true,
    quests: true,
    accounting: true,
    hr: true,
    employee: true,
    manager: true,
    md: true,
  },
  md: {
    mission: true,
    ai: true,
    crm: true,
    users: true,
    departments: true,
    access_control: false,
    marketplace: true,
    shop: true,
    inventory: true,
    pos: true,
    logistics: true,
    referrals: true,
    quests: true,
    accounting: true,
    hr: true,
    employee: true,
    manager: true,
    md: true,
  },
  hr: {
    mission: true,
    ai: false,
    crm: false,
    users: true,
    departments: true,
    access_control: false,
    marketplace: false,
    shop: false,
    inventory: false,
    pos: false,
    logistics: false,
    referrals: false,
    quests: true,
    accounting: false,
    hr: true,
    employee: true,
    manager: true,
    md: false,
  },
  accountant: {
    mission: true,
    ai: false,
    crm: false,
    users: false,
    departments: false,
    access_control: false,
    marketplace: false,
    shop: true,
    inventory: true,
    pos: true,
    logistics: false,
    referrals: false,
    quests: true,
    accounting: true,
    hr: false,
    employee: true,
    manager: false,
    md: false,
  },
  marketer: {
    mission: false,
    ai: true,
    crm: true,
    users: false,
    departments: false,
    access_control: false,
    marketplace: true,
    shop: true,
    inventory: false,
    pos: false,
    logistics: false,
    referrals: true,
    quests: true,
    accounting: false,
    hr: false,
    employee: true,
    manager: false,
    md: false,
  },
  manager: {
    mission: true,
    ai: false,
    crm: true,
    users: false,
    departments: false,
    access_control: false,
    marketplace: false,
    shop: true,
    inventory: true,
    pos: false,
    logistics: true,
    referrals: false,
    quests: true,
    accounting: false,
    hr: false,
    employee: true,
    manager: true,
    md: false,
  },
  employee: {
    mission: false,
    ai: false,
    crm: false,
    users: false,
    departments: false,
    access_control: false,
    marketplace: false,
    shop: false,
    inventory: false,
    pos: false,
    logistics: false,
    referrals: false,
    quests: true,
    accounting: false,
    hr: false,
    employee: true,
    manager: false,
    md: false,
  },
  cashier: {
    mission: false,
    ai: false,
    crm: false,
    users: false,
    departments: false,
    access_control: false,
    marketplace: false,
    shop: true,
    inventory: true,
    pos: true,
    logistics: false,
    referrals: false,
    quests: true,
    accounting: false,
    hr: false,
    employee: true,
    manager: false,
    md: false,
  },
  inventory_officer: {
    mission: false,
    ai: false,
    crm: false,
    users: false,
    departments: false,
    access_control: false,
    marketplace: false,
    shop: true,
    inventory: true,
    pos: false,
    logistics: true,
    referrals: false,
    quests: true,
    accounting: false,
    hr: false,
    employee: true,
    manager: false,
    md: false,
  },
  dispatcher: {
    mission: false,
    ai: false,
    crm: false,
    users: false,
    departments: false,
    access_control: false,
    marketplace: false,
    shop: false,
    inventory: false,
    pos: false,
    logistics: true,
    referrals: false,
    quests: true,
    accounting: false,
    hr: false,
    employee: true,
    manager: false,
    md: false,
  },
};

export function getTenantPermissionMatrix(tenantId: string): PermissionMatrix {
  return DEFAULT_PERMISSION_MATRIX;
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
      const merged: PermissionMatrix = { ...DEFAULT_PERMISSION_MATRIX };

      // Super Admin provisioned module set (stored under 'tenant_provision' or 'admin')
      const tp = res.matrix.tenant_provision || {};
      const ad = res.matrix.admin || {};

      for (const role of ERP_ROLES) {
        merged[role.key] = {
          ...DEFAULT_PERMISSION_MATRIX[role.key],
          ...(res.matrix[role.key] || {}),
        };
      }

      if (res.matrix.tenant_provision) {
        (merged as any).tenant_provision = { ...res.matrix.tenant_provision };
      }

      // 1. Tenant Administrator (admin) ALWAYS gets all modules allowed to the tenant by the Super Admin in Postgres
      for (const mod of ERP_MODULES) {
        const isAllowed = tp[mod.key] !== false && ad[mod.key] !== false;
        merged.admin[mod.key] = isAllowed;
      }
      merged.admin.access_control = true;

      // 2. For other roles, a module is enabled ONLY IF:
      // a) Super Admin allowed the module for the tenant in the database, AND
      // b) Tenant Admin granted it to that role
      for (const role of ERP_ROLES) {
        if (role.key !== "admin") {
          merged[role.key].access_control = false;
          for (const mod of ERP_MODULES) {
            const isTenantAllowed = merged.admin[mod.key] !== false;
            const isRoleGranted = merged[role.key][mod.key] ?? DEFAULT_PERMISSION_MATRIX[role.key]?.[mod.key] ?? false;
            merged[role.key][mod.key] = isTenantAllowed && isRoleGranted;
          }
        }
      }

      // Dispatch in-memory event to update active shell state
      saveTenantPermissionMatrix(tenantId, merged);
      return merged;
    }
  } catch (err) {
    console.warn(`[RBAC] Database lookup for tenant '${tenantId}':`, err);
  }

  return DEFAULT_PERMISSION_MATRIX;
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
  if (moduleKey === "access_control") {
    return role === "admin";
  }
  const matrix = getTenantPermissionMatrix(tenantId);
  const roleKey = role as RoleKey;

  // Tenant Admin gets all modules allowed to the tenant
  if (role === "admin") {
    return matrix.admin?.[moduleKey] !== false;
  }

  if (!matrix[roleKey]) {
    return DEFAULT_PERMISSION_MATRIX.employee[moduleKey] ?? false;
  }
  return Boolean(matrix[roleKey][moduleKey]);
}

/**
 * React hook to reactively track ERP module provisioning for the active tenant.
 * Pulls from the Postgres database (via USER_API) and updates in real-time when Super Admin toggles permissions.
 */
export function useTenantProvisioning() {
  const [matrix, setMatrix] = useState<PermissionMatrix>(DEFAULT_PERMISSION_MATRIX);
  const [tenant, setTenant] = useState<DatabaseTenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCurrent = true;

    async function loadProvisioning() {
      try {
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
              urlParams.get("org") ||
              urlParams.get("company");
          }
        }

        const matched = resolveTenantFromList(list, userEmail, searchParamSlug);
        setTenant(matched);

        const tenantKey = matched?.slug || matched?.id || "neweratransports";

        // Initial sync from local memory matrix
        setMatrix(getTenantPermissionMatrix(tenantKey));

        // Fetch live provisioned matrix from Postgres backend
        const remoteMatrix = await fetchTenantPermissionMatrix(tenantKey);
        if (remoteMatrix && Object.keys(remoteMatrix).length > 0 && isCurrent) {
          setMatrix(remoteMatrix);
        }
      } catch (err) {
        console.warn("[Provisioning] Failed to fetch tenant provisioning:", err);
      } finally {
        if (isCurrent) setIsLoading(false);
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

    window.addEventListener("ofia_rbac_updated", handleUpdate);
    return () => {
      isCurrent = false;
      window.removeEventListener("ofia_rbac_updated", handleUpdate);
    };
  }, []);

  const isModuleProvisioned = useCallback(
    (moduleKey: string): boolean => {
      if (isLoading) return false;
      if (moduleKey === "mission" || moduleKey === "overview") return true;
      if (moduleKey === "access_control") return true;
      const isAdminAllowed = matrix.admin?.[moduleKey] !== false;
      const isTenantProvisionAllowed = (matrix as any).tenant_provision?.[moduleKey] !== false;
      return isAdminAllowed && isTenantProvisionAllowed;
    },
    [matrix, isLoading]
  );

  return {
    matrix,
    tenant,
    isLoading,
    isModuleProvisioned,
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
    controlPanels: ["overview", "ai", "crm", "marketplace", "shop", "logistics", "accounting", "hr", "users", "departments"],
    portals: ["employee", "manager", "md"],
    homeRoute: "/erp/admin",
  },
  md: {
    key: "md",
    label: "Managing Director",
    controlPanels: ["accounting", "hr", "crm", "shop", "logistics"],
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
  dispatcher: {
    key: "dispatcher",
    label: "Logistics Lead",
    controlPanels: ["logistics"],
    portals: ["employee"],
    homeRoute: "/erp/admin/logistics",
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
  isModuleProvisioned: (key: string) => boolean
): boolean {
  // If the module is not provisioned for the workspace, it's not present for any portal or role
  if (!isModuleProvisioned(itemKey)) {
    return false;
  }

  // Admin gets all active workspace modules & all portals
  if (role === "admin") {
    return true;
  }

  // General employee only sees Employee Portal
  if (role === "employee") {
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
    const mdExecutivePanels = ["accounting", "hr", "crm", "shop", "logistics"];
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

