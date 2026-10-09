import { NextResponse } from "next/server";
import {
  queueMassEmailCampaign,
  processEmailQueueBatch,
  getCampaignProgress,
  getCampaignDetailsWithRecipients,
  listTenantCampaigns,
  MassEmailRecipient,
} from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, recipients, subject, messageHtml, loginUrl, senderProfileId, senderOverride } = body;

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

    const validRecipients: MassEmailRecipient[] = recipients
      .filter((r: any) => r && r.email && typeof r.email === "string" && r.email.includes("@"))
      .map((r: any) => ({
        email: r.email.trim(),
        name: r.name || r.fullName || "",
        role: r.role || "",
        department: r.department || "",
      }));

    if (validRecipients.length === 0) {
      return NextResponse.json(
        { error: "None of the selected recipients have a valid email address" },
        { status: 400 }
      );
    }

    // 1. Queue the campaign into database
    const queued = await queueMassEmailCampaign({
      tenantSlug,
      recipients: validRecipients,
      subject: subject.trim(),
      messageHtml,
      loginUrl,
      senderProfileId,
      senderOverride,
    });

    // 2. Immediately dispatch the first batch in this request (e.g., up to 20 emails)
    // so user gets instant progress without waiting 60s for the next cron cycle
    let initialSent = 0;
    let initialFailed = 0;
    try {
      const firstBatch = await processEmailQueueBatch(20);
      initialSent = firstBatch.sent;
      initialFailed = firstBatch.failed;
    } catch (procErr) {
      console.warn("Notice: Initial batch processing error, cron worker will retry:", procErr);
    }

    const currentStatus = await getCampaignProgress(queued.campaignId);

    return NextResponse.json({
      success: true,
      message: `Mass email campaign queued (${queued.total} recipients). ${initialSent} sent immediately; remaining are processing in background.`,
      campaignId: queued.campaignId,
      total: queued.total,
      sent: currentStatus?.sent ?? initialSent,
      failed: currentStatus?.failed ?? initialFailed,
      pending: currentStatus?.pending ?? (queued.total - (initialSent + initialFailed)),
      status: currentStatus?.status || "processing",
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
    const tenantSlug = searchParams.get("tenantSlug");
    const details = searchParams.get("details") === "true";

    // 1. Fetch campaigns list for workspace
    if (tenantSlug && !campaignId) {
      const limit = Number(searchParams.get("limit")) || 50;
      const campaigns = await listTenantCampaigns(tenantSlug, limit);

      // Accelerate background processing if there are queued/processing campaigns
      const hasActive = campaigns.some(
        (c) => c.status === "queued" || c.status === "processing" || (c.sent + c.failed < c.total)
      );
      if (hasActive) {
        processEmailQueueBatch(25).catch((err) => {
          console.warn("Background auto-drain error on campaigns GET:", err);
        });
      }

      return NextResponse.json({
        success: true,
        campaigns,
      });
    }

    // 2. Fetch specific campaign details (with all recipients)
    if (campaignId) {
      if (details) {
        const fullCampaign = await getCampaignDetailsWithRecipients(campaignId);
        if (!fullCampaign) {
          return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 }
          );
        }

        if (fullCampaign.status === "queued" || fullCampaign.status === "processing" || fullCampaign.pending > 0) {
          processEmailQueueBatch(25).catch((err) => {
            console.warn("Background auto-drain error on details GET:", err);
          });
        }

        return NextResponse.json({
          success: true,
          campaign: fullCampaign,
        });
      }

      // Fast progress summary
      const progress = await getCampaignProgress(campaignId);
      if (!progress) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }

      if (progress.status === "queued" || progress.status === "processing" || progress.pending > 0) {
        processEmailQueueBatch(25).catch((err) => {
          console.warn("Background auto-drain error on progress GET:", err);
        });
      }

      return NextResponse.json({
        success: true,
        campaign: progress,
      });
    }

    return NextResponse.json(
      { error: "Query parameter campaignId or tenantSlug is required" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve campaign data" },
      { status: 500 }
    );
  }
}
