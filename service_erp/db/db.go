package db

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() (*gorm.DB, error) {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = os.Getenv("DB_DSN")
	}

	var dialector gorm.Dialector
	isPostgres := strings.HasPrefix(databaseURL, "postgres://") || strings.HasPrefix(databaseURL, "postgresql://")

	if isPostgres {
		log.Println("🐘 Connecting to PostgreSQL / Neon database for service_erp...")
		dialector = postgres.Open(databaseURL)
	} else {
		if databaseURL == "" {
			databaseURL = "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred"
		} else {
			databaseURL = ParseDatabaseDSN(databaseURL)
		}
		dialector = mysql.Open(databaseURL)
	}

	var err error
	gormDB, err := gorm.Open(dialector, &gorm.Config{
		PrepareStmt: true,
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Printf("⚠️ Warning: Failed to connect to database for service_erp (%s): %v. Running in degraded/in-memory mode.", databaseURL, err)
		DB = nil
		return nil, err
	}

	DB = gormDB

	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(10)
		sqlDB.SetMaxIdleConns(5)
		sqlDB.SetConnMaxLifetime(10 * time.Minute)
	}

	log.Println("✅ GORM Database connection initialized successfully for service_erp")
	return DB, nil
}
