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
  rateLimitedUntil?: string | null;
  rateLimitReason?: string | null;
  isRateLimited?: boolean;
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
        `SELECT tenant_slug, provider, host, port, encryption, from_email, from_name, username, password, rate_limited_until, rate_limit_reason
         FROM tenant_smtp_settings
         WHERE LOWER(tenant_slug) = $1
         LIMIT 1`,
        [normalizedSlug]
      );

      if (res.rows.length > 0) {
        const row = res.rows[0];
        const isRateLimited = Boolean(
          row.rate_limited_until && new Date(row.rate_limited_until).getTime() > Date.now()
        );
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
          rateLimitedUntil: row.rate_limited_until ? new Date(row.rate_limited_until).toISOString() : null,
          rateLimitReason: row.rate_limit_reason || null,
          isRateLimited,
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
  rateLimitedUntil?: string | null;
  rateLimitReason?: string | null;
  isRateLimited?: boolean;
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
        `SELECT id, tenant_slug, profile_name, provider, host, port, encryption, from_email, from_name, username, password, is_default, rate_limited_until, rate_limit_reason, created_at, updated_at
         FROM tenant_sender_profiles
         WHERE LOWER(tenant_slug) = $1
         ORDER BY is_default DESC, created_at ASC`,
        [normalizedSlug]
      );

      if (res.rows.length > 0) {
        return res.rows.map((row) => {
          const isRateLimited = Boolean(
            row.rate_limited_until && new Date(row.rate_limited_until).getTime() > Date.now()
          );
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
            rateLimitedUntil: row.rate_limited_until ? new Date(row.rate_limited_until).toISOString() : null,
            rateLimitReason: row.rate_limit_reason || null,
            isRateLimited,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
          };
        });
      }
    }
  } catch (err) {
    console.warn("Error fetching sender profiles from database:", err);
  }

  const cached = memorySenderProfilesStore.get(normalizedSlug) || [];
  return cached.map((p) => ({
    ...p,
    password: p.password || "",
    hasPassword: Boolean(p.password && p.password.length > 0),
    isRateLimited: Boolean(p.rateLimitedUntil && new Date(p.rateLimitedUntil).getTime() > Date.now()),
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
        `SELECT id, tenant_slug, profile_name, provider, host, port, encryption, from_email, from_name, username, password, is_default, rate_limited_until, rate_limit_reason, created_at, updated_at
         FROM tenant_sender_profiles
         WHERE LOWER(tenant_slug) = $1 AND id = $2
         LIMIT 1`,
        [normalizedSlug, id]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const isRateLimited = Boolean(
          row.rate_limited_until && new Date(row.rate_limited_until).getTime() > Date.now()
        );
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
          rateLimitedUntil: row.rate_limited_until ? new Date(row.rate_limited_until).toISOString() : null,
          rateLimitReason: row.rate_limit_reason || null,
          isRateLimited,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
        };
      }
    }
  } catch (err) {
    console.warn("Error fetching sender profile by id:", err);
  }

  const cached = (memorySenderProfilesStore.get(normalizedSlug) || []).find((p) => p.id === id);
  if (!cached) return null;
  return {
    ...cached,
    isRateLimited: Boolean(cached.rateLimitedUntil && new Date(cached.rateLimitedUntil).getTime() > Date.now()),
  };
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

      if (fullProfile.isDefault) {
        await pool.query(
          `UPDATE tenant_sender_profiles SET is_default = false WHERE LOWER(tenant_slug) = $1 AND id != $2`,
          [normalizedSlug, id]
        );
        await saveTenantSmtpSettings({
          tenantSlug: normalizedSlug,
          provider: fullProfile.provider,
          host: fullProfile.host,
          port: fullProfile.port,
          encryption: fullProfile.encryption,
          fromEmail: fullProfile.fromEmail,
          fromName: fullProfile.fromName,
          username: fullProfile.username,
          password: fullProfile.password,
        });
      }
    }
  } catch (err) {
    console.error("Failed to persist sender profile to PostgreSQL:", err);
  }

  return {
    ...fullProfile,
    password: fullProfile.password || "",
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
  senderProfileId?: string;
}

export interface QueueCampaignParams {
  tenantSlug: string;
  recipients: MassEmailRecipient[];
  subject: string;
  messageHtml: string;
  loginUrl?: string;
  senderOverride?: Partial<SmtpSettings>;
  senderProfileId?: string;
}

export interface CampaignProgress {
  id: string;
  tenantSlug: string;
  subject: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  rateLimited?: number;
  status: "queued" | "processing" | "completed" | "failed" | "rate_limited";
  nextRetryAt?: string | null;
  progressPercent: number;
  errors: Array<{ email: string; error: string }>;
}

// In-memory queue fallback for development or disconnected states
interface MemoryQueueItem {
  id: string;
  campaignId: string;
  tenantSlug: string;
  senderProfileId?: string;
  recipientEmail: string;
  recipientName?: string;
  recipientRole?: string;
  recipientDepartment?: string;
  status: "pending" | "processing" | "sent" | "failed";
  attempts: number;
  errorMessage?: string;
  sentAt?: Date;
  nextRetryAt?: Date;
  rateLimitedAt?: Date;
}

interface MemoryCampaign {
  id: string;
  tenantSlug: string;
  subject: string;
  messageHtml: string;
  loginUrl?: string;
  senderOverride?: Partial<SmtpSettings>;
  senderProfileId?: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: "queued" | "processing" | "completed" | "failed" | "rate_limited";
  createdAt: Date;
  updatedAt: Date;
}

// In-memory profile cooldown cache (ms timestamp when cooldown ends)
const profileCooldownMemory = new Map<string, number>();

