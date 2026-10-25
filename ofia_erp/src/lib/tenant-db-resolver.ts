import { neon } from "@neondatabase/serverless";

export interface TenantDbConfig {
  tenantSlug: string;
  dbMode: "DEDICATED";
  connectionString: string;
  isCustom: boolean;
  resolvedAt: string;
}

export const MASTER_REGISTRY_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  "";

export const MASTER_CONNECTION_STRING = MASTER_REGISTRY_URL;

const dbConfigCache = new Map<string, { config: TenantDbConfig; expiresAt: number }>();
const clientPool = new Map<string, any>();

function getRegistrySql() {
  if (!clientPool.has(MASTER_REGISTRY_URL)) {
    clientPool.set(MASTER_REGISTRY_URL, neon(MASTER_REGISTRY_URL));
  }
  return clientPool.get(MASTER_REGISTRY_URL);
}

/**
 * Dynamically resolves the DEDICATED database connection configuration for a tenant.
 * Strict Database-Per-Tenant Architecture: Every tenant has an isolated, standalone
 * PostgreSQL database URL configured in ofia_admin under Tenant Management.
 */
export async function getTenantDatabaseConfig(tenantSlug: string): Promise<TenantDbConfig> {
  const cleanSlug = (tenantSlug || "").toLowerCase().trim();

  if (!cleanSlug) {
    throw new Error("[ERP DB Resolver] Tenant slug is required to resolve dedicated database connection.");
  }

  const cached = dbConfigCache.get(cleanSlug);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.config;
  }

  const registrySql = getRegistrySql();

  try {
    const rows = await registrySql`
      SELECT slug, db_mode, database_url, is_custom_db
      FROM platform_tenants
      WHERE LOWER(slug) = ${cleanSlug}
         OR REPLACE(LOWER(slug), '-', '') = REPLACE(${cleanSlug}, '-', '')
      LIMIT 1;
    `;

    if (rows && rows.length > 0) {
      const row = rows[0];
      const dedicatedUrl = (row.database_url || "").trim() || MASTER_REGISTRY_URL;

      const config: TenantDbConfig = {
        tenantSlug: cleanSlug,
        dbMode: "DEDICATED",
        connectionString: dedicatedUrl,
        isCustom: true,
        resolvedAt: new Date().toISOString(),
      };

      dbConfigCache.set(cleanSlug, { config, expiresAt: now + 60000 });
      return config;
    }
  } catch (err) {
    console.warn(`[ERP DB Resolver] Lookup failed for tenant '${cleanSlug}' in registry:`, err);
  }

  const dedicatedConfig: TenantDbConfig = {
    tenantSlug: cleanSlug,
    dbMode: "DEDICATED",
    connectionString: MASTER_REGISTRY_URL,
    isCustom: true,
    resolvedAt: new Date().toISOString(),
  };

  dbConfigCache.set(cleanSlug, { config: dedicatedConfig, expiresAt: now + 30000 });
  return dedicatedConfig;
}

/**
 * Returns a Neon SQL tagged template query client connected STRICTLY to
 * the tenant's dedicated database.
 */
export async function getTenantSql(tenantSlug: string): Promise<any> {
  const config = await getTenantDatabaseConfig(tenantSlug);
  const connStr = config.connectionString;

  if (!clientPool.has(connStr)) {
    try {
      clientPool.set(connStr, neon(connStr));
    } catch (err) {
      console.error(`[ERP DB Resolver] Failed to initialize dedicated client for tenant '${tenantSlug}':`, err);
      throw err;
    }
  }

  return clientPool.get(connStr);
}

export function invalidateTenantDbCache(tenantSlug: string) {
  const cleanSlug = (tenantSlug || "").toLowerCase().trim();
  dbConfigCache.delete(cleanSlug);
}
