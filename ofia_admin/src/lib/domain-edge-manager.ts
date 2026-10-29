import { Resolver } from "dns/promises";

export interface ExpectedDnsRecord {
  type: "CNAME" | "A";
  host: string;
  value: string;
}

export interface DomainVerificationResult {
  success: boolean;
  domain: string;
  status: "PROPAGATED" | "MISCONFIGURED" | "PENDING" | "INVALID_DOMAIN";
  propagated: boolean;
  vercelVerified: boolean;
  vercelMisconfigured: boolean | null;
  expected: ExpectedDnsRecord;
  detected: {
    cname: string[];
    a: string[];
  };
  message: string;
  suggestedDomain?: string;
  data?: any;
}

export function cleanDomainInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

export function isCustomDomain(domain?: string | null): boolean {
  if (!domain) return false;
  const clean = cleanDomainInput(domain);
  if (!clean) return false;
  if (
    clean.endsWith(".ofia.ng") ||
    clean.endsWith(".ofia.shop") ||
    clean === "ofia.ng" ||
    clean === "ofia.shop" ||
    clean === "localhost" ||
    clean.endsWith(".localhost") ||
    clean === "127.0.0.1"
  ) {
    return false;
  }
  return clean.includes(".");
}

export function getExpectedDnsRecord(domain: string): ExpectedDnsRecord {
  const clean = cleanDomainInput(domain);
  const parts = clean.split(".");
  const isSubdomain = parts.length > 2;

  return {
    type: isSubdomain ? "CNAME" : "A",
    host: isSubdomain ? parts.slice(0, -2).join(".") : "@",
    value: isSubdomain ? "cname.vercel-dns.com" : "76.76.21.21",
  };
}

/**
 * Automatically provisions a custom domain on the Vercel edge infrastructure.
 * Safe no-op if credentials are not configured in environment.
 */
export async function registerDomainOnEdge(
  rawDomain: string,
  explicitProjectId?: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const domain = cleanDomainInput(rawDomain);
    if (!domain) {
      return { success: false, message: "Domain is required" };
    }

    if (!isCustomDomain(domain)) {
      return { success: true, message: "Platform subdomain does not require edge registration." };
    }

    const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
    const targetProjectId =
      explicitProjectId ||
      process.env.VERCEL_ERP_PROJECT_ID ||
      process.env.VERCEL_PROJECT_ID;
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

    if (!VERCEL_TOKEN || !targetProjectId) {
      console.warn(
        "Vercel token or project ID is not configured. Custom domain will be saved in the database only."
      );
      return {
        success: true,
        message: "Domain saved in database. Edge registration skipped (no Vercel credentials configured).",
      };
    }

    let url = `https://api.vercel.com/v10/projects/${targetProjectId}/domains`;
    if (VERCEL_TEAM_ID) {
      url += `?teamId=${VERCEL_TEAM_ID}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409 || data.error?.code === "domain_already_in_use") {
        return { success: true, message: "Domain already registered on edge", data };
      }
      return {
        success: false,
        message: data.error?.message || "Failed to register domain on Vercel",
        data,
      };
    }

    return { success: true, message: "Domain successfully registered on Vercel edge", data };
  } catch (err: any) {
    console.error("Vercel domain registration error:", err);
    return { success: false, message: "Edge registration error: " + err.message };
  }
}

/**
 * Removes a custom domain from Vercel edge infrastructure.
 */
export async function removeDomainFromEdge(
  rawDomain: string,
  explicitProjectId?: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const domain = cleanDomainInput(rawDomain);
    if (!domain) return { success: false, message: "Domain is required" };

    const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
    const targetProjectId =
      explicitProjectId ||
      process.env.VERCEL_ERP_PROJECT_ID ||
      process.env.VERCEL_PROJECT_ID;
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

    if (!VERCEL_TOKEN || !targetProjectId) {
      return { success: true, message: "Skipped edge deletion (no credentials configured)" };
    }

    let url = `https://api.vercel.com/v9/projects/${targetProjectId}/domains/${domain}`;
    if (VERCEL_TEAM_ID) {
      url += `?teamId=${VERCEL_TEAM_ID}`;
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
    });

    const data = await response.json().catch(() => ({}));
    return { success: response.ok, message: response.ok ? "Domain removed from edge" : "Failed to remove domain", data };
  } catch (err: any) {
    return { success: false, message: "Edge removal error: " + err.message };
  }
}

/**
 * Verifies DNS propagation using public nameservers (8.8.8.8, 1.1.1.1) and Vercel edge verification APIs.
 */
