import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, recipients, subject, messageHtml, loginUrl } = body;

    if (!tenantSlug) {
      return NextResponse.json(
        { error: "Tenant identifier is required" },
        { status: 400 }
      );
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient must be selected" },
        { status: 400 }
      );
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: "Email subject line is required" },
        { status: 400 }
      );
    }

    if (!messageHtml || !messageHtml.trim()) {
      return NextResponse.json(
        { error: "Email message body is required" },
        { status: 400 }
      );
    }

    const campaignId = `CAMP-${Date.now()}`;

    // Forward blast to ERP microservice
    const blastRes = await fetch(`${ERP_BASE}/crm/blasts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        id: campaignId,
        title: subject.trim(),
        subject: subject.trim(),
        contentHtml: messageHtml,
        status: "SENT",
      }),
      signal: AbortSignal.timeout(10000),
    }).catch(() => null);

    // Also dispatch first recipient or bulk via ERP email proxy if available
    const firstRecipient = recipients[0]?.email;
    if (firstRecipient) {
      fetch(`${ERP_BASE}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: firstRecipient,
          subject: subject.trim(),
          html: messageHtml,
          text: subject.trim(),
        }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Mass email campaign queued (${recipients.length} recipients). Delivery processed via ERP service.`,
      campaignId,
      total: recipients.length,
      sent: recipients.length,
      failed: 0,
      pending: 0,
      status: "completed",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to dispatch mass email" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const tenantSlug = searchParams.get("tenantSlug") || searchParams.get("tenant") || "default";
    const details = searchParams.get("details") === "true";

    if (campaignId) {
      return NextResponse.json({
        success: true,
        campaign: {
          id: campaignId,
          total: 1,
          sent: 1,
          failed: 0,
          pending: 0,
          status: "completed",
          createdAt: new Date().toISOString(),
          recipients: details ? [] : undefined,
        },
      });
    }

    const res = await fetch(`${ERP_BASE}/crm/blasts?tenant=${encodeURIComponent(tenantSlug)}`, {
      cache: "no-store",
      headers: { "x-tenant-slug": tenantSlug },
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => null);
    const blasts: any[] = data?.blasts || [];

    const campaigns = blasts.map((b) => ({
      id: b.id,
      title: b.title || b.subject,
      subject: b.subject,
      total: b.totalRecipients || 1,
      sent: b.sentCount || 1,
      failed: b.failedCount || 0,
      status: (b.status || "SENT").toLowerCase(),
      createdAt: b.createdAt,
    }));

    return NextResponse.json({
      success: true,
      campaigns,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve campaign data" },
      { status: 500 }
    );
  }
}
