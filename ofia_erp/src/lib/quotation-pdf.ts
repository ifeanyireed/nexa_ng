import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CrmQuotation } from "./crm-service";

export interface QuotationPdfTenantInfo {
  displayName?: string;
  domain?: string;
  ownerEmail?: string;
  logo?: string;
}

/**
 * Generates and triggers the browser download of a commercial proposal PDF
 * that exactly matches the on-screen "Printable Letterhead" preview modal.
 */
export function downloadQuotationPdf(
  quote: CrmQuotation,
  tenantInfo?: QuotationPdfTenantInfo
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const rightAlignX = pageWidth - margin; // 196mm

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

  // 1. TOP HEADER & BRANDING
  let headerTextX = margin;

  // Try to render tenant logo from DOM if available in preview
  try {
    if (typeof document !== "undefined") {
      const logoEl = document.getElementById("quotation-preview-logo") as HTMLImageElement | null;
      if (logoEl && logoEl.complete && logoEl.naturalWidth > 0) {
        doc.addImage(logoEl, "PNG", margin, 12, 12, 12);
        headerTextX = margin + 15;
      }
    }
  } catch {}

  // Brand Name & Metadata (Matching Preview)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(26, 86, 219); // #1A56DB
  doc.text(tenantName.toUpperCase(), headerTextX, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(tenantDomain, headerTextX, 21.5);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(tenantContact, headerTextX, 25.5);

  // Top Right: COMMERCIAL QUOTATION badge & document reference
  const badgeWidth = 46;
  const badgeHeight = 6.5;
  doc.setFillColor(15, 23, 42); // Slate 900 #0F172A
  doc.roundedRect(rightAlignX - badgeWidth, 11, badgeWidth, badgeHeight, 1.2, 1.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("COMMERCIAL QUOTATION", rightAlignX - badgeWidth / 2, 15.3, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(quote.quotationNumber, rightAlignX, 23, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${quote.issueDate}`, rightAlignX, 27.5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(225, 29, 72); // Rose 600
  doc.text(`Valid Until: ${quote.expiryDate}`, rightAlignX, 31.8, { align: "right" });

  // Divider Line (matching border-b border-slate-200)
  doc.setDrawColor(226, 232, 240); // Slate 200 #E2E8F0
  doc.setLineWidth(0.3);
  doc.line(margin, 36, rightAlignX, 36);

  // 2. CLIENT & ENGAGEMENT PARTICULARS (Two Columns matching Preview)
  // Left Column: Client Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("PROPOSAL PREPARED FOR:", margin, 42);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(quote.companyName || "Client Organization", margin, 47.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate 600
  let clientY = 52;
  if (quote.clientName) {
    doc.text(quote.clientName, margin, clientY);
    clientY += 4.2;
  }
  if (quote.clientEmail) {
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(quote.clientEmail, margin, clientY);
    clientY += 4.2;
  }
  if (quote.clientPhone) {
    doc.setTextColor(100, 116, 139);
    doc.text(quote.clientPhone, margin, clientY);
    clientY += 4.2;
  }

  // Right Column: Engagement Title & Status (Right-aligned matching Preview)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("ENGAGEMENT TITLE:", rightAlignX, 42, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const maxTitleWidth = 85;
  const splitTitle = doc.splitTextToSize(quote.title, maxTitleWidth);
  doc.text(splitTitle, rightAlignX, 47.5, { align: "right" });

  let engagementY = 47.5 + splitTitle.length * 4;

  // Status with Blue Highlight (Matching Preview)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const statusStr = quote.status || "DRAFT";
  doc.text(`Status: `, rightAlignX - doc.getTextWidth(statusStr) - 0.5, engagementY, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 86, 219); // Blue 600
  doc.text(statusStr, rightAlignX, engagementY, { align: "right" });
  engagementY += 4.2;

  // Prepared By
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Prepared By: ${quote.createdBy || "Commercial Specialist"}`, rightAlignX, engagementY, { align: "right" });
  engagementY += 4.2;

  const tableStartY = Math.max(clientY, engagementY) + 5;

  // 3. LINE ITEMS TABLE (autoTable styled to match Preview Letterhead)
  const hasSecondary = Boolean(quote.columnTitles?.secondary && quote.columnTitles.secondary.trim().length > 0);
  const colDesc = quote.columnTitles?.description || (hasSecondary ? "Routes" : "Item Description");
  const colSecondary = quote.columnTitles?.secondary || "Distance (KM)";
  const colQty = quote.columnTitles?.quantity || (hasSecondary ? "Trips" : "Qty");
  const colUnitPrice = quote.columnTitles?.unitPrice || (hasSecondary ? "Rate" : "Unit Price");
  const colAmount = quote.columnTitles?.amount || "Total (NGN)";

  let headers: string[];
  let tableRows: (string | number)[][];
  let columnStyles: Record<number, any>;

  if (hasSecondary) {
    headers = ["#", colDesc, colSecondary, colQty, colUnitPrice, colAmount];
    tableRows = quote.lineItems.map((item, index) => [
      String(index + 1),
      item.description,
      String(item.distance !== undefined && item.distance !== null ? item.distance : (item.detail || "1")),
      String(item.quantity),
      `N${item.unitPrice.toLocaleString()}`,
      `N${item.amount.toLocaleString()}`,
    ]);
    columnStyles = {
      0: { cellWidth: 8, halign: "center", textColor: [148, 163, 184] },
      1: { cellWidth: "auto", halign: "left", textColor: [30, 41, 59] },
      2: { cellWidth: 26, halign: "center", fontStyle: "bold", textColor: [51, 65, 85] },
      3: { cellWidth: 18, halign: "center", fontStyle: "bold", textColor: [51, 65, 85] },
      4: { cellWidth: 28, halign: "right", textColor: [51, 65, 85] },
      5: { cellWidth: 34, halign: "right", fontStyle: "bold", textColor: [15, 23, 42] },
    };
  } else {
    headers = ["#", colDesc, colQty, colUnitPrice, "Disc.", colAmount];
    tableRows = quote.lineItems.map((item, index) => [
      String(index + 1),
      item.description,
      String(item.quantity),
      `N${item.unitPrice.toLocaleString()}`,
      item.discountPercent ? `${item.discountPercent}%` : "-",
      `N${item.amount.toLocaleString()}`,
    ]);
    columnStyles = {
      0: { cellWidth: 8, halign: "center", textColor: [148, 163, 184] },
      1: { cellWidth: "auto", halign: "left", textColor: [30, 41, 59] },
      2: { cellWidth: 16, halign: "center", fontStyle: "bold", textColor: [51, 65, 85] },
      3: { cellWidth: 28, halign: "right", textColor: [51, 65, 85] },
      4: { cellWidth: 16, halign: "center", textColor: [100, 116, 139] },
      5: { cellWidth: 34, halign: "right", fontStyle: "bold", textColor: [15, 23, 42] },
    };
  }

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [headers],
    body: tableRows,
    theme: "plain",
    headStyles: {
      fillColor: [241, 245, 249], // Slate 100 #F1F5F9 (exact match to preview thead)
      textColor: [71, 85, 105], // Slate 600 #475569
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "left",
      lineColor: [226, 232, 240],
      lineWidth: { top: 0.3, bottom: 0.3 },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [30, 41, 59],
      valign: "middle",
      overflow: "linebreak",
      lineColor: [241, 245, 249],
      lineWidth: { bottom: 0.2 },
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles,
    // Vector crossbars on 'N' to render the authentic Nigerian Naira symbol (₦) without WinAnsi 0xA6 glyph distortion
    didDrawCell: (data) => {
      const isPriceCol = hasSecondary ? (data.column.index === 4 || data.column.index === 5) : (data.column.index === 3 || data.column.index === 5);
      if (data.section === "body" && isPriceCol) {
        const rawText = data.cell.text ? data.cell.text.join("") : "";
        if (rawText.startsWith("N")) {
          const fontSize = data.cell.styles.fontSize || 8;
          const scale = fontSize / 8;
          const textWidth = doc.getTextWidth(rawText);
          const rightPad = data.cell.padding("right") || 2.8;
          const nX = data.cell.x + data.cell.width - rightPad - textWidth;
          const nY = data.cell.y + data.cell.height / 2 + 1 * scale;
          const nW = doc.getTextWidth("N");

          const col = data.cell.styles.textColor as [number, number, number];
          doc.setDrawColor(col[0], col[1], col[2]);
          doc.setLineWidth(0.22 * scale);
          doc.line(nX - 0.15, nY - 1.35 * scale, nX + nW + 0.15, nY - 1.35 * scale);
          doc.line(nX - 0.15, nY - 0.85 * scale, nX + nW + 0.15, nY - 0.85 * scale);
        }
      }
    },
  });

  // End of table
  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // 4. FINANCIAL SUMMARY (Clean layout matching Preview letterhead)
  const summaryWidth = 65;
  const summaryX = rightAlignX - summaryWidth;
  let sumY = finalY;

  // Top border above summary
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(summaryX, sumY, rightAlignX, sumY);
  sumY += 4.5;

  // Helper to draw Naira currency lines in summary
  const drawSummaryNairaRow = (
    label: string,
    amount: number,
    isNegative = false,
    labelColor: [number, number, number] = [71, 85, 105],
    isFinal = false
  ) => {
    doc.setFont("helvetica", isFinal ? "bold" : "normal");
    doc.setFontSize(isFinal ? 9.5 : 8);
    doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    doc.text(label, summaryX, sumY);

    const fullStr = (isNegative ? "-N" : "N") + Math.abs(amount).toLocaleString();
    const textWidth = doc.getTextWidth(fullStr);
    const startX = rightAlignX - textWidth;

    if (isFinal) {
      doc.setTextColor(26, 86, 219); // Blue 600 #1A56DB
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
    }

    doc.text(fullStr, rightAlignX, sumY, { align: "right" });

    // Draw horizontal crossbars on the N
    const fontSize = doc.getFontSize();
    const scale = fontSize / 8.5;
    const nOffset = isNegative ? doc.getTextWidth("-") : 0;
    const nX = startX + nOffset;
    const nW = doc.getTextWidth("N");

    const curCol = isFinal ? [26, 86, 219] : labelColor;
    doc.setDrawColor(curCol[0], curCol[1], curCol[2]);
    doc.setLineWidth(0.22 * scale);
    doc.line(nX - 0.15, sumY - 1.35 * scale, nX + nW + 0.15, sumY - 1.35 * scale);
    doc.line(nX - 0.15, sumY - 0.85 * scale, nX + nW + 0.15, sumY - 0.85 * scale);

    sumY += isFinal ? 6 : 4;
  };

  // Subtotal
  drawSummaryNairaRow("Subtotal:", quote.subtotal);

  // Discounts
  if (quote.discountTotal > 0) {
    drawSummaryNairaRow("Total Discounts:", quote.discountTotal, true, [16, 185, 129]);
  }

  // Statutory VAT
  drawSummaryNairaRow(`Statutory VAT (${quote.vatRate}%):`, quote.taxTotal);

  // Border above Final Net Total (matching border-t border-slate-300)
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.4);
  doc.line(summaryX, sumY - 0.5, rightAlignX, sumY - 0.5);
  sumY += 3.5;

  // Final Net Total
  drawSummaryNairaRow("Final Net Total:", quote.totalAmount, false, [15, 23, 42], true);
  sumY += 5;

  // 5. COMMERCIAL TERMS & SETTLEMENT INSTRUCTIONS (Matching Preview)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, sumY, rightAlignX, sumY);
  sumY += 4.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text("Payment & Settlement Terms:", margin, sumY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105); // Slate 600
  const termsText = quote.paymentTerms || "70% Mobilization Deposit, 30% upon Delivery / Signoff";
  doc.text(termsText, margin + 44, sumY);
  sumY += 4.2;

  if (quote.notes) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Proposal Notes and Bank Details:", margin, sumY);

    const notesLabelWidth = doc.getTextWidth("Proposal Notes and Bank Details:") + 3;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(quote.notes, rightAlignX - margin - notesLabelWidth);
    doc.text(splitNotes, margin + notesLabelWidth, sumY);
    sumY += splitNotes.length * 4 + 2;
  }

  // 6. AUTHORIZED SIGNATURE BLOCKS (Matching Preview Two-Column Signoff)
  if (sumY + 28 > pageHeight - 12) {
    doc.addPage();
    sumY = 22;
  } else {
    sumY = Math.max(sumY + 6, pageHeight - 34);
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, sumY - 4, rightAlignX, sumY - 4);

  const signLineWidth = 50;
  // Left: Authorized Commercial Officer
  doc.setDrawColor(148, 163, 184); // Slate 400
  doc.setLineWidth(0.4);
  doc.line(margin, sumY, margin + signLineWidth, sumY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85); // Slate 700
  doc.text("Authorized Commercial Officer", margin, sumY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`${tenantName} Operations`, margin, sumY + 7.5);

  // Right: Client Acceptance Signoff
  const rightSignX = rightAlignX - signLineWidth;
  doc.line(rightSignX, sumY, rightAlignX, sumY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Client Acceptance Signoff", rightAlignX, sumY + 4, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(quote.companyName || "Client Representative", rightAlignX, sumY + 7.5, { align: "right" });

  // 7. FOOTER CONFIDENTIALITY
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated via Ofia Enterprise Suite  •  Proposal Ref: ${quote.quotationNumber}  •  Strictly Confidential`,
    pageWidth / 2,
    pageHeight - 5,
    { align: "center" }
  );

  // 8. TRIGGER DIRECT FILE DOWNLOAD
  const cleanFilename = `Quotation_${quote.quotationNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(cleanFilename);
}
