import nodemailer from "nodemailer";
import { getDbPool, ensureTablesExist } from "./db";

export interface SmtpSettings {
  tenantSlug: string;
  provider: string;
  host: string;
  port: number;
  encryption: "tls" | "ssl" | "none";
  fromEmail: string;
  fromName: string;
  username: string;
  password?: string;
  hasPassword?: boolean;
}

// In-memory fallback cache when PostgreSQL connection is unavailable
const memorySmtpStore = new Map<string, SmtpSettings>();

export async function getTenantSmtpSettings(tenantSlug: string): Promise<SmtpSettings | null> {
  if (!tenantSlug) return null;
  const normalizedSlug = tenantSlug.trim().toLowerCase();

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT tenant_slug, provider, host, port, encryption, from_email, from_name, username, password
         FROM tenant_smtp_settings
         WHERE LOWER(tenant_slug) = $1
         LIMIT 1`,
        [normalizedSlug]
      );

      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          tenantSlug: row.tenant_slug,
          provider: row.provider || "custom",
          host: row.host || "",
          port: Number(row.port) || 587,
          encryption: (row.encryption as any) || "tls",
          fromEmail: row.from_email || "",
          fromName: row.from_name || "",
          username: row.username || "",
          password: row.password || "",
          hasPassword: Boolean(row.password && row.password.length > 0),
        };
      }
    }
  } catch (err) {
    console.warn("Error fetching SMTP settings from database:", err);
  }

  // Fallback to memory store
  const cached = memorySmtpStore.get(normalizedSlug);
  if (cached) {
    return {
      ...cached,
      hasPassword: Boolean(cached.password && cached.password.length > 0),
    };
  }

  return null;
}

export async function saveTenantSmtpSettings(settings: SmtpSettings): Promise<boolean> {
  if (!settings.tenantSlug) return false;
  const normalizedSlug = settings.tenantSlug.trim().toLowerCase();

  // If password was omitted or passed as mask, preserve existing password if present
  let passwordToStore = settings.password;
  if (!passwordToStore || passwordToStore === "••••••••" || passwordToStore.trim() === "") {
    const existing = await getTenantSmtpSettings(normalizedSlug);
    if (existing?.password) {
      passwordToStore = existing.password;
    } else {
      passwordToStore = "";
    }
  }

  const updatedSettings: SmtpSettings = {
    ...settings,
    tenantSlug: normalizedSlug,
    password: passwordToStore,
  };

  // 1. Update in-memory fallback
  memorySmtpStore.set(normalizedSlug, updatedSettings);

  // 2. Persist to Neon Postgres
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      await pool.query(
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
          normalizedSlug,
          settings.provider || "custom",
          settings.host,
          settings.port || 587,
          settings.encryption || "tls",
          settings.fromEmail,
          settings.fromName,
          settings.username || "",
          passwordToStore,
        ]
      );
      return true;
    }
  } catch (err) {
    console.error("Failed to persist SMTP settings to PostgreSQL:", err);
    // In-memory update succeeded
    return true;
  }

  return true;
}

export function createNodemailerTransporter(settings: SmtpSettings) {
  const isSecure = settings.encryption === "ssl" || settings.port === 465;

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: isSecure,
    auth: {
      user: settings.username || settings.fromEmail,
      pass: settings.password || "",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function testSmtpSettings(settings: SmtpSettings, testRecipientEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createNodemailerTransporter(settings);

    // Verify SMTP connection
    await transporter.verify();

    // Send a test email
    const sender = `"${settings.fromName.replace(/"/g, "")}" <${settings.fromEmail}>`;
    await transporter.sendMail({
      from: sender,
      to: testRecipientEmail,
      subject: `[Test] SMTP Verification from ${settings.fromName || "Ofia ERP"}`,
      text: `Hello,\n\nThis is a test email sent from Ofia ERP to confirm your SMTP configuration for "${settings.fromName}".\n\nProvider: ${settings.provider}\nHost: ${settings.host}:${settings.port}\nEncryption: ${settings.encryption.toUpperCase()}\nFrom Address: ${settings.fromEmail}\n\nYour mass messaging setup is ready to use!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #1a56db; margin: 0; font-size: 20px; font-weight: bold;">Ofia ERP — SMTP Test</h2>
          </div>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Success! Your SMTP connection has been verified. You can now dispatch announcements, notifications, and mass communications to your staff directory.
          </p>
          <div style="background: #f8fafc; border-left: 4px solid #1a56db; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Provider:</strong> ${settings.provider}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Host & Port:</strong> ${settings.host}:${settings.port}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Encryption:</strong> ${settings.encryption.toUpperCase()}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Sender:</strong> ${sender}</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
            Sent automatically by Ofia Enterprise Resource Planning platform.
          </p>
        </div>
      `,
    });

    return {
      success: true,
      message: `Test email successfully dispatched to ${testRecipientEmail}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to establish SMTP connection or deliver test email.",
    };
  }
}

export interface MassEmailRecipient {
  email: string;
  name?: string;
  role?: string;
  department?: string;
}

export interface SendMassEmailParams {
  tenantSlug: string;
  recipients: MassEmailRecipient[];
  subject: string;
  messageHtml: string;
  loginUrl?: string;
  senderOverride?: Partial<SmtpSettings>;
}

export async function sendMassEmailToRecipients(params: SendMassEmailParams): Promise<{
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const { tenantSlug, recipients, subject, messageHtml, loginUrl, senderOverride } = params;

  let settings = await getTenantSmtpSettings(tenantSlug);
  if (senderOverride && senderOverride.host && senderOverride.fromEmail) {
    settings = {
      tenantSlug: tenantSlug || "default",
      provider: senderOverride.provider || settings?.provider || "custom",
      host: senderOverride.host,
      port: senderOverride.port || 587,
      encryption: senderOverride.encryption || "tls",
      fromEmail: senderOverride.fromEmail,
      fromName: senderOverride.fromName || "Workspace Admin",
      username: senderOverride.username || senderOverride.fromEmail,
      password: senderOverride.password || settings?.password || "",
    };
  }

  if (!settings || !settings.host || !settings.fromEmail) {
    throw new Error(
      "SMTP settings are not configured for this workspace. Please configure SMTP provider, sender email, and password in Workspace Settings before sending mass emails."
    );
  }

  const resolvedLoginUrl =
    loginUrl ||
    (tenantSlug && tenantSlug !== "default"
      ? `https://${tenantSlug}.ofia.ng/login`
      : "https://app.ofia.ng/login");

  const resolvedPortalUrl =
    resolvedLoginUrl.replace(/\/login(\?.*)?$/i, "") +
    "/erp/employee" +
    (resolvedLoginUrl.includes("?") ? resolvedLoginUrl.substring(resolvedLoginUrl.indexOf("?")) : "");

  const transporter = createNodemailerTransporter(settings);
  const sender = `"${settings.fromName.replace(/"/g, "")}" <${settings.fromEmail}>`;

  let sent = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const recipient of recipients) {
    if (!recipient.email || !recipient.email.includes("@")) {
      failed++;
      errors.push({ email: recipient.email || "Unknown", error: "Invalid email address format" });
      continue;
    }

    try {
      // Personalize placeholders in subject and message
      const personalizedSubject = subject
        .replace(/{{name}}/gi, recipient.name || "Colleague")
        .replace(/{{role}}/gi, recipient.role || "Staff Member")
        .replace(/{{department}}/gi, recipient.department || "Organization")
        .replace(/{{login_url}}/gi, resolvedLoginUrl)
        .replace(/{{loginUrl}}/gi, resolvedLoginUrl)
        .replace(/{{portal_url}}/gi, resolvedPortalUrl)
        .replace(/{{portalUrl}}/gi, resolvedPortalUrl);

      const personalizedHtml = messageHtml
        .replace(/{{name}}/gi, recipient.name || "Colleague")
        .replace(/{{email}}/gi, recipient.email)
        .replace(/{{role}}/gi, recipient.role || "Staff Member")
        .replace(/{{department}}/gi, recipient.department || "Organization")
        .replace(/{{login_url}}/gi, resolvedLoginUrl)
        .replace(/{{loginUrl}}/gi, resolvedLoginUrl)
        .replace(/{{portal_url}}/gi, resolvedPortalUrl)
        .replace(/{{portalUrl}}/gi, resolvedPortalUrl);

      await transporter.sendMail({
        from: sender,
        to: recipient.email,
        subject: personalizedSubject,
        html: personalizedHtml,
        text: personalizedHtml.replace(/<[^>]*>?/gm, ""),
      });

      sent++;
    } catch (err: any) {
      failed++;
      errors.push({ email: recipient.email, error: err.message || "Failed to dispatch email" });
    }
  }

  return {
    total: recipients.length,
    sent,
    failed,
    errors,
  };
}
