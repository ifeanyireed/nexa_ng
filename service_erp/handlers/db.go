package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
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
		slug = r.Header.Get("x-org-id")
	}
	if slug == "" {
		slug = r.URL.Query().Get("tenant")
	}
	if slug == "" {
		slug = r.URL.Query().Get("tenant_slug")
	}
	if slug == "" {
		slug = r.URL.Query().Get("slug")
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
	return strings.ToLower(strings.TrimSpace(slug))
}

func requireTenantSlug(w http.ResponseWriter, r *http.Request) string {
	slug := extractTenantSlug(r)
	if slug == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "tenant parameter is required for multi-tenant isolation",
		})
		return ""
	}
	return slug
}

func getDBForSlug(slug string) *sql.DB {
	norm := strings.ToLower(strings.TrimSpace(slug))
	if norm == "" {
		return nil
	}

	targetURL, ok := tenantProjectRegistry[norm]
	if !ok || targetURL == "" {
		if db != nil {
			var fetchedURL, fetchedStorage sql.NullString
			// 1. Check platform_tenants registry
			err := db.QueryRow(`
				SELECT database_url, cloudinary_url 
				FROM platform_tenants
				WHERE (LOWER(slug) = $1 OR LOWER(id) = $1)
				LIMIT 1`, norm).Scan(&fetchedURL, &fetchedStorage)
			
			// 2. Fallback check on tenant_infrastructures
			if err != nil || !fetchedURL.Valid || fetchedURL.String == "" {
				_ = db.QueryRow(`
					SELECT database_url, cloudinary_url 
					FROM tenant_infrastructures 
					WHERE LOWER(tenant_slug) = $1 
					LIMIT 1`, norm).Scan(&fetchedURL, &fetchedStorage)
			}

			if fetchedURL.Valid && fetchedURL.String != "" {
				RegisterTenantProject(norm, fetchedURL.String, fetchedStorage.String)
				targetURL = fetchedURL.String
				ok = true
			}
		}
	}

	if !ok || targetURL == "" {
		log.Printf("❌ Strict Multi-Tenancy: No dedicated database configured for tenant '%s'. Fallback to primary database is strictly forbidden.", norm)
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
	EnsureFinanceTablesOnDB(sDB)

	tenantSqlPools.Store(norm, sDB)
	tenantGormPools.Store(norm, gdb)
	return sDB
}

func getDB(r *http.Request) *sql.DB {
	return getDBForSlug(extractTenantSlug(r))
}

func requireTenantDB(w http.ResponseWriter, r *http.Request) (*sql.DB, string) {
	slug := requireTenantSlug(w, r)
	if slug == "" {
		return nil, ""
	}
	targetDB := getDBForSlug(slug)
	if targetDB == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   fmt.Sprintf("Dedicated database unavailable for tenant '%s'", slug),
		})
		return nil, slug
	}
	return targetDB, slug
}

