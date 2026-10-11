"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/nexa/AuthContext";
import {
  RoleKey,
  isModuleEnabledForRole,
} from "@/lib/access-control";
import {
  fetchTenantDepartmentAccess,
  getUserDepartmentAccess,
  DepartmentAccessItem,
  DEFAULT_DEPARTMENT_ACCESS,
} from "@/lib/department-access";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: RoleKey[];
  requiredModule?: string;
  fallbackRoute?: string;
}

function getPageKeyFromPath(path: string): string | null {
  if (path.startsWith("/erp/accountant") || path.startsWith("/accountant")) return "accounting";
  if (path.startsWith("/erp/hr") || path.startsWith("/hr")) return "hr";
  if (path.startsWith("/erp/admin/crm") || path.startsWith("/erp/marketer")) return "crm";
  if (path.startsWith("/erp/admin/shop")) return "shop";
  if (path.startsWith("/erp/admin/mobility")) return "mobility";
  if (path.startsWith("/erp/ops/mobility")) return "mobility_ops";
  if (path.startsWith("/erp/admin/dispatch")) return "dispatch";
  if (path.startsWith("/erp/ops/dispatch")) return "dispatch_ops";
  if (path.startsWith("/erp/admin/marketplace")) return "marketplace";
  if (path.startsWith("/erp/admin/ai")) return "ai";
  if (path.startsWith("/erp/admin/users") || path.startsWith("/erp/admin/departments")) return "users";
  if (path.startsWith("/erp/employee") || path.startsWith("/employee")) return "employee";
  if (path.startsWith("/erp/manager") || path.startsWith("/manager")) return "manager";
  if (path.startsWith("/erp/md") || path.startsWith("/md")) return "md";
  if (path === "/erp/admin" || path === "/admin") return "overview";
  return null;
}

