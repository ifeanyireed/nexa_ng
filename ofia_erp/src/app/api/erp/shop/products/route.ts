import { NextRequest, NextResponse } from "next/server";
import {
  getErpProducts,
  saveErpProduct,
  deleteErpProduct,
} from "@/lib/commerce-products-store";
import { VerticalKey } from "@/lib/verticals";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");
  const vertical = searchParams.get("vertical") as VerticalKey | null;

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();

  try {
    const products = await getErpProducts(tenantSlug, vertical || undefined);
    return NextResponse.json({
      success: true,
      count: products.length,
      tenantSlug,
      vertical: vertical || null,
      products,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch ERP shop products: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name && !body.title) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!body.tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenantSlug is required" },
        { status: 400 }
      );
    }

    const saved = await saveErpProduct(body);

    return NextResponse.json({
      success: true,
      product: saved,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to save ERP shop product: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const rawTenant = body.tenantSlug || request.headers.get("x-tenant-slug");

    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!body.id && !body.sku) {
      return NextResponse.json(
        { success: false, error: "Product id or sku is required for update" },
        { status: 400 }
      );
    }

    const tenantSlug = rawTenant.toLowerCase().trim();
    const updated = await saveErpProduct({
      ...body,
      tenantSlug,
      vertical: body.vertical || "retail",
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update product: " + err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Product id is required" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();

  try {
    const deleted = await deleteErpProduct(id, tenantSlug);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product: " + err.message },
      { status: 500 }
    );
  }
}
