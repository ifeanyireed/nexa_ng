package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
)

type DepartmentItem struct {
	Code       string `json:"code"`
	Name       string `json:"name"`
	Head       string `json:"head"`
	HeadCount  int    `json:"headCount"`
	Budget     string `json:"budget"`
	CostCenter string `json:"costCenter"`
	TenantSlug string `json:"tenantSlug,omitempty"`
}

var (
	deptLock sync.RWMutex
	customDepts = make(map[string][]DepartmentItem) // keyed by tenantSlug
)

var defaultDepartments = []DepartmentItem{
	{Code: "DEPT-FIN", Name: "Finance & Accounts", Head: "", HeadCount: 0, Budget: "₦0", CostCenter: "CC-101"},
	{Code: "DEPT-FLT", Name: "Fleet Operations & Maintenance", Head: "", HeadCount: 0, Budget: "₦0", CostCenter: "CC-201"},
	{Code: "DEPT-IT", Name: "Systems & IT / ERP", Head: "", HeadCount: 0, Budget: "₦0", CostCenter: "CC-301"},
	{Code: "DEPT-HR", Name: "Human Resources & Talent", Head: "", HeadCount: 0, Budget: "₦0", CostCenter: "CC-401"},
	{Code: "DEPT-MKT", Name: "Commercial & Growth", Head: "", HeadCount: 0, Budget: "₦0", CostCenter: "CC-501"},
	{Code: "DEPT-EXE", Name: "Executive Directorate", Head: "", HeadCount: 0, Budget: "₦0", CostCenter: "CC-001"},
}

func getDepartmentHeadAndCount(deptName string, tenantUsers []User) (string, int) {
	count := 0
	head := ""
	deptNorm := strings.ToLower(strings.TrimSpace(deptName))

	for _, u := range tenantUsers {
		uDept := strings.ToLower(strings.TrimSpace(u.Department))
		// match if department names correlate
		if strings.Contains(uDept, deptNorm) || strings.Contains(deptNorm, uDept) ||
			(strings.Contains(deptNorm, "finance") && strings.Contains(uDept, "finance")) ||
			(strings.Contains(deptNorm, "fleet") && strings.Contains(uDept, "fleet")) ||
			(strings.Contains(deptNorm, "it") && strings.Contains(uDept, "it")) ||
			(strings.Contains(deptNorm, "hr") && strings.Contains(uDept, "hr")) ||
			(strings.Contains(deptNorm, "market") && strings.Contains(uDept, "market")) ||
			(strings.Contains(deptNorm, "exec") && (strings.Contains(uDept, "exec") || strings.Contains(uDept, "admin"))) {
			count++
			if head == "" && (u.Role == "manager" || u.Role == "md" || u.Role == "admin" || u.Role == "hr") {
				head = u.Name
				if u.Role == "md" {
					head = head + " (MD)"
				}
			}
		}
	}

	return head, count
}

