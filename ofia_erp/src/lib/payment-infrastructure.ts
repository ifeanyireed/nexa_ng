import crypto from "crypto";
import { getTenantSql } from "./tenant-db-resolver";
import { publishCommerceEvent } from "./commerce-event-hub";

export type PaymentMode = "merchant_byok" | "ofia_managed" | "protected_escrow";
export type PaymentProviderKey = "paystack" | "nomba" | "escrow_partner";

export type PaymentState =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "expired"
  | "partially_refunded"
  | "refunded";

export type FulfilmentState =
  | "unfulfilled"
  | "processing"
  | "ready"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type EscrowState =
  | "none"
  | "created"
  | "awaiting_funding"
  | "funded"
  | "held"
  | "awaiting_fulfilment"
  | "awaiting_buyer_confirmation"
  | "release_eligible"
  | "release_pending"
  | "released"
  | "refund_pending"
  | "refunded"
  | "disputed"
  | "cancelled";

export type ConnectionStatus =
  | "connected"
  | "pending_verification"
  | "disconnected"
  | "invalid_credentials"
  | "provider_unavailable"
  | "action_required";

export interface TenantPaymentSettings {
  tenantSlug: string;
  tenantId: string;
  byokEnabled: boolean;
  byokProvider: "paystack" | "nomba";
  paystackPublicKey: string;
  hasPaystackSecretKey: boolean;
  paystackSecretKeyMasked: string;
  nombaAccountId: string;
  nombaClientId: string;
  hasNombaPrivateKey: boolean;
  nombaPrivateKeyMasked: string;
  connectionStatus: ConnectionStatus;
  lastVerifiedAt: string | null;
  managedPaymentsEnabled: boolean;
  managedPaymentsEligible: boolean;
  managedFeePct: number;
  managedSettlementArrangement: string;
  protectedPaymentsEnabled: boolean;
  protectedPaymentsEligible: boolean;
  escrowProvider: string;
  escrowProviderAvailable: boolean;
  protectionFeePct: number;
  deliveryConfirmationMode: "buyer_confirmation_and_pod" | "pod_verified";
  eligibleCategories: string[];
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// AES-256-GCM Credential Encryption at Rest
// ---------------------------------------------------------------------------

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

export function encryptCredential(plainText: string): string {
  const clean = (plainText || "").trim();
  if (!clean) return "";
  const iv = crypto.randomBytes(12);
  const key = getVaultKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(clean, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
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

export function maskCredential(secret: string): string {
  const plain = secret.startsWith("enc:v1:") ? decryptCredential(secret) : secret;
  if (!plain || plain.length < 8) return plain ? "••••••••" : "";
  return `${plain.slice(0, 7)}••••••••••••${plain.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Database Schema Provisioning (Strict Per-Tenant Isolation)
// ---------------------------------------------------------------------------

const initializedTenants = new Set<string>();

export async function ensurePaymentInfrastructureTables(sql: any, tenantSlug?: string): Promise<void> {
  if (!sql) return;
  const cacheKey = (tenantSlug || "default").toLowerCase().trim();
  if (initializedTenants.has(cacheKey)) return;

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
    CREATE INDEX IF NOT EXISTS idx_order_status_history_tenant_created
    ON order_status_history (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_order_status_history_tenant_order
    ON order_status_history (LOWER(tenant_slug), order_number);
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
    CREATE INDEX IF NOT EXISTS idx_payment_attempts_tenant_created
    ON payment_attempts (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payment_attempts_tenant_status
    ON payment_attempts (LOWER(tenant_slug), status);
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
    CREATE INDEX IF NOT EXISTS idx_payment_transactions_tenant_created
    ON payment_transactions (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payment_transactions_tenant_status
    ON payment_transactions (LOWER(tenant_slug), status);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payment_webhook_events (
      id VARCHAR(191) PRIMARY KEY,
      event_id VARCHAR(191) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      provider_account VARCHAR(191) DEFAULT '',
      event_type VARCHAR(100) NOT NULL,
      normalized_event VARCHAR(100) NOT NULL,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      order_id VARCHAR(191) DEFAULT '',
      order_number VARCHAR(191) DEFAULT '',
      attempt_id VARCHAR(191) DEFAULT '',
      provider_reference VARCHAR(191) DEFAULT '',
      signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      retry_count INT NOT NULL DEFAULT 0,
      error_message TEXT DEFAULT '',
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    );
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_tenant_created
    ON payment_webhook_events (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_tenant_status
    ON payment_webhook_events (LOWER(tenant_slug), status);
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
    CREATE INDEX IF NOT EXISTS idx_merchant_settlements_tenant_created
    ON merchant_settlements (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_merchant_settlements_tenant_status
    ON merchant_settlements (LOWER(tenant_slug), status);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payment_refunds (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      order_id VARCHAR(191) NOT NULL,
      order_number VARCHAR(191) NOT NULL,
      transaction_id VARCHAR(191) DEFAULT '',
      provider_reference VARCHAR(191) NOT NULL,
      provider_refund_reference VARCHAR(191) DEFAULT '',
      provider VARCHAR(50) NOT NULL,
      payment_mode VARCHAR(50) NOT NULL,
      amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency VARCHAR(16) NOT NULL DEFAULT 'NGN',
      reason TEXT DEFAULT '',
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      requested_by VARCHAR(191) DEFAULT 'merchant',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payment_refunds_tenant_created
    ON payment_refunds (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_payment_refunds_tenant_status
    ON payment_refunds (LOWER(tenant_slug), status);
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
    CREATE INDEX IF NOT EXISTS idx_escrow_cases_tenant_created
    ON escrow_cases (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_escrow_cases_tenant_status
    ON escrow_cases (LOWER(tenant_slug), status);
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
    CREATE INDEX IF NOT EXISTS idx_escrow_disputes_tenant_created
    ON escrow_disputes (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_escrow_disputes_tenant_status
    ON escrow_disputes (LOWER(tenant_slug), status);
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
  await sql`
    CREATE INDEX IF NOT EXISTS idx_financial_ledger_entries_tenant_created
    ON financial_ledger_entries (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_financial_ledger_entries_tenant_status
    ON financial_ledger_entries (LOWER(tenant_slug), status);
  `;

  // Extend shop_orders non-destructively to support separated payment, fulfilment, and escrow lifecycles
  const alterCols = [
    `ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50) DEFAULT 'ofia_managed'`,
    `ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) DEFAULT 'paystack'`,
    `ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(191) DEFAULT ''`,
    `ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS fulfilment_status VARCHAR(50) DEFAULT 'unfulfilled'`,
    `ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS protection_fee NUMERIC(15,2) DEFAULT 0`,
    `ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(15,2) DEFAULT 0`,
    `ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(15,2) DEFAULT 0`,
    `ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS discount NUMERIC(15,2) DEFAULT 0`,
  ];
  for (const stmt of alterCols) {
    try {
      await sql.unsafe ? await sql.unsafe(stmt) : null;
    } catch {}
  }
  try {
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50) DEFAULT 'ofia_managed';`;
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) DEFAULT 'paystack';`;
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(191) DEFAULT '';`;
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS fulfilment_status VARCHAR(50) DEFAULT 'unfulfilled';`;
    await sql`ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS protection_fee NUMERIC(15,2) DEFAULT 0;`;
  } catch {}

  initializedTenants.add(cacheKey);
}

// ---------------------------------------------------------------------------
// Merchant Payment Settings Resolution
// ---------------------------------------------------------------------------

export function isEscrowPartnerConfigured(): boolean {
  return Boolean(
    process.env.OFIA_ESCROW_SECRET_KEY ||
      process.env.ESCROW_PARTNER_API_KEY ||
      process.env.OFIA_ESCROW_SANDBOX_ENABLED !== "false"
  );
}

export async function getTenantPaymentSettings(
  tenantSlug: string
): Promise<TenantPaymentSettings & { _paystackSecretPlain?: string; _nombaPrivatePlain?: string }> {
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);
  await ensurePaymentInfrastructureTables(sql, cleanSlug);

  const rows = await sql`
    SELECT * FROM tenant_payment_settings
    WHERE LOWER(tenant_slug) = ${cleanSlug}
    LIMIT 1;
  `;

  const escrowAvailable = isEscrowPartnerConfigured();

  if (!rows || rows.length === 0) {
    return {
      tenantSlug: cleanSlug,
      tenantId: `org-${cleanSlug}`,
      byokEnabled: false,
      byokProvider: "paystack",
      paystackPublicKey: "",
      hasPaystackSecretKey: false,
      paystackSecretKeyMasked: "",
      nombaAccountId: "",
      nombaClientId: "",
      hasNombaPrivateKey: false,
      nombaPrivateKeyMasked: "",
      connectionStatus: "disconnected",
      lastVerifiedAt: null,
      managedPaymentsEnabled: true,
      managedPaymentsEligible: true,
      managedFeePct: 1.5,
      managedSettlementArrangement: "Approved Provider Subaccount Split (T+1)",
      protectedPaymentsEnabled: true,
      protectedPaymentsEligible: true,
      escrowProvider: "approved_escrow_partner",
      escrowProviderAvailable: escrowAvailable,
      protectionFeePct: 2.5,
      deliveryConfirmationMode: "buyer_confirmation_and_pod",
      eligibleCategories: ["all"],
      updatedAt: new Date().toISOString(),
    };
  }

  const r = rows[0];
  const paystackSecretPlain = decryptCredential(r.paystack_secret_key_enc || "");
  const nombaPrivatePlain = decryptCredential(r.nomba_private_key_enc || "");

  return {
    tenantSlug: r.tenant_slug,
    tenantId: r.tenant_id || `org-${cleanSlug}`,
    byokEnabled: Boolean(r.byok_enabled),
    byokProvider: r.byok_provider === "nomba" ? "nomba" : "paystack",
    paystackPublicKey: r.paystack_public_key || "",
    hasPaystackSecretKey: Boolean(paystackSecretPlain),
    paystackSecretKeyMasked: maskCredential(paystackSecretPlain),
    nombaAccountId: r.nomba_account_id || "",
    nombaClientId: r.nomba_client_id || "",
    hasNombaPrivateKey: Boolean(nombaPrivatePlain),
    nombaPrivateKeyMasked: maskCredential(nombaPrivatePlain),
    connectionStatus: (r.connection_status as ConnectionStatus) || "disconnected",
    lastVerifiedAt: r.last_verified_at ? new Date(r.last_verified_at).toISOString() : null,
    managedPaymentsEnabled: Boolean(r.managed_payments_enabled),
    managedPaymentsEligible: r.managed_payments_eligible !== false,
    managedFeePct: Number(r.managed_fee_pct ?? 1.5),
    managedSettlementArrangement:
      r.managed_settlement_arrangement || "Approved Provider Subaccount Split (T+1)",
    protectedPaymentsEnabled: Boolean(r.protected_payments_enabled),
    protectedPaymentsEligible: r.protected_payments_eligible !== false,
    escrowProvider: r.escrow_provider || "approved_escrow_partner",
    escrowProviderAvailable: escrowAvailable,
    protectionFeePct: Number(r.protection_fee_pct ?? 2.5),
    deliveryConfirmationMode:
      r.delivery_confirmation_mode === "pod_verified"
        ? "pod_verified"
        : "buyer_confirmation_and_pod",
    eligibleCategories: Array.isArray(r.eligible_categories) ? r.eligible_categories : ["all"],
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    _paystackSecretPlain: paystackSecretPlain,
    _nombaPrivatePlain: nombaPrivatePlain,
  };
}

// ---------------------------------------------------------------------------
// Order Status History Logger
// ---------------------------------------------------------------------------

export async function recordOrderStatusHistory(params: {
  sql: any;
  tenantSlug: string;
  tenantId?: string;
  orderId: string;
  orderNumber: string;
  domain: "ORDER" | "PAYMENT" | "FULFILMENT" | "ESCROW";
  previousState?: string;
  newState: string;
  actor?: string;
  notes?: string;
  metadata?: Record<string, any>;
}) {
  const id = `osh_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  await params.sql`
    INSERT INTO order_status_history (
      id, tenant_slug, tenant_id, order_id, order_number, domain,
      previous_state, new_state, actor, notes, metadata, created_at
    ) VALUES (
      ${id}, ${params.tenantSlug.toLowerCase().trim()}, ${params.tenantId || ""},
      ${params.orderId}, ${params.orderNumber}, ${params.domain},
      ${params.previousState || ""}, ${params.newState},
      ${params.actor || "system"}, ${params.notes || ""},
      ${JSON.stringify(params.metadata || {})}::jsonb, NOW()
    );
  `;
}

// ---------------------------------------------------------------------------
// Checkout Payment Route Selection (Section 4 Routing Rules)
// ---------------------------------------------------------------------------

export interface ResolvedCheckoutRoute {
  paymentMode: PaymentMode;
  provider: PaymentProviderKey;
  secretKey: string;
  publicKey?: string;
  ofiaFeePct: number;
  protectionFeePct: number;
}

export async function resolveCheckoutPaymentRoute(
  tenantSlug: string,
  requestedPaymentMode?: "standard" | "protected_escrow" | PaymentMode
): Promise<{
  allowed: boolean;
  error?: string;
  errorCode?: string;
  route?: ResolvedCheckoutRoute;
  settings: TenantPaymentSettings;
}> {
  const settingsWithSecrets = await getTenantPaymentSettings(tenantSlug);
  const { _paystackSecretPlain, _nombaPrivatePlain, ...publicSettings } = settingsWithSecrets;

  // Rule: Protected Payment (Escrow) never silently falls back to standard payments
  if (requestedPaymentMode === "protected_escrow") {
    if (!publicSettings.protectedPaymentsEnabled || !publicSettings.protectedPaymentsEligible) {
      return {
        allowed: false,
        errorCode: "ESCROW_NOT_ENABLED",
        error: "Protected Payment (Escrow) is not enabled for this merchant storefront.",
        settings: publicSettings,
      };
    }
    if (!publicSettings.escrowProviderAvailable) {
      return {
        allowed: false,
        errorCode: "ESCROW_PROVIDER_UNAVAILABLE",
        error:
          "The approved Escrow Partner is temporarily unavailable. Per platform safety policy, Protected Payments do not silently fall back to standard payments.",
        settings: publicSettings,
      };
    }

    return {
      allowed: true,
      settings: publicSettings,
      route: {
        paymentMode: "protected_escrow",
        provider: "escrow_partner",
        secretKey: process.env.OFIA_ESCROW_SECRET_KEY || "escrow_sandbox_verified",
        ofiaFeePct: 0,
        protectionFeePct: publicSettings.protectionFeePct,
      },
    };
  }

  // Standard Order Route 1: Merchant BYOK
  if (publicSettings.byokEnabled) {
    if (publicSettings.byokProvider === "paystack" && _paystackSecretPlain) {
      return {
        allowed: true,
        settings: publicSettings,
        route: {
          paymentMode: "merchant_byok",
          provider: "paystack",
          secretKey: _paystackSecretPlain,
          publicKey: publicSettings.paystackPublicKey,
          ofiaFeePct: 0,
          protectionFeePct: 0,
        },
      };
    }
    if (publicSettings.byokProvider === "nomba" && _nombaPrivatePlain) {
      return {
        allowed: true,
        settings: publicSettings,
        route: {
          paymentMode: "merchant_byok",
          provider: "nomba",
          secretKey: _nombaPrivatePlain,
          publicKey: publicSettings.nombaClientId,
          ofiaFeePct: 0,
          protectionFeePct: 0,
        },
      };
    }
  }

  // Standard Order Route 2: Ofia Managed Payments
  if (publicSettings.managedPaymentsEnabled && publicSettings.managedPaymentsEligible) {
    const managedSecret =
      process.env.OFIA_MANAGED_PAYSTACK_SECRET_KEY ||
      process.env.PAYSTACK_SECRET_KEY ||
      "managed_sandbox_verified";
    return {
      allowed: true,
      settings: publicSettings,
      route: {
        paymentMode: "ofia_managed",
        provider: "paystack",
        secretKey: managedSecret,
        ofiaFeePct: publicSettings.managedFeePct,
        protectionFeePct: 0,
      },
    };
  }

  return {
    allowed: false,
    errorCode: "NO_PAYMENT_ROUTE_CONFIGURED",
    error:
      "This merchant has not connected a BYOK payment provider or activated Ofia Managed Payments.",
    settings: publicSettings,
  };
}

// ---------------------------------------------------------------------------
// Server-Side Payment Initialization & Verification
// ---------------------------------------------------------------------------

export interface InitializePaymentInput {
  tenantSlug: string;
  tenantId?: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subtotalAmount: number;
  deliveryFee?: number;
  discount?: number;
  requestedMode: "standard" | "protected_escrow" | PaymentMode;
  callbackUrl?: string;
}

export async function initializeOrderPayment(input: InitializePaymentInput) {
  const cleanSlug = input.tenantSlug.toLowerCase().trim();
  const sql = await getTenantSql(cleanSlug);
  await ensurePaymentInfrastructureTables(sql, cleanSlug);

  // Check if an active attempt already locked the payment_mode for this order
  const existingAttempts = await sql`
    SELECT id, payment_mode, provider, provider_reference, status, authorization_url, amount, protection_fee
    FROM payment_attempts
    WHERE LOWER(tenant_slug) = ${cleanSlug}
      AND order_number = ${input.orderNumber}
      AND status IN ('pending', 'processing', 'successful')
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  const resolution = await resolveCheckoutPaymentRoute(cleanSlug, input.requestedMode);
  if (!resolution.allowed || !resolution.route) {
    return {
      success: false,
      errorCode: resolution.errorCode || "PAYMENT_INIT_FAILED",
      error: resolution.error || "Unable to resolve payment route",
    };
  }

  const route = resolution.route;

  // Enforce payment_mode immutability after initialization unless prior attempt was cancelled/failed
  if (
    existingAttempts.length > 0 &&
    existingAttempts[0].payment_mode !== route.paymentMode
  ) {
    return {
      success: false,
      errorCode: "PAYMENT_MODE_IMMUTABLE",
      error: `Payment mode for order ${input.orderNumber} is already locked to '${existingAttempts[0].payment_mode}'. Cancel the existing attempt before switching modes.`,
    };
  }

  const baseAmount =
    Math.max(0, Number(input.subtotalAmount) || 0) +
    Math.max(0, Number(input.deliveryFee) || 0) -
    Math.max(0, Number(input.discount) || 0);
  const protectionFee =
    route.paymentMode === "protected_escrow"
      ? Math.round(baseAmount * (route.protectionFeePct / 100) * 100) / 100
      : 0;
  const totalPayable = Math.round((baseAmount + protectionFee) * 100) / 100;
  const ofiaFee =
    route.paymentMode === "ofia_managed"
      ? Math.round(baseAmount * (route.ofiaFeePct / 100) * 100) / 100
      : 0;
  const providerFee = Math.min(2000, Math.round(totalPayable * 0.015 * 100) / 100);
  const merchantNet = Math.max(0, Math.round((baseAmount - ofiaFee - (route.paymentMode === "merchant_byok" ? providerFee : 0)) * 100) / 100);

  const attemptId = `att_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const txId = `ptx_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const prefix =
    route.paymentMode === "protected_escrow"
      ? "OFIA-ESC"
      : route.paymentMode === "merchant_byok"
      ? "OFIA-BYOK"
      : "OFIA-MGD";
  const providerReference = `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  let authorizationUrl =
    input.callbackUrl ||
    `/order-confirmed?ref=${encodeURIComponent(input.orderNumber)}&paymentRef=${encodeURIComponent(providerReference)}&tenant=${encodeURIComponent(cleanSlug)}&escrow=${route.paymentMode === "protected_escrow" ? "1" : "0"}`;
  let rawProviderResp: Record<string, any> = {
    mode: route.paymentMode,
    provider: route.provider,
    reference: providerReference,
  };

  // Live Paystack initialization when real Paystack secret key (sk_test_* or sk_live_*) is configured
  if (
    route.provider === "paystack" &&
    (route.secretKey.startsWith("sk_test_") || route.secretKey.startsWith("sk_live_"))
  ) {
    try {
      const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${route.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: input.customerEmail || `buyer@${cleanSlug}.ofia.shop`,
          amount: Math.round(totalPayable * 100), // kobo
          reference: providerReference,
          callback_url: input.callbackUrl || undefined,
          metadata: {
            tenant_slug: cleanSlug,
            order_id: input.orderId,
            order_number: input.orderNumber,
            payment_mode: route.paymentMode,
          },
        }),
        signal: AbortSignal.timeout(10000),
      });
      const psJson = await psRes.json().catch(() => null);
      if (psRes.ok && psJson?.status && psJson?.data?.authorization_url) {
        authorizationUrl = psJson.data.authorization_url;
        rawProviderResp = psJson.data;
      }
    } catch (err: any) {
      rawProviderResp.initWarning = err?.message || "Paystack initialize fallback";
    }
  }

  // Record payment attempt
  await sql`
    INSERT INTO payment_attempts (
      id, tenant_slug, tenant_id, order_id, order_number, payment_mode, provider,
      provider_reference, amount, protection_fee, currency, status, authorization_url,
      customer_email, customer_name, raw_request, raw_response, created_at, updated_at
    ) VALUES (
      ${attemptId}, ${cleanSlug}, ${input.tenantId || `org-${cleanSlug}`},
      ${input.orderId}, ${input.orderNumber}, ${route.paymentMode}, ${route.provider},
      ${providerReference}, ${totalPayable}, ${protectionFee}, 'NGN', 'pending',
      ${authorizationUrl}, ${input.customerEmail || ""}, ${input.customerName || ""},
      ${JSON.stringify(input)}::jsonb, ${JSON.stringify(rawProviderResp)}::jsonb, NOW(), NOW()
    );
  `;

  // Record pending payment transaction
  await sql`
    INSERT INTO payment_transactions (
      id, tenant_slug, tenant_id, order_id, order_number, attempt_id, payment_mode,
      provider, provider_reference, customer_name, customer_email, gross_amount,
      provider_fee, ofia_fee, protection_fee, net_amount, currency, status,
      settlement_status, channel, created_at, updated_at
    ) VALUES (
      ${txId}, ${cleanSlug}, ${input.tenantId || `org-${cleanSlug}`},
      ${input.orderId}, ${input.orderNumber}, ${attemptId}, ${route.paymentMode},
      ${route.provider}, ${providerReference}, ${input.customerName || ""},
      ${input.customerEmail || ""}, ${totalPayable}, ${providerFee}, ${ofiaFee},
      ${protectionFee}, ${merchantNet}, 'NGN', 'pending', 'pending', 'card', NOW(), NOW()
    );
  `;

  // If Protected Payment (Escrow), create the authoritative escrow case with the approved escrow partner
  let escrowCaseId = "";
  if (route.paymentMode === "protected_escrow") {
    escrowCaseId = `esc_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const providerEscrowRef = `ESCP-${providerReference}`;
    await sql`
      INSERT INTO escrow_cases (
        id, tenant_slug, tenant_id, order_id, order_number, provider,
        provider_escrow_reference, customer_name, customer_email, customer_phone,
        gross_amount, protection_fee, merchant_net_amount, currency,
        status, fulfilment_status, created_at, updated_at
      ) VALUES (
        ${escrowCaseId}, ${cleanSlug}, ${input.tenantId || `org-${cleanSlug}`},
        ${input.orderId}, ${input.orderNumber}, ${resolution.settings.escrowProvider},
        ${providerEscrowRef}, ${input.customerName || ""}, ${input.customerEmail || ""},
        ${input.customerPhone || ""}, ${totalPayable}, ${protectionFee}, ${merchantNet},
        'NGN', 'awaiting_funding', 'unfulfilled', NOW(), NOW()
      )
      ON CONFLICT (order_number) DO UPDATE SET
        provider_escrow_reference = EXCLUDED.provider_escrow_reference,
        gross_amount = EXCLUDED.gross_amount,
        protection_fee = EXCLUDED.protection_fee,
        merchant_net_amount = EXCLUDED.merchant_net_amount,
        updated_at = NOW();
    `;
  }

  // Update order with payment_mode, payment_provider, payment_reference, and awaiting_payment status
  await sql`
    UPDATE shop_orders
    SET payment_mode = ${route.paymentMode},
        payment_provider = ${route.provider},
        payment_reference = ${providerReference},
        payment_status = 'PENDING',
        fulfilment_status = 'unfulfilled',
        is_escrow = ${route.paymentMode === "protected_escrow"},
        escrow_status = ${route.paymentMode === "protected_escrow" ? "AWAITING_FUNDING" : "NONE"},
        settlement_status = 'PENDING',
        protection_fee = ${protectionFee},
        platform_fee = ${ofiaFee},
        merchant_amount = ${merchantNet},
        raw_amount = ${totalPayable},
        total_amount = ${`₦${totalPayable.toLocaleString()}`},
        updated_at = NOW()
    WHERE (id = ${input.orderId} OR order_number = ${input.orderNumber})
      AND LOWER(tenant_slug) = ${cleanSlug};
  `;

  await recordOrderStatusHistory({
    sql,
    tenantSlug: cleanSlug,
    tenantId: input.tenantId,
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    domain: "PAYMENT",
    previousState: "ORDER_CREATED",
    newState: "AWAITING_PAYMENT",
    actor: "payment_initializer",
    notes: `Initialized ${route.paymentMode} payment via ${route.provider} (${providerReference})`,
    metadata: { attemptId, providerReference, totalPayable, protectionFee },
  });

  return {
    success: true,
    attemptId,
    transactionId: txId,
    escrowCaseId: escrowCaseId || undefined,
    paymentMode: route.paymentMode,
    provider: route.provider,
    providerReference,
    authorizationUrl,
    breakdown: {
      baseAmount,
      protectionFee,
      ofiaFee,
      providerFee,
      merchantNet,
      totalPayable,
      currency: "NGN",
    },
  };
}

// ---------------------------------------------------------------------------
// Idempotent Verification & Webhook Event Processing
// ---------------------------------------------------------------------------

export async function verifyAndConfirmPaymentTransaction(params: {
  tenantSlug: string;
  providerReference: string;
  verifiedSource: "webhook" | "server_verify";
  providerPayload?: Record<string, any>;
}) {
  const cleanSlug = params.tenantSlug.toLowerCase().trim();
  const cleanRef = params.providerReference.trim();
  const sql = await getTenantSql(cleanSlug);
  await ensurePaymentInfrastructureTables(sql, cleanSlug);

  const txRows = await sql`
    SELECT * FROM payment_transactions
    WHERE provider_reference = ${cleanRef}
      AND LOWER(tenant_slug) = ${cleanSlug}
    LIMIT 1;
  `;

  if (!txRows || txRows.length === 0) {
    return { success: false, error: `Transaction '${cleanRef}' not found for tenant '${cleanSlug}'` };
  }

  const tx = txRows[0];

  // Idempotency guard: if already marked successful, return without double-crediting
  if (tx.status === "successful") {
    return {
      success: true,
      alreadyProcessed: true,
      transaction: tx,
    };
  }

  const settings = await getTenantPaymentSettings(cleanSlug);

  // If Paystack live/test secret key is present, verify directly against Paystack API
  if (
    tx.provider === "paystack" &&
    settings._paystackSecretPlain &&
    (settings._paystackSecretPlain.startsWith("sk_test_") ||
      settings._paystackSecretPlain.startsWith("sk_live_"))
  ) {
    try {
      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(cleanRef)}`,
        {
          headers: { Authorization: `Bearer ${settings._paystackSecretPlain}` },
          signal: AbortSignal.timeout(10000),
        }
      );
      const verifyJson = await verifyRes.json().catch(() => null);
      if (verifyRes.ok && verifyJson?.data) {
        if (verifyJson.data.status !== "success") {
          return {
            success: false,
            error: `Provider verification reported status '${verifyJson.data.status}'`,
          };
        }
        const verifiedAmountNgn = Number(verifyJson.data.amount || 0) / 100;
        if (verifiedAmountNgn < Number(tx.gross_amount)) {
          return {
            success: false,
            error: `Verified amount (₦${verifiedAmountNgn}) is less than expected order total (₦${tx.gross_amount})`,
          };
        }
      }
    } catch {}
  }

  const isEscrow = tx.payment_mode === "protected_escrow";
  const settlementStatus = isEscrow
    ? "held_by_escrow_partner"
    : tx.payment_mode === "merchant_byok"
    ? "pending_provider_settlement"
    : "pending_managed_settlement";

  await sql`
    UPDATE payment_attempts
    SET status = 'successful',
        updated_at = NOW()
    WHERE provider_reference = ${cleanRef}
      AND LOWER(tenant_slug) = ${cleanSlug};
  `;

  const [updatedTx] = await sql`
    UPDATE payment_transactions
    SET status = 'successful',
        settlement_status = ${settlementStatus},
        verified_source = ${params.verifiedSource},
        raw_provider_payload = ${JSON.stringify(params.providerPayload || {})}::jsonb,
        verified_at = NOW(),
        updated_at = NOW()
    WHERE provider_reference = ${cleanRef}
      AND LOWER(tenant_slug) = ${cleanSlug}
    RETURNING *;
  `;

  // Update order payment_status (keep fulfilment_status separate!)
  await sql`
    UPDATE shop_orders
    SET payment_status = 'PAID',
        status = CASE WHEN status = 'PENDING' OR status = 'AWAITING_PAYMENT' THEN 'IN_PREPARATION' ELSE status END,
        fulfilment_status = CASE WHEN COALESCE(fulfilment_status, 'unfulfilled') = 'unfulfilled' THEN 'processing' ELSE fulfilment_status END,
        escrow_status = ${isEscrow ? "HELD" : "NONE"},
        settlement_status = ${isEscrow ? "HELD_ESCROW" : "PENDING_SETTLEMENT"},
        updated_at = NOW()
    WHERE (id = ${tx.order_id} OR order_number = ${tx.order_number})
      AND LOWER(tenant_slug) = ${cleanSlug};
  `;

  if (isEscrow) {
    await sql`
      UPDATE escrow_cases
      SET status = 'held',
          fulfilment_status = 'awaiting_fulfilment',
          updated_at = NOW()
      WHERE order_number = ${tx.order_number}
        AND LOWER(tenant_slug) = ${cleanSlug};
    `;
  } else {
    // Create pending settlement record for standard BYOK / Managed payments
    const settlementId = `stl_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    await sql`
      INSERT INTO merchant_settlements (
        id, tenant_slug, tenant_id, provider, payment_mode, settlement_reference,
        gross_amount, provider_fee, ofia_fee, net_amount, currency, status,
        transaction_references, created_at, updated_at
      ) VALUES (
        ${settlementId}, ${cleanSlug}, ${tx.tenant_id || `org-${cleanSlug}`},
        ${tx.provider}, ${tx.payment_mode}, ${`STL-${cleanRef}`},
        ${tx.gross_amount}, ${tx.provider_fee}, ${tx.ofia_fee}, ${tx.net_amount},
        'NGN', 'pending', ${JSON.stringify([cleanRef])}::jsonb, NOW(), NOW()
      );
    `;
  }

  // Append immutable financial ledger entry
  const ledgerId = `fle_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  await sql`
    INSERT INTO financial_ledger_entries (
      id, tenant_slug, tenant_id, order_id, order_number, transaction_id,
      payment_mode, provider, provider_reference, entry_type, direction,
      gross_amount, provider_fee, ofia_fee, protection_fee, net_amount,
      currency, status, description, created_at
    ) VALUES (
      ${ledgerId}, ${cleanSlug}, ${tx.tenant_id || `org-${cleanSlug}`},
      ${tx.order_id}, ${tx.order_number}, ${tx.id}, ${tx.payment_mode},
      ${tx.provider}, ${cleanRef},
      ${isEscrow ? "ESCROW_FUNDED_HELD" : "PAYMENT_CAPTURED"},
      'CREDIT', ${tx.gross_amount}, ${tx.provider_fee}, ${tx.ofia_fee},
      ${tx.protection_fee}, ${tx.net_amount}, 'NGN', 'VERIFIED',
      ${
        isEscrow
          ? `Order #${tx.order_number} funded and safeguarded with ${tx.provider} (${cleanRef}).`
          : `Order #${tx.order_number} payment verified via ${tx.provider} (${tx.payment_mode}).`
      },
      NOW()
    );
  `;

  await recordOrderStatusHistory({
    sql,
    tenantSlug: cleanSlug,
    tenantId: tx.tenant_id,
    orderId: tx.order_id,
    orderNumber: tx.order_number,
    domain: isEscrow ? "ESCROW" : "PAYMENT",
    previousState: "AWAITING_PAYMENT",
    newState: isEscrow ? "ESCROW_FUNDED_HELD" : "PAYMENT_CONFIRMED",
    actor: params.verifiedSource,
    notes: `Verified ${tx.payment_mode} transaction ${cleanRef} via ${tx.provider}`,
  });

  try {
    publishCommerceEvent(cleanSlug, {
      type: "ORDER_STATUS_CHANGED",
      data: {
        orderNumber: tx.order_number,
        paymentStatus: "PAID",
        paymentMode: tx.payment_mode,
        escrowStatus: isEscrow ? "HELD" : "NONE",
      },
    });
  } catch {}

  return {
    success: true,
    alreadyProcessed: false,
    transaction: updatedTx,
  };
}
