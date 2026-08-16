package handlers

import (
	"encoding/json"
	"net/http"
	"time"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"nexa/ai_gtm_service/internal/models"
)

type ApprovalsHandler struct {
	db *gorm.DB
}

func NewApprovalsHandler(db *gorm.DB) *ApprovalsHandler {
	return &ApprovalsHandler{db: db}
}

func (h *ApprovalsHandler) ListApprovals(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var approvals []models.GTMApproval
	if h.db != nil && orgID != "" {
		h.db.Where("organizationId = ?", orgID).Find(&approvals)
	}

	if len(approvals) == 0 {
		previewJSON, _ := json.Marshal(map[string]string{
			"subject": "{{first_name}}, quick question on {{company_name}}'s term fee reconciliation",
			"body":    "Hi {{first_name}},\n\nNoticed that {{company_name}} is wrapping up end-of-term admissions...\n\nBest,\nSterling Vance",
		})
		approvals = []models.GTMApproval{
			{
				ID:              "appr-01",
				OrganizationID:  orgID,
				Title:           "Launch Batch 2: Principal Direct Outreach (450 Schools)",
				Type:            "EMAIL_CAMPAIGN",
				CreatorAgentKey: "copywriter",
				RiskLevel:       "MEDIUM",
				TargetChannel:   "Email Outreach",
				PreviewDataJSON: string(previewJSON),
				Status:          "PENDING",
				CreatedAt:       time.Now(),
			},
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(approvals)
}

func (h *ApprovalsHandler) AuthorizeApproval(w http.ResponseWriter, r *http.Request) {
	approvalID := chi.URLParam(r, "id")
	now := time.Now()

	if h.db != nil {
		h.db.Model(&models.GTMApproval{}).Where("id = ?", approvalID).Updates(map[string]interface{}{
			"status":       "APPROVED",
			"authorizedAt": now,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":      "APPROVED",
		"id":          approvalID,
		"authorized_at": now,
	})
}

func (h *ApprovalsHandler) RejectApproval(w http.ResponseWriter, r *http.Request) {
	approvalID := chi.URLParam(r, "id")
	if h.db != nil {
		h.db.Model(&models.GTMApproval{}).Where("id = ?", approvalID).Update("status", "REJECTED")
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "REJECTED",
		"id":     approvalID,
	})
}
