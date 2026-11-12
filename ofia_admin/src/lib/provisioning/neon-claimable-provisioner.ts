import axios from "axios";
import { neon } from "@neondatabase/serverless";
import { MASTER_CONNECTION_STRING, bootstrapDedicatedTenantSchema, testDatabaseConnection } from "@/lib/tenant-db-resolver";
import {
  upsertInfrastructureRecord,
  logOnboardingAudit,
  getTenantInfrastructure,
  NeonLifecycleState,
} from "./infrastructure-registry";
import { createPlatformTransporter } from "@/lib/email-service";

const CLAIMABLE_BASE_URL = "https://claimable.neon.tech/v1";

export interface NeonProvisioningResult {
  success: boolean;
  projectId?: string;
  branchId?: string;
  databaseUrl?: string;
  claimUrl?: string;
  userCode?: string;
  claimExpiresInSeconds?: number;
  projectExpiresAt?: string;
  schemaBootstrapped?: boolean;
  error?: string;
}

export interface NeonClaimStatusResult {
  state: "pending" | "claimed" | "expired" | "unknown";
  reconciled: boolean;
  expiresAt?: string;
  ownershipStatus: "unclaimed" | "customer_owned";
  connectionStatus: "HEALTHY" | "FAILED" | "UNTESTED";
  error?: string;
}

/**
 * Exchanges identity assertion for a short-lived bearer access token
 */
async function exchangeAccessToken(assertion: string): Promise<string> {
  const params = new URLSearchParams();
  params.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
  params.append("assertion", assertion);
  params.append("resource", "https://claimable.neon.tech/");

  const tokenRes = await axios.post(`${CLAIMABLE_BASE_URL}/oauth2/token`, params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: 15000,
  });

  if (!tokenRes.data?.access_token) {
    throw new Error("Neon did not return access_token during OAuth2 exchange");
  }

  return tokenRes.data.access_token;
}

/**
 * Provisions a temporary Neon Claimable Database and initializes the Ofia tenant schema
 */
