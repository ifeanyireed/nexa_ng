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
  // Hostinger requires port 465 with SSL for high-throughput reliability (port 587 drops TCP connections)
  const isHostinger = settings.host?.toLowerCase().includes("hostinger");
  const effectivePort = isHostinger && settings.port === 587 ? 465 : settings.port;
  const isSecure = settings.encryption === "ssl" || effectivePort === 465;

  return nodemailer.createTransport({
    host: settings.host,
    port: effectivePort,
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

export interface TenantSenderProfile {
  id: string;
  tenantSlug: string;
  profileName: string;
  provider: string;
  host: string;
  port: number;
  encryption: "tls" | "ssl" | "none";
  fromEmail: string;
  fromName: string;
  username: string;
  password?: string;
  hasPassword?: boolean;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const memorySenderProfilesStore = new Map<string, TenantSenderProfile[]>();

export async function getTenantSenderProfiles(tenantSlug: string): Promise<TenantSenderProfile[]> {
  if (!tenantSlug) return [];
  const normalizedSlug = tenantSlug.trim().toLowerCase();

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT id, tenant_slug, profile_name, provider, host, port, encryption, from_email, from_name, username, password, is_default, created_at, updated_at
         FROM tenant_sender_profiles
         WHERE LOWER(tenant_slug) = $1
         ORDER BY is_default DESC, created_at ASC`,
        [normalizedSlug]
      );

      if (res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          tenantSlug: row.tenant_slug,
          profileName: row.profile_name,
          provider: row.provider || "custom",
          host: row.host || "",
          port: Number(row.port) || 587,
          encryption: (row.encryption as any) || "tls",
          fromEmail: row.from_email || "",
          fromName: row.from_name || "",
          username: row.username || "",
          password: row.password ? "••••••••" : "",
          hasPassword: Boolean(row.password && row.password.length > 0),
          isDefault: Boolean(row.is_default),
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
        }));
      }
    }
  } catch (err) {
    console.warn("Error fetching sender profiles from database:", err);
  }

  const cached = memorySenderProfilesStore.get(normalizedSlug) || [];
  return cached.map((p) => ({
    ...p,
    password: p.password ? "••••••••" : "",
    hasPassword: Boolean(p.password && p.password.length > 0),
  }));
}

export async function getTenantSenderProfileById(tenantSlug: string, id: string): Promise<TenantSenderProfile | null> {
  if (!tenantSlug || !id) return null;
  const normalizedSlug = tenantSlug.trim().toLowerCase();

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT id, tenant_slug, profile_name, provider, host, port, encryption, from_email, from_name, username, password, is_default, created_at, updated_at
         FROM tenant_sender_profiles
         WHERE LOWER(tenant_slug) = $1 AND id = $2
         LIMIT 1`,
        [normalizedSlug, id]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          tenantSlug: row.tenant_slug,
          profileName: row.profile_name,
          provider: row.provider || "custom",
          host: row.host || "",
          port: Number(row.port) || 587,
          encryption: (row.encryption as any) || "tls",
          fromEmail: row.from_email || "",
          fromName: row.from_name || "",
          username: row.username || "",
          password: row.password || "",
          hasPassword: Boolean(row.password && row.password.length > 0),
          isDefault: Boolean(row.is_default),
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
        };
      }
    }
  } catch (err) {
    console.warn("Error fetching sender profile by id:", err);
  }

  const cached = (memorySenderProfilesStore.get(normalizedSlug) || []).find((p) => p.id === id);
  return cached || null;
}

