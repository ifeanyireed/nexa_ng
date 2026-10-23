-- ==============================================================================
-- MIGRATION 013: Tenant Database Registry & Database-Per-Tenant Architecture
-- Target Database: Neon PostgreSQL
-- Multi-Tenant Isolation: Strictly partitioned by tenant_slug with dedicated DB resolution
-- ==============================================================================

-- 1. PLATFORM TENANTS REGISTRY TABLE
CREATE TABLE IF NOT EXISTS platform_tenants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    domain VARCHAR(255) DEFAULT '',
    owner_name VARCHAR(255) DEFAULT '',
    owner_email VARCHAR(255) DEFAULT '',
    plan_tier VARCHAR(50) DEFAULT 'GROWTH',
    status VARCHAR(50) DEFAULT 'Active',
    db_mode VARCHAR(50) DEFAULT 'DEDICATED', -- Strict Database-Per-Tenant: 'DEDICATED'
    database_url TEXT DEFAULT '',             -- Standalone dedicated PostgreSQL connection string
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

-- Ensure all columns exist for existing table setups
ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS db_mode VARCHAR(50) DEFAULT 'DEDICATED';
ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS database_url TEXT DEFAULT '';
ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS is_custom_db BOOLEAN DEFAULT TRUE;
ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS erp_modules JSONB DEFAULT '{}'::jsonb;
ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS shop_sub_modules JSONB DEFAULT '{}'::jsonb;
ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS mobility_sub_modules JSONB DEFAULT '{}'::jsonb;

-- Strict Multi-Tenant Composite & Unique Indexes
CREATE INDEX IF NOT EXISTS idx_platform_tenants_slug ON platform_tenants(LOWER(slug));
CREATE INDEX IF NOT EXISTS idx_platform_tenants_db_mode ON platform_tenants(db_mode);
CREATE INDEX IF NOT EXISTS idx_platform_tenants_custom_db ON platform_tenants(is_custom_db);
CREATE INDEX IF NOT EXISTS idx_platform_tenants_status ON platform_tenants(status);
