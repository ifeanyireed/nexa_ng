package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

type TenantRolePermission struct {
	ID             string    `gorm:"primaryKey;size:191" json:"id"`
	TenantID       string    `gorm:"column:tenantId;size:191;not null;uniqueIndex:tenant_role_module_uniq" json:"tenant_id"`
	Role           string    `gorm:"size:50;not null;uniqueIndex:tenant_role_module_uniq" json:"role"`
	ModuleKey      string    `gorm:"column:moduleKey;size:50;not null;uniqueIndex:tenant_role_module_uniq" json:"module_key"`
	IsEnabled      bool      `gorm:"column:isEnabled;not null;default:true" json:"is_enabled"`
	AllowedActions string    `gorm:"column:allowedActions;type:json" json:"allowed_actions,omitempty"`
	CreatedAt      time.Time `gorm:"column:createdAt" json:"created_at"`
	UpdatedAt      time.Time `gorm:"column:updatedAt" json:"updated_at"`
}

func (TenantRolePermission) TableName() string {
	return "TenantRolePermission"
}

type SaveRBACPayload struct {
	Matrix   map[string]map[string]bool `json:"matrix"`
	TenantID string                     `json:"tenant_id"`
}

func HandleRBAC(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	tenantID := r.URL.Query().Get("tenantId")
	if tenantID == "" {
		tenantID = r.URL.Query().Get("tenant_id")
	}
	if tenantID == "" {
		tenantID = r.URL.Query().Get("orgId")
	}
	if tenantID == "" {
		tenantID = "default"
	}

	if r.Method == http.MethodGet {
		matrix := make(map[string]map[string]bool)

		if DB != nil {
			var perms []TenantRolePermission
			if err := DB.Where("tenantId = ?", tenantID).Find(&perms).Error; err == nil && len(perms) > 0 {
				for _, p := range perms {
					if matrix[p.Role] == nil {
						matrix[p.Role] = make(map[string]bool)
					}
					matrix[p.Role][p.ModuleKey] = p.IsEnabled
				}
			}
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"tenant_id": tenantID,
			"matrix":    matrix,
		})
		return
	}

	if r.Method == http.MethodPost || r.Method == http.MethodPut {
		var payload SaveRBACPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
			return
		}

		if payload.TenantID != "" {
			tenantID = payload.TenantID
		}

		if DB != nil && payload.Matrix != nil {
			_ = DB.AutoMigrate(&TenantRolePermission{})

			for role, modules := range payload.Matrix {
				for modKey, isEnabled := range modules {
					var existing TenantRolePermission
					err := DB.Where("tenantId = ? AND role = ? AND moduleKey = ?", tenantID, role, modKey).First(&existing).Error
					if err != nil {
						newPerm := TenantRolePermission{
							ID:        generateUUID(),
							TenantID:  tenantID,
							Role:      role,
							ModuleKey: modKey,
							IsEnabled: isEnabled,
							CreatedAt: time.Now(),
							UpdatedAt: time.Now(),
						}
						DB.Create(&newPerm)
					} else {
						DB.Model(&existing).Updates(map[string]interface{}{
							"isEnabled": isEnabled,
							"updatedAt": time.Now(),
						})
					}
				}
			}
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":   true,
			"message":   "Tenant RBAC matrix successfully persisted to MySQL database",
			"tenant_id": tenantID,
			"matrix":    payload.Matrix,
		})
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}
