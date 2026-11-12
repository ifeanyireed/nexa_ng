package handlers

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"nexa/user_subscription_service/internal/models"
	"nexa/user_subscription_service/internal/redis"
	"nexa/user_subscription_service/internal/subscription"
)

type SubscriptionHandler struct {
	db      *gorm.DB
	subServ *subscription.SubscriptionService
	redis   *redis.Client
}

func NewSubscriptionHandler(db *gorm.DB) *SubscriptionHandler {
	return &SubscriptionHandler{
		db:      db,
		subServ: subscription.NewSubscriptionService(db),
	}
}

func (h *SubscriptionHandler) SetRedis(r *redis.Client) {
	h.redis = r
}

type CheckoutPlanRequest struct {
	PlanTier     models.PlanTier `json:"plan_tier"`
	BillingCycle string          `json:"billing_cycle"`
	Email        string          `json:"email"`
	CallbackURL  string          `json:"callback_url"`
}

type CheckoutResponse struct {
	AuthorizationURL string          `json:"authorization_url"`
	AccessCode       string          `json:"access_code"`
	Reference        string          `json:"reference"`
	AmountNGN        float64         `json:"amount_ngn"`
	PlanTier         models.PlanTier `json:"plan_tier"`
	BillingCycle     string          `json:"billing_cycle"`
	Mode             string          `json:"mode"`
}

func (h *SubscriptionHandler) invalidateRBACCache(r *http.Request, org *models.Organization, rawOrgID string) {
	if h.redis == nil {
		return
	}
	_ = h.redis.Delete(r.Context(), h.redis.BuildKey(rawOrgID, "rbac", "matrix"))
	if org != nil {
		_ = h.redis.Delete(r.Context(), h.redis.BuildKey(org.ID, "rbac", "matrix"))
		_ = h.redis.Delete(r.Context(), h.redis.BuildKey(org.Slug, "rbac", "matrix"))
	}
}

// GetSubscriptionDetails returns centralized SubscriptionHelper limits and usage for the workspace
func (h *SubscriptionHandler) GetSubscriptionDetails(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		http.Error(w, `{"error": "Missing orgId parameter"}`, http.StatusBadRequest)
		return
	}

	if h.db != nil {
		summary, err := h.subServ.GetTenantSubscription(orgID)
		if err == nil && summary != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(summary)
			return
		}
	}

	// Fallback default summary when org is not yet in Organization table
	limits := subscription.GetLimitsForTier(models.PlanGrowth)
	modules := subscription.GetModulesForTierAndVertical(models.PlanGrowth, "retail")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"organization_id": orgID,
		"slug":            orgID,
		"plan_tier":       models.PlanGrowth,
		"billing_cycle":   "MONTHLY",
		"status":          "ACTIVE",
		"limits":          limits,
		"modules":         modules,
		"usage": map[string]interface{}{
			"leads_researched":       0,
			"emails_sent":            0,
			"whatsapp_messages_sent": 0,
			"ai_tokens_used":         0,
			"ai_cost_usd":            0,
		},
		"extra_leads":     0,
		"extra_campaigns": 0,
		"extra_seats":     0,
		"days_remaining":  30,
	})
}

// GetAllPlanTiers returns the catalog of plan limits defined in SubscriptionHelper
func (h *SubscriptionHandler) GetAllPlanTiers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subscription.PlanLimits)
}

// ListPlans returns all subscription plan blueprints stored in Neon Postgres database (with Redis cache-aside)
func (h *SubscriptionHandler) ListPlans(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	category := r.URL.Query().Get("category")
	cacheKeySuffix := "all"
	if category != "" && category != "ALL" {
		cacheKeySuffix = category
	}

	// 1. Check Redis cache first
	if h.redis != nil && h.redis.IsAvailable() {
		cacheKey := h.redis.BuildGlobalKey("plans", cacheKeySuffix)
		var cachedPlans []models.SubscriptionPlan
		if err := h.redis.Get(r.Context(), cacheKey, &cachedPlans); err == nil && len(cachedPlans) > 0 {
			w.Header().Set("X-Cache-Status", "HIT")
			json.NewEncoder(w).Encode(cachedPlans)
			return
		}
	}

	w.Header().Set("X-Cache-Status", "MISS")

	if h.db != nil {
		var count int64
		h.db.Model(&models.SubscriptionPlan{}).Count(&count)
		if count == 0 {
			seedDefaultSubscriptionPlans(h.db)
		}

		var plans []models.SubscriptionPlan
		query := h.db.Order("price_ngn ASC")
		if category != "" && category != "ALL" {
			query = query.Where("category = ?", category)
		}
		if err := query.Find(&plans).Error; err == nil && len(plans) > 0 {
			if h.redis != nil && h.redis.IsAvailable() {
				cacheKey := h.redis.BuildGlobalKey("plans", cacheKeySuffix)
				_ = h.redis.Set(r.Context(), cacheKey, plans, 1*time.Hour)
			}
			json.NewEncoder(w).Encode(plans)
			return
		}
	}

	json.NewEncoder(w).Encode(getDefaultSeedPlans())
}

