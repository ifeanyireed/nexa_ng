"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  extractSubdomainOrParam,
  slugToTenantName,
  fetchDatabaseTenants,
  resolveTenantFromList,
} from "@/lib/tenant-context";

/**
 * TenantMetaTitleSync
 * Automatically synchronizes document.title on every page route ensuring
 * the Tenant Name is ALWAYS first.
 * e.g. "New Era Transports — Login | Ofia ERP"
 *      "New Era Transports — Inventory Management | Ofia ERP"
 */
export function TenantMetaTitleSync() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    let isMounted = true;

    const syncTitle = async () => {
      const activeSlug = extractSubdomainOrParam();
      const savedTenantName =
        (activeSlug ? localStorage.getItem("tenant_name_" + activeSlug) : null) ||
        localStorage.getItem("nexa_tenant_name") ||
        localStorage.getItem("tenant_name") ||
        (activeSlug ? slugToTenantName(activeSlug) : null) ||
        "";

      let tenantName = savedTenantName;

      // If tenant name isn't in localStorage yet, resolve it from database/presets
      if (!tenantName && activeSlug) {
        try {
          const tenants = await fetchDatabaseTenants();
          if (isMounted) {
            const matched = resolveTenantFromList(tenants, null, activeSlug);
            if (matched && matched.name) {
              tenantName = matched.name;
            }
          }
        } catch {
          tenantName = slugToTenantName(activeSlug);
        }
      }

      const isCustomTenant = Boolean(
        activeSlug && !["www", "ofia", "app", "nexa", "erp", "admin"].includes(activeSlug.toLowerCase())
      );

      const resolvedTenant =
        tenantName || (isCustomTenant ? slugToTenantName(activeSlug) : "") || "Ofia ERP";

      // Derive human-readable page name from path
      let pageTitle = "";
      if (pathname === "/login" || (pathname === "/" && isCustomTenant)) {
        pageTitle = "Login";
      } else if (pathname.startsWith("/tenant/settings")) {
        pageTitle = "Workspace Settings";
      } else if (pathname.startsWith("/tenant/billing")) {
        pageTitle = "Billing & Subscriptions";
      } else if (pathname.startsWith("/tenant/team")) {
        pageTitle = "Team Governance";
      } else if (pathname.startsWith("/tenant/usage")) {
        pageTitle = "Platform Usage";
      } else if (pathname.includes("/admin/shop/inventory")) {
        pageTitle = "Inventory Management";
      } else if (pathname.includes("/admin/shop/pos")) {
        pageTitle = "Point of Sale (POS)";
      } else if (pathname.includes("/admin/shop/referrals")) {
        pageTitle = "Referral Engine";
      } else if (pathname.includes("/admin/shop")) {
        pageTitle = "Shop & Retail";
      } else if (pathname.includes("/admin/logistics")) {
        pageTitle = "Logistics & Fleet Dispatch";
      } else if (pathname.includes("/admin/users")) {
        pageTitle = "Staff Directory & Roles";
      } else if (pathname.includes("/admin/ai")) {
        pageTitle = "AI Swarm & Automation";
      } else if (pathname.includes("/admin/marketplace")) {
        pageTitle = "Marketplace & Compass";
      } else if (pathname.startsWith("/erp/accountant")) {
        pageTitle = "Finance & Accounting";
      } else if (pathname.startsWith("/erp/hr")) {
        pageTitle = "HR & Appraisals";
      } else if (pathname.startsWith("/erp/md")) {
        pageTitle = "Managing Director Command";
      } else if (pathname.startsWith("/erp/manager")) {
        pageTitle = "Line Manager Portal";
      } else if (pathname.startsWith("/erp/employee")) {
        pageTitle = "Employee Workspace";
      } else if (pathname.startsWith("/erp/reset-password")) {
        pageTitle = "Password Reset";
      } else if (pathname.startsWith("/quests")) {
        pageTitle = "Corporate Quests";
      } else if (pathname.startsWith("/erp/admin") || pathname === "/erp") {
        pageTitle = "Executive Command Center";
      } else if (pathname.startsWith("/erp")) {
        pageTitle = "Enterprise Suite";
      }

      if (pageTitle) {
        document.title = `${resolvedTenant} — ${pageTitle} | Ofia ERP`;
      } else if (isCustomTenant) {
        document.title = `${resolvedTenant} — Enterprise Suite | Ofia ERP`;
      }
    };

    syncTitle();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return null;
}
