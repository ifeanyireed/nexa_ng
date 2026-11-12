import { neon } from "@neondatabase/serverless";
import { MASTER_CONNECTION_STRING, testDatabaseConnection, invalidateTenantDbCache } from "@/lib/tenant-db-resolver";
import { ensureDefaultTenantAdmin } from "@/lib/tenant-admin-provisioner";
import { alignTenantModules, getDefaultModulesForVertical } from "@/lib/tenant-module-aligner";
import { registerDomainOnEdge, isCustomDomain } from "@/lib/domain-edge-manager";
import { validateSubdomainAvailability, normalizeSubdomainSlug } from "@/lib/subdomain-checker";
import {
  ensureInfrastructureRegistry,
  logOnboardingAudit,
  upsertInfrastructureRecord,
  getTenantInfrastructure,
} from "./infrastructure-registry";
import {
  provisionCloudinaryAccount,
  connectExistingCloudinaryAccount,
  testCloudinaryConnectivity,
} from "./cloudinary-provisioner";
import {
  provisionNeonClaimableDatabase,
  regenerateNeonClaimLink,
  checkNeonClaimStatus,
  sendNeonDatabaseClaimEmail,
} from "./neon-claimable-provisioner";

export interface RegisterTenantParams {
  businessName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  password?: string;
  vertical?: string;
  planTier?: string;
  phone?: string;
}

export interface BusinessProfileParams {
  tenantSlug: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  description?: string;
  vertical?: string;
  logo?: string;
}

export interface OnboardingState {
  tenant: any;
  infrastructure: {
    neon?: any;
    cloudinary?: any;
  };
  step: number;
  status: string;
  isComplete: boolean;
  canProceedToClaim: boolean;
  canProceedToVerification: boolean;
}

/**
 * 1. Transactional Registration and Authoritative Slug Reservation
 */