// GetPlan returns a single subscription plan by ID
func (h *SubscriptionHandler) GetPlan(w http.ResponseWriter, r *http.Request) {
	planID := chi.URLParam(r, "id")
	w.Header().Set("Content-Type", "application/json")

	if h.db != nil {
		var plan models.SubscriptionPlan
		if err := h.db.First(&plan, "id = ?", planID).Error; err == nil {
			json.NewEncoder(w).Encode(plan)
			return
		}
	}

	for _, p := range getDefaultSeedPlans() {
		if p.ID == planID {
			json.NewEncoder(w).Encode(p)
			return
		}
	}

	http.Error(w, `{"error": "Subscription plan not found"}`, http.StatusNotFound)
}

// CreatePlan adds a new plan blueprint to Neon Postgres database
func (h *SubscriptionHandler) CreatePlan(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var plan models.SubscriptionPlan
	if err := json.NewDecoder(r.Body).Decode(&plan); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if plan.ID == "" {
		plan.ID = fmt.Sprintf("plan-%d", time.Now().UnixNano())
	}
	plan.CreatedAt = time.Now()
	plan.UpdatedAt = time.Now()

	if h.db != nil {
		if err := h.db.Create(&plan).Error; err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
	}

	if h.redis != nil {
		_ = h.redis.DeletePrefix(r.Context(), h.redis.BuildGlobalKey("plans", ""))
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(plan)
}

// UpdatePlan modifies an existing subscription blueprint in Neon Postgres database
func (h *SubscriptionHandler) UpdatePlan(w http.ResponseWriter, r *http.Request) {
	planID := chi.URLParam(r, "id")
	w.Header().Set("Content-Type", "application/json")

	var rawMap map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&rawMap); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	updateFields := make(map[string]interface{})
	if v, ok := rawMap["name"]; ok {
		updateFields["name"] = v
	}
	if v, ok := rawMap["price_ngn"]; ok {
		updateFields["price_ngn"] = v
	} else if v, ok := rawMap["priceNgn"]; ok {
		updateFields["price_ngn"] = v
	}
	if v, ok := rawMap["price_usd"]; ok {
		updateFields["price_usd"] = v
	} else if v, ok := rawMap["priceUsd"]; ok {
		updateFields["price_usd"] = v
	}
	if v, ok := rawMap["period"]; ok {
		updateFields["period"] = v
	}
	if v, ok := rawMap["badge"]; ok {
		updateFields["badge"] = v
	}
	if v, ok := rawMap["description"]; ok {
		updateFields["description"] = v
	}
	if v, ok := rawMap["category"]; ok {
		updateFields["category"] = v
	}
	if v, ok := rawMap["category_label"]; ok {
		updateFields["category_label"] = v
	} else if v, ok := rawMap["categoryLabel"]; ok {
		updateFields["category_label"] = v
	}
	if v, ok := rawMap["tier"]; ok {
		updateFields["tier"] = v
	}
	if v, ok := rawMap["leads_limit"]; ok {
		updateFields["leads_limit"] = v
	} else if v, ok := rawMap["leadsLimit"]; ok {
		updateFields["leads_limit"] = v
	}
	if v, ok := rawMap["campaigns_limit"]; ok {
		updateFields["campaigns_limit"] = v
	} else if v, ok := rawMap["campaignsLimit"]; ok {
		updateFields["campaigns_limit"] = v
	}
	if v, ok := rawMap["team_seats"]; ok {
		updateFields["team_seats"] = v
	} else if v, ok := rawMap["teamSeats"]; ok {
		updateFields["team_seats"] = v
	}
	if v, ok := rawMap["tokens_limit"]; ok {
		updateFields["tokens_limit"] = v
	} else if v, ok := rawMap["tokensLimit"]; ok {
		updateFields["tokens_limit"] = v
	}
	if v, ok := rawMap["storefronts_limit"]; ok {
		updateFields["storefronts_limit"] = v
	} else if v, ok := rawMap["storefrontsLimit"]; ok {
		updateFields["storefronts_limit"] = v
	}
	if v, ok := rawMap["features_json"]; ok {
		updateFields["features_json"] = v
	} else if v, ok := rawMap["features"]; ok {
		if featBytes, err := json.Marshal(v); err == nil {
			updateFields["features_json"] = string(featBytes)
		}
	}
	updateFields["updated_at"] = time.Now()

	if h.db != nil {
		if err := h.db.Model(&models.SubscriptionPlan{}).Where("id = ?", planID).Updates(updateFields).Error; err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		if h.redis != nil {
			_ = h.redis.DeletePrefix(r.Context(), h.redis.BuildGlobalKey("plans", ""))
		}
		var updated models.SubscriptionPlan
		h.db.First(&updated, "id = ?", planID)
		json.NewEncoder(w).Encode(updated)
		return
	}

	if h.redis != nil {
		_ = h.redis.DeletePrefix(r.Context(), h.redis.BuildGlobalKey("plans", ""))
	}

	rawMap["id"] = planID
	json.NewEncoder(w).Encode(rawMap)
}

