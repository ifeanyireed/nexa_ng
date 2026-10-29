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
