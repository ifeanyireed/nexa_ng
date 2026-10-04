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
  const { tenantSlug, recipients, subject, messageHtml, loginUrl } = params;
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
           id, tenant_slug, subject, message_html, login_url, total_recipients, status, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, 'queued', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [campaignId, normalizedSlug, subject, messageHtml, loginUrl || null, validRecipients.length]
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
          `SELECT id, tenant_slug, subject, message_html, login_url FROM email_campaigns WHERE id = ANY($1)`,
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
            const { transporter, settings } = await getTransporterForTenant(item.tenant_slug);
            const { resolvedLoginUrl, resolvedPortalUrl } = resolveUrls(item.tenant_slug, campaign.login_url);

            const recipientObj: MassEmailRecipient = {
              email: item.recipient_email,
              name: item.recipient_name,
              role: item.recipient_role,
              department: item.recipient_department,
            };

            const personalizedSubject = personalizeTemplate(campaign.subject, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
            const personalizedHtml = personalizeTemplate(campaign.message_html, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
            const sender = `"${settings.fromName.replace(/"/g, "")}" <${settings.fromEmail}>`;

            await transporter.sendMail({
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
      const { transporter, settings } = await getTransporterForTenant(item.tenantSlug);
      const { resolvedLoginUrl, resolvedPortalUrl } = resolveUrls(item.tenantSlug, campaign.loginUrl);

      const recipientObj: MassEmailRecipient = {
        email: item.recipientEmail,
        name: item.recipientName,
        role: item.recipientRole,
        department: item.recipientDepartment,
      };

      const personalizedSubject = personalizeTemplate(campaign.subject, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
      const personalizedHtml = personalizeTemplate(campaign.messageHtml, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
      const sender = `"${settings.fromName.replace(/"/g, "")}" <${settings.fromEmail}>`;

      await transporter.sendMail({
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

      return res.rows.map((row) => {
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

