import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_FINTECH_PARTNER_TARGETS,
  sendFintechComplianceInquiryEmails,
} from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shouldSend = searchParams.get("send") === "true";
  const replyTo = (searchParams.get("replyTo") || "ifeanyireed@gmail.com").trim();

  if (!shouldSend) {
    return NextResponse.json({
      success: true,
      replyTo,
      targets: DEFAULT_FINTECH_PARTNER_TARGETS,
      hint: "POST to this endpoint or pass ?send=true to dispatch the regulatory licensing & compliance RFP emails.",
    });
  }

  const outcome = await sendFintechComplianceInquiryEmails({
    replyToEmail: replyTo,
    ccSenderCopy: true,
  });

  return NextResponse.json(outcome, { status: outcome.success ? 200 : 207 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const replyTo = String(body.replyTo || "ifeanyireed@gmail.com").trim();
    const targets = Array.isArray(body.targets) ? body.targets : undefined;

    const outcome = await sendFintechComplianceInquiryEmails({
      targets,
      replyToEmail: replyTo,
      ccSenderCopy: body.ccSenderCopy !== false,
    });

    return NextResponse.json(outcome, { status: outcome.success ? 200 : 207 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to dispatch partner compliance inquiry emails" },
      { status: 500 }
    );
  }
}
