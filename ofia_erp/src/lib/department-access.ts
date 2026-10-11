"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getParentDept } from "./erp-store";

export {
  type ErpTabDef,
  type ErpPageDef,
  type DepartmentAccessItem,
  ERP_PAGE_CATALOG,
  DEFAULT_DEPARTMENT_ACCESS,
} from "./department-access-constants";

import {
  DepartmentAccessItem,
  ERP_PAGE_CATALOG,
  DEFAULT_DEPARTMENT_ACCESS,
} from "./department-access-constants";

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
