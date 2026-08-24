package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"sync"
)

var (
	memoryUsersLock sync.RWMutex
	memoryUsers     []User
)

func getFallbackUsers() []User {
	memoryUsersLock.RLock()
	if len(memoryUsers) > 0 {
		defer memoryUsersLock.RUnlock()
		cp := make([]User, len(memoryUsers))
		copy(cp, memoryUsers)
		return cp
	}
	memoryUsersLock.RUnlock()

	memoryUsersLock.Lock()
	defer memoryUsersLock.Unlock()
	if len(memoryUsers) > 0 {
		cp := make([]User, len(memoryUsers))
		copy(cp, memoryUsers)
		return cp
	}

	var data SeedData
	if len(seedDataBytes) > 0 {
		if err := json.Unmarshal(seedDataBytes, &data); err == nil {
			for _, u := range data.Users {
				if len(u) < 4 {
					continue
				}
				id, _ := u[0].(string)
				name, _ := u[1].(string)
				email, _ := u[2].(string)
				role, _ := u[3].(string)
				dept := "Executive Directorate"
				if len(u) > 4 && u[4] != nil {
					dept, _ = u[4].(string)
				}
				avatar := "/character1.jpg"
				if len(u) > 5 && u[5] != nil {
					avatar, _ = u[5].(string)
				}
				var managerName *string
				if len(u) > 6 && u[6] != nil {
					s, _ := u[6].(string)
					managerName = &s
				}
				var company *string
				if len(u) > 8 && u[8] != nil {
					s, _ := u[8].(string)
					company = &s
				}
				var desig *string
				if len(u) > 9 && u[9] != nil {
					s, _ := u[9].(string)
					desig = &s
				}
				var loc *string
				if len(u) > 12 && u[12] != nil {
					s, _ := u[12].(string)
					loc = &s
				}

				memoryUsers = append(memoryUsers, User{
					ID:          id,
					Name:        name,
					Email:       email,
					Role:        role,
					Department:  dept,
					Avatar:      avatar,
					ManagerName: managerName,
					Company:     company,
					Designation: desig,
					Location:    loc,
				})
			}
		}
	}
	cp := make([]User, len(memoryUsers))
	copy(cp, memoryUsers)
	return cp
}

func getTenantFilter(r *http.Request) string {
	slug := r.Header.Get("x-tenant-slug")
	if slug == "" {
		slug = r.URL.Query().Get("tenant")
	}
	if slug == "" {
		slug = r.URL.Query().Get("tenant_slug")
	}
	if slug == "" {
		slug = r.URL.Query().Get("company")
	}
	return strings.ToLower(strings.TrimSpace(slug))
}

func matchesTenant(u *User, tenantSlug string) bool {
	if tenantSlug == "" || tenantSlug == "all" {
		return true
	}
	comp := ""
	if u.Company != nil {
		comp = strings.ToLower(strings.TrimSpace(*u.Company))
	}
	email := strings.ToLower(strings.TrimSpace(u.Email))

	if tenantSlug == "neweratransports" || tenantSlug == "nets" || tenantSlug == "new-era-transports" {
		return comp == "nets" || strings.Contains(comp, "new era") || strings.Contains(email, "@neweratransports.com") || comp == ""
	}

	cleanSlug := strings.ReplaceAll(tenantSlug, "-", "")
	cleanComp := strings.ReplaceAll(comp, "-", "")
	cleanComp = strings.ReplaceAll(cleanComp, " ", "")

	return strings.Contains(cleanComp, cleanSlug) || strings.Contains(email, "@"+tenantSlug) || strings.Contains(email, cleanSlug)
}

func HandleUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			if db != nil {
				var u User
				var ratingTrend sql.NullString
				err := db.QueryRow("SELECT id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password FROM User WHERE id = ?", id).
					Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.Department, &u.Avatar, &u.ManagerName, &u.ManagerID, &ratingTrend, &u.Designation, &u.GradeLevel, &u.EmploymentDate, &u.Company, &u.Location, &u.Password)
				if err == nil {
					if ratingTrend.Valid && ratingTrend.String != "" {
						raw := json.RawMessage(ratingTrend.String)
						u.RatingTrend = &raw
					}
					json.NewEncoder(w).Encode(u)
					return
				}
			}

			// Fallback search
			fallbacks := getFallbackUsers()
			for _, u := range fallbacks {
				if u.ID == id {
					json.NewEncoder(w).Encode(u)
					return
				}
			}
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
			return
		}

		tenantSlug := getTenantFilter(r)

		if db != nil {
			var query string
			var args []interface{}

			if tenantSlug == "" || tenantSlug == "all" {
				query = "SELECT id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password FROM User ORDER BY name ASC"
			} else if tenantSlug == "neweratransports" || tenantSlug == "nets" || tenantSlug == "new-era-transports" {
				query = "SELECT id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password FROM User WHERE (company = 'NETS' OR LOWER(company) LIKE '%new era%' OR LOWER(email) LIKE '%@neweratransports.com%' OR company IS NULL OR company = '') ORDER BY name ASC"
			} else {
				query = "SELECT id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password FROM User WHERE (LOWER(company) = ? OR LOWER(company) LIKE ? OR LOWER(email) LIKE ?) ORDER BY name ASC"
				args = append(args, tenantSlug, "%"+tenantSlug+"%", "%@"+tenantSlug+"%")
			}

			rows, err := db.Query(query, args...)
			if err == nil {
				defer rows.Close()
				users := []User{}
				for rows.Next() {
					var u User
					var ratingTrend sql.NullString
					if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.Department, &u.Avatar, &u.ManagerName, &u.ManagerID, &ratingTrend, &u.Designation, &u.GradeLevel, &u.EmploymentDate, &u.Company, &u.Location, &u.Password); err == nil {
						if ratingTrend.Valid && ratingTrend.String != "" {
							raw := json.RawMessage(ratingTrend.String)
							u.RatingTrend = &raw
						}
						users = append(users, u)
					}
				}
				if len(users) > 0 || (tenantSlug != "" && tenantSlug != "neweratransports" && tenantSlug != "nets") {
					json.NewEncoder(w).Encode(users)
					return
				}
			}
		}

		// Fallback in-memory response
		fallbacks := getFallbackUsers()
		filtered := []User{}
		for _, u := range fallbacks {
			if matchesTenant(&u, tenantSlug) {
				filtered = append(filtered, u)
			}
		}
		json.NewEncoder(w).Encode(filtered)

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

		tenantSlug := getTenantFilter(r)
		if (u.Company == nil || *u.Company == "") && tenantSlug != "" {
			if tenantSlug == "neweratransports" {
				c := "New Era Transports"
				u.Company = &c
			} else {
				u.Company = &tenantSlug
			}
		}

		var ratingTrendStr *string
		if u.RatingTrend != nil {
			s := string(*u.RatingTrend)
			ratingTrendStr = &s
		}

		if db != nil {
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
		}

		// Update in-memory fallback list
		memoryUsersLock.Lock()
		found := false
		for idx, existing := range memoryUsers {
			if existing.ID == u.ID {
				memoryUsers[idx] = u
				found = true
				break
			}
		}
		if !found {
			memoryUsers = append(memoryUsers, u)
		}
		memoryUsersLock.Unlock()

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "User upserted successfully"})

	} else if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "User ID is required"})
			return
		}
		if db != nil {
			_, _ = db.Exec("DELETE FROM User WHERE id = ?", id)
		}

		memoryUsersLock.Lock()
		for idx, u := range memoryUsers {
			if u.ID == id {
				memoryUsers = append(memoryUsers[:idx], memoryUsers[idx+1:]...)
				break
			}
		}
		memoryUsersLock.Unlock()

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "User deleted successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
