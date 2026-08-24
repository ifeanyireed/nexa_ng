-- ==============================================================================
-- MIGRATION 004: SubscriptionPlan Table & Live Blueprint Pricing Seeds (Divided by 50)
-- Target Database: u721451974_nexa_db (MySQL / MariaDB)
-- Microservice: user-subscription-service (:8081)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `SubscriptionPlan` (
    `id` VARCHAR(191) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `category_label` VARCHAR(100) NOT NULL,
    `tier` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price_ngn` DOUBLE NOT NULL,
    `price_usd` DOUBLE NOT NULL DEFAULT 0,
    `period` VARCHAR(50) NOT NULL DEFAULT 'Monthly',
    `badge` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `leads_limit` INT NOT NULL DEFAULT 1000,
    `campaigns_limit` INT NOT NULL DEFAULT 3,
    `team_seats` INT NOT NULL DEFAULT 5,
    `tokens_limit` BIGINT NOT NULL DEFAULT 0,
    `storefronts_limit` INT NOT NULL DEFAULT 0,
    `features_json` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `idx_plan_category` (`category`),
    INDEX `idx_plan_tier` (`tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- SEED / UPSERT LIVE SUBSCRIPTION PLAN BLUEPRINTS (DIVIDED BY 50)
-- ------------------------------------------------------------------------------

-- 1. OFIA AI
INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-ai-pilot', 'OFIA_AI', 'Ofia AI', 'FREE_TRIAL', 'Ofia AI Pilot', 0, 0, '14 Days', '14-Day Pilot',
    'Sandbox for testing autonomous AI SDR agents and lead discovery.',
    250, 1, 2, 250000, 0,
    '["1 Autonomous AI Outreach Agent","250 Verified Enrichment Leads","250k Monthly AI Tokens Quota","Email Discovery Channel"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `description` = VALUES(`description`),
    `leads_limit` = VALUES(`leads_limit`),
    `campaigns_limit` = VALUES(`campaigns_limit`),
    `team_seats` = VALUES(`team_seats`),
    `tokens_limit` = VALUES(`tokens_limit`),
    `updated_at` = NOW(3);

INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-ai-growth', 'OFIA_AI', 'Ofia AI', 'STARTER', 'Ofia AI Growth Swarm', 13000, 10, 'Monthly', 'Most Popular AI',
    'Autonomous GTM swarm for multi-channel sales and WhatsApp agents.',
    5000, 5, 5, 10000000, 0,
    '["5 Autonomous AI Swarm Agents","5,000 Verified Enrichment Leads / mo","10M Monthly AI Tokens Quota","Email + WhatsApp SDR Pipelines","BYOK OpenAI & Anthropic"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `description` = VALUES(`description`),
    `leads_limit` = VALUES(`leads_limit`),
    `campaigns_limit` = VALUES(`campaigns_limit`),
    `team_seats` = VALUES(`team_seats`),
    `tokens_limit` = VALUES(`tokens_limit`),
    `updated_at` = NOW(3);

INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-ai-scale', 'OFIA_AI', 'Ofia AI', 'GROWTH', 'Ofia AI Autonomous Scale', 36000, 25, 'Monthly', 'High Velocity AI',
    'Enterprise swarm intelligence for high-velocity revenue generation.',
    25000, 20, 15, 50000000, 0,
    '["20 Autonomous Swarm Agents","25,000 Verified Leads / mo","50M Monthly AI Tokens Quota","LinkedIn + Meta Ads + Voice AI SDRs","Custom Brand Tone Fine-Tuning"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `description` = VALUES(`description`),
    `leads_limit` = VALUES(`leads_limit`),
    `campaigns_limit` = VALUES(`campaigns_limit`),
    `team_seats` = VALUES(`team_seats`),
    `tokens_limit` = VALUES(`tokens_limit`),
    `updated_at` = NOW(3);

INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-ai-sovereign', 'OFIA_AI', 'Ofia AI', 'ENTERPRISE', 'Ofia AI Sovereign Cluster', 70000, 50, 'Monthly', 'Dedicated AI',
    'Dedicated GPU clusters, unlimited AI agents, and private vector storage.',
    100000, 100, 50, 200000000, 0,
    '["Unlimited Autonomous AI Swarms","100,000 Verified Leads / mo","200M Monthly AI Tokens Quota","Dedicated Inference GPU Cluster","Private Vector Database & RAG"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `description` = VALUES(`description`),
    `leads_limit` = VALUES(`leads_limit`),
    `campaigns_limit` = VALUES(`campaigns_limit`),
    `team_seats` = VALUES(`team_seats`),
    `tokens_limit` = VALUES(`tokens_limit`),
    `updated_at` = NOW(3);

-- 2. OFIA SHOP
INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-shop-starter', 'OFIA_SHOP', 'Ofia Shop', 'STARTER', 'Ofia Shop Starter', 3000, 2, 'Monthly', 'Fast Launch',
    'Deploy branded storefront on slug.ofia.shop with POS checkout.',
    500, 1, 2, 0, 1,
    '["1 Custom Storefront on slug.ofia.shop","Up to 100 Products Listed","Integrated POS Terminal Checkout","Automated Paystack Payment Gateway","Standard Customer Support"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `storefronts_limit` = VALUES(`storefronts_limit`),
    `updated_at` = NOW(3);

INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-shop-pro', 'OFIA_SHOP', 'Ofia Shop', 'GROWTH', 'Ofia Shop Merchant Pro', 9000, 6, 'Monthly', 'Commerce Scale',
    'Custom domain connection, multi-branch POS, and logistics courier dispatch.',
    2000, 5, 10, 0, 3,
    '["Custom Domain Connection + Wildcard","3 Storefront Subdomains","Multi-Branch POS Terminal Checkout","Automated Courier & Rider Dispatch","Inventory Sync (IMS Integration)"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `storefronts_limit` = VALUES(`storefronts_limit`),
    `updated_at` = NOW(3);

INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-shop-empire', 'OFIA_SHOP', 'Ofia Shop', 'SCALE', 'Ofia Shop Multi-Brand Empire', 24000, 16, 'Monthly', 'Multi-Vendor',
    'Multi-storefront empire architecture with automated warehouse fulfillment.',
    10000, 15, 25, 0, 10,
    '["10 Custom Storefront Subdomains","Multi-Vendor Sub-Account Routing","Automated Warehouse Fulfillment","Zero Commission Surcharge (0%)","24/7 Dedicated Support"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `storefronts_limit` = VALUES(`storefronts_limit`),
    `updated_at` = NOW(3);

-- 3. OFIA ENTERPRISE SUITE
INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-ent-core', 'OFIA_ENTERPRISE', 'Ofia Enterprise Suite', 'GROWTH', 'Enterprise Core ERP', 24000, 16, 'Monthly', 'Core Operations',
    'Full back-office ERP suite: CRM, Financial Accounting, IMS, and HR.',
    5000, 10, 15, 0, 0,
    '["All 8 Core ERP Modules","Multi-Warehouse Inventory Control (IMS)","Double-Entry Financial Accounting","HRM Payroll & Attendance Logs","15 Concurrent User Seats"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `updated_at` = NOW(3);

INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-ent-omni', 'OFIA_ENTERPRISE', 'Ofia Enterprise Suite', 'SCALE', 'Enterprise Omni-Suite', 48000, 32, 'Monthly', 'Full Ecosystem',
    'Complete unified ecosystem: Full ERP Suite + Ofia Shop Storefronts + AI Swarms.',
    20000, 25, 30, 0, 0,
    '["Full ERP + Shop Storefronts + AI Swarms","30 Concurrent User Seats","20,000 Leads Pipeline / month","Custom Role-Based RBAC Permissions","Integrated Fleet & Dispatch Logistics"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `updated_at` = NOW(3);

INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-ent-sovereign', 'OFIA_ENTERPRISE', 'Ofia Enterprise Suite', 'ENTERPRISE', 'Enterprise Sovereign SLA', 100000, 65, 'Monthly', 'Dedicated Cloud',
    'Maximum throughput, dedicated cloud infrastructure, and 24/7 SLA.',
    50000, 100, 999, 0, 0,
    '["Dedicated MySQL & Redis Instances","99.99% Guaranteed SLA Uptime","Unlimited Seats & Workspaces","Custom Enterprise ERP Integrations","Dedicated Strategic Technical Lead"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `updated_at` = NOW(3);

-- 4. OFIA COMPASS
INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-compass-starter', 'OFIA_COMPASS', 'Ofia Compass', 'STARTER', 'Ofia Compass Essentials', 7000, 5, 'Monthly', 'Executive Radar',
    'Real-time executive dashboards, anomaly tracking, and automated revenue digests.',
    1000, 2, 3, 0, 0,
    '["Real-Time Executive KPI Dashboard","Automated Revenue & Churn Forecasts","Weekly AI Market Digest Reports","3 Executive / Leadership Seats"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `updated_at` = NOW(3);

INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-compass-pro', 'OFIA_COMPASS', 'Ofia Compass', 'GROWTH', 'Ofia Compass Strategic Pro', 19000, 13, 'Monthly', 'Predictive BI',
    'Cross-organization predictive analytics, anomaly alerts, and market trend radar.',
    5000, 10, 10, 0, 0,
    '["Cross-Channel Market Trend Radar","Automated Anomaly Detection & Alerts","Predictive Cash Flow & Supply Models","10 Executive Decision-Maker Seats","Custom Dashboard Metrics Builder"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `updated_at` = NOW(3);

INSERT INTO `SubscriptionPlan` (
    `id`, `category`, `category_label`, `tier`, `name`, `price_ngn`, `price_usd`, `period`, `badge`, `description`,
    `leads_limit`, `campaigns_limit`, `team_seats`, `tokens_limit`, `storefronts_limit`, `features_json`, `is_active`, `created_at`, `updated_at`
) VALUES
(
    'ofia-compass-sovereign', 'OFIA_COMPASS', 'Ofia Compass', 'ENTERPRISE', 'Ofia Compass Sovereign Radar', 50000, 33, 'Monthly', 'Boardroom Intelligence',
    'Boardroom-ready automated presentations, strategic benchmarking, and dedicated BI analysts.',
    25000, 50, 50, 0, 0,
    '["Board-Ready Automated Strategic Decks","Industry Competitor Benchmarking Radar","Dedicated Strategic BI Data Analyst","Unlimited Executive & Board Seats","24/7 Strategic Alert Notification"]',
    1, NOW(3), NOW(3)
) ON DUPLICATE KEY UPDATE
    `price_ngn` = VALUES(`price_ngn`),
    `period` = VALUES(`period`),
    `updated_at` = NOW(3);
