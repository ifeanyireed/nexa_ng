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

export interface SmtpConfigParams {
  provider?: string;
  host: string;
  port: number;
  encryption: "tls" | "ssl" | "none";
  fromEmail: string;
  fromName: string;
  username: string;
  password?: string;
}

export async function getPlatformSmtpDetailed() {
  try {
    const rows = await executeQuery<SmtpDbRow[]>(
      `SELECT * FROM tenant_smtp_settings WHERE tenant_slug = $1 LIMIT 1`,
      ["platform"]
    );
    if (rows && rows.length > 0) {
      const row = rows[0];
      return {
        configured: true,
        tenantSlug: "platform",
        provider: row.provider || "custom",
        host: row.host || "",
        port: Number(row.port) || 587,
        encryption: (row.encryption as "tls" | "ssl" | "none") || "tls",
        fromEmail: row.from_email || "",
        fromName: row.from_name || "Ofia Platform Root Security",
        username: row.username || "",
        hasPassword: Boolean(row.password && row.password.length > 0),
        password: row.password || "",
      };
    }
  } catch (err) {
    console.warn("Could not query platform SMTP details from database:", err);
  }

  // Fallback to env
  const port = Number(process.env.SMTP_PORT) || 465;
  const hasPass = Boolean(process.env.SMTP_PASSWORD && process.env.SMTP_PASSWORD.length > 0);
  return {
    configured: Boolean(process.env.SMTP_HOST),
    tenantSlug: "platform",
    provider: process.env.SMTP_HOST?.includes("brevo") ? "brevo" : "hostinger",
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    encryption: (port === 465 ? "ssl" : "tls") as "tls" | "ssl" | "none",
    fromEmail: process.env.SMTP_FROM_EMAIL || "hello@resultspro.ng",
    fromName: process.env.SMTP_FROM_NAME || "Ofia Platform Root Security",
    username: process.env.SMTP_USER || "hello@resultspro.ng",
    hasPassword: hasPass,
    password: process.env.SMTP_PASSWORD || "",
  };
}

export async function savePlatformSmtpSettings(settings: SmtpConfigParams): Promise<boolean> {
  let passwordToStore = settings.password;
  if (!passwordToStore || passwordToStore === "••••••••" || passwordToStore.trim() === "") {
    const existing = await getPlatformSmtpConfig();
    passwordToStore = existing.pass || "";
  }

  try {
    await executeQuery(
      `INSERT INTO tenant_smtp_settings (
         tenant_slug, provider, host, port, encryption, from_email, from_name, username, password, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_slug)
       DO UPDATE SET
         provider = EXCLUDED.provider,
         host = EXCLUDED.host,
         port = EXCLUDED.port,
         encryption = EXCLUDED.encryption,
         from_email = EXCLUDED.from_email,
         from_name = EXCLUDED.from_name,
         username = EXCLUDED.username,
         password = EXCLUDED.password,
         updated_at = CURRENT_TIMESTAMP`,
      [
        "platform",
        settings.provider || "brevo",
        settings.host.trim(),
        settings.port || 587,
        settings.encryption || "tls",
        settings.fromEmail.trim(),
        settings.fromName ? settings.fromName.trim() : "Ofia Platform Root Security",
        settings.username ? settings.username.trim() : settings.fromEmail.trim(),
        passwordToStore,
      ]
    );
    return true;
  } catch (err) {
    console.error("Failed to save platform SMTP settings:", err);
    return false;
  }
}

