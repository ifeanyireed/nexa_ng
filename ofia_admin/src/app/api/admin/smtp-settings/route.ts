import { NextResponse } from "next/server";
import {
  getPlatformSmtpDetailed,
  savePlatformSmtpSettings,
  SmtpConfigParams,
} from "@/lib/email-service";

export async function GET() {
  try {
    const details = await getPlatformSmtpDetailed();
    return NextResponse.json({
      success: true,
      data: details,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to retrieve platform SMTP settings: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.host || !body.fromEmail) {
      return NextResponse.json(
        { error: "Host and From Email are required to configure Platform SMTP" },
        { status: 400 }
      );
    }

    const payload: SmtpConfigParams = {
      provider: body.provider || "brevo",
      host: body.host.trim(),
      port: Number(body.port) || 587,
      encryption: body.encryption || "tls",
      fromEmail: body.fromEmail.trim(),
      fromName: body.fromName ? body.fromName.trim() : "Ofia Platform Root Security",
      username: body.username ? body.username.trim() : body.fromEmail.trim(),
      password: body.password || "",
    };

    const saved = await savePlatformSmtpSettings(payload);
    if (!saved) {
      return NextResponse.json(
        { error: "Failed to store Platform SMTP configuration in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Platform SMTP configuration successfully persisted to Postgres database",
      data: {
        provider: payload.provider,
        host: payload.host,
        port: payload.port,
        encryption: payload.encryption,
        fromEmail: payload.fromEmail,
        fromName: payload.fromName,
        username: payload.username,
        hasPassword: Boolean(payload.password && payload.password.length > 0),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process Platform SMTP update: " + err.message },
      { status: 500 }
    );
  }
}
