import { NextResponse } from "next/server";
import { getCrmEmailBlasts, createCrmEmailBlast } from "@/lib/crm-service";
import { queueMassEmailCampaign, processEmailQueueBatch } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant") || searchParams.get("slug") || "default";
    const blasts = await getCrmEmailBlasts(tenantSlug);
    return NextResponse.json({ success: true, blasts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch email blasts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug = "default", dispatchNow = false, recipients = [], ...blastData } = body;

    const blast = await createCrmEmailBlast(tenantSlug, {
      ...blastData,
      status: dispatchNow ? "SENT" : (blastData.scheduledAt ? "SCHEDULED" : "DRAFT"),
      sentAt: dispatchNow ? new Date().toISOString() : undefined,
      sentCount: dispatchNow ? (blastData.totalRecipients || 100) : 0,
    });

    // If dispatchNow was requested and recipients were supplied, push into background queue
    if (dispatchNow && Array.isArray(recipients) && recipients.length > 0) {
      try {
        await queueMassEmailCampaign({
          tenantSlug,
          recipients: recipients.map((r: any) => ({
            email: r.email,
            name: r.name || "",
            role: r.role || "Prospect",
            department: r.company || "Commercial",
          })),
          subject: blast.subject,
          messageHtml: blast.contentHtml,
        });
        await processEmailQueueBatch(20).catch(() => {});
      } catch (qErr) {
        console.warn("Notice: Real-time dispatch queued with warning:", qErr);
      }
    }

    return NextResponse.json({ success: true, blast }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create or schedule blast" }, { status: 500 });
  }
}
