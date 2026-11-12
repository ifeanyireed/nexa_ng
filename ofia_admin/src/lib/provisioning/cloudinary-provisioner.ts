import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";
import { MASTER_CONNECTION_STRING } from "@/lib/tenant-db-resolver";
import {
  upsertInfrastructureRecord,
  logOnboardingAudit,
  CloudinaryLifecycleState,
} from "./infrastructure-registry";

export interface CloudinaryProvisioningResult {
  success: boolean;
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
  cloudinaryUrl?: string;
  verificationPending?: boolean;
  guidance?: string;
  error?: string;
}

export interface CloudinaryVerificationResult {
  success: boolean;
  cloudName?: string;
  plan?: string;
  creditsUsed?: number;
  creditsLimit?: number;
  error?: string;
}

/**
 * Parses a Cloudinary connection string into components
 */
export function parseCloudinaryConnectionString(rawUrl: string): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} | null {
  if (!rawUrl) return null;
  const cleaned = rawUrl.replace(/^CLOUDINARY_URL=/, "").trim();
  const match = cleaned.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/i);
  if (match) {
    return {
      apiKey: match[1],
      apiSecret: match[2],
      cloudName: match[3],
    };
  }
  return null;
}

/**
 * Provisions a customer-owned Cloudinary account using the Cloudinary Agent Account Creation API
 */
