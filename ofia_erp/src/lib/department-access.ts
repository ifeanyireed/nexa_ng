"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getParentDept } from "./erp-store";

export interface ErpTabDef {
  id: string;
  label: string;
  path: string;
  badge?: string;
  description?: string;
}

export interface ErpPageDef {
  key: string;
  label: string;
  category: "Operations" | "Enterprise Suite" | "Portals & Team";
  description: string;
  href: string;
  iconName: string;
  badge?: string;
  tabs: ErpTabDef[];
}

export interface DepartmentAccessItem {
  id?: string;
  departmentCode: string;
  departmentName: string;
  accessiblePages: string[];
  accessibleTabs: Record<string, string[]>;
  isEnabled: boolean;
  staffCount?: number;
  head?: string;
  budget?: string;
  costCenter?: string;
}

export const ERP_PAGE_CATALOG: ErpPageDef[] = [
  {
    key: "overview",
    label: "Executive Command / Overview",
    category: "Operations",
    description: "High-level KPI executive cockpit, revenue pacing, and operations status.",
    href: "/erp/admin",
    iconName: "LayoutDashboard",
    tabs: [
      { id: "dashboard", label: "Executive Dashboard", path: "/erp/admin" }
    ],
  },
  {
    key: "ai",
    label: "Ofia AI Swarm",
    category: "Operations",
    description: "15 autonomous marketing, sales, prospecting, and operations agents.",
    href: "/erp/admin/ai",
    iconName: "Bot",
    badge: "15 AI",
    tabs: [
      { id: "command", label: "Command Center", path: "/erp/admin/ai" },
      { id: "campaigns", label: "Outreach Campaigns", path: "/erp/admin/ai/campaigns" },
      { id: "studio", label: "AI Studio", path: "/erp/admin/ai/studio" },
      { id: "strategy", label: "GTM Strategy", path: "/erp/admin/ai/strategy" },
      { id: "knowledge", label: "Knowledge Base", path: "/erp/admin/ai/knowledge" },
      { id: "analytics", label: "AI Analytics", path: "/erp/admin/ai/analytics" },
      { id: "team", label: "Agent Fleet (15 AI)", path: "/erp/admin/ai/team" },
      { id: "telegram", label: "Telegram Bot Gateway", path: "/erp/admin/ai/telegram" },
      { id: "approvals", label: "Action Approvals", path: "/erp/admin/ai/approvals" },
      { id: "integrations", label: "API Integrations", path: "/erp/admin/ai/integrations" },
      { id: "pricing", label: "BYOK & AI Key Vault", path: "/erp/admin/ai/pricing" },
      { id: "settings", label: "Agent Config & Safety", path: "/erp/admin/ai/settings" },
    ],
  },
  {
    key: "marketplace",
    label: "Marketplace Manager",
    category: "Operations",
    description: "Multi-merchant public directory, live catalog, and escrow commerce bookings.",
    href: "/erp/admin/marketplace",
    iconName: "ShoppingBag",
    badge: "PRO",
    tabs: [
      { id: "overview", label: "Storefront Overview", path: "/erp/admin/marketplace" },
      { id: "shop", label: "Merchant Products", path: "/erp/admin/marketplace/shop" },
      { id: "bookings", label: "Service Bookings", path: "/erp/admin/marketplace/bookings" },
      { id: "leads", label: "Incoming Leads", path: "/erp/admin/marketplace/leads" },
      { id: "deals", label: "Promotions & Deals", path: "/erp/admin/marketplace/deals" },
      { id: "articles", label: "Articles & Guides", path: "/erp/admin/marketplace/articles" },
      { id: "wallet", label: "Earnings Wallet", path: "/erp/admin/marketplace/wallet" },
      { id: "settings", label: "Store Settings", path: "/erp/admin/marketplace/settings" },
    ],
  },
  {
    key: "shop",
    label: "Ofia Shop Manager",
    category: "Operations",
    description: "POS cash registers, warehouse inventory (IMS), and viral customer rewards.",
    href: "/erp/admin/shop",
    iconName: "Store",
    badge: "Retail",
    tabs: [
      { id: "overview", label: "Shop Overview", path: "/erp/admin/shop" },
      { id: "catalog", label: "SKU Catalog & Items", path: "/erp/admin/shop/catalog" },
      { id: "services", label: "Services & Bookings", path: "/erp/admin/shop/services" },
      { id: "orders", label: "Orders & Requests", path: "/erp/admin/shop/orders" },
      { id: "inventory", label: "Inventory (IMS)", path: "/erp/admin/shop/inventory", badge: "IMS" },
      { id: "pos", label: "Point of Sale (POS)", path: "/erp/admin/shop/pos", badge: "POS" },
      { id: "store", label: "Store Studio", path: "/erp/admin/shop/store" },
      { id: "referrals", label: "Viral Referrals", path: "/erp/admin/shop/referrals", badge: "Growth" },
    ],
  },
  {
    key: "mobility",
    label: "Ofia Mobility Manager",
    category: "Operations",
    description: "Fleet command, vehicle ROI, driver rosters, regional route pricing.",
    href: "/erp/admin/mobility",
    iconName: "Car",
    badge: "Mobility",
    tabs: [
      { id: "command", label: "Fleet Command", path: "/erp/admin/mobility" },
      { id: "vehicles", label: "Vehicles & ROI", path: "/erp/admin/mobility/vehicles" },
      { id: "drivers", label: "Driver Rosters", path: "/erp/admin/mobility/drivers" },
      { id: "maintenance", label: "Maintenance", path: "/erp/admin/mobility/maintenance" },
      { id: "routes", label: "Routes & Zones", path: "/erp/admin/mobility/routes" },
      { id: "pricing", label: "Pricing Engine", path: "/erp/admin/mobility/finance" },
      { id: "shuttle", label: "Shuttle Service", path: "/erp/admin/mobility/services/shuttle" },
      { id: "interstate", label: "Interstate Transit", path: "/erp/admin/mobility/services/interstate" },
      { id: "on-demand", label: "On-Demand Hailing", path: "/erp/admin/mobility/services/on-demand" },
      { id: "rental", label: "Bus Rental Charters", path: "/erp/admin/mobility/services/rental" },
      { id: "school", label: "School Bus Manifest", path: "/erp/admin/mobility/services/school" },
      { id: "staff", label: "Staff Corporate Commute", path: "/erp/admin/mobility/services/staff" },
    ],
  },
  {
    key: "mobility_ops",
    label: "Mobility Operations",
    category: "Operations",
    description: "Real-time dispatch console, active vehicle telemetry, and live manifests.",
    href: "/erp/ops/mobility",
    iconName: "Radio",
    badge: "Live",
    tabs: [
      { id: "console", label: "Live Dispatch Console", path: "/erp/ops/mobility", badge: "Live" },
      { id: "drivers", label: "Driver Rosters", path: "/erp/admin/mobility/drivers" },
      { id: "vehicles", label: "Active Vehicles", path: "/erp/admin/mobility/vehicles" },
      { id: "shuttle", label: "Shuttle Service", path: "/erp/admin/mobility/services/shuttle" },
      { id: "interstate", label: "Interstate Transit", path: "/erp/admin/mobility/services/interstate" },
      { id: "on-demand", label: "On-Demand Hailing", path: "/erp/admin/mobility/services/on-demand" },
      { id: "rental", label: "Bus Rental Charters", path: "/erp/admin/mobility/services/rental" },
      { id: "school", label: "School Bus Manifest", path: "/erp/admin/mobility/services/school" },
      { id: "staff", label: "Staff Corporate Commute", path: "/erp/admin/mobility/services/staff" },
    ],
  },
  {
    key: "dispatch",
    label: "Ofia Dispatch Manager",
    category: "Operations",
    description: "Logistics command center, waybills, and nearest-courier assignment.",
    href: "/erp/admin/dispatch",
    iconName: "Bike",
    badge: "Admin",
    tabs: [
      { id: "command", label: "Dispatch Manager", path: "/erp/admin/dispatch" },
      { id: "operator", label: "Operator Console", path: "/erp/ops/dispatch" },
    ],
  },
  {
    key: "dispatch_ops",
    label: "Dispatch Operator Console",
    category: "Operations",
    description: "Live waybill dispatch desk, rider status tracking, and fulfillment.",
    href: "/erp/ops/dispatch",
    iconName: "Bike",
    badge: "Live",
    tabs: [
      { id: "console", label: "Live Dispatch Operator", path: "/erp/ops/dispatch", badge: "Live" },
    ],
  },
  {
    key: "crm",
    label: "CRM & Marketing",
    category: "Enterprise Suite",
    description: "B2B sales pipelines, contact lists, scheduled mass email blasts, and deals.",
    href: "/erp/admin/crm",
    iconName: "BarChart3",
    badge: "CRM",
    tabs: [
      { id: "command", label: "Command Center", path: "/erp/admin/crm" },
      { id: "lists", label: "Audience Lists", path: "/erp/admin/crm/lists" },
      { id: "blasts", label: "Email Blasts", path: "/erp/admin/crm/marketing", badge: "Email" },
      { id: "leads", label: "Leads Directory", path: "/erp/admin/crm/leads" },
      { id: "activities", label: "Sales Activities", path: "/erp/admin/crm/activities" },
      { id: "pipeline", label: "Deals Pipeline", path: "/erp/admin/crm/pipeline" },
      { id: "contacts", label: "Contacts & Accounts", path: "/erp/admin/crm/contacts" },
    ],
  },
  {
    key: "accounting",
    label: "Accounting & Ledgers",
    category: "Enterprise Suite",
    description: "General ledger, charts of accounts, trial balance, and FIRS 7.5% VAT remittances.",
    href: "/erp/accountant",
    iconName: "Layers",
    badge: "GL",
    tabs: [
      { id: "overview", label: "Finance Overview", path: "/erp/accountant" },
      { id: "coa", label: "Chart of Accounts", path: "/erp/accountant/coa" },
      { id: "invoices", label: "Invoices & Billing", path: "/erp/accountant/invoices" },
      { id: "expenses", label: "Expenses", path: "/erp/accountant/expenses" },
      { id: "trial-balance", label: "Trial Balance", path: "/erp/accountant/trial-balance" },
      { id: "income-statement", label: "Income Statement", path: "/erp/accountant/income-statement" },
      { id: "financial-position", label: "Financial Position", path: "/erp/accountant/financial-position" },
      { id: "banking", label: "Banking Feeds", path: "/erp/accountant/banking" },
      { id: "reconcile", label: "Reconciliation", path: "/erp/accountant/reconcile" },
      { id: "payroll", label: "Salaries / Payroll", path: "/erp/accountant/employee-salaries" },
      { id: "tax", label: "FIRS Tax / Remittances", path: "/erp/accountant/statutory-remittances" },
      { id: "audit-trail", label: "Audit Trail", path: "/erp/accountant/audit-trail" },
    ],
  },
  {
    key: "hr",
    label: "HR & Appraisals",
    category: "Enterprise Suite",
    description: "Performance review cycles, OKR objectives banks, calibrations, and quests.",
    href: "/erp/hr",
    iconName: "Users",
    tabs: [
      { id: "overview", label: "Appraisal Overview", path: "/erp/hr" },
      { id: "users", label: "Staff Directory", path: "/erp/hr/users" },
      { id: "objectives", label: "Objective Banks", path: "/erp/hr/objectives" },
      { id: "cycle", label: "Appraisal Cycles", path: "/erp/hr/cycle" },
      { id: "reports", label: "Reports & Ranking", path: "/erp/hr/reports" },
      { id: "quests", label: "Team Quests", path: "/erp/hr/quests" },
    ],
  },
  {
    key: "users",
    label: "User & Staff Governance",
    category: "Enterprise Suite",
    description: "Corporate staff directory, departmental hierarchies, and mass staff notifications.",
    href: "/erp/admin/users",
    iconName: "UserCheck",
    badge: "Staff",
    tabs: [
      { id: "users", label: "Staff Directory", path: "/erp/admin/users" },
      { id: "departments", label: "Department Hierarchy", path: "/erp/admin/departments" },
      { id: "mass-messaging", label: "Mass Messaging", path: "/erp/admin/users/mass-messaging" },
    ],
  },
  {
    key: "employee",
    label: "Employee Workspace Portal",
    category: "Portals & Team",
    description: "Staff self-service, personal performance reviews, quests, and career profile.",
    href: "/erp/employee",
    iconName: "UserCheck",
    tabs: [
      { id: "overview", label: "My Overview", path: "/erp/employee" },
      { id: "reviews", label: "Performance Reviews", path: "/erp/employee/reviews" },
      { id: "quests", label: "Team Quests", path: "/erp/employee/quests" },
      { id: "profile", label: "My Profile & Growth", path: "/erp/employee/profile" },
    ],
  },
  {
    key: "manager",
    label: "Line Manager Portal",
    category: "Portals & Team",
    description: "Supervisor subordinate review calibrations, scoring validations, and notes.",
    href: "/erp/manager",
    iconName: "Sliders",
    tabs: [
      { id: "overview", label: "Manager Overview", path: "/erp/manager" },
      { id: "reviews", label: "Team Reviews", path: "/erp/manager/reviews" },
      { id: "employee", label: "Self-Service View", path: "/erp/employee" },
    ],
  },
  {
    key: "md",
    label: "Executive Directorate (MD)",
    category: "Portals & Team",
    description: "Enterprise rankings, departmental deep dive, and executive audit.",
    href: "/erp/md",
    iconName: "TrendingUp",
    tabs: [
      { id: "cockpit", label: "Executive Cockpit", path: "/erp/md" },
      { id: "department", label: "Department Details", path: "/erp/md/department/detail" },
      { id: "employee", label: "Self-Service View", path: "/erp/employee" },
    ],
  },
];