export function RoleGuard({
  children,
  allowedRoles,
  requiredModule,
  fallbackRoute,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<RoleKey>("employee");
  const [redirectTarget, setRedirectTarget] = useState<string>("/login");
  const [departmentConfigs, setDepartmentConfigs] = useState<DepartmentAccessItem[]>(DEFAULT_DEPARTMENT_ACCESS);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const slug = localStorage.getItem("nexa_tenant_slug") || "neweratransports";
    fetchTenantDepartmentAccess(slug).then((configs) => {
      if (configs && configs.length > 0) {
        setDepartmentConfigs(configs);
      }
    });

    const handleDeptUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.departments) {
        setDepartmentConfigs(customEvent.detail.departments);
      }
    };
    window.addEventListener("ofia_dept_access_updated", handleDeptUpdate);
    return () => window.removeEventListener("ofia_dept_access_updated", handleDeptUpdate);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Resolve active user and role
    let role: RoleKey = "employee";
    let userDept = (user as any)?.department || "";
    let assignedPages: string[] = [];

    const stored = localStorage.getItem("erp_current_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u && u.role) {
          role = u.role as RoleKey;
        }
        if (u && u.department) {
          userDept = u.department;
        }
        if (u && Array.isArray(u.assignedPages)) {
          assignedPages = u.assignedPages;
        } else if (u && (u.designation?.toLowerCase().includes("sales closer") || role === "sales_closer")) {
          assignedPages = ["employee", "crm"];
        }
      } catch {}
    } else if (localStorage.getItem("nexa_user_role")) {
      role = (localStorage.getItem("nexa_user_role") || "employee") as RoleKey;
    } else if (user?.role) {
      role = (user.role.toLowerCase().replace("tenant_", "").replace("_director", "") || "employee") as RoleKey;
    } else if (pathname.startsWith("/erp/admin")) {
      role = "admin";
    }

    if (!userDept) {
      userDept = localStorage.getItem("nexa_user_department") || localStorage.getItem("erp_user_department") || "";
    }

    if (role === "sales_closer" && assignedPages.length === 0) {
      assignedPages = ["employee", "crm"];
    }

    setUserRole(role);

    // 2. Resolve default home dashboard for this role
    let home = "/erp/employee";
    if (role === "admin") home = "/erp/admin";
    else if (role === "md") home = "/erp/md";
    else if (role === "hr") home = "/erp/hr";
    else if (role === "accountant") home = "/erp/accountant";
    else if (role === "marketer") home = "/erp/marketer";
    else if (role === "sales_closer") home = "/erp/admin/crm";
    else if (role === "manager") home = "/erp/manager";
    else if (role === "employee") home = "/erp/employee";
    else if (role === "cashier") home = "/erp/admin/shop/pos";
    else if (role === "inventory_officer") home = "/erp/admin/shop/inventory";
    else if (role === "dispatcher") home = "/erp/employee";

    if (assignedPages.length > 0 && !assignedPages.includes("employee") && assignedPages[0] === "crm") {
      home = "/erp/admin/crm";
    }

    setRedirectTarget(fallbackRoute || home);

    // Dynamic Department Access Check
    const targetPageKey = requiredModule || getPageKeyFromPath(pathname);
    let isDepartmentAllowed = false;
    if (userDept && targetPageKey) {
      const dAccess = getUserDepartmentAccess({ department: userDept, role }, departmentConfigs);
      if (dAccess.matchedDepartment && dAccess.isPageAllowed(targetPageKey)) {
        if (dAccess.isTabAllowed(targetPageKey, pathname)) {
          isDepartmentAllowed = true;
        }
      }
    }

    // DIRECT USER ASSIGNED PAGES CHECK:
    // If the user has specific assigned pages (e.g. Sales Closer with Employee Portal + CRM):
    if (assignedPages && assignedPages.length > 0 && targetPageKey) {
      if (assignedPages.includes(targetPageKey)) {
        setIsAuthorized(true);
        return;
      } else if (role !== "admin") {
        // User attempted to navigate to an unassigned page
        setIsAuthorized(false);
        const fallback = assignedPages.includes("employee")
          ? "/erp/employee"
          : (assignedPages.includes("crm") ? "/erp/admin/crm" : home);
        if (pathname !== fallback) {
          router.replace(fallback);
        }
        return;
      }
    }

    // STRICT SALES CLOSER ROLE ISOLATION:
    if (role === "sales_closer") {
      const isSalesAllowed = pathname.startsWith("/erp/employee") || pathname.startsWith("/erp/admin/crm") || pathname.startsWith("/erp/marketer");
      if (!isSalesAllowed && !isDepartmentAllowed) {
        setIsAuthorized(false);
        router.replace("/erp/admin/crm");
        return;
      }
      setIsAuthorized(true);
      return;
    }

    // STRICT EMPLOYEE ROLE ISOLATION (bypassed if department permissions grant access):
    if (role === "employee") {
      if (!pathname.startsWith("/erp/employee") && !isDepartmentAllowed) {
        setIsAuthorized(false);
        if (pathname !== "/erp/employee") {
          router.replace("/erp/employee");
        }
        return;
      }
      setIsAuthorized(true);
      return;
    }

    // STRICT LINE MANAGER ROLE ISOLATION (bypassed if department permissions grant access):
    if (role === "manager") {
      if (!pathname.startsWith("/erp/manager") && !pathname.startsWith("/erp/employee") && !isDepartmentAllowed) {
        setIsAuthorized(false);
        router.replace("/erp/manager");
        return;
      }
      setIsAuthorized(true);
      return;
    }

    // 3. Automatic Route Role Rules (if allowedRoles not explicitly provided)
    let effectiveAllowedRoles = allowedRoles;
    if (!effectiveAllowedRoles) {
      if (pathname.startsWith("/erp/admin/users") || pathname.startsWith("/erp/admin/departments")) {
        effectiveAllowedRoles = ["admin", "md", "hr"];
      } else if (pathname === "/erp/admin") {
        effectiveAllowedRoles = ["admin"];
      } else if (pathname.startsWith("/erp/marketer") || pathname.startsWith("/erp/admin/crm")) {
        effectiveAllowedRoles = ["admin", "md", "marketer", "sales_closer"];
      } else if (pathname.startsWith("/erp/md")) {
        effectiveAllowedRoles = ["admin", "md"];
      } else if (pathname.startsWith("/erp/hr")) {
        effectiveAllowedRoles = ["admin", "md", "hr"];
      } else if (pathname.startsWith("/erp/accountant")) {
        effectiveAllowedRoles = ["admin", "md", "accountant"];
      } else if (pathname.startsWith("/erp/manager")) {
        effectiveAllowedRoles = ["admin", "md", "hr", "accountant", "marketer", "sales_closer", "manager"];
      } else if (pathname.startsWith("/erp/employee")) {
        effectiveAllowedRoles = [
          "admin",
          "md",
          "hr",
          "accountant",
          "marketer",
          "sales_closer",
          "manager",
          "employee",
          "cashier",
          "inventory_officer",
          "dispatcher",
        ];
      } else if (pathname.startsWith("/erp/admin/shop/pos") || pathname.startsWith("/erp/admin/pos")) {
        effectiveAllowedRoles = ["admin", "md", "cashier", "manager"];
      } else if (pathname.startsWith("/erp/admin/shop/inventory") || pathname.startsWith("/erp/admin/inventory")) {
        effectiveAllowedRoles = ["admin", "md", "inventory_officer", "manager"];
      } else if (pathname.startsWith("/erp/admin/shop/referrals") || pathname.startsWith("/erp/admin/referrals")) {
        effectiveAllowedRoles = ["admin", "md", "marketer", "manager"];
      } else if (pathname.startsWith("/erp/admin/shop")) {
        effectiveAllowedRoles = ["admin", "md", "marketer", "cashier", "inventory_officer", "manager"];
      } else if (pathname.startsWith("/erp/admin/ai")) {
        effectiveAllowedRoles = ["admin", "md", "marketer"];
      } else if (pathname.startsWith("/erp/hr/quests")) {
        effectiveAllowedRoles = ["admin", "md", "hr", "marketer", "manager", "employee"];
      }
    }

    // 4. Role Permission Check (bypassed if department granted)
    const roleAllowed = isDepartmentAllowed || !effectiveAllowedRoles || effectiveAllowedRoles.includes(role);

    // 5. Workspace Module Provisioning Check
    let moduleAllowed = true;
    let requiredMod = requiredModule;
    if (!requiredMod) {
      if (pathname.startsWith("/erp/accountant")) requiredMod = "accounting";
      else if (pathname.startsWith("/erp/hr")) requiredMod = "hr";
      else if (pathname.startsWith("/erp/marketer") || pathname.startsWith("/erp/admin/crm")) requiredMod = "crm";
      else if (pathname.startsWith("/erp/admin/ai")) requiredMod = "ai";
      else if (pathname.startsWith("/erp/admin/shop")) requiredMod = "shop";
      else if (pathname.startsWith("/erp/admin/marketplace")) requiredMod = "marketplace";
    }

    if (requiredMod && !isDepartmentAllowed) {
      const tenantName = localStorage.getItem("nexa_org_name") || "EduSuite";
      moduleAllowed = isModuleEnabledForRole(tenantName, role, requiredMod);
    }

    const permitted = roleAllowed && moduleAllowed;

    if (!permitted) {
      setIsAuthorized(false);
      // Auto redirect to authorized dashboard
      const target = fallbackRoute || home;
      if (pathname !== target) {
        router.replace(target);
      }
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, user, allowedRoles, requiredModule, fallbackRoute, router, departmentConfigs]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nexa-bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1A56DB] animate-spin" />
          <span className="text-xs font-bold text-[var(--nexa-text-muted)]">
            Verifying Workspace Authorization...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)]">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 border border-rose-500/20">
              Access Restricted
            </span>
            <h2 className="text-xl font-black text-display text-[var(--nexa-text-primary)]">
              Unauthorized Role Access
            </h2>
            <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
              Your active persona (<strong>{userRole.toUpperCase()}</strong>) does not have permission to view this section.
            </p>
          </div>
          <button
            onClick={() => router.replace(redirectTarget)}
            className="w-full py-3 rounded-full bg-[#1A56DB] hover:bg-[#1545B0] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-[#1A56DB]/25 transition-all cursor-pointer"
          >
            <span>Return to Your Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
