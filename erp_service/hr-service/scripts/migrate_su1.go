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
			if d == "SU 1 (Program Coordinator)" {
				found = true
				break
			}
		}
		if !found {
			c.Depts = append(c.Depts, "SU 1 (Program Coordinator)")
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

	// 2. Insert the 5 new SU 1 Objectives
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
			ID:     "OBJ_SU_SKILLUP_1",
			Text:   "Program Planning & Coordination",
			Weight: 8,
			Type:   "objective",
			Depts:  `["SU 1 (Program Coordinator)"]`,
			Description: `["Develop and implement training schedules and skill-up calendars for various cohorts, as well as courses offered at the Academy. Teach and coordinate soft and technical skills programs in line with Academy objectives.","Manage enrollment and payment processes and class rosters and ensure learners have access to relevant resources.","Organize in-person and virtual training sessions to accommodate learners' different demands.","Assist in recruiting and onboarding new instructors to meet program demands. Manage daily operations of Skill-up Academy, including scheduling, resource allocation, and staff management."]`,
		},
		{
			ID:     "OBJ_SU_SKILLUP_2",
			Text:   "Instructor & Learner Engagement",
			Weight: 8,
			Type:   "objective",
			Depts:  `["SU 1 (Program Coordinator)"]`,
			Description: `["Work closely with instructors to ensure smooth course delivery and learning experiences.","Serves as a point of contact for learners, addressing any issues related to course content, schedules, or resources. Conduct regular feedback sessions with instructors and learners to monitor progress and areas of improvement.","Motivate learners by tracking their progress and celebrating achievements."]`,
		},
		{
			ID:     "OBJ_SU_SKILLUP_3",
			Text:   "Resource Management",
			Weight: 8,
			Type:   "objective",
			Depts:  `["SU 1 (Program Coordinator)"]`,
			Description: `["Ensure all training materials, equipment, and resources are available during training sessions.","Collaborate with instructors to update and improve course materials as needed."]`,
		},
		{
			ID:     "OBJ_SU_SKILLUP_4",
			Text:   "Performance Tracking & Reporting",
			Weight: 8,
			Type:   "objective",
			Depts:  `["SU 1 (Program Coordinator)"]`,
			Description: `["Analyze learner performance data and generate reports to measure the effectiveness of the training programs.","Identify trends and suggest improvements to enhance the learning experience and overall program effectiveness.","Report key performance metrics and end-of-cohort activities to the Program Coordinator at the end of every cohort training."]`,
		},
		{
			ID:     "OBJ_SU_SKILLUP_5",
			Text:   "Partnership Development",
			Weight: 8,
			Type:   "objective",
			Depts:  `["SU 1 (Program Coordinator)"]`,
			Description: `["Establish partnerships with industry professionals, organizations, and companies to provide learners with opportunities for internships, job placements, and real-world experience."]`,
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

	// 3. Move the users (MGR011 and EMP035) to SU 1 (Program Coordinator)
	res, err := tx.Exec("UPDATE User SET department = 'SU 1 (Program Coordinator)' WHERE id IN ('MGR011', 'EMP035')")
	if err != nil {
		log.Fatalf("Error updating user departments: %v", err)
	}
	affected, _ := res.RowsAffected()
	fmt.Printf("Updated department for %d user(s) (Samson & Iniobong).\n", affected)

	if err := tx.Commit(); err != nil {
		log.Fatalf("Error committing transaction: %v", err)
	}

	fmt.Println("Migration completed successfully!")
}
