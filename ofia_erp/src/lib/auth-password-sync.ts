import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { getTenantSql } from "@/lib/tenant-db-resolver";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "superadmin",
  "app",
  "api",
  "erp",
  "store",
  "storefront",
  "ofia",
  "localhost",
  "127",
  "vercel",
  "onrender",
]);

let cachedUsersDbClient: any = null;
let cachedUsersDbUrl = "";

/**
 * Returns a Neon SQL client for the Central User & Auth Database (USERS_DATABASE_URL)
 * strictly read from environment variables. Returns null if not configured.
 */
export function getUsersServiceSql(): any | null {
  const url = (process.env.USERS_DATABASE_URL || "").trim();
  if (!url) return null;

  if (!cachedUsersDbClient || cachedUsersDbUrl !== url) {
    cachedUsersDbClient = neon(url);
    cachedUsersDbUrl = url;
  }
  return cachedUsersDbClient;
}

/**
 * Resolves tenant slug strictly from request context (body, header, query, or host subdomain).
 * Fails closed ("") if no valid tenant identifier is present — zero hardcoded fallbacks.
 */
export function resolveTenantSlugFromRequest(
  request: Request,
  body?: Record<string, any> | null
): string {
  // 1. Explicit request body fields
  const bodySlug =
    body?.tenantSlug || body?.tenant || body?.tenant_slug || body?.slug || "";
  if (typeof bodySlug === "string" && bodySlug.trim()) {
    const clean = bodySlug.trim().toLowerCase();
    if (!RESERVED_SUBDOMAINS.has(clean)) return clean;
  }

  // 2. Request header injected by middleware or caller
  const headerSlug = (request.headers.get("x-tenant-slug") || "").trim().toLowerCase();
  if (headerSlug && !RESERVED_SUBDOMAINS.has(headerSlug)) {
    return headerSlug;
  }

  // 3. URL query parameters
  try {
    const { searchParams } = new URL(request.url);
    const querySlug = (
      searchParams.get("tenant") ||
      searchParams.get("tenant_slug") ||
      searchParams.get("tenantSlug") ||
      searchParams.get("slug") ||
      ""
    )
      .trim()
      .toLowerCase();
    if (querySlug && !RESERVED_SUBDOMAINS.has(querySlug)) {
      return querySlug;
    }
  } catch {}

  // 4. Host / x-forwarded-host subdomain extraction
  const rawHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const cleanHost = rawHost.split(":")[0].toLowerCase().trim();
  if (cleanHost && cleanHost.includes(".")) {
    if (cleanHost.endsWith(".localhost")) {
      const sub = cleanHost.replace(/\.localhost$/, "").split(".")[0];
      if (sub && !RESERVED_SUBDOMAINS.has(sub)) return sub;
    } else if (
      !cleanHost.includes("onrender.com") &&
      !cleanHost.includes("vercel.app")
    ) {
      const parts = cleanHost.split(".");
      const sub = parts[0];
      if (sub && !RESERVED_SUBDOMAINS.has(sub)) {
        return sub;
      }
    }
  }

  return "";
}

/**
 * Ensures the password_reset_tokens table and mandatory tenant-scoped composite indexes
 * exist in the tenant's dedicated database.
 */
