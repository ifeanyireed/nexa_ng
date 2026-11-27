import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { extractSubdomainFromHost } from "@/lib/storefront-tenant";

export const dynamic = "force-dynamic";

const initializedCartTenants = new Set<string>();

async function ensureShopCartsTable(sql: any, tenantSlug: string) {
  if (!sql) return;
  const key = tenantSlug.toLowerCase().trim();
  if (initializedCartTenants.has(key)) return;

  await sql`
    CREATE TABLE IF NOT EXISTS shop_carts (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      cart_key VARCHAR(191) NOT NULL,
      buyer_id VARCHAR(191) DEFAULT '',
      buyer_email VARCHAR(191) DEFAULT '',
      session_id VARCHAR(191) DEFAULT '',
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      item_count INT NOT NULL DEFAULT 0,
      subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
      status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_slug, cart_key)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_shop_carts_tenant_created
    ON shop_carts (LOWER(tenant_slug), created_at DESC);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_shop_carts_tenant_status
    ON shop_carts (LOWER(tenant_slug), status);
  `;

  initializedCartTenants.add(key);
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

function buildCartKey(buyerId?: string, buyerEmail?: string, sessionId?: string): string {
  const cleanEmail = (buyerEmail || "").toLowerCase().trim();
  const cleanBuyerId = (buyerId || "").trim();
  const cleanSession = (sessionId || "").trim();
  if (cleanEmail) return `buyer:${cleanEmail}`;
  if (cleanBuyerId) return `buyer:${cleanBuyerId}`;
  if (cleanSession) return `session:${cleanSession}`;
  return "";
}

function parseItems(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mergeCartItemLists(primary: any[], secondary: any[]): any[] {
  const getAccKey = (item: any) =>
    (item.selectedAccessories || [])
      .map((a: any) => a.id || a.name)
      .sort()
      .join(",");

  const getBespokeKey = (item: any) =>
    item.bespokeMeasurements ? JSON.stringify(item.bespokeMeasurements) : "";

  const merged = [...primary];
  for (const incoming of secondary) {
    const idx = merged.findIndex(
      (i) =>
        i.productId === incoming.productId &&
        (incoming.sku ? i.sku === incoming.sku : true) &&
        i.selectedColor === incoming.selectedColor &&
        i.selectedSize === incoming.selectedSize &&
        i.selectedPrint === incoming.selectedPrint &&
        i.selectedPortion === incoming.selectedPortion &&
        getAccKey(i) === getAccKey(incoming) &&
        getBespokeKey(i) === getBespokeKey(incoming)
    );
    if (idx > -1) {
      merged[idx] = {
        ...merged[idx],
        quantity: (Number(merged[idx].quantity) || 1) + (Number(incoming.quantity) || 1),
      };
    } else {
      merged.push(incoming);
    }
  }
  return merged;
}

function computeTotals(items: any[]) {
  const itemCount = items.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
  const subtotal = items.reduce(
    (acc, curr) => acc + (Number(curr.price) || 0) * (Number(curr.quantity) || 1),
    0
  );
  return { itemCount, subtotal };
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
  const buyerId = (searchParams.get("buyerId") || "").trim();
  const buyerEmail = (searchParams.get("buyerEmail") || "").toLowerCase().trim();
  const sessionId = (searchParams.get("sessionId") || "").trim();

  const primaryKey = buildCartKey(buyerId, buyerEmail, sessionId);
  if (!primaryKey) {
    return NextResponse.json({
      success: true,
      tenantSlug,
      items: [],
      itemCount: 0,
      subtotal: 0,
    });
  }

  try {
    const sql = await getTenantSql(tenantSlug);
    await ensureShopCartsTable(sql, tenantSlug);

    const rows = await sql`
      SELECT * FROM shop_carts
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        AND cart_key = ${primaryKey}
        AND status = 'ACTIVE'
      LIMIT 1;
    `;

    let items = rows.length > 0 ? parseItems(rows[0].items) : [];

    // If user is authenticated AND has a guest session cart, merge guest cart into buyer cart
    const guestKey = sessionId ? `session:${sessionId}` : "";
    if (guestKey && guestKey !== primaryKey) {
      const guestRows = await sql`
        SELECT * FROM shop_carts
        WHERE LOWER(tenant_slug) = ${tenantSlug}
          AND cart_key = ${guestKey}
          AND status = 'ACTIVE'
        LIMIT 1;
      `;
      if (guestRows.length > 0) {
        const guestItems = parseItems(guestRows[0].items);
        if (guestItems.length > 0) {
          items = mergeCartItemLists(items, guestItems);
          const { itemCount, subtotal } = computeTotals(items);
          const cartId = rows[0]?.id || `cart_${tenantSlug}_${Date.now()}`;

          await sql`
            INSERT INTO shop_carts (
              id, tenant_slug, tenant_id, cart_key, buyer_id, buyer_email, session_id,
              items, item_count, subtotal, currency, status, created_at, updated_at
            ) VALUES (
              ${cartId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${primaryKey},
              ${buyerId}, ${buyerEmail}, ${sessionId},
              ${JSON.stringify(items)}::jsonb, ${itemCount}, ${subtotal}, 'NGN', 'ACTIVE', NOW(), NOW()
            )
            ON CONFLICT (tenant_slug, cart_key) DO UPDATE SET
              items = EXCLUDED.items,
              item_count = EXCLUDED.item_count,
              subtotal = EXCLUDED.subtotal,
              buyer_id = COALESCE(NULLIF(EXCLUDED.buyer_id, ''), shop_carts.buyer_id),
              buyer_email = COALESCE(NULLIF(EXCLUDED.buyer_email, ''), shop_carts.buyer_email),
              updated_at = NOW();
          `;

          await sql`
            DELETE FROM shop_carts
            WHERE LOWER(tenant_slug) = ${tenantSlug}
              AND cart_key = ${guestKey};
          `;
        }
      }
    }

    const { itemCount, subtotal } = computeTotals(items);
    return NextResponse.json({
      success: true,
      tenantSlug,
      cartKey: primaryKey,
      items,
      itemCount,
      subtotal,
    });
  } catch (err: any) {
    console.warn(`[Storefront Cart API] GET failed for tenant '${tenantSlug}':`, err.message);
    return NextResponse.json(
      { success: false, error: "Failed to load cart from database: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantSlug = resolveTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const buyerId = String(body.buyerId || "").trim();
    const buyerEmail = String(body.buyerEmail || "").toLowerCase().trim();
    const sessionId = String(body.sessionId || "").trim();
    const cartKey = buildCartKey(buyerId, buyerEmail, sessionId);

    if (!cartKey) {
      return NextResponse.json(
        { success: false, error: "buyerId, buyerEmail, or sessionId is required to persist cart" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureShopCartsTable(sql, tenantSlug);

    const items = Array.isArray(body.items) ? body.items : [];
    const { itemCount, subtotal } = computeTotals(items);
    const cartId = `cart_${tenantSlug}_${Date.now()}`;

    await sql`
      INSERT INTO shop_carts (
        id, tenant_slug, tenant_id, cart_key, buyer_id, buyer_email, session_id,
        items, item_count, subtotal, currency, status, created_at, updated_at
      ) VALUES (
        ${cartId}, ${tenantSlug}, ${`org-${tenantSlug}`}, ${cartKey},
        ${buyerId}, ${buyerEmail}, ${sessionId},
        ${JSON.stringify(items)}::jsonb, ${itemCount}, ${subtotal}, 'NGN', 'ACTIVE', NOW(), NOW()
      )
      ON CONFLICT (tenant_slug, cart_key) DO UPDATE SET
        items = EXCLUDED.items,
        item_count = EXCLUDED.item_count,
        subtotal = EXCLUDED.subtotal,
        buyer_id = COALESCE(NULLIF(EXCLUDED.buyer_id, ''), shop_carts.buyer_id),
        buyer_email = COALESCE(NULLIF(EXCLUDED.buyer_email, ''), shop_carts.buyer_email),
        session_id = COALESCE(NULLIF(EXCLUDED.session_id, ''), shop_carts.session_id),
        status = 'ACTIVE',
        updated_at = NOW();
    `;

    return NextResponse.json({
      success: true,
      tenantSlug,
      cartKey,
      items,
      itemCount,
      subtotal,
    });
  } catch (err: any) {
    console.error("[Storefront Cart API] PUT error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to persist cart: " + err.message },
      { status: 500 }
    );
  }
}

export const POST = PUT;

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantSlug = resolveTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const buyerId = String(searchParams.get("buyerId") || body.buyerId || "").trim();
    const buyerEmail = String(searchParams.get("buyerEmail") || body.buyerEmail || "")
      .toLowerCase()
      .trim();
    const sessionId = String(searchParams.get("sessionId") || body.sessionId || "").trim();
    const cartKey = buildCartKey(buyerId, buyerEmail, sessionId);

    if (!cartKey) {
      return NextResponse.json(
        { success: false, error: "cart identifier is required" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureShopCartsTable(sql, tenantSlug);

    await sql`
      DELETE FROM shop_carts
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        AND cart_key = ${cartKey};
    `;

    return NextResponse.json({
      success: true,
      tenantSlug,
      cartKey,
      items: [],
      itemCount: 0,
      subtotal: 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to clear cart: " + err.message },
      { status: 500 }
    );
  }
}
