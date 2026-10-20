package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"service_erp/utils"
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

		tenantSlug := strings.ToLower(strings.TrimSpace(payload.TenantSlug))
		if tenantSlug == "" {
			tenantSlug = getTenantSlug(r)
		}
		if tenantSlug == "" {
			http.Error(w, `{"error": "Tenant slug required for unsubscribe to maintain strict isolation"}`, http.StatusBadRequest)
			return
		}

		var res any
		var err error
		if payload.ListId != "" {
			res, err = db.Exec(`UPDATE crm_email_subscribers
				SET status = $1, unsubscribed_at = NOW(), unsubscribe_reason = $2
				WHERE LOWER(email) = $3 AND list_id = $4 AND LOWER(tenant_slug) = $5`,
				targetStatus, reason, email, payload.ListId, tenantSlug)
		} else {
			res, err = db.Exec(`UPDATE crm_email_subscribers
				SET status = $1, unsubscribed_at = NOW(), unsubscribe_reason = $2
				WHERE LOWER(email) = $3 AND LOWER(tenant_slug) = $4`,
				targetStatus, reason, email, tenantSlug)
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
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{"error": err.Error(), "success": false})
			return
		}

		var subCount int
		_ = db.QueryRow(`SELECT COUNT(*) FROM crm_email_subscribers WHERE list_id = $1 AND status = 'SUBSCRIBED'`, id).Scan(&subCount)

		var currentName, currentDesc, currentTags string
		_ = db.QueryRow(`SELECT name, COALESCE(description, ''), COALESCE(tags, '') FROM crm_email_lists WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug).Scan(&currentName, &currentDesc, &currentTags)

		parsedTags := []string{}
		if currentTags != "" {
			_ = json.Unmarshal([]byte(currentTags), &parsedTags)
			if len(parsedTags) == 0 {
				for _, t := range strings.Split(currentTags, ",") {
					trimmed := strings.TrimSpace(t)
					if trimmed != "" {
						parsedTags = append(parsedTags, trimmed)
					}
				}
			}
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"list": map[string]any{
				"id":              id,
				"tenantSlug":      slug,
				"name":            currentName,
				"description":     currentDesc,
				"tags":            parsedTags,
				"subscriberCount": subCount,
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

	if r.Method == http.MethodPost || r.Method == http.MethodPatch || r.Method == http.MethodPut {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		listId, _ := body["listId"].(string)
		if listId == "" {
			listId, _ = body["list_id"].(string)
		}

		// 1. Bulk subscribers append/upsert
		if rawSubscribers, ok := body["subscribers"].([]any); ok && len(rawSubscribers) > 0 {
			if listId == "" {
				http.Error(w, `{"error": "listId is required for bulk subscribers"}`, http.StatusBadRequest)
				return
			}
			addedCount := 0
			for _, item := range rawSubscribers {
				if subMap, ok := item.(map[string]any); ok {
					email, _ := subMap["email"].(string)
					if email == "" {
						continue
					}
					id := fmt.Sprintf("SUB-%d-%d", time.Now().UnixMilli(), addedCount)
					if customId, ok := subMap["id"].(string); ok && customId != "" {
						id = customId
					}
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
						ON CONFLICT (id) DO UPDATE SET
						email = EXCLUDED.email, name = EXCLUDED.name, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
						company = EXCLUDED.company, phone = EXCLUDED.phone, linkedin_url = EXCLUDED.linkedin_url, status = EXCLUDED.status`,
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

		// 2. Single contact update by existing ID (PATCH / PUT / POST where id is provided and no new listId insertion)
		subId, _ := body["id"].(string)
		if subMap, ok := body["subscriber"].(map[string]any); ok && subId == "" {
			subId, _ = subMap["id"].(string)
		}
		if subId != "" && listId == "" {
			email, _ := body["email"].(string)
			name, _ := body["name"].(string)
			fn, _ := body["firstName"].(string)
			ln, _ := body["lastName"].(string)
			comp, _ := body["company"].(string)
			phone, _ := body["phone"].(string)
			linkedin, _ := body["linkedinUrl"].(string)
			status, _ := body["status"].(string)

			if name == "" && (fn != "" || ln != "") {
				name = strings.TrimSpace(fn + " " + ln)
			}

			_, err := db.Exec(`UPDATE crm_email_subscribers SET
				email = COALESCE(NULLIF($1, ''), email),
				name = COALESCE(NULLIF($2, ''), name),
				first_name = COALESCE(NULLIF($3, ''), first_name),
				last_name = COALESCE(NULLIF($4, ''), last_name),
				company = COALESCE(NULLIF($5, ''), company),
				phone = COALESCE(NULLIF($6, ''), phone),
				linkedin_url = COALESCE(NULLIF($7, ''), linkedin_url),
				status = COALESCE(NULLIF($8, ''), status)
				WHERE id = $9 AND LOWER(tenant_slug) = $10`,
				email, name, fn, ln, comp, phone, linkedin, status, subId, slug)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]any{"error": err.Error(), "success": false})
				return
			}

			json.NewEncoder(w).Encode(map[string]any{
				"success": true,
				"subscriber": map[string]any{
					"id":          subId,
					"email":       email,
					"name":        name,
					"firstName":   fn,
					"lastName":    ln,
					"company":     comp,
					"phone":       phone,
					"linkedinUrl": linkedin,
					"status":      status,
				},
			})
			return
		}

		// 3. Single contact append/upsert to list (POST / PUT / PATCH where listId is provided)
		if listId == "" {
			http.Error(w, `{"error": "listId is required"}`, http.StatusBadRequest)
			return
		}

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
			email = EXCLUDED.email, name = EXCLUDED.name, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
			company = EXCLUDED.company, phone = EXCLUDED.phone, linkedin_url = EXCLUDED.linkedin_url, status = EXCLUDED.status`,
			id, listId, slug, strings.ToLower(email), name, comp, status, fn, ln, comp, phone, linkedin)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{"error": err.Error(), "success": false})
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"subscriber": map[string]any{
				"id":          id,
				"listId":      listId,
				"tenantSlug":  slug,
				"email":       email,
				"name":        name,
				"firstName":   fn,
				"lastName":    ln,
				"company":     comp,
				"phone":       phone,
				"linkedinUrl": linkedin,
				"status":      status,
			},
		})
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

// Helper to create HMAC-SHA256 unsubscribe token compliant with Next.js frontend verifyUnsubscribeToken
func generateUnsubscribeToken(tenantSlug, email, subscriberId, listId string) string {
	secret := os.Getenv("CRM_UNSUBSCRIBE_SECRET")
	if secret == "" {
		secret = os.Getenv("JWT_SECRET")
	}
	if secret == "" {
		secret = "ofia-crm-secret"
	}

	payloadData := map[string]any{
		"tenantSlug": strings.ToLower(strings.TrimSpace(tenantSlug)),
		"email":      strings.ToLower(strings.TrimSpace(email)),
		"createdAt":  time.Now().UnixMilli(),
	}
	if subscriberId != "" {
		payloadData["subscriberId"] = subscriberId
	}
	if listId != "" {
		payloadData["listId"] = listId
	}

	jsonBytes, err := json.Marshal(payloadData)
	if err != nil {
		return ""
	}

	encodedPayload := base64.RawURLEncoding.EncodeToString(jsonBytes)
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(encodedPayload))
	signature := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	return fmt.Sprintf("%s.%s", encodedPayload, signature)
}

// Helper to create HMAC-SHA256 tracking token for email opens and click-through tracking
func generateTrackingToken(tenantSlug, blastId, recipientId, email string) string {
	secret := os.Getenv("CRM_TRACKING_SECRET")
	if secret == "" {
		secret = os.Getenv("JWT_SECRET")
	}
	if secret == "" {
		secret = "ofia-crm-tracking-key"
	}

	payloadData := map[string]any{
		"tenantSlug":  strings.ToLower(strings.TrimSpace(tenantSlug)),
		"blastId":     blastId,
		"recipientId": recipientId,
		"email":       strings.ToLower(strings.TrimSpace(email)),
		"createdAt":   time.Now().UnixMilli(),
	}

	jsonBytes, err := json.Marshal(payloadData)
	if err != nil {
		return ""
	}

	encodedPayload := base64.RawURLEncoding.EncodeToString(jsonBytes)
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(encodedPayload))
	signature := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	return fmt.Sprintf("%s.%s", encodedPayload, signature)
}

func parseTrackingToken(token string) (tenantSlug, blastId, recipientId, email string, err error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return "", "", "", "", fmt.Errorf("invalid token format")
	}

	secret := os.Getenv("CRM_TRACKING_SECRET")
	if secret == "" {
		secret = os.Getenv("JWT_SECRET")
	}
	if secret == "" {
		secret = "ofia-crm-tracking-key"
	}

	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(parts[0]))
	expectedSig := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	if !hmac.Equal([]byte(parts[1]), []byte(expectedSig)) {
		return "", "", "", "", fmt.Errorf("invalid token signature")
	}

	dataBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", "", "", "", fmt.Errorf("invalid token payload")
	}

	var data struct {
		TenantSlug  string `json:"tenantSlug"`
		BlastId     string `json:"blastId"`
		RecipientId string `json:"recipientId"`
		Email       string `json:"email"`
	}
	if err := json.Unmarshal(dataBytes, &data); err != nil {
		return "", "", "", "", fmt.Errorf("failed to unmarshal token payload")
	}

	return data.TenantSlug, data.BlastId, data.RecipientId, data.Email, nil
}

// 1x1 transparent GIF bytes
var transparent1x1GIF = []byte{
	0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
	0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
	0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
	0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
	0x01, 0x00, 0x3b,
}

func HandleCrmTrackOpen(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "image/gif")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate, private, max-age=0")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")

	token := r.URL.Query().Get("token")
	if token != "" {
		slug, blastId, recId, _, err := parseTrackingToken(token)
		if err == nil && slug != "" && blastId != "" {
			targetDB := getDBForSlug(slug)
			if targetDB != nil {
				if recId != "" {
					_, _ = targetDB.Exec(`
						UPDATE crm_email_blast_recipients
						SET opened_at = COALESCE(opened_at, NOW()),
						    open_count = COALESCE(open_count, 0) + 1
						WHERE id = $1 AND blast_id = $2`, recId, blastId)
				}
				_, _ = targetDB.Exec(`
					UPDATE crm_email_blasts
					SET open_count = (
						SELECT COUNT(*) FROM crm_email_blast_recipients
						WHERE blast_id = $1 AND opened_at IS NOT NULL
					),
					updated_at = NOW()
					WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(transparent1x1GIF)
}

