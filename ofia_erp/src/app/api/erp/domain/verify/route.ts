import { NextResponse } from "next/server";
import { Resolver } from "dns/promises";

export const dynamic = "force-dynamic";

function cleanDomainInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/^www\./i, "");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawDomain = searchParams.get("domain");

  if (!rawDomain) {
    return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 });
  }

  const domain = cleanDomainInput(rawDomain);

  // Check for email typos
  if (domain.includes("@")) {
    const suggested = domain.replace(/@/g, ".");
    return NextResponse.json({
      success: false,
      domain,
      suggestedDomain: suggested,
      verified: false,
      status: "INVALID_DOMAIN",
      message: `Invalid domain format ('@' found). Did you mean '${suggested}'?`,
      cnameRecords: [],
      ipRecords: [],
    });
  }

  const parts = domain.split(".");
  const isSubdomain = parts.length > 2;
  const expected = {
    type: isSubdomain ? "CNAME" : "A",
    host: isSubdomain ? parts.slice(0, -2).join(".") : "@",
    value: isSubdomain ? "cname.vercel-dns.com" : "76.76.21.21",
  };

  try {
    // 1. Resolve DNS via public upstream DNS servers to bypass local cache
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

    const isCnameMatch = cnameRecords.some(
      (c) =>
        c === "cname.vercel-dns.com" ||
        c.endsWith(".vercel-dns.com") ||
        c.includes("cname.ofia.ng") ||
        c.includes("ofia.ng")
    );

    const isAMatch = aRecords.some(
      (ip) => ip === "76.76.21.21" || ip === "76.223.126.88"
    );

    // 2. Check Vercel edge verification if environment token configured
    const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
    const targetProjectId = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_ERP_PROJECT_ID;
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

    let vercelVerified = false;
    let vercelMisconfigured: boolean | null = null;

    if (VERCEL_TOKEN && targetProjectId) {
      try {
        let domainUrl = `https://api.vercel.com/v9/projects/${targetProjectId}/domains/${domain}`;
        let configUrl = `https://api.vercel.com/v6/domains/${domain}/config`;
        if (VERCEL_TEAM_ID) {
          domainUrl += `?teamId=${VERCEL_TEAM_ID}`;
          configUrl += `?teamId=${VERCEL_TEAM_ID}`;
        }

        const [domRes, cfgRes] = await Promise.allSettled([
          fetch(domainUrl, { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }, cache: "no-store" }),
          fetch(configUrl, { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }, cache: "no-store" }),
        ]);

        if (domRes.status === "fulfilled" && domRes.value.ok) {
          const vData = await domRes.value.json();
          if (vData?.verified) vercelVerified = true;
        }
        if (cfgRes.status === "fulfilled" && cfgRes.value.ok) {
          const cData = await cfgRes.value.json();
          if (typeof cData?.misconfigured === "boolean") vercelMisconfigured = cData.misconfigured;
        }
      } catch {}
    }

    const isVerified =
      isCnameMatch || isAMatch || (vercelVerified && vercelMisconfigured === false);
    const hasAnyRecords = cnameRecords.length > 0 || aRecords.length > 0;

    let status: "PROPAGATED" | "MISCONFIGURED" | "PENDING" = "PENDING";
    let message = "";

    if (isVerified) {
      status = "PROPAGATED";
      message = isCnameMatch
        ? `DNS CNAME successfully pointing to ${cnameRecords.join(", ")}`
        : isAMatch
        ? `DNS A record successfully pointing to ${aRecords.join(", ")}`
        : "Domain verified and active on edge.";
    } else if (hasAnyRecords) {
      status = "MISCONFIGURED";
      message = `DNS resolves (${cnameRecords.length ? `CNAME: ${cnameRecords.join(", ")}` : `A: ${aRecords.join(", ")}`}), but does not point to ${expected.value} yet.`;
    } else {
      status = "PENDING";
      message = `No active ${expected.type} record detected for ${domain}. Point ${expected.host} to ${expected.value} at your domain registrar.`;
    }

    return NextResponse.json({
      success: true,
      domain,
      verified: isVerified,
      status,
      expected,
      cnameRecords,
      ipRecords: aRecords,
      vercelVerified,
      vercelMisconfigured,
      message,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      domain,
      verified: false,
      status: "PENDING",
      message: "DNS lookup failed: " + err.message,
      cnameRecords: [],
      ipRecords: [],
    });
  }
}
