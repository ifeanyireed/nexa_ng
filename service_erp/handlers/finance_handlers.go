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

	var stats DashboardStats

	// Calculate Total Revenue (Credit transactions)
	err := db.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'Credit'").Scan(&stats.TotalRevenue)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Calculate Total Expenses (Debit transactions)
	err = db.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'Debit'").Scan(&stats.TotalExpenses)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Calculate Pending Payables (Pending expenses amount)
	err = db.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status = 'Pending'").Scan(&stats.PendingPayables)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Calculate Outstanding Invoices (Unpaid/Overdue invoices amount)
	err = db.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status IN ('Unpaid', 'Overdue')").Scan(&stats.OutstandingInvoice)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(stats)
}

func HandleExpenses(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			var e Expense
			var approvedBy, description sql.NullString
			var createdAt, updatedAt []byte

			err := db.QueryRow("SELECT id, title, category, amount, status, requested_by, approved_by, description, created_at, updated_at FROM expenses WHERE id = ?", id).
				Scan(&e.ID, &e.Title, &e.Category, &e.Amount, &e.Status, &e.RequestedBy, &approvedBy, &description, &createdAt, &updatedAt)
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
			
			// Parse times
			e.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", string(createdAt))
			e.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", string(updatedAt))

			json.NewEncoder(w).Encode(e)
			return
		}

		rows, err := db.Query("SELECT id, title, category, amount, status, requested_by, approved_by, description, created_at, updated_at FROM expenses ORDER BY created_at DESC")
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

		_, err := db.Exec("INSERT INTO expenses (id, title, category, amount, status, requested_by, approved_by, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			e.ID, e.Title, e.Category, e.Amount, e.Status, e.RequestedBy, approvedByVal, e.Description)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		// If approved or disbursed on creation, update cash transactions
		if e.Status == "Disbursed" {
			txID := "txn-" + generateUUID()[:8]
			desc := fmt.Sprintf("Auto-debit from disbursed expense request: %s", e.Title)
			_, _ = db.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description) VALUES (?, ?, 'Debit', ?, ?, CURRENT_DATE(), ?)",
				txID, e.ID, e.Category, e.Amount, desc)
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
		err := db.QueryRow("SELECT status, amount, title, category FROM expenses WHERE id = ?", e.ID).Scan(&currentStatus, &amount, &title, &category)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Expense not found"})
			return
		}

		var approvedByVal *string = nil
		if e.ApprovedBy != nil && *e.ApprovedBy != "" {
			approvedByVal = e.ApprovedBy
		}

		_, err = db.Exec("UPDATE expenses SET status = ?, approved_by = ?, description = COALESCE(?, description) WHERE id = ?",
			e.Status, approvedByVal, e.Description, e.ID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		// If status changed to Disbursed, record ledger entry
		if currentStatus != "Disbursed" && e.Status == "Disbursed" {
			txID := "txn-" + generateUUID()[:8]
			desc := fmt.Sprintf("Imprest disbursement for expense request: %s", title)
			_, _ = db.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description) VALUES (?, ?, 'Debit', ?, ?, CURRENT_DATE(), ?)",
				txID, e.ID, category, amount, desc)
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Expense status updated successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func HandleInvoices(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			var inv Invoice
			var description sql.NullString
			var dueDateRaw time.Time
			var createdAt, updatedAt time.Time

			err := db.QueryRow("SELECT id, invoice_number, customer_name, customer_email, amount, due_date, status, description, created_at, updated_at FROM invoices WHERE id = ?", id).
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

		rows, err := db.Query("SELECT id, invoice_number, customer_name, customer_email, amount, due_date, status, description, created_at, updated_at FROM invoices ORDER BY created_at DESC")
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

		_, err := db.Exec("INSERT INTO invoices (id, invoice_number, customer_name, customer_email, amount, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			inv.ID, inv.InvoiceNumber, inv.CustomerName, inv.CustomerEmail, inv.Amount, inv.DueDate, inv.Status, inv.Description)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		// If marked as Paid on creation, log a transaction
		if inv.Status == "Paid" {
			txID := "txn-" + generateUUID()[:8]
			desc := fmt.Sprintf("Revenue received for invoice: %s", inv.InvoiceNumber)
			_, _ = db.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description) VALUES (?, ?, 'Credit', 'Revenue - Billing', ?, CURRENT_DATE(), ?)",
				txID, inv.ID, inv.Amount, desc)
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
		err := db.QueryRow("SELECT status, amount, invoice_number FROM invoices WHERE id = ?", inv.ID).Scan(&currentStatus, &amount, &invNumber)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invoice not found"})
			return
		}

		_, err = db.Exec("UPDATE invoices SET status = ? WHERE id = ?", inv.Status, inv.ID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		// Log credit transaction if marked as Paid
		if currentStatus != "Paid" && inv.Status == "Paid" {
			txID := "txn-" + generateUUID()[:8]
			desc := fmt.Sprintf("Payment received for invoice: %s", invNumber)
			_, _ = db.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description) VALUES (?, ?, 'Credit', 'Revenue - Corporate Client', ?, CURRENT_DATE(), ?)",
				txID, inv.ID, amount, desc)
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Invoice status updated successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func HandleReconciliations(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			var rec Reconciliation
			var notes sql.NullString
			var pStart, pEnd time.Time
			var createdAt time.Time

			err := db.QueryRow("SELECT id, title, type, period_start, period_end, expected_amount, actual_amount, discrepancy, status, prepared_by, notes, created_at FROM reconciliations WHERE id = ?", id).
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

		rows, err := db.Query("SELECT id, title, type, period_start, period_end, expected_amount, actual_amount, discrepancy, status, prepared_by, notes, created_at FROM reconciliations ORDER BY created_at DESC")
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

		_, err := db.Exec("INSERT INTO reconciliations (id, title, type, period_start, period_end, expected_amount, actual_amount, discrepancy, status, prepared_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			rec.ID, rec.Title, rec.Type, rec.PeriodStart, rec.PeriodEnd, rec.ExpectedAmount, rec.ActualAmount, rec.Discrepancy, rec.Status, rec.PreparedBy, rec.Notes)
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

		_, err := db.Exec("UPDATE reconciliations SET status = ?, notes = COALESCE(?, notes) WHERE id = ?", rec.Status, rec.Notes, rec.ID)
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
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, reference_id, type, category, amount, date, description, created_at FROM transactions ORDER BY date DESC, created_at DESC")
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

		_, err := db.Exec("INSERT INTO transactions (id, reference_id, type, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
			tx.ID, tx.ReferenceID, tx.Type, tx.Category, tx.Amount, tx.Date, tx.Description)
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
	if r.Method == http.MethodGet {
		id := r.URL.Query().Get("id")
		if id != "" {
			var c Client
			var createdAt, updatedAt time.Time
			err := db.QueryRow("SELECT id, name, sub_name, email, category, status, company_name, phone, website, vat, created_at, updated_at FROM clients WHERE id = ?", id).
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

		rows, err := db.Query("SELECT id, name, sub_name, email, category, status, company_name, phone, website, vat, created_at, updated_at FROM clients ORDER BY name ASC")
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

		_, err := db.Exec("INSERT INTO clients (id, name, sub_name, email, category, status, company_name, phone, website, vat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			c.ID, c.Name, c.SubName, c.Email, c.Category, c.Status, c.CompanyName, c.Phone, c.Website, c.Vat)
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

		_, err := db.Exec("UPDATE clients SET name = ?, sub_name = ?, email = ?, category = ?, status = ?, company_name = ?, phone = ?, website = ?, vat = ? WHERE id = ?",
			c.Name, c.SubName, c.Email, c.Category, c.Status, c.CompanyName, c.Phone, c.Website, c.Vat, c.ID)
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
			_, err := db.Exec("DELETE FROM clients WHERE id = ?", id)
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