func HandleCrmTrackClick(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	targetUrl := strings.TrimSpace(r.URL.Query().Get("url"))
	if targetUrl == "" {
		targetUrl = "https://ofia.ng"
	}

	if token != "" {
		slug, blastId, recId, _, err := parseTrackingToken(token)
		if err == nil && slug != "" && blastId != "" {
			targetDB := getDBForSlug(slug)
			if targetDB != nil {
				if recId != "" {
					_, _ = targetDB.Exec(`
						UPDATE crm_email_blast_recipients
						SET clicked_at = COALESCE(clicked_at, NOW()),
						    click_count = COALESCE(click_count, 0) + 1
						WHERE id = $1 AND blast_id = $2`, recId, blastId)
				}
				_, _ = targetDB.Exec(`
					UPDATE crm_email_blasts
					SET click_count = (
						SELECT COUNT(*) FROM crm_email_blast_recipients
						WHERE blast_id = $1 AND clicked_at IS NOT NULL
					),
					updated_at = NOW()
					WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)
			}
		}
	}

	http.Redirect(w, r, targetUrl, http.StatusFound)
}

// Helper to replace personalization merge tags with fallback support: {{first_name|Valued Partner}}, {{first_name}}, {{company|Your Organization}}, etc.
func interpolateMergeTags(template string, contactName, firstName, lastName, company, email, unsubUrl string) string {
	if template == "" {
		return ""
	}

	reToken := regexp.MustCompile(`(?i)\{\{\s*([a-zA-Z0-9_\s]+?)(?:\|([^}]+))?\s*\}\}`)
	return reToken.ReplaceAllStringFunc(template, func(match string) string {
		submatches := reToken.FindStringSubmatch(match)
		if len(submatches) < 2 {
			return match
		}

		key := strings.ToLower(strings.TrimSpace(submatches[1]))
		fallback := ""
		if len(submatches) >= 3 {
			fallback = strings.TrimSpace(submatches[2])
		}

		switch key {
		case "first_name", "firstname", "first name":
			if firstName != "" && !strings.Contains(firstName, "@") {
				return firstName
			}
			if fallback != "" {
				return fallback
			}
			return "there"

		case "last_name", "lastname", "last name":
			if lastName != "" && !strings.Contains(lastName, "@") {
				return lastName
			}
			if fallback != "" {
				return fallback
			}
			return ""

		case "name", "contact_name", "contactname", "contact name":
			if contactName != "" && !strings.Contains(contactName, "@") {
				return contactName
			}
			if fallback != "" {
				return fallback
			}
			return "there"

		case "company":
			if company != "" {
				return company
			}
			if fallback != "" {
				return fallback
			}
			return ""

		case "email":
			return email

		case "unsubscribe_url", "unsubscribeurl", "unsubscribe":
			return unsubUrl

		default:
			return match
		}
	})
}

// ExecuteBlastDelivery delivers a blast to all pending recipients using strict tenant SMTP settings
func ExecuteBlastDelivery(targetDB *sql.DB, tenantSlug, blastId string) {
	if targetDB == nil {
		log.Printf("❌ ExecuteBlastDelivery: targetDB is nil for tenant '%s', blast '%s'", tenantSlug, blastId)
		return
	}

	slug := strings.ToLower(strings.TrimSpace(tenantSlug))

	// 1. Fetch Blast details
	var title, subject, contentHtml string
	var previewText, listId, senderName, senderEmail, senderOverride sql.NullString
	err := targetDB.QueryRow(`
		SELECT title, subject, content_html, preview_text, list_id, sender_name, sender_email, sender_override
		FROM crm_email_blasts
		WHERE id = $1 AND LOWER(tenant_slug) = $2
		LIMIT 1`, blastId, slug).Scan(&title, &subject, &contentHtml, &previewText, &listId, &senderName, &senderEmail, &senderOverride)
	if err != nil {
		log.Printf("❌ ExecuteBlastDelivery: blast '%s' not found for tenant '%s': %v", blastId, slug, err)
		return
	}

	// 2. Resolve SMTP configuration strictly for this tenant
	var overrideCfg *utils.SmtpConfig
	if senderOverride.Valid && strings.TrimSpace(senderOverride.String) != "" {
		var parsed struct {
			Host       string `json:"host"`
			Port       int    `json:"port"`
			Encryption string `json:"encryption"`
			Username   string `json:"username"`
			Password   string `json:"password"`
			FromEmail  string `json:"fromEmail"`
			FromName   string `json:"fromName"`
		}
		if err := json.Unmarshal([]byte(senderOverride.String), &parsed); err == nil && parsed.Host != "" && parsed.Password != "" {
			overrideCfg = &utils.SmtpConfig{
				Host:       parsed.Host,
				Port:       parsed.Port,
				Encryption: parsed.Encryption,
				Username:   parsed.Username,
				Password:   parsed.Password,
				FromEmail:  parsed.FromEmail,
				FromName:   parsed.FromName,
			}
		}
	}

	effectiveFromEmail := strings.TrimSpace(senderEmail.String)
	effectiveFromName := strings.TrimSpace(senderName.String)
	if overrideCfg != nil {
		if effectiveFromEmail == "" {
			effectiveFromEmail = overrideCfg.FromEmail
		}
		if effectiveFromName == "" {
			effectiveFromName = overrideCfg.FromName
		}
	}

	// Validate whether tenant has SMTP settings configured
	if overrideCfg == nil || overrideCfg.Host == "" || overrideCfg.Password == "" {
		tenantCfg, errSmtp := FetchSmtpConfigForSlug(targetDB, slug)
		if errSmtp != nil || tenantCfg == nil || tenantCfg.Host == "" || tenantCfg.Password == "" {
			failReason := fmt.Sprintf("Strict Multi-Tenancy Policy: No verified SMTP relay configured for workspace '%s'", slug)
			log.Printf("❌ Blast '%s' aborted: %s", blastId, failReason)
			_, _ = targetDB.Exec(`UPDATE crm_email_blasts SET status = 'FAILED', updated_at = NOW() WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)
			_, _ = targetDB.Exec(`UPDATE crm_email_blast_recipients SET status = 'FAILED', error_message = $1 WHERE blast_id = $2 AND LOWER(tenant_slug) = $3 AND status = 'PENDING'`, failReason, blastId, slug)
			return
		}
		if effectiveFromEmail == "" {
			effectiveFromEmail = tenantCfg.FromEmail
		}
		if effectiveFromName == "" {
			effectiveFromName = tenantCfg.FromName
		}
	}

	// 3. Mark blast status as SENDING
	_, _ = targetDB.Exec(`UPDATE crm_email_blasts SET status = 'SENDING', updated_at = NOW() WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)

	// 4. Fetch pending recipients (joined with subscriber record for fallback fields)
	rows, err := targetDB.Query(`
		SELECT r.id, r.subscriber_id, r.email,
		       COALESCE(NULLIF(r.name, ''), s.name, '') as name,
		       COALESCE(NULLIF(r.first_name, ''), s.first_name, '') as first_name,
		       COALESCE(NULLIF(r.last_name, ''), s.last_name, '') as last_name,
		       COALESCE(NULLIF(r.company, ''), s.company, '') as company
		FROM crm_email_blast_recipients r
		LEFT JOIN crm_email_subscribers s ON s.id = r.subscriber_id OR (s.email = r.email AND LOWER(s.tenant_slug) = LOWER(r.tenant_slug))
		WHERE r.blast_id = $1 AND LOWER(r.tenant_slug) = $2 AND r.status = 'PENDING'
		ORDER BY r.created_at ASC`, blastId, slug)
	if err != nil {
		log.Printf("❌ ExecuteBlastDelivery: error querying recipients for blast '%s': %v", blastId, err)
		_, _ = targetDB.Exec(`UPDATE crm_email_blasts SET status = 'FAILED', updated_at = NOW() WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)
		return
	}
	defer rows.Close()

	type BlastRecipientItem struct {
		ID           string
		SubscriberID sql.NullString
		Email        string
		Name         sql.NullString
		FirstName    sql.NullString
		LastName     sql.NullString
		Company      sql.NullString
	}

	var recipients []BlastRecipientItem
	for rows.Next() {
		var item BlastRecipientItem
		if err := rows.Scan(&item.ID, &item.SubscriberID, &item.Email, &item.Name, &item.FirstName, &item.LastName, &item.Company); err == nil {
			recipients = append(recipients, item)
		}
	}

	if len(recipients) == 0 {
		log.Printf("⚠️ ExecuteBlastDelivery: no pending recipients found for blast '%s'", blastId)
		_, _ = targetDB.Exec(`UPDATE crm_email_blasts SET status = 'SENT', sent_at = NOW(), updated_at = NOW() WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)
		return
	}

	sentCount := 0
	failedCount := 0

	for _, rec := range recipients {
		rawName := strings.TrimSpace(rec.Name.String)
		rawFirstName := strings.TrimSpace(rec.FirstName.String)
		rawLastName := strings.TrimSpace(rec.LastName.String)
		rawCompany := strings.TrimSpace(rec.Company.String)

		contactName := rawName
		if contactName == "" {
			contactName = strings.TrimSpace(fmt.Sprintf("%s %s", rawFirstName, rawLastName))
		}

		firstName := rawFirstName
		if firstName == "" && contactName != "" && !strings.Contains(contactName, "@") {
			parts := strings.Fields(contactName)
			if len(parts) > 0 {
				firstName = parts[0]
			}
		}

		lastName := rawLastName
		if lastName == "" && contactName != "" && !strings.Contains(contactName, "@") {
			parts := strings.Fields(contactName)
			if len(parts) > 1 {
				lastName = strings.Join(parts[1:], " ")
			}
		}

		if contactName == "" {
			contactName = rec.Email
		}

		// Generate RFC 8058 compliant token and unsubscribe URLs
		unsubToken := generateUnsubscribeToken(slug, rec.Email, rec.SubscriberID.String, listId.String)
		unsubUrl := fmt.Sprintf("https://app.ofia.ng/crm/unsubscribe?token=%s", unsubToken)
		oneClickUrl := fmt.Sprintf("https://app.ofia.ng/api/erp/crm/unsubscribe?token=%s", unsubToken)

		// Generate tracking token for open & click tracking
		trackToken := generateTrackingToken(slug, blastId, rec.ID, rec.Email)
		openPixelUrl := fmt.Sprintf("https://app.ofia.ng/api/erp/crm/track/open?token=%s", trackToken)
		pixelTag := fmt.Sprintf(`<img src="%s" width="1" height="1" alt="" style="display:none!important;max-height:0!important;max-width:0!important;opacity:0!important;overflow:hidden!important;" />`, openPixelUrl)

		// Interpolate merge tags with full token & fallback support
		personalizedSubject := interpolateMergeTags(subject, contactName, firstName, lastName, rawCompany, rec.Email, unsubUrl)
		personalizedHTML := interpolateMergeTags(contentHtml, contactName, firstName, lastName, rawCompany, rec.Email, unsubUrl)

		// Wrap outbound links with click tracking redirect (excluding unsubscribe and tracking links)
		reLink := regexp.MustCompile(`href="(https?://[^"]+)"`)
		personalizedHTML = reLink.ReplaceAllStringFunc(personalizedHTML, func(match string) string {
			rawUrl := match[6 : len(match)-1]
			if strings.Contains(rawUrl, "unsubscribe") || strings.Contains(rawUrl, "/crm/track/") {
				return match
			}
			trackedUrl := fmt.Sprintf("https://app.ofia.ng/api/erp/crm/track/click?token=%s&url=%s", trackToken, url.QueryEscape(rawUrl))
			return fmt.Sprintf(`href="%s"`, trackedUrl)
		})

		// Append pixel before </body> or at the end
		if strings.Contains(personalizedHTML, "</body>") {
			personalizedHTML = strings.Replace(personalizedHTML, "</body>", pixelTag+"</body>", 1)
		} else {
			personalizedHTML += pixelTag
		}

		headers := map[string]string{
			"List-Unsubscribe":      fmt.Sprintf("<%s>, <mailto:%s?subject=Unsubscribe>", oneClickUrl, effectiveFromEmail),
			"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
		}

		payload := utils.EmailPayload{
			To:         rec.Email,
			From:       effectiveFromEmail,
			FromName:   effectiveFromName,
			Subject:    personalizedSubject,
			HTML:       personalizedHTML,
			TenantSlug: slug,
			Headers:    headers,
		}

		sendErr := DispatchStrictTenantEmail(targetDB, slug, overrideCfg, payload)
		if sendErr == nil {
			sentCount++
			_, _ = targetDB.Exec(`
				UPDATE crm_email_blast_recipients 
				SET status = 'SENT', sent_at = NOW(), attempts = attempts + 1, error_message = NULL 
				WHERE id = $1`, rec.ID)
		} else {
			failedCount++
			errMsg := sendErr.Error()
			log.Printf("⚠️ Failed sending blast email to %s: %s", rec.Email, errMsg)
			_, _ = targetDB.Exec(`
				UPDATE crm_email_blast_recipients 
				SET status = 'FAILED', attempts = attempts + 1, error_message = $1 
				WHERE id = $2`, errMsg, rec.ID)
		}

		// Update running progress on blast
		if (sentCount+failedCount)%5 == 0 || (sentCount+failedCount) == len(recipients) {
			_, _ = targetDB.Exec(`
				UPDATE crm_email_blasts 
				SET sent_count = $1, failed_count = $2, updated_at = NOW() 
				WHERE id = $3 AND LOWER(tenant_slug) = $4`, sentCount, failedCount, blastId, slug)
		}

		// Controlled pacing (50ms) to respect SMTP socket rate limits
		time.Sleep(50 * time.Millisecond)
	}

	finalStatus := "SENT"
	if sentCount == 0 && failedCount > 0 {
		finalStatus = "FAILED"
	}

	_, _ = targetDB.Exec(`
		UPDATE crm_email_blasts 
		SET status = $1, sent_at = NOW(), sent_count = $2, failed_count = $3, updated_at = NOW() 
		WHERE id = $4 AND LOWER(tenant_slug) = $5`, finalStatus, sentCount, failedCount, blastId, slug)

	log.Printf("✅ Blast '%s' for tenant '%s' completed: %d sent, %d failed (final status: %s)", blastId, slug, sentCount, failedCount, finalStatus)
}

