import { NextRequest, NextResponse } from "next/server";
import {
  getStorefrontProducts,
  saveStorefrontProduct,
  deleteStorefrontProduct,
} from "@/lib/commerce-products-store";
import { VerticalType } from "@/types/storefront";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get("tenant") || searchParams.get("slug");
  const vertical = searchParams.get("vertical") as VerticalType | null;

  try {
    const result = await getStorefrontProducts(
      tenantSlug || undefined,
      vertical || undefined
    );

    if (result.dbError || result.error === "Connect to Internet") {
      return NextResponse.json(
        {
          success: false,
          error: "Connect to Internet",
          message: "Unable to reach database. Connect to Internet.",
          dbError: true,
          products: [],
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      tenantSlug: tenantSlug || null,
      vertical: vertical || null,
      count: result.products.length,
      isLiveMerchantCatalog: result.isLiveMerchantCatalog,
      products: result.products,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Connect to Internet",
        message: err.message || "Failed to fetch products",
        dbError: true,
        products: [],
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawTenant = body.tenantSlug || body.storeSlug || request.headers.get("x-tenant-slug");

    if (!rawTenant) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!body.title || !body.price || !body.vertical) {
      return NextResponse.json(
        { success: false, error: "title, price, and vertical are required" },
        { status: 400 }
      );
    }

    const saved = await saveStorefrontProduct({
      ...body,
      storeSlug: rawTenant.toLowerCase().trim(),
    });

    return NextResponse.json({
      success: true,
      product: saved,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to save product: " + err.message },
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

  try {
    const deleted = await deleteStorefrontProduct(id, rawTenant.toLowerCase().trim());
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product: " + err.message },
      { status: 500 }
    );
  }
}
