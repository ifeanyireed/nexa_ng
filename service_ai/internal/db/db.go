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

func InitDB() *gorm.DB {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = os.Getenv("DB_DSN")
	}

	
	log.Println("🐘 Connecting to Neon Postgres database...")
	dialector := postgres.Open(databaseURL)

	var err error
	gormDB, err := gorm.Open(dialector, &gorm.Config{
		PrepareStmt: true,
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Printf("⚠️ Warning: Failed to connect to database for service_ai (%s): %v. Proceeding in offline mode.", databaseURL, err)
		DB = nil
		return nil
	}

	DB = gormDB

	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(10)
		sqlDB.SetMaxIdleConns(5)
		sqlDB.SetConnMaxLifetime(10 * time.Minute)
	}

	log.Println("Database connection initialized successfully for service_ai")
	return DB
}
