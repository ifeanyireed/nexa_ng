package main

import (
	"bufio"
	"database/sql"
	"encoding/json"
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

type ReviewObj struct {
	ID           string   `json:"id"`
	Type         string   `json:"type"`
	Weight       int      `json:"weight"`
	SelfScore    *float64 `json:"selfScore"`
	ManagerScore *float64 `json:"managerScore"`
}

func main() {
	loadEnv("/Users/user/Downloads/nets_erp/hr-service/.env")
	dsn := getDSN()

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error opening connection: %v", err)
	}
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Error starting transaction: %v", err)
	}
	defer tx.Rollback()

	rows, err := tx.Query("SELECT id, employeeName, objectivesJson FROM PerformanceReview")
	if err != nil {
		log.Fatalf("Error querying PerformanceReviews: %v", err)
	}

	type ReviewItem struct {
		ID             string
		EmployeeName   string
		ObjectivesJSON string
	}
	var reviews []ReviewItem
	for rows.Next() {
		var r ReviewItem
		if err := rows.Scan(&r.ID, &r.EmployeeName, &r.ObjectivesJSON); err != nil {
			log.Fatalf("Error scanning review row: %v", err)
		}
		reviews = append(reviews, r)
	}
	rows.Close()

	for _, r := range reviews {
		if r.ObjectivesJSON == "" {
			continue
		}

		var objs []ReviewObj
		if err := json.Unmarshal([]byte(r.ObjectivesJSON), &objs); err != nil {
			log.Printf("Warning: Failed to unmarshal objectives for review %s: %v", r.ID, err)
			continue
		}

		// 1. Calculate self-assessment category averages
		var selfWorkWeightedSum float64
		var selfWorkTotalWeight int
		var selfCompWeightedSum float64
		var selfCompTotalWeight int

		// 2. Calculate manager-assessment category averages
		var mgrWorkWeightedSum float64
		var mgrWorkTotalWeight int
		var mgrCompWeightedSum float64
		var mgrCompTotalWeight int

		for _, o := range objs {
			if o.SelfScore != nil {
				var normalized float64
				if o.Type == "objective" {
					normalized = *o.SelfScore / 10.0
					selfWorkWeightedSum += normalized * float64(o.Weight)
					selfWorkTotalWeight += o.Weight
				} else {
					normalized = *o.SelfScore * 2.0
					selfCompWeightedSum += normalized * float64(o.Weight)
					selfCompTotalWeight += o.Weight
				}
			}
			if o.ManagerScore != nil {
				var normalized float64
				if o.Type == "objective" {
					normalized = *o.ManagerScore / 10.0
					mgrWorkWeightedSum += normalized * float64(o.Weight)
					mgrWorkTotalWeight += o.Weight
				} else {
					normalized = *o.ManagerScore * 2.0
					mgrCompWeightedSum += normalized * float64(o.Weight)
					mgrCompTotalWeight += o.Weight
				}
			}
		}

		var selfAvg float64
		var selfWorkAvg float64
		var selfCompAvg float64

		if selfWorkTotalWeight > 0 {
			selfWorkAvg = selfWorkWeightedSum / float64(selfWorkTotalWeight)
		}
		if selfCompTotalWeight > 0 {
			selfCompAvg = selfCompWeightedSum / float64(selfCompTotalWeight)
		}

		if selfWorkTotalWeight > 0 && selfCompTotalWeight > 0 {
			selfAvg = (selfWorkAvg * 0.7) + (selfCompAvg * 0.3)
		} else if selfWorkTotalWeight > 0 {
			selfAvg = selfWorkAvg
		} else if selfCompTotalWeight > 0 {
			selfAvg = selfCompAvg
		}

		var mgrAvg float64
		var mgrWorkAvg float64
		var mgrCompAvg float64

		if mgrWorkTotalWeight > 0 {
			mgrWorkAvg = mgrWorkWeightedSum / float64(mgrWorkTotalWeight)
		}
		if mgrCompTotalWeight > 0 {
			mgrCompAvg = mgrCompWeightedSum / float64(mgrCompTotalWeight)
		}

		if mgrWorkTotalWeight > 0 && mgrCompTotalWeight > 0 {
			mgrAvg = (mgrWorkAvg * 0.7) + (mgrCompAvg * 0.3)
		} else if mgrWorkTotalWeight > 0 {
			mgrAvg = mgrWorkAvg
		} else if mgrCompTotalWeight > 0 {
			mgrAvg = mgrCompAvg
		}

		var finalScore float64
		if selfWorkTotalWeight > 0 || selfCompTotalWeight > 0 {
			// If self scores are available, combine self (30%) and manager (70%)
			finalScore = (selfAvg * 0.3) + (mgrAvg * 0.7)
		} else {
			// Otherwise just use manager score
			finalScore = mgrAvg
		}

		// Update database review finalScore
		_, err = tx.Exec("UPDATE PerformanceReview SET finalScore = ? WHERE id = ?", finalScore, r.ID)
		if err != nil {
			log.Fatalf("Error updating review score for %s: %v", r.ID, err)
		}
		fmt.Printf("Recalculated & updated review score for %s (%s): Final Score = %.2f\n", r.EmployeeName, r.ID, finalScore)
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("Error committing transaction: %v", err)
	}

	fmt.Println("Recalculation and database update completed successfully!")
}
