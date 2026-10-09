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
    let [profiles, defaultSmtp] = await Promise.all([
      getTenantSenderProfiles(tenantSlug),
      getTenantSmtpSettings(tenantSlug),
    ]);

    // Ensure the tenant has configured their own SMTP credentials
    const isTenantSpecificSmtp = Boolean(
      defaultSmtp &&
      defaultSmtp.host &&
      defaultSmtp.fromEmail &&
      defaultSmtp.tenantSlug &&
      defaultSmtp.tenantSlug.toLowerCase() === tenantSlug.toLowerCase()
    );

    // If tenant has no profiles in tenant_sender_profiles but has existing SMTP settings,
    // auto-seed it as their first default profile so it's safely preserved and editable
    if (profiles.length === 0 && isTenantSpecificSmtp && defaultSmtp) {
      try {
        const seeded = await saveTenantSenderProfile({
          id: `prof_init_${tenantSlug.replace(/[^a-zA-Z0-9]/g, "_")}`,
          tenantSlug,
          profileName: `${(defaultSmtp.provider || "Primary").toUpperCase()} Relay`,
          provider: defaultSmtp.provider || "custom",
          host: defaultSmtp.host,
          port: defaultSmtp.port || 587,
          encryption: defaultSmtp.encryption || "tls",
          fromEmail: defaultSmtp.fromEmail,
          fromName: defaultSmtp.fromName || "Workspace Admin",
          username: defaultSmtp.username || defaultSmtp.fromEmail,
          password: defaultSmtp.password || "",
          isDefault: true,
        });
        profiles = [seeded];
      } catch (seedErr) {
        console.warn("Could not auto-seed initial profile:", seedErr);
      }
    }

    const returnedProfiles = profiles.map((p) => ({
      ...p,
      hasPassword: p.hasPassword || Boolean(p.password && p.password.length > 0),
      password: p.password ? "••••••••" : "",
    }));

    return NextResponse.json({
      success: true,
      profiles: returnedProfiles,
      defaultSmtp: isTenantSpecificSmtp
        ? {
            tenantSlug: defaultSmtp!.tenantSlug,
            provider: defaultSmtp!.provider,
            host: defaultSmtp!.host,
            port: defaultSmtp!.port,
            encryption: defaultSmtp!.encryption,
            fromEmail: defaultSmtp!.fromEmail,
            fromName: defaultSmtp!.fromName,
            username: defaultSmtp!.username,
            hasPassword: defaultSmtp!.hasPassword || Boolean(defaultSmtp!.password && defaultSmtp!.password.length > 0),
            password: defaultSmtp!.password ? "••••••••" : "",
            rateLimitedUntil: defaultSmtp!.rateLimitedUntil || null,
            rateLimitReason: defaultSmtp!.rateLimitReason || null,
            isRateLimited: Boolean(defaultSmtp!.isRateLimited),
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
