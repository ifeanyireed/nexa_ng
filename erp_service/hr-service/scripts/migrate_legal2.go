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
		log.Fatalf("Error beginning transaction: %v", err)
	}
	defer tx.Rollback()

	// 1. Update ReviewCycle departments JSON arrays: rename "Legal 2 (Legal Counsel)" to "Legal 2 (Legal Counsel & PM)"
	rows, err := tx.Query("SELECT id, departments FROM ReviewCycle")
	if err != nil {
		log.Fatalf("Error querying cycles: %v", err)
	}
	
	type CycleDepts struct {
		ID    string
		Depts []string
	}
	var cycles []CycleDepts
	for rows.Next() {
		var id string
		var deptsJSON sql.NullString
		if err := rows.Scan(&id, &deptsJSON); err != nil {
			log.Fatalf("Error scanning cycles: %v", err)
		}
		var depts []string
		if deptsJSON.Valid && deptsJSON.String != "" {
			if err := json.Unmarshal([]byte(deptsJSON.String), &depts); err != nil {
				log.Printf("Warning: Failed to unmarshal departments for cycle %s: %v. Starting with empty list.", id, err)
				depts = []string{}
			}
		}
		cycles = append(cycles, CycleDepts{ID: id, Depts: depts})
	}
	rows.Close()

	for _, c := range cycles {
		updated := false
		for i, d := range c.Depts {
			if d == "Legal 2 (Legal Counsel)" {
				c.Depts[i] = "Legal 2 (Legal Counsel & PM)"
				updated = true
			}
		}
		if updated {
			newJSON, err := json.Marshal(c.Depts)
			if err != nil {
				log.Fatalf("Error marshaling updated departments: %v", err)
			}
			_, err = tx.Exec("UPDATE ReviewCycle SET departments = ? WHERE id = ?", string(newJSON), c.ID)
			if err != nil {
				log.Fatalf("Error updating ReviewCycle: %v", err)
			}
			fmt.Printf("Updated ReviewCycle %s departments.\n", c.ID)
		}
	}

	// 2. Insert/Update the Legal 2 Objectives (OBJ_LEGAL_3 to OBJ_LEGAL_9)
	objs := []struct {
		ID          string
		Text        string
		Weight      int
		Type        string
		Depts       string
		Description string
	}{
		{
			ID:          "OBJ_LEGAL_3",
			Text:        "Cycle time for executing contractual agreements",
			Weight:      6,
			Type:        "objective",
			Depts:       `["Legal 2 (Legal Counsel & PM)"]`,
			Description: `["Reduce the average contract review time to 3 business days or less within the next 12 months."]`,
		},
		{
			ID:          "OBJ_LEGAL_4",
			Text:        "Cycle time for drafting agreements",
			Weight:      6,
			Type:        "objective",
			Depts:       `["Legal 2 (Legal Counsel & PM)"]`,
			Description: `["Maintain a draft accuracy rate of 95% or better, with no material errors, within the next 12 months.","Reviewing contracts and drafting legal documents within 24 hours of receiving the request."]`,
		},
		{
			ID:          "OBJ_LEGAL_5",
			Text:        "Risk Management and Compliance",
			Weight:      6,
			Type:        "objective",
			Depts:       `["Legal 2 (Legal Counsel & PM)"]`,
			Description: `["Reduce potential legal exposure by 10 – 15% annually through proactive measures.","Maintain a regulatory compliance rate of 100%, with no material fines or penalties within the next 12 months."]`,
		},
		{
			ID:          "OBJ_LEGAL_6",
			Text:        "Policy and Procedure Updates",
			Weight:      6,
			Type:        "objective",
			Depts:       `["Legal 2 (Legal Counsel & PM)"]`,
			Description: `["Quarterly review of policy document to ensure 100% adherence to relevant laws and regulations.","Draft new company policy documents that are in line with new legislative laws within 5 working days."]`,
		},
		{
			ID:          "OBJ_LEGAL_7",
			Text:        "Reporting and Document Management",
			Weight:      6,
			Type:        "objective",
			Depts:       `["Legal 2 (Legal Counsel & PM)"]`,
			Description: `["Submit an accurate weekly/ activity report before the close of business on Fridays.","Submit an accurate quarterly report before the quarterly review.","Conduct quarterly audit and maintenance of legal documents with a 90% accuracy.","Maintain accurate and up-to-date documents and records, with 100% compliance with document management policies within the next 6 months."]`,
		},
		{
			ID:          "OBJ_LEGAL_8",
			Text:        "Legal Counsel",
			Weight:      5,
			Type:        "objective",
			Depts:       `["Legal 2 (Legal Counsel & PM)"]`,
			Description: `["Represent the company periodically in legal proceedings/meetings."]`,
		},
		{
			ID:          "OBJ_LEGAL_9",
			Text:        "Property Management",
			Weight:      5,
			Type:        "objective",
			Depts:       `["Legal 2 (Legal Counsel & PM)"]`,
			Description: `["Ensure timely renewal of leases, permits, and property documentation.","Conduct regular facility inspections and ensure prompt resolution of maintenance issues.","Maintain company properties in safe and functional condition within approved budgets."]`,
		},
	}

	for _, o := range objs {
		var exists int
		err := tx.QueryRow("SELECT COUNT(*) FROM Objective WHERE id = ?", o.ID).Scan(&exists)
		if err != nil {
			log.Fatalf("Error checking if objective exists: %v", err)
		}
		if exists == 0 {
			_, err = tx.Exec("INSERT INTO Objective (id, text, weight, type, expectedLevel, category, departments, description) VALUES (?, ?, ?, ?, NULL, NULL, ?, ?)",
				o.ID, o.Text, o.Weight, o.Type, o.Depts, o.Description)
			if err != nil {
				log.Fatalf("Error inserting objective: %v", err)
			}
			fmt.Printf("Inserted Objective %s.\n", o.ID)
		} else {
			_, err = tx.Exec("UPDATE Objective SET text = ?, weight = ?, type = ?, departments = ?, description = ? WHERE id = ?",
				o.Text, o.Weight, o.Type, o.Depts, o.Description, o.ID)
			if err != nil {
				log.Fatalf("Error updating objective: %v", err)
			}
			fmt.Printf("Updated Objective %s.\n", o.ID)
		}
	}

	// 3. Move the users (EMP030) to Legal 2 (Legal Counsel & PM)
	res, err := tx.Exec("UPDATE User SET department = 'Legal 2 (Legal Counsel & PM)' WHERE department = 'Legal 2 (Legal Counsel)' OR id = 'EMP030'")
	if err != nil {
		log.Fatalf("Error updating user departments: %v", err)
	}
	affected, _ := res.RowsAffected()
	fmt.Printf("Updated department for %d user(s) (Harriet).\n", affected)

	if err := tx.Commit(); err != nil {
		log.Fatalf("Error committing transaction: %v", err)
	}

	fmt.Println("Migration completed successfully!")
}
