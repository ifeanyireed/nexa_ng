package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

var (
	memoryReviewsLock sync.RWMutex
	memoryReviews     []PerformanceReview
)

func getFallbackReviews(employeeId, tenantSlug string) []PerformanceReview {
	memoryReviewsLock.RLock()
	if len(memoryReviews) > 0 {
		defer memoryReviewsLock.RUnlock()
		return filterReviews(memoryReviews, employeeId, tenantSlug)
	}
	memoryReviewsLock.RUnlock()

	memoryReviewsLock.Lock()
	defer memoryReviewsLock.Unlock()
	if len(memoryReviews) > 0 {
		return filterReviews(memoryReviews, employeeId, tenantSlug)
	}

	var data SeedData
	if len(seedDataBytes) > 0 {
		if err := json.Unmarshal(seedDataBytes, &data); err == nil {
			for _, r := range data.Reviews {
				if len(r) < 7 {
					continue
				}
				id, _ := r[0].(string)
				empId, _ := r[1].(string)
				empName, _ := r[2].(string)
				dept, _ := r[3].(string)
				cycleId, _ := r[4].(string)
				cycleName, _ := r[5].(string)
				status, _ := r[6].(string)

				var empComments, mgrComments, hrComments, impPlan *string
				if len(r) > 7 && r[7] != nil {
					s, _ := r[7].(string)
					empComments = &s
				}
				if len(r) > 8 && r[8] != nil {
					s, _ := r[8].(string)
					mgrComments = &s
				}
				if len(r) > 9 && r[9] != nil {
					s, _ := r[9].(string)
					hrComments = &s
				}
				var finalScore *float64
				if len(r) > 10 && r[10] != nil {
					if f, ok := r[10].(float64); ok {
						finalScore = &f
					}
				}
				var objRaw *json.RawMessage
				if len(r) > 11 && r[11] != nil {
					if s, ok := r[11].(string); ok && s != "" {
						raw := json.RawMessage(s)
						objRaw = &raw
					}
				}
				updatedAt := "2026-07-17T00:00:00.000Z"
				if len(r) > 12 && r[12] != nil {
					if s, ok := r[12].(string); ok && s != "" {
						updatedAt = s
					}
				}
				if len(r) > 13 && r[13] != nil {
					s, _ := r[13].(string)
					impPlan = &s
				}

				memoryReviews = append(memoryReviews, PerformanceReview{
					ID:               id,
					EmployeeID:       empId,
					EmployeeName:     empName,
					Department:       dept,
					CycleID:          cycleId,
					CycleName:        cycleName,
					Status:           status,
					EmployeeComments: empComments,
					ManagerComments:  mgrComments,
					HRComments:       hrComments,
					ImprovementPlan:  impPlan,
					FinalScore:       finalScore,
					Objectives:       objRaw,
					UpdatedAt:        updatedAt,
				})
			}
		}
	}
	return filterReviews(memoryReviews, employeeId, tenantSlug)
}

func filterReviews(list []PerformanceReview, employeeId, tenantSlug string) []PerformanceReview {
	var res []PerformanceReview
	for _, pr := range list {
		if employeeId != "" && pr.EmployeeID != employeeId {
			continue
		}
		res = append(res, pr)
	}
	return res
}

func HandleReviews(w http.ResponseWriter, r *http.Request) {
	EnsureHRTables()

	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		employeeId := r.URL.Query().Get("employeeId")

		if id != "" {
			var pr PerformanceReview
			var objJSON sql.NullString
			err := db.QueryRow("SELECT id, employeeId, employeeName, department, cycleId, cycleName, status, employeeComments, managerComments, hrComments, improvementPlan, finalScore, objectivesJson, updatedAt FROM PerformanceReview WHERE id = ?", id).
				Scan(&pr.ID, &pr.EmployeeID, &pr.EmployeeName, &pr.Department, &pr.CycleID, &pr.CycleName, &pr.Status, &pr.EmployeeComments, &pr.ManagerComments, &pr.HRComments, &pr.ImprovementPlan, &pr.FinalScore, &objJSON, &pr.UpdatedAt)
			if err == sql.ErrNoRows {
				fallback := getFallbackReviews("", "")
				for _, fb := range fallback {
					if fb.ID == id {
						json.NewEncoder(w).Encode(fb)
						return
					}
				}
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "Review not found"})
				return
			} else if err != nil {
				fallback := getFallbackReviews("", "")
				for _, fb := range fallback {
					if fb.ID == id {
						json.NewEncoder(w).Encode(fb)
						return
					}
				}
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

		tenantSlug := getTenantFilter(r)

		var rows *sql.Rows
		var err error
		if employeeId != "" {
			rows, err = db.Query("SELECT id, employeeId, employeeName, department, cycleId, cycleName, status, employeeComments, managerComments, hrComments, improvementPlan, finalScore, objectivesJson, updatedAt FROM PerformanceReview WHERE employeeId = ?", employeeId)
		} else if tenantSlug == "" || tenantSlug == "all" {
			rows, err = db.Query("SELECT id, employeeId, employeeName, department, cycleId, cycleName, status, employeeComments, managerComments, hrComments, improvementPlan, finalScore, objectivesJson, updatedAt FROM PerformanceReview")
		} else if tenantSlug == "neweratransports" || tenantSlug == "nets" || tenantSlug == "new-era-transports" {
			rows, err = db.Query(`SELECT r.id, r.employeeId, r.employeeName, r.department, r.cycleId, r.cycleName, r.status, r.employeeComments, r.managerComments, r.hrComments, r.improvementPlan, r.finalScore, r.objectivesJson, r.updatedAt 
				FROM PerformanceReview r
				LEFT JOIN User u ON r.employeeId = u.id
				WHERE (u.company = 'NETS' OR LOWER(u.company) LIKE '%new era%' OR LOWER(u.email) LIKE '%@neweratransports.com%' OR u.company IS NULL OR u.company = '')`)
		} else {
			rows, err = db.Query(`SELECT r.id, r.employeeId, r.employeeName, r.department, r.cycleId, r.cycleName, r.status, r.employeeComments, r.managerComments, r.hrComments, r.improvementPlan, r.finalScore, r.objectivesJson, r.updatedAt 
				FROM PerformanceReview r
				LEFT JOIN User u ON r.employeeId = u.id
				WHERE (LOWER(u.company) = ? OR LOWER(u.company) LIKE ? OR LOWER(u.email) LIKE ?)`,
				tenantSlug, "%"+tenantSlug+"%", "%@"+tenantSlug+"%")
		}

		if err != nil {
			fallback := getFallbackReviews(employeeId, tenantSlug)
			if len(fallback) > 0 {
				json.NewEncoder(w).Encode(fallback)
				return
			}
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
				continue
			}
			if objJSON.Valid && objJSON.String != "" {
				raw := json.RawMessage(objJSON.String)
				pr.Objectives = &raw
			}
			reviews = append(reviews, pr)
		}

		if len(reviews) == 0 {
			fallback := getFallbackReviews(employeeId, tenantSlug)
			if len(fallback) > 0 {
				json.NewEncoder(w).Encode(fallback)
				return
			}
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
	} else if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Review ID is required"})
			return
		}
		_, err := db.Exec("DELETE FROM PerformanceReview WHERE id = ?", id)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Performance review deleted successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
