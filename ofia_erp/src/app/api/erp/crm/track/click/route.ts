import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";
    const targetUrl = url.searchParams.get("url") || "https://ofia.ng";

    // Forward click event to ERP backend
    if (token) {
      fetch(
        `${ERP_BASE}/crm/track/click?token=${encodeURIComponent(token)}&url=${encodeURIComponent(targetUrl)}`,
        { cache: "no-store" }
      ).catch(() => {});
    }

    return NextResponse.redirect(targetUrl, 302);
  } catch {
    return NextResponse.redirect("https://ofia.ng", 302);
  }
}
