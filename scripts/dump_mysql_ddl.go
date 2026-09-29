package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	dsn := "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	tables := []string{"User", "Organization", "WorkspaceMember", "Objective", "ReviewCycle", "PerformanceReview", "ProProfile", "Product", "Service", "QuestChallenge", "QuestScheduleItem", "gtm_agent", "gtm_campaign", "gtm_approval", "gtm_lead", "gtm_strategy", "gtm_tenant_settings", "gtm_email_dispatch_log", "gtm_email_reply", "gtm_global_email_settings", "gtm_social_post_metrics", "waitlist_leads"}

	for _, t := range tables {
		var name, createSQL string
		row := db.QueryRow("SHOW CREATE TABLE `" + t + "`")
		if err := row.Scan(&name, &createSQL); err != nil {
			fmt.Printf("Error for %s: %v\n", t, err)
			continue
		}
		fmt.Printf("--- TABLE: %s ---\n%s\n\n", name, createSQL)
	}
}
