package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
)

func getFallbackObjectives() []Objective {
	var data SeedData
	if len(seedDataBytes) == 0 || json.Unmarshal(seedDataBytes, &data) != nil {
		return nil
	}
	var objs []Objective
	for _, o := range data.Objectives {
		if len(o) < 4 {
			continue
		}
		id, _ := o[0].(string)
		text, _ := o[1].(string)
		var weight int
		if f, ok := o[2].(float64); ok {
			weight = int(f)
		} else if i, ok := o[2].(int); ok {
			weight = i
		}
		objType, _ := o[3].(string)
		var expectedLevel *int
		if len(o) > 4 && o[4] != nil {
			if f, ok := o[4].(float64); ok {
				lvl := int(f)
				expectedLevel = &lvl
			} else if i, ok := o[4].(int); ok {
				lvl := i
				expectedLevel = &lvl
			}
		}
		var category *string
		if len(o) > 5 && o[5] != nil {
			if s, ok := o[5].(string); ok && s != "" {
				category = &s
			}
		}
		var depts *json.RawMessage
		if len(o) > 6 && o[6] != nil {
			if s, ok := o[6].(string); ok && s != "" {
				raw := json.RawMessage(s)
				depts = &raw
			}
		}
		var desc *json.RawMessage
		if len(o) > 7 && o[7] != nil {
			if s, ok := o[7].(string); ok && s != "" {
				raw := json.RawMessage(s)
				desc = &raw
			}
		}
		objs = append(objs, Objective{
			ID:            id,
			Text:          text,
			Weight:        weight,
			Type:          objType,
			ExpectedLevel: expectedLevel,
			Category:      category,
			Departments:   depts,
			Description:   desc,
		})
	}
	return objs
}

func HandleObjectives(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tenantSlug := getTenantFilter(r)

	EnsureHRTables()

	if r.Method == http.MethodGet {
		var objs []Objective

		if db != nil {
			query := `SELECT id, text, weight, type, "expectedLevel", category, departments, description FROM "Objective"`
			var rows *sql.Rows
			var err error

			if tenantSlug != "" && tenantSlug != "all" {
				query += ` WHERE "tenantSlug" = $1`
				rows, err = db.Query(query, tenantSlug)
			} else {
				rows, err = db.Query(query)
			}

			if err == nil {
				defer rows.Close()
				for rows.Next() {
					var o Objective
					var depts, desc sql.NullString
					if err := rows.Scan(&o.ID, &o.Text, &o.Weight, &o.Type, &o.ExpectedLevel, &o.Category, &depts, &desc); err == nil {
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
				}
			}
		}

		if len(objs) == 0 && (tenantSlug == "" || tenantSlug == "all") {
			objs = getFallbackObjectives()
		}

		if objs == nil {
			objs = []Objective{}
		}

		json.NewEncoder(w).Encode(objs)
		return

	} else if r.Method == http.MethodPost || r.Method == http.MethodPut {
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

		if tenantSlug == "" && o.TenantSlug != "" {
			tenantSlug = strings.ToLower(strings.TrimSpace(o.TenantSlug))
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

		if db != nil {
			_, err := db.Exec(`INSERT INTO "Objective" (id, "tenantSlug", text, weight, type, "expectedLevel", category, departments, description) 
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
				ON CONFLICT (id) DO UPDATE SET 
					text = EXCLUDED.text, 
					weight = EXCLUDED.weight, 
					type = EXCLUDED.type, 
					"expectedLevel" = EXCLUDED."expectedLevel", 
					category = EXCLUDED.category, 
					departments = EXCLUDED.departments, 
					description = EXCLUDED.description,
					"tenantSlug" = EXCLUDED."tenantSlug"`,
				o.ID, tenantSlug, o.Text, o.Weight, o.Type, o.ExpectedLevel, o.Category, deptsStr, descStr)

			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Objective upserted successfully"})

	} else if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Objective ID required"})
			return
		}
		if db != nil {
			var err error
			if tenantSlug != "" && tenantSlug != "all" {
				_, err = db.Exec(`DELETE FROM "Objective" WHERE id = $1 AND ("tenantSlug" = $2 OR "tenantSlug" = '' OR "tenantSlug" IS NULL)`, id, tenantSlug)
			} else {
				_, err = db.Exec(`DELETE FROM "Objective" WHERE id = $1`, id)
			}
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Objective deleted"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