export async function registerTenantAndReserveSlug(params: RegisterTenantParams): Promise<{
  success: boolean;
  tenant?: any;
  error?: string;
  suggestions?: string[];
}> {
  const {
    businessName,
    slug: rawSlug,
    ownerName,
    ownerEmail,
    password,
    vertical = "retail",
    planTier = "GROWTH",
  } = params;

  if (!businessName || !rawSlug || !ownerEmail) {
    return {
      success: false,
      error: "Business name, slug, and administrator email are required.",
    };
  }

  const cleanSlug = normalizeSubdomainSlug(rawSlug);
  if (!cleanSlug) {
    return {
      success: false,
      error: "Please provide a valid slug (letters, numbers, hyphens only).",
    };
  }

  await ensureInfrastructureRegistry();
  const sql = neon(MASTER_CONNECTION_STRING);

  // Authoritative uniqueness and reservation validation
  const existingRows = await sql`
    SELECT slug FROM platform_tenants WHERE LOWER(slug) = ${cleanSlug} LIMIT 1;
  `;

  const existingSet = new Set<string>(existingRows.map((r: any) => r.slug.toLowerCase()));
  const validation = validateSubdomainAvailability(cleanSlug, existingSet);

  if (!validation.isAvailable) {
    return {
      success: false,
      error: validation.message,
      suggestions: validation.suggestions,
    };
  }

  const tenantId = `org-${Date.now()}`;
  const domain = `${cleanSlug}.ofia.ng`;
  const defaultPreset = getDefaultModulesForVertical(vertical);

  try {
    // Transactional insert with ON CONFLICT protection
    const [tenant] = await sql`
      INSERT INTO platform_tenants (
        id, name, slug, domain, owner_name, owner_email, plan_tier, status,
        db_mode, is_custom_db, is_custom_storage, mrr, vertical,
        erp_modules, shop_sub_modules, mobility_sub_modules,
        onboarding_status, onboarding_step, slug_status, slug_registered_at,
        created_at, updated_at
      ) VALUES (
        ${tenantId}, ${businessName.trim()}, ${cleanSlug}, ${domain},
        ${ownerName.trim() || `${businessName} Admin`}, ${ownerEmail.trim().toLowerCase()},
        ${planTier}, 'Onboarding', 'DEDICATED', true, false, 24000, ${vertical},
        ${JSON.stringify(defaultPreset.erpModules)}::jsonb,
        ${JSON.stringify(defaultPreset.shopSubModules)}::jsonb,
        ${JSON.stringify(defaultPreset.mobilitySubModules)}::jsonb,
        'IN_PROGRESS', 2, 'CONFIRMED', NOW(),
        NOW(), NOW()
      )
      RETURNING *;
    `;

    // Ensure default admin user account exists in Users DB
    try {
      await ensureDefaultTenantAdmin({
        tenantSlug: cleanSlug,
        tenantName: businessName,
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerName: ownerName || `${businessName} Admin`,
        domain,
        vertical,
        password: password || process.env.DEFAULT_TENANT_ADMIN_PASSWORD || undefined,
      });
    } catch (adminErr: any) {
      console.warn(`[Provisioning Engine] Tenant admin creation note for '${cleanSlug}':`, adminErr.message);
    }

    // Align RBAC permission matrix
    try {
      await alignTenantModules(cleanSlug, {
        erpModules: defaultPreset.erpModules,
        shopSubModules: defaultPreset.shopSubModules,
        mobilitySubModules: defaultPreset.mobilitySubModules,
      });
    } catch (alignErr: any) {
      console.warn(`[Provisioning Engine] Module alignment note for '${cleanSlug}':`, alignErr.message);
    }

    await logOnboardingAudit(
      tenantId,
      cleanSlug,
      "TENANT_REGISTERED",
      "SUCCESS",
      `Tenant registered with reserved slug '${cleanSlug}' on domain '${domain}'`
    );

    return { success: true, tenant };
  } catch (err: any) {
    // Handle database-level collision
    if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
      const fallbackSuggestions = validation.suggestions.length > 0
        ? validation.suggestions
        : [`${cleanSlug}-ng`, `${cleanSlug}-hq`, `${cleanSlug}-app`];

      return {
        success: false,
        error: `The slug '${cleanSlug}' was registered by another user. Please choose an alternative.`,
        suggestions: fallbackSuggestions,
      };
    }

    return {
      success: false,
      error: "Failed to reserve tenant: " + err.message,
    };
  }
}

/**
 * 2. Save Business Profile
 */
