import { NextResponse } from "next/server";
import { testSmtpSettings, SmtpSettings } from "@/lib/email-service";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { testEmail, tenantSlug } = body;

    if (!testEmail || !testEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid recipient test email is required" },
        { status: 400 }
      );
    }

    let config: SmtpSettings;

    if (body.host && body.fromEmail) {
      let resolvedPassword = body.password || "";
      if ((!resolvedPassword || resolvedPassword === "••••••••") && tenantSlug) {
        try {
          const res = await fetch(`${ERP_BASE}/crm/smtp-settings?tenant=${encodeURIComponent(tenantSlug)}`, {
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
          });
          const data = await res.json().catch(() => null);
          if (data?.settings?.hasPassword && data.settings?.password) {
            resolvedPassword = data.settings.password;
          }
        } catch {}
      }

      config = {
        tenantSlug: tenantSlug || "default",
        provider: body.provider || "custom",
        host: body.host.trim(),
        port: Number(body.port) || 587,
        encryption: body.encryption || "tls",
        fromEmail: body.fromEmail.trim(),
        fromName: body.fromName ? body.fromName.trim() : "Workspace Admin",
        username: body.username ? body.username.trim() : body.fromEmail.trim(),
        password: resolvedPassword,
      };
    } else if (tenantSlug) {
      const res = await fetch(`${ERP_BASE}/crm/smtp-settings?tenant=${encodeURIComponent(tenantSlug)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json().catch(() => null);
      if (!data?.configured || !data?.settings) {
        return NextResponse.json(
          { error: "No SMTP settings found for this tenant. Please configure host and credentials first." },
          { status: 400 }
        );
      }
      config = data.settings;
    } else {
      return NextResponse.json(
        { error: "Please supply host and credentials or a valid tenant identifier." },
        { status: 400 }
      );
    }

    const result = await testSmtpSettings(config, testEmail.trim());

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "SMTP test failed: " + err.message },
      { status: 500 }
    );
  }
}
