-- ==============================================================================
-- MIGRATION 018: Employee Awards & Recognition Voting Engine Schema
-- Target Database: Neon PostgreSQL / Lakebase
-- Multi-Tenant Isolation: Strictly partitioned by tenant_slug with composite indexes
-- Submodule: HR & Appraisals / Employee Self-Service Recognition
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AWARDS EVENT CONFIGURATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS award_events (
    id VARCHAR(64) PRIMARY KEY,
    tenant_slug VARCHAR(191) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    description TEXT DEFAULT '',
    banner_url TEXT DEFAULT '',
    award_year INT NOT NULL DEFAULT 2026,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'FINALIZED', 'PUBLISHED'
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    allow_vote_editing BOOLEAN NOT NULL DEFAULT FALSE,
    is_public_visible BOOLEAN NOT NULL DEFAULT FALSE,
    public_slug VARCHAR(191) DEFAULT '',
    created_by VARCHAR(191) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_events_tenant_slug UNIQUE (tenant_slug, slug)
);

CREATE INDEX IF NOT EXISTS idx_award_events_tenant ON award_events(LOWER(tenant_slug));
CREATE INDEX IF NOT EXISTS idx_award_events_status ON award_events(LOWER(tenant_slug), status);
CREATE INDEX IF NOT EXISTS idx_award_events_year ON award_events(LOWER(tenant_slug), award_year);
CREATE INDEX IF NOT EXISTS idx_award_events_public ON award_events(public_slug) WHERE is_public_visible = TRUE;

-- ------------------------------------------------------------------------------
-- 2. AWARD CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS award_categories (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL REFERENCES award_events(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(191) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(191) NOT NULL,
    description TEXT DEFAULT '',
    criteria TEXT DEFAULT '',
    icon_name VARCHAR(50) DEFAULT 'Award',
    image_url TEXT DEFAULT '',
    max_winners INT NOT NULL DEFAULT 1,
    min_selections INT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    eligible_departments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_categories_event_slug UNIQUE (event_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_award_categories_event ON award_categories(event_id, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_award_categories_tenant ON award_categories(LOWER(tenant_slug));

-- ------------------------------------------------------------------------------
-- 3. AWARD NOMINEES (Linked to ERP Employee Database)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS award_nominees (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
    event_id VARCHAR(64) NOT NULL REFERENCES award_events(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(191) NOT NULL,
    employee_id VARCHAR(191) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL DEFAULT 'General',
    designation VARCHAR(150) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    nomination_pitch TEXT DEFAULT '',
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_nominee_category_employee UNIQUE (category_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_award_nominees_cat ON award_nominees(category_id, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_award_nominees_emp ON award_nominees(employee_id);
CREATE INDEX IF NOT EXISTS idx_award_nominees_event ON award_nominees(event_id);
CREATE INDEX IF NOT EXISTS idx_award_nominees_tenant ON award_nominees(LOWER(tenant_slug));

-- ------------------------------------------------------------------------------
-- 4. AWARD ELIGIBILITY (Whitelisted / Restricted Staff)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS award_eligibility (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL REFERENCES award_events(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(191) NOT NULL,
    employee_id VARCHAR(191) NOT NULL,
    is_eligible BOOLEAN NOT NULL DEFAULT TRUE,
    ineligibility_reason TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_eligibility_event_employee UNIQUE (event_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_award_eligibility_event ON award_eligibility(event_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_award_eligibility_tenant ON award_eligibility(LOWER(tenant_slug));

-- ------------------------------------------------------------------------------
-- 5. BALLOT AUDIT HEADERS (Enforces One-Ballot-Per-Employee Without Linking Choices)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS award_ballots (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL REFERENCES award_events(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(191) NOT NULL,
    employee_id VARCHAR(191) NOT NULL,
    receipt_hash VARCHAR(255) NOT NULL,
    is_sealed BOOLEAN NOT NULL DEFAULT TRUE,
    categories_voted_count INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_ballots_event_employee UNIQUE (event_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_award_ballots_event ON award_ballots(event_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_award_ballots_tenant ON award_ballots(LOWER(tenant_slug));
CREATE INDEX IF NOT EXISTS idx_award_ballots_hash ON award_ballots(receipt_hash);

-- ------------------------------------------------------------------------------
-- 6. ANONYMIZED CATEGORY VOTES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS award_votes (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL REFERENCES award_events(id) ON DELETE CASCADE,
    category_id VARCHAR(64) NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
    nominee_id VARCHAR(64) NOT NULL REFERENCES award_nominees(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(191) NOT NULL,
    ballot_hash VARCHAR(255) NOT NULL,
    cast_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_votes_category_ballot UNIQUE (category_id, ballot_hash)
);

CREATE INDEX IF NOT EXISTS idx_award_votes_cat ON award_votes(category_id, nominee_id);
CREATE INDEX IF NOT EXISTS idx_award_votes_event ON award_votes(event_id);
CREATE INDEX IF NOT EXISTS idx_award_votes_tenant ON award_votes(LOWER(tenant_slug));

-- ------------------------------------------------------------------------------
-- 7. FINALISED RESULTS (Tally Vault)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS award_results (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL REFERENCES award_events(id) ON DELETE CASCADE,
    category_id VARCHAR(64) NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
    nominee_id VARCHAR(64) NOT NULL REFERENCES award_nominees(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(191) NOT NULL,
    total_votes INT NOT NULL DEFAULT 0,
    vote_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    rank INT NOT NULL DEFAULT 1,
    is_winner BOOLEAN NOT NULL DEFAULT FALSE,
    finalized_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_results_category_nominee UNIQUE (category_id, nominee_id)
);

CREATE INDEX IF NOT EXISTS idx_award_results_cat ON award_results(category_id, rank ASC);
CREATE INDEX IF NOT EXISTS idx_award_results_event ON award_results(event_id);

-- ------------------------------------------------------------------------------
-- 8. PUBLISHED WINNERS & HALL OF FAME
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS award_winners (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL REFERENCES award_events(id) ON DELETE CASCADE,
    category_id VARCHAR(64) NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
    nominee_id VARCHAR(64) NOT NULL REFERENCES award_nominees(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(191) NOT NULL,
    employee_id VARCHAR(191) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(150) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    rank INT NOT NULL DEFAULT 1,
    total_votes_received INT NOT NULL DEFAULT 0,
    citation TEXT DEFAULT '',
    certificate_number VARCHAR(100) DEFAULT '',
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_award_winners_event ON award_winners(event_id, rank ASC);
CREATE INDEX IF NOT EXISTS idx_award_winners_tenant ON award_winners(LOWER(tenant_slug));
CREATE INDEX IF NOT EXISTS idx_award_winners_emp ON award_winners(employee_id);

-- ------------------------------------------------------------------------------
-- 9. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS award_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES award_events(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(191) NOT NULL,
    actor_id VARCHAR(191) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_award_audit_event ON award_audit_logs(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_award_audit_tenant ON award_audit_logs(LOWER(tenant_slug));
