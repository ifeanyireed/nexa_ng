package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"nexa/ai_gtm_service/internal/email"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = os.Getenv("DB_DSN")
	}
	if dsn == "" {
		log.Fatal("DATABASE_URL or DB_DSN environment variable is required")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ DB connect error: %v", err)
	}

	orch := email.InitEmailOrchestrator(db)

	fmt.Println("🚀 Testing send to admin@ofia.ng...")
	res, err := orch.SendAgentEmail(context.Background(), email.OutboundEmail{
		OrganizationID: "platform_admin",
		To:             "admin@ofia.ng",
		Subject:        "Ofia Platform Email Infrastructure Verified - Admin Test",
		HTMLBody:       "<h2>Ofia AI Platform Email Infrastructure Verified</h2><p>This email confirms that the platform shared email infrastructure is healthy and operational.</p>",
		TextBody:       "Ofia AI Platform Email Infrastructure Verified. Dispatch handshake successful.",
	})

	if err != nil {
		fmt.Printf("❌ SendAgentEmail to admin@ofia.ng ERROR: %v\n", err)
	} else {
		fmt.Printf("✅ SendAgentEmail SUCCESS: MessageID=%s, Provider=%s, Status=%s, Latency=%v\n",
			res.MessageID, res.Provider, res.Status, res.Latency)
	}
}
