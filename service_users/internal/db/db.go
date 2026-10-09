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
		&models.BlogPost{},
		&models.BlogCategory{},
		&models.BlogTag{},
		&models.BlogComment{},
		&models.BlogSubscriber{},
	)

	seedSuperAdmins(DB)
	seedBlogContent(DB)

	log.Println("Database connection initialized successfully for service_users")
	return DB
}

func seedBlogContent(db *gorm.DB) {
	if db == nil {
		return
	}

	categories := []models.BlogCategory{
		{ID: "cat-eco-01", Name: "Ecosystem & AI", Slug: "ecosystem-and-ai", CreatedAt: time.Now()},
		{ID: "cat-ret-02", Name: "Retail & Commerce", Slug: "retail-and-commerce", CreatedAt: time.Now()},
		{ID: "cat-log-03", Name: "Fleet & Logistics", Slug: "fleet-and-logistics", CreatedAt: time.Now()},
		{ID: "cat-upd-04", Name: "Platform Updates", Slug: "platform-updates", CreatedAt: time.Now()},
	}

	for _, cat := range categories {
		var count int64
		db.Model(&models.BlogCategory{}).Where("id = ? OR slug = ?", cat.ID, cat.Slug).Count(&count)
		if count == 0 {
			db.Create(&cat)
		}
	}

	var postCount int64
	db.Model(&models.BlogPost{}).Count(&postCount)
	if postCount == 0 {
		now := time.Now()
		catEco := "cat-eco-01"
		catRet := "cat-ret-02"
		catLog := "cat-log-03"

		posts := []models.BlogPost{
			{
				ID:          "post-seed-01",
				Title:       "Unveiling Ofia: Autonomous AI Swarms & Next-Gen African Commerce",
				Slug:        "unveiling-ofia-autonomous-ai-swarms",
				Excerpt:     "How Ofia is transforming enterprise commerce in Nigeria through autonomous lead qualification, real-time escrow, and intelligent multi-tenant workflows.",
				Content:     "<h2>The Future of African Commerce Has Arrived</h2><p>Today marks a major milestone as Ofia officially unveils our unified suite of enterprise tools built specifically for fast-growing businesses across Nigeria and West Africa.</p><p>From high-volume logistics and distributed point-of-sale systems to autonomous AI agents driving customer acquisition, the Ofia platform removes friction at every step of modern trade.</p><h3>Why Autonomous AI Matters for Emerging Markets</h3><p>Traditional CRM tools require endless manual data entry and disjointed communication channels. In high-velocity commercial environments like Lagos, Kano, and Port Harcourt, deals move rapidly across WhatsApp, direct calls, and store visits.</p><p>Our AI Swarm continuously monitors lead inquiries, automates customer follow-ups, and integrates directly with live inventory and escrow payouts.</p>",
				CoverImage:  "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png",
				CategoryID:  &catEco,
				Tags:        "AI, Innovation, Ecosystem",
				Status:      "PUBLISHED",
				AuthorName:  "Grace Jude",
				PublishedAt: &now,
				CreatedAt:   now,
				UpdatedAt:   now,
			},
			{
				ID:          "post-seed-02",
				Title:       "How Ofia Compass Bridges Offline Merchants with Escrow Commerce",
				Slug:        "how-ofia-compass-bridges-offline-merchants",
				Excerpt:     "Empowering brick-and-mortar retailers with digital storefronts, verified technician dispatch, and dispute-free escrow payments.",
				Content:     "<h2>Modernizing the Retail Storefront</h2><p>Thousands of trade merchants across computer villages and open markets rely on word-of-mouth and cash payments. Ofia Compass bridges this gap by providing instantly provisioned custom storefronts backed by verified merchant badges.</p><p>With built-in escrow, buyers across different states can transact confidently knowing their funds are protected until verified delivery.</p>",
				CoverImage:  "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/aa9nvrmyrc38lbpz1mkp.png",
				CategoryID:  &catRet,
				Tags:        "Commerce, Escrow, Merchants",
				Status:      "PUBLISHED",
				AuthorName:  "Ofia Editorial Team",
				PublishedAt: &now,
				CreatedAt:   now,
				UpdatedAt:   now,
			},
			{
				ID:          "post-seed-03",
				Title:       "Real-Time Fleet Dispatch: Scaling Nationwide Last-Mile Logistics",
				Slug:        "real-time-fleet-dispatch-last-mile-logistics",
				Excerpt:     "Inside Ofia's dispatch engine: how automated waybills, rider rating indicators, and smart batching eliminate logistics bottlenecks.",
				Content:     "<h2>Reliable Logistics is the Backbone of Trade</h2><p>Every commercial ecosystem succeeds or stumbles based on its logistics backbone. With the launch of our updated mobile rider and customer tracking applications, Ofia Logistics now offers automated rider dispatch and proof-of-delivery.</p><p>Merchants can track shipments across state corridors with complete transparency, minimizing transit delays and eliminating lost parcels.</p>",
				CoverImage:  "https://res.cloudinary.com/qsdwzejd/image/upload/v1789250607/landing_page/photo13.jpg",
				CategoryID:  &catLog,
				Tags:        "Logistics, Dispatch, Riders",
				Status:      "PUBLISHED",
				AuthorName:  "Ibrahim Musa",
				PublishedAt: &now,
				CreatedAt:   now,
				UpdatedAt:   now,
			},
		}

		for _, p := range posts {
			db.Create(&p)
		}
		log.Println("✅ Seeded initial Ofia blog categories and articles")
	}
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
			Email:    "grace.jude@ofia.ng",
			Password: "OfiaSuperAdmin2026!",
			Name:     "Grace Jude",
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
