package handlers

import (
	_ "embed"
	"encoding/json"
	"net/http"
)

//go:embed seed_data.json
var seedDataBytes []byte

func HandleSeed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed. Use POST."})
		return
	}

	var data SeedData
	if err := json.Unmarshal(seedDataBytes, &data); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to parse seed data: " + err.Error()})
		return
	}

	// Truncate tables
	tx, err := db.Begin()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to start transaction: " + err.Error()})
		return
	}
	defer tx.Rollback()

	_, _ = tx.Exec("SET FOREIGN_KEY_CHECKS = 0")
	_, _ = tx.Exec("TRUNCATE TABLE User")
	_, _ = tx.Exec("TRUNCATE TABLE ReviewCycle")
	_, _ = tx.Exec("TRUNCATE TABLE Objective")
	_, _ = tx.Exec("TRUNCATE TABLE PerformanceReview")
	_, _ = tx.Exec("SET FOREIGN_KEY_CHECKS = 1")

	// Seed Users
	userStmt, err := tx.Prepare("INSERT INTO User (id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to prepare User stmt: " + err.Error()})
		return
	}
	defer userStmt.Close()

	for _, u := range data.Users {
		if len(u) > 8 && u[8] != nil {
			if s, ok := u[8].(string); ok {
				u[8] = s
			}
		}
		if _, err := userStmt.Exec(u...); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to seed User: " + err.Error()})
			return
		}
	}

	// Seed Cycles
	cycleStmt, err := tx.Prepare("INSERT INTO ReviewCycle (id, name, startDate, endDate, status, departments) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to prepare ReviewCycle stmt: " + err.Error()})
		return
	}
	defer cycleStmt.Close()

	for _, c := range data.Cycles {
		if _, err := cycleStmt.Exec(c...); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to seed ReviewCycle: " + err.Error()})
			return
		}
	}

	// Seed Objectives
	objStmt, err := tx.Prepare("INSERT INTO Objective (id, text, weight, type, expectedLevel, category, departments, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to prepare Objective stmt: " + err.Error()})
		return
	}
	defer objStmt.Close()

	for _, o := range data.Objectives {
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
		if _, err := objStmt.Exec(o...); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to seed Objective: " + err.Error()})
			return
		}
	}

	// Seed Reviews
	revStmt, err := tx.Prepare("INSERT INTO PerformanceReview (id, employeeId, employeeName, department, cycleId, cycleName, status, employeeComments, managerComments, hrComments, improvementPlan, finalScore, objectivesJson, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, NOW())")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to prepare PerformanceReview stmt: " + err.Error()})
		return
	}
	defer revStmt.Close()

	for _, r := range data.Reviews {
		if len(r) > 10 && r[10] != nil {
			if f, ok := r[10].(float64); ok {
				r[10] = f
			}
		}
		if _, err := revStmt.Exec(r...); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to seed PerformanceReview: " + err.Error()})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to commit transaction: " + err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Database seeded with departments and their respective JDs KPIs successfully!"})
}
