package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	neonURL := "postgresql://neondb_owner:npg_t6UQAzVEqBO4@ep-falling-star-b4lrdr76.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
	db, err := sql.Open("pgx", neonURL)
	if err != nil {
		log.Fatalf("Failed to open Neon: %v", err)
	}
	defer db.Close()

	tables := []string{
		"User", "Organization", "WorkspaceMember", "Subscription",
		"Objective", "PerformanceReview", "ReviewCycle", "QuestChallenge", "QuestScheduleItem",
		"gtm_agent", "gtm_approval", "gtm_campaign", "gtm_lead", "gtm_strategy", "gtm_tenant_settings",
		"gtm_email_dispatch_log", "gtm_email_reply", "gtm_social_post_metrics",
	}

	searchVals := []string{"org-01", "1aa8c687-b71d-4188-9de2-371aa5dfa9e6", "neweratransports", "edusuite-ng", "paydirect-africa", "healthpulse-ng", "logitrack-express"}

	for _, tbl := range tables {
		for _, val := range searchVals {
			var count int
			// Query each table by checking if any column contains val
			query := fmt.Sprintf(`
				SELECT COUNT(*) FROM "%s" 
				WHERE CAST(t.* AS text) ILIKE '%%%s%%';
			`, tbl, val)
			err := db.QueryRow(query).Scan(&count)
			if err == nil && count > 0 {
				fmt.Printf("Table %-25s | Value %-36s : %d rows\n", tbl, val, count)
			}
		}
	}
}