export const DEFAULT_DEPARTMENT_ACCESS: DepartmentAccessItem[] = [
  {
    departmentCode: "DEPT-FIN",
    departmentName: "Finance & Accounts",
    accessiblePages: ["accounting", "shop", "employee"],
    accessibleTabs: {
      accounting: ["overview", "coa", "invoices", "expenses", "trial-balance", "income-statement", "financial-position", "banking", "reconcile", "payroll", "tax", "audit-trail"],
      shop: ["overview", "orders", "inventory", "pos"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-FLT",
    departmentName: "Fleet Operations & Maintenance",
    accessiblePages: ["mobility", "mobility_ops", "dispatch", "dispatch_ops", "employee"],
    accessibleTabs: {
      mobility: ["command", "vehicles", "drivers", "maintenance", "routes", "pricing", "shuttle", "interstate", "on-demand", "rental", "school", "staff"],
      mobility_ops: ["console", "drivers", "vehicles", "shuttle", "interstate", "on-demand", "rental", "school", "staff"],
      dispatch: ["command", "operator"],
      dispatch_ops: ["console"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-IT",
    departmentName: "Systems & IT / ERP",
    accessiblePages: [
      "overview", "ai", "marketplace", "shop", "mobility", "mobility_ops",
      "dispatch", "dispatch_ops", "crm", "accounting", "hr", "users",
      "employee", "manager", "md"
    ],
    accessibleTabs: {},
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-HR",
    departmentName: "Human Resources & Talent",
    accessiblePages: ["hr", "users", "manager", "employee"],
    accessibleTabs: {
      hr: ["overview", "users", "objectives", "cycle", "reports", "quests"],
      users: ["users", "departments", "mass-messaging"],
      manager: ["overview", "reviews"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-MKT",
    departmentName: "Commercial & Growth",
    accessiblePages: ["crm", "ai", "marketplace", "shop", "employee"],
    accessibleTabs: {
      crm: ["command", "lists", "blasts", "leads", "activities", "pipeline", "contacts"],
      ai: ["command", "campaigns", "studio", "strategy", "knowledge", "analytics", "team", "telegram"],
      marketplace: ["overview", "shop", "bookings", "leads", "deals", "articles"],
      shop: ["catalog", "referrals"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-EXE",
    departmentName: "Executive Directorate",
    accessiblePages: ["overview", "md", "accounting", "hr", "mobility", "crm", "shop", "manager", "employee"],
    accessibleTabs: {
      overview: ["dashboard"],
      md: ["cockpit", "department"],
      accounting: ["overview", "trial-balance", "income-statement", "financial-position"],
      hr: ["overview", "reports"],
      mobility: ["command", "pricing"],
      crm: ["command", "pipeline"],
      shop: ["overview"],
      manager: ["overview", "reviews"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
];

/**
 * Normalizes and checks if a user's department matches a configured department entry.
 */
export function matchesDepartment(userDept: string | undefined | null, targetDept: string | undefined | null): boolean {
  if (!userDept || !targetDept) return false;
  const u = userDept.toLowerCase().trim();
  const t = targetDept.toLowerCase().trim();

  if (u === t) return true;
  if (u.includes(t) || t.includes(u)) return true;

  // Check parent department equivalence
  const parentU = getParentDept(userDept).toLowerCase().trim();
  const parentT = getParentDept(targetDept).toLowerCase().trim();
  if (parentU === parentT && parentU !== "other") return true;

  // Domain-specific synonym mappings
  if (t.includes("finance") && (u.includes("finance") || u.includes("account"))) return true;
  if (t.includes("fleet") && (u.includes("fleet") || u.includes("transport") || u.includes("mobility") || u.includes("noc"))) return true;
  if (t.includes("it") && (u.includes("it") || u.includes("system") || u.includes("erp") || u.includes("tech"))) return true;
  if (t.includes("hr") && (u.includes("hr") || u.includes("human") || u.includes("talent") || u.includes("people"))) return true;
  if (t.includes("commercial") && (u.includes("market") || u.includes("commercial") || u.includes("growth") || u.includes("sales"))) return true;
  if (t.includes("executive") && (u.includes("exec") || u.includes("md") || u.includes("director") || u.includes("admin/hr"))) return true;

  return false;
}

/**
 * Fetch department access records for a tenant from database.
 */
export async function fetchTenantDepartmentAccess(tenantId: string): Promise<DepartmentAccessItem[]> {
  try {
    const url = `/api/organizations/${encodeURIComponent(tenantId)}/departments/access`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn(`[DeptAccess] Failed to fetch remote department access for '${tenantId}':`, err);
  }

  // Fallback to in-memory/seeded default
  return DEFAULT_DEPARTMENT_ACCESS;
}

/**
 * Reactively evaluate allowed pages and tabs for a specific user based on their assigned department.
 */
export function getUserDepartmentAccess(
  user: { department?: string; role?: string; isSuperAdmin?: boolean } | null | undefined,
  departmentConfigs: DepartmentAccessItem[]
): {
  accessiblePages: Set<string>;
  accessibleTabs: Record<string, Set<string>>;
  matchedDepartment: DepartmentAccessItem | null;
  isPageAllowed: (pageKey: string) => boolean;
  isTabAllowed: (pageKey: string, tabIdOrPath: string) => boolean;
} {
  // 1. Super Admins and Tenant Administrators always have unrestricted access
  const isMasterAdmin =
    user?.role === "admin" ||
    user?.isSuperAdmin === true ||
    user?.role === "SUPER_ADMIN";

  if (isMasterAdmin) {
    const allPages = new Set(ERP_PAGE_CATALOG.map((p) => p.key));
    allPages.add("mission");
    allPages.add("overview");
    allPages.add("departments");
    return {
      accessiblePages: allPages,
      accessibleTabs: {},
      matchedDepartment: null,
      isPageAllowed: () => true,
      isTabAllowed: () => true,
    };
  }

  const userDept = user?.department || "";
  
  // 2. Find matching department configuration
  let matched = departmentConfigs.find(
    (cfg) => cfg.isEnabled && matchesDepartment(userDept, cfg.departmentName)
  );

  if (!matched && userDept) {
    matched = departmentConfigs.find(
      (cfg) => cfg.isEnabled && matchesDepartment(userDept, cfg.departmentCode)
    );
  }

  // If no configured match was found, look in default department presets
  if (!matched) {
    matched = DEFAULT_DEPARTMENT_ACCESS.find(
      (cfg) => matchesDepartment(userDept, cfg.departmentName)
    );
  }

  // Fallback if user has no department or unassigned
  if (!matched) {
    const fallbackPages = new Set(["employee"]);
    return {
      accessiblePages: fallbackPages,
      accessibleTabs: { employee: new Set(["overview", "reviews", "quests", "profile"]) },
      matchedDepartment: null,
      isPageAllowed: (pageKey: string) => pageKey === "employee",
      isTabAllowed: (pageKey: string, tabId: string) => pageKey === "employee",
    };
  }

  const accessiblePages = new Set<string>(matched.accessiblePages || []);
  // Always include employee portal for self-service
  accessiblePages.add("employee");

  const accessibleTabs: Record<string, Set<string>> = {};
  if (matched.accessibleTabs) {
    for (const [modKey, tabList] of Object.entries(matched.accessibleTabs)) {
      if (Array.isArray(tabList)) {
        accessibleTabs[modKey] = new Set(tabList);
      }
    }
  }

  return {
    accessiblePages,
    accessibleTabs,
    matchedDepartment: matched,
    isPageAllowed: (pageKey: string) => {
      if (pageKey === "employee") return true;
      return accessiblePages.has(pageKey);
    },
    isTabAllowed: (pageKey: string, tabIdOrPath: string) => {
      // If the entire page isn't allowed, no tab is allowed
      if (!accessiblePages.has(pageKey)) return false;

      const pageTabs = accessibleTabs[pageKey];
      // If no specific tab restrictions were defined for this page, all tabs are allowed
      if (!pageTabs || pageTabs.size === 0) return true;

      // Check by direct ID match
      if (pageTabs.has(tabIdOrPath)) return true;

      // Check by matching path segment
      for (const allowedId of Array.from(pageTabs)) {
        if (tabIdOrPath.includes(allowedId)) return true;
      }

      return false;
    },
  };
}

/**
 * React Hook for consuming dynamic Department Access in ERP components and shells.
 */
export function useUserDepartmentAccess(user: { department?: string; role?: string } | null | undefined, tenantSlug?: string) {
  const [departmentConfigs, setDepartmentConfigs] = useState<DepartmentAccessItem[]>(DEFAULT_DEPARTMENT_ACCESS);
  const [isLoading, setIsLoading] = useState(true);

  const activeTenant = tenantSlug || "neweratransports";

  const loadAccess = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTenantDepartmentAccess(activeTenant);
      if (data && data.length > 0) {
        setDepartmentConfigs(data);
      }
    } catch (err) {
      console.warn("[DeptAccessHook] Error loading access:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTenant]);

  useEffect(() => {
    loadAccess();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.departments) {
        setDepartmentConfigs(customEvent.detail.departments);
      }
    };

    window.addEventListener("ofia_dept_access_updated", handleUpdate);
    return () => {
      window.removeEventListener("ofia_dept_access_updated", handleUpdate);
    };
  }, [loadAccess]);

  const access = useMemo(() => {
    return getUserDepartmentAccess(user, departmentConfigs);
  }, [user, departmentConfigs]);

  return {
    ...access,
    isLoading,
    departmentConfigs,
    reload: loadAccess,
  };
}
