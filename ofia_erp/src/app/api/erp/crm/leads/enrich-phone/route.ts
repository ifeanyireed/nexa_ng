import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { enrichLeadContact } from "@/lib/crm-phone-enricher";

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

    const { leadId, companyName: overrideCompany, location: overrideLocation } = body;

    if (!leadId && !overrideCompany) {
      return NextResponse.json(
        { success: false, error: "leadId or companyName is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    let company = overrideCompany || "";
    let contactName = "";
    let currentPhone = "";
    let email = "";
    let website = "";
    let location = overrideLocation || "Lagos";

    if (leadId) {
      const rows = await sql`
        SELECT id, name, company, email, phone, location, website
        FROM crm_leads
        WHERE id = ${leadId} AND LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `;

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, error: `Lead not found: ${leadId}` },
          { status: 404 }
        );
      }

      const l = rows[0];
      company = l.company || company;
      contactName = l.name || "";
      currentPhone = l.phone || "";
      email = l.email || "";
      website = l.website || "";
      location = l.location || location;
    }

    const enrichment = await enrichLeadContact({
      leadId: leadId || "custom",
      companyName: company,
      contactName,
      currentPhone,
      email,
      website,
      location,
    });

    return NextResponse.json({
      success: true,
      data: enrichment,
    });
  } catch (err: any) {
    console.error("[CRM-Leads] enrich-phone error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search for phone numbers" },
      { status: 500 }
    );
  }
}
