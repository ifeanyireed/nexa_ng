const initializedTenants = new Set<string>();

/** Stable per-tenant buyer identity: lowercase email, else digits-only phone. */
export function resolveBuyerKey(email?: string | null, phone?: string | null): string {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (cleanEmail) return cleanEmail;
  return String(phone || "").replace(/\D/g, "");
}

export async function ensureBuyerWalletTables(sql: any, tenantSlug: string) {
  if (!sql) return;
  const key = tenantSlug.toLowerCase().trim();
  if (initializedTenants.has(key)) return;

  await sql`
    CREATE TABLE IF NOT EXISTS buyer_wallets (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      buyer_key VARCHAR(191) NOT NULL,
      buyer_email VARCHAR(191) NOT NULL DEFAULT '',
      buyer_phone VARCHAR(64) NOT NULL DEFAULT '',
      balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
      currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
      status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_slug, buyer_key)
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_buyer_wallets_tenant_created ON buyer_wallets (LOWER(tenant_slug), created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_buyer_wallets_tenant_status ON buyer_wallets (LOWER(tenant_slug), status);`;

  await sql`
    CREATE TABLE IF NOT EXISTS buyer_wallet_transactions (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      buyer_key VARCHAR(191) NOT NULL,
      type VARCHAR(32) NOT NULL,
      amount NUMERIC(14,2) NOT NULL,
      reference VARCHAR(191) NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_buyer_wallet_tx_tenant_created ON buyer_wallet_transactions (LOWER(tenant_slug), created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_buyer_wallet_tx_tenant_status ON buyer_wallet_transactions (LOWER(tenant_slug), status);`;

  await sql`
    CREATE TABLE IF NOT EXISTS buyer_refund_requests (
      id VARCHAR(191) PRIMARY KEY,
      tenant_slug VARCHAR(191) NOT NULL,
      tenant_id VARCHAR(191) DEFAULT '',
      buyer_key VARCHAR(191) NOT NULL,
      buyer_name VARCHAR(191) NOT NULL DEFAULT '',
      order_number VARCHAR(191) NOT NULL,
      amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      reason TEXT NOT NULL DEFAULT '',
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      resolution_note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_buyer_refunds_tenant_created ON buyer_refund_requests (LOWER(tenant_slug), created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_buyer_refunds_tenant_status ON buyer_refund_requests (LOWER(tenant_slug), status);`;

  initializedTenants.add(key);
}

export async function getBuyerWalletBalance(sql: any, tenantSlug: string, buyerKey: string): Promise<number> {
  if (!buyerKey) return 0;
  const rows = await sql`
    SELECT balance FROM buyer_wallets
    WHERE LOWER(tenant_slug) = ${tenantSlug} AND buyer_key = ${buyerKey} AND status = 'ACTIVE'
    LIMIT 1;
  `;
  return rows.length ? Number(rows[0].balance) : 0;
}
