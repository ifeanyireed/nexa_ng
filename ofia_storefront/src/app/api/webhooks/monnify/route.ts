import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const NEON_CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  "postgresql://neondb_owner:npg_YBd2DvyRxTG7@ep-falling-star-b4lrdr76-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

function getSql() {
  try {
    if (NEON_CONNECTION_STRING) {
      return neon(NEON_CONNECTION_STRING);
    }
  } catch (err) {
    console.warn("[Monnify Webhook] Neon SQL warning:", err);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("monnify-signature");
    const secretKey = process.env.MONNIFY_SECRET_KEY || "mock_monnify_secret_key";

    // SHA-512 Hash validation
    const computedHash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    if (process.env.NODE_ENV === "production" && signature !== computedHash) {
      return NextResponse.json({ error: "Invalid Monnify transaction hash" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventData = payload.eventData;

    if (payload.eventType === "SUCCESSFUL_TRANSACTION" && eventData) {
      const paymentReference = eventData.paymentReference || eventData.transactionReference;
      const rawTenant =
        eventData.metaData?.tenantSlug ||
        eventData.metaData?.tenant ||
        request.nextUrl.searchParams.get("tenant");

      if (!rawTenant) {
        return NextResponse.json(
          { error: "tenantSlug is required in metadata for strict multi-tenant isolation" },
          { status: 400 }
        );
      }

      const tenantSlug = rawTenant.toLowerCase().trim();
      const sql = getSql();

      if (sql) {
        await sql`
          UPDATE shop_orders
          SET payment_status = 'PAID',
              status = 'IN_PREPARATION',
              updated_at = NOW()
          WHERE (order_number = ${paymentReference} OR id = ${paymentReference})
            AND LOWER(tenant_slug) = ${tenantSlug}
        `;
      }

      return NextResponse.json({ status: true, reference: paymentReference, tenantSlug });
    }

    return NextResponse.json({ status: true, received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Monnify processing failed: " + err.message },
      { status: 500 }
    );
  }
}
