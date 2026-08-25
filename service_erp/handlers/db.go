package handlers

import (
	"database/sql"

	"gorm.io/gorm"
)

var DB *gorm.DB
var db *sql.DB

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
		totalMaxPoints int(11) NOT NULL DEFAULT 850,
		location varchar(191) DEFAULT NULL,
		startsAt varchar(100) DEFAULT NULL,
		endsAt varchar(100) DEFAULT NULL,
		createdBy varchar(191) DEFAULT NULL,
		createdAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		PRIMARY KEY (id),
		INDEX idx_quest_tenant (tenantSlug)
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
		motto varchar(255) DEFAULT NULL,
		totalPoints int(11) NOT NULL DEFAULT 0,
		teamRank int(11) NOT NULL DEFAULT 1,
		captainId varchar(191) DEFAULT NULL,
		memberCount int(11) NOT NULL DEFAULT 0,
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
}

func EnsureHRTables() {
	if db == nil {
		return
	}

	// 1. Ensure User columns exist
	cols := []string{
		"ALTER TABLE `User` ADD COLUMN `department` varchar(191) NOT NULL DEFAULT ''",
		"ALTER TABLE `User` ADD COLUMN `avatar` varchar(191) NOT NULL DEFAULT '/character1.jpg'",
		"ALTER TABLE `User` ADD COLUMN `managerName` varchar(191) DEFAULT NULL",
		"ALTER TABLE `User` ADD COLUMN `managerId` varchar(191) DEFAULT NULL",
		"ALTER TABLE `User` ADD COLUMN `ratingTrend` text DEFAULT NULL",
		"ALTER TABLE `User` ADD COLUMN `designation` varchar(191) DEFAULT NULL",
		"ALTER TABLE `User` ADD COLUMN `gradeLevel` varchar(191) DEFAULT NULL",
		"ALTER TABLE `User` ADD COLUMN `employmentDate` varchar(191) DEFAULT NULL",
		"ALTER TABLE `User` ADD COLUMN `company` varchar(191) DEFAULT NULL",
		"ALTER TABLE `User` ADD COLUMN `location` varchar(191) DEFAULT NULL",
	}
	for _, q := range cols {
		_, _ = db.Exec(q)
	}

	// 2. Ensure ReviewCycle table exists
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS ReviewCycle (
		id varchar(191) NOT NULL,
		name varchar(191) NOT NULL,
		startDate varchar(191) NOT NULL,
		endDate varchar(191) NOT NULL,
		status varchar(191) NOT NULL,
		departments text NOT NULL,
		PRIMARY KEY (id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 3. Ensure Objective table exists
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS Objective (
		id varchar(191) NOT NULL,
		text varchar(191) NOT NULL,
		weight int(11) NOT NULL,
		type varchar(191) NOT NULL,
		expectedLevel int(11) DEFAULT NULL,
		category varchar(191) DEFAULT NULL,
		departments text DEFAULT NULL,
		description text DEFAULT NULL,
		PRIMARY KEY (id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)

	// 4. Ensure PerformanceReview table exists
	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS PerformanceReview (
		id varchar(191) NOT NULL,
		employeeId varchar(191) NOT NULL,
		employeeName varchar(191) NOT NULL,
		department varchar(191) NOT NULL,
		cycleId varchar(191) NOT NULL,
		cycleName varchar(191) NOT NULL,
		status varchar(191) NOT NULL,
		employeeComments text DEFAULT NULL,
		managerComments text DEFAULT NULL,
		hrComments text DEFAULT NULL,
		finalScore double DEFAULT NULL,
		objectivesJson text NOT NULL,
		updatedAt datetime(3) NOT NULL DEFAULT current_timestamp(3),
		improvementPlan text DEFAULT NULL,
		PRIMARY KEY (id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`)
}
