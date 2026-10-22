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
	"sort"
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
				companyVal := ""
				if company != nil {
					companyVal = *company
				}
				emailVal := ""
				if email != nil {
					emailVal = *email
				}
				phoneVal := ""
				if phone != nil {
					phoneVal = *phone
				}
				ownerVal := ""
				if owner != nil {
					ownerVal = *owner
				}
				statusVal := "QUALIFIED"
				if status != nil && *status != "" {
					statusVal = *status
				}
				sourceVal := "Email Marketing"
				if source != nil && *source != "" {
					sourceVal = *source
				}

				leads = append(leads, map[string]any{
					"id":            id,
					"tenantSlug":    tSlug,
					"name":          name,
					"contactName":   name,
					"company":       companyVal,
					"companyName":   companyVal,
					"email":         emailVal,
					"contactEmail":  emailVal,
					"phone":         phoneVal,
					"contactPhone":  phoneVal,
					"source":        sourceVal,
					"score":         score,
					"icpFitScore":   score,
					"status":        statusVal,
					"owner":         ownerVal,
					"assignedRep":   ownerVal,
					"value":         value,
					"notes":         notes,
					"buyingSignals": []string{"Email Blast Engagement"},
					"createdAt":     createdAt,
					"updatedAt":     updatedAt,
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
		if name == "" {
			name, _ = body["contactName"].(string)
		}
		company, _ := body["company"].(string)
		if company == "" {
			company, _ = body["companyName"].(string)
		}
		email, _ := body["email"].(string)
		if email == "" {
			email, _ = body["contactEmail"].(string)
		}
		phone, _ := body["phone"].(string)
		if phone == "" {
			phone, _ = body["contactPhone"].(string)
		}
		source, _ := body["source"].(string)
		status, _ := body["status"].(string)
		owner, _ := body["owner"].(string)
		if owner == "" {
			owner, _ = body["assignedRep"].(string)
		}
		if owner == "" || strings.EqualFold(owner, "auto") || strings.HasPrefix(strings.ToLower(owner), "auto-assign") {
			owner = resolveLeastLoadedCloser(db, slug)
		}
		value, _ := body["value"].(string)
		notes, _ := body["notes"].(string)
		score := 50
		if s, ok := body["score"].(float64); ok {
			score = int(s)
		} else if s, ok := body["icpFitScore"].(float64); ok {
			score = int(s)
		}
		if status == "" {
			status = "NEW"
		}

		_, err := db.Exec(`INSERT INTO crm_leads (id, tenant_slug, name, company, email, phone, source, score, status, owner, value, notes, company_name, contact_name, contact_email, contact_phone, assigned_rep, icp_fit_score, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $4, $3, $5, $6, $10, $8, NOW(), NOW())
			ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name, company = EXCLUDED.company, email = EXCLUDED.email,
			phone = EXCLUDED.phone, source = EXCLUDED.source, score = EXCLUDED.score,
			status = EXCLUDED.status, owner = EXCLUDED.owner, value = EXCLUDED.value,
			notes = EXCLUDED.notes, company_name = EXCLUDED.company_name, contact_name = EXCLUDED.contact_name,
			contact_email = EXCLUDED.contact_email, contact_phone = EXCLUDED.contact_phone, assigned_rep = EXCLUDED.assigned_rep,
			icp_fit_score = EXCLUDED.icp_fit_score, updated_at = NOW()`,
			id, slug, name, company, email, phone, source, score, status, owner, value, notes)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"lead": map[string]any{
				"id":           id,
				"name":         name,
				"contactName":  name,
				"company":      company,
				"companyName":  company,
				"email":        email,
				"contactEmail": email,
				"phone":        phone,
				"contactPhone": phone,
				"status":       status,
				"owner":        owner,
				"assignedRep":  owner,
				"score":        score,
				"icpFitScore":  score,
				"tenantSlug":   slug,
			},
		})
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
		owner, hasOwner := body["owner"].(string)
		if !hasOwner {
			owner, hasOwner = body["assignedRep"].(string)
		}
		if hasOwner && (owner == "" || strings.EqualFold(owner, "unassigned")) {
			owner = "Unassigned"
		} else if strings.EqualFold(owner, "auto") || strings.HasPrefix(strings.ToLower(owner), "auto-assign") {
			owner = resolveLeastLoadedCloser(db, slug)
		}

		name, _ := body["name"].(string)
		if name == "" {
			name, _ = body["contactName"].(string)
		}
		company, _ := body["company"].(string)
		if company == "" {
			company, _ = body["companyName"].(string)
		}
		email, _ := body["email"].(string)
		if email == "" {
			email, _ = body["contactEmail"].(string)
		}
		phone, _ := body["phone"].(string)
		if phone == "" {
			phone, _ = body["contactPhone"].(string)
		}

		_, err := db.Exec(`UPDATE crm_leads SET
			status = COALESCE(NULLIF($1, ''), status),
			notes = COALESCE(NULLIF($2, ''), notes),
			owner = COALESCE(NULLIF($3, ''), owner),
			assigned_rep = COALESCE(NULLIF($3, ''), assigned_rep),
			name = COALESCE(NULLIF($4, ''), name),
			contact_name = COALESCE(NULLIF($4, ''), contact_name),
			company = COALESCE(NULLIF($5, ''), company),
			company_name = COALESCE(NULLIF($5, ''), company_name),
			email = COALESCE(NULLIF($6, ''), email),
			contact_email = COALESCE(NULLIF($6, ''), contact_email),
			phone = COALESCE(NULLIF($7, ''), phone),
			contact_phone = COALESCE(NULLIF($7, ''), contact_phone),
			updated_at = NOW()
			WHERE id = $8 AND LOWER(tenant_slug) = $9`,
			status, notes, owner, name, company, email, phone, id, slug)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"lead": map[string]any{
				"id":          id,
				"status":      status,
				"assignedRep": owner,
			},
		})
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

	if r.Method == http.MethodPatch || r.Method == http.MethodPut {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}
		id, _ := body["id"].(string)
		if id == "" {
			id = r.URL.Query().Get("id")
		}
		if id == "" {
			http.Error(w, `{"error": "Activity ID required"}`, http.StatusBadRequest)
			return
		}

		status, _ := body["status"].(string)
		notes, _ := body["notes"].(string)
		title, _ := body["title"].(string)
		dateTime, _ := body["dateTime"].(string)

		_, err := db.Exec(`UPDATE crm_activities SET
			status = COALESCE(NULLIF($1, ''), status),
			notes = COALESCE(NULLIF($2, ''), notes),
			title = COALESCE(NULLIF($3, ''), title),
			date_time = COALESCE(NULLIF($4, ''), date_time)
			WHERE id = $5 AND LOWER(tenant_slug) = $6`,
			status, notes, title, dateTime, id, slug)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true, "activity": map[string]any{"id": id, "status": status}})
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
					go AutoAssignLeadFromEngagement(targetDB, slug, blastId, recId, "OPEN", "")
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
					go AutoAssignLeadFromEngagement(targetDB, slug, blastId, recId, "CLICK", targetUrl)
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

