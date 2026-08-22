package main

import (
	"context"
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"nexa/ai_gtm_service/internal/email"
)

func main() {
	dsn := "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred&timeout=15s"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
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
