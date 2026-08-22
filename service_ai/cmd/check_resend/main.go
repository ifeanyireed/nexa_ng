package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"nexa/ai_gtm_service/internal/crypto"
)

func main() {
	dsn := "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred&timeout=15s"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("❌ sql.Open error: %v", err)
	}
	defer db.Close()

	fmt.Println("=================================================================")
	fmt.Println("🔍 1. INSPECTING ALL ROWS IN gtm_global_email_settings:")
	fmt.Println("=================================================================")
	rows, err := db.Query("SELECT id, platform_provider, platform_api_key_encrypted, platform_from_address, updated_at FROM gtm_global_email_settings")
	if err != nil {
		fmt.Printf("❌ Query gtm_global_email_settings err: %v\n", err)
	} else {
		defer rows.Close()
		count := 0
		for rows.Next() {
			count++
			var id, prov, keyEnc, fromAddr sql.NullString
			var updatedAt sql.NullTime
			if err := rows.Scan(&id, &prov, &keyEnc, &fromAddr, &updatedAt); err != nil {
				fmt.Printf("Scan err: %v\n", err)
				continue
			}
			fmt.Printf("Row #%d:\n", count)
			fmt.Printf("  • ID: %s\n", id.String)
			fmt.Printf("  • Provider: %s\n", prov.String)
			fmt.Printf("  • From Address: %s\n", fromAddr.String)
			if updatedAt.Valid {
				fmt.Printf("  • Updated At: %s\n", updatedAt.Time.Format(time.RFC1123))
			}
			if keyEnc.Valid && keyEnc.String != "" {
				decKey, err := crypto.Decrypt(keyEnc.String)
				if err != nil {
					fmt.Printf("  • API Key Encrypted: Present (len=%d chars), Decryption error: %v\n", len(keyEnc.String), err)
				} else {
					fmt.Printf("  • API Key Stored & Decrypted: %s (Length: %d, Starts with: '%s...')\n",
						crypto.MaskSecret(decKey), len(decKey), prefix(decKey, 8))
				}
			} else {
				fmt.Printf("  • API Key: [NULL or EMPTY]\n")
			}
		}
		if count == 0 {
			fmt.Println("  ⚠️ Table gtm_global_email_settings is empty.")
		}
	}

	fmt.Println("\n=================================================================")
	fmt.Println("🔍 2. INSPECTING COLUMNS OF gtm_tenant_settings:")
	fmt.Println("=================================================================")
	cRows, err := db.Query("DESCRIBE gtm_tenant_settings")
	if err != nil {
		fmt.Printf("❌ Describe gtm_tenant_settings: %v\n", err)
	} else {
		defer cRows.Close()
		for cRows.Next() {
			var field, typ, null, key, extra sql.NullString
			var def sql.NullString
			if err := cRows.Scan(&field, &typ, &null, &key, &def, &extra); err == nil {
				fmt.Printf("  - %-30s %-20s\n", field.String, typ.String)
			}
		}
	}

	fmt.Println("\n=================================================================")
	fmt.Println("🔍 3. INSPECTING ALL ROWS IN gtm_tenant_settings:")
	fmt.Println("=================================================================")
	tRows, err := db.Query("SELECT id, organization_id, email_provider, updated_at FROM gtm_tenant_settings")
	if err != nil {
		fmt.Printf("❌ Query gtm_tenant_settings: %v\n", err)
	} else {
		defer tRows.Close()
		for tRows.Next() {
			var id, orgID, emailProv sql.NullString
			var updatedAt sql.NullTime
			if err := tRows.Scan(&id, &orgID, &emailProv, &updatedAt); err == nil {
				fmt.Printf("Tenant Setting: ID=%s, Org=%s, Provider=%s, Updated=%v\n",
					id.String, orgID.String, emailProv.String, updatedAt.Time.Format(time.RFC1123))
			}
		}
	}
}

func prefix(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}
