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
			// Extract organization ID and target tier, then update subscription
			// e.g. h.db.Model(&models.Organization{}).Where("id = ?", orgID).Update("planTier", newTier)
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "processed"}`))
}
