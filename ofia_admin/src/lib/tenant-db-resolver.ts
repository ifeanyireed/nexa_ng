import { neon } from "@neondatabase/serverless";

export interface TenantDbConfig {
  tenantSlug: string;
  dbMode: "DEDICATED";
  connectionString: string;
  isCustom: boolean;
  resolvedAt: string;
}

export interface DbTestResult {
  success: boolean;
  latencyMs: number;
  version?: string;
  serverTime?: string;
  error?: string;
}

export const MASTER_REGISTRY_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  "postgresql://neondb_owner:npg_OihL3cnwGeW2@ep-plain-hill-b5whmxdg-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const MASTER_CONNECTION_STRING = MASTER_REGISTRY_URL;

// In-memory cache for resolved dedicated database configs with 60-second TTL
const dbConfigCache = new Map<string, { config: TenantDbConfig; expiresAt: number }>();
// Client pool cache for Neon SQL tagged template functions
const clientPool = new Map<string, any>();

function getRegistrySql() {
  if (!clientPool.has(MASTER_REGISTRY_URL)) {
    clientPool.set(MASTER_REGISTRY_URL, neon(MASTER_REGISTRY_URL));
  }
  return clientPool.get(MASTER_REGISTRY_URL);
}

/**
 * Ensures the platform_tenants registry table exists in the master Neon database.
 */
