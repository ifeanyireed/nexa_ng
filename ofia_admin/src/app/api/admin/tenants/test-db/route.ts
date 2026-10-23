import { NextRequest, NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/tenant-db-resolver";

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

    const result = await testDatabaseConnection(databaseUrl.trim());
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Connection diagnostic error: " + err.message },
      { status: 500 }
    );
  }
}
