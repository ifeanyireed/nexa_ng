import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { isValidEmail } from "@/lib/crm-email-enricher";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const { subscriberId, email, sourceNote } = body;

    if (!subscriberId || !email) {
      return NextResponse.json(
        { success: false, error: "subscriberId and email are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    // Fetch the subscriber
    const rows = await sql`
      SELECT * FROM crm_email_subscribers
      WHERE id = ${subscriberId} AND LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: `Subscriber not found: ${subscriberId}` },
        { status: 404 }
      );
    }

    const sub = rows[0];

    // Update subscriber email (auto-restores BOUNCED contacts to SUBSCRIBED on replacement)
    const [updated] = await sql`
      UPDATE crm_email_subscribers
      SET email = ${cleanEmail},
          status = CASE WHEN status = 'BOUNCED' THEN 'SUBSCRIBED' ELSE status END,
          updated_at = NOW()
      WHERE id = ${subscriberId} AND LOWER(tenant_slug) = ${tenantSlug}
      RETURNING *;
    `;

    // Recalculate list subscriber count
    if (sub.list_id) {
      try {
        await sql`
          UPDATE crm_email_lists
          SET subscriber_count = (
            SELECT COUNT(*)::int FROM crm_email_subscribers
            WHERE list_id = ${sub.list_id} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'SUBSCRIBED'
          ), updated_at = NOW()
          WHERE id = ${sub.list_id} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      } catch {}
    }

    // Auto-sync into crm_leads if a matching lead exists without email
    try {
      const cleanPhone = (sub.phone || "").replace(/[^0-9]/g, "");
      const last8Digits = cleanPhone.length >= 8 ? cleanPhone.slice(-8) : "";
      const cleanLinkedin = (sub.linkedin_url || "").toLowerCase().trim();

      await sql`
        UPDATE crm_leads
        SET email = ${cleanEmail}, updated_at = NOW()
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND (email IS NULL OR email = '')
          AND (
            (${cleanLinkedin !== ""} AND LOWER(TRIM(linkedin_url)) = ${cleanLinkedin})
            OR (${last8Digits !== ""} AND phone != '' AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 8) = ${last8Digits})
            OR (${sub.name !== "" && sub.company !== ""} AND LOWER(TRIM(name)) = LOWER(TRIM(${sub.name})) AND LOWER(TRIM(company)) = LOWER(TRIM(${sub.company})))
          );
      `;
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Email enriched successfully: ${cleanEmail}`,
      subscriber: {
        id: updated.id,
        tenantSlug: updated.tenant_slug,
        listId: updated.list_id,
        email: updated.email,
        name: updated.name,
        firstName: updated.first_name,
        lastName: updated.last_name,
        company: updated.company,
        phone: updated.phone,
        linkedinUrl: updated.linkedin_url,
        status: updated.status,
      },
    });
  } catch (err: any) {
    console.error("[CRM-Lists] apply-email error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to apply email address" },
      { status: 500 }
    );
  }
}
