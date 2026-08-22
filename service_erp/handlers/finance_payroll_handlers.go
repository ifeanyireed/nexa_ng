package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

// HandlePayrolls handles payroll run logs
func HandlePayrolls(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, period_month, period_year, total_amount, status, created_at FROM payrolls ORDER BY period_year DESC, period_month DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		payrolls := []Payroll{}
		for rows.Next() {
			var p Payroll
			var createdAt time.Time
			if err := rows.Scan(&p.ID, &p.PeriodMonth, &p.PeriodYear, &p.TotalAmount, &p.Status, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			p.CreatedAt = createdAt
			payrolls = append(payrolls, p)
		}
		json.NewEncoder(w).Encode(payrolls)

	} else if r.Method == http.MethodPost {
		var p Payroll
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if p.PeriodMonth <= 0 || p.PeriodYear <= 0 || p.TotalAmount <= 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if p.ID == "" {
			p.ID = "pay-" + generateUUID()[:8]
		}
		if p.Status == "" {
			p.Status = "Draft"
		}

		_, err := db.Exec("INSERT INTO payrolls (id, period_month, period_year, total_amount, status) VALUES (?, ?, ?, ?, ?)",
			p.ID, p.PeriodMonth, p.PeriodYear, p.TotalAmount, p.Status)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": p.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleEmployeeSalaries handles employees salaries items nested under payrolls
func HandleEmployeeSalaries(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		payrollId := r.URL.Query().Get("payrollId")
		if payrollId == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		rows, err := db.Query("SELECT id, payroll_id, employee_name, basic_salary, allowances, deductions, net_salary, status FROM employee_salaries WHERE payroll_id = ?", payrollId)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		salaries := []EmployeeSalary{}
		for rows.Next() {
			var es EmployeeSalary
			if err := rows.Scan(&es.ID, &es.PayrollID, &es.EmployeeName, &es.BasicSalary, &es.Allowances, &es.Deductions, &es.NetSalary, &es.Status); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			salaries = append(salaries, es)
		}
		json.NewEncoder(w).Encode(salaries)

	} else if r.Method == http.MethodPost {
		var es EmployeeSalary
		if err := json.NewDecoder(r.Body).Decode(&es); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if es.PayrollID == "" || es.EmployeeName == "" || es.BasicSalary <= 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if es.ID == "" {
			es.ID = "sal-" + generateUUID()[:8]
		}
		if es.Status == "" {
			es.Status = "Pending"
		}

		// Net Salary Calculation
		es.NetSalary = es.BasicSalary + es.Allowances - es.Deductions

		_, err := db.Exec("INSERT INTO employee_salaries (id, payroll_id, employee_name, basic_salary, allowances, deductions, net_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			es.ID, es.PayrollID, es.EmployeeName, es.BasicSalary, es.Allowances, es.Deductions, es.NetSalary, es.Status)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": es.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleStatutoryRemittances handles tax remittances entries
func HandleStatutoryRemittances(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, type, amount, period_month, period_year, due_date, status, payment_date, created_at FROM statutory_remittances ORDER BY created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		remittances := []StatutoryRemittance{}
		for rows.Next() {
			var sr StatutoryRemittance
			var payDate string
			var createdAt time.Time
			if err := rows.Scan(&sr.ID, &sr.Type, &sr.Amount, &sr.PeriodMonth, &sr.PeriodYear, &sr.DueDate, &sr.Status, &payDate, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			sr.PaymentDate = &payDate
			sr.CreatedAt = createdAt
			remittances = append(remittances, sr)
		}
		json.NewEncoder(w).Encode(remittances)

	} else if r.Method == http.MethodPost {
		var sr StatutoryRemittance
		if err := json.NewDecoder(r.Body).Decode(&sr); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if sr.Type == "" || sr.Amount <= 0 || sr.DueDate == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if sr.ID == "" {
			sr.ID = "rem-" + generateUUID()[:8]
		}
		if sr.Status == "" {
			sr.Status = "Pending"
		}

		var payDate string
		if sr.PaymentDate != nil {
			payDate = *sr.PaymentDate
		}

		_, err := db.Exec("INSERT INTO statutory_remittances (id, type, amount, period_month, period_year, due_date, status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			sr.ID, sr.Type, sr.Amount, sr.PeriodMonth, sr.PeriodYear, sr.DueDate, sr.Status, payDate)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": sr.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
