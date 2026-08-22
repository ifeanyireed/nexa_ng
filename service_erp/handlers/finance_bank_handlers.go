package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

// HandleBankAccounts handles GET and POST for bank accounts
func HandleBankAccounts(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, name, account_no, bank_name, currency, status, balance, created_at FROM bank_accounts ORDER BY name ASC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		accounts := []BankAccount{}
		for rows.Next() {
			var ba BankAccount
			var createdAt time.Time
			if err := rows.Scan(&ba.ID, &ba.Name, &ba.AccountNo, &ba.BankName, &ba.Currency, &ba.Status, &ba.Balance, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			ba.CreatedAt = createdAt
			accounts = append(accounts, ba)
		}
		json.NewEncoder(w).Encode(accounts)

	} else if r.Method == http.MethodPost {
		var ba BankAccount
		if err := json.NewDecoder(r.Body).Decode(&ba); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if ba.Name == "" || ba.AccountNo == "" || ba.BankName == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if ba.ID == "" {
			ba.ID = "bank-" + generateUUID()[:8]
		}
		if ba.Status == "" {
			ba.Status = "Active"
		}
		if ba.Currency == "" {
			ba.Currency = "NGN"
		}

		_, err := db.Exec("INSERT INTO bank_accounts (id, name, account_no, bank_name, currency, status, balance) VALUES (?, ?, ?, ?, ?, ?, ?)",
			ba.ID, ba.Name, ba.AccountNo, ba.BankName, ba.Currency, ba.Status, ba.Balance)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": ba.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleBankReconciliations handles bank reconciliation sessions
func HandleBankReconciliations(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT br.id, br.bank_account_id, ba.name, br.statement_date, br.ending_balance, br.reconciled_balance, br.difference, br.status, br.prepared_by, br.notes, br.created_at " +
			"FROM bank_reconciliations br LEFT JOIN bank_accounts ba ON br.bank_account_id = ba.id ORDER BY br.created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		reconciles := []BankReconciliation{}
		for rows.Next() {
			var br BankReconciliation
			var bankAccountName sql.NullString
			var notes sql.NullString
			var createdAt time.Time
			if err := rows.Scan(&br.ID, &br.BankAccountID, &bankAccountName, &br.StatementDate, &br.EndingBalance, &br.ReconciledBalance, &br.Difference, &br.Status, &br.PreparedBy, &notes, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			br.BankAccountName = "Unknown Account"
			if bankAccountName.Valid {
				br.BankAccountName = bankAccountName.String
			}
			if notes.Valid {
				br.Notes = &notes.String
			}
			br.CreatedAt = createdAt
			reconciles = append(reconciles, br)
		}
		json.NewEncoder(w).Encode(reconciles)

	} else if r.Method == http.MethodPost {
		var br BankReconciliation
		if err := json.NewDecoder(r.Body).Decode(&br); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if br.BankAccountID == "" || br.StatementDate == "" || br.PreparedBy == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if br.ID == "" {
			br.ID = "brec-" + generateUUID()[:8]
		}
		if br.Status == "" {
			br.Status = "In Progress"
		}

		// Calculate difference: Statement ending balance vs System reconciled balance
		br.Difference = br.EndingBalance - br.ReconciledBalance

		var notes string
		if br.Notes != nil {
			notes = *br.Notes
		}

		_, err := db.Exec("INSERT INTO bank_reconciliations (id, bank_account_id, statement_date, ending_balance, reconciled_balance, difference, status, prepared_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			br.ID, br.BankAccountID, br.StatementDate, br.EndingBalance, br.ReconciledBalance, br.Difference, br.Status, br.PreparedBy, notes)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": br.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
