import { NextResponse } from "next/server";
import { testPlatformSmtpConnection, SmtpConfigParams } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail || !testEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid recipient test email is required" },
        { status: 400 }
      );
    }

    if (!body.host || !body.fromEmail) {
      return NextResponse.json(
        { error: "Host and From Email are required to test SMTP connection" },
        { status: 400 }
      );
    }

    const config: SmtpConfigParams = {
      provider: body.provider || "brevo",
      host: body.host.trim(),
      port: Number(body.port) || 587,
      encryption: body.encryption || "tls",
      fromEmail: body.fromEmail.trim(),
      fromName: body.fromName ? body.fromName.trim() : "Ofia Platform Root Security",
      username: body.username ? body.username.trim() : body.fromEmail.trim(),
      password: body.password || "",
    };

    const result = await testPlatformSmtpConnection(config, testEmail.trim());

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Platform SMTP test failed: " + err.message },
      { status: 500 }
    );
  }
}
