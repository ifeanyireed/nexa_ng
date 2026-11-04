import { NextRequest, NextResponse } from "next/server";
import {
  getErpServices,
  saveErpService,
  deleteErpService,
} from "@/lib/commerce-services-store";
import { VerticalKey, VERTICAL_DEFINITIONS } from "@/lib/verticals";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");
  const verticalParam = searchParams.get("vertical") as VerticalKey | null;

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for multi-tenant isolation" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();
  const validVertical = verticalParam && verticalParam in VERTICAL_DEFINITIONS ? verticalParam : undefined;

  try {
    const services = await getErpServices(tenantSlug, validVertical);
    return NextResponse.json({
      success: true,
      tenantSlug,
      vertical: validVertical || null,
      count: services.length,
      services,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch ERP shop services: " + err.message },
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
        { success: false, error: "tenantSlug is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Service title is required" },
        { status: 400 }
      );
    }

    const tenantSlug = rawTenant.toLowerCase().trim();
    const vertical: VerticalKey = body.vertical && body.vertical in VERTICAL_DEFINITIONS ? body.vertical : "retail";

    const saved = await saveErpService({
      ...body,
      tenantSlug,
      vertical,
    });

    return NextResponse.json({ success: true, service: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create service: " + err.message },
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
        { success: false, error: "tenantSlug is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Service id is required for update" },
        { status: 400 }
      );
    }

    const tenantSlug = rawTenant.toLowerCase().trim();
    const vertical: VerticalKey = body.vertical && body.vertical in VERTICAL_DEFINITIONS ? body.vertical : "retail";

    const updated = await saveErpService({
      ...body,
      tenantSlug,
      vertical,
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update service: " + err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const rawTenant = searchParams.get("tenant") || searchParams.get("slug") || request.headers.get("x-tenant-slug");

    if (!id || !rawTenant) {
      return NextResponse.json(
        { success: false, error: "id and tenant are required for deletion" },
        { status: 400 }
      );
    }

    const tenantSlug = rawTenant.toLowerCase().trim();
    const deleted = await deleteErpService(id, tenantSlug);

    return NextResponse.json({ success: deleted, id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete service: " + err.message },
      { status: 500 }
    );
  }
}
