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

      // 3. Blog CMS tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS "BlogCategory" (
          "id" VARCHAR(191) PRIMARY KEY,
          "name" VARCHAR(191) NOT NULL UNIQUE,
          "slug" VARCHAR(191) NOT NULL UNIQUE,
          "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "BlogTag" (
          "id" VARCHAR(191) PRIMARY KEY,
          "name" VARCHAR(191) NOT NULL UNIQUE,
          "slug" VARCHAR(191) NOT NULL UNIQUE,
          "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "BlogPost" (
          "id" VARCHAR(191) PRIMARY KEY,
          "title" VARCHAR(255) NOT NULL,
          "slug" VARCHAR(255) NOT NULL UNIQUE,
          "excerpt" TEXT,
          "content" TEXT NOT NULL,
          "cover_image" TEXT,
          "category_id" VARCHAR(191),
          "tags" VARCHAR(255),
          "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
          "author_id" VARCHAR(191),
          "author_name" VARCHAR(191) DEFAULT 'Ofia Editorial Team',
          "published_at" TIMESTAMPTZ,
          "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "BlogComment" (
          "id" VARCHAR(191) PRIMARY KEY,
          "post_id" VARCHAR(191) NOT NULL,
          "user_name" VARCHAR(191) NOT NULL,
          "email" VARCHAR(191),
          "content" TEXT NOT NULL,
          "parent_id" VARCHAR(191),
          "status" VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
          "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "BlogSubscriber" (
          "id" VARCHAR(191) PRIMARY KEY,
          "email" VARCHAR(191) NOT NULL UNIQUE,
          "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
          "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_blog_post_slug ON "BlogPost"("slug");
        CREATE INDEX IF NOT EXISTS idx_blog_post_status ON "BlogPost"("status");
      `);

      // Seed default categories and posts if empty
      const catCheck = await client.query('SELECT COUNT(*) as count FROM "BlogCategory"');
      if (parseInt(catCheck.rows[0]?.count || '0') === 0) {
        await client.query(`
          INSERT INTO "BlogCategory" ("id", "name", "slug") VALUES
          ('cat-eco-01', 'Ecosystem & AI', 'ecosystem-and-ai'),
          ('cat-ret-02', 'Retail & Commerce', 'retail-and-commerce'),
          ('cat-log-03', 'Fleet & Logistics', 'fleet-and-logistics'),
          ('cat-upd-04', 'Platform Updates', 'platform-updates')
          ON CONFLICT DO NOTHING;
        `);
      }

      const postCheck = await client.query('SELECT COUNT(*) as count FROM "BlogPost"');
      if (parseInt(postCheck.rows[0]?.count || '0') === 0) {
        await client.query(`
          INSERT INTO "BlogPost" ("id", "title", "slug", "excerpt", "content", "cover_image", "category_id", "tags", "status", "author_name", "published_at") VALUES
          ('post-seed-01', 'Unveiling Ofia: Autonomous AI Swarms & Next-Gen African Commerce', 'unveiling-ofia-autonomous-ai-swarms', 'How Ofia is transforming enterprise commerce in Nigeria through autonomous lead qualification, real-time escrow, and intelligent multi-tenant workflows.', '<h2>The Future of African Commerce Has Arrived</h2><p>Today marks a major milestone as Ofia officially unveils our unified suite of enterprise tools built specifically for fast-growing businesses across Nigeria and West Africa.</p><p>From high-volume logistics and distributed point-of-sale systems to autonomous AI agents driving customer acquisition, the Ofia platform removes friction at every step of modern trade.</p><h3>Why Autonomous AI Matters for Emerging Markets</h3><p>Traditional CRM tools require endless manual data entry and disjointed communication channels. In high-velocity commercial environments like Lagos, Kano, and Port Harcourt, deals move rapidly across WhatsApp, direct calls, and store visits.</p><p>Our AI Swarm continuously monitors lead inquiries, automates customer follow-ups, and integrates directly with live inventory and escrow payouts.</p>', 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png', 'cat-eco-01', 'AI, Innovation, Ecosystem', 'PUBLISHED', 'Adeyemi Phillips', NOW()),
          ('post-seed-02', 'How Ofia Compass Bridges Offline Merchants with Escrow Commerce', 'how-ofia-compass-bridges-offline-merchants', 'Empowering brick-and-mortar retailers with digital storefronts, verified technician dispatch, and dispute-free escrow payments.', '<h2>Modernizing the Retail Storefront</h2><p>Thousands of trade merchants across computer villages and open markets rely on word-of-mouth and cash payments. Ofia Compass bridges this gap by providing instantly provisioned custom storefronts backed by verified merchant badges.</p><p>With built-in escrow, buyers across different states can transact confidently knowing their funds are protected until verified delivery.</p>', 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/aa9nvrmyrc38lbpz1mkp.png', 'cat-ret-02', 'Commerce, Escrow, Merchants', 'PUBLISHED', 'Ofia Editorial Team', NOW()),
          ('post-seed-03', 'Real-Time Fleet Dispatch: Scaling Nationwide Last-Mile Logistics', 'real-time-fleet-dispatch-last-mile-logistics', 'Inside Ofia dispatch engine: how automated waybills, rider rating indicators, and smart batching eliminate logistics bottlenecks.', '<h2>Reliable Logistics is the Backbone of Trade</h2><p>Every commercial ecosystem succeeds or stumbles based on its logistics backbone. With the launch of our updated mobile rider and customer tracking applications, Ofia Logistics now offers automated rider dispatch and proof-of-delivery.</p><p>Merchants can track shipments across state corridors with complete transparency, minimizing transit delays and eliminating lost parcels.</p>', 'https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg', 'cat-log-03', 'Logistics, Dispatch, Riders', 'PUBLISHED', 'Ibrahim Musa', NOW())
          ON CONFLICT DO NOTHING;
        `);
      }

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
