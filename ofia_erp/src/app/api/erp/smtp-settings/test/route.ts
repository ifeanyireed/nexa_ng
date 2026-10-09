import { NextResponse } from "next/server";
import { testSmtpSettings, getTenantSmtpSettings, getTenantSenderProfileById, SmtpSettings } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { testEmail, tenantSlug, profileId } = body;

    if (!testEmail || !testEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid recipient test email is required" },
        { status: 400 }
      );
    }

    let config: SmtpSettings;

    // If configuration fields are provided directly in the request, use them
    if (body.host && body.fromEmail) {
      // If password is masked and tenantSlug is provided, look up existing password
      let resolvedPassword = body.password || "";
      if ((!resolvedPassword || resolvedPassword === "••••••••") && tenantSlug) {
        if (profileId) {
          const profile = await getTenantSenderProfileById(tenantSlug, profileId);
          if (profile?.password) {
            resolvedPassword = profile.password;
          }
        }
        if (!resolvedPassword) {
          const existing = await getTenantSmtpSettings(tenantSlug);
          if (existing?.password) {
            resolvedPassword = existing.password;
          }
        }
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
      // Look up saved tenant settings
      const saved = await getTenantSmtpSettings(tenantSlug);
      if (!saved) {
        return NextResponse.json(
          { error: "No SMTP settings found for this tenant. Please configure host and credentials first." },
          { status: 400 }
        );
      }
      config = saved;
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
