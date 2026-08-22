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

type User struct {
	ID         string
	Name       string
	Department string
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

type ReviewItem struct {
	ID             string
	EmployeeID     string
	EmployeeName   string
	Department     string
	ObjectivesJSON string
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

	// 1. Fetch all users
	userRows, err := tx.Query("SELECT id, name, department FROM User")
	if err != nil {
		log.Fatalf("Error querying users: %v", err)
	}
	var users []User
	for userRows.Next() {
		var u User
		if err := userRows.Scan(&u.ID, &u.Name, &u.Department); err != nil {
			log.Fatalf("Error scanning user: %v", err)
		}
		users = append(users, u)
	}
	userRows.Close()

	// 2. Fetch all global objectives
	objRows, err := tx.Query("SELECT id, text, weight, type, expectedLevel, category, departments, description FROM Objective")
	if err != nil {
		log.Fatalf("Error querying objectives: %v", err)
	}
	var allObjs []Objective
	for objRows.Next() {
		var o Objective
		var deptsJSON []byte
		var descJSON []byte
		if err := objRows.Scan(&o.ID, &o.Text, &o.Weight, &o.Type, &o.ExpectedLevel, &o.Category, &deptsJSON, &descJSON); err != nil {
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
	objRows.Close()

	// 3. Fetch reviews for the active cycle
	revRows, err := tx.Query("SELECT id, employeeId, employeeName, department, objectivesJson FROM PerformanceReview WHERE cycleId = 'CYC001'")
	if err != nil {
		log.Fatalf("Error querying reviews: %v", err)
	}
	var reviews []ReviewItem
	for revRows.Next() {
		var r ReviewItem
		if err := revRows.Scan(&r.ID, &r.EmployeeID, &r.EmployeeName, &r.Department, &r.ObjectivesJSON); err != nil {
			log.Fatalf("Error scanning review row: %v", err)
		}
		reviews = append(reviews, r)
	}
	revRows.Close()

	// Create user lookup map
	userMap := make(map[string]User)
	for _, u := range users {
		userMap[u.ID] = u
	}

	for _, rev := range reviews {
		user, exists := userMap[rev.EmployeeID]
		if !exists {
			continue
		}

		// Check if there is a department mismatch between the review and the user record
		if rev.Department != user.Department {
			fmt.Printf("Mismatch found for %s (%s): Review Dept='%s', User Dept='%s'\n",
				rev.EmployeeName, rev.EmployeeID, rev.Department, user.Department)

			// 1. Filter target objectives for user's NEW department
			var targetObjectives []Objective
			for _, o := range allObjs {
				if o.Type == "competency" {
					targetObjectives = append(targetObjectives, o)
					continue
				}
				if o.Departments != nil {
					var depts []string
					if err := json.Unmarshal(*o.Departments, &depts); err == nil {
						for _, d := range depts {
							if d == user.Department {
								targetObjectives = append(targetObjectives, o)
								break
							}
						}
					}
				}
			}

			// 2. Parse current scores in the review
			var currentObjs []Objective
			if err := json.Unmarshal([]byte(rev.ObjectivesJSON), &currentObjs); err != nil {
				log.Printf("Warning: Failed to unmarshal objectives JSON for review %s: %v", rev.ID, err)
				continue
			}

			// Create mapping of scores
			existingScores := make(map[string]Objective)
			for _, co := range currentObjs {
				existingScores[co.ID] = co
			}

			// Merge objectives
			var mergedObjs []Objective
			for _, target := range targetObjectives {
				merged := target
				if val, ok := existingScores[target.ID]; ok {
					merged.SelfScore = val.SelfScore
					merged.ManagerScore = val.ManagerScore
					merged.Comments = val.Comments
					merged.Evidence = val.Evidence
					merged.Feedback = val.Feedback
				}
				mergedObjs = append(mergedObjs, merged)
			}

			// 3. Recalculate Final Score
			var selfWorkWeightedSum float64
			var selfWorkTotalWeight int
			var selfCompWeightedSum float64
			var selfCompTotalWeight int

			var mgrWorkWeightedSum float64
			var mgrWorkTotalWeight int
			var mgrCompWeightedSum float64
			var mgrCompTotalWeight int

			for _, o := range mergedObjs {
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
				finalScore = (selfAvg * 0.3) + (mgrAvg * 0.7)
			} else {
				finalScore = mgrAvg
			}

			mergedJSON, err := json.Marshal(mergedObjs)
			if err != nil {
				log.Fatalf("Error marshaling merged JSON: %v", err)
			}

			// Update review in DB
			_, err = tx.Exec("UPDATE PerformanceReview SET department = ?, objectivesJson = ?, finalScore = ? WHERE id = ?",
				user.Department, string(mergedJSON), finalScore, rev.ID)
			if err != nil {
				log.Fatalf("Error executing update: %v", err)
			}

			fmt.Printf("Updated %s: review department set to '%s', objectives merged (%d items), finalScore recalculated to %.2f\n",
				rev.EmployeeName, user.Department, len(mergedObjs), finalScore)
		}
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("Error committing transaction: %v", err)
	}

	fmt.Println("Review department synchronization completed successfully!")
}