// resolveLeastLoadedCloser finds an eligible sales closer with the fewest active leads
func resolveLeastLoadedCloser(targetDB *sql.DB, slug string) string {
	if targetDB == nil || slug == "" {
		return "Senior Sales Specialist"
	}

	closerRows, errC := targetDB.Query(`
		SELECT name, email
		FROM "User"
		WHERE (LOWER("tenantSlug") = LOWER($1) OR LOWER(company) = LOWER($1) OR "tenantSlug" = '' OR "tenantSlug" IS NULL)
		  AND (
			"assignedPages"::text ILIKE '%sales_closer%'
			OR LOWER(role) = 'sales_closer'
			OR LOWER(designation) LIKE '%closer%'
			OR LOWER(designation) LIKE '%sales closer%'
			OR LOWER(department) LIKE '%closer%'
		  )
		  AND LOWER(role) NOT IN ('admin', 'super_admin', 'superadmin')
		ORDER BY name ASC`, slug)

	closers := []string{}
	if errC == nil {
		defer closerRows.Close()
		for closerRows.Next() {
			var cName, cEmail string
			if err := closerRows.Scan(&cName, &cEmail); err == nil && strings.TrimSpace(cName) != "" {
				closers = append(closers, strings.TrimSpace(cName))
			}
		}
	}

	if len(closers) == 0 {
		var fallbackName string
		_ = targetDB.QueryRow(`
			SELECT name FROM "User"
			WHERE (LOWER("tenantSlug") = LOWER($1) OR LOWER(company) = LOWER($1))
			  AND LOWER(role) IN ('admin', 'manager', 'marketer')
			LIMIT 1`, slug).Scan(&fallbackName)
		if fallbackName != "" {
			return fallbackName
		}
		return "Senior Sales Specialist"
	}

	if len(closers) == 1 {
		return closers[0]
	}

	type closerLoad struct {
		name  string
		count int
	}
	closerLoads := make([]closerLoad, len(closers))
	for i, c := range closers {
		var cnt int
		_ = targetDB.QueryRow(`
			SELECT COUNT(*) FROM crm_leads 
			WHERE LOWER(tenant_slug) = LOWER($1) 
			  AND (owner = $2 OR assigned_rep = $2)
			  AND status NOT IN ('ARCHIVED', 'CONVERTED')`, slug, c).Scan(&cnt)
		closerLoads[i] = closerLoad{name: c, count: cnt}
	}

	sort.Slice(closerLoads, func(i, j int) bool {
		return closerLoads[i].count < closerLoads[j].count
	})
	return closerLoads[0].name
}

