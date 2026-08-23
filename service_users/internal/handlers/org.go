package handlers

import (
	"encoding/json"
	"net/http"
	"time"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"nexa/user_subscription_service/internal/middleware"
	"nexa/user_subscription_service/internal/models"
)

type OrgHandler struct {
	db *gorm.DB
}

func NewOrgHandler(db *gorm.DB) *OrgHandler {
	return &OrgHandler{db: db}
}

type CreateOrgRequest struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type InviteMemberRequest struct {
	Email string      `json:"email"`
	Role  models.Role `json:"role"`
}

func (h *OrgHandler) ListUserOrgs(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.JWTClaims)
	if !ok {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var orgs []models.Organization
	if h.db != nil {
		h.db.Joins("JOIN WorkspaceMember ON WorkspaceMember.organizationId = Organization.id").
			Where("WorkspaceMember.userId = ? OR Organization.ownerId = ?", claims.UserID, claims.UserID).
			Preload("Subscription").
			Find(&orgs)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orgs)
}

func (h *OrgHandler) CreateOrg(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.JWTClaims)
	if !ok {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req CreateOrgRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	slug := req.Slug
	if slug == "" {
		slug = uuid.New().String()[:8]
	}

	org := models.Organization{
		ID:           uuid.New().String(),
		Name:         req.Name,
		Slug:         slug,
		OwnerID:      claims.UserID,
		PlanTier:     models.PlanFreeTrial,
		BillingCycle: "MONTHLY",
		Status:       "ACTIVE",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if h.db != nil {
		if err := h.db.Create(&org).Error; err != nil {
			http.Error(w, `{"error": "Failed to create organization: slug might already exist"}`, http.StatusConflict)
			return
		}

		member := models.WorkspaceMember{
			ID:             uuid.New().String(),
			OrganizationID: org.ID,
			UserID:         claims.UserID,
			Role:           models.RoleTenantOwner,
			CreatedAt:      time.Now(),
		}
		h.db.Create(&member)

		sub := models.Subscription{
			ID:                 uuid.New().String(),
			OrganizationID:     org.ID,
			PlanTier:           models.PlanFreeTrial,
			Status:             "ACTIVE",
			CurrentPeriodStart: time.Now(),
			CurrentPeriodEnd:   time.Now().AddDate(0, 0, 14),
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		}
		h.db.Create(&sub)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(org)
}

func (h *OrgHandler) GetOrgDetails(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var org models.Organization
	if h.db != nil {
		if err := h.db.Preload("Members.User").Preload("Subscription").Preload("Owner").First(&org, "id = ?", orgID).Error; err != nil {
			http.Error(w, `{"error": "Organization not found"}`, http.StatusNotFound)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(org)
}

type SaveRBACRequest struct {
	Matrix map[string]map[string]bool `json:"matrix"`
}

func (h *OrgHandler) GetTenantRBAC(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		orgID = "default"
	}

	matrix := make(map[string]map[string]bool)

	if h.db != nil {
		var perms []models.TenantRolePermission
		if err := h.db.Where("tenantId = ?", orgID).Find(&perms).Error; err == nil && len(perms) > 0 {
			for _, p := range perms {
				if matrix[p.Role] == nil {
					matrix[p.Role] = make(map[string]bool)
				}
				matrix[p.Role][p.ModuleKey] = p.IsEnabled
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"tenant_id": orgID,
		"matrix":    matrix,
	})
}

func (h *OrgHandler) SaveTenantRBAC(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		orgID = "default"
	}

	var req SaveRBACRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
		return
	}

	if h.db != nil && req.Matrix != nil {
		for role, modules := range req.Matrix {
			for modKey, isEnabled := range modules {
				var existing models.TenantRolePermission
				err := h.db.Where("tenantId = ? AND role = ? AND moduleKey = ?", orgID, role, modKey).First(&existing).Error
				if err != nil {
					newPerm := models.TenantRolePermission{
						ID:        uuid.New().String(),
						TenantID:  orgID,
						Role:      role,
						ModuleKey: modKey,
						IsEnabled: isEnabled,
						CreatedAt: time.Now(),
						UpdatedAt: time.Now(),
					}
					h.db.Create(&newPerm)
				} else {
					h.db.Model(&existing).Updates(map[string]interface{}{
						"isEnabled": isEnabled,
						"updatedAt": time.Now(),
					})
				}
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"message":   "Tenant RBAC matrix successfully persisted to MySQL database",
		"tenant_id": orgID,
		"matrix":    req.Matrix,
	})
}