/**
 * Returns a globally unique profile key identifying the exact sending identity.
 * Format: `<tenant_slug>:<profile_id>` or `<tenant_slug>:<host>_<fromEmail>`
 */
export function getProfileKey(
  tenantSlug: string,
  profileId?: string,
  host?: string,
  fromEmail?: string
): string {
  const normTenant = (tenantSlug || "default").trim().toLowerCase();
  if (profileId && profileId !== "workspace_primary" && profileId !== "default" && profileId !== "custom") {
    return `${normTenant}:${profileId}`;
  }
  if (host && fromEmail) {
    return `${normTenant}:${host.toLowerCase().trim()}_${fromEmail.toLowerCase().trim()}`;
  }
  return `${normTenant}:workspace_primary`;
}

/**
 * Detects whether an SMTP or HTTP error represents a rate limit / quota exhaustion.
 * Checks numeric codes (421, 450, 451, 452, 429), enhanced codes (4.7.0, 4.7.1, 4.7.28, 5.4.5),
 * and standard provider error messages (Brevo, Gmail, SES, Hostinger, Mailgun, SendGrid).
 */
export function isRateLimitError(err: any): boolean {
  if (!err) return false;

  // 1. Check numeric status / response codes
  const code = err.responseCode || err.code || err.status || err.statusCode;
  const numCode = Number(code);
  if ([421, 450, 451, 452, 429].includes(numCode)) {
    return true;
  }

  // 2. Aggregate error text components
  const rawParts = [
    typeof err === "string" ? err : "",
    err.message || "",
    err.response || "",
    err.command || "",
    typeof err.toString === "function" ? err.toString() : "",
  ].join(" ").toLowerCase();

  // Enhanced SMTP codes
  if (
    rawParts.includes("4.7.0") ||
    rawParts.includes("4.7.1") ||
    rawParts.includes("4.7.28") ||
    rawParts.includes("5.4.5")
  ) {
    return true;
  }

  // Provider rate-limiting string patterns
  const rateLimitPatterns = [
    "rate limit",
    "ratelimit",
    "rate-limit",
    "too many requests",
    "too many connections",
    "too many emails",
    "too many messages",
    "daily limit",
    "daily quota",
    "daily sending limit",
    "daily message limit",
    "exceeded your daily",
    "daily user sending quota",
    "hourly limit",
    "hourly quota",
    "messages per hour limit",
    "quota exceeded",
    "exceeded quota",
    "exceeded allowance",
    "sending limit exceeded",
    "maximum sending rate",
    "user sending limit",
    "account sending limit",
    "try again later",
    "temporarily deferred",
    "greylisted",
    "greylist",
    "throttled",
    "throttling",
    "per hour limit reached",
  ];

  return rateLimitPatterns.some((pattern) => rawParts.includes(pattern));
}

/**
 * Checks whether an email profile is currently cooling down due to rate limit enforcement.
 */
export async function isProfileInCooldown(profileKey: string): Promise<boolean> {
  const cachedTime = profileCooldownMemory.get(profileKey);
  const now = Date.now();
  if (cachedTime) {
    if (cachedTime > now) return true;
    profileCooldownMemory.delete(profileKey);
  }

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT cooldown_until FROM email_profile_cooldowns WHERE profile_key = $1 AND cooldown_until > CURRENT_TIMESTAMP LIMIT 1`,
        [profileKey]
      );
      if (res.rows.length > 0) {
        const until = new Date(res.rows[0].cooldown_until).getTime();
        profileCooldownMemory.set(profileKey, until);
        return true;
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to query profile cooldown from DB:", err);
  }

  return false;
}

/**
 * Records a 24-hour rate limit cooldown for a specific email profile in memory and Neon PostgreSQL.
 */
export async function recordProfileRateLimit(params: {
  tenantSlug: string;
  senderProfileId?: string;
  provider?: string;
  host?: string;
  fromEmail?: string;
  errorMessage: string;
  cooldownDurationMs?: number; // defaults to 24 hours (86,400,000 ms)
}): Promise<{ profileKey: string; cooldownUntil: Date }> {
  const duration = params.cooldownDurationMs ?? 24 * 60 * 60 * 1000;
  const cooldownUntil = new Date(Date.now() + duration);
  const profileKey = getProfileKey(params.tenantSlug, params.senderProfileId, params.host, params.fromEmail);
  const normalizedSlug = (params.tenantSlug || "default").trim().toLowerCase();

  // 1. Update in-memory cooldown cache
  profileCooldownMemory.set(profileKey, cooldownUntil.getTime());

  // 2. Persist to PostgreSQL tables
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();

      // Upsert in email_profile_cooldowns table
      await pool.query(
        `INSERT INTO email_profile_cooldowns (
           profile_key, tenant_slug, sender_profile_id, provider, host, from_email, rate_limited_at, cooldown_until, reason, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8, CURRENT_TIMESTAMP)
         ON CONFLICT (profile_key)
         DO UPDATE SET
           rate_limited_at = CURRENT_TIMESTAMP,
           cooldown_until = EXCLUDED.cooldown_until,
           reason = EXCLUDED.reason,
           updated_at = CURRENT_TIMESTAMP`,
        [
          profileKey,
          normalizedSlug,
          params.senderProfileId || null,
          params.provider || null,
          params.host || null,
          params.fromEmail || null,
          cooldownUntil,
          params.errorMessage,
        ]
      );

      // Update tenant_sender_profiles if specific profile ID provided
      if (params.senderProfileId && params.senderProfileId !== "workspace_primary" && params.senderProfileId !== "default") {
        await pool.query(
          `UPDATE tenant_sender_profiles
           SET rate_limited_until = $1, rate_limit_reason = $2, updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [cooldownUntil, params.errorMessage, params.senderProfileId]
        );
      }

      // Update tenant_smtp_settings if primary
      await pool.query(
        `UPDATE tenant_smtp_settings
         SET rate_limited_until = $1, rate_limit_reason = $2, updated_at = CURRENT_TIMESTAMP
         WHERE LOWER(tenant_slug) = $3`,
        [cooldownUntil, params.errorMessage, normalizedSlug]
      );
    }
  } catch (err) {
    console.error("⚠️ Failed to record profile rate limit in PostgreSQL:", err);
  }

  return { profileKey, cooldownUntil };
}

