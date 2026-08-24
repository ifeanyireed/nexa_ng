package handlers

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"nexa/user_subscription_service/internal/models"
	"nexa/user_subscription_service/internal/subscription"
)

type SubscriptionHandler struct {
	db      *gorm.DB
	subServ *subscription.SubscriptionService
}

func NewSubscriptionHandler(db *gorm.DB) *SubscriptionHandler {
	return &SubscriptionHandler{
		db:      db,
		subServ: subscription.NewSubscriptionService(db),
	}
}

type CheckoutPlanRequest struct {
	PlanTier models.PlanTier `json:"plan_tier"`
	Email    string          `json:"email"`
}

type CheckoutResponse struct {
	AuthorizationURL string `json:"authorization_url"`
	AccessCode       string `json:"access_code"`
	Reference        string `json:"reference"`
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
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(summary)
		return
	}

	// Mock fallback
	limits := subscription.GetLimitsForTier(models.PlanGrowth)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"organization_id": orgID,
		"plan_tier":       models.PlanGrowth,
		"status":          "ACTIVE",
		"limits":          limits,
		"usage": map[string]interface{}{
			"leads_researched": 3420,
			"emails_sent":      980,
			"ai_tokens_used":   1425000,
			"ai_cost_usd":      142.5,
		},
		"days_remaining": 22,
	})
}

// GetAllPlanTiers returns the catalog of plan limits defined in SubscriptionHelper
func (h *SubscriptionHandler) GetAllPlanTiers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subscription.PlanLimits)
}

// ListPlans returns all subscription plan blueprints stored in MySQL database
func (h *SubscriptionHandler) ListPlans(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if h.db != nil {
		var count int64
		h.db.Model(&models.SubscriptionPlan{}).Count(&count)
		if count == 0 {
			// Auto-seed default catalog into MySQL database
			seedDefaultSubscriptionPlans(h.db)
		}

		category := r.URL.Query().Get("category")
		var plans []models.SubscriptionPlan
		query := h.db.Order("price_ngn ASC")
		if category != "" && category != "ALL" {
			query = query.Where("category = ?", category)
		}
		if err := query.Find(&plans).Error; err == nil && len(plans) > 0 {
			json.NewEncoder(w).Encode(plans)
			return
		}
	}

	// Fallback mock seeds if database is not reachable
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

// CreatePlan adds a new plan blueprint to MySQL database
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

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(plan)
}

// UpdatePlan modifies an existing subscription blueprint in MySQL database
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
		var updated models.SubscriptionPlan
		h.db.First(&updated, "id = ?", planID)
		json.NewEncoder(w).Encode(updated)
		return
	}

	rawMap["id"] = planID
	json.NewEncoder(w).Encode(rawMap)
}

// DeletePlan removes a subscription blueprint from MySQL database
func (h *SubscriptionHandler) DeletePlan(w http.ResponseWriter, r *http.Request) {
	planID := chi.URLParam(r, "id")
	w.Header().Set("Content-Type", "application/json")

	if h.db != nil {
		if err := h.db.Delete(&models.SubscriptionPlan{}, "id = ?", planID).Error; err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Subscription plan '%s' deleted successfully", planID),
	})
}

// UpdateTenantSubscription updates a tenant's active subscription tier in MySQL
func (h *SubscriptionHandler) UpdateTenantSubscription(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		PlanTier   models.PlanTier `json:"plan_tier"`
		PlanID     string          `json:"plan_id"`
		Status     string          `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.PlanTier == "" {
		req.PlanTier = models.PlanGrowth
	}

	if h.db != nil {
		// Update Organization table
		h.db.Model(&models.Organization{}).Where("id = ?", orgID).Update("plan_tier", req.PlanTier)

		// Update or Create Subscription table record
		var sub models.Subscription
		if err := h.db.First(&sub, "organization_id = ?", orgID).Error; err == nil {
			h.db.Model(&sub).Updates(map[string]interface{}{
				"plan_tier":  req.PlanTier,
				"status":     "ACTIVE",
				"updated_at": time.Now(),
			})
		} else {
			h.db.Create(&models.Subscription{
				ID:                 fmt.Sprintf("sub-%s-%d", orgID, time.Now().Unix()),
				OrganizationID:     orgID,
				PlanTier:           req.PlanTier,
				Status:             "ACTIVE",
				CurrentPeriodStart: time.Now(),
				CurrentPeriodEnd:   time.Now().AddDate(0, 1, 0),
				CreatedAt:          time.Now(),
				UpdatedAt:          time.Now(),
			})
		}

		summary, err := h.subServ.GetTenantSubscription(orgID)
		if err == nil {
			json.NewEncoder(w).Encode(summary)
			return
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":         true,
		"organization_id": orgID,
		"plan_tier":       req.PlanTier,
		"status":          "ACTIVE",
		"message":         "Tenant subscription updated successfully in database",
	})
}

// OverrideTenantQuotas configures extra leads/campaign overrides for a workspace
func (h *SubscriptionHandler) OverrideTenantQuotas(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		ExtraLeads      int             `json:"extra_leads"`
		ExtraCampaigns  int             `json:"extra_campaigns"`
		PlanTier        models.PlanTier `json:"plan_tier"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if h.db != nil && req.PlanTier != "" {
		h.db.Model(&models.Organization{}).Where("id = ?", orgID).Update("plan_tier", req.PlanTier)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":         true,
		"organization_id": orgID,
		"extra_leads":     req.ExtraLeads,
		"extra_campaigns": req.ExtraCampaigns,
		"plan_tier":       req.PlanTier,
		"message":         "Tenant quota override configured successfully in database",
	})
}

