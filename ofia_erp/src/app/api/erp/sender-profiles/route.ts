import { NextResponse } from "next/server";
import {
  getTenantSenderProfiles,
  saveTenantSenderProfile,
  deleteTenantSenderProfile,
  getTenantSmtpSettings,
  TenantSenderProfile,
} from "@/lib/email-service";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const [profiles, defaultSmtp] = await Promise.all([
      getTenantSenderProfiles(tenantSlug),
      getTenantSmtpSettings(tenantSlug),
    ]);

    return NextResponse.json({
      success: true,
      profiles,
      defaultSmtp: defaultSmtp
        ? {
            tenantSlug: defaultSmtp.tenantSlug,
            provider: defaultSmtp.provider,
            host: defaultSmtp.host,
            port: defaultSmtp.port,
            encryption: defaultSmtp.encryption,
            fromEmail: defaultSmtp.fromEmail,
            fromName: defaultSmtp.fromName,
            username: defaultSmtp.username,
            hasPassword: defaultSmtp.hasPassword || Boolean(defaultSmtp.password && defaultSmtp.password.length > 0),
            password: defaultSmtp.hasPassword ? "••••••••" : "",
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load sender profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);

    if (!body.host || !body.fromEmail) {
      return NextResponse.json(
        { error: "Host and From Email are required to configure a sender profile" },
        { status: 400 }
      );
    }

    const payload: Partial<TenantSenderProfile> & {
      tenantSlug: string;
      profileName: string;
      host: string;
      fromEmail: string;
    } = {
      id: body.id,
      tenantSlug,
      profileName: body.profileName ? body.profileName.trim() : (body.fromEmail.split("@")[1] || "Domain Profile"),
      provider: body.provider || "custom",
      host: body.host.trim(),
      port: Number(body.port) || 587,
      encryption: body.encryption || "tls",
      fromEmail: body.fromEmail.trim(),
      fromName: body.fromName ? body.fromName.trim() : "Workspace Admin",
      username: body.username ? body.username.trim() : body.fromEmail.trim(),
      password: body.password || "",
      isDefault: Boolean(body.isDefault),
    };

    const profile = await saveTenantSenderProfile(payload);

    return NextResponse.json(
      { success: true, message: "Sender profile saved successfully", profile },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save sender profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const deleted = await deleteTenantSenderProfile(tenantSlug, id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete sender profile" },
      { status: 500 }
    );
  }
}
