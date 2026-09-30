package db

import (
	"log"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"nexa/user_subscription_service/internal/models"
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
		DisableForeignKeyConstraintWhenMigrating: true,
		Logger:                                   logger.Default.LogMode(logger.Warn),
		PrepareStmt:                              true, // Optimizes execution for Postgres
	})
	if err != nil {
		log.Printf("⚠️ Warning: Failed to connect to Neon database: %v. Proceeding with offline DB readiness mode.", err)
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

	// Auto-migrate tables
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
					log.Printf("✅ Seeded SuperAdmin user in Neon Postgres: %s (%s)", sa.Name, sa.Email)
				}
			}
		}
	}
}
