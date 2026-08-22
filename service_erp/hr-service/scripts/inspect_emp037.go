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

	var id, empId, name, dept, status, objs string
	err = db.QueryRow("SELECT id, employeeId, employeeName, department, status, objectivesJson FROM PerformanceReview WHERE employeeId = 'EMP037'").
		Scan(&id, &empId, &name, &dept, &status, &objs)
	if err != nil {
		log.Fatalf("Error querying review for EMP037: %v", err)
	}

	fmt.Printf("PerformanceReview: ID=%s, EmpID=%s, Name=%s, Dept='%s', Status=%s\n", id, empId, name, dept, status)
	fmt.Printf("ObjectivesJson has length: %d\n", len(objs))
	fmt.Println("Objectives list:")
	fmt.Println(objs)
}