// DeletePlan removes a subscription blueprint from Neon Postgres database
func (h *SubscriptionHandler) DeletePlan(w http.ResponseWriter, r *http.Request) {
	planID := chi.URLParam(r, "id")
	w.Header().Set("Content-Type", "application/json")

	if h.db != nil {
		if err := h.db.Delete(&models.SubscriptionPlan{}, "id = ?", planID).Error; err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
	}

	if h.redis != nil {
		_ = h.redis.DeletePrefix(r.Context(), h.redis.BuildGlobalKey("plans", ""))
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Subscription plan '%s' deleted successfully", planID),
	})
}

// UpdateTenantSubscription updates a tenant's active subscription tier, status, and module matrix in Neon Postgres
func (h *SubscriptionHandler) UpdateTenantSubscription(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		PlanTier     models.PlanTier `json:"plan_tier"`
		PlanID       string          `json:"plan_id"`
		BillingCycle string          `json:"billing_cycle"`
		Status       string          `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.PlanTier == "" {
		req.PlanTier = models.PlanGrowth
	}
	req.PlanTier = models.PlanTier(strings.ToUpper(strings.TrimSpace(string(req.PlanTier))))

	if req.BillingCycle == "" {
		req.BillingCycle = "MONTHLY"
	} else {
		req.BillingCycle = strings.ToUpper(strings.TrimSpace(req.BillingCycle))
	}

	if req.Status == "" {
		req.Status = "ACTIVE"
	} else {
		req.Status = strings.ToUpper(strings.TrimSpace(req.Status))
	}

	if h.db != nil {
		var org models.Organization
		err := h.db.Where("id = ? OR LOWER(slug) = LOWER(?)", orgID, orgID).First(&org).Error
		targetOrgID := orgID
		if err == nil {
			targetOrgID = org.ID
			h.db.Model(&org).Updates(map[string]interface{}{
				"plan_tier":     req.PlanTier,
				"billing_cycle": req.BillingCycle,
				"status":        req.Status,
				"updated_at":    time.Now(),
			})
		}

		periodEnd := time.Now().AddDate(0, 1, 0)
		if req.BillingCycle == "ANNUAL" || req.BillingCycle == "YEARLY" {
			periodEnd = time.Now().AddDate(1, 0, 0)
		}

		var sub models.Subscription
		if err := h.db.First(&sub, "organization_id = ?", targetOrgID).Error; err == nil {
			h.db.Model(&sub).Updates(map[string]interface{}{
				"plan_tier":          req.PlanTier,
				"billing_cycle":      req.BillingCycle,
				"status":             req.Status,
				"current_period_end": periodEnd,
				"updated_at":         time.Now(),
			})
		} else {
			h.db.Create(&models.Subscription{
				ID:                 fmt.Sprintf("sub-%s-%d", targetOrgID, time.Now().Unix()),
				OrganizationID:     targetOrgID,
				PlanTier:           req.PlanTier,
				BillingCycle:       req.BillingCycle,
				Status:             req.Status,
				CurrentPeriodStart: time.Now(),
				CurrentPeriodEnd:   periodEnd,
				CreatedAt:          time.Now(),
				UpdatedAt:          time.Now(),
			})
		}

		// Automatically align ERP/Shop/Mobility modules & RBAC matrix for the new tier
		if org.ID != "" {
			h.subServ.SyncTenantModulesForTier(&org, req.PlanTier, req.Status)
			h.invalidateRBACCache(r, &org, orgID)
		}

		summary, err := h.subServ.GetTenantSubscription(targetOrgID)
		if err == nil {
			json.NewEncoder(w).Encode(summary)
			return
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":         true,
		"organization_id": orgID,
		"plan_tier":       req.PlanTier,
		"billing_cycle":   req.BillingCycle,
		"status":          req.Status,
		"message":         "Tenant subscription and module entitlements updated successfully",
	})
}

// OverrideTenantQuotas persists extra leads, campaigns, and team seat overrides for a workspace in Neon Postgres
func (h *SubscriptionHandler) OverrideTenantQuotas(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		ExtraLeads     int             `json:"extra_leads"`
		ExtraCampaigns int             `json:"extra_campaigns"`
		ExtraSeats     int             `json:"extra_seats"`
		PlanTier       models.PlanTier `json:"plan_tier"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if h.db != nil {
		var org models.Organization
		targetOrgID := orgID
		if err := h.db.Where("id = ? OR LOWER(slug) = LOWER(?)", orgID, orgID).First(&org).Error; err == nil {
			targetOrgID = org.ID
			if req.PlanTier != "" {
				req.PlanTier = models.PlanTier(strings.ToUpper(strings.TrimSpace(string(req.PlanTier))))
				h.db.Model(&org).Update("plan_tier", req.PlanTier)
				h.subServ.SyncTenantModulesForTier(&org, req.PlanTier, org.Status)
				h.invalidateRBACCache(r, &org, orgID)
			}
		}

		var sub models.Subscription
		if err := h.db.First(&sub, "organization_id = ?", targetOrgID).Error; err == nil {
			updates := map[string]interface{}{
				"extra_leads":     req.ExtraLeads,
				"extra_campaigns": req.ExtraCampaigns,
				"extra_seats":     req.ExtraSeats,
				"updated_at":      time.Now(),
			}
			if req.PlanTier != "" {
				updates["plan_tier"] = req.PlanTier
			}
			h.db.Model(&sub).Updates(updates)
		} else {
			tier := req.PlanTier
			if tier == "" {
				tier = models.PlanGrowth
			}
			h.db.Create(&models.Subscription{
				ID:                 fmt.Sprintf("sub-%s-%d", targetOrgID, time.Now().Unix()),
				OrganizationID:     targetOrgID,
				PlanTier:           tier,
				BillingCycle:       "MONTHLY",
				Status:             "ACTIVE",
				ExtraLeads:         req.ExtraLeads,
				ExtraCampaigns:     req.ExtraCampaigns,
				ExtraSeats:         req.ExtraSeats,
				CurrentPeriodStart: time.Now(),
				CurrentPeriodEnd:   time.Now().AddDate(0, 1, 0),
				CreatedAt:          time.Now(),
				UpdatedAt:          time.Now(),
			})
		}

		if summary, err := h.subServ.GetTenantSubscription(targetOrgID); err == nil {
			json.NewEncoder(w).Encode(summary)
			return
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":         true,
		"organization_id": orgID,
		"extra_leads":     req.ExtraLeads,
		"extra_campaigns": req.ExtraCampaigns,
		"extra_seats":     req.ExtraSeats,
		"plan_tier":       req.PlanTier,
		"message":         "Tenant quota overrides persisted in database",
	})
}