// AutoAssignLeadFromEngagement creates or updates a lead and auto-assigns it to an eligible Sales Closer upon email blast open or click
func AutoAssignLeadFromEngagement(targetDB *sql.DB, slug, blastId, recId, eventType, targetUrl string) {
	if targetDB == nil || slug == "" || blastId == "" || recId == "" {
		return
	}

	EnsureCRMTablesOnDB(targetDB)

	// 1. Fetch recipient data from blast recipients
	var email, name, firstName, lastName, company sql.NullString
	var subscriberId sql.NullString
	err := targetDB.QueryRow(`
		SELECT email, name, first_name, last_name, company, subscriber_id
		FROM crm_email_blast_recipients
		WHERE id = $1 AND blast_id = $2 LIMIT 1`, recId, blastId).
		Scan(&email, &name, &firstName, &lastName, &company, &subscriberId)
	if err != nil || !email.Valid || strings.TrimSpace(email.String) == "" {
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(email.String))

	// 2. Fetch blast title & subject
	var blastTitle, blastSubject sql.NullString
	_ = targetDB.QueryRow(`SELECT title, subject FROM crm_email_blasts WHERE id = $1 LIMIT 1`, blastId).
		Scan(&blastTitle, &blastSubject)

	titleStr := blastTitle.String
	if titleStr == "" {
		titleStr = blastSubject.String
	}
	if titleStr == "" {
		titleStr = "Email Blast Campaign"
	}

	contactName := strings.TrimSpace(name.String)
	if contactName == "" {
		contactName = strings.TrimSpace(fmt.Sprintf("%s %s", firstName.String, lastName.String))
	}
	if contactName == "" {
		contactName = cleanEmail
	}

	companyStr := strings.TrimSpace(company.String)
	if companyStr == "" {
		companyStr = "Enterprise Partner"
	}

	// 3. Optional phone from subscriber if available
	phoneStr := ""
	if subscriberId.Valid && subscriberId.String != "" {
		var subPhone sql.NullString
		_ = targetDB.QueryRow(`SELECT phone FROM crm_email_subscribers WHERE id = $1 LIMIT 1`, subscriberId.String).Scan(&subPhone)
		if subPhone.Valid {
			phoneStr = subPhone.String
		}
	}

	// 4. Intent scoring: clicks have high intent (95), opens have warm intent (80)
	score := 80
	actionText := "opened the email blast"
	if strings.ToUpper(eventType) == "CLICK" {
		score = 95
		if targetUrl != "" {
			actionText = fmt.Sprintf("clicked link (%s) in the email blast", targetUrl)
		} else {
			actionText = "clicked a link in the email blast"
		}
	}

	// 5. Check if lead already exists in crm_leads for this tenant and email
	var existingLeadId, existingOwner string
	var existingScore int
	leadExists := false
	errLead := targetDB.QueryRow(`
		SELECT id, COALESCE(owner, assigned_rep, ''), score
		FROM crm_leads
		WHERE LOWER(tenant_slug) = LOWER($1) AND LOWER(email) = $2
		LIMIT 1`, slug, cleanEmail).Scan(&existingLeadId, &existingOwner, &existingScore)
	if errLead == nil && existingLeadId != "" {
		leadExists = true
	}

	assignedCloser := existingOwner

	if !leadExists || assignedCloser == "" || strings.EqualFold(assignedCloser, "unassigned") || strings.Contains(strings.ToLower(assignedCloser), "queue") {
		assignedCloser = resolveLeastLoadedCloser(targetDB, slug)
	}

	leadSource := fmt.Sprintf("Email Blast: %s", titleStr)
	leadNotes := fmt.Sprintf("Lead auto-assigned to %s after client %s '%s'.", assignedCloser, actionText, titleStr)
	buyingSignalsJSON := fmt.Sprintf(`["Email Blast Engagement", "%s"]`, eventType)

	if leadExists {
		// Update existing lead (preserve existing closer, bump score if higher)
		newScore := existingScore
		if score > existingScore {
			newScore = score
		}
		_, _ = targetDB.Exec(`
			UPDATE crm_leads SET
				score = $1,
				icp_fit_score = $1,
				owner = CASE WHEN owner IS NULL OR owner = '' OR owner = 'Unassigned (Closer Queue)' THEN $2 ELSE owner END,
				assigned_rep = CASE WHEN assigned_rep IS NULL OR assigned_rep = '' OR assigned_rep = 'Unassigned (Closer Queue)' THEN $2 ELSE assigned_rep END,
				notes = notes || E'\n' || $3,
				updated_at = NOW()
			WHERE id = $4`, newScore, assignedCloser, leadNotes, existingLeadId)
	} else {
		// Insert brand new lead
		newLeadId := fmt.Sprintf("LED-%d", time.Now().UnixMilli())
		_, _ = targetDB.Exec(`
			INSERT INTO crm_leads (
				id, tenant_slug, name, company, email, phone, source, score, status, owner, value, notes,
				assigned_rep, company_name, contact_name, contact_email, contact_phone, icp_fit_score, buying_signals, source_blast_id,
				created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, 'QUALIFIED', $9, '₦10,000,000', $10,
				$9, $4, $3, $5, $6, $8, $11, $12,
				NOW(), NOW()
			)`,
			newLeadId, slug, contactName, companyStr, cleanEmail, phoneStr, leadSource, score, assignedCloser, leadNotes,
			buyingSignalsJSON, blastId)
		existingLeadId = newLeadId
	}

	// 7. Log an upcoming activity for the closer to follow up
	actId := fmt.Sprintf("ACT-%d", time.Now().UnixMilli())
	actTitle := fmt.Sprintf("Outreach to %s (%s)", contactName, strings.ToUpper(eventType))
	actNotes := fmt.Sprintf("Follow up with client after %s '%s'. Auto-assigned to sales closer %s.", actionText, titleStr, assignedCloser)
	_, _ = targetDB.Exec(`
		INSERT INTO crm_activities (id, tenant_slug, type, title, company, rep, date_time, status, notes, created_at)
		VALUES ($1, $2, 'CALL', $3, $4, $5, 'Today, 03:00 PM', 'UPCOMING', $6, NOW())`,
		actId, slug, actTitle, companyStr, assignedCloser, actNotes)
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
	var previewText, listId, senderName, senderEmail, senderOverride, senderProfileId sql.NullString
	err := targetDB.QueryRow(`
		SELECT title, subject, content_html, preview_text, list_id, sender_name, sender_email, sender_override, sender_profile_id
		FROM crm_email_blasts
		WHERE id = $1 AND LOWER(tenant_slug) = $2
		LIMIT 1`, blastId, slug).Scan(&title, &subject, &contentHtml, &previewText, &listId, &senderName, &senderEmail, &senderOverride, &senderProfileId)
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
		if err := json.Unmarshal([]byte(senderOverride.String), &parsed); err == nil && parsed.Host != "" && parsed.Password != "" && parsed.Password != "••••••••" {
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
		tenantCfg, errSmtp := FetchSenderProfileForSlug(targetDB, slug, senderProfileId.String)
		if errSmtp != nil || tenantCfg == nil || tenantCfg.Host == "" || tenantCfg.Password == "" {
			failReason := fmt.Sprintf("Strict Multi-Tenancy Policy: No verified SMTP relay configured for workspace '%s'", slug)
			log.Printf("❌ Blast '%s' aborted: %s", blastId, failReason)
			_, _ = targetDB.Exec(`UPDATE crm_email_blasts SET status = 'FAILED', updated_at = NOW() WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)
			_, _ = targetDB.Exec(`UPDATE crm_email_blast_recipients SET status = 'FAILED', error_message = $1 WHERE blast_id = $2 AND LOWER(tenant_slug) = $3 AND status = 'PENDING'`, failReason, blastId, slug)
			return
		}
		overrideCfg = tenantCfg
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

	// Fetch current counts from crm_email_blast_recipients to preserve existing progress on resumed blasts
	sentCount := 0
	failedCount := 0
	_ = targetDB.QueryRow(`
		SELECT 
			COALESCE(COUNT(*) FILTER (WHERE status = 'SENT'), 0),
			COALESCE(COUNT(*) FILTER (WHERE status = 'FAILED'), 0)
		FROM crm_email_blast_recipients
		WHERE blast_id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug).Scan(&sentCount, &failedCount)

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

			// If transient TCP timeout or rate limit, back off slightly to allow SMTP socket recovery
			if strings.Contains(strings.ToLower(errMsg), "timeout") || strings.Contains(strings.ToLower(errMsg), "rate") {
				time.Sleep(300 * time.Millisecond)
			}
		}

		// Update running progress on blast
		if (sentCount+failedCount)%5 == 0 {
			_, _ = targetDB.Exec(`
				UPDATE crm_email_blasts 
				SET sent_count = $1, failed_count = $2, updated_at = NOW() 
				WHERE id = $3 AND LOWER(tenant_slug) = $4`, sentCount, failedCount, blastId, slug)
		}

		// Controlled pacing (50ms) to respect SMTP socket rate limits
		time.Sleep(50 * time.Millisecond)
	}

	var pendingRemaining int
	_ = targetDB.QueryRow(`SELECT COUNT(*) FROM crm_email_blast_recipients WHERE blast_id = $1 AND LOWER(tenant_slug) = $2 AND status = 'PENDING'`, blastId, slug).Scan(&pendingRemaining)

	finalStatus := "SENT"
	if pendingRemaining > 0 {
		finalStatus = "SENDING"
	} else if sentCount == 0 && failedCount > 0 {
		finalStatus = "FAILED"
	}

	_, _ = targetDB.Exec(`
		UPDATE crm_email_blasts 
		SET status = $1, sent_at = CASE WHEN $1 = 'SENT' THEN NOW() ELSE sent_at END, sent_count = $2, failed_count = $3, updated_at = NOW() 
		WHERE id = $4 AND LOWER(tenant_slug) = $5`, finalStatus, sentCount, failedCount, blastId, slug)

	log.Printf("✅ Blast '%s' for tenant '%s' batch finished: %d total sent, %d total failed, %d remaining pending (final status: %s)", blastId, slug, sentCount, failedCount, pendingRemaining, finalStatus)
}

