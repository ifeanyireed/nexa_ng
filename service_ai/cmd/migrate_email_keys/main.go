package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	dsn := "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred&timeout=15s"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("❌ sql.Open error: %v", err)
	}
	defer db.Close()

	fmt.Println("🛠️ Ensuring distinct columns for Resend and Brevo in MySQL...")

	// 1. Alter gtm_global_email_settings
	stmts := []string{
		"ALTER TABLE gtm_global_email_settings ADD COLUMN IF NOT EXISTS resend_api_key_encrypted TEXT AFTER platform_api_key_encrypted",
		"ALTER TABLE gtm_global_email_settings ADD COLUMN IF NOT EXISTS brevo_api_key_encrypted TEXT AFTER resend_api_key_encrypted",
		"ALTER TABLE gtm_tenant_settings ADD COLUMN IF NOT EXISTS resend_api_key_encrypted TEXT AFTER email_api_key_encrypted",
		"ALTER TABLE gtm_tenant_settings ADD COLUMN IF NOT EXISTS brevo_api_key_encrypted TEXT AFTER resend_api_key_encrypted",
	}

	for _, stmt := range stmts {
		_, err := db.Exec(stmt)
		if err != nil {
			// MySQL versions without IF NOT EXISTS support
			fmt.Printf("Note on '%s': %v\n", stmt, err)
		} else {
			fmt.Printf("✅ Executed: %s\n", stmt)
		}
	}

	fmt.Println("\n🔍 Describing gtm_global_email_settings:")
	gRows, err := db.Query("DESCRIBE gtm_global_email_settings")
	if err == nil {
		defer gRows.Close()
		for gRows.Next() {
			var f, t, n, k, d, e sql.NullString
			gRows.Scan(&f, &t, &n, &k, &d, &e)
			fmt.Printf("  • %-30s %-15s\n", f.String, t.String)
		}
	}
}
