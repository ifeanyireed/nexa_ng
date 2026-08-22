package db

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"nexa/logistics_service/internal/models"
)

func InitDB() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=nexa_dev port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Printf("Warning: Failed to connect to postgres (%v), running in-memory or degraded mode", err)
		return nil
	}

	// Auto migrate tables
	err = db.AutoMigrate(
		&models.Shipment{},
		&models.Waypoint{},
		&models.CourierDriver{},
		&models.DeliveryZoneRate{},
		&models.DispatchTicket{},
	)
	if err != nil {
		log.Printf("Warning: Migration failed: %v", err)
	}

	log.Println("Database connection initialized successfully for service_logistics")
	return db
}
