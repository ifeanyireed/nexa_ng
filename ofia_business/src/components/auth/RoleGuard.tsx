"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/nexa/AuthContext";
import {
  RoleKey,
  isModuleEnabledForRole,
} from "@/lib/access-control";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: RoleKey[];
  requiredModule?: string;
  fallbackRoute?: string;
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
  const [userRole, setUserRole] = useState<RoleKey>("admin");
  const [redirectTarget, setRedirectTarget] = useState<string>("/login");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Resolve active user and role
    let role: RoleKey = "admin";
    const stored = localStorage.getItem("erp_current_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u && u.role) {
          role = u.role as RoleKey;
        }
      } catch {}
    } else if (user?.role) {
      role = (user.role.toLowerCase().replace("tenant_", "").replace("_director", "") || "admin") as RoleKey;
    }
    setUserRole(role);

    // 2. Resolve default home dashboard for this role
    let home = "/erp/admin";
    if (role === "md") home = "/erp/md";
    else if (role === "hr") home = "/erp/hr";
    else if (role === "accountant") home = "/erp/accountant";
    else if (role === "manager") home = "/erp/manager";
    else if (role === "employee") home = "/erp/employee";
    else if (role === "cashier") home = "/erp/admin/pos";
    else if (role === "inventory_officer") home = "/erp/admin/inventory";
    else if (role === "dispatcher") home = "/erp/admin/logistics";

    setRedirectTarget(fallbackRoute || home);

    // 3. Automatic Route Role Rules (if allowedRoles not explicitly provided)
    let effectiveAllowedRoles = allowedRoles;
    if (!effectiveAllowedRoles) {
      if (pathname === "/erp/admin" || pathname.startsWith("/erp/admin/access-control")) {
        effectiveAllowedRoles = ["admin"];
      } else if (pathname.startsWith("/erp/md")) {
        effectiveAllowedRoles = ["admin", "md"];
      } else if (pathname.startsWith("/erp/hr")) {
        effectiveAllowedRoles = ["admin", "md", "hr"];
      } else if (pathname.startsWith("/erp/accountant")) {
        effectiveAllowedRoles = ["admin", "md", "accountant"];
      } else if (pathname.startsWith("/erp/manager")) {
        effectiveAllowedRoles = ["admin", "md", "hr", "manager"];
      } else if (pathname.startsWith("/erp/employee")) {
        effectiveAllowedRoles = [
          "admin",
          "md",
          "hr",
          "accountant",
          "manager",
          "employee",
          "cashier",
          "inventory_officer",
          "dispatcher",
        ];
      } else if (pathname.startsWith("/erp/admin/pos")) {
        effectiveAllowedRoles = ["admin", "md", "cashier", "manager"];
      } else if (pathname.startsWith("/erp/admin/inventory")) {
        effectiveAllowedRoles = ["admin", "md", "inventory_officer", "manager"];
      } else if (pathname.startsWith("/erp/admin/logistics")) {
        effectiveAllowedRoles = ["admin", "md", "dispatcher", "manager"];
      } else if (pathname.startsWith("/erp/admin/ai")) {
        effectiveAllowedRoles = ["admin", "md"];
      } else if (pathname.startsWith("/erp/admin/referrals")) {
        effectiveAllowedRoles = ["admin", "md", "manager"];
      } else if (pathname.startsWith("/erp/hr/quests")) {
        effectiveAllowedRoles = ["admin", "md", "hr", "manager", "employee"];
      }
    }

    // 4. Role Permission Check
    const roleAllowed = !effectiveAllowedRoles || effectiveAllowedRoles.includes(role);

    // 5. Module Database Permission Check
    let moduleAllowed = true;
    if (requiredModule && role !== "admin") {
      const tenantName = localStorage.getItem("nexa_org_name") || "EduSuite";
      moduleAllowed = isModuleEnabledForRole(tenantName, role, requiredModule);
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
  }, [pathname, user, allowedRoles, requiredModule, fallbackRoute, router]);

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