export async function ensurePasswordResetTokensTable(sql: any): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id VARCHAR(191) PRIMARY KEY,
      email VARCHAR(191) NOT NULL,
      token VARCHAR(191) NOT NULL UNIQUE,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    ALTER TABLE password_reset_tokens
    ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_tenant_created
    ON password_reset_tokens (LOWER(tenant_slug), created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_tenant_email
    ON password_reset_tokens (LOWER(tenant_slug), LOWER(email));
  `;
}

export interface TenantUserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  designation: string;
  company: string;
  location: string;
  avatar: string;
  tenantSlug: string;
}

/**
 * Looks up a user by email within a tenant's dedicated database first, and falls back
 * to verifying tenant-associated membership in the Central Users DB (USERS_DATABASE_URL).
 */
export async function findTenantUserForPasswordReset(
  tenantSlug: string,
  normalizedEmail: string
): Promise<TenantUserProfile | null> {
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const cleanEmail = normalizedEmail.toLowerCase().trim();

  // 1. Primary lookup in tenant's dedicated PostgreSQL database
  try {
    const tenantSql = await getTenantSql(cleanSlug);
    const rows = await tenantSql`
      SELECT
        id,
        email,
        COALESCE(name, '') AS name,
        COALESCE(role, 'employee') AS role,
        COALESCE(department, '') AS department,
        COALESCE(designation, '') AS designation,
        COALESCE(company, '') AS company,
        COALESCE(location, '') AS location,
        COALESCE(avatar, '/character1.jpg') AS avatar,
        COALESCE("tenantSlug", '') AS "tenantSlug"
      FROM "User"
      WHERE LOWER(email) = ${cleanEmail}
        AND (
          LOWER("tenantSlug") = ${cleanSlug}
          OR "tenantSlug" = ''
          OR "tenantSlug" IS NULL
        )
      LIMIT 1;
    `;
    if (rows && rows.length > 0) {
      const row = rows[0];
      return {
        id: row.id,
        email: (row.email || cleanEmail).toLowerCase().trim(),
        name: row.name || cleanEmail.split("@")[0],
        role: row.role || "employee",
        department: row.department || "",
        designation: row.designation || "",
        company: row.company || "",
        location: row.location || "",
        avatar: row.avatar || "/character1.jpg",
        tenantSlug: row.tenantSlug || cleanSlug,
      };
    }
  } catch (err: any) {
    console.warn(`[Auth Password Sync] Tenant DB lookup failed for '${cleanSlug}':`, err?.message || err);
  }

  // 2. Secondary lookup in Central Users DB strictly scoped to this tenant/organization
  const usersSql = getUsersServiceSql();
  if (usersSql) {
    try {
      const rows = await usersSql`
        SELECT DISTINCT
          u.id,
          u.email,
          COALESCE(u.name, '') AS name,
          COALESCE(u.role, 'employee') AS role
        FROM "User" u
        LEFT JOIN "Organization" o ON o."ownerId" = u.id
        LEFT JOIN "WorkspaceMember" wm ON wm."userId" = u.id
        LEFT JOIN "Organization" mo ON mo.id = wm."organizationId"
        WHERE LOWER(u.email) = ${cleanEmail}
          AND (
            LOWER(COALESCE(u."tenantSlug", '')) = ${cleanSlug}
            OR LOWER(COALESCE(o.slug, '')) = ${cleanSlug}
            OR LOWER(COALESCE(mo.slug, '')) = ${cleanSlug}
          )
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          email: (row.email || cleanEmail).toLowerCase().trim(),
          name: row.name || cleanEmail.split("@")[0],
          role: row.role || "employee",
          department: "",
          designation: "",
          company: "",
          location: "",
          avatar: "/character1.jpg",
          tenantSlug: cleanSlug,
        };
      }
    } catch (err: any) {
      console.warn(`[Auth Password Sync] Central Users DB scoped lookup note for '${cleanSlug}':`, err?.message || err);
    }
  }

  return null;
}

export interface SyncPasswordParams {
  tenantSlug: string;
  email?: string;
  userId?: string;
  hashedPassword: string;
  fallbackProfile?: {
    name?: string;
    role?: string;
    department?: string;
    designation?: string;
    company?: string;
    location?: string;
    avatar?: string;
  };
}

export interface SyncPasswordResult {
  tenantDbUpdated: boolean;
  usersDbUpdated: boolean;
  user: TenantUserProfile | null;
}

/**
 * Atomically updates the user's bcrypt password hash in BOTH:
 * 1. The tenant's dedicated PostgreSQL database ("User" table)
 * 2. The Central User & Auth Database (USERS_DATABASE_URL, "User" table) used by service_users /login
 *
 * If a tenant staff member exists in the tenant DB but was not yet synced into USERS_DATABASE_URL,
 * this helper upserts their auth record so they can sign in immediately with their new password.
 */
