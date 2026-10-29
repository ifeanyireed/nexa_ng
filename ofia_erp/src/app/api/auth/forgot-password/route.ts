import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, tenant } = body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const host = request.headers.get("host") || "";
    const origin = request.headers.get("origin") || "";
    let tenantSlug = (tenant || request.headers.get("x-tenant-slug") || "").trim();
    if (!tenantSlug && host) {
      const parts = host.split(".");
      if (parts.length > 1 && !["www", "admin", "app", "api", "localhost"].includes(parts[0])) {
        tenantSlug = parts[0];
      }
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (tenantSlug) {
      headers["x-tenant-slug"] = tenantSlug;
    }
    if (origin) {
      headers["Origin"] = origin;
    } else if (host) {
      const protocol = host.includes("localhost") ? "http" : "https";
      headers["Origin"] = `${protocol}://${host}`;
    }

    const res = await fetch(`${ERP_BASE}/send-reset-email`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email: normalizedEmail, tenant: tenantSlug }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to dispatch password recovery email" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account matches that email, a password recovery link has been dispatched.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "ERP microservice error: " + (error?.message || "Internal failure") },
      { status: 502 }
    );
  }
}
