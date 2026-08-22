package db

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"nexa/logistics_service/internal/models"
)

var DB *gorm.DB

func ParseDatabaseDSN(rawURL string) string {
	if rawURL == "" {
		return ""
	}

	if strings.Contains(rawURL, "@tcp(") {
		return rawURL
	}

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
			return fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred",
				user, pass, host, dbname)
		}
	}

	return rawURL
}

func InitDB() *gorm.DB {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = os.Getenv("DB_DSN")
	}

	if databaseURL == "" {
		databaseURL = "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred"
	} else {
		databaseURL = ParseDatabaseDSN(databaseURL)
	}

	var err error
	DB, err = gorm.Open(mysql.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Printf("⚠️ Warning: Failed to connect to MySQL database for service_logistics (%s): %v. Proceeding in degraded/in-memory mode.", databaseURL, err)
		return nil
	}

	// Auto migrate logistics tables
	err = DB.AutoMigrate(
		&models.Shipment{},
		&models.Waypoint{},
		&models.CourierDriver{},
		&models.DeliveryZoneRate{},
		&models.DispatchTicket{},
	)
	if err != nil {
		log.Printf("⚠️ Warning: Logistics AutoMigration failed: %v", err)
	}

	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(10)
		sqlDB.SetMaxIdleConns(5)
		sqlDB.SetConnMaxLifetime(10 * time.Minute)
	}

	log.Println("Database connection initialized successfully for service_logistics")
	return DB
}