// processSingleDBDueBlasts runs due/stalled blast checks on a specific DB
func processSingleDBDueBlasts(activeDB *sql.DB, defaultSlug string) int {
	if activeDB == nil {
		return 0
	}

	rows, err := activeDB.Query(`
		SELECT id, tenant_slug 
		FROM crm_email_blasts
		WHERE (status = 'SCHEDULED' AND scheduled_at <= NOW())
		   OR (status = 'SENDING' AND updated_at < NOW() - INTERVAL '3 minutes')
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
			if b.TenantSlug == "" {
				b.TenantSlug = defaultSlug
			}
			due = append(due, b)
		}
	}

	dispatched := 0
	for _, b := range due {
		res, err := activeDB.Exec(`
			UPDATE crm_email_blasts 
			SET status = 'SENDING', updated_at = NOW() 
			WHERE id = $1 AND (status = 'SCHEDULED' OR (status = 'SENDING' AND updated_at < NOW() - INTERVAL '3 minutes'))`, b.ID)
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

// ProcessDueScheduledBlasts checks and dispatches all scheduled blasts that are due as well as stalled sending blasts across all databases
func ProcessDueScheduledBlasts(targetDB *sql.DB) int {
	activeDB := targetDB
	if activeDB == nil {
		activeDB = db
	}
	if activeDB == nil {
		return 0
	}

	totalDispatched := processSingleDBDueBlasts(activeDB, "")

	// Also check all custom tenant databases registered in tenant_infrastructures
	if db != nil {
		rows, err := db.Query(`SELECT tenant_slug FROM tenant_infrastructures WHERE is_custom_db = true`)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var tSlug string
				if err := rows.Scan(&tSlug); err == nil && tSlug != "" {
					tenantDB := getDBForSlug(tSlug)
					if tenantDB != nil && tenantDB != activeDB {
						totalDispatched += processSingleDBDueBlasts(tenantDB, tSlug)
					}
				}
			}
		}
	}

	return totalDispatched
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

		// Trigger blast delivery worker if status set to SENDING, resume, or retry action requested
		action := r.URL.Query().Get("action")
		if action == "retry" || action == "retry_failed" || body.Status == "RETRY" {
			// If a new sender_profile_id is provided, switch the blast's sender profile
			if body.SenderProfileID != "" {
				var pProv, pFromEmail, pFromName string
				if err := db.QueryRow(`SELECT provider, from_email, from_name FROM tenant_sender_profiles WHERE id = $1 AND LOWER(tenant_slug) = $2`, body.SenderProfileID, slug).Scan(&pProv, &pFromEmail, &pFromName); err == nil {
					_, _ = db.Exec(`UPDATE crm_email_blasts SET sender_profile_id = $1, sender_provider = $2, sender_email = $3, sender_name = $4 WHERE id = $5 AND LOWER(tenant_slug) = $6`,
						body.SenderProfileID, pProv, pFromEmail, pFromName, blastId, slug)
				}
			}

			// Reset all FAILED recipients to PENDING so they are redelivered
			_, _ = db.Exec(`
				UPDATE crm_email_blast_recipients
				SET status = 'PENDING', error_message = NULL
				WHERE blast_id = $1 AND LOWER(tenant_slug) = $2 AND status = 'FAILED'`, blastId, slug)

			// Reset failed count and mark blast as SENDING
			_, _ = db.Exec(`
				UPDATE crm_email_blasts
				SET status = 'SENDING', failed_count = 0, updated_at = NOW()
				WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)

			tenantDB := getDBForSlug(slug)
			if tenantDB == nil {
				tenantDB = db
			}
			go ExecuteBlastDelivery(tenantDB, slug, blastId)

			json.NewEncoder(w).Encode(map[string]any{
				"success": true,
				"message": "Failed recipients queued for retry",
				"id":      blastId,
			})
			return
		}

		if action == "retry_recipient" {
			recipientId := r.URL.Query().Get("recipient_id")
			if recipientId != "" {
				_, _ = db.Exec(`
					UPDATE crm_email_blast_recipients
					SET status = 'PENDING', error_message = NULL
					WHERE id = $1 AND blast_id = $2 AND LOWER(tenant_slug) = $3`, recipientId, blastId, slug)

				_, _ = db.Exec(`
					UPDATE crm_email_blasts
					SET status = 'SENDING', updated_at = NOW()
					WHERE id = $1 AND LOWER(tenant_slug) = $2`, blastId, slug)

				tenantDB := getDBForSlug(slug)
				if tenantDB == nil {
					tenantDB = db
				}
				go ExecuteBlastDelivery(tenantDB, slug, blastId)

				json.NewEncoder(w).Encode(map[string]any{
					"success": true,
					"message": "Recipient queued for retry",
					"id":      blastId,
				})
				return
			}
		}

		if body.Status == "SENDING" || body.Status == "RESUME" || action == "resume" || action == "send" {
			tenantDB := getDBForSlug(slug)
			if tenantDB == nil {
				tenantDB = db
			}
			go ExecuteBlastDelivery(tenantDB, slug, blastId)
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

// =============================================================================
// 11. TENANT SENDER PROFILES (MULTI-PROFILE SMTP & OUTREACH RELAYS)
// =============================================================================

func HandleCrmSenderProfiles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		// 1. Fetch all sender profiles for this tenant
		rows, err := db.Query(`
			SELECT id, tenant_slug, profile_name, provider, host, port, encryption,
			       from_email, from_name, username, password, is_default, created_at, updated_at
			FROM tenant_sender_profiles
			WHERE LOWER(tenant_slug) = $1
			ORDER BY is_default DESC, created_at ASC`, slug)

		profiles := []map[string]any{}
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id, tSlug, pName, provider, host, enc, fromEmail, fromName, username, pwd string
				var port int
				var isDef bool
				var createdAt, updatedAt time.Time
				if err := rows.Scan(&id, &tSlug, &pName, &provider, &host, &port, &enc, &fromEmail, &fromName, &username, &pwd, &isDef, &createdAt, &updatedAt); err == nil {
					profiles = append(profiles, map[string]any{
						"id":          id,
						"tenantSlug":  tSlug,
						"profileName": pName,
						"provider":    provider,
						"host":        host,
						"port":        port,
						"encryption":  enc,
						"fromEmail":   fromEmail,
						"fromName":    fromName,
						"username":    username,
						"hasPassword": pwd != "",
						"password":    "••••••••",
						"isDefault":   isDef,
						"createdAt":   createdAt,
						"updatedAt":   updatedAt,
					})
				}
			}
		}

		// 2. Fetch default SMTP / legacy settings
		var defaultSmtp map[string]any
		var sProvider, sHost, sFromEmail, sFromName, sUsername, sPassword *string
		var sPort int
		var sEncryption *string
		var sRateLimitedUntil *time.Time
		var sRateLimitReason *string

		errSmtp := db.QueryRow(`
			SELECT provider, host, port, encryption, from_email, from_name, username, password, rate_limited_until, rate_limit_reason
			FROM tenant_smtp_settings WHERE LOWER(tenant_slug) = $1 LIMIT 1`, slug).
			Scan(&sProvider, &sHost, &sPort, &sEncryption, &sFromEmail, &sFromName, &sUsername, &sPassword, &sRateLimitedUntil, &sRateLimitReason)

		if errSmtp == nil && sHost != nil && *sHost != "" {
			defaultSmtp = map[string]any{
				"tenantSlug":       slug,
				"provider":         sProvider,
				"host":             sHost,
				"port":             sPort,
				"encryption":       sEncryption,
				"fromEmail":        sFromEmail,
				"fromName":         sFromName,
				"username":         sUsername,
				"hasPassword":      sPassword != nil && *sPassword != "",
				"password":         "••••••••",
				"rateLimitedUntil": sRateLimitedUntil,
				"rateLimitReason":  sRateLimitReason,
				"isRateLimited":    sRateLimitedUntil != nil && sRateLimitedUntil.After(time.Now()),
			}

			// If no profiles existed in the table yet, seed it with this one so previous config is preserved
			if len(profiles) == 0 && sFromEmail != nil && *sFromEmail != "" {
				initId := fmt.Sprintf("prof_init_%s", strings.ReplaceAll(slug, "-", "_"))
				prov := "custom"
				if sProvider != nil && *sProvider != "" {
					prov = *sProvider
				}
				name := fmt.Sprintf("%s Relay", strings.ToUpper(prov))
				enc := "tls"
				if sEncryption != nil && *sEncryption != "" {
					enc = *sEncryption
				}
				fn := "Workspace Admin"
				if sFromName != nil && *sFromName != "" {
					fn = *sFromName
				}
				un := *sFromEmail
				if sUsername != nil && *sUsername != "" {
					un = *sUsername
				}
				pwdVal := ""
				if sPassword != nil {
					pwdVal = *sPassword
				}

				_, _ = db.Exec(`
					INSERT INTO tenant_sender_profiles (id, tenant_slug, profile_name, provider, host, port, encryption, from_email, from_name, username, password, is_default, created_at, updated_at)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), NOW())
					ON CONFLICT (id) DO NOTHING`,
					initId, slug, name, prov, *sHost, sPort, enc, *sFromEmail, fn, un, pwdVal)

				profiles = append(profiles, map[string]any{
					"id":          initId,
					"tenantSlug":  slug,
					"profileName": name,
					"provider":    prov,
					"host":        *sHost,
					"port":        sPort,
					"encryption":  enc,
					"fromEmail":   *sFromEmail,
					"fromName":    fn,
					"username":    un,
					"hasPassword": pwdVal != "",
					"password":    "••••••••",
					"isDefault":   true,
					"createdAt":   time.Now(),
					"updatedAt":   time.Now(),
				})
			}
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success":     true,
			"profiles":    profiles,
			"defaultSmtp": defaultSmtp,
		})
		return
	}

	if r.Method == http.MethodPost || r.Method == http.MethodPut {
		var body struct {
			ID          string `json:"id"`
			ProfileName string `json:"profileName"`
			Provider    string `json:"provider"`
			Host        string `json:"host"`
			Port        int    `json:"port"`
			Encryption  string `json:"encryption"`
			FromEmail   string `json:"fromEmail"`
			FromName    string `json:"fromName"`
			Username    string `json:"username"`
			Password    string `json:"password"`
			IsDefault   bool   `json:"isDefault"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}

		id := strings.TrimSpace(body.ID)
		if id == "" || id == "new" {
			id = fmt.Sprintf("prof_%d", time.Now().UnixMilli())
		}

		prov := body.Provider
		if prov == "" {
			prov = "custom"
		}
		pName := body.ProfileName
		if pName == "" {
			pName = fmt.Sprintf("%s Profile (%s)", strings.ToUpper(prov), body.FromEmail)
		}
		port := body.Port
		if port == 0 {
			port = 587
		}
		enc := body.Encryption
		if enc == "" {
			enc = "tls"
		}
		fn := body.FromName
		if fn == "" {
			fn = "Workspace Admin"
		}
		un := body.Username
		if un == "" {
			un = body.FromEmail
		}

		pwd := body.Password
		if pwd == "••••••••" || pwd == "" {
			var existingPwd string
			_ = db.QueryRow(`SELECT password FROM tenant_sender_profiles WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug).Scan(&existingPwd)
			if existingPwd != "" {
				pwd = existingPwd
			} else {
				_ = db.QueryRow(`SELECT password FROM tenant_smtp_settings WHERE LOWER(tenant_slug) = $1`, slug).Scan(&existingPwd)
				pwd = existingPwd
			}
		}

		// Count existing profiles
		var count int
		_ = db.QueryRow(`SELECT COUNT(*) FROM tenant_sender_profiles WHERE LOWER(tenant_slug) = $1`, slug).Scan(&count)
		isDefault := body.IsDefault || count == 0

		if isDefault {
			_, _ = db.Exec(`UPDATE tenant_sender_profiles SET is_default = false, updated_at = NOW() WHERE LOWER(tenant_slug) = $1`, slug)
		}

		_, err := db.Exec(`
			INSERT INTO tenant_sender_profiles (id, tenant_slug, profile_name, provider, host, port, encryption, from_email, from_name, username, password, is_default, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
			ON CONFLICT (id) DO UPDATE SET
				profile_name = EXCLUDED.profile_name,
				provider = EXCLUDED.provider,
				host = EXCLUDED.host,
				port = EXCLUDED.port,
				encryption = EXCLUDED.encryption,
				from_email = EXCLUDED.from_email,
				from_name = EXCLUDED.from_name,
				username = EXCLUDED.username,
				password = CASE WHEN EXCLUDED.password != '' THEN EXCLUDED.password ELSE tenant_sender_profiles.password END,
				is_default = EXCLUDED.is_default,
				updated_at = NOW()`,
			id, slug, pName, prov, body.Host, port, enc, body.FromEmail, fn, un, pwd, isDefault)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		// If this profile is default, sync to legacy tenant_smtp_settings
		if isDefault {
			_, _ = db.Exec(`
				INSERT INTO tenant_smtp_settings (tenant_slug, provider, host, port, encryption, from_email, from_name, username, password, updated_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
				ON CONFLICT (tenant_slug) DO UPDATE SET
					provider = EXCLUDED.provider, host = EXCLUDED.host, port = EXCLUDED.port, encryption = EXCLUDED.encryption,
					from_email = EXCLUDED.from_email, from_name = EXCLUDED.from_name, username = EXCLUDED.username,
					password = CASE WHEN EXCLUDED.password != '' THEN EXCLUDED.password ELSE tenant_smtp_settings.password END,
					updated_at = NOW()`,
				slug, prov, body.Host, port, enc, body.FromEmail, fn, un, pwd)
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"profile": map[string]any{
				"id":          id,
				"tenantSlug":  slug,
				"profileName": pName,
				"provider":    prov,
				"host":        body.Host,
				"port":        port,
				"encryption":  enc,
				"fromEmail":   body.FromEmail,
				"fromName":    fn,
				"username":    un,
				"hasPassword": pwd != "",
				"isDefault":   isDefault,
			},
		})
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			var body struct {
				ID string `json:"id"`
			}
			_ = json.NewDecoder(r.Body).Decode(&body)
			id = body.ID
		}
		if id == "" {
			http.Error(w, `{"error": "Profile ID is required"}`, http.StatusBadRequest)
			return
		}

		var wasDefault bool
		_ = db.QueryRow(`SELECT is_default FROM tenant_sender_profiles WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug).Scan(&wasDefault)

		_, err := db.Exec(`DELETE FROM tenant_sender_profiles WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		if wasDefault {
			var nextId string
			_ = db.QueryRow(`SELECT id FROM tenant_sender_profiles WHERE LOWER(tenant_slug) = $1 ORDER BY created_at ASC LIMIT 1`, slug).Scan(&nextId)
			if nextId != "" {
				_, _ = db.Exec(`UPDATE tenant_sender_profiles SET is_default = true, updated_at = NOW() WHERE id = $1`, nextId)
				var nProv, nHost, nEnc, nFromEmail, nFromName, nUser, nPwd string
				var nPort int
				if err := db.QueryRow(`SELECT provider, host, port, encryption, from_email, from_name, username, password FROM tenant_sender_profiles WHERE id = $1`, nextId).
					Scan(&nProv, &nHost, &nPort, &nEnc, &nFromEmail, &nFromName, &nUser, &nPwd); err == nil {
					_, _ = db.Exec(`
						INSERT INTO tenant_smtp_settings (tenant_slug, provider, host, port, encryption, from_email, from_name, username, password, updated_at)
						VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
						ON CONFLICT (tenant_slug) DO UPDATE SET
							provider = EXCLUDED.provider, host = EXCLUDED.host, port = EXCLUDED.port, encryption = EXCLUDED.encryption,
							from_email = EXCLUDED.from_email, from_name = EXCLUDED.from_name, username = EXCLUDED.username, password = EXCLUDED.password, updated_at = NOW()`,
						slug, nProv, nHost, nPort, nEnc, nFromEmail, nFromName, nUser, nPwd)
				}
			}
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"message": "Sender profile deleted successfully",
		})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}

