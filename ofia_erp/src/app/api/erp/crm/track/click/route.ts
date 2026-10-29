import { NextResponse } from "next/server";
import { processEmailEngagement } from "@/lib/crm-email-engagement";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";
    const targetUrl = url.searchParams.get("url") || "https://ofia.ng";

    if (token) {
      // Process click engagement directly on tenant DB with strict deduplication check.
      // Must be awaited before redirecting so the DB transaction completes.
      try {
        await processEmailEngagement(token, "CLICK", targetUrl);
      } catch (err) {
        console.warn("[CRM Track Click] Direct process error:", err);
      }

      // Also forward click event to ERP backend
      if (ERP_BASE) {
        fetch(
          `${ERP_BASE}/crm/track/click?token=${encodeURIComponent(token)}&url=${encodeURIComponent(targetUrl)}`,
          { cache: "no-store" }
        ).catch(() => {});
      }
    }

    return NextResponse.redirect(targetUrl, 302);
  } catch {
    return NextResponse.redirect("https://ofia.ng", 302);
  }
}
