"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/nexa/AuthContext";
import {
  RoleKey,
  isModuleEnabledForRole,
  fetchTenantPermissionMatrix,
  getTenantPermissionMatrix,
  PermissionMatrix,
  isRouteOrModuleAssignedToUser,
} from "@/lib/access-control";
import { extractSubdomainOrParam } from "@/lib/tenant-context";
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
  if (path.startsWith("/erp/ops/crm") || path.startsWith("/erp/ops/calls") || path.startsWith("/ops/calls") || path.startsWith("/ops/crm")) return "sales_closer";
  if (path.startsWith("/erp/admin/crm") || path.startsWith("/erp/marketer")) return "crm";
  if (path.startsWith("/erp/admin/shop")) return "shop";
  if (path.startsWith("/erp/admin/mobility")) return "mobility";
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
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(() => {
    if (typeof window === "undefined") return null;
    const slug = extractSubdomainOrParam() || localStorage.getItem("nexa_tenant_slug") || "";
    return slug ? getTenantPermissionMatrix(slug) : null;
  });

  const [sessionVersion, setSessionVersion] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const slug = extractSubdomainOrParam() || localStorage.getItem("nexa_tenant_slug") || "";
    if (slug) {
      const cached = getTenantPermissionMatrix(slug);
      if (cached && Object.keys(cached.admin || {}).length > 2) {
        setMatrix(cached);
      } else {
        fetchTenantPermissionMatrix(slug).then((m) => {
          if (m && Object.keys(m.admin || {}).length > 2) {
            setMatrix(m);
          }
        });
      }

      fetchTenantDepartmentAccess(slug).then((configs) => {
        if (configs && configs.length > 0) {
          setDepartmentConfigs(configs);
        }
      });
    }

    const handleDeptUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.departments) {
        setDepartmentConfigs(customEvent.detail.departments);
      }
    };
    const handleRbacUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.matrix) {
        setMatrix(customEvent.detail.matrix);
      }
    };
    const handleUserUpdate = () => {
      setSessionVersion((v) => v + 1);
    };

    window.addEventListener("ofia_dept_access_updated", handleDeptUpdate);
    window.addEventListener("ofia_rbac_updated", handleRbacUpdate);
    window.addEventListener("erp_current_user_updated", handleUserUpdate);
    return () => {
      window.removeEventListener("ofia_dept_access_updated", handleDeptUpdate);
      window.removeEventListener("ofia_rbac_updated", handleRbacUpdate);
      window.removeEventListener("erp_current_user_updated", handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Authentication Guard: verify active session exists
    const stored = localStorage.getItem("erp_current_user");
    const authToken =
      localStorage.getItem("nexa_auth_token") ||
      localStorage.getItem("nexa_token") ||
      (typeof document !== "undefined"
        ? document.cookie.match(/(?:^|;\s*)nexa_auth_token=([^;]*)/)?.[1]
        : null);

    // If completely unauthenticated, immediately reject access and redirect to login
    if (!stored && !authToken && !user) {
      setIsAuthorized(false);
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
      return;
    }

    // 2. Resolve active user and role
    let role: RoleKey = "employee";
    let userDept = (user as any)?.department || "";
    let assignedPages: string[] = [];

    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u && u.role) {
          role = u.role as RoleKey;
        }
        if (u && u.department) {
          userDept = u.department;
        }
        const rawAssigned = u?.assignedPages ?? (u as any)?.AssignedPages;
        if (Array.isArray(rawAssigned)) {
          assignedPages = rawAssigned;
        } else if (typeof rawAssigned === "string" && rawAssigned.trim()) {
          try {
            const parsed = JSON.parse(rawAssigned);
            if (Array.isArray(parsed)) assignedPages = parsed;
          } catch {
            assignedPages = rawAssigned.split(",").map((s: string) => s.trim());
          }
        }
        if (assignedPages.length === 0 && (u && (u.designation?.toLowerCase().includes("sales closer") || role === "sales_closer"))) {
          assignedPages = ["employee", "sales_closer"];
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
      assignedPages = ["employee", "sales_closer"];
    }

    setUserRole(role);

    // 2. Resolve default home dashboard for this role
    let home = "/erp/employee";
    if (role === "admin") home = "/erp/admin";
    else if (role === "md") home = "/erp/md";
    else if (role === "hr") home = "/erp/hr";
    else if (role === "accountant") home = "/erp/accountant";
    else if (role === "marketer") home = "/erp/marketer";
    else if (role === "sales_closer") home = "/erp/ops/crm";
    else if (role === "manager") home = "/erp/manager";
    else if (role === "employee") home = "/erp/employee";
    else if (role === "cashier") home = "/erp/admin/shop/pos";
    else if (role === "inventory_officer") home = "/erp/admin/shop/inventory";
    else if (role === "dispatcher") home = "/erp/admin/dispatch";

    if (assignedPages.length > 0 && !assignedPages.includes("employee")) {
      if (assignedPages.includes("sales_closer")) {
        home = "/erp/ops/crm";
      } else if (assignedPages.includes("crm")) {
        home = "/erp/admin/crm";
      } else if (assignedPages.includes("dispatcher") || assignedPages.includes("dispatch") || assignedPages.includes("dispatch_ops")) {
        home = "/erp/admin/dispatch";
      }
    }

    setRedirectTarget(fallbackRoute || home);

    // Dynamic Department Access Check
    const targetPageKey = requiredModule || getPageKeyFromPath(pathname);
    let isDepartmentAllowed = false;
    if (userDept && targetPageKey) {
      const dAccess = getUserDepartmentAccess({ department: userDept, role }, departmentConfigs);
      const isPageGranted =
        dAccess.isPageAllowed(targetPageKey) ||
        (targetPageKey === "dispatch" && dAccess.isPageAllowed("dispatch_ops")) ||
        (targetPageKey === "dispatch_ops" && dAccess.isPageAllowed("dispatch"));

      if (dAccess.matchedDepartment && isPageGranted) {
        if (dAccess.isTabAllowed(targetPageKey, pathname)) {
          isDepartmentAllowed = true;
        }
      }
    }

    // DIRECT USER ASSIGNED PAGES CHECK:
    // If a page is assigned to the user, they automatically have the right to navigate!
    if (assignedPages && assignedPages.length > 0) {
      if (isRouteOrModuleAssignedToUser(assignedPages, pathname, requiredModule)) {
        // Enforce CRM module provisioning if accessing sales_closer or CRM
        const isCrmRoute =
          pathname.startsWith("/erp/admin/crm") ||
          pathname.startsWith("/erp/ops/crm") ||
          pathname.startsWith("/erp/ops/calls") ||
          pathname.startsWith("/ops/calls") ||
          pathname.startsWith("/ops/crm") ||
          requiredModule === "crm" ||
          requiredModule === "sales_closer";

        if (isCrmRoute) {
          const tenantSlug = extractSubdomainOrParam() || localStorage.getItem("nexa_tenant_slug") || "";
          const isCrmProvisioned = isModuleEnabledForRole(tenantSlug, "admin", "crm");
          if (!isCrmProvisioned) {
            setIsAuthorized(false);
            const fallback = assignedPages.includes("employee") ? "/erp/employee" : (role === "admin" ? "/erp/admin" : "/login");
            if (pathname !== fallback) {
              router.replace(fallback);
            }
            return;
          }
        }
        setIsAuthorized(true);
        return;
      }
    }

    // If assignedPages is empty in session cache and user is employee on non-employee route,
    // verify against live database before rejecting (prevents race condition with stale storage)
    if (
      (!assignedPages || assignedPages.length === 0) &&
      role === "employee" &&
      !pathname.startsWith("/erp/employee") &&
      !isDepartmentAllowed
    ) {
      const email = (user?.email || localStorage.getItem("nexa_user_email") || "").toLowerCase().trim();
      const tenantSlug = extractSubdomainOrParam() || localStorage.getItem("nexa_tenant_slug") || "";
      if (email) {
        fetch(`/api/erp/users?email=${encodeURIComponent(email)}${tenantSlug ? `&tenant=${encodeURIComponent(tenantSlug)}` : ""}`, {
          headers: tenantSlug ? { "x-tenant-slug": tenantSlug } : {},
          cache: "no-store",
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((dbUser) => {
            if (dbUser) {
              let livePages: string[] = [];
              if (Array.isArray(dbUser.assignedPages)) livePages = dbUser.assignedPages;
              else if (typeof dbUser.assignedPages === "string") {
                try { livePages = JSON.parse(dbUser.assignedPages); } catch {}
              }
              if (livePages.length > 0 && isRouteOrModuleAssignedToUser(livePages, pathname, requiredModule)) {
                try {
                  const existing = localStorage.getItem("erp_current_user");
                  const parsed = existing ? JSON.parse(existing) : {};
                  localStorage.setItem("erp_current_user", JSON.stringify({ ...parsed, ...dbUser, assignedPages: livePages }));
                  document.cookie = `nexa_assigned_pages=${encodeURIComponent(JSON.stringify(livePages))}; path=/; max-age=2592000; SameSite=Lax`;
                } catch {}
                setIsAuthorized(true);
                return;
              }
            }
            setIsAuthorized(false);
            router.replace("/erp/employee");
          })
          .catch(() => {
            setIsAuthorized(false);
            router.replace("/erp/employee");
          });
        return;
      }
    }

    // STRICT SALES CLOSER ROLE ISOLATION:
    if (role === "sales_closer") {
      const isSalesAllowed =
        pathname.startsWith("/erp/employee") ||
        pathname.startsWith("/erp/ops/crm") ||
        pathname.startsWith("/erp/ops/calls") ||
        pathname.startsWith("/ops/calls") ||
        pathname.startsWith("/ops/crm");
      if (!isSalesAllowed && !isDepartmentAllowed) {
        setIsAuthorized(false);
        router.replace("/erp/ops/crm");
        return;
      }
      if (
        pathname.startsWith("/erp/ops/crm") ||
        pathname.startsWith("/erp/ops/calls") ||
        pathname.startsWith("/ops/calls") ||
        pathname.startsWith("/ops/crm") ||
        pathname.startsWith("/erp/admin/crm")
      ) {
        const tenantSlug = extractSubdomainOrParam() || localStorage.getItem("nexa_tenant_slug") || "";
        const isCrmProvisioned = isModuleEnabledForRole(tenantSlug, "admin", "crm");
        if (!isCrmProvisioned) {
          setIsAuthorized(false);
          router.replace("/erp/employee");
          return;
        }
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
        effectiveAllowedRoles = ["admin", "md", "marketer"];
      } else if (
        pathname.startsWith("/erp/ops/crm") ||
        pathname.startsWith("/erp/ops/calls") ||
        pathname.startsWith("/ops/calls") ||
        pathname.startsWith("/ops/crm")
      ) {
        effectiveAllowedRoles = ["admin", "md", "sales_closer"];
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
      else if (
        pathname.startsWith("/erp/marketer") ||
        pathname.startsWith("/erp/admin/crm") ||
        pathname.startsWith("/erp/ops/crm") ||
        pathname.startsWith("/erp/ops/calls") ||
        pathname.startsWith("/ops/calls") ||
        pathname.startsWith("/ops/crm")
      ) requiredMod = "crm";
      else if (pathname.startsWith("/erp/admin/ai")) requiredMod = "ai";
      else if (pathname.startsWith("/erp/admin/shop")) requiredMod = "shop";
      else if (pathname.startsWith("/erp/admin/marketplace")) requiredMod = "marketplace";
      else if (pathname.startsWith("/erp/admin/mobility")) requiredMod = "mobility";
      else if (pathname.startsWith("/erp/admin/dispatch") || pathname.startsWith("/erp/ops/dispatch")) requiredMod = "dispatch";
      else if (pathname.startsWith("/erp/admin/users") || pathname.startsWith("/erp/admin/departments")) requiredMod = "users";
      else if (pathname.startsWith("/erp/employee")) requiredMod = "users";
      else if (pathname.startsWith("/erp/manager")) requiredMod = "users";
      else if (pathname.startsWith("/erp/md")) requiredMod = "users";
    }

    const activeTenantSlug =
      extractSubdomainOrParam() ||
      localStorage.getItem("nexa_tenant_slug") ||
      localStorage.getItem("tenant_slug") ||
      "";

    if (requiredMod && !isDepartmentAllowed) {
      const activeMatrix = matrix || (activeTenantSlug ? getTenantPermissionMatrix(activeTenantSlug) : null);
      const isMatrixReady = activeMatrix && Object.keys(activeMatrix.admin || {}).length > 2;

      if (!isMatrixReady) {
        if (activeTenantSlug) {
          fetchTenantPermissionMatrix(activeTenantSlug).then((remoteM) => {
            if (remoteM && Object.keys(remoteM.admin || {}).length > 2) {
              setMatrix(remoteM);
            }
          });
        }
        setIsAuthorized(null);
        return;
      }

      if (requiredMod === "users" || requiredMod === "employee" || requiredMod === "manager" || requiredMod === "md") {
        const isUsersDisabled = activeMatrix.admin?.users === false || (activeMatrix as any)?.tenant_provision?.users === false;
        if (isUsersDisabled) {
          moduleAllowed = false;
        } else {
          moduleAllowed = Boolean(activeMatrix.admin?.users || (activeMatrix as any)?.tenant_provision?.users);
        }
      } else if (role === "admin") {
        const isExplicitlyDisabled = activeMatrix.admin?.[requiredMod] === false || (activeMatrix as any)?.tenant_provision?.[requiredMod] === false;
        moduleAllowed = !isExplicitlyDisabled && Boolean(
          activeMatrix.admin?.[requiredMod] ||
          (activeMatrix as any)?.tenant_provision?.[requiredMod]
        );
      } else {
        const roleKey = role as RoleKey;
        const isExplicitlyDisabled = activeMatrix.admin?.[requiredMod] === false || (activeMatrix as any)?.tenant_provision?.[requiredMod] === false;
        const tenantHasMod = !isExplicitlyDisabled && Boolean(
          activeMatrix.admin?.[requiredMod] ||
          (activeMatrix as any)?.tenant_provision?.[requiredMod]
        );
        const roleHasMod = Boolean(activeMatrix[roleKey]?.[requiredMod]);
        moduleAllowed = tenantHasMod && roleHasMod;
      }
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
  }, [pathname, user, allowedRoles, requiredModule, fallbackRoute, router, departmentConfigs, matrix, sessionVersion]);

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
