-- ==============================================================================
-- MIGRATION 014: Ofia Dispatch Manager & Public Storefront Shipments Schema
-- Target Database: Dedicated Neon PostgreSQL per Tenant (AGENT.md DEDICATED ONLY)
-- Multi-Tenant Isolation: Defense-in-depth partitioned by LOWER(tenant_slug) & tenant_id
-- ==============================================================================

-- 1. DEDICATED DISPATCH SHIPMENTS
CREATE TABLE IF NOT EXISTS dispatch_shipments (
    id VARCHAR(64) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    tenant_id VARCHAR(191) DEFAULT '',
    tracking_number VARCHAR(64) NOT NULL,
    order_number VARCHAR(64) NOT NULL,
    job_type VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER_PICKUP', -- STORE_ORDER, VENDOR_DISPATCH, CUSTOMER_PICKUP
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',          -- PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, EXCEPTION, CANCELLED
    priority VARCHAR(16) NOT NULL DEFAULT 'STANDARD',       -- STANDARD, HIGH, URGENT
    
    -- Sender Details (Pickup)
    sender_name VARCHAR(191) NOT NULL,
    sender_phone VARCHAR(64) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) DEFAULT '',
    pickup_notes TEXT DEFAULT '',
    pickup_lat NUMERIC(10, 7) DEFAULT 0,
    pickup_lng NUMERIC(10, 7) DEFAULT 0,
    
    -- Recipient Details (Destination)
    recipient_name VARCHAR(191) NOT NULL,
    recipient_phone VARCHAR(64) NOT NULL,
    recipient_address TEXT NOT NULL,
    recipient_city VARCHAR(100) DEFAULT '',
    recipient_notes TEXT DEFAULT '',
    dropoff_lat NUMERIC(10, 7) DEFAULT 0,
    dropoff_lng NUMERIC(10, 7) DEFAULT 0,
    
    -- Parcel & Logistics Details
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
    
    -- Security & Handover Verification
    delivery_otp VARCHAR(16) NOT NULL,
    courier_driver_id VARCHAR(64) DEFAULT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mandatory Composite Indexes (AGENT.md §3)
CREATE INDEX IF NOT EXISTS idx_dispatch_shipments_tenant_created 
    ON dispatch_shipments(LOWER(tenant_slug), created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dispatch_shipments_tenant_status 
    ON dispatch_shipments(LOWER(tenant_slug), status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dispatch_shipments_tenant_tracking 
    ON dispatch_shipments(LOWER(tenant_slug), tracking_number);

-- 2. DEDICATED COURIER FLEET
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispatch_couriers_tenant 
    ON dispatch_couriers(LOWER(tenant_slug), is_available);

-- 3. DEDICATED WAYPOINTS AUDIT TRAIL
CREATE TABLE IF NOT EXISTS dispatch_waypoints (
    id VARCHAR(64) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    shipment_id VARCHAR(64) NOT NULL REFERENCES dispatch_shipments(id) ON DELETE CASCADE,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    notes TEXT DEFAULT '',
    latitude NUMERIC(10, 7) DEFAULT 0,
    longitude NUMERIC(10, 7) DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispatch_waypoints_tenant_shipment 
    ON dispatch_waypoints(LOWER(tenant_slug), shipment_id, timestamp DESC);
