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

	// 1. Update ReviewCycle departments JSON arrays
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
		found := false
		for _, d := range c.Depts {
			if d == "KHLC 6 (IT/Technical Support)" {
				found = true
				break
			}
		}
		if !found {
			// Find index of SU 1 to insert before it, or just append
			idx := -1
			for i, d := range c.Depts {
				if d == "SU 1 (Program Coordinator)" {
					idx = i
					break
				}
			}
			if idx != -1 {
				c.Depts = append(c.Depts[:idx], append([]string{"KHLC 6 (IT/Technical Support)"}, c.Depts[idx:]...)...)
			} else {
				c.Depts = append(c.Depts, "KHLC 6 (IT/Technical Support)")
			}
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

	// 2. Insert the 8 new KHLC 6 Objectives
	objs := []struct {
		ID          string
		Text        string
		Weight      int
		Type        string
		Category    *string
		Depts       string
		Description string
	}{
		{
			ID:          "OBJ_KHLC_SKILLUP_23",
			Text:        "System Readiness",
			Weight:      5,
			Type:        "objective",
			Depts:       `["KHLC 6 (IT/Technical Support)"]`,
			Description: `["All CBT computers functional before training/exams", "100% readiness before every session (Frequency: Every CBT session)"]`,
		},
		{
			ID:          "OBJ_KHLC_SKILLUP_24",
			Text:        "System Uptime",
			Weight:      5,
			Type:        "objective",
			Depts:       `["KHLC 6 (IT/Technical Support)"]`,
			Description: `["Availability of systems during training/exams", "99% uptime (Frequency: Monthly)"]`,
		},
		{
			ID:          "OBJ_KHLC_SKILLUP_25",
			Text:        "Preventive Maintenance",
			Weight:      5,
			Type:        "objective",
			Depts:       `["KHLC 6 (IT/Technical Support)"]`,
			Description: `["Completion of scheduled system maintenance checks", "100% completion (Frequency: Monthly)"]`,
		},
		{
			ID:          "OBJ_KHLC_SKILLUP_26",
			Text:        "User Support",
			Weight:      5,
			Type:        "objective",
			Depts:       `["KHLC 6 (IT/Technical Support)"]`,
			Description: `["Satisfaction level from students and instructors", "Minimum 90% satisfaction (Frequency: Quarterly)"]`,
		},
		{
			ID:          "OBJ_KHLC_SKILLUP_27",
			Text:        "IT Asset Management",
			Weight:      5,
			Type:        "objective",
			Depts:       `["KHLC 6 (IT/Technical Support)"]`,
			Description: `["Accuracy of equipment inventory records", "100% accurate inventory (Frequency: Quarterly)"]`,
		},
		{
			ID:          "OBJ_KHLC_SKILLUP_28",
			Text:        "Security Compliance",
			Weight:      5,
			Type:        "objective",
			Depts:       `["KHLC 6 (IT/Technical Support)"]`,
			Description: `["Systems protected with updated antivirus and security protocols", "100% compliance (Frequency: Monthly)"]`,
		},
		{
			ID:          "OBJ_KHLC_SKILLUP_29",
			Text:        "Incident Reporting",
			Weight:      5,
			Type:        "objective",
			Depts:       `["KHLC 6 (IT/Technical Support)"]`,
			Description: `["Documentation of technical incidents and resolutions", "Report submitted within 24 hours (Frequency: Per incident)"]`,
		},
		{
			ID:          "OBJ_KHLC_SKILLUP_30",
			Text:        "CBT Session Support",
			Weight:      5,
			Type:        "objective",
			Depts:       `["KHLC 6 (IT/Technical Support)"]`,
			Description: `["Number of CBT sessions conducted without technical disruption", "95% disruption-free sessions (Frequency: Monthly)"]`,
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

	if err := tx.Commit(); err != nil {
		log.Fatalf("Error committing transaction: %v", err)
	}

	fmt.Println("Migration completed successfully!")
}