// ProcessDueScheduledBlasts checks and dispatches all scheduled blasts that are due
func ProcessDueScheduledBlasts(targetDB *sql.DB) int {
	activeDB := targetDB
	if activeDB == nil {
		activeDB = db
	}
	if activeDB == nil {
		return 0
	}

	rows, err := activeDB.Query(`
		SELECT id, tenant_slug 
		FROM crm_email_blasts
		WHERE status = 'SCHEDULED' AND scheduled_at <= NOW()
		LIMIT 10`)
	if err != nil {
		return 0
	}
	defer rows.Close()

	type DueBlast struct {
		ID         string
		TenantSlug string
	}
	var due []DueBlast
	for rows.Next() {
		var b DueBlast
		if err := rows.Scan(&b.ID, &b.TenantSlug); err == nil {
			due = append(due, b)
		}
	}

	dispatched := 0
	for _, b := range due {
		res, err := activeDB.Exec(`
			UPDATE crm_email_blasts 
			SET status = 'SENDING', updated_at = NOW() 
			WHERE id = $1 AND status = 'SCHEDULED'`, b.ID)
		if err == nil {
			if affected, _ := res.RowsAffected(); affected > 0 {
				tenantDB := getDBForSlug(b.TenantSlug)
				if tenantDB == nil {
					tenantDB = activeDB
				}
				go ExecuteBlastDelivery(tenantDB, b.TenantSlug, b.ID)
				dispatched++
			}
		}
	}
	return dispatched
}

