package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

// HandleAccounts handles GET and POST for accounts
func HandleAccounts(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, code, name, category, normal_balance, opening_balance FROM accounts ORDER BY code ASC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		accounts := []Account{}
		for rows.Next() {
			var a Account
			if err := rows.Scan(&a.ID, &a.Code, &a.Name, &a.Category, &a.NormalBalance, &a.OpeningBalance); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}

			// Dynamically calculate debits and credits from journal items
			db.QueryRow("SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0) FROM journal_items WHERE account_id = ?", a.ID).
				Scan(&a.Debits, &a.Credits)

			if a.NormalBalance == "Debit" {
				a.ClosingBalance = a.OpeningBalance + a.Debits - a.Credits
			} else {
				a.ClosingBalance = a.OpeningBalance - a.Debits + a.Credits
			}

			accounts = append(accounts, a)
		}
		json.NewEncoder(w).Encode(accounts)

	} else if r.Method == http.MethodPost {
		var a Account
		if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		if a.Code == "" || a.Name == "" || a.Category == "" || a.NormalBalance == "" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing required fields"})
			return
		}

		if a.ID == "" {
			a.ID = "acc-" + generateUUID()[:8]
		}

		_, err := db.Exec("INSERT INTO accounts (id, code, name, category, normal_balance, opening_balance) VALUES (?, ?, ?, ?, ?, ?)",
			a.ID, a.Code, a.Name, a.Category, a.NormalBalance, a.OpeningBalance)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": a.ID, "message": "Account created successfully"})
	} else if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		_, err := db.Exec("DELETE FROM accounts WHERE id = ?", id)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Account deleted successfully"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleJournalEntries handles GET and POST for double-entry journal items
func HandleJournalEntries(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, entry_date, reference_no, description, status, created_at FROM journal_entries ORDER BY entry_date DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		entries := []JournalEntry{}
		for rows.Next() {
			var je JournalEntry
			var ref, desc string
			var createdAt time.Time
			if err := rows.Scan(&je.ID, &je.EntryDate, &ref, &desc, &je.Status, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			je.ReferenceNo = &ref
			je.Description = &desc
			je.CreatedAt = createdAt

			// Retrieve item lines
			itemRows, err := db.Query("SELECT ji.id, ji.journal_entry_id, ji.account_id, a.code, a.name, ji.description, ji.debit, ji.credit "+
				"FROM journal_items ji JOIN accounts a ON ji.account_id = a.id WHERE ji.journal_entry_id = ?", je.ID)
			if err == nil {
				items := []JournalItem{}
				for itemRows.Next() {
					var ji JournalItem
					var itemDesc string
					if err := itemRows.Scan(&ji.ID, &ji.JournalEntryID, &ji.AccountID, &ji.AccountCode, &ji.AccountName, &itemDesc, &ji.Debit, &ji.Credit); err == nil {
						ji.Description = &itemDesc
						items = append(items, ji)
					}
				}
				itemRows.Close()
				je.Items = items
			}

			entries = append(entries, je)
		}
		json.NewEncoder(w).Encode(entries)

	} else if r.Method == http.MethodPost {
		var je JournalEntry
		if err := json.NewDecoder(r.Body).Decode(&je); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if je.EntryDate == "" || len(je.Items) < 2 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing entry date or transaction items (minimum 2 lines)"})
			return
		}

		// Double entry verification: total debits must equal total credits
		var totalDebit, totalCredit float64
		for _, item := range je.Items {
			totalDebit += item.Debit
			totalCredit += item.Credit
		}
		if totalDebit != totalCredit {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Double-entry imbalance: total debits must equal total credits"})
			return
		}

		if je.ID == "" {
			je.ID = "ent-" + generateUUID()[:8]
		}
		if je.Status == "" {
			je.Status = "Draft"
		}

		tx, err := db.Begin()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		var ref, desc string
		if je.ReferenceNo != nil {
			ref = *je.ReferenceNo
		}
		if je.Description != nil {
			desc = *je.Description
		}

		_, err = tx.Exec("INSERT INTO journal_entries (id, entry_date, reference_no, description, status) VALUES (?, ?, ?, ?, ?)",
			je.ID, je.EntryDate, ref, desc, je.Status)
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		for _, item := range je.Items {
			itemId := "jline-" + generateUUID()[:8]
			var lineDesc string
			if item.Description != nil {
				lineDesc = *item.Description
			}
			_, err = tx.Exec("INSERT INTO journal_items (id, journal_entry_id, account_id, description, debit, credit) VALUES (?, ?, ?, ?, ?, ?)",
				itemId, je.ID, item.AccountID, lineDesc, item.Debit, item.Credit)
			if err != nil {
				tx.Rollback()
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
		}

		tx.Commit()
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": je.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleRecurringJournals handles GET and POST for scheduled journals
func HandleRecurringJournals(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, profile_name, frequency, start_date, end_date, next_run_date, status, created_at FROM recurring_journals ORDER BY created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		journals := []RecurringJournal{}
		for rows.Next() {
			var rj RecurringJournal
			var endDate string
			var createdAt time.Time
			if err := rows.Scan(&rj.ID, &rj.ProfileName, &rj.Frequency, &rj.StartDate, &endDate, &rj.NextRunDate, &rj.Status, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			rj.EndDate = &endDate
			rj.CreatedAt = createdAt
			journals = append(journals, rj)
		}
		json.NewEncoder(w).Encode(journals)

	} else if r.Method == http.MethodPost {
		var rj RecurringJournal
		if err := json.NewDecoder(r.Body).Decode(&rj); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if rj.ProfileName == "" || rj.Frequency == "" || rj.StartDate == "" || rj.NextRunDate == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if rj.ID == "" {
			rj.ID = "recj-" + generateUUID()[:8]
		}
		if rj.Status == "" {
			rj.Status = "Active"
		}

		var endDate string
		if rj.EndDate != nil {
			endDate = *rj.EndDate
		}

		_, err := db.Exec("INSERT INTO recurring_journals (id, profile_name, frequency, start_date, end_date, next_run_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
			rj.ID, rj.ProfileName, rj.Frequency, rj.StartDate, endDate, rj.NextRunDate, rj.Status)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": rj.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
