import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

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

    const { leadId, phone, sourceNote, website } = body;

    if (!leadId || !phone) {
      return NextResponse.json(
        { success: false, error: "leadId and phone are required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);

    // Fetch the lead
    const [lead] = await sql`
      SELECT * FROM crm_leads
      WHERE id = ${leadId} AND LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    if (!lead) {
      return NextResponse.json(
        { success: false, error: `Lead not found: ${leadId}` },
        { status: 404 }
      );
    }

    // Uniqueness guardrail: check if another lead has this phone number
    const cleanDigits = phone.replace(/[^0-9]/g, "");
    const last8Digits = cleanDigits.length >= 8 ? cleanDigits.slice(-8) : "";

    if (last8Digits) {
      const conflicting = await sql`
        SELECT id, name, company, email, phone
        FROM crm_leads
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND id != ${leadId}
          AND phone != ''
          AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 8) = ${last8Digits}
        LIMIT 1;
      `;

      if (conflicting.length > 0) {
        return NextResponse.json(
          {
            success: false,
            conflict: true,
            message: `This phone number is already registered to lead "${conflicting[0].name || conflicting[0].company}" (${conflicting[0].id}).`,
            conflictingLead: conflicting[0],
          },
          { status: 409 }
        );
      }
    }

    // Build audit note
    const oldPhoneDisplay = lead.phone ? `'${lead.phone}'` : "empty";
    const auditEntry = `[AI Phone Intelligence ${new Date().toISOString().split("T")[0]}]: Replaced ${oldPhoneDisplay} with '${phone}'. Source: ${sourceNote || "Web Search & Maps Intelligence"}.`;
    const mergedNotes = lead.notes ? `${lead.notes}\n${auditEntry}` : auditEntry;

    // Preserve or upgrade website
    const targetWebsite = (!lead.website || lead.website === "") && website ? website : (lead.website || "");

    const [updated] = await sql`
      UPDATE crm_leads SET
        phone = ${phone},
        notes = ${mergedNotes},
        website = CASE WHEN ${targetWebsite !== ""} THEN ${targetWebsite} ELSE website END,
        updated_at = NOW()
      WHERE id = ${leadId} AND LOWER(tenant_slug) = ${tenantSlug}
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      lead: {
        id: updated.id,
        tenantSlug,
        companyName: updated.company,
        contactName: updated.name,
        contactTitle: updated.title || "",
        contactEmail: updated.email,
        contactPhone: updated.phone,
        industry: updated.industry,
        location: updated.location,
        website: updated.website,
        linkedinUrl: updated.linkedin_url,
        icpFitScore: Number(updated.score) || 85,
        status: updated.status,
        assignedRep: updated.assigned_rep,
        notes: updated.notes,
        createdAt: updated.created_at ? new Date(updated.created_at).toISOString() : new Date().toISOString(),
        updatedAt: updated.updated_at ? new Date(updated.updated_at).toISOString() : new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[CRM-Leads] apply-phone error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update phone number" },
      { status: 500 }
    );
  }
}
