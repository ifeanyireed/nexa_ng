package db

import (
	"log"
	"os"
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

	log.Println("🐘 Connecting to PostgreSQL / Neon database for service_erp...")
	dialector := postgres.Open(databaseURL)

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