export async function provisionCloudinaryAccount(params: {
  tenantId: string;
  tenantSlug: string;
  businessName: string;
  ownerEmail: string;
}): Promise<CloudinaryProvisioningResult> {
  const { tenantId, tenantSlug, businessName, ownerEmail } = params;
  const cleanSlug = tenantSlug.toLowerCase().trim();

  // Validate owner email
  if (!ownerEmail || !ownerEmail.includes("@")) {
    return {
      success: false,
      error: "A valid business owner email address is required for Cloudinary account creation.",
    };
  }

  await logOnboardingAudit(
    tenantId,
    cleanSlug,
    "CLOUDINARY_PROVISION_INITIATED",
    "IN_PROGRESS",
    `Initiating Cloudinary account creation for '${businessName}' with owner email '${ownerEmail}'`
  );

  try {
    // Call Cloudinary Agent Account Creation API
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/provisioning/agents/accounts",
      {
        email: ownerEmail,
        agent_framework: "Ofia Provisioning Engine",
        agent_llm_model: "ofia-agent",
        agent_goal: `Automated tenant media storage provisioning for ${businessName} on Ofia Platform`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 20000,
      }
    );

    const data = response.data;

    if (data && data.product_environments && data.product_environments.length > 0) {
      const env = data.product_environments[0];
      const cloudName = env.cloud_name;
      const apiKey = env.api_key;
      const apiSecret = env.api_secret;
      const cloudinaryUrl =
        env.api_environment_variable?.replace(/^CLOUDINARY_URL=/, "") ||
        `cloudinary://${apiKey}:${apiSecret}@${cloudName}`;

      // Persist in tenant_infrastructure_registry
      await upsertInfrastructureRecord({
        tenantId,
        tenantSlug: cleanSlug,
        provider: "cloudinary",
        resourceId: cloudName,
        resourceType: "media_storage",
        ownershipStatus: "claim_pending",
        provisioningStatus: "active",
        verificationStatus: "unverified",
        claimStatus: "verification_pending",
        customerEmail: ownerEmail,
        decryptedCredential: cloudinaryUrl,
        metadata: {
          external_id: data.external_id,
          plan_name: data.plan_name,
          guidance: data.guidance,
          env_external_id: env.external_id,
        },
      });

      // Update platform_tenants table
      if (MASTER_CONNECTION_STRING) {
        const sql = neon(MASTER_CONNECTION_STRING);
        await sql`
          UPDATE platform_tenants
          SET cloudinary_url = ${cloudinaryUrl},
              cloudinary_cloud_name = ${cloudName},
              cloudinary_status = 'verification_pending',
              cloudinary_verified = false,
              is_custom_storage = true,
              updated_at = NOW()
          WHERE id = ${tenantId} OR LOWER(slug) = ${cleanSlug};
        `;
      }

      await logOnboardingAudit(
        tenantId,
        cleanSlug,
        "CLOUDINARY_ACCOUNT_CREATED",
        "SUCCESS",
        `Cloudinary account created with cloud name '${cloudName}'. Verification email sent to ${ownerEmail}.`,
        { cloudName, externalId: data.external_id }
      );

      return {
        success: true,
        cloudName,
        apiKey,
        apiSecret,
        cloudinaryUrl,
        verificationPending: true,
        guidance: data.guidance || "Verification email sent to customer. Please click verify in the email.",
      };
    } else {
      throw new Error("Unexpected payload structure returned from Cloudinary API");
    }
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      "Cloudinary provisioning request failed";

    await logOnboardingAudit(
      tenantId,
      cleanSlug,
      "CLOUDINARY_PROVISION_FAILED",
      "ERROR",
      `Failed to create Cloudinary account: ${errorMsg}`,
      { error: errorMsg }
    );

    // Update registry with error
    await upsertInfrastructureRecord({
      tenantId,
      tenantSlug: cleanSlug,
      provider: "cloudinary",
      resourceId: "",
      resourceType: "media_storage",
      ownershipStatus: "unclaimed",
      provisioningStatus: "failed",
      verificationStatus: "failed",
      claimStatus: "failed",
      customerEmail: ownerEmail,
      errorDetails: errorMsg,
    });

    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Connects an existing customer Cloudinary account
 */
export async function connectExistingCloudinaryAccount(params: {
  tenantId: string;
  tenantSlug: string;
  cloudinaryUrl: string;
  customerEmail: string;
}): Promise<CloudinaryProvisioningResult> {
  const { tenantId, tenantSlug, cloudinaryUrl, customerEmail } = params;
  const cleanSlug = tenantSlug.toLowerCase().trim();

  const parsed = parseCloudinaryConnectionString(cloudinaryUrl);
  if (!parsed) {
    return {
      success: false,
      error: "Invalid Cloudinary connection format. Expected: cloudinary://api_key:api_secret@cloud_name",
    };
  }

  // Verify credentials against Cloudinary ping endpoint
  const testRes = await testCloudinaryConnectivity(cloudinaryUrl);
  if (!testRes.success) {
    return {
      success: false,
      error: `Could not verify Cloudinary credentials: ${testRes.error}`,
    };
  }

  // Save to infrastructure registry
  await upsertInfrastructureRecord({
    tenantId,
    tenantSlug: cleanSlug,
    provider: "cloudinary",
    resourceId: parsed.cloudName,
    resourceType: "media_storage",
    ownershipStatus: "customer_owned",
    provisioningStatus: "active",
    verificationStatus: "verified",
    claimStatus: "connected",
    customerEmail,
    decryptedCredential: cloudinaryUrl.trim(),
    lastConnectionTestAt: new Date().toISOString(),
    lastConnectionTestStatus: "HEALTHY",
    metadata: {
      is_existing_account: true,
      cloudName: parsed.cloudName,
    },
  });

  // Update platform_tenants
  if (MASTER_CONNECTION_STRING) {
    const sql = neon(MASTER_CONNECTION_STRING);
    await sql`
      UPDATE platform_tenants
      SET cloudinary_url = ${cloudinaryUrl.trim()},
          cloudinary_cloud_name = ${parsed.cloudName},
          cloudinary_status = 'active',
          cloudinary_verified = true,
          is_custom_storage = true,
          updated_at = NOW()
      WHERE id = ${tenantId} OR LOWER(slug) = ${cleanSlug};
    `;
  }

  await logOnboardingAudit(
    tenantId,
    cleanSlug,
    "CLOUDINARY_EXISTING_CONNECTED",
    "SUCCESS",
    `Customer-owned Cloudinary account '${parsed.cloudName}' verified and connected.`
  );

  return {
    success: true,
    cloudName: parsed.cloudName,
    apiKey: parsed.apiKey,
    apiSecret: parsed.apiSecret,
    cloudinaryUrl: cloudinaryUrl.trim(),
    verificationPending: false,
  };
}

/**
 * Tests connectivity and verifies whether a Cloudinary configuration is active & verified
 */
export async function testCloudinaryConnectivity(cloudinaryUrl: string): Promise<CloudinaryVerificationResult> {
  const parsed = parseCloudinaryConnectionString(cloudinaryUrl);
  if (!parsed) {
    return { success: false, error: "Invalid Cloudinary connection format" };
  }

  try {
    const authHeader = Buffer.from(`${parsed.apiKey}:${parsed.apiSecret}`).toString("base64");
    const pingRes = await axios.get(
      `https://api.cloudinary.com/v1_1/${parsed.cloudName}/ping`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
        timeout: 10000,
      }
    );

    if (pingRes.data && pingRes.data.status === "ok") {
      // Try fetching usage details
      try {
        const usageRes = await axios.get(
          `https://api.cloudinary.com/v1_1/${parsed.cloudName}/usage`,
          {
            headers: {
              Authorization: `Basic ${authHeader}`,
            },
            timeout: 10000,
          }
        );
        return {
          success: true,
          cloudName: parsed.cloudName,
          plan: usageRes.data?.plan || "Free",
          creditsUsed: usageRes.data?.credits?.usage || 0,
          creditsLimit: usageRes.data?.credits?.credits || 25,
        };
      } catch {
        return {
          success: true,
          cloudName: parsed.cloudName,
        };
      }
    }

    return {
      success: false,
      error: "Cloudinary responded with non-ok status: " + JSON.stringify(pingRes.data),
    };
  } catch (err: any) {
    return {
      success: false,
      error:
        err.response?.data?.error?.message ||
        err.response?.statusText ||
        err.message ||
        "Could not reach Cloudinary API",
    };
  }
}
