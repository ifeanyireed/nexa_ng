import { NextResponse } from "next/server";
import { getTenantSmtpSettings, saveTenantSmtpSettings, SmtpSettings } from "@/lib/email-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenantSlug =
    request.headers.get("x-tenant-slug") ||
    url.searchParams.get("tenant") ||
    url.searchParams.get("tenant_slug") ||
    "";

  if (!tenantSlug) {
    return NextResponse.json({ error: "Tenant slug required" }, { status: 400 });
  }

  try {
    const settings = await getTenantSmtpSettings(tenantSlug);
    if (!settings) {
      return NextResponse.json({
        configured: false,
        settings: null,
      });
    }

    return NextResponse.json({
      configured: true,
      settings: {
        tenantSlug: settings.tenantSlug,
        provider: settings.provider,
        host: settings.host,
        port: settings.port,
        encryption: settings.encryption,
        fromEmail: settings.fromEmail,
        fromName: settings.fromName,
        username: settings.username,
        hasPassword: settings.hasPassword || Boolean(settings.password && settings.password.length > 0),
        password: settings.password || "",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to retrieve SMTP settings: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug =
      body.tenantSlug ||
      body.tenant_slug ||
      request.headers.get("x-tenant-slug") ||
      "";

    if (!tenantSlug) {
      return NextResponse.json({ error: "Tenant identifier required" }, { status: 400 });
    }

    if (!body.host || !body.fromEmail) {
      return NextResponse.json(
        { error: "Host and From Email are required to configure SMTP" },
        { status: 400 }
      );
    }

    const payload: SmtpSettings = {
      tenantSlug,
      provider: body.provider || "custom",
      host: body.host.trim(),
      port: Number(body.port) || 587,
      encryption: body.encryption || "tls",
      fromEmail: body.fromEmail.trim(),
      fromName: body.fromName ? body.fromName.trim() : "Workspace Admin",
      username: body.username ? body.username.trim() : body.fromEmail.trim(),
      password: body.password || "",
    };

    const saved = await saveTenantSmtpSettings(payload);
    if (!saved) {
      return NextResponse.json({ error: "Failed to store SMTP configuration" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "SMTP configuration successfully updated",
      settings: {
        tenantSlug: payload.tenantSlug,
        provider: payload.provider,
        host: payload.host,
        port: payload.port,
        encryption: payload.encryption,
        fromEmail: payload.fromEmail,
        fromName: payload.fromName,
        username: payload.username,
        hasPassword: Boolean(payload.password && payload.password.length > 0),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process SMTP update: " + err.message },
      { status: 500 }
    );
  }
}
