-- ==============================================================================
-- MIGRATION 012: Real-Time Shop Inventory & Automated Notifications Schema
-- Target Database: Neon PostgreSQL
-- Multi-Tenant Isolation: Strictly partitioned by tenant_slug with composite indexes
-- ==============================================================================

-- 1. SHOP INVENTORY TABLE
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
    status VARCHAR(50) DEFAULT 'IN_STOCK', -- 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
    supplier VARCHAR(191) DEFAULT 'Official Manufacturer',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_shop_inventory_tenant_sku UNIQUE (tenant_slug, sku)
);

ALTER TABLE shop_inventory ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(191) DEFAULT '';

-- Multi-Tenant Composite Indexes for Strict Isolation & Fast Partitioned Scans
CREATE INDEX IF NOT EXISTS idx_shop_inventory_tenant ON shop_inventory(LOWER(tenant_slug));
CREATE INDEX IF NOT EXISTS idx_shop_inventory_tenant_sku ON shop_inventory(LOWER(tenant_slug), sku);
CREATE INDEX IF NOT EXISTS idx_shop_inventory_tenant_prod ON shop_inventory(LOWER(tenant_slug), product_id);
CREATE INDEX IF NOT EXISTS idx_shop_inventory_tenant_status ON shop_inventory(LOWER(tenant_slug), status);
CREATE INDEX IF NOT EXISTS idx_shop_inventory_tenant_created ON shop_inventory(LOWER(tenant_slug), created_at DESC);

-- 2. SHOP ORDER NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS shop_order_notifications (
    id VARCHAR(64) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    tenant_id VARCHAR(191) DEFAULT '',
    order_id VARCHAR(64) NOT NULL,
    order_number VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- 'EMAIL', 'SMS', 'WHATSAPP'
    recipient VARCHAR(191) NOT NULL,
    status_event VARCHAR(50) NOT NULL, -- 'ORDER_PLACED', 'IN_PREPARATION', 'READY_DISPATCH', 'DELIVERED', 'LOW_STOCK'
    subject VARCHAR(255) DEFAULT '',
    message TEXT NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'SENT', -- 'QUEUED', 'SENT', 'FAILED'
    error_message TEXT DEFAULT '',
    tracking_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Multi-Tenant Composite Indexes for Notifications
CREATE INDEX IF NOT EXISTS idx_shop_notifications_tenant ON shop_order_notifications(LOWER(tenant_slug));
CREATE INDEX IF NOT EXISTS idx_shop_notifications_tenant_order ON shop_order_notifications(LOWER(tenant_slug), order_number);
CREATE INDEX IF NOT EXISTS idx_shop_notifications_tenant_status ON shop_order_notifications(LOWER(tenant_slug), status_event);
CREATE INDEX IF NOT EXISTS idx_shop_notifications_tenant_created ON shop_order_notifications(LOWER(tenant_slug), created_at DESC);