func HandleDepartments(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	EnsureHRTables()
	tenantSlug := getTenantFilter(r)

	if r.Method == http.MethodGet {
		// Fetch tenant users to calculate dynamic headcount & leadership
		users := []User{}
		if db != nil {
			var query string
			var rows *sql.Rows
			var err error
			if tenantSlug == "" || tenantSlug == "all" {
				query = `SELECT id, name, email, role, department, avatar, "managerName", "managerId", designation, company FROM "User"`
				rows, err = db.Query(query)
			} else {
				query = `SELECT id, name, email, role, department, avatar, "managerName", "managerId", designation, company FROM "User" WHERE ("tenantSlug" = $1 OR LOWER(company) = $1 OR LOWER(company) LIKE $2 OR LOWER(email) LIKE $3)`
				rows, err = db.Query(query, tenantSlug, "%"+tenantSlug+"%", "%@"+tenantSlug+"%")
			}
			if err == nil {
				defer rows.Close()
				for rows.Next() {
					var u User
					if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.Department, &u.Avatar, &u.ManagerName, &u.ManagerID, &u.Designation, &u.Company); err == nil {
						users = append(users, u)
					}
				}
			}
		}

		if len(users) == 0 {
			for _, u := range getFallbackUsers() {
				if matchesTenant(&u, tenantSlug) {
					users = append(users, u)
				}
			}
		}

		// Read persistent departments from DB
		dbDepts := []DepartmentItem{}
		if db != nil {
			var dRows *sql.Rows
			var dErr error
			if tenantSlug != "" && tenantSlug != "all" {
				dRows, dErr = db.Query(`SELECT "code", "name", "head", "headCount", "budget", "costCenter", "tenantSlug" FROM "Department" WHERE "tenantSlug" = $1 OR "tenantSlug" = '' OR "tenantSlug" IS NULL ORDER BY "code" ASC`, tenantSlug)
			} else {
				dRows, dErr = db.Query(`SELECT "code", "name", "head", "headCount", "budget", "costCenter", "tenantSlug" FROM "Department" ORDER BY "code" ASC`)
			}
			if dErr == nil {
				defer dRows.Close()
				for dRows.Next() {
					var item DepartmentItem
					if err := dRows.Scan(&item.Code, &item.Name, &item.Head, &item.HeadCount, &item.Budget, &item.CostCenter, &item.TenantSlug); err == nil {
						dbDepts = append(dbDepts, item)
					}
				}
			}
		}

		deptLock.RLock()
		customs := customDepts[tenantSlug]
		deptLock.RUnlock()

		// Combine default departments, db departments, and in-memory customs without duplicates
		deptMap := make(map[string]DepartmentItem)
		for _, d := range defaultDepartments {
			head, count := getDepartmentHeadAndCount(d.Name, users)
			if head == "" {
				head = d.Head
			}
			d.Head = head
			d.HeadCount = count
			d.TenantSlug = tenantSlug
			deptMap[strings.ToUpper(d.Code)] = d
		}

		for _, dbD := range dbDepts {
			head, count := getDepartmentHeadAndCount(dbD.Name, users)
			if head != "" {
				dbD.Head = head
			}
			if count > 0 {
				dbD.HeadCount = count
			}
			deptMap[strings.ToUpper(dbD.Code)] = dbD
		}

		for _, c := range customs {
			head, count := getDepartmentHeadAndCount(c.Name, users)
			if head != "" {
				c.Head = head
			}
			if count > 0 {
				c.HeadCount = count
			}
			deptMap[strings.ToUpper(c.Code)] = c
		}

		// Also discover any departments from tenant's users that aren't yet in deptMap
		for _, u := range users {
			deptName := strings.TrimSpace(u.Department)
			if deptName != "" {
				cleanCode := "DEPT-" + strings.ToUpper(strings.ReplaceAll(deptName, " ", ""))
				if len(cleanCode) > 16 {
					cleanCode = cleanCode[:16]
				}
				if _, exists := deptMap[cleanCode]; !exists {
					head, count := getDepartmentHeadAndCount(deptName, users)
					deptMap[cleanCode] = DepartmentItem{
						Code:       cleanCode,
						Name:       deptName,
						Head:       head,
						HeadCount:  count,
						Budget:     "₦10,000,000",
						CostCenter: "CC-" + cleanCode,
						TenantSlug: tenantSlug,
					}
				}
			}
		}

		results := make([]DepartmentItem, 0, len(deptMap))
		for _, v := range deptMap {
			results = append(results, v)
		}

		json.NewEncoder(w).Encode(results)

	} else if r.Method == http.MethodPost || r.Method == http.MethodPut {
		var item DepartmentItem
		if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload"})
			return
		}

		if item.Name == "" || item.Code == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Department name and code are required"})
			return
		}

		item.Code = strings.ToUpper(strings.TrimSpace(item.Code))
		if item.Head == "" {
			item.Head = "Pending Appointment"
		}
		if item.Budget == "" {
			item.Budget = "₦10,000,000"
		} else if !strings.HasPrefix(item.Budget, "₦") {
			item.Budget = "₦" + item.Budget
		}
		if item.CostCenter == "" {
			item.CostCenter = "CC-601"
		}

		if item.TenantSlug == "" && tenantSlug != "" {
			item.TenantSlug = tenantSlug
		}
		if tenantSlug == "" && item.TenantSlug != "" {
			tenantSlug = strings.ToLower(strings.TrimSpace(item.TenantSlug))
		}

		if item.HeadCount == 0 {
			item.HeadCount = 1
		}

		// Persist to database
		if db != nil {
			_, err := db.Exec(`INSERT INTO "Department" ("code", "name", "head", "headCount", "budget", "costCenter", "tenantSlug", "updatedAt")
				VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
				ON CONFLICT ("code", "tenantSlug") DO UPDATE SET
					"name" = EXCLUDED."name",
					"head" = EXCLUDED."head",
					"headCount" = EXCLUDED."headCount",
					"budget" = EXCLUDED."budget",
					"costCenter" = EXCLUDED."costCenter",
					"updatedAt" = NOW()`,
				item.Code, item.Name, item.Head, item.HeadCount, item.Budget, item.CostCenter, item.TenantSlug)
			if err != nil {
				log.Printf("⚠️ Warning: Failed to persist department to database: %v", err)
			}
		}

		deptLock.Lock()
		list := customDepts[tenantSlug]
		updated := false
		for i, ex := range list {
			if ex.Code == item.Code {
				list[i] = item
				updated = true
				break
			}
		}
		if !updated {
			list = append(list, item)
		}
		customDepts[tenantSlug] = list
		deptLock.Unlock()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(item)

	} else if r.Method == http.MethodDelete {
		code := strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("code")))
		if code == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Department code is required"})
			return
		}

		if db != nil {
			if tenantSlug != "" && tenantSlug != "all" {
				_, _ = db.Exec(`DELETE FROM "Department" WHERE "code" = $1 AND ("tenantSlug" = $2 OR "tenantSlug" = '' OR "tenantSlug" IS NULL)`, code, tenantSlug)
			} else {
				_, _ = db.Exec(`DELETE FROM "Department" WHERE "code" = $1`, code)
			}
		}

		deptLock.Lock()
		list := customDepts[tenantSlug]
		for i, ex := range list {
			if ex.Code == code {
				customDepts[tenantSlug] = append(list[:i], list[i+1:]...)
				break
			}
		}
		deptLock.Unlock()

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Department removed"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
