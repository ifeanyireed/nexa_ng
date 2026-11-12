import { neon } from "@neondatabase/serverless";
import { MASTER_CONNECTION_STRING } from "@/lib/tenant-db-resolver";
import { encryptSecret, decryptSecret } from "./crypto-vault";

export type NeonLifecycleState =
  | "not_started"
  | "provisioning"
  | "database_provisioned"
  | "migrations_running"
  | "claim_pending"
  | "claim_email_sent"
  | "claim_in_progress"
  | "ownership_transferred"
  | "credentials_refresh_pending"
  | "connected"
  | "failed"
  | "expired";

export type CloudinaryLifecycleState =
  | "not_started"
  | "provisioning"
  | "verification_pending"
  | "active"
  | "connected"
  | "failed";

export type OwnershipStatus =
  | "unclaimed"
  | "claim_pending"
  | "claimed"
  | "customer_owned"
  | "ofia_managed";

export type OnboardingStage =
  | "BUSINESS_REGISTRATION"
  | "SLUG_SELECTION"
  | "BUSINESS_PROFILE"
  | "INFRASTRUCTURE_PROVISIONING"
  | "DATABASE_CLAIMING"
  | "INTEGRATION_VERIFICATION"
  | "COMPLETED";

export interface InfrastructureRecord {
  id: string;
  tenantId: string;
  tenantSlug: string;
  provider: "neon" | "cloudinary";
  resourceId: string;
  resourceType: "database" | "media_storage";
  ownershipStatus: OwnershipStatus;
  provisioningStatus: string;
  verificationStatus: "unverified" | "verified" | "failed";
  claimStatus: string;
  customerEmail: string;
  credentialVaultRef?: string;
  decryptedCredential?: string;
  claimUrl?: string;
  claimUserCode?: string;
  claimExpiresAt?: string | null;
  claimEmailSentAt?: string | null;
  lastConnectionTestAt?: string | null;
  lastConnectionTestStatus?: string;
  errorDetails?: string;
  retryCount: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

let tablesInitialized = false;

/**
 * Initializes and ensures schema tables and columns exist in Neon platform database.
 */
export async function ensureInfrastructureRegistry(): Promise<void> {
  if (tablesInitialized || !MASTER_CONNECTION_STRING) return;

  const sql = neon(MASTER_CONNECTION_STRING);

  try {
    // 1. Ensure platform_tenants table has new onboarding columns
    await sql`
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'NOT_STARTED';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 1;
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS neon_project_id VARCHAR(100) DEFAULT '';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS neon_branch_id VARCHAR(100) DEFAULT '';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS neon_claim_url TEXT DEFAULT '';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS neon_claim_code VARCHAR(50) DEFAULT '';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS neon_claim_status VARCHAR(50) DEFAULT 'not_started';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS neon_ownership_status VARCHAR(50) DEFAULT 'unclaimed';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS neon_claim_expires_at TIMESTAMPTZ;
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS neon_reconciled BOOLEAN DEFAULT FALSE;
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS cloudinary_cloud_name VARCHAR(100) DEFAULT '';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS cloudinary_status VARCHAR(50) DEFAULT 'not_started';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS cloudinary_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS slug_status VARCHAR(50) DEFAULT 'CONFIRMED';
      ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS slug_registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    `;

    // 2. Create tenant_infrastructure_registry
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_infrastructure_registry (
        id VARCHAR(64) PRIMARY KEY,
        tenant_id VARCHAR(64) NOT NULL,
        tenant_slug VARCHAR(191) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        resource_id VARCHAR(255) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        ownership_status VARCHAR(50) NOT NULL DEFAULT 'unclaimed',
        provisioning_status VARCHAR(50) NOT NULL DEFAULT 'not_started',
        verification_status VARCHAR(50) NOT NULL DEFAULT 'unverified',
        claim_status VARCHAR(50) NOT NULL DEFAULT 'not_started',
        customer_email VARCHAR(255) NOT NULL,
        credential_vault_ref TEXT DEFAULT '',
        claim_url TEXT DEFAULT '',
        claim_user_code VARCHAR(50) DEFAULT '',
        claim_expires_at TIMESTAMPTZ,
        claim_email_sent_at TIMESTAMPTZ,
        last_connection_test_at TIMESTAMPTZ,
        last_connection_test_status VARCHAR(50) DEFAULT '',
        error_details TEXT DEFAULT '',
        retry_count INT DEFAULT 0,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_tenant_infra_provider UNIQUE (tenant_slug, provider)
      );
    `;

    // 3. Create tenant_onboarding_audit_logs
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_onboarding_audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        tenant_id VARCHAR(64) NOT NULL,
        tenant_slug VARCHAR(191) NOT NULL,
        action VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        details TEXT DEFAULT '',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Create performance indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_infra_tenant_slug ON tenant_infrastructure_registry(LOWER(tenant_slug));
      CREATE INDEX IF NOT EXISTS idx_infra_provider ON tenant_infrastructure_registry(provider);
      CREATE INDEX IF NOT EXISTS idx_audit_tenant_slug ON tenant_onboarding_audit_logs(LOWER(tenant_slug), created_at DESC);
    `;

    tablesInitialized = true;
  } catch (err: any) {
    console.warn("[Infrastructure Registry] Initialization error:", err.message);
  }
}

/**
 * Record an audit event for tenant onboarding operations
 */
export async function logOnboardingAudit(
  tenantId: string,
  tenantSlug: string,
  action: string,
  status: "SUCCESS" | "WARNING" | "ERROR" | "IN_PROGRESS",
  details: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await ensureInfrastructureRegistry();
    const sql = neon(MASTER_CONNECTION_STRING);
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await sql`
      INSERT INTO tenant_onboarding_audit_logs (
        id, tenant_id, tenant_slug, action, status, details, metadata, created_at
      ) VALUES (
        ${id}, ${tenantId}, ${tenantSlug.toLowerCase().trim()},
        ${action}, ${status}, ${details}, ${JSON.stringify(metadata)}::jsonb, NOW()
      );
    `;
  } catch (err: any) {
    console.warn("[Onboarding Audit Log] Failed to write log:", err.message);
  }
}

