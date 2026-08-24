package handlers

import (
	"encoding/json"
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
	{Code: "DEPT-FIN", Name: "Finance & Accounts", Head: "Oluwatobiloba Olateju", HeadCount: 8, Budget: "₦42,000,000", CostCenter: "CC-101"},
	{Code: "DEPT-FLT", Name: "Fleet Operations & Maintenance", Head: "Babajide Sanwo", HeadCount: 28, Budget: "₦95,000,000", CostCenter: "CC-201"},
	{Code: "DEPT-IT", Name: "Systems & IT / ERP", Head: "Adeyemi Phillips", HeadCount: 6, Budget: "₦28,000,000", CostCenter: "CC-301"},
	{Code: "DEPT-HR", Name: "Human Resources & Talent", Head: "Goldy Okeke", HeadCount: 5, Budget: "₦18,500,000", CostCenter: "CC-401"},
	{Code: "DEPT-MKT", Name: "Commercial & Growth", Head: "Chioma Okonkwo", HeadCount: 12, Budget: "₦35,000,000", CostCenter: "CC-501"},
	{Code: "DEPT-EXE", Name: "Executive Directorate", Head: "Dr. Babatunde Jinadu (MD)", HeadCount: 4, Budget: "₦50,000,000", CostCenter: "CC-001"},
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

	tenantSlug := getTenantFilter(r)
	if tenantSlug == "" {
		tenantSlug = "neweratransports"
	}

	if r.Method == http.MethodGet {
		// Fetch tenant users to calculate dynamic headcount & leadership
		users := []User{}
		if db != nil {
			var query string
			var args []interface{}
			if tenantSlug == "neweratransports" || tenantSlug == "nets" || tenantSlug == "new-era-transports" {
				query = "SELECT id, name, email, role, department, avatar, managerName, managerId, designation, company FROM User WHERE (company = 'NETS' OR LOWER(company) LIKE '%new era%' OR LOWER(email) LIKE '%@neweratransports.com%' OR company IS NULL OR company = '')"
			} else {
				query = "SELECT id, name, email, role, department, avatar, managerName, managerId, designation, company FROM User WHERE (LOWER(company) = ? OR LOWER(company) LIKE ? OR LOWER(email) LIKE ?)"
				args = append(args, tenantSlug, "%"+tenantSlug+"%", "%@"+tenantSlug+"%")
			}
			rows, err := db.Query(query, args...)
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

		deptLock.RLock()
		customs := customDepts[tenantSlug]
		deptLock.RUnlock()

		results := make([]DepartmentItem, 0, len(defaultDepartments)+len(customs))
		for _, d := range defaultDepartments {
			head, count := getDepartmentHeadAndCount(d.Name, users)
			if head == "" {
				head = d.Head
			}
			headCount := count
			if headCount == 0 && (tenantSlug == "neweratransports" || tenantSlug == "nets") {
				headCount = d.HeadCount
			}
			results = append(results, DepartmentItem{
				Code:       d.Code,
				Name:       d.Name,
				Head:       head,
				HeadCount:  headCount,
				Budget:     d.Budget,
				CostCenter: d.CostCenter,
				TenantSlug: tenantSlug,
			})
		}

		for _, c := range customs {
			head, count := getDepartmentHeadAndCount(c.Name, users)
			if head == "" {
				head = c.Head
			}
			headCount := count
			if headCount == 0 {
				headCount = c.HeadCount
			}
			results = append(results, DepartmentItem{
				Code:       c.Code,
				Name:       c.Name,
				Head:       head,
				HeadCount:  headCount,
				Budget:     c.Budget,
				CostCenter: c.CostCenter,
				TenantSlug: tenantSlug,
			})
		}

		json.NewEncoder(w).Encode(results)

	} else if r.Method == http.MethodPost {
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
		item.TenantSlug = tenantSlug
		if item.HeadCount == 0 {
			item.HeadCount = 1
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
