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

type Objective struct {
	ID            string           `json:"id"`
	Text          string           `json:"text"`
	Weight        int              `json:"weight"`
	Type          string           `json:"type"`
	ExpectedLevel *int             `json:"expectedLevel,omitempty"`
	Category      *string          `json:"category,omitempty"`
	Departments   *json.RawMessage `json:"departments,omitempty"`
	Description   *json.RawMessage `json:"description,omitempty"`
	SelfScore     *float64         `json:"selfScore,omitempty"`
	ManagerScore  *float64         `json:"managerScore,omitempty"`
	Comments      *string          `json:"comments,omitempty"`
	Evidence      *string          `json:"evidence,omitempty"`
	Feedback      *string          `json:"managerFeedback,omitempty"`
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

	// 1. Fetch all objectives from DB that should be in KHLC 6 review (6 competencies + 8 KHLC 6 objectives)
	rows, err := tx.Query("SELECT id, text, weight, type, expectedLevel, category, departments, description FROM Objective")
	if err != nil {
		log.Fatalf("Error querying objectives: %v", err)
	}

	var allObjs []Objective
	for rows.Next() {
		var o Objective
		var deptsJSON []byte
		var descJSON []byte
		if err := rows.Scan(&o.ID, &o.Text, &o.Weight, &o.Type, &o.ExpectedLevel, &o.Category, &deptsJSON, &descJSON); err != nil {
			log.Fatalf("Error scanning objective: %v", err)
		}
		if deptsJSON != nil {
			raw := json.RawMessage(deptsJSON)
			o.Departments = &raw
		}
		if descJSON != nil {
			raw := json.RawMessage(descJSON)
			o.Description = &raw
		}
		allObjs = append(allObjs, o)
	}
	rows.Close()

	// Filter down to the 14 targets for KHLC 6
	var targetObjectives []Objective
	for _, o := range allObjs {
		if o.Type == "competency" {
			targetObjectives = append(targetObjectives, o)
			continue
		}
		// Check departments array
		if o.Departments != nil {
			var depts []string
			if err := json.Unmarshal(*o.Departments, &depts); err == nil {
				for _, d := range depts {
					if d == "KHLC 6 (IT/Technical Support)" {
						targetObjectives = append(targetObjectives, o)
						break
					}
				}
			}
		}
	}

	fmt.Printf("Found %d target objectives for KHLC 6 (6 competencies + %d role-specific)\n", len(targetObjectives), len(targetObjectives)-6)

	// 2. Find any reviews for users whose department is "KHLC 6 (IT/Technical Support)"
	revRows, err := tx.Query("SELECT id, employeeName, objectivesJson, status FROM PerformanceReview WHERE department = 'KHLC 6 (IT/Technical Support)'")
	if err != nil {
		log.Fatalf("Error querying reviews: %v", err)
	}

	type ReviewItem struct {
		ID             string
		EmployeeName   string
		ObjectivesJSON string
		Status         string
	}
	var reviews []ReviewItem
	for revRows.Next() {
		var r ReviewItem
		if err := revRows.Scan(&r.ID, &r.EmployeeName, &r.ObjectivesJSON, &r.Status); err != nil {
			log.Fatalf("Error scanning review row: %v", err)
		}
		reviews = append(reviews, r)
	}
	revRows.Close()

	if len(reviews) == 0 {
		fmt.Println("No existing reviews found in database for KHLC 6 (IT/Technical Support) employees.")
		fmt.Println("They will be created with the correct objectives automatically next time the employee logs in.")
		return
	}

	for _, r := range reviews {
		var existingObjs []Objective
		if err := json.Unmarshal([]byte(r.ObjectivesJSON), &existingObjs); err != nil {
			log.Printf("Warning: Failed to unmarshal objectives JSON for review %s: %v", r.ID, err)
			continue
		}

		// Create a map of existing objective ID to the objective object (to preserve scores/comments)
		existingMap := make(map[string]Objective)
		for _, o := range existingObjs {
			existingMap[o.ID] = o
		}

		// Merge target objectives with existing scores
		var mergedObjs []Objective
		for _, target := range targetObjectives {
			merged := target
			if val, ok := existingMap[target.ID]; ok {
				// Preserve self scores, manager scores, comments, evidence, feedback
				merged.SelfScore = val.SelfScore
				merged.ManagerScore = val.ManagerScore
				merged.Comments = val.Comments
				merged.Evidence = val.Evidence
				merged.Feedback = val.Feedback
			}
			mergedObjs = append(mergedObjs, merged)
		}

		mergedJSON, err := json.Marshal(mergedObjs)
		if err != nil {
			log.Fatalf("Error marshaling merged objectives: %v", err)
		}

		// Update database
		_, err = tx.Exec("UPDATE PerformanceReview SET objectivesJson = ? WHERE id = ?", string(mergedJSON), r.ID)
		if err != nil {
			log.Fatalf("Error updating review record: %v", err)
		}
		fmt.Printf("Successfully updated objectives list for %s (Review ID: %s, Status: %s) to have all 14 metrics.\n", r.EmployeeName, r.ID, r.Status)
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("Error committing transaction: %v", err)
	}

	fmt.Println("Migration completed successfully!")
}