export async function saveTenantSenderProfile(
  profile: Partial<TenantSenderProfile> & { tenantSlug: string; profileName: string; host: string; fromEmail: string }
): Promise<TenantSenderProfile> {
  const normalizedSlug = profile.tenantSlug.trim().toLowerCase();
  const id = profile.id || `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let passwordToStore = profile.password;
  if (!passwordToStore || passwordToStore === "••••••••" || passwordToStore.trim() === "") {
    if (profile.id) {
      const existing = await getTenantSenderProfileById(normalizedSlug, profile.id);
      passwordToStore = existing?.password || "";
    } else {
      passwordToStore = "";
    }
  }

  const fullProfile: TenantSenderProfile = {
    id,
    tenantSlug: normalizedSlug,
    profileName: profile.profileName.trim(),
    provider: profile.provider || "custom",
    host: profile.host.trim(),
    port: Number(profile.port) || 587,
    encryption: profile.encryption || "tls",
    fromEmail: profile.fromEmail.trim(),
    fromName: profile.fromName ? profile.fromName.trim() : profile.profileName.trim(),
    username: profile.username ? profile.username.trim() : profile.fromEmail.trim(),
    password: passwordToStore,
    hasPassword: Boolean(passwordToStore && passwordToStore.length > 0),
    isDefault: Boolean(profile.isDefault),
    updatedAt: new Date().toISOString(),
  };

  // 1. Update memory
  const memList = memorySenderProfilesStore.get(normalizedSlug) || [];
  const existingIdx = memList.findIndex((p) => p.id === id);
  if (existingIdx !== -1) {
    memList[existingIdx] = fullProfile;
  } else {
    memList.push(fullProfile);
  }
  memorySenderProfilesStore.set(normalizedSlug, memList);

  // 2. Persist to Neon Postgres
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      await pool.query(
        `INSERT INTO tenant_sender_profiles (
           id, tenant_slug, profile_name, provider, host, port, encryption, from_email, from_name, username, password, is_default, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
         ON CONFLICT (id)
         DO UPDATE SET
           profile_name = EXCLUDED.profile_name,
           provider = EXCLUDED.provider,
           host = EXCLUDED.host,
           port = EXCLUDED.port,
           encryption = EXCLUDED.encryption,
           from_email = EXCLUDED.from_email,
           from_name = EXCLUDED.from_name,
           username = EXCLUDED.username,
           password = EXCLUDED.password,
           is_default = EXCLUDED.is_default,
           updated_at = CURRENT_TIMESTAMP`,
        [
          fullProfile.id,
          fullProfile.tenantSlug,
          fullProfile.profileName,
          fullProfile.provider,
          fullProfile.host,
          fullProfile.port,
          fullProfile.encryption,
          fullProfile.fromEmail,
          fullProfile.fromName,
          fullProfile.username,
          fullProfile.password,
          fullProfile.isDefault,
        ]
      );
    }
  } catch (err) {
    console.error("Failed to persist sender profile to PostgreSQL:", err);
  }

  return {
    ...fullProfile,
    password: fullProfile.hasPassword ? "••••••••" : "",
  };
}

export async function deleteTenantSenderProfile(tenantSlug: string, id: string): Promise<boolean> {
  if (!tenantSlug || !id) return false;
  const normalizedSlug = tenantSlug.trim().toLowerCase();

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      await pool.query(
        `DELETE FROM tenant_sender_profiles WHERE LOWER(tenant_slug) = $1 AND id = $2`,
        [normalizedSlug, id]
      );
    }
  } catch (err) {
    console.warn("Failed to delete sender profile from DB:", err);
  }

  const memList = memorySenderProfilesStore.get(normalizedSlug) || [];
  memorySenderProfilesStore.set(
    normalizedSlug,
    memList.filter((p) => p.id !== id)
  );
  return true;
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

export interface QueueCampaignParams {
  tenantSlug: string;
  recipients: MassEmailRecipient[];
  subject: string;
  messageHtml: string;
  loginUrl?: string;
  senderOverride?: Partial<SmtpSettings>;
}

export interface CampaignProgress {
  id: string;
  tenantSlug: string;
  subject: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  status: "queued" | "processing" | "completed" | "failed";
  progressPercent: number;
  errors: Array<{ email: string; error: string }>;
}

// In-memory queue fallback for development or disconnected states
interface MemoryQueueItem {
  id: string;
  campaignId: string;
  tenantSlug: string;
  recipientEmail: string;
  recipientName?: string;
  recipientRole?: string;
  recipientDepartment?: string;
  status: "pending" | "processing" | "sent" | "failed";
  attempts: number;
  errorMessage?: string;
  sentAt?: Date;
}

interface MemoryCampaign {
  id: string;
  tenantSlug: string;
  subject: string;
  messageHtml: string;
  loginUrl?: string;
  senderOverride?: Partial<SmtpSettings>;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: "queued" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const memoryCampaigns = new Map<string, MemoryCampaign>();
const memoryQueue: MemoryQueueItem[] = [];

function personalizeTemplate(
  text: string,
  recipient: MassEmailRecipient,
  resolvedLoginUrl: string,
  resolvedPortalUrl: string
): string {
  return text
    .replace(/{{name}}/gi, recipient.name || "Colleague")
    .replace(/{{email}}/gi, recipient.email)
    .replace(/{{role}}/gi, recipient.role || "Staff Member")
    .replace(/{{department}}/gi, recipient.department || "Organization")
    .replace(/{{login_url}}/gi, resolvedLoginUrl)
    .replace(/{{loginUrl}}/gi, resolvedLoginUrl)
    .replace(/{{portal_url}}/gi, resolvedPortalUrl)
    .replace(/{{portalUrl}}/gi, resolvedPortalUrl);
}

function resolveUrls(tenantSlug: string, loginUrl?: string): { resolvedLoginUrl: string; resolvedPortalUrl: string } {
  const resolvedLoginUrl =
    loginUrl ||
    (tenantSlug && tenantSlug !== "default"
      ? `https://${tenantSlug}.ofia.ng/login`
      : "https://app.ofia.ng/login");

  const resolvedPortalUrl =
    resolvedLoginUrl.replace(/\/login(\?.*)?$/i, "") +
    "/erp/employee" +
    (resolvedLoginUrl.includes("?") ? resolvedLoginUrl.substring(resolvedLoginUrl.indexOf("?")) : "");

  return { resolvedLoginUrl, resolvedPortalUrl };
}

/**
 * Queue a mass email campaign to the database queue (or in-memory fallback)
 */
