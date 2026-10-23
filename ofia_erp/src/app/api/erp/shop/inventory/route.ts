import { NextRequest, NextResponse } from "next/server";
import {
  getTenantInventory,
  getLowStockAlerts,
  restockInventoryItem,
} from "@/lib/commerce-inventory-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant inventory" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();
  const alertsOnly = searchParams.get("alerts") === "true";

  try {
    if (alertsOnly) {
      const alerts = await getLowStockAlerts(tenantSlug);
      return NextResponse.json({ success: true, tenantSlug, count: alerts.length, alerts });
    }

    const inventory = await getTenantInventory(tenantSlug);
    const alerts = inventory.filter(
      (i) => i.currentStock <= i.minStock || i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK"
    );

    // Compute valuation strictly for this tenant
    const totalValuation = inventory.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0);

    return NextResponse.json({
      success: true,
      tenantSlug,
      count: inventory.length,
      valuation: totalValuation,
      alertsCount: alerts.length,
      alerts,
      inventory,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawTenant = body.tenantSlug || request.headers.get("x-tenant-slug");

    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required for multi-tenant restocking" },
        { status: 400 }
      );
    }

    const cleanSlug = rawTenant.toLowerCase().trim();
    const { sku, quantity = 10 } = body;

    if (!sku) {
      return NextResponse.json(
        { success: false, error: "sku is required for restocking" },
        { status: 400 }
      );
    }

    const updated = await restockInventoryItem(sku, cleanSlug, Number(quantity) || 10);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Item with SKU "${sku}" not found for tenant "${cleanSlug}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tenantSlug: cleanSlug, item: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Restock failed: " + err.message },
      { status: 500 }
    );
  }
}