func getGorm(r *http.Request) *gorm.DB {
	slug := extractTenantSlug(r)
	if slug == "" || slug == "default" || slug == "platform" {
		return nil
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

func requireTenantGorm(w http.ResponseWriter, r *http.Request) (*gorm.DB, string) {
	slug := requireTenantSlug(w, r)
	if slug == "" {
		return nil, ""
	}
	gdb := getGorm(r)
	if gdb == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   fmt.Sprintf("Dedicated database unavailable for tenant '%s'", slug),
		})
		return nil, slug
	}
	return gdb, slug
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
		status VARCHAR(50) DEFAULT 'CURIOUS',
		owner VARCHAR(191),
		value VARCHAR(100),
		notes TEXT,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)

	_, _ = targetDB.Exec(`
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS name VARCHAR(191);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS company VARCHAR(191);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS email VARCHAR(191);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS score INT DEFAULT 50;
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS owner VARCHAR(191);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS value VARCHAR(100);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS company_name VARCHAR(191);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_name VARCHAR(191);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_email VARCHAR(191);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS assigned_rep VARCHAR(191);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS icp_fit_score INT DEFAULT 50;
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS source_blast_id VARCHAR(64);
		ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS buying_signals TEXT;
	`)

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

	_, _ = targetDB.Exec(`ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS recording_url TEXT;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS transcript TEXT;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS ai_summary TEXT;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS qualification_json JSONB;`)
	_, _ = targetDB.Exec(`ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS is_ai BOOLEAN DEFAULT FALSE;`)

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

	// Omnichannel Commerce Tables
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS shop_orders (
		id VARCHAR(64) PRIMARY KEY,
		order_number VARCHAR(100) NOT NULL,
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		customer_name VARCHAR(191) NOT NULL,
		customer_email VARCHAR(191) DEFAULT '',
		customer_phone VARCHAR(64) NOT NULL,
		channel VARCHAR(50) NOT NULL DEFAULT 'STOREFRONT',
		status VARCHAR(50) NOT NULL DEFAULT 'IN_PREPARATION',
		payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',
		delivery_method VARCHAR(50) NOT NULL DEFAULT 'DISPATCH',
		shipping_address TEXT DEFAULT '',
		city VARCHAR(100) DEFAULT 'Lagos',
		payment_method VARCHAR(50) DEFAULT 'card',
		items_summary TEXT DEFAULT '',
		item_count INT DEFAULT 1,
		total_amount VARCHAR(100) NOT NULL,
		raw_amount NUMERIC(15,2) DEFAULT 0,
		currency VARCHAR(10) DEFAULT '₦',
		items JSONB DEFAULT '[]'::jsonb,
		notes TEXT DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT uq_shop_orders_tenant_number UNIQUE (tenant_slug, order_number)
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_orders_tenant ON shop_orders(LOWER(tenant_slug));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_orders_number ON shop_orders(order_number);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(LOWER(tenant_slug), status);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_orders_created ON shop_orders(LOWER(tenant_slug), created_at DESC);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS shop_order_items (
		id VARCHAR(64) PRIMARY KEY,
		order_id VARCHAR(64) NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
		tenant_slug VARCHAR(191) NOT NULL,
		product_id VARCHAR(191) DEFAULT '',
		title VARCHAR(255) NOT NULL,
		price NUMERIC(15,2) DEFAULT 0,
		quantity INT DEFAULT 1,
		image_url TEXT DEFAULT '',
		options JSONB DEFAULT '{}'::jsonb,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_order_items_order ON shop_order_items(order_id);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_order_items_tenant ON shop_order_items(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS shop_bookings (
		id VARCHAR(64) PRIMARY KEY,
		booking_number VARCHAR(100) NOT NULL,
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		customer_name VARCHAR(191) NOT NULL,
		customer_email VARCHAR(191) DEFAULT '',
		customer_phone VARCHAR(64) NOT NULL,
		service_title VARCHAR(255) NOT NULL,
		date_time VARCHAR(100) NOT NULL,
		status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
		vertical VARCHAR(50) NOT NULL DEFAULT 'cars',
		notes TEXT DEFAULT '',
		amount NUMERIC(15,2) DEFAULT 0,
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT uq_shop_bookings_tenant_number UNIQUE (tenant_slug, booking_number)
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_bookings_tenant ON shop_bookings(LOWER(tenant_slug));`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_bookings_number ON shop_bookings(booking_number);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_bookings_status ON shop_bookings(LOWER(tenant_slug), status);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_shop_bookings_created ON shop_bookings(LOWER(tenant_slug), created_at DESC);`)
}

// EnsureFinanceTablesOnDB provisions tenant-scoped finance & accounting tables on dedicated database
func EnsureFinanceTablesOnDB(targetDB *sql.DB) {
	if targetDB == nil {
		return
	}

	// 1. Transactions
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS transactions (
		id VARCHAR(64) PRIMARY KEY,
		reference_id VARCHAR(64) DEFAULT '',
		type VARCHAR(32) NOT NULL,
		category VARCHAR(64) NOT NULL,
		amount NUMERIC(15,2) NOT NULL DEFAULT 0,
		date VARCHAR(64) NOT NULL,
		description TEXT DEFAULT '',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions(LOWER(tenant_slug), created_at DESC);`)

	// 2. Expenses
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS expenses (
		id VARCHAR(64) PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		category VARCHAR(64) NOT NULL,
		amount NUMERIC(15,2) NOT NULL DEFAULT 0,
		status VARCHAR(32) NOT NULL DEFAULT 'Pending',
		requested_by VARCHAR(128) DEFAULT '',
		approved_by VARCHAR(128) DEFAULT '',
		description TEXT DEFAULT '',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_expenses_tenant ON expenses(LOWER(tenant_slug), created_at DESC);`)

	// 3. Invoices
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS invoices (
		id VARCHAR(64) PRIMARY KEY,
		invoice_number VARCHAR(64) NOT NULL,
		customer_name VARCHAR(128) NOT NULL,
		customer_email VARCHAR(128) DEFAULT '',
		amount NUMERIC(15,2) NOT NULL DEFAULT 0,
		due_date VARCHAR(64) NOT NULL,
		status VARCHAR(32) NOT NULL DEFAULT 'Unpaid',
		description TEXT DEFAULT '',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(LOWER(tenant_slug), created_at DESC);`)

	// 4. Clients
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS clients (
		id VARCHAR(64) PRIMARY KEY,
		name VARCHAR(128) NOT NULL,
		sub_name VARCHAR(128) DEFAULT '',
		email VARCHAR(128) DEFAULT '',
		category VARCHAR(64) DEFAULT '',
		status VARCHAR(32) DEFAULT 'Active',
		company_name VARCHAR(128) DEFAULT '',
		phone VARCHAR(64) DEFAULT '',
		website VARCHAR(128) DEFAULT '',
		vat VARCHAR(64) DEFAULT '',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(LOWER(tenant_slug));`)

	// 5. Reconciliations
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS reconciliations (
		id VARCHAR(64) PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		type VARCHAR(64) NOT NULL,
		period_start VARCHAR(64) NOT NULL,
		period_end VARCHAR(64) NOT NULL,
		expected_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
		actual_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
		discrepancy NUMERIC(15,2) NOT NULL DEFAULT 0,
		status VARCHAR(32) NOT NULL DEFAULT 'Draft',
		prepared_by VARCHAR(128) DEFAULT '',
		notes TEXT DEFAULT '',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_reconciliations_tenant ON reconciliations(LOWER(tenant_slug), created_at DESC);`)

	// 6. Bank Accounts & Reconciliations
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS bank_accounts (
		id VARCHAR(64) PRIMARY KEY,
		name VARCHAR(128) NOT NULL,
		account_no VARCHAR(64) NOT NULL,
		bank_name VARCHAR(128) NOT NULL,
		currency VARCHAR(16) DEFAULT 'NGN',
		status VARCHAR(32) DEFAULT 'Active',
		balance NUMERIC(15,2) DEFAULT 0,
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_bank_accounts_tenant ON bank_accounts(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS bank_reconciliations (
		id VARCHAR(64) PRIMARY KEY,
		bank_account_id VARCHAR(64) NOT NULL,
		statement_date VARCHAR(64) NOT NULL,
		ending_balance NUMERIC(15,2) DEFAULT 0,
		reconciled_balance NUMERIC(15,2) DEFAULT 0,
		difference NUMERIC(15,2) DEFAULT 0,
		status VARCHAR(32) DEFAULT 'In Progress',
		prepared_by VARCHAR(128) DEFAULT '',
		notes TEXT DEFAULT '',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_bank_reconciliations_tenant ON bank_reconciliations(LOWER(tenant_slug));`)

	// 7. Chart of Accounts & Journals
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS accounts (
		id VARCHAR(64) PRIMARY KEY,
		code VARCHAR(32) NOT NULL,
		name VARCHAR(128) NOT NULL,
		category VARCHAR(64) NOT NULL,
		normal_balance VARCHAR(16) NOT NULL,
		opening_balance NUMERIC(15,2) DEFAULT 0,
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT ''
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_accounts_tenant ON accounts(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS journal_entries (
		id VARCHAR(64) PRIMARY KEY,
		entry_date VARCHAR(64) NOT NULL,
		reference_no VARCHAR(64) DEFAULT '',
		description TEXT DEFAULT '',
		status VARCHAR(32) DEFAULT 'Draft',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant ON journal_entries(LOWER(tenant_slug), created_at DESC);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS journal_items (
		id VARCHAR(64) PRIMARY KEY,
		journal_entry_id VARCHAR(64) NOT NULL,
		account_id VARCHAR(64) NOT NULL,
		description TEXT DEFAULT '',
		debit NUMERIC(15,2) DEFAULT 0,
		credit NUMERIC(15,2) DEFAULT 0,
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT ''
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_journal_items_tenant ON journal_items(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS recurring_journals (
		id VARCHAR(64) PRIMARY KEY,
		profile_name VARCHAR(128) NOT NULL,
		frequency VARCHAR(32) NOT NULL,
		start_date VARCHAR(64) NOT NULL,
		end_date VARCHAR(64) DEFAULT '',
		next_run_date VARCHAR(64) NOT NULL,
		status VARCHAR(32) DEFAULT 'Active',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_recurring_journals_tenant ON recurring_journals(LOWER(tenant_slug));`)

	// 8. Payrolls & Remittances
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS payrolls (
		id VARCHAR(64) PRIMARY KEY,
		period_month VARCHAR(32) NOT NULL,
		period_year INT NOT NULL,
		total_amount NUMERIC(15,2) DEFAULT 0,
		status VARCHAR(32) DEFAULT 'Draft',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_payrolls_tenant ON payrolls(LOWER(tenant_slug), created_at DESC);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS employee_salaries (
		id VARCHAR(64) PRIMARY KEY,
		payroll_id VARCHAR(64) NOT NULL,
		employee_name VARCHAR(128) NOT NULL,
		basic_salary NUMERIC(15,2) DEFAULT 0,
		allowances NUMERIC(15,2) DEFAULT 0,
		deductions NUMERIC(15,2) DEFAULT 0,
		net_salary NUMERIC(15,2) DEFAULT 0,
		status VARCHAR(32) DEFAULT 'Draft',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT ''
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_employee_salaries_tenant ON employee_salaries(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS statutory_remittances (
		id VARCHAR(64) PRIMARY KEY,
		type VARCHAR(64) NOT NULL,
		amount NUMERIC(15,2) DEFAULT 0,
		period_month VARCHAR(32) NOT NULL,
		period_year INT NOT NULL,
		due_date VARCHAR(64) NOT NULL,
		status VARCHAR(32) DEFAULT 'Pending',
		payment_date VARCHAR(64) DEFAULT '',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_statutory_remittances_tenant ON statutory_remittances(LOWER(tenant_slug), created_at DESC);`)

	// 9. Vendors & Bills
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS vendors (
		id VARCHAR(64) PRIMARY KEY,
		name VARCHAR(128) NOT NULL,
		email VARCHAR(128) DEFAULT '',
		phone VARCHAR(64) DEFAULT '',
		company_name VARCHAR(128) DEFAULT '',
		status VARCHAR(32) DEFAULT 'Active',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_vendors_tenant ON vendors(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS bills (
		id VARCHAR(64) PRIMARY KEY,
		bill_number VARCHAR(64) NOT NULL,
		vendor_id VARCHAR(64) NOT NULL,
		amount NUMERIC(15,2) DEFAULT 0,
		due_date VARCHAR(64) NOT NULL,
		status VARCHAR(32) DEFAULT 'Unpaid',
		description TEXT DEFAULT '',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_bills_tenant ON bills(LOWER(tenant_slug), created_at DESC);`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS debit_notes (
		id VARCHAR(64) PRIMARY KEY,
		debit_note_number VARCHAR(64) NOT NULL,
		vendor_id VARCHAR(64) NOT NULL,
		bill_id VARCHAR(64) DEFAULT '',
		amount NUMERIC(15,2) DEFAULT 0,
		reason TEXT DEFAULT '',
		status VARCHAR(32) DEFAULT 'Open',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_debit_notes_tenant ON debit_notes(LOWER(tenant_slug));`)

	// 10. Documents (Proposals, Estimates, Retainers, Credit Notes)
	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS proposals (
		id VARCHAR(64) PRIMARY KEY,
		proposal_number VARCHAR(64) NOT NULL,
		client_id VARCHAR(64) NOT NULL,
		amount NUMERIC(15,2) DEFAULT 0,
		status VARCHAR(32) DEFAULT 'Draft',
		valid_until VARCHAR(64) DEFAULT '',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_proposals_tenant ON proposals(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS estimates (
		id VARCHAR(64) PRIMARY KEY,
		estimate_number VARCHAR(64) NOT NULL,
		client_id VARCHAR(64) NOT NULL,
		amount NUMERIC(15,2) DEFAULT 0,
		status VARCHAR(32) DEFAULT 'Draft',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_estimates_tenant ON estimates(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS retainers (
		id VARCHAR(64) PRIMARY KEY,
		retainer_number VARCHAR(64) NOT NULL,
		client_id VARCHAR(64) NOT NULL,
		amount NUMERIC(15,2) DEFAULT 0,
		status VARCHAR(32) DEFAULT 'Draft',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_retainers_tenant ON retainers(LOWER(tenant_slug));`)

	_, _ = targetDB.Exec(`CREATE TABLE IF NOT EXISTS credit_notes (
		id VARCHAR(64) PRIMARY KEY,
		credit_note_number VARCHAR(64) NOT NULL,
		client_id VARCHAR(64) NOT NULL,
		invoice_id VARCHAR(64) DEFAULT '',
		amount NUMERIC(15,2) DEFAULT 0,
		reason TEXT DEFAULT '',
		status VARCHAR(32) DEFAULT 'Open',
		tenant_slug VARCHAR(191) NOT NULL,
		tenant_id VARCHAR(191) DEFAULT '',
		created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
	);`)
	_, _ = targetDB.Exec(`CREATE INDEX IF NOT EXISTS idx_credit_notes_tenant ON credit_notes(LOWER(tenant_slug));`)
}
