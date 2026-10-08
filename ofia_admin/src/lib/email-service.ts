import nodemailer from "nodemailer";
import { executeQuery } from "./db";

export interface PasswordResetEmailParams {
  recipientEmail: string;
  recipientName?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

interface SmtpDbRow {
  tenant_slug: string;
  provider: string;
  host: string;
  port: number;
  encryption: string;
  from_email: string;
  from_name: string;
  username: string;
  password: string;
}

export async function getPlatformSmtpConfig() {
  // 1. Try fetching platform-level settings from Neon Postgres (tenant_smtp_settings)
  try {
    const rows = await executeQuery<SmtpDbRow[]>(
      `SELECT * FROM tenant_smtp_settings WHERE tenant_slug = $1 LIMIT 1`,
      ["platform"]
    );
    if (rows && rows.length > 0 && rows[0].password) {
      const row = rows[0];
      const port = Number(row.port) || 465;
      const isSecure = row.encryption === "ssl" || port === 465;
      return {
        host: row.host || process.env.SMTP_HOST || "smtp.hostinger.com",
        port,
        secure: isSecure,
        user: row.username || process.env.SMTP_USER || "hello@resultspro.ng",
        pass: row.password,
        fromEmail: row.from_email || process.env.SMTP_FROM_EMAIL || "hello@resultspro.ng",
        fromName: row.from_name || process.env.SMTP_FROM_NAME || "Ofia Platform Root Security",
      };
    }
  } catch (err) {
    console.warn("Could not query platform SMTP from database, falling back to env:", err);
  }

  // 2. Fall back to environment variables (.env)
  const port = Number(process.env.SMTP_PORT) || 465;
  return {
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure: port === 465,
    user: process.env.SMTP_USER || "hello@resultspro.ng",
    pass: process.env.SMTP_PASSWORD || "",
    fromEmail: process.env.SMTP_FROM_EMAIL || "hello@resultspro.ng",
    fromName: process.env.SMTP_FROM_NAME || "Ofia Platform Root Security",
  };
}

export async function createPlatformTransporter() {
  const config = await getPlatformSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return { transporter, config };
}

export async function sendSuperAdminPasswordResetEmail(
  params: PasswordResetEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { recipientEmail, recipientName = "SuperAdmin Operator", resetUrl, expiresInMinutes = 60 } = params;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, error: "Invalid recipient email" };
  }

  const subject = "[Critical] SuperAdmin Password Reset Authorization";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; }
    .wrapper { width: 100%; background-color: #0b0f19; padding: 40px 16px; box-sizing: border-box; }
    .card { max-width: 520px; margin: 0 auto; background: #111827; border-radius: 20px; border: 1px solid #1f2937; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); overflow: hidden; }
    .header { padding: 32px; text-align: center; border-bottom: 1px solid #1f2937; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(0, 105, 255, 0.15); border: 1px solid rgba(0, 105, 255, 0.3); border-radius: 999px; color: #3b82f6; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-family: monospace; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background-color: #1a56db; color: #ffffff !important; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px 0 rgba(26, 86, 219, 0.4); }
    .box { background: #1e293b; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 14px 16px; margin: 24px 0; font-size: 12px; color: #cbd5e1; }
    .footer { padding: 24px 32px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1f2937; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="badge">PLATFORM ROOT SECURITY</div>
        <h2 style="margin: 16px 0 4px; font-size: 20px; font-weight: 800; color: #f8fafc;">
          Operator Credential Reset
        </h2>
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          Ofia SuperAdmin Infrastructure Console
        </p>
      </div>
      <div class="content">
        <p style="color: #f8fafc; font-weight: 600;">Hello ${recipientName},</p>
        <p>
          A password reset was requested for your SuperAdmin operator account. Click the authorization button below to update your root access key:
        </p>
        <div class="btn-wrap">
          <a href="${resetUrl}" target="_blank" class="btn">Reset Root Password &rarr;</a>
        </div>
        <div class="box">
          <p style="margin: 0 0 6px;"><strong>⏱ Expiration:</strong> Valid for <strong>${expiresInMinutes} minutes</strong>.</p>
          <p style="margin: 0;"><strong>🔒 Security Note:</strong> If you did not initiate this request, contact Security Operations immediately.</p>
        </div>
        <p style="font-size: 11px; color: #64748b; word-break: break-all;">
          Direct link: ${resetUrl}
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Ofia Technologies Ltd. SOC2 Type II Certified.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
SuperAdmin Password Reset Authorization

Hello ${recipientName},

A password reset was requested for your SuperAdmin operator account on Ofia.

Reset link: ${resetUrl}
Valid for ${expiresInMinutes} minutes.

If you did not initiate this request, contact Security Operations immediately.

— Ofia Platform Root Security
  `.trim();

  try {
    const { transporter, config } = await createPlatformTransporter();
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: recipientEmail,
      replyTo: "security@ofia.ng",
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to deliver SuperAdmin password reset email:", err);
    return { success: false, error: err.message || "Email dispatch failed" };
  }
}