export async function verifyDomainDnsAndEdge(
  rawDomain: string,
  explicitProjectId?: string
): Promise<DomainVerificationResult> {
  const domain = cleanDomainInput(rawDomain);

  if (!domain) {
    return {
      success: false,
      domain: "",
      status: "INVALID_DOMAIN",
      propagated: false,
      vercelVerified: false,
      vercelMisconfigured: null,
      expected: { type: "CNAME", host: "@", value: "cname.vercel-dns.com" },
      detected: { cname: [], a: [] },
      message: "Domain is required",
    };
  }

  // Detect email typo
  if (domain.includes("@")) {
    const suggested = domain.replace(/@/g, ".");
    return {
      success: false,
      domain,
      suggestedDomain: suggested,
      status: "INVALID_DOMAIN",
      propagated: false,
      vercelVerified: false,
      vercelMisconfigured: null,
      expected: getExpectedDnsRecord(suggested),
      detected: { cname: [], a: [] },
      message: `Invalid domain format ('@' found). Did you mean '${suggested}'?`,
    };
  }

  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
  if (!domainRegex.test(domain)) {
    return {
      success: false,
      domain,
      status: "INVALID_DOMAIN",
      propagated: false,
      vercelVerified: false,
      vercelMisconfigured: null,
      expected: { type: "CNAME", host: "@", value: "cname.vercel-dns.com" },
      detected: { cname: [], a: [] },
      message: "Invalid domain format. Enter a valid domain such as portal.yourbrand.com or yourbrand.com.",
    };
  }

  const expected = getExpectedDnsRecord(domain);

  // 1. Resolve DNS directly with public nameservers to avoid OS local caching
  const resolver = new Resolver();
  try {
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // Fallback to system resolver
  }

  const [cnameResult, aResult] = await Promise.allSettled([
    resolver.resolveCname(domain),
    resolver.resolve4(domain),
  ]);

  const cnameRecords =
    cnameResult.status === "fulfilled"
      ? cnameResult.value.map((r) => r.toLowerCase().replace(/\.$/, ""))
      : [];
  const aRecords = aResult.status === "fulfilled" ? aResult.value : [];

  const cnameMatched = cnameRecords.some(
    (r) =>
      r === "cname.vercel-dns.com" ||
      r.endsWith(".vercel-dns.com") ||
      r === "cname.ofia.ng" ||
      r.endsWith(".ofia.ng")
  );

  const aMatched = aRecords.some(
    (ip) => ip === "76.76.21.21" || ip === "76.223.126.88"
  );

  // 2. Query Vercel Domain & Config APIs if configured
  const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
  const targetProjectId =
    explicitProjectId ||
    process.env.VERCEL_ERP_PROJECT_ID ||
    process.env.VERCEL_PROJECT_ID;
  const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

  let vercelVerified = false;
  let vercelMisconfigured: boolean | null = null;
  let vercelData: any = null;

  if (VERCEL_TOKEN && targetProjectId) {
    try {
      let domainUrl = `https://api.vercel.com/v9/projects/${targetProjectId}/domains/${domain}`;
      let configUrl = `https://api.vercel.com/v6/domains/${domain}/config`;
      if (VERCEL_TEAM_ID) {
        domainUrl += `?teamId=${VERCEL_TEAM_ID}`;
        configUrl += `?teamId=${VERCEL_TEAM_ID}`;
      }

      const [domRes, cfgRes] = await Promise.allSettled([
        fetch(domainUrl, {
          headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
          cache: "no-store",
        }),
        fetch(configUrl, {
          headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
          cache: "no-store",
        }),
      ]);

      if (domRes.status === "fulfilled" && domRes.value.ok) {
        vercelData = await domRes.value.json();
        if (vercelData?.verified) vercelVerified = true;
      }
      if (cfgRes.status === "fulfilled" && cfgRes.value.ok) {
        const cfgData = await cfgRes.value.json();
        if (typeof cfgData?.misconfigured === "boolean") {
          vercelMisconfigured = cfgData.misconfigured;
        }
      }
    } catch {
      // Ignore Vercel API network error, DNS checks remain valid
    }
  }

  const propagated =
    cnameMatched || aMatched || (vercelVerified && vercelMisconfigured === false);
  const hasAnyRecords = cnameRecords.length > 0 || aRecords.length > 0;

  let status: "PROPAGATED" | "MISCONFIGURED" | "PENDING" = "PENDING";
  let message = "";

  if (propagated) {
    status = "PROPAGATED";
    message = cnameMatched
      ? `DNS verified! CNAME correctly points to ${cnameRecords.join(", ")}.`
      : aMatched
      ? `DNS verified! A record correctly points to ${aRecords.join(", ")}.`
      : "Domain is verified and active on the edge infrastructure.";
  } else if (hasAnyRecords) {
    status = "MISCONFIGURED";
    const found = [
      cnameRecords.length ? `CNAME: ${cnameRecords.join(", ")}` : "",
      aRecords.length ? `A: ${aRecords.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    message = `DNS resolves (${found}), but does not point to ${expected.value} yet. (Note: If using Cloudflare proxy, set SSL to Full/Strict or switch DNS record to DNS-only gray cloud).`;
  } else {
    status = "PENDING";
    message = `No ${expected.type} record detected yet for ${domain}. Add ${expected.type} (${expected.host} → ${expected.value}) at your DNS provider.`;
  }

  return {
    success: true,
    domain,
    status,
    propagated,
    vercelVerified,
    vercelMisconfigured,
    expected,
    detected: {
      cname: cnameRecords,
      a: aRecords,
    },
    message,
    data: vercelData,
  };
}
