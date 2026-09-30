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

func Init() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = os.Getenv("DB_DSN")
	}

	var dialector gorm.Dialector
	isPostgres := strings.HasPrefix(databaseURL, "postgres://") || strings.HasPrefix(databaseURL, "postgresql://")

	if isPostgres {
		log.Println("🐘 Connecting to PostgreSQL / Neon database for service_marketplace...")
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
		DisableForeignKeyConstraintWhenMigrating: true,
		Logger:                                   logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Printf("⚠️ Warning: Failed to connect to database via GORM (%s): %v. Running in offline/graceful mode.", databaseURL, err)
		DB = nil
		return
	}

	DB = gormDB

	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	log.Println("Database connection initialized successfully for service_marketplace")
}

func Close() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err == nil {
			sqlDB.Close()
		}
	}
}