export async function testPlatformSmtpConnection(
  settings: SmtpConfigParams,
  testRecipientEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    let resolvedPassword = settings.password || "";
    if (!resolvedPassword || resolvedPassword === "••••••••") {
      const existing = await getPlatformSmtpConfig();
      resolvedPassword = existing.pass;
    }

    const isSecure = settings.encryption === "ssl" || settings.port === 465;

    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: isSecure,
      auth: {
        user: settings.username || settings.fromEmail,
        pass: resolvedPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();

    const sender = `"${(settings.fromName || 'Ofia Platform').replace(/"/g, '')}" <${settings.fromEmail}>`;
    await transporter.sendMail({
      from: sender,
      to: testRecipientEmail,
      subject: `[Test] Brevo / Platform SMTP Handshake Verification`,
      text: `Hello,\n\nThis is a test email confirming that your Brevo / Platform SMTP relay is operational.\n\nProvider: ${settings.provider || 'Brevo'}\nHost: ${settings.host}:${settings.port}\nEncryption: ${settings.encryption.toUpperCase()}\nSender: ${sender}\n\nAll platform recovery and notification utilities are ready!`,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 24px auto; padding: 32px; border: 1px solid #dadce0; border-radius: 8px; background: #ffffff;">
          <div style="margin-bottom: 20px; border-bottom: 1px solid #dadce0; padding-bottom: 16px;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
              <tr>
                <td style="vertical-align: middle;">
                  <img src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png" alt="Ofia" width="36" height="36" style="display: block; width: 36px; height: 36px; object-fit: contain;" />
                </td>
                <td style="vertical-align: middle; padding-left: 10px;">
                  <span style="font-size: 20px; font-weight: 800; color: #202124; letter-spacing: -0.02em;">Ofia</span>
                </td>
              </tr>
            </table>
            <div style="display: inline-block; padding: 4px 12px; background: #e8f0fe; border: 1px solid #d2e3fc; border-radius: 9999px; color: #1a73e8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">
              Platform Infrastructure
            </div>
            <h2 style="color: #202124; margin: 14px 0 4px; font-size: 20px; font-weight: 600;">SMTP Handshake Verified</h2>
            <p style="color: #5f6368; font-size: 13px; margin: 0;">Ofia Platform Relay Authorization</p>
          </div>
          <p style="color: #3c4043; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
            Your platform email relay configuration has successfully connected and passed authorization.
          </p>
          <div style="background: #f8f9fa; border: 1px solid #dadce0; border-left: 3px solid #1a73e8; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 4px 0; font-size: 13px; color: #3c4043;"><strong>Provider:</strong> ${settings.provider || 'Brevo'}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #3c4043;"><strong>Host & Port:</strong> ${settings.host}:${settings.port}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #3c4043;"><strong>Security:</strong> ${settings.encryption.toUpperCase()}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #3c4043;"><strong>Sender:</strong> ${sender}</p>
          </div>
          <p style="font-size: 12px; color: #70757a; border-top: 1px solid #dadce0; padding-top: 16px; margin: 24px 0 0;">
            Dispatched automatically by Ofia SuperAdmin Infrastructure Console.
          </p>
        </div>
      `,
    });

    return {
      success: true,
      message: `Test email successfully dispatched to ${testRecipientEmail}`,
    };
  } catch (err: any) {
    const rawMsg = err.message || "Failed to establish SMTP connection or deliver test email.";
    let detailedMessage = rawMsg;

    if (rawMsg.includes("535") || rawMsg.toLowerCase().includes("authentication failed")) {
      if (settings.host?.toLowerCase().includes("brevo")) {
        detailedMessage = `Brevo Authentication Failed (535 5.7.8): The Brevo SMTP server rejected the login. Please check: 1) Your SMTP Username must match the exact "Login" value shown in Brevo under Settings > SMTP & API > SMTP tab (usually your registered account email, which may differ from your From address); 2) Your password must be an SMTP Key (starts with xsmtpsib-...) generated under the SMTP tab; 3) Your Brevo account must have Transactional Email Sending activated; 4) Ensure your From Email (${settings.fromEmail}) is verified in Brevo under Senders & IPs.`;
      } else {
        detailedMessage = `Authentication failed (535 5.7.8): The SMTP server rejected your credentials. Please double-check your username/password and ensure an App Password or SMTP access is enabled.`;
      }
    }

    return {
      success: false,
      message: detailedMessage,
    };
  }
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
    body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Plus Jakarta Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #202124; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #f8f9fa; padding: 40px 16px; box-sizing: border-box; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #dadce0; overflow: hidden; }
    .header { padding: 32px 32px 20px; border-bottom: 1px solid #dadce0; }
    .badge { display: inline-block; padding: 4px 12px; background: #e8f0fe; border: 1px solid #d2e3fc; border-radius: 9999px; color: #1a73e8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .title { margin: 16px 0 6px; font-size: 22px; font-weight: 600; color: #202124; line-height: 1.3; }
    .subtitle { margin: 0; font-size: 13px; color: #5f6368; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #3c4043; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background-color: #1a73e8; color: #ffffff !important; padding: 12px 32px; border-radius: 9999px; font-size: 14px; font-weight: 600; text-decoration: none; }
    .box { background: #f8f9fa; border: 1px solid #dadce0; border-left: 3px solid #1a73e8; border-radius: 4px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #3c4043; line-height: 1.5; }
    .direct-link { font-size: 11px; color: #70757a; word-break: break-all; margin-top: 16px; }
    .footer { padding: 20px 32px; text-align: center; font-size: 12px; color: #70757a; background-color: #f8f9fa; border-top: 1px solid #dadce0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
          <tr>
            <td style="vertical-align: middle;">
              <img src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png" alt="Ofia" width="36" height="36" style="display: block; width: 36px; height: 36px; object-fit: contain;" />
            </td>
            <td style="vertical-align: middle; padding-left: 10px;">
              <span style="font-size: 20px; font-weight: 800; color: #202124; letter-spacing: -0.02em;">Ofia</span>
            </td>
          </tr>
        </table>
        <div class="badge">Platform Root Security</div>
        <h1 class="title">Operator Credential Reset</h1>
        <p class="subtitle">Ofia SuperAdmin Infrastructure Console</p>
      </div>
      <div class="content">
        <p style="margin: 0 0 16px;">Hello ${recipientName},</p>
        <p style="margin: 0 0 16px;">
          A password reset was requested for your SuperAdmin operator account. Click the authorization button below to update your root access key:
        </p>
        <div class="btn-wrap">
          <a href="${resetUrl}" target="_blank" class="btn">Reset Root Password</a>
        </div>
        <div class="box">
          <p style="margin: 0 0 6px;"><strong>Expiration:</strong> Valid for <strong>${expiresInMinutes} minutes</strong>.</p>
          <p style="margin: 0;"><strong>Security Note:</strong> If you did not initiate this request, contact Security Operations immediately.</p>
        </div>
        <p class="direct-link">
          Direct link: ${resetUrl}
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Ofia Technologies Ltd. SOC2 Type II Certified.<br/>
        This is a mandatory security service notification regarding your operator access.
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
