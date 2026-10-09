import { NextResponse } from "next/server";
import { getCrmEmailBlasts, createCrmEmailBlast, getCrmSubscribers } from "@/lib/crm-service";
import {
  queueMassEmailCampaign,
  processEmailQueueBatch,
  getTenantSenderProfileById,
  getTenantSmtpSettings,
  SmtpSettings,
} from "@/lib/email-service";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const blasts = await getCrmEmailBlasts(tenantSlug);
    return NextResponse.json({ success: true, blasts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch email blasts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const { dispatchNow = false, recipients = [], ...blastData } = body;

    // Check sender profile / domain
    let effectiveOverride = blastData.senderOverride as Partial<SmtpSettings> | undefined;
    if (
      !effectiveOverride &&
      blastData.senderProfileId &&
      blastData.senderProfileId !== "custom" &&
      blastData.senderProfileId !== "default" &&
      blastData.senderProfileId !== "workspace_primary"
    ) {
      const prof = await getTenantSenderProfileById(tenantSlug, blastData.senderProfileId);
      if (prof) {
        effectiveOverride = {
          provider: prof.provider,
          host: prof.host,
          port: prof.port,
          encryption: prof.encryption,
          fromEmail: prof.fromEmail,
          fromName: prof.fromName,
          username: prof.username,
          password: prof.password,
        };
      }
    }

    // Security check: tenants cannot send marketing blasts from platform domain or platform default relay
    const senderEmailToCheck = (effectiveOverride?.fromEmail || blastData.senderEmail || "").toLowerCase();
    if (tenantSlug !== "platform" && senderEmailToCheck.includes("@ofia.ng")) {
      return NextResponse.json(
        {
          error:
            "Tenants are prohibited from using the platform domain (@ofia.ng) or platform relay for email marketing broadcasts. Please configure your own sender profile or custom domain SMTP.",
        },
        { status: 400 }
      );
    }

    // If dispatchNow is requested, tenant MUST have either effectiveOverride, or a tenant-specific SMTP setting
    if (dispatchNow) {
      const tenantSmtp = await getTenantSmtpSettings(tenantSlug);
      const hasValidTenantSmtp = Boolean(
        tenantSmtp &&
          tenantSmtp.host &&
          tenantSmtp.fromEmail &&
          tenantSlug !== "platform" &&
          !tenantSmtp.fromEmail.toLowerCase().includes("@ofia.ng")
      );

      const hasValidOverride = Boolean(
        effectiveOverride && effectiveOverride.host && effectiveOverride.fromEmail
      );

      if (!hasValidOverride && !hasValidTenantSmtp && tenantSlug !== "platform") {
        return NextResponse.json(
          {
            error:
              "A configured sender profile or custom domain SMTP is required to dispatch blasts. Platform default relay cannot be used by tenants.",
          },
          { status: 400 }
        );
      }
    }

    const blast = await createCrmEmailBlast(tenantSlug, {
      ...blastData,
      senderOverride: effectiveOverride,
      status: dispatchNow ? "SENT" : blastData.scheduledAt ? "SCHEDULED" : "DRAFT",
      sentAt: dispatchNow ? new Date().toISOString() : undefined,
      sentCount: dispatchNow ? blastData.totalRecipients || 100 : 0,
    });

    // If dispatchNow was requested, load subscribers from list if not explicitly provided
    if (dispatchNow) {
      let targetRecipients = recipients;
      if ((!targetRecipients || targetRecipients.length === 0) && blast.listId) {
        const subs = await getCrmSubscribers(tenantSlug, blast.listId);
        if (subs.length > 0) {
          targetRecipients = subs.map((s) => ({
            email: s.email,
            name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email,
            role: "Subscriber",
            company: s.company || "Commercial",
          }));
        }
      }

      if (Array.isArray(targetRecipients) && targetRecipients.length > 0) {
        try {
          await queueMassEmailCampaign({
            tenantSlug,
            recipients: targetRecipients.map((r: any) => ({
              email: r.email,
              name: r.name || "",
              role: r.role || "Prospect",
              department: r.company || "Commercial",
            })),
            subject: blast.subject,
            messageHtml: blast.contentHtml,
            senderOverride: blast.senderOverride,
          });
          await processEmailQueueBatch(20).catch(() => {});
        } catch (qErr) {
          console.warn("Notice: Real-time dispatch queued with warning:", qErr);
        }
      }
    }

    return NextResponse.json({ success: true, blast }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create or schedule blast" }, { status: 500 });
  }
}
