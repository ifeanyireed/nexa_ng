package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func HandleUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			var u User
			var ratingTrend sql.NullString
			err := db.QueryRow("SELECT id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password FROM User WHERE id = ?", id).
				Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.Department, &u.Avatar, &u.ManagerName, &u.ManagerID, &ratingTrend, &u.Designation, &u.GradeLevel, &u.EmploymentDate, &u.Company, &u.Location, &u.Password)
			if err == sql.ErrNoRows {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
				return
			} else if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			if ratingTrend.Valid && ratingTrend.String != "" {
				raw := json.RawMessage(ratingTrend.String)
				u.RatingTrend = &raw
			}
			json.NewEncoder(w).Encode(u)
			return
		}

		rows, err := db.Query("SELECT id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password FROM User")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		users := []User{}
		for rows.Next() {
			var u User
			var ratingTrend sql.NullString
			if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.Department, &u.Avatar, &u.ManagerName, &u.ManagerID, &ratingTrend, &u.Designation, &u.GradeLevel, &u.EmploymentDate, &u.Company, &u.Location, &u.Password); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			if ratingTrend.Valid && ratingTrend.String != "" {
				raw := json.RawMessage(ratingTrend.String)
				u.RatingTrend = &raw
			}
			users = append(users, u)
		}
		json.NewEncoder(w).Encode(users)

	} else if r.Method == http.MethodPost || r.Method == http.MethodPut {
		var u User
		if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if u.ID == "" || u.Name == "" || u.Email == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Incomplete parameters"})
			return
		}

		var ratingTrendStr *string
		if u.RatingTrend != nil {
			s := string(*u.RatingTrend)
			ratingTrendStr = &s
		}

		_, err := db.Exec(`INSERT INTO User (id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE 
			name = VALUES(name), email = VALUES(email), role = VALUES(role), department = VALUES(department), 
			avatar = VALUES(avatar), managerName = VALUES(managerName), managerId = VALUES(managerId), ratingTrend = VALUES(ratingTrend),
			designation = VALUES(designation), gradeLevel = VALUES(gradeLevel), employmentDate = VALUES(employmentDate),
			company = VALUES(company), location = VALUES(location), password = VALUES(password)`,
			u.ID, u.Name, u.Email, u.Role, u.Department, u.Avatar, u.ManagerName, u.ManagerID, ratingTrendStr, u.Designation, u.GradeLevel, u.EmploymentDate, u.Company, u.Location, u.Password)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "User upserted successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
