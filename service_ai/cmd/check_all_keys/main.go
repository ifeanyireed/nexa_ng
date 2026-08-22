package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
	"nexa/ai_gtm_service/internal/crypto"
)

func main() {
	dsn := "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred&timeout=15s"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("❌ sql.Open: %v", err)
	}
	defer db.Close()

	fmt.Println("=== 1. gtm_global_email_settings ===")
	gRows, err := db.Query("SELECT id, platform_provider, platform_api_key_encrypted, platform_from_address, updated_at FROM gtm_global_email_settings")
	if err == nil {
		defer gRows.Close()
		for gRows.Next() {
			var id, prov, keyEnc, fromAddr, upd sql.NullString
			gRows.Scan(&id, &prov, &keyEnc, &fromAddr, &upd)
			fmt.Printf("Global: ID=%s, Provider=%s, From=%s, Updated=%s\n", id.String, prov.String, fromAddr.String, upd.String)
			if keyEnc.Valid && keyEnc.String != "" {
				dec, err := crypto.Decrypt(keyEnc.String)
				fmt.Printf("  -> Platform API Key: %s (Err=%v)\n", crypto.MaskSecret(dec), err)
			} else {
				fmt.Printf("  -> Platform API Key: NULL/EMPTY\n")
			}
		}
	}

	fmt.Println("\n=== 2. gtm_tenant_settings ===")
	tRows, err := db.Query("SELECT id, organizationId, organization_id, emailProvider, email_provider, emailApiKeyEncrypted, email_api_key_encrypted FROM gtm_tenant_settings")
	if err == nil {
		defer tRows.Close()
		for tRows.Next() {
			var id, org1, org2, p1, p2, k1, k2 sql.NullString
			tRows.Scan(&id, &org1, &org2, &p1, &p2, &k1, &k2)
			fmt.Printf("Tenant Setting ID=%s | OrgId=%s/%s | Provider=%s/%s\n", id.String, org1.String, org2.String, p1.String, p2.String)
			if k1.Valid && k1.String != "" {
				dec, _ := crypto.Decrypt(k1.String)
				fmt.Printf("  -> emailApiKeyEncrypted: %s\n", crypto.MaskSecret(dec))
			}
			if k2.Valid && k2.String != "" {
				dec, _ := crypto.Decrypt(k2.String)
				fmt.Printf("  -> email_api_key_encrypted: %s\n", crypto.MaskSecret(dec))
			}
		}
	}
}
