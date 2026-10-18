package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"nexa/logistics_service/internal/models"
)

var (
	PlatformDB      *gorm.DB
	tenantGormPools sync.Map // map[string]*gorm.DB
	poolMu          sync.Mutex
	tenantDBUrls    = make(map[string]string) // normalized slug -> databaseURL
)

type TenantOrgInfo struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	Domain       string `json:"domain"`
	Logo         string `json:"logo"`
	PrimaryColor string `json:"primary_color"`
	DatabaseURL  string `json:"database_url"`
}

func InitDB() *gorm.DB {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = os.Getenv("DB_DSN")
	}

	if databaseURL == "" {
		log.Println("⚠️ Warning: No DATABASE_URL set for service_logistics.")
		return nil
	}

	log.Println("🐘 Connecting to Neon Postgres Platform database...")
	dialector := postgres.New(postgres.Config{
		DSN:                  databaseURL,
		PreferSimpleProtocol: true,
	})

	gormDB, err := gorm.Open(dialector, &gorm.Config{
		PrepareStmt:                              false,
		DisableForeignKeyConstraintWhenMigrating: true,
		Logger:                                   logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Printf("⚠️ Warning: Failed to connect to platform database: %v", err)
		PlatformDB = nil
		return nil
	}

	PlatformDB = gormDB

	sqlDB, err := PlatformDB.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(15)
		sqlDB.SetMaxIdleConns(5)
		sqlDB.SetConnMaxLifetime(10 * time.Minute)
	}

	log.Println("✅ Platform database connection initialized successfully for service_logistics")
	return PlatformDB
}

// GetDBForTenant dynamically resolves and returns the dedicated GORM database connection for a tenant
func GetDBForTenant(slugOrOrgID string) (*gorm.DB, error) {
	norm := strings.ToLower(strings.TrimSpace(slugOrOrgID))
	if norm == "" {
		return nil, fmt.Errorf("empty tenant identifier")
	}

	// Check if already in active pools
	if val, ok := tenantGormPools.Load(norm); ok {
		return val.(*gorm.DB), nil
	}

	poolMu.Lock()
	defer poolMu.Unlock()

	// Double check after lock
	if val, ok := tenantGormPools.Load(norm); ok {
		return val.(*gorm.DB), nil
	}

	// Resolve database URL from registry or platform DB
	targetURL, ok := tenantDBUrls[norm]
	if !ok || targetURL == "" {
		if PlatformDB != nil {
			var fetchedURL sql.NullString
			err := PlatformDB.Raw(`
				SELECT ti.database_url 
				FROM tenant_infrastructures ti
				LEFT JOIN "Organization" o ON LOWER(o.slug) = LOWER(ti.tenant_slug)
				WHERE (LOWER(ti.tenant_slug) = $1 OR LOWER(o.id::text) = $1 OR LOWER(o.slug) = $1)
				  AND ti.is_custom_db = true
				LIMIT 1`, norm).Scan(&fetchedURL).Error

			if err == nil && fetchedURL.Valid && fetchedURL.String != "" {
				targetURL = fetchedURL.String
				tenantDBUrls[norm] = targetURL
				ok = true
			}
		}
	}

	if !ok || targetURL == "" {
		return nil, fmt.Errorf("strict multi-tenancy: no dedicated database found for tenant '%s'", norm)
	}

	log.Printf("🐘 Initializing dedicated Neon project database pool for tenant '%s'...", norm)
	gdb, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  targetURL,
		PreferSimpleProtocol: true,
	}), &gorm.Config{
		PrepareStmt:                              false,
		DisableForeignKeyConstraintWhenMigrating: true,
		Logger:                                   logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to dedicated Neon DB for tenant '%s': %w", norm, err)
	}

	sDB, err := gdb.DB()
	if err == nil {
		sDB.SetMaxOpenConns(15)
		sDB.SetMaxIdleConns(5)
		sDB.SetConnMaxLifetime(15 * time.Minute)
	}

	tenantGormPools.Store(norm, gdb)

	// Auto migrate logistics tables onto this dedicated database if not present
	if !gdb.Migrator().HasTable(&models.Shipment{}) {
		err = gdb.AutoMigrate(
			&models.Shipment{},
			&models.Waypoint{},
			&models.CourierDriver{},
			&models.CourierPayoutAccount{},
			&models.DeliveryZoneRate{},
			&models.DispatchTicket{},
		)
		if err != nil {
			log.Printf("⚠️ Warning: AutoMigration on tenant '%s' DB failed: %v", norm, err)
		} else {
			log.Printf("✅ AutoMigrated logistics tables on dedicated DB for tenant '%s'", norm)
		}
	}

	return gdb, nil
}

// GetAllActiveTenants returns all tenant organizations and their database configs
func GetAllActiveTenants() ([]TenantOrgInfo, error) {
	if PlatformDB == nil {
		return nil, fmt.Errorf("platform database not initialized")
	}

	type QueryResult struct {
		ID          string
		Name        string
		Slug        string
		Domain      sql.NullString
		Logo        sql.NullString
		DatabaseURL sql.NullString
	}

	var results []QueryResult
	err := PlatformDB.Raw(`
		SELECT o.id, o.name, o.slug, o.domain, o.logo, ti.database_url
		FROM "Organization" o
		JOIN tenant_infrastructures ti ON LOWER(ti.tenant_slug) = LOWER(o.slug)
		WHERE ti.is_custom_db = true AND ti.database_url != ''
	`).Scan(&results).Error

	if err != nil {
		return nil, err
	}

	var tenants []TenantOrgInfo
	for _, r := range results {
		tenants = append(tenants, TenantOrgInfo{
			ID:           r.ID,
			Name:         r.Name,
			Slug:         r.Slug,
			Domain:       r.Domain.String,
			Logo:         r.Logo.String,
			PrimaryColor: "#146EF5",
			DatabaseURL:  r.DatabaseURL.String,
		})
	}
	return tenants, nil
}