/**
 * Upsert infrastructure record for a tenant provider (Neon or Cloudinary)
 */
export async function upsertInfrastructureRecord(record: Partial<InfrastructureRecord> & {
  tenantId: string;
  tenantSlug: string;
  provider: "neon" | "cloudinary";
}): Promise<void> {
  await ensureInfrastructureRegistry();
  const sql = neon(MASTER_CONNECTION_STRING);

  const cleanSlug = record.tenantSlug.toLowerCase().trim();
  const id = record.id || `infra-${cleanSlug}-${record.provider}-${Date.now()}`;
  const encryptedCred = record.decryptedCredential
    ? encryptSecret(record.decryptedCredential)
    : (record.credentialVaultRef || "");

  await sql`
    INSERT INTO tenant_infrastructure_registry (
      id, tenant_id, tenant_slug, provider, resource_id, resource_type,
      ownership_status, provisioning_status, verification_status, claim_status,
      customer_email, credential_vault_ref, claim_url, claim_user_code,
      claim_expires_at, claim_email_sent_at, last_connection_test_at,
      last_connection_test_status, error_details, retry_count, metadata,
      created_at, updated_at
    ) VALUES (
      ${id}, ${record.tenantId}, ${cleanSlug}, ${record.provider},
      ${record.resourceId || ""}, ${record.resourceType || (record.provider === "neon" ? "database" : "media_storage")},
      ${record.ownershipStatus || "unclaimed"}, ${record.provisioningStatus || "not_started"},
      ${record.verificationStatus || "unverified"}, ${record.claimStatus || "not_started"},
      ${record.customerEmail || ""}, ${encryptedCred}, ${record.claimUrl || ""},
      ${record.claimUserCode || ""}, ${record.claimExpiresAt ? new Date(record.claimExpiresAt) : null},
      ${record.claimEmailSentAt ? new Date(record.claimEmailSentAt) : null},
      ${record.lastConnectionTestAt ? new Date(record.lastConnectionTestAt) : null},
      ${record.lastConnectionTestStatus || ""}, ${record.errorDetails || ""},
      ${record.retryCount || 0}, ${JSON.stringify(record.metadata || {})}::jsonb,
      NOW(), NOW()
    )
    ON CONFLICT (tenant_slug, provider) DO UPDATE
    SET resource_id = CASE WHEN EXCLUDED.resource_id <> '' THEN EXCLUDED.resource_id ELSE tenant_infrastructure_registry.resource_id END,
        ownership_status = COALESCE(EXCLUDED.ownership_status, tenant_infrastructure_registry.ownership_status),
        provisioning_status = COALESCE(EXCLUDED.provisioning_status, tenant_infrastructure_registry.provisioning_status),
        verification_status = COALESCE(EXCLUDED.verification_status, tenant_infrastructure_registry.verification_status),
        claim_status = COALESCE(EXCLUDED.claim_status, tenant_infrastructure_registry.claim_status),
        customer_email = CASE WHEN EXCLUDED.customer_email <> '' THEN EXCLUDED.customer_email ELSE tenant_infrastructure_registry.customer_email END,
        credential_vault_ref = CASE WHEN EXCLUDED.credential_vault_ref <> '' THEN EXCLUDED.credential_vault_ref ELSE tenant_infrastructure_registry.credential_vault_ref END,
        claim_url = CASE WHEN EXCLUDED.claim_url <> '' THEN EXCLUDED.claim_url ELSE tenant_infrastructure_registry.claim_url END,
        claim_user_code = CASE WHEN EXCLUDED.claim_user_code <> '' THEN EXCLUDED.claim_user_code ELSE tenant_infrastructure_registry.claim_user_code END,
        claim_expires_at = COALESCE(EXCLUDED.claim_expires_at, tenant_infrastructure_registry.claim_expires_at),
        claim_email_sent_at = COALESCE(EXCLUDED.claim_email_sent_at, tenant_infrastructure_registry.claim_email_sent_at),
        last_connection_test_at = COALESCE(EXCLUDED.last_connection_test_at, tenant_infrastructure_registry.last_connection_test_at),
        last_connection_test_status = COALESCE(EXCLUDED.last_connection_test_status, tenant_infrastructure_registry.last_connection_test_status),
        error_details = COALESCE(EXCLUDED.error_details, tenant_infrastructure_registry.error_details),
        retry_count = EXCLUDED.retry_count,
        metadata = COALESCE(EXCLUDED.metadata, tenant_infrastructure_registry.metadata),
        updated_at = NOW();
  `;
}

