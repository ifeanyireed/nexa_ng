import { NextResponse } from "next/server";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const res = await fetch(`${ERP_BASE}/crm/smtp-settings?tenant=${encodeURIComponent(tenantSlug)}`, {
      cache: "no-store",
      headers: { "x-tenant-slug": tenantSlug },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    const settings = data?.settings;
    const profiles = settings
      ? [
          {
            id: `prof_init_${tenantSlug.replace(/[^a-zA-Z0-9]/g, "_")}`,
            tenantSlug,
            profileName: `${(settings.provider || "Primary").toUpperCase()} Relay`,
            provider: settings.provider || "custom",
            host: settings.host,
            port: settings.port || 587,
            encryption: settings.encryption || "tls",
            fromEmail: settings.fromEmail,
            fromName: settings.fromName || "Workspace Admin",
            username: settings.username || settings.fromEmail,
            hasPassword: Boolean(settings.hasPassword),
            password: settings.password ? "••••••••" : "",
            isDefault: true,
          },
        ]
      : [];

    return NextResponse.json({
      success: true,
      profiles,
      defaultSmtp: settings
        ? {
            tenantSlug: settings.tenantSlug,
            provider: settings.provider,
            host: settings.host,
            port: settings.port,
            encryption: settings.encryption,
            fromEmail: settings.fromEmail,
            fromName: settings.fromName,
            username: settings.username,
            hasPassword: Boolean(settings.hasPassword),
            password: settings.password ? "••••••••" : "",
            rateLimitedUntil: settings.rateLimitedUntil || null,
            rateLimitReason: settings.rateLimitReason || null,
            isRateLimited: Boolean(settings.isRateLimited),
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, body);

    const res = await fetch(`${ERP_BASE}/crm/smtp-settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        tenantSlug,
        provider: body.provider || "custom",
        host: body.host,
        port: Number(body.port) || 587,
        encryption: body.encryption || "tls",
        fromEmail: body.fromEmail,
        fromName: body.fromName,
        username: body.username,
        password: body.password,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json({ success: true, profile: body }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  return NextResponse.json({ success: true });
}
