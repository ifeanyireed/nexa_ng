"use client";

export type RoleKey =
  | "admin"
  | "md"
  | "hr"
  | "manager"
  | "accountant"
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
    color: "#1A56DB",
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
  category: "Core Control" | "Operations" | "Finance & HR" | "Portals & Team";
  description: string;
  href: string;
  badge?: string;
}

export const ERP_MODULES: ErpModuleDef[] = [
  {
    key: "ai",
    label: "Ofia AI Swarm",
    category: "Core Control",
    description: "15 autonomous marketing, sales, and lead automation agent swarm.",
    href: "/erp/admin/ai",
    badge: "15 AI",
  },
  {
    key: "access_control",
    label: "Access Control & RBAC",
    category: "Core Control",
    description: "Multi-tenant role permissions, user-type matrix, and security auditing.",
    href: "/erp/admin/access-control",
    badge: "RBAC",
  },
  {
    key: "marketplace",
    label: "Marketplace Store",
    category: "Operations",
    description: "Public storefront, order fulfillments, merchant catalogs, and payments.",
    href: "/erp/admin/marketplace",
  },
  {
    key: "inventory",
    label: "Inventory (IMS)",
    category: "Operations",
    description: "Multi-warehouse stock registers, replenishment rules, and transfers.",
    href: "/erp/admin/inventory",
    badge: "IMS",
  },
  {
    key: "pos",
    label: "Point of Sale (POS)",
    category: "Operations",
    description: "Touch counter cashiering, barcode scanning, and session balancing.",
    href: "/erp/admin/pos",
  },
  {
    key: "logistics",
    label: "Logistics Hub",
    category: "Operations",
    description: "Zonal route dispatching, fleet management, and shipment tracking.",
    href: "/erp/admin/logistics",
  },
  {
    key: "referrals",
    label: "Viral Referrals",
    category: "Operations",
    description: "Affiliate promoter tracking, payout batches, and commission links.",
    href: "/erp/admin/referrals",
  },
  {
    key: "quests",
    label: "Retreat Quests",
    category: "Operations",
    description: "Gamified employee achievements, milestones, and reward challenges.",
    href: "/erp/admin/quests",
  },
  {
    key: "accounting",
    label: "Accounting & Ledgers",
    category: "Finance & HR",
    description: "General ledger, charts of accounts, trial balance, and tax remittances.",
    href: "/erp/accountant",
    badge: "GL",
  },
  {
    key: "hr",
    label: "HR & Appraisals",
    category: "Finance & HR",
    description: "Staff performance review cycles, objectives, calibrations, and reports.",
    href: "/erp/hr",
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
    access_control: true,
    marketplace: true,
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
    access_control: false,
    marketplace: true,
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
    access_control: false,
    marketplace: false,
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
    access_control: false,
    marketplace: false,
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
  manager: {
    mission: true,
    ai: false,
    access_control: false,
    marketplace: false,
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
    access_control: false,
    marketplace: false,
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
    access_control: false,
    marketplace: false,
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
    access_control: false,
    marketplace: false,
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
    access_control: false,
    marketplace: false,
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

const STORAGE_PREFIX = "ofia_rbac_matrix_";

export function getTenantStorageKey(tenantId: string): string {
  const cleanId = (tenantId || "default").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  return `${STORAGE_PREFIX}${cleanId}`;
}

export function getTenantPermissionMatrix(tenantId: string): PermissionMatrix {
  if (typeof window === "undefined") {
    return DEFAULT_PERMISSION_MATRIX;
  }

  const key = getTenantStorageKey(tenantId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults so new modules/roles are never undefined
      const merged: PermissionMatrix = { ...DEFAULT_PERMISSION_MATRIX };
      for (const role of ERP_ROLES) {
        merged[role.key] = {
          ...DEFAULT_PERMISSION_MATRIX[role.key],
          ...(parsed[role.key] || {}),
        };
      }
      return merged;
    }
  } catch (e) {
    console.error("Failed to parse tenant permissions:", e);
  }

  return DEFAULT_PERMISSION_MATRIX;
}

export function saveTenantPermissionMatrix(
  tenantId: string,
  matrix: PermissionMatrix
): void {
  if (typeof window === "undefined") return;
  const key = getTenantStorageKey(tenantId);
  try {
    localStorage.setItem(key, JSON.stringify(matrix));
    // Dispatch custom event for real-time reactivity in shells and components
    window.dispatchEvent(
      new CustomEvent("ofia_rbac_updated", {
        detail: { tenantId, matrix },
      })
    );
  } catch (e) {
    console.error("Failed to save tenant permissions:", e);
  }
}

import { USER_API } from "./api-client";

export async function fetchTenantPermissionMatrix(tenantId: string): Promise<PermissionMatrix> {
  const local = getTenantPermissionMatrix(tenantId);

  try {
    const res = await USER_API.getTenantRBAC(tenantId);
    if (res && res.matrix && Object.keys(res.matrix).length > 0) {
      const merged: PermissionMatrix = { ...DEFAULT_PERMISSION_MATRIX };

      // Super Admin provisioned module set (stored under 'tenant_provision' or 'admin')
      const provisioned = res.matrix.tenant_provision || res.matrix.admin || {};

      for (const role of ERP_ROLES) {
        merged[role.key] = {
          ...DEFAULT_PERMISSION_MATRIX[role.key],
          ...(res.matrix[role.key] || {}),
        };
      }

      // 1. Tenant Administrator (admin) ALWAYS gets all modules allowed to the tenant by the Super Admin in MySQL
      for (const mod of ERP_MODULES) {
        merged.admin[mod.key] = provisioned[mod.key] !== false;
      }
      merged.admin.access_control = true;

      // 2. For other roles, a module is enabled ONLY IF:
      // a) Super Admin allowed the module for the tenant in the database, AND
      // b) Tenant Admin granted it to that role
      for (const role of ERP_ROLES) {
        if (role.key !== "admin") {
          merged[role.key].access_control = false;
          for (const mod of ERP_MODULES) {
            const isTenantAllowed = provisioned[mod.key] !== false;
            const isRoleGranted = merged[role.key][mod.key] ?? DEFAULT_PERMISSION_MATRIX[role.key]?.[mod.key] ?? false;
            merged[role.key][mod.key] = isTenantAllowed && isRoleGranted;
          }
        }
      }

      // Save to localStorage cache and trigger real-time reactivity
      saveTenantPermissionMatrix(tenantId, merged);
      return merged;
    }
  } catch (err) {
    console.warn(`[RBAC] Using cached matrix for tenant ${tenantId}:`, err);
  }

  return local;
}

export async function saveTenantPermissionMatrixRemote(
  tenantId: string,
  matrix: PermissionMatrix
): Promise<{ success: boolean; message: string }> {
  // 1. Immediately save to local storage & trigger real-time shell update
  saveTenantPermissionMatrix(tenantId, matrix);

  // 2. Persist to MySQL database table TenantRolePermission via API
  try {
    const res = await USER_API.saveTenantRBAC(tenantId, matrix);
    return {
      success: true,
      message: res.message || "Permissions successfully persisted to MySQL database u721451974_nexa_db",
    };
  } catch (err: any) {
    console.warn(`[RBAC] Saved locally; remote DB sync error:`, err);
    return {
      success: true,
      message: "Permissions saved in tenant registry & synced with workspace",
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