export async function queueMassEmailCampaign(params: QueueCampaignParams): Promise<{
  campaignId: string;
  total: number;
  queued: boolean;
}> {
  const { tenantSlug, recipients, subject, messageHtml, loginUrl, senderOverride } = params;
  const campaignId = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const normalizedSlug = (tenantSlug || "default").trim().toLowerCase();

  const validRecipients = recipients.filter(
    (r) => r && r.email && typeof r.email === "string" && r.email.includes("@")
  );

  if (validRecipients.length === 0) {
    throw new Error("At least one valid recipient email is required to queue a campaign");
  }

  // 1. Try to persist to Neon PostgreSQL
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();

      // Insert campaign
      await pool.query(
        `INSERT INTO email_campaigns (
           id, tenant_slug, subject, message_html, login_url, sender_override, total_recipients, status, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'queued', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          campaignId,
          normalizedSlug,
          subject,
          messageHtml,
          loginUrl || null,
          senderOverride ? JSON.stringify(senderOverride) : null,
          validRecipients.length,
        ]
      );

      // Batch insert queue items
      const insertPromises: Promise<any>[] = [];
      const batchSize = 100;
      for (let i = 0; i < validRecipients.length; i += batchSize) {
        const chunk = validRecipients.slice(i, i + batchSize);
        const values: any[] = [];
        const placeholders: string[] = [];

        chunk.forEach((rec, idx) => {
          const offset = idx * 8;
          const itemId = `q_${campaignId}_${i + idx}`;
          placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`);
          values.push(
            itemId,
            campaignId,
            normalizedSlug,
            rec.email.trim(),
            rec.name || "",
            rec.role || "",
            rec.department || "",
            "pending"
          );
        });

        const sql = `
          INSERT INTO email_queue (id, campaign_id, tenant_slug, recipient_email, recipient_name, recipient_role, recipient_department, status)
          VALUES ${placeholders.join(", ")}
        `;
        insertPromises.push(pool.query(sql, values));
      }

      await Promise.all(insertPromises);

      return {
        campaignId,
        total: validRecipients.length,
        queued: true,
      };
    }
  } catch (err) {
    console.error("⚠️ Failed to write mass email campaign to PostgreSQL, utilizing memory queue:", err);
  }

  // 2. In-memory fallback
  memoryCampaigns.set(campaignId, {
    id: campaignId,
    tenantSlug: normalizedSlug,
    subject,
    messageHtml,
    loginUrl,
    senderOverride,
    totalRecipients: validRecipients.length,
    sentCount: 0,
    failedCount: 0,
    status: "queued",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  validRecipients.forEach((rec, idx) => {
    memoryQueue.push({
      id: `q_${campaignId}_${idx}`,
      campaignId,
      tenantSlug: normalizedSlug,
      recipientEmail: rec.email.trim(),
      recipientName: rec.name || "",
      recipientRole: rec.role || "",
      recipientDepartment: rec.department || "",
      status: "pending",
      attempts: 0,
    });
  });

  return {
    campaignId,
    total: validRecipients.length,
    queued: true,
  };
}

/**
 * Process a batch of pending emails from the queue (called by Cron Worker)
 */
export async function processEmailQueueBatch(batchSize: number = 25): Promise<{
  processed: number;
  sent: number;
  failed: number;
  remainingPending: number;
  errors: Array<{ email: string; error: string }>;
}> {
  let processed = 0;
  let sent = 0;
  let failed = 0;
  let remainingPending = 0;
  const errors: Array<{ email: string; error: string }> = [];

  // Transporter cache per tenant slug during this batch
  const transporterCache = new Map<string, { transporter: any; settings: SmtpSettings }>();

  async function getTransporterForTenant(slug: string) {
    if (transporterCache.has(slug)) {
      return transporterCache.get(slug)!;
    }
    const settings = await getTenantSmtpSettings(slug);
    if (!settings || !settings.host || !settings.fromEmail) {
      throw new Error(`SMTP settings are not configured for workspace "${slug}".`);
    }
    const transporter = createNodemailerTransporter(settings);
    const entry = { transporter, settings };
    transporterCache.set(slug, entry);
    return entry;
  }

  // 1. Process from PostgreSQL queue if database is connected
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();

      // Atomically select and claim pending items
      const claimQuery = `
        WITH claimed AS (
          SELECT id FROM email_queue
          WHERE (status = 'pending' OR (status = 'processing' AND updated_at < CURRENT_TIMESTAMP - INTERVAL '5 minutes')) AND attempts < 3
          ORDER BY created_at ASC
          LIMIT $1
          FOR UPDATE SKIP LOCKED
        )
        UPDATE email_queue
        SET status = 'processing', attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id IN (SELECT id FROM claimed)
        RETURNING id, campaign_id, tenant_slug, recipient_email, recipient_name, recipient_role, recipient_department, attempts;
      `;

      const claimedResult = await pool.query(claimQuery, [batchSize]);
      const claimedItems = claimedResult.rows;

      if (claimedItems && claimedItems.length > 0) {
        // Fetch campaign details for these items
        const campaignIds = Array.from(new Set(claimedItems.map((item) => item.campaign_id)));
        const campaignsResult = await pool.query(
          `SELECT id, tenant_slug, subject, message_html, login_url, sender_override FROM email_campaigns WHERE id = ANY($1)`,
          [campaignIds]
        );
        const campaignsMap = new Map<string, any>();
        campaignsResult.rows.forEach((c) => campaignsMap.set(c.id, c));

        for (const item of claimedItems) {
          processed++;
          const campaign = campaignsMap.get(item.campaign_id);
          if (!campaign) {
            failed++;
            await pool.query(
              `UPDATE email_queue SET status = 'failed', error_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
              ["Associated campaign not found", item.id]
            );
            continue;
          }

          try {
            let effectiveTransporter: any;
            let effectiveSettings: SmtpSettings;

            let overrideSettings: Partial<SmtpSettings> | null = null;
            if (campaign.sender_override) {
              try {
                overrideSettings =
                  typeof campaign.sender_override === "string"
                    ? JSON.parse(campaign.sender_override)
                    : campaign.sender_override;
              } catch (parseErr) {
                console.warn("⚠️ Failed to parse campaign sender_override:", parseErr);
              }
            }

            if (overrideSettings && overrideSettings.host && overrideSettings.fromEmail) {
              const cacheKey = `override_${campaign.id}`;
              if (!transporterCache.has(cacheKey)) {
                const fullSettings: SmtpSettings = {
                  tenantSlug: item.tenant_slug,
                  provider: overrideSettings.provider || "custom",
                  host: overrideSettings.host,
                  port: Number(overrideSettings.port) || 587,
                  encryption: (overrideSettings.encryption as any) || "tls",
                  fromEmail: overrideSettings.fromEmail,
                  fromName: overrideSettings.fromName || "Workspace Admin",
                  username: overrideSettings.username || overrideSettings.fromEmail,
                  password: overrideSettings.password || "",
                };
                transporterCache.set(cacheKey, {
                  transporter: createNodemailerTransporter(fullSettings),
                  settings: fullSettings,
                });
              }
              const entry = transporterCache.get(cacheKey)!;
              effectiveTransporter = entry.transporter;
              effectiveSettings = entry.settings;
            } else {
              const entry = await getTransporterForTenant(item.tenant_slug);
              effectiveTransporter = entry.transporter;
              effectiveSettings = entry.settings;
            }

            const { resolvedLoginUrl, resolvedPortalUrl } = resolveUrls(item.tenant_slug, campaign.login_url);

            const recipientObj: MassEmailRecipient = {
              email: item.recipient_email,
              name: item.recipient_name,
              role: item.recipient_role,
              department: item.recipient_department,
            };

            const personalizedSubject = personalizeTemplate(campaign.subject, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
            const personalizedHtml = personalizeTemplate(campaign.message_html, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
            const sender = `"${effectiveSettings.fromName.replace(/"/g, "")}" <${effectiveSettings.fromEmail}>`;

            await effectiveTransporter.sendMail({
              from: sender,
              to: item.recipient_email,
              subject: personalizedSubject,
              html: personalizedHtml,
              text: personalizedHtml.replace(/<[^>]*>?/gm, ""),
            });

            sent++;
            await pool.query(
              `UPDATE email_queue SET status = 'sent', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
              [item.id]
            );

            // Throttle between dispatches to comply with SMTP rate limits
            await new Promise((resolve) => setTimeout(resolve, 600));
          } catch (sendErr: any) {
            const errMsg = sendErr.message || "Failed to deliver email";
            const isRateLimit =
              errMsg.toLowerCase().includes("ratelimit") ||
              errMsg.includes("451") ||
              errMsg.toLowerCase().includes("too many");

            if (isRateLimit) {
              console.warn(`⏳ Outbound SMTP rate limit hit for ${item.tenant_slug}: ${errMsg}. Pausing queue batch.`);
              // Put current item back to pending without penalty
              await pool.query(
                `UPDATE email_queue SET status = 'pending', attempts = GREATEST(0, attempts - 1), error_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [errMsg, item.id]
              );

              // Also release any remaining unprocessed items in this claimed batch back to 'pending'
              const curIdx = claimedItems.indexOf(item);
              const remainingUnsent = claimedItems.slice(curIdx + 1);
              if (remainingUnsent.length > 0) {
                const remIds = remainingUnsent.map((r) => r.id);
                await pool.query(
                  `UPDATE email_queue SET status = 'pending', attempts = GREATEST(0, attempts - 1), updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1)`,
                  [remIds]
                );
              }

              // Break out of this batch to let the provider rate-limit window cool down
              break;
            } else {
              failed++;
              errors.push({ email: item.recipient_email, error: errMsg });

              const newStatus = item.attempts >= 3 ? "failed" : "pending";
              await pool.query(
                `UPDATE email_queue SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
                [newStatus, errMsg, item.id]
              );
            }
          }
        }

        // Update campaign progress counters and statuses
        for (const cid of campaignIds) {
          const countsRes = await pool.query(
            `SELECT 
               COUNT(*) as total,
               COUNT(*) FILTER (WHERE status = 'sent') as sent,
               COUNT(*) FILTER (WHERE status = 'failed') as failed,
               COUNT(*) FILTER (WHERE status = 'pending' OR status = 'processing') as remaining
             FROM email_queue
             WHERE campaign_id = $1`,
            [cid]
          );

          if (countsRes.rows.length > 0) {
            const row = countsRes.rows[0];
            const remaining = Number(row.remaining);
            const campaignStatus = remaining === 0 ? "completed" : "processing";

            await pool.query(
              `UPDATE email_campaigns
               SET sent_count = $1, failed_count = $2, status = $3, updated_at = CURRENT_TIMESTAMP
               WHERE id = $4`,
              [Number(row.sent), Number(row.failed), campaignStatus, cid]
            );
          }
        }
      }

      // Check remaining overall pending items in DB
      const pendingCountRes = await pool.query(
        `SELECT COUNT(*) as count FROM email_queue WHERE status = 'pending' AND attempts < 3`
      );
      remainingPending = Number(pendingCountRes.rows[0]?.count || 0);

      return { processed, sent, failed, remainingPending, errors };
    }
  } catch (err) {
    console.warn("⚠️ PostgreSQL queue processing encountered error, checking memory queue:", err);
  }

  // 2. Process memory queue items if DB not active or returned empty
  const pendingMemoryItems = memoryQueue.filter((q) => q.status === "pending" && q.attempts < 3).slice(0, batchSize);

  for (const item of pendingMemoryItems) {
    processed++;
    item.status = "processing";
    item.attempts++;
    const campaign = memoryCampaigns.get(item.campaignId);

    if (!campaign) {
      item.status = "failed";
      item.errorMessage = "Associated campaign not found";
      failed++;
      continue;
    }

    try {
      let effectiveTransporter: any;
      let effectiveSettings: SmtpSettings;

      if (campaign.senderOverride && campaign.senderOverride.host && campaign.senderOverride.fromEmail) {
        const fullSettings: SmtpSettings = {
          tenantSlug: item.tenantSlug,
          provider: campaign.senderOverride.provider || "custom",
          host: campaign.senderOverride.host,
          port: Number(campaign.senderOverride.port) || 587,
          encryption: (campaign.senderOverride.encryption as any) || "tls",
          fromEmail: campaign.senderOverride.fromEmail,
          fromName: campaign.senderOverride.fromName || "Workspace Admin",
          username: campaign.senderOverride.username || campaign.senderOverride.fromEmail,
          password: campaign.senderOverride.password || "",
        };
        effectiveTransporter = createNodemailerTransporter(fullSettings);
        effectiveSettings = fullSettings;
      } else {
        const entry = await getTransporterForTenant(item.tenantSlug);
        effectiveTransporter = entry.transporter;
        effectiveSettings = entry.settings;
      }

      const { resolvedLoginUrl, resolvedPortalUrl } = resolveUrls(item.tenantSlug, campaign.loginUrl);

      const recipientObj: MassEmailRecipient = {
        email: item.recipientEmail,
        name: item.recipientName,
        role: item.recipientRole,
        department: item.recipientDepartment,
      };

      const personalizedSubject = personalizeTemplate(campaign.subject, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
      const personalizedHtml = personalizeTemplate(campaign.messageHtml, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
      const sender = `"${effectiveSettings.fromName.replace(/"/g, "")}" <${effectiveSettings.fromEmail}>`;

      await effectiveTransporter.sendMail({
        from: sender,
        to: item.recipientEmail,
        subject: personalizedSubject,
        html: personalizedHtml,
        text: personalizedHtml.replace(/<[^>]*>?/gm, ""),
      });

      item.status = "sent";
      item.sentAt = new Date();
      sent++;
      campaign.sentCount++;
    } catch (sendErr: any) {
      item.status = item.attempts >= 3 ? "failed" : "pending";
      item.errorMessage = sendErr.message || "Failed to deliver email";
      failed++;
      campaign.failedCount++;
      errors.push({ email: item.recipientEmail, error: item.errorMessage! });
    }

    // Update memory campaign status
    const remainingForCampaign = memoryQueue.filter(
      (q) => q.campaignId === campaign.id && (q.status === "pending" || q.status === "processing")
    ).length;
    campaign.status = remainingForCampaign === 0 ? "completed" : "processing";
    campaign.updatedAt = new Date();
  }

  remainingPending = memoryQueue.filter((q) => q.status === "pending" && q.attempts < 3).length;

  return { processed, sent, failed, remainingPending, errors };
}

