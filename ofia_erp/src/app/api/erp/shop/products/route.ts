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
  const tenantSlug = searchParams.get("tenant") || searchParams.get("slug");
  const vertical = searchParams.get("vertical") as VerticalKey | null;

  try {
    const products = await getErpProducts(tenantSlug || undefined, vertical || undefined);
    return NextResponse.json({
      success: true,
      count: products.length,
      tenantSlug: tenantSlug || null,
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

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const tenantSlug = searchParams.get("tenant") || searchParams.get("slug");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Product id is required" },
      { status: 400 }
    );
  }

  try {
    const deleted = await deleteErpProduct(id, tenantSlug || undefined);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product: " + err.message },
      { status: 500 }
    );
  }
}
