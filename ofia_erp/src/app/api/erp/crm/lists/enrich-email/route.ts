import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { enrichSubscriberEmail } from "@/lib/crm-email-enricher";

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

    const { subscriberId, companyName: overrideCompany, contactName: overrideContact, phone, linkedinUrl, customQuery } = body;

    if (!subscriberId && !overrideCompany) {
      return NextResponse.json(
        { success: false, error: "subscriberId or companyName is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    let companyName = overrideCompany || "";
    let contactName = overrideContact || "";
    let contactPhone = phone || "";
    let contactLinkedin = linkedinUrl || "";

    if (subscriberId) {
      const rows = await sql`
        SELECT id, name, first_name, last_name, company, phone, linkedin_url, email
        FROM crm_email_subscribers
        WHERE id = ${subscriberId} AND LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `;

      if (rows.length > 0) {
        const sub = rows[0];
        companyName = companyName || sub.company || "";
        contactName = contactName || `${sub.first_name || ""} ${sub.last_name || ""}`.trim() || sub.name || "";
        contactPhone = contactPhone || sub.phone || "";
        contactLinkedin = contactLinkedin || sub.linkedin_url || "";
      }
    }

    // If customQuery provided, use it to augment company search
    const effectiveCompany = customQuery && customQuery.trim() ? customQuery.trim() : companyName;

    const enrichment = await enrichSubscriberEmail({
      subscriberId: subscriberId || "custom",
      companyName: effectiveCompany,
      contactName,
      phone: contactPhone,
      linkedinUrl: contactLinkedin,
      tenantSlug,
      sql,
    });

    return NextResponse.json({
      success: true,
      data: enrichment,
    });
  } catch (err: any) {
    console.error("[CRM-Lists] enrich-email error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search for email addresses" },
      { status: 500 }
    );
  }
}
