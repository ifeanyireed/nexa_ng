-- ==============================================================================
-- MIGRATION 011: Omnichannel Commerce Orders & Service Bookings Schema
-- Target Database: Neon PostgreSQL
-- Multi-Tenant Isolation: Strictly partitioned by tenant_slug with composite indexes
-- ==============================================================================

-- 1. SHOP COMMERCE ORDERS
CREATE TABLE IF NOT EXISTS shop_orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(191) NOT NULL,
    tenant_id VARCHAR(191) DEFAULT '',
    customer_name VARCHAR(191) NOT NULL,
    customer_email VARCHAR(191) DEFAULT '',
    customer_phone VARCHAR(64) NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'STOREFRONT', -- 'STOREFRONT', 'POS_COUNTER', 'WHATSAPP', 'MANUAL'
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PREPARATION', -- 'PENDING', 'IN_PREPARATION', 'READY_DISPATCH', 'DELIVERED', 'CANCELLED'
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID', -- 'PENDING', 'PAID', 'REFUNDED', 'FAILED'
    delivery_method VARCHAR(50) NOT NULL DEFAULT 'DISPATCH', -- 'DISPATCH', 'STORE_PICKUP'
    shipping_address TEXT DEFAULT '',
    city VARCHAR(100) DEFAULT 'Lagos',
    payment_method VARCHAR(50) DEFAULT 'card',
    items_summary TEXT DEFAULT '',
    item_count INT DEFAULT 1,
    total_amount VARCHAR(100) NOT NULL,
    raw_amount NUMERIC(15,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT '₦',
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_shop_orders_tenant_number UNIQUE (tenant_slug, order_number)
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_tenant ON shop_orders(LOWER(tenant_slug));
CREATE INDEX IF NOT EXISTS idx_shop_orders_number ON shop_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(LOWER(tenant_slug), status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_channel ON shop_orders(LOWER(tenant_slug), channel);
CREATE INDEX IF NOT EXISTS idx_shop_orders_created ON shop_orders(LOWER(tenant_slug), created_at DESC);

-- 2. SHOP ORDER ITEMS
CREATE TABLE IF NOT EXISTS shop_order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(191) NOT NULL,
    product_id VARCHAR(191) DEFAULT '',
    title VARCHAR(255) NOT NULL,
    price NUMERIC(15,2) DEFAULT 0,
    quantity INT DEFAULT 1,
    image_url TEXT DEFAULT '',
    options JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_order_items_order ON shop_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_tenant ON shop_order_items(LOWER(tenant_slug));

-- 3. SHOP SERVICE APPOINTMENTS & BOOKINGS
CREATE TABLE IF NOT EXISTS shop_bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_number VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(191) NOT NULL,
    tenant_id VARCHAR(191) DEFAULT '',
    customer_name VARCHAR(191) NOT NULL,
    customer_email VARCHAR(191) DEFAULT '',
    customer_phone VARCHAR(64) NOT NULL,
    service_title VARCHAR(255) NOT NULL,
    date_time VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
    vertical VARCHAR(50) NOT NULL DEFAULT 'cars',
    notes TEXT DEFAULT '',
    amount NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_shop_bookings_tenant_number UNIQUE (tenant_slug, booking_number)
);

CREATE INDEX IF NOT EXISTS idx_shop_bookings_tenant ON shop_bookings(LOWER(tenant_slug));
CREATE INDEX IF NOT EXISTS idx_shop_bookings_number ON shop_bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_shop_bookings_status ON shop_bookings(LOWER(tenant_slug), status);
CREATE INDEX IF NOT EXISTS idx_shop_bookings_created ON shop_bookings(LOWER(tenant_slug), created_at DESC);

-- ==============================================================================
-- INITIAL SEED DATA FOR NEW ERA TRANSPORTS (neweratransports)
-- ==============================================================================
INSERT INTO shop_orders (
    id, order_number, tenant_slug, tenant_id, customer_name, customer_email,
    customer_phone, channel, status, payment_status, delivery_method,
    shipping_address, city, payment_method, items_summary, item_count,
    total_amount, raw_amount, currency, items
) VALUES
(
    'ORD-9021',
    'OFIA-2026-9021',
    'neweratransports',
    'org-01',
    'Chief Babatunde Alabi',
    'babatunde.alabi@gmail.com',
    '+234 802 334 5566',
    'STOREFRONT',
    'IN_PREPARATION',
    'PAID',
    'DISPATCH',
    'Plot 12, Alexander Road, Ikoyi, Lagos',
    'Lagos',
    'card',
    '2024 Mercedes-Benz GLE 450 4MATIC (Executive Edition)',
    1,
    '₦98,000,000',
    98000000,
    '₦',
    '[{"id":"item-01","productId":"car-001","title":"2024 Mercedes-Benz GLE 450 4MATIC (Executive Edition)","price":98000000,"quantity":1}]'::jsonb
),
(
    'ORD-9020',
    'OFIA-2026-9020',
    'neweratransports',
    'org-01',
    'Mrs. Amaka Okoye',
    'amaka.okoye@yahoo.com',
    '+234 803 777 8899',
    'POS_COUNTER',
    'READY_DISPATCH',
    'PAID',
    'STORE_PICKUP',
    'Showroom Valet Desk, Victoria Island, Lagos',
    'Lagos',
    'card',
    'Custom Leather Steering Wrap + 4x RunFlat Tires',
    5,
    '₦1,250,000',
    1250000,
    '₦',
    '[{"id":"item-02","productId":"acc-01","title":"Custom Leather Steering Wrap","price":250000,"quantity":1},{"id":"item-03","productId":"acc-02","title":"4x Michelin RunFlat Tires","price":1000000,"quantity":4}]'::jsonb
)
ON CONFLICT (tenant_slug, order_number) DO NOTHING;

INSERT INTO shop_bookings (
    id, booking_number, tenant_slug, tenant_id, customer_name, customer_email,
    customer_phone, service_title, date_time, status, vertical, notes
) VALUES
(
    'BK-101',
    'TD-88219',
    'neweratransports',
    'org-01',
    'Dr. Emmanuel Adeleke',
    'emmanuel.adeleke@gmail.com',
    '+234 803 456 7890',
    'Comprehensive 150-Point Pre-Purchase Mechanical Inspection',
    'Tomorrow at 10:00 AM',
    'CONFIRMED',
    'cars',
    'Customer requested morning slot before noon at showroom.'
),
(
    'BK-102',
    'TD-99124',
    'neweratransports',
    'org-01',
    'Mrs. Folashade Bakare',
    'fola.bakare@yahoo.com',
    '+234 812 987 6543',
    'Executive Valet At-Home VIP Test-Drive (2024 Range Rover)',
    'Saturday at 2:00 PM',
    'PENDING',
    'cars',
    'Destination: Banana Island, Ikoyi. Bring vehicle specs booklet.'
)
ON CONFLICT (tenant_slug, booking_number) DO NOTHING;
