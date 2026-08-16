package db

import (
	"fmt"
	"log"
	"net/url"
	"nexa/marketplace_service/internal/models"
	"os"
	"strings"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ParseDatabaseDSN(rawURL string) string {
	if rawURL == "" {
		return ""
	}

	// If it's already a standard Go MySQL DSN (e.g. user:pass@tcp(host:port)/dbname)
	if strings.Contains(rawURL, "@tcp(") {
		return rawURL
	}

	// If it's in URL format (e.g. mysql://user:password@host:port/dbname)
	if strings.HasPrefix(rawURL, "mysql://") {
		u, err := url.Parse(rawURL)
		if err == nil {
			user := u.User.Username()
			pass, _ := u.User.Password()
			host := u.Host
			if !strings.Contains(host, ":") {
				host = host + ":3306"
			}
			dbname := strings.TrimPrefix(u.Path, "/")
			return fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
				user, pass, host, dbname)
		}
	}

	return rawURL
}

func Init() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		dbHost := os.Getenv("DB_HOST")
		if dbHost == "" {
			dbHost = "srv2113.hstgr.io"
		}
		dbPort := os.Getenv("DB_PORT")
		if dbPort == "" {
			dbPort = "3306"
		}
		dbUser := os.Getenv("DB_USER")
		if dbUser == "" {
			dbUser = "u721451974_nexa"
		}
		dbPassword := os.Getenv("DB_PASSWORD")
		if dbPassword == "" {
			dbPassword = "*Reedb4b4"
		}
		dbName := os.Getenv("DB_NAME")
		if dbName == "" {
			dbName = "u721451974_nexa_db"
		}
		databaseURL = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			dbUser, dbPassword, dbHost, dbPort, dbName)
	} else {
		databaseURL = ParseDatabaseDSN(databaseURL)
	}

	var err error
	DB, err = gorm.Open(mysql.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Printf("⚠️ Warning: Failed to connect to MySQL database via GORM: %v", err)
		return
	}

	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	log.Println("✅ Connected to MySQL database via GORM successfully!")

	// Auto-migrate tables
	if err := DB.AutoMigrate(
		&models.User{},
		&models.ProProfile{},
		&models.Service{},
		&models.Article{},
		&models.Product{},
		&models.Booking{},
		&models.Wallet{},
		&models.Transaction{},
		&models.Order{},
		&models.Delivery{},
		&models.Message{},
		&models.Notification{},
	); err != nil {
		log.Printf("⚠️ Warning: AutoMigrate error: %v", err)
	} else {
		log.Println("✅ GORM AutoMigrate completed successfully!")
	}
}

func Close() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
	}
}
