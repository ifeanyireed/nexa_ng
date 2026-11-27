import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { extractSubdomainFromHost } from "@/lib/storefront-tenant";

export const dynamic = "force-dynamic";

const initializedProfileTenants = new Set<string>();

async function ensureShopBuyerProfilesTable(sql: any, tenantSlug: string) {
  if (!sql) return;
  const key = tenantSlug.toLowerCase().trim();
  if (initializedProfileTenants.has(key)) return;

  await sql`
    CREATE TABLE IF NOT EXISTS shop_buyer_profiles (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      email VARCHAR(191) NOT NULL DEFAULT '',
      phone VARCHAR(64) NOT NULL DEFAULT '',
      full_name VARCHAR(191) NOT NULL DEFAULT 'Customer',
      city VARCHAR(100) DEFAULT 'Lagos',
      membership_tier VARCHAR(100) DEFAULT 'Patron Member',
      addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
      measurement_presets JSONB NOT NULL DEFAULT '[]'::jsonb,
      saved_products JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_shop_buyer_profiles_tenant_created
    ON shop_buyer_profiles (LOWER(tenant_slug), created_at DESC);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_shop_buyer_profiles_tenant_status
    ON shop_buyer_profiles (LOWER(tenant_slug), status);
  `;

  initializedProfileTenants.add(key);
}

function resolveTenantSlug(request: NextRequest, body?: any): string {
  const { searchParams } = new URL(request.url);
  const raw =
    searchParams.get("tenant") ||
    searchParams.get("slug") ||
    body?.tenantSlug ||
    body?.tenant ||
    request.headers.get("x-tenant-slug") ||
    extractSubdomainFromHost(request.headers.get("host")) ||
    "";
  return String(raw).toLowerCase().trim();
}

function parseJsonArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRowToBuyerProfile(row: any) {
  return {
    id: row.id,
    fullName: row.full_name || "Customer",
    email: row.email || "",
    phone: row.phone || "",
    city: row.city || "Lagos",
    membershipTier: row.membership_tier || "Patron Member",
    addresses: parseJsonArray(row.addresses),
    measurementPresets: parseJsonArray(row.measurement_presets),
    savedProducts: parseJsonArray(row.saved_products),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const tenantSlug = resolveTenantSlug(request);
  if (!tenantSlug) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = (searchParams.get("id") || "").trim();
  const email = (searchParams.get("email") || "").toLowerCase().trim();
  const phone = (searchParams.get("phone") || "").trim();

  if (!id && !email && !phone) {
    return NextResponse.json(
      { success: false, error: "id, email, or phone is required to look up buyer profile" },
      { status: 400 }
    );
  }

  try {
    const sql = await getTenantSql(tenantSlug);
    await ensureShopBuyerProfilesTable(sql, tenantSlug);

    const rows = await sql`
      SELECT * FROM shop_buyer_profiles
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        AND (
          (${id} <> '' AND id = ${id})
          OR (${email} <> '' AND LOWER(email) = ${email})
          OR (${phone} <> '' AND phone = ${phone})
        )
      ORDER BY updated_at DESC
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        profile: null,
      });
    }

    return NextResponse.json({
      success: true,
      profile: mapRowToBuyerProfile(rows[0]),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load buyer profile: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantSlug = resolveTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const email = String(body.email || "").toLowerCase().trim();
    const phone = String(body.phone || "").trim();
    const fullName = String(body.fullName || "").trim();
    const city = String(body.city || "Lagos").trim();

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: "Email or phone number is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureShopBuyerProfilesTable(sql, tenantSlug);

    // Check if buyer profile already exists for this tenant
    const existing = await sql`
      SELECT * FROM shop_buyer_profiles
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        AND (
          (${email} <> '' AND LOWER(email) = ${email})
          OR (${phone} <> '' AND phone = ${phone})
        )
      ORDER BY updated_at DESC
      LIMIT 1;
    `;

    if (existing && existing.length > 0) {
      const current = existing[0];
      const mergedAddresses = Array.isArray(body.addresses) && body.addresses.length > 0
        ? body.addresses
        : parseJsonArray(current.addresses);
      const mergedPresets = Array.isArray(body.measurementPresets) && body.measurementPresets.length > 0
        ? body.measurementPresets
        : parseJsonArray(current.measurement_presets);
      const mergedSaved = Array.isArray(body.savedProducts) && body.savedProducts.length > 0
        ? body.savedProducts
        : parseJsonArray(current.saved_products);

      const updatedRows = await sql`
        UPDATE shop_buyer_profiles
        SET full_name = COALESCE(NULLIF(${fullName}, ''), full_name),
            email = COALESCE(NULLIF(${email}, ''), email),
            phone = COALESCE(NULLIF(${phone}, ''), phone),
            city = COALESCE(NULLIF(${city}, ''), city),
            addresses = ${JSON.stringify(mergedAddresses)}::jsonb,
            measurement_presets = ${JSON.stringify(mergedPresets)}::jsonb,
            saved_products = ${JSON.stringify(mergedSaved)}::jsonb,
            updated_at = NOW()
        WHERE id = ${current.id}
          AND LOWER(tenant_slug) = ${tenantSlug}
        RETURNING *;
      `;

      return NextResponse.json({
        success: true,
        profile: mapRowToBuyerProfile(updatedRows[0] || current),
      });
    }

    const newId =
      body.id || `buyer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const resolvedName = fullName || (email ? email.split("@")[0] : "Customer");
    const addresses = Array.isArray(body.addresses) ? body.addresses : [];
    const measurementPresets = Array.isArray(body.measurementPresets)
      ? body.measurementPresets
      : [];
    const savedProducts = Array.isArray(body.savedProducts) ? body.savedProducts : [];

    const inserted = await sql`
      INSERT INTO shop_buyer_profiles (
        id, tenant_slug, tenant_id, email, phone, full_name, city,
        membership_tier, addresses, measurement_presets, saved_products,
        status, created_at, updated_at
      ) VALUES (
        ${newId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${email}, ${phone},
        ${resolvedName}, ${city}, 'Patron Member',
        ${JSON.stringify(addresses)}::jsonb,
        ${JSON.stringify(measurementPresets)}::jsonb,
        ${JSON.stringify(savedProducts)}::jsonb,
        'ACTIVE', NOW(), NOW()
      )
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      profile: mapRowToBuyerProfile(inserted[0]),
    });
  } catch (err: any) {
    console.error("[Storefront Buyer Profile API] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save buyer profile: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
