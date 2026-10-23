import { NextRequest, NextResponse } from "next/server";
import { subscribeCommerceEvents, CommerceStreamEvent } from "@/lib/commerce-event-hub";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawTenant =
    searchParams.get("tenant") ||
    searchParams.get("slug") ||
    request.headers.get("x-tenant-slug");

  if (!rawTenant) {
    return NextResponse.json(
      { success: false, error: "tenant parameter is required for real-time SSE stream" },
      { status: 400 }
    );
  }

  const tenantSlug = rawTenant.toLowerCase().trim();
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial connection payload
      const initialPayload = JSON.stringify({
        type: "CONNECTED",
        tenantSlug,
        timestamp: new Date().toISOString(),
        message: `Connected to live multi-tenant commerce event stream for ${tenantSlug}`,
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      // 2. Subscribe to in-process commerce events partitioned strictly by tenantSlug
      unsubscribe = subscribeCommerceEvents(tenantSlug, (event: CommerceStreamEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Controller might be closed
        }
      });

      // 3. Keep-alive heartbeat every 15 seconds
      heartbeatTimer = setInterval(() => {
        try {
          const pingPayload = JSON.stringify({
            type: "HEARTBEAT",
            tenantSlug,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${pingPayload}\n\n`));
        } catch {
          // Controller closed
        }
      }, 15000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    },
  });

  // Handle client disconnect
  request.signal.addEventListener("abort", () => {
    if (unsubscribe) unsubscribe();
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
