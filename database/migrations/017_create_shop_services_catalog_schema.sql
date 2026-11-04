-- ==============================================================================
-- MIGRATION 017: Multi-Tenant Shop Services Catalog & Specialist Staff Schema
-- Target Database: Dedicated Neon PostgreSQL per Tenant
-- Multi-Tenant Isolation: Partitioned by tenant_slug with composite indexes
-- ==============================================================================

-- 1. SHOP SERVICE OFFERINGS CATALOG
CREATE TABLE IF NOT EXISTS shop_services (
    id VARCHAR(64) PRIMARY KEY,
    service_code VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(191) NOT NULL,
    tenant_id VARCHAR(191) DEFAULT '',
    vertical VARCHAR(50) NOT NULL,            -- 'fashion', 'cars', 'beauty', 'hardware', 'pharmacy', 'property', 'food', 'gadgets', 'home-living', 'retail', 'dispatch'
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    description TEXT DEFAULT '',
    price NUMERIC(15,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT '₦',
    duration_minutes INT DEFAULT 45,
    provider_name VARCHAR(191) DEFAULT '',
    provider_role VARCHAR(191) DEFAULT '',
    provider_avatar TEXT DEFAULT '',
    status VARCHAR(50) DEFAULT 'ACTIVE',       -- 'ACTIVE', 'INACTIVE', 'ARCHIVED'
    is_bookable BOOLEAN DEFAULT TRUE,
    attributes JSONB DEFAULT '{}'::jsonb,      -- Vertical-specific custom configs (e.g. fashion measurements, vehicle ramp type, clinic rooms)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_shop_services_tenant_code UNIQUE (tenant_slug, service_code)
);

CREATE INDEX IF NOT EXISTS idx_shop_services_tenant_vert 
    ON shop_services(LOWER(tenant_slug), vertical);
CREATE INDEX IF NOT EXISTS idx_shop_services_status 
    ON shop_services(LOWER(tenant_slug), status);
CREATE INDEX IF NOT EXISTS idx_shop_services_created 
    ON shop_services(LOWER(tenant_slug), created_at DESC);

-- 2. SPECIALIST & TECHNICIAN STAFF REGISTRY
CREATE TABLE IF NOT EXISTS shop_specialists (
    id VARCHAR(64) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    tenant_id VARCHAR(191) DEFAULT '',
    name VARCHAR(191) NOT NULL,
    role VARCHAR(191) NOT NULL,
    specialty VARCHAR(191) NOT NULL,
    vertical VARCHAR(50) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.0,
    completed_jobs INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    avatar_url TEXT DEFAULT '',
    phone VARCHAR(64) DEFAULT '',
    email VARCHAR(191) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_specialists_tenant_vert 
    ON shop_specialists(LOWER(tenant_slug), vertical);
CREATE INDEX IF NOT EXISTS idx_shop_specialists_available 
    ON shop_specialists(LOWER(tenant_slug), is_available);
