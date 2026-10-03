import { NextResponse } from "next/server";
import { sendMassEmailToRecipients, MassEmailRecipient } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantSlug, recipients, subject, messageHtml, loginUrl, senderOverride } = body;

    if (!tenantSlug) {
      return NextResponse.json(
        { error: "Tenant identifier is required" },
        { status: 400 }
      );
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient must be selected" },
        { status: 400 }
      );
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: "Email subject line is required" },
        { status: 400 }
      );
    }

    if (!messageHtml || !messageHtml.trim()) {
      return NextResponse.json(
        { error: "Email message body is required" },
        { status: 400 }
      );
    }

    const validRecipients: MassEmailRecipient[] = recipients
      .filter((r: any) => r && r.email && typeof r.email === "string" && r.email.includes("@"))
      .map((r: any) => ({
        email: r.email.trim(),
        name: r.name || r.fullName || "",
        role: r.role || "",
        department: r.department || "",
      }));

    if (validRecipients.length === 0) {
      return NextResponse.json(
        { error: "None of the selected recipients have a valid email address" },
        { status: 400 }
      );
    }

    const result = await sendMassEmailToRecipients({
      tenantSlug,
      recipients: validRecipients,
      subject: subject.trim(),
      messageHtml,
      loginUrl,
      senderOverride,
    });

    return NextResponse.json({
      success: true,
      message: `Mass email dispatch complete. Successfully sent: ${result.sent}/${result.total}.`,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to dispatch mass email" },
      { status: 500 }
    );
  }
}
