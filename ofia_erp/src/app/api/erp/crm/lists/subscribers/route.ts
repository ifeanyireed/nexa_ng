import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

async function ensureCrmSubscribersTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_email_subscribers (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      list_id VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      name VARCHAR(191) DEFAULT '',
      first_name VARCHAR(100) DEFAULT '',
      last_name VARCHAR(100) DEFAULT '',
      company VARCHAR(191) DEFAULT '',
      phone VARCHAR(50) DEFAULT '',
      linkedin_url VARCHAR(255) DEFAULT '',
      role VARCHAR(100) DEFAULT 'Subscriber',
      department VARCHAR(100) DEFAULT '',
      status VARCHAR(50) DEFAULT 'SUBSCRIBED',
      unsubscribed_at TIMESTAMPTZ,
      unsubscribe_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS name VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS company VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Subscriber';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_subscribers_tenant ON crm_email_subscribers (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_subscribers_list ON crm_email_subscribers (list_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_subscribers_email ON crm_email_subscribers (LOWER(email));`;
}

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId") || searchParams.get("list_id");
    if (!listId) {
      return NextResponse.json({ success: false, error: "listId query param is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmSubscribersTable(sql);

    const rows = await sql`
      SELECT 
        id,
        tenant_slug,
        list_id,
        email,
        COALESCE(name, '') AS name,
        COALESCE(first_name, '') AS first_name,
        COALESCE(last_name, '') AS last_name,
        COALESCE(company, '') AS company,
        COALESCE(phone, '') AS phone,
        COALESCE(linkedin_url, '') AS linkedin_url,
        COALESCE(status, 'SUBSCRIBED') AS status,
        created_at
      FROM crm_email_subscribers
      WHERE list_id = ${listId.trim()} AND LOWER(tenant_slug) = ${tenantSlug}
      ORDER BY created_at DESC;
    `;

    const subscribers = rows.map((r: any) => ({
      id: r.id,
      tenantSlug: r.tenant_slug,
      listId: r.list_id,
      email: r.email,
      name: r.name || `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.email,
      firstName: r.first_name || "",
      lastName: r.last_name || "",
      company: r.company || "",
      phone: r.phone || "",
      linkedinUrl: r.linkedin_url || "",
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, subscribers });
  } catch (err: any) {
    console.error("[CRM Subscribers GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscribers: " + err.message, subscribers: [] },
      { status: 500 }
    );
  }
}

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

    const listId = (body.listId || body.list_id || "").trim();
    if (!listId) {
      return NextResponse.json({ success: false, error: "Audience list ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmSubscribersTable(sql);

    // Support both single subscriber and bulk batch array
    const rawSubs: any[] = Array.isArray(body.subscribers)
      ? body.subscribers
      : body.email
      ? [body]
      : [];

    if (rawSubs.length === 0) {
      return NextResponse.json({ success: false, error: "No subscribers provided" }, { status: 400 });
    }

    let addedCount = 0;
    const addedSubscribers: any[] = [];

    for (const s of rawSubs) {
      const email = (s.email || "").trim().toLowerCase();
      if (!email && !s.phone) continue;

      const subId = s.id && String(s.id).trim()
        ? String(s.id).trim()
        : `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const firstName = (s.firstName || s.first_name || "").trim();
      const lastName = (s.lastName || s.last_name || "").trim();
      const derivedName = (s.name || `${firstName} ${lastName}`.trim() || email).trim();
      const company = (s.company || "").trim();
      const phone = (s.phone || "").trim();
      const linkedinUrl = (s.linkedinUrl || s.linkedin_url || "").trim();
      const status = s.status || "SUBSCRIBED";

      // Check if subscriber already exists in this list
      const existing = await sql`
        SELECT id FROM crm_email_subscribers
        WHERE list_id = ${listId}
          AND LOWER(tenant_slug) = ${tenantSlug}
          AND (
            (${email !== ""} AND LOWER(email) = ${email})
            OR (${phone !== ""} AND phone = ${phone})
          )
        LIMIT 1;
      `;

      if (existing.length > 0) {
        // Update existing contact record
        await sql`
          UPDATE crm_email_subscribers
          SET name = COALESCE(NULLIF(${derivedName}, ''), name),
              first_name = COALESCE(NULLIF(${firstName}, ''), first_name),
              last_name = COALESCE(NULLIF(${lastName}, ''), last_name),
              company = COALESCE(NULLIF(${company}, ''), company),
              phone = COALESCE(NULLIF(${phone}, ''), phone),
              linkedin_url = COALESCE(NULLIF(${linkedinUrl}, ''), linkedin_url),
              status = ${status}
          WHERE id = ${existing[0].id} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      } else {
        await sql`
          INSERT INTO crm_email_subscribers (
            id, tenant_slug, tenant_id, list_id, email, name, first_name, last_name, company, phone, linkedin_url, status, created_at
          ) VALUES (
            ${subId}, ${tenantSlug}, '', ${listId}, ${email}, ${derivedName}, ${firstName}, ${lastName}, ${company}, ${phone}, ${linkedinUrl}, ${status}, NOW()
          );
        `;
        addedCount++;
        addedSubscribers.push({
          id: subId,
          tenantSlug,
          listId,
          email,
          name: derivedName,
          firstName,
          lastName,
          company,
          phone,
          linkedinUrl,
          status,
        });
      }
    }

    // Refresh list subscriber count
    await sql`
      UPDATE crm_email_lists
      SET subscriber_count = (
        SELECT COUNT(*)::int FROM crm_email_subscribers
        WHERE list_id = ${listId} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'SUBSCRIBED'
      ), updated_at = NOW()
      WHERE id = ${listId} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({
      success: true,
      addedCount: addedCount || rawSubs.length,
      subscribers: addedSubscribers,
    });
  } catch (err: any) {
    console.error("[CRM Subscribers POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to add subscribers: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const id = (body.id || "").trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "Subscriber ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmSubscribersTable(sql);

    const existingRows = await sql`
      SELECT * FROM crm_email_subscribers
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    if (existingRows.length === 0) {
      return NextResponse.json({ success: false, error: "Subscriber not found" }, { status: 404 });
    }

    const existing = existingRows[0];
    const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : existing.email;
    const firstName = body.firstName !== undefined ? String(body.firstName).trim() : existing.first_name;
    const lastName = body.lastName !== undefined ? String(body.lastName).trim() : existing.last_name;
    const name = body.name !== undefined ? String(body.name).trim() : (`${firstName} ${lastName}`.trim() || email);
    const company = body.company !== undefined ? String(body.company).trim() : existing.company;
    const phone = body.phone !== undefined ? String(body.phone).trim() : existing.phone;
    const linkedinUrl = body.linkedinUrl !== undefined ? String(body.linkedinUrl).trim() : existing.linkedin_url;
    const status = body.status !== undefined ? String(body.status).trim() : existing.status;

    await sql`
      UPDATE crm_email_subscribers
      SET email = ${email},
          name = ${name},
          first_name = ${firstName},
          last_name = ${lastName},
          company = ${company},
          phone = ${phone},
          linkedin_url = ${linkedinUrl},
          status = ${status}
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    // Refresh list subscriber count
    if (existing.list_id) {
      await sql`
        UPDATE crm_email_lists
        SET subscriber_count = (
          SELECT COUNT(*)::int FROM crm_email_subscribers
          WHERE list_id = ${existing.list_id} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'SUBSCRIBED'
        ), updated_at = NOW()
        WHERE id = ${existing.list_id} AND LOWER(tenant_slug) = ${tenantSlug};
      `;
    }

    return NextResponse.json({
      success: true,
      subscriber: {
        id,
        tenantSlug,
        listId: existing.list_id,
        email,
        name,
        firstName,
        lastName,
        company,
        phone,
        linkedinUrl,
        status,
        createdAt: existing.created_at ? new Date(existing.created_at).toISOString() : new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[CRM Subscribers PATCH] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update subscriber: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Subscriber ID is required" }, { status: 400 });
    }

    const cleanId = String(id).trim();
    const sql = await getTenantSql(tenantSlug);
    await ensureCrmSubscribersTable(sql);

    const subRows = await sql`
      SELECT list_id FROM crm_email_subscribers
      WHERE id = ${cleanId} AND LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    const listId = subRows[0]?.list_id;

    await sql`
      DELETE FROM crm_email_subscribers
      WHERE id = ${cleanId} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    if (listId) {
      await sql`
        UPDATE crm_email_lists
        SET subscriber_count = (
          SELECT COUNT(*)::int FROM crm_email_subscribers
          WHERE list_id = ${listId} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'SUBSCRIBED'
        ), updated_at = NOW()
        WHERE id = ${listId} AND LOWER(tenant_slug) = ${tenantSlug};
      `;
    }

    return NextResponse.json({ success: true, message: "Subscriber deleted successfully" });
  } catch (err: any) {
    console.error("[CRM Subscribers DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete subscriber: " + err.message },
      { status: 500 }
    );
  }
}
