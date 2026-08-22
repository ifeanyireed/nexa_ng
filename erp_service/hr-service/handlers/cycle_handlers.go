package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func HandleCycles(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, name, startDate, endDate, status, departments FROM ReviewCycle")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		cycles := []ReviewCycle{}
		for rows.Next() {
			var c ReviewCycle
			var depts sql.NullString
			if err := rows.Scan(&c.ID, &c.Name, &c.StartDate, &c.EndDate, &c.Status, &depts); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			if depts.Valid && depts.String != "" {
				raw := json.RawMessage(depts.String)
				c.Departments = &raw
			}
			cycles = append(cycles, c)
		}
		json.NewEncoder(w).Encode(cycles)

	} else if r.Method == http.MethodPost || r.Method == http.MethodPut {
		var c ReviewCycle
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if c.ID == "" || c.Name == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Incomplete parameters"})
			return
		}

		var deptsStr string = "[]"
		if c.Departments != nil {
			deptsStr = string(*c.Departments)
		}

		_, err := db.Exec(`INSERT INTO ReviewCycle (id, name, startDate, endDate, status, departments) 
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE 
			name = VALUES(name), startDate = VALUES(startDate), endDate = VALUES(endDate), status = VALUES(status), departments = VALUES(departments)`,
			c.ID, c.Name, c.StartDate, c.EndDate, c.Status, deptsStr)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Cycle upserted successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