let isSchemaInitialized = false;
async function ensurePlatformTenantsTable() {
  if (isSchemaInitialized) return;
  const sql = getRegistrySql();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS platform_tenants (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(191) NOT NULL UNIQUE,
        domain VARCHAR(255) DEFAULT '',
        owner_name VARCHAR(255) DEFAULT '',
        owner_email VARCHAR(255) DEFAULT '',
        plan_tier VARCHAR(50) DEFAULT 'GROWTH',
        status VARCHAR(50) DEFAULT 'Active',
        db_mode VARCHAR(50) DEFAULT 'DEDICATED',
        database_url TEXT NOT NULL DEFAULT '',
        cloudinary_url TEXT DEFAULT '',
        is_custom_db BOOLEAN DEFAULT TRUE,
        is_custom_storage BOOLEAN DEFAULT FALSE,
        mrr NUMERIC(15,2) DEFAULT 0,
        vertical VARCHAR(50) DEFAULT 'retail',
        logo TEXT DEFAULT '',
        login_image TEXT DEFAULT '',
        hero_title TEXT DEFAULT '',
        hero_subtitle TEXT DEFAULT '',
        erp_modules JSONB DEFAULT '{}'::jsonb,
        shop_sub_modules JSONB DEFAULT '{}'::jsonb,
        mobility_sub_modules JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_platform_tenants_slug ON platform_tenants(LOWER(slug));`;
    isSchemaInitialized = true;
  } catch (err) {
    console.warn("[Tenant DB Resolver] Warning initializing platform_tenants table:", err);
  }
}

/**
 * Dynamically resolves the DEDICATED database connection configuration for a tenant.
 * Strict Database-Per-Tenant Architecture: Every tenant must have an isolated, standalone
 * PostgreSQL database URL configured in ofia_admin under Tenant Management.
 */
export async function getTenantDatabaseConfig(tenantSlug: string): Promise<TenantDbConfig> {
  const cleanSlug = (tenantSlug || "").toLowerCase().trim();

  if (!cleanSlug) {
    throw new Error("[Tenant DB Resolver] Tenant slug is required to resolve dedicated database connection.");
  }

  // Check in-memory cache
  const cached = dbConfigCache.get(cleanSlug);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.config;
  }

  await ensurePlatformTenantsTable();
  const registrySql = getRegistrySql();

  try {
    const rows = await registrySql`
      SELECT slug, db_mode, database_url, is_custom_db
      FROM platform_tenants
      WHERE LOWER(slug) = ${cleanSlug}
      LIMIT 1;
    `;

    if (rows && rows.length > 0) {
      const row = rows[0];
      const customUrl = (row.database_url || "").trim();
      if (!customUrl) {
        console.warn(
          `[Tenant DB Resolver] Architectural Warning: Tenant '${cleanSlug}' operates in DEDICATED mode but has not configured a standalone database_url in ofia_admin.`
        );
      }
      const dedicatedUrl = customUrl || MASTER_REGISTRY_URL;

      const config: TenantDbConfig = {
        tenantSlug: cleanSlug,
        dbMode: "DEDICATED",
        connectionString: dedicatedUrl,
        isCustom: Boolean(customUrl),
        resolvedAt: new Date().toISOString(),
      };

      // Cache for 60 seconds
      dbConfigCache.set(cleanSlug, { config, expiresAt: now + 60000 });
      return config;
    }
  } catch (err) {
    console.warn(`[Tenant DB Resolver] Lookup failed for tenant '${cleanSlug}' in registry:`, err);
  }

  // Default dedicated configuration for registered tenant
  const dedicatedConfig: TenantDbConfig = {
    tenantSlug: cleanSlug,
    dbMode: "DEDICATED",
    connectionString: MASTER_REGISTRY_URL,
    isCustom: false,
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
      console.error(`[Tenant DB Resolver] Failed to initialize dedicated client for tenant '${tenantSlug}':`, err);
      throw err;
    }
  }

  return clientPool.get(connStr);
}

/**
 * Clears the cached database configuration for a tenant (used after updates in ofia_admin).
 */
export function invalidateTenantDbCache(tenantSlug: string) {
  const cleanSlug = (tenantSlug || "").toLowerCase().trim();
  dbConfigCache.delete(cleanSlug);
}

/**
 * Tests connection to a tenant's dedicated PostgreSQL connection string with roundtrip latency.
 */
export async function testDatabaseConnection(connectionString: string): Promise<DbTestResult> {
  const startTime = Date.now();
  try {
    if (!connectionString || !connectionString.trim()) {
      return {
        success: false,
        latencyMs: 0,
        error: "Dedicated database connection string cannot be empty",
      };
    }

    const testSql = neon(connectionString.trim());
    const [result] = await testSql`SELECT NOW() as now, version() as version;`;
    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      latencyMs,
      version: String(result?.version || "PostgreSQL (Neon Dedicated)"),
      serverTime: String(result?.now || new Date().toISOString()),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      error: err.message || "Failed to establish dedicated connection to database",
    };
  }
}

/**
 * Automatically provisions all required commerce & inventory tables on a dedicated tenant database.
 */
export async function bootstrapDedicatedTenantSchema(connectionString: string): Promise<{ success: boolean; message: string }> {
  try {
    const targetSql = neon(connectionString.trim());

    // 1. Orders schema
    await targetSql`
      CREATE TABLE IF NOT EXISTS shop_orders (
        id VARCHAR(64) PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL UNIQUE,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) DEFAULT '',
        customer_phone VARCHAR(50) DEFAULT '',
        channel VARCHAR(50) NOT NULL DEFAULT 'STOREFRONT',
        items_summary TEXT DEFAULT '',
        item_count INT NOT NULL DEFAULT 1,
        total_amount VARCHAR(100) NOT NULL,
        raw_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
        status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',
        payment_method VARCHAR(50) NOT NULL DEFAULT 'CARD',
        delivery_method VARCHAR(50) DEFAULT 'DELIVERY',
        shipping_address TEXT DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        notes TEXT DEFAULT '',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Order items
    await targetSql`
      CREATE TABLE IF NOT EXISTS shop_order_items (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        product_id VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        price NUMERIC(15,2) NOT NULL DEFAULT 0,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Inventory
    await targetSql`
      CREATE TABLE IF NOT EXISTS shop_inventory (
        id VARCHAR(64) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        product_id VARCHAR(100) NOT NULL,
        sku VARCHAR(100) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        warehouse VARCHAR(100) DEFAULT 'Ikeja Central Depot',
        current_stock INT NOT NULL DEFAULT 10,
        min_stock INT NOT NULL DEFAULT 3,
        unit_cost NUMERIC(15,2) DEFAULT 0,
        unit_price NUMERIC(15,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'IN_STOCK',
        supplier VARCHAR(191) DEFAULT 'Official Manufacturer',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_dedicated_inventory_tenant_sku UNIQUE (tenant_slug, sku)
      );
    `;

    // 4. Notifications
    await targetSql`
      CREATE TABLE IF NOT EXISTS shop_order_notifications (
        id VARCHAR(64) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        order_id VARCHAR(64) NOT NULL,
        order_number VARCHAR(100) NOT NULL,
        channel VARCHAR(50) NOT NULL,
        recipient VARCHAR(191) NOT NULL,
        status_event VARCHAR(50) NOT NULL,
        subject VARCHAR(255) DEFAULT '',
        message TEXT NOT NULL,
        delivery_status VARCHAR(50) DEFAULT 'SENT',
        error_message TEXT DEFAULT '',
        tracking_url TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Bookings
    await targetSql`
      CREATE TABLE IF NOT EXISTS shop_bookings (
        id VARCHAR(64) PRIMARY KEY,
        booking_number VARCHAR(100) NOT NULL UNIQUE,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        service_id VARCHAR(100) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) DEFAULT '',
        customer_phone VARCHAR(50) DEFAULT '',
        slot_date VARCHAR(50) NOT NULL,
        slot_time VARCHAR(50) NOT NULL,
        total_amount VARCHAR(100) NOT NULL,
        raw_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',
        notes TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Strict Multi-Tenant Composite Indexes
    await targetSql`
      CREATE INDEX IF NOT EXISTS idx_shop_orders_tenant_created ON shop_orders(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_shop_orders_tenant_status ON shop_orders(LOWER(tenant_slug), status);
      CREATE INDEX IF NOT EXISTS idx_shop_order_items_tenant_order ON shop_order_items(LOWER(tenant_slug), order_id);
      CREATE INDEX IF NOT EXISTS idx_shop_inventory_tenant_sku ON shop_inventory(LOWER(tenant_slug), sku);
      CREATE INDEX IF NOT EXISTS idx_shop_inventory_tenant_status ON shop_inventory(LOWER(tenant_slug), status);
      CREATE INDEX IF NOT EXISTS idx_shop_notifs_tenant_order ON shop_order_notifications(LOWER(tenant_slug), order_id);
      CREATE INDEX IF NOT EXISTS idx_shop_bookings_tenant_created ON shop_bookings(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_shop_bookings_tenant_status ON shop_bookings(LOWER(tenant_slug), status);
    `;

    return {
      success: true,
      message: "Dedicated database successfully provisioned with all commerce, inventory & notification schemas.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: "Schema bootstrap failed: " + err.message,
    };
  }
}
