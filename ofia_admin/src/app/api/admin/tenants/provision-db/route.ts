import { NextRequest, NextResponse } from "next/server";
import { bootstrapDedicatedTenantSchema, testDatabaseConnection } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { databaseUrl } = body;

    if (!databaseUrl || !databaseUrl.trim()) {
      return NextResponse.json(
        { success: false, error: "databaseUrl is required" },
        { status: 400 }
      );
    }

    // 1. Verify connection first
    const ping = await testDatabaseConnection(databaseUrl.trim());
    if (!ping.success) {
      return NextResponse.json(
        { success: false, error: "Cannot connect to database: " + ping.error },
        { status: 400 }
      );
    }

    // 2. Provision all commerce schemas
    const bootstrap = await bootstrapDedicatedTenantSchema(databaseUrl.trim());
    return NextResponse.json({
      success: bootstrap.success,
      message: bootstrap.message,
      ping,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to provision dedicated schema: " + err.message },
      { status: 500 }
    );
  }
}