/**
 * Retrieves infrastructure records for a tenant with decrypted credentials where needed
 */
export async function getTenantInfrastructure(tenantSlug: string): Promise<Record<string, InfrastructureRecord>> {
  await ensureInfrastructureRegistry();
  const sql = neon(MASTER_CONNECTION_STRING);
  const cleanSlug = tenantSlug.toLowerCase().trim();

  const rows = await sql`
    SELECT * FROM tenant_infrastructure_registry
    WHERE LOWER(tenant_slug) = ${cleanSlug};
  `;

  const result: Record<string, InfrastructureRecord> = {};

  for (const r of rows) {
    const record: InfrastructureRecord = {
      id: r.id,
      tenantId: r.tenant_id,
      tenantSlug: r.tenant_slug,
      provider: r.provider,
      resourceId: r.resource_id,
      resourceType: r.resource_type,
      ownershipStatus: r.ownership_status,
      provisioningStatus: r.provisioning_status,
      verificationStatus: r.verification_status,
      claimStatus: r.claim_status,
      customerEmail: r.customer_email,
      credentialVaultRef: r.credential_vault_ref,
      decryptedCredential: r.credential_vault_ref ? decryptSecret(r.credential_vault_ref) : "",
      claimUrl: r.claim_url,
      claimUserCode: r.claim_user_code,
      claimExpiresAt: r.claim_expires_at,
      claimEmailSentAt: r.claim_email_sent_at,
      lastConnectionTestAt: r.last_connection_test_at,
      lastConnectionTestStatus: r.last_connection_test_status,
      errorDetails: r.error_details,
      retryCount: r.retry_count || 0,
      metadata: r.metadata || {},
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
    result[r.provider] = record;
  }

  return result;
}