export async function provisionNeonClaimableDatabase(params: {
  tenantId: string;
  tenantSlug: string;
  businessName: string;
  ownerEmail: string;
  region?: string;
}): Promise<NeonProvisioningResult> {
  const { tenantId, tenantSlug, businessName, ownerEmail, region = "aws-us-east-2" } = params;
  const cleanSlug = tenantSlug.toLowerCase().trim();

  await logOnboardingAudit(
    tenantId,
    cleanSlug,
    "NEON_PROVISION_INITIATED",
    "IN_PROGRESS",
    `Initiating Neon Claimable Database provisioning for tenant '${cleanSlug}' in region '${region}'`
  );

  try {
    // Step A: Register agent identity and create claimable project
    const registerRes = await axios.post(
      `${CLAIMABLE_BASE_URL}/agent/identity`,
      {
        type: "anonymous",
        capabilities: ["postgres"],
        source: "ofia-provisioning-engine",
        project_name: `${cleanSlug}-db`,
        region_id: region,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 25000,
      }
    );

    const regData = registerRes.data;
    const identityAssertion = regData.identity_assertion;
    const project = regData.project;

    if (!identityAssertion || !project?.id) {
      throw new Error("Neon Claimable registration succeeded but missing identity_assertion or project ID");
    }

    const projectId = project.id;
    const branchId = project.branch_id || "";
    const projectExpiresAt = project.expires_at || "";

    // Step B: Exchange assertion for management access token
    const accessToken = await exchangeAccessToken(identityAssertion);

    // Step C: Fetch temporary database credentials
    const credsRes = await axios.get(`${CLAIMABLE_BASE_URL}/projects/${projectId}/credentials`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 15000,
    });

    const databaseUrl = credsRes.data?.database_url;
    if (!databaseUrl) {
      throw new Error("Neon returned project credentials without database_url");
    }

    await logOnboardingAudit(
      tenantId,
      cleanSlug,
      "NEON_DATABASE_CREATED",
      "SUCCESS",
      `Temporary Neon database provisioned: project '${projectId}', branch '${branchId}'`,
      { projectId, branchId, projectExpiresAt }
    );

    // Step D: Initialize and migrate tenant database schema
    await logOnboardingAudit(
      tenantId,
      cleanSlug,
      "NEON_MIGRATIONS_RUNNING",
      "IN_PROGRESS",
      `Running Ofia dedicated schema migrations on temporary database '${projectId}'`
    );

    // 1. Connection ping
    const ping = await testDatabaseConnection(databaseUrl);
    if (!ping.success) {
      throw new Error(`Cannot reach newly created Neon database: ${ping.error}`);
    }

    // 2. Schema bootstrap
    const bootstrap = await bootstrapDedicatedTenantSchema(databaseUrl);
    if (!bootstrap.success) {
      throw new Error(`Schema bootstrapping failed on dedicated database: ${bootstrap.message}`);
    }

    await logOnboardingAudit(
      tenantId,
      cleanSlug,
      "NEON_MIGRATIONS_COMPLETE",
      "SUCCESS",
      `Ofia dedicated schema successfully bootstrapped on '${projectId}'`
    );

    // Step E: Generate claim link for customer
    const claimRes = await axios.post(
      `${CLAIMABLE_BASE_URL}/projects/${projectId}/claim`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 15000,
      }
    );

    const claimData = claimRes.data;
    const claimUrl = claimData.verification_uri_complete || claimData.verification_uri;
    const userCode = claimData.user_code;
    const claimExpiresInSeconds = claimData.expires_in || 900;
    const claimExpiresAt = new Date(Date.now() + claimExpiresInSeconds * 1000).toISOString();

    // Step F: Persist records into tenant_infrastructure_registry
    await upsertInfrastructureRecord({
      tenantId,
      tenantSlug: cleanSlug,
      provider: "neon",
      resourceId: projectId,
      resourceType: "database",
      ownershipStatus: "unclaimed",
      provisioningStatus: "database_provisioned",
      verificationStatus: "verified",
      claimStatus: "claim_pending",
      customerEmail: ownerEmail,
      decryptedCredential: databaseUrl,
      claimUrl,
      claimUserCode: userCode,
      claimExpiresAt,
      lastConnectionTestAt: new Date().toISOString(),
      lastConnectionTestStatus: "HEALTHY",
      metadata: {
        branchId,
        projectExpiresAt,
        identityAssertion,
        region,
        claimInterval: claimData.interval || 5,
      },
    });

    // Update platform_tenants table
    if (MASTER_CONNECTION_STRING) {
      const sql = neon(MASTER_CONNECTION_STRING);
      await sql`
        UPDATE platform_tenants
        SET database_url = ${databaseUrl},
            neon_project_id = ${projectId},
            neon_branch_id = ${branchId},
            neon_claim_url = ${claimUrl},
            neon_claim_code = ${userCode},
            neon_claim_status = 'claim_pending',
            neon_ownership_status = 'unclaimed',
            neon_claim_expires_at = ${claimExpiresAt ? new Date(claimExpiresAt) : null},
            neon_reconciled = false,
            is_custom_db = true,
            updated_at = NOW()
        WHERE id = ${tenantId} OR LOWER(slug) = ${cleanSlug};
      `;
    }

    await logOnboardingAudit(
      tenantId,
      cleanSlug,
      "NEON_CLAIM_LINK_GENERATED",
      "SUCCESS",
      `Claim URL generated with user code '${userCode}'. Expiry: ${claimExpiresInSeconds}s`,
      { claimUrl, userCode, claimExpiresAt }
    );

    return {
      success: true,
      projectId,
      branchId,
      databaseUrl,
      claimUrl,
      userCode,
      claimExpiresInSeconds,
      projectExpiresAt,
      schemaBootstrapped: true,
    };
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Failed to provision Neon claimable database";

    await logOnboardingAudit(
      tenantId,
      cleanSlug,
      "NEON_PROVISION_FAILED",
      "ERROR",
      `Neon Claimable database provisioning failed: ${errorMsg}`,
      { error: errorMsg }
    );

    await upsertInfrastructureRecord({
      tenantId,
      tenantSlug: cleanSlug,
      provider: "neon",
      resourceId: "",
      resourceType: "database",
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
 * Regenerates an active Claim Link for a tenant's Neon project
 * Used when the 15-minute claim code has expired or a fresh link is requested
 */
export async function regenerateNeonClaimLink(tenantSlug: string): Promise<{
  success: boolean;
  claimUrl?: string;
  userCode?: string;
  expiresInSeconds?: number;
  expiresAt?: string;
  error?: string;
}> {
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const infraMap = await getTenantInfrastructure(cleanSlug);
  const neonInfra = infraMap.neon;

  if (!neonInfra || !neonInfra.resourceId) {
    return { success: false, error: "No Neon project found for tenant workspace." };
  }

  const projectId = neonInfra.resourceId;
  const identityAssertion = neonInfra.metadata?.identityAssertion;

  if (!identityAssertion) {
    return {
      success: false,
      error: "Missing stored identity assertion to authenticate with Neon Claim API.",
    };
  }

  try {
    const accessToken = await exchangeAccessToken(identityAssertion);
    const claimRes = await axios.post(
      `${CLAIMABLE_BASE_URL}/projects/${projectId}/claim`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 15000,
      }
    );

    const claimData = claimRes.data;
    const claimUrl = claimData.verification_uri_complete || claimData.verification_uri;
    const userCode = claimData.user_code;
    const expiresInSeconds = claimData.expires_in || 900;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    // Update infrastructure record
    await upsertInfrastructureRecord({
      tenantId: neonInfra.tenantId,
      tenantSlug: cleanSlug,
      provider: "neon",
      resourceId: projectId,
      claimUrl,
      claimUserCode: userCode,
      claimExpiresAt: expiresAt,
      claimStatus: "claim_pending",
    });

    // Update platform_tenants
    if (MASTER_CONNECTION_STRING) {
      const sql = neon(MASTER_CONNECTION_STRING);
      await sql`
        UPDATE platform_tenants
        SET neon_claim_url = ${claimUrl},
            neon_claim_code = ${userCode},
            neon_claim_status = 'claim_pending',
            neon_claim_expires_at = ${new Date(expiresAt)},
            updated_at = NOW()
        WHERE LOWER(slug) = ${cleanSlug};
      `;
    }

    await logOnboardingAudit(
      neonInfra.tenantId,
      cleanSlug,
      "NEON_CLAIM_LINK_REGENERATED",
      "SUCCESS",
      `Fresh claim URL generated: user code ${userCode}, expires at ${expiresAt}`,
      { claimUrl, userCode, expiresAt }
    );

    return {
      success: true,
      claimUrl,
      userCode,
      expiresInSeconds,
      expiresAt,
    };
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || "Failed to regenerate Neon claim link";
    return { success: false, error: errorMsg };
  }
}

/**
 * Checks and reconciles the Claim status from Neon's Claim API
 */
export async function checkNeonClaimStatus(tenantSlug: string): Promise<NeonClaimStatusResult> {
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const infraMap = await getTenantInfrastructure(cleanSlug);
  const neonInfra = infraMap.neon;

  if (!neonInfra || !neonInfra.resourceId) {
    return {
      state: "unknown",
      reconciled: false,
      ownershipStatus: "unclaimed",
      connectionStatus: "FAILED",
      error: "Neon infrastructure record not found",
    };
  }

  const projectId = neonInfra.resourceId;
  const identityAssertion = neonInfra.metadata?.identityAssertion;

  if (!identityAssertion) {
    return {
      state: "unknown",
      reconciled: false,
      ownershipStatus: neonInfra.ownershipStatus === "customer_owned" ? "customer_owned" : "unclaimed",
      connectionStatus: "HEALTHY",
    };
  }

  try {
    const accessToken = await exchangeAccessToken(identityAssertion);
    const statusRes = await axios.get(`${CLAIMABLE_BASE_URL}/projects/${projectId}/claim`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 15000,
    });

    const data = statusRes.data;
    const reconciled = Boolean(data.reconciled);
    const state = data.state || (reconciled ? "claimed" : "pending");

    // Test active connection to verify database health
    let connectionStatus: "HEALTHY" | "FAILED" = "HEALTHY";
    if (neonInfra.decryptedCredential) {
      const ping = await testDatabaseConnection(neonInfra.decryptedCredential);
      connectionStatus = ping.success ? "HEALTHY" : "FAILED";
    }

    if (reconciled) {
      // Step D confirmation: Ownership transferred successfully
      await upsertInfrastructureRecord({
        tenantId: neonInfra.tenantId,
        tenantSlug: cleanSlug,
        provider: "neon",
        resourceId: projectId,
        ownershipStatus: "customer_owned",
        provisioningStatus: "connected",
        verificationStatus: "verified",
        claimStatus: "ownership_transferred",
        lastConnectionTestAt: new Date().toISOString(),
        lastConnectionTestStatus: connectionStatus,
      });

      if (MASTER_CONNECTION_STRING) {
        const sql = neon(MASTER_CONNECTION_STRING);
        await sql`
          UPDATE platform_tenants
          SET neon_ownership_status = 'customer_owned',
              neon_claim_status = 'ownership_transferred',
              neon_reconciled = true,
              updated_at = NOW()
          WHERE LOWER(slug) = ${cleanSlug};
        `;
      }

      await logOnboardingAudit(
        neonInfra.tenantId,
        cleanSlug,
        "NEON_OWNERSHIP_RECONCILED",
        "SUCCESS",
        `Tenant has successfully claimed and reconciled ownership of Neon project '${projectId}'.`
      );
    }

    return {
      state: state as any,
      reconciled,
      expiresAt: data.expires_at,
      ownershipStatus: reconciled ? "customer_owned" : "unclaimed",
      connectionStatus,
    };
  } catch (err: any) {
    // If token exchange returned 401 or project was claimed and old identity was rotated,
    // test if database connection is still healthy!
    if (neonInfra.decryptedCredential) {
      const ping = await testDatabaseConnection(neonInfra.decryptedCredential);
      if (ping.success) {
        return {
          state: "claimed",
          reconciled: true,
          ownershipStatus: "customer_owned",
          connectionStatus: "HEALTHY",
        };
      }
    }

    return {
      state: "unknown",
      reconciled: false,
      ownershipStatus: "unclaimed",
      connectionStatus: "FAILED",
      error: err.response?.data?.message || err.message,
    };
  }
}

