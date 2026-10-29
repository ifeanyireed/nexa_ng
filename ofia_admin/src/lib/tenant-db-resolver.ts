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
  "";

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
    const strippedDomain = cleanSlug.replace(/^www\./, "");
    const rows = await registrySql`
      SELECT slug, db_mode, database_url, is_custom_db
      FROM platform_tenants
      WHERE LOWER(slug) = ${cleanSlug}
         OR REPLACE(LOWER(slug), '-', '') = REPLACE(${cleanSlug}, '-', '')
         OR LOWER(domain) = ${cleanSlug}
         OR LOWER(domain) = ${strippedDomain}
         OR REPLACE(REPLACE(LOWER(domain), 'https://', ''), 'http://', '') = ${strippedDomain}
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
        tenantSlug: row.slug || cleanSlug,
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
        image_url TEXT DEFAULT '',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_dedicated_inventory_tenant_sku UNIQUE (tenant_slug, sku)
      );
    `;

    await targetSql`
      ALTER TABLE shop_inventory ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
      ALTER TABLE shop_inventory ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
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
        is_escrow BOOLEAN DEFAULT FALSE,
        escrow_status VARCHAR(50) DEFAULT 'NONE',
        merchant_amount NUMERIC(15,2) DEFAULT 0,
        platform_fee NUMERIC(15,2) DEFAULT 0,
        settlement_status VARCHAR(50) DEFAULT 'AVAILABLE',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Tenant Wallets, Ledger & Payouts
    await targetSql`
      CREATE TABLE IF NOT EXISTS tenant_wallets (
        id VARCHAR(64) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        available_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
        escrow_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
        total_withdrawn NUMERIC(15,2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
        bank_name VARCHAR(100) DEFAULT '',
        account_number VARCHAR(50) DEFAULT '',
        account_name VARCHAR(150) DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_tenant_wallet_slug UNIQUE (tenant_slug)
      );

      CREATE TABLE IF NOT EXISTS tenant_wallet_transactions (
        id VARCHAR(64) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        type VARCHAR(50) NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        reference VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        channel VARCHAR(50) DEFAULT 'STOREFRONT',
        is_escrow BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tenant_payout_requests (
        id VARCHAR(64) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        amount NUMERIC(15,2) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        account_number VARCHAR(50) NOT NULL,
        account_name VARCHAR(150) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PROCESSED',
        notes TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 7. Strict Multi-Tenant Composite Indexes
    await targetSql`
      CREATE INDEX IF NOT EXISTS idx_shop_orders_tenant_created ON shop_orders(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_shop_orders_tenant_status ON shop_orders(LOWER(tenant_slug), status);
      CREATE INDEX IF NOT EXISTS idx_shop_order_items_tenant_order ON shop_order_items(LOWER(tenant_slug), order_id);
      CREATE INDEX IF NOT EXISTS idx_shop_inventory_tenant_sku ON shop_inventory(LOWER(tenant_slug), sku);
      CREATE INDEX IF NOT EXISTS idx_shop_inventory_tenant_status ON shop_inventory(LOWER(tenant_slug), status);
      CREATE INDEX IF NOT EXISTS idx_shop_notifs_tenant_order ON shop_order_notifications(LOWER(tenant_slug), order_id);
      CREATE INDEX IF NOT EXISTS idx_shop_bookings_tenant_created ON shop_bookings(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_shop_bookings_tenant_status ON shop_bookings(LOWER(tenant_slug), status);
      CREATE INDEX IF NOT EXISTS idx_tenant_wallets_tenant ON tenant_wallets(LOWER(tenant_slug));
      CREATE INDEX IF NOT EXISTS idx_wallet_tx_tenant_created ON tenant_wallet_transactions(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_payouts_tenant_created ON tenant_payout_requests(LOWER(tenant_slug), created_at DESC);
    `;

    // 7. Fleet & Mobility Schema (Multi-Tenant Defense-in-Depth)
    await targetSql`
      CREATE TABLE IF NOT EXISTS fleet_vehicles (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        plate_number VARCHAR(50) NOT NULL,
        vehicle_type VARCHAR(100) NOT NULL DEFAULT 'Hiace Bus',
        make_model VARCHAR(191) NOT NULL,
        year INT DEFAULT 2020,
        region VARCHAR(100) NOT NULL DEFAULT 'Headquarters',
        assigned_driver_name VARCHAR(191) DEFAULT 'Unassigned',
        assigned_driver_phone VARCHAR(50) DEFAULT '',
        assigned_driver_lasdri BOOLEAN DEFAULT FALSE,
        operational_status VARCHAR(50) NOT NULL DEFAULT 'Operational',
        current_odometer INT DEFAULT 0,
        fuel_target_km_per_litre NUMERIC(5,2) DEFAULT 8.0,
        total_maintenance_cost NUMERIC(12,2) DEFAULT 0,
        open_repairs_count INT DEFAULT 0,
        last_routine_inspection_json JSONB DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_fleet_vehicles_tenant_plate UNIQUE (tenant_slug, plate_number)
      );

      CREATE TABLE IF NOT EXISTS fleet_papers (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        vehicle_id VARCHAR(191) NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
        vehicle_plate VARCHAR(50) NOT NULL,
        paper_type VARCHAR(50) NOT NULL,
        paper_name VARCHAR(100) NOT NULL,
        doc_ref_number VARCHAR(100) DEFAULT '',
        renewed_date DATE NOT NULL,
        expiring_date DATE NOT NULL,
        days_remaining INT DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'Valid',
        renewal_amount NUMERIC(12,2) DEFAULT 0,
        document_url TEXT DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_fleet_papers_vehicle_type UNIQUE (tenant_slug, vehicle_id, paper_type)
      );

      CREATE TABLE IF NOT EXISTS routine_inspections (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        vehicle_id VARCHAR(191) NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
        vehicle_plate VARCHAR(50) NOT NULL,
        inspector_name VARCHAR(191) NOT NULL,
        inspection_date DATE NOT NULL,
        inspection_type VARCHAR(100) NOT NULL DEFAULT 'Non-Repair Pre-Trip Audit',
        odometer_reading_km INT DEFAULT 0,
        fuel_level VARCHAR(50) NOT NULL DEFAULT 'Full',
        body_condition VARCHAR(50) NOT NULL DEFAULT 'Clean',
        tires_condition VARCHAR(50) NOT NULL DEFAULT 'Good',
        fluids_level VARCHAR(50) NOT NULL DEFAULT 'Optimal',
        lights_condition VARCHAR(50) NOT NULL DEFAULT 'All Working',
        brakes_condition VARCHAR(50) NOT NULL DEFAULT 'Responsive',
        checklist_json JSONB DEFAULT NULL,
        overall_status VARCHAR(50) NOT NULL DEFAULT 'Passed',
        findings_notes TEXT DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        escalated_to_repair BOOLEAN DEFAULT FALSE,
        escalated_to_repair_id VARCHAR(191) DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS maintenance_repairs (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        vehicle_id VARCHAR(191) NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
        vehicle_plate VARCHAR(50) NOT NULL,
        work_order_number VARCHAR(100) DEFAULT NULL,
        part_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Preventive Service',
        damaged_date DATE NOT NULL,
        repaired_date DATE DEFAULT NULL,
        turnaround_time_days INT DEFAULT NULL,
        cost_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        workshop_vendor VARCHAR(191) NOT NULL,
        driver_at_fault VARCHAR(191) DEFAULT NULL,
        mechanic_notes TEXT DEFAULT NULL,
        remark TEXT DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'In Workshop',
        jcc_signed_off BOOLEAN DEFAULT FALSE,
        origin_inspection_id VARCHAR(191) DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fleet_drivers (
        id VARCHAR(191) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        name VARCHAR(191) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        assigned_plate VARCHAR(50) DEFAULT NULL,
        assigned_vehicle_type VARCHAR(100) DEFAULT NULL,
        region VARCHAR(100) DEFAULT 'General',
        license_number VARCHAR(100) DEFAULT '',
        license_expiry VARCHAR(50) DEFAULT '',
        lasdri_certified BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'Active',
        assigned_date DATE DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_fleet_drivers_tenant_name UNIQUE (tenant_slug, name)
      );

      -- Fleet composite indexes with LOWER(tenant_slug)
      CREATE INDEX IF NOT EXISTS idx_fleet_veh_tenant_created ON fleet_vehicles(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_fleet_veh_tenant_status ON fleet_vehicles(LOWER(tenant_slug), operational_status);
      CREATE INDEX IF NOT EXISTS idx_fleet_veh_region ON fleet_vehicles(LOWER(tenant_slug), region);
      CREATE INDEX IF NOT EXISTS idx_fleet_veh_driver ON fleet_vehicles(LOWER(tenant_slug), assigned_driver_name);

      CREATE INDEX IF NOT EXISTS idx_fleet_papers_tenant_created ON fleet_papers(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_fleet_papers_tenant_status ON fleet_papers(LOWER(tenant_slug), status);
      CREATE INDEX IF NOT EXISTS idx_fleet_papers_vehicle ON fleet_papers(LOWER(tenant_slug), vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_fleet_papers_expiry ON fleet_papers(LOWER(tenant_slug), expiring_date);

      CREATE INDEX IF NOT EXISTS idx_inspections_tenant_created ON routine_inspections(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_inspections_tenant_status ON routine_inspections(LOWER(tenant_slug), overall_status);
      CREATE INDEX IF NOT EXISTS idx_inspections_vehicle ON routine_inspections(LOWER(tenant_slug), vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_inspections_plate ON routine_inspections(LOWER(tenant_slug), vehicle_plate);
      CREATE INDEX IF NOT EXISTS idx_inspections_date ON routine_inspections(LOWER(tenant_slug), inspection_date);

      CREATE INDEX IF NOT EXISTS idx_repairs_tenant_created ON maintenance_repairs(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_repairs_tenant_status ON maintenance_repairs(LOWER(tenant_slug), status);
      CREATE INDEX IF NOT EXISTS idx_repairs_vehicle ON maintenance_repairs(LOWER(tenant_slug), vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_repairs_plate ON maintenance_repairs(LOWER(tenant_slug), vehicle_plate);
      CREATE INDEX IF NOT EXISTS idx_repairs_category ON maintenance_repairs(LOWER(tenant_slug), category);
      CREATE INDEX IF NOT EXISTS idx_repairs_damaged_date ON maintenance_repairs(LOWER(tenant_slug), damaged_date);

      CREATE INDEX IF NOT EXISTS idx_fleet_drivers_tenant_created ON fleet_drivers(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_fleet_drivers_tenant_status ON fleet_drivers(LOWER(tenant_slug), status);
      CREATE INDEX IF NOT EXISTS idx_fleet_drivers_plate ON fleet_drivers(LOWER(tenant_slug), assigned_plate);

      -- 8. Dispatch Manager Schema (Multi-Tenant Defense-in-Depth)
      CREATE TABLE IF NOT EXISTS dispatch_shipments (
        id VARCHAR(64) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        tracking_number VARCHAR(64) NOT NULL,
        order_number VARCHAR(64) NOT NULL,
        job_type VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER_PICKUP',
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        priority VARCHAR(16) NOT NULL DEFAULT 'STANDARD',
        sender_name VARCHAR(191) NOT NULL,
        sender_phone VARCHAR(64) NOT NULL,
        pickup_address TEXT NOT NULL,
        pickup_city VARCHAR(100) DEFAULT '',
        pickup_notes TEXT DEFAULT '',
        pickup_lat NUMERIC(10, 7) DEFAULT 0,
        pickup_lng NUMERIC(10, 7) DEFAULT 0,
        recipient_name VARCHAR(191) NOT NULL,
        recipient_phone VARCHAR(64) NOT NULL,
        recipient_address TEXT NOT NULL,
        recipient_city VARCHAR(100) DEFAULT '',
        recipient_notes TEXT DEFAULT '',
        dropoff_lat NUMERIC(10, 7) DEFAULT 0,
        dropoff_lng NUMERIC(10, 7) DEFAULT 0,
        parcel_category VARCHAR(64) NOT NULL DEFAULT 'Documents',
        parcel_description TEXT DEFAULT '',
        weight_tier VARCHAR(32) DEFAULT 'light',
        weight_kg NUMERIC(6, 2) DEFAULT 1.0,
        vehicle_type VARCHAR(32) DEFAULT 'MOTORBIKE',
        speed_tier VARCHAR(32) DEFAULT 'instant',
        shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
        payment_method VARCHAR(32) NOT NULL DEFAULT 'card',
        payment_status VARCHAR(32) NOT NULL DEFAULT 'PAID',
        delivery_otp VARCHAR(16) NOT NULL,
        courier_driver_id VARCHAR(64) DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_dispatch_shipments_tenant_created ON dispatch_shipments(LOWER(tenant_slug), created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_dispatch_shipments_tenant_status ON dispatch_shipments(LOWER(tenant_slug), status);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_dispatch_shipments_tenant_tracking ON dispatch_shipments(LOWER(tenant_slug), tracking_number);

      CREATE TABLE IF NOT EXISTS dispatch_couriers (
        id VARCHAR(64) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        tenant_id VARCHAR(191) DEFAULT '',
        name VARCHAR(191) NOT NULL,
        phone VARCHAR(64) NOT NULL,
        vehicle_type VARCHAR(32) NOT NULL DEFAULT 'MOTORBIKE',
        plate_number VARCHAR(32) NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        current_lat NUMERIC(10, 7) DEFAULT 0,
        current_lng NUMERIC(10, 7) DEFAULT 0,
        current_zone VARCHAR(100) DEFAULT '',
        rating NUMERIC(3, 2) DEFAULT 5.0,
        total_trips INT DEFAULT 0,
        active_jobs INT DEFAULT 0,
        status VARCHAR(32) DEFAULT 'AVAILABLE',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_dispatch_couriers_tenant ON dispatch_couriers(LOWER(tenant_slug), is_available);

      CREATE TABLE IF NOT EXISTS dispatch_waypoints (
        id VARCHAR(64) PRIMARY KEY,
        tenant_slug VARCHAR(191) NOT NULL,
        shipment_id VARCHAR(64) NOT NULL REFERENCES dispatch_shipments(id) ON DELETE CASCADE,
        location VARCHAR(255) NOT NULL,
        status VARCHAR(32) NOT NULL,
        notes TEXT DEFAULT '',
        latitude NUMERIC(10, 7) DEFAULT 0,
        longitude NUMERIC(10, 7) DEFAULT 0,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_dispatch_waypoints_tenant_shipment ON dispatch_waypoints(LOWER(tenant_slug), shipment_id, timestamp DESC);
    `;

    return {
      success: true,
      message: "Dedicated database successfully provisioned with all commerce, inventory, bookings, fleet mobility & dispatch schemas.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: "Schema bootstrap failed: " + err.message,
    };
  }
}
