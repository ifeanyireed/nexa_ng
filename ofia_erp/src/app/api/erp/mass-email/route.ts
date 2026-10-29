import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { dispatchBlastEmails } from "@/lib/crm-blast-dispatcher";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantSlug = getValidatedTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "Tenant identifier is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const { recipients, subject, messageHtml } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one recipient must be selected" },
        { status: 400 }
      );
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: "Email subject line is required" },
        { status: 400 }
      );
    }

    if (!messageHtml || !messageHtml.trim()) {
      return NextResponse.json(
        { success: false, error: "Email message body is required" },
        { status: 400 }
      );
    }

    const blastId = `BLAST-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const sql = await getTenantSql(tenantSlug);

    await sql`
      INSERT INTO crm_email_blasts (
        id, tenant_slug, tenant_id, title, subject, content_html, status, total_recipients, sent_count, failed_count, open_count, click_count, bounce_count, created_at, updated_at
      ) VALUES (
        ${blastId}, ${tenantSlug}, '', ${subject.trim()}, ${subject.trim()}, ${messageHtml}, 'SENDING', ${recipients.length}, 0, 0, 0, 0, 0, NOW(), NOW()
      );
    `;

    for (const r of recipients) {
      const email = typeof r === "string" ? r : (r.email || "");
      const name = typeof r === "string" ? "" : (r.name || "");
      if (email && email.includes("@")) {
        const recId = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await sql`
          INSERT INTO crm_email_blast_recipients (
            id, blast_id, tenant_slug, tenant_id, email, name, status, created_at
          ) VALUES (
            ${recId}, ${blastId}, ${tenantSlug}, '', ${email.trim().toLowerCase()}, ${name.trim()}, 'PENDING', NOW()
          );
        `;
      }
    }

    dispatchBlastEmails(tenantSlug, blastId).catch((err) =>
      console.error(`[Mass Email POST] Async delivery failed for ${blastId}:`, err)
    );

    return NextResponse.json({
      success: true,
      message: `Mass communication successfully queued for ${recipients.length} recipients.`,
      campaignId: blastId,
      totalRecipients: recipients.length,
    });
  } catch (err: any) {
    console.error("[Mass Email POST] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process mass email request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json({ success: true, campaigns: [] });
    }

    const sql = await getTenantSql(tenantSlug);
    const rows = await sql`
      SELECT id, title, subject, total_recipients, sent_count, failed_count, open_count, click_count, status, created_at
      FROM crm_email_blasts
      WHERE LOWER(tenant_slug) = ${tenantSlug} AND status != 'DELETED'
      ORDER BY created_at DESC;
    `;

    const campaigns = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      totalRecipients: Number(r.total_recipients || 0),
      sentCount: Number(r.sent_count || 0),
      failedCount: Number(r.failed_count || 0),
      openCount: Number(r.open_count || 0),
      clickCount: Number(r.click_count || 0),
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, campaigns });
  } catch (err: any) {
    console.error("[Mass Email GET] Error:", err);
    return NextResponse.json({ success: true, campaigns: [] });
  }
}
