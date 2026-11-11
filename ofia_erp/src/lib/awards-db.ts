/**
 * Multi-Tenant Awards Database Schema Initializer
 * Guarantees that any tenant database automatically has all 8 award tables created.
 */
const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS award_events (
    id VARCHAR(100) PRIMARY KEY,
    tenant_slug VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    banner_url TEXT,
    award_year INT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    is_anonymous BOOLEAN DEFAULT TRUE,
    allow_vote_editing BOOLEAN DEFAULT FALSE,
    is_public_visible BOOLEAN DEFAULT TRUE,
    public_slug VARCHAR(255) NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS award_categories (
    id VARCHAR(100) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    criteria TEXT,
    icon_name VARCHAR(100) DEFAULT 'Award',
    image_url TEXT,
    max_winners INT DEFAULT 1,
    min_selections INT DEFAULT 1,
    sort_order INT DEFAULT 0,
    eligible_departments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS award_nominees (
    id VARCHAR(100) PRIMARY KEY,
    category_id VARCHAR(100) NOT NULL,
    event_id VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    employee_id VARCHAR(100) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    designation VARCHAR(255),
    avatar_url TEXT,
    nomination_pitch TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_nominees_cat_emp UNIQUE (category_id, employee_id)
  )`,

  `CREATE TABLE IF NOT EXISTS award_ballots (
    id VARCHAR(100) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    employee_id VARCHAR(100) NOT NULL,
    receipt_hash VARCHAR(255) NOT NULL,
    is_sealed BOOLEAN DEFAULT TRUE,
    categories_voted_count INT DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_ballots_event_emp UNIQUE (event_id, employee_id)
  )`,

  `CREATE TABLE IF NOT EXISTS award_votes (
    id VARCHAR(100) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    category_id VARCHAR(100) NOT NULL,
    nominee_id VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    ballot_hash VARCHAR(255) NOT NULL,
    cast_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_votes_cat_ballot UNIQUE (category_id, ballot_hash)
  )`,

  `CREATE TABLE IF NOT EXISTS award_results (
    id VARCHAR(100) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    category_id VARCHAR(100) NOT NULL,
    nominee_id VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    total_votes INT DEFAULT 0,
    vote_percentage DOUBLE PRECISION DEFAULT 0,
    rank INT DEFAULT 1,
    is_winner BOOLEAN DEFAULT FALSE,
    finalized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_award_results_cat_nom UNIQUE (category_id, nominee_id)
  )`,

  `CREATE TABLE IF NOT EXISTS award_winners (
    id VARCHAR(100) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    category_id VARCHAR(100) NOT NULL,
    nominee_id VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    employee_id VARCHAR(100) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    designation VARCHAR(255),
    avatar_url TEXT,
    rank INT DEFAULT 1,
    total_votes_received INT DEFAULT 0,
    citation TEXT,
    certificate_number VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS award_audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    tenant_slug VARCHAR(100) NOT NULL,
    actor_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`
];

const migratedTenantDbs = new Set<string>();

export async function ensureAwardTables(sql: any, tenantSlug: string = "default") {
  if (migratedTenantDbs.has(tenantSlug)) {
    return;
  }
  for (const ddl of DDL_STATEMENTS) {
    try {
      if (typeof sql.query === "function") {
        await sql.query(ddl);
      } else {
        await sql([ddl] as any);
      }
    } catch (err: any) {
      // Ignore if table/constraint already exists
    }
  }
  migratedTenantDbs.add(tenantSlug);
}
