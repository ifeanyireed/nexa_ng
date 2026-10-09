import { NextResponse } from "next/server";
import dns from "dns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain")?.trim().toLowerCase();

  if (!domain) {
    return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 });
  }

  // Sanitize domain
  const cleanDomain = domain.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/^www\./i, "");

  try {
    let isCnameMatch = false;
    let resolvedCnames: string[] = [];
    try {
      resolvedCnames = await dns.promises.resolveCname(cleanDomain);
      isCnameMatch = resolvedCnames.some(
        (c) =>
          c.toLowerCase().includes("cname.ofia.ng") ||
          c.toLowerCase().includes("ofia.ng") ||
          c.toLowerCase().includes("vercel-dns")
      );
    } catch {}

    let resolvedAddresses: string[] = [];
    try {
      resolvedAddresses = await dns.promises.resolve(cleanDomain);
    } catch {}

    const isVerified = isCnameMatch || resolvedAddresses.length > 0;

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      verified: isVerified,
      cnameRecords: resolvedCnames,
      ipRecords: resolvedAddresses,
      message: isVerified
        ? (isCnameMatch ? "Domain CNAME successfully pointing to cname.ofia.ng" : "Domain resolved successfully.")
        : "No active CNAME or DNS A records detected yet. Please ensure your DNS has propagated.",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      domain: cleanDomain,
      verified: false,
      message: "DNS lookup failed: " + err.message,
    });
  }
}
