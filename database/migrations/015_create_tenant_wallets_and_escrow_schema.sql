-- ==============================================================================
-- MIGRATION 015: Tenant Wallets, Automated Split Settlement & Opt-In Escrow Schema
-- Target Database: Dedicated Neon PostgreSQL per Tenant
-- Multi-Tenant Isolation: Strictly partitioned by tenant_slug with composite indexes
-- ==============================================================================

-- 1. Ensure Escrow and Financial Split columns on shop_orders
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS is_escrow BOOLEAN DEFAULT FALSE;
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(50) DEFAULT 'NONE'; -- 'NONE', 'HELD', 'RELEASED', 'REFUNDED'
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS merchant_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(15,2) DEFAULT 0;
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS settlement_status VARCHAR(50) DEFAULT 'AVAILABLE'; -- 'AVAILABLE', 'HELD_ESCROW', 'WITHDRAWN'

-- 2. Ensure Escrow and Financial Split columns on shop_bookings
ALTER TABLE shop_bookings ADD COLUMN IF NOT EXISTS is_escrow BOOLEAN DEFAULT FALSE;
ALTER TABLE shop_bookings ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(50) DEFAULT 'NONE';
ALTER TABLE shop_bookings ADD COLUMN IF NOT EXISTS merchant_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE shop_bookings ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(15,2) DEFAULT 0;
ALTER TABLE shop_bookings ADD COLUMN IF NOT EXISTS settlement_status VARCHAR(50) DEFAULT 'AVAILABLE';

-- 3. Dedicated Tenant Wallet Table
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

CREATE INDEX IF NOT EXISTS idx_tenant_wallets_tenant ON tenant_wallets(LOWER(tenant_slug));

-- 4. Tenant Wallet Ledger Transactions
CREATE TABLE IF NOT EXISTS tenant_wallet_transactions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    tenant_id VARCHAR(191) DEFAULT '',
    type VARCHAR(50) NOT NULL, -- 'SALE_CREDIT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'WITHDRAWAL', 'REFUND'
    amount NUMERIC(15,2) NOT NULL,
    reference VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    channel VARCHAR(50) DEFAULT 'STOREFRONT',
    is_escrow BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_tenant_created ON tenant_wallet_transactions(LOWER(tenant_slug), created_at DESC);

-- 5. Tenant Withdrawal / Payout Requests
CREATE TABLE IF NOT EXISTS tenant_payout_requests (
    id VARCHAR(64) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    tenant_id VARCHAR(191) DEFAULT '',
    amount NUMERIC(15,2) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PROCESSED', -- 'PENDING', 'PROCESSED', 'REJECTED'
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payouts_tenant_created ON tenant_payout_requests(LOWER(tenant_slug), created_at DESC);
