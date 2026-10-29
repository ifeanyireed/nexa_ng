import nodemailer from "nodemailer";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { buildUnsubscribeUrl } from "@/lib/unsubscribe-token";

const CRM_UNSUBSCRIBE_SECRET =
  process.env.CRM_UNSUBSCRIBE_SECRET ||
  process.env.JWT_SECRET ||
  "ofia-crm-secret";

interface BlastTrackingPayload {
  tenantSlug: string;
  blastId: string;
  recipientId: string;
  email: string;
}

function createTrackingToken(payload: BlastTrackingPayload): string {
  const jsonStr = JSON.stringify(payload);
  const encodedPayload = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", CRM_UNSUBSCRIBE_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function resolveAppBaseUrl(tenantSlug: string): string {
  // 1. Explicit tracking base override
  const trackingOverride = process.env.CRM_TRACKING_BASE_URL;
  if (trackingOverride && trackingOverride.startsWith("http")) {
    return trackingOverride.replace(/\/+$/, "");
  }

  // 2. Multi-tenant subdomain (enforces HTTPS so Gmail proxy and Apple Mail never drop tracking pixels)
  const clean = (tenantSlug || "").trim().toLowerCase();
  if (clean && clean !== "default" && clean !== "platform") {
    return `https://${clean}.ofia.ng`;
  }

  // 3. Fallback to app domain or env URL, enforcing HTTPS in non-local environments
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (appUrl && appUrl.startsWith("http")) {
    if (appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
      return appUrl.replace(/\/+$/, "");
    }
    return appUrl.replace(/^http:\/\//i, "https://").replace(/\/+$/, "");
  }

  return "https://app.ofia.ng";
}

interface SmtpResolvedConfig {
  host: string;
  port: number;
  encryption: string;
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
}

async function resolveSmtpConfig(
  sql: any,
  tenantSlug: string,
  senderProfileId?: string | null,
  senderOverrideStr?: string | null
): Promise<SmtpResolvedConfig | null> {
  // 1. Check sender_override (custom JSON override)
  if (senderOverrideStr && senderOverrideStr.trim()) {
    try {
      const parsed = JSON.parse(senderOverrideStr);
      if (parsed.host && parsed.password && parsed.password !== "••••••••") {
        return {
          host: parsed.host,
          port: Number(parsed.port) || 587,
          encryption: parsed.encryption || "tls",
          username: parsed.username || "",
          password: parsed.password || "",
          fromEmail: parsed.fromEmail || "",
          fromName: parsed.fromName || "",
        };
      }
    } catch {}
  }

  // 2. Check tenant_sender_profiles by ID or default
  if (senderProfileId && senderProfileId.trim()) {
    const profRows = await sql`
      SELECT host, port, encryption, username, password, from_email, from_name
      FROM tenant_sender_profiles
      WHERE id = ${senderProfileId.trim()} AND LOWER(tenant_slug) = ${tenantSlug}
      LIMIT 1;
    `;
    if (profRows.length > 0 && profRows[0].host && profRows[0].password) {
      const p = profRows[0];
      return {
        host: p.host,
        port: Number(p.port) || 587,
        encryption: p.encryption || "tls",
        username: p.username || "",
        password: p.password || "",
        fromEmail: p.from_email || "",
        fromName: p.from_name || "",
      };
    }
  }

  // 3. Fallback to default sender profile
  const defaultProfRows = await sql`
    SELECT host, port, encryption, username, password, from_email, from_name
    FROM tenant_sender_profiles
    WHERE LOWER(tenant_slug) = ${tenantSlug} AND is_default = TRUE
    LIMIT 1;
  `;
  if (defaultProfRows.length > 0 && defaultProfRows[0].host && defaultProfRows[0].password) {
    const p = defaultProfRows[0];
    return {
      host: p.host,
      port: Number(p.port) || 587,
      encryption: p.encryption || "tls",
      username: p.username || "",
      password: p.password || "",
      fromEmail: p.from_email || "",
      fromName: p.from_name || "",
    };
  }

  // 4. Fallback to tenant_smtp_settings
  const smtpRows = await sql`
    SELECT host, port, encryption, username, password, from_email, from_name
    FROM tenant_smtp_settings
    WHERE LOWER(tenant_slug) = ${tenantSlug}
    LIMIT 1;
  `;
  if (smtpRows.length > 0 && smtpRows[0].host && smtpRows[0].password) {
    const s = smtpRows[0];
    return {
      host: s.host,
      port: Number(s.port) || 587,
      encryption: s.encryption || "tls",
      username: s.username || "",
      password: s.password || "",
      fromEmail: s.from_email || "",
      fromName: s.from_name || "",
    };
  }

  return null;
}

export async function dispatchBlastEmails(tenantSlug: string, blastId: string): Promise<void> {
  const normSlug = tenantSlug.toLowerCase().trim();
  try {
    const sql = await getTenantSql(normSlug);

    // 1. Fetch Blast details
    const blastRows = await sql`
      SELECT id, title, subject, content_html, preview_text, list_id, sender_name, sender_email, sender_override, sender_profile_id
      FROM crm_email_blasts
      WHERE id = ${blastId} AND LOWER(tenant_slug) = ${normSlug}
      LIMIT 1;
    `;

    if (!blastRows || blastRows.length === 0) {
      console.warn(`[Blast Dispatcher] Blast '${blastId}' not found for tenant '${normSlug}'.`);
      return;
    }

    const blast = blastRows[0];
    const smtpConfig = await resolveSmtpConfig(
      sql,
      normSlug,
      blast.sender_profile_id,
      blast.sender_override
    );

    if (!smtpConfig || !smtpConfig.host || !smtpConfig.password) {
      const failReason = `No verified SMTP relay or sender profile configured for workspace '${normSlug}'`;
      await sql`
        UPDATE crm_email_blasts
        SET status = 'FAILED', updated_at = NOW()
        WHERE id = ${blastId} AND LOWER(tenant_slug) = ${normSlug};
      `;
      await sql`
        UPDATE crm_email_blast_recipients
        SET status = 'FAILED', error_message = ${failReason}
        WHERE blast_id = ${blastId} AND LOWER(tenant_slug) = ${normSlug} AND status = 'PENDING';
      `;
      return;
    }

    // 2. Mark blast as SENDING
    await sql`
      UPDATE crm_email_blasts
      SET status = 'SENDING', updated_at = NOW()
      WHERE id = ${blastId} AND LOWER(tenant_slug) = ${normSlug};
    `;

    // 3. Fetch up to 40 pending recipients per batch (chunked delivery for serverless resilience)
    const recipients = await sql`
      SELECT r.id, r.subscriber_id, r.email,
             COALESCE(NULLIF(r.name, ''), s.name, '') AS name,
             COALESCE(NULLIF(r.first_name, ''), s.first_name, '') AS first_name,
             COALESCE(NULLIF(r.last_name, ''), s.last_name, '') AS last_name,
             COALESCE(NULLIF(r.company, ''), s.company, '') AS company
      FROM crm_email_blast_recipients r
      LEFT JOIN crm_email_subscribers s ON s.id = r.subscriber_id OR (LOWER(s.email) = LOWER(r.email) AND LOWER(s.tenant_slug) = LOWER(r.tenant_slug))
      WHERE r.blast_id = ${blastId} AND LOWER(r.tenant_slug) = ${normSlug} AND r.status = 'PENDING'
      ORDER BY r.created_at ASC
      LIMIT 40;
    `;

    if (recipients.length === 0) {
      const countRows = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'SENT')::int AS sent_cnt,
          COUNT(*) FILTER (WHERE status = 'FAILED')::int AS fail_cnt
        FROM crm_email_blast_recipients
        WHERE blast_id = ${blastId} AND LOWER(tenant_slug) = ${normSlug};
      `;
      const counts = countRows[0] || { sent_cnt: 0, fail_cnt: 0 };
      const finalStatus = counts.sent_cnt > 0 ? "SENT" : (counts.fail_cnt > 0 ? "FAILED" : "DRAFT");

      await sql`
        UPDATE crm_email_blasts
        SET status = ${finalStatus},
            sent_count = ${counts.sent_cnt},
            failed_count = ${counts.fail_cnt},
            sent_at = COALESCE(sent_at, NOW()),
            updated_at = NOW()
        WHERE id = ${blastId} AND LOWER(tenant_slug) = ${normSlug};
      `;
      return;
    }

    // 4. Create Nodemailer transporter
    const isDirectSsl = Number(smtpConfig.port) === 465 || smtpConfig.encryption === "ssl";
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port),
      secure: isDirectSsl,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const senderEmail = (blast.sender_email || smtpConfig.fromEmail || "").trim();
    const senderName = (blast.sender_name || smtpConfig.fromName || "Commercial Update").trim();
    const formattedSender = `"${senderName.replace(/"/g, "")}" <${senderEmail}>`;
    const appBaseUrl = resolveAppBaseUrl(normSlug);

    // 5. Send emails sequentially to honor rate limits and prevent spam blocks
    for (const rec of recipients) {
      const recipientEmail = (rec.email || "").trim().toLowerCase();
      if (!recipientEmail || !recipientEmail.includes("@")) {
        await sql`
          UPDATE crm_email_blast_recipients
          SET status = 'FAILED', error_message = 'Invalid email address', attempts = attempts + 1
          WHERE id = ${rec.id} AND LOWER(tenant_slug) = ${normSlug};
        `;
        continue;
      }

      const recName = (rec.name || "").trim() || `${rec.first_name || ""} ${rec.last_name || ""}`.trim() || recipientEmail.split("@")[0];
      const recFn = (rec.first_name || "").trim() || recName.split(" ")[0] || "Valued Partner";
      const recLn = (rec.last_name || "").trim() || (recName.split(" ").slice(1).join(" ")) || "";
      const recCompany = (rec.company || "").trim() || "Organization";

      // Build personalized tracking URLs
      const trackingToken = createTrackingToken({
        tenantSlug: normSlug,
        blastId,
        recipientId: rec.id,
        email: recipientEmail,
      });

      const openTrackingPixel = `<img src="${appBaseUrl}/api/erp/crm/track/open?token=${encodeURIComponent(trackingToken)}" width="1" height="1" alt="" style="display:none !important;" />`;
      const unsubscribeUrl = buildUnsubscribeUrl({
        tenantSlug: normSlug,
        email: recipientEmail,
        subscriberId: rec.subscriber_id || undefined,
        listId: blast.list_id || undefined,
        baseUrl: appBaseUrl,
      });

      // Personalize HTML content
      let personalizedHtml = (blast.content_html || "")
        .replace(/\{\{\s*name\s*\}\}/gi, recName)
        .replace(/\{\{\s*first_name\s*\}\}/gi, recFn)
        .replace(/\{\{\s*last_name\s*\}\}/gi, recLn)
        .replace(/\{\{\s*company\s*\}\}/gi, recCompany)
        .replace(/\{\{\s*email\s*\}\}/gi, recipientEmail);

      // Rewrite click links to point through tracking redirect
      personalizedHtml = personalizedHtml.replace(
        /href=["'](https?:\/\/[^"']+)["']/gi,
        (match: string, origUrl: string) => {
          if (origUrl.includes("/crm/track/") || origUrl.includes("/crm/unsubscribe")) {
            return match;
          }
          const clickUrl = `${appBaseUrl}/api/erp/crm/track/click?token=${encodeURIComponent(trackingToken)}&url=${encodeURIComponent(origUrl)}`;
          return `href="${clickUrl}"`;
        }
      );

      // Append unsubscribe footer and tracking pixel
      const emailBodyWithFooter = `
        ${personalizedHtml}
        <br/><br/>
        <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:11px;color:#9ca3af;text-align:center;">
          You received this message because your address was subscribed to marketing updates.<br/>
          <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe from this list</a>
        </p>
        ${openTrackingPixel}
      `;

      try {
        await transporter.sendMail({
          from: formattedSender,
          to: recipientEmail,
          subject: (blast.subject || "Commercial Update")
            .replace(/\{\{\s*name\s*\}\}/gi, recName)
            .replace(/\{\{\s*first_name\s*\}\}/gi, recFn)
            .replace(/\{\{\s*company\s*\}\}/gi, recCompany),
          html: emailBodyWithFooter,
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "X-Entity-Ref-ID": blastId,
            "X-Tenant-Slug": normSlug,
            "X-Mailin-Tag": `blast_${blastId}`,
            "X-Mailin-custom": JSON.stringify({
              tenantSlug: normSlug,
              blastId: blastId,
              recipientId: rec.id,
              email: recipientEmail,
            }),
          },
        });

        await sql`
          UPDATE crm_email_blast_recipients
          SET status = 'SENT', sent_at = NOW(), error_message = NULL, attempts = attempts + 1
          WHERE id = ${rec.id} AND LOWER(tenant_slug) = ${normSlug};
        `;
        await sql`
          UPDATE crm_email_blasts
          SET sent_count = sent_count + 1, updated_at = NOW()
          WHERE id = ${blastId} AND LOWER(tenant_slug) = ${normSlug};
        `;
      } catch (sendErr: any) {
        console.warn(`[Blast Dispatcher] Delivery error for ${recipientEmail}:`, sendErr.message);
        await sql`
          UPDATE crm_email_blast_recipients
          SET status = 'FAILED', error_message = ${sendErr.message || "Delivery failed"}, attempts = attempts + 1
          WHERE id = ${rec.id} AND LOWER(tenant_slug) = ${normSlug};
        `;
        await sql`
          UPDATE crm_email_blasts
          SET failed_count = failed_count + 1, updated_at = NOW()
          WHERE id = ${blastId} AND LOWER(tenant_slug) = ${normSlug};
        `;

        const errMsg = String(sendErr?.message || "");
        if (
          errMsg.includes("Daily sending quota") ||
          errMsg.includes("550") ||
          errMsg.includes("Authentication failed") ||
          errMsg.includes("535") ||
          errMsg.includes("Too many connections")
        ) {
          console.warn(`[Blast Dispatcher] Halting blast ${blastId} due to provider quota/auth error:`, errMsg);
          break;
        }
      }

      // Small throttle between emails
      await new Promise((res) => setTimeout(res, 50));
    }

    // 6. Recalculate blast counts and finalize status
    const countRows = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'SENT')::int AS sent_cnt,
        COUNT(*) FILTER (WHERE status = 'FAILED')::int AS fail_cnt,
        COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pend_cnt
      FROM crm_email_blast_recipients
      WHERE blast_id = ${blastId} AND LOWER(tenant_slug) = ${normSlug};
    `;

    const counts = countRows[0] || { sent_cnt: 0, fail_cnt: 0, pend_cnt: 0 };
    const finalStatus = counts.pend_cnt > 0 ? "SENDING" : (counts.sent_cnt > 0 ? "SENT" : "FAILED");

    await sql`
      UPDATE crm_email_blasts
      SET sent_count = ${counts.sent_cnt},
          failed_count = ${counts.fail_cnt},
          status = ${finalStatus},
          sent_at = COALESCE(sent_at, NOW()),
          updated_at = NOW()
      WHERE id = ${blastId} AND LOWER(tenant_slug) = ${normSlug};
    `;

    // Chain next batch asynchronously if pending recipients remain
    if (counts.pend_cnt > 0) {
      setTimeout(() => {
        dispatchBlastEmails(tenantSlug, blastId).catch((err) =>
          console.error(`[Blast Dispatcher] Chained batch failed for ${blastId}:`, err)
        );
      }, 500);
    }
  } catch (err: any) {
    console.error(`[Blast Dispatcher] Unexpected failure for blast '${blastId}':`, err);
  }
}