// HandleCrmCronBlasts handles external/internal cron triggers to process due scheduled blasts
func HandleCrmCronBlasts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost && r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	dispatched := ProcessDueScheduledBlasts(db)
	json.NewEncoder(w).Encode(map[string]any{
		"success":    true,
		"dispatched": dispatched,
		"timestamp":  time.Now().Format(time.RFC3339),
	})
}

// StartScheduledBlastWorker runs a persistent background ticker checking for due scheduled blasts every minute
func StartScheduledBlastWorker() {
	ticker := time.NewTicker(60 * time.Second)
	log.Printf("⏱️ CRM Scheduled Email Blast Worker initialized (interval: 60s)")
	for range ticker.C {
		dispatched := ProcessDueScheduledBlasts(db)
		if dispatched > 0 {
			log.Printf("📢 CRM Worker successfully dispatched %d scheduled email blast(s)", dispatched)
		}
	}
}

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
		blastId := r.URL.Query().Get("id")
		if blastId != "" {
			var id, tSlug, title, subject, contentHtml string
			var listId, listName, senderName, senderEmail, senderProvider, status *string
			var totalRecipients, sentCount, failedCount, openCount, clickCount, bounceCount int
			var scheduledAt, sentAt *time.Time
			var createdAt, updatedAt time.Time

			err := db.QueryRow(`SELECT id, tenant_slug, title, subject, content_html, list_id, list_name,
				sender_name, sender_email, sender_provider, status, total_recipients, sent_count, failed_count,
				COALESCE(open_count, 0), COALESCE(click_count, 0), COALESCE(bounce_count, 0),
				scheduled_at, sent_at, created_at, COALESCE(updated_at, created_at)
				FROM crm_email_blasts
				WHERE id = $1 AND LOWER(tenant_slug) = $2 LIMIT 1`, blastId, slug).
				Scan(&id, &tSlug, &title, &subject, &contentHtml, &listId, &listName, &senderName, &senderEmail, &senderProvider,
					&status, &totalRecipients, &sentCount, &failedCount, &openCount, &clickCount, &bounceCount, &scheduledAt, &sentAt, &createdAt, &updatedAt)
			if err != nil {
				http.Error(w, `{"error": "Blast not found"}`, http.StatusNotFound)
				return
			}

			// Fetch recipient delivery logs
			recRows, errRec := db.Query(`SELECT id, subscriber_id, email, name, status, error_message, sent_at, opened_at, clicked_at, COALESCE(open_count, 0), COALESCE(click_count, 0), created_at
				FROM crm_email_blast_recipients
				WHERE blast_id = $1 AND LOWER(tenant_slug) = $2
				ORDER BY created_at ASC`, blastId, slug)
			recipients := []map[string]any{}
			if errRec == nil {
				defer recRows.Close()
				for recRows.Next() {
					var rId, rEmail, rStatus string
					var rSubId, rName, rErrMsg *string
					var rSentAt, rOpenedAt, rClickedAt *time.Time
					var rOpenCount, rClickCount int
					var rCreatedAt time.Time
					if err := recRows.Scan(&rId, &rSubId, &rEmail, &rName, &rStatus, &rErrMsg, &rSentAt, &rOpenedAt, &rClickedAt, &rOpenCount, &rClickCount, &rCreatedAt); err == nil {
						recipients = append(recipients, map[string]any{
							"id":           rId,
							"subscriberId": rSubId,
							"email":        rEmail,
							"name":         rName,
							"status":       rStatus,
							"errorMessage": rErrMsg,
							"sentAt":       rSentAt,
							"openedAt":     rOpenedAt,
							"clickedAt":    rClickedAt,
							"openCount":    rOpenCount,
							"clickCount":   rClickCount,
							"createdAt":    rCreatedAt,
						})
					}
				}
			}

			json.NewEncoder(w).Encode(map[string]any{
				"success": true,
				"blast": map[string]any{
					"id":              id,
					"tenantSlug":      tSlug,
					"title":           title,
					"subject":         subject,
					"contentHtml":     contentHtml,
					"listId":          listId,
					"listName":        listName,
					"senderName":      senderName,
					"senderEmail":     senderEmail,
					"senderProvider":  senderProvider,
					"status":          status,
					"totalRecipients": totalRecipients,
					"sentCount":       sentCount,
					"failedCount":     failedCount,
					"openCount":       openCount,
					"clickCount":      clickCount,
					"bounceCount":     bounceCount,
					"scheduledAt":     scheduledAt,
					"sentAt":          sentAt,
					"createdAt":       createdAt,
					"updatedAt":       updatedAt,
					"recipients":      recipients,
				},
			})
			return
		}

		rows, err := db.Query(`SELECT id, tenant_slug, title, subject, list_id, list_name, status,
			total_recipients, sent_count, failed_count, COALESCE(open_count, 0), COALESCE(click_count, 0), COALESCE(bounce_count, 0),
			scheduled_at, sent_at, created_at, sender_email, sender_provider
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
			var listId, listName, status, senderEmail, senderProvider *string
			var totalRecipients, sentCount, failedCount, openCount, clickCount, bounceCount int
			var scheduledAt, sentAt *time.Time
			var createdAt time.Time
			if err := rows.Scan(&id, &tSlug, &title, &subject, &listId, &listName, &status, &totalRecipients, &sentCount, &failedCount, &openCount, &clickCount, &bounceCount, &scheduledAt, &sentAt, &createdAt, &senderEmail, &senderProvider); err == nil {
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
					"openCount":       openCount,
					"clickCount":      clickCount,
					"bounceCount":     bounceCount,
					"scheduledAt":     scheduledAt,
					"sentAt":          sentAt,
					"createdAt":       createdAt,
					"senderEmail":     senderEmail,
					"senderProvider":  senderProvider,
				})
			}
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "blasts": blasts})
		return
	}

	if r.Method == http.MethodPost {
		var body struct {
			ID              string          `json:"id"`
			Title           string          `json:"title"`
			Subject         string          `json:"subject"`
			PreviewText     string          `json:"previewText"`
			ContentHTML     string          `json:"contentHtml"`
			ListID          string          `json:"listId"`
			ListName        string          `json:"listName"`
			SenderName      string          `json:"senderName"`
			SenderEmail     string          `json:"senderEmail"`
			SenderProfileID string          `json:"senderProfileId"`
			SenderProvider  string          `json:"senderProvider"`
			SenderOverride  any             `json:"senderOverride"`
			RecipientIDs    []string        `json:"recipientIds"`
			Recipients      []struct {
				ID        string `json:"id"`
				Email     string `json:"email"`
				Name      string `json:"name"`
				FirstName string `json:"firstName"`
				LastName  string `json:"lastName"`
				Company   string `json:"company"`
			} `json:"recipients"`
			TotalRecipients int             `json:"totalRecipients"`
			ScheduledAt     *string         `json:"scheduledAt"`
			DispatchNow     bool            `json:"dispatchNow"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		id := fmt.Sprintf("BLS-%d", time.Now().UnixMilli())
		if strings.TrimSpace(body.ID) != "" {
			id = strings.TrimSpace(body.ID)
		}

		title := strings.TrimSpace(body.Title)
		if title == "" {
			title = "Untitled Blast"
		}
		subject := strings.TrimSpace(body.Subject)
		if subject == "" {
			subject = "Important Announcement"
		}

		initialStatus := "DRAFT"
		if body.DispatchNow {
			initialStatus = "SENDING"
		} else if body.ScheduledAt != nil && strings.TrimSpace(*body.ScheduledAt) != "" {
			initialStatus = "SCHEDULED"
		}

		var senderOverrideJson *string
		if body.SenderOverride != nil {
			if b, err := json.Marshal(body.SenderOverride); err == nil && len(b) > 2 {
				s := string(b)
				senderOverrideJson = &s
			}
		}

		var recipientIdsJson *string
		if len(body.RecipientIDs) > 0 {
			if b, err := json.Marshal(body.RecipientIDs); err == nil {
				s := string(b)
				recipientIdsJson = &s
			}
		}

		// 1. Ingest recipients from crm_email_subscribers or body.Recipients
		type SubItem struct {
			ID        string
			Email     string
			Name      sql.NullString
			FirstName sql.NullString
			LastName  sql.NullString
			Company   sql.NullString
		}
		var subs []SubItem

		if len(body.Recipients) > 0 {
			for idx, r := range body.Recipients {
				if r.Email == "" || !strings.Contains(r.Email, "@") {
					continue
				}
				rId := r.ID
				if rId == "" {
					rId = fmt.Sprintf("sub_%d_%d", time.Now().UnixMilli(), idx)
				}
				fn := strings.TrimSpace(r.FirstName)
				ln := strings.TrimSpace(r.LastName)
				name := strings.TrimSpace(r.Name)
				if fn == "" && name != "" && !strings.Contains(name, "@") {
					parts := strings.Fields(name)
					if len(parts) > 0 {
						fn = parts[0]
						if ln == "" && len(parts) > 1 {
							ln = strings.Join(parts[1:], " ")
						}
					}
				}
				if name == "" {
					name = strings.TrimSpace(fn + " " + ln)
				}
				subs = append(subs, SubItem{
					ID:        rId,
					Email:     r.Email,
					Name:      sql.NullString{String: name, Valid: name != ""},
					FirstName: sql.NullString{String: fn, Valid: fn != ""},
					LastName:  sql.NullString{String: ln, Valid: ln != ""},
					Company:   sql.NullString{String: r.Company, Valid: r.Company != ""},
				})
			}
		} else {
			subQuery := `SELECT id, email, name, first_name, last_name, company FROM crm_email_subscribers WHERE status = 'SUBSCRIBED' AND LOWER(tenant_slug) = $1`
			subParams := []any{slug}

			if body.ListID != "" {
				subQuery += ` AND list_id = $2`
				subParams = append(subParams, body.ListID)
			}

			if rows, err := db.Query(subQuery, subParams...); err == nil {
				defer rows.Close()
				for rows.Next() {
					var s SubItem
					if err := rows.Scan(&s.ID, &s.Email, &s.Name, &s.FirstName, &s.LastName, &s.Company); err == nil {
						// Check recipient filter if customized
						if len(body.RecipientIDs) > 0 {
							matched := false
							for _, rId := range body.RecipientIDs {
								if rId == s.ID || strings.EqualFold(rId, s.Email) {
									matched = true
									break
								}
							}
							if !matched {
								continue
							}
						}
						if s.Email != "" && strings.Contains(s.Email, "@") {
							subs = append(subs, s)
						}
					}
				}
			}
		}

		totalRecipients := len(subs)
		if totalRecipients == 0 && body.TotalRecipients > 0 {
			totalRecipients = body.TotalRecipients
		}

		var scheduledAtTime *time.Time
		if body.ScheduledAt != nil && *body.ScheduledAt != "" {
			if t, err := time.Parse(time.RFC3339, *body.ScheduledAt); err == nil {
				scheduledAtTime = &t
			}
		}

		_, err := db.Exec(`INSERT INTO crm_email_blasts
			(id, tenant_slug, title, subject, preview_text, content_html, list_id, list_name,
			 sender_name, sender_email, sender_profile_id, sender_provider, sender_override,
			 recipient_ids, status, scheduled_at, total_recipients, sent_count, failed_count, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 0, 0, NOW(), NOW())
			ON CONFLICT (id) DO UPDATE SET
			 title = EXCLUDED.title, subject = EXCLUDED.subject, content_html = EXCLUDED.content_html,
			 status = EXCLUDED.status, scheduled_at = EXCLUDED.scheduled_at, total_recipients = EXCLUDED.total_recipients,
			 updated_at = NOW()`,
			id, slug, title, subject, body.PreviewText, body.ContentHTML, body.ListID, body.ListName,
			body.SenderName, body.SenderEmail, body.SenderProfileID, body.SenderProvider, senderOverrideJson,
			recipientIdsJson, initialStatus, scheduledAtTime, totalRecipients)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		// Insert recipients into crm_email_blast_recipients
		for _, s := range subs {
			recId := fmt.Sprintf("rec_%s_%s", id, s.ID)
			sName := strings.TrimSpace(s.Name.String)
			sFn := strings.TrimSpace(s.FirstName.String)
			sLn := strings.TrimSpace(s.LastName.String)
			sCompany := strings.TrimSpace(s.Company.String)

			if sFn == "" && sName != "" && !strings.Contains(sName, "@") {
				parts := strings.Fields(sName)
				if len(parts) > 0 {
					sFn = parts[0]
					if sLn == "" && len(parts) > 1 {
						sLn = strings.Join(parts[1:], " ")
					}
				}
			}
			if sName == "" {
				sName = strings.TrimSpace(fmt.Sprintf("%s %s", sFn, sLn))
			}

			_, _ = db.Exec(`INSERT INTO crm_email_blast_recipients
				(id, blast_id, tenant_slug, subscriber_id, email, name, first_name, last_name, company, status, created_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', NOW())
				ON CONFLICT (id) DO UPDATE SET
				  name = EXCLUDED.name,
				  first_name = EXCLUDED.first_name,
				  last_name = EXCLUDED.last_name,
				  company = EXCLUDED.company`,
				recId, id, slug, s.ID, s.Email, sName, sFn, sLn, sCompany)
		}

		// If immediate dispatch is requested, trigger delivery worker
		if body.DispatchNow {
			go ExecuteBlastDelivery(db, slug, id)
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"blast": map[string]any{
				"id":              id,
				"tenantSlug":      slug,
				"title":           title,
				"subject":         subject,
				"status":          initialStatus,
				"totalRecipients": totalRecipients,
			},
		})
		return
	}

	if r.Method == http.MethodPut || r.Method == http.MethodPatch {
		var body struct {
			ID              string  `json:"id"`
			Title           string  `json:"title"`
			Subject         string  `json:"subject"`
			PreviewText     string  `json:"previewText"`
			ContentHTML     string  `json:"contentHtml"`
			ListID          string  `json:"listId"`
			ListName        string  `json:"listName"`
			SenderName      string  `json:"senderName"`
			SenderEmail     string  `json:"senderEmail"`
			SenderProfileID string  `json:"senderProfileId"`
			SenderProvider  string  `json:"senderProvider"`
			ScheduledAt     *string `json:"scheduledAt"`
			Status          string  `json:"status"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		blastId := r.URL.Query().Get("id")
		if blastId == "" {
			blastId = body.ID
		}
		if blastId == "" {
			http.Error(w, `{"error": "Blast ID is required"}`, http.StatusBadRequest)
			return
		}

		var scheduledAtTime *time.Time
		if body.ScheduledAt != nil && *body.ScheduledAt != "" {
			if t, err := time.Parse(time.RFC3339, *body.ScheduledAt); err == nil {
				scheduledAtTime = &t
			}
		}

		res, err := db.Exec(`UPDATE crm_email_blasts SET
			title = COALESCE(NULLIF($1, ''), title),
			subject = COALESCE(NULLIF($2, ''), subject),
			preview_text = COALESCE(NULLIF($3, ''), preview_text),
			content_html = COALESCE(NULLIF($4, ''), content_html),
			list_id = COALESCE(NULLIF($5, ''), list_id),
			list_name = COALESCE(NULLIF($6, ''), list_name),
			sender_name = COALESCE(NULLIF($7, ''), sender_name),
			sender_email = COALESCE(NULLIF($8, ''), sender_email),
			sender_profile_id = COALESCE(NULLIF($9, ''), sender_profile_id),
			sender_provider = COALESCE(NULLIF($10, ''), sender_provider),
			scheduled_at = CASE WHEN $11::timestamptz IS NOT NULL THEN $11::timestamptz ELSE scheduled_at END,
			status = COALESCE(NULLIF($12, ''), status),
			updated_at = NOW()
			WHERE id = $13 AND LOWER(tenant_slug) = $14`,
			body.Title, body.Subject, body.PreviewText, body.ContentHTML,
			body.ListID, body.ListName, body.SenderName, body.SenderEmail,
			body.SenderProfileID, body.SenderProvider, scheduledAtTime,
			body.Status, blastId, slug)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			http.Error(w, `{"error": "Blast not found"}`, http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"message": "Blast updated successfully",
			"id":      blastId,
		})
		return
	}

	if r.Method == http.MethodDelete {
		blastId := r.URL.Query().Get("id")
		if blastId == "" {
			var body struct {
				ID string `json:"id"`
			}
			_ = json.NewDecoder(r.Body).Decode(&body)
			blastId = body.ID
		}
		if blastId == "" {
			http.Error(w, `{"error": "Blast ID is required"}`, http.StatusBadRequest)
			return
		}

		// Delete recipient logs first
		_, _ = db.Exec(`DELETE FROM crm_email_blast_recipients WHERE blast_id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)
		res, err := db.Exec(`DELETE FROM crm_email_blasts WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			http.Error(w, `{"error": "Blast not found"}`, http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"message": "Blast deleted successfully",
			"id":      blastId,
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
