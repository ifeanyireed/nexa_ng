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
		}
	}
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
