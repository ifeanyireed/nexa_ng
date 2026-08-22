package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

// HandleProposals handles proposals REST endpoints
func HandleProposals(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT p.id, p.proposal_number, p.client_id, c.name, p.amount, p.status, p.valid_until, p.created_at " +
			"FROM proposals p LEFT JOIN clients c ON p.client_id = c.id ORDER BY p.created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		proposals := []Proposal{}
		for rows.Next() {
			var p Proposal
			var clientName sql.NullString
			var createdAt time.Time
			if err := rows.Scan(&p.ID, &p.ProposalNumber, &p.ClientID, &clientName, &p.Amount, &p.Status, &p.ValidUntil, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			p.ClientName = "Unknown Client"
			if clientName.Valid {
				p.ClientName = clientName.String
			}
			p.CreatedAt = createdAt
			proposals = append(proposals, p)
		}
		json.NewEncoder(w).Encode(proposals)

	} else if r.Method == http.MethodPost {
		var p Proposal
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if p.ProposalNumber == "" || p.ClientID == "" || p.Amount <= 0 || p.ValidUntil == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if p.ID == "" {
			p.ID = "prop-" + generateUUID()[:8]
		}
		if p.Status == "" {
			p.Status = "Draft"
		}

		_, err := db.Exec("INSERT INTO proposals (id, proposal_number, client_id, amount, status, valid_until) VALUES (?, ?, ?, ?, ?, ?)",
			p.ID, p.ProposalNumber, p.ClientID, p.Amount, p.Status, p.ValidUntil)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": p.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleEstimates handles estimates REST endpoints
func HandleEstimates(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT e.id, e.estimate_number, e.client_id, c.name, e.amount, e.status, e.created_at " +
			"FROM estimates e LEFT JOIN clients c ON e.client_id = c.id ORDER BY e.created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		estimates := []Estimate{}
		for rows.Next() {
			var e Estimate
			var clientName sql.NullString
			var createdAt time.Time
			if err := rows.Scan(&e.ID, &e.EstimateNumber, &e.ClientID, &clientName, &e.Amount, &e.Status, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			e.ClientName = "Unknown Client"
			if clientName.Valid {
				e.ClientName = clientName.String
			}
			e.CreatedAt = createdAt
			estimates = append(estimates, e)
		}
		json.NewEncoder(w).Encode(estimates)

	} else if r.Method == http.MethodPost {
		var e Estimate
		if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if e.EstimateNumber == "" || e.ClientID == "" || e.Amount <= 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if e.ID == "" {
			e.ID = "est-" + generateUUID()[:8]
		}
		if e.Status == "" {
			e.Status = "Draft"
		}

		_, err := db.Exec("INSERT INTO estimates (id, estimate_number, client_id, amount, status) VALUES (?, ?, ?, ?, ?)",
			e.ID, e.EstimateNumber, e.ClientID, e.Amount, e.Status)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": e.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleRetainers handles retainers REST endpoints
func HandleRetainers(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT re.id, re.retainer_number, re.client_id, c.name, re.amount, re.status, re.created_at " +
			"FROM retainers re LEFT JOIN clients c ON re.client_id = c.id ORDER BY re.created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		retainers := []Retainer{}
		for rows.Next() {
			var re Retainer
			var clientName sql.NullString
			var createdAt time.Time
			if err := rows.Scan(&re.ID, &re.RetainerNumber, &re.ClientID, &clientName, &re.Amount, &re.Status, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			re.ClientName = "Unknown Client"
			if clientName.Valid {
				re.ClientName = clientName.String
			}
			re.CreatedAt = createdAt
			retainers = append(retainers, re)
		}
		json.NewEncoder(w).Encode(retainers)

	} else if r.Method == http.MethodPost {
		var re Retainer
		if err := json.NewDecoder(r.Body).Decode(&re); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if re.RetainerNumber == "" || re.ClientID == "" || re.Amount <= 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if re.ID == "" {
			re.ID = "ret-" + generateUUID()[:8]
		}
		if re.Status == "" {
			re.Status = "Pending"
		}

		_, err := db.Exec("INSERT INTO retainers (id, retainer_number, client_id, amount, status) VALUES (?, ?, ?, ?, ?)",
			re.ID, re.RetainerNumber, re.ClientID, re.Amount, re.Status)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": re.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleCreditNotes handles credit notes REST endpoints
func HandleCreditNotes(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT cn.id, cn.credit_note_number, cn.client_id, c.name, cn.invoice_id, cn.amount, cn.reason, cn.status, cn.created_at " +
			"FROM credit_notes cn LEFT JOIN clients c ON cn.client_id = c.id ORDER BY cn.created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		creditNotes := []CreditNote{}
		for rows.Next() {
			var cn CreditNote
			var clientName sql.NullString
			var invId, reason sql.NullString
			var createdAt time.Time
			if err := rows.Scan(&cn.ID, &cn.CreditNoteNumber, &cn.ClientID, &clientName, &invId, &cn.Amount, &reason, &cn.Status, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			cn.ClientName = "Unknown Client"
			if clientName.Valid {
				cn.ClientName = clientName.String
			}
			if invId.Valid {
				cn.InvoiceID = &invId.String
			}
			if reason.Valid {
				cn.Reason = &reason.String
			}
			cn.CreatedAt = createdAt
			creditNotes = append(creditNotes, cn)
		}
		json.NewEncoder(w).Encode(creditNotes)

	} else if r.Method == http.MethodPost {
		var cn CreditNote
		if err := json.NewDecoder(r.Body).Decode(&cn); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if cn.CreditNoteNumber == "" || cn.ClientID == "" || cn.Amount <= 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if cn.ID == "" {
			cn.ID = "cn-" + generateUUID()[:8]
		}
		if cn.Status == "" {
			cn.Status = "Unused"
		}

		var invId, reason string
		if cn.InvoiceID != nil {
			invId = *cn.InvoiceID
		}
		if cn.Reason != nil {
			reason = *cn.Reason
		}

		_, err := db.Exec("INSERT INTO credit_notes (id, credit_note_number, client_id, invoice_id, amount, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
			cn.ID, cn.CreditNoteNumber, cn.ClientID, invId, cn.Amount, reason, cn.Status)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": cn.ID})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// HandleOrders handles client orders REST endpoints
func HandleOrders(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, err := db.Query("SELECT id, client, total, order_date, note, status, created_at FROM orders ORDER BY created_at DESC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		defer rows.Close()

		orders := []Order{}
		for rows.Next() {
			var o Order
			var note string
			var createdAt time.Time
			if err := rows.Scan(&o.ID, &o.Client, &o.Total, &o.OrderDate, &note, &o.Status, &createdAt); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			o.Note = &note
			o.CreatedAt = createdAt
			orders = append(orders, o)
		}
		json.NewEncoder(w).Encode(orders)

	} else if r.Method == http.MethodPost {
		var o Order
		if err := json.NewDecoder(r.Body).Decode(&o); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if o.Client == "" || o.Total <= 0 || o.OrderDate == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if o.ID == "" {
			o.ID = "ord-" + generateUUID()[:8]
		}
		if o.Status == "" {
			o.Status = "Pending"
		}

		var note string
		if o.Note != nil {
			note = *o.Note
		}

		_, err := db.Exec("INSERT INTO orders (id, client, total, order_date, note, status) VALUES (?, ?, ?, ?, ?, ?)",
			o.ID, o.Client, o.Total, o.OrderDate, note, o.Status)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": o.ID})
	} else if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		_, err := db.Exec("DELETE FROM orders WHERE id = ?", id)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Order deleted"})
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
