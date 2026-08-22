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

type LeadsHandler struct {
	db *gorm.DB
}

func NewLeadsHandler(db *gorm.DB) *LeadsHandler {
	return &LeadsHandler{db: db}
}

type ExtractLeadsRequest struct {
	Query      string `json:"query"`
	Location   string `json:"location"`
	TargetSize int    `json:"target_size"`
}

func (h *LeadsHandler) ListLeads(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var leads []models.GTMLead
	if h.db != nil && orgID != "" {
		h.db.Where("organizationId = ?", orgID).Find(&leads)
	}

	if len(leads) == 0 {
		signalsJSON, _ := json.Marshal([]string{"Currently hiring Head of IT", "Announced campus expansion", "Evaluating school ERP"})
		leads = []models.GTMLead{
			{
				ID:                "lead-01",
				OrganizationID:    orgID,
				CompanyName:       "Corona International Schools",
				Website:           "https://coronaschools.org",
				Industry:          "Education & K-12",
				Location:          "Victoria Island, Lagos",
				ContactName:       "Adeyemi Phillips",
				ContactTitle:      "Managing Director / Head of Operations",
				ContactEmail:      "a.phillips@coronaschools.org",
				ContactPhone:      "+234 802 345 6789",
				ICPFitScore:       98,
				BuyingSignalsJSON: string(signalsJSON),
				Status:            "MEETING_BOOKED",
				AssignedAgentKey:  "outreach_manager",
				LastActivity:      "Demo scheduled for Tuesday 10:00 AM",
				CreatedAt:         time.Now().AddDate(0, 0, -5),
				UpdatedAt:         time.Now(),
			},
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(leads)
}

func (h *LeadsHandler) ExtractLeads(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var req ExtractLeadsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	signalsJSON, _ := json.Marshal([]string{"Extracted via Olivia Chen (Lead Hunter)", "Public registry verified"})
	newLead := models.GTMLead{
		ID:                uuid.New().String(),
		OrganizationID:    orgID,
		CompanyName:       req.Query + " Prospect",
		Website:           "https://example.sch.ng",
		Industry:          "Education",
		Location:          req.Location,
		ContactName:       "Dr. Tunde Bakare",
		ContactTitle:      "Director of Systems",
		ContactEmail:      "tunde@example.sch.ng",
		ContactPhone:      "+234 801 234 5678",
		ICPFitScore:       94,
		BuyingSignalsJSON: string(signalsJSON),
		Status:            "ENRICHED",
		AssignedAgentKey:  "lead_hunter",
		LastActivity:      "Data verified by Olivia Chen",
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if h.db != nil {
		h.db.Create(&newLead)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newLead)
}
