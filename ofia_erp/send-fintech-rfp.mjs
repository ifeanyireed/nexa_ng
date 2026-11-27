import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { neon } from "@neondatabase/serverless";

// Load .env from ofia_erp/.env
const envPath = path.resolve(process.cwd(), "ofia_erp/.env");
const fallbackEnvPath = path.resolve(process.cwd(), ".env");
const activeEnvPath = fs.existsSync(envPath) ? envPath : fallbackEnvPath;

if (fs.existsSync(activeEnvPath)) {
  const lines = fs.readFileSync(activeEnvPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const REPLY_TO = "ifeanyireed@gmail.com";

const TARGETS = [
  {
    institutionName: "Vesicash Innovative Technologies",
    recipientEmail: "info@vesicash.com",
    contactTeam: "Partnerships, Compliance & Escrow API Team",
  },
  {
    institutionName: "Nomba Financial Services",
    recipientEmail: "support@nomba.com",
    contactTeam: "Enterprise Partnerships & Platform APIs Team",
  },
  {
    institutionName: "Paystack (A Stripe Company)",
    recipientEmail: "support@paystack.com",
    contactTeam: "Platform Partnerships & Subaccount Compliance Team",
  },
  {
    institutionName: "Payaza Africa",
    recipientEmail: "info@payaza.africa",
    contactTeam: "Institutional Partnerships & Escrow Collections Team",
  },
];

async function resolvePlatformSmtp() {
  const dbUrl = process.env.USERS_DATABASE_URL || process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT host, port, encryption, from_email, from_name, username, password
        FROM tenant_smtp_settings
        WHERE LOWER(tenant_slug) = 'platform'
        LIMIT 1;
      `;
      if (rows && rows.length > 0 && rows[0].host && rows[0].password) {
        const r = rows[0];
        return {
          host: r.host,
          port: Number(r.port) || 587,
          secure: r.encryption === "ssl" || Number(r.port) === 465,
          auth: { user: r.username || r.from_email, pass: r.password },
          from: `"Ofia Technologies Ltd" <${r.from_email}>`,
        };
      }
    } catch (e) {
      console.warn("Platform DB SMTP lookup fallback to .env:", e.message);
    }
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    from: `"Ofia Technologies Ltd" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
  };
}

async function main() {
  const smtp = await resolvePlatformSmtp();
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
    tls: { rejectUnauthorized: false },
  });

  console.log(`Using SMTP host: ${smtp.host}:${smtp.port} | Reply-To & CC: ${REPLY_TO}`);

  for (const target of TARGETS) {
    const subject =
      "Partnership & Regulatory Compliance Inquiry: Multi-Tenant Escrow & Split Payment Infrastructure — Ofia.ng";
    const greeting = `Dear ${target.institutionName} (${target.contactTeam}),`;

    const text = `${greeting}

I am writing from Ofia Technologies Ltd (https://www.ofia.ng), an enterprise multi-tenant commerce, POS, and ERP platform powering merchants and storefronts across Nigeria.

We are finalizing external provider onboarding for our three-mode payment architecture (Merchant BYOK, Ofia Managed Subaccount Splits, and Protected Escrow Payments) and are evaluating ${target.institutionName} as an approved infrastructure partner. Because Ofia strictly operates as a software orchestration platform and does not directly custody regulated third-party escrow funds, we require written confirmation that your infrastructure meets the following regulatory and technical requirements:

1. CBN / Regulatory Licensing & Custody Compliance
- Confirmation of your current Central Bank of Nigeria (CBN) license status (e.g., PSSP, Switching & Processing, or licensed Commercial/Trust Bank escrow custody partnership).
- Confirmation that regulated customer funds (specifically for Protected Payments / Escrow holds and platform subaccount splits) are held in licensed custodial/trust accounts compliant with Nigerian financial regulations.

2. Conditional Escrow Lifecycle & Dispute APIs (For Protected Payments)
- Programmatic API support for creating an order-linked escrow hold where funds remain in licensed escrow custody until buyer delivery confirmation or verified Proof of Delivery (POD) + inspection window expiry.
- Strict separation between escrow-held funds and available merchant payout balances, with automated freeze/hold capabilities when a buyer opens a dispute.
- API endpoints for partial or full buyer refunds and automated net merchant settlement release upon dispute resolution.

3. Subaccount Split Settlement & BYOK Support (For Standard & Managed Payments)
- Programmatic subaccount creation and automated transaction split settlement (deducting Ofia's platform fee while settling net proceeds directly to the merchant's verified Nigerian bank account on a T+1 schedule).
- Support for merchant BYOK (Bring Your Own Keys) credential verification and isolated per-merchant webhook routing.

4. Cryptographic Webhooks & Reconciliation Guarantees
- Signed webhook events (HMAC-SHA512 / HMAC-SHA256) covering payment.successful, payment.failed, settlement.completed, refund.processed, escrow.funded, escrow.release_eligible, escrow.released, and escrow.dispute_opened.

Next Steps:
Please reply directly to this email (${REPLY_TO}) with:
1. A summary of your regulatory license coverage for escrow custody and/or subaccount split settlements in Nigeria;
2. Links to your API documentation for Escrow / Split Settlement / Webhooks;
3. Your standard fee schedule, settlement SLAs (T+1 / instant), and onboarding KYB requirements for platform partners.

Warm regards,

Ifeanyi Felix
Founder & Architecture Lead, Ofia Technologies Ltd
Web: https://www.ofia.ng
Direct Reply: ${REPLY_TO}`;

    try {
      const info = await transporter.sendMail({
        from: smtp.from,
        to: target.recipientEmail,
        cc: REPLY_TO,
        replyTo: REPLY_TO,
        subject,
        text,
      });
      console.log(`✅ Sent to ${target.institutionName} (${target.recipientEmail}) -> MessageID: ${info.messageId}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${target.institutionName} (${target.recipientEmail}):`, err.message);
    }
  }
}

main().catch(console.error);