/**
 * Get live progress and status for a campaign
 */
export async function getCampaignProgress(campaignId: string): Promise<CampaignProgress | null> {
  if (!campaignId) return null;

  // 1. Try PostgreSQL
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const campRes = await pool.query(
        `SELECT id, tenant_slug, subject, total_recipients, sent_count, failed_count, status
         FROM email_campaigns
         WHERE id = $1 LIMIT 1`,
        [campaignId]
      );

      if (campRes.rows.length > 0) {
        const row = campRes.rows[0];
        const total = Number(row.total_recipients) || 0;
        const sent = Number(row.sent_count) || 0;
        const failed = Number(row.failed_count) || 0;
        const pending = Math.max(0, total - (sent + failed));

        // Get failed recipient details
        const errorsRes = await pool.query(
          `SELECT recipient_email, error_message
           FROM email_queue
           WHERE campaign_id = $1 AND status = 'failed' AND error_message IS NOT NULL
           LIMIT 20`,
          [campaignId]
        );

        const errors = errorsRes.rows.map((r) => ({
          email: r.recipient_email,
          error: r.error_message || "Delivery failed",
        }));

        const progressPercent = total > 0 ? Math.min(100, Math.round(((sent + failed) / total) * 100)) : 100;

        return {
          id: row.id,
          tenantSlug: row.tenant_slug,
          subject: row.subject,
          total,
          sent,
          failed,
          pending,
          status: row.status as any,
          progressPercent,
          errors,
        };
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to read campaign progress from PostgreSQL, falling back to memory:", err);
  }

  // 2. Try in-memory fallback
  const memCamp = memoryCampaigns.get(campaignId);
  if (memCamp) {
    const total = memCamp.totalRecipients;
    const sent = memCamp.sentCount;
    const failed = memCamp.failedCount;
    const pending = Math.max(0, total - (sent + failed));
    const errors = memoryQueue
      .filter((q) => q.campaignId === campaignId && q.status === "failed" && q.errorMessage)
      .map((q) => ({ email: q.recipientEmail, error: q.errorMessage! }));

    const progressPercent = total > 0 ? Math.min(100, Math.round(((sent + failed) / total) * 100)) : 100;

    return {
      id: memCamp.id,
      tenantSlug: memCamp.tenantSlug,
      subject: memCamp.subject,
      total,
      sent,
      failed,
      pending,
      status: memCamp.status,
      progressPercent,
      errors,
    };
  }

  return null;
}