/**
 * Resets a profile rate limit cooldown immediately (e.g. upon quota top-up or manual override).
 */
export async function resetProfileRateLimit(profileKey: string): Promise<void> {
  profileCooldownMemory.delete(profileKey);

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      await pool.query(`DELETE FROM email_profile_cooldowns WHERE profile_key = $1`, [profileKey]);
    }
  } catch (err) {
    console.warn("⚠️ Failed to reset profile cooldown in DB:", err);
  }
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
  const { tenantSlug, recipients, subject, messageHtml, loginUrl, senderOverride, senderProfileId } = params;
  const campaignId = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const normalizedSlug = (tenantSlug || "default").trim().toLowerCase();

  const validRecipients = recipients.filter(
    (r) => r && r.email && typeof r.email === "string" && r.email.includes("@")
  );

  if (validRecipients.length === 0) {
    throw new Error("At least one valid recipient email is required to queue a campaign");
  }

  // Check if selected profile is in active rate-limit cooldown
  const profileKey = getProfileKey(normalizedSlug, senderProfileId, senderOverride?.host, senderOverride?.fromEmail);
  const inCooldown = await isProfileInCooldown(profileKey);
  const initialRetryAt = inCooldown ? new Date(Date.now() + 24 * 60 * 60 * 1000) : new Date();
  const campaignInitialStatus = inCooldown ? "rate_limited" : "queued";

  // 1. Try to persist to Neon PostgreSQL
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();

      // Insert campaign with sender_profile_id
      await pool.query(
        `INSERT INTO email_campaigns (
           id, tenant_slug, subject, message_html, login_url, sender_override, sender_profile_id, total_recipients, status, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          campaignId,
          normalizedSlug,
          subject,
          messageHtml,
          loginUrl || null,
          senderOverride ? JSON.stringify(senderOverride) : null,
          senderProfileId || null,
          validRecipients.length,
          campaignInitialStatus,
        ]
      );

      // Batch insert queue items including sender_profile_id and next_retry_at
      const insertPromises: Promise<any>[] = [];
      const batchSize = 100;
      for (let i = 0; i < validRecipients.length; i += batchSize) {
        const chunk = validRecipients.slice(i, i + batchSize);
        const values: any[] = [];
        const placeholders: string[] = [];

        chunk.forEach((rec, idx) => {
          const offset = idx * 10;
          const itemId = `q_${campaignId}_${i + idx}`;
          placeholders.push(
            `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`
          );
          values.push(
            itemId,
            campaignId,
            normalizedSlug,
            senderProfileId || null,
            rec.email.trim(),
            rec.name || "",
            rec.role || "",
            rec.department || "",
            "pending",
            initialRetryAt
          );
        });

        const sql = `
          INSERT INTO email_queue (id, campaign_id, tenant_slug, sender_profile_id, recipient_email, recipient_name, recipient_role, recipient_department, status, next_retry_at)
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
    senderProfileId,
    totalRecipients: validRecipients.length,
    sentCount: 0,
    failedCount: 0,
    status: campaignInitialStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  validRecipients.forEach((rec, idx) => {
    memoryQueue.push({
      id: `q_${campaignId}_${idx}`,
      campaignId,
      tenantSlug: normalizedSlug,
      senderProfileId,
      recipientEmail: rec.email.trim(),
      recipientName: rec.name || "",
      recipientRole: rec.role || "",
      recipientDepartment: rec.department || "",
      status: "pending",
      attempts: 0,
      nextRetryAt: initialRetryAt,
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
  remainingRateLimited?: number;
  errors: Array<{ email: string; error: string }>;
}> {
  let processed = 0;
  let sent = 0;
  let failed = 0;
  let remainingPending = 0;
  let remainingRateLimited = 0;
  const errors: Array<{ email: string; error: string }> = [];

  // Transporter cache keyed by profile identity during this batch run
  const transporterCache = new Map<string, { transporter: any; settings: SmtpSettings }>();
  const rateLimitedProfilesThisRun = new Set<string>();

  async function getTransporterForTenant(slug: string) {
    const cacheKey = `tenant_${slug}`;
    if (transporterCache.has(cacheKey)) {
      return transporterCache.get(cacheKey)!;
    }
    const settings = await getTenantSmtpSettings(slug);
    if (!settings || !settings.host || !settings.fromEmail) {
      throw new Error(`SMTP settings are not configured for workspace "${slug}".`);
    }
    const transporter = createNodemailerTransporter(settings);
    const entry = { transporter, settings };
    transporterCache.set(cacheKey, entry);
    return entry;
  }

  // 1. Process from PostgreSQL queue if database is connected
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();

      // Atomically select and claim pending items whose profile is NOT currently in cooldown
      // and whose next_retry_at has arrived
      const claimQuery = `
        WITH active_cooldowns AS (
          SELECT profile_key FROM email_profile_cooldowns WHERE cooldown_until > CURRENT_TIMESTAMP
        ),
        claimed AS (
          SELECT q.id FROM email_queue q
          WHERE (q.status = 'pending' OR (q.status = 'processing' AND q.updated_at < CURRENT_TIMESTAMP - INTERVAL '5 minutes'))
            AND (q.next_retry_at IS NULL OR q.next_retry_at <= CURRENT_TIMESTAMP)
            AND q.attempts < 3
            AND NOT EXISTS (
              SELECT 1 FROM active_cooldowns ac
              WHERE ac.profile_key = COALESCE(q.tenant_slug || ':' || q.sender_profile_id, q.tenant_slug || ':workspace_primary')
            )
          ORDER BY q.created_at ASC
          LIMIT $1
          FOR UPDATE SKIP LOCKED
        )
        UPDATE email_queue
        SET status = 'processing', attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id IN (SELECT id FROM claimed)
        RETURNING id, campaign_id, tenant_slug, sender_profile_id, recipient_email, recipient_name, recipient_role, recipient_department, attempts;
      `;

      const claimedResult = await pool.query(claimQuery, [batchSize]);
      const claimedItems = claimedResult.rows;

      if (claimedItems && claimedItems.length > 0) {
        // Fetch campaign details for these items
        const campaignIds = Array.from(new Set(claimedItems.map((item) => item.campaign_id)));
        const campaignsResult = await pool.query(
          `SELECT id, tenant_slug, subject, message_html, login_url, sender_override, sender_profile_id FROM email_campaigns WHERE id = ANY($1)`,
          [campaignIds]
        );
        const campaignsMap = new Map<string, any>();
        campaignsResult.rows.forEach((c) => campaignsMap.set(c.id, c));

        for (const item of claimedItems) {
          const campaign = campaignsMap.get(item.campaign_id);
          if (!campaign) {
            processed++;
            failed++;
            await pool.query(
              `UPDATE email_queue SET status = 'failed', error_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
              ["Associated campaign not found", item.id]
            );
            continue;
          }

          // Resolve effective sender profile ID and profile key
          const effectiveProfileId = item.sender_profile_id || campaign.sender_profile_id || undefined;

          // Check if this profile encountered rate limits earlier in this execution run
          const preCheckKey = getProfileKey(item.tenant_slug, effectiveProfileId);
          if (rateLimitedProfilesThisRun.has(preCheckKey)) {
            // Defer item for 24h retry without penalizing attempts budget
            await pool.query(
              `UPDATE email_queue
               SET status = 'pending', attempts = GREATEST(0, attempts - 1), next_retry_at = CURRENT_TIMESTAMP + INTERVAL '24 hours', updated_at = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [item.id]
            );
            continue;
          }

          processed++;

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

            // Determine transporter cache key for per-profile isolation
            const profileCacheKey = effectiveProfileId && effectiveProfileId !== "workspace_primary"
              ? `${item.tenant_slug}:${effectiveProfileId}`
              : overrideSettings?.host && overrideSettings?.fromEmail
              ? `override_${campaign.id}`
              : `tenant_${item.tenant_slug}`;

            if (transporterCache.has(profileCacheKey)) {
              const entry = transporterCache.get(profileCacheKey)!;
              effectiveTransporter = entry.transporter;
              effectiveSettings = entry.settings;
            } else if (overrideSettings && overrideSettings.host && overrideSettings.fromEmail) {
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
              effectiveTransporter = createNodemailerTransporter(fullSettings);
              effectiveSettings = fullSettings;
              transporterCache.set(profileCacheKey, { transporter: effectiveTransporter, settings: fullSettings });
            } else if (effectiveProfileId && effectiveProfileId !== "workspace_primary" && effectiveProfileId !== "default") {
              const prof = await getTenantSenderProfileById(item.tenant_slug, effectiveProfileId);
              if (prof && prof.host && prof.fromEmail) {
                const fullSettings: SmtpSettings = {
                  tenantSlug: item.tenant_slug,
                  provider: prof.provider || "custom",
                  host: prof.host,
                  port: Number(prof.port) || 587,
                  encryption: (prof.encryption as any) || "tls",
                  fromEmail: prof.fromEmail,
                  fromName: prof.fromName || "Workspace Admin",
                  username: prof.username || prof.fromEmail,
                  password: prof.password || "",
                };
                effectiveTransporter = createNodemailerTransporter(fullSettings);
                effectiveSettings = fullSettings;
                transporterCache.set(profileCacheKey, { transporter: effectiveTransporter, settings: fullSettings });
              } else {
                const entry = await getTransporterForTenant(item.tenant_slug);
                effectiveTransporter = entry.transporter;
                effectiveSettings = entry.settings;
              }
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

            // Throttle between dispatches to comply with provider rate limits
            await new Promise((resolve) => setTimeout(resolve, 600));
          } catch (sendErr: any) {
            const errMsg = sendErr.message || "Failed to deliver email";
            const rateLimited = isRateLimitError(sendErr);

            if (rateLimited) {
              const currentProfileKey = getProfileKey(
                item.tenant_slug,
                effectiveProfileId,
                transporterCache.get(preCheckKey)?.settings.host,
                transporterCache.get(preCheckKey)?.settings.fromEmail
              );

              console.warn(
                `⏳ Rate limit encountered for profile "${currentProfileKey}" (${item.tenant_slug}): ${errMsg}. Queueing emails for retry in 24 hours.`
              );

              // 1. Put this item back to pending with 24-hour next_retry_at, preserving retry attempts budget
              await pool.query(
                `UPDATE email_queue
                 SET status = 'pending',
                     attempts = GREATEST(0, attempts - 1),
                     next_retry_at = CURRENT_TIMESTAMP + INTERVAL '24 hours',
                     rate_limited_at = CURRENT_TIMESTAMP,
                     error_message = $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [`Rate limit exceeded: ${errMsg}. Scheduled for retry in 24 hours.`, item.id]
              );

              // 2. Put this specific email profile into 24-hour rate limit cooldown
              await recordProfileRateLimit({
                tenantSlug: item.tenant_slug,
                senderProfileId: effectiveProfileId,
                provider: transporterCache.get(preCheckKey)?.settings.provider,
                host: transporterCache.get(preCheckKey)?.settings.host,
                fromEmail: transporterCache.get(preCheckKey)?.settings.fromEmail,
                errorMessage: errMsg,
                cooldownDurationMs: 24 * 60 * 60 * 1000,
              });

              rateLimitedProfilesThisRun.add(currentProfileKey);
              rateLimitedProfilesThisRun.add(preCheckKey);

              // 3. Release any remaining unsent items for THIS profile in current claimed batch
              const curIdx = claimedItems.indexOf(item);
              const remainingUnsentForProfile = claimedItems.slice(curIdx + 1).filter((r) => {
                const rKey = getProfileKey(r.tenant_slug, r.sender_profile_id);
                return rKey === currentProfileKey || rKey === preCheckKey || r.campaign_id === item.campaign_id;
              });

              if (remainingUnsentForProfile.length > 0) {
                const remIds = remainingUnsentForProfile.map((r) => r.id);
                await pool.query(
                  `UPDATE email_queue
                   SET status = 'pending',
                       attempts = GREATEST(0, attempts - 1),
                       next_retry_at = CURRENT_TIMESTAMP + INTERVAL '24 hours',
                       rate_limited_at = CURRENT_TIMESTAMP,
                       error_message = $1,
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = ANY($2)`,
                  [`Profile paused due to rate limit: ${errMsg}. Scheduled for retry in 24 hours.`, remIds]
                );
              }

              // 4. Batch defer all remaining pending items in the database for this profile/campaign by 24h
              await pool.query(
                `UPDATE email_queue
                 SET next_retry_at = CURRENT_TIMESTAMP + INTERVAL '24 hours',
                     rate_limited_at = CURRENT_TIMESTAMP,
                     error_message = $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE ((sender_profile_id = $2 AND sender_profile_id IS NOT NULL) OR campaign_id = $3)
                   AND status = 'pending'
                   AND (next_retry_at IS NULL OR next_retry_at < CURRENT_TIMESTAMP + INTERVAL '24 hours')`,
                [
                  `Rate limit cooldown: ${errMsg}. Retrying in 24 hours.`,
                  effectiveProfileId || null,
                  item.campaign_id,
                ]
              );

              // Continue to next item — other profiles in this batch will proceed without interruption!
              continue;
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
               COUNT(*) FILTER (WHERE status = 'pending' AND (next_retry_at IS NULL OR next_retry_at <= CURRENT_TIMESTAMP)) as pending_ready,
               COUNT(*) FILTER (WHERE status = 'pending' AND next_retry_at > CURRENT_TIMESTAMP) as pending_rate_limited
             FROM email_queue
             WHERE campaign_id = $1`,
            [cid]
          );

          if (countsRes.rows.length > 0) {
            const row = countsRes.rows[0];
            const total = Number(row.total);
            const sentCount = Number(row.sent);
            const failedCount = Number(row.failed);
            const pendingReady = Number(row.pending_ready);
            const pendingRateLimited = Number(row.pending_rate_limited);

            let campaignStatus: "queued" | "processing" | "completed" | "failed" | "rate_limited";
            if (sentCount + failedCount >= total && total > 0) {
              campaignStatus = "completed";
            } else if (pendingReady === 0 && pendingRateLimited > 0) {
              campaignStatus = "rate_limited";
            } else {
              campaignStatus = "processing";
            }

            await pool.query(
              `UPDATE email_campaigns
               SET sent_count = $1, failed_count = $2, status = $3, updated_at = CURRENT_TIMESTAMP
               WHERE id = $4`,
              [sentCount, failedCount, campaignStatus, cid]
            );
          }
        }
      }

      // Check remaining ready vs rate-limited items across the queue
      const pendingCountRes = await pool.query(
        `SELECT 
           COUNT(*) FILTER (WHERE status = 'pending' AND (next_retry_at IS NULL OR next_retry_at <= CURRENT_TIMESTAMP) AND attempts < 3) as ready_count,
           COUNT(*) FILTER (WHERE status = 'pending' AND next_retry_at > CURRENT_TIMESTAMP AND attempts < 3) as rate_limited_count
         FROM email_queue`
      );
      remainingPending = Number(pendingCountRes.rows[0]?.ready_count || 0);
      remainingRateLimited = Number(pendingCountRes.rows[0]?.rate_limited_count || 0);

      return { processed, sent, failed, remainingPending, remainingRateLimited, errors };
    }
  } catch (err) {
    console.warn("⚠️ PostgreSQL queue processing encountered error, checking memory queue:", err);
  }

  // 2. Process memory queue items if DB not active or returned empty
  const nowTime = new Date();
  const pendingMemoryItems = memoryQueue
    .filter((q) => q.status === "pending" && q.attempts < 3 && (!q.nextRetryAt || q.nextRetryAt <= nowTime))
    .slice(0, batchSize);

  for (const item of pendingMemoryItems) {
    const memCampaign = memoryCampaigns.get(item.campaignId);
    if (!memCampaign) {
      processed++;
      item.status = "failed";
      item.errorMessage = "Associated campaign not found";
      failed++;
      continue;
    }

    const effectiveProfileId = item.senderProfileId || memCampaign.senderProfileId;
    const preCheckKey = getProfileKey(item.tenantSlug, effectiveProfileId);
    if (rateLimitedProfilesThisRun.has(preCheckKey)) {
      item.nextRetryAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      continue;
    }

    processed++;
    item.status = "processing";
    item.attempts++;

    try {
      let effectiveTransporter: any;
      let effectiveSettings: SmtpSettings;

      if (memCampaign.senderOverride && memCampaign.senderOverride.host && memCampaign.senderOverride.fromEmail) {
        const fullSettings: SmtpSettings = {
          tenantSlug: item.tenantSlug,
          provider: memCampaign.senderOverride.provider || "custom",
          host: memCampaign.senderOverride.host,
          port: Number(memCampaign.senderOverride.port) || 587,
          encryption: (memCampaign.senderOverride.encryption as any) || "tls",
          fromEmail: memCampaign.senderOverride.fromEmail,
          fromName: memCampaign.senderOverride.fromName || "Workspace Admin",
          username: memCampaign.senderOverride.username || memCampaign.senderOverride.fromEmail,
          password: memCampaign.senderOverride.password || "",
        };
        effectiveTransporter = createNodemailerTransporter(fullSettings);
        effectiveSettings = fullSettings;
      } else {
        const entry = await getTransporterForTenant(item.tenantSlug);
        effectiveTransporter = entry.transporter;
        effectiveSettings = entry.settings;
      }

      const { resolvedLoginUrl, resolvedPortalUrl } = resolveUrls(item.tenantSlug, memCampaign.loginUrl);

      const recipientObj: MassEmailRecipient = {
        email: item.recipientEmail,
        name: item.recipientName,
        role: item.recipientRole,
        department: item.recipientDepartment,
      };

      const personalizedSubject = personalizeTemplate(memCampaign.subject, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
      const personalizedHtml = personalizeTemplate(memCampaign.messageHtml, recipientObj, resolvedLoginUrl, resolvedPortalUrl);
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
      memCampaign.sentCount++;
    } catch (sendErr: any) {
      const errMsg = sendErr.message || "Failed to deliver email";
      const rateLimited = isRateLimitError(sendErr);

      if (rateLimited) {
        const currentProfileKey = getProfileKey(
          item.tenantSlug,
          effectiveProfileId,
          memCampaign.senderOverride?.host,
          memCampaign.senderOverride?.fromEmail
        );

        item.status = "pending";
        item.attempts = Math.max(0, item.attempts - 1);
        item.nextRetryAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        item.rateLimitedAt = new Date();
        item.errorMessage = `Rate limit reached: ${errMsg}. Scheduled for retry in 24 hours.`;

        rateLimitedProfilesThisRun.add(currentProfileKey);
        rateLimitedProfilesThisRun.add(preCheckKey);
        profileCooldownMemory.set(currentProfileKey, item.nextRetryAt.getTime());

        // Defer all remaining items for this profile/campaign by 24h
        memoryQueue.forEach((q) => {
          if (
            (q.campaignId === item.campaignId || (q.senderProfileId === effectiveProfileId && effectiveProfileId)) &&
            q.status === "pending"
          ) {
            q.nextRetryAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            q.rateLimitedAt = new Date();
          }
        });
        continue;
      } else {
        item.status = item.attempts >= 3 ? "failed" : "pending";
        item.errorMessage = errMsg;
        failed++;
        memCampaign.failedCount++;
        errors.push({ email: item.recipientEmail, error: errMsg });
      }
    }

    // Update memory campaign status
    const pendingReady = memoryQueue.filter(
      (q) => q.campaignId === memCampaign.id && q.status === "pending" && (!q.nextRetryAt || q.nextRetryAt <= new Date())
    ).length;
    const pendingRateLimited = memoryQueue.filter(
      (q) => q.campaignId === memCampaign.id && q.status === "pending" && q.nextRetryAt && q.nextRetryAt > new Date()
    ).length;
    const totalRemaining = pendingReady + pendingRateLimited;

    if (totalRemaining === 0) {
      memCampaign.status = "completed";
    } else if (pendingReady === 0 && pendingRateLimited > 0) {
      memCampaign.status = "rate_limited";
    } else {
      memCampaign.status = "processing";
    }
    memCampaign.updatedAt = new Date();
  }

  remainingPending = memoryQueue.filter(
    (q) => q.status === "pending" && q.attempts < 3 && (!q.nextRetryAt || q.nextRetryAt <= new Date())
  ).length;
  remainingRateLimited = memoryQueue.filter(
    (q) => q.status === "pending" && q.attempts < 3 && q.nextRetryAt && q.nextRetryAt > new Date()
  ).length;

  return { processed, sent, failed, remainingPending, remainingRateLimited, errors };
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

        // Get failed & rate-limited recipient counts and retry schedules
        const statsRes = await pool.query(
          `SELECT 
             COUNT(*) FILTER (WHERE status = 'pending' AND next_retry_at > CURRENT_TIMESTAMP) as rate_limited_count,
             MIN(next_retry_at) FILTER (WHERE status = 'pending' AND next_retry_at > CURRENT_TIMESTAMP) as earliest_retry
           FROM email_queue
           WHERE campaign_id = $1`,
          [campaignId]
        );
        const rateLimitedCount = Number(statsRes.rows[0]?.rate_limited_count || 0);
        const earliestRetry = statsRes.rows[0]?.earliest_retry
          ? new Date(statsRes.rows[0].earliest_retry).toISOString()
          : null;

        // Get failed recipient details
        const errorsRes = await pool.query(
          `SELECT recipient_email, error_message
           FROM email_queue
           WHERE campaign_id = $1 AND (status = 'failed' OR (status = 'pending' AND next_retry_at > CURRENT_TIMESTAMP)) AND error_message IS NOT NULL
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
          rateLimited: rateLimitedCount,
          status: row.status as any,
          nextRetryAt: earliestRetry,
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
    const rateLimitedItems = memoryQueue.filter(
      (q) => q.campaignId === campaignId && q.status === "pending" && q.nextRetryAt && q.nextRetryAt > new Date()
    );
    const rateLimited = rateLimitedItems.length;
    const earliest = rateLimitedItems.reduce<Date | null>((acc, cur) => {
      if (!cur.nextRetryAt) return acc;
      return !acc || cur.nextRetryAt < acc ? cur.nextRetryAt : acc;
    }, null);

    const errors = memoryQueue
      .filter((q) => q.campaignId === campaignId && (q.status === "failed" || q.errorMessage))
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
      rateLimited,
      status: memCamp.status,
      nextRetryAt: earliest ? earliest.toISOString() : null,
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
  status: "queued" | "processing" | "completed" | "failed" | "rate_limited";
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

export interface EffectiveTenantAuthSmtpResult {
  settings: SmtpSettings;
  senderName: string;
  senderEmail: string;
  senderFormatted: string;
  isTenantSpecific: boolean;
  envSettings: SmtpSettings;
}

/**
 * Resolves the Platform Workspace Email Service configured in @ofia_admin (tenant_slug = 'platform')
 * for authentication requests, billing notifications, and platform-level security notifications.
 *
 * Architecture Rule:
 * 1. Platform-level admin notifications, authentication (password reset, password changed notices, email verification),
 *    and billing notifications strictly use the Ofia Platform Email service configured in @ofia_admin.
 * 2. Tenant workspace email settings are dedicated to tenant business utilities (sending emails to clients or staff).
 */
export async function getPlatformAuthSmtp(
  tenantNameFallback?: string
): Promise<EffectiveTenantAuthSmtpResult> {
  // 1. Centralized Platform SMTP Relay (tenant_slug = 'platform') configured in ofia_admin
  let platformSettings: SmtpSettings | null = null;
  try {
    const platformDbSettings = await getTenantSmtpSettings("platform");
    if (
      platformDbSettings &&
      platformDbSettings.host &&
      (platformDbSettings.password || platformDbSettings.hasPassword)
    ) {
      platformSettings = platformDbSettings;
    }
  } catch (e) {
    console.warn("Failed to retrieve platform SMTP settings from database:", e);
  }

  // 2. Platform Environment Variables Fallback (.env)
  const envSettings: SmtpSettings = {
    tenantSlug: "platform",
    provider: process.env.SMTP_HOST?.includes("brevo") ? "brevo" : "hostinger",
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT) || 465,
    encryption: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT ? "ssl" : "tls",
    fromEmail: process.env.SMTP_FROM_EMAIL || "growth@ofia.ng",
    fromName: process.env.SMTP_FROM_NAME || "Ofia Platform Security",
    username: process.env.SMTP_USER || "growth@ofia.ng",
    password: process.env.SMTP_PASSWORD || "",
  };

  const finalSettings = platformSettings || envSettings;

  // Platform Sender Display Name configured in ofia_admin
  const senderName =
    finalSettings.fromName && finalSettings.fromName.trim() !== ""
      ? finalSettings.fromName.trim()
      : "Ofia Platform Security";

  const senderEmail = finalSettings.fromEmail || envSettings.fromEmail;
  const senderFormatted = `"${senderName.replace(/"/g, "")}" <${senderEmail}>`;

  return {
    settings: finalSettings,
    senderName,
    senderEmail,
    senderFormatted,
    isTenantSpecific: false,
    envSettings,
  };
}

// Convenience alias ensuring any callers resolve platform SMTP
export const getEffectiveTenantAuthSmtp = async (
  _tenantSlug?: string,
  tenantNameFallback?: string
) => getPlatformAuthSmtp(tenantNameFallback);

/**
 * Send a secure, branded password reset email using the Ofia Platform Email Service
 * configured in @ofia_admin (tenant_slug = 'platform'), with automatic fallback to platform env.
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

  const { settings, senderName, senderEmail, senderFormatted, envSettings } =
    await getPlatformAuthSmtp(tenantName);

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
          <span>🔒</span> ${senderName}
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
        <p style="margin: 0 0 6px;">Sent automatically by Ofia Platform Security Infrastructure on behalf of ${tenantName}.</p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Ofia Technologies Ltd. All rights reserved.</p>
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

— Ofia Platform Security
  `.trim();

  try {
    const transporter = createNodemailerTransporter(settings);
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
    console.error("Failed to deliver password reset email via platform SMTP:", err);

    // If primary platform SMTP failed, attempt fallback to platform environment SMTP
    if (settings !== envSettings) {
      try {
        const fallbackTransporter = createNodemailerTransporter(envSettings);
        const fallbackInfo = await fallbackTransporter.sendMail({
          from: senderFormatted,
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
 * Strictly uses the Ofia Platform Email Service configured in @ofia_admin (tenant_slug = 'platform').
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

  const { settings, senderName, senderEmail, senderFormatted, envSettings } =
    await getPlatformAuthSmtp(tenantName);

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
    <div style="display: inline-block; padding: 4px 12px; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 999px; color: #1a56db; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">
      🔒 ${senderName}
    </div>
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
      If you did not make this change, please contact Ofia platform security or your workspace administrator immediately.
    </p>
    <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 24px;">
      Sent automatically by Ofia Platform Security Infrastructure.
    </p>
  </div>
</body>
</html>
  `;

  try {
    const transporter = createNodemailerTransporter(settings);
    const info = await transporter.sendMail({
      from: senderFormatted,
      to: recipientEmail,
      replyTo: "support@ofia.ng",
      subject,
      html,
      text: `Hello ${recipientName},\n\nThe password for your account on ${tenantName} was successfully changed on ${new Date().toUTCString()}.\n\nIf you did not authorize this change, please contact support immediately.\n\n— Ofia Platform Security`,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to deliver password change notification via platform SMTP:", err);
    if (settings !== envSettings) {
      try {
        const fallbackTransporter = createNodemailerTransporter(envSettings);
        const fallbackInfo = await fallbackTransporter.sendMail({
          from: senderFormatted,
          to: recipientEmail,
          replyTo: "support@ofia.ng",
          subject,
          html,
          text: `Hello ${recipientName},\n\nThe password for your account on ${tenantName} was successfully changed on ${new Date().toUTCString()}.\n\nIf you did not authorize this change, please contact support immediately.\n\n— Ofia Platform Security`,
        });
        return { success: true, messageId: fallbackInfo.messageId };
      } catch (fallbackErr: any) {
        return { success: false, error: fallbackErr.message };
      }
    }
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
 * Strictly uses the Ofia Platform Email Service configured in @ofia_admin (tenant_slug = 'platform').
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

  const { settings, senderName, senderEmail, senderFormatted, envSettings } =
    await getPlatformAuthSmtp(tenantName);

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
    <div style="display: inline-block; padding: 4px 12px; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 999px; color: #1a56db; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">
      ✉️ ${senderName}
    </div>
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
    const transporter = createNodemailerTransporter(settings);
    const info = await transporter.sendMail({
      from: senderFormatted,
      to: recipientEmail,
      replyTo: "support@ofia.ng",
      subject,
      html,
      text: `Hello ${recipientName},\n\nPlease verify your email for ${tenantName} by visiting:\n${verificationUrl}\n\n— Ofia Platform Security`,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to deliver email verification via platform SMTP:", err);
    if (settings !== envSettings) {
      try {
        const fallbackTransporter = createNodemailerTransporter(envSettings);
        const fallbackInfo = await fallbackTransporter.sendMail({
          from: senderFormatted,
          to: recipientEmail,
          replyTo: "support@ofia.ng",
          subject,
          html,
          text: `Hello ${recipientName},\n\nPlease verify your email for ${tenantName} by visiting:\n${verificationUrl}\n\n— Ofia Platform Security`,
        });
        return { success: true, messageId: fallbackInfo.messageId };
      } catch (fallbackErr: any) {
        return { success: false, error: fallbackErr.message };
      }
    }
    return { success: false, error: err.message };
  }
}

export interface BillingNotificationParams {
  recipientEmail: string;
  recipientName?: string;
  tenantName: string;
  invoiceNumber?: string;
  amount?: string;
  planName?: string;
  status?: string;
  billingPortalUrl?: string;
}

/**
 * Dispatches billing, subscription, or invoice notifications.
 * Strictly uses the Ofia Platform Email Service configured in @ofia_admin (tenant_slug = 'platform').
 */
export async function sendPlatformBillingNotificationEmail(
  params: BillingNotificationParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    recipientEmail,
    recipientName = "Valued Customer",
    tenantName,
    invoiceNumber,
    amount,
    planName = "Enterprise Subscription",
    status = "Active",
    billingPortalUrl = "https://app.ofia.ng/tenant/billing",
  } = params;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, error: "Invalid recipient email address" };
  }

  const { settings, senderName, senderFormatted, envSettings } =
    await getPlatformAuthSmtp(tenantName);

  const subject = `[Billing Notice] Subscription Update for ${tenantName}`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 32px auto; padding: 28px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
    <div style="display: inline-block; padding: 4px 12px; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 999px; color: #1a56db; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px;">
      💳 ${senderName}
    </div>
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Subscription & Billing Update</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">Hello ${recipientName},</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      This is an administrative billing notice regarding your workspace subscription for <strong>${tenantName}</strong>.
    </p>
    <div style="background: #f8fafc; border-left: 4px solid #1a56db; padding: 14px 18px; margin: 20px 0; border-radius: 6px; font-size: 13px; color: #334155;">
      <p style="margin: 4px 0;"><strong>Plan:</strong> ${planName}</p>
      ${invoiceNumber ? `<p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>` : ""}
      ${amount ? `<p style="margin: 4px 0;"><strong>Amount:</strong> ${amount}</p>` : ""}
      <p style="margin: 4px 0;"><strong>Status:</strong> ${status}</p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${billingPortalUrl}" target="_blank" style="display: inline-block; padding: 12px 26px; background-color: #1a56db; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 10px;">
        Manage Billing & Invoices &rarr;
      </a>
    </div>
    <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 24px;">
      Sent automatically by Ofia Platform Billing & Security Infrastructure.
    </p>
  </div>
</body>
</html>
  `;

  try {
    const transporter = createNodemailerTransporter(settings);
    const info = await transporter.sendMail({
      from: senderFormatted,
      to: recipientEmail,
      replyTo: "billing@ofia.ng",
      subject,
      html,
      text: `Hello ${recipientName},\n\nThis is a billing notification for ${tenantName}.\nPlan: ${planName}\nStatus: ${status}\n\nManage billing: ${billingPortalUrl}\n\n— Ofia Platform Billing`,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Failed to deliver billing notification via primary platform SMTP:", err);
    if (settings !== envSettings) {
      try {
        const fallbackTransporter = createNodemailerTransporter(envSettings);
        const fallbackInfo = await fallbackTransporter.sendMail({
          from: senderFormatted,
          to: recipientEmail,
          replyTo: "billing@ofia.ng",
          subject,
          html,
          text: `Hello ${recipientName},\n\nThis is a billing notification for ${tenantName}.\nPlan: ${planName}\nStatus: ${status}\n\nManage billing: ${billingPortalUrl}\n\n— Ofia Platform Billing`,
        });
        return { success: true, messageId: fallbackInfo.messageId };
      } catch (fallbackErr: any) {
        return { success: false, error: fallbackErr.message };
      }
    }
    return { success: false, error: err.message };
  }
}

// Convenience Aliases
export const sendTenantPasswordResetEmail = sendPlatformPasswordResetEmail;
export const sendTenantPasswordChangedEmail = sendPlatformPasswordChangedEmail;
export const sendTenantEmailVerificationEmail = sendPlatformEmailVerificationEmail;


