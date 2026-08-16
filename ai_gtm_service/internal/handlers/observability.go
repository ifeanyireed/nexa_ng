package handlers

import (
	"encoding/json"
	"net/http"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"nexa/ai_gtm_service/internal/models"
)

type ObservabilityHandler struct {
	db *gorm.DB
}

func NewObservabilityHandler(db *gorm.DB) *ObservabilityHandler {
	return &ObservabilityHandler{db: db}
}

func (h *ObservabilityHandler) GetTraces(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var traces []models.GTMObservabilityTrace
	if h.db != nil {
		query := h.db.Order("createdAt desc").Limit(50)
		if orgID != "" && orgID != "all" {
			query = query.Where("organizationId = ?", orgID)
		}
		query.Find(&traces)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(traces)
}

func (h *ObservabilityHandler) TripCircuitBreaker(w http.ResponseWriter, r *http.Request) {
	agentKey := chi.URLParam(r, "agentKey")

	if h.db != nil {
		h.db.Model(&models.AIAgent{}).Where("`key` = ?", agentKey).Update("circuitBreakerActive", true)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"agent_key":             agentKey,
		"circuit_breaker_armed": true,
		"status":                "PAUSED",
	})
}
