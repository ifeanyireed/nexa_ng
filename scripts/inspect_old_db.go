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
		log.Fatalf("Failed to open MySQL: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping MySQL: %v", err)
	}
	fmt.Println(" Connected to MySQL successfully!")

	rows, err := db.Query("SHOW TABLES")
	if err != nil {
		log.Fatalf("Failed to list tables: %v", err)
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var table string
		if err := rows.Scan(&table); err == nil {
			tables = append(tables, table)
		}
	}

	fmt.Printf("Found %d tables in MySQL:\n", len(tables))
	for _, t := range tables {
		var count int
		countRow := db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM `%s`", t))
		_ = countRow.Scan(&count)
		fmt.Printf(" - %-35s: %d rows\n", t, count)
	}
}
