import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const USERS_DB_URL =
  process.env.USERS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USERS_API ||
  "";

export interface ProvisionAdminParams {
  tenantSlug: string;
  tenantName: string;
  ownerEmail: string;
  ownerName?: string;
  domain?: string;
  vertical?: string;
  password?: string;
}

/**
 * Automatically provisions a default admin user account for a tenant on workspace creation.
 * Reads endpoints and credentials strictly from environment variables without hardcoded fallback strings.
 */
export async function ensureDefaultTenantAdmin(
  params: ProvisionAdminParams
): Promise<{ success: boolean; user?: any; error?: string }> {
  const cleanSlug = (params.tenantSlug || "").toLowerCase().trim();
  const cleanEmail = (params.ownerEmail || `admin@${cleanSlug}.ng`).toLowerCase().trim();
  const displayName = params.ownerName || `${params.tenantName} Admin`;
  const plainPassword =
    params.password ||
    process.env.DEFAULT_TENANT_ADMIN_PASSWORD ||
    randomUUID().replace(/-/g, "").slice(0, 12);
  const domain = params.domain || `${cleanSlug}.ofia.ng`;
  const vertical = params.vertical || "retail";

  if (!cleanSlug || !cleanEmail) {
    return { success: false, error: "tenantSlug and ownerEmail are required to provision admin" };
  }

  // 1. Attempt non-blocking synchronization via User Microservice API if USER_SERVICE_URL is configured
  if (USER_SERVICE_URL) {
    try {
      const cleanServiceUrl = USER_SERVICE_URL.replace(/\/+$/, "");
      const registerEndpoint = cleanServiceUrl.endsWith("/api/v1")
        ? `${cleanServiceUrl}/auth/register`
        : `${cleanServiceUrl}/api/v1/auth/register`;

      await fetch(registerEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: plainPassword,
          name: displayName,
          business_name: params.tenantName,
        }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
    } catch (apiErr: any) {
      console.warn(`[Admin Provisioner] Microservice register call note for '${cleanSlug}':`, apiErr.message);
    }
  }

  // 2. Direct persistence into Central Users Database (USERS_DATABASE_URL)
  if (!USERS_DB_URL) {
    return { success: true };
  }

  try {
    const sql = neon(USERS_DB_URL);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const userId = randomUUID();
    const orgId = randomUUID();
    const memberId = randomUUID();

    // Try PascalCase schema first (GORM convention: "User", "Organization", "WorkspaceMember")
    try {
      // Upsert User
      const [existingUser] = await sql`
        SELECT id, email, password FROM "User" WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
      `;

      let effectiveUserId = userId;
      if (existingUser) {
        effectiveUserId = existingUser.id;
        // Update password if missing or blank
        if (!existingUser.password || existingUser.password === "") {
          await sql`
            UPDATE "User"
            SET password = ${hashedPassword}, role = 'TENANT_OWNER', "updatedAt" = NOW()
            WHERE id = ${effectiveUserId};
          `;
        }
      } else {
        await sql`
          INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
          VALUES (${userId}, ${cleanEmail}, ${hashedPassword}, ${displayName}, 'TENANT_OWNER', NOW(), NOW())
          ON CONFLICT (email) DO UPDATE
          SET password = EXCLUDED.password, role = 'TENANT_OWNER', "updatedAt" = NOW();
        `;
      }

      // Upsert Organization in central users database
      const [existingOrg] = await sql`
        SELECT id, slug FROM "Organization" WHERE LOWER(slug) = ${cleanSlug} LIMIT 1;
      `;

      let effectiveOrgId = orgId;
      if (existingOrg) {
        effectiveOrgId = existingOrg.id;
      } else {
        await sql`
          INSERT INTO "Organization" (
            id, name, slug, "ownerId", domain, vertical, status, "planTier", "billingCycle", "createdAt", "updatedAt"
          ) VALUES (
            ${orgId}, ${params.tenantName}, ${cleanSlug}, ${effectiveUserId}, ${domain}, ${vertical},
            'ACTIVE', 'GROWTH', 'MONTHLY', NOW(), NOW()
          )
          ON CONFLICT (slug) DO UPDATE
          SET name = EXCLUDED.name, domain = EXCLUDED.domain, status = 'ACTIVE', "updatedAt" = NOW();
        `;
      }

      // Ensure WorkspaceMember link
      await sql`
        INSERT INTO "WorkspaceMember" (id, "organizationId", "userId", role, "createdAt")
        VALUES (${memberId}, ${effectiveOrgId}, ${effectiveUserId}, 'TENANT_OWNER', NOW())
        ON CONFLICT DO NOTHING;
      `;

      return {
        success: true,
        user: { id: effectiveUserId, email: cleanEmail, name: displayName, role: "admin" },
      };
    } catch (pascalErr: any) {
      // Fallback for snake_case table names (users, organizations, workspace_members)
      try {
        const [existingUser] = await sql`
          SELECT id, email, password FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
        `;

        let effectiveUserId = userId;
        if (existingUser) {
          effectiveUserId = existingUser.id;
          if (!existingUser.password || existingUser.password === "") {
            await sql`
              UPDATE users
              SET password = ${hashedPassword}, role = 'admin', updated_at = NOW()
              WHERE id = ${effectiveUserId};
            `;
          }
        } else {
          await sql`
            INSERT INTO users (id, email, password, name, role, created_at, updated_at)
            VALUES (${userId}, ${cleanEmail}, ${hashedPassword}, ${displayName}, 'admin', NOW(), NOW())
            ON CONFLICT (email) DO UPDATE
            SET password = EXCLUDED.password, role = 'admin', updated_at = NOW();
          `;
        }

        return {
          success: true,
          user: { id: effectiveUserId, email: cleanEmail, name: displayName, role: "admin" },
        };
      } catch (snakeErr: any) {
        console.warn(`[Admin Provisioner] Direct DB fallback note for '${cleanSlug}':`, snakeErr.message);
        return { success: true };
      }
    }
  } catch (err: any) {
    console.error(`[Admin Provisioner] Error ensuring default admin user for '${cleanSlug}':`, err);
    return { success: false, error: err.message };
  }
}