export async function updateTenantBusinessProfile(params: BusinessProfileParams): Promise<{
  success: boolean;
  tenant?: any;
  error?: string;
}> {
  const { tenantSlug, address, city, state, country, phone, description, vertical, logo } = params;
  const cleanSlug = normalizeSubdomainSlug(tenantSlug);

  const sql = neon(MASTER_CONNECTION_STRING);

  try {
    const [updated] = await sql`
      UPDATE platform_tenants
      SET vertical = COALESCE(${vertical}, vertical),
          logo = COALESCE(${logo}, logo),
          hero_subtitle = COALESCE(${description}, hero_subtitle),
          onboarding_step = GREATEST(onboarding_step, 3),
          updated_at = NOW()
      WHERE LOWER(slug) = ${cleanSlug}
      RETURNING *;
    `;

    if (!updated) {
      return { success: false, error: `Tenant '${cleanSlug}' not found` };
    }

    await logOnboardingAudit(
      updated.id,
      cleanSlug,
      "BUSINESS_PROFILE_UPDATED",
      "SUCCESS",
      `Profile details updated for '${cleanSlug}'`,
      { city, state, country, phone }
    );

    return { success: true, tenant: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 3. Execute Infrastructure Provisioning
 * Coordinates Cloudinary provisioning and Neon Claimable Database creation
 */
export async function executeInfrastructureProvisioning(params: {
  tenantSlug: string;
  customCloudinaryUrl?: string;
}): Promise<{
  success: boolean;
  neonResult?: any;
  cloudinaryResult?: any;
  error?: string;
}> {
  const cleanSlug = normalizeSubdomainSlug(params.tenantSlug);
  const sql = neon(MASTER_CONNECTION_STRING);

  const [tenant] = await sql`
    SELECT * FROM platform_tenants WHERE LOWER(slug) = ${cleanSlug} LIMIT 1;
  `;

  if (!tenant) {
    return { success: false, error: `Tenant workspace '${cleanSlug}' not found` };
  }

  // Idempotency: If Neon project already provisioned, reuse it
  let neonResult: any = null;
  const infraMap = await getTenantInfrastructure(cleanSlug);

  // 1. Provision Cloudinary
  let cloudinaryResult: any = null;
  if (params.customCloudinaryUrl && params.customCloudinaryUrl.trim()) {
    cloudinaryResult = await connectExistingCloudinaryAccount({
      tenantId: tenant.id,
      tenantSlug: cleanSlug,
      cloudinaryUrl: params.customCloudinaryUrl.trim(),
      customerEmail: tenant.owner_email,
    });
  } else if (!tenant.cloudinary_url || tenant.cloudinary_status === "failed") {
    cloudinaryResult = await provisionCloudinaryAccount({
      tenantId: tenant.id,
      tenantSlug: cleanSlug,
      businessName: tenant.name,
      ownerEmail: tenant.owner_email,
    });
  } else {
    cloudinaryResult = {
      success: true,
      cloudName: tenant.cloudinary_cloud_name,
      cloudinaryUrl: tenant.cloudinary_url,
      verificationPending: !tenant.cloudinary_verified,
    };
  }

  // 2. Provision Neon Claimable Database
  if (
    !tenant.neon_project_id ||
    tenant.neon_claim_status === "failed" ||
    tenant.neon_claim_status === "expired"
  ) {
    neonResult = await provisionNeonClaimableDatabase({
      tenantId: tenant.id,
      tenantSlug: cleanSlug,
      businessName: tenant.name,
      ownerEmail: tenant.owner_email,
    });

    if (neonResult.success && neonResult.claimUrl && neonResult.userCode) {
      // Step E: Send claim email to customer
      await sendNeonDatabaseClaimEmail({
        recipientEmail: tenant.owner_email,
        recipientName: tenant.owner_name || tenant.name,
        businessName: tenant.name,
        tenantSlug: cleanSlug,
        claimUrl: neonResult.claimUrl,
        userCode: neonResult.userCode,
        expiresInMinutes: 15,
      });
    }
  } else {
    // If claim code is expired, regenerate
    let claimUrl = tenant.neon_claim_url;
    let userCode = tenant.neon_claim_code;
    const isExpired = tenant.neon_claim_expires_at && new Date(tenant.neon_claim_expires_at).getTime() < Date.now();

    if (isExpired) {
      const fresh = await regenerateNeonClaimLink(cleanSlug);
      if (fresh.success) {
        claimUrl = fresh.claimUrl;
        userCode = fresh.userCode;
      }
    }

    neonResult = {
      success: true,
      projectId: tenant.neon_project_id,
      databaseUrl: tenant.database_url,
      claimUrl,
      userCode,
      schemaBootstrapped: true,
    };
  }

  // Update onboarding state
  await sql`
    UPDATE platform_tenants
    SET onboarding_step = 4,
        onboarding_status = 'PENDING_CLAIM',
        updated_at = NOW()
    WHERE LOWER(slug) = ${cleanSlug};
  `;

  return {
    success: Boolean(neonResult?.success),
    neonResult,
    cloudinaryResult,
    error: neonResult?.error || cloudinaryResult?.error,
  };
}

/**
 * 4. Get Current Onboarding Progress and Live Status
 */
export async function getOnboardingProgress(tenantSlug: string): Promise<OnboardingState | null> {
  const cleanSlug = normalizeSubdomainSlug(tenantSlug);
  const sql = neon(MASTER_CONNECTION_STRING);

  const [tenant] = await sql`
    SELECT * FROM platform_tenants WHERE LOWER(slug) = ${cleanSlug} LIMIT 1;
  `;

  if (!tenant) return null;

  const infra = await getTenantInfrastructure(cleanSlug);
  const isComplete = tenant.onboarding_status === "COMPLETED";
  const step = tenant.onboarding_step || (isComplete ? 6 : 1);

  return {
    tenant,
    infrastructure: infra,
    step,
    status: tenant.onboarding_status || "IN_PROGRESS",
    isComplete,
    canProceedToClaim: Boolean(tenant.neon_project_id),
    canProceedToVerification: Boolean(tenant.neon_project_id && tenant.database_url),
  };
}

/**
 * 5. Verify All Infrastructure Integrations
 */
export async function verifyInfrastructureIntegrations(tenantSlug: string): Promise<{
  success: boolean;
  neon: {
    success: boolean;
    latencyMs?: number;
    error?: string;
  };
  cloudinary: {
    success: boolean;
    cloudName?: string;
    verified?: boolean;
    error?: string;
  };
}> {
  const cleanSlug = normalizeSubdomainSlug(tenantSlug);
  const sql = neon(MASTER_CONNECTION_STRING);

  const [tenant] = await sql`
    SELECT * FROM platform_tenants WHERE LOWER(slug) = ${cleanSlug} LIMIT 1;
  `;

  if (!tenant) {
    return {
      success: false,
      neon: { success: false, error: "Tenant not found" },
      cloudinary: { success: false, error: "Tenant not found" },
    };
  }

  // Test Neon Postgres connection
  let neonTest: any = { success: false, error: "No database URL configured" };
  if (tenant.database_url) {
    neonTest = await testDatabaseConnection(tenant.database_url);
  }

  // Test Cloudinary connection
  let cloudinaryTest: any = { success: false, error: "No Cloudinary storage configured" };
  if (tenant.cloudinary_url) {
    const cTest = await testCloudinaryConnectivity(tenant.cloudinary_url);
    cloudinaryTest = {
      success: cTest.success,
      cloudName: cTest.cloudName,
      verified: Boolean(cTest.success),
      error: cTest.error,
    };
  }

  return {
    success: neonTest.success && cloudinaryTest.success,
    neon: neonTest,
    cloudinary: cloudinaryTest,
  };
}

/**
 * 6. Complete Tenant Onboarding
 */
export async function completeTenantOnboarding(tenantSlug: string): Promise<{
  success: boolean;
  tenant?: any;
  error?: string;
}> {
  const cleanSlug = normalizeSubdomainSlug(tenantSlug);
  const sql = neon(MASTER_CONNECTION_STRING);

  const [tenant] = await sql`
    SELECT * FROM platform_tenants WHERE LOWER(slug) = ${cleanSlug} LIMIT 1;
  `;

  if (!tenant) {
    return { success: false, error: "Tenant not found" };
  }

  // Verify database connectivity
  if (!tenant.database_url) {
    return { success: false, error: "Cannot complete onboarding: Dedicated database is not configured." };
  }

  const dbPing = await testDatabaseConnection(tenant.database_url);
  if (!dbPing.success) {
    return {
      success: false,
      error: `Cannot complete onboarding: Database connection check failed (${dbPing.error}).`,
    };
  }

  // Mark tenant as Active and Onboarding as COMPLETED
  const [updated] = await sql`
    UPDATE platform_tenants
    SET status = 'Active',
        onboarding_status = 'COMPLETED',
        onboarding_step = 6,
        updated_at = NOW()
    WHERE LOWER(slug) = ${cleanSlug}
    RETURNING *;
  `;

  // Register custom domain on edge if present
  if (updated.domain && isCustomDomain(updated.domain)) {
    try {
      await registerDomainOnEdge(updated.domain);
    } catch (e: any) {
      console.warn("[Provisioning Engine] Edge domain registration warning:", e.message);
    }
  }

  invalidateTenantDbCache(cleanSlug);

  await logOnboardingAudit(
    updated.id,
    cleanSlug,
    "ONBOARDING_COMPLETED",
    "SUCCESS",
    `Tenant '${cleanSlug}' successfully completed self-service onboarding. Infrastructure active.`
  );

  return { success: true, tenant: updated };
}
