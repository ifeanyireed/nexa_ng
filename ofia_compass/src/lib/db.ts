import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;
let isInitialized = false;

function getConnectionString(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    "postgresql://neondb_owner:npg_t6UQAzVEqBO4@ep-falling-star-b4lrdr76-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  );
}

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = getConnectionString();
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function ensureTablesExist(): Promise<boolean> {
  if (isInitialized) return true;
  const db = getDbPool();
  if (!db) return false;

  try {
    const client = await db.connect();
    try {
      // 1. waitlist_leads table
      await client.query(`
        CREATE TABLE IF NOT EXISTS waitlist_leads (
          id VARCHAR(64) PRIMARY KEY,
          queue_number INT NOT NULL,
          full_name VARCHAR(150) NOT NULL,
          business_name VARCHAR(200) NOT NULL,
          email VARCHAR(150) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          role VARCHAR(50) DEFAULT 'MERCHANT',
          business_type VARCHAR(100) DEFAULT 'Retail Store',
          tool_type VARCHAR(100) DEFAULT 'Full Ecosystem',
          custom_business_type VARCHAR(200),
          custom_tool_type VARCHAR(200),
          niche VARCHAR(50) DEFAULT 'general',
          state VARCHAR(50) DEFAULT 'Lagos',
          city VARCHAR(100) DEFAULT 'Ikeja',
          team_size VARCHAR(50) DEFAULT '1-5',
          features_interest TEXT,
          referral_code VARCHAR(32) UNIQUE NOT NULL,
          referred_by VARCHAR(32),
          status VARCHAR(30) DEFAULT 'PENDING',
          invite_code VARCHAR(64),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_leads (email);
        CREATE INDEX IF NOT EXISTS idx_waitlist_phone ON waitlist_leads (phone);
        CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist_leads (status);
        CREATE INDEX IF NOT EXISTS idx_waitlist_referral ON waitlist_leads (referral_code);
        CREATE INDEX IF NOT EXISTS idx_waitlist_queue ON waitlist_leads (queue_number);
      `);

      // 2. contact_inquiries table
      await client.query(`
        CREATE TABLE IF NOT EXISTS contact_inquiries (
          id VARCHAR(64) PRIMARY KEY,
          ticket_number VARCHAR(32) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL,
          phone VARCHAR(50),
          subject VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          priority VARCHAR(20) DEFAULT 'MEDIUM',
          status VARCHAR(20) DEFAULT 'OPEN',
          assigned_to VARCHAR(100),
          resolution_notes TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_inquiries (status);
        CREATE INDEX IF NOT EXISTS idx_contact_ticket ON contact_inquiries (ticket_number);
        CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_inquiries (email);
      `);

      isInitialized = true;
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn("⚠️ Neon PostgreSQL table verification check:", err);
    return false;
  }
}

export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const db = getDbPool();
  if (!db) return null;

  try {
    await ensureTablesExist();

    // Map MySQL '?' placeholders to PostgreSQL '$1, $2, ...'
    let paramIdx = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIdx++}`);

    const res = await db.query(pgSql, params);
    return (res.rows as unknown) as T;
  } catch (err) {
    console.warn("⚠️ Neon PostgreSQL query execution failed, falling back to memory:", err);
    return null;
  }
}