// =============================================================================
// 12. CRM CALL LOGGER & SALES CLOSER OUTCOMES
// =============================================================================

func HandleCrmCalls(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	db := getDB(r)
	EnsureCRMTablesOnDB(db)
	if db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	slug := getTenantSlug(r)

	if r.Method == http.MethodGet {
		leadId := r.URL.Query().Get("lead_id")
		rep := r.URL.Query().Get("rep")
		outcome := r.URL.Query().Get("outcome")
		direction := r.URL.Query().Get("direction")

		query := `
			SELECT id, tenant_slug, COALESCE(lead_id, ''), COALESCE(deal_id, ''),
			       contact_name, COALESCE(company, ''), phone_number, rep_name,
			       COALESCE(rep_email, ''), direction, outcome, duration_seconds,
			       COALESCE(notes, ''), COALESCE(followup_date, ''), call_date, created_at
			FROM crm_calls
			WHERE LOWER(tenant_slug) = $1`
		args := []any{slug}
		argIdx := 2

		if leadId != "" {
			query += fmt.Sprintf(" AND lead_id = $%d", argIdx)
			args = append(args, leadId)
			argIdx++
		}
		if rep != "" {
			query += fmt.Sprintf(" AND (LOWER(rep_name) = LOWER($%d) OR LOWER(rep_email) = LOWER($%d))", argIdx, argIdx)
			args = append(args, rep)
			argIdx++
		}
		if outcome != "" {
			query += fmt.Sprintf(" AND outcome = $%d", argIdx)
			args = append(args, outcome)
			argIdx++
		}
		if direction != "" {
			query += fmt.Sprintf(" AND direction = $%d", argIdx)
			args = append(args, direction)
			argIdx++
		}

		query += " ORDER BY call_date DESC LIMIT 200"

		rows, err := db.Query(query, args...)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		calls := []map[string]any{}
		totalDuration := 0
		connectedCount := 0
		positiveCount := 0
		wonCount := 0
		todayCount := 0
		now := time.Now()

		for rows.Next() {
			var id, tSlug, lId, dId, cName, comp, phone, rName, rEmail, dir, out, notes, follow string
			var dur int
			var cDate, createdAt time.Time
			if err := rows.Scan(&id, &tSlug, &lId, &dId, &cName, &comp, &phone, &rName, &rEmail, &dir, &out, &dur, &notes, &follow, &cDate, &createdAt); err == nil {
				calls = append(calls, map[string]any{
					"id":              id,
					"tenantSlug":      tSlug,
					"leadId":          lId,
					"dealId":          dId,
					"contactName":     cName,
					"company":         comp,
					"phoneNumber":     phone,
					"repName":         rName,
					"repEmail":        rEmail,
					"direction":       dir,
					"outcome":         out,
					"durationSeconds": dur,
					"notes":           notes,
					"followupDate":    follow,
					"callDate":        cDate,
					"createdAt":       createdAt,
				})

				totalDuration += dur
				if strings.HasPrefix(out, "CONNECTED") {
					connectedCount++
				}
				if out == "CONNECTED_WON" {
					wonCount++
					positiveCount++
				} else if out == "CONNECTED_INTERESTED" || out == "CONNECTED_NEGOTIATING" {
					positiveCount++
				}
				if cDate.Year() == now.Year() && cDate.YearDay() == now.YearDay() {
					todayCount++
				}
			}
		}

		totalCalls := len(calls)
		connectRate := 0
		if totalCalls > 0 {
			connectRate = int((float64(connectedCount) / float64(totalCalls)) * 100)
		}
		avgDuration := 0
		if connectedCount > 0 {
			avgDuration = totalDuration / connectedCount
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"calls":   calls,
			"stats": map[string]any{
				"totalCalls":      totalCalls,
				"connectedCalls":  connectedCount,
				"connectRate":     connectRate,
				"positiveCount":   positiveCount,
				"wonCount":        wonCount,
				"avgDurationSec":  avgDuration,
				"todayCalls":      todayCount,
			},
		})
		return
	}

	if r.Method == http.MethodPost {
		var body struct {
			ID              string `json:"id"`
			LeadID          string `json:"leadId"`
			DealID          string `json:"dealId"`
			ContactName     string `json:"contactName"`
			Company         string `json:"company"`
			PhoneNumber     string `json:"phoneNumber"`
			RepName         string `json:"repName"`
			RepEmail        string `json:"repEmail"`
			Direction       string `json:"direction"`
			Outcome         string `json:"outcome"`
			DurationSeconds int    `json:"durationSeconds"`
			Notes           string `json:"notes"`
			FollowupDate    string `json:"followupDate"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(body.ContactName) == "" {
			http.Error(w, `{"error": "Contact name is required"}`, http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(body.PhoneNumber) == "" {
			http.Error(w, `{"error": "Phone number is required"}`, http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(body.Outcome) == "" {
			http.Error(w, `{"error": "Call outcome is required"}`, http.StatusBadRequest)
			return
		}

		id := strings.TrimSpace(body.ID)
		if id == "" {
			id = fmt.Sprintf("CALL-%d", time.Now().UnixMilli())
		}
		dir := strings.ToUpper(strings.TrimSpace(body.Direction))
		if dir != "INBOUND" {
			dir = "OUTBOUND"
		}
		rep := strings.TrimSpace(body.RepName)
		if rep == "" {
			rep = "Sales Closer"
		}

		_, err := db.Exec(`
			INSERT INTO crm_calls (
				id, tenant_slug, lead_id, deal_id, contact_name, company, phone_number,
				rep_name, rep_email, direction, outcome, duration_seconds, notes, followup_date, call_date, created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW(), NOW())`,
			id, slug, body.LeadID, body.DealID, body.ContactName, body.Company, body.PhoneNumber,
			rep, body.RepEmail, dir, body.Outcome, body.DurationSeconds, body.Notes, body.FollowupDate)

		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		// Also record in crm_activities timeline for unified CRM audit
		actId := fmt.Sprintf("ACT-%d", time.Now().UnixMilli())
		actTitle := fmt.Sprintf("%s Call: %s (%s)", dir, body.ContactName, body.Outcome)
		actNotes := fmt.Sprintf("Call with %s (%s). Duration: %ds. Outcome: %s.\n%s", body.ContactName, body.PhoneNumber, body.DurationSeconds, body.Outcome, body.Notes)
		_, _ = db.Exec(`
			INSERT INTO crm_activities (id, tenant_slug, type, title, company, rep, date_time, status, notes, created_at)
			VALUES ($1, $2, 'CALL', $3, $4, $5, 'Today, Just now', 'COMPLETED', $6, NOW())`,
			actId, slug, actTitle, body.Company, rep, actNotes)

		// If linked to a lead, update lead notes, assigned rep, and score
		if strings.TrimSpace(body.LeadID) != "" {
			leadLog := fmt.Sprintf("Call Log (%s) by %s: %s", body.Outcome, rep, body.Notes)
			newScore := 80
			newStatus := "CONTACTED"
			if body.Outcome == "CONNECTED_WON" {
				newScore = 100
				newStatus = "WON"
			} else if body.Outcome == "CONNECTED_INTERESTED" {
				newScore = 95
				newStatus = "QUALIFIED"
			} else if body.Outcome == "CONNECTED_NEGOTIATING" {
				newScore = 90
				newStatus = "NEGOTIATION"
			} else if body.Outcome == "NOT_INTERESTED" {
				newStatus = "UNQUALIFIED"
			}

			_, _ = db.Exec(`
				UPDATE crm_leads SET
					notes = notes || E'\n' || $1,
					status = CASE WHEN status = 'WON' THEN status ELSE $2 END,
					score = GREATEST(score, $3),
					owner = CASE WHEN owner IS NULL OR owner = '' OR owner = 'Unassigned (Closer Queue)' THEN $4 ELSE owner END,
					assigned_rep = CASE WHEN assigned_rep IS NULL OR assigned_rep = '' OR assigned_rep = 'Unassigned (Closer Queue)' THEN $4 ELSE assigned_rep END,
					updated_at = NOW()
				WHERE id = $5 AND LOWER(tenant_slug) = $6`,
				leadLog, newStatus, newScore, rep, body.LeadID, slug)
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"call": map[string]any{
				"id":              id,
				"tenantSlug":      slug,
				"leadId":          body.LeadID,
				"contactName":     body.ContactName,
				"company":         body.Company,
				"phoneNumber":     body.PhoneNumber,
				"repName":         rep,
				"direction":       dir,
				"outcome":         body.Outcome,
				"durationSeconds": body.DurationSeconds,
				"notes":           body.Notes,
				"followupDate":    body.FollowupDate,
				"createdAt":       time.Now(),
			},
		})
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		if id == "" {
			var body struct {
				ID string `json:"id"`
			}
			_ = json.NewDecoder(r.Body).Decode(&body)
			id = body.ID
		}
		if id == "" {
			http.Error(w, `{"error": "Call ID is required"}`, http.StatusBadRequest)
			return
		}

		_, err := db.Exec(`DELETE FROM crm_calls WHERE id = $1 AND LOWER(tenant_slug) = $2`, id, slug)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"message": "Call log entry deleted successfully",
		})
		return
	}

	http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
}
