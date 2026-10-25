import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const NEON_CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  "";

export async function GET() {
  try {
    const sql = neon(NEON_CONNECTION_STRING);

    // 1. Platform Totals
    const [totals] = await sql`
      SELECT
        COALESCE(SUM(raw_amount), 0) as total_gmv,
        COUNT(*)::int as total_orders,
        COALESCE(SUM(CASE WHEN is_escrow = TRUE AND escrow_status = 'HELD' THEN raw_amount ELSE 0 END), 0) as active_escrow,
        COALESCE(SUM(CASE WHEN is_escrow = TRUE AND escrow_status = 'RELEASED' THEN raw_amount ELSE 0 END), 0) as released_escrow,
        COALESCE(SUM(CASE WHEN (is_escrow IS FALSE OR is_escrow IS NULL) AND payment_status = 'PAID' THEN raw_amount ELSE 0 END), 0) as direct_settlement
      FROM shop_orders;
    `;

    // 2. Leaderboard by Tenant
    const tenantLeaderboard = await sql`
      SELECT
        tenant_slug,
        COUNT(*)::int as order_count,
        COALESCE(SUM(raw_amount), 0) as gmv,
        COALESCE(SUM(raw_amount) * 0.015, 0) as commission,
        MAX(created_at) as last_order_at
      FROM shop_orders
      GROUP BY tenant_slug
      ORDER BY gmv DESC
      LIMIT 20;
    `;

    // 3. Breakdown by Channel
    const channels = await sql`
      SELECT
        channel,
        COUNT(*)::int as order_count,
        COALESCE(SUM(raw_amount), 0) as gmv
      FROM shop_orders
      GROUP BY channel
      ORDER BY gmv DESC;
    `;

    // 4. Global Recent Orders Feed
    const recentOrders = await sql`
      SELECT
        id, order_number, tenant_slug, customer_name, channel, status,
        payment_status, total_amount, raw_amount, created_at
      FROM shop_orders
      ORDER BY created_at DESC
      LIMIT 10;
    `;

    const rawGmv = Number(totals?.total_gmv) || 0;
    const platformCommission = rawGmv * 0.015; // 1.5% platform fee

    return NextResponse.json({
      success: true,
      metrics: {
        totalGmv: rawGmv,
        formattedGmv: `₦${rawGmv.toLocaleString()}`,
        totalOrders: Number(totals?.total_orders) || 0,
        activeEscrow: Number(totals?.active_escrow) || 0,
        formattedActiveEscrow: `₦${Number(totals?.active_escrow || 0).toLocaleString()}`,
        releasedEscrow: Number(totals?.released_escrow) || 0,
        formattedReleasedEscrow: `₦${Number(totals?.released_escrow || 0).toLocaleString()}`,
        directSettlement: Number(totals?.direct_settlement) || 0,
        formattedDirectSettlement: `₦${Number(totals?.direct_settlement || 0).toLocaleString()}`,
        platformCommission: platformCommission,
        formattedCommission: `₦${platformCommission.toLocaleString()}`,
        commissionRate: "1.5%",
      },
      tenantLeaderboard: tenantLeaderboard.map((t) => ({
        tenantSlug: t.tenant_slug,
        orderCount: Number(t.order_count),
        gmv: Number(t.gmv),
        formattedGmv: `₦${Number(t.gmv).toLocaleString()}`,
        commission: Number(t.commission),
        formattedCommission: `₦${Number(t.commission).toLocaleString()}`,
        lastOrderAt: t.last_order_at,
      })),
      channelBreakdown: channels.map((c) => ({
        channel: c.channel,
        orderCount: Number(c.order_count),
        gmv: Number(c.gmv),
        formattedGmv: `₦${Number(c.gmv).toLocaleString()}`,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        tenantSlug: o.tenant_slug,
        customerName: o.customer_name,
        channel: o.channel,
        status: o.status,
        paymentStatus: o.payment_status,
        totalAmount: o.total_amount,
        createdAt: o.created_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to generate commerce analytics: " + err.message },
      { status: 500 }
    );
  }
}
