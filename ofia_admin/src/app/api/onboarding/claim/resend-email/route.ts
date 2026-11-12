import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { MASTER_CONNECTION_STRING } from "@/lib/tenant-db-resolver";
import {
  regenerateNeonClaimLink,
  sendNeonDatabaseClaimEmail,
} from "@/lib/provisioning/neon-claimable-provisioner";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantSlug } = body;

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required" },
        { status: 400 }
      );
    }

    const cleanSlug = tenantSlug.toLowerCase().trim();
    const sql = neon(MASTER_CONNECTION_STRING);

    const [tenant] = await sql`
      SELECT * FROM platform_tenants WHERE LOWER(slug) = ${cleanSlug} LIMIT 1;
    `;

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Regenerate claim link
    const fresh = await regenerateNeonClaimLink(cleanSlug);
    if (!fresh.success || !fresh.claimUrl || !fresh.userCode) {
      return NextResponse.json(
        { success: false, error: fresh.error || "Failed to generate claim code" },
        { status: 500 }
      );
    }

    // Send email
    const emailRes = await sendNeonDatabaseClaimEmail({
      recipientEmail: tenant.owner_email,
      recipientName: tenant.owner_name || tenant.name,
      businessName: tenant.name,
      tenantSlug: cleanSlug,
      claimUrl: fresh.claimUrl,
      userCode: fresh.userCode,
      expiresInMinutes: Math.round((fresh.expiresInSeconds || 900) / 60),
    });

    return NextResponse.json({
      success: true,
      claimUrl: fresh.claimUrl,
      userCode: fresh.userCode,
      expiresAt: fresh.expiresAt,
      emailSent: emailRes.success,
      emailMessageId: emailRes.messageId,
      emailError: emailRes.error,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
