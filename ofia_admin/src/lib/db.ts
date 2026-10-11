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
          ('post-seed-01', 'Unveiling Ofia: Autonomous AI Swarms & Next-Gen African Commerce', 'unveiling-ofia-autonomous-ai-swarms', 'How Ofia is transforming enterprise commerce in Nigeria through autonomous lead qualification, real-time escrow, and intelligent multi-tenant workflows.', '<h2>The Future of African Commerce Has Arrived</h2><p>Today marks a major milestone as Ofia officially unveils our unified suite of enterprise tools built specifically for fast-growing businesses across Nigeria and West Africa.</p><p>From high-volume logistics and distributed point-of-sale systems to autonomous AI agents driving customer acquisition, the Ofia platform removes friction at every step of modern trade.</p><h3>Why Autonomous AI Matters for Emerging Markets</h3><p>Traditional CRM tools require endless manual data entry and disjointed communication channels. In high-velocity commercial environments like Lagos, Kano, and Port Harcourt, deals move rapidly across WhatsApp, direct calls, and store visits.</p><p>Our AI Swarm continuously monitors lead inquiries, automates customer follow-ups, and integrates directly with live inventory and escrow payouts.</p>', 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png', 'cat-eco-01', 'AI, Innovation, Ecosystem', 'PUBLISHED', 'Grace Jude', NOW()),
          ('post-seed-02', 'How Ofia Compass Bridges Offline Merchants with Escrow Commerce', 'how-ofia-compass-bridges-offline-merchants', 'Empowering brick-and-mortar retailers with digital storefronts, verified technician dispatch, and dispute-free escrow payments.', '<h2>Modernizing the Retail Storefront</h2><p>Thousands of trade merchants across computer villages and open markets rely on word-of-mouth and cash payments. Ofia Compass bridges this gap by providing instantly provisioned custom storefronts backed by verified merchant badges.</p><p>With built-in escrow, buyers across different states can transact confidently knowing their funds are protected until verified delivery.</p>', 'https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/aa9nvrmyrc38lbpz1mkp.png', 'cat-ret-02', 'Commerce, Escrow, Merchants', 'PUBLISHED', 'Ofia Editorial Team', NOW()),
          ('post-seed-03', 'Real-Time Fleet Dispatch: Scaling Nationwide Last-Mile Logistics', 'real-time-fleet-dispatch-last-mile-logistics', 'Inside Ofia dispatch engine: how automated waybills, rider rating indicators, and smart batching eliminate logistics bottlenecks.', '<h2>Reliable Logistics is the Backbone of Trade</h2><p>Every commercial ecosystem succeeds or stumbles based on its logistics backbone. With the launch of our updated mobile rider and customer tracking applications, Ofia Logistics now offers automated rider dispatch and proof-of-delivery.</p><p>Merchants can track shipments across state corridors with complete transparency, minimizing transit delays and eliminating lost parcels.</p>', 'https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg', 'cat-log-03', 'Logistics, Dispatch, Riders', 'PUBLISHED', 'Ibrahim Musa', NOW())
          ON CONFLICT DO NOTHING;
        `);
      }

      // 4. platform_settings table
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_settings (
          id VARCHAR(64) PRIMARY KEY,
          platform_name VARCHAR(150) DEFAULT 'Ofia Enterprise Cloud',
          root_domain VARCHAR(100) DEFAULT 'ofia.ng',
          support_email VARCHAR(150) DEFAULT 'support@ofia.ng',
          security_email VARCHAR(150) DEFAULT 'security@ofia.ng',
          default_currency VARCHAR(10) DEFAULT 'NGN',
          default_timezone VARCHAR(50) DEFAULT 'Africa/Lagos',
          session_timeout_hours INT DEFAULT 168,
          enforce_2fa BOOLEAN DEFAULT false,
          maintenance_mode BOOLEAN DEFAULT false,
          broadcast_banner_enabled BOOLEAN DEFAULT false,
          broadcast_banner_text TEXT DEFAULT '',
          broadcast_banner_type VARCHAR(20) DEFAULT 'info',
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        INSERT INTO platform_settings (
          id, platform_name, root_domain, support_email, security_email,
          default_currency, default_timezone, session_timeout_hours,
          enforce_2fa, maintenance_mode, broadcast_banner_enabled, broadcast_banner_text, broadcast_banner_type, updated_at
        ) VALUES (
          'global_root', 'Ofia Enterprise Cloud', 'ofia.ng', 'support@ofia.ng', 'security@ofia.ng',
          'NGN', 'Africa/Lagos', 168, false, false, false, '', 'info', NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      `);

      // 5. Support System Tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(100),
          user_full_name VARCHAR(150) NOT NULL,
          user_email VARCHAR(150),
          assigned_to VARCHAR(150),
          subject VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'open',
          priority VARCHAR(50) DEFAULT 'normal',
          app_module VARCHAR(100) DEFAULT 'Platform',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS support_ticket_messages (
          id VARCHAR(64) PRIMARY KEY,
          ticket_id VARCHAR(64) NOT NULL,
          sender_id VARCHAR(100),
          sender_name VARCHAR(150) NOT NULL,
          sender_role VARCHAR(50) DEFAULT 'customer',
          sender_type VARCHAR(50) DEFAULT 'customer',
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS support_kb_categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(150) NOT NULL UNIQUE,
          slug VARCHAR(150) NOT NULL UNIQUE,
          icon VARCHAR(50) DEFAULT 'BookOpen',
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS support_kb_articles (
          id VARCHAR(64) PRIMARY KEY,
          category_id VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          excerpt TEXT,
          content TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'published',
          views INT DEFAULT 0,
          helpful_count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS support_chat_sessions (
          id VARCHAR(64) PRIMARY KEY,
          user_name VARCHAR(150) NOT NULL,
          user_email VARCHAR(150),
          status VARCHAR(50) DEFAULT 'active',
          last_message TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS support_chat_messages (
          id VARCHAR(64) PRIMARY KEY,
          session_id VARCHAR(64) NOT NULL,
          sender VARCHAR(150) NOT NULL,
          text TEXT NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS support_staff_status (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL UNIQUE,
          is_active BOOLEAN DEFAULT true,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);
        CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets (assigned_to);
        CREATE INDEX IF NOT EXISTS idx_support_ticket_msgs_ticket ON support_ticket_messages (ticket_id);
        CREATE INDEX IF NOT EXISTS idx_support_kb_arts_cat ON support_kb_articles (category_id);
        CREATE INDEX IF NOT EXISTS idx_support_chat_msgs_session ON support_chat_messages (session_id);
      `);

      // Seed default Support KB Categories if empty
      const kbCatCheck = await client.query('SELECT COUNT(*) as count FROM support_kb_categories');
      if (parseInt(kbCatCheck.rows[0]?.count || '0') === 0) {
        await client.query(`
          INSERT INTO support_kb_categories (id, name, slug, description) VALUES
          ('cat-1', 'Storefronts & DNS', 'storefronts', 'Custom domains, edge SSL certs, and storefront provisioning.'),
          ('cat-2', 'ERP & Accounting', 'erp-accounting', 'General ledger, 7.5% FIRS VAT schedules, and automated payroll.'),
          ('cat-3', 'Mobility & Transit OS', 'mobility', 'Flota Coach intercity manifests, route scheduling, and terminal POS.'),
          ('cat-4', 'Autonomous AI Swarm', 'ai-swarm', 'Inbound WhatsApp customer swarms, lead qualification, and automated escalation.'),
          ('cat-5', 'Logistics & Dispatch', 'logistics', 'Rider dispatch, GIGL/Feather courier waybills, and proof-of-delivery.')
          ON CONFLICT DO NOTHING;
        `);
      }

      // Seed default Support KB Articles if empty
      const kbArtCheck = await client.query('SELECT COUNT(*) as count FROM support_kb_articles');
      if (parseInt(kbArtCheck.rows[0]?.count || '0') === 0) {
        await client.query(`
          INSERT INTO support_kb_articles (id, category_id, title, slug, excerpt, content, status) VALUES
          ('art-1', 'cat-1', 'Configuring Custom Apex Domains (.ng / .com) on Ofia Storefronts', 'configuring-custom-apex-domains-ofia', 'Step-by-step instructions for pointing CNAME and A records to the African Edge proxy.', '# Configuring Custom Apex Domains on Ofia Storefronts\n\n1. Log into your domain registrar (e.g., Whogohost, Namecheap, Cloudflare).\n2. Create an **A Record** pointing to \`185.199.108.153\`.\n3. Create a **CNAME Record** with host \`www\` pointing to \`cname.ofia.shop\`.\n4. Wait 15-30 minutes for DNS propagation across Nigerian ISPs.\n5. In Ofia Admin, verify that the edge certificate status reports "Active".', 'published'),
          ('art-2', 'cat-2', 'Reconciling 7.5% Nigerian FIRS VAT in General Ledger', 'reconciling-nigerian-firs-vat-general-ledger', 'How sales tax output logs and withholding tax entries automatically map to the general journal.', '# Nigerian FIRS VAT Reconciliation Guide\n\nEvery taxable inventory item sold through Ofia Storefronts or POS records an automated output VAT entry (7.5%) in Account #2200 (VAT Payable).\n\n### Exporting FIRS Compliant Schedules:\n- Navigate to Accounting Cockpit > Tax Schedules\n- Select Monthly Tax Filing Period\n- Click "Generate FIRS e-Schedule" to download the tax remittance schedule.', 'published'),
          ('art-3', 'cat-3', 'Flota Intercity Coach Passenger Manifests & Seat Assignment', 'flota-coach-passenger-manifests-seat-assignment', 'Managing boarding manifests, bus conductor check-in QR codes, and emergency manifest dispatch.', '# Flota Intercity Coach Passenger Manifests\n\n1. Open Mobility > Route Schedules and select the active bus departure.\n2. Inbound seat bookings automatically assign seats according to coach tier.\n3. Print or sync digital manifest to conductor handheld scanner.\n4. Emergency contact lists are backed up to secure cloud storage before departure.', 'published'),
          ('art-4', 'cat-4', 'Autonomous Lead Re-engagement Swarm: Best Practices for WhatsApp', 'autonomous-lead-reengagement-swarm-whatsapp', 'Configuring safety boundaries, prompt engineering, and human-in-the-loop action approval desks.', '# Autonomous AI Swarm Best Practices\n\nConfigure custom tone and qualification guidelines:\n- Set max discount threshold to prevent unauthorized promo code issuance.\n- Enable Human-in-the-Loop for deals exceeding ₦500,000.\n- Sync completed lead conversions directly into Ofia CRM Pipeline.', 'published')
          ON CONFLICT DO NOTHING;
        `);
      }

      // Seed default Tickets if empty
      const ticketCheck = await client.query('SELECT COUNT(*) as count FROM support_tickets');
      if (parseInt(ticketCheck.rows[0]?.count || '0') === 0) {
        await client.query(`
          INSERT INTO support_tickets (id, user_id, user_full_name, user_email, assigned_to, subject, category, message, status, priority, app_module, created_at, updated_at) VALUES
          ('t-101', 'usr-101', 'Chukwudi auto parts', 'chukwudi@autoparts.ng', 'support@ofia.ng', 'Storefront custom domain DNS verification delayed', 'Storefronts', 'We pointed our CNAME to ofia.shop 4 hours ago but SSL cert is still showing provisioning.', 'open', 'high', 'Storefront', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '20 minutes'),
          ('t-102', 'usr-102', 'Lekki Luxury Hub', 'contact@lekkiluxury.ng', NULL, 'Inter-state courier waybill dispatch error on GIGL', 'Logistics', 'Waybill generation failed with 502 Bad Gateway during evening parcel batching.', 'open', 'normal', 'Logistics', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
          ('t-103', 'usr-103', 'Ikeja Digital Supermart', 'pos@ikejasmart.ng', 'support@ofia.ng', 'POS Terminal shift balance difference mediation', 'ERP & POS', 'Shift report shows ₦15,000 variance between offline cash log and electronic ledger.', 'in-progress', 'high', 'ERP & POS', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 hour'),
          ('t-104', 'usr-104', 'Kano Express Transit', 'ops@kanoexpress.ng', 'support@ofia.ng', 'Passenger seat allocation conflict on Flota Coach', 'Mobility', 'Two passengers booked Seat 14A on Lagos-Abuja transit line via different channels.', 'resolved', 'normal', 'Mobility', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '3 hours'),
          ('t-105', 'usr-105', 'Enugu Agro Mills', 'info@enuguagro.ng', NULL, 'Autonomous AI Swarm WhatsApp session disconnect alert', 'AI Swarm', 'QR code re-authentication needed after meta session expiration on inbound order desk.', 'open', 'urgent', 'AI Swarm', NOW() - INTERVAL '16 hours', NOW() - INTERVAL '16 hours')
          ON CONFLICT DO NOTHING;
        `);

        // Seed messages for ticket t-101
        await client.query(`
          INSERT INTO support_ticket_messages (id, ticket_id, sender_id, sender_name, sender_role, sender_type, message, created_at) VALUES
          ('msg-101-1', 't-101', 'usr-101', 'Chukwudi auto parts', 'customer', 'customer', 'Hello team, we added the CNAME record for chukwudi-autoparts.ofia.shop on Cloudflare 4 hours ago, but the custom domain shows ''SSL Pending'' on the storefront dashboard.', NOW() - INTERVAL '45 minutes'),
          ('msg-101-2', 't-101', 'admin-support-04', 'Support & Editorial Lead', 'staff', 'staff', 'Hi Chukwudi! Thank you for reaching out. We have initiated an edge SSL validation probe. Let''s verify if DNS propagation has completed across Lagos and MTN/Airtel network caches.', NOW() - INTERVAL '20 minutes')
          ON CONFLICT DO NOTHING;
        `);
      }

      // Seed default Staff Status if empty
      await client.query(`
        INSERT INTO support_staff_status (id, user_id, is_active, updated_at) VALUES
        ('status-support-04', 'admin-support-04', true, NOW()),
        ('status-default', 'support@ofia.ng', true, NOW())
        ON CONFLICT (user_id) DO NOTHING;
      `);

      // Seed default Chat Sessions & Messages if empty
      const chatCheck = await client.query('SELECT COUNT(*) as count FROM support_chat_sessions');
      if (parseInt(chatCheck.rows[0]?.count || '0') === 0) {
        await client.query(`
          INSERT INTO support_chat_sessions (id, user_name, user_email, status, last_message, created_at, updated_at) VALUES
          ('sess-demo-01', 'Visitor 8492 (Lagos)', 'visitor8492@gmail.com', 'active', 'How do I connect my Flutter app to the Flota dispatch fleet API?', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '2 minutes'),
          ('sess-demo-02', 'Visitor 1024 (Abuja)', 'visitor1024@yahoo.com', 'active', 'Can I accept card installments without paying Paystack developer setup fees?', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '15 minutes')
          ON CONFLICT DO NOTHING;

          INSERT INTO support_chat_messages (id, session_id, sender, text, timestamp) VALUES
          ('cmsg-1', 'sess-demo-01', 'Visitor 8492 (Lagos)', 'How do I connect my Flutter app to the Flota dispatch fleet API?', NOW() - INTERVAL '15 minutes'),
          ('cmsg-2', 'sess-demo-01', 'Support Lead', 'Hello! You can use our REST endpoint /api/v1/mobility/fleet with your API key from the developer portal.', NOW() - INTERVAL '10 minutes'),
          ('cmsg-3', 'sess-demo-01', 'Visitor 8492 (Lagos)', 'Awesome! Is there a sample Flutter package available?', NOW() - INTERVAL '2 minutes'),
          ('cmsg-4', 'sess-demo-02', 'Visitor 1024 (Abuja)', 'Can I accept card installments without paying Paystack developer setup fees?', NOW() - INTERVAL '15 minutes')
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
