import { CrmQuotation } from "./crm-service";

export interface QuotationPdfTenantInfo {
  displayName?: string;
  domain?: string;
  ownerEmail?: string;
  logo?: string;
}

/**
 * Triggers an isolated print/PDF export dialog displaying exclusively the quotation paper area.
 * Zero surrounding app navigation, sidebars, modal headers, or background UI elements are included.
 */
export function downloadQuotationPdf(
  quote: CrmQuotation,
  tenantInfo?: QuotationPdfTenantInfo
) {
  if (typeof window === "undefined") return;

  const tenantName = (tenantInfo?.displayName || "Ofia Enterprise").trim();
  const tenantDomain = (
    quote.senderUrl ||
    quote.columnTitles?.senderUrl ||
    tenantInfo?.domain ||
    "Official Commercial & Operations Suite"
  ).trim();
  const rawEmail = quote.senderEmail || quote.columnTitles?.senderEmail || tenantInfo?.ownerEmail;
  const tenantContact = rawEmail
    ? (rawEmail.toLowerCase().startsWith("contact:") ? rawEmail : `Contact: ${rawEmail}`)
    : "Victoria Island / Ikeja Central Depot, Lagos, Nigeria";
  const tenantLogo = tenantInfo?.logo || "";

  const colDesc = quote.columnTitles?.description || "Item Description";
  const colAddText = quote.columnTitles?.additionalText || "";
  const colSec = quote.columnTitles?.secondary || "";
  const colQty = quote.columnTitles?.quantity || "Qty";
  const colUnit = quote.columnTitles?.unitPrice || "Unit Price";
  const colTotal = quote.columnTitles?.amount || "Total (NGN)";

  const rowsHtml = quote.lineItems
    .map((item, idx) => {
      const addTextCell = colAddText
        ? `<td style="padding: 10px 12px; color: #475569; font-size: 11px;">
             ${escapeHtml(item.additionalText || "—")}
           </td>`
        : "";
      const secCell = colSec
        ? `<td style="padding: 10px 12px; text-align: center; font-weight: 700; color: #334155;">
             ${item.distance !== undefined && item.distance !== null ? item.distance.toLocaleString() : item.detail || "—"}
           </td>`
        : "";
      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 12px; color: #94a3b8; font-family: monospace;">${idx + 1}</td>
          <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${escapeHtml(item.description)}</td>
          ${addTextCell}
          ${secCell}
          <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: #334155;">${item.quantity}</td>
          <td style="padding: 10px 12px; text-align: right; font-family: monospace; color: #334155;">₦${item.unitPrice.toLocaleString()}</td>
          <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">₦${item.amount.toLocaleString()}</td>
        </tr>
      `;
    })
    .join("");

  const discountHtml =
    quote.discountTotal > 0
      ? `<div style="display: flex; justify-content: space-between; color: #059669; font-size: 12px;">
           <span>Total Discounts:</span>
           <span style="font-family: monospace;">-₦${quote.discountTotal.toLocaleString()}</span>
         </div>`
      : "";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(quote.quotationNumber)} - ${escapeHtml(quote.companyName)}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
          }
          .paper-container {
            width: 100%;
            max-width: 100%;
            background: #ffffff;
            color: #0f172a;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand-col {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand-logo {
            width: 48px;
            height: 48px;
            object-fit: contain;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            padding: 4px;
            background: #ffffff;
          }
          .brand-title {
            font-size: 20px;
            font-weight: 900;
            color: #1A56DB;
            text-transform: uppercase;
            letter-spacing: -0.025em;
            line-height: 1.2;
          }
          .brand-domain {
            font-size: 11px;
            color: #64748b;
            font-weight: 500;
          }
          .brand-contact {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 2px;
          }
          .badge-box {
            text-align: right;
          }
          .badge-pill {
            display: inline-block;
            padding: 4px 12px;
            background: #0f172a;
            color: #ffffff;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .quote-num {
            font-size: 14px;
            font-weight: 900;
            color: #0f172a;
            margin-top: 8px;
          }
          .quote-date {
            font-size: 10px;
            color: #64748b;
          }
          .quote-expiry {
            font-size: 10px;
            color: #e11d48;
            font-weight: 700;
          }
          .client-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          .section-subhead {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 900;
            color: #94a3b8;
            margin-bottom: 4px;
            letter-spacing: 0.05em;
          }
          .company-name {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
          }
          .client-text {
            color: #475569;
            font-size: 12px;
          }
          .client-muted {
            color: #64748b;
            font-size: 11px;
          }
          .status-pill {
            display: inline-block;
            font-weight: 800;
            text-transform: uppercase;
            color: #1A56DB;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 24px;
          }
          th {
            background: #f8fafc;
            color: #475569;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
            letter-spacing: 0.05em;
          }
          .financial-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 24px;
          }
          .financial-box {
            width: 280px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .fin-line {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #475569;
          }
          .fin-grand {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
            padding-top: 8px;
            border-top: 1px solid #cbd5e1;
            margin-top: 2px;
          }
          .terms-box {
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            margin-bottom: 32px;
            font-size: 11px;
            color: #475569;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .sign-grid {
            border-top: 1px solid #e2e8f0;
            padding-top: 24px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            page-break-inside: avoid;
            font-size: 10px;
            color: #64748b;
          }
          .sign-line {
            border-bottom: 1px solid #94a3b8;
            width: 200px;
            height: 24px;
            margin-bottom: 6px;
          }
          .sign-line-right {
            border-bottom: 1px solid #94a3b8;
            width: 200px;
            height: 24px;
            margin-bottom: 6px;
            margin-left: auto;
          }
          .sign-title {
            font-weight: 700;
            color: #334155;
          }
        </style>
      </head>
      <body>
        <div class="paper-container">
          <!-- HEADER -->
          <div class="header-row">
            <div class="brand-col">
              ${
                tenantLogo
                  ? `<img src="${escapeHtml(tenantLogo)}" alt="${escapeHtml(tenantName)}" class="brand-logo" onerror="this.style.display='none'" />`
                  : ""
              }
              <div>
                <div class="brand-title">${escapeHtml(tenantName)}</div>
                <div class="brand-domain">${escapeHtml(tenantDomain)}</div>
                <div class="brand-contact">${escapeHtml(tenantContact)}</div>
              </div>
            </div>
            <div class="badge-box">
              <span class="badge-pill">Commercial Quotation</span>
              <div class="quote-num">${escapeHtml(quote.quotationNumber)}</div>
              <div class="quote-date">Date: ${escapeHtml(quote.issueDate)}</div>
              <div class="quote-expiry">Valid Until: ${escapeHtml(quote.expiryDate)}</div>
            </div>
          </div>

          <!-- CLIENT & ENGAGEMENT PARTICULARS -->
          <div class="client-grid">
            <div>
              <div class="section-subhead">Proposal Prepared For:</div>
              <div class="company-name">${escapeHtml(quote.companyName || "Client Organization")}</div>
              ${quote.clientName ? `<div class="client-text">${escapeHtml(quote.clientName)}</div>` : ""}
              ${quote.clientEmail ? `<div class="client-muted">${escapeHtml(quote.clientEmail)}</div>` : ""}
              ${quote.clientPhone ? `<div class="client-muted">${escapeHtml(quote.clientPhone)}</div>` : ""}
            </div>
            <div style="text-align: right;">
              <div class="section-subhead">Engagement Title:</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${escapeHtml(quote.title)}</div>
              <div class="client-muted" style="margin-top: 4px;">Status: <span class="status-pill">${escapeHtml(quote.status)}</span></div>
              ${quote.createdBy ? `<div class="client-muted">Prepared By: ${escapeHtml(quote.createdBy)}</div>` : ""}
            </div>
          </div>

          <!-- LINE ITEMS TABLE -->
          <table>
            <thead>
              <tr>
                <th style="width: 36px;">#</th>
                <th>${escapeHtml(colDesc)}</th>
                ${colAddText ? `<th>${escapeHtml(colAddText)}</th>` : ""}
                ${colSec ? `<th style="text-align: center;">${escapeHtml(colSec)}</th>` : ""}
                <th style="text-align: center; width: 60px;">${escapeHtml(colQty)}</th>
                <th style="text-align: right; width: 110px;">${escapeHtml(colUnit)}</th>
                <th style="text-align: right; width: 120px;">${escapeHtml(colTotal)}</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- FINANCIAL SUMMARY -->
          <div class="financial-row">
            <div class="financial-box">
              <div class="fin-line">
                <span>Subtotal:</span>
                <span style="font-family: monospace;">₦${quote.subtotal.toLocaleString()}</span>
              </div>
              ${discountHtml}
              <div class="fin-line">
                <span>Statutory VAT (${quote.vatRate}%):</span>
                <span style="font-family: monospace;">₦${quote.taxTotal.toLocaleString()}</span>
              </div>
              <div class="fin-grand">
                <span>Final Net Total:</span>
                <span style="font-family: monospace; color: #1A56DB;">₦${quote.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- TERMS & BANKING -->
          <div class="terms-box">
            <div>
              <strong style="color: #1e293b;">Payment & Settlement Terms:</strong>
              ${escapeHtml(quote.paymentTerms || "Standard Commercial Settlement")}
            </div>
            <div>
              <strong style="color: #1e293b;">Proposal Notes and Bank Details:</strong>
              ${escapeHtml(quote.notes || "Official Commercial Offer")}
            </div>
          </div>

          <!-- SIGNATURE BLOCK -->
          <div class="sign-grid">
            <div>
              <div class="sign-line"></div>
              <p class="sign-title">Authorized Commercial Officer</p>
              <p>${escapeHtml(tenantName)} Operations</p>
            </div>
            <div style="text-align: right;">
              <div class="sign-line-right"></div>
              <p class="sign-title">Client Acceptance Signoff</p>
              <p>${escapeHtml(quote.companyName)}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Inject hidden printing iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
      }, 1500);
    }
  }, 250);
}

export interface CoverLetterPrintData {
  tenantName: string;
  tenantDomain?: string;
  tenantContact?: string;
  tenantLogo?: string;
  tenantFooter?: string;
  date: string;
  recipientName: string;
  recipientTitle?: string;
  companyName: string;
  recipientAddress?: string;
  reference: string;
  salutation: string;
  body: string;
  signoff: string;
  signatoryName: string;
  signatoryTitle?: string;
  signatoryDepartment?: string;
  signatoryContact?: string;
  quotationNumber?: string;
  documentBadge?: string;
}

/**
 * Triggers an isolated print/PDF export dialog displaying the executive cover letter on official tenant letterhead.
 * Includes official tenant letterhead banner on top and official corporate footer pinned at the bottom.
 */
export function downloadCoverLetterPdf(data: CoverLetterPrintData) {
  if (typeof window === "undefined") return;

  const tenantName = (data.tenantName || "Ofia Enterprise").trim();
  const tenantDomain = (data.tenantDomain || "Official Commercial & Operations Suite").trim();
  const tenantContact = data.tenantContact || "Victoria Island / Ikeja Central Depot, Lagos, Nigeria";
  const tenantLogo = data.tenantLogo || "";
  const tenantFooter = (
    data.tenantFooter ||
    "RC 1892019 • Tax ID: 22001923-0001 • Corporate HQ: Victoria Island, Lagos, Nigeria • Confidential & Proprietary Document"
  ).trim();

  // Format body text into HTML paragraphs
  const paragraphs = data.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin: 0 0 14px; font-size: 13px; line-height: 1.65; color: #1e293b; text-align: justify;">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Cover Letter - ${escapeHtml(data.reference || data.companyName)}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 18mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 13px;
            line-height: 1.6;
            height: 100%;
          }
          .letter-container {
            width: 100%;
            max-width: 100%;
            min-height: 98vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .letter-content {
            flex: 1;
          }
          .header-banner {
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            background: linear-gradient(135deg, #0b1e3d 0%, #164dbf 55%, #1a56db 100%);
            padding: 16px 20px;
            margin-bottom: 22px;
            color: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .abstract-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
          }
          .header-inner {
            position: relative;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .brand-col {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .brand-logo {
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            padding: 4px;
            background: #ffffff;
          }
          .brand-title {
            font-size: 21px;
            font-weight: 900;
            color: #ffffff;
            text-transform: uppercase;
            letter-spacing: -0.025em;
            line-height: 1.15;
          }
          .brand-domain {
            font-size: 11px;
            color: #dbeafe;
            font-weight: 600;
            margin-top: 2px;
          }
          .brand-contact {
            font-size: 10px;
            color: #bfdbfe;
            margin-top: 2px;
          }
          .badge-col {
            text-align: right;
          }
          .header-badge {
            display: inline-block;
            padding: 4px 10px;
            background: rgba(255, 255, 255, 0.18);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 900;
            color: #ffffff;
          }
          .header-ref {
            font-size: 10px;
            font-family: monospace;
            color: #dbeafe;
            margin-top: 4px;
          }
          .date-row {
            text-align: right;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 18px;
          }
          .recipient-block {
            margin-bottom: 20px;
            line-height: 1.45;
          }
          .recipient-to {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #94a3b8;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          .recipient-name {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
          }
          .recipient-title {
            font-size: 12px;
            font-weight: 600;
            color: #334155;
          }
          .recipient-company {
            font-size: 13px;
            font-weight: 700;
            color: #1A56DB;
            margin-top: 2px;
          }
          .recipient-address {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
          }
          .subject-line {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            border-bottom: 1.5px solid #0f172a;
            padding-bottom: 4px;
            margin-bottom: 16px;
            display: inline-block;
          }
          .salutation {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 14px;
          }
          .letter-body {
            margin-bottom: 22px;
          }
          .closing-block {
            margin-top: 22px;
            page-break-inside: avoid;
          }
          .signoff-text {
            font-size: 13px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 32px;
          }
          .signature-line {
            border-bottom: 1px solid #94a3b8;
            width: 220px;
            margin-bottom: 8px;
          }
          .signatory-name {
            font-size: 13px;
            font-weight: 800;
            color: #0f172a;
          }
          .signatory-title {
            font-size: 11px;
            font-weight: 600;
            color: #475569;
          }
          .signatory-meta {
            font-size: 10px;
            color: #64748b;
          }
          .letter-footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            line-height: 1.45;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="letter-container">
          <div class="letter-content">
            <!-- TENANT LETTERHEAD HEADER WITH WHITE ABSTRACT DESIGN -->
            <div class="header-banner">
              <svg class="abstract-bg" viewBox="0 0 760 140" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="absWhiteFadePrint" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
                    <stop offset="60%" stop-color="#ffffff" stop-opacity="0.04" />
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
                  </linearGradient>
                  <linearGradient id="absWaveFadePrint" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.09" />
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
                  </linearGradient>
                </defs>
                <path d="M260,-20 C420,40 500,-10 640,60 C720,100 750,50 780,20 L780,-20 Z" fill="url(#absWhiteFadePrint)" />
                <path d="M-40,140 C140,80 320,130 520,70 C660,30 720,80 780,50 L780,140 Z" fill="url(#absWaveFadePrint)" />
                <circle cx="710" cy="20" r="60" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.2" />
                <circle cx="710" cy="20" r="105" stroke="#ffffff" stroke-opacity="0.11" stroke-width="1" stroke-dasharray="3 3" />
                <circle cx="710" cy="20" r="150" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1" />
                <polygon points="480,-10 560,75 660,35 590,-20" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1" fill="#ffffff" fill-opacity="0.03" />
                <polygon points="560,75 630,145 725,100 660,35" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1" fill="#ffffff" fill-opacity="0.02" />
                <g fill="#ffffff" fill-opacity="0.25">
                  <circle cx="340" cy="30" r="1.5" />
                  <circle cx="360" cy="30" r="1.5" />
                  <circle cx="380" cy="30" r="1.5" />
                  <circle cx="350" cy="45" r="1.5" />
                  <circle cx="370" cy="45" r="1.5" />
                  <circle cx="390" cy="45" r="1.5" />
                </g>
                <line x1="0" y1="139" x2="760" y2="139" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1" />
              </svg>
              <div class="header-inner">
                <div class="brand-col">
                  ${
                    tenantLogo
                      ? `<img src="${escapeHtml(tenantLogo)}" alt="${escapeHtml(tenantName)}" class="brand-logo" onerror="this.style.display='none'" />`
                      : ""
                  }
                  <div>
                    <div class="brand-title">${escapeHtml(tenantName)}</div>
                    <div class="brand-domain">${escapeHtml(tenantDomain)}</div>
                    <div class="brand-contact">${escapeHtml(tenantContact)}</div>
                  </div>
                </div>
                <div class="badge-col">
                  <div class="header-badge">${escapeHtml(data.documentBadge || "OFFICIAL TRANSMITTAL")}</div>
                  ${data.quotationNumber ? `<div class="header-ref">Ref: ${escapeHtml(data.quotationNumber)}</div>` : ""}
                </div>
              </div>
            </div>

            <!-- DATE -->
            <div class="date-row">Date: ${escapeHtml(data.date)}</div>

            <!-- RECIPIENT BLOCK -->
            <div class="recipient-block">
              <div class="recipient-to">Attention / Delivered To:</div>
              <div class="recipient-name">${escapeHtml(data.recipientName || "The Managing Director")}</div>
              ${data.recipientTitle ? `<div class="recipient-title">${escapeHtml(data.recipientTitle)}</div>` : ""}
              <div class="recipient-company">${escapeHtml(data.companyName || "Client Organization")}</div>
              ${data.recipientAddress ? `<div class="recipient-address">${escapeHtml(data.recipientAddress)}</div>` : ""}
            </div>

            <!-- REFERENCE -->
            <div>
              <div class="subject-line">RE: ${escapeHtml(data.reference)}</div>
            </div>

            <!-- SALUTATION -->
            <div class="salutation">${escapeHtml(data.salutation || "Dear Sir/Madam,")}</div>

            <!-- LETTER BODY -->
            <div class="letter-body">
              ${paragraphs}
            </div>

            <!-- CLOSING & SIGNATURE -->
            <div class="closing-block">
              <div class="signoff-text">${escapeHtml(data.signoff || "Yours faithfully,")}</div>
              <div class="signature-line"></div>
              <div class="signatory-name">${escapeHtml(data.signatoryName || tenantName)}</div>
              ${data.signatoryTitle ? `<div class="signatory-title">${escapeHtml(data.signatoryTitle)}</div>` : ""}
              ${data.signatoryDepartment ? `<div class="signatory-meta">${escapeHtml(data.signatoryDepartment)}</div>` : ""}
              ${data.signatoryContact ? `<div class="signatory-meta">${escapeHtml(data.signatoryContact)}</div>` : ""}
            </div>
          </div>

          <!-- TENANT LETTERHEAD FOOTER -->
          <div class="letter-footer">
            <div>${escapeHtml(tenantFooter)}</div>
            <div style="margin-top: 3px; font-weight: 600;">Authorized Corporate Transmittal · Page 1 of 1</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
      }, 1500);
    }
  }, 250);
}

function escapeHtml(text?: string | null): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
