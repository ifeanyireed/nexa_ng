package handlers

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Helper to generate unique ID
func generateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func HandleStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	targetDB, slug := requireTenantDB(w, r)
	if targetDB == nil {
		return
	}

	var stats DashboardStats

	// Calculate Total Revenue (Credit transactions)
	err := targetDB.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'Credit' AND LOWER(tenant_slug) = $1", slug).Scan(&stats.TotalRevenue)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Calculate Total Expenses (Debit transactions)
	err = targetDB.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'Debit' AND LOWER(tenant_slug) = $1", slug).Scan(&stats.TotalExpenses)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Calculate Pending Payables (Pending expenses amount)
	err = targetDB.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status = 'Pending' AND LOWER(tenant_slug) = $1", slug).Scan(&stats.PendingPayables)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Calculate Outstanding Invoices (Unpaid/Overdue invoices amount)
	err = targetDB.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status IN ('Unpaid', 'Overdue') AND LOWER(tenant_slug) = $1", slug).Scan(&stats.OutstandingInvoice)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(stats)
}

func HandleExpenses(w http.ResponseWriter, r *http.Request) {
	targetDB, slug := requireTenantDB(w, r)
	if targetDB == nil {
		return
	}

	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			var e Expense
			var approvedBy, description sql.NullString
			var createdAtRaw, updatedAtRaw time.Time
			err := targetDB.QueryRow("SELECT id, title, category, amount, status, requested_by, approved_by, description, created_at, updated_at FROM expenses WHERE id = $1 AND LOWER(tenant_slug) = $2", id, slug).
				Scan(&e.ID, &e.Title, &e.Category, &e.Amount, &e.Status, &e.RequestedBy, &approvedBy, &description, &createdAtRaw, &updatedAtRaw)
			if err == sql.ErrNoRows {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "Expense not found"})
				return
			} else if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}

			if approvedBy.Valid {
				e.ApprovedBy = &approvedBy.String
			}
			if description.Valid {
				e.Description = &description.String
			}
			e.CreatedAt = createdAtRaw
			e.UpdatedAt = updatedAtRaw

			json.NewEncoder(w).Encode(e)
			return
		}

		rows, err := targetDB.Query("SELECT id, title, category, amount, status, requested_by, approved_by, description, created_at, updated_at FROM expenses WHERE LOWER(tenant_slug) = $1 ORDER BY created_at DESC", slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		expenses := []Expense{}
		for rows.Next() {
			var e Expense
			var approvedBy, description sql.NullString
			var createdAtRaw, updatedAtRaw time.Time

			if err := rows.Scan(&e.ID, &e.Title, &e.Category, &e.Amount, &e.Status, &e.RequestedBy, &approvedBy, &description, &createdAtRaw, &updatedAtRaw); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}

			if approvedBy.Valid {
				e.ApprovedBy = &approvedBy.String
			}
			if description.Valid {
				e.Description = &description.String
			}
			e.CreatedAt = createdAtRaw
			e.UpdatedAt = updatedAtRaw

			expenses = append(expenses, e)
		}
		json.NewEncoder(w).Encode(expenses)

	} else if r.Method == http.MethodPost {
		var e Expense
		if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if e.Title == "" || e.Category == "" || e.Amount <= 0 || e.RequestedBy == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing required fields or invalid amount"})
			return
		}

		if e.ID == "" {
			e.ID = "exp-" + generateUUID()[:8]
		}
		if e.Status == "" {
			e.Status = "Pending"
		}

		var approvedByVal *string = nil
		if e.ApprovedBy != nil && *e.ApprovedBy != "" {
			approvedByVal = e.ApprovedBy
		}

		_, err := targetDB.Exec("INSERT INTO expenses (id, title, category, amount, status, requested_by, approved_by, description, tenant_slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
			e.ID, e.Title, e.Category, e.Amount, e.Status, e.RequestedBy, approvedByVal, e.Description, slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		// If approved or disbursed on creation, update cash transactions
		if e.Status == "Disbursed" {
			txID := "txn-" + generateUUID()[:8]
			desc := fmt.Sprintf("Auto-debit from disbursed expense request: %s", e.Title)
			_, _ = targetDB.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description, tenant_slug) VALUES ($1, $2, 'Debit', $3, $4, CURRENT_DATE, $5, $6)",
				txID, e.ID, e.Category, e.Amount, desc, slug)
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": e.ID, "message": "Expense request submitted successfully"})

	} else if r.Method == http.MethodPut {
		var e Expense
		if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if e.ID == "" || e.Status == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing expense ID or status"})
			return
		}

		// Get current expense details to check if status changed to Disbursed
		var currentStatus string
		var amount float64
		var title string
		var category string
		err := targetDB.QueryRow("SELECT status, amount, title, category FROM expenses WHERE id = $1 AND LOWER(tenant_slug) = $2", e.ID, slug).Scan(&currentStatus, &amount, &title, &category)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Expense not found"})
			return
		}

		var approvedByVal *string = nil
		if e.ApprovedBy != nil && *e.ApprovedBy != "" {
			approvedByVal = e.ApprovedBy
		}

		_, err = targetDB.Exec("UPDATE expenses SET status = $1, approved_by = $2, description = COALESCE($3, description), updated_at = NOW() WHERE id = $4 AND LOWER(tenant_slug) = $5",
			e.Status, approvedByVal, e.Description, e.ID, slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		// If status changed to Disbursed, record ledger entry
		if currentStatus != "Disbursed" && e.Status == "Disbursed" {
			txID := "txn-" + generateUUID()[:8]
			desc := fmt.Sprintf("Imprest disbursement for expense request: %s", title)
			_, _ = targetDB.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description, tenant_slug) VALUES ($1, $2, 'Debit', $3, $4, CURRENT_DATE, $5, $6)",
				txID, e.ID, category, amount, desc, slug)
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Expense status updated successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func HandleInvoices(w http.ResponseWriter, r *http.Request) {
	targetDB, slug := requireTenantDB(w, r)
	if targetDB == nil {
		return
	}

	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			var inv Invoice
			var description sql.NullString
			var dueDateRaw time.Time
			var createdAt, updatedAt time.Time

			err := targetDB.QueryRow("SELECT id, invoice_number, customer_name, customer_email, amount, due_date, status, description, created_at, updated_at FROM invoices WHERE id = $1 AND LOWER(tenant_slug) = $2", id, slug).
				Scan(&inv.ID, &inv.InvoiceNumber, &inv.CustomerName, &inv.CustomerEmail, &inv.Amount, &dueDateRaw, &inv.Status, &description, &createdAt, &updatedAt)
			if err == sql.ErrNoRows {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "Invoice not found"})
				return
			} else if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}

			if description.Valid {
				inv.Description = &description.String
			}
			inv.DueDate = dueDateRaw.Format("2006-01-02")
			inv.CreatedAt = createdAt
			inv.UpdatedAt = updatedAt

			json.NewEncoder(w).Encode(inv)
			return
		}

		rows, err := targetDB.Query("SELECT id, invoice_number, customer_name, customer_email, amount, due_date, status, description, created_at, updated_at FROM invoices WHERE LOWER(tenant_slug) = $1 ORDER BY created_at DESC", slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		invoices := []Invoice{}
		for rows.Next() {
			var inv Invoice
			var description sql.NullString
			var dueDateRaw time.Time
			var createdAt, updatedAt time.Time

			if err := rows.Scan(&inv.ID, &inv.InvoiceNumber, &inv.CustomerName, &inv.CustomerEmail, &inv.Amount, &dueDateRaw, &inv.Status, &description, &createdAt, &updatedAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}

			if description.Valid {
				inv.Description = &description.String
			}
			inv.DueDate = dueDateRaw.Format("2006-01-02")
			inv.CreatedAt = createdAt
			inv.UpdatedAt = updatedAt

			invoices = append(invoices, inv)
		}
		json.NewEncoder(w).Encode(invoices)

	} else if r.Method == http.MethodPost {
		var inv Invoice
		if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if inv.CustomerName == "" || inv.CustomerEmail == "" || inv.Amount <= 0 || inv.DueDate == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Incomplete parameters"})
			return
		}

		if inv.ID == "" {
			inv.ID = "inv-" + generateUUID()[:8]
		}
		if inv.InvoiceNumber == "" {
			inv.InvoiceNumber = fmt.Sprintf("INV-2026-%03d", time.Now().UnixNano()%1000)
		}
		if inv.Status == "" {
			inv.Status = "Unpaid"
		}

		_, err := targetDB.Exec("INSERT INTO invoices (id, invoice_number, customer_name, customer_email, amount, due_date, status, description, tenant_slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
			inv.ID, inv.InvoiceNumber, inv.CustomerName, inv.CustomerEmail, inv.Amount, inv.DueDate, inv.Status, inv.Description, slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		// If marked as Paid on creation, log a transaction
		if inv.Status == "Paid" {
			txID := "txn-" + generateUUID()[:8]
			desc := fmt.Sprintf("Revenue received for invoice: %s", inv.InvoiceNumber)
			_, _ = targetDB.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description, tenant_slug) VALUES ($1, $2, 'Credit', 'Revenue - Billing', $3, CURRENT_DATE, $4, $5)",
				txID, inv.ID, inv.Amount, desc, slug)
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": inv.ID, "invoiceNumber": inv.InvoiceNumber, "message": "Invoice created successfully"})

	} else if r.Method == http.MethodPut {
		var inv Invoice
		if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if inv.ID == "" || inv.Status == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing invoice ID or status"})
			return
		}

		// Get current status to see if it changed to Paid
		var currentStatus string
		var amount float64
		var invNumber string
		err := targetDB.QueryRow("SELECT status, amount, invoice_number FROM invoices WHERE id = $1 AND LOWER(tenant_slug) = $2", inv.ID, slug).Scan(&currentStatus, &amount, &invNumber)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invoice not found"})
			return
		}

		_, err = targetDB.Exec("UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2 AND LOWER(tenant_slug) = $3", inv.Status, inv.ID, slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		// Log credit transaction if marked as Paid
		if currentStatus != "Paid" && inv.Status == "Paid" {
			txID := "txn-" + generateUUID()[:8]
			desc := fmt.Sprintf("Payment received for invoice: %s", invNumber)
			_, _ = targetDB.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description, tenant_slug) VALUES ($1, $2, 'Credit', 'Revenue - Corporate Client', $3, CURRENT_DATE, $4, $5)",
				txID, inv.ID, amount, desc, slug)
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Invoice status updated successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func HandleReconciliations(w http.ResponseWriter, r *http.Request) {
	targetDB, slug := requireTenantDB(w, r)
	if targetDB == nil {
		return
	}

	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			var rec Reconciliation
			var notes sql.NullString
			var pStart, pEnd time.Time
			var createdAt time.Time

			err := targetDB.QueryRow("SELECT id, title, type, period_start, period_end, expected_amount, actual_amount, discrepancy, status, prepared_by, notes, created_at FROM reconciliations WHERE id = $1 AND LOWER(tenant_slug) = $2", id, slug).
				Scan(&rec.ID, &rec.Title, &rec.Type, &pStart, &pEnd, &rec.ExpectedAmount, &rec.ActualAmount, &rec.Discrepancy, &rec.Status, &rec.PreparedBy, &notes, &createdAt)
			if err == sql.ErrNoRows {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "Reconciliation log not found"})
				return
			} else if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}

			if notes.Valid {
				rec.Notes = &notes.String
			}
			rec.PeriodStart = pStart.Format("2006-01-02")
			rec.PeriodEnd = pEnd.Format("2006-01-02")
			rec.CreatedAt = createdAt

			json.NewEncoder(w).Encode(rec)
			return
		}

		rows, err := targetDB.Query("SELECT id, title, type, period_start, period_end, expected_amount, actual_amount, discrepancy, status, prepared_by, notes, created_at FROM reconciliations WHERE LOWER(tenant_slug) = $1 ORDER BY created_at DESC", slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		reconciliations := []Reconciliation{}
		for rows.Next() {
			var rec Reconciliation
			var notes sql.NullString
			var pStart, pEnd time.Time
			var createdAt time.Time

			if err := rows.Scan(&rec.ID, &rec.Title, &rec.Type, &pStart, &pEnd, &rec.ExpectedAmount, &rec.ActualAmount, &rec.Discrepancy, &rec.Status, &rec.PreparedBy, &notes, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}

			if notes.Valid {
				rec.Notes = &notes.String
			}
			rec.PeriodStart = pStart.Format("2006-01-02")
			rec.PeriodEnd = pEnd.Format("2006-01-02")
			rec.CreatedAt = createdAt

			reconciliations = append(reconciliations, rec)
		}
		json.NewEncoder(w).Encode(reconciliations)

	} else if r.Method == http.MethodPost {
		var rec Reconciliation
		if err := json.NewDecoder(r.Body).Decode(&rec); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if rec.Title == "" || rec.Type == "" || rec.PeriodStart == "" || rec.PeriodEnd == "" || rec.PreparedBy == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Incomplete parameters"})
			return
		}

		if rec.ID == "" {
			rec.ID = "rec-" + generateUUID()[:8]
		}
		if rec.Status == "" {
			rec.Status = "Pending"
		}
		rec.Discrepancy = rec.ActualAmount - rec.ExpectedAmount

		_, err := targetDB.Exec("INSERT INTO reconciliations (id, title, type, period_start, period_end, expected_amount, actual_amount, discrepancy, status, prepared_by, notes, tenant_slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
			rec.ID, rec.Title, rec.Type, rec.PeriodStart, rec.PeriodEnd, rec.ExpectedAmount, rec.ActualAmount, rec.Discrepancy, rec.Status, rec.PreparedBy, rec.Notes, slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": rec.ID, "message": "Reconciliation log created successfully"})

	} else if r.Method == http.MethodPut {
		var rec Reconciliation
		if err := json.NewDecoder(r.Body).Decode(&rec); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if rec.ID == "" || rec.Status == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing reconciliation ID or status"})
			return
		}

		_, err := targetDB.Exec("UPDATE reconciliations SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 AND LOWER(tenant_slug) = $4", rec.Status, rec.Notes, rec.ID, slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Reconciliation status updated successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func HandleTransactions(w http.ResponseWriter, r *http.Request) {
	targetDB, slug := requireTenantDB(w, r)
	if targetDB == nil {
		return
	}

	if r.Method == http.MethodGet {
		rows, err := targetDB.Query("SELECT id, reference_id, type, category, amount, date, description, created_at FROM transactions WHERE LOWER(tenant_slug) = $1 ORDER BY date DESC, created_at DESC", slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		transactions := []Transaction{}
		for rows.Next() {
			var tx Transaction
			var refId, description sql.NullString
			var dateRaw time.Time
			var createdAt time.Time

			if err := rows.Scan(&tx.ID, &refId, &tx.Type, &tx.Category, &tx.Amount, &dateRaw, &description, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}

			if refId.Valid {
				tx.ReferenceID = &refId.String
			}
			if description.Valid {
				tx.Description = &description.String
			}
			tx.Date = dateRaw.Format("2006-01-02")
			tx.CreatedAt = createdAt

			transactions = append(transactions, tx)
		}
		json.NewEncoder(w).Encode(transactions)

	} else if r.Method == http.MethodPost {
		var tx Transaction
		if err := json.NewDecoder(r.Body).Decode(&tx); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if tx.Type == "" || tx.Category == "" || tx.Amount <= 0 || tx.Date == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Incomplete parameters"})
			return
		}

		if tx.ID == "" {
			tx.ID = "txn-" + generateUUID()[:8]
		}

		_, err := targetDB.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description, tenant_slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
			tx.ID, tx.ReferenceID, tx.Type, tx.Category, tx.Amount, tx.Date, tx.Description, slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": tx.ID, "message": "Transaction logged successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func HandleClients(w http.ResponseWriter, r *http.Request) {
	targetDB, slug := requireTenantDB(w, r)
	if targetDB == nil {
		return
	}

	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			var c Client
			var createdAt, updatedAt time.Time
			err := targetDB.QueryRow("SELECT id, name, sub_name, email, category, status, company_name, phone, website, vat, created_at, updated_at FROM clients WHERE id = $1 AND LOWER(tenant_slug) = $2", id, slug).
				Scan(&c.ID, &c.Name, &c.SubName, &c.Email, &c.Category, &c.Status, &c.CompanyName, &c.Phone, &c.Website, &c.Vat, &createdAt, &updatedAt)
			if err == sql.ErrNoRows {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "Client not found"})
				return
			} else if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			c.CreatedAt = createdAt
			c.UpdatedAt = updatedAt
			json.NewEncoder(w).Encode(c)
			return
		}

		rows, err := targetDB.Query("SELECT id, name, sub_name, email, category, status, company_name, phone, website, vat, created_at, updated_at FROM clients WHERE LOWER(tenant_slug) = $1 ORDER BY name ASC", slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		clients := []Client{}
		for rows.Next() {
			var c Client
			var createdAt, updatedAt time.Time
			if err := rows.Scan(&c.ID, &c.Name, &c.SubName, &c.Email, &c.Category, &c.Status, &c.CompanyName, &c.Phone, &c.Website, &c.Vat, &createdAt, &updatedAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			c.CreatedAt = createdAt
			c.UpdatedAt = updatedAt
			clients = append(clients, c)
		}
		json.NewEncoder(w).Encode(clients)

	} else if r.Method == http.MethodPost {
		var c Client
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if c.Name == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing required field: name"})
			return
		}

		if c.ID == "" {
			c.ID = "cli-" + generateUUID()[:8]
		}
		if c.Status == "" {
			c.Status = "Active"
		}
		if c.SubName == "" {
			c.SubName = c.Name
		}
		if c.CompanyName == "" {
			c.CompanyName = c.Name
		}

		_, err := targetDB.Exec("INSERT INTO clients (id, name, sub_name, email, category, status, company_name, phone, website, vat, tenant_slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
			c.ID, c.Name, c.SubName, c.Email, c.Category, c.Status, c.CompanyName, c.Phone, c.Website, c.Vat, slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": c.ID, "message": "Client added successfully"})

	} else if r.Method == http.MethodPut {
		var c Client
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if c.ID == "" || c.Name == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing client ID or Name"})
			return
		}

		_, err := targetDB.Exec("UPDATE clients SET name = $1, sub_name = $2, email = $3, category = $4, status = $5, company_name = $6, phone = $7, website = $8, vat = $9, updated_at = NOW() WHERE id = $10 AND LOWER(tenant_slug) = $11",
			c.Name, c.SubName, c.Email, c.Category, c.Status, c.CompanyName, c.Phone, c.Website, c.Vat, c.ID, slug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Client updated successfully"})

	} else if r.Method == http.MethodDelete {
		ids := r.URL.Query().Get("id")
		if ids == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing client ID"})
			return
		}

		idList := strings.Split(ids, ",")
		for _, id := range idList {
			id = strings.TrimSpace(id)
			if id == "" {
				continue
			}
			_, err := targetDB.Exec("DELETE FROM clients WHERE id = $1 AND LOWER(tenant_slug) = $2", id, slug)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Client(s) deleted successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
