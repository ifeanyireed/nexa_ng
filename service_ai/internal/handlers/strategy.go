package handlers

import (
	"encoding/json"
	"net/http"
	"time"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"nexa/ai_gtm_service/internal/models"
)

type StrategyHandler struct {
	db *gorm.DB
}

func NewStrategyHandler(db *gorm.DB) *StrategyHandler {
	return &StrategyHandler{db: db}
}

func (h *StrategyHandler) GetStrategy(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var strat models.GTMStrategy
	if h.db != nil && orgID != "" {
		h.db.First(&strat, "organizationId = ?", orgID)
	}

	if strat.ID == "" {
		nodesJSON, _ := json.Marshal([]map[string]interface{}{
			{"step": "Step 1", "category": "ICP", "title": "K-12 Private Schools", "metrics": "4,200 Schools · $18M TAM"},
			{"step": "Step 2", "category": "Persona", "title": "School Proprietors & Bursars", "metrics": "8,400 Decision Makers"},
			{"step": "Step 3", "category": "PainPoint", "title": "Tuition Leakage & Alert Chasing", "metrics": "8-12% Leakage"},
			{"step": "Step 4", "category": "Positioning", "title": "Automated Tuition Command", "metrics": "+64% Win Rate"},
			{"step": "Step 5", "category": "Channel", "title": "Email + WhatsApp Hybrid", "metrics": "14.8% Reply Rate"},
			{"step": "Step 6", "category": "Offer", "title": "Zero-Risk 30-Day Term Pilot", "metrics": "78% Conversion"},
		})

		strat = models.GTMStrategy{
			ID:                uuid.New().String(),
			OrganizationID:    orgID,
			Title:             "Private Education Operations Blitz",
			TargetTAM:         "$18,000,000",
			ValueProposition:  "Automated zero-leakage tuition reconciliation via dedicated virtual accounts and WhatsApp receipts",
			StrategyGraphJSON: string(nodesJSON),
			Status:            "ACTIVE",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(strat)
}