/**
 * Direct synchronous delivery (legacy fallback)
 */
export async function sendMassEmailToRecipients(params: SendMassEmailParams): Promise<{
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const { campaignId, total } = await queueMassEmailCampaign({
    tenantSlug: params.tenantSlug,
    recipients: params.recipients,
    subject: params.subject,
    messageHtml: params.messageHtml,
    loginUrl: params.loginUrl,
    senderOverride: params.senderOverride,
  });

  // Immediately process in chunks until done (for synchronous callers)
  let totalSent = 0;
  let totalFailed = 0;
  const allErrors: Array<{ email: string; error: string }> = [];

  let batch = await processEmailQueueBatch(50);
  totalSent += batch.sent;
  totalFailed += batch.failed;
  allErrors.push(...batch.errors);

  while (batch.remainingPending > 0 && batch.processed > 0) {
    batch = await processEmailQueueBatch(50);
    totalSent += batch.sent;
    totalFailed += batch.failed;
    allErrors.push(...batch.errors);
  }

  return {
    total,
    sent: totalSent,
    failed: totalFailed,
    errors: allErrors,
  };
}

export interface QueueRecipientDetail {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  recipientRole?: string;
  recipientDepartment?: string;
  status: "pending" | "processing" | "sent" | "failed";
  attempts: number;
  errorMessage?: string;
  sentAt?: string | null;
  createdAt: string;
}

export interface CampaignWithRecipients extends CampaignProgress {
  messageHtml: string;
  loginUrl?: string;
  createdAt: string;
  updatedAt: string;
  recipients: QueueRecipientDetail[];
}

export interface CampaignSummary {
  id: string;
  tenantSlug: string;
  subject: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  status: "queued" | "processing" | "completed" | "failed";
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * List all campaigns for a specific tenant workspace
 */
export async function listTenantCampaigns(tenantSlug: string, limit: number = 50): Promise<CampaignSummary[]> {
  const normalizedSlug = (tenantSlug || "default").trim().toLowerCase();

  // 1. Try PostgreSQL
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT id, tenant_slug, subject, total_recipients, sent_count, failed_count, status, created_at, updated_at
         FROM email_campaigns
         WHERE LOWER(tenant_slug) = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [normalizedSlug, limit]
      );

      let rows = res.rows;
      if (rows.length === 0 && (normalizedSlug === "org-01" || normalizedSlug === "default" || normalizedSlug === "")) {
        const fallbackRes = await pool.query(
          `SELECT id, tenant_slug, subject, total_recipients, sent_count, failed_count, status, created_at, updated_at
           FROM email_campaigns
           ORDER BY created_at DESC
           LIMIT $1`,
          [limit]
        );
        rows = fallbackRes.rows;
      }

      return rows.map((row) => {
        const total = Number(row.total_recipients) || 0;
        const sent = Number(row.sent_count) || 0;
        const failed = Number(row.failed_count) || 0;
        const pending = Math.max(0, total - (sent + failed));
        const progressPercent = total > 0 ? Math.min(100, Math.round(((sent + failed) / total) * 100)) : 100;

        return {
          id: row.id,
          tenantSlug: row.tenant_slug,
          subject: row.subject,
          total,
          sent,
          failed,
          pending,
          status: row.status,
          progressPercent,
          createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : String(row.created_at),
          updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : String(row.updated_at),
        };
      });
    }
  } catch (err) {
    console.warn("⚠️ Failed to list campaigns from PostgreSQL, falling back to memory:", err);
  }

  // 2. In-memory fallback
  const list: CampaignSummary[] = [];
  memoryCampaigns.forEach((camp) => {
    if (camp.tenantSlug === normalizedSlug) {
      const total = camp.totalRecipients;
      const sent = camp.sentCount;
      const failed = camp.failedCount;
      const pending = Math.max(0, total - (sent + failed));
      const progressPercent = total > 0 ? Math.min(100, Math.round(((sent + failed) / total) * 100)) : 100;

      list.push({
        id: camp.id,
        tenantSlug: camp.tenantSlug,
        subject: camp.subject,
        total,
        sent,
        failed,
        pending,
        status: camp.status,
        progressPercent,
        createdAt: camp.createdAt.toISOString(),
        updatedAt: camp.updatedAt.toISOString(),
      });
    }
  });

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
}

