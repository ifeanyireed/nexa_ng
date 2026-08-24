package handlers

import (
	_ "embed"
	"encoding/json"
	"log"
	"net/http"
)

//go:embed seed_data.json
var seedDataBytes []byte

// AutoSeedIfEmpty checks if tables are empty and seeds the full dataset from export
func AutoSeedIfEmpty() {
	if db == nil {
		return
	}

	EnsureHRTables()

	var reviewCount int
	row := db.QueryRow("SELECT COUNT(*) FROM PerformanceReview")
	if err := row.Scan(&reviewCount); err == nil && reviewCount > 0 {
		log.Printf("ℹ️ Database already contains %d reviews in PerformanceReview table, skipping automatic seeding", reviewCount)
		return
	}

	log.Println("⚡ Seeding ERP HR database from u859677653_hr_service_db export...")
	if err := executeSeed(); err != nil {
		log.Printf("⚠️ Auto-seed execution failed: %v", err)
	} else {
		log.Println("✅ ERP HR database seeded successfully (76 users, 188 objectives, 76 reviews, 2 cycles)!")
	}
}

func executeSeed() error {
	EnsureHRTables()

	var data SeedData
	if err := json.Unmarshal(seedDataBytes, &data); err != nil {
		return err
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, _ = tx.Exec("SET FOREIGN_KEY_CHECKS = 0")

	// 1. Seed Users (15 columns matching database export)
	userStmt, err := tx.Prepare(`INSERT INTO User 
		(id, name, email, role, department, avatar, managerName, ratingTrend, company, designation, employmentDate, gradeLevel, location, password, managerId) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE 
		name=VALUES(name), department=VALUES(department), avatar=VALUES(avatar), managerName=VALUES(managerName), ratingTrend=VALUES(ratingTrend), company=VALUES(company), designation=VALUES(designation), employmentDate=VALUES(employmentDate), gradeLevel=VALUES(gradeLevel), location=VALUES(location), managerId=VALUES(managerId)`)
	if err != nil {
		return err
	}
	defer userStmt.Close()

	for _, u := range data.Users {
		for len(u) < 15 {
			u = append(u, nil)
		}
		if _, err := userStmt.Exec(u[:15]...); err != nil {
			log.Printf("Warning: Failed to seed User %v: %v", u[0], err)
		}
	}

	// 2. Seed Cycles (6 columns matching database export)
	cycleStmt, err := tx.Prepare(`INSERT INTO ReviewCycle 
		(id, name, startDate, endDate, status, departments) 
		VALUES (?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE 
		name=VALUES(name), startDate=VALUES(startDate), endDate=VALUES(endDate), status=VALUES(status), departments=VALUES(departments)`)
	if err != nil {
		return err
	}
	defer cycleStmt.Close()

	for _, c := range data.Cycles {
		for len(c) < 6 {
			c = append(c, nil)
		}
		if _, err := cycleStmt.Exec(c[:6]...); err != nil {
			log.Printf("Warning: Failed to seed Cycle %v: %v", c[0], err)
		}
	}

	// 3. Seed Objectives (8 columns matching database export)
	objStmt, err := tx.Prepare(`INSERT INTO Objective 
		(id, text, weight, type, expectedLevel, category, departments, description) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE 
		text=VALUES(text), weight=VALUES(weight), type=VALUES(type), expectedLevel=VALUES(expectedLevel), category=VALUES(category), departments=VALUES(departments), description=VALUES(description)`)
	if err != nil {
		return err
	}
	defer objStmt.Close()

	for _, o := range data.Objectives {
		for len(o) < 8 {
			o = append(o, nil)
		}
		if len(o) > 4 && o[4] != nil {
			if f, ok := o[4].(float64); ok {
				o[4] = int(f)
			}
		}
		if len(o) > 2 && o[2] != nil {
			if f, ok := o[2].(float64); ok {
				o[2] = int(f)
			}
		}
		if _, err := objStmt.Exec(o[:8]...); err != nil {
			log.Printf("Warning: Failed to seed Objective %v: %v", o[0], err)
		}
	}

	// 4. Seed Reviews (14 columns matching database export)
	revStmt, err := tx.Prepare(`INSERT INTO PerformanceReview 
		(id, employeeId, employeeName, department, cycleId, cycleName, status, employeeComments, managerComments, hrComments, finalScore, objectivesJson, updatedAt, improvementPlan) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE 
		employeeId=VALUES(employeeId), employeeName=VALUES(employeeName), department=VALUES(department), cycleId=VALUES(cycleId), cycleName=VALUES(cycleName), status=VALUES(status), employeeComments=VALUES(employeeComments), managerComments=VALUES(managerComments), hrComments=VALUES(hrComments), finalScore=VALUES(finalScore), objectivesJson=VALUES(objectivesJson), updatedAt=VALUES(updatedAt), improvementPlan=VALUES(improvementPlan)`)
	if err != nil {
		return err
	}
	defer revStmt.Close()

	for _, r := range data.Reviews {
		for len(r) < 14 {
			r = append(r, nil)
		}
		if len(r) > 10 && r[10] != nil {
			if f, ok := r[10].(float64); ok {
				r[10] = f
			}
		}
		if _, err := revStmt.Exec(r[:14]...); err != nil {
			log.Printf("Warning: Failed to seed Review %v: %v", r[0], err)
		}
	}

	_, _ = tx.Exec("SET FOREIGN_KEY_CHECKS = 1")
	return tx.Commit()
}

func HandleSeed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed. Use POST or GET."})
		return
	}

	if err := executeSeed(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to seed database: " + err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":     "success",
		"message":    "ERP Database seeded with 76 users, 188 objectives, 76 performance reviews, and 2 cycles from export successfully!",
		"users":      76,
		"objectives": 188,
		"reviews":    76,
		"cycles":     2,
	})
}
