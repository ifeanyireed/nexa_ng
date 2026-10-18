package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	reedbreedDB := "postgresql://neondb_owner:npg_Nw9HiC5DWeXJ@ep-jolly-art-b47p157j-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  reedbreedDB,
		PreferSimpleProtocol: true,
	}), &gorm.Config{
		PrepareStmt: false,
	})
	if err != nil {
		log.Fatalf("DB error: %v", err)
	}

	rawDB, _ := db.DB()
	defer rawDB.Close()

	stmts := []string{
		`ALTER TABLE courier_drivers ADD COLUMN IF NOT EXISTS email VARCHAR(128);`,
		`ALTER TABLE courier_drivers ADD COLUMN IF NOT EXISTS address TEXT;`,
		`ALTER TABLE courier_drivers ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(128);`,
		`CREATE TABLE IF NOT EXISTS courier_payout_accounts (
			id VARCHAR(64) PRIMARY KEY,
			org_id VARCHAR(64),
			courier_id VARCHAR(64),
			bank_name VARCHAR(128),
			bank_code VARCHAR(32),
			account_number VARCHAR(32),
			account_name VARCHAR(128),
			is_primary BOOLEAN DEFAULT false,
			is_verified BOOLEAN DEFAULT true,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_courier_payout_accounts_courier_id ON courier_payout_accounts(courier_id);`,
	}

	for _, stmt := range stmts {
		if _, err := rawDB.Exec(stmt); err != nil {
			log.Printf("Error running stmt: %v\n  stmt: %s", err, stmt)
		} else {
			fmt.Printf("✅ Executed: %s\n", stmt[:min(len(stmt), 60)])
		}
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
