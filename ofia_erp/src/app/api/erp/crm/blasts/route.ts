import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import { dispatchBlastEmails } from "@/lib/crm-blast-dispatcher";

export const dynamic = "force-dynamic";

async function ensureCrmBlastsTable(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_email_blasts (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      list_id VARCHAR(191),
      list_name VARCHAR(191),
      title VARCHAR(191) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      preview_text VARCHAR(255) DEFAULT '',
      content_html TEXT NOT NULL,
      sender_name VARCHAR(191) DEFAULT '',
      sender_email VARCHAR(191) DEFAULT '',
      sender_profile_id VARCHAR(191),
      sender_provider VARCHAR(50) DEFAULT 'custom',
      sender_override TEXT,
      recipient_ids TEXT,
      status VARCHAR(50) DEFAULT 'DRAFT',
      scheduled_at TIMESTAMPTZ,
      sent_at TIMESTAMPTZ,
      total_recipients INT DEFAULT 0,
      sent_count INT DEFAULT 0,
      failed_count INT DEFAULT 0,
      open_count INT DEFAULT 0,
      click_count INT DEFAULT 0,
      bounce_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS list_id VARCHAR(191);`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS list_name VARCHAR(191);`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS preview_text VARCHAR(255) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS content_html TEXT;`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sender_name VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sender_email VARCHAR(191) DEFAULT '';`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sender_profile_id VARCHAR(191);`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sender_provider VARCHAR(50) DEFAULT 'custom';`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sender_override TEXT;`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS recipient_ids TEXT;`;
  await sql`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS failed_count INT DEFAULT 0;`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_email_blasts_tenant ON crm_email_blasts (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_email_blasts_created ON crm_email_blasts (LOWER(tenant_slug), created_at DESC);`;

  await sql`
    CREATE TABLE IF NOT EXISTS crm_email_blast_recipients (
      id VARCHAR(191) PRIMARY KEY,
      blast_id VARCHAR(191) NOT NULL,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      subscriber_id VARCHAR(191),
      email VARCHAR(191) NOT NULL,
      name VARCHAR(191),
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      company VARCHAR(191),
      status VARCHAR(50) DEFAULT 'PENDING',
      error_message TEXT,
      attempts INT DEFAULT 0,
      sent_at TIMESTAMPTZ,
      opened_at TIMESTAMPTZ,
      open_count INT DEFAULT 0,
      clicked_at TIMESTAMPTZ,
      click_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE crm_email_blast_recipients ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_blast_recipients_tenant ON crm_email_blast_recipients (LOWER(tenant_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_blast_recipients_blast ON crm_email_blast_recipients (blast_id);`;
}

function mapBlastRow(r: any) {
  let senderOverride: any = undefined;
  if (r.sender_override && typeof r.sender_override === "string") {
    try {
      senderOverride = JSON.parse(r.sender_override);
    } catch {}
  }

  let recipientIds: string[] | undefined = undefined;
  if (r.recipient_ids && typeof r.recipient_ids === "string") {
    try {
      recipientIds = JSON.parse(r.recipient_ids);
    } catch {}
  }

  return {
    id: r.id,
    tenantSlug: r.tenant_slug,
    listId: r.list_id || undefined,
    listName: r.list_name || undefined,
    title: r.title,
    subject: r.subject,
    previewText: r.preview_text || "",
    contentHtml: r.content_html || "",
    senderName: r.sender_name || "",
    senderEmail: r.sender_email || "",
    senderProfileId: r.sender_profile_id || undefined,
    senderProvider: r.sender_provider || "custom",
    senderOverride,
    recipientIds,
    status: r.status || "DRAFT",
    scheduledAt: r.scheduled_at ? new Date(r.scheduled_at).toISOString() : undefined,
    sentAt: r.sent_at ? new Date(r.sent_at).toISOString() : undefined,
    totalRecipients: Number(r.total_recipients || 0),
    sentCount: Number(r.sent_count || 0),
    failedCount: Number(r.failed_count || 0),
    openCount: Number(r.open_count || 0),
    clickCount: Number(r.click_count || 0),
    bounceCount: Number(r.bounce_count || 0),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const blastId = url.searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmBlastsTable(sql);

    // 1. Fetch single blast detail with recipient logs
    if (blastId) {
      const blastRows = await sql`
        SELECT * FROM crm_email_blasts
        WHERE id = ${blastId.trim()} AND LOWER(tenant_slug) = ${tenantSlug}
        LIMIT 1;
      `;

      if (blastRows.length === 0) {
        return NextResponse.json({ success: false, error: "Blast not found" }, { status: 404 });
      }

      const recRows = await sql`
        SELECT id, subscriber_id, email, name, first_name, last_name, company, status, error_message, attempts, sent_at, opened_at, open_count, clicked_at, click_count, created_at
        FROM crm_email_blast_recipients
        WHERE blast_id = ${blastId.trim()} AND LOWER(tenant_slug) = ${tenantSlug}
        ORDER BY created_at ASC;
      `;

      const recipients = recRows.map((r: any) => ({
        id: r.id,
        subscriberId: r.subscriber_id || undefined,
        email: r.email,
        name: r.name || `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.email,
        firstName: r.first_name || "",
        lastName: r.last_name || "",
        company: r.company || "",
        status: r.status,
        errorMessage: r.error_message || undefined,
        attempts: Number(r.attempts || 0),
        sentAt: r.sent_at ? new Date(r.sent_at).toISOString() : undefined,
        openedAt: r.opened_at ? new Date(r.opened_at).toISOString() : undefined,
        openCount: Number(r.open_count || 0),
        clickedAt: r.clicked_at ? new Date(r.clicked_at).toISOString() : undefined,
        clickCount: Number(r.click_count || 0),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      }));

      const blast = {
        ...mapBlastRow(blastRows[0]),
        recipients,
      };

      return NextResponse.json({ success: true, blast });
    }

    // 2. Fetch list of all active blasts for tenant
    const rows = await sql`
      SELECT * FROM crm_email_blasts
      WHERE LOWER(tenant_slug) = ${tenantSlug} AND status != 'DELETED'
      ORDER BY created_at DESC;
    `;

    // Reconcile and auto-heal active SENDING blasts
    for (const r of rows) {
      if (r.status === "SENDING") {
        try {
          const countRows = await sql`
            SELECT 
              COUNT(*) FILTER (WHERE status = 'SENT')::int AS sent_cnt,
              COUNT(*) FILTER (WHERE status = 'FAILED')::int AS fail_cnt,
              COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pend_cnt
            FROM crm_email_blast_recipients
            WHERE blast_id = ${r.id} AND LOWER(tenant_slug) = ${tenantSlug};
          `;
          const counts = countRows[0];
          if (counts) {
            r.sent_count = counts.sent_cnt;
            r.failed_count = counts.fail_cnt;

            if (counts.pend_cnt === 0) {
              const finalStatus = counts.sent_cnt > 0 ? "SENT" : (counts.fail_cnt > 0 ? "FAILED" : "DRAFT");
              r.status = finalStatus;
              await sql`
                UPDATE crm_email_blasts
                SET sent_count = ${counts.sent_cnt},
                    failed_count = ${counts.fail_cnt},
                    status = ${finalStatus},
                    updated_at = NOW()
                WHERE id = ${r.id} AND LOWER(tenant_slug) = ${tenantSlug};
              `;
            } else {
              // If stalled (> 15 seconds since last update), update counts and resume dispatch
              const lastUpdated = r.updated_at ? new Date(r.updated_at).getTime() : 0;
              if (Date.now() - lastUpdated > 15000) {
                await sql`
                  UPDATE crm_email_blasts
                  SET sent_count = ${counts.sent_cnt},
                      failed_count = ${counts.fail_cnt},
                      updated_at = NOW()
                  WHERE id = ${r.id} AND LOWER(tenant_slug) = ${tenantSlug};
                `;
                dispatchBlastEmails(tenantSlug, r.id).catch((err) =>
                  console.error(`[CRM Blasts GET Auto-Heal] Resume failed for ${r.id}:`, err)
                );
              }
            }
          }
        } catch (e: any) {
          console.warn(`[CRM Blasts GET] Reconcile error for blast ${r.id}:`, e.message);
        }
      }
    }

    const blasts = rows.map(mapBlastRow);
    return NextResponse.json({ success: true, blasts });
  } catch (err: any) {
    console.error("[CRM Blasts GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blasts: " + err.message, blasts: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const blastId = body.id && String(body.id).trim()
      ? String(body.id).trim()
      : `BLAST-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const title = (body.title || "Untitled Blast").trim();
    const subject = (body.subject || "Commercial Update").trim();
    const previewText = (body.previewText || "").trim();
    const contentHtml = body.contentHtml || "";
    const listId = body.listId ? String(body.listId).trim() : null;
    const listName = body.listName ? String(body.listName).trim() : null;
    const senderName = (body.senderName || "").trim();
    const senderEmail = (body.senderEmail || "").trim();
    const senderProfileId = body.senderProfileId ? String(body.senderProfileId).trim() : null;
    const senderProvider = (body.senderProvider || "custom").trim();
    const senderOverrideStr = body.senderOverride ? JSON.stringify(body.senderOverride) : null;
    const recipientIdsStr = body.recipientIds ? JSON.stringify(body.recipientIds) : null;
    const scheduledAtVal = body.scheduledAt ? new Date(body.scheduledAt) : null;
    const dispatchNow = Boolean(body.dispatchNow);

    const initialStatus = dispatchNow ? "SENDING" : (scheduledAtVal ? "SCHEDULED" : "DRAFT");

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmBlastsTable(sql);

    // 1. Ingest recipients
    let recipientsToInsert: any[] = [];
    if (Array.isArray(body.recipients) && body.recipients.length > 0) {
      recipientsToInsert = body.recipients.map((r: any) => ({
        id: `REC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        subscriberId: r.id || null,
        email: (r.email || "").trim().toLowerCase(),
        name: (r.name || "").trim(),
        firstName: (r.firstName || "").trim(),
        lastName: (r.lastName || "").trim(),
        company: (r.company || "").trim(),
      })).filter((r: any) => r.email && r.email.includes("@"));
    } else if (listId) {
      const subs = await sql`
        SELECT id, email, name, first_name, last_name, company
        FROM crm_email_subscribers
        WHERE list_id = ${listId} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'SUBSCRIBED';
      `;
      recipientsToInsert = subs.map((s: any) => ({
        id: `REC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        subscriberId: s.id,
        email: (s.email || "").trim().toLowerCase(),
        name: (s.name || "").trim(),
        firstName: (s.first_name || "").trim(),
        lastName: (s.last_name || "").trim(),
        company: (s.company || "").trim(),
      })).filter((r: any) => r.email && r.email.includes("@"));
    }

    const totalRecipients = recipientsToInsert.length;

    // 2. Insert Blast
    await sql`
      INSERT INTO crm_email_blasts (
        id, tenant_slug, tenant_id, list_id, list_name, title, subject, preview_text, content_html,
        sender_name, sender_email, sender_profile_id, sender_provider, sender_override, recipient_ids,
        status, scheduled_at, sent_at, total_recipients, sent_count, failed_count, open_count, click_count, bounce_count,
        created_at, updated_at
      ) VALUES (
        ${blastId}, ${tenantSlug}, '', ${listId}, ${listName}, ${title}, ${subject}, ${previewText}, ${contentHtml},
        ${senderName}, ${senderEmail}, ${senderProfileId}, ${senderProvider}, ${senderOverrideStr}, ${recipientIdsStr},
        ${initialStatus}, ${scheduledAtVal}, ${dispatchNow ? new Date() : null}, ${totalRecipients}, 0, 0, 0, 0, 0,
        NOW(), NOW()
      );
    `;

    // 3. Insert recipient entries
    for (const rec of recipientsToInsert) {
      await sql`
        INSERT INTO crm_email_blast_recipients (
          id, blast_id, tenant_slug, tenant_id, subscriber_id, email, name, first_name, last_name, company, status, created_at
        ) VALUES (
          ${rec.id}, ${blastId}, ${tenantSlug}, '', ${rec.subscriberId}, ${rec.email}, ${rec.name}, ${rec.firstName}, ${rec.lastName}, ${rec.company}, 'PENDING', NOW()
        );
      `;
    }

    const createdBlast = {
      id: blastId,
      tenantSlug,
      listId,
      listName,
      title,
      subject,
      previewText,
      contentHtml,
      senderName,
      senderEmail,
      senderProfileId,
      senderProvider,
      senderOverride: body.senderOverride,
      recipientIds: body.recipientIds,
      status: initialStatus,
      scheduledAt: scheduledAtVal ? scheduledAtVal.toISOString() : undefined,
      sentAt: dispatchNow ? new Date().toISOString() : undefined,
      totalRecipients,
      sentCount: 0,
      failedCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. Trigger async background delivery if dispatched immediately
    if (dispatchNow) {
      dispatchBlastEmails(tenantSlug, blastId).catch((err) =>
        console.error(`[CRM Blast POST] Async dispatch failed for ${blastId}:`, err)
      );
    }

    return NextResponse.json({ success: true, blast: createdBlast });
  } catch (err: any) {
    console.error("[CRM Blasts POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create email blast: " + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const blastId = url.searchParams.get("id");
    const action = url.searchParams.get("action");
    const bodyText = await request.text();
    const body = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, body);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const effectiveId = (blastId || body.id || "").trim();
    if (!effectiveId) {
      return NextResponse.json({ success: false, error: "Blast ID is required" }, { status: 400 });
    }

    const sql = await getTenantSql(tenantSlug);
    await ensureCrmBlastsTable(sql);

    // 1. Retry failed recipients action
    if (action === "retry" || action === "retry_failed" || body.status === "RETRY") {
      if (body.senderProfileId) {
        await sql`
          UPDATE crm_email_blasts
          SET sender_profile_id = ${body.senderProfileId.trim()}
          WHERE id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;
      }

      await sql`
        UPDATE crm_email_blast_recipients
        SET status = 'PENDING', error_message = NULL
        WHERE blast_id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'FAILED';
      `;

      await sql`
        UPDATE crm_email_blasts
        SET status = 'SENDING', failed_count = 0, updated_at = NOW()
        WHERE id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug};
      `;

      dispatchBlastEmails(tenantSlug, effectiveId).catch((err) =>
        console.error(`[CRM Blast PUT Retry] Async dispatch error:`, err)
      );

      return NextResponse.json({
        success: true,
        message: "Failed recipients queued for retry",
        id: effectiveId,
      });
    }

    // 2. Retry single recipient action
    if (action === "retry_recipient") {
      const recipientId = url.searchParams.get("recipient_id") || body.recipientId;
      if (recipientId) {
        await sql`
          UPDATE crm_email_blast_recipients
          SET status = 'PENDING', error_message = NULL
          WHERE id = ${String(recipientId).trim()} AND blast_id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;

        await sql`
          UPDATE crm_email_blasts
          SET status = 'SENDING', updated_at = NOW()
          WHERE id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug};
        `;

        dispatchBlastEmails(tenantSlug, effectiveId).catch((err) =>
          console.error(`[CRM Blast PUT Retry Recipient] Async dispatch error:`, err)
        );

        return NextResponse.json({
          success: true,
          message: "Recipient queued for retry",
          id: effectiveId,
        });
      }
    }

    // 3. Resume sending action
    if (action === "resume" || body.status === "RESUME" || body.status === "SENDING") {
      await sql`
        UPDATE crm_email_blasts
        SET status = 'SENDING', updated_at = NOW()
        WHERE id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug};
      `;

      dispatchBlastEmails(tenantSlug, effectiveId).catch((err) =>
        console.error(`[CRM Blast PUT Resume] Async dispatch error:`, err)
      );

      return NextResponse.json({
        success: true,
        message: "Blast delivery resumed",
        id: effectiveId,
      });
    }

    // 4. Force complete / mark as sent / cancel remaining action
    if (action === "complete" || action === "mark_sent" || action === "cancel_remaining" || body.status === "COMPLETED") {
      await sql`
        UPDATE crm_email_blast_recipients
        SET status = 'FAILED', error_message = 'Cancelled by administrator'
        WHERE blast_id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug} AND status = 'PENDING';
      `;

      const countRows = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'SENT')::int AS sent_cnt,
          COUNT(*) FILTER (WHERE status = 'FAILED')::int AS fail_cnt
        FROM crm_email_blast_recipients
        WHERE blast_id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug};
      `;
      const counts = countRows[0] || { sent_cnt: 0, fail_cnt: 0 };

      await sql`
        UPDATE crm_email_blasts
        SET status = 'SENT',
            sent_count = ${counts.sent_cnt},
            failed_count = ${counts.fail_cnt},
            updated_at = NOW()
        WHERE id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug};
      `;

      return NextResponse.json({
        success: true,
        message: "Campaign marked as complete. Remaining pending recipients cancelled.",
        id: effectiveId,
      });
    }

    // 5. Standard blast update
    const title = body.title !== undefined ? String(body.title).trim() : undefined;
    const subject = body.subject !== undefined ? String(body.subject).trim() : undefined;
    const contentHtml = body.contentHtml !== undefined ? String(body.contentHtml) : undefined;
    const listId = body.listId !== undefined ? String(body.listId).trim() : undefined;
    const listName = body.listName !== undefined ? String(body.listName).trim() : undefined;
    const senderName = body.senderName !== undefined ? String(body.senderName).trim() : undefined;
    const senderEmail = body.senderEmail !== undefined ? String(body.senderEmail).trim() : undefined;
    const senderProfileId = body.senderProfileId !== undefined ? String(body.senderProfileId).trim() : undefined;
    const senderProvider = body.senderProvider !== undefined ? String(body.senderProvider).trim() : undefined;
    const scheduledAtVal = body.scheduledAt ? new Date(body.scheduledAt) : undefined;
    const statusVal = body.status ? String(body.status).trim() : undefined;

    await sql`
      UPDATE crm_email_blasts
      SET title = COALESCE(${title}, title),
          subject = COALESCE(${subject}, subject),
          content_html = COALESCE(${contentHtml}, content_html),
          list_id = COALESCE(${listId}, list_id),
          list_name = COALESCE(${listName}, list_name),
          sender_name = COALESCE(${senderName}, sender_name),
          sender_email = COALESCE(${senderEmail}, sender_email),
          sender_profile_id = COALESCE(${senderProfileId}, sender_profile_id),
          sender_provider = COALESCE(${senderProvider}, sender_provider),
          scheduled_at = COALESCE(${scheduledAtVal}, scheduled_at),
          status = COALESCE(${statusVal}, status),
          updated_at = NOW()
      WHERE id = ${effectiveId} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({
      success: true,
      message: "Blast updated successfully",
      id: effectiveId,
    });
  } catch (err: any) {
    console.error("[CRM Blasts PUT] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update email blast: " + err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const blastId = url.searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!blastId) {
      return NextResponse.json({ success: false, error: "Blast ID is required" }, { status: 400 });
    }

    const cleanId = blastId.trim();
    const sql = await getTenantSql(tenantSlug);
    await ensureCrmBlastsTable(sql);

    // Delete recipient logs first
    await sql`
      DELETE FROM crm_email_blast_recipients
      WHERE blast_id = ${cleanId} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    // Delete blast record
    await sql`
      DELETE FROM crm_email_blasts
      WHERE id = ${cleanId} AND LOWER(tenant_slug) = ${tenantSlug};
    `;

    return NextResponse.json({
      success: true,
      message: "Blast deleted successfully",
      id: cleanId,
    });
  } catch (err: any) {
    console.error("[CRM Blasts DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete email blast: " + err.message },
      { status: 500 }
    );
  }
}
