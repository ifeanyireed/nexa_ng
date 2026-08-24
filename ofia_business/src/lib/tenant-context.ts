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
 * Batched lookup: Fetches all tenant organizations directly from MySQL via /api/organizations
 */
export async function fetchDatabaseTenants(forceRefresh = false): Promise<DatabaseTenant[]> {
  const now = Date.now();
  if (!forceRefresh && cachedTenants && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedTenants;
  }

  try {
    const res = await fetch("/api/organizations", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: DatabaseTenant[] = data.map((org: any, idx: number) => {
          const rawName = org.name || org.Name || `Tenant ${idx + 1}`;
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
    console.error("Batched tenant lookup failed:", err);
  }

  return cachedTenants || [];
}

/**
 * Resolves active tenant from a list of database-fetched organizations
 */
export function resolveTenantFromList(
  tenants: DatabaseTenant[],
  userEmail?: string | null,
  searchParamSlug?: string | null
): DatabaseTenant | null {
  if (!tenants || tenants.length === 0) {
    return null;
  }

  // 1. Explicit search param (e.g., ?tenant=neweratransports or ?tenant=org-01)
  if (searchParamSlug) {
    const cleanParam = searchParamSlug.toLowerCase().trim();
    const found = tenants.find(
      (t) =>
        t.slug.toLowerCase() === cleanParam ||
        t.id.toLowerCase() === cleanParam ||
        t.name.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanParam.replace(/[^a-z0-9]/g, "")
    );
    if (found) return found;
  }

  // 2. Subdomain lookup from window.location
  if (typeof window !== "undefined") {
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
      const found = tenants.find(
        (t) =>
          t.slug.toLowerCase() === sub ||
          t.id.toLowerCase() === sub ||
          t.name.toLowerCase().replace(/[^a-z0-9]/g, "") === sub.replace(/[^a-z0-9]/g, "")
      );
      if (found) return found;
    }
  }

  // 3. Match from user email domain
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

  // 4. Default: Return the first tenant from database lookup
  return tenants[0];
}

/**
 * React hook: Batched tenant loader and active tenant state
 */
export function useActiveTenant(userEmail?: string | null, searchParamSlug?: string | null) {
  const [tenants, setTenants] = useState<DatabaseTenant[]>(cachedTenants || []);
  const [activeTenant, setActiveTenant] = useState<DatabaseTenant | null>(() =>
    cachedTenants ? resolveTenantFromList(cachedTenants, userEmail, searchParamSlug) : null
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
