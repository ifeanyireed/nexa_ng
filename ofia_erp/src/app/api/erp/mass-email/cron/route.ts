import { NextResponse } from "next/server";
import { processEmailQueueBatch } from "@/lib/email-service";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow full minute for batch dispatch on serverless

async function handleCronWorker(request: Request) {
  try {
    // Optional CRON_SECRET verification (supported by Vercel Cron and standard cron services)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      const customHeader = request.headers.get("x-cron-secret");
      const token = authHeader?.replace(/^Bearer\s+/i, "") || customHeader;

      if (token !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
      }
    }

    // Process up to 50 pending emails per cron tick in batches of 25
    let totalProcessed = 0;
    let totalSent = 0;
    let totalFailed = 0;
    const allErrors: Array<{ email: string; error: string }> = [];

    let batch = await processEmailQueueBatch(25);
    totalProcessed += batch.processed;
    totalSent += batch.sent;
    totalFailed += batch.failed;
    allErrors.push(...batch.errors);

    // If more pending items remain and previous batch had work, do a second sub-batch
    if (batch.remainingPending > 0 && batch.processed > 0) {
      const secondBatch = await processEmailQueueBatch(25);
      totalProcessed += secondBatch.processed;
      totalSent += secondBatch.sent;
      totalFailed += secondBatch.failed;
      allErrors.push(...secondBatch.errors);
      batch.remainingPending = secondBatch.remainingPending;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: totalProcessed,
      sent: totalSent,
      failed: totalFailed,
      remainingPending: batch.remainingPending,
      remainingRateLimited: batch.remainingRateLimited || 0,
      errors: allErrors.slice(0, 10),
    });
  } catch (err: any) {
    console.error("Cron email worker error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Cron worker execution failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleCronWorker(request);
}

export async function POST(request: Request) {
  return handleCronWorker(request);
}