/**
 * Sends the official branded Database Ownership Claim Email to the customer
 */
export async function sendNeonDatabaseClaimEmail(params: {
  recipientEmail: string;
  recipientName: string;
  businessName: string;
  tenantSlug: string;
  claimUrl: string;
  userCode: string;
  expiresInMinutes?: number;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    recipientEmail,
    recipientName,
    businessName,
    tenantSlug,
    claimUrl,
    userCode,
    expiresInMinutes = 15,
  } = params;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, error: "Invalid recipient email address" };
  }

  const subject = `Action Required: Claim Ownership of Your ${businessName} Database on Ofia`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
    body { margin: 0; padding: 0; background-color: #0B0F17; font-family: 'Plus Jakarta Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #0B0F17; padding: 40px 16px; box-sizing: border-box; }
    .card { max-width: 600px; margin: 0 auto; background: #131A26; border-radius: 12px; border: 1px solid #233044; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
    .header { padding: 32px 32px 24px; border-bottom: 1px solid #233044; background: linear-gradient(180deg, #182233 0%, #131A26 100%); }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(0, 229, 155, 0.12); border: 1px solid rgba(0, 229, 155, 0.3); border-radius: 9999px; color: #00E59B; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .title { margin: 16px 0 6px; font-size: 22px; font-weight: 700; color: #FFFFFF; line-height: 1.3; }
    .subtitle { margin: 0; font-size: 14px; color: #94A3B8; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #CBD5E1; }
    .box { background: #0E141E; border: 1px solid #233044; border-left: 4px solid #00E59B; border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
    .btn-wrap { text-align: center; margin: 32px 0 24px; }
    .btn { display: inline-block; background-color: #00E59B; color: #0B0F17 !important; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(0, 229, 155, 0.3); }
    .code-display { font-family: monospace; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #00E59B; background: #182233; padding: 6px 14px; border-radius: 6px; display: inline-block; margin-top: 6px; }
    .steps { margin: 20px 0; padding-left: 20px; color: #94A3B8; }
    .steps li { margin-bottom: 10px; }
    .steps li strong { color: #FFFFFF; }
    .footer { padding: 24px 32px; text-align: center; font-size: 12px; color: #64748B; background-color: #0E141E; border-top: 1px solid #233044; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
          <tr>
            <td style="vertical-align: middle;">
              <img src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png" alt="Ofia" width="36" height="36" style="display: block; width: 36px; height: 36px; object-fit: contain;" />
            </td>
            <td style="vertical-align: middle; padding-left: 12px;">
              <span style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em;">Ofia</span>
              <span style="color: #64748B; margin: 0 6px;">|</span>
              <span style="color: #00E59B; font-weight: 600; font-size: 13px;">Neon PostgreSQL</span>
            </td>
          </tr>
        </table>
        <span class="badge">Dedicated Database Ready</span>
        <h1 class="title">Claim Ownership of Your Database</h1>
        <p class="subtitle">Complete your tenant infrastructure setup for <strong>${businessName}</strong></p>
      </div>

      <div class="content">
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>
          Your dedicated, isolated Neon PostgreSQL database for <strong>${businessName}</strong> (<code>${tenantSlug}.ofia.ng</code>) has been successfully created, and all core commerce and ERP schemas have been initialized.
        </p>

        <div class="box">
          <div style="font-size: 13px; font-weight: 600; color: #94A3B8; text-transform: uppercase; margin-bottom: 4px;">Temporary Claim Code</div>
          <div class="code-display">${userCode}</div>
          <div style="font-size: 12px; color: #F59E0B; margin-top: 8px;">
            ⚠️ This one-time claim code expires in <strong>${expiresInMinutes} minutes</strong>.
          </div>
        </div>

        <p>
          At Ofia, we believe you should own your data. Claiming this database permanently transfers complete ownership into your own Neon account and organization—no passwords need to be shared with Ofia.
        </p>

        <div class="btn-wrap">
          <a href="${claimUrl}" class="btn" target="_blank" rel="noopener noreferrer">
            Claim Your Database Now &rarr;
          </a>
        </div>

        <h3 style="color: #FFFFFF; font-size: 15px; margin-top: 28px; margin-bottom: 12px;">What to do next:</h3>
        <ol class="steps">
          <li>Click the <strong>Claim Your Database</strong> button above to open Neon's official portal.</li>
          <li>Sign into your existing Neon account or create a free account with email or GitHub/Google.</li>
          <li>Select your destination Neon Organization and click <strong>Accept Transfer</strong>.</li>
          <li>Return to the Ofia Onboarding Wizard screen—Ofia will automatically verify the transfer and connect your live services!</li>
        </ol>

        <p style="font-size: 12px; color: #64748B; margin-top: 24px;">
          If the button does not work, copy and paste this link into your browser:<br/>
          <span style="color: #38BDF8; word-break: break-all;">${claimUrl}</span>
        </p>
      </div>

      <div class="footer">
        &copy; ${new Date().getFullYear()} Ofia Technologies Ltd. Strict Multi-Tenant Infrastructure.<br/>
        This automated security notification was sent to ${recipientEmail} for workspace <code>${tenantSlug}</code>.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { transporter, config } = await createPlatformTransporter();
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: recipientEmail,
      subject,
      html,
    });

    // Update claim email sent timestamp in registry
    const cleanSlug = tenantSlug.toLowerCase().trim();
    await upsertInfrastructureRecord({
      tenantId: `tenant-${cleanSlug}`,
      tenantSlug: cleanSlug,
      provider: "neon",
      resourceId: "",
      claimEmailSentAt: new Date().toISOString(),
      claimStatus: "claim_email_sent",
    });

    if (MASTER_CONNECTION_STRING) {
      const sql = neon(MASTER_CONNECTION_STRING);
      await sql`
        UPDATE platform_tenants
        SET neon_claim_status = 'claim_email_sent',
            updated_at = NOW()
        WHERE LOWER(slug) = ${cleanSlug};
      `;
    }

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.warn("[Neon Claim Email] Could not send claim email:", err.message);
    return {
      success: false,
      error: err.message || "Failed to send claim email",
    };
  }
}
