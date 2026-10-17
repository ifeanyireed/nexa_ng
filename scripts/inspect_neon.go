package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	neonURL := os.Getenv("DATABASE_URL")
	if neonURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}
	db, err := sql.Open("pgx", neonURL)
	if err != nil {
		log.Fatalf("Failed to open Neon: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping Neon: %v", err)
	}
	fmt.Println(" Connected to Neon PostgreSQL successfully!")

	rows, err := db.Query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
	if err != nil {
		log.Fatalf("Failed to query tables: %v", err)
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var t string
		if err := rows.Scan(&t); err == nil {
			tables = append(tables, t)
		}
	}

	fmt.Printf("Neon PostgreSQL currently has %d tables:\n", len(tables))
	for _, t := range tables {
		var count int
		countRow := db.QueryRow(fmt.Sprintf(`SELECT COUNT(*) FROM "%s"`, t))
		_ = countRow.Scan(&count)
		fmt.Printf(" - %-35s: %d rows\n", t, count)
	}
}
