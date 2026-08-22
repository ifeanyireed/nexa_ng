package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func HandleObjectives(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, text, weight, type, expectedLevel, category, departments, description FROM Objective")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		objs := []Objective{}
		for rows.Next() {
			var o Objective
			var depts, desc sql.NullString
			if err := rows.Scan(&o.ID, &o.Text, &o.Weight, &o.Type, &o.ExpectedLevel, &o.Category, &depts, &desc); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			if depts.Valid && depts.String != "" {
				raw := json.RawMessage(depts.String)
				o.Departments = &raw
			}
			if desc.Valid && desc.String != "" {
				raw := json.RawMessage(desc.String)
				o.Description = &raw
			}
			objs = append(objs, o)
		}
		json.NewEncoder(w).Encode(objs)

	} else if r.Method == http.MethodPost {
		var o Objective
		if err := json.NewDecoder(r.Body).Decode(&o); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if o.ID == "" || o.Text == "" || o.Weight == 0 || o.Type == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Incomplete parameters"})
			return
		}

		var deptsStr, descStr *string
		if o.Departments != nil {
			s := string(*o.Departments)
			deptsStr = &s
		}
		if o.Description != nil {
			s := string(*o.Description)
			descStr = &s
		}

		_, err := db.Exec(`INSERT INTO Objective (id, text, weight, type, expectedLevel, category, departments, description) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE text = VALUES(text), weight = VALUES(weight), type = VALUES(type), 
			expectedLevel = VALUES(expectedLevel), category = VALUES(category), departments = VALUES(departments), description = VALUES(description)`,
			o.ID, o.Text, o.Weight, o.Type, o.ExpectedLevel, o.Category, deptsStr, descStr)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Objective upserted successfully"})

	} else if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Objective ID required"})
			return
		}
		_, err := db.Exec("DELETE FROM Objective WHERE id = ?", id)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Objective deleted"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
