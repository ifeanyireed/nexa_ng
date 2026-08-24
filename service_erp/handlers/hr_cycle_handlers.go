package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func HandleCycles(w http.ResponseWriter, r *http.Request) {
	EnsureHRTables()

	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, name, startDate, endDate, status, departments FROM ReviewCycle")
		if err != nil {
			var data SeedData
			if len(seedDataBytes) > 0 && json.Unmarshal(seedDataBytes, &data) == nil {
				var fbCycles []ReviewCycle
				for _, c := range data.Cycles {
					if len(c) < 5 {
						continue
					}
					id, _ := c[0].(string)
					name, _ := c[1].(string)
					sDate, _ := c[2].(string)
					eDate, _ := c[3].(string)
					status, _ := c[4].(string)
					var dRaw *json.RawMessage
					if len(c) > 5 && c[5] != nil {
						if s, ok := c[5].(string); ok && s != "" {
							raw := json.RawMessage(s)
							dRaw = &raw
						}
					}
					fbCycles = append(fbCycles, ReviewCycle{
						ID:          id,
						Name:        name,
						StartDate:   sDate,
						EndDate:     eDate,
						Status:      status,
						Departments: dRaw,
					})
				}
				if len(fbCycles) > 0 {
					json.NewEncoder(w).Encode(fbCycles)
					return
				}
			}
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
				continue
			}
			if depts.Valid && depts.String != "" {
				raw := json.RawMessage(depts.String)
				c.Departments = &raw
			}
			cycles = append(cycles, c)
		}

		if len(cycles) == 0 {
			var data SeedData
			if len(seedDataBytes) > 0 && json.Unmarshal(seedDataBytes, &data) == nil {
				for _, c := range data.Cycles {
					if len(c) < 5 {
						continue
					}
					id, _ := c[0].(string)
					name, _ := c[1].(string)
					sDate, _ := c[2].(string)
					eDate, _ := c[3].(string)
					status, _ := c[4].(string)
					var dRaw *json.RawMessage
					if len(c) > 5 && c[5] != nil {
						if s, ok := c[5].(string); ok && s != "" {
							raw := json.RawMessage(s)
							dRaw = &raw
						}
					}
					cycles = append(cycles, ReviewCycle{
						ID:          id,
						Name:        name,
						StartDate:   sDate,
						EndDate:     eDate,
						Status:      status,
						Departments: dRaw,
					})
				}
			}
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
	} else if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Cycle ID is required"})
			return
		}
		_, err := db.Exec("DELETE FROM ReviewCycle WHERE id = ?", id)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Review cycle deleted successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
