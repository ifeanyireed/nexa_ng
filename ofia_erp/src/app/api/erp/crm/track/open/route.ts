import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

const transparent1x1GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";

    // Forward telemetry asynchronously to ERP service without blocking user
    if (token) {
      fetch(`${ERP_BASE}/crm/track/open?token=${encodeURIComponent(token)}`, {
        cache: "no-store",
      }).catch(() => {});
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
