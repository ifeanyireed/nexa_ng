"use client";

import { useState, useEffect, useCallback } from "react";

export interface DatabaseTenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  company: string;
  ownerEmail?: string;
  status?: string;
  planTier?: string;
}

let cachedTenants: DatabaseTenant[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * Maps known slug keys to formatted tenant brand names
 */
export function slugToTenantName(slug: string): string {
  if (!slug) return "New Era Transports";
  const clean = slug.toLowerCase().trim();
  const known: Record<string, string> = {
    neweratransports: "New Era Transports",
    nets: "New Era Transports",
    "new-era-transports": "New Era Transports",
    "payflow-africa": "PayFlow Africa",
    payflow: "PayFlow Africa",
    healthbridge: "HealthBridge Clinics",
    "apex-logistics": "Apex Global Logistics",
    "zenith-re": "Zenith Real Estate Hub",
  };
  if (known[clean]) {
    return known[clean];
  }
  return clean
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extracts the tenant slug from explicit parameter, URL query (?tenant=), or subdomain (e.g. neweratransports.localhost)
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

/**
 * Batched lookup: Fetches all tenant organizations directly from MySQL via /api/organizations
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
          const rawName = org.name || org.Name || slugToTenantName(org.slug || org.Slug || `org-${idx + 1}`);
          const rawSlug = org.slug || org.Slug || rawName.toLowerCase().replace(/[^a-z0-9]/g, "");
          const rawDomain = org.domain || org.Domain || `${rawSlug}.ofia.ng`;
          return {
            id: org.id || org.ID || `org-${idx + 1}`,
            name: rawName,
            slug: rawSlug,
            domain: rawDomain,
            company: rawName,
            ownerEmail: org.ownerEmail || org.OwnerEmail || org.email || "",
            status: org.status || org.Status || "Active",
            planTier: org.planTier || org.PlanTier || "Enterprise",
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

  // 1. If tenants are available, try exact matches
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

    if (!targetSlug) {
      return tenants[0];
    }
  }

  // 2. If targetSlug was found from URL/Subdomain, construct tenant dynamically
  if (targetSlug) {
    return {
      id: `org-${targetSlug}`,
      name: slugToTenantName(targetSlug),
      slug: targetSlug,
      domain: `${targetSlug}.ofia.ng`,
      company: slugToTenantName(targetSlug),
      status: "ACTIVE",
      planTier: "Enterprise",
    };
  }

  // 3. If user email has domain
  if (userEmail && userEmail.includes("@")) {
    const domainPart = userEmail.split("@")[1].toLowerCase();
    const domainSlug = domainPart.split(".")[0];
    if (domainSlug && domainSlug !== "gmail" && domainSlug !== "yahoo" && domainSlug !== "outlook") {
      return {
        id: `org-${domainSlug}`,
        name: slugToTenantName(domainSlug),
        slug: domainSlug,
        domain: `${domainSlug}.ofia.ng`,
        company: slugToTenantName(domainSlug),
        ownerEmail: userEmail,
        status: "ACTIVE",
        planTier: "Enterprise",
      };
    }
  }

  // 4. Default fallback tenant
  return {
    id: "org-01",
    name: "New Era Transports",
    slug: "neweratransports",
    domain: "neweratransports.ofia.ng",
    company: "New Era Transports",
    status: "ACTIVE",
    planTier: "Enterprise",
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

  return {
    tenants,
    activeTenant,
    setActiveTenant,
    isLoading,
    reloadTenants: () => loadTenants(true),
  };
}
