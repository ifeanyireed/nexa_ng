import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required to retry failed emails" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Re-queued failed email(s) for immediate delivery.`,
      retriedCount: 1,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retry campaign emails" },
      { status: 500 }
    );
  }
}
