"use client";

import { useState, useEffect, useCallback } from "react";

export interface DatabaseTenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  company: string;
  ownerName?: string;
  ownerEmail?: string;
  status?: string;
  planTier?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

let cachedTenants: DatabaseTenant[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * Formats a slug dynamically (e.g. "acme-corp" -> "Acme Corp")
 */
export function slugToTenantName(slug: string): string {
  if (!slug) return "";
  const clean = slug.toLowerCase().trim();
  return clean
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extracts the tenant slug dynamically from URL query (?tenant=) or subdomain
 */
export function extractSubdomainOrParam(searchParamSlug?: string | null): string {
  if (searchParamSlug) {
    return searchParamSlug.toLowerCase().trim();
  }

  if (typeof window !== "undefined") {
    // 1. Check URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("tenant") || urlParams.get("tenant_slug") || urlParams.get("company");
    if (param) return param.toLowerCase().trim();

    // 2. Check Hostname Subdomain
    const host = window.location.host.toLowerCase();
    const hostParts = host.split(":")[0].split(".");
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    let sub = "";

    if (isLocal && hostParts.length > 1 && hostParts[0] !== "localhost" && hostParts[0] !== "www") {
      sub = hostParts[0];
    } else if (!isLocal && hostParts.length > 2) {
      sub = hostParts[0];
    }

    if (sub && sub !== "erp" && sub !== "admin" && sub !== "www" && sub !== "app") {
      return sub.toLowerCase().trim();
    }
  }

  return "";
}

const DEFAULT_TENANT_ADMINS: Record<string, { name: string; email: string }> = {};

export const DEFAULT_TENANT_BRANDING: Record<
  string,
  { logo?: string; favicon?: string; primaryColor?: string; secondaryColor?: string }
> = {};

/**
 * Dynamically applies a tenant's brand colors to CSS variables and updates the browser tab favicon
 */
export function applyTenantBranding(tenant: DatabaseTenant | null | undefined) {
  if (typeof window === "undefined" || !tenant) return;

  // 1. Dynamic Primary and Secondary Colors
  if (tenant.primaryColor) {
    const hex = tenant.primaryColor;
    document.documentElement.style.setProperty("--nexa-brand", hex);
    document.documentElement.style.setProperty("--color-nexa-brand", hex);
    document.documentElement.style.setProperty("--nexa-brand-light", `${hex}1a`);
    document.documentElement.style.setProperty("--nexa-brand-glow", `${hex}33`);
  }
  if (tenant.secondaryColor) {
    const hex = tenant.secondaryColor;
    document.documentElement.style.setProperty("--nexa-accent", hex);
    document.documentElement.style.setProperty("--color-nexa-accent", hex);
  }

  // 2. Dynamic Browser Tab Favicon
  const faviconUrl = tenant.favicon || tenant.logo;
  if (faviconUrl) {
    const selectors = ["link[rel='icon']", "link[rel='shortcut icon']", "link[rel='apple-touch-icon']"];
    selectors.forEach((sel) => {
      const el = document.querySelector(sel) as HTMLLinkElement | null;
      if (el) el.href = faviconUrl;
    });
  }
}

/**
 * Batched lookup: Fetches all tenant organizations directly from the database via /api/organizations
 */
export async function fetchDatabaseTenants(forceRefresh = false): Promise<DatabaseTenant[]> {
  const now = Date.now();
  if (!forceRefresh && cachedTenants && cachedTenants.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedTenants;
  }

  try {
    const res = await fetch("/api/organizations", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: DatabaseTenant[] = data.map((org: any, idx: number) => {
          const rawSlug = org.slug || org.Slug || (org.name || org.Name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const savedTenantName =
            typeof window !== "undefined"
              ? localStorage.getItem("tenant_name_" + rawSlug) ||
                localStorage.getItem("tenant_name_" + (org.id || "")) ||
                localStorage.getItem("nexa_tenant_name")
              : null;
          const rawName = savedTenantName || org.name || org.Name || slugToTenantName(rawSlug || `org-${idx + 1}`);
          const rawDomain = org.domain || org.Domain || `${rawSlug}.ofia.ng`;
          const ownerObj = org.owner || org.Owner || {};
          const fallbackAdmin = DEFAULT_TENANT_ADMINS[rawSlug] || DEFAULT_TENANT_ADMINS[org.id || ""] || {
            name: "Workspace Admin",
            email: `admin@${rawSlug}.ng`,
          };

          const rawOwnerName =
            org.ownerName ||
            org.OwnerName ||
            org.owner_name ||
            org.adminName ||
            org.admin_name ||
            ownerObj.name ||
            ownerObj.Name ||
            ownerObj.fullName ||
            (typeof window !== "undefined"
              ? localStorage.getItem("tenant_admin_name_" + rawSlug) ||
                localStorage.getItem("tenant_admin_name_" + org.id) ||
                localStorage.getItem("nexa_user_name")
              : null) ||
            fallbackAdmin.name;

          const rawOwnerEmail =
            org.ownerEmail ||
            org.OwnerEmail ||
            org.owner_email ||
            org.adminEmail ||
            org.admin_email ||
            org.email ||
            ownerObj.email ||
            ownerObj.Email ||
            (typeof window !== "undefined"
              ? localStorage.getItem("tenant_admin_email_" + rawSlug) ||
                localStorage.getItem("tenant_admin_email_" + org.id) ||
                localStorage.getItem("nexa_user_email")
              : null) ||
            fallbackAdmin.email;

          const defaultBranding = DEFAULT_TENANT_BRANDING[rawSlug] || DEFAULT_TENANT_BRANDING[org.id || ""] || {};

          const rawLogo =
            org.logo ||
            org.Logo ||
            (typeof window !== "undefined"
              ? localStorage.getItem("tenant_logo_" + rawSlug) ||
                localStorage.getItem("tenant_logo_" + org.id) ||
                localStorage.getItem("nexa_tenant_logo")
              : null) ||
            defaultBranding.logo ||
            "";

          const rawFavicon =
            org.favicon ||
            org.Favicon ||
            (typeof window !== "undefined"
              ? localStorage.getItem("tenant_favicon_" + rawSlug) ||
                localStorage.getItem("tenant_favicon_" + org.id) ||
                localStorage.getItem("tenant_logo_" + rawSlug)
              : null) ||
            defaultBranding.favicon ||
            rawLogo ||
            "";

          const rawPrimaryColor =
            org.primaryColor ||
            org.primary_color ||
            org.PrimaryColor ||
            (typeof window !== "undefined"
              ? localStorage.getItem("tenant_primary_color_" + rawSlug) ||
                localStorage.getItem("tenant_primary_color_" + org.id) ||
                localStorage.getItem("nexa_tenant_primary_color")
              : null) ||
            defaultBranding.primaryColor ||
            "#1A56DB";

          const rawSecondaryColor =
            org.secondaryColor ||
            org.secondary_color ||
            org.SecondaryColor ||
            (typeof window !== "undefined"
              ? localStorage.getItem("tenant_secondary_color_" + rawSlug) ||
                localStorage.getItem("tenant_secondary_color_" + org.id) ||
                localStorage.getItem("nexa_tenant_secondary_color")
              : null) ||
            defaultBranding.secondaryColor ||
            "#0E9F6E";

          return {
            id: org.id || org.ID || `org-${idx + 1}`,
            name: rawName,
            slug: rawSlug,
            domain: rawDomain,
            company: rawName,
            ownerName: rawOwnerName,
            ownerEmail: rawOwnerEmail,
            status: org.status || org.Status || "Active",
            planTier: org.planTier || org.PlanTier || "Enterprise",
            logo: rawLogo,
            favicon: rawFavicon,
            primaryColor: rawPrimaryColor,
            secondaryColor: rawSecondaryColor,
          };
        });

        cachedTenants = mapped;
        lastFetchTime = now;
        return mapped;
      }
    }
  } catch (err) {
    console.error("Batched tenant lookup error:", err);
  }

  return cachedTenants || [];
}

/**
 * Resolves active tenant from a list of database-fetched organizations or extracts dynamically from URL/Email
 */
export function resolveTenantFromList(
  tenants: DatabaseTenant[],
  userEmail?: string | null,
  searchParamSlug?: string | null
): DatabaseTenant {
  const targetSlug = extractSubdomainOrParam(searchParamSlug);

  // 1. If tenants are available from the database, match against them
  if (tenants && tenants.length > 0) {
    if (targetSlug) {
      const found = tenants.find(
        (t) =>
          t.slug.toLowerCase() === targetSlug ||
          t.id.toLowerCase() === targetSlug ||
          t.name.toLowerCase().replace(/[^a-z0-9]/g, "") === targetSlug.replace(/[^a-z0-9]/g, "")
      );
      if (found) return found;
    }

    // Match from user email domain
    if (userEmail && userEmail.includes("@")) {
      const domainPart = userEmail.split("@")[1].toLowerCase();
      const domainSlug = domainPart.split(".")[0];
      const found = tenants.find(
        (t) =>
          t.slug.toLowerCase() === domainSlug ||
          t.ownerEmail?.toLowerCase() === userEmail.toLowerCase() ||
          t.domain.toLowerCase().includes(domainPart)
      );
      if (found) return found;
    }

    if (!targetSlug && !userEmail) {
      return {
        id: "",
        name: "Ofia ERP",
        slug: "",
        domain: "erp.ofia.ng",
        company: "Ofia ERP",
        status: "ACTIVE",
        planTier: "Enterprise",
        logo: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png",
        favicon: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png",
        primaryColor: "#1A56DB",
        secondaryColor: "#0E9F6E",
      };
    }
  }

  // 2. If targetSlug was found from URL/Subdomain, construct tenant dynamically from the slug
  if (targetSlug) {
    const fallbackAdmin = DEFAULT_TENANT_ADMINS[targetSlug] || { name: "Workspace Admin", email: `admin@${targetSlug}.ng` };
    const savedName =
      typeof window !== "undefined"
        ? localStorage.getItem("tenant_admin_name_" + targetSlug) || localStorage.getItem("nexa_user_name")
        : null;
    const savedEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("tenant_admin_email_" + targetSlug) || localStorage.getItem("nexa_user_email")
        : null;
    const savedTenantName =
      typeof window !== "undefined"
        ? localStorage.getItem("tenant_name_" + targetSlug) || localStorage.getItem("nexa_tenant_name")
        : null;
    const savedLogo =
      typeof window !== "undefined"
        ? localStorage.getItem("tenant_logo_" + targetSlug) || localStorage.getItem("nexa_tenant_logo")
        : null;
    const savedPrimaryColor =
      typeof window !== "undefined"
        ? localStorage.getItem("tenant_primary_color_" + targetSlug) || localStorage.getItem("nexa_tenant_primary_color")
        : null;
    const savedSecondaryColor =
      typeof window !== "undefined"
        ? localStorage.getItem("tenant_secondary_color_" + targetSlug) || localStorage.getItem("nexa_tenant_secondary_color")
        : null;

    const resolvedName = savedTenantName || slugToTenantName(targetSlug);

    return {
      id: targetSlug,
      name: resolvedName,
      slug: targetSlug,
      domain: `${targetSlug}.ofia.ng`,
      company: resolvedName,
      ownerName: savedName || fallbackAdmin.name,
      ownerEmail: savedEmail || userEmail || fallbackAdmin.email,
      status: "ACTIVE",
      planTier: "Enterprise",
      logo: savedLogo || "",
      favicon: savedLogo || "",
      primaryColor: savedPrimaryColor || "#1A56DB",
      secondaryColor: savedSecondaryColor || "#0E9F6E",
    };
  }

  // 3. If user email has domain
  if (userEmail && userEmail.includes("@")) {
    const domainPart = userEmail.split("@")[1].toLowerCase();
    const domainSlug = domainPart.split(".")[0];
    if (domainSlug && domainSlug !== "gmail" && domainSlug !== "yahoo" && domainSlug !== "outlook" && domainSlug !== "hotmail") {
      const fallbackAdmin = DEFAULT_TENANT_ADMINS[domainSlug] || { name: "Workspace Admin", email: userEmail };
      const savedName =
        typeof window !== "undefined"
          ? localStorage.getItem("tenant_admin_name_" + domainSlug) || localStorage.getItem("nexa_user_name")
          : null;

      return {
        id: domainSlug,
        name: slugToTenantName(domainSlug),
        slug: domainSlug,
        domain: `${domainSlug}.ofia.ng`,
        company: slugToTenantName(domainSlug),
        ownerName: savedName || fallbackAdmin.name,
        ownerEmail: userEmail,
        status: "ACTIVE",
        planTier: "Enterprise",
        logo: "",
        favicon: "",
        primaryColor: "#1A56DB",
        secondaryColor: "#0E9F6E",
      };
    }
  }

  // 4. Fallback empty structure
  return {
    id: "",
    name: "",
    slug: "",
    domain: "",
    company: "",
    status: "Active",
    planTier: "Enterprise",
    logo: "",
    favicon: "",
    primaryColor: "#1A56DB",
    secondaryColor: "#0E9F6E",
  };
}

/**
 * React hook: Batched tenant loader and active tenant state
 */
export function useActiveTenant(userEmail?: string | null, searchParamSlug?: string | null) {
  const [tenants, setTenants] = useState<DatabaseTenant[]>(cachedTenants || []);
  const [activeTenant, setActiveTenant] = useState<DatabaseTenant>(() =>
    resolveTenantFromList(cachedTenants || [], userEmail, searchParamSlug)
  );
  const [isLoading, setIsLoading] = useState<boolean>(!cachedTenants);

  const loadTenants = useCallback(async (force = false) => {
    setIsLoading(true);
    try {
      const list = await fetchDatabaseTenants(force);
      setTenants(list);
      const active = resolveTenantFromList(list, userEmail, searchParamSlug);
      setActiveTenant(active);
    } catch (e) {
      console.error("Error loading tenants:", e);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, searchParamSlug]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  useEffect(() => {
    if (activeTenant) {
      applyTenantBranding(activeTenant);
    }
  }, [activeTenant]);

  return {
    tenants,
    activeTenant,
    setActiveTenant,
    isLoading,
    reloadTenants: () => loadTenants(true),
  };
}
