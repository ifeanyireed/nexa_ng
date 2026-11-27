import crypto from "crypto";
import { getTenantSql } from "./tenant-db-resolver";

export type PaymentMode = "merchant_byok" | "ofia_managed" | "protected_escrow";
export type PaymentProviderKey = "paystack" | "nomba" | "escrow_partner";

function isConfiguredEnvValue(val?: string): boolean {
  const clean = (val || "").trim();
  return Boolean(clean && !clean.toUpperCase().startsWith("AWAITING"));
}

function getVaultKey(): Buffer {
  const vaultSecret = isConfiguredEnvValue(process.env.PAYMENT_VAULT_SECRET)
    ? process.env.PAYMENT_VAULT_SECRET
    : undefined;
  const rawSecret =
    vaultSecret ||
    process.env.JWT_SECRET ||
    process.env.DATABASE_URL ||
    "ofia-payment-vault-fallback-derivation-seed";
  return crypto.createHash("sha256").update(rawSecret).digest();
}

export function decryptCredential(cipherText: string): string {
  const clean = (cipherText || "").trim();
  if (!clean) return "";
  if (!clean.startsWith("enc:v1:")) return clean;
  try {
    const parts = clean.split(":");
    if (parts.length !== 5) return "";
    const iv = Buffer.from(parts[2], "hex");
    const tag = Buffer.from(parts[3], "hex");
    const encrypted = Buffer.from(parts[4], "hex");
    const key = getVaultKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

export async function ensureStorefrontPaymentTables(sql: any) {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS tenant_payment_settings (
      tenant_slug VARCHAR(191) PRIMARY KEY,
      tenant_id VARCHAR(191) DEFAULT '',
      byok_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      byok_provider VARCHAR(50) NOT NULL DEFAULT 'paystack',
      paystack_public_key VARCHAR(255) DEFAULT '',
      paystack_secret_key_enc TEXT DEFAULT '',
      nomba_account_id VARCHAR(191) DEFAULT '',
      nomba_client_id VARCHAR(191) DEFAULT '',
      nomba_private_key_enc TEXT DEFAULT '',
      connection_status VARCHAR(50) NOT NULL DEFAULT 'disconnected',
      last_verified_at TIMESTAMPTZ,
      managed_payments_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      managed_payments_eligible BOOLEAN NOT NULL DEFAULT TRUE,
      managed_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 1.50,
      managed_settlement_arrangement VARCHAR(191) NOT NULL DEFAULT 'Approved Provider Subaccount Split (T+1)',
      protected_payments_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      protected_payments_eligible BOOLEAN NOT NULL DEFAULT TRUE,
      escrow_provider VARCHAR(100) NOT NULL DEFAULT 'approved_escrow_partner',
      protection_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 2.50,
      delivery_confirmation_mode VARCHAR(100) NOT NULL DEFAULT 'buyer_confirmation_and_pod',
      eligible_categories JSONB NOT NULL DEFAULT '["all"]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS order_status_history (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      order_id VARCHAR(191) NOT NULL,
      order_number VARCHAR(191) NOT NULL,
      domain VARCHAR(50) NOT NULL DEFAULT 'ORDER',
      previous_state VARCHAR(100) DEFAULT '',
      new_state VARCHAR(100) NOT NULL,
      actor VARCHAR(191) NOT NULL DEFAULT 'system',
      notes TEXT DEFAULT '',
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS payment_attempts (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      order_id VARCHAR(191) NOT NULL,
      order_number VARCHAR(191) NOT NULL,
      payment_mode VARCHAR(50) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      provider_reference VARCHAR(191) NOT NULL UNIQUE,
      amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      protection_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      authorization_url TEXT DEFAULT '',
      customer_email VARCHAR(191) DEFAULT '',
      customer_name VARCHAR(191) DEFAULT '',
      idempotency_key VARCHAR(191) DEFAULT '',
      raw_request JSONB NOT NULL DEFAULT '{}'::jsonb,
      raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      order_id VARCHAR(191) NOT NULL,
      order_number VARCHAR(191) NOT NULL,
      attempt_id VARCHAR(191) DEFAULT '',
      payment_mode VARCHAR(50) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      provider_reference VARCHAR(191) NOT NULL UNIQUE,
      customer_name VARCHAR(191) DEFAULT '',
      customer_email VARCHAR(191) DEFAULT '',
      gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      provider_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      ofia_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      protection_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      net_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      settlement_status VARCHAR(50) NOT NULL DEFAULT 'pending',
      settlement_reference VARCHAR(191) DEFAULT '',
      channel VARCHAR(50) DEFAULT 'card',
      verified_source VARCHAR(50) DEFAULT '',
      raw_provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS escrow_cases (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      order_id VARCHAR(191) NOT NULL,
      order_number VARCHAR(191) NOT NULL UNIQUE,
      provider VARCHAR(100) NOT NULL DEFAULT 'approved_escrow_partner',
      provider_escrow_reference VARCHAR(191) NOT NULL,
      customer_name VARCHAR(191) DEFAULT '',
      customer_email VARCHAR(191) DEFAULT '',
      customer_phone VARCHAR(64) DEFAULT '',
      gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      protection_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      merchant_net_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
      status VARCHAR(64) NOT NULL DEFAULT 'created',
      fulfilment_status VARCHAR(64) NOT NULL DEFAULT 'unfulfilled',
      tracking_number VARCHAR(191) DEFAULT '',
      courier_name VARCHAR(191) DEFAULT '',
      delivery_evidence_url TEXT DEFAULT '',
      delivery_evidence_notes TEXT DEFAULT '',
      buyer_confirmed_at TIMESTAMPTZ,
      release_requested_at TIMESTAMPTZ,
      released_at TIMESTAMPTZ,
      refund_requested_at TIMESTAMPTZ,
      refunded_at TIMESTAMPTZ,
      dispute_id VARCHAR(191) DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS escrow_disputes (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      escrow_case_id VARCHAR(191) NOT NULL,
      order_id VARCHAR(191) NOT NULL,
      order_number VARCHAR(191) NOT NULL,
      provider_dispute_reference VARCHAR(191) DEFAULT '',
      opened_by VARCHAR(50) NOT NULL DEFAULT 'buyer',
      reason VARCHAR(191) NOT NULL,
      description TEXT NOT NULL,
      buyer_evidence_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      merchant_response TEXT DEFAULT '',
      merchant_evidence_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
      resolution_outcome VARCHAR(50) DEFAULT '',
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS merchant_settlements (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      provider VARCHAR(50) NOT NULL,
      payment_mode VARCHAR(50) NOT NULL,
      settlement_reference VARCHAR(191) NOT NULL,
      gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      provider_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      ofia_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      net_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      bank_name VARCHAR(191) DEFAULT '',
      account_number VARCHAR(64) DEFAULT '',
      settlement_date TIMESTAMPTZ,
      transaction_references JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS financial_ledger_entries (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      order_id VARCHAR(191) DEFAULT '',
      order_number VARCHAR(191) DEFAULT '',
      transaction_id VARCHAR(191) DEFAULT '',
      escrow_case_id VARCHAR(191) DEFAULT '',
      payment_mode VARCHAR(50) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      provider_reference VARCHAR(191) DEFAULT '',
      entry_type VARCHAR(64) NOT NULL,
      direction VARCHAR(16) NOT NULL,
      gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      provider_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      ofia_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      protection_fee NUMERIC(15,2) NOT NULL DEFAULT 0,
      net_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
      status VARCHAR(50) NOT NULL DEFAULT 'RECORDED',
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  try {
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50) DEFAULT 'ofia_managed';`;
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) DEFAULT 'paystack';`;
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(191) DEFAULT '';`;
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS fulfilment_status VARCHAR(50) DEFAULT 'unfulfilled';`;
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS protection_fee NUMERIC(15,2) DEFAULT 0;`;
  } catch {}
}

export async function getStorefrontPaymentOptions(tenantSlug: string) {
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);
  await ensureStorefrontPaymentTables(sql);

  const rows = await sql`
    SELECT * FROM tenant_payment_settings
    WHERE LOWER(tenant_slug) = ${cleanSlug}
    LIMIT 1;
  `;

  const escrowPartnerAvailable = Boolean(
    process.env.OFIA_ESCROW_SECRET_KEY ||
      process.env.ESCROW_PARTNER_API_KEY ||
      process.env.OFIA_ESCROW_SANDBOX_ENABLED !== "false"
  );

  if (!rows || rows.length === 0) {
    return {
      tenantSlug: cleanSlug,
      standardPayment: {
        available: true,
        paymentMode: "ofia_managed" as PaymentMode,
        provider: "paystack" as PaymentProviderKey,
        label: "Standard Payment (Paystack Card / Bank Transfer)",
        feePct: 0,
      },
      protectedPayment: {
        enabled: true,
        eligible: true,
        providerAvailable: escrowPartnerAvailable,
        providerName: "Ofia Approved Escrow Partner",
        protectionFeePct: 2.5,
        deliveryConfirmationMode: "buyer_confirmation_and_pod",
      },
    };
  }

  const r = rows[0];
  const paystackSecret = decryptCredential(r.paystack_secret_key_enc || "");
  const nombaPrivate = decryptCredential(r.nomba_private_key_enc || "");
  const hasValidByok =
    Boolean(r.byok_enabled) &&
    ((r.byok_provider === "paystack" && Boolean(paystackSecret)) ||
      (r.byok_provider === "nomba" && Boolean(nombaPrivate)));

  const standardMode: PaymentMode = hasValidByok ? "merchant_byok" : "ofia_managed";
  const standardProvider: PaymentProviderKey =
    hasValidByok && r.byok_provider === "nomba" ? "nomba" : "paystack";
  const standardAvailable = hasValidByok || (r.managed_payments_enabled !== false && r.managed_payments_eligible !== false);

  return {
    tenantSlug: cleanSlug,
    standardPayment: {
      available: standardAvailable,
      paymentMode: standardMode,
      provider: standardProvider,
      label:
        standardMode === "merchant_byok"
          ? `Merchant Direct (${standardProvider.toUpperCase()})`
          : "Standard Payment (Ofia Managed Checkout)",
      feePct: 0,
    },
    protectedPayment: {
      enabled: r.protected_payments_enabled !== false,
      eligible: r.protected_payments_eligible !== false,
      providerAvailable: escrowPartnerAvailable,
      providerName: r.escrow_provider || "Ofia Approved Escrow Partner",
      protectionFeePct: Number(r.protection_fee_pct ?? 2.5),
      deliveryConfirmationMode: r.delivery_confirmation_mode || "buyer_confirmation_and_pod",
    },
    _secrets: {
      paystackSecret,
      nombaPrivate,
    },
  };
}
