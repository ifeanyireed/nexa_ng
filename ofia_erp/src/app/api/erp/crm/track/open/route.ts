import { NextResponse } from "next/server";
import { processEmailEngagement } from "@/lib/crm-email-engagement";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "";

const transparent1x1GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";

    if (token) {
      // Process open engagement directly on tenant DB with strict deduplication check
      processEmailEngagement(token, "OPEN").catch((err) =>
        console.warn("[CRM Track Open] Direct process error:", err)
      );

      // Also forward telemetry asynchronously to ERP microservice if reachable
      if (ERP_BASE) {
        fetch(`${ERP_BASE}/crm/track/open?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        }).catch(() => {});
      }
    }

    return new NextResponse(transparent1x1GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate, private, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch {
    return new NextResponse(transparent1x1GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
      },
    });
  }
}
