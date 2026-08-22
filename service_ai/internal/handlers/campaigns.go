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

type CampaignsHandler struct {
	db *gorm.DB
}

func NewCampaignsHandler(db *gorm.DB) *CampaignsHandler {
	return &CampaignsHandler{db: db}
}

type CreateCampaignRequest struct {
	Name           string   `json:"name"`
	TargetAudience string   `json:"target_audience"`
	Channels       []string `json:"channels"`
	InitialGoal    string   `json:"initial_goal"`
}

func (h *CampaignsHandler) ListCampaigns(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var campaigns []models.GTMCampaign
	if h.db != nil && orgID != "" {
		h.db.Where("organizationId = ?", orgID).Find(&campaigns)
	}

	if len(campaigns) == 0 {
		// Mock initial campaign for quick start
		channelsJSON, _ := json.Marshal([]string{"Email", "WhatsApp", "LinkedIn"})
		now := time.Now()
		campaigns = []models.GTMCampaign{
			{
				ID:             "camp-01",
				OrganizationID: orgID,
				Name:           "Private Schools Operational Leap 2026",
				TargetAudience: "Private School Proprietors & Principals (Nigeria / West Africa)",
				Status:         "ACTIVE",
				ChannelsJSON:   string(channelsJSON),
				ProspectsCount: 1450,
				SentCount:      980,
				RepliesCount:   145,
				MeetingsCount:  28,
				PipelineValue:  84000,
				StartDate:      &now,
				CreatedAt:      now.AddDate(0, 0, -14),
				UpdatedAt:      now,
			},
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(campaigns)
}

func (h *CampaignsHandler) CreateCampaign(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var req CreateCampaignRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	channelsJSON, _ := json.Marshal(req.Channels)
	now := time.Now()

	camp := models.GTMCampaign{
		ID:             uuid.New().String(),
		OrganizationID: orgID,
		Name:           req.Name,
		TargetAudience: req.TargetAudience,
		Status:         "PLANNING",
		ChannelsJSON:   string(channelsJSON),
		ProspectsCount: 500,
		SentCount:      0,
		RepliesCount:   0,
		MeetingsCount:  0,
		PipelineValue:  0,
		StartDate:      &now,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if h.db != nil {
		h.db.Create(&camp)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(camp)
}
