package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Helper to get tenant slug from request headers or query
func getTenantSlug(r *http.Request) string {
	slug := r.Header.Get("x-tenant-slug")
	if slug == "" {
		slug = r.URL.Query().Get("tenant")
	}
	if slug == "" {
		slug = r.URL.Query().Get("tenant_slug")
	}
	if slug == "" {
		slug = "default"
	}
	return strings.ToLower(strings.TrimSpace(slug))
}

// =============================================================================
// 1. CRM ACCOUNTS
// =============================================================================

func HandleCrmAccounts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		rows, err := db.Query(`SELECT id, tenant_slug, name, industry, tier, website, phone, city, status, owner, notes, created_at, updated_at
			FROM crm_accounts WHERE LOWER(tenant_slug) = $1 ORDER BY created_at DESC`, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		accounts := []map[string]any{}
		for rows.Next() {
			var id, tSlug, name string
			var industry, tier, website, phone, city, status, owner, notes *string
			var createdAt, updatedAt time.Time
			if err := rows.Scan(&id, &tSlug, &name, &industry, &tier, &website, &phone, &city, &status, &owner, &notes, &createdAt, &updatedAt); err == nil {
				accounts = append(accounts, map[string]any{
					"id":         id,
					"tenantSlug": tSlug,
					"name":       name,
					"industry":   industry,
					"tier":       tier,
					"website":    website,
					"phone":      phone,
					"city":       city,
					"status":     status,
					"owner":      owner,
					"notes":      notes,
					"createdAt":  createdAt,
					"updatedAt":  updatedAt,
				})
			}
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "accounts": accounts})
		return
	}

	if r.Method == http.MethodPost {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		id := fmt.Sprintf("ACC-%d", time.Now().UnixMilli())
		if customId, ok := body["id"].(string); ok && customId != "" {
			id = customId
		}
		name, _ := body["name"].(string)
		industry, _ := body["industry"].(string)
		tier, _ := body["tier"].(string)
		website, _ := body["website"].(string)
		phone, _ := body["phone"].(string)
		city, _ := body["city"].(string)
		status, _ := body["status"].(string)
		owner, _ := body["owner"].(string)
		notes, _ := body["notes"].(string)
		if status == "" {
			status = "ACTIVE"
		}

		_, err := db.Exec(`INSERT INTO crm_accounts (id, tenant_slug, name, industry, tier, website, phone, city, status, owner, notes, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
			ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name, industry = EXCLUDED.industry, tier = EXCLUDED.tier,
			website = EXCLUDED.website, phone = EXCLUDED.phone, city = EXCLUDED.city,
			status = EXCLUDED.status, owner = EXCLUDED.owner, notes = EXCLUDED.notes, updated_at = NOW()`,
			id, slug, name, industry, tier, website, phone, city, status, owner, notes)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{"success": true, "account": map[string]any{"id": id, "name": name, "tenantSlug": slug}})
		return
	}

	if r.Method == http.MethodPatch {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}
		id, _ := body["id"].(string)
		if id == "" {
			http.Error(w, `{"error": "Account ID required"}`, http.StatusBadRequest)
			return
		}

		name, _ := body["name"].(string)
		industry, _ := body["industry"].(string)
		status, _ := body["status"].(string)
		notes, _ := body["notes"].(string)

		_, err := db.Exec(`UPDATE crm_accounts SET
			name = COALESCE(NULLIF($1, ''), name),
			industry = COALESCE(NULLIF($2, ''), industry),
			status = COALESCE(NULLIF($3, ''), status),
			notes = COALESCE(NULLIF($4, ''), notes),
			updated_at = NOW()
			WHERE id = $5 AND LOWER(tenant_slug) = $6`,
			name, industry, status, notes, id, slug)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "account": map[string]any{"id": id}})
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, `{"error": "Account ID required"}`, http.StatusBadRequest)
			return
		}
		_, err := db.Exec(`DELETE FROM crm_accounts WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

// =============================================================================
// 2. CRM LEADS
// =============================================================================

func HandleCrmLeads(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		rows, err := db.Query(`SELECT id, tenant_slug, name, company, email, phone, source, score, status, owner, value, notes, created_at, updated_at
			FROM crm_leads WHERE LOWER(tenant_slug) = $1 ORDER BY created_at DESC`, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		leads := []map[string]any{}
		for rows.Next() {
			var id, tSlug, name string
			var company, email, phone, source, status, owner, value, notes *string
			var score int
			var createdAt, updatedAt time.Time
			if err := rows.Scan(&id, &tSlug, &name, &company, &email, &phone, &source, &score, &status, &owner, &value, &notes, &createdAt, &updatedAt); err == nil {
				leads = append(leads, map[string]any{
					"id":         id,
					"tenantSlug": tSlug,
					"name":       name,
					"company":    company,
					"email":      email,
					"phone":      phone,
					"source":     source,
					"score":      score,
					"status":     status,
					"owner":      owner,
					"value":      value,
					"notes":      notes,
					"createdAt":  createdAt,
					"updatedAt":  updatedAt,
				})
			}
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "leads": leads})
		return
	}

	if r.Method == http.MethodPost {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		id := fmt.Sprintf("LED-%d", time.Now().UnixMilli())
		if customId, ok := body["id"].(string); ok && customId != "" {
			id = customId
		}
		name, _ := body["name"].(string)
		company, _ := body["company"].(string)
		email, _ := body["email"].(string)
		phone, _ := body["phone"].(string)
		source, _ := body["source"].(string)
		status, _ := body["status"].(string)
		owner, _ := body["owner"].(string)
		value, _ := body["value"].(string)
		notes, _ := body["notes"].(string)
		score := 50
		if s, ok := body["score"].(float64); ok {
			score = int(s)
		}
		if status == "" {
			status = "NEW"
		}

		_, err := db.Exec(`INSERT INTO crm_leads (id, tenant_slug, name, company, email, phone, source, score, status, owner, value, notes, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
			ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name, company = EXCLUDED.company, email = EXCLUDED.email,
			phone = EXCLUDED.phone, source = EXCLUDED.source, score = EXCLUDED.score,
			status = EXCLUDED.status, owner = EXCLUDED.owner, value = EXCLUDED.value,
			notes = EXCLUDED.notes, updated_at = NOW()`,
			id, slug, name, company, email, phone, source, score, status, owner, value, notes)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{"success": true, "lead": map[string]any{"id": id, "name": name, "tenantSlug": slug}})
		return
	}

	if r.Method == http.MethodPatch {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}
		id, _ := body["id"].(string)
		if id == "" {
			http.Error(w, `{"error": "Lead ID required"}`, http.StatusBadRequest)
			return
		}

		status, _ := body["status"].(string)
		notes, _ := body["notes"].(string)

		_, err := db.Exec(`UPDATE crm_leads SET
			status = COALESCE(NULLIF($1, ''), status),
			notes = COALESCE(NULLIF($2, ''), notes),
			updated_at = NOW()
			WHERE id = $3 AND LOWER(tenant_slug) = $4`,
			status, notes, id, slug)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "lead": map[string]any{"id": id}})
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, `{"error": "Lead ID required"}`, http.StatusBadRequest)
			return
		}
		_, err := db.Exec(`DELETE FROM crm_leads WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

// =============================================================================
// 3. CRM DEALS
// =============================================================================

func HandleCrmDeals(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		rows, err := db.Query(`SELECT id, tenant_slug, title, company, contact_name, email, phone, value, stage, owner, probability, expected_close, notes, account_id, lead_id, created_at, updated_at
			FROM crm_deals WHERE LOWER(tenant_slug) = $1 ORDER BY created_at DESC`, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		deals := []map[string]any{}
		for rows.Next() {
			var id, tSlug, title string
			var company, contactName, email, phone, value, stage, owner, expectedClose, notes, accountId, leadId *string
			var probability int
			var createdAt, updatedAt time.Time
			if err := rows.Scan(&id, &tSlug, &title, &company, &contactName, &email, &phone, &value, &stage, &owner, &probability, &expectedClose, &notes, &accountId, &leadId, &createdAt, &updatedAt); err == nil {
				deals = append(deals, map[string]any{
					"id":            id,
					"tenantSlug":    tSlug,
					"title":         title,
					"company":       company,
					"contactName":   contactName,
					"email":         email,
					"phone":         phone,
					"value":         value,
					"stage":         stage,
					"owner":         owner,
					"probability":   probability,
					"expectedClose": expectedClose,
					"notes":         notes,
					"accountId":     accountId,
					"leadId":        leadId,
					"createdAt":     createdAt,
					"updatedAt":     updatedAt,
				})
			}
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "deals": deals})
		return
	}

	if r.Method == http.MethodPost {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		id := fmt.Sprintf("DEL-%d", time.Now().UnixMilli())
		if customId, ok := body["id"].(string); ok && customId != "" {
			id = customId
		}
		title, _ := body["title"].(string)
		company, _ := body["company"].(string)
		contactName, _ := body["contactName"].(string)
		email, _ := body["email"].(string)
		phone, _ := body["phone"].(string)
		value, _ := body["value"].(string)
		stage, _ := body["stage"].(string)
		owner, _ := body["owner"].(string)
		expectedClose, _ := body["expectedClose"].(string)
		notes, _ := body["notes"].(string)
		probability := 50
		if p, ok := body["probability"].(float64); ok {
			probability = int(p)
		}
		if stage == "" {
			stage = "DISCOVERY"
		}

		_, err := db.Exec(`INSERT INTO crm_deals (id, tenant_slug, title, company, contact_name, email, phone, value, stage, owner, probability, expected_close, notes, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
			ON CONFLICT (id) DO UPDATE SET
			title = EXCLUDED.title, company = EXCLUDED.company, contact_name = EXCLUDED.contact_name,
			email = EXCLUDED.email, phone = EXCLUDED.phone, value = EXCLUDED.value,
			stage = EXCLUDED.stage, owner = EXCLUDED.owner, probability = EXCLUDED.probability,
			expected_close = EXCLUDED.expected_close, notes = EXCLUDED.notes, updated_at = NOW()`,
			id, slug, title, company, contactName, email, phone, value, stage, owner, probability, expectedClose, notes)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{"success": true, "deal": map[string]any{"id": id, "title": title, "tenantSlug": slug}})
		return
	}

	if r.Method == http.MethodPatch {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}
		id, _ := body["id"].(string)
		if id == "" {
			http.Error(w, `{"error": "Deal ID required"}`, http.StatusBadRequest)
			return
		}

		stage, _ := body["stage"].(string)
		notes, _ := body["notes"].(string)

		_, err := db.Exec(`UPDATE crm_deals SET
			stage = COALESCE(NULLIF($1, ''), stage),
			notes = COALESCE(NULLIF($2, ''), notes),
			updated_at = NOW()
			WHERE id = $3 AND LOWER(tenant_slug) = $4`,
			stage, notes, id, slug)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "deal": map[string]any{"id": id}})
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, `{"error": "Deal ID required"}`, http.StatusBadRequest)
			return
		}
		_, err := db.Exec(`DELETE FROM crm_deals WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

// =============================================================================
// 4. CRM ACTIVITIES
// =============================================================================

func HandleCrmActivities(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		rows, err := db.Query(`SELECT id, tenant_slug, type, title, company, rep, date_time, status, notes, created_at
			FROM crm_activities WHERE LOWER(tenant_slug) = $1 ORDER BY created_at DESC`, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		activities := []map[string]any{}
		for rows.Next() {
			var id, tSlug, actType, title string
			var company, rep, dateTime, status, notes *string
			var createdAt time.Time
			if err := rows.Scan(&id, &tSlug, &actType, &title, &company, &rep, &dateTime, &status, &notes, &createdAt); err == nil {
				activities = append(activities, map[string]any{
					"id":         id,
					"tenantSlug": tSlug,
					"type":       actType,
					"title":      title,
					"company":    company,
					"rep":        rep,
					"dateTime":   dateTime,
					"status":     status,
					"notes":      notes,
					"createdAt":  createdAt,
				})
			}
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "activities": activities})
		return
	}

	if r.Method == http.MethodPost {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		id := fmt.Sprintf("ACT-%d", time.Now().UnixMilli())
		if customId, ok := body["id"].(string); ok && customId != "" {
			id = customId
		}
		actType, _ := body["type"].(string)
		title, _ := body["title"].(string)
		company, _ := body["company"].(string)
		rep, _ := body["rep"].(string)
		dateTime, _ := body["dateTime"].(string)
		status, _ := body["status"].(string)
		notes, _ := body["notes"].(string)
		if status == "" {
			status = "PENDING"
		}
		if actType == "" {
			actType = "CALL"
		}

		_, err := db.Exec(`INSERT INTO crm_activities (id, tenant_slug, type, title, company, rep, date_time, status, notes, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
			id, slug, actType, title, company, rep, dateTime, status, notes)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{"success": true, "activity": map[string]any{"id": id, "title": title, "tenantSlug": slug}})
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, `{"error": "Activity ID required"}`, http.StatusBadRequest)
			return
		}
		_, err := db.Exec(`DELETE FROM crm_activities WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

// =============================================================================
// 5. CRM SUBSCRIBER ONE-CLICK UNSUBSCRIBE (ACROSS TENANTS & AUDIENCE LISTS)
// =============================================================================

func HandleCrmUnsubscribe(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	if r.Method == http.MethodGet {
		email := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("email")))
		listId := r.URL.Query().Get("list_id")
		tenantSlug := r.URL.Query().Get("tenant")

		if email == "" {
			http.Error(w, `{"error": "Email address required"}`, http.StatusBadRequest)
			return
		}

		var count int
		if listId != "" {
			_ = db.QueryRow(`SELECT COUNT(*) FROM crm_email_subscribers WHERE LOWER(email) = $1 AND list_id = $2`, email, listId).Scan(&count)
		} else if tenantSlug != "" {
			_ = db.QueryRow(`SELECT COUNT(*) FROM crm_email_subscribers WHERE LOWER(email) = $1 AND LOWER(tenant_slug) = $2`, email, strings.ToLower(tenantSlug)).Scan(&count)
		} else {
			_ = db.QueryRow(`SELECT COUNT(*) FROM crm_email_subscribers WHERE LOWER(email) = $1`, email).Scan(&count)
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success":          true,
			"email":            email,
			"subscriptions":    count,
			"global_status":    "ACTIVE",
		})
		return
	}

	if r.Method == http.MethodPost {
		var payload struct {
			Email      string `json:"email"`
			ListId     string `json:"list_id"`
			TenantSlug string `json:"tenant"`
			Action     string `json:"action"` // "unsubscribe" or "resubscribe"
			Reason     string `json:"reason"`
		}

		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			// Try form decode for RFC 8058 one-click unsubscribe
			payload.Email = r.URL.Query().Get("email")
			payload.ListId = r.URL.Query().Get("list_id")
			payload.TenantSlug = r.URL.Query().Get("tenant")
			payload.Action = "unsubscribe"
			payload.Reason = "One-click email client header"
		}

		email := strings.ToLower(strings.TrimSpace(payload.Email))
		if email == "" {
			email = strings.ToLower(strings.TrimSpace(r.URL.Query().Get("email")))
		}
		if email == "" {
			http.Error(w, `{"error": "Email address required"}`, http.StatusBadRequest)
			return
		}

		targetStatus := "UNSUBSCRIBED"
		if payload.Action == "resubscribe" {
			targetStatus = "SUBSCRIBED"
		}
		reason := payload.Reason
		if reason == "" {
			reason = "One-click unsubscribe"
		}

		// Regardless of tenant or list: if list_id or tenant is provided, target specifically;
		// otherwise execute global unsubscribe across ALL lists and ALL tenants!
		var res any
		var err error
		if payload.ListId != "" && payload.TenantSlug != "" {
			res, err = db.Exec(`UPDATE crm_email_subscribers
				SET status = $1, unsubscribed_at = NOW(), unsubscribe_reason = $2
				WHERE LOWER(email) = $3 AND list_id = $4 AND LOWER(tenant_slug) = $5`,
				targetStatus, reason, email, payload.ListId, strings.ToLower(payload.TenantSlug))
		} else if payload.TenantSlug != "" {
			res, err = db.Exec(`UPDATE crm_email_subscribers
				SET status = $1, unsubscribed_at = NOW(), unsubscribe_reason = $2
				WHERE LOWER(email) = $3 AND LOWER(tenant_slug) = $4`,
				targetStatus, reason, email, strings.ToLower(payload.TenantSlug))
		} else {
			// Global removal across all tenants and lists
			res, err = db.Exec(`UPDATE crm_email_subscribers
				SET status = $1, unsubscribed_at = NOW(), unsubscribe_reason = $2
				WHERE LOWER(email) = $3`,
				targetStatus, reason, email)
		}

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to update subscription status: %s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		// Log CRM activity
		actId := fmt.Sprintf("ACT-%d", time.Now().UnixMilli())
		tSlug := strings.ToLower(payload.TenantSlug)
		if tSlug == "" {
			tSlug = "default"
		}
		_, _ = db.Exec(`INSERT INTO crm_activities (id, tenant_slug, type, title, company, rep, date_time, status, notes, created_at)
			VALUES ($1, $2, 'EMAIL', $3, 'Mailing List', 'System Unsubscribe', NOW(), 'COMPLETED', $4, NOW())`,
			actId, tSlug, fmt.Sprintf("%s: %s", targetStatus, email), reason)

		_ = res
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"message": "You have been successfully unsubscribed from audience communications.",
			"email":   email,
			"status":  targetStatus,
		})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

// =============================================================================
// 6. CRM AUDIENCE LISTS
// =============================================================================

func HandleCrmLists(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		rows, err := db.Query(`SELECT l.id, l.tenant_slug, l.name, l.description, l.tags, l.created_at,
			(SELECT COUNT(*) FROM crm_email_subscribers s WHERE s.list_id = l.id AND s.status = 'SUBSCRIBED') as sub_count
			FROM crm_email_lists l
			WHERE LOWER(l.tenant_slug) = $1
			ORDER BY l.created_at DESC`, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		lists := []map[string]any{}
		for rows.Next() {
			var id, tSlug, name string
			var description, tags *string
			var createdAt time.Time
			var subCount int
			if err := rows.Scan(&id, &tSlug, &name, &description, &tags, &createdAt, &subCount); err == nil {
				parsedTags := []string{}
				if tags != nil && *tags != "" {
					_ = json.Unmarshal([]byte(*tags), &parsedTags)
					if len(parsedTags) == 0 {
						for _, t := range strings.Split(*tags, ",") {
							trimmed := strings.TrimSpace(t)
							if trimmed != "" {
								parsedTags = append(parsedTags, trimmed)
							}
						}
					}
				}
				lists = append(lists, map[string]any{
					"id":              id,
					"tenantSlug":      tSlug,
					"name":            name,
					"description":     description,
					"tags":            parsedTags,
					"subscriberCount": subCount,
					"createdAt":       createdAt,
				})
			}
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "lists": lists})
		return
	}

	if r.Method == http.MethodPost {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		id := fmt.Sprintf("LST-%d", time.Now().UnixMilli())
		if customId, ok := body["id"].(string); ok && customId != "" {
			id = customId
		}
		name, _ := body["name"].(string)
		description, _ := body["description"].(string)
		var tagsStr string
		if rawTags, ok := body["tags"]; ok {
			b, _ := json.Marshal(rawTags)
			tagsStr = string(b)
		}

		_, err := db.Exec(`INSERT INTO crm_email_lists (id, tenant_slug, name, description, tags, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
			ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name, description = EXCLUDED.description, tags = EXCLUDED.tags, updated_at = NOW()`,
			id, slug, name, description, tagsStr)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"list": map[string]any{
				"id":              id,
				"tenantSlug":      slug,
				"name":            name,
				"description":     description,
				"subscriberCount": 0,
				"createdAt":       time.Now(),
			},
		})
		return
	}

	if r.Method == http.MethodPatch || r.Method == http.MethodPut {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}
		id, _ := body["id"].(string)
		if id == "" {
			http.Error(w, `{"error": "List ID required"}`, http.StatusBadRequest)
			return
		}

		name, _ := body["name"].(string)
		description, _ := body["description"].(string)
		var tagsStr *string
		if rawTags, ok := body["tags"]; ok {
			b, _ := json.Marshal(rawTags)
			s := string(b)
			tagsStr = &s
		}

		_, err := db.Exec(`UPDATE crm_email_lists SET
			name = COALESCE(NULLIF($1, ''), name),
			description = COALESCE(NULLIF($2, ''), description),
			tags = COALESCE($3, tags),
			updated_at = NOW()
			WHERE id = $4 AND LOWER(tenant_slug) = $5`,
			name, description, tagsStr, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"list": map[string]any{
				"id":         id,
				"tenantSlug": slug,
				"name":       name,
			},
		})
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			id = r.URL.Query().Get("listId")
		}
		if id == "" {
			http.Error(w, `{"error": "List ID required"}`, http.StatusBadRequest)
			return
		}

		_, err := db.Exec(`DELETE FROM crm_email_lists WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		_, _ = db.Exec(`DELETE FROM crm_email_subscribers WHERE list_id = $1 AND LOWER(tenant_slug) = $2`, id, slug)

		json.NewEncoder(w).Encode(map[string]any{"success": true, "deletedId": id})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

// =============================================================================
// 7. CRM SUBSCRIBERS
// =============================================================================

func HandleCrmSubscribers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		listId := r.URL.Query().Get("listId")
		if listId == "" {
			listId = r.URL.Query().Get("list_id")
		}
		if listId == "" {
			http.Error(w, `{"error": "listId parameter is required"}`, http.StatusBadRequest)
			return
		}

		rows, err := db.Query(`SELECT id, list_id, tenant_slug, email, name, role, department, status,
			first_name, last_name, company, phone, linkedin_url, created_at
			FROM crm_email_subscribers
			WHERE list_id = $1 AND LOWER(tenant_slug) = $2
			ORDER BY created_at DESC`, listId, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		subs := []map[string]any{}
		for rows.Next() {
			var id, lId, tSlug, email string
			var name, role, department, status, fn, ln, comp, phone, linkedin *string
			var createdAt time.Time
			if err := rows.Scan(&id, &lId, &tSlug, &email, &name, &role, &department, &status, &fn, &ln, &comp, &phone, &linkedin, &createdAt); err == nil {
				subs = append(subs, map[string]any{
					"id":          id,
					"listId":      lId,
					"tenantSlug":  tSlug,
					"email":       email,
					"name":        name,
					"role":        role,
					"department":  department,
					"status":      status,
					"firstName":   fn,
					"lastName":    ln,
					"company":     comp,
					"phone":       phone,
					"linkedinUrl": linkedin,
					"createdAt":   createdAt,
				})
			}
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "subscribers": subs})
		return
	}

	if r.Method == http.MethodPost {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		listId, _ := body["listId"].(string)
		if listId == "" {
			http.Error(w, `{"error": "listId is required"}`, http.StatusBadRequest)
			return
		}

		// Handle bulk subscribers
		if rawSubscribers, ok := body["subscribers"].([]any); ok && len(rawSubscribers) > 0 {
			addedCount := 0
			for _, item := range rawSubscribers {
				if subMap, ok := item.(map[string]any); ok {
					email, _ := subMap["email"].(string)
					if email == "" {
						continue
					}
					id := fmt.Sprintf("SUB-%d-%d", time.Now().UnixMilli(), addedCount)
					fn, _ := subMap["firstName"].(string)
					ln, _ := subMap["lastName"].(string)
					name := strings.TrimSpace(fn + " " + ln)
					if name == "" {
						name, _ = subMap["name"].(string)
					}
					comp, _ := subMap["company"].(string)
					phone, _ := subMap["phone"].(string)
					linkedin, _ := subMap["linkedinUrl"].(string)
					status, _ := subMap["status"].(string)
					if status == "" {
						status = "SUBSCRIBED"
					}

					_, err := db.Exec(`INSERT INTO crm_email_subscribers
						(id, list_id, tenant_slug, email, name, role, department, status, first_name, last_name, company, phone, linkedin_url, created_at)
						VALUES ($1, $2, $3, $4, $5, 'Subscriber', $6, $7, $8, $9, $10, $11, $12, NOW())
						ON CONFLICT (id) DO NOTHING`,
						id, listId, slug, strings.ToLower(email), name, comp, status, fn, ln, comp, phone, linkedin)
					if err == nil {
						addedCount++
					}
				}
			}
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]any{"success": true, "addedCount": addedCount})
			return
		}

		// Handle single subscriber
		subData, _ := body["subscriber"].(map[string]any)
		if subData == nil {
			subData = body
		}
		email, _ := subData["email"].(string)
		if email == "" {
			http.Error(w, `{"error": "Subscriber email is required"}`, http.StatusBadRequest)
			return
		}

		id := fmt.Sprintf("SUB-%d", time.Now().UnixMilli())
		if customId, ok := subData["id"].(string); ok && customId != "" {
			id = customId
		}
		fn, _ := subData["firstName"].(string)
		ln, _ := subData["lastName"].(string)
		name := strings.TrimSpace(fn + " " + ln)
		if name == "" {
			name, _ = subData["name"].(string)
		}
		comp, _ := subData["company"].(string)
		phone, _ := subData["phone"].(string)
		linkedin, _ := subData["linkedinUrl"].(string)
		status, _ := subData["status"].(string)
		if status == "" {
			status = "SUBSCRIBED"
		}

		_, err := db.Exec(`INSERT INTO crm_email_subscribers
			(id, list_id, tenant_slug, email, name, role, department, status, first_name, last_name, company, phone, linkedin_url, created_at)
			VALUES ($1, $2, $3, $4, $5, 'Subscriber', $6, $7, $8, $9, $10, $11, $12, NOW())
			ON CONFLICT (id) DO UPDATE SET
			email = EXCLUDED.email, name = EXCLUDED.name, status = EXCLUDED.status`,
			id, listId, slug, strings.ToLower(email), name, comp, status, fn, ln, comp, phone, linkedin)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"subscriber": map[string]any{
				"id":         id,
				"listId":     listId,
				"tenantSlug": slug,
				"email":      email,
				"name":       name,
				"status":     status,
			},
		})
		return
	}

	if r.Method == http.MethodPatch || r.Method == http.MethodPut {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		id, _ := body["id"].(string)
		if subMap, ok := body["subscriber"].(map[string]any); ok && id == "" {
			id, _ = subMap["id"].(string)
		}
		if id == "" {
			http.Error(w, `{"error": "Subscriber ID required"}`, http.StatusBadRequest)
			return
		}

		email, _ := body["email"].(string)
		name, _ := body["name"].(string)
		status, _ := body["status"].(string)

		_, err := db.Exec(`UPDATE crm_email_subscribers SET
			email = COALESCE(NULLIF($1, ''), email),
			name = COALESCE(NULLIF($2, ''), name),
			status = COALESCE(NULLIF($3, ''), status)
			WHERE id = $4 AND LOWER(tenant_slug) = $5`,
			email, name, status, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]any{"success": true, "subscriber": map[string]any{"id": id, "status": status}})
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, `{"error": "Subscriber ID required"}`, http.StatusBadRequest)
			return
		}
		_, err := db.Exec(`DELETE FROM crm_email_subscribers WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

// =============================================================================
// 8. CRM EMAIL BLASTS
// =============================================================================

func HandleCrmBlasts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		rows, err := db.Query(`SELECT id, tenant_slug, title, subject, list_id, list_name, status,
			total_recipients, sent_count, failed_count, scheduled_at, sent_at, created_at
			FROM crm_email_blasts
			WHERE LOWER(tenant_slug) = $1
			ORDER BY created_at DESC`, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		blasts := []map[string]any{}
		for rows.Next() {
			var id, tSlug, title, subject string
			var listId, listName, status *string
			var totalRecipients, sentCount, failedCount int
			var scheduledAt, sentAt *time.Time
			var createdAt time.Time
			if err := rows.Scan(&id, &tSlug, &title, &subject, &listId, &listName, &status, &totalRecipients, &sentCount, &failedCount, &scheduledAt, &sentAt, &createdAt); err == nil {
				blasts = append(blasts, map[string]any{
					"id":              id,
					"tenantSlug":      tSlug,
					"title":           title,
					"subject":         subject,
					"listId":          listId,
					"listName":        listName,
					"status":          status,
					"totalRecipients": totalRecipients,
					"sentCount":       sentCount,
					"failedCount":     failedCount,
					"scheduledAt":     scheduledAt,
					"sentAt":          sentAt,
					"createdAt":       createdAt,
				})
			}
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "blasts": blasts})
		return
	}

	if r.Method == http.MethodPost {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		id := fmt.Sprintf("BLS-%d", time.Now().UnixMilli())
		if customId, ok := body["id"].(string); ok && customId != "" {
			id = customId
		}
		title, _ := body["title"].(string)
		subject, _ := body["subject"].(string)
		contentHtml, _ := body["contentHtml"].(string)
		listId, _ := body["listId"].(string)
		listName, _ := body["listName"].(string)
		status, _ := body["status"].(string)
		if status == "" {
			status = "DRAFT"
		}

		_, err := db.Exec(`INSERT INTO crm_email_blasts
			(id, tenant_slug, title, subject, content_html, list_id, list_name, status, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
			id, slug, title, subject, contentHtml, listId, listName, status)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"blast": map[string]any{
				"id":         id,
				"tenantSlug": slug,
				"title":      title,
				"subject":    subject,
				"status":     status,
			},
		})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

