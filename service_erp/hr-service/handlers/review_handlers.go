package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
)

func HandleReviews(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		employeeId := r.URL.Query().Get("employeeId")

		if id != "" {
			var pr PerformanceReview
			var objJSON sql.NullString
			err := db.QueryRow("SELECT id, employeeId, employeeName, department, cycleId, cycleName, status, employeeComments, managerComments, hrComments, improvementPlan, finalScore, objectivesJson, updatedAt FROM PerformanceReview WHERE id = ?", id).
				Scan(&pr.ID, &pr.EmployeeID, &pr.EmployeeName, &pr.Department, &pr.CycleID, &pr.CycleName, &pr.Status, &pr.EmployeeComments, &pr.ManagerComments, &pr.HRComments, &pr.ImprovementPlan, &pr.FinalScore, &objJSON, &pr.UpdatedAt)
			if err == sql.ErrNoRows {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "Review not found"})
				return
			} else if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			if objJSON.Valid && objJSON.String != "" {
				raw := json.RawMessage(objJSON.String)
				pr.Objectives = &raw
			}
			json.NewEncoder(w).Encode(pr)
			return
		}

		var rows *sql.Rows
		var err error
		if employeeId != "" {
			rows, err = db.Query("SELECT id, employeeId, employeeName, department, cycleId, cycleName, status, employeeComments, managerComments, hrComments, improvementPlan, finalScore, objectivesJson, updatedAt FROM PerformanceReview WHERE employeeId = ?", employeeId)
		} else {
			rows, err = db.Query("SELECT id, employeeId, employeeName, department, cycleId, cycleName, status, employeeComments, managerComments, hrComments, improvementPlan, finalScore, objectivesJson, updatedAt FROM PerformanceReview")
		}

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		reviews := []PerformanceReview{}
		for rows.Next() {
			var pr PerformanceReview
			var objJSON sql.NullString
			if err := rows.Scan(&pr.ID, &pr.EmployeeID, &pr.EmployeeName, &pr.Department, &pr.CycleID, &pr.CycleName, &pr.Status, &pr.EmployeeComments, &pr.ManagerComments, &pr.HRComments, &pr.ImprovementPlan, &pr.FinalScore, &objJSON, &pr.UpdatedAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			if objJSON.Valid && objJSON.String != "" {
				raw := json.RawMessage(objJSON.String)
				pr.Objectives = &raw
			}
			reviews = append(reviews, pr)
		}
		json.NewEncoder(w).Encode(reviews)

	} else if r.Method == http.MethodPost || r.Method == http.MethodPut {
		var rawBody json.RawMessage
		if err := json.NewDecoder(r.Body).Decode(&rawBody); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}

		var reviewsToUpsert []PerformanceReview
		if len(rawBody) > 0 && rawBody[0] == '[' {
			if err := json.Unmarshal(rawBody, &reviewsToUpsert); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Invalid array format"})
				return
			}
		} else {
			var pr PerformanceReview
			if err := json.Unmarshal(rawBody, &pr); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Invalid object format"})
				return
			}
			reviewsToUpsert = append(reviewsToUpsert, pr)
		}

		tx, err := db.Begin()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Transaction start failed: " + err.Error()})
			return
		}

		stmt, err := tx.Prepare(`INSERT INTO PerformanceReview 
			(id, employeeId, employeeName, department, cycleId, cycleName, status, employeeComments, managerComments, hrComments, improvementPlan, finalScore, objectivesJson, updatedAt) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
			ON DUPLICATE KEY UPDATE 
			status = VALUES(status), employeeComments = VALUES(employeeComments), managerComments = VALUES(managerComments), hrComments = VALUES(hrComments), improvementPlan = VALUES(improvementPlan),
			finalScore = VALUES(finalScore), objectivesJson = VALUES(objectivesJson), updatedAt = NOW()`)
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Prepare statement failed: " + err.Error()})
			return
		}
		defer stmt.Close()

		for _, pr := range reviewsToUpsert {
			if pr.ID == "" || pr.EmployeeID == "" || pr.CycleID == "" {
				tx.Rollback()
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "Incomplete parameters in one of the reviews"})
				return
			}

			var objJSONStr string = "[]"
			if pr.Objectives != nil {
				objJSONStr = string(*pr.Objectives)
			}

			_, err = stmt.Exec(pr.ID, pr.EmployeeID, pr.EmployeeName, pr.Department, pr.CycleID, pr.CycleName, pr.Status, pr.EmployeeComments, pr.ManagerComments, pr.HRComments, pr.ImprovementPlan, pr.FinalScore, objJSONStr)
			if err != nil {
				tx.Rollback()
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": "Database execute failed: " + err.Error()})
				return
			}
		}

		if err := tx.Commit(); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Transaction commit failed: " + err.Error()})
			return
		}

		json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": fmt.Sprintf("Successfully upserted %d review(s)", len(reviewsToUpsert)),
		})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
