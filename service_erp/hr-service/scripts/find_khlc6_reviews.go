package main

import (
	"bufio"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

func loadEnv(filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "#") || strings.TrimSpace(line) == "" {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.Trim(strings.TrimSpace(parts[1]), "\"")
			os.Setenv(key, value)
		}
	}
}

func getDSN() string {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return "u721451974_nets:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nets_db?parseTime=true&loc=Local"
	}
	if strings.HasPrefix(dbURL, "mysql://") {
		dbURL = strings.TrimPrefix(dbURL, "mysql://")
		parts := strings.SplitN(dbURL, "@", 2)
		if len(parts) == 2 {
			creds := parts[0]
			hostPath := parts[1]
			hostParts := strings.SplitN(hostPath, "/", 2)
			if len(hostParts) == 2 {
				hostPort := hostParts[0]
				dbNameAndParams := hostParts[1]
				if !strings.Contains(dbNameAndParams, "parseTime=") {
					if strings.Contains(dbNameAndParams, "?") {
						dbNameAndParams += "&parseTime=true&loc=Local"
					} else {
						dbNameAndParams += "?parseTime=true&loc=Local"
					}
				}
				return fmt.Sprintf("%s@tcp(%s)/%s", creds, hostPort, dbNameAndParams)
			}
		}
	}
	return dbURL
}

func main() {
	loadEnv("/Users/user/Downloads/nets_erp/hr-service/.env")
	dsn := getDSN()

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error opening connection: %v", err)
	}
	defer db.Close()

	// 1. Check all users in KHLC 6
	fmt.Println("--- USERS IN KHLC 6 ---")
	rows, err := db.Query("SELECT id, name, department, role FROM User WHERE department LIKE '%KHLC 6%'")
	if err != nil {
		log.Fatalf("Error querying users: %v", err)
	}
	for rows.Next() {
		var id, name, dept, role string
		rows.Scan(&id, &name, &dept, &role)
		fmt.Printf("User: ID=%s, Name=%s, Dept='%s', Role=%s\n", id, name, dept, role)
	}
	rows.Close()

	// 2. Check all reviews with KHLC 6
	fmt.Println("\n--- REVIEWS WITH KHLC 6 ---")
	rows, err = db.Query("SELECT id, employeeId, employeeName, department, status FROM PerformanceReview WHERE department LIKE '%KHLC 6%'")
	if err != nil {
		log.Fatalf("Error querying reviews: %v", err)
	}
	for rows.Next() {
		var id, empId, name, dept, status string
		rows.Scan(&id, &empId, &name, &dept, &status)
		fmt.Printf("Review: ID=%s, EmpID=%s, Name=%s, Dept='%s', Status=%s\n", id, empId, name, dept, status)
	}
	rows.Close()

	// 3. Print all reviews in the database to see if there is any mismatched user
	fmt.Println("\n--- ALL REVIEWS (FIRST 15) ---")
	rows, err = db.Query("SELECT id, employeeId, employeeName, department, status FROM PerformanceReview LIMIT 15")
	if err != nil {
		log.Fatalf("Error querying all reviews: %v", err)
	}
	for rows.Next() {
		var id, empId, name, dept, status string
		rows.Scan(&id, &empId, &name, &dept, &status)
		fmt.Printf("Review: ID=%s, EmpID=%s, Name=%s, Dept='%s', Status=%s\n", id, empId, name, dept, status)
	}
	rows.Close()
}
