package db

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"nexa/user_subscription_service/internal/models"
)

var DB *gorm.DB

func ParseDatabaseDSN(rawURL string) string {
	if rawURL == "" {
		return ""
	}

	rawURL = strings.TrimSpace(rawURL)

	// If it already contains standard Go MySQL TCP format: user:pass@tcp(host:port)/dbname
	if strings.Contains(rawURL, "@tcp(") {
		return rawURL
	}

	// Strip mysql:// or mariadb:// prefix if present
	clean := strings.TrimPrefix(rawURL, "mysql://")
	clean = strings.TrimPrefix(clean, "mariadb://")

	lastAtIndex := strings.LastIndex(clean, "@")
	if lastAtIndex != -1 {
		userInfo := clean[:lastAtIndex]
		hostAndDb := clean[lastAtIndex+1:]

		slashIndex := strings.Index(hostAndDb, "/")
		if slashIndex != -1 {
			hostPort := hostAndDb[:slashIndex]
			dbAndParams := hostAndDb[slashIndex+1:]

			if !strings.Contains(hostPort, ":") {
				hostPort = hostPort + ":3306"
			}

			if !strings.Contains(dbAndParams, "parseTime=") {
				if strings.Contains(dbAndParams, "?") {
					dbAndParams += "&charset=utf8mb4&parseTime=True&loc=Local&tls=preferred"
				} else {
					dbAndParams += "?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred"
				}
			}

			return fmt.Sprintf("%s@tcp(%s)/%s", userInfo, hostPort, dbAndParams)
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
	gormDB, err := gorm.Open(mysql.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Printf("⚠️ Warning: Failed to connect to MySQL database (%s): %v. Proceeding with offline DB readiness mode.", databaseURL, err)
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

	// Auto-migrate tables including User, RBAC matrix, and Subscription models
	_ = DB.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.WorkspaceMember{},
		&models.Subscription{},
		&models.SubscriptionPlan{},
		&models.OrganizationUsage{},
		&models.TenantRolePermission{},
		&models.TenantPermissionAuditLog{},
	)

	// Seed Super Admin users into MySQL database
	seedSuperAdmins(DB)

	log.Println("Database connection initialized successfully for service_users")
	return DB
}

func seedSuperAdmins(db *gorm.DB) {
	if db == nil {
		return
	}

	superAdmins := []struct {
		ID       string
		Email    string
		Password string
		Name     string
		Role     models.Role
	}{
		{
			ID:       "admin-root-01",
			Email:    "superadmin@ofia.ng",
			Password: "OfiaSuperAdmin2026!",
			Name:     "Adeyemi Phillips",
			Role:     models.RoleSuperAdmin,
		},
		{
			ID:       "admin-secops-02",
			Email:    "secops@ofia.ng",
			Password: "SecOpsAudit2026!",
			Name:     "Ibrahim Musa",
			Role:     models.RoleSuperAdmin,
		},
		{
			ID:       "admin-viewer-03",
			Email:    "auditor@ofia.ng",
			Password: "AuditorPass2026!",
			Name:     "Chioma Okonkwo",
			Role:     models.RoleViewer,
		},
	}

	for _, sa := range superAdmins {
		var count int64
		db.Model(&models.User{}).Where("email = ?", sa.Email).Count(&count)
		if count == 0 {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(sa.Password), bcrypt.DefaultCost)
			if err == nil {
				user := models.User{
					ID:        sa.ID,
					Email:     sa.Email,
					Password:  string(hashedPassword),
					Name:      sa.Name,
					Role:      sa.Role,
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				}
				if err := db.Create(&user).Error; err == nil {
					log.Printf("✅ Seeded SuperAdmin user in MySQL: %s (%s)", sa.Name, sa.Email)
				}
			}
		}
	}
}
