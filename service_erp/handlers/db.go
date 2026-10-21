package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB
var db *sql.DB

// Multi-tenant project pools cache
var (
	tenantSqlPools  sync.Map // map[string]*sql.DB
	tenantGormPools sync.Map // map[string]*gorm.DB
	poolMu          sync.Mutex

	// Dedicated tenant database projects (Project-level isolation cache - populated dynamically from tenant_infrastructures)
	tenantProjectRegistry = make(map[string]string)

	// Dedicated tenant Cloudinary storage projects cache - populated dynamically from tenant_infrastructures
	tenantStorageRegistry = make(map[string]string)
)

func RegisterTenantProject(slug string, databaseURL string, cloudinaryURL string) {
	norm := strings.ToLower(strings.TrimSpace(slug))
	if norm != "" && databaseURL != "" {
		poolMu.Lock()
		tenantProjectRegistry[norm] = databaseURL
		if cloudinaryURL != "" {
			tenantStorageRegistry[norm] = cloudinaryURL
		}
		poolMu.Unlock()
	}
}

func extractTenantSlug(r *http.Request) string {
	slug := r.Header.Get("x-tenant-slug")
	if slug == "" {
		slug = r.URL.Query().Get("tenant")
	}
	if slug == "" {
		slug = r.URL.Query().Get("tenant_slug")
	}
	if slug == "" {
		slug = r.URL.Query().Get("tenantId")
	}
	if slug == "" {
		slug = r.URL.Query().Get("tenant_id")
	}
	if slug == "" {
		slug = r.URL.Query().Get("orgId")
	}
	if slug == "" {
		host := r.Host
		if strings.Contains(host, ".") {
			parts := strings.Split(host, ".")
			sub := parts[0]
			if sub != "www" && sub != "admin" && sub != "app" && sub != "api" && sub != "localhost" &&
				!strings.Contains(host, "onrender.com") && !strings.Contains(sub, "service") && !strings.Contains(sub, "erp") {
				slug = sub
			}
		}
	}
	if slug == "" {
		slug = "neweratransports"
	}
	return strings.ToLower(strings.TrimSpace(slug))
}

