import { NextRequest, NextResponse } from "next/server";
import { getTenantSql } from "@/lib/tenant-db-resolver";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import {
  CrmQuotation,
  DEFAULT_CRM_QUOTATIONS,
  getCrmQuotations,
  createCrmQuotation,
  updateCrmQuotationStatus,
  deleteCrmQuotation,
} from "@/lib/crm-service";

export const dynamic = "force-dynamic";

let tablesEnsured = false;

async function ensureCrmQuotationsTable(sql: any, tenantSlug: string) {
  if (!sql) return;
  const cleanSlug = tenantSlug.toLowerCase().trim();

  if (!tablesEnsured) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS crm_quotations (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(191) NOT NULL,
          tenant_id VARCHAR(191) DEFAULT '',
          quotation_number VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          deal_id VARCHAR(191) DEFAULT NULL,
          lead_id VARCHAR(191) DEFAULT NULL,
          client_name VARCHAR(191) NOT NULL,
          company_name VARCHAR(191) NOT NULL,
          client_email VARCHAR(191) NOT NULL,
          client_phone VARCHAR(64) DEFAULT '',
          status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
          issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
          expiry_date DATE NOT NULL,
          currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
          vat_rate NUMERIC(5,2) NOT NULL DEFAULT 7.5,
          line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
          column_titles JSONB DEFAULT '{}'::jsonb,
          subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
          discount_total NUMERIC(15,2) NOT NULL DEFAULT 0,
          tax_total NUMERIC(15,2) NOT NULL DEFAULT 0,
          total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
          payment_terms TEXT DEFAULT '',
          notes TEXT DEFAULT '',
          created_by VARCHAR(191) DEFAULT '',
          sent_at TIMESTAMPTZ DEFAULT NULL,
          accepted_at TIMESTAMPTZ DEFAULT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `;
      try {
        await sql`ALTER TABLE crm_quotations ADD COLUMN IF NOT EXISTS column_titles JSONB DEFAULT '{}'::jsonb;`;
      } catch {}
      try {
        await sql`CREATE INDEX IF NOT EXISTS idx_crm_quotes_tenant_created ON crm_quotations(LOWER(tenant_slug), created_at DESC);`;
      } catch {}
      try {
        await sql`CREATE INDEX IF NOT EXISTS idx_crm_quotes_tenant_status ON crm_quotations(LOWER(tenant_slug), status);`;
      } catch {}
      try {
        await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_quotes_tenant_number ON crm_quotations(LOWER(tenant_slug), quotation_number);`;
      } catch {}
      tablesEnsured = true;
    } catch (e: any) {
      console.warn("[CRM Quotations DB] ensureCrmQuotationsTable warning:", e.message);
    }
  }

  // Seed default quotes if table is fresh for this tenant
  try {
    const existing = await sql`
      SELECT COUNT(*)::int as cnt FROM crm_quotations
      WHERE LOWER(tenant_slug) = ${cleanSlug};
    `;

    if (Number(existing[0]?.cnt || 0) === 0 && cleanSlug === "default") {
      for (const q of DEFAULT_CRM_QUOTATIONS) {
        await sql`
          INSERT INTO crm_quotations (
            id, tenant_slug, tenant_id, quotation_number, title, deal_id, lead_id,
            client_name, company_name, client_email, client_phone, status, issue_date,
            expiry_date, currency, vat_rate, line_items, subtotal, discount_total,
            tax_total, total_amount, payment_terms, notes, created_by, accepted_at, created_at
          ) VALUES (
            ${q.id}, ${cleanSlug}, ${cleanSlug}, ${q.quotationNumber}, ${q.title},
            ${q.dealId || null}, ${q.leadId || null}, ${q.clientName}, ${q.companyName},
            ${q.clientEmail}, ${q.clientPhone}, ${q.status}, ${q.issueDate}, ${q.expiryDate},
            ${q.currency}, ${q.vatRate}, ${JSON.stringify(q.lineItems)}, ${q.subtotal},
            ${q.discountTotal}, ${q.taxTotal}, ${q.totalAmount}, ${q.paymentTerms},
            ${q.notes || ""}, ${q.createdBy}, ${q.acceptedAt ? new Date(q.acceptedAt) : null},
            ${new Date(q.createdAt)}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }
  } catch (err: any) {
    console.warn(`[CRM Quotations DB] Seed warning for '${cleanSlug}':`, err.message);
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const cleanSlug = tenantSlug.toLowerCase().trim();

    try {
      const sql = await getTenantSql(cleanSlug);
      await ensureCrmQuotationsTable(sql, cleanSlug);

      const rows = await sql`
        SELECT 
          id,
          tenant_slug,
          quotation_number,
          title,
          deal_id,
          lead_id,
          client_name,
          company_name,
          client_email,
          client_phone,
          status,
          TO_CHAR(issue_date, 'YYYY-MM-DD') AS issue_date,
          TO_CHAR(expiry_date, 'YYYY-MM-DD') AS expiry_date,
          currency,
          vat_rate,
          line_items,
          COALESCE(column_titles, '{}'::jsonb) AS column_titles,
          subtotal,
          discount_total,
          tax_total,
          total_amount,
          payment_terms,
          notes,
          created_by,
          sent_at,
          accepted_at,
          created_at
        FROM crm_quotations
        WHERE LOWER(tenant_slug) = ${cleanSlug}
        ORDER BY created_at DESC;
      `;

      const quotations: CrmQuotation[] = rows.map((r: any) => ({
        id: r.id,
        tenantSlug: r.tenant_slug,
        quotationNumber: r.quotation_number,
        title: r.title,
        dealId: r.deal_id || undefined,
        leadId: r.lead_id || undefined,
        clientName: r.client_name,
        companyName: r.company_name,
        clientEmail: r.client_email,
        clientPhone: r.client_phone || "",
        status: r.status,
        issueDate: r.issue_date,
        expiryDate: r.expiry_date,
        currency: r.currency || "NGN",
        vatRate: Number(r.vat_rate || 7.5),
        lineItems: Array.isArray(r.line_items) ? r.line_items : [],
        columnTitles: r.column_titles && typeof r.column_titles === "object" && Object.keys(r.column_titles).length > 0 ? r.column_titles : undefined,
        subtotal: Number(r.subtotal || 0),
        discountTotal: Number(r.discount_total || 0),
        taxTotal: Number(r.tax_total || 0),
        totalAmount: Number(r.total_amount || 0),
        paymentTerms: r.payment_terms || "",
        notes: r.notes || "",
        createdBy: r.created_by || "",
        sentAt: r.sent_at ? new Date(r.sent_at).toISOString() : undefined,
        acceptedAt: r.accepted_at ? new Date(r.accepted_at).toISOString() : undefined,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));

      // Calculate stats
      const totalCount = quotations.length;
      const totalValue = quotations.reduce((sum, q) => sum + q.totalAmount, 0);
      const negotiatingCount = quotations.filter((q) => q.status === "NEGOTIATING").length;
      const acceptedQuotes = quotations.filter((q) => q.status === "ACCEPTED");
      const acceptedValue = acceptedQuotes.reduce((sum, q) => sum + q.totalAmount, 0);
      const winRate = totalCount > 0 ? Math.round((acceptedQuotes.length / totalCount) * 100) : 0;
      const sentCount = quotations.filter((q) => q.status === "SENT").length;

      return NextResponse.json({
        success: true,
        quotations,
        stats: {
          totalCount,
          totalValue,
          negotiatingCount,
          acceptedCount: acceptedQuotes.length,
          acceptedValue,
          winRate,
          sentCount,
        },
      });
    } catch (dbErr: any) {
      console.warn("[CRM Quotations DB] Neon fallback to memory:", dbErr.message);
      const quotations = await getCrmQuotations(cleanSlug);
      const totalCount = quotations.length;
      const totalValue = quotations.reduce((sum, q) => sum + q.totalAmount, 0);
      const negotiatingCount = quotations.filter((q) => q.status === "NEGOTIATING").length;
      const acceptedQuotes = quotations.filter((q) => q.status === "ACCEPTED");
      const acceptedValue = acceptedQuotes.reduce((sum, q) => sum + q.totalAmount, 0);
      const winRate = totalCount > 0 ? Math.round((acceptedQuotes.length / totalCount) * 100) : 0;

      return NextResponse.json({
        success: true,
        quotations,
        stats: {
          totalCount,
          totalValue,
          negotiatingCount,
          acceptedCount: acceptedQuotes.length,
          acceptedValue,
          winRate,
          sentCount: quotations.filter((q) => q.status === "SENT").length,
        },
      });
    }
  } catch (err: any) {
    console.error("[CRM Quotations GET] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    const cleanSlug = tenantSlug.toLowerCase().trim();
    const body = await request.json();
    const action = body.action || "CREATE";

    const sql = await getTenantSql(cleanSlug);
    await ensureCrmQuotationsTable(sql, cleanSlug);

    // 1. UPDATE STATUS
    if (action === "UPDATE_STATUS") {
      const { id, status } = body;
      if (!id || !status) {
        return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
      }

      const isAccepted = status === "ACCEPTED";
      const isSent = status === "SENT";

      // Update quotation record
      const updatedRows = await sql`
        UPDATE crm_quotations
        SET 
          status = ${status},
          accepted_at = CASE WHEN ${isAccepted} THEN CURRENT_TIMESTAMP ELSE accepted_at END,
          sent_at = CASE WHEN ${isSent} AND sent_at IS NULL THEN CURRENT_TIMESTAMP ELSE sent_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND LOWER(tenant_slug) = ${cleanSlug}
        RETURNING *;
      `;

      if (updatedRows.length > 0) {
        const quote = updatedRows[0];

        // DECISION 3: If Quote accepted, auto-transition linked Deal to WON in crm_deals!
        if (isAccepted && quote.deal_id) {
          try {
            await sql`
              UPDATE crm_deals
              SET 
                stage = 'WON',
                probability = 100,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ${quote.deal_id} AND LOWER(tenant_slug) = ${cleanSlug};
            `;
          } catch (dealErr: any) {
            console.warn("[CRM Quotations] Failed to auto-WON linked deal:", dealErr.message);
          }
        }

        // If quote is SENT or NEGOTIATING, ensure deal stage is at least PROPOSAL
        if ((status === "SENT" || status === "NEGOTIATING") && quote.deal_id) {
          try {
            await sql`
              UPDATE crm_deals
              SET 
                stage = CASE WHEN stage IN ('LEAD', 'QUALIFIED') THEN 'PROPOSAL' ELSE stage END,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ${quote.deal_id} AND LOWER(tenant_slug) = ${cleanSlug};
            `;
          } catch {}
        }

        updateCrmQuotationStatus(cleanSlug, id, status);
        return NextResponse.json({ success: true, message: `Quotation status updated to ${status}`, quotation: quote });
      }

      // Memory fallback
      const updatedMem = await updateCrmQuotationStatus(cleanSlug, id, status);
      return NextResponse.json({ success: true, quotation: updatedMem });
    }

    // 2. DELETE QUOTE
    if (action === "DELETE") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "Missing quote id" }, { status: 400 });
      }

      await sql`
        DELETE FROM crm_quotations
        WHERE id = ${id} AND LOWER(tenant_slug) = ${cleanSlug};
      `;
      deleteCrmQuotation(cleanSlug, id);
      return NextResponse.json({ success: true, message: "Quotation deleted" });
    }

    // 3. CREATE QUOTATION (Standard QT-YYYY-XXXX format + Configurable VAT%)
    const year = new Date().getFullYear();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const quotationNumber = body.quotationNumber || `QT-${year}-${randNum}`;
    const id = body.id || `QUOTE-${Date.now()}-${randNum}`;

    const title = body.title || "Commercial Quotation Proposal";
    const dealId = body.dealId || null;
    const leadId = body.leadId || null;
    const clientName = body.clientName || "";
    const companyName = body.companyName || "";
    const clientEmail = body.clientEmail || "";
    const clientPhone = body.clientPhone || "";
    const status = body.status || "DRAFT";
    const issueDate = body.issueDate || new Date().toISOString().split("T")[0];
    const expiryDate = body.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    const currency = body.currency || "NGN";
    // Configurable VAT% (Decision 2: default 7.5%, editable per quote)
    const vatRate = body.vatRate !== undefined ? Number(body.vatRate) : 7.5;
    const lineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
    const columnTitles = body.columnTitles && typeof body.columnTitles === "object" ? body.columnTitles : {};
    const subtotal = Number(body.subtotal || 0);
    const discountTotal = Number(body.discountTotal || 0);
    const taxTotal = Number(body.taxTotal || 0);
    const totalAmount = Number(body.totalAmount || 0);
    const paymentTerms = body.paymentTerms || "70% Mobilization Deposit, 30% upon Signoff";
    const notes = body.notes || "";
    const createdBy = body.createdBy || "Sales Representative";

    await sql`
      INSERT INTO crm_quotations (
        id, tenant_slug, tenant_id, quotation_number, title, deal_id, lead_id,
        client_name, company_name, client_email, client_phone, status, issue_date,
        expiry_date, currency, vat_rate, line_items, column_titles, subtotal, discount_total,
        tax_total, total_amount, payment_terms, notes, created_by
      ) VALUES (
        ${id}, ${cleanSlug}, ${cleanSlug}, ${quotationNumber}, ${title},
        ${dealId}, ${leadId}, ${clientName}, ${companyName}, ${clientEmail},
        ${clientPhone}, ${status}, ${issueDate}, ${expiryDate}, ${currency},
        ${vatRate}, ${JSON.stringify(lineItems)}, ${JSON.stringify(columnTitles)}::jsonb, ${subtotal}, ${discountTotal},
        ${taxTotal}, ${totalAmount}, ${paymentTerms}, ${notes}, ${createdBy}
      );
    `;

    // If linked to a deal and the deal is currently at LEAD stage, advance to PROPOSAL
    if (dealId) {
      try {
        await sql`
          UPDATE crm_deals
          SET 
            stage = CASE WHEN stage IN ('LEAD', 'QUALIFIED') THEN 'PROPOSAL' ELSE stage END,
            value = ${`${currency === "NGN" ? "₦" : currency + " "}${totalAmount.toLocaleString()}`},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${dealId} AND LOWER(tenant_slug) = ${cleanSlug};
        `;
      } catch {}
    }

    const createdQuote: CrmQuotation = {
      id,
      tenantSlug: cleanSlug,
      quotationNumber,
      title,
      dealId: dealId || undefined,
      leadId: leadId || undefined,
      clientName,
      companyName,
      clientEmail,
      clientPhone,
      senderUrl: body.senderUrl || columnTitles.senderUrl || undefined,
      senderEmail: body.senderEmail || columnTitles.senderEmail || undefined,
      status,
      issueDate,
      expiryDate,
      currency,
      vatRate,
      lineItems,
      columnTitles: Object.keys(columnTitles).length > 0 ? columnTitles : undefined,
      subtotal,
      discountTotal,
      taxTotal,
      totalAmount,
      paymentTerms,
      notes,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    createCrmQuotation(cleanSlug, createdQuote);

    return NextResponse.json({
      success: true,
      message: "Quotation created successfully",
      quotation: createdQuote,
    });
  } catch (err: any) {
    console.error("[CRM Quotations POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