/**
 * Get comprehensive campaign details including all per-recipient delivery statuses
 */
export async function getCampaignDetailsWithRecipients(campaignId: string): Promise<CampaignWithRecipients | null> {
  if (!campaignId) return null;

  // 1. Try PostgreSQL
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const campRes = await pool.query(
        `SELECT id, tenant_slug, subject, message_html, login_url, total_recipients, sent_count, failed_count, status, created_at, updated_at
         FROM email_campaigns
         WHERE id = $1 LIMIT 1`,
        [campaignId]
      );

      if (campRes.rows.length > 0) {
        const row = campRes.rows[0];
        const total = Number(row.total_recipients) || 0;
        const sent = Number(row.sent_count) || 0;
        const failed = Number(row.failed_count) || 0;
        const pending = Math.max(0, total - (sent + failed));
        const progressPercent = total > 0 ? Math.min(100, Math.round(((sent + failed) / total) * 100)) : 100;

        // Fetch all recipients for audit
        const queueRes = await pool.query(
          `SELECT id, recipient_email, recipient_name, recipient_role, recipient_department, status, attempts, error_message, sent_at, created_at
           FROM email_queue
           WHERE campaign_id = $1
           ORDER BY status DESC, recipient_name ASC`,
          [campaignId]
        );

        const recipients: QueueRecipientDetail[] = queueRes.rows.map((r) => ({
          id: r.id,
          recipientEmail: r.recipient_email,
          recipientName: r.recipient_name || "",
          recipientRole: r.recipient_role || "",
          recipientDepartment: r.recipient_department || "",
          status: r.status,
          attempts: Number(r.attempts) || 0,
          errorMessage: r.error_message || undefined,
          sentAt: r.sent_at?.toISOString ? r.sent_at.toISOString() : r.sent_at ? String(r.sent_at) : null,
          createdAt: r.created_at?.toISOString ? r.created_at.toISOString() : String(r.created_at),
        }));

        const errors = recipients
          .filter((r) => r.status === "failed" && r.errorMessage)
          .map((r) => ({ email: r.recipientEmail, error: r.errorMessage! }));

        return {
          id: row.id,
          tenantSlug: row.tenant_slug,
          subject: row.subject,
          messageHtml: row.message_html,
          loginUrl: row.login_url || undefined,
          total,
          sent,
          failed,
          pending,
          status: row.status,
          progressPercent,
          createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : String(row.created_at),
          updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : String(row.updated_at),
          errors,
          recipients,
        };
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to load campaign details from PostgreSQL, checking memory:", err);
  }

  // 2. In-memory fallback
  const memCamp = memoryCampaigns.get(campaignId);
  if (memCamp) {
    const total = memCamp.totalRecipients;
    const sent = memCamp.sentCount;
    const failed = memCamp.failedCount;
    const pending = Math.max(0, total - (sent + failed));
    const progressPercent = total > 0 ? Math.min(100, Math.round(((sent + failed) / total) * 100)) : 100;

    const recipients: QueueRecipientDetail[] = memoryQueue
      .filter((q) => q.campaignId === campaignId)
      .map((q) => ({
        id: q.id,
        recipientEmail: q.recipientEmail,
        recipientName: q.recipientName,
        recipientRole: q.recipientRole,
        recipientDepartment: q.recipientDepartment,
        status: q.status,
        attempts: q.attempts,
        errorMessage: q.errorMessage,
        sentAt: q.sentAt ? q.sentAt.toISOString() : null,
        createdAt: memCamp.createdAt.toISOString(),
      }));

    const errors = recipients
      .filter((r) => r.status === "failed" && r.errorMessage)
      .map((r) => ({ email: r.recipientEmail, error: r.errorMessage! }));

    return {
      id: memCamp.id,
      tenantSlug: memCamp.tenantSlug,
      subject: memCamp.subject,
      messageHtml: memCamp.messageHtml,
      loginUrl: memCamp.loginUrl,
      total,
      sent,
      failed,
      pending,
      status: memCamp.status,
      progressPercent,
      createdAt: memCamp.createdAt.toISOString(),
      updatedAt: memCamp.updatedAt.toISOString(),
      errors,
      recipients,
    };
  }

  return null;
}

/**
 * Re-queue all failed recipients for a campaign so the cron worker can retry them
 */