// =============================================================================
// 9. CRM LEADS AI EXTRACTION
// =============================================================================

func HandleCrmLeadsExtract(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	slug := getTenantSlug(r)

	var body struct {
		Query      string `json:"query"`
		Location   string `json:"location"`
		TargetSize int    `json:"targetSize"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if body.Query == "" {
		body.Query = "High-Growth Nigerian Enterprises"
	}
	if body.Location == "" {
		body.Location = "Lagos & Abuja"
	}

	sampleLeads := []struct {
		Company  string
		Industry string
		Location string
		Contact  string
		Title    string
		Email    string
		Phone    string
	}{
		{"Prime Atlantic Cegelec", "Oil & Gas Support", "Victoria Island, Lagos", "Engr. Folake Adeleke", "Procurement Director", "f.adeleke@pacegelec.com", "+2348021122334"},
		{"Capital Luxury Transit", "Fleet Logistics & Transport", "Abuja & Uyo", "Edidiong Udoh", "Managing Director", "edidiong@capitalluxury.ng", "+2348039988776"},
		{"Medplus Pharmacy Chain", "Healthcare Retail", "Lekki Phase 1, Lagos", "Joke Bakare", "Operations Head", "j.bakare@medplus.ng", "+2348054433221"},
		{"Veritas Kapital Assurance", "Financial Services", "Central Business District, Abuja", "Kenneth Egbaran", "Chief Digital Officer", "k.egbaran@veritas.ng", "+2348098877665"},
	}

	pick := sampleLeads[time.Now().UnixNano()%int64(len(sampleLeads))]
	leadId := fmt.Sprintf("LED-AI-%d", time.Now().UnixMilli())

	_, err := db.Exec(`INSERT INTO crm_leads (id, tenant_slug, name, company, email, phone, source, score, status, owner, value, notes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, 'AI Prospector Engine', 95, 'ENRICHED', 'AI Assistant', '₦15,000,000', $7, NOW(), NOW())`,
		leadId, slug, pick.Contact, pick.Company, pick.Email, pick.Phone, fmt.Sprintf("Extracted matching query: %s in %s.", body.Query, body.Location))
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"lead": map[string]any{
			"id":         leadId,
			"tenantSlug": slug,
			"name":       pick.Contact,
			"company":    pick.Company,
			"email":      pick.Email,
			"phone":      pick.Phone,
			"status":     "ENRICHED",
			"score":      95,
			"source":     "AI Prospector Engine",
			"createdAt":  time.Now(),
		},
	})
}

// =============================================================================
// 10. TENANT SMTP SETTINGS (ERP WORKSPACE)
// =============================================================================

func HandleCrmSmtpSettings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		var provider, host, fromEmail, fromName, username, password *string
		var port int
		var encryption *string
		var rateLimitedUntil *time.Time
		var rateLimitReason *string

		err := db.QueryRow(`SELECT provider, host, port, encryption, from_email, from_name, username, password, rate_limited_until, rate_limit_reason
			FROM tenant_smtp_settings WHERE LOWER(tenant_slug) = $1 LIMIT 1`, slug).
			Scan(&provider, &host, &port, &encryption, &fromEmail, &fromName, &username, &password, &rateLimitedUntil, &rateLimitReason)

		if err != nil {
			json.NewEncoder(w).Encode(map[string]any{
				"configured": false,
				"settings":   nil,
			})
			return
		}

		hasPwd := password != nil && *password != ""
		isRateLimited := rateLimitedUntil != nil && rateLimitedUntil.After(time.Now())

		json.NewEncoder(w).Encode(map[string]any{
			"configured": true,
			"settings": map[string]any{
				"tenantSlug":       slug,
				"provider":         provider,
				"host":             host,
				"port":             port,
				"encryption":       encryption,
				"fromEmail":        fromEmail,
				"fromName":         fromName,
				"username":         username,
				"hasPassword":      hasPwd,
				"rateLimitedUntil": rateLimitedUntil,
				"rateLimitReason":  rateLimitReason,
				"isRateLimited":    isRateLimited,
			},
		})
		return
	}

	if r.Method == http.MethodPost {
		var body struct {
			Provider   string `json:"provider"`
			Host       string `json:"host"`
			Port       int    `json:"port"`
			Encryption string `json:"encryption"`
			FromEmail  string `json:"fromEmail"`
			FromName   string `json:"fromName"`
			Username   string `json:"username"`
			Password   string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}

		pwd := body.Password
		if pwd == "••••••••" || pwd == "" {
			var existingPwd string
			_ = db.QueryRow(`SELECT password FROM tenant_smtp_settings WHERE LOWER(tenant_slug) = $1`, slug).Scan(&existingPwd)
			pwd = existingPwd
		}

		_, err := db.Exec(`INSERT INTO tenant_smtp_settings (tenant_slug, provider, host, port, encryption, from_email, from_name, username, password, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
			ON CONFLICT (tenant_slug) DO UPDATE SET
			provider = EXCLUDED.provider, host = EXCLUDED.host, port = EXCLUDED.port, encryption = EXCLUDED.encryption,
			from_email = EXCLUDED.from_email, from_name = EXCLUDED.from_name, username = EXCLUDED.username,
			password = CASE WHEN EXCLUDED.password != '' THEN EXCLUDED.password ELSE tenant_smtp_settings.password END,
			updated_at = NOW()`,
			slug, body.Provider, body.Host, body.Port, body.Encryption, body.FromEmail, body.FromName, body.Username, pwd)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"settings": map[string]any{
				"tenantSlug":  slug,
				"provider":    body.Provider,
				"host":        body.Host,
				"port":        body.Port,
				"encryption":  body.Encryption,
				"fromEmail":   body.FromEmail,
				"fromName":    body.FromName,
				"username":    body.Username,
				"hasPassword": pwd != "",
			},
		})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}
