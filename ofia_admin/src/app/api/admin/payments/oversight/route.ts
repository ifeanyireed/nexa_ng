import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { MASTER_REGISTRY_URL, getTenantSql } from "@/lib/tenant-db-resolver";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    if (!MASTER_REGISTRY_URL) {
      return NextResponse.json(
        { success: false, error: "MASTER_REGISTRY_URL is not configured" },
        { status: 500 }
      );
    }

    const masterSql = neon(MASTER_REGISTRY_URL);
    const tenants = await masterSql`
      SELECT slug, name, domain, vertical, status
      FROM platform_tenants
      WHERE status = 'ACTIVE' OR status IS NULL
      ORDER BY slug ASC
      LIMIT 50;
    `;

    const allEscrowCases: any[] = [];
    const allDisputes: any[] = [];
    const allWebhookEvents: any[] = [];
    const allRefunds: any[] = [];
    const reconciliationExceptions: any[] = [];

    let totalFundsHeldByProvider = 0;
    let totalReleases = 0;
    let totalRefunds = 0;
    let outstandingDisputes = 0;

    for (const t of tenants) {
      const slug = (t.slug || "").toLowerCase().trim();
      if (!slug) continue;

      try {
        const tenantSql = await getTenantSql(slug);
        if (!tenantSql) continue;

        const [cases, disputes, webhooks, refunds] = await Promise.all([
          tenantSql`
            SELECT * FROM escrow_cases
            WHERE LOWER(tenant_slug) = ${slug}
            ORDER BY created_at DESC
            LIMIT 50;
          `.catch(() => []),
          tenantSql`
            SELECT * FROM escrow_disputes
            WHERE LOWER(tenant_slug) = ${slug}
            ORDER BY created_at DESC
            LIMIT 50;
          `.catch(() => []),
          tenantSql`
            SELECT id, event_id, provider, event_type, normalized_event, tenant_slug,
                   order_number, provider_reference, signature_valid, status, error_message,
                   created_at, processed_at
            FROM payment_webhook_events
            WHERE LOWER(tenant_slug) = ${slug}
            ORDER BY created_at DESC
            LIMIT 50;
          `.catch(() => []),
          tenantSql`
            SELECT * FROM payment_refunds
            WHERE LOWER(tenant_slug) = ${slug}
            ORDER BY created_at DESC
            LIMIT 50;
          `.catch(() => []),
        ]);

        for (const c of cases) {
          allEscrowCases.push({ ...c, tenantName: t.name });
          const net = Number(c.merchant_net_amount || c.gross_amount || 0);
          if (
            ["funded", "held", "awaiting_fulfilment", "awaiting_buyer_confirmation", "release_eligible", "release_pending"].includes(
              c.status
            )
          ) {
            totalFundsHeldByProvider += net;
          } else if (c.status === "released") {
            totalReleases += net;
          } else if (c.status === "refunded") {
            totalRefunds += net;
          }
        }

        for (const d of disputes) {
          allDisputes.push({ ...d, tenantName: t.name });
          if (d.status === "OPEN" || d.status === "UNDER_REVIEW") {
            outstandingDisputes++;
          }
        }

        for (const w of webhooks) {
          allWebhookEvents.push({ ...w, tenantName: t.name });
          if (w.status === "FAILED" || w.status === "DEAD_LETTER") {
            reconciliationExceptions.push({
              id: w.id,
              tenantSlug: slug,
              tenantName: t.name,
              provider: w.provider,
              reference: w.provider_reference,
              issue: w.error_message || `Webhook ${w.status}`,
              createdAt: w.created_at,
            });
          }
        }

        for (const r of refunds) {
          allRefunds.push({ ...r, tenantName: t.name });
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      overview: {
        providerAccountStatus: "OPERATIONAL",
        totalFundsHeldByProvider,
        totalReleases,
        totalRefunds,
        outstandingDisputes,
        reconciliationDifferencesCount: reconciliationExceptions.length,
        currency: "NGN",
      },
      escrowCases: allEscrowCases,
      disputes: allDisputes,
      webhookEvents: allWebhookEvents,
      refunds: allRefunds,
      reconciliationExceptions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load Super Admin payment oversight: " + err.message },
      { status: 500 }
    );
  }
}