export async function retryFailedCampaignEmails(campaignId: string): Promise<{ retriedCount: number }> {
  if (!campaignId) return { retriedCount: 0 };

  // 1. Try PostgreSQL
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `UPDATE email_queue
         SET status = 'pending', attempts = 0, error_message = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE campaign_id = $1 AND status = 'failed'
         RETURNING id`,
        [campaignId]
      );

      const retriedCount = res.rowCount || 0;

      if (retriedCount > 0) {
        await pool.query(
          `UPDATE email_campaigns
           SET status = 'processing', failed_count = GREATEST(0, failed_count - $1), updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [retriedCount, campaignId]
        );

        // Immediately attempt a batch dispatch
        try {
          await processEmailQueueBatch(20);
        } catch {}
      }

      return { retriedCount };
    }
  } catch (err) {
    console.warn("⚠️ Failed to reset failed emails in PostgreSQL, checking memory:", err);
  }

  // 2. In-memory fallback
  let count = 0;
  memoryQueue.forEach((q) => {
    if (q.campaignId === campaignId && q.status === "failed") {
      q.status = "pending";
      q.attempts = 0;
      q.errorMessage = undefined;
      count++;
    }
  });

  const memCamp = memoryCampaigns.get(campaignId);
  if (memCamp && count > 0) {
    memCamp.status = "processing";
    memCamp.failedCount = Math.max(0, memCamp.failedCount - count);
    memCamp.updatedAt = new Date();

    try {
      await processEmailQueueBatch(20);
    } catch {}
  }

  return { retriedCount: count };
}

export interface PasswordResetEmailParams {
  recipientEmail: string;
  recipientName?: string;
  resetUrl: string;
  tenantSlug?: string;
  tenantName?: string;
  expiresInMinutes?: number;
}

/**
 * Send a secure, branded password reset email using the platform email utility.
 * Attempts tenant-specific SMTP if configured, with automatic fallback to platform Hostinger SMTP.
 */
export async function sendPlatformPasswordResetEmail(
  params: PasswordResetEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    recipientEmail,
    recipientName = "Valued User",
    resetUrl,
    tenantSlug,
    tenantName = "Ofia ERP",
    expiresInMinutes = 60,
  } = params;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, error: "Invalid recipient email address" };
  }

  // 1. Determine SMTP Settings for Platform Auth:
  // Priority 1: Centralized Platform SMTP configured in ofia_admin (tenant_slug = 'platform')
  // Priority 2: Environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)
  // Priority 3: Tenant-specific fallback if platform SMTP is unconfigured
  let settings: SmtpSettings | null = null;
  try {
    const platformDbSettings = await getTenantSmtpSettings("platform");
    if (platformDbSettings && platformDbSettings.host && platformDbSettings.password) {
      settings = platformDbSettings;
    }
  } catch (e) {
    console.warn("Failed to retrieve platform SMTP settings, checking fallbacks:", e);
  }

  // If platform SMTP not found in database, check tenant fallback
  if (!settings && tenantSlug && tenantSlug !== "platform" && tenantSlug !== "default") {
    try {
      const tenantDbSettings = await getTenantSmtpSettings(tenantSlug);
      if (tenantDbSettings && tenantDbSettings.host && tenantDbSettings.password) {
        settings = tenantDbSettings;
      }
    } catch {}
  }

  const envSettings: SmtpSettings = {
    tenantSlug: "platform",
    provider: "hostinger",
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT) || 465,
    encryption: (Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT ? "ssl" : "tls"),
    fromEmail: process.env.SMTP_FROM_EMAIL || "hello@resultspro.ng",
    fromName: tenantName ? `${tenantName} Security` : (process.env.SMTP_FROM_NAME || "Ofia Platform Security"),
    username: process.env.SMTP_USER || "hello@resultspro.ng",
    password: process.env.SMTP_PASSWORD || "",
  };

  const effectiveSettings = (settings && settings.host && settings.password)
    ? settings
    : envSettings;

  const senderName = effectiveSettings.fromName || (tenantName ? `${tenantName} Security` : "Ofia Platform Security");
  const senderEmail = effectiveSettings.fromEmail || envSettings.fromEmail;
  const senderFormatted = `"${senderName.replace(/"/g, "")}" <${senderEmail}>`;

  const subject = `[Action Required] Reset Your Password for ${tenantName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 16px; box-sizing: border-box; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); overflow: hidden; }
    .header { padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9; }
    .brand-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 999px; color: #1a56db; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .content { padding: 32px; line-height: 1.6; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
    .message { font-size: 14px; color: #475569; margin-bottom: 24px; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background-color: #1a56db; color: #ffffff !important; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px 0 rgba(26, 86, 219, 0.35); }
    .notice-box { background: #f8fafc; border-left: 4px solid #1a56db; border-radius: 6px; padding: 14px 16px; margin: 24px 0; font-size: 12px; color: #64748b; }
    .fallback-url { word-break: break-all; font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 10px 12px; border-radius: 8px; color: #0f172a; border: 1px solid #e2e8f0; margin-top: 8px; }
    .footer { padding: 24px 32px 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="brand-badge">
          <span>🔒</span> ${tenantName} Security
        </div>
        <h2 style="margin: 16px 0 4px; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">
          Password Reset Request
        </h2>
        <p style="margin: 0; font-size: 13px; color: #64748b;">
          Follow the instructions below to regain access to your workspace.
        </p>
      </div>

      <div class="content">
        <p class="greeting">Hello ${recipientName},</p>
        <p class="message">
          We received a request to reset the password for your account on <strong>${tenantName}</strong>. If you made this request, click the secure button below to set a new password:
        </p>

        <div class="btn-container">
          <a href="${resetUrl}" target="_blank" class="btn">
            Reset My Password &rarr;
          </a>
        </div>

        <div class="notice-box">
          <p style="margin: 0 0 6px 0;"><strong>⏱ Expiration:</strong> This reset link will automatically expire in <strong>${expiresInMinutes} minutes</strong>.</p>
          <p style="margin: 0;"><strong>🛡 Did not request this?</strong> If you did not ask to reset your password, you can safely ignore this email. Your existing credentials remain completely secure.</p>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 20px; margin-bottom: 4px;">
          Button not working? Copy and paste this URL into your browser:
        </p>
        <div class="fallback-url">${resetUrl}</div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px;">Sent automatically by the Ofia Enterprise Platform Security Infrastructure.</p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Ofia Technologies. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Password Reset Request for ${tenantName}

Hello ${recipientName},

We received a request to reset the password for your account on ${tenantName}.

To reset your password, please visit the link below:
${resetUrl}

This link is valid for ${expiresInMinutes} minutes.

If you did not request a password reset, please ignore this email. Your account remains completely secure.

— ${tenantName} Security Team
Sent by Ofia Enterprise Platform
  `.trim();

  // 2. Dispatch via Nodemailer
  try {
    const transporter = createNodemailerTransporter(effectiveSettings);
    const info = await transporter.sendMail({
      from: senderFormatted,
      to: recipientEmail,
      replyTo: "support@ofia.ng",
      subject,
      html,
      text,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("Failed to deliver password reset email via primary SMTP:", err);

    // If tenant SMTP failed, attempt fallback to platform Hostinger SMTP
    if (settings && effectiveSettings !== envSettings) {
      try {
        const fallbackTransporter = createNodemailerTransporter(envSettings);
        const fallbackInfo = await fallbackTransporter.sendMail({
          from: `"${tenantName || 'Ofia'} Security" <${envSettings.fromEmail}>`,
          to: recipientEmail,
          replyTo: "support@ofia.ng",
          subject,
          html,
          text,
        });

        return {
          success: true,
          messageId: fallbackInfo.messageId,
        };
      } catch (fallbackErr: any) {
        console.error("Platform fallback SMTP also failed:", fallbackErr);
        return {
          success: false,
          error: fallbackErr.message || "Failed to dispatch password reset email",
        };
      }
    }

    return {
      success: false,
      error: err.message || "Failed to dispatch password reset email",
    };
  }
}

export interface PasswordChangedEmailParams {
  recipientEmail: string;
  recipientName?: string;
  tenantSlug?: string;
  tenantName?: string;
}

/**
 * Dispatches security alert confirming password was updated.
 * Uses Root Platform SMTP relay configured in ofia_admin (tenant_slug = 'platform').
 */
export async function sendPlatformPasswordChangedEmail(
  params: PasswordChangedEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    recipientEmail,
    recipientName = "Valued User",
    tenantSlug,
    tenantName = "Ofia Platform",
  } = params;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, error: "Invalid recipient email address" };
  }

  let settings: SmtpSettings | null = null;
  try {
    const platformDbSettings = await getTenantSmtpSettings("platform");
    if (platformDbSettings && platformDbSettings.host && platformDbSettings.password) {
      settings = platformDbSettings;
    }
  } catch (e) {}

  const envSettings: SmtpSettings = {
    tenantSlug: "platform",
    provider: "hostinger",
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT) || 465,
    encryption: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT ? "ssl" : "tls",
    fromEmail: process.env.SMTP_FROM_EMAIL || "hello@resultspro.ng",
    fromName: tenantName ? `${tenantName} Security` : "Ofia Platform Security",
    username: process.env.SMTP_USER || "hello@resultspro.ng",
    password: process.env.SMTP_PASSWORD || "",
  };

  const effectiveSettings = settings && settings.host && settings.password ? settings : envSettings;
  const senderName = effectiveSettings.fromName || `${tenantName} Security`;
  const senderEmail = effectiveSettings.fromEmail || envSettings.fromEmail;
  const senderFormatted = `"${senderName.replace(/"/g, "")}" <${senderEmail}>`;

  const subject = `[Security Notice] Your Password Was Successfully Changed — ${tenantName}`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 32px auto; padding: 28px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Changed Successfully</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">Hello ${recipientName},</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      This email confirms that the password for your account on <strong>${tenantName}</strong> was recently changed.
    </p>
    <div style="background: #f1f5f9; border-left: 4px solid #0e9f6e; padding: 12px 16px; margin: 20px 0; border-radius: 6px; font-size: 13px; color: #334155;">
      <strong>Time:</strong> ${new Date().toUTCString()}<br/>
      <strong>Account:</strong> ${recipientEmail}
    </div>
    <p style="font-size: 13px; color: #e02424; line-height: 1.5; font-weight: 500;">
      If you did not make this change, please contact your workspace administrator or Ofia security immediately.
    </p>
    <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 24px;">
      Sent automatically by Ofia Platform Security Infrastructure.
    </p>
  </div>
