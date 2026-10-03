package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func getFallbackCycles() []ReviewCycle {
	var data SeedData
	if len(seedDataBytes) == 0 || json.Unmarshal(seedDataBytes, &data) != nil {
		return nil
	}
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
	return fbCycles
}

func HandleCycles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tenantSlug := getTenantFilter(r)

	EnsureHRTables()

	if r.Method == http.MethodGet {
		var cycles []ReviewCycle

		if db != nil {
			query := `SELECT id, "tenantSlug", name, "startDate", "endDate", status, departments FROM "ReviewCycle"`
			var rows *sql.Rows
			var err error

			if tenantSlug != "" && tenantSlug != "all" {
				query += ` WHERE "tenantSlug" = $1 ORDER BY id ASC`
				rows, err = db.Query(query, tenantSlug)
			} else {
				query += ` ORDER BY id ASC`
				rows, err = db.Query(query)
			}

			if err == nil {
				defer rows.Close()
				for rows.Next() {
					var c ReviewCycle
					var depts sql.NullString
					var tSlug sql.NullString
					if err := rows.Scan(&c.ID, &tSlug, &c.Name, &c.StartDate, &c.EndDate, &c.Status, &depts); err == nil {
						if tSlug.Valid {
							c.TenantSlug = tSlug.String
						}
						if depts.Valid && depts.String != "" {
							raw := json.RawMessage(depts.String)
							c.Departments = &raw
						}
						cycles = append(cycles, c)
					}
				}
			}
		}

		if len(cycles) == 0 && (tenantSlug == "" || tenantSlug == "all") {
			cycles = getFallbackCycles()
		}

		if cycles == nil {
			cycles = []ReviewCycle{}
		}

		json.NewEncoder(w).Encode(cycles)
		return

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

		effectiveTenant := tenantSlug
		if effectiveTenant == "" {
			effectiveTenant = c.TenantSlug
		}

		var deptsStr string = "[]"
		if c.Departments != nil {
			deptsStr = string(*c.Departments)
		}

		if db != nil {
			_, err := db.Exec(`INSERT INTO "ReviewCycle" (id, "tenantSlug", name, "startDate", "endDate", status, departments) 
				VALUES ($1, $2, $3, $4, $5, $6, $7)
				ON CONFLICT (id) DO UPDATE SET 
					name = EXCLUDED.name, 
					"startDate" = EXCLUDED."startDate", 
					"endDate" = EXCLUDED."endDate", 
					status = EXCLUDED.status, 
					departments = EXCLUDED.departments,
					"tenantSlug" = CASE WHEN EXCLUDED."tenantSlug" != '' THEN EXCLUDED."tenantSlug" ELSE "ReviewCycle"."tenantSlug" END`,
				c.ID, effectiveTenant, c.Name, c.StartDate, c.EndDate, c.Status, deptsStr)

			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}

			// If cycle is Completed, automatically close all pending reviews for this cycle
			if c.Status == "Completed" {
				_, _ = db.Exec(`UPDATE "PerformanceReview" SET status = 'Closed', "updatedAt" = NOW() WHERE "cycleId" = $1 AND status NOT IN ('HR Approved', 'Closed')`, c.ID)
			}
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Cycle upserted successfully"})

	} else if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Cycle ID is required"})
			return
		}
		if db != nil {
			var err error
			if tenantSlug != "" && tenantSlug != "all" {
				_, err = db.Exec(`DELETE FROM "ReviewCycle" WHERE id = $1 AND ("tenantSlug" = $2 OR "tenantSlug" = '' OR "tenantSlug" IS NULL)`, id, tenantSlug)
			} else {
				_, err = db.Exec(`DELETE FROM "ReviewCycle" WHERE id = $1`, id)
			}
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Review cycle deleted successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
