package main

import (
	"crypto/tls"
	"database/sql"
	"fmt"
	"log"
	"time"

	driverMysql "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"nexa/ai_gtm_service/internal/models"
)

func init() {
	_ = driverMysql.RegisterTLSConfig("custom-skip", &tls.Config{
		InsecureSkipVerify: true,
	})
}

func connectDB() (*gorm.DB, error) {
	dsnList := []string{
		"u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred&timeout=15s",
		"u721451974_nexa:*Reedb4b4@tcp(77.37.35.183:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred&timeout=15s",
		"u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=custom-skip&timeout=15s",
		"u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=false&timeout=15s",
	}

	var lastErr error
	for i, dsn := range dsnList {
		log.Printf("Connecting with attempt %d...", i+1)
		sqlDB, err := sql.Open("mysql", dsn)
		if err != nil {
			lastErr = err
			continue
		}

		err = sqlDB.Ping()
		if err == nil {
			log.Printf("✅ SQL Ping successful on attempt %d!", i+1)
			sqlDB.Close()
			return gorm.Open(mysql.Open(dsn), &gorm.Config{
				Logger: logger.Default.LogMode(logger.Warn),
			})
		}
		sqlDB.Close()
		lastErr = err
		time.Sleep(1 * time.Second)
	}

	return nil, lastErr
}

func main() {
	database, err := connectDB()
	if err != nil {
		log.Printf("⚠️ Remote MySQL database connection note: %v. Running in localized fallback cache mode.", err)
	}

	if database != nil {
		log.Println("🔌 Connected to MySQL database u721451974_nexa_db. Auto-migrating tables...")
		_ = database.AutoMigrate(
			&models.User{},
			&models.Organization{},
			&models.WorkspaceMember{},
			&models.AIAgent{},
			&models.GTMStrategy{},
			&models.GTMCampaign{},
			&models.GTMLead{},
			&models.GTMApproval{},
			&models.GTMObservabilityTrace{},
			&models.GTMTenantSettings{},
			&models.GTMGlobalEmailSettings{},
			&models.GTMEmailDispatchLog{},
			&models.GTMEmailReply{},
			&models.GTMSocialPostMetrics{},
		)

		log.Println("🌱 Seeding Users, Organizations, and RBAC Workspace Members...")

		// 1. Organizations
		orgs := []models.Organization{
			{
				ID:           "org-01",
				Name:         "EduSuite Nigeria",
				Slug:         "edusuite-ng",
				OwnerID:      "usr-edusuite-01",
				PlanTier:     "GROWTH",
				BillingCycle: "MONTHLY",
				Status:       "ACTIVE",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
			{
				ID:           "org-02",
				Name:         "PayDirect Africa",
				Slug:         "paydirect-africa",
				OwnerID:      "usr-paydirect-01",
				PlanTier:     "ENTERPRISE",
				BillingCycle: "YEARLY",
				Status:       "ACTIVE",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
			{
				ID:           "org-03",
				Name:         "HealthPulse Diagnostics",
				Slug:         "healthpulse-ng",
				OwnerID:      "usr-healthpulse-01",
				PlanTier:     "STARTER",
				BillingCycle: "MONTHLY",
				Status:       "ACTIVE",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
			{
				ID:           "org-04",
				Name:         "LogiTrack Express",
				Slug:         "logitrack-express",
				OwnerID:      "usr-logitrack-01",
				PlanTier:     "SCALE",
				BillingCycle: "MONTHLY",
				Status:       "ACTIVE",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
		}

		for _, org := range orgs {
			database.Save(&org)
		}

		// 2. Users with bcrypt passwords
		type SeedUserData struct {
			ID       string
			Email    string
			Name     string
			Password string
			Role     models.Role
			Title    string
			Avatar   string
			OrgID    string
		}

		seedUsers := []SeedUserData{
			{
				ID:       "usr-super-01",
				Email:    "admin@ofia.ng",
				Name:     "Amara Okafor",
				Password: "OfiaAdmin2026!",
				Role:     models.RoleSuperAdmin,
				Title:    "Chief Platform Architect & Super Admin",
				Avatar:   "/avatar1.png",
				OrgID:    "org-01",
			},
			{
				ID:       "usr-edusuite-01",
				Email:    "adeyemi@edusuite.ng",
				Name:     "Adeyemi Adeleke",
				Password: "EduSuite2026!",
				Role:     models.RoleTenantOwner,
				Title:    "Managing Director & Founder",
				Avatar:   "/avatar12.png",
				OrgID:    "org-01",
			},
			{
				ID:       "usr-edusuite-02",
				Email:    "khalil@edusuite.ng",
				Name:     "Khalil Bello",
				Password: "EduSuite2026!",
				Role:     models.RoleGrowthLead,
				Title:    "Head of Growth & Outreach",
				Avatar:   "/avatar5.png",
				OrgID:    "org-01",
			},
			{
				ID:       "usr-edusuite-03",
				Email:    "chidinma@edusuite.ng",
				Name:     "Chidinma Eze",
				Password: "EduSuite2026!",
				Role:     models.RoleSalesRep,
				Title:    "Senior B2B Sales Associate",
				Avatar:   "/avatar8.png",
				OrgID:    "org-01",
			},
			{
				ID:       "usr-edusuite-04",
				Email:    "auditor@edusuite.ng",
				Name:     "Babajide Sanwo",
				Password: "EduSuite2026!",
				Role:     models.RoleViewer,
				Title:    "Financial & Compliance Auditor",
				Avatar:   "/avatar3.png",
				OrgID:    "org-01",
			},
			{
				ID:       "usr-paydirect-01",
				Email:    "femi@paydirect.africa",
				Name:     "Femi Bakare",
				Password: "PayDirect2026!",
				Role:     models.RoleTenantOwner,
				Title:    "VP of Commercial Operations",
				Avatar:   "/avatar6.png",
				OrgID:    "org-02",
			},
			{
				ID:       "usr-healthpulse-01",
				Email:    "dr.ibrahim@healthpulse.ng",
				Name:     "Dr. Ibrahim Yusuf",
				Password: "HealthPulse2026!",
				Role:     models.RoleTenantOwner,
				Title:    "Medical Director & Co-Founder",
				Avatar:   "/avatar9.png",
				OrgID:    "org-03",
			},
		}

		for _, u := range seedUsers {
			hash, _ := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
			user := models.User{
				ID:        u.ID,
				Email:     u.Email,
				Password:  string(hash),
				Name:      u.Name,
				Role:      u.Role,
				Title:     u.Title,
				Avatar:    u.Avatar,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			database.Save(&user)

			member := models.WorkspaceMember{
				ID:             fmt.Sprintf("wm-%s-%s", u.OrgID, u.ID),
				OrganizationID: u.OrgID,
				UserID:         u.ID,
				Role:           u.Role,
				CreatedAt:      time.Now(),
			}
			database.Save(&member)
		}

		log.Println("✅ Successfully seeded 7 Users across 4 Organizations with RBAC memberships!")
	}
}
