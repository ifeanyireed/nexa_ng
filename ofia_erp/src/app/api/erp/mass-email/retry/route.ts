import { NextResponse } from "next/server";
import { retryFailedCampaignEmails } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required to retry failed emails" },
        { status: 400 }
      );
    }

    const result = await retryFailedCampaignEmails(campaignId);

    return NextResponse.json({
      success: true,
      message: `Re-queued ${result.retriedCount} failed email(s) for immediate background delivery.`,
      retriedCount: result.retriedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retry campaign emails" },
      { status: 500 }
    );
  }
}
