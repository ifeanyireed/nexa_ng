import { getTenantSql } from "@/lib/tenant-db-resolver";

interface TrackingPayload {
  tenantSlug?: string;
  blastId?: string;
  recipientId?: string;
  email?: string;
}

export function parseTrackingToken(token: string): TrackingPayload | null {
  try {
    const [payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const jsonStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export interface DirectEngagementParams {
  tenantSlug: string;
  blastId?: string;
  recipientId?: string;
  email?: string;
  eventType: "OPEN" | "CLICK" | "BOUNCE" | "UNSUBSCRIBE";
  targetUrl?: string;
  bounceReason?: string;
}

/**
 * Process email engagement telemetry directly on dedicated tenant database.
 * Supports native tracking pixel/redirects as well as Brevo webhooks (opens, clicks, bounces, unsubscribes).
 * Ensures contacts who engage with emails are added to the CRM leads list (/erp/admin/crm/leads)
 * ONLY after checking if they are not already on the list (by email or phone number)
 * to strictly prevent duplicate entries.
 */
export async function processDirectEngagement(params: DirectEngagementParams): Promise<boolean> {
  const { tenantSlug: rawTenant, eventType, targetUrl = "", bounceReason = "" } = params;
  if (!rawTenant) return false;

  const tenantSlug = rawTenant.toLowerCase().trim();
  let blastId = (params.blastId || "").trim();
  let recipientId = (params.recipientId || "").trim();
  let cleanEmail = (params.email || "").toLowerCase().trim();

  try {
    const sql = await getTenantSql(tenantSlug);

    // If recipientId is missing, resolve by blastId + email or latest email record
    if (!recipientId && cleanEmail) {
      let matchQuery;
      if (blastId) {
        matchQuery = await sql`
          SELECT id, blast_id FROM crm_email_blast_recipients
          WHERE blast_id = ${blastId} AND LOWER(email) = ${cleanEmail} AND LOWER(tenant_slug) = ${tenantSlug}
          LIMIT 1;
        `;
      } else {
        matchQuery = await sql`
          SELECT id, blast_id FROM crm_email_blast_recipients
          WHERE LOWER(email) = ${cleanEmail} AND LOWER(tenant_slug) = ${tenantSlug}
          ORDER BY created_at DESC
          LIMIT 1;
        `;
      }
      if (matchQuery.length > 0) {
        recipientId = matchQuery[0].id;
        if (!blastId) blastId = matchQuery[0].blast_id;
      }
    }

    // 1. Handle BOUNCE event
    if (eventType === "BOUNCE") {
      if (recipientId) {
        await sql`
          UPDATE crm_email_blast_recipients
          SET status = 'FAILED',
              error_message = ${bounceReason || 'Delivery bounced (Brevo relay)'},
              attempts = attempts + 1
          WHERE id = ${recipientId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      } else if (blastId && cleanEmail) {
        await sql`
          UPDATE crm_email_blast_recipients
          SET status = 'FAILED',
              error_message = ${bounceReason || 'Delivery bounced (Brevo relay)'},
              attempts = attempts + 1
          WHERE blast_id = ${blastId} AND LOWER(email) = ${cleanEmail} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }

      if (blastId) {
        await sql`
          UPDATE crm_email_blasts
          SET bounce_count = (
            SELECT COUNT(*) FROM crm_email_blast_recipients
            WHERE blast_id = ${blastId} AND status = 'FAILED'
          ),
          failed_count = (
            SELECT COUNT(*) FROM crm_email_blast_recipients
            WHERE blast_id = ${blastId} AND status = 'FAILED'
          ),
          updated_at = NOW()
          WHERE id = ${blastId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }

      if (cleanEmail) {
        await sql`
          UPDATE crm_email_subscribers
          SET status = 'BOUNCED', updated_at = NOW()
          WHERE LOWER(email) = ${cleanEmail} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }
      return true;
    }

    // 2. Handle UNSUBSCRIBE event
    if (eventType === "UNSUBSCRIBE") {
      if (cleanEmail) {
        await sql`
          UPDATE crm_email_subscribers
          SET status = 'UNSUBSCRIBED', updated_at = NOW()
          WHERE LOWER(email) = ${cleanEmail} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }
      return true;
    }

    // 3. Handle OPEN and CLICK metrics
    if (eventType === "OPEN") {
      if (recipientId) {
        await sql`
          UPDATE crm_email_blast_recipients
          SET opened_at = COALESCE(opened_at, NOW()),
              open_count = COALESCE(open_count, 0) + 1
          WHERE id = ${recipientId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      } else if (blastId && cleanEmail) {
        await sql`
          UPDATE crm_email_blast_recipients
          SET opened_at = COALESCE(opened_at, NOW()),
              open_count = COALESCE(open_count, 0) + 1
          WHERE blast_id = ${blastId} AND LOWER(email) = ${cleanEmail} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }

      if (blastId) {
        await sql`
          UPDATE crm_email_blasts
          SET open_count = (
            SELECT COUNT(*) FROM crm_email_blast_recipients
            WHERE blast_id = ${blastId} AND opened_at IS NOT NULL
          ), updated_at = NOW()
          WHERE id = ${blastId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }
    } else if (eventType === "CLICK") {
      if (recipientId) {
        await sql`
          UPDATE crm_email_blast_recipients
          SET clicked_at = COALESCE(clicked_at, NOW()),
              click_count = COALESCE(click_count, 0) + 1
          WHERE id = ${recipientId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      } else if (blastId && cleanEmail) {
        await sql`
          UPDATE crm_email_blast_recipients
          SET clicked_at = COALESCE(clicked_at, NOW()),
              click_count = COALESCE(click_count, 0) + 1
          WHERE blast_id = ${blastId} AND LOWER(email) = ${cleanEmail} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }

      if (blastId) {
        await sql`
          UPDATE crm_email_blasts
          SET click_count = (
            SELECT COUNT(*) FROM crm_email_blast_recipients
            WHERE blast_id = ${blastId} AND clicked_at IS NOT NULL
          ), updated_at = NOW()
          WHERE id = ${blastId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }
    }

    // 4. Fetch recipient details including phone from subscriber for CRM lead scoring
    let r: any = null;
    if (recipientId) {
      const recipRows = await sql`
        SELECT 
          r.id,
          r.email, 
          r.name, 
          r.first_name, 
          r.last_name, 
          r.company, 
          COALESCE(s.phone, '') AS sub_phone,
          COALESCE(s.linkedin_url, '') AS sub_linkedin
        FROM crm_email_blast_recipients r
        LEFT JOIN crm_email_subscribers s ON s.id = r.subscriber_id
        WHERE r.id = ${recipientId} AND LOWER(r.tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `;
      r = recipRows[0];
    } else if (cleanEmail) {
      const recipRows = await sql`
        SELECT 
          r.id,
          r.email, 
          r.name, 
          r.first_name, 
          r.last_name, 
          r.company, 
          COALESCE(s.phone, '') AS sub_phone,
          COALESCE(s.linkedin_url, '') AS sub_linkedin
        FROM crm_email_blast_recipients r
        LEFT JOIN crm_email_subscribers s ON s.id = r.subscriber_id
        WHERE LOWER(r.email) = ${cleanEmail} AND LOWER(r.tenant_slug) = ${tenantSlug}
        ORDER BY r.created_at DESC
        LIMIT 1;
      `;
      r = recipRows[0];
    }

    const finalEmail = cleanEmail || (r?.email || "").toLowerCase().trim();
    if (!finalEmail) return true;

    let contactName = (r?.name || "").trim();
    if (!contactName) {
      contactName = `${r?.first_name || ""} ${r?.last_name || ""}`.trim();
    }
    if (!contactName) {
      contactName = finalEmail.split("@")[0] || "Prospect";
    }

    const companyName = (r?.company || "").trim() || "Enterprise Prospect";
    const phoneStr = (r?.sub_phone || "").trim();
    const linkedinStr = (r?.sub_linkedin || "").trim();

    // 5. Blast title lookup for note attribution
    let blastTitle = "Email Blast Campaign";
    if (blastId) {
      const blastRows = await sql`
        SELECT title, subject FROM crm_email_blasts
        WHERE id = ${blastId} AND LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `;
      if (blastRows[0]) {
        blastTitle = blastRows[0].title || blastRows[0].subject || "Email Blast Campaign";
      }
    }

    const score = eventType === "CLICK" ? 95 : 80;
    const actionText =
      eventType === "CLICK"
        ? targetUrl
          ? `clicked link (${targetUrl}) in email blast`
          : "clicked link in email blast"
        : "opened email blast";

    const cleanDigits = phoneStr.replace(/[^0-9]/g, "");
    const lastDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

    // 6. STRICT DEDUPLICATION CHECK: Does this contact already exist on /erp/admin/crm/leads?
    // Check by email OR phone number to strictly prevent duplicate entries
    const existingLeads = await sql`
      SELECT id, score, owner, assigned_rep, phone, notes
      FROM crm_leads
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        AND (
          LOWER(email) = ${finalEmail}
          OR LOWER(contact_email) = ${finalEmail}
          ${lastDigits ? sql`OR (phone != '' AND phone LIKE ${'%' + lastDigits})` : sql``}
          ${lastDigits ? sql`OR (contact_phone != '' AND contact_phone LIKE ${'%' + lastDigits})` : sql``}
        )
      LIMIT 1;
    `;

    const existingLead = existingLeads[0];
    const noteEntry = `[${new Date().toISOString().slice(0, 10)}] Prospect ${actionText} "${blastTitle}".`;

    if (existingLead) {
      // 7A. UPDATE EXISTING LEAD ENTRY (NEVER INSERT DUPLICATE)
      const newScore = Math.max(Number(existingLead.score) || 75, score);
      await sql`
        UPDATE crm_leads SET
          score = ${newScore},
          icp_fit_score = ${newScore},
          phone = CASE WHEN (phone IS NULL OR phone = '') AND ${phoneStr !== ""} THEN ${phoneStr} ELSE phone END,
          contact_phone = CASE WHEN (contact_phone IS NULL OR contact_phone = '') AND ${phoneStr !== ""} THEN ${phoneStr} ELSE contact_phone END,
          linkedin_url = CASE WHEN (linkedin_url IS NULL OR linkedin_url = '') AND ${linkedinStr !== ""} THEN ${linkedinStr} ELSE linkedin_url END,
          notes = CASE 
            WHEN notes IS NULL OR notes = '' THEN ${noteEntry}
            ELSE notes || E'\n' || ${noteEntry}
          END,
          updated_at = NOW()
        WHERE id = ${existingLead.id} AND LOWER(tenant_slug) = ${tenantSlug};
      `;
    } else {
      // 7B. INSERT NEW SINGLE LEAD ENTRY (Only if NOT already on the list)
      const newLeadId = `LED-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const buyingSignals = JSON.stringify(["Email Blast Engagement", eventType]);

      await sql`
        INSERT INTO crm_leads (
          id, tenant_slug, tenant_id, name, company, email, phone,
          source, score, status, owner, assigned_rep, value, notes,
          company_name, contact_name, contact_email, contact_phone,
          icp_fit_score, buying_signals, source_blast_id, linkedin_url,
          created_at, updated_at
        ) VALUES (
          ${newLeadId}, ${tenantSlug}, '', ${contactName}, ${companyName}, ${finalEmail}, ${phoneStr},
          ${`Email Blast: ${blastTitle}`}, ${score}, 'CURIOUS', '', '', '₦10,000,000', ${noteEntry},
          ${companyName}, ${contactName}, ${finalEmail}, ${phoneStr},
          ${score}, ${buyingSignals}::jsonb, ${blastId}, ${linkedinStr},
          NOW(), NOW()
        );
      `;
    }

    return true;
  } catch (err) {
    console.error("[Email Engagement Tracker] Error processing direct engagement:", err);
    return false;
  }
}

/**
 * Process email open/click engagement from signed URL tokens.
 */
export async function processEmailEngagement(
  token: string,
  eventType: "OPEN" | "CLICK",
  targetUrl: string = ""
): Promise<boolean> {
  const payload = parseTrackingToken(token);
  if (!payload || !payload.tenantSlug) {
    return false;
  }

  return processDirectEngagement({
    tenantSlug: payload.tenantSlug,
    blastId: payload.blastId,
    recipientId: payload.recipientId,
    email: payload.email,
    eventType,
    targetUrl,
  });
}