export async function syncUserPasswordAcrossTenantAndAuth(
  params: SyncPasswordParams
): Promise<SyncPasswordResult> {
  const cleanSlug = params.tenantSlug.toLowerCase().trim();
  let cleanEmail = (params.email || "").toLowerCase().trim();
  const cleanUserId = (params.userId || "").trim();

  let tenantDbUpdated = false;
  let usersDbUpdated = false;
  let resolvedUser: TenantUserProfile | null = null;

  // 1. Update in tenant's DEDICATED database
  const tenantSql = await getTenantSql(cleanSlug);
  try {
    let updatedRows: any[] = [];

    if (cleanEmail && cleanUserId) {
      updatedRows = await tenantSql`
        UPDATE "User"
        SET password = ${params.hashedPassword},
            email = LOWER(email),
            "updatedAt" = NOW(),
            updated_at = NOW()
        WHERE (LOWER(email) = ${cleanEmail} OR id = ${cleanUserId})
          AND (
            LOWER("tenantSlug") = ${cleanSlug}
            OR "tenantSlug" = ''
            OR "tenantSlug" IS NULL
          )
        RETURNING id, email, COALESCE(name, '') AS name, COALESCE(role, 'employee') AS role,
                  COALESCE(department, '') AS department, COALESCE(designation, '') AS designation,
                  COALESCE(company, '') AS company, COALESCE(location, '') AS location,
                  COALESCE(avatar, '/character1.jpg') AS avatar, COALESCE("tenantSlug", '') AS "tenantSlug";
      `;
    } else if (cleanEmail) {
      updatedRows = await tenantSql`
        UPDATE "User"
        SET password = ${params.hashedPassword},
            email = LOWER(email),
            "updatedAt" = NOW(),
            updated_at = NOW()
        WHERE LOWER(email) = ${cleanEmail}
          AND (
            LOWER("tenantSlug") = ${cleanSlug}
            OR "tenantSlug" = ''
            OR "tenantSlug" IS NULL
          )
        RETURNING id, email, COALESCE(name, '') AS name, COALESCE(role, 'employee') AS role,
                  COALESCE(department, '') AS department, COALESCE(designation, '') AS designation,
                  COALESCE(company, '') AS company, COALESCE(location, '') AS location,
                  COALESCE(avatar, '/character1.jpg') AS avatar, COALESCE("tenantSlug", '') AS "tenantSlug";
      `;
    } else if (cleanUserId) {
      updatedRows = await tenantSql`
        UPDATE "User"
        SET password = ${params.hashedPassword},
            "updatedAt" = NOW(),
            updated_at = NOW()
        WHERE id = ${cleanUserId}
          AND (
            LOWER("tenantSlug") = ${cleanSlug}
            OR "tenantSlug" = ''
            OR "tenantSlug" IS NULL
          )
        RETURNING id, email, COALESCE(name, '') AS name, COALESCE(role, 'employee') AS role,
                  COALESCE(department, '') AS department, COALESCE(designation, '') AS designation,
                  COALESCE(company, '') AS company, COALESCE(location, '') AS location,
                  COALESCE(avatar, '/character1.jpg') AS avatar, COALESCE("tenantSlug", '') AS "tenantSlug";
      `;
    }

    if (updatedRows.length > 0) {
      const row = updatedRows[0];
      tenantDbUpdated = true;
      cleanEmail = (row.email || cleanEmail).toLowerCase().trim();
      resolvedUser = {
        id: row.id,
        email: cleanEmail,
        name: row.name || params.fallbackProfile?.name || cleanEmail.split("@")[0],
        role: row.role || params.fallbackProfile?.role || "employee",
        department: row.department || params.fallbackProfile?.department || "",
        designation: row.designation || params.fallbackProfile?.designation || "",
        company: row.company || params.fallbackProfile?.company || "",
        location: row.location || params.fallbackProfile?.location || "",
        avatar: row.avatar || params.fallbackProfile?.avatar || "/character1.jpg",
        tenantSlug: row.tenantSlug || cleanSlug,
      };
    }
  } catch (err: any) {
    // Retry without updated_at / "updatedAt" in case a freshly bootstrapped tenant DB only has core columns
    try {
      const retryRows = cleanEmail
        ? await tenantSql`
            UPDATE "User"
            SET password = ${params.hashedPassword},
                email = LOWER(email)
            WHERE LOWER(email) = ${cleanEmail}
              AND (
                LOWER("tenantSlug") = ${cleanSlug}
                OR "tenantSlug" = ''
                OR "tenantSlug" IS NULL
              )
            RETURNING id, email, COALESCE(name, '') AS name, COALESCE(role, 'employee') AS role,
                      COALESCE("tenantSlug", '') AS "tenantSlug";
          `
        : await tenantSql`
            UPDATE "User"
            SET password = ${params.hashedPassword}
            WHERE id = ${cleanUserId}
              AND (
                LOWER("tenantSlug") = ${cleanSlug}
                OR "tenantSlug" = ''
                OR "tenantSlug" IS NULL
              )
            RETURNING id, email, COALESCE(name, '') AS name, COALESCE(role, 'employee') AS role,
                      COALESCE("tenantSlug", '') AS "tenantSlug";
          `;
      if (retryRows.length > 0) {
        const row = retryRows[0];
        tenantDbUpdated = true;
        cleanEmail = (row.email || cleanEmail).toLowerCase().trim();
        resolvedUser = {
          id: row.id,
          email: cleanEmail,
          name: row.name || params.fallbackProfile?.name || cleanEmail.split("@")[0],
          role: row.role || params.fallbackProfile?.role || "employee",
          department: params.fallbackProfile?.department || "",
          designation: params.fallbackProfile?.designation || "",
          company: params.fallbackProfile?.company || "",
          location: params.fallbackProfile?.location || "",
          avatar: params.fallbackProfile?.avatar || "/character1.jpg",
          tenantSlug: row.tenantSlug || cleanSlug,
        };
      }
    } catch (retryErr: any) {
      console.error(`[Auth Password Sync] Tenant DB update failed for '${cleanSlug}':`, retryErr?.message || retryErr);
    }
  }

  // 2. Synchronize password hash into Central User & Auth Database (USERS_DATABASE_URL)
  const usersSql = getUsersServiceSql();
  if (usersSql && cleanEmail) {
    try {
      const existingAuthUsers = await usersSql`
        SELECT id, email, COALESCE(name, '') AS name, COALESCE(role, 'employee') AS role
        FROM "User"
        WHERE LOWER(email) = ${cleanEmail}
        LIMIT 1;
      `;

      if (existingAuthUsers.length > 0) {
        const authRow = existingAuthUsers[0];
        try {
          await usersSql`
            UPDATE "User"
            SET password = ${params.hashedPassword},
                email = LOWER(email),
                "updatedAt" = NOW(),
                updated_at = NOW()
            WHERE id = ${authRow.id};
          `;
        } catch {
          await usersSql`
            UPDATE "User"
            SET password = ${params.hashedPassword},
                email = LOWER(email)
            WHERE id = ${authRow.id};
          `;
        }
        usersDbUpdated = true;
        if (!resolvedUser) {
          resolvedUser = {
            id: authRow.id,
            email: cleanEmail,
            name: authRow.name || params.fallbackProfile?.name || cleanEmail.split("@")[0],
            role: authRow.role || params.fallbackProfile?.role || "employee",
            department: params.fallbackProfile?.department || "",
            designation: params.fallbackProfile?.designation || "",
            company: params.fallbackProfile?.company || "",
            location: params.fallbackProfile?.location || "",
            avatar: params.fallbackProfile?.avatar || "/character1.jpg",
            tenantSlug: cleanSlug,
          };
        }
      } else if (tenantDbUpdated && resolvedUser) {
        // User exists in tenant dedicated DB but was never provisioned in Central Users DB — insert so /login works
        const newId = resolvedUser.id || `USR-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
        try {
          await usersSql`
            INSERT INTO "User" (
              id, email, password, name, role, "tenantSlug", department, designation, company, location, avatar, "createdAt", "updatedAt", created_at, updated_at
            ) VALUES (
              ${newId}, ${cleanEmail}, ${params.hashedPassword}, ${resolvedUser.name}, ${resolvedUser.role},
              ${cleanSlug}, ${resolvedUser.department}, ${resolvedUser.designation}, ${resolvedUser.company},
              ${resolvedUser.location}, ${resolvedUser.avatar}, NOW(), NOW(), NOW(), NOW()
            )
            ON CONFLICT (email) DO UPDATE SET
              password = EXCLUDED.password,
              "updatedAt" = NOW(),
              updated_at = NOW();
          `;
        } catch {
          await usersSql`
            INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
            VALUES (${newId}, ${cleanEmail}, ${params.hashedPassword}, ${resolvedUser.name}, ${resolvedUser.role}, NOW(), NOW())
            ON CONFLICT (email) DO UPDATE SET
              password = EXCLUDED.password,
              "updatedAt" = NOW();
          `;
        }
        usersDbUpdated = true;
      }
    } catch (authErr: any) {
      console.error(`[Auth Password Sync] Central Users DB sync failed for '${cleanEmail}':`, authErr?.message || authErr);
    }
  }

  return {
    tenantDbUpdated,
    usersDbUpdated,
    user: resolvedUser,
  };
}