func getDBForSlug(slug string) *sql.DB {
	norm := strings.ToLower(strings.TrimSpace(slug))
	if norm == "" || norm == "default" || norm == "platform" {
		return db
	}

	targetURL, ok := tenantProjectRegistry[norm]
	if !ok || targetURL == "" {
		if db != nil {
			var fetchedURL, fetchedStorage sql.NullString
			err := db.QueryRow(`
				SELECT ti.database_url, ti.cloudinary_url 
				FROM tenant_infrastructures ti
				LEFT JOIN "Organization" o ON LOWER(o.slug) = LOWER(ti.tenant_slug)
				WHERE (LOWER(ti.tenant_slug) = $1 OR LOWER(o.id::text) = $1)
				  AND ti.is_custom_db = true
				LIMIT 1`, norm).Scan(&fetchedURL, &fetchedStorage)
			if err == nil && fetchedURL.Valid && fetchedURL.String != "" {
				RegisterTenantProject(norm, fetchedURL.String, fetchedStorage.String)
				targetURL = fetchedURL.String
				ok = true
			}
		}
	}
	if !ok || targetURL == "" {
		if db != nil {
			log.Printf("ℹ️ Multi-Tenancy: No dedicated database registered for '%s', using primary database pool", norm)
			return db
		}
		log.Printf("❌ Strict Multi-Tenancy: No custom database configured for tenant '%s'. Fallback to platform database is disabled.", norm)
		return nil
	}

	if val, ok := tenantSqlPools.Load(norm); ok {
		return val.(*sql.DB)
	}

	poolMu.Lock()
	defer poolMu.Unlock()

	if val, ok := tenantSqlPools.Load(norm); ok {
		return val.(*sql.DB)
	}

	log.Printf("🐘 Initializing dedicated Neon project database pool for tenant '%s'...", norm)
	gdb, err := gorm.Open(postgres.Open(targetURL), &gorm.Config{
		PrepareStmt: true,
		Logger:      logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Printf("❌ Strict Multi-Tenancy: Failed to connect to dedicated project for tenant '%s': %v (fallback to platform DB is disabled)", norm, err)
		return nil
	}

	sDB, err := gdb.DB()
	if err != nil {
		log.Printf("❌ Strict Multi-Tenancy: Failed to get sql.DB for tenant '%s': %v (fallback to platform DB is disabled)", norm, err)
		return nil
	}

	sDB.SetMaxOpenConns(15)
	sDB.SetMaxIdleConns(5)
	sDB.SetConnMaxLifetime(15 * time.Minute)

	EnsureHRTablesOnDB(sDB)
	EnsureCRMTablesOnDB(sDB)

	tenantSqlPools.Store(norm, sDB)
	tenantGormPools.Store(norm, gdb)
	return sDB
}

func getDB(r *http.Request) *sql.DB {
	return getDBForSlug(extractTenantSlug(r))
}

func getGorm(r *http.Request) *gorm.DB {
	slug := extractTenantSlug(r)
	if slug == "" || slug == "default" || slug == "platform" {
		return DB
	}

	if val, ok := tenantGormPools.Load(slug); ok {
		return val.(*gorm.DB)
	}

	sDB := getDB(r)
	if sDB == nil {
		log.Printf("❌ Strict Multi-Tenancy: getGorm failed for tenant '%s'. Fallback to platform DB is disabled.", slug)
		return nil
	}

	if val, ok := tenantGormPools.Load(slug); ok {
		return val.(*gorm.DB)
	}

	log.Printf("❌ Strict Multi-Tenancy: getGorm could not load dedicated pool for tenant '%s'. Fallback to platform DB is disabled.", slug)
	return nil
}

func SetDB(database *sql.DB) {
	db = database
}

func SetGormDB(gormDB *gorm.DB) {
	DB = gormDB
	if gormDB != nil {
		sqlDB, err := gormDB.DB()
		if err == nil {
			db = sqlDB
			EnsureHRTables()
			EnsureQuestTables()
			EnsureCRMTables()
		}
	}
}

func EnsureQuestTables() {
	if db == nil {
		return
	}

	// 1. QuestInstance Table
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestInstance (
		id varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		name varchar(191) NOT NULL,
		slug varchar(191) NOT NULL,
		description text DEFAULT NULL,
		coverImage varchar(255) DEFAULT NULL,
		status varchar(50) NOT NULL DEFAULT 'ACTIVE',
		grandPrize varchar(100) DEFAULT '₦500,000',
		currency varchar(20) DEFAULT 'NGN',
		prizesJson text DEFAULT NULL,
		totalMaxPoints int(11) NOT NULL DEFAULT 850,
		location varchar(191) DEFAULT NULL,
		startsAt varchar(100) DEFAULT NULL,
		endsAt varchar(100) DEFAULT NULL,
		participationType varchar(50) DEFAULT 'BOTH',
		autoBalance boolean DEFAULT TRUE,
		enableStageTV boolean DEFAULT TRUE,
		allowManualAdjustments boolean DEFAULT TRUE,
		primaryColor varchar(50) DEFAULT '#1A56DB',
		accentColor varchar(50) DEFAULT '#F59E0B',
		scoringMode varchar(100) DEFAULT 'AUTOMATIC_WITH_JUDGE_OVERRIDE',
		conceptLockEnabled boolean DEFAULT TRUE,
		createdBy varchar(191) DEFAULT NULL,
		createdAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		updatedAt datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
		PRIMARY KEY (id),
		INDEX idx_quest_tenant (tenantSlug)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 1b. QuestPrize Table
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestPrize (
		id varchar(191) NOT NULL,
		questId varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		prizeRank int(11) DEFAULT NULL,
		title varchar(191) NOT NULL,
		awardType varchar(50) NOT NULL DEFAULT 'CASH',
		amount varchar(100) NOT NULL,
		description text DEFAULT NULL,
		icon varchar(50) DEFAULT '🏆',
		orderIndex int(11) NOT NULL DEFAULT 0,
		createdAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		PRIMARY KEY (id),
		INDEX idx_prize_quest (questId),
		INDEX idx_prize_tenant (tenantSlug)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 2. QuestTeam Table
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestTeam (
		id varchar(191) NOT NULL,
		questId varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		name varchar(191) NOT NULL,
		customName varchar(191) DEFAULT NULL,
		slug varchar(191) NOT NULL,
		logo varchar(100) DEFAULT '🏆',
		color varchar(50) DEFAULT '#3B82F6',
		initial varchar(10) DEFAULT 'T',
		motto varchar(255) DEFAULT NULL,
		totalPoints int(11) NOT NULL DEFAULT 0,
		teamRank int(11) NOT NULL DEFAULT 1,
		captainId varchar(191) DEFAULT NULL,
		memberCount int(11) NOT NULL DEFAULT 0,
		status varchar(50) NOT NULL DEFAULT 'ACTIVE',
		createdAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		PRIMARY KEY (id),
		INDEX idx_team_quest (questId),
		INDEX idx_team_tenant (tenantSlug)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 3. QuestParticipant Table (Foreign Key to live corporate User table)
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestParticipant (
		id varchar(191) NOT NULL,
		questId varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		teamId varchar(191) NOT NULL,
		userId varchar(191) NOT NULL,
		userName varchar(191) NOT NULL,
		userEmail varchar(191) DEFAULT NULL,
		department varchar(191) DEFAULT NULL,
		avatar varchar(255) DEFAULT '/character1.jpg',
		role varchar(50) NOT NULL DEFAULT 'member',
		status varchar(50) NOT NULL DEFAULT 'ACTIVE',
		joinedAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		PRIMARY KEY (id),
		INDEX idx_participant_quest (questId),
		INDEX idx_participant_team (teamId),
		INDEX idx_participant_user (userId)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 4. QuestChallenge Table
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestChallenge (
		id varchar(191) NOT NULL,
		questId varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		day varchar(20) NOT NULL DEFAULT 'Day 1',
		category varchar(100) NOT NULL,
		engineType varchar(50) NOT NULL,
		name varchar(191) NOT NULL,
		description text DEFAULT NULL,
		instructions text DEFAULT NULL,
		maxScore int(11) NOT NULL DEFAULT 50,
		status varchar(50) NOT NULL DEFAULT 'LOCKED',
		rubricJson text DEFAULT NULL,
		settingsJson text DEFAULT NULL,
		submissionsCount int(11) NOT NULL DEFAULT 0,
		PRIMARY KEY (id),
		INDEX idx_challenge_quest (questId)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 5. QuestConcept Table
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestConcept (
		id varchar(191) NOT NULL,
		questId varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		challengeId varchar(191) NOT NULL,
		teamId varchar(191) NOT NULL,
		title varchar(255) NOT NULL,
		description text DEFAULT NULL,
		format varchar(100) DEFAULT NULL,
		status varchar(50) NOT NULL DEFAULT 'PENDING',
		lockedBy varchar(191) DEFAULT NULL,
		createdAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		PRIMARY KEY (id),
		INDEX idx_concept_quest (questId),
		INDEX idx_concept_team (teamId)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 6. QuestScoreLedger & ScoreAudit Table
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestScoreLedger (
		id varchar(191) NOT NULL,
		questId varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		challengeId varchar(191) NOT NULL,
		teamId varchar(191) NOT NULL,
		points int(11) NOT NULL,
		maxPoints int(11) NOT NULL,
		scoredBy varchar(191) NOT NULL,
		reason text DEFAULT NULL,
		source varchar(50) DEFAULT 'MANUAL',
		status varchar(50) NOT NULL DEFAULT 'VALID',
		createdAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		PRIMARY KEY (id),
		INDEX idx_score_quest (questId),
		INDEX idx_score_team (teamId)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestScoreAudit (
		id varchar(191) NOT NULL,
		questId varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		challengeId varchar(191) NOT NULL,
		teamId varchar(191) NOT NULL,
		previousScore int(11) NOT NULL,
		newScore int(11) NOT NULL,
		reason text DEFAULT NULL,
		modifiedBy varchar(191) NOT NULL,
		createdAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		PRIMARY KEY (id),
		INDEX idx_audit_quest (questId)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 7. QuestAnnouncement Table
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestAnnouncement (
		id varchar(191) NOT NULL,
		questId varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		title varchar(191) NOT NULL,
		body text NOT NULL,
		mediaUrl varchar(255) DEFAULT NULL,
		publishedAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		createdBy varchar(191) DEFAULT NULL,
		PRIMARY KEY (id),
		INDEX idx_announcement_quest (questId)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 8. QuestScheduleItem Table (Configurable Event Schedule / Calendar)
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS QuestScheduleItem (
		id varchar(191) NOT NULL,
		questId varchar(191) NOT NULL,
		tenantSlug varchar(191) NOT NULL DEFAULT '',
		day varchar(50) NOT NULL,
		startTime varchar(50) NOT NULL,
		endTime varchar(50) NOT NULL,
		title varchar(255) NOT NULL,
		description text DEFAULT NULL,
		category varchar(50) NOT NULL,
		location varchar(255) NOT NULL,
		challengeId varchar(191) DEFAULT NULL,
		maxScore int(11) DEFAULT 0,
		facilitatorNotes text DEFAULT NULL,
		status varchar(50) NOT NULL DEFAULT 'UPCOMING',
		orderIndex int(11) NOT NULL DEFAULT 0,
		createdAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		PRIMARY KEY (id),
		INDEX idx_schedule_quest (questId)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)
}

func EnsureHRTables() {
	if db != nil {
		EnsureHRTablesOnDB(db)
	}
}

func EnsureHRTablesOnDB(targetDB *sql.DB) {
	if targetDB == nil {
		return
	}

	// 0. Ensure User table exists
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS "User" (
		id varchar(191) NOT NULL,
		"tenantSlug" varchar(191) NOT NULL DEFAULT '',
		name varchar(191) NOT NULL,
		email varchar(191) NOT NULL,
		role varchar(50) NOT NULL DEFAULT 'employee',
		department varchar(191) NOT NULL DEFAULT '',
		avatar varchar(191) NOT NULL DEFAULT '/character1.jpg',
		"managerName" varchar(191) DEFAULT NULL,
		"managerId" varchar(191) DEFAULT NULL,
		"ratingTrend" text DEFAULT NULL,
		designation varchar(191) DEFAULT NULL,
		"gradeLevel" varchar(191) DEFAULT NULL,
		"employmentDate" varchar(191) DEFAULT NULL,
		company varchar(191) DEFAULT NULL,
		location varchar(191) DEFAULT NULL,
		password varchar(191) DEFAULT NULL,
		PRIMARY KEY (id)
	);`)

	// 1. Ensure User columns exist
	cols := []string{
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tenantSlug" varchar(191) NOT NULL DEFAULT ''`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "department" varchar(191) NOT NULL DEFAULT ''`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" varchar(191) NOT NULL DEFAULT '/character1.jpg'`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "managerName" varchar(191) DEFAULT NULL`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "managerId" varchar(191) DEFAULT NULL`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ratingTrend" text DEFAULT NULL`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "designation" varchar(191) DEFAULT NULL`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gradeLevel" varchar(191) DEFAULT NULL`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "employmentDate" varchar(191) DEFAULT NULL`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "company" varchar(191) DEFAULT NULL`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "location" varchar(191) DEFAULT NULL`,
		`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "assignedPages" text DEFAULT '[]'`,
	}
	for _, q := range cols {
		_, _ = targetDB.Exec(q)
	}

	// 1.5. Ensure HR tables have tenantSlug (Migration)
	hr_migrations := []string{
		`ALTER TABLE "ReviewCycle" ADD COLUMN IF NOT EXISTS "tenantSlug" varchar(191) NOT NULL DEFAULT ''`,
		`ALTER TABLE "Objective" ADD COLUMN IF NOT EXISTS "tenantSlug" varchar(191) NOT NULL DEFAULT ''`,
		`ALTER TABLE "PerformanceReview" ADD COLUMN IF NOT EXISTS "tenantSlug" varchar(191) NOT NULL DEFAULT ''`,
	}
	for _, q := range hr_migrations {
		_, _ = targetDB.Exec(q)
	}

	// 2. Ensure ReviewCycle table exists
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS "ReviewCycle" (
		id varchar(191) NOT NULL,
		"tenantSlug" varchar(191) NOT NULL DEFAULT '',
		name varchar(191) NOT NULL,
		"startDate" varchar(191) NOT NULL,
		"endDate" varchar(191) NOT NULL,
		status varchar(191) NOT NULL,
		departments text NOT NULL,
		PRIMARY KEY (id)
	);`)

	// 3. Ensure Objective table exists
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS "Objective" (
		id varchar(191) NOT NULL,
		"tenantSlug" varchar(191) NOT NULL DEFAULT '',
		text varchar(191) NOT NULL,
		weight int NOT NULL,
		type varchar(191) NOT NULL,
		"expectedLevel" int DEFAULT NULL,
		category varchar(191) DEFAULT NULL,
		departments text DEFAULT NULL,
		description text DEFAULT NULL,
		PRIMARY KEY (id)
	);`)

	// 4. Ensure PerformanceReview table exists
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS "PerformanceReview" (
		id varchar(191) NOT NULL,
		"tenantSlug" varchar(191) NOT NULL DEFAULT '',
		"employeeId" varchar(191) NOT NULL,
		"employeeName" varchar(191) NOT NULL,
		department varchar(191) NOT NULL,
		"cycleId" varchar(191) NOT NULL,
		"cycleName" varchar(191) NOT NULL,
		status varchar(191) NOT NULL,
		"employeeComments" text DEFAULT NULL,
		"managerComments" text DEFAULT NULL,
		"hrComments" text DEFAULT NULL,
		"finalScore" double precision DEFAULT NULL,
		"objectivesJson" text NOT NULL,
		"updatedAt" timestamp NOT NULL DEFAULT current_timestamp,
		"improvementPlan" text DEFAULT NULL,
		PRIMARY KEY (id)
	);`)

	// 5. Ensure Department table exists
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS "Department" (
		"code" varchar(191) NOT NULL,
		"name" varchar(191) NOT NULL,
		"head" varchar(191) DEFAULT 'Pending Appointment',
		"headCount" integer DEFAULT 1,
		"budget" varchar(100) DEFAULT '₦10,000,000',
		"costCenter" varchar(100) DEFAULT 'CC-601',
		"tenantSlug" varchar(191) NOT NULL DEFAULT '',
		"createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
		"updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY ("code", "tenantSlug")
	);`)

	// 6. Ensure TenantRolePermission table exists
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS "TenantRolePermission" (
		id VARCHAR(191) PRIMARY KEY,
		"tenantId" VARCHAR(191) NOT NULL,
		role VARCHAR(50) NOT NULL,
		"moduleKey" VARCHAR(50) NOT NULL,
		"isEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
		"allowedActions" JSONB DEFAULT '[]'::jsonb,
		"createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		"updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT tenant_role_module_uniq UNIQUE ("tenantId", role, "moduleKey")
	);`)
}

func EnsureCRMTables() {
	if db != nil {
		EnsureCRMTablesOnDB(db)
	}
}

func EnsureCRMTablesOnDB(targetDB *sql.DB) {
	if targetDB == nil {
		return
	}

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS crm_accounts (
		id VARCHAR(64) PRIMARY KEY,
		tenant_slug VARCHAR(191) NOT NULL,
		name VARCHAR(191) NOT NULL,
		industry VARCHAR(100),
		tier VARCHAR(50),
		website VARCHAR(255),
		phone VARCHAR(50),
		city VARCHAR(100),
		status VARCHAR(50) DEFAULT 'ACTIVE',
		owner VARCHAR(191),
		notes TEXT,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS crm_leads (
		id VARCHAR(64) PRIMARY KEY,
		tenant_slug VARCHAR(191) NOT NULL,
		name VARCHAR(191) NOT NULL,
		company VARCHAR(191),
		email VARCHAR(191),
		phone VARCHAR(50),
		source VARCHAR(100),
		score INT DEFAULT 50,
		status VARCHAR(50) DEFAULT 'NEW',
		owner VARCHAR(191),
		value VARCHAR(100),
		notes TEXT,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS crm_deals (
		id VARCHAR(64) PRIMARY KEY,
		tenant_slug VARCHAR(191) NOT NULL,
		title VARCHAR(191) NOT NULL,
		company VARCHAR(191),
		contact_name VARCHAR(191),
		email VARCHAR(191),
		phone VARCHAR(50),
		value VARCHAR(100),
		stage VARCHAR(50) DEFAULT 'DISCOVERY',
		owner VARCHAR(191),
		probability INT DEFAULT 50,
		expected_close VARCHAR(100),
		notes TEXT,
		account_id VARCHAR(64),
		lead_id VARCHAR(64),
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS crm_activities (
		id VARCHAR(64) PRIMARY KEY,
		tenant_slug VARCHAR(191) NOT NULL,
		type VARCHAR(50) NOT NULL,
		title VARCHAR(255) NOT NULL,
		company VARCHAR(191),
		rep VARCHAR(191),
		date_time VARCHAR(100),
		status VARCHAR(50) DEFAULT 'PENDING',
		notes TEXT,
		account_id VARCHAR(64),
		deal_id VARCHAR(64),
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS crm_email_lists (
		id VARCHAR(64) PRIMARY KEY,
		tenant_slug VARCHAR(191) NOT NULL,
		name VARCHAR(191) NOT NULL,
		description TEXT,
		tags TEXT,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS crm_email_subscribers (
		id VARCHAR(64) PRIMARY KEY,
		list_id VARCHAR(64) NOT NULL,
		tenant_slug VARCHAR(191) NOT NULL,
		email VARCHAR(191) NOT NULL,
		name VARCHAR(191),
		role VARCHAR(100),
		department VARCHAR(100),
		status VARCHAR(50) DEFAULT 'SUBSCRIBED',
		unsubscribed_at TIMESTAMPTZ,
		unsubscribe_reason TEXT,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS crm_email_blasts (
		id VARCHAR(64) PRIMARY KEY,
		tenant_slug VARCHAR(191) NOT NULL,
		title VARCHAR(191) NOT NULL,
		subject VARCHAR(255) NOT NULL,
		message_html TEXT NOT NULL,
		list_ids TEXT,
		sender_profile_id VARCHAR(64),
		status VARCHAR(50) DEFAULT 'DRAFT',
		scheduled_at TIMESTAMPTZ,
		sent_at TIMESTAMPTZ,
		total_recipients INT DEFAULT 0,
		sent_count INT DEFAULT 0,
		failed_count INT DEFAULT 0,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS tenant_smtp_settings (
		tenant_slug VARCHAR(191) PRIMARY KEY,
		provider VARCHAR(50) DEFAULT 'custom',
		host VARCHAR(191),
		port INT DEFAULT 587,
		encryption VARCHAR(20) DEFAULT 'tls',
		from_email VARCHAR(191),
		from_name VARCHAR(191),
		username VARCHAR(191),
		password VARCHAR(255),
		rate_limited_until TIMESTAMPTZ,
		rate_limit_reason TEXT,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS tenant_sender_profiles (
		id VARCHAR(191) PRIMARY KEY,
		tenant_slug VARCHAR(191) NOT NULL,
		profile_name VARCHAR(191) NOT NULL,
		provider VARCHAR(50) DEFAULT 'custom',
		host VARCHAR(191) NOT NULL,
		port INT DEFAULT 587,
		encryption VARCHAR(20) DEFAULT 'tls',
		from_email VARCHAR(191) NOT NULL,
		from_name VARCHAR(191) NOT NULL,
		username VARCHAR(191) NOT NULL,
		password VARCHAR(255) DEFAULT '',
		is_default BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_tenant_sender_profiles_slug ON tenant_sender_profiles(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS crm_calls (
		id VARCHAR(64) PRIMARY KEY,
		tenant_slug VARCHAR(191) NOT NULL,
		lead_id VARCHAR(64),
		deal_id VARCHAR(64),
		contact_name VARCHAR(191) NOT NULL,
		company VARCHAR(191),
		phone_number VARCHAR(64) NOT NULL,
		rep_name VARCHAR(191) NOT NULL,
		rep_email VARCHAR(191),
		direction VARCHAR(20) DEFAULT 'OUTBOUND',
		outcome VARCHAR(50) NOT NULL,
		duration_seconds INT DEFAULT 0,
		notes TEXT,
		followup_date VARCHAR(100),
		call_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_calls_tenant ON crm_calls (LOWER(tenant_slug));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_calls_lead ON crm_calls (lead_id);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_calls_date ON crm_calls (call_date);`)

	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS name VARCHAR(191);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS company VARCHAR(191);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS role VARCHAR(100);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS department VARCHAR(100);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_subscribers ADD COLUMN IF NOT EXISTS unsubscribe_reason TEXT;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS list_id VARCHAR(64);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS list_name VARCHAR(191);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS preview_text VARCHAR(255);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS content_html TEXT;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sender_name VARCHAR(191);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sender_email VARCHAR(191);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sender_provider VARCHAR(50);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS recipient_ids TEXT;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS total_recipients INT DEFAULT 0;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sent_count INT DEFAULT 0;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS failed_count INT DEFAULT 0;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS open_count INT DEFAULT 0;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS click_count INT DEFAULT 0;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS bounce_count INT DEFAULT 0;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS sender_override TEXT;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blasts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS crm_email_blast_recipients (
		id VARCHAR(64) PRIMARY KEY,
		blast_id VARCHAR(64) NOT NULL,
		tenant_slug VARCHAR(191) NOT NULL,
		subscriber_id VARCHAR(64),
		email VARCHAR(191) NOT NULL,
		name VARCHAR(191),
		first_name VARCHAR(100),
		last_name VARCHAR(100),
		company VARCHAR(191),
		status VARCHAR(50) DEFAULT 'PENDING',
		error_message TEXT,
		attempts INT DEFAULT 0,
		sent_at TIMESTAMPTZ,
		opened_at TIMESTAMPTZ,
		open_count INT DEFAULT 0,
		clicked_at TIMESTAMPTZ,
		click_count INT DEFAULT 0,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blast_recipients ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blast_recipients ADD COLUMN IF NOT EXISTS open_count INT DEFAULT 0;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blast_recipients ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_email_blast_recipients ADD COLUMN IF NOT EXISTS click_count INT DEFAULT 0;`)

	_, _ = targetDB.Exec(`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS assigned_rep VARCHAR(191);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS company_name VARCHAR(191);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_name VARCHAR(191);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_email VARCHAR(191);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS icp_fit_score INT DEFAULT 85;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS buying_signals TEXT DEFAULT '[]';`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS source_blast_id VARCHAR(64);`)

	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_subscribers_email ON crm_email_subscribers (LOWER(email));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_subscribers_tenant ON crm_email_subscribers (LOWER(tenant_slug));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant ON crm_leads (LOWER(tenant_slug));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant_email ON crm_leads (LOWER(tenant_slug), LOWER(email));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_deals_tenant ON crm_deals (LOWER(tenant_slug));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_accounts_tenant ON crm_accounts (LOWER(tenant_slug));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_blasts_tenant ON crm_email_blasts (LOWER(tenant_slug));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_blasts_sched ON crm_email_blasts (status, scheduled_at);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_blast_recipients_blast ON crm_email_blast_recipients (blast_id);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_blast_recipients_tenant ON crm_email_blast_recipients (LOWER(tenant_slug));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_crm_blast_recipients_status ON crm_email_blast_recipients (status);`)
	_, _ = targetDB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_subscribers_list_email ON crm_email_subscribers (list_id, LOWER(email));`)
}
