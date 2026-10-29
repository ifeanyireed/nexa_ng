import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

async function ensureCrmListsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_email_lists (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      name VARCHAR(191) NOT NULL,
      description TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      subscriber_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE crm_email_lists ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_lists ADD COLUMN IF NOT EXISTS subscriber_count INT DEFAULT 0;`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_email_lists_tenant ON crm_email_lists (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_email_lists_created ON crm_email_lists (LOWER(tenant_slug), created_at DESC);`;
}

function parseTags(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
  }
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmListsTable(sql);

    const rows = await sql`
      SELECT 
        l.id,
        l.tenant_slug,
        l.name,
        COALESCE(l.description, '') AS description,
        COALESCE(l.tags, '[]') AS tags,
        COALESCE(l.created_at, NOW()) AS created_at,
        COALESCE(l.updated_at, NOW()) AS updated_at,
        (
          SELECT COUNT(*)::int 
          FROM crm_email_subscribers s 
          WHERE s.list_id = l.id 
            AND LOWER(s.tenant_slug) = ${tenantSlug} 
            AND s.status = 'SUBSCRIBED'
        ) AS subscriber_count
      FROM crm_email_lists l
      WHERE LOWER(l.tenant_slug) = ${tenantSlug}
      ORDER BY l.created_at DESC;
    `;

    const lists = rows.map((r: any) => ({
      id: r.id,
      tenantSlug: r.tenant_slug,
      name: r.name,
      description: r.description,
      tags: parseTags(r.tags),
      subscriberCount: Number(r.subscriber_count || 0),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, lists });
  } catch (err: any) {
    console.error("[CRM Lists GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audience lists: " + err.message, lists: [] },
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

    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "List name is required" }, { status: 400 });
    }

    const description = (body.description || "").trim();
    const tagsArr = Array.isArray(body.tags) ? body.tags : parseTags(body.tags);
    const tagsStr = JSON.stringify(tagsArr);

    const id = body.id && String(body.id).trim()
      ? String(body.id).trim()
      : `LIST-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmListsTable(sql);

    await sql`
      INSERT INTO crm_email_lists (
        id, tenant_slug, tenant_id, name, description, tags, subscriber_count, created_at, updated_at
      ) VALUES (
        ${id}, ${tenantSlug}, '', ${name}, ${description}, ${tagsStr}, 0, NOW(), NOW()
      );
    `;

    return NextResponse.json({
      success: true,
      list: {
        id,
        tenantSlug,
        name,
        description,
        tags: tagsArr,
        subscriberCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[CRM Lists POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create audience list: " + err.message },
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
      return NextResponse.json({ success: false, error: "List ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmListsTable(sql);

    const existingRows = await sql`
      SELECT id, name, description, tags, subscriber_count, created_at
      FROM crm_email_lists
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;

    if (existingRows.length === 0) {
      return NextResponse.json({ success: false, error: "Audience list not found" }, { status: 404 });
    }

    const existing = existingRows[0];
    const name = body.name !== undefined ? String(body.name).trim() : existing.name;
    const description = body.description !== undefined ? String(body.description).trim() : existing.description;
    const tagsArr = body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags : parseTags(body.tags)) : parseTags(existing.tags);
    const tagsStr = JSON.stringify(tagsArr);

    await sql`
      UPDATE crm_email_lists
      SET name = ${name},
          description = ${description},
          tags = ${tagsStr},
          updated_at = NOW()
      WHERE id = ${id} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    const subCountRows = await sql`
      SELECT COUNT(*)::int AS count
      FROM crm_email_subscribers
      WHERE list_id = ${id} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'SUBSCRIBED';
    `;
    const subscriberCount = Number(subCountRows[0]?.count || existing.subscriber_count || 0);

    return NextResponse.json({
      success: true,
      list: {
        id,
        tenantSlug,
        name,
        description,
        tags: tagsArr,
        subscriberCount,
        createdAt: existing.created_at ? new Date(existing.created_at).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[CRM Lists PATCH] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update audience list: " + err.message },
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
    let id = searchParams.get("id") || searchParams.get("listId");
    let body: any = null;

    if (!id) {
      try {
        body = await request.json();
        id = body?.id || body?.listId;
      } catch {}
    }

    const tenantSlug = getValidatedTenantSlug(request, body);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Audience list ID is required" }, { status: 400 });
    }

    const cleanId = String(id).trim();
    const sql = await getTenantSql(tenantSlug);
    await ensureCrmListsTable(sql);

    // Delete subscribers first
    await sql`
      DELETE FROM crm_email_subscribers
      WHERE list_id = ${cleanId} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    // Delete list
    await sql`
      DELETE FROM crm_email_lists
      WHERE id = ${cleanId} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({ success: true, message: "Audience list deleted successfully" });
  } catch (err: any) {
    console.error("[CRM Lists DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete audience list: " + err.message },
      { status: 500 }
    );
  }
}