// CheckAndIncrementQuota checks if an action is allowed under the tenant's plan limits and increments usage if requested
func (h *SubscriptionHandler) CheckAndIncrementQuota(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Action                 string  `json:"action"` // "EXTRACT_LEADS", "LAUNCH_CAMPAIGN", "INCREMENT_USAGE"
		RequestedLeads         int     `json:"requested_leads"`
		CurrentActiveCampaigns int     `json:"current_active_campaigns"`
		EmailsSent             int     `json:"emails_sent"`
		WhatsAppSent           int     `json:"whatsapp_sent"`
		AITokensUsed           int64   `json:"ai_tokens_used"`
		AICostUSD              float64 `json:"ai_cost_usd"`
		CommitIncrement        bool    `json:"commit_increment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if h.db == nil {
		json.NewEncoder(w).Encode(map[string]interface{}{"allowed": true})
		return
	}

	switch strings.ToUpper(req.Action) {
	case "EXTRACT_LEADS":
		allowed, err := h.subServ.CanExtractLeads(orgID, req.RequestedLeads)
		if !allowed || err != nil {
			w.WriteHeader(http.StatusPaymentRequired)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"allowed": false,
				"error":   err.Error(),
			})
			return
		}
		if req.CommitIncrement && req.RequestedLeads > 0 {
			_ = h.subServ.IncrementUsage(orgID, req.RequestedLeads, 0, 0, req.AITokensUsed, req.AICostUSD)
		}
	case "LAUNCH_CAMPAIGN":
		allowed, err := h.subServ.CanLaunchCampaign(orgID, req.CurrentActiveCampaigns)
		if !allowed || err != nil {
			w.WriteHeader(http.StatusPaymentRequired)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"allowed": false,
				"error":   err.Error(),
			})
			return
		}
	case "INCREMENT_USAGE":
		if err := h.subServ.IncrementUsage(orgID, req.RequestedLeads, req.EmailsSent, req.WhatsAppSent, req.AITokensUsed, req.AICostUSD); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
	}

	summary, _ := h.subServ.GetTenantSubscription(orgID)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"allowed":      true,
		"subscription": summary,
	})
}

// InitializeCheckout initiates a Paystack subscription checkout (calls live Paystack API when PAYSTACK_SECRET_KEY is set)
func (h *SubscriptionHandler) InitializeCheckout(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var req CheckoutPlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.PlanTier == "" {
		req.PlanTier = models.PlanGrowth
	}
	req.PlanTier = models.PlanTier(strings.ToUpper(strings.TrimSpace(string(req.PlanTier))))

	billingCycle := strings.ToUpper(strings.TrimSpace(req.BillingCycle))
	if billingCycle == "" {
		billingCycle = "MONTHLY"
	}

	limits := subscription.GetLimitsForTier(req.PlanTier)
	amountNGN := limits.MonthlyPriceNGN
	if billingCycle == "ANNUAL" || billingCycle == "YEARLY" {
		amountNGN = limits.AnnualPriceNGN
	}

	cleanOrgPrefix := orgID
	if len(cleanOrgPrefix) > 12 {
		cleanOrgPrefix = cleanOrgPrefix[:12]
	}
	reference := fmt.Sprintf("ofia_sub_%s_%d", cleanOrgPrefix, time.Now().Unix())

	email := strings.TrimSpace(req.Email)
	if email == "" && h.db != nil {
		var org models.Organization
		if err := h.db.Preload("Owner").Where("id = ? OR LOWER(slug) = LOWER(?)", orgID, orgID).First(&org).Error; err == nil && org.Owner != nil {
			email = org.Owner.Email
		}
	}
	if email == "" {
		email = "billing@ofia.ng"
	}

	paystackSecret := strings.TrimSpace(os.Getenv("PAYSTACK_SECRET_KEY"))
	if paystackSecret != "" && amountNGN > 0 {
		payload := map[string]interface{}{
			"email":     email,
			"amount":    int64(amountNGN * 100), // Paystack expects kobo
			"reference": reference,
			"currency":  "NGN",
			"metadata": map[string]interface{}{
				"org_id":        orgID,
				"tenant_slug":   orgID,
				"plan_tier":     string(req.PlanTier),
				"billing_cycle": billingCycle,
			},
		}
		if req.CallbackURL != "" {
			payload["callback_url"] = req.CallbackURL
		}

		bodyBytes, _ := json.Marshal(payload)
		httpReq, err := http.NewRequestWithContext(r.Context(), "POST", "https://api.paystack.co/transaction/initialize", bytes.NewReader(bodyBytes))
		if err == nil {
			httpReq.Header.Set("Authorization", "Bearer "+paystackSecret)
			httpReq.Header.Set("Content-Type", "application/json")
			client := &http.Client{Timeout: 10 * time.Second}
			resp, err := client.Do(httpReq)
			if err == nil {
				defer resp.Body.Close()
				var psResp struct {
					Status  bool   `json:"status"`
					Message string `json:"message"`
					Data    struct {
						AuthorizationURL string `json:"authorization_url"`
						AccessCode       string `json:"access_code"`
						Reference        string `json:"reference"`
					} `json:"data"`
				}
				if json.NewDecoder(resp.Body).Decode(&psResp) == nil && psResp.Status && psResp.Data.AuthorizationURL != "" {
					w.Header().Set("Content-Type", "application/json")
					json.NewEncoder(w).Encode(CheckoutResponse{
						AuthorizationURL: psResp.Data.AuthorizationURL,
						AccessCode:       psResp.Data.AccessCode,
						Reference:        psResp.Data.Reference,
						AmountNGN:        amountNGN,
						PlanTier:         req.PlanTier,
						BillingCycle:     billingCycle,
						Mode:             "LIVE_PAYSTACK",
					})
					return
				}
			}
		}
	}

	// Sandbox / Dev fallback when PAYSTACK_SECRET_KEY is not configured
	callback := req.CallbackURL
	if callback == "" {
		callback = fmt.Sprintf("/tenant/billing?upgraded=%s&cycle=%s&ref=%s", req.PlanTier, billingCycle, reference)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(CheckoutResponse{
		AuthorizationURL: callback,
		AccessCode:       "sandbox_acc_" + reference,
		Reference:        reference,
		AmountNGN:        amountNGN,
		PlanTier:         req.PlanTier,
		BillingCycle:     billingCycle,
		Mode:             "SANDBOX_DIRECT",
	})
}

// HandlePaystackWebhook verifies Paystack HMAC-SHA512 signature and activates/updates the tenant's subscription & module matrix
func (h *SubscriptionHandler) HandlePaystackWebhook(w http.ResponseWriter, r *http.Request) {
	paystackSecret := strings.TrimSpace(os.Getenv("PAYSTACK_SECRET_KEY"))
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}

	signature := r.Header.Get("X-Paystack-Signature")
	if paystackSecret != "" && signature != "" {
		mac := hmac.New(sha512.New, []byte(paystackSecret))
		mac.Write(body)
		expectedMAC := hex.EncodeToString(mac.Sum(nil))
		if !hmac.Equal([]byte(signature), []byte(expectedMAC)) {
			http.Error(w, "Invalid webhook signature", http.StatusUnauthorized)
			return
		}
	}

	var payload struct {
		Event string `json:"event"`
		Data  struct {
			Reference    string  `json:"reference"`
			Amount       float64 `json:"amount"` // in kobo
			Status       string  `json:"status"`
			Customer     struct {
				Email        string `json:"email"`
				CustomerCode string `json:"customer_code"`
			} `json:"customer"`
			SubscriptionCode string `json:"subscription_code"`
			Metadata         struct {
				OrgID        string `json:"org_id"`
				TenantSlug   string `json:"tenant_slug"`
				PlanTier     string `json:"plan_tier"`
				BillingCycle string `json:"billing_cycle"`
			} `json:"metadata"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &payload); err == nil && h.db != nil {
		orgIdentifier := strings.TrimSpace(payload.Data.Metadata.OrgID)
		if orgIdentifier == "" {
			orgIdentifier = strings.TrimSpace(payload.Data.Metadata.TenantSlug)
		}

		// Infer tier from metadata or fallback to amount in NGN
		planTier := models.PlanTier(strings.ToUpper(strings.TrimSpace(payload.Data.Metadata.PlanTier)))
		if planTier == "" {
			amountNGN := payload.Data.Amount / 100.0
			switch {
			case amountNGN >= 600_000:
				planTier = models.PlanEnterprise
			case amountNGN >= 180_000:
				planTier = models.PlanScale
			case amountNGN >= 65_000:
				planTier = models.PlanGrowth
			default:
				planTier = models.PlanStarter
			}
		}

		billingCycle := strings.ToUpper(strings.TrimSpace(payload.Data.Metadata.BillingCycle))
		if billingCycle == "" {
			billingCycle = "MONTHLY"
		}

		switch payload.Event {
		case "charge.success", "subscription.create":
			if orgIdentifier != "" {
				var org models.Organization
				if err := h.db.Where("id = ? OR LOWER(slug) = LOWER(?)", orgIdentifier, orgIdentifier).First(&org).Error; err == nil {
					periodEnd := time.Now().AddDate(0, 1, 0)
					if billingCycle == "ANNUAL" || billingCycle == "YEARLY" {
						periodEnd = time.Now().AddDate(1, 0, 0)
					}

					h.db.Model(&org).Updates(map[string]interface{}{
						"plan_tier":     planTier,
						"billing_cycle": billingCycle,
						"status":        "ACTIVE",
						"updated_at":    time.Now(),
					})

					var sub models.Subscription
					if err := h.db.First(&sub, "organization_id = ?", org.ID).Error; err == nil {
						h.db.Model(&sub).Updates(map[string]interface{}{
							"plan_tier":                  planTier,
							"billing_cycle":              billingCycle,
							"status":                     "ACTIVE",
							"paystack_subscription_code": payload.Data.SubscriptionCode,
							"paystack_customer_code":     payload.Data.Customer.CustomerCode,
							"current_period_start":       time.Now(),
							"current_period_end":         periodEnd,
							"updated_at":                 time.Now(),
						})
					} else {
						h.db.Create(&models.Subscription{
							ID:                       fmt.Sprintf("sub-%s-%d", org.ID, time.Now().Unix()),
							OrganizationID:           org.ID,
							PlanTier:                 planTier,
							BillingCycle:             billingCycle,
							PaystackSubscriptionCode: payload.Data.SubscriptionCode,
							PaystackCustomerCode:     payload.Data.Customer.CustomerCode,
							Status:                   "ACTIVE",
							CurrentPeriodStart:       time.Now(),
							CurrentPeriodEnd:         periodEnd,
							CreatedAt:                time.Now(),
							UpdatedAt:                time.Now(),
						})
					}

					h.subServ.SyncTenantModulesForTier(&org, planTier, "ACTIVE")
					h.invalidateRBACCache(r, &org, orgIdentifier)
				}
			}

		case "subscription.disable", "invoice.payment_failed":
			if orgIdentifier != "" {
				var org models.Organization
				if err := h.db.Where("id = ? OR LOWER(slug) = LOWER(?)", orgIdentifier, orgIdentifier).First(&org).Error; err == nil {
					h.db.Model(&org).Updates(map[string]interface{}{
						"status":     "PAST_DUE",
						"updated_at": time.Now(),
					})
					h.db.Model(&models.Subscription{}).Where("organization_id = ?", org.ID).Updates(map[string]interface{}{
						"status":     "PAST_DUE",
						"updated_at": time.Now(),
					})
				}
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "processed"}`))
}

func getDefaultSeedPlans() []models.SubscriptionPlan {
	return []models.SubscriptionPlan{
		// UNIFIED OFIA PLATFORM TIERS
		{
			ID:               "ofia-tier-free-trial",
			Category:         "OFIA_ENTERPRISE",
			CategoryLabel:    "Ofia Unified Platform",
			Tier:             models.PlanFreeTrial,
			Name:             "Ofia Sandbox (14-Day Pilot)",
			PriceNGN:         0,
			PriceUSD:         0,
			Period:           "14 Days",
			Badge:            "14-Day Free Pilot",
			Description:      "Risk-free onboarding to configure your storefront, import catalog SKUs, and test POS & CRM workflows.",
			LeadsLimit:       250,
			CampaignsLimit:   1,
			TeamSeats:        2,
			TokensLimit:      250000,
			StorefrontsLimit: 1,
			FeaturesJSON:     `["1 Storefront on {slug}.ofia.shop","Up to 50 Products / SKUs","Single-Register Web POS","Basic CRM Pipeline (Up to 250 Leads)","250k AI Tokens Sandbox","2.5% Direct / 5.0% Escrow Checkout Fee"]`,
			IsActive:         true,
		},
		{
			ID:               "ofia-tier-starter",
			Category:         "OFIA_SHOP",
			CategoryLabel:    "Ofia Launch",
			Tier:             models.PlanStarter,
			Name:             "Ofia Launch (Starter)",
			PriceNGN:         25000,
			PriceUSD:         20,
			Period:           "Monthly",
			Badge:            "Retail & Solo Merchants",
			Description:      "Everything a single-branch retailer, restaurant, or service provider needs to sell online and in-store.",
			LeadsLimit:       1500,
			CampaignsLimit:   3,
			TeamSeats:        5,
			TokensLimit:      2000000,
			StorefrontsLimit: 1,
			FeaturesJSON:     `["1 Branded Storefront + 1 Custom Domain","Up to 500 Products & Service Listings","2 POS Terminal Registers + Barcode Checkout","Single-Location Inventory & Stock Alerts","CRM Pipeline (1,500 Leads/mo & 3 Campaigns)","2.0% Direct / 4.5% Escrow Checkout Fee"]`,
			IsActive:         true,
		},
		{
			ID:               "ofia-tier-growth",
			Category:         "OFIA_ENTERPRISE",
			CategoryLabel:    "Ofia Growth",
			Tier:             models.PlanGrowth,
			Name:             "Ofia Growth (Business Pro)",
			PriceNGN:         75000,
			PriceUSD:         55,
			Period:           "Monthly",
			Badge:            "Most Popular",
			Description:      "Full back-office ERP (Accounting, HR, Multi-Warehouse IMS) + Multi-Branch Storefronts + AI Sales Agents.",
			LeadsLimit:       10000,
			CampaignsLimit:   10,
			TeamSeats:        15,
			TokensLimit:      10000000,
			StorefrontsLimit: 3,
			FeaturesJSON:     `["Up to 3 Storefronts + 3 Custom Domains","Up to 5,000 Products + Service Bookings","Double-Entry Financial Accounting & Tax","HR, Automated Payroll & Attendance","AI SDR Outreach Swarm (10M Tokens/mo + BYOK)","1.25% Direct / 3.5% Escrow Checkout Fee"]`,
			IsActive:         true,
		},
		{
			ID:               "ofia-tier-scale",
			Category:         "OFIA_ENTERPRISE",
			CategoryLabel:    "Ofia Scale",
			Tier:             models.PlanScale,
			Name:             "Ofia Scale (Omni-Suite)",
			PriceNGN:         200000,
			PriceUSD:         145,
			Period:           "Monthly",
			Badge:            "High-Velocity Omni-Suite",
			Description:      "Multi-brand retail empires, fleet/logistics operators, and high-velocity GTM teams running at scale.",
			LeadsLimit:       50000,
			CampaignsLimit:   30,
			TeamSeats:        50,
			TokensLimit:      50000000,
			StorefrontsLimit: 10,
			FeaturesJSON:     `["Up to 10 Storefronts & Unlimited Products","Unlimited POS Registers Across All Branches","Mobility, Fleet & Dispatch Operations Suite","Workforce Governance, KPIs & Granular RBAC","Full AI GTM + Voicebip AI PSTN Calling (50M Tokens)","0.5% Direct / 2.5% Escrow Checkout Fee"]`,
			IsActive:         true,
		},
		{
			ID:               "ofia-tier-enterprise",
			Category:         "OFIA_ENTERPRISE",
			CategoryLabel:    "Ofia Sovereign",
			Tier:             models.PlanEnterprise,
			Name:             "Ofia Sovereign (Enterprise)",
			PriceNGN:         650000,
			PriceUSD:         450,
			Period:           "Monthly",
			Badge:            "Dedicated Cloud & 0% Direct Fee",
			Description:      "Dedicated Neon Postgres & Cloudinary infrastructure (BYODB/BYOS), zero direct gateway surcharge, and 99.99% SLA.",
			LeadsLimit:       250000,
			CampaignsLimit:   100,
			TeamSeats:        999,
			TokensLimit:      250000000,
			StorefrontsLimit: 999,
			FeaturesJSON:     `["Dedicated Neon PostgreSQL & Cloudinary Storage","Unlimited Storefronts, Seats & Warehouses","0.0% Direct Gateway Fee / 1.5% Escrow Fee","250,000 Leads/mo & 250M AI Tokens Quota","Custom ERP & Bank Reconciliation Webhooks","99.99% Uptime SLA & Dedicated Technical Lead"]`,
			IsActive:         true,
		},
	}
}

func seedDefaultSubscriptionPlans(db *gorm.DB) {
	plans := getDefaultSeedPlans()
	for _, p := range plans {
		p.CreatedAt = time.Now()
		p.UpdatedAt = time.Now()
		var existing models.SubscriptionPlan
		if err := db.First(&existing, "id = ?", p.ID).Error; err == nil {
			db.Model(&existing).Updates(map[string]interface{}{
				"price_ngn":         p.PriceNGN,
				"price_usd":         p.PriceUSD,
				"period":            p.Period,
				"category":          p.Category,
				"category_label":    p.CategoryLabel,
				"tier":              p.Tier,
				"name":              p.Name,
				"badge":             p.Badge,
				"description":       p.Description,
				"leads_limit":       p.LeadsLimit,
				"campaigns_limit":   p.CampaignsLimit,
				"team_seats":        p.TeamSeats,
				"tokens_limit":      p.TokensLimit,
				"storefronts_limit": p.StorefrontsLimit,
				"features_json":     p.FeaturesJSON,
				"updated_at":        time.Now(),
			})
		} else {
			db.Create(&p)
		}
	}
}
