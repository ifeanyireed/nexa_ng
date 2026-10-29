import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { dispatchBlastEmails } from "@/lib/crm-blast-dispatcher";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    const dueBlasts = await sql`
      SELECT id FROM crm_email_blasts
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        AND status = 'SCHEDULED'
        AND scheduled_at <= NOW();
    `;

    for (const b of dueBlasts) {
      dispatchBlastEmails(tenantSlug, b.id).catch((err) =>
        console.error(`[CRM Cron Blasts] Error dispatching scheduled blast ${b.id}:`, err)
      );
    }

    return NextResponse.json({
      success: true,
      dispatched: dueBlasts.length,
      blastIds: dueBlasts.map((b: any) => b.id),
    });
  } catch (err: any) {
    console.error("[CRM Cron Blasts POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Cron blast execution error: " + err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