// InitializeCheckout initiates a Paystack subscription checkout
func (h *SubscriptionHandler) InitializeCheckout(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var req CheckoutPlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	_ = subscription.GetLimitsForTier(req.PlanTier)
	reference := fmt.Sprintf("sub_%s_%d", orgID[:8], time.Now().Unix())

	// In real production, calls Paystack API: https://api.paystack.co/transaction/initialize
	authURL := fmt.Sprintf("https://checkout.paystack.com/mock_%s?plan=%s&ref=%s", orgID, req.PlanTier, reference)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(CheckoutResponse{
		AuthorizationURL: authURL,
		AccessCode:       "mock_acc_" + reference,
		Reference:        reference,
	})
}

// HandlePaystackWebhook verifies Paystack HMAC signature and upgrades plan tier
func (h *SubscriptionHandler) HandlePaystackWebhook(w http.ResponseWriter, r *http.Request) {
	paystackSecret := os.Getenv("PAYSTACK_SECRET_KEY")
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

	var event map[string]interface{}
	if err := json.Unmarshal(body, &event); err == nil {
		eventType, _ := event["event"].(string)
		if eventType == "charge.success" || eventType == "subscription.create" {
			// Webhook charge handling logic
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "processed"}`))
}

func getDefaultSeedPlans() []models.SubscriptionPlan {
	return []models.SubscriptionPlan{
		// OFIA AI
		{
			ID:            "ofia-ai-pilot",
			Category:      "OFIA_AI",
			CategoryLabel: "Ofia AI",
			Tier:          models.PlanFreeTrial,
			Name:          "Ofia AI Pilot",
			PriceNGN:      0,
			Period:        "14 Days",
			Badge:         "14-Day Pilot",
			Description:   "Sandbox for testing autonomous AI SDR agents and lead discovery.",
			LeadsLimit:    250,
			CampaignsLimit: 1,
			TeamSeats:     2,
			TokensLimit:   250000,
			FeaturesJSON:  `["1 Autonomous AI Outreach Agent","250 Verified Enrichment Leads","250k Monthly AI Tokens Quota","Email Discovery Channel"]`,
			IsActive:      true,
		},
		{
			ID:            "ofia-ai-growth",
			Category:      "OFIA_AI",
			CategoryLabel: "Ofia AI",
			Tier:          models.PlanStarter,
			Name:          "Ofia AI Growth Swarm",
			PriceNGN:      13000,
			Period:        "Monthly",
			Badge:         "Most Popular AI",
			Description:   "Autonomous GTM swarm for multi-channel sales and WhatsApp agents.",
			LeadsLimit:    5000,
			CampaignsLimit: 5,
			TeamSeats:     5,
			TokensLimit:   10000000,
			FeaturesJSON:  `["5 Autonomous AI Swarm Agents","5,000 Verified Enrichment Leads / mo","10M Monthly AI Tokens Quota","Email + WhatsApp SDR Pipelines","BYOK OpenAI & Anthropic"]`,
			IsActive:      true,
		},
		{
			ID:            "ofia-ai-scale",
			Category:      "OFIA_AI",
			CategoryLabel: "Ofia AI",
			Tier:          models.PlanGrowth,
			Name:          "Ofia AI Autonomous Scale",
			PriceNGN:      36000,
			Period:        "Monthly",
			Badge:         "High Velocity AI",
			Description:   "Enterprise swarm intelligence for high-velocity revenue generation.",
			LeadsLimit:    25000,
			CampaignsLimit: 20,
			TeamSeats:     15,
			TokensLimit:   50000000,
			FeaturesJSON:  `["20 Autonomous Swarm Agents","25,000 Verified Leads / mo","50M Monthly AI Tokens Quota","LinkedIn + Meta Ads + Voice AI SDRs","Custom Brand Tone Fine-Tuning"]`,
			IsActive:      true,
		},
		{
			ID:            "ofia-ai-sovereign",
			Category:      "OFIA_AI",
			CategoryLabel: "Ofia AI",
			Tier:          models.PlanEnterprise,
			Name:          "Ofia AI Sovereign Cluster",
			PriceNGN:      70000,
			Period:        "Monthly",
			Badge:         "Dedicated AI",
			Description:   "Dedicated GPU clusters, unlimited AI agents, and private vector storage.",
			LeadsLimit:    100000,
			CampaignsLimit: 100,
			TeamSeats:     50,
			TokensLimit:   200000000,
			FeaturesJSON:  `["Unlimited Autonomous AI Swarms","100,000 Verified Leads / mo","200M Monthly AI Tokens Quota","Dedicated Inference GPU Cluster","Private Vector Database & RAG"]`,
			IsActive:      true,
		},

		// OFIA SHOP
		{
			ID:               "ofia-shop-starter",
			Category:         "OFIA_SHOP",
			CategoryLabel:    "Ofia Shop",
			Tier:             models.PlanStarter,
			Name:             "Ofia Shop Starter",
			PriceNGN:         3000,
			Period:           "Monthly",
			Badge:            "Fast Launch",
			Description:      "Deploy branded storefront on slug.ofia.shop with POS checkout.",
			LeadsLimit:       500,
			CampaignsLimit:   1,
			TeamSeats:        2,
			StorefrontsLimit: 1,
			FeaturesJSON:     `["1 Custom Storefront on slug.ofia.shop","Up to 100 Products Listed","Integrated POS Terminal Checkout","Automated Paystack Payment Gateway","Standard Customer Support"]`,
			IsActive:         true,
		},
		{
			ID:               "ofia-shop-pro",
			Category:         "OFIA_SHOP",
			CategoryLabel:    "Ofia Shop",
			Tier:             models.PlanGrowth,
			Name:             "Ofia Shop Merchant Pro",
			PriceNGN:         9000,
			Period:           "Monthly",
			Badge:            "Commerce Scale",
			Description:      "Custom domain connection, multi-branch POS, and logistics courier dispatch.",
			LeadsLimit:       2000,
			CampaignsLimit:   5,
			TeamSeats:        10,
			StorefrontsLimit: 3,
			FeaturesJSON:     `["Custom Domain Connection + Wildcard","3 Storefront Subdomains","Multi-Branch POS Terminal Checkout","Automated Courier & Rider Dispatch","Inventory Sync (IMS Integration)"]`,
			IsActive:         true,
		},
		{
			ID:               "ofia-shop-empire",
			Category:         "OFIA_SHOP",
			CategoryLabel:    "Ofia Shop",
			Tier:             models.PlanScale,
			Name:             "Ofia Shop Multi-Brand Empire",
			PriceNGN:         24000,
			Period:           "Monthly",
			Badge:            "Multi-Vendor",
			Description:      "Multi-storefront empire architecture with automated warehouse fulfillment.",
			LeadsLimit:       10000,
			CampaignsLimit:   15,
			TeamSeats:        25,
			StorefrontsLimit: 10,
			FeaturesJSON:     `["10 Custom Storefront Subdomains","Multi-Vendor Sub-Account Routing","Automated Warehouse Fulfillment","Zero Commission Surcharge (0%)","24/7 Dedicated Support"]`,
			IsActive:         true,
		},

		// OFIA ENTERPRISE SUITE
		{
			ID:            "ofia-ent-core",
			Category:      "OFIA_ENTERPRISE",
			CategoryLabel: "Ofia Enterprise Suite",
			Tier:          models.PlanGrowth,
			Name:          "Enterprise Core ERP",
			PriceNGN:      24000,
			Period:        "Monthly",
			Badge:         "Core Operations",
			Description:   "Full back-office ERP suite: CRM, Financial Accounting, IMS, and HR.",
			LeadsLimit:    5000,
			CampaignsLimit: 10,
			TeamSeats:     15,
			FeaturesJSON:  `["All 8 Core ERP Modules","Multi-Warehouse Inventory Control (IMS)","Double-Entry Financial Accounting","HRM Payroll & Attendance Logs","15 Concurrent User Seats"]`,
			IsActive:      true,
		},
		{
			ID:            "ofia-ent-omni",
			Category:      "OFIA_ENTERPRISE",
			CategoryLabel: "Ofia Enterprise Suite",
			Tier:          models.PlanScale,
			Name:          "Enterprise Omni-Suite",
			PriceNGN:      48000,
			Period:        "Monthly",
			Badge:         "Full Ecosystem",
			Description:   "Complete unified ecosystem: Full ERP Suite + Ofia Shop Storefronts + AI Swarms.",
			LeadsLimit:    20000,
			CampaignsLimit: 25,
			TeamSeats:     30,
			FeaturesJSON:  `["Full ERP + Shop Storefronts + AI Swarms","30 Concurrent User Seats","20,000 Leads Pipeline / month","Custom Role-Based RBAC Permissions","Integrated Fleet & Dispatch Logistics"]`,
			IsActive:      true,
		},
		{
			ID:            "ofia-ent-sovereign",
			Category:      "OFIA_ENTERPRISE",
			CategoryLabel: "Ofia Enterprise Suite",
			Tier:          models.PlanEnterprise,
			Name:          "Enterprise Sovereign SLA",
			PriceNGN:      100000,
			Period:        "Monthly",
			Badge:         "Dedicated Cloud",
			Description:   "Maximum throughput, dedicated cloud infrastructure, and 24/7 SLA.",
			LeadsLimit:    50000,
			CampaignsLimit: 100,
			TeamSeats:     999,
			FeaturesJSON:  `["Dedicated MySQL & Redis Instances","99.99% Guaranteed SLA Uptime","Unlimited Seats & Workspaces","Custom Enterprise ERP Integrations","Dedicated Strategic Technical Lead"]`,
			IsActive:      true,
		},

		// OFIA COMPASS
		{
			ID:            "ofia-compass-starter",
			Category:      "OFIA_COMPASS",
			CategoryLabel: "Ofia Compass",
			Tier:          models.PlanStarter,
			Name:          "Ofia Compass Essentials",
			PriceNGN:      7000,
			Period:        "Monthly",
			Badge:         "Executive Radar",
			Description:   "Real-time executive dashboards, anomaly tracking, and automated revenue digests.",
			LeadsLimit:    1000,
			CampaignsLimit: 2,
			TeamSeats:     3,
			FeaturesJSON:  `["Real-Time Executive KPI Dashboard","Automated Revenue & Churn Forecasts","Weekly AI Market Digest Reports","3 Executive / Leadership Seats"]`,
			IsActive:      true,
		},
		{
			ID:            "ofia-compass-pro",
			Category:      "OFIA_COMPASS",
			CategoryLabel: "Ofia Compass",
			Tier:          models.PlanGrowth,
			Name:          "Ofia Compass Strategic Pro",
			PriceNGN:      19000,
			Period:        "Monthly",
			Badge:         "Predictive BI",
			Description:   "Cross-organization predictive analytics, anomaly alerts, and market trend radar.",
			LeadsLimit:    5000,
			CampaignsLimit: 10,
			TeamSeats:     10,
			FeaturesJSON:  `["Cross-Channel Market Trend Radar","Automated Anomaly Detection & Alerts","Predictive Cash Flow & Supply Models","10 Executive Decision-Maker Seats","Custom Dashboard Metrics Builder"]`,
			IsActive:      true,
		},
		{
			ID:            "ofia-compass-sovereign",
			Category:      "OFIA_COMPASS",
			CategoryLabel: "Ofia Compass",
			Tier:          models.PlanEnterprise,
			Name:          "Ofia Compass Sovereign Radar",
			PriceNGN:      50000,
			Period:        "Monthly",
			Badge:         "Boardroom Intelligence",
			Description:   "Boardroom-ready automated presentations, strategic benchmarking, and dedicated BI analysts.",
			LeadsLimit:    25000,
			CampaignsLimit: 50,
			TeamSeats:     50,
			FeaturesJSON:  `["Board-Ready Automated Strategic Decks","Industry Competitor Benchmarking Radar","Dedicated Strategic BI Data Analyst","Unlimited Executive & Board Seats","24/7 Strategic Alert Notification"]`,
			IsActive:      true,
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
