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

      // 3. tenant_smtp_settings table
      await client.query(`
        CREATE TABLE IF NOT EXISTS tenant_smtp_settings (
          tenant_slug VARCHAR(100) PRIMARY KEY,
          provider VARCHAR(50) DEFAULT 'custom',
          host VARCHAR(255) NOT NULL,
          port INT NOT NULL DEFAULT 587,
          encryption VARCHAR(20) DEFAULT 'tls',
          from_email VARCHAR(255) NOT NULL,
          from_name VARCHAR(255) NOT NULL,
          username VARCHAR(255),
          password TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_tenant_smtp_slug ON tenant_smtp_settings (tenant_slug);
      `);

      // 4. email_campaigns and email_queue tables for mass email background worker
      await client.query(`
        CREATE TABLE IF NOT EXISTS email_campaigns (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(100) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message_html TEXT NOT NULL,
          login_url TEXT,
          total_recipients INT NOT NULL DEFAULT 0,
          sent_count INT NOT NULL DEFAULT 0,
          failed_count INT NOT NULL DEFAULT 0,
          status VARCHAR(30) NOT NULL DEFAULT 'queued',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_email_campaigns_tenant ON email_campaigns (tenant_slug);
        CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns (status);

        CREATE TABLE IF NOT EXISTS email_queue (
          id VARCHAR(64) PRIMARY KEY,
          campaign_id VARCHAR(64) REFERENCES email_campaigns(id) ON DELETE CASCADE,
          tenant_slug VARCHAR(100) NOT NULL,
          recipient_email VARCHAR(255) NOT NULL,
          recipient_name VARCHAR(255),
          recipient_role VARCHAR(100),
          recipient_department VARCHAR(150),
          status VARCHAR(30) NOT NULL DEFAULT 'pending',
          attempts INT NOT NULL DEFAULT 0,
          error_message TEXT,
          sent_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_email_queue_claim ON email_queue (status, attempts);
        CREATE INDEX IF NOT EXISTS idx_email_queue_campaign ON email_queue (campaign_id);
        CREATE INDEX IF NOT EXISTS idx_email_queue_tenant ON email_queue (tenant_slug);

        -- 5. CRM Tables
        CREATE TABLE IF NOT EXISTS crm_deals (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          company VARCHAR(255) NOT NULL,
          contact_name VARCHAR(150) NOT NULL,
          email VARCHAR(150),
          phone VARCHAR(50),
          value VARCHAR(50) NOT NULL DEFAULT '₦0',
          stage VARCHAR(30) NOT NULL DEFAULT 'QUALIFIED',
          owner VARCHAR(100),
          probability INT DEFAULT 50,
          expected_close VARCHAR(50),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_crm_deals_tenant ON crm_deals (tenant_slug);
        CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals (stage);

        CREATE TABLE IF NOT EXISTS crm_leads (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(100) NOT NULL,
          company_name VARCHAR(255) NOT NULL,
          website VARCHAR(255),
          industry VARCHAR(100),
          location VARCHAR(150),
          contact_name VARCHAR(150) NOT NULL,
          contact_title VARCHAR(150),
          contact_email VARCHAR(150) NOT NULL,
          contact_phone VARCHAR(50),
          icp_fit_score INT DEFAULT 80,
          buying_signals TEXT,
          status VARCHAR(50) DEFAULT 'QUALIFIED',
          assigned_rep VARCHAR(100),
          source VARCHAR(100) DEFAULT 'Direct Outreach',
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant ON crm_leads (tenant_slug);
        CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads (status);

        CREATE TABLE IF NOT EXISTS crm_accounts (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(100) NOT NULL,
          company VARCHAR(255) NOT NULL,
          industry VARCHAR(100),
          location VARCHAR(150),
          total_deals VARCHAR(50) DEFAULT '₦0',
          status VARCHAR(30) DEFAULT 'PROSPECT',
          key_contact VARCHAR(150),
          email VARCHAR(150),
          phone VARCHAR(50),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_crm_accounts_tenant ON crm_accounts (tenant_slug);

        CREATE TABLE IF NOT EXISTS crm_email_lists (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(100) NOT NULL,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          tags TEXT,
          subscriber_count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_crm_email_lists_tenant ON crm_email_lists (tenant_slug);

        CREATE TABLE IF NOT EXISTS crm_email_subscribers (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(100) NOT NULL,
          list_id VARCHAR(64) REFERENCES crm_email_lists(id) ON DELETE CASCADE,
          email VARCHAR(150) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          company VARCHAR(150),
          phone VARCHAR(50),
          status VARCHAR(30) DEFAULT 'SUBSCRIBED',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_crm_subscribers_list ON crm_email_subscribers (list_id);
        CREATE INDEX IF NOT EXISTS idx_crm_subscribers_email ON crm_email_subscribers (email);

        CREATE TABLE IF NOT EXISTS crm_email_blasts (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(100) NOT NULL,
          list_id VARCHAR(64),
          title VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          preview_text VARCHAR(255),
          content_html TEXT NOT NULL,
          sender_name VARCHAR(150),
          sender_email VARCHAR(150),
          status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
          scheduled_at TIMESTAMPTZ,
          sent_at TIMESTAMPTZ,
          total_recipients INT DEFAULT 0,
          sent_count INT DEFAULT 0,
          open_count INT DEFAULT 0,
          click_count INT DEFAULT 0,
          bounce_count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_crm_blasts_tenant ON crm_email_blasts (tenant_slug);
        CREATE INDEX IF NOT EXISTS idx_crm_blasts_status ON crm_email_blasts (status);

        CREATE TABLE IF NOT EXISTS crm_activities (
          id VARCHAR(64) PRIMARY KEY,
          tenant_slug VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL DEFAULT 'CALL',
          title VARCHAR(255) NOT NULL,
          company VARCHAR(255) NOT NULL,
          rep VARCHAR(100),
          date_time VARCHAR(100),
          status VARCHAR(30) DEFAULT 'UPCOMING',
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_crm_activities_tenant ON crm_activities (tenant_slug);

        -- CRM Schema Enhancements & Safe Migrations
        ALTER TABLE crm_deals ADD COLUMN IF NOT EXISTS account_id VARCHAR(64);
        ALTER TABLE crm_deals ADD COLUMN IF NOT EXISTS lead_id VARCHAR(64);
        CREATE INDEX IF NOT EXISTS idx_crm_deals_account ON crm_deals (account_id);
        CREATE INDEX IF NOT EXISTS idx_crm_deals_lead ON crm_deals (lead_id);

        ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS converted_deal_id VARCHAR(64);
        ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

        ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS deal_id VARCHAR(64);
        ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS account_id VARCHAR(64);
        ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS lead_id VARCHAR(64);
        ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
        ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
        CREATE INDEX IF NOT EXISTS idx_crm_activities_deal ON crm_activities (deal_id);
        CREATE INDEX IF NOT EXISTS idx_crm_activities_status ON crm_activities (status);

        CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_subscribers_unique ON crm_email_subscribers (tenant_slug, list_id, email);
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

    // Map legacy '?' placeholders to PostgreSQL '$1, $2, ...'
    let paramIdx = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIdx++}`);

    const res = await db.query(pgSql, params);
    return (res.rows as unknown) as T;
  } catch (err) {
    console.warn("⚠️ Neon PostgreSQL query execution failed, falling back to memory:", err);
    return null;
  }
}
