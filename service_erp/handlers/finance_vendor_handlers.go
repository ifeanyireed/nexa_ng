package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

// HandleVendors handles vendors REST endpoints
func HandleVendors(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, name, email, phone, company_name, status, created_at FROM vendors ORDER BY name ASC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		vendors := []Vendor{}
		for rows.Next() {
			var v Vendor
			var createdAt time.Time
			if err := rows.Scan(&v.ID, &v.Name, &v.Email, &v.Phone, &v.CompanyName, &v.Status, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			v.CreatedAt = createdAt
			vendors = append(vendors, v)
		}
		json.NewEncoder(w).Encode(vendors)

	} else if r.Method == http.MethodPost {
		var v Vendor
		if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if v.Name == "" || v.Email == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if v.ID == "" {
			v.ID = "vend-" + generateUUID()[:8]
		}
		if v.Status == "" {
			v.Status = "Active"
		}

		_, err := db.Exec("INSERT INTO vendors (id, name, email, phone, company_name, status) VALUES (?, ?, ?, ?, ?, ?)",
			v.ID, v.Name, v.Email, v.Phone, v.CompanyName, v.Status)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": v.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleBills handles bills REST endpoints
func HandleBills(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT b.id, b.bill_number, b.vendor_id, v.name, b.amount, b.due_date, b.status, b.description, b.created_at " +
			"FROM bills b LEFT JOIN vendors v ON b.vendor_id = v.id ORDER BY b.created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		bills := []Bill{}
		for rows.Next() {
			var b Bill
			var vendorName sql.NullString
			var desc sql.NullString
			var createdAt time.Time
			if err := rows.Scan(&b.ID, &b.BillNumber, &b.VendorID, &vendorName, &b.Amount, &b.DueDate, &b.Status, &desc, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			b.VendorName = "Unknown Vendor"
			if vendorName.Valid {
				b.VendorName = vendorName.String
			}
			if desc.Valid {
				b.Description = &desc.String
			}
			b.CreatedAt = createdAt
			bills = append(bills, b)
		}
		json.NewEncoder(w).Encode(bills)

	} else if r.Method == http.MethodPost {
		var b Bill
		if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if b.BillNumber == "" || b.VendorID == "" || b.Amount <= 0 || b.DueDate == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if b.ID == "" {
			b.ID = "bill-" + generateUUID()[:8]
		}
		if b.Status == "" {
			b.Status = "Unpaid"
		}

		var desc string
		if b.Description != nil {
			desc = *b.Description
		}

		_, err := db.Exec("INSERT INTO bills (id, bill_number, vendor_id, amount, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
			b.ID, b.BillNumber, b.VendorID, b.Amount, b.DueDate, b.Status, desc)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": b.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleDebitNotes handles debit notes REST endpoints
func HandleDebitNotes(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT dn.id, dn.debit_note_number, dn.vendor_id, v.name, dn.bill_id, dn.amount, dn.reason, dn.status, dn.created_at " +
			"FROM debit_notes dn LEFT JOIN vendors v ON dn.vendor_id = v.id ORDER BY dn.created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		debitNotes := []DebitNote{}
		for rows.Next() {
			var dn DebitNote
			var vendorName sql.NullString
			var billId, reason sql.NullString
			var createdAt time.Time
			if err := rows.Scan(&dn.ID, &dn.DebitNoteNumber, &dn.VendorID, &vendorName, &billId, &dn.Amount, &reason, &dn.Status, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			dn.VendorName = "Unknown Vendor"
			if vendorName.Valid {
				dn.VendorName = vendorName.String
			}
			if billId.Valid {
				dn.BillID = &billId.String
			}
			if reason.Valid {
				dn.Reason = &reason.String
			}
			dn.CreatedAt = createdAt
			debitNotes = append(debitNotes, dn)
		}
		json.NewEncoder(w).Encode(debitNotes)

	} else if r.Method == http.MethodPost {
		var dn DebitNote
		if err := json.NewDecoder(r.Body).Decode(&dn); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if dn.DebitNoteNumber == "" || dn.VendorID == "" || dn.Amount <= 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if dn.ID == "" {
			dn.ID = "dn-" + generateUUID()[:8]
		}
		if dn.Status == "" {
			dn.Status = "Unused"
		}

		var billId, reason string
		if dn.BillID != nil {
			billId = *dn.BillID
		}
		if dn.Reason != nil {
			reason = *dn.Reason
		}

		_, err := db.Exec("INSERT INTO debit_notes (id, debit_note_number, vendor_id, bill_id, amount, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
			dn.ID, dn.DebitNoteNumber, dn.VendorID, billId, dn.Amount, reason, dn.Status)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": dn.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