</body>
</html>
  `;

  try {
    const transporter = createNodemailerTransporter(effectiveSettings);
    const info = await transporter.sendMail({
      from: senderFormatted,
      to: recipientEmail,
      replyTo: "support@ofia.ng",
      subject,
      html,
      text: `Hello ${recipientName},\n\nThe password for your account on ${tenantName} was successfully changed on ${new Date().toUTCString()}.\n\nIf you did not authorize this change, please contact support immediately.\n\n— ${tenantName} Security`,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to deliver password change notification:", err);
    return { success: false, error: err.message };
  }
}

export interface EmailVerificationParams {
  recipientEmail: string;
  recipientName?: string;
  verificationUrl: string;
  tenantSlug?: string;
  tenantName?: string;
}

/**
 * Dispatches email verification link for new user registration or tenant invitations.
 * Uses Root Platform SMTP relay configured in ofia_admin (tenant_slug = 'platform').
 */
export async function sendPlatformEmailVerificationEmail(
  params: EmailVerificationParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    recipientEmail,
    recipientName = "Valued User",
    verificationUrl,
    tenantSlug,
    tenantName = "Ofia Platform",
  } = params;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, error: "Invalid recipient email address" };
  }

  let settings: SmtpSettings | null = null;
  try {
    const platformDbSettings = await getTenantSmtpSettings("platform");
    if (platformDbSettings && platformDbSettings.host && platformDbSettings.password) {
      settings = platformDbSettings;
    }
  } catch (e) {}

  const envSettings: SmtpSettings = {
    tenantSlug: "platform",
    provider: "hostinger",
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT) || 465,
    encryption: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT ? "ssl" : "tls",
    fromEmail: process.env.SMTP_FROM_EMAIL || "hello@resultspro.ng",
    fromName: tenantName ? `${tenantName} Verification` : "Ofia Platform Verification",
    username: process.env.SMTP_USER || "hello@resultspro.ng",
    password: process.env.SMTP_PASSWORD || "",
  };

  const effectiveSettings = settings && settings.host && settings.password ? settings : envSettings;
  const senderName = effectiveSettings.fromName || `${tenantName} Verification`;
  const senderEmail = effectiveSettings.fromEmail || envSettings.fromEmail;
  const senderFormatted = `"${senderName.replace(/"/g, "")}" <${senderEmail}>`;

  const subject = `[Action Required] Verify Your Email Address for ${tenantName}`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 32px auto; padding: 28px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Verify Your Email Address</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">Hello ${recipientName},</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Welcome to <strong>${tenantName}</strong>! Please confirm your email address by clicking the secure button below:
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 13px 28px; background-color: #1a56db; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(26, 86, 219, 0.2);">
        Verify My Email &rarr;
      </a>
    </div>
    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
      Button not working? Copy and paste this URL into your browser:<br/>
      <span style="word-break: break-all; color: #1a56db;">${verificationUrl}</span>
    </p>
    <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 24px;">
      Sent automatically by Ofia Platform Security Infrastructure.
    </p>
  </div>
</body>
</html>
  `;

  try {
    const transporter = createNodemailerTransporter(effectiveSettings);
    const info = await transporter.sendMail({
      from: senderFormatted,
      to: recipientEmail,
      replyTo: "support@ofia.ng",
      subject,
      html,
      text: `Hello ${recipientName},\n\nPlease verify your email for ${tenantName} by visiting:\n${verificationUrl}\n\n— ${tenantName} Team`,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to deliver email verification:", err);
    return { success: false, error: err.message };
  }
}


